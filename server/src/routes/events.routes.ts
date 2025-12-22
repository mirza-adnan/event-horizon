import { Router } from "express";
import { createEvent } from "../controllers/events.controller";
import { requireOrganizer } from "../middleware/requireOrganizer";
import { uploadEventBanner } from "../middleware/eventBannerUpload";

const eventsRouter = Router();

eventsRouter.post(
    "/create",
    requireOrganizer,
    uploadEventBanner.single("event-banner"),
    createEvent
);

export default eventsRouter;
