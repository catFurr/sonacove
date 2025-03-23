import { PagesFunction } from "@cloudflare/workers-types";
import { PaddleClient } from "../components/paddle.js";
import {
  BrevoClient,
  type BrevoContactAttributes,
} from "../components/brevo.js";
import { KeycloakUser } from "../components/keycloak-types.js";

// Webhook payload from Keycloak
interface KeycloakWebhookEvent {
  time: number;
  type: string;
  realmId: string;
  representation: KeycloakUser;
  operationType: string;
  resourcePath: string;
  resourceType: string;
}

export interface Env {
  PADDLE_API_KEY: string;
  PUBLIC_PADDLE_ENVIRONMENT?: string;
  BREVO_API_KEY: string;
  KEYCLOAK_WEBHOOK_SECRET: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  try {
    // Only accept POST requests
    if (context.request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Verify secret token
    const authHeader = context.request.headers.get("Authorization");
    const secretToken = authHeader?.replace("Bearer ", "");

    if (!secretToken || secretToken !== context.env.KEYCLOAK_WEBHOOK_SECRET) {
      console.error("Invalid or missing authentication token");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse the webhook payload
    const webhookEvent = (await context.request.json()) as KeycloakWebhookEvent;

    // Verify this is a user update event (not creation)
    if (
      webhookEvent.resourceType !== "USER" ||
      webhookEvent.operationType !== "UPDATE"
    ) {
      return new Response(
        JSON.stringify({ message: "Ignored non-update event" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const userData = webhookEvent.representation;

    // If no user data or email is provided, return an error
    if (!userData || !userData.email) {
      return new Response(JSON.stringify({ error: "Invalid user data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the user's email and name
    const { email, firstName, lastName, emailVerified } = userData;
    const paddleCustomerId = userData.attributes?.paddle_customer_id?.[0];
    const fullName =
      firstName && lastName
        ? `${firstName} ${lastName}`
        : firstName || lastName || "";

    // Process updates to Paddle and Brevo
    const results = await Promise.allSettled([
      // Update Paddle customer if we have a customer ID and a name
      paddleCustomerId && fullName
        ? updatePaddleCustomer(paddleCustomerId, email, fullName, context.env)
        : Promise.resolve(null),

      // Update Brevo contact with name and email verification status
      updateBrevoContact(
        email,
        firstName,
        lastName,
        emailVerified,
        paddleCustomerId,
        context.env
      ),
    ]);

    // Check results
    const errors: string[] = [];
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        errors.push(
          `Error ${index === 0 ? "updating Paddle" : "updating Brevo"}: ${
            result.reason
          }`
        );
      }
    });

    if (errors.length > 0) {
      console.error("Errors in webhook processing:", errors);
      return new Response(JSON.stringify({ errors: errors }), {
        status: 207,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Webhook processed successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing Keycloak webhook:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * Updates a Paddle customer with new name information
 */
async function updatePaddleCustomer(
  customerId: string,
  email: string,
  name: string,
  env: Env
): Promise<void> {
  try {
    // First, fetch the current customer to see if an update is needed
    const customer = await PaddleClient.fetchCustomer(customerId, env);

    // Only update if the name has changed
    if (customer && customer.name !== name) {
      await PaddleClient.updateCustomer(customerId, { name }, env);
      console.log(`Updated Paddle customer ${customerId} with name: ${name}`);
    } else {
      console.log(`No Paddle customer update needed for ${customerId}`);
    }
  } catch (error) {
    console.error(`Error updating Paddle customer ${customerId}:`, error);
    throw error;
  }
}

/**
 * Updates a Brevo contact with new name and email verification information
 */
async function updateBrevoContact(
  email: string,
  firstName: string | undefined,
  lastName: string | undefined,
  emailVerified: boolean | undefined,
  paddleCustomerId: string | undefined,
  env: Env
): Promise<void> {
  try {
    // Skip if we don't have basic info
    if (!email) return;

    // Try to find the contact by email first
    let contactFound = false;
    try {
      await BrevoClient.getContact(email, env.BREVO_API_KEY);
      contactFound = true;
    } catch (emailError) {
      // If not found by email and we have a customer ID, try by customer ID
      if (paddleCustomerId) {
        try {
          await BrevoClient.getContact(
            paddleCustomerId,
            env.BREVO_API_KEY,
            true // useExtId = true
          );
          contactFound = true;
        } catch (cidError) {
          // Contact not found by either method
          contactFound = false;
        }
      }
    }

    // Prepare the attributes to update
    const attributes: BrevoContactAttributes = {};

    // Only set name attributes if they are provided
    if (firstName !== undefined) {
      attributes.FIRSTNAME = firstName;
    }

    if (lastName !== undefined) {
      attributes.LASTNAME = lastName;
    }

    // Set Paddle customer ID if available
    if (paddleCustomerId) {
      attributes.EXT_ID = paddleCustomerId;
    }

    // Set double opt-in if email is verified
    if (emailVerified !== undefined) {
      attributes["DOUBLE_OPT-IN"] = emailVerified;
    }

    if (contactFound) {
      // Update the existing contact
      await BrevoClient.updateContact(email, { attributes }, env.BREVO_API_KEY);
      console.log(`Updated Brevo contact for ${email}`);
    } else {
      // Create a new contact with the provided info
      attributes.OPT_IN = true; // Set opt-in for new contacts

      await BrevoClient.createContact(
        email,
        attributes,
        2, // Default to List #2
        env.BREVO_API_KEY
      );
      console.log(`Created new Brevo contact for ${email}`);
    }
  } catch (error) {
    console.error(`Error updating Brevo contact for ${email}:`, error);
    throw error;
  }
}
