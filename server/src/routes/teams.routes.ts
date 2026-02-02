import { Router } from "express";
import { 
    getMyTeams, 
    createTeam, 
    getTeamDetails, 
    getTeamChats, 
    sendTeamChat, 
    inviteMember, 
    getMyInvites, 
    respondToInvite,
    getTeamEvents,
    removeTeamMember
} from "../controllers/teams.controller";
import { requireUser } from "../middleware/requireUser";

const router = Router();

router.get("/my", requireUser, getMyTeams);
router.get("/invites", requireUser, getMyInvites);
router.post("/create", requireUser, createTeam);

router.get("/:teamId", requireUser, getTeamDetails);
router.get("/:teamId/chats", requireUser, getTeamChats);
router.post("/:teamId/chats", requireUser, sendTeamChat);
router.post("/:teamId/invite", requireUser, inviteMember);
router.get("/:teamId/events", requireUser, getTeamEvents);
router.delete("/:teamId/members/:userId", requireUser, removeTeamMember);
router.post("/invites/:inviteId/respond", requireUser, respondToInvite);

export default router;
