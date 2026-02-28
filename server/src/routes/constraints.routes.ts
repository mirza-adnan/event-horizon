import { Router } from "express";
import { requestConstraint } from "../controllers/constraints.controller";
import { requireOrganizer } from "../middleware/requireOrganizer";

const router = Router();

// Apply requireOrganizer middleware to all routes in this file
router.use(requireOrganizer);

router.post("/request", requestConstraint);

export default router;
