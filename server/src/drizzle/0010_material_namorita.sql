ALTER TABLE "events" ADD COLUMN "is_online" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "has_multiple_segments" boolean DEFAULT true NOT NULL;