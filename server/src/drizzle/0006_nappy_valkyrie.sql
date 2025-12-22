CREATE TABLE "segments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"capacity" integer DEFAULT 0 NOT NULL,
	"is_team_segment" boolean DEFAULT false NOT NULL,
	"is_online" boolean DEFAULT false NOT NULL,
	"registration_deadline" timestamp with time zone,
	"event_id" uuid NOT NULL,
	"category_id" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "segments" ADD CONSTRAINT "segments_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "segments" ADD CONSTRAINT "segments_category_id_categories_name_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("name") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "registration_deadline";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "is_online";