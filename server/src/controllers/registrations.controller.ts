import { Request, Response } from "express";
import { eq, and, or, inArray, sql } from "drizzle-orm";
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
import { updateUserInterest } from "../utils/user-interests";
import { checkConstraints } from "../utils/constraints";

// Create Registration
export const createRegistration = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { eventId, segmentId, teamId, data } = req.body;

        if (!eventId || !segmentId) {
            return res.status(400).json({ message: "Event ID and Segment ID are required" });
        }

        // 1. Fetch Segment details and Event details
        const [segment] = await db.select().from(segmentsTable).where(eq(segmentsTable.id, segmentId));
        if (!segment) {
            return res.status(404).json({ message: "Segment not found" });
        }

        if (segment.isRegistrationPaused) {
            return res.status(403).json({ message: "Registration for this segment is currently paused" });
        }

        const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, eventId));
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

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

            // Fetch team members with full user profiles for constraint validation
            const teamMembersData = await db
                .select({
                    id: usersTable.id,
                    firstName: usersTable.firstName,
                    lastName: usersTable.lastName,
                    dateOfBirth: usersTable.dateOfBirth,
                    gender: usersTable.gender,
                    email: usersTable.email
                })
                .from(teamMembersTable)
                .innerJoin(usersTable, eq(teamMembersTable.userId, usersTable.id))
                .where(eq(teamMembersTable.teamId, teamId));

            const teamSize = teamMembersData.length;

            // Check Team Size Constraints
            if (segment.minTeamSize || segment.maxTeamSize) {
                if (segment.minTeamSize && teamSize < segment.minTeamSize) {
                    return res.status(400).json({ 
                        message: `Team size is too small. Minimum required: ${segment.minTeamSize}. Your team has: ${teamSize}` 
                    });
                }

                if (segment.maxTeamSize && teamSize > segment.maxTeamSize) {
                    return res.status(400).json({ 
                        message: `Team size is too large. Maximum allowed: ${segment.maxTeamSize}. Your team has: ${teamSize}` 
                    });
                }
            }

            // Check Event Constraints
            const constraintError = checkConstraints(teamMembersData, segmentId, event.constraints || [], data?.code);
            if (constraintError) {
                return res.status(400).json({ message: `Constraint Failed: ${constraintError}` });
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
                status: segment.registrationFee > 0 ? "payment_pending" : "approved",
                paymentStatus: "unpaid",
                data
            } as NewRegistration).returning();

            // --- Interest Tracking (High Weight) ---
            try {
                // Construct rich text for embedding
                const titlePart = (segment.name + " ").repeat(2); 
                // We need event details too for better context
                const [event] = await db.select({ title: eventsTable.title, description: eventsTable.description }).from(eventsTable).where(eq(eventsTable.id, eventId));
                
                const eventTitlePart = event ? (event.title + " ") : "";
                const categoryPart = segment.categoryId ? (segment.categoryId + " ").repeat(3) : "";
                
                const textToEmbed = `${titlePart}\n${eventTitlePart}\n${categoryPart}\n${segment.description || ""}\n${event?.description || ""}`;
                
                // Weight: 0.5 (Highest)
                await updateUserInterest(userId, textToEmbed, 0.5, "REGISTRATION");
            } catch (err) {
                console.error("Failed to track registration interest", err);
            }
            // ---------------------------------------

            return res.status(201).json({ message: "Team registration successful", registration: reg });

        } else {
            // Individual Registration Logic
            
            // Check Event Constraints
            const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
            if (user) {
                const constraintError = checkConstraints([user], segmentId, event.constraints || [], data?.code);
                if (constraintError) {
                    return res.status(400).json({ message: `Constraint Failed: ${constraintError}` });
                }
            }

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
            const newSegment = segment; // Already fetched

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
                status: segment.registrationFee > 0 ? "payment_pending" : "approved",
                paymentStatus: segment.registrationFee > 0 ? "unpaid" : "paid",
                data
            } as NewRegistration).returning();

            // --- Interest Tracking (High Weight) ---
            try {
                // Construct rich text for embedding (Same as above, could refactor but keeping inline for now)
                const titlePart = (segment.name + " ").repeat(2); 
                const [event] = await db.select({ title: eventsTable.title, description: eventsTable.description }).from(eventsTable).where(eq(eventsTable.id, eventId));
                
                const eventTitlePart = event ? (event.title + " ") : "";
                const categoryPart = segment.categoryId ? (segment.categoryId + " ").repeat(3) : "";
                
                const textToEmbed = `${titlePart}\n${eventTitlePart}\n${categoryPart}\n${segment.description || ""}\n${event?.description || ""}`;
                
                // Weight: 0.5 (Highest)
                await updateUserInterest(userId, textToEmbed, 0.5, "REGISTRATION");
            } catch (err) {
                console.error("Failed to track registration interest", err);
            }
            // ---------------------------------------

            return res.status(201).json({ message: "Registration created, pending payment", registration: reg });
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
        const regs = await db
            .select({
                id: registrationsTable.id,
                status: registrationsTable.status,
                paymentStatus: registrationsTable.paymentStatus,
                segmentName: segmentsTable.name,
                segmentId: registrationsTable.segmentId,
                // Individual
                userId: usersTable.id,
                userName: usersTable.firstName, 
                userEmail: usersTable.email,
                // Team
                teamId: teamsTable.id,
                teamName: teamsTable.name,
                teamLeader: teamsTable.leaderId
            })
            .from(registrationsTable)
            .leftJoin(usersTable, eq(registrationsTable.userId, usersTable.id))
            .leftJoin(teamsTable, eq(registrationsTable.teamId, teamsTable.id))
            .leftJoin(segmentsTable, eq(registrationsTable.segmentId, segmentsTable.id))
            .where(
                and(
                    eq(registrationsTable.eventId, eventId),
                    eq(registrationsTable.paymentStatus, 'paid')
                )
            );

        // Fetch team members for all team registrations
        const teamIds = regs.filter(r => r.teamId).map(r => r.teamId as string);
        let teamMembers: any[] = [];
        if (teamIds.length > 0) {
            teamMembers = await db
                .select({
                    teamId: teamMembersTable.teamId,
                    userId: usersTable.id,
                    userName: sql<string>`${usersTable.firstName} || ' ' || COALESCE(${usersTable.lastName}, '')`,
                    userEmail: usersTable.email,
                    role: teamMembersTable.role
                })
                .from(teamMembersTable)
                .innerJoin(usersTable, eq(teamMembersTable.userId, usersTable.id))
                .where(inArray(teamMembersTable.teamId, teamIds));
        }

        const registrations = regs.map(reg => {
            if (reg.teamId) {
                return {
                    ...reg,
                    teamMembers: teamMembers.filter(m => m.teamId === reg.teamId)
                };
            }
            return reg;
        });

        res.json({ registrations });

    } catch (error) {
        console.error("Organizer registrations fetch error:", error);
        res.status(500).json({ message: "Failed to fetch registrations" });
    }
};

// Mock Payment (for demo purposes)
export const mockPay = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;

        // Verify ownership (just check if user is the registrant)
        // In real app, we'd verify team leader too if it's a team registration
        const [reg] = await db
            .select()
            .from(registrationsTable)
            .where(eq(registrationsTable.id, id));

        if (!reg) {
            return res.status(404).json({ message: "Registration not found" });
        }

        // Simple ownership check: either the user is the registrant OR the user is the team leader of the registered team
        let isAuthorized = false;
        if (reg.userId === userId) {
            isAuthorized = true;
        } else if (reg.teamId) {
            const [team] = await db.select().from(teamsTable).where(eq(teamsTable.id, reg.teamId));
            if (team && team.leaderId === userId) {
                isAuthorized = true;
            }
        }

        // If neither, fail
        if (!isAuthorized) {
            return res.status(403).json({ message: "Unauthorized to pay for this registration" });
        }

        // Update status
        await db
            .update(registrationsTable)
            .set({ 
                paymentStatus: "paid",
                status: "approved" // Auto-approve on payment for demo
            })
            .where(eq(registrationsTable.id, id));

        res.json({ message: "Payment successful" });

    } catch (error) {
        console.error("Mock payment error:", error);
        res.status(500).json({ message: "Payment failed" });
    }
};

// Toggle Registration Pause
export const toggleRegistrationPause = async (req: Request, res: Response) => {
    try {
        const organizerId = (req as any).organizer?.id;
        const { segmentId } = req.params;

        if (!organizerId) return res.status(401).json({ message: "Unauthorized" });

        // Fetch segment and check event ownership
        const [segment] = await db
            .select({
                id: segmentsTable.id,
                isRegistrationPaused: segmentsTable.isRegistrationPaused,
                organizerId: eventsTable.organizerId
            })
            .from(segmentsTable)
            .innerJoin(eventsTable, eq(segmentsTable.eventId, eventsTable.id))
            .where(eq(segmentsTable.id, segmentId));

        if (!segment) {
            return res.status(404).json({ message: "Segment not found" });
        }

        if (segment.organizerId !== organizerId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        // Toggle pause
        const [updated] = await db
            .update(segmentsTable)
            .set({ isRegistrationPaused: !segment.isRegistrationPaused })
            .where(eq(segmentsTable.id, segmentId))
            .returning();

        res.json({ 
            message: `Registration ${updated.isRegistrationPaused ? 'paused' : 'started'} successfully`,
            isRegistrationPaused: updated.isRegistrationPaused 
        });

    } catch (error) {
        console.error("Toggle registration pause error:", error);
        res.status(500).json({ message: "Failed to toggle registration pause" });
    }
};
