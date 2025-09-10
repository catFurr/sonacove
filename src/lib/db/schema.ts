import {
  pgSchema,
  serial,
  boolean,
  integer,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Define the custom 'sonacove' schema
const sonacoveSchema = pgSchema("sonacove");

// Users table
export const users = sonacoveSchema.table("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  isActiveHost: boolean("is_active_host").notNull().default(false),
  maxBookings: integer("max_bookings").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  totalHostMinutes: integer("total_host_minutes").notNull().default(0),
  hostSessionStartTime: timestamp("host_session_start_time", { withTimezone: true }),
  });


// Booked rooms table
export const bookedRooms = sonacoveSchema.table("booked_rooms", {
  id: serial("id").primaryKey(),
  roomName: varchar("room_name", { length: 255 }).notNull().unique(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  lobbyEnabled: boolean("lobby_enabled").notNull().default(false),
  meetingPassword: varchar("meeting_password", { length: 255 }),
  maxOccupants: integer("max_occupants").notNull().default(100),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  endDate: timestamp("end_date", { withTimezone: true }),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  bookedRooms: many(bookedRooms),
}));

export const bookedRoomsRelations = relations(bookedRooms, ({ one }) => ({
  user: one(users, {
    fields: [bookedRooms.userId],
    references: [users.id],
  }),
}));

// Export schema object for drizzle client
export const schema = {
  users,
  bookedRooms,
  usersRelations,
  bookedRoomsRelations,
};
