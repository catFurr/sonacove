import { PaddleClient, type PaddleCustomer } from "../components/paddle.ts";
import { posthog } from "../components/posthog.ts";
import { posthog } from "../components/posthog.ts";
import {
  BrevoClient,
  type BrevoContactAttributes,
} from "../components/brevo.ts";
import { getLogger, logWrapper } from "../components/pino-logger.ts";
import type { WorkerContext, WorkerFunction } from "../components/types.ts";
import { capturePosthogEvent } from "./keycloak-webhook.ts";
const logger = getLogger();

// Define the expected request body interface
interface RegistrationFlowRequest {
  firstname: string;
  lastname: string;
  email: string;
  email_verified: boolean;
}

export const onRequest: WorkerFunction = async (context) => {
  return await logWrapper(context, WorkerHandler)
}

async function WorkerHandler(context: WorkerContext) {
    posthog.capture({ event: 'user_logged_in', distinctId: 'random' });
  try {
    // Only accept POST requests
    if (context.request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Verify secret token
    const authHeader = context.request.headers.get("Authorization");
    const secretToken = authHeader?.replace("Bearer ", "");

    if (!secretToken || secretToken !== context.env.KC_WEBHOOK_SECRET) {
      logger.error("Invalid or missing authentication token");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse the request body
    const requestBody =
      (await context.request.json()) as RegistrationFlowRequest;

    // Validate required fields
    if (!requestBody.email || !requestBody.firstname || !requestBody.lastname) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1. Fetch or Create Paddle customer
    let paddleCustomer: PaddleCustomer | null =
      await PaddleClient.fetchCustomer(
        { email: requestBody.email },
        context.env
      );

    const expectedName = `${requestBody.firstname} ${requestBody.lastname}`;

    if (paddleCustomer) {
      // Customer exists
      logger.info(
        `Found existing Paddle customer for email: ${requestBody.email}`
      );
      if (paddleCustomer.name !== expectedName) {
        const updatedCustomer = await PaddleClient.updateCustomer(
          paddleCustomer.id, // Use ID for direct update
          { name: expectedName },
          context.env
        );
        if (updatedCustomer) {
          paddleCustomer = updatedCustomer; // Use the updated customer object
          logger.info(
            `Updated Paddle customer name for ID: ${paddleCustomer.id}`
          );
        } else {
          logger.warn(
            `Failed to update name for Paddle customer ID: ${paddleCustomer.id}. Proceeding with existing data.`
          );
        }
      } else {
        logger.info(
          `Paddle customer name is already up-to-date for ID: ${paddleCustomer.id}`
        );
      }
    } else {
      // Customer does not exist, create a new one
      logger.info(
        `Paddle customer not found for email: ${requestBody.email}. Creating new customer.`
      );
      paddleCustomer = await PaddleClient.createCustomer(
        {
          email: requestBody.email,
          name: expectedName,
        },
        context.env
      );
      if (paddleCustomer) {
        logger.info(
          `Created new Paddle customer with ID: ${paddleCustomer.id}`
        );
      }
    }

    if (!paddleCustomer || !paddleCustomer.id) {
      return new Response(
        JSON.stringify({
          error: "Failed to create or retrieve Paddle customer",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const customerId = paddleCustomer.id;

    // 2 & 3. Check if Brevo contact exists and update it if needed
    let brevoContact;
    let contactFound = false;

    // First try to find by email
    try {
      brevoContact = await BrevoClient.getContact(
        requestBody.email,
        context.env.BREVO_API_KEY
      );
      contactFound = true;
      logger.info(`Found Brevo contact by email: ${requestBody.email}`);
    } catch (emailError) {
      // If not found by email, try by customer ID (EXT_ID)
      try {
        brevoContact = await BrevoClient.getContact(
          customerId,
          context.env.BREVO_API_KEY,
          true // useExtId = true
        );
        contactFound = true;
        logger.info(`Found Brevo contact by CID: ${customerId}`);
      } catch (cidError) {
        // Contact not found by either method
        contactFound = false;
        logger.info(`Brevo contact not found by email or CID`);
      }
    }

    if (contactFound) {
      // If contact exists, update if needed
      const brevoAttributes: BrevoContactAttributes = {
        FIRSTNAME: requestBody.firstname,
        LASTNAME: requestBody.lastname,
        EXT_ID: customerId,
        "DOUBLE_OPT-IN": requestBody.email_verified,
      };

      await BrevoClient.updateContact(
        requestBody.email,
        { attributes: brevoAttributes },
        context.env.BREVO_API_KEY
      );

      logger.info(
        `Updated existing Brevo contact for email: ${requestBody.email}`
      );
    } else {
      // 4. If contact doesn't exist, create a new one
      try {
        const brevoAttributes: BrevoContactAttributes = {
          FIRSTNAME: requestBody.firstname,
          LASTNAME: requestBody.lastname,
          EXT_ID: customerId,
          "DOUBLE_OPT-IN": requestBody.email_verified,
          OPT_IN: true,
        };

        await BrevoClient.createContact(
          requestBody.email,
          brevoAttributes,
          2, // List #2 as specified
          context.env.BREVO_API_KEY
        );

        logger.info(
          `Created new Brevo contact for email: ${requestBody.email}`
        );
      } catch (createError) {
        logger.error("Failed to create Brevo contact:", createError);
        // Continue with the flow even if Brevo contact creation fails
      }
    }

       capturePosthogEvent({
         distinctId: 'RandomTestNum',
         event: 'test_event',
       });

    // 5. Return the Paddle customer ID
    return new Response(JSON.stringify({ paddle_customer_id: customerId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("Error in registration flow:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
