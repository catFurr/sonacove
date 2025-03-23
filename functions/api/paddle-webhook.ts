import { KVNamespace, PagesFunction } from "@cloudflare/workers-types";
import { KeycloakClient } from "../components/keycloak.js";
import { PaddleClient, PaddleWebhookEvent } from "../components/paddle.js";

export interface Env {
  PADDLE_WEBHOOK_SECRET: string;
  KEYCLOAK_CLIENT_ID: string;
  KEYCLOAK_CLIENT_SECRET: string;
  KV: KVNamespace;
  PUBLIC_PADDLE_ENVIRONMENT?: string;
  PADDLE_API_KEY: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const next = async (event: PaddleWebhookEvent) => {
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
    const extractedData = PaddleClient.extractWebhookData(event);

    // Log the extracted data for debugging
    console.log("Extracted Paddle data:", JSON.stringify(extractedData));

    // Process the subscription data and update Keycloak
    if (extractedData.subscription) {
      await processSubscriptionUpdate(extractedData, context.env);
    }
    // For now, we're only handling subscription events
    // We could add transaction handling later if needed

    console.log(`Successfully processed ${event.event_type} event`);
  };

  return PaddleClient.processWebhook(context, next);
};

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
        const customerDetails = await PaddleClient.fetchCustomer(
          customerId,
          env
        );
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
