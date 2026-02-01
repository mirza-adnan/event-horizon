import { Request, Response } from "express";
import db from "../db";
import { usersTable, registrationsTable, eventsTable } from "../db/schema";
import { eq, and, gte, lt, desc, asc } from "drizzle-orm";

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const [user] = await db
            .select({
                id: usersTable.id,
                firstName: usersTable.firstName,
                lastName: usersTable.lastName,
                email: usersTable.email,
                avatarUrl: usersTable.avatarUrl,
                createdAt: usersTable.createdAt,
            })
            .from(usersTable)
            .where(eq(usersTable.id, id));

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const now = new Date();

        // Get registrations with event details
        const registrations = await db
            .select({
                registrationId: registrationsTable.id,
                status: registrationsTable.status,
                event: {
                    id: eventsTable.id,
                    title: eventsTable.title,
                    bannerUrl: eventsTable.bannerUrl,
                    startDate: eventsTable.startDate,
                    city: eventsTable.city,
                    isOnline: eventsTable.isOnline,
                }
            })
            .from(registrationsTable)
            .innerJoin(eventsTable, eq(registrationsTable.eventId, eventsTable.id))
            .where(eq(registrationsTable.userId, id));

        const upcomingEvents = registrations
            .filter(r => new Date(r.event.startDate) >= now && r.status === 'approved')
            .map(r => r.event)
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        const pastEvents = registrations
            .filter(r => new Date(r.event.startDate) < now)
            .map(r => r.event)
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

        res.json({
            user,
            upcomingEvents,
            pastEvents,
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
