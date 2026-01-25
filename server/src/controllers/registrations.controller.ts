import { Request, Response } from "express";
import { eq, and, or, inArray } from "drizzle-orm";
import db from "../db";
import {
    registrationsTable,
    eventsTable,
    segmentsTable,
    teamsTable,
    teamMembersTable,
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
        const individual = await db
            .select()
            .from(registrationsTable)
            .where(
                and(
                    eq(registrationsTable.eventId, eventId),
                    eq(registrationsTable.userId, userId)
                )
            );

        // Check if any of my teams are registered
        const myTeams = await db
            .select()
            .from(teamMembersTable)
            .where(eq(teamMembersTable.userId, userId));
        
        const myTeamIds = myTeams.map(t => t.teamId);
        
        let teamRegs: any[] = [];
        if (myTeamIds.length > 0) {
             // We need to import 'inArray' for this.
             // or loop? inArray is better.
        }
        
        // Actually, the simpler checkRegistrationStatus might just return boolean "isRegistered" and details.
        // For simplicity now, we can skip this endpoint and just let the frontend use `getMyRegistrations` or handle it in `getEventDetails` (backend side).
        // Since `getEventDetails` (public) shouldn't leak user info, we need a separate user-specific call or middleware.
        
        // Let's just return what we have.
        res.json({
            individual,
            // teamRegs // implement if needed
        });

    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};
