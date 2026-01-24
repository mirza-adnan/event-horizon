import { Router } from "express";
import { getMyTeams, createTeam, getTeamDetails, getTeamChats, sendTeamChat } from "../controllers/teams.controller";
import { requireUser } from "../middleware/requireUser";

const router = Router();

router.get("/my", requireUser, getMyTeams);
router.post("/create", requireUser, createTeam);

router.get("/:teamId", requireUser, getTeamDetails);
router.get("/:teamId/chats", requireUser, getTeamChats);
router.post("/:teamId/chats", requireUser, sendTeamChat);

export default router;
