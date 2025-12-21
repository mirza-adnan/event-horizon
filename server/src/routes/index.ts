import { Router } from "express";
import usersRouter from "./users.routes";
import organizerRouter from "./organizer.routes";
import eventRouter from "./event.routes";

const router = Router();

router.use("/users", usersRouter);
router.use("/organizers", organizerRouter);
router.use("/events", eventRouter);

export default router;
