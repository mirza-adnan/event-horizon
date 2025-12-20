import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
    date,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
    integer,
    boolean,
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

export const eventStatusEnum = pgEnum("event_status", [
  "draft",
  "published",
  "cancelled",
  "completed",
]);

export const eventsTable = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  bannerUrl: text("banner_url"),
  organizerId: uuid("organizer_id")
    .notNull()
    .references(() => orgsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true, })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, })
    .notNull()
    .defaultNow(),
});

export const eventsSegmentsTable = pgTable("events_segments", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => eventsTable.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  startTime: timestamp("start_time", { withTimezone: true, }).notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(90),
  isOnline: boolean("is_online").notNull().default(false),
  location: text("location").notNull(),
  address: text("address"),
  city: text("city").notNull(),
  country: text("country").notNull(),
  maxAttendees: integer("max_attendees"),
  price: integer("price").default(0),
  currency: varchar("currency", { length: 3 }).notNull().default("BDT"),
  status: eventStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true, })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, })
    .notNull()
    .defaultNow(),
});

export type User = InferSelectModel<typeof usersTable>;
export type NewUser = InferInsertModel<typeof usersTable>;

export type Organizer = InferSelectModel<typeof orgsTable>;
export type NewOrganizer = InferInsertModel<typeof orgsTable>;

export type Event = InferSelectModel<typeof eventsTable>;
export type NewEvent = InferInsertModel<typeof eventsTable>;
