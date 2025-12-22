import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import db from "../db";
import { orgsTable } from "../db/schema";

export const requireOrganizer = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies.org_token;
    console.log(token);
    if (!token) {
        console.log("unauth");
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            orgId: string;
        };

        // Fetch the organizer from the database
        const [organizer] = await db
            .select()
            .from(orgsTable)
            .where(eq(orgsTable.id, decoded.orgId));

        if (!organizer) {
            return res
                .status(401)
                .json({ message: "Unauthorized - Organizer not found" });
        }

        // Check if the organizer account is active (not rejected)
        if (organizer.status === "rejected") {
            return res.status(401).json({
                message: "Unauthorized - Organizer account is rejected",
            });
        } else if (organizer.status === "pending") {
            return res.status(401).json({
                message: "Organizer account is awaiting admin approval",
            });
        }

        // Check if the organizer's email is verified
        if (!organizer.verified) {
            return res.status(401).json({ message: "Email not verified" });
        }

        // Attach the organizer object to the request
        (req as any).organizer = organizer;
        (req as any).orgId = decoded.orgId;

        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized" });
    }
};
