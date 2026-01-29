import { Router } from "express";
import { createAnnouncement, getAnnouncements } from "../controllers/announcements.controller";
import { requireOrganizer } from "../middleware/requireOrganizer";
import { uploadEventBanner } from "../middleware/eventBannerUpload";

const router = Router();

// /api/announcements

router.post(
    "/create", 
    requireOrganizer, 
    uploadEventBanner.single("image"), 
    createAnnouncement
);

router.get("/:eventId", getAnnouncements); // Public or protected? Usually public for registered users. Or check auth.

export default router;
