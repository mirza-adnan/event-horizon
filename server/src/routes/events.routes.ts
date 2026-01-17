import { Router } from "express";
import {
    createEvent,
    getMyEvents,
    getEventById,
    updateEvent,
    scrapeExternalEvents,
    scrapeFacebookEvent,
} from "../controllers/events.controller";
import { requireOrganizer } from "../middleware/requireOrganizer";
import { uploadEventBanner } from "../middleware/eventBannerUpload";

const router = Router();

router.post(
    "/create",
    requireOrganizer,
    uploadEventBanner.single("banner"),
    createEvent
);
router.get("/my", requireOrganizer, getMyEvents);
router.post("/scrape-facebook", requireOrganizer, scrapeFacebookEvent);
router.get("/scrape-external-events", scrapeExternalEvents);

// New Routes


export default router;
