import { Router } from "express";
import {
    scrapeAndSeedEvents,
    getAllExternalEvents,
    deleteExternalEvent,
    trackEventStats,
} from "../controllers/external-events.controller";

const router = Router();

// Assuming admin protection middleware might be needed later, keeping it open for now
// or we can add verifyAdmin middleware if available.

router.post("/scrape-seed", scrapeAndSeedEvents);
router.get("/", getAllExternalEvents);
router.delete("/:id", deleteExternalEvent);
router.post("/:id/stats", trackEventStats);

export default router;
