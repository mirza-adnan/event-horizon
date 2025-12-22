ALTER TABLE "events" DROP CONSTRAINT "end_date_check";--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "slug" varchar(100);