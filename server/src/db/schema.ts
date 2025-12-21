import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
    date,
    integer,
    numeric,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").unique().notNull(),
    username: text("username").unique().notNull(),
    passwordHash: text("password_hash").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name"),
    bio: text("bio"),
    phone: text("phone").unique(),
    avatarUrl: text("avatar_url"),
    dateOfBirth: date("date_of_birth").notNull(),
    createdAt: timestamp("created_at", {
        withTimezone: true,
    })
        .notNull()
        .defaultNow(),
});

export const orgStatusEnum = pgEnum("organizer_status", [
    "pending",
    "verified",
    "rejected",
]);

export const orgsTable = pgTable("organizers", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").unique().notNull(),
    email: text("email").unique().notNull(),
    passwordHash: text("password_hash").notNull(),
    phone: text("phone").unique().notNull(),
    address: text("address"),
    city: text("city"),
    country: text("country"),
    website: text("website"),
    description: text("description"),
    proofUrl: text("proofUrl"),
    status: orgStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", {
        withTimezone: true,
    })
        .notNull()
        .defaultNow(),
});

export type User = InferSelectModel<typeof usersTable>;
export type NewUser = InferInsertModel<typeof usersTable>;

export type Organizer = InferSelectModel<typeof orgsTable>;
export type NewOrganizer = InferInsertModel<typeof orgsTable>;

export const eventStatusEnum = pgEnum("event_status", [
    "draft",
    "published",
    "cancelled",
    "completed",
]);

export const eventCategoryEnum = pgEnum("event_category", [
    "music",
    "sports",
    "arts",
    "food",
    "tech",
    "business",
    "education",
    "charity",
    "other",
]);

export const eventsTable = pgTable("events", {
    id: uuid("id").primaryKey().defaultRandom(),
    organizerId: uuid("organizer_id")
        .notNull()
        .references(() => orgsTable.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    category: eventCategoryEnum("category").notNull().default("other"),
    venue: text("venue").notNull(),
    address: text("address").notNull(),
    city: text("city").notNull(),
    country: text("country").notNull(),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    coverImageUrl: text("cover_image_url"),
    ticketPrice: numeric("ticket_price", { precision: 10, scale: 2 }),
    maxAttendees: integer("max_attendees"),
    status: eventStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export type Event = InferSelectModel<typeof eventsTable>;
export type NewEvent = InferInsertModel<typeof eventsTable>;
