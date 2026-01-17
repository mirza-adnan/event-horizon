CREATE TABLE "external_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"start_date" date NOT NULL,
	"image_url" text,
	"location" text,
	"is_online" boolean DEFAULT false NOT NULL,
	"link" text NOT NULL,
	"categories" json DEFAULT '[]'::json,
	"clicks" integer DEFAULT 0 NOT NULL,
	"hovers" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "external_events_slug_unique" UNIQUE("slug")
);
