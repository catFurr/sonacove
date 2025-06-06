<script setup>
import ErrorIcon from "./ErrorIcon.vue";
import SuccessIcon from "./SuccessIcon.vue";

import { ref, computed, onMounted } from "vue";
import { initializePaddle } from "@paddle/paddle-js";
import { validateKeycloakToken, parseUserFromToken } from "../utils/auth";

// Storage key constants
const STORAGE_KEYS = {
  AUTH_TOKEN: "sonacove_auth_token",
  USER_INFO: "sonacove_user_info",
  SUBSCRIPTION_STATUS: "sonacove_subscription_status",
};

// State
const currentView = ref("initial");
const userInfo = ref(null);
const accessToken = ref(null);
const paddle = ref(null);
const discountCode = ref("");
const userFriendlyError = ref("We encountered an unexpected issue.");
const detailedErrorMessage = ref(null);
const showDetailedError = ref(false);

const env = import.meta.env;

// Initialize Paddle checkout
async function initializePaddleInstance() {
  try {
    const environment = env.PUBLIC_PADDLE_ENVIRONMENT || "sandbox";
    const clientToken = env.PUBLIC_PADDLE_CLIENT_TOKEN;

    if (!clientToken) {
      throw new Error("Paddle client token is not configured");
    }

    const paddleInstance = await initializePaddle({
      environment,
      token: clientToken,
      eventCallback: (data) => {
        switch (data.name) {
          case "checkout.completed":
            console.log("Checkout completed:", data);
            // Set status to active and show success view
            showSuccessContent(false); // false for 'skipped' means 'active'
            break;
          case "checkout.error":
            console.error("Checkout error:", data);
            handleError(
              "There was a problem with the payment process. Please try again or contact support if the issue persists.",
              data.error || "Paddle checkout error"
            );
            break;
          case "checkout.closed":
            console.log("Checkout closed:", data);
            // User closed checkout, no specific action needed here unless UX requires it
            break;
          case "checkout.loaded":
            console.log("Checkout loaded:", data);
            break;
          case "checkout.location.changed":
            console.log("Checkout location changed:", data);
            break;
        }
      },
    });

    return paddleInstance;
  } catch (error) {
    console.error("Error initializing Paddle:", error);
    // This error will be caught by setupPaddleCheckout and then by init if it propagates
    throw error;
  }
}

// Set up Paddle checkout
async function setupPaddleCheckout() {
  try {
    if (!paddle.value) {
      paddle.value = await initializePaddleInstance();
    }

    if (!paddle.value) {
      // This case should ideally be caught by initializePaddleInstance throwing an error
      throw new Error("Failed to initialize Paddle instance");
    }
  } catch (error) {
    console.error("Error setting up Paddle checkout:", error);
    // This error will be propagated to init() or openPaddleCheckout() and handled there
    throw error;
  }
}

// New function to open the checkout
async function openPaddleCheckout() {
  if (!paddle.value) {
    try {
      await setupPaddleCheckout(); // Ensure Paddle is initialized
    } catch (error) {
      handleError(
        "The subscription service is currently unavailable. Please try again in a few moments.",
        error
      );
      return;
    }
    if (!paddle.value) {
      // Should not happen if setupPaddleCheckout throws as expected
      handleError(
        "The subscription service could not be started. Please try again later.",
        "PaddleInitFailAfterAttempt"
      );
      return;
    }
  }

  try {
    const checkoutConfig = {
      items: [
        {
          priceId: env.PUBLIC_PADDLE_PRICE_ID,
          quantity: 1,
        },
      ],
      ...(discountCode.value ? { discountCode: discountCode.value } : {}),
      settings: {
        displayMode: "overlay",
        // frameTarget: "paddle-checkout-container", // For overlay, this might not be strictly needed but good to have if Paddle uses it
        // frameStyle:
        //   "width: 100%; min-height: 400px; background-color: transparent; border: none;",
      },
      ...(userInfo.value?.email
        ? { customer: { email: userInfo.value.email } }
        : {}),
    };

    await paddle.value.Checkout.open(checkoutConfig);
  } catch (error) {
    console.error("Error opening Paddle checkout:", error);
    handleError(
      "Could not open the subscription window. Please check your internet connection or try again shortly.",
      error
    );
  }
}

// Show success content
function showSuccessContent(skipped = false) {
  currentView.value = "success";
  if (userInfo.value) {
    // Ensure local storage is available
    try {
      localStorage.setItem(
        STORAGE_KEYS.SUBSCRIPTION_STATUS,
        skipped ? "trialing" : "active"
      );
    } catch (e) {
      console.error("Failed to write to localStorage:", e);
      handleError(
        "Your session was processed, but we couldn't save your subscription status locally. Please contact support if you see this message again.",
        e
      );
    }
  }
}

// Update registration URL with proper redirect URI
function updateRegistrationUrl() {
  const redirectUri = new URL("/onboarding", window.location.origin);
  // Preserve discount code in redirect
  if (discountCode.value) {
    redirectUri.searchParams.set("discount", discountCode.value);
  }

  const keycloakBaseUrl =
    "https://" +
    env.PUBLIC_KC_HOSTNAME +
    "/realms/jitsi/protocol/openid-connect";
  const clientId = "jitsi-web";
  const responseType = "token";

  const registrationUrl = `${keycloakBaseUrl}/registrations?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri.toString()
  )}&response_type=${responseType}`;

  const userEmail = userInfo.value?.email;
  return userEmail
    ? `${registrationUrl}&login_hint=${encodeURIComponent(userEmail)}`
    : registrationUrl;
}

// Main initialization
async function init() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const discountFromQuery = urlParams.get("discount");

    if (discountFromQuery) {
      discountCode.value = discountFromQuery;
    }

    if (window.location.hash) {
      const fragmentParams = new URLSearchParams(
        window.location.hash.substring(1)
      );
      const tokenFromHash = fragmentParams.get("access_token");
      if (tokenFromHash) {
        accessToken.value = tokenFromHash;
        window.location.hash = ""; // Clear the hash
      }
    }

    if (accessToken.value) {
      // Token from Keycloak redirect
      const isAuthenticated = await validateKeycloakToken(
        accessToken.value,
        env.PUBLIC_KC_HOSTNAME
      );
      if (isAuthenticated) {
        userInfo.value = parseUserFromToken(accessToken.value);
        if (userInfo.value) {
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken.value);
          localStorage.setItem(
            STORAGE_KEYS.USER_INFO,
            JSON.stringify(userInfo.value)
          );

          const tokenSubStatus =
            userInfo.value?.context?.user?.subscription_status;

          if (tokenSubStatus === "active") {
            localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_STATUS, "active");
          } else if (tokenSubStatus === "trialing") {
            localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_STATUS, "trialing");
            // Potentially handle other statuses from token if they exist in your system
          } else {
            // Token doesn't specify a recognized status or has no status info.
            // Check localStorage: if not already 'active', default to 'trialing'.
            // This covers new users or users whose tokens don't have sub info.
            const existingLocalStatus = localStorage.getItem(
              STORAGE_KEYS.SUBSCRIPTION_STATUS
            );
            if (existingLocalStatus !== "active") {
              localStorage.setItem(
                STORAGE_KEYS.SUBSCRIPTION_STATUS,
                "trialing"
              );
            }
          }
        }
        currentView.value = "success";
        await setupPaddleCheckout();
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_INFO);
        localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION_STATUS);
        handleError(
          "Your session appears to be invalid or has expired. Please try creating an account or logging in again.",
          "TokenValidationFalse"
        );
      }
    } else {
      // No token from Keycloak redirect, check local storage
      const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const storedUserInfoString = localStorage.getItem(STORAGE_KEYS.USER_INFO);

      if (storedToken && storedUserInfoString) {
        const isValid = await validateKeycloakToken(
          storedToken,
          env.PUBLIC_KC_HOSTNAME
        );
        if (isValid) {
          accessToken.value = storedToken;
          userInfo.value = JSON.parse(storedUserInfoString);
          if (discountFromQuery) {
            discountCode.value = discountFromQuery;
          }

          const storedSubStatus = localStorage.getItem(
            STORAGE_KEYS.SUBSCRIPTION_STATUS
          );
          if (storedSubStatus === "active") {
            currentView.value = "success";
          } else {
            if (storedSubStatus !== "trialing") {
              localStorage.setItem(
                STORAGE_KEYS.SUBSCRIPTION_STATUS,
                "trialing"
              );
            }
            currentView.value = "success";
          }
          await setupPaddleCheckout();
        } else {
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_INFO);
          localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION_STATUS);
          currentView.value = "initial"; // Go to initial if stored token is invalid
        }
      } else {
        currentView.value = "initial";
        if (discountFromQuery) {
          discountCode.value = discountFromQuery;
        }
      }
    }
  } catch (error) {
    console.error("Error during initialization:", error);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION_STATUS);
    handleError(
      "We encountered a problem while setting up your session. Please try refreshing the page or creating an account again.",
      error
    );
  }
}

// Event handlers
function handleReopenPayment() {
  openPaddleCheckout();
}

// Updated error handling function
function handleError(userMessage, errorObj = null) {
  console.error("User-facing error triggered:", userMessage, errorObj || "");
  userFriendlyError.value =
    userMessage ||
    "An unexpected error occurred. Please try again or contact support if the issue persists.";

  if (errorObj) {
    if (errorObj instanceof Error) {
      detailedErrorMessage.value = `${errorObj.name}: ${errorObj.message}`;
    } else if (typeof errorObj === "string") {
      detailedErrorMessage.value = errorObj;
    } else if (errorObj.message) {
      // For Paddle error objects etc.
      detailedErrorMessage.value = errorObj.message;
    } else {
      detailedErrorMessage.value =
        "Additional error information has been logged to the console.";
    }
  } else {
    detailedErrorMessage.value = null;
  }
  showDetailedError.value = false; // Reset visibility of details
  currentView.value = "error";
}

const isTrialing = computed(() => {
  // Check localStorage availability
  try {
    return (
      localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_STATUS) === "trialing"
    );
  } catch (e) {
    console.error("Failed to read from localStorage:", e);
    // If localStorage is not accessible, default to a state that doesn't assume trial or active
    // This might mean showing an error or a degraded experience.
    // For now, let's assume not trialing to avoid showing trial-specific UI if we can't verify.
    // This case should ideally be handled more gracefully, perhaps by handleError.
    return false;
  }
});

onMounted(() => {
  // Check for localStorage availability early
  try {
    localStorage.setItem("sonacove_storage_test", "test");
    localStorage.removeItem("sonacove_storage_test");
  } catch (e) {
    console.error("localStorage is not available or write-protected:", e);
    handleError(
      "Your browser's local storage seems to be disabled or full. This is required for the application to function correctly. Please enable it or clear some space and try again.",
      e
    );
    return; // Stop further execution if localStorage isn't working
  }
  init();
});
</script>

<template>
  <div class="container mx-auto px-4 py-12">
    <div
      class="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-8"
    >
      <h1 class="text-2xl font-bold text-center mb-6">
        Welcome to Sonacove Meets
      </h1>

      <!-- Support info - shown on all views except when Paddle is active (handled by overlay) -->
      <div class="text-center mb-6">
        <p class="text-sm text-gray-500">
          Need help? Contact us at
          <a
            href="mailto:support@sonacove.com"
            class="text-primary-600 hover:text-primary-700 underline"
          >
            support@sonacove.com
          </a>
        </p>
      </div>

      <!-- Initial content -->
      <div v-if="currentView === 'initial'" id="initial-content">
        <p class="text-gray-600 mb-6 text-center">
          To get started, please create an account.
        </p>
        <div class="flex flex-col gap-3 justify-center">
          <a
            :href="updateRegistrationUrl()"
            class="px-6 py-3 text-center bg-gradient-to-r from-primary-600 to-accent-600 text-white font-medium rounded-lg hover:opacity-90 transition-all transform hover:scale-[1.02]"
          >
            Create a new account
          </a>
        </div>
      </div>

      <!-- Payment content (Removed as direct view, Paddle opens as overlay) -->
      <!-- This div is targeted by Paddle if frameTarget is set, so keep it if needed by Paddle even for overlay.
           Alternatively, ensure Paddle's overlay doesn't need it, or place it within the success view if actions there trigger Paddle.
           For now, let's ensure it's available but hidden, as Paddle might inject into it.
      -->
      <div class="paddle-checkout-container" style="display: none"></div>

      <!-- Success content -->
      <div
        v-if="currentView === 'success'"
        id="success-content"
        class="text-center"
      >
        <SuccessIcon />
        <h2 class="text-xl font-semibold mt-4">
          Welcome aboard{{
            userInfo?.name ? `, ${userInfo.name.split(" ")[0]}` : ""
          }}!
        </h2>

        <div v-if="isTrialing" class="mt-4">
          <p class="text-gray-600">
            You're now on an unlimited free trial of Sonacove Meets.
          </p>
          <p class="text-gray-600 mt-1">
            Explore all features with 1000 active meeting minutes, then
            subscribe for unlimited access.
          </p>

          <div class="bg-gray-50 rounded-lg p-4 my-6 text-left">
            <p class="font-medium text-gray-800">Account Details:</p>
            <p class="text-gray-600">Email: {{ userInfo?.email }}</p>
            <p class="text-gray-600">Name: {{ userInfo?.name }}</p>
            <p class="text-gray-600">
              Status: Free Trial (1000 minutes included)
            </p>
          </div>

          <div class="space-y-3">
            <button
              @click="handleReopenPayment"
              class="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-medium rounded-lg hover:opacity-90 transition-all transform hover:scale-[1.02]"
            >
              Subscribe Now for Full Access
            </button>
            <a
              :href="`/meet/#access_token=${accessToken}`"
              class="block w-full px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
            >
              Continue with Trial
            </a>
          </div>
        </div>

        <div v-else class="mt-4">
          <!-- User is subscribed / active -->
          <p class="text-gray-600">
            Thank you for subscribing to Sonacove Meets. Your account is fully
            activated.
          </p>

          <div class="bg-gray-50 rounded-lg p-4 my-6 text-left">
            <p class="font-medium text-gray-800">Account Details:</p>
            <p class="text-gray-600">Email: {{ userInfo?.email }}</p>
            <p class="text-gray-600">Name: {{ userInfo?.name }}</p>
            <p class="text-gray-600">Status: Active</p>
          </div>

          <a
            :href="`/meet/#access_token=${accessToken}`"
            class="inline-block px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-medium rounded-lg hover:opacity-90 transition-all transform hover:scale-[1.02]"
          >
            Go to Sonacove Meets
          </a>
        </div>
      </div>

      <!-- Error content -->
      <div
        v-if="currentView === 'error'"
        id="error-content"
        class="text-center"
      >
        <ErrorIcon />
        <h2 class="text-xl font-semibold mt-4">Something went wrong</h2>
        <p class="text-gray-600 mt-2 mb-4">
          {{ userFriendlyError }}
        </p>

        <div
          v-if="detailedErrorMessage"
          class="mb-4 text-sm text-left bg-red-50 p-3 rounded"
        >
          <button
            @click="showDetailedError = !showDetailedError"
            class="text-primary-600 hover:underline mb-2"
          >
            {{ showDetailedError ? "Hide Details" : "Show Technical Details" }}
          </button>
          <div v-if="showDetailedError" class="text-gray-500 break-all">
            <p>For support, please provide the following details:</p>
            <pre class="whitespace-pre-wrap">{{ detailedErrorMessage }}</pre>
          </div>
        </div>

        <div class="mt-6 space-y-4">
          <a
            :href="updateRegistrationUrl()"
            class="block px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-medium rounded-lg hover:opacity-90 transition-all transform hover:scale-[1.02]"
          >
            Try Creating Account / Login Again
          </a>

          <a
            href="mailto:support@sonacove.com"
            class="block px-6 py-3 text-primary-600 font-medium hover:text-primary-700"
          >
            Contact Support (support@sonacove.com)
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
