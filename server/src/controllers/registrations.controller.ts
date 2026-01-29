import { Request, Response } from "express";
import { eq, and, or, inArray } from "drizzle-orm";
import db from "../db";
import {
    registrationsTable,
    eventsTable,
    segmentsTable,
    teamsTable,
    teamMembersTable,
    usersTable,
} from "../db/schema";
import { NewRegistration } from "../db/schema";

// Create Registration
export const createRegistration = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { eventId, segmentId, teamId, data } = req.body;

        if (!eventId || !segmentId) {
            return res.status(400).json({ message: "Event ID and Segment ID are required" });
        }

        // 1. Fetch Event and Segment details (to check requirements, fees, etc - placeholder for now)
        // const event = await db.select().from(eventsTable).where(eq(eventsTable.id, eventId));

        // 2. Determine Registration Type
        if (teamId) {
             // Team Registration Logic
             // Verify user is leader of the team
             const [membership] = await db
                .select()
                .from(teamMembersTable)
                .where(
                    and(
                        eq(teamMembersTable.teamId, teamId),
                        eq(teamMembersTable.userId, userId),
                        eq(teamMembersTable.role, 'leader')
                    )
                );
            
            if (!membership) {
                return res.status(403).json({ message: "Only team leaders can register the team" });
            }

            // Check duplicate registration
            const [existing] = await db
                .select()
                .from(registrationsTable)
                .where(
                    and(
                        eq(registrationsTable.eventId, eventId),
                        eq(registrationsTable.segmentId, segmentId),
                        eq(registrationsTable.teamId, teamId)
                    )
                );
            
            if (existing) {
                return res.status(409).json({ message: "Team is already registered for this segment" });
            }

            // Register
            const [reg] = await db.insert(registrationsTable).values({
                eventId,
                segmentId,
                teamId,
                userId, // Record who made the registration
                status: "pending", // Default
                paymentStatus: "unpaid",
                data
            } as NewRegistration).returning();

            return res.status(201).json({ message: "Team registration successful", registration: reg });

        } else {
            // Individual Registration Logic
             // Check duplicate
             const [existing] = await db
                .select()
                .from(registrationsTable)
                .where(
                    and(
                        eq(registrationsTable.eventId, eventId),
                        eq(registrationsTable.segmentId, segmentId),
                        eq(registrationsTable.userId, userId)
                    )
                );
            
            if (existing) {
                return res.status(409).json({ message: "You are already registered for this segment" });
            }

            // 3. Time Overlap Check
            const [newSegment] = await db.select().from(segmentsTable).where(eq(segmentsTable.id, segmentId));
            if (!newSegment) return res.status(404).json({ message: "Segment not found" });

            const existingRegs = await db
                .select({
                    startTime: segmentsTable.startTime,
                    endTime: segmentsTable.endTime,
                    name: segmentsTable.name
                })
                .from(registrationsTable)
                .innerJoin(segmentsTable, eq(registrationsTable.segmentId, segmentsTable.id))
                .where(
                    and(
                        eq(registrationsTable.eventId, eventId),
                        teamId ? eq(registrationsTable.teamId, teamId) : eq(registrationsTable.userId, userId)
                    )
                );

            for (const reg of existingRegs) {
                if (!newSegment.startTime || !newSegment.endTime || !reg.startTime || !reg.endTime) continue;

                const s1 = new Date(newSegment.startTime).getTime();
                const e1 = new Date(newSegment.endTime).getTime();
                const s2 = new Date(reg.startTime).getTime();
                const e2 = new Date(reg.endTime).getTime();

                // Conflict: (start1 < end2) && (end1 > start2)
                if (s1 < e2 && e1 > s2) {
                    return res.status(400).json({ 
                        message: `Time overlap with your registered segment: ${reg.name}` 
                    });
                }
            }

            const [reg] = await db.insert(registrationsTable).values({
                eventId,
                segmentId,
                userId,
                status: "pending",
                paymentStatus: "unpaid",
                data
            } as NewRegistration).returning();

            return res.status(201).json({ message: "Registration successful", registration: reg });
        }

    } catch (error) {
        console.error("Registration error:", error);
         res.status(500).json({ message: "Failed to register" });
    }
};

// Get My Registrations
export const getMyRegistrations = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        // Fetch individual registrations OR registrations where user's team is registered?
        // Simple: just fetch where userId matches (individual) OR where teamId matches user's teams?
        // Let's stick to simple userId check + query my teams and check their regs.
        
        // Actually, cleaner implementation:
        // 1. Get user's registrations (userId is me)
        const myIndividualRegs = await db
            .select({
                registration: registrationsTable,
                event: eventsTable,
                segment: segmentsTable
            })
            .from(registrationsTable)
            .leftJoin(eventsTable, eq(registrationsTable.eventId, eventsTable.id))
            .leftJoin(segmentsTable, eq(registrationsTable.segmentId, segmentsTable.id))
            .where(eq(registrationsTable.userId, userId));

        // 2. Get teams I lead (or belong to?) and their registrations.
        // Let's restrict to "teams I belong to".
        const myTeams = await db
            .select()
            .from(teamMembersTable)
            .where(eq(teamMembersTable.userId, userId));
        
        const myTeamIds = myTeams.map(t => t.teamId);

        let teamRegs: any[] = [];
        if (myTeamIds.length > 0) {
              teamRegs = await db
                .select({
                    registration: registrationsTable,
                    event: eventsTable,
                    segment: segmentsTable,
                    team: teamsTable
                })
                .from(registrationsTable)
                .leftJoin(eventsTable, eq(registrationsTable.eventId, eventsTable.id))
                .leftJoin(segmentsTable, eq(registrationsTable.segmentId, segmentsTable.id))
                .leftJoin(teamsTable, eq(registrationsTable.teamId, teamsTable.id))
                .where(inArray(registrationsTable.teamId, myTeamIds)); // This might need 'inArray' import
        }

        res.json({
            individual: myIndividualRegs,
            team: teamRegs
        });

    } catch (error) {
        console.error("Get registrations error:", error);
        res.status(500).json({ message: "Failed to fetch registrations" });
    }
};

// Check Registration Status (for a specific event)
export const checkRegistrationStatus = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { eventId } = req.params;

        // Check if I am registered individually
        const individualRegs = await db
            .select({ segmentId: registrationsTable.segmentId })
            .from(registrationsTable)
            .where(
                and(
                    eq(registrationsTable.eventId, eventId),
                    eq(registrationsTable.userId, userId)
                )
            );

        // Check if any of my teams are registered
        const myTeams = await db
            .select({ teamId: teamMembersTable.teamId })
            .from(teamMembersTable)
            .where(eq(teamMembersTable.userId, userId));
        
        const myTeamIds = myTeams.map(t => t.teamId);
        
        const teamSegmentIds: any[] = [];
        if (myTeamIds.length > 0) {
            const teamRegs = await db
                .select({ segmentId: registrationsTable.segmentId })
                .from(registrationsTable)
                .where(
                    and(
                        eq(registrationsTable.eventId, eventId),
                        inArray(registrationsTable.teamId, myTeamIds)
                    )
                );
            teamRegs.forEach(r => teamSegmentIds.push(r.segmentId));
        }
        
        // Combine and unique
        const registeredSegmentIds = Array.from(new Set([
            ...individualRegs.map(r => r.segmentId),
            ...teamSegmentIds.map(id => id)
        ]));

        res.json({ registeredSegmentIds });

    } catch (error) {
        console.error("Check registration status error:", error);
        res.status(500).json({ message: "Error" });
    }
};

// Get Event Registrations (Organizer View)
export const getEventRegistrants = async (req: Request, res: Response) => {
    try {
        const organizerId = (req as any).organizer?.id;
        const { eventId } = req.params;
        
        if (!organizerId) return res.status(401).json({ message: "Unauthorized" });

        // Verify event ownership
        const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, eventId));
        if (!event || event.organizerId !== organizerId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        // Fetch registrations with User/Team info
        const registrations = await db
            .select({
                id: registrationsTable.id,
                status: registrationsTable.status,
                paymentStatus: registrationsTable.paymentStatus,
                segmentName: segmentsTable.name,
                // Individual
                userId: usersTable.id,
                userName: usersTable.firstName, 
                userEmail: usersTable.email,
                // Team
                teamId: teamsTable.id,
                teamName: teamsTable.name,
                teamLeader: teamsTable.leaderId
                // TODO: join leader info if needed
            })
            .from(registrationsTable)
            .leftJoin(usersTable, eq(registrationsTable.userId, usersTable.id))
            .leftJoin(teamsTable, eq(registrationsTable.teamId, teamsTable.id))
            .leftJoin(segmentsTable, eq(registrationsTable.segmentId, segmentsTable.id))
            .where(eq(registrationsTable.eventId, eventId));

        res.json({ registrations });

    } catch (error) {
        console.error("Organizer registrations fetch error:", error);
        res.status(500).json({ message: "Failed to fetch registrations" });
    }
};
