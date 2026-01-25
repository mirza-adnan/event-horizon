import { Router } from "express";
import { createRegistration, getMyRegistrations } from "../controllers/registrations.controller";
import { requireUser } from "../middleware/requireUser";

const router = Router();

router.post("/create", requireUser, createRegistration);
router.get("/my", requireUser, getMyRegistrations);

export default router;
