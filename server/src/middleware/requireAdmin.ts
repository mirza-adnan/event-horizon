import { NextFunction, Request, Response } from "express";

export const requireAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log("here1");
    const isAdmin = req.headers.authorization === "Bearer admin-token";
    console.log(isAdmin);
    console.log(req.headers.authorization);
    if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
    }

    next();
};
