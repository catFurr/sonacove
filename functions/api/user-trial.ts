import { KeycloakClient } from "../components/keycloak.ts";
import { validateKeycloakJWT, getEmailFromJWT } from "../components/jwt.ts";
import { getLogger, logWrapper } from "../components/pino-logger.ts";
import type { WorkerContext, WorkerFunction } from "../components/types.ts";
const logger = getLogger();

function isStatusFinal(status?: string[]): boolean {
  if (!status || status.length === 0) return false;
  const s = status[0];
  return s === "active" || s === "trialing" || s === "inactive";
}

function isOverAMonthAgo(dateStr?: string[]): boolean {
  if (!dateStr || dateStr.length === 0) return true;
  const last = dateStr[0];
  const lastDate = new Date(last);
  if (isNaN(lastDate.getTime())) return true;
  const now = new Date();
  const diff = now.getTime() - lastDate.getTime();
  return diff > 30 * 24 * 60 * 60 * 1000; // 30 days in ms
}

export const onRequest: WorkerFunction = async (context) => {
  return await logWrapper(context, WorkerHandler)
}

async function WorkerHandler(context: WorkerContext) {
  try {
    if (context.request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Get JWT from Authorization header
    const authHeader = context.request.headers.get("Authorization");
    const jwt = authHeader?.replace("Bearer ", "");
    logger.info("jwt: ", jwt);
    if (!jwt) {
      return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate JWT and extract email
    const valid = await validateKeycloakJWT(jwt, context.env);
    if (!valid) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    logger.info("jwt token after validation: ", jwt);
    const email = getEmailFromJWT(jwt);
    logger.info("email: ", email);
    if (!email) {
      return new Response(JSON.stringify({ error: "No email in token" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const keycloak = new KeycloakClient(context.env);
    const user = await keycloak.getUser(email);
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const status = user.attributes?.paddle_subscription_status;
    const lastUpdate = user.attributes?.paddle_last_update;
    if (isStatusFinal(status) || !isOverAMonthAgo(lastUpdate)) {
      return new Response(
        JSON.stringify({ success: false, reason: "Not eligible" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    await keycloak.updateUser(user, {
      attributes: {
        paddle_subscription_status: ["trialing"],
        paddle_last_update: [new Date().toISOString()],
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("Error enabling trial:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
