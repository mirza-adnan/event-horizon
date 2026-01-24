import { Router } from "express";
import { getMyTeams, createTeam } from "../controllers/teams.controller";
import { requireUser } from "../middleware/requireUser";

const router = Router();

router.get("/my", requireUser, getMyTeams);
router.post("/create", requireUser, createTeam);

export default router;
