import type { APIRoute } from "astro";
import { getLogger, logWrapper } from "../../lib/modules/pino-logger";
import { KeycloakClient } from "../../lib/modules/keycloak";
import { getEmailFromJWT } from "../../lib/modules/jwt";
import { createDb } from "../../lib/db/drizzle";
import { bookedRooms } from "../../lib/db/schema";
import { eq } from "drizzle-orm";

export const prerender = false;
const logger = getLogger();

export const GET: APIRoute = async (c) => {
  return await logWrapper(c, WorkerHandler);
};

/**
 * GET endpoint that checks if a room name is available for booking.
 * Requires a valid Bearer access token (logged-in user).
 * 
 * URL parameters: ?roomName=string
 * 
 * Returns:
 * - { available: true } if room is available
 * - { available: false } if room is already booked
 */
const WorkerHandler: APIRoute = async ({ request, url, locals }) => {
  try {
    // Extract Bearer token from Authorization header
    const authHeader = request.headers.get("Authorization");
    const bearerToken = authHeader?.replace("Bearer ", "");

    if (!bearerToken) {
      logger.error("Missing Authorization header");
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate token using KeycloakClient
    const keycloakClient = new KeycloakClient(locals.runtime);
    const isValidToken = await keycloakClient.validateToken(bearerToken);

    if (!isValidToken) {
      logger.error("Invalid bearer token");
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Extract email from JWT token for logging purposes
    const email = getEmailFromJWT(bearerToken);

    // Parse URL parameters
    const urlParams = new URL(url).searchParams;
    const roomName = urlParams.get('roomName');

    if (!roomName) {
      logger.error("Missing required parameter: roomName");
      return new Response(
        JSON.stringify({
          error: "Missing required parameter: roomName",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Sanitize room name to prevent injection attacks
    const sanitizedRoomName = roomName.trim();
    if (sanitizedRoomName.length === 0) {
      logger.error("Invalid room name: empty string");
      return new Response(
        JSON.stringify({
          error: "Invalid room name: cannot be empty",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    logger.info(`Checking room availability for: ${sanitizedRoomName}, requested by: ${email}`);

    // Create database connection
    const db = createDb();

    try {
      // Check if room is already booked
      const existingBooking = await db
        .select({
          id: bookedRooms.id,
          roomName: bookedRooms.roomName,
        })
        .from(bookedRooms)
        .where(eq(bookedRooms.roomName, sanitizedRoomName))
        .limit(1);

      const isAvailable = existingBooking.length === 0;

      logger.info(`Room ${sanitizedRoomName} availability: ${isAvailable ? 'available' : 'not available'}`);

      return new Response(
        JSON.stringify({
          available: isAvailable,
          roomName: sanitizedRoomName,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );

    } catch (dbError) {
      logger.error(dbError, "Database error checking room availability:");
      return new Response(
        JSON.stringify({ error: "Database connection failed" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

  } catch (e) {
    logger.error(e, "Error handling room availability request:");
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
