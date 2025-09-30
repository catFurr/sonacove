CREATE TABLE "sonacove"."booked_rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_name" varchar(255) NOT NULL,
	"user_id" integer NOT NULL,
	"lobby_enabled" boolean DEFAULT false NOT NULL,
	"meeting_password" varchar(255),
	"max_occupants" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"end_date" timestamp with time zone,
	CONSTRAINT "booked_rooms_room_name_unique" UNIQUE("room_name")
);
--> statement-breakpoint
CREATE TABLE "sonacove"."users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"is_active_host" boolean DEFAULT false NOT NULL,
	"max_bookings" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "sonacove"."booked_rooms" ADD CONSTRAINT "booked_rooms_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "sonacove"."users"("id") ON DELETE no action ON UPDATE no action;