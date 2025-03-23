import { PagesFunction } from "@cloudflare/workers-types";
import { PaddleClient } from "../components/paddle.js";
import {
  BrevoClient,
  type BrevoContactAttributes,
} from "../components/brevo.js";

// Define the expected request body interface
interface RegistrationFlowRequest {
  firstname: string;
  lastname: string;
  email: string;
  email_verified: boolean;
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

    // 1. Create a new Paddle customer
    const paddleCustomer = await PaddleClient.createCustomer(
      {
        email: requestBody.email,
        name: `${requestBody.firstname} ${requestBody.lastname}`,
      },
      context.env
    );

    if (!paddleCustomer || !paddleCustomer.id) {
      return new Response(
        JSON.stringify({ error: "Failed to create Paddle customer" }),
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
      console.log(`Found Brevo contact by email: ${requestBody.email}`);
    } catch (emailError) {
      // If not found by email, try by customer ID (EXT_ID)
      try {
        brevoContact = await BrevoClient.getContact(
          customerId,
          context.env.BREVO_API_KEY,
          true // useExtId = true
        );
        contactFound = true;
        console.log(`Found Brevo contact by CID: ${customerId}`);
      } catch (cidError) {
        // Contact not found by either method
        contactFound = false;
        console.log(`Brevo contact not found by email or CID`);
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

      console.log(
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

        console.log(
          `Created new Brevo contact for email: ${requestBody.email}`
        );
      } catch (createError) {
        console.error("Failed to create Brevo contact:", createError);
        // Continue with the flow even if Brevo contact creation fails
      }
    }

    // 5. Return the Paddle customer ID
    return new Response(JSON.stringify({ paddle_customer_id: customerId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in registration flow:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
