import { PaddleClient } from "../components/paddle.ts";
import {
  BrevoClient,
  type BrevoContactAttributes,
} from "../components/brevo.ts";
import { KeycloakClient } from "../components/keycloak.ts";
import { getLogger, logWrapper } from "../components/pino-logger.ts";
import type { Env, WorkerContext, WorkerFunction } from "../components/types.ts";
const logger = getLogger();

// Webhook payload from Keycloak
interface KeycloakWebhookEvent {
  id: string;
  time: number;
  realmId: string;
  realmName: string;
  uid: string;
  authDetails: {
    realmId: string;
    clientId: string;
    userId: string;
    ipAddress: string;
    username: string;
    sessionId?: string;
  };
  details: {
    context?: string;
    updated_first_name?: string;
    previous_first_name?: string;
    updated_last_name?: string;
    previous_last_name?: string;
    // Email verification fields
    auth_method?: string;
    token_id?: string;
    action?: string;
    response_type?: string;
    redirect_uri?: string;
    remember_me?: string;
    code_id?: string;
    email?: string;
    response_mode?: string;
    username?: string;
    // Other fields that might be present in different event types
    grant_type?: string;
    refresh_token_type?: string;
    access_token_expiration_time?: string;
    updated_refresh_token_id?: string;
    scope?: string;
    age_of_refresh_token?: string;
    refresh_token_id?: string;
    refresh_token_sub?: string;
    client_auth_method?: string;
  };
  type: string;
}

/**
 * Verifies the HMAC-SHA256 signature of the webhook request
 */
async function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) {
    logger.error("Missing X-Keycloak-Signature header");
    return false;
  }

  // Calculate expected signature
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const message = encoder.encode(rawBody);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, message);

  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (signature !== expectedSignature) {
    logger.error("Invalid signature");
    return false;
  }

  return true;
}

export const onRequest: WorkerFunction = async (context) => {
  return await logWrapper(context, WorkerHandler)
}

async function WorkerHandler(context: WorkerContext) {
  try {
    // Only accept POST requests
    if (context.request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Get the raw body for signature verification
    const rawBody = await context.request.text();
    const webhookEvent = JSON.parse(rawBody) as KeycloakWebhookEvent;

    // Verify HMAC-SHA256 signature
    const signature = context.request.headers.get("x-keycloak-signature");
    const isValid = await verifyWebhookSignature(
      rawBody,
      signature,
      context.env.KEYCLOAK_WEBHOOK_SECRET
    );

    if (!isValid) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Process different event types
    switch (webhookEvent.type) {
      case "access.UPDATE_PROFILE": {
        // Initialize Keycloak client to fetch complete user info if needed
        const keycloakClient = new KeycloakClient(context.env);
        const email = webhookEvent.authDetails.username;

        // Get the updated user information from the webhook
        const { updated_first_name, updated_last_name } = webhookEvent.details;

        // Check if we have a partial update (missing first or last name)
        const isPartialUpdate =
          (updated_first_name && !updated_last_name) ||
          (!updated_first_name && updated_last_name);

        // Variables to store the complete user information
        let firstName = updated_first_name;
        let lastName = updated_last_name;
        let fullName = "";

        // If it's a partial update, fetch the complete user info from Keycloak
        if (isPartialUpdate) {
          try {
            logger.info(
              `Partial update detected for ${email}, fetching complete user data`
            );
            let keycloakUser = null;

            try {
              keycloakUser = await keycloakClient.getUser(email);
            } catch (keycloakError) {
              logger.error(`Error connecting to Keycloak: ${keycloakError}`);
              // Fall back to what we have from the webhook
            }

            if (keycloakUser) {
              // If we got the first name from the webhook, use it; otherwise use the one from Keycloak
              firstName = updated_first_name || keycloakUser.firstName;
              // If we got the last name from the webhook, use it; otherwise use the one from Keycloak
              lastName = updated_last_name || keycloakUser.lastName;

              logger.info(
                `Retrieved complete user data: ${firstName} ${lastName}`
              );
            } else {
              logger.warn(
                `Could not find complete user data for ${email}, proceeding with partial update`
              );
            }
          } catch (error) {
            logger.error(`Error in user data lookup: ${error}`);
            // Continue with the partial data we have
          }
        }

        // Construct the full name from the available data
        fullName =
          firstName && lastName
            ? `${firstName} ${lastName}`
            : firstName || lastName || "";

        // Process updates to Paddle and Brevo
        const results = await Promise.allSettled([
          // Update Paddle customer if we have a name
          fullName
            ? updatePaddleCustomer(email, fullName, context.env)
            : Promise.resolve(null),

          // Update Brevo contact with new name information
          updateBrevoContact(
            email,
            firstName,
            lastName,
            undefined, // emailVerified not provided in profile update
            undefined, // paddleCustomerId not provided in profile update
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
          logger.error("Errors in webhook processing:", errors);
          return new Response(JSON.stringify({ errors: errors }), {
            status: 207,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: "Profile update processed successfully",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      case "access.VERIFY_EMAIL": {
        // Verify this is an email verification event
        if (webhookEvent.details.action !== "verify-email") {
          return new Response(
            JSON.stringify({
              message: "Ignored non-email-verification event",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }

        // Process email verification update to Brevo
        const results = await Promise.allSettled([
          updateBrevoContact(
            webhookEvent.authDetails.username,
            undefined, // firstName not provided in email verification
            undefined, // lastName not provided in email verification
            true, // email is verified
            undefined, // paddleCustomerId not provided in email verification
            context.env
          ),
        ]);

        // Check results
        const errors: string[] = [];
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            errors.push(`Error updating Brevo: ${result.reason}`);
          }
        });

        if (errors.length > 0) {
          logger.error("Errors in webhook processing:", errors);
          return new Response(JSON.stringify({ errors: errors }), {
            status: 207,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: "Email verification processed successfully",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      // New event case for user signup
      case "access.REGISTER": {
        try {
          // Capture signup event in PostHog
          posthog.capture("user_signed_up");
        }

      // New event case for user login
      case "access.LOGIN": {
        try {
          // Capture login event in PostHog
          posthog.capture("user_logged_in");
          logger.info(
            `Captured user_logged_in for ${webhookEvent.authDetails.username}`,
          );
        } catch (err) {
          logger.error("Error capturing user_logged_in event:", err);
        }
        return new Response(
          JSON.stringify({
            success: true,
            message: "Email verification processed successfully",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ message: "Ignored unsupported event type" }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    logger.error("Error processing Keycloak webhook:", error);
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
  email: string,
  name: string,
  env: Env
): Promise<void> {
  try {
    // Try to update customer by email - PaddleClient's updateCustomer will handle finding by email
    try {
      await PaddleClient.updateCustomer(email, { name }, env);
      logger.info(`Updated Paddle customer with email ${email}, name: ${name}`);
    } catch (error) {
      // If customer doesn't exist, create a new one
      const errorMsg = error?.message || "";
      if (errorMsg.includes("not found")) {
        await PaddleClient.createCustomer({ email, name }, env);
        logger.info(
          `Created new Paddle customer for ${email} with name: ${name}`
        );
      } else {
        // Re-throw if it's some other error
        throw error;
      }
    }
  } catch (error) {
    logger.error(`Error updating Paddle customer for ${email}:`, error);
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
      logger.info(`Updated Brevo contact for ${email}`);
    } else {
      // Create a new contact with the provided info
      attributes.OPT_IN = true; // Set opt-in for new contacts

      await BrevoClient.createContact(
        email,
        attributes,
        2, // Default to List #2
        env.BREVO_API_KEY
      );
      logger.info(`Created new Brevo contact for ${email}`);
    }
  } catch (error) {
    logger.error(`Error updating Brevo contact for ${email}:`, error);
    throw error;
  }
}
