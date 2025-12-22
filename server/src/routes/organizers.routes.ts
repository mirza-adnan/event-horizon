import { Router } from "express";
import {
    organizerRegister,
    organizerLogin,
    validateOrganizerBasic,
} from "../controllers/organizer.controller";
import { uploadProof } from "../middleware/upload";
import { requireOrganizer } from "../middleware/requireOrganizer";

const organizerRouter = Router();

organizerRouter.post(
    "/register",
    uploadProof.single("proof-document"),
    organizerRegister
);
organizerRouter.post("/login", organizerLogin);
organizerRouter.post("/validate/basic", validateOrganizerBasic);
organizerRouter.get("/me", requireOrganizer, (req, res) => {
    const organizer = (req as any).organizer;
    res.json({
        id: organizer.id,
        name: organizer.name,
        email: organizer.email,
        status: organizer.status,
    });
});

export default organizerRouter;
