import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import db from "../db";
import { usersTable } from "../db/schema";

export const optionalUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies.token;

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: string;
        };

        const [user] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, decoded.userId));

        if (user) {
            (req as any).user = user;
            (req as any).userId = decoded.userId;
        }
        
        next();
    } catch (error) {
        // If token is invalid, just proceed as guest
        next();
    }
};
