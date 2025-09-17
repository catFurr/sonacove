import { getEmailFromJWT } from "../../lib/modules/jwt";
import { KeycloakClient } from "../../lib/modules/keycloak";
import { PaddleClient } from "../../lib/modules/paddle";
import { getLogger, logWrapper } from "../../lib/modules/pino-logger";
import type { APIRoute } from "astro";


export const prerender = false;
const logger = getLogger();


/**
 * Generates a Paddle customer portal URL for the authenticated user
*
* This API requires a valid Keycloak access token passed as a Bearer token
* and returns a URL that will automatically log the user into the Paddle customer portal
*/
export const GET: APIRoute = async (c) => {
  return await logWrapper(c, WorkerHandler)
}

const WorkerHandler: APIRoute = async ({ request, locals }) => {
  try {
    // Get JWT from Authorization header
    const authHeader = request.headers.get("Authorization");
    const jwt = authHeader?.replace("Bearer ", "");

    if (!jwt) {
      return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate JWT using KeycloakClient
    const keycloakClient = new KeycloakClient(locals.runtime);
    const isValidToken = await keycloakClient.validateToken(jwt);
    if (!isValidToken) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const email = getEmailFromJWT(jwt);
    if (!email) {
      return new Response(JSON.stringify({ error: "No email in token" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Find user in Keycloak (reuse the existing client)
    const user = await keycloakClient.getUser(email);

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get customer ID from Keycloak user attributes
    const paddleCustomerId = user.attributes?.paddle_customer_id?.[0];
    if (!paddleCustomerId) {
      return new Response(
        JSON.stringify({
          error: "No Paddle customer associated with this user",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create a customer portal session using PaddleClient
    const portalUrl = await PaddleClient.createCustomerPortalSession(paddleCustomerId);

    if (!portalUrl) {
      logger.error("Failed to create customer portal session");
      return new Response(
        JSON.stringify({ error: "Failed to create customer portal session" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return the customer portal URL
    return new Response(
      JSON.stringify({
        url: portalUrl,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    logger.error(e, "Error creating customer portal session:");
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
