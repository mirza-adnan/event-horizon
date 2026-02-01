import { Router } from "express";
import { signup, login, verifyUser, verifyEmail, logout } from "../controllers/auth.controller";
import { getUserProfile } from "../controllers/user-profiles.controller";

const usersRouter = Router();

usersRouter.post("/signup", signup);
usersRouter.post("/login", login);
usersRouter.get("/verify", verifyUser);
usersRouter.get("/verify-email", verifyEmail);
usersRouter.post("/logout", logout);
usersRouter.get("/profile/:id", getUserProfile);

export default usersRouter;
