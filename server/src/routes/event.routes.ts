import { Router } from "express";
import {
    createEvent,
    getAllEvents,
    getEventById,
    getOrganizerEvents,
    updateEvent,
    deleteEvent,
} from "../controllers/event.controller";
import { requireOrganizer } from "../middleware/requireOrganizer";
import { uploadEventImage } from "../middleware/upload";

const eventRouter = Router();

// Public routes
eventRouter.get("/", getAllEvents);
eventRouter.get("/:id", getEventById);

// Protected routes (require organizer authentication)
eventRouter.post(
    "/",
    requireOrganizer,
    uploadEventImage.single("cover-image"),
    createEvent
);
eventRouter.get("/organizer/my-events", requireOrganizer, getOrganizerEvents);
eventRouter.put(
    "/:id",
    requireOrganizer,
    uploadEventImage.single("cover-image"),
    updateEvent
);
eventRouter.delete("/:id", requireOrganizer, deleteEvent);

export default eventRouter;
