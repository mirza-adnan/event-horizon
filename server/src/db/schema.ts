import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
    date,
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
