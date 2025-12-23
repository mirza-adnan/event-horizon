import { Router } from "express";
import { createEvent, getMyEvents } from "../controllers/events.controller";
import { requireOrganizer } from "../middleware/requireOrganizer";
import { uploadEventBanner } from "../middleware/eventBannerUpload";

const eventsRouter = Router();

eventsRouter.post(
    "/create",
    requireOrganizer,
    uploadEventBanner.single("banner"),
    createEvent
);

eventsRouter.get("/my", requireOrganizer, getMyEvents);

export default eventsRouter;
