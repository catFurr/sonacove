import { PaddleClient, type PaddleCustomer } from "../../lib/modules/paddle";
import { BrevoClient } from "../../lib/modules/brevo";
import { getLogger, logWrapper } from "../../lib/modules/pino-logger";
import type { APIRoute } from "astro";
import { KC_WEBHOOK_SECRET } from "astro:env/server";


export const prerender = false;
const logger = getLogger();

// Define the expected request body interface
interface RegistrationFlowRequest {
  firstname: string;
  lastname: string;
  email: string;
  email_verified: boolean;
}

export const POST: APIRoute = async (c) => {
  return await logWrapper(c, WorkerHandler)
}

const WorkerHandler: APIRoute = async ({ request }) => {
  try {
    // Verify secret token
    const authHeader = request.headers.get("Authorization");
    const secretToken = authHeader?.replace("Bearer ", "");

    if (!secretToken || secretToken !== KC_WEBHOOK_SECRET) {
      logger.error("Invalid or missing authentication token");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse the request body
    const requestBody =
      (await request.json()) as RegistrationFlowRequest;

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
        { email: requestBody.email }
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
          { name: expectedName }
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
        }
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

    // 2. Set Brevo contact (update if exists, create if doesn't)
    try {
      await BrevoClient.setContact(
        requestBody.email,
        {
          FIRSTNAME: requestBody.firstname,
          LASTNAME: requestBody.lastname,
          "DOUBLE_OPT-IN": requestBody.email_verified,
        },
        [2], // List #2 as specified
        customerId
      );

      logger.info(
        `Set Brevo contact for email: ${requestBody.email}`
      );
    } catch (e) {
      logger.error(e, "Failed to set Brevo contact:");
      // Continue with the flow even if Brevo contact setting fails
    }

    // 3. Return the Paddle customer ID
    return new Response(JSON.stringify({ paddle_customer_id: customerId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    logger.error(e, "Error in registration flow:");
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
