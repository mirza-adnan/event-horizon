CREATE TYPE "public"."event_status" AS ENUM('draft', 'published', 'cancelled', 'completed');--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"slug" varchar(255) NOT NULL,
	"location" text NOT NULL,
	"city" text NOT NULL,
	"country" text DEFAULT 'Bangladesh' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"registration_deadline" timestamp (3) with time zone,
	"is_online" boolean DEFAULT false NOT NULL,
	"status" "event_status" DEFAULT 'draft' NOT NULL,
	"banner_url" text,
	"organizer_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "end_date_check" CHECK ("events"."end_date" IS NULL OR "events"."end_date" >= "events"."start_date")
);
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_organizers_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."organizers"("id") ON DELETE cascade ON UPDATE no action;