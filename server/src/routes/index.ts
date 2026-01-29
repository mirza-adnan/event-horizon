import { Router } from "express";
import usersRouter from "./users.routes";
import organizerRouter from "./organizers.routes";
import eventsRouter from "./events.routes";
import categoriesRouter from "./categories.routes";
import externalEventsRouter from "./external-events.routes";
import teamsRouter from "./teams.routes";
import registrationsRouter from "./registrations.routes";
import announcementsRouter from "./announcements.routes";
import notificationsRouter from "./notifications.routes";

const router = Router();

router.use("/users", usersRouter);
router.use("/organizers", organizerRouter);
router.use("/events", eventsRouter);
router.use("/categories", categoriesRouter);
router.use("/external-events", externalEventsRouter);
router.use("/teams", teamsRouter);
router.use("/registrations", registrationsRouter);
router.use("/announcements", announcementsRouter);
router.use("/notifications", notificationsRouter);

export default router;
