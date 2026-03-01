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
    real,
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

export const userStatusEnum = pgEnum("user_status", [
    "School",
    "High School",
    "University",
    "Graduate",
    "Other",
]);

export const usersTable = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").unique().notNull(),
    passwordHash: text("password_hash").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name"),
    bio: text("bio"),
    phone: text("phone").unique(),
    verified: boolean("verified").default(false).notNull(),
    verificationToken: text("verification_token"), // For email verification
    gender: text("gender").notNull().default("prefer_not_to_say"),
    status: userStatusEnum("status"),
    country: text("country"),

    avatarUrl: text("avatar_url"),
    dateOfBirth: date("date_of_birth").notNull(),
    createdAt: timestamp("created_at", {
        withTimezone: true,
    })
        .notNull()
        .defaultNow(),
    embedding: vector("embedding"),
    skills: text("skills"),
    skillsEmbedding: vector("skills_embedding"),
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
    registrationFee: integer("registration_fee").default(0).notNull(),
    latitude: real("latitude"),
    longitude: real("longitude"),
    constraints: json("constraints").$type<any[]>().default([]),
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
    registrationFee: integer("registration_fee").default(0).notNull(),
    bannerUrl: text("banner_url"),
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
    isRegistrationPaused: boolean("is_registration_paused").default(false).notNull(),
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

export const teamsTable = pgTable("teams", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    leaderId: uuid("leader_id")
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 10 }).unique().notNull(), // For joining via code if needed
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export const teamMembersTable = pgTable(
    "team_members",
    {
        teamId: uuid("team_id")
            .notNull()
            .references(() => teamsTable.id, { onDelete: "cascade" }),
        userId: uuid("user_id")
            .notNull()
            .references(() => usersTable.id, { onDelete: "cascade" }),
        role: text("role").notNull().default("member"), // 'leader', 'member'
        joinedAt: timestamp("joined_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.teamId, table.userId] }),
    })
);

export const teamInvitesTable = pgTable("team_invites", {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id")
        .notNull()
        .references(() => teamsTable.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    status: text("status").notNull().default("pending"), // pending, accepted, rejected
    invitedBy: uuid("invited_by")
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export const teamChatsTable = pgTable("team_chats", {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id")
        .notNull()
        .references(() => teamsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export const registrationStatusEnum = pgEnum("registration_status", [
    "payment_pending",
    "pending",
    "approved",
    "rejected",
    "waitlisted",
]);

export const registrationsTable = pgTable("registrations", {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
        .notNull()
        .references(() => eventsTable.id, { onDelete: "cascade" }),
    segmentId: uuid("segment_id").references(() => segmentsTable.id, {
        onDelete: "cascade",
    }), // Can be null if registering for whole event (if that's a thing) or specific segment
    userId: uuid("user_id").references(() => usersTable.id, {
        onDelete: "cascade",
    }), // Null if team registration? Or user registering solo
    teamId: uuid("team_id").references(() => teamsTable.id, {
        onDelete: "cascade",
    }), // Null if solo registration
    status: registrationStatusEnum("status").notNull().default("pending"),
    paymentStatus: text("payment_status").default("unpaid"), // paid, unpaid
    amount: integer("amount").default(0),
    data: json("data"), // Flexible field for form answers
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export const eventsRelations = relations(eventsTable, ({ one, many }) => ({
    organizer: one(orgsTable, {
        fields: [eventsTable.organizerId],
        references: [orgsTable.id],
    }),
    eventCategories: many(eventCategoriesTable),
    segments: many(segmentsTable),
    registrations: many(registrationsTable),
    announcements: many(announcementsTable),
}));

export const orgsRelations = relations(orgsTable, ({ many }) => ({
    events: many(eventsTable),
    subscribers: many(subscriptionsTable),
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
    registrations: many(registrationsTable),
}));

export const teamsRelations = relations(teamsTable, ({ one, many }) => ({
    leader: one(usersTable, {
        fields: [teamsTable.leaderId],
        references: [usersTable.id],
    }),
    members: many(teamMembersTable),
    invites: many(teamInvitesTable),
    chats: many(teamChatsTable),
    registrations: many(registrationsTable),
}));

export const teamMembersRelations = relations(teamMembersTable, ({ one }) => ({
    team: one(teamsTable, {
        fields: [teamMembersTable.teamId],
        references: [teamsTable.id],
    }),
    user: one(usersTable, {
        fields: [teamMembersTable.userId],
        references: [usersTable.id],
    }),
}));

export const usersRelations = relations(usersTable, ({ many }) => ({
    teamMemberships: many(teamMembersTable),
    registrations: many(registrationsTable),
    teamInvites: many(teamInvitesTable), // Invites sent by user? Or received? Schema says invitedBy.
    notifications: many(notificationsTable),
    subscriptions: many(subscriptionsTable),
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

export type Team = InferSelectModel<typeof teamsTable>;
export type NewTeam = InferInsertModel<typeof teamsTable>;

export type Registration = InferSelectModel<typeof registrationsTable>;
export type NewRegistration = InferInsertModel<typeof registrationsTable>;

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
    embedding: vector("embedding"),
    latitude: real("latitude"),
    longitude: real("longitude"),
});

export type ExternalEvent = InferSelectModel<typeof externalEventsTable>;
export type NewExternalEvent = InferInsertModel<typeof externalEventsTable>;

export const announcementsTable = pgTable("announcements", {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
        .notNull()
        .references(() => eventsTable.id, { onDelete: "cascade" }),
    segmentId: uuid("segment_id").references(() => segmentsTable.id, {
        onDelete: "cascade",
    }), // Nullable for global announcements
    title: text("title").notNull(),
    content: text("content").notNull(),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export const notificationsTable = pgTable("notifications", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // 'announcement', 'invite', etc.
    message: text("message").notNull(),
    link: text("link"),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export type Announcement = InferSelectModel<typeof announcementsTable>;
export type NewAnnouncement = InferInsertModel<typeof announcementsTable>;

export type Notification = InferSelectModel<typeof notificationsTable>;
export type NewNotification = InferInsertModel<typeof notificationsTable>;

export const subscriptionsTable = pgTable(
    "subscriptions",
    {
        userId: uuid("user_id")
            .notNull()
            .references(() => usersTable.id, { onDelete: "cascade" }),
        organizerId: uuid("organizer_id")
            .notNull()
            .references(() => orgsTable.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.userId, table.organizerId] }),
    })
);

export type Subscription = InferSelectModel<typeof subscriptionsTable>;
export type NewSubscription = InferInsertModel<typeof subscriptionsTable>;

export const bookmarksTable = pgTable(
    "bookmarks",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id")
            .notNull()
            .references(() => usersTable.id, { onDelete: "cascade" }),
        eventId: uuid("event_id")
            .notNull()
            .references(() => eventsTable.id, {
                onDelete: "cascade",
            }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    }
);

export const bookmarksRelations = relations(bookmarksTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [bookmarksTable.userId],
        references: [usersTable.id],
    }),
    event: one(eventsTable, {
        fields: [bookmarksTable.eventId],
        references: [eventsTable.id],
    }),
}));

export type Bookmark = InferSelectModel<typeof bookmarksTable>;
export type NewBookmark = InferInsertModel<typeof bookmarksTable>;

export const constraintRequestsTable = pgTable("constraint_requests", {
    id: uuid("id").primaryKey().defaultRandom(),
    organizerId: uuid("organizer_id")
        .references(() => orgsTable.id, { onDelete: "cascade" })
        .notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});
