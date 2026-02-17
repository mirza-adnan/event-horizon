import { Router } from "express";
import { createRegistration, getMyRegistrations, getEventRegistrants, checkRegistrationStatus, mockPay } from "../controllers/registrations.controller";
import { requireUser } from "../middleware/requireUser";
import { requireOrganizer } from "../middleware/requireOrganizer";

const router = Router();

router.post("/create", requireUser, createRegistration);
router.get("/my", requireUser, getMyRegistrations);
router.get("/event/:eventId", requireOrganizer, getEventRegistrants);
router.get("/event/:eventId/status", requireUser, checkRegistrationStatus);
router.post("/:id/pay-mock", requireUser, mockPay);

export default router;
