CREATE TYPE "public"."organizer_status" AS ENUM('pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TABLE "organizers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"phone" text NOT NULL,
	"address" text,
	"city" text,
	"country" text,
	"website" text,
	"description" text,
	"proof_of_existence_url" text,
	"status" "organizer_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizers_name_unique" UNIQUE("name"),
	CONSTRAINT "organizers_email_unique" UNIQUE("email"),
	CONSTRAINT "organizers_phone_unique" UNIQUE("phone")
);
