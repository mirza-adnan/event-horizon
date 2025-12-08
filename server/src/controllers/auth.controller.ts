import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

import db from "../db";
import { usersTable } from "../db/schema";

const JWT_SECRET = process.env.JWT_SECRET!;

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, username, password, dateOfBirth, firstName, lastName } =
            req.body;

        if (!email || !username || !password || !dateOfBirth || !firstName) {
            return res
                .status(400)
                .json({ message: "All required fields must be provided." });
        }

        const existingUsers = await db
            .select()
            .from(usersTable)
            .where(
                eq(usersTable.username, username) || eq(usersTable.email, email)
            );

        if (existingUsers.length > 0) {
            return res
                .status(409)
                .json({ message: "Username or email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [newUser] = await db
            .insert(usersTable)
            .values({
                email,
                username,
                passwordHash: hashedPassword,
                firstName,
                lastName,
                dateOfBirth: dateOfBirth,
            })
            .returning({
                id: usersTable.id,
                email: usersTable.email,
                username: usersTable.username,
                firstName: usersTable.firstName,
                lastName: usersTable.lastName,
            });

        const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, {
            expiresIn: "1h",
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000,
        });

        res.status(201).json({
            user: newUser,
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
