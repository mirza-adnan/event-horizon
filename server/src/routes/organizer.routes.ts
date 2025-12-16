import { Router } from "express";
import {
    organizerRegister,
    organizerLogin,
} from "../controllers/organizer.controller";
import { uploadProof } from "../middleware/upload";

const organizerRouter = Router();

organizerRouter.post(
    "/register",
    uploadProof.single("proof-document"),
    organizerRegister
);
organizerRouter.post("/login", organizerLogin);

export default organizerRouter;
