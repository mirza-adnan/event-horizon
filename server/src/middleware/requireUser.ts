import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import db from "../db";
import { usersTable } from "../db/schema";

export const requireUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies.token; // Note: logic says 'token' for users, 'org_token' for organizers in existing code

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: string;
        };

        const [user] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, decoded.userId));

        if (!user) {
            return res
                .status(401)
                .json({ message: "Unauthorized - User not found" });
        }

        (req as any).user = user;
        (req as any).userId = decoded.userId;

        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized" });
    }
};
