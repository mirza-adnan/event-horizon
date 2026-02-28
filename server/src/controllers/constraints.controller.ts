import { Request, Response } from "express";
import db from "../db";
import { constraintRequestsTable } from "../db/schema";

export const requestConstraint = async (req: Request, res: Response) => {
    try {
        const organizerId = (req as any).organizer?.id;
        if (!organizerId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { name, description } = req.body;
        if (!name || !description) {
            return res.status(400).json({ message: "Name and description are required" });
        }

        await db.insert(constraintRequestsTable).values({
            organizerId,
            name,
            description,
        });

        res.status(201).json({ message: "New constraint requested successfully." });
    } catch (error) {
        console.error("Error requesting constraint:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
