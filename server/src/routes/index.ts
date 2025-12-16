import { Router } from "express";
import usersRouter from "./users.routes";
import organizerRouter from "./organizer.routes";

const router = Router();

router.use("/users", usersRouter);
router.use("/organizers", organizerRouter);

export default router;
