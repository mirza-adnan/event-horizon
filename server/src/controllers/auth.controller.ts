import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

import db from "../db";
import { User, usersTable } from "../db/schema";
import crypto from "crypto"; // For generating verification tokens
import { sendUserVerification } from "../utils/sendEmail";

const JWT_SECRET = process.env.JWT_SECRET!;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"; // Fallback for dev

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, password, dateOfBirth, firstName, lastName } = req.body;

        if (!email || !password || !dateOfBirth || !firstName) {
            return res
                .status(400)
                .json({ message: "All required fields must be provided" });
        }

        const existingUsers = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email));

        if (existingUsers.length > 0) {
            return res
                .status(409)
                .json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const [newUser] = await db
            .insert(usersTable)
            .values({
                email,
                passwordHash: hashedPassword,
                firstName,
                lastName,
                dateOfBirth: dateOfBirth,
                verified: false,
                verificationToken,
            } as any) // Type might not be updated yet in IDE cache
            .returning();
        
        // Send Verification Email
        sendUserVerification(firstName, email, verificationToken);

        res.status(201).json({
            message: "User registered. Please check your email to verify your account.",
            user: { email: newUser.email }
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }

        const [user] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email));

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        
        if (!user.verified) {
             return res.status(401).json({ message: "Please verify your email address first" });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
            expiresIn: "7d", // Longer session
        });

        let userData: any = {};
        Object.keys(user).forEach((key) => {
            if (key !== "passwordHash" && key !== "verificationToken") {
                userData[key] = user[key as keyof User];
            }
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json(userData);
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const verifyUser = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        const [user] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, decoded.userId));

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let userData: any = {};
        Object.keys(user).forEach((key) => {
            if (key !== "passwordHash") {
                userData[key] = user[key as keyof User];
            }
        });

        res.status(200).json(userData);
    } catch (error) {
        // console.error("Verify user error:", error);
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.query;

        if (!token || typeof token !== "string") {
            return res.status(400).send("Invalid verification token");
        }

        const [user] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.verificationToken, token));

        if (!user) {
             return res.status(404).send("Invalid or expired verification token");
        }

        // Verify User
        await db
            .update(usersTable)
            .set({ verified: true, verificationToken: null } as any)
            .where(eq(usersTable.id, user.id));

        // Log them in immediately
        const jwtToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
            expiresIn: "7d",
        });

        res.cookie("token", jwtToken, {
             httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Redirect to Frontend Explore Page
        res.redirect(`${FRONTEND_URL}/explore?verified=true`);
    } catch (error) {
        console.error("Verify email error:", error);
         res.status(500).send("Internal server error during verification");
    }
};

