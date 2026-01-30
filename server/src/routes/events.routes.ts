import { Router } from "express";
import {
    createEvent,
    getMyEvents,
    getEventById,
    updateEvent,
    scrapeExternalEvents,
    scrapeFacebookEvent,
    searchEvents,
    trackInterest,
} from "../controllers/events.controller";
import { requireOrganizer } from "../middleware/requireOrganizer";
import { requireUser } from "../middleware/requireUser";
import { optionalUser } from "../middleware/optionalUser";
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
router.get("/search", optionalUser, searchEvents);
router.post("/track-interest", requireUser, trackInterest);

// New Routes
router.get("/:id", getEventById);
router.put("/:id", requireOrganizer, uploadEventBanner.single("banner"), updateEvent);

export default router;
