import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { date, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

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
        mode: "date",
        withTimezone: true,
    })
        .notNull()
        .defaultNow(),
});

export type User = InferSelectModel<typeof usersTable>;
export type NewUser = InferInsertModel<typeof usersTable>;
