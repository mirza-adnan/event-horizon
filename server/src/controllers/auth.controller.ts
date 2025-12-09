import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

import db from "../db";
import { User, usersTable } from "../db/schema";

const JWT_SECRET = process.env.JWT_SECRET!;

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, username, password, dateOfBirth, firstName, lastName } =
            req.body;

        if (!email || !username || !password || !dateOfBirth || !firstName) {
            return res
                .status(400)
                .json({ message: "All required fields must be provided" });
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
                .json({ message: "Username or email already exists" });
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
                bio: usersTable.bio,
                phone: usersTable.phone,
                avatarUrl: usersTable.avatarUrl,
                dateOfBirth: usersTable.dateOfBirth,
                createdAt: usersTable.createdAt,
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

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res
                .status(400)
                .json({ message: "Username and password are required" });
        }

        const [user] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.username, username));

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
            expiresIn: "1h",
        });

        let userData: any = {};
        Object.keys(user).forEach((key) => {
            if (key !== "passwordHash") {
                userData[key] = user[key as keyof User];
            }
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000,
        });

        res.status(200).json(userData);
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
