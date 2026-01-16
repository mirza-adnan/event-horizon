CREATE TABLE "scraped_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"url" text NOT NULL,
	"source" text NOT NULL,
	"image_url" text,
	"start_date" timestamp with time zone,
	"scraped_at" timestamp with time zone DEFAULT now() NOT NULL
);
