import { Request, Response } from "express";
import { eq, sql, inArray, and, desc } from "drizzle-orm";
import db from "../db";
import {
    teamsTable,
    teamMembersTable,
    usersTable,
    teamInvitesTable,
    teamChatsTable,
    notificationsTable,
    NewTeam,
    NewUser,
    NewNotification
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
                    
                    // Trigger Internal Notification if user exists
                    const [invitedUser] = await tx
                        .select()
                        .from(usersTable)
                        .where(eq(usersTable.email, email));
                    
                    if (invitedUser) {
                        await tx.insert(notificationsTable).values({
                            userId: invitedUser.id,
                            type: "invite",
                            message: `You have been invited to join team "${name}"`,
                            link: "/teams",
                            isRead: false
                        } as NewNotification);
                    }
                    
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

// Get team details (members, events, etc) - restricted to members
export const getTeamDetails = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { teamId } = req.params;

        // Verify membership
        const [membership] = await db
            .select()
            .from(teamMembersTable)
            .where(
                and(
                    eq(teamMembersTable.teamId, teamId),
                    eq(teamMembersTable.userId, userId)
                )
            );

        if (!membership) {
            return res.status(403).json({ message: "You are not a member of this team" });
        }

        // Fetch Team Info
        const [team] = await db
            .select()
            .from(teamsTable)
            .where(eq(teamsTable.id, teamId));

        // Fetch Members
        const members = await db
            .select({
                userId: usersTable.id,
                firstName: usersTable.firstName,
                lastName: usersTable.lastName,
                username: usersTable.email, // Using email as username for now as username was removed
                email: usersTable.email,
                avatarUrl: usersTable.avatarUrl,
                role: teamMembersTable.role,
                joinedAt: teamMembersTable.joinedAt
            })
            .from(teamMembersTable)
            .leftJoin(usersTable, eq(teamMembersTable.userId, usersTable.id))
            .where(eq(teamMembersTable.teamId, teamId));

        res.json({
            team,
            members,
            myRole: membership.role
        });

    } catch (error) {
        console.error("Get team details error:", error);
        res.status(500).json({ message: "Failed to fetch team details" });
    }
};

// Get Team Chats
export const getTeamChats = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { teamId } = req.params;

        // Verify membership
        const [membership] = await db
            .select()
            .from(teamMembersTable)
            .where(
                and(
                    eq(teamMembersTable.teamId, teamId),
                    eq(teamMembersTable.userId, userId)
                )
            );

        if (!membership) {
            return res.status(403).json({ message: "Access denied" });
        }

        const chats = await db
            .select({
                id: teamChatsTable.id,
                message: teamChatsTable.message,
                createdAt: teamChatsTable.createdAt,
                userId: usersTable.id,
                firstName: usersTable.firstName,
                lastName: usersTable.lastName,
                avatarUrl: usersTable.avatarUrl
            })
            .from(teamChatsTable)
            .leftJoin(usersTable, eq(teamChatsTable.userId, usersTable.id))
            .where(eq(teamChatsTable.teamId, teamId))
            .orderBy(desc(teamChatsTable.createdAt))
            .limit(50); // Pagination later

        res.json({ chats: chats.reverse() }); // Return oldest first for UI

    } catch (error) {
         console.error("Get chats error:", error);
        res.status(500).json({ message: "Failed to fetch chats" });
    }
};

// Send Team Chat
export const sendTeamChat = async (req: Request, res: Response) => {
    try {
         const userId = (req as any).userId;
        const { teamId } = req.params;
        const { message } = req.body;

        if (!message) return res.status(400).json({ message: "Message cannot be empty" });

         // Verify membership
        const [membership] = await db
            .select()
            .from(teamMembersTable)
            .where(
                and(
                    eq(teamMembersTable.teamId, teamId),
                    eq(teamMembersTable.userId, userId)
                )
            );

        if (!membership) {
            return res.status(403).json({ message: "Access denied" });
        }

        const [newChat] = await db.insert(teamChatsTable).values({
            teamId,
            userId,
            message
        }).returning();

        // Check if we need to return populated user info for real-time update
        // efficient to just return the chat and handle state in frontend or fetch user info separately
        // but for now let's query the specific chat with user info to be safe
        
        const [populatedChat] = await db
            .select({
                id: teamChatsTable.id,
                message: teamChatsTable.message,
                createdAt: teamChatsTable.createdAt,
                userId: usersTable.id,
                firstName: usersTable.firstName,
                lastName: usersTable.lastName,
                avatarUrl: usersTable.avatarUrl
            })
            .from(teamChatsTable)
            .leftJoin(usersTable, eq(teamChatsTable.userId, usersTable.id))
            .where(eq(teamChatsTable.id, newChat.id));

        res.status(201).json({ chat: populatedChat });

    } catch (error) {
        console.error("Send chat error:", error);
        res.status(500).json({ message: "Failed to send message" });
    }
};
