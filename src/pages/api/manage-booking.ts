import { getLogger, logWrapper } from "../../lib/modules/pino-logger";
import { KeycloakClient } from "../../lib/modules/keycloak";
import { getEmailFromJWT } from "../../lib/modules/jwt";

import { createDb } from "../../lib/db/drizzle";
import { users, bookedRooms } from "../../lib/db/schema";
import { eq, sql } from "drizzle-orm";
import type { APIRoute } from "astro";
import { CF_WEBHOOK_SECRET } from "astro:env/server";


export const prerender = false;
const logger = getLogger();

export const GET: APIRoute = async (c) => {
  return await logWrapper(c, WorkerHandler)
}

export const POST: APIRoute = async (c) => {
  return await logWrapper(c, PostWorkerHandler)
}

export const DELETE: APIRoute = async (c) => {
  return await logWrapper(c, DeleteWorkerHandler)
}


/**
 * Check if the user can be a host for the specified room
 *
 * This API requires a valid Bearer access token and GET request
 * with URL parameters: ?room=string&email=string
 * and returns meeting options if valid host.
 */
const WorkerHandler: APIRoute = async ({ request, url }) => {
  try {

    // Verify secret token
    const authHeader = request.headers.get("Authorization");
    const secretToken = authHeader?.replace("Bearer ", "");

    if (!secretToken || secretToken !== CF_WEBHOOK_SECRET) {
      logger.error("Invalid or missing authentication token");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse URL parameters
    const urlParams = new URL(url).searchParams;
    const roomName = urlParams.get('room');
    const email = urlParams.get('email');

    if (!roomName || !email) {
      logger.error("Missing required parameters: room and email");
      return new Response(
        JSON.stringify({
          error: "Missing required parameters: room and email",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    logger.info(
      `Checking booking eligibility for room: ${roomName}, email: ${email}`
    );

    // Create database connection with environment variables
    const db = createDb();

    // Query database for user and room booking in a single query using LEFT JOIN
    let userRecord, roomBooking;
    try {
      // Add timeout to prevent hanging requests
      const queryPromise = db
        .select({
          // User fields
          userId: users.id,
          userEmail: users.email,
          isActiveHost: users.isActiveHost,
          maxBookings: users.maxBookings,
          totalHostMinutes: users.totalHostMinutes,
          userCreatedAt: users.createdAt,
          userUpdatedAt: users.updatedAt,
          // Room booking fields (nullable due to LEFT JOIN)
          roomBookingId: bookedRooms.id,
          roomName: bookedRooms.roomName,
          roomUserId: bookedRooms.userId,
          lobbyEnabled: bookedRooms.lobbyEnabled,
          meetingPassword: bookedRooms.meetingPassword,
          maxOccupants: bookedRooms.maxOccupants,
          roomEndDate: bookedRooms.endDate,
          roomCreatedAt: bookedRooms.createdAt,
          roomUpdatedAt: bookedRooms.updatedAt,
        })
        .from(users)
        .leftJoin(bookedRooms, eq(bookedRooms.roomName, roomName))
        .where(eq(users.email, email))
        .limit(1);

      // Add 5 second timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 5000)
      );

      const userAndRoomData = await Promise.race([queryPromise, timeoutPromise]) as any[];

      if (userAndRoomData.length === 0) {
        logger.error(`User not found: ${email}`);
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      const row = userAndRoomData[0];
      
      // Extract user data
      userRecord = {
        id: row.userId,
        email: row.userEmail,
        isActiveHost: row.isActiveHost,
        maxBookings: row.maxBookings,
        totalHostMinutes: row.totalHostMinutes,
        createdAt: row.userCreatedAt,
        updatedAt: row.userUpdatedAt,
      };

      // Extract room booking data (null if no booking exists)
      roomBooking = row.roomBookingId ? {
        id: row.roomBookingId,
        roomName: row.roomName,
        userId: row.roomUserId,
        lobbyEnabled: row.lobbyEnabled,
        meetingPassword: row.meetingPassword,
        maxOccupants: row.maxOccupants,
        endDate: row.roomEndDate,
        createdAt: row.roomCreatedAt,
        updatedAt: row.roomUpdatedAt,
      } : null;

    } catch (e) {
      logger.error(e, "Database error fetching user and room:");
      return new Response(JSON.stringify({ error: "Database connection failed" }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // If user is already an active host, return negative
    if (userRecord?.isActiveHost) {
      logger.info(`User ${email} is already an active host`);
      return new Response(
        JSON.stringify({ error: "User is already hosting another meeting" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // If no booking exists for this room, return positive (room is available)
    if (!roomBooking) {
      logger.info(`Room ${roomName} is available`);
      return new Response(
        JSON.stringify({
          max_occupants: 100,
          lobby: false,
          password: "",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // If room is booked by the same user, return positive with booking settings
    if (userRecord && roomBooking.userId === userRecord.id) {
      logger.info(`Room ${roomName} is booked by the same user ${email}`);
      return new Response(
        JSON.stringify({
          max_occupants: roomBooking.maxOccupants,
          lobby: roomBooking.lobbyEnabled,
          password: roomBooking.meetingPassword || "",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Room is booked by someone else, return negative
    logger.info(`Room ${roomName} is booked by another user`);
    return new Response(
      JSON.stringify({ error: "Room is already booked by another user" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    logger.error(e, "Error handling booking:");
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


/**
 * POST handler to create a new booking
 * Returns the booking object if successful
 * Validates the bearer token using KeycloakClient.validateToken
 * Gets the user data using drizzle. If the user has free booking slots
 * If the requested room name is not already booked (check booked rooms table)
 * Create a new booking in the table, associate with this user
 * Update the user's booking slots
 * 
 * Request body should contain:
 * - roomName: string
 * - password?: string (optional, defaults to none)
 * - lobby?: boolean (optional, defaults to false)
 * - maxOccupants?: number (optional, defaults to 100, limited to max 100)
 * - endDate?: string (optional, defaults to one month from now)
 * 
 * Note: Email is extracted from the JWT token, not from request body
 */
const PostWorkerHandler: APIRoute = async ({ request, locals }) => {
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

    // Parse the request body
    interface CreateBookingRequestBody {
      roomName: string;
      password?: string;
      lobby?: boolean;
      maxOccupants?: number;
      endDate?: string;
    }

    let requestBody: CreateBookingRequestBody;
    try {
      requestBody = (await request.json()) as CreateBookingRequestBody;
    } catch (e) {
      logger.error(e, "Invalid JSON in request body:");
      return new Response(
        JSON.stringify({
          error: "Invalid JSON in request body",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { roomName, password, lobby, maxOccupants, endDate } = requestBody;

    // Validate required fields
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

    // Validate maxOccupants if provided
    const validatedMaxOccupants = maxOccupants ? Math.min(maxOccupants, 100) : 100;
    const validatedLobby = lobby ?? false;
    const validatedPassword = password || null;

    // Set default end date to one month from now if not provided
    const defaultEndDate = new Date();
    defaultEndDate.setMonth(defaultEndDate.getMonth() + 1);
    const validatedEndDate = endDate ? new Date(endDate) : defaultEndDate;

    logger.info(
      `Creating booking for room: ${roomName}, email: ${email}`
    );

    // Create database connection
    const db = createDb();

    // Start transaction-like operations
    try {
      // Get user and their booking count in a single query using LEFT JOIN and COUNT
      const userWithBookingCount = await db
        .select({
          // User fields
          userId: users.id,
          userEmail: users.email,
          isActiveHost: users.isActiveHost,
          maxBookings: users.maxBookings,
          totalHostMinutes: users.totalHostMinutes,
          userCreatedAt: users.createdAt,
          userUpdatedAt: users.updatedAt,
          // Booking count
          bookingCount: sql<number>`count(${bookedRooms.id})`,
        })
        .from(users)
        .leftJoin(bookedRooms, eq(users.id, bookedRooms.userId))
        .where(eq(users.email, email))
        .groupBy(users.id);

      if (userWithBookingCount.length === 0) {
        logger.error(`User not found: ${email}`);
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      const userData = userWithBookingCount[0];
      const currentBookingCount = Number(userData.bookingCount);

      // Check if user has available booking slots
      if (currentBookingCount >= userData.maxBookings) {
        logger.error(`User ${email} has reached maximum booking limit`);
        return new Response(
          JSON.stringify({ error: "User has reached maximum booking limit" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Attempt to create the new booking - let database constraint handle duplicate room names
      const [newBooking] = await db
        .insert(bookedRooms)
        .values({
          roomName,
          userId: userData.userId,
          lobbyEnabled: validatedLobby,
          meetingPassword: validatedPassword,
          maxOccupants: validatedMaxOccupants,
          endDate: validatedEndDate,
        })
        .returning();

      logger.info(`Successfully created booking for room: ${roomName}, user: ${email}`);

      // Return the created booking
      return new Response(
        JSON.stringify({
          id: newBooking.id,
          roomName: newBooking.roomName,
          userId: newBooking.userId,
          lobbyEnabled: newBooking.lobbyEnabled,
          meetingPassword: newBooking.meetingPassword,
          maxOccupants: newBooking.maxOccupants,
          endDate: newBooking.endDate,
          createdAt: newBooking.createdAt,
          updatedAt: newBooking.updatedAt,
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );

    } catch (dbError: any) {
      logger.error(dbError, "Database error creating booking:");

      // Check if it's a unique constraint violation (room name already exists)
      if (dbError.code === '23505' && dbError.constraint === 'booked_rooms_room_name_key') {
        return new Response(
          JSON.stringify({ error: "Room is already booked" }),
          {
            status: 409,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to create booking" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

  } catch (e) {
    logger.error(e, "Error handling booking creation:");
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * DELETE handler to remove an existing booking
 * Validates the bearer token using KeycloakClient.validateToken
 * Gets the user data using drizzle and checks if they own the booking
 * Deletes the booking if the user is the owner
 * 
 * Request body should contain:
 * - roomName: string
 * 
 * Note: Email is extracted from the JWT token, not from request body
 */
const DeleteWorkerHandler: APIRoute = async ({ request, locals }) => {
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

    // Parse the request body
    interface DeleteBookingRequestBody {
      roomName: string;
    }

    let requestBody: DeleteBookingRequestBody;
    try {
      requestBody = (await request.json()) as DeleteBookingRequestBody;
    } catch (e) {
      logger.error(e, "Invalid JSON in request body:");
      return new Response(
        JSON.stringify({
          error: "Invalid JSON in request body",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { roomName } = requestBody;

    // Validate required fields
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

    logger.info(
      `Deleting booking for room: ${roomName}, email: ${email}`
    );

    // Create database connection
    const db = createDb();

    try {
      // Get user and check if they own the booking
      const userAndBooking = await db
        .select({
          userId: users.id,
          userEmail: users.email,
          bookingId: bookedRooms.id,
          bookingRoomName: bookedRooms.roomName,
          bookingUserId: bookedRooms.userId,
        })
        .from(users)
        .leftJoin(bookedRooms, eq(bookedRooms.roomName, roomName))
        .where(eq(users.email, email))
        .limit(1);

      if (userAndBooking.length === 0) {
        logger.error(`User not found: ${email}`);
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      const row = userAndBooking[0];

      // Check if the booking exists
      if (!row.bookingId) {
        logger.error(`Booking not found for room: ${roomName}`);
        return new Response(JSON.stringify({ error: "Booking not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Check if the user owns the booking
      if (row.bookingUserId !== row.userId) {
        logger.error(`User ${email} does not own booking for room: ${roomName}`);
        return new Response(JSON.stringify({ error: "You don't have permission to delete this booking" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Delete the booking
      await db
        .delete(bookedRooms)
        .where(eq(bookedRooms.id, row.bookingId));

      logger.info(`Successfully deleted booking for room: ${roomName}, user: ${email}`);

      // Return success response
      return new Response(
        JSON.stringify({
          message: "Booking deleted successfully",
          roomName: roomName,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );

    } catch (dbError: any) {
      logger.error(dbError, "Database error deleting booking:");
      return new Response(
        JSON.stringify({ error: "Failed to delete booking" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

  } catch (e) {
    logger.error(e, "Error handling booking deletion:");
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};


