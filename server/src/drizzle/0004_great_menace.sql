CREATE TABLE "categories" (
	"name" varchar(100) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_categories" (
	"event_id" uuid NOT NULL,
	"category_name" text NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "event_categories_event_id_category_name_pk" PRIMARY KEY("event_id","category_name")
);
--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "title" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "event_categories" ADD CONSTRAINT "event_categories_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_categories" ADD CONSTRAINT "event_categories_category_name_categories_name_fk" FOREIGN KEY ("category_name") REFERENCES "public"."categories"("name") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "slug";