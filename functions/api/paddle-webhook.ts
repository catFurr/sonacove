import { KeycloakClient } from "../components/keycloak.ts";
import { PaddleClient, PaddleWebhookEvent } from "../components/paddle.ts";
import { getLogger, logWrapper } from "../components/pino-logger.ts";
import type { Env, WorkerContext, WorkerFunction } from "../components/types.ts";
import { capturePosthogEvent } from "../components/posthog.ts";
const logger = getLogger();

// dsfdf

export const onRequest: WorkerFunction = async (context) => {
  return await logWrapper(context, WorkerHandler)
}

async function WorkerHandler(context: WorkerContext) {

  const next = async (event: PaddleWebhookEvent) => {
    // Check if this is one of the events we want to handle
    const validEventTypes = [
      "transaction.created",
      "subscription.created",
      "transaction.updated",
      "subscription.updated",
    ];

    if (!validEventTypes.includes(event.event_type)) {
      logger.info(`Ignoring event type: ${event.event_type}`);
      return;
    }

    // Extract the relevant information
    const extractedData = PaddleClient.extractWebhookData(event);

    // Log the extracted data for debugging
    logger.info("Extracted Paddle data:", JSON.stringify(extractedData));

    // Process the subscription data and update Keycloak
    let user = undefined;
    if (extractedData.subscription) {
      user = await processSubscriptionUpdate(extractedData, context.env);
      // Subscription activation event
      if (event.event_type === "subscription.created" && user) {
        await capturePosthogEvent({
          distinctId: user.id,
          event: "subscription_activated",
          env: context.env,
        });
      }
    }
    // Handle transaction events for subscription payment
    if (extractedData.transaction) {
      // Try to find the user by subscription_id or customer_id
      const keycloak = new KeycloakClient(context.env);
      const tx = extractedData.transaction;
      // Try by subscription_id first
      if (tx.subscription_id) {
        user = await keycloak.getUser(undefined, tx.subscription_id);
      }
      // Fallback to customer_id if not found
      if (!user && tx.customer_id) {
        const customerDetails = await PaddleClient.fetchCustomer(tx.customer_id, context.env);
        if (customerDetails && customerDetails.email) {
          user = await keycloak.getUser(customerDetails.email, undefined);
        }
      }
      // Subscription payment event: only fire for successful payments
      if (event.event_type === "transaction.updated" && user && tx.status === "paid") {
        await capturePosthogEvent({
          distinctId: user.id,
          event: "subscription_payment",
          env: context.env,
        });
      }
    }
    // For now, we're only handling subscription events
    // We could add transaction handling later if needed

    logger.info(`Successfully processed ${event.event_type} event`);
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
      logger.info(
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
          logger.info(
            `User lookup by email ${customerDetails.email}: ${
              user ? "Found" : "Not found"
            }`
          );
        }
      } catch (error) {
        logger.error(`Error fetching customer details: ${error}`);
      }
    }

    if (!user) {
      logger.info(
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
        logger.info(`Skipping older or duplicate update for user ${user.id}`);
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

    logger.info(
      `Successfully updated user ${user.id} with subscription data`
    );
    return user;
  } catch (error) {
    logger.error("Error processing subscription update:", error);
    throw error;
  }
}
