import { Request, Response } from "express";
import { eq, and, inArray, desc } from "drizzle-orm";
import db from "../db";
import {
    announcementsTable,
    eventsTable,
    registrationsTable,
    usersTable,
    notificationsTable,
    teamMembersTable,
    NewAnnouncement,
    NewNotification
} from "../db/schema";

// Create Announcement
export const createAnnouncement = async (req: Request, res: Response) => {
    try {
        const organizerId = (req as any).organizer?.id;
        if (!organizerId) return res.status(401).json({ message: "Unauthorized" });

        const { eventId, segmentId, title, content } = req.body;

        if (!eventId || !title || !content) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Verify ownership
        const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, eventId));
        if (!event) return res.status(404).json({ message: "Event not found" });
        if (event.organizerId !== organizerId) return res.status(403).json({ message: "Forbidden" });

        let imageUrl: string | undefined;
        if (req.file) {
            imageUrl = req.file.path.replace(process.cwd(), "").replace(/\\/g, "/");
        }

        // Create Announcement
        const [announcement] = await db.insert(announcementsTable).values({
            eventId,
            segmentId: segmentId || null,
            title,
            content,
            imageUrl
        } as NewAnnouncement).returning();

        // ---------------- Notification Trigger ----------------
        const recipientUserIds = new Set<string>();

        // 1. Fetch relevant registrations
        // If segmentId is provided, notify only that segment's registrants?
        // OR global registrants too? Usually segment-specific announcements are for segment attendees.
        
        const conditions = [eq(registrationsTable.eventId, eventId)];
        if (segmentId) {
            conditions.push(eq(registrationsTable.segmentId, segmentId));
        }
        // If it's a Global Announcement (no segmentId), it should go to EVERYONE registered for ANY segment?
        // Or just the main event? (registrations usually have segmentId).
        // If segmentId is null in announcement, we likely want to notify ALL registrants of the event.
        
        const regs = await db
            .select({
                userId: registrationsTable.userId,
                teamId: registrationsTable.teamId
            })
            .from(registrationsTable)
            .where(
                segmentId 
                    ? and(...conditions)
                    : eq(registrationsTable.eventId, eventId)
            );

        const teamIds: string[] = [];

        regs.forEach(reg => {
            if (reg.userId) recipientUserIds.add(reg.userId);
            if (reg.teamId) teamIds.push(reg.teamId);
        });

        // 2. Fetch team members if needed
        if (teamIds.length > 0) {
            const members = await db
                .select({ userId: teamMembersTable.userId })
                .from(teamMembersTable)
                .where(inArray(teamMembersTable.teamId, teamIds));
            
            members.forEach(m => recipientUserIds.add(m.userId));
        }

        // 3. Create Notifications
        if (recipientUserIds.size > 0) {
            const notificationLink = `/events/${eventId}`; // Link to event page
            const message = `New Announcement in ${event.title}: ${title}`;

            const notificationsToInsert = Array.from(recipientUserIds).map(uid => ({
                userId: uid,
                type: "announcement",
                message: message,
                link: notificationLink,
                isRead: false
            } as NewNotification));

            // Batch insert
            if (notificationsToInsert.length > 0) {
                 await db.insert(notificationsTable).values(notificationsToInsert);
            }
        }

        res.status(201).json({ 
            message: "Announcement posted and notifications sent", 
            announcement,
            recipientCount: recipientUserIds.size 
        });

    } catch (error) {
        console.error("Create announcement error", error);
        res.status(500).json({ message: "Failed to create announcement" });
    }
};

// Get Announcements
export const getAnnouncements = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        const { segmentId } = req.query;

        // Fetch announcements for event
        // If segmentId provided, fetch Global (null) AND Segment Specific
        // If no segmentId, fetch ALL? Or just Global?
        // Usually feed shows everything relevant.
        
        const conditions = [eq(announcementsTable.eventId, eventId)];
        
        // If I am a user viewing a specific segment tab, I want global + segment.
        // If I am organizer viewing "All", I want all.
        
        if (segmentId) {
             // Fetch global OR matching segment
             // Drizzle OR syntax
             // or(eq(segmentId, null), eq(segmentId, req.query.segmentId))
             // But actually organizers might want to see filtered view.
             
             // Let's just return all for the event for now, and let frontend filter?
             // Or filter if requested.
        }

        const announcements = await db
            .select()
            .from(announcementsTable)
            .where(eq(announcementsTable.eventId, eventId))
            .orderBy(desc(announcementsTable.createdAt));

        res.json({ announcements });

    } catch (error) {
         console.error("Get announcements error", error);
        res.status(500).json({ message: "Failed to fetch announcements" });
    }
};
