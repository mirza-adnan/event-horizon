import { Request, Response } from "express";
import { and, eq, or, sql } from "drizzle-orm";
import db from "../db";
import { bookmarksTable, eventsTable, externalEventsTable } from "../db/schema";
import { updateUserInterest } from "../utils/user-interests";

export const toggleBookmark = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { eventId } = req.body;

        if (!eventId) {
            return res.status(400).json({ message: "eventId is required" });
        }

        // Check if bookmark already exists
        const [existing] = await db
            .select()
            .from(bookmarksTable)
            .where(and(eq(bookmarksTable.userId, userId), eq(bookmarksTable.eventId, eventId)));

        if (existing) {
            // Remove bookmark
            await db.delete(bookmarksTable).where(eq(bookmarksTable.id, existing.id));
            return res.status(200).json({ message: "Bookmark removed", status: "removed" });
        } else {
            // Add bookmark
            await db.insert(bookmarksTable).values({
                userId,
                eventId
            });

            // --- Interest Tracking (Medium Weight) ---
            try {
                // Fetch event details
                const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, eventId));
                
                // Fetch categories
                // (We could import eventCategoriesTable, but let's just stick to title/desc for bookmark speed)
                // or do a quick join if strictly needed. 
                // Let's keep it reasonably fast: Title + Desc is good.
                
                if (event) {
                    const titlePart = (event.title + " ").repeat(2);
                    const textToEmbed = `${titlePart}\n${event.description || ""}`;
                    
                    // Weight: 0.3 (Medium)
                    await updateUserInterest(userId, textToEmbed, 0.3, "BOOKMARK");
                }
            } catch (e) {
                console.error("Failed to track bookmark interest", e);
            }
            // -----------------------------------------

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
                }
            })
            .from(bookmarksTable)
            .innerJoin(eventsTable, eq(bookmarksTable.eventId, eventsTable.id))
            .where(eq(bookmarksTable.userId, userId));

        res.status(200).json({ bookmarks });
    } catch (error) {
        console.error("Get bookmarks error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
