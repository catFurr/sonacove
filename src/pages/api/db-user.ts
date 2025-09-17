
import type { APIRoute } from "astro";
import { getLogger, logWrapper } from "../../lib/modules/pino-logger";
import { KeycloakClient } from "../../lib/modules/keycloak";
import { getEmailFromJWT } from "../../lib/modules/jwt";
import { createDb } from "../../lib/db/drizzle";
import { users, bookedRooms } from "../../lib/db/schema";
import { eq } from "drizzle-orm";

export const prerender = false;
const logger = getLogger();

export const GET: APIRoute = async (c) => {
  return await logWrapper(c, WorkerHandler);
};

/**
 * GET endpoint that returns the user object along with any booked rooms.
 * Validates the bearer token using KeycloakClient.validateToken,
 * then gets the user from the db using drizzle.
 */
const WorkerHandler: APIRoute = async ({ request, locals }) => {
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

    // Extract email from JWT token
    const email = getEmailFromJWT(bearerToken);

    if (!email) {
      logger.error("Could not extract email from JWT token");
      return new Response(JSON.stringify({ error: "Invalid token - no email found" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create database connection
    const db = createDb();

    // Get user and their booked rooms in a single query using LEFT JOIN
    const userWithBookings = await db
      .select({
        // User fields
        userId: users.id,
        userEmail: users.email,
        isActiveHost: users.isActiveHost,
        maxBookings: users.maxBookings,
        totalHostMinutes: users.totalHostMinutes,
        userCreatedAt: users.createdAt,
        userUpdatedAt: users.updatedAt,
        // Booking fields (nullable due to LEFT JOIN)
        bookingId: bookedRooms.id,
        roomName: bookedRooms.roomName,
        lobbyEnabled: bookedRooms.lobbyEnabled,
        meetingPassword: bookedRooms.meetingPassword,
        maxOccupants: bookedRooms.maxOccupants,
        bookingEndDate: bookedRooms.endDate,
        bookingCreatedAt: bookedRooms.createdAt,
        bookingUpdatedAt: bookedRooms.updatedAt,
      })
      .from(users)
      .leftJoin(bookedRooms, eq(users.id, bookedRooms.userId))
      .where(eq(users.email, email));

    if (userWithBookings.length === 0) {
      logger.error(`User not found: ${email}`);
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Extract user data from first row (all rows have same user data)
    const firstRow = userWithBookings[0];
    const userRecord = {
      id: firstRow.userId,
      email: firstRow.userEmail,
      isActiveHost: firstRow.isActiveHost,
      maxBookings: firstRow.maxBookings,
      totalHostMinutes: firstRow.totalHostMinutes,
      createdAt: firstRow.userCreatedAt,
      updatedAt: firstRow.userUpdatedAt,
    };

    // Extract booked rooms (filter out null booking IDs)
    const userBookedRooms = userWithBookings
      .filter(row => row.bookingId !== null)
      .map(row => ({
        id: row.bookingId,
        roomName: row.roomName,
        lobbyEnabled: row.lobbyEnabled,
        meetingPassword: row.meetingPassword,
        maxOccupants: row.maxOccupants,
        endDate: row.bookingEndDate,
        createdAt: row.bookingCreatedAt,
        updatedAt: row.bookingUpdatedAt,
      }));

    // Return user object with booked rooms
    const response = {
      user: userRecord,
      bookedRooms: userBookedRooms,
    };

    logger.info(`Successfully retrieved user data for: ${email}`);
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (e) {
    logger.error(e, "Error handling db-user request:");
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};