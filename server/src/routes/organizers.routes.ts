import { Router } from "express";
import {
    organizerRegister,
    organizerLogin,
    validateOrganizerBasic,
    verifyOrganizerEmail,
} from "../controllers/organizer.controller";
import { uploadProof } from "../middleware/upload";
import { requireOrganizer } from "../middleware/requireOrganizer";
import { requireAdmin } from "../middleware/requireAdmin";
import { orgsTable } from "../db/schema";
import { eq } from "drizzle-orm";
import db from "../db";

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
organizerRouter.get("/verify/:id", verifyOrganizerEmail);
organizerRouter.get("/pending", requireAdmin, async (req, res) => {
    console.log("here");
    try {
        const pendingOrgs = await db
            .select()
            .from(orgsTable)
            .where(eq(orgsTable.status, "pending"));

        res.json({ organizers: pendingOrgs });
    } catch (error) {
        res.status(500).json({ message: "Error fetching pending organizers" });
    }
});

organizerRouter.get("/:id", requireAdmin, async (req, res) => {
    try {
        const [organizer] = await db
            .select()
            .from(orgsTable)
            .where(eq(orgsTable.id, req.params.id));

        if (!organizer) {
            return res.status(404).json({ message: "Organizer not found" });
        }

        res.json({ organizer });
    } catch (error) {
        res.status(500).json({ message: "Error fetching organizer details" });
    }
});

organizerRouter.patch("/:id/approve", requireAdmin, async (req, res) => {
    try {
        await db
            .update(orgsTable)
            .set({ status: "verified" })
            .where(eq(orgsTable.id, req.params.id));

        res.json({ message: "Organizer approved successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error approving organizer" });
    }
});

organizerRouter.patch("/:id/reject", requireAdmin, async (req, res) => {
    try {
        await db
            .update(orgsTable)
            .set({ status: "rejected" })
            .where(eq(orgsTable.id, req.params.id));

        res.json({ message: "Organizer rejected successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error rejecting organizer" });
    }
});

organizerRouter.post("/logout", (req, res) => {
    res.clearCookie("org_token");
    res.json({ message: "Logged out successfully" });
});

export default organizerRouter;
