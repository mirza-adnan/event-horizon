import { Request, Response } from "express";
import { and, eq, or, sql } from "drizzle-orm";
import db from "../db";
import { bookmarksTable, eventsTable, externalEventsTable } from "../db/schema";

export const toggleBookmark = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { eventId, externalEventId } = req.body;

        if (!eventId && !externalEventId) {
            return res.status(400).json({ message: "Either eventId or externalEventId is required" });
        }

        // Check if bookmark already exists
        const whereClause = eventId 
            ? and(eq(bookmarksTable.userId, userId), eq(bookmarksTable.eventId, eventId))
            : and(eq(bookmarksTable.userId, userId), eq(bookmarksTable.externalEventId, externalEventId));

        const [existing] = await db
            .select()
            .from(bookmarksTable)
            .where(whereClause);

        if (existing) {
            // Remove bookmark
            await db.delete(bookmarksTable).where(eq(bookmarksTable.id, existing.id));
            return res.status(200).json({ message: "Bookmark removed", status: "removed" });
        } else {
            // Add bookmark
            await db.insert(bookmarksTable).values({
                userId,
                eventId: eventId || null,
                externalEventId: externalEventId || null,
            });
            return res.status(201).json({ message: "Bookmark added", status: "added" });
        }
    } catch (error) {
        console.error("Toggle bookmark error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getMyBookmarks = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        const bookmarks = await db
            .select({
                id: bookmarksTable.id,
                createdAt: bookmarksTable.createdAt,
                event: {
                    id: eventsTable.id,
                    title: eventsTable.title,
                    description: eventsTable.description,
                    bannerUrl: eventsTable.bannerUrl,
                    startDate: eventsTable.startDate,
                    city: eventsTable.city,
                    isOnline: eventsTable.isOnline,
                },
                externalEvent: {
                    id: externalEventsTable.id,
                    title: externalEventsTable.title,
                    description: externalEventsTable.description,
                    imageUrl: externalEventsTable.imageUrl,
                    startDate: externalEventsTable.startDate,
                    location: externalEventsTable.location,
                    isOnline: externalEventsTable.isOnline,
                    link: externalEventsTable.link,
                    categories: externalEventsTable.categories,
                }
            })
            .from(bookmarksTable)
            .leftJoin(eventsTable, eq(bookmarksTable.eventId, eventsTable.id))
            .leftJoin(externalEventsTable, eq(bookmarksTable.externalEventId, externalEventsTable.id))
            .where(eq(bookmarksTable.userId, userId));

        res.status(200).json({ bookmarks });
    } catch (error) {
        console.error("Get bookmarks error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
