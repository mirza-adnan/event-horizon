import { Request, Response } from "express";
import { eq, sql, inArray } from "drizzle-orm";
import db from "../db";
import {
    teamsTable,
    teamMembersTable,
    usersTable,
    teamInvitesTable,
    NewTeam,
    NewUser,
} from "../db/schema";

// Get all teams for the current user
export const getMyTeams = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        // Find all team memberships for the user
        const memberships = await db
            .select()
            .from(teamMembersTable)
            .where(eq(teamMembersTable.userId, userId));

        if (memberships.length === 0) {
            return res.json({ teams: [] });
        }

        const teamIds = memberships.map((m) => m.teamId);

        // Fetch team details
        const teams = await db
            .select()
            .from(teamsTable)
            .where(inArray(teamsTable.id, teamIds));

        // Start to enrich team data with member counts etc?
        // For now just return basic info + role
        const teamsWithRole = teams.map((team) => {
            const memberShip = memberships.find((m) => m.teamId === team.id);
            return {
                ...team,
                myRole: memberShip?.role,
            };
        });

        res.json({ teams: teamsWithRole });
    } catch (error) {
        console.error("Get teams error:", error);
        res.status(500).json({ message: "Failed to fetch teams" });
    }
};

// Create a new team
export const createTeam = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { name, description, memberEmails } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Team name is required" });
        }

        const result = await db.transaction(async (tx) => {
             // 1. Create Team
             const [newTeam] = await tx
                .insert(teamsTable)
                .values({
                    name,
                    description,
                    leaderId: userId,
                    code: Math.random().toString(36).substring(2, 8).toUpperCase(), // Simple code generation
                } as NewTeam)
                .returning();
            
            // 2. Add Leader as Member
            await tx.insert(teamMembersTable).values({
                teamId: newTeam.id,
                userId: userId,
                role: "leader",
            });

            // 3. Handle Invites
            if (memberEmails && Array.isArray(memberEmails) && memberEmails.length > 0) {
                 // Loop through emails
                 for (const email of memberEmails) {
                    if (!email || typeof email !== 'string') continue;
                    
                    // Check if user exists (Optional: if so, send notification? For now just create invite)
                    // If user exists, we might still just treat it as an invite to email
                    
                    await tx.insert(teamInvitesTable).values({
                        teamId: newTeam.id,
                        email: email,
                        invitedBy: userId,
                        status: "pending"
                    });
                    
                    // TODO: Send Email Notification
                 }
            }
            
            return newTeam;
        });

        res.status(201).json({ team: result, message: "Team created successfully" });

    } catch (error) {
        console.error("Create team error:", error);
        res.status(500).json({ message: "Failed to create team" });
    }
};
