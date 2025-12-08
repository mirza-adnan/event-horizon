import { Router } from "express";
import { signup, login } from "../controllers/auth.controller";

const usersRouter = Router();

usersRouter.post("/signup", signup);
usersRouter.post("/login", login);

export default usersRouter;
