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

// Invite a user to an existing team
export const inviteMember = async (req: Request, res: Response) => {
    try {
        const leaderId = (req as any).userId;
        const { teamId } = req.params;
        const { userId: invitedUserId } = req.body;

        if (!invitedUserId) {
            return res.status(400).json({ message: "Invited user ID is required" });
        }

        // 1. Verify requester is leader of the team
        const [team] = await db
            .select()
            .from(teamsTable)
            .where(and(eq(teamsTable.id, teamId), eq(teamsTable.leaderId, leaderId)));
        
        if (!team) {
            return res.status(403).json({ message: "Only the team leader can invite members" });
        }

        // 2. Fetch invited user info
        const [invitedUser] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, invitedUserId));
        
        if (!invitedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // 3. Check if already a member
        const [existingMember] = await db
            .select()
            .from(teamMembersTable)
            .where(and(eq(teamMembersTable.teamId, teamId), eq(teamMembersTable.userId, invitedUserId)));
        
        if (existingMember) {
            return res.status(400).json({ message: "User is already a member of this team" });
        }

        // 4. Check if pending invite exists
        const [existingInvite] = await db
            .select()
            .from(teamInvitesTable)
            .where(and(
                eq(teamInvitesTable.teamId, teamId),
                eq(teamInvitesTable.email, invitedUser.email),
                eq(teamInvitesTable.status, "pending")
            ));
        
        if (existingInvite) {
            return res.status(400).json({ message: "A pending invite already exists for this user" });
        }

        // 5. Create Invite & Notification
        await db.transaction(async (tx) => {
            await tx.insert(teamInvitesTable).values({
                teamId,
                email: invitedUser.email,
                invitedBy: leaderId,
                status: "pending"
            });

            await tx.insert(notificationsTable).values({
                userId: invitedUserId,
                type: "invite",
                message: `You have been invited to join team "${team.name}"`,
                link: "/teams",
                isRead: false
            } as NewNotification);
        });

        res.json({ message: "Invite sent successfully" });
    } catch (error) {
        console.error("Invite member error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get pending invites for current user
export const getMyInvites = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        
        // Use user email to find invites
        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
        if (!user) return res.status(404).json({ message: "User not found" });

        const invites = await db
            .select({
                id: teamInvitesTable.id,
                status: teamInvitesTable.status,
                createdAt: teamInvitesTable.createdAt,
                team: {
                    id: teamsTable.id,
                    name: teamsTable.name,
                },
                inviter: {
                    firstName: usersTable.firstName,
                    lastName: usersTable.lastName,
                }
            })
            .from(teamInvitesTable)
            .innerJoin(teamsTable, eq(teamInvitesTable.teamId, teamsTable.id))
            .innerJoin(usersTable, eq(teamInvitesTable.invitedBy, usersTable.id))
            .where(and(
                eq(teamInvitesTable.email, user.email),
                eq(teamInvitesTable.status, "pending")
            ));

        res.json({ invites });
    } catch (error) {
        console.error("Get invites error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Accept or Reject invite
export const respondToInvite = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { inviteId } = req.params;
        const { action } = req.body; // 'accept' or 'reject'

        if (!['accept', 'reject'].includes(action)) {
            return res.status(400).json({ message: "Invalid action" });
        }

        const [invite] = await db
            .select()
            .from(teamInvitesTable)
            .where(eq(teamInvitesTable.id, inviteId));

        if (!invite) return res.status(404).json({ message: "Invite not found" });

        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
        if (!user || user.email !== invite.email) {
            return res.status(403).json({ message: "Forbidden" });
        }

        if (invite.status !== 'pending') {
            return res.status(400).json({ message: "Invite already processed" });
        }

        await db.transaction(async (tx) => {
            // Update invite status
            await tx
                .update(teamInvitesTable)
                .set({ status: action === 'accept' ? 'accepted' : 'rejected' })
                .where(eq(teamInvitesTable.id, inviteId));

            const [team] = await tx.select().from(teamsTable).where(eq(teamsTable.id, invite.teamId));

            if (action === 'accept') {
                // Add to members
                await tx.insert(teamMembersTable).values({
                    teamId: invite.teamId,
                    userId: userId,
                    role: "member"
                });

                // Notify Leader
                await tx.insert(notificationsTable).values({
                    userId: invite.invitedBy,
                    type: "announcement",
                    message: `${user.firstName} accepted your invite to join "${team?.name}"`,
                    link: `/teams/${invite.teamId}`,
                    isRead: false
                } as NewNotification);
            } else {
                // Notify Leader of rejection
                await tx.insert(notificationsTable).values({
                    userId: invite.invitedBy,
                    type: "announcement",
                    message: `${user.firstName} declined your invite to join "${team?.name}"`,
                    link: "/teams",
                    isRead: false
                } as NewNotification);
            }
        });

        res.json({ message: `Invite ${action}ed successfully` });
    } catch (error) {
        console.error("Respond to invite error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
