import { validateKeycloakJWT, getEmailFromJWT } from "../components/jwt.ts";
import { KeycloakClient } from "../components/keycloak.ts";
import { getLogger, logWrapper } from "../components/pino-logger.ts";
import type { WorkerContext, WorkerFunction } from "../components/types.ts";
const logger = getLogger();

// Type definition for Paddle API response
interface PaddlePortalSessionResponse {
  data: {
    id: string;
    customer_id: string;
    urls: {
      general: {
        overview: string;
      };
      subscriptions: Array<{
        id: string;
        cancel_subscription?: string;
        update_subscription_payment_method?: string;
      }>;
    };
    created_at: string;
  };
  meta: {
    request_id: string;
  };
}

export const onRequest: WorkerFunction = async (context) => {
  return await logWrapper(context, WorkerHandler)
}

/**
 * Generates a Paddle customer portal URL for the authenticated user
*
* This API requires a valid Keycloak access token passed as a Bearer token
* and returns a URL that will automatically log the user into the Paddle customer portal
*/
async function WorkerHandler(context: WorkerContext) {
  try {
    // Only allow GET requests
    if (context.request.method !== "GET") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get JWT from Authorization header
    const authHeader = context.request.headers.get("Authorization");
    const jwt = authHeader?.replace("Bearer ", "");

    if (!jwt) {
      return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate JWT and extract email
    const valid = await validateKeycloakJWT(jwt);
    if (!valid) {
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

    // Find user in Keycloak
    const keycloak = new KeycloakClient(context.env);
    const user = await keycloak.getUser(email);

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

    // Create a customer portal session using Paddle API
    const baseUrl =
      context.env.PUBLIC_PADDLE_ENVIRONMENT === "sandbox"
        ? "https://sandbox-api.paddle.com"
        : "https://api.paddle.com";

    const portalSessionEndpoint = `${baseUrl}/customers/${paddleCustomerId}/portal-sessions`;

    const response = await fetch(portalSessionEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${context.env.PADDLE_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        `Failed to create customer portal session: ${response.status} ${errorText}`
      );
      return new Response(
        JSON.stringify({ error: "Failed to create customer portal session" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const portalSession =
      (await response.json()) as PaddlePortalSessionResponse;
    const portalUrl = portalSession.data.urls.general.overview;

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
  } catch (error) {
    logger.error("Error creating customer portal session:", error.message);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
