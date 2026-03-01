import { Router } from "express";
import { signup, login, verifyUser, verifyEmail, logout } from "../controllers/auth.controller";
import { getUserProfile, searchUsers, updateUserProfile } from "../controllers/user-profiles.controller";
import { requireUser } from "../middleware/requireUser";

const usersRouter = Router();

usersRouter.post("/signup", signup);
usersRouter.post("/login", login);
usersRouter.get("/verify", verifyUser);
usersRouter.get("/verify-email", verifyEmail);
usersRouter.post("/logout", logout);
usersRouter.get("/profile/:id", getUserProfile);
usersRouter.put("/profile", requireUser, updateUserProfile);
usersRouter.get("/search", searchUsers);

export default usersRouter;
