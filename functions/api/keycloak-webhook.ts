import {
  BrevoClient,
  type BrevoContactAttributes,
} from "../components/brevo.ts";
import { KeycloakClient } from "../components/keycloak.ts";
import { PaddleClient } from "../components/paddle.ts";
import { getLogger, logWrapper } from "../components/pino-logger.ts";
import type { Env, WorkerContext, WorkerFunction } from "../components/types.ts";
const logger = getLogger();

// Lightweight PostHog event capture for Cloudflare Workers
export async function capturePosthogEvent({
  distinctId,
  event,
  properties = {}}: {
  distinctId: string;
  event: string;
  properties?: Record<string, any>;
}) {
  try {
    const res = await fetch('https://e.sonacove.com/capture/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: 'phc_6DQmHYaWUYWvs6rLBWQooIrmPadIgT3fK61s8DAfIH0',
        event: 'test_event',
        properties: {
          key: "value",
          distinctId
        }
      }),
    });
    console.log(res)
    if (!res.ok) {
      const body = await res.text();
      logger.error(`PostHog capture failed: ${res.status} ${body}`);
    }
  } catch (error) {
    logger.error("PostHog capture error:", error);
    console.log(error)
  }
}

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
  details: Record<string, any>;
  type: string;
}

async function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) {
    logger.error("Missing X-Keycloak-Signature header");
    return false;
  }

  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const message = encoder.encode(rawBody);

  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
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
  return await logWrapper(context, WorkerHandler);
};

async function WorkerHandler(context: WorkerContext) {
  console.log('inside  wh')
  try {
    if (context.request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const rawBody = await context.request.text();
    const webhookEvent = JSON.parse(rawBody) as KeycloakWebhookEvent;
    const signature = context.request.headers.get("x-keycloak-signature");
    const isValid = await verifyWebhookSignature(rawBody, signature, context.env.KC_WEBHOOK_SECRET);

    if (!isValid) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    switch (webhookEvent.type) {
      case "access.UPDATE_PROFILE": {
        const keycloakClient = new KeycloakClient(context.env);
        const email = webhookEvent.authDetails.username;
        const { updated_first_name, updated_last_name } = webhookEvent.details;
        const isPartialUpdate = (updated_first_name && !updated_last_name) || (!updated_first_name && updated_last_name);
        let firstName = updated_first_name;
        let lastName = updated_last_name;
        let fullName = "";

        if (isPartialUpdate) {
          try {
            logger.info(`Partial update detected for ${email}, fetching complete user data`);
            const keycloakUser = await keycloakClient.getUser(email);
            firstName = updated_first_name || keycloakUser.firstName;
            lastName = updated_last_name || keycloakUser.lastName;
            logger.info(`Retrieved complete user data: ${firstName} ${lastName}`);
          } catch (error) {
            logger.warn(`Could not find complete user data for ${email}, proceeding with partial update`);
          }
        }

        fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || "";

        const results = await Promise.allSettled([
          fullName ? updatePaddleCustomer(email, fullName, context.env) : Promise.resolve(null),
          updateBrevoContact(email, firstName, lastName, undefined, undefined, context.env),
        ]);

        const errors: string[] = [];
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            errors.push(`Error ${index === 0 ? "updating Paddle" : "updating Brevo"}: ${result.reason}`);
          }
        });

        if (errors.length > 0) {
          logger.error("Errors in webhook processing:", errors);
          return new Response(JSON.stringify({ errors }), { status: 207, headers: { "Content-Type": "application/json" } });
        }

        return new Response(JSON.stringify({ success: true, message: "Profile update processed successfully" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      case "access.VERIFY_EMAIL": {
        if (webhookEvent.details.action !== "verify-email") {
          return new Response(JSON.stringify({ message: "Ignored non-email-verification event" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        const results = await Promise.allSettled([
          updateBrevoContact(webhookEvent.authDetails.username, undefined, undefined, true, undefined, context.env),
        ]);

        const errors: string[] = [];
        results.forEach((result) => {
          if (result.status === "rejected") {
            errors.push(`Error updating Brevo: ${result.reason}`);
          }
        });

        if (errors.length > 0) {
          logger.error("Errors in webhook processing:", errors);
          return new Response(JSON.stringify({ errors }), {
            status: 207,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true, message: "Email verification processed successfully" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      case "access.REGISTER": {
        await capturePosthogEvent({ distinctId: "RandomTestNum", event: "user_signed_up" });
        return new Response(JSON.stringify({ success: true, message: "User registration processed successfully" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      case "access.LOGIN": {
        await capturePosthogEvent({ distinctId: "RandomTestNum", event: "user_logged_in" });
        return new Response(JSON.stringify({ success: true, message: "User login processed successfully" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ message: "Ignored unsupported event type" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    logger.error("Error processing Keycloak webhook:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function updatePaddleCustomer(email: string, name: string, env: Env): Promise<void> {
  try {
    try {
      await PaddleClient.updateCustomer(email, { name }, env);
      logger.info(`Updated Paddle customer with email ${email}, name: ${name}`);
    } catch (error) {
      const errorMsg = error?.message || "";
      if (errorMsg.includes("not found")) {
        await PaddleClient.createCustomer({ email, name }, env);
        logger.info(`Created new Paddle customer for ${email} with name: ${name}`);
      } else {
        throw error;
      }
    }
  } catch (error) {
    logger.error(`Error updating Paddle customer for ${email}:", error`);
    throw error;
  }
}

async function updateBrevoContact(
  email: string,
  firstName: string | undefined,
  lastName: string | undefined,
  emailVerified: boolean | undefined,
  paddleCustomerId: string | undefined,
  env: Env
): Promise<void> {
  try {
    if (!email) return;

    let contactFound = false;
    try {
      await BrevoClient.getContact(email, env.BREVO_API_KEY);
      contactFound = true;
    } catch (_) {
      if (paddleCustomerId) {
        try {
          await BrevoClient.getContact(paddleCustomerId, env.BREVO_API_KEY, true);
          contactFound = true;
        } catch (_) {
          contactFound = false;
        }
      }
    }

    const attributes: BrevoContactAttributes = {};
    if (firstName !== undefined) attributes.FIRSTNAME = firstName;
    if (lastName !== undefined) attributes.LASTNAME = lastName;
    if (paddleCustomerId) attributes.EXT_ID = paddleCustomerId;
    if (emailVerified !== undefined) attributes["DOUBLE_OPT-IN"] = emailVerified;

    if (contactFound) {
      await BrevoClient.updateContact(email, { attributes }, env.BREVO_API_KEY);
      logger.info(`Updated Brevo contact for ${email}`);
    } else {
      attributes.OPT_IN = true;
      await BrevoClient.createContact(email, attributes, 2, env.BREVO_API_KEY);
      logger.info(`Created new Brevo contact for ${email}`);
    }
  } catch (error) {
    logger.error(`Error updating Brevo contact for ${email}:", error`);
    throw error;
  }
}
