import { KVNamespace, PagesFunction } from "@cloudflare/workers-types";
import { KeycloakClient } from "../components/keycloak.js";

export interface Env {
  PADDLE_WEBHOOK_SECRET: string;
  KEYCLOAK_CLIENT_ID: string;
  KEYCLOAK_CLIENT_SECRET: string;
  KV: KVNamespace;
  PUBLIC_PADDLE_ENVIRONMENT?: string;
  PADDLE_API_KEY: string;
}

interface PaddleWebhookEvent {
  event_id: string;
  event_type: string;
  occurred_at: string;
  notification_id: string;
  data: {
    id: string;
    status?: string;
    customer_id?: string;
    collection_mode?: string;
    scheduled_change?: any;
    subscription_id?: string;
    items?: Array<{
      price: {
        id: string;
        product_id: string;
      };
      quantity: number;
      status?: string;
    }>;
    // Other fields we don't need to extract
  };
}

interface PaddleCustomer {
  id: string;
  status: string;
  name: string | null;
  email: string;
  marketing_consent: boolean;
  locale: string;
  created_at: string;
  updated_at: string;
  custom_data: any | null;
  import_meta: any | null;
}

interface PaddleCustomerResponse {
  data: PaddleCustomer;
  meta: {
    request_id: string;
  };
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Only handle POST requests
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Get the raw body as text for verification
    const rawBody = await request.text();

    // Get the Paddle-Signature header
    const signatureHeader = request.headers.get("Paddle-Signature");

    if (!signatureHeader) {
      console.error("Missing Paddle-Signature header");
      return new Response("Missing signature header", { status: 401 });
    }

    // Respond with 200 immediately to acknowledge receipt
    // This follows Paddle's best practice to respond within 5 seconds
    // We'll process the webhook asynchronously
    const responsePromise = new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    // Process the webhook asynchronously
    context.waitUntil(processWebhook(rawBody, signatureHeader, env));

    return responsePromise;
  } catch (error) {
    console.error("Error handling Paddle webhook:", error);
    return new Response("Internal server error", { status: 500 });
  }
};

/**
 * Process the webhook asynchronously
 */
async function processWebhook(
  rawBody: string,
  signatureHeader: string,
  env: Env
): Promise<void> {
  try {
    // Verify the webhook signature
    const isVerified = await verifyPaddleWebhook(
      signatureHeader,
      rawBody,
      env.PADDLE_WEBHOOK_SECRET
    );

    if (!isVerified) {
      console.error("Invalid Paddle webhook signature");
      return;
    }

    // Parse the body as JSON
    const event = JSON.parse(rawBody) as PaddleWebhookEvent;

    // Check if this is one of the events we want to handle
    const validEventTypes = [
      "transaction.created",
      "subscription.created",
      "transaction.updated",
      "subscription.updated",
    ];

    if (!validEventTypes.includes(event.event_type)) {
      console.log(`Ignoring event type: ${event.event_type}`);
      return;
    }

    // Extract the relevant information
    const extractedData = extractPaddleData(event);

    // Log the extracted data for debugging
    console.log("Extracted Paddle data:", JSON.stringify(extractedData));

    // Process the subscription data and update Keycloak
    if (extractedData.subscription) {
      await processSubscriptionUpdate(extractedData, env);
    }
    // For now, we're only handling subscription events
    // We could add transaction handling later if needed

    console.log(`Successfully processed ${event.event_type} event`);
  } catch (error) {
    console.error("Error processing Paddle webhook:", error);
  }
}

/**
 * Verify the Paddle webhook signature
 */
async function verifyPaddleWebhook(
  signatureHeader: string,
  rawBody: string,
  secretKey: string
): Promise<boolean> {
  try {
    // 1. Parse the signature header
    // Format: ts=timestamp;h1=signature
    const parts = signatureHeader.split(";");
    const timestamp = parts[0].split("=")[1];
    const signature = parts[1].split("=")[1];

    // Optional: Check if the timestamp is recent (within 5 seconds)
    const currentTime = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTime - parseInt(timestamp)) > 5) {
      console.warn("Webhook timestamp is too old, possible replay attack");
      return false;
    }

    // 2. Build the signed payload
    // The signed payload is the timestamp + ':' + rawBody (not '.' as we had before)
    const signedPayload = `${timestamp}:${rawBody}`;

    // 3. Hash the signed payload with HMAC-SHA256
    const encoder = new TextEncoder();
    const data = encoder.encode(signedPayload);
    const keyData = encoder.encode(secretKey);

    // Import the secret key for HMAC
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );

    // 4. Generate the signature
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, data);

    // Convert to hex string for comparison
    const generatedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // 5. Compare signatures
    return signature === generatedSignature;
  } catch (error) {
    console.error("Error verifying Paddle webhook:", error);
    return false;
  }
}

/**
 * Extract relevant data from the Paddle webhook event
 */
function extractPaddleData(event: PaddleWebhookEvent) {
  const { event_type, occurred_at, data } = event;

  // Extract common fields
  const extractedData: any = {
    event_type,
    occurred_at,
  };

  // Extract subscription or transaction data
  if (data) {
    // For subscription events
    if (event_type.startsWith("subscription.")) {
      extractedData.subscription = {
        id: data.id,
        status: data.status,
        collection_mode: data.collection_mode,
        scheduled_change: data.scheduled_change,
        customer_id: data.customer_id,
        occurred_at: occurred_at,
        items:
          data.items?.map((item) => ({
            price_id: item.price.id,
            product_id: item.price.product_id,
            quantity: item.quantity,
            status: item.status,
          })) || [],
      };
    }

    // For transaction events
    else if (event_type.startsWith("transaction.")) {
      extractedData.transaction = {
        id: data.id,
        status: data.status,
        customer_id: data.customer_id,
        subscription_id: data.subscription_id,
        occurred_at: occurred_at,
        items:
          data.items?.map((item) => ({
            price_id: item.price.id,
            product_id: item.price.product_id,
            quantity: item.quantity,
          })) || [],
      };
    }
  }

  return extractedData;
}

/**
 * Process subscription update and update user data in Keycloak
 */
async function processSubscriptionUpdate(extractedData: any, env: Env) {
  try {
    // Get the subscription ID to identify the user
    const subscriptionData = extractedData.subscription || {};
    const subscriptionId = subscriptionData.id;
    const occurredAt = extractedData.occurred_at;
    const customerId = subscriptionData.customer_id;

    if (!subscriptionId || !occurredAt) {
      throw new Error("Missing subscription ID or timestamp");
    }

    const keycloak = new KeycloakClient(env);
    // Find the user with this subscription ID
    let user = await keycloak.getUser(undefined, subscriptionId);

    // If no user found by subscription ID and we have a customer ID, try to fetch customer details
    if (!user && customerId) {
      console.log(
        `No user found with subscription ID: ${subscriptionId}. Trying to fetch customer details...`
      );
      try {
        const customerDetails = await fetchPaddleCustomer(customerId, env);
        if (customerDetails && customerDetails.email) {
          // Find user by email
          user = await keycloak.getUser(customerDetails.email, subscriptionId);
          console.log(
            `User lookup by email ${customerDetails.email}: ${
              user ? "Found" : "Not found"
            }`
          );
        }
      } catch (error) {
        console.error(`Error fetching customer details: ${error}`);
      }
    }

    if (!user) {
      console.log(
        `No user found for subscription ID: ${subscriptionId} or customer ID: ${customerId}`
      );
      return;
    }

    // Check if this update is newer than what we have stored
    if (
      user.attributes &&
      user.attributes.paddle_last_update &&
      user.attributes.paddle_last_update[0]
    ) {
      const lastUpdate = new Date(user.attributes.paddle_last_update[0]);
      const currentUpdate = new Date(occurredAt);

      if (lastUpdate >= currentUpdate) {
        console.log(`Skipping older or duplicate update for user ${user.id}`);
        return;
      }
    }

    // Update the user attributes with subscription data
    const updatedAttributes = {
      ...user.attributes,
      paddle_subscription_id: [subscriptionId],
      paddle_subscription_status: [subscriptionData.status || ""],
      paddle_last_update: [occurredAt],
      paddle_collection_mode: [subscriptionData.collection_mode || ""],
      paddle_customer_id: [customerId || ""],
      // Store scheduled_change as a string if it exists
      ...(subscriptionData.scheduled_change && {
        paddle_scheduled_change: [
          JSON.stringify(subscriptionData.scheduled_change),
        ],
      }),
      // Map other relevant subscription data
      paddle_product_id:
        subscriptionData.items?.map((item) => item.product_id) || [],
      paddle_price_id:
        subscriptionData.items?.map((item) => item.price_id) || [],
      paddle_quantity:
        subscriptionData.items?.map((item) => item.quantity.toString()) || [],
    };

    // Update the user in Keycloak
    await keycloak.updateUser(user, { attributes: updatedAttributes });

    console.log(`Successfully updated user ${user.id} with subscription data`);
  } catch (error) {
    console.error("Error processing subscription update:", error);
    throw error;
  }
}

/**
 * Fetch customer details from Paddle API
 */
async function fetchPaddleCustomer(
  customerId: string,
  env: Env
): Promise<PaddleCustomer | null> {
  try {
    // Determine if we're using sandbox or production
    const environment = env.PUBLIC_PADDLE_ENVIRONMENT || "production";
    const baseUrl =
      environment === "sandbox"
        ? "https://sandbox-api.paddle.com"
        : "https://api.paddle.com";

    const customerEndpoint = `${baseUrl}/customers/${customerId}`;

    const response = await fetch(customerEndpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.PADDLE_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch customer details: ${response.status} ${errorText}`
      );
    }

    const customerResponse = (await response.json()) as PaddleCustomerResponse;
    return customerResponse.data;
  } catch (error) {
    console.error(`Error fetching customer from Paddle: ${error}`);
    return null;
  }
}
