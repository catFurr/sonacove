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
const checkoutLoaded = ref(false);

// Initialize Paddle checkout
async function initializePaddleInstance() {
  try {
    const environment = import.meta.env.PUBLIC_PADDLE_ENVIRONMENT || "sandbox";
    const clientToken = import.meta.env.PUBLIC_PADDLE_CLIENT_TOKEN;

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
            showSuccessContent(false);
            break;
          case "checkout.error":
            console.error("Checkout error:", data);
            currentView.value = "error";
            break;
          case "checkout.closed":
            console.log("Checkout closed:", data);
            // Show the reopen payment button
            break;
          case "checkout.loaded":
            console.log("Checkout loaded:", data);
            checkoutLoaded.value = true;
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
      throw new Error("Failed to initialize Paddle");
    }

    const checkoutConfig = {
      items: [
        {
          priceId: import.meta.env.PUBLIC_PADDLE_PRICE_ID,
          quantity: 1,
        },
      ],
      ...(discountCode.value ? { discountCode: discountCode.value } : {}),
      settings: {
        displayMode: "overlay",
        frameTarget: "paddle-checkout-container",
        frameStyle:
          "width: 100%; min-height: 400px; background-color: transparent; border: none;",
      },
      ...(userInfo.value?.email
        ? { customer: { email: userInfo.value.email } }
        : {}),
    };

    await paddle.value.Checkout.open(checkoutConfig);
  } catch (error) {
    console.error("Error setting up Paddle checkout:", error);
    currentView.value = "error";
  }
}

// Show success content
function showSuccessContent(skipped = false) {
  currentView.value = "success";
  if (userInfo.value) {
    localStorage.setItem(
      STORAGE_KEYS.SUBSCRIPTION_STATUS,
      skipped ? "trialing" : "active"
    );
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
    "https://auth.sonacove.com/realms/jitsi/protocol/openid-connect";
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
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromQuery = urlParams.get("token");
  const discountFromQuery = urlParams.get("discount");

  // Set discount code if present
  if (discountFromQuery) {
    discountCode.value = discountFromQuery;
  }

  if (window.location.hash) {
    const fragmentParams = new URLSearchParams(
      window.location.hash.substring(1)
    );
    accessToken.value = fragmentParams.get("access_token");
  }

  if (accessToken.value) {
    try {
      const isAuthenticated = await validateKeycloakToken(accessToken.value);
      if (isAuthenticated) {
        userInfo.value = parseUserFromToken(accessToken.value);
        console.table(userInfo.value);
        if (userInfo.value) {
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken.value);
          localStorage.setItem(
            STORAGE_KEYS.USER_INFO,
            JSON.stringify(userInfo.value)
          );
        }
        currentView.value = "payment";
        await setupPaddleCheckout();
      } else {
        currentView.value = "error";
      }
    } catch (error) {
      console.error("Error validating token:", error);
      currentView.value = "error";
    }
  } else {
    const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const storedUserInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO);

    if (storedToken && storedUserInfo) {
      try {
        const isValid = await validateKeycloakToken(storedToken);
        if (isValid) {
          // NOTE! Instead of redirecting, we should open payments
          // like we do above. This is rarely encountered, so it's ok for now.
          window.location.href = "https://meet.sonacove.com";
          return;
        }
      } catch (error) {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_INFO);
      }
    }
    currentView.value = "initial";
  }
}

// Event handlers
async function handleSkipPayment() {
  if (!accessToken.value) {
    handleError("Missing access token");
    return;
  }
  try {
    // Call the backend to enable trial status
    const res = await fetch("/api/user-trial", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken.value}`,
      },
    });
    if (!res.ok) throw new Error("Failed to enable trial");
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_STATUS, "trialing");
    showSuccessContent(true);
  } catch (err) {
    handleError(err);
  }
}

function handleReopenPayment() {
  setupPaddleCheckout();
}

// Add this new function to handle error states
function handleError(error) {
  console.error("Error occurred:", error);
  currentView.value = "error";
}

const isTrialing = computed(() => {
  return localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_STATUS) === "trialing";
});

onMounted(() => {
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

      <!-- Support info - shown on all views -->
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

      <!-- Payment content -->
      <div v-if="currentView === 'payment'" id="payment-content">
        <p class="text-gray-600 mb-6 text-center">
          Complete your subscription to get started.
        </p>

        <!-- Paddle checkout container -->
        <div class="paddle-checkout-container mt-6">
          <div v-if="!checkoutLoaded" class="animate-pulse">
            <div class="h-10 bg-gray-200 rounded w-full mb-4"></div>
            <div class="h-10 bg-gray-200 rounded w-full mb-4"></div>
            <div class="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>

        <!-- Reopen payment button -->
        <div class="mt-6 text-center">
          <button
            @click="handleReopenPayment"
            class="px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-medium rounded-lg hover:opacity-90 transition-all transform hover:scale-[1.02]"
          >
            Open payment form
          </button>
        </div>

        <!-- Skip payment option -->
        <div class="mt-6 text-center">
          <button
            @click="handleSkipPayment"
            class="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Skip payment for now
          </button>
          <p class="text-xs text-gray-400 mt-1">
            You can complete your subscription later, but some features will be
            limited.
          </p>
        </div>
      </div>

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
        <p class="text-gray-600 mt-2">
          {{
            isTrialing
              ? "You're ready to start using Sonacove Meets in trial mode. You can complete your subscription anytime to unlock all features."
              : "Thank you for subscribing to Sonacove Meets. Your account is now fully activated with all premium features."
          }}
        </p>

        <div class="bg-gray-50 rounded-lg p-4 mb-6 text-left mt-6">
          <p class="font-medium text-gray-800">Account Details:</p>
          <p class="text-gray-600">Email: {{ userInfo?.email }}</p>
          <p class="text-gray-600">Name: {{ userInfo?.name }}</p>
          <p class="text-gray-600">
            Status:
            {{ isTrialing ? "Trial (Payment Pending)" : "Active" }}
          </p>
        </div>

        <a
          :href="`https://meet.sonacove.com#access_token=${accessToken}`"
          class="inline-block px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-medium rounded-lg hover:opacity-90 transition-all transform hover:scale-[1.02]"
        >
          Go to Sonacove Meets
        </a>
      </div>

      <!-- Error content -->
      <div
        v-if="currentView === 'error'"
        id="error-content"
        class="text-center"
      >
        <ErrorIcon />
        <h2 class="text-xl font-semibold mt-4">Something went wrong</h2>
        <p class="text-gray-600 mt-2">
          We encountered an issue while processing your request. If the problem
          persists, please do not hesitate to reach out to us.
        </p>

        <div class="mt-6 space-y-4">
          <a
            :href="updateRegistrationUrl()"
            class="block px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-medium rounded-lg hover:opacity-90 transition-all transform hover:scale-[1.02]"
          >
            Try again
          </a>

          <a
            href="mailto:support@sonacove.com"
            class="block px-6 py-3 text-primary-600 font-medium hover:text-primary-700"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
