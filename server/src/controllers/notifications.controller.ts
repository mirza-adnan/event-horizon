import { Request, Response } from "express";
import db from "../db";
import { notificationsTable } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const notifications = await db
            .select()
            .from(notificationsTable)
            .where(eq(notificationsTable.userId, userId))
            .orderBy(desc(notificationsTable.createdAt)); // Newest first

        res.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
};

export const getUnreadCount = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const notifications = await db
            .select()
            .from(notificationsTable)
            .where(
                and(
                    eq(notificationsTable.userId, userId),
                    eq(notificationsTable.isRead, false)
                )
            );

        res.json({ count: notifications.length });
    } catch (error) {
        console.error("Error fetching unread count:", error);
        res.status(500).json({ message: "Failed to fetch unread count" });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        await db
            .update(notificationsTable)
            .set({ isRead: true })
            .where(
                and(
                    eq(notificationsTable.id, id),
                    eq(notificationsTable.userId, userId)
                )
            );

        res.json({ message: "Notification marked as read" });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Failed to mark notification as read" });
    }
};

export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        await db
            .update(notificationsTable)
            .set({ isRead: true })
            .where(eq(notificationsTable.userId, userId));

        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
};
