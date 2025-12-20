import {
    InferInsertModel,
    InferSelectModel,
    relations,
    sql,
} from "drizzle-orm";
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
    check,
    PgTableExtraConfig,
    primaryKey,
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

<<<<<<< HEAD
export const eventsTable = pgTable(
    "events",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        title: text("title").notNull(),
        description: text("description").notNull(),
        location: text("location").notNull(),
        city: text("city").notNull(),
        country: text("country").notNull().default("Bangladesh"),
        startDate: date("start_date", {
            mode: "date",
        }).notNull(),
        endDate: date("end_date", {
            mode: "date",
        }),
        registrationDeadline: timestamp("registration_deadline", {
            precision: 3,
            withTimezone: true,
        }),
        isOnline: boolean("is_online").notNull().default(false),
        status: eventStatusEnum("status").notNull().default("draft"),
        bannerUrl: text("banner_url"),
        organizerId: uuid("organizer_id")
            .notNull()
            .references(() => orgsTable.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        endDateCheck: check(
            "end_date_check",
            sql`${table.endDate} IS NULL OR ${table.endDate} >= ${table.startDate}`
        ),
    })
);

export const categoriesTable = pgTable("categories", {
    name: varchar("name", { length: 100 }).primaryKey(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventCategoriesTable = pgTable(
    "event_categories",
    {
        eventId: uuid("event_id")
            .notNull()
            .references(() => eventsTable.id, { onDelete: "cascade" }),
        categoryName: text("category_name")
            .notNull()
            .references(() => categoriesTable.name, { onDelete: "cascade" }),
        assignedAt: timestamp("assigned_at").defaultNow().notNull(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.eventId, table.categoryName] }),
    })
);

export const eventsRelations = relations(eventsTable, ({ one, many }) => ({
    organizer: one(orgsTable, {
        fields: [eventsTable.organizerId],
        references: [orgsTable.id],
    }),
    eventCategories: many(eventCategoriesTable),
}));

export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
    eventCategories: many(eventCategoriesTable),
}));

export const eventCategoriesRelations = relations(
    eventCategoriesTable,
    ({ one }) => ({
        event: one(eventsTable, {
            fields: [eventCategoriesTable.eventId],
            references: [eventsTable.id],
        }),
        category: one(categoriesTable, {
            fields: [eventCategoriesTable.categoryName],
            references: [categoriesTable.name],
        }),
    })
);


export type User = InferSelectModel<typeof usersTable>;
export type NewUser = InferInsertModel<typeof usersTable>;

export type Organizer = InferSelectModel<typeof orgsTable>;
export type NewOrganizer = InferInsertModel<typeof orgsTable>;

export type Event = InferSelectModel<typeof eventsTable>;
export type NewEvent = InferInsertModel<typeof eventsTable>;

export type Category = InferSelectModel<typeof categoriesTable>;
export type NewCategory = InferInsertModel<typeof categoriesTable>;

