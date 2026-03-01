import { Request, Response } from "express";
import db from "../db";
import { usersTable, registrationsTable, eventsTable, segmentsTable } from "../db/schema";
import { eq, and, gte, lt, desc, asc, or, ilike } from "drizzle-orm";

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
                bio: usersTable.bio,
                skills: usersTable.skills,
                createdAt: usersTable.createdAt,
            })
            .from(usersTable)
            .where(eq(usersTable.id, id));

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const now = new Date();

        // Get registrations with event and segment details
        // We left join segments because segmentId might be null (whole event registration)
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
                },
                segment: {
                    id: segmentsTable.id,
                    name: segmentsTable.name,
                }
            })
            .from(registrationsTable)
            .innerJoin(eventsTable, eq(registrationsTable.eventId, eventsTable.id))
            .leftJoin(segmentsTable, eq(registrationsTable.segmentId, segmentsTable.id))
            .where(eq(registrationsTable.userId, id));

        const formatEvent = (r: any) => {
            let title = r.event.title;
            if (r.segment && r.segment.id) {
                title = `${r.segment.name} | ${r.event.title}`;
            }
            return {
                ...r.event,
                title,
            };
        };

        const upcomingEvents = registrations
            .filter(r => new Date(r.event.startDate) >= now && r.status === 'approved')
            .map(formatEvent)
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        const pastEvents = registrations
            .filter(r => new Date(r.event.startDate) < now)
            .map(formatEvent)
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

export const searchUsers = async (req: Request, res: Response) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== "string") {
            return res.json({ users: [] });
        }

        const users = await db
            .select({
                id: usersTable.id,
                firstName: usersTable.firstName,
                lastName: usersTable.lastName,
                avatarUrl: usersTable.avatarUrl,
                email: usersTable.email,
            })
            .from(usersTable)
            .where(
                or(
                    ilike(usersTable.firstName, `%${q}%`),
                    ilike(usersTable.lastName, `%${q}%`),
                    ilike(usersTable.email, `%${q}%`)
                )
            )
            .limit(20);
        res.json({ users });
    } catch (error) {
        console.error("Search users error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        const { id } = (req as any).user; // Assuming user info is available from auth middleware
        const { firstName, lastName, bio, skills } = req.body;

        if (!firstName) {
            return res.status(400).json({ message: "First name is required" });
        }

        const updateData: any = {
            firstName,
            lastName,
            bio,
            skills,
        };

        if (skills) {
            const { generateEmbedding } = await import("../utils/embeddings");
            updateData.skillsEmbedding = await generateEmbedding(skills);
        }

        await db
            .update(usersTable)
            .set(updateData)
            .where(eq(usersTable.id, id));

        res.json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
