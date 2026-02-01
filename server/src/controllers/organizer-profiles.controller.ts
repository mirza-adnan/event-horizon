import { Request, Response } from "express";
import db from "../db";
import { orgsTable, eventsTable, subscriptionsTable, notificationsTable, usersTable } from "../db/schema";
import { eq, and, sql, desc, asc, gt, lt, lte, gte } from "drizzle-orm";

export const getOrganizerProfile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const [organizer] = await db
            .select({
                id: orgsTable.id,
                name: orgsTable.name,
                description: orgsTable.description,
                website: orgsTable.website,
                city: orgsTable.city,
                country: orgsTable.country,
                createdAt: orgsTable.createdAt,
            })
            .from(orgsTable)
            .where(eq(orgsTable.id, id));

        if (!organizer) {
            return res.status(404).json({ message: "Organizer not found" });
        }

        const now = new Date();

        // Upcoming Events
        const upcomingEvents = await db
            .select()
            .from(eventsTable)
            .where(
                and(
                    eq(eventsTable.organizerId, id),
                    eq(eventsTable.status, "published"),
                    gte(eventsTable.startDate, now)
                )
            )
            .orderBy(asc(eventsTable.startDate));

        // Completed Events
        const completedEvents = await db
            .select()
            .from(eventsTable)
            .where(
                and(
                    eq(eventsTable.organizerId, id),
                    or(
                        eq(eventsTable.status, "completed"),
                        and(
                            eq(eventsTable.status, "published"),
                            lt(eventsTable.startDate, now)
                        )
                    )
                )
            )
            .orderBy(desc(eventsTable.startDate));

        // Subscriber count
        const [subscriberCount] = await db
            .select({ count: sql<number>`count(*)` })
            .from(subscriptionsTable)
            .where(eq(subscriptionsTable.organizerId, id));

        res.json({
            organizer: {
                ...organizer,
                subscriberCount: Number(subscriberCount?.count || 0),
            },
            upcomingEvents,
            completedEvents,
        });
    } catch (error) {
        console.error("Error fetching organizer profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const subscribeToOrganizer = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { organizerId } = req.params;

        if (!userId) {
            return res.status(401).json({ message: "Only users can subscribe" });
        }

        // Check if already subscribed
        const [existing] = await db
            .select()
            .from(subscriptionsTable)
            .where(
                and(
                    eq(subscriptionsTable.userId, userId),
                    eq(subscriptionsTable.organizerId, organizerId)
                )
            );

        if (existing) {
            return res.status(400).json({ message: "Already subscribed" });
        }

        await db.insert(subscriptionsTable).values({
            userId,
            organizerId,
        });

        res.json({ message: "Subscribed successfully" });
    } catch (error) {
        console.error("Error subscribing:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const unsubscribeFromOrganizer = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { organizerId } = req.params;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        await db
            .delete(subscriptionsTable)
            .where(
                and(
                    eq(subscriptionsTable.userId, userId),
                    eq(subscriptionsTable.organizerId, organizerId)
                )
            );

        res.json({ message: "Unsubscribed successfully" });
    } catch (error) {
        console.error("Error unsubscribing:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getSubscriptionStatus = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { organizerId } = req.params;

        if (!userId) {
            return res.json({ isSubscribed: false });
        }

        const [existing] = await db
            .select()
            .from(subscriptionsTable)
            .where(
                and(
                    eq(subscriptionsTable.userId, userId),
                    eq(subscriptionsTable.organizerId, organizerId)
                )
            );

        res.json({ isSubscribed: !!existing });
    } catch (error) {
        console.error("Error checking subscription status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
