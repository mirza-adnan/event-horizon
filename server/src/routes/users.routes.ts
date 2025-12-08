import { Router } from "express";
import { signup } from "../controllers/auth.controller";

const usersRouter = Router();

usersRouter.post("/signup", signup);

export default usersRouter;
