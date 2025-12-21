import { Router } from "express";
import usersRouter from "./users.routes";
import organizerRouter from "./organizers.routes";
import eventsRouter from "./events.routes";
import categoriesRouter from "./categories.routes";

const router = Router();

router.use("/users", usersRouter);
router.use("/organizers", organizerRouter);
router.use("/events", eventsRouter);
router.use("/categories", categoriesRouter);

export default router;
