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
    json,
    customType,
} from "drizzle-orm/pg-core";

const vector = customType<{ data: number[], driverData: string }>({
    dataType() {
        return "vector(384)";
    },
    toDriver(value: number[]): string {
        return JSON.stringify(value);
    },
    fromDriver(value: string): number[] {
        return JSON.parse(value);
    },
});

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
    verified: boolean("verified").default(false).notNull(),
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
    title: text("title").notNull(),
    description: text("description").notNull(),
    address: text("location"),
    city: text("city"),
    country: text("country").notNull().default("Bangladesh"),
    startDate: date("start_date", {
        mode: "date",
    }).notNull(),
    endDate: date("end_date", {
        mode: "date",
    }),
    status: eventStatusEnum("status").notNull().default("draft"),
    bannerUrl: text("banner_url"),
    isOnline: boolean("is_online").default(false).notNull(),
    hasMultipleSegments: boolean("has_multiple_segments")
        .default(true)
        .notNull(),
    organizerId: uuid("organizer_id")
        .notNull()
        .references(() => orgsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    embedding: vector("embedding"),
});

export const segmentsTable = pgTable("segments", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    startTime: timestamp("start_time", {
        withTimezone: true,
        mode: "date",
    }).notNull(),
    endTime: timestamp("end_time", {
        withTimezone: true,
        mode: "date",
    }),
    isTeamSegment: boolean("is_team_segment").notNull().default(false),
    isOnline: boolean("is_online").notNull().default(false),
    registrationDeadline: timestamp("registration_deadline", {
        withTimezone: true,
        mode: "date",
    }),
    minTeamSize: integer("min_team_size"),
    maxTeamSize: integer("max_team_size"),
    eventId: uuid("event_id")
        .notNull()
        .references(() => eventsTable.id, { onDelete: "cascade" }),
    categoryId: varchar("category_id", { length: 100 }).references(
        () => categoriesTable.name,
        { onDelete: "set null" }
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export const categoriesTable = pgTable("categories", {
    name: varchar("name", { length: 100 }).primaryKey(),
    slug: varchar("slug", { length: 100 }),
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
    segments: many(segmentsTable),
}));

export const segmentsRelations = relations(segmentsTable, ({ one, many }) => ({
    event: one(eventsTable, {
        fields: [segmentsTable.eventId],
        references: [eventsTable.id],
    }),
    category: one(categoriesTable, {
        fields: [segmentsTable.categoryId],
        references: [categoriesTable.name],
    }),
}));

export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
    eventCategories: many(eventCategoriesTable),
    segments: many(segmentsTable),
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

export type Segment = InferSelectModel<typeof segmentsTable>;
export type NewSegment = InferInsertModel<typeof segmentsTable>;

export type Category = InferSelectModel<typeof categoriesTable>;
export type NewCategory = InferInsertModel<typeof categoriesTable>;

export const externalEventsTable = pgTable("external_events", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").unique().notNull(),
    description: text("description"),
    startDate: date("start_date", { mode: "date" }).notNull(),
    imageUrl: text("image_url"),
    location: text("location"),
    isOnline: boolean("is_online").default(false).notNull(),
    link: text("link").notNull(),
    categories: json("categories").$type<string[]>().default([]),
    clicks: integer("clicks").default(0).notNull(),
    hovers: integer("hovers").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export type ExternalEvent = InferSelectModel<typeof externalEventsTable>;
export type NewExternalEvent = InferInsertModel<typeof externalEventsTable>;

