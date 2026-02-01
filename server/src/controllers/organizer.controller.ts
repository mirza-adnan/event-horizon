import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq, or, ilike, and } from "drizzle-orm";
import db from "../db";
import { orgsTable } from "../db/schema";
import fs from "fs";
import { sendOrganizerVerification } from "../utils/sendEmail";

const JWT_SECRET = process.env.JWT_SECRET!;

export const organizerRegister = async (req: Request, res: Response) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            address,
            city,
            country,
            website,
            description,
        } = req.body;
        const proofFile = req.file; // This is the uploaded file object from multer

        if (!name || !email || !password || !phone || !proofFile) {
            return res
                .status(400)
                .json({ message: "All required fields must be provided" });
        }

        // Make the file path relative to the uploads directory
        const relativePath = proofFile.path
            .replace(process.cwd(), "")
            .replace(/\\/g, "/");

        const [existingOrg] = await db
            .select()
            .from(orgsTable)
            .where(
                or(
                    eq(orgsTable.name, name),
                    eq(orgsTable.email, email),
                    eq(orgsTable.phone, phone)
                )
            );

        if (existingOrg) {
            return res
                .status(409)
                .json({
                    message:
                        "Organizer with this name, email, or phone already exists",
                });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [newOrg] = await db
            .insert(orgsTable)
            .values({
                name,
                email,
                passwordHash: hashedPassword,
                phone,
                address,
                city,
                country,
                website,
                description,
                proofUrl: relativePath, // Store the relative path
                verified: false,
            })
            .returning();

        // Send confirmation email
        sendOrganizerVerification(newOrg.name, newOrg.email, newOrg.id);

        const token = jwt.sign({ orgId: newOrg.id }, JWT_SECRET, {
            expiresIn: "1h",
        });

        res.cookie("org_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000,
            path: "/",
        });

        res.status(201).json({
            message:
                "Organizer registered successfully. Please check your email to verify your account.",
            organizer: {
                id: newOrg.id,
                name: newOrg.name,
                email: newOrg.email,
                status: newOrg.status,
                verified: newOrg.verified,
            },
        });
    } catch (error) {
        console.error("Organizer registration error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export async function organizerLogin(req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const [org] = await db
            .select()
            .from(orgsTable)
            .where(eq(orgsTable.email, email));

        if (!org) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            org.passwordHash
        );

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Check if the organizer's email is verified
        if (!org.verified) {
            return res.status(403).json({
                error: "Email not verified. Please check your email.",
            });
        }

        // Check if the organizer account is rejected
        if (org.status === "rejected") {
            return res
                .status(403)
                .json({ error: "Organizer account is rejected" });
        } else if (org.status === "pending") {
            return res
                .status(403)
                .json({ error: "Organizer account is pending admin approval" });
        }

        const token = jwt.sign({ orgId: org.id }, JWT_SECRET, {
            expiresIn: "1h",
        });

        res.cookie("org_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000,
            path: "/",
        });

        res.status(200).json({
            organizer: {
                id: org.id,
                name: org.name,
                email: org.email,
                phone: org.phone,
                address: org.address,
                city: org.city,
                country: org.country,
                website: org.website,
                description: org.description,
                status: org.status,
                verified: org.verified,
                createdAt: org.createdAt,
            },
        });
    } catch (error) {
        console.error("Error in organizer login:", error);
        res.status(500).json({ error: "Error in organizer login" });
    }
}

export async function validateOrganizerBasic(req: Request, res: Response) {
    try {
        const { name, email, phone } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({
                message: "name, email and phone are required",
            });
        }

        const existing = await db
            .select({
                name: orgsTable.name,
                email: orgsTable.email,
                phone: orgsTable.phone,
            })
            .from(orgsTable)
            .where(
                or(
                    eq(orgsTable.name, name),
                    eq(orgsTable.email, email),
                    eq(orgsTable.phone, phone)
                )
            )
            .limit(1);

        if (existing.length > 0) {
            const match = existing[0];

            if (match.name === name) {
                return res.status(409).json({
                    field: "name",
                    message: "Organizer name already exists",
                });
            }

            if (match.email === email) {
                return res.status(409).json({
                    field: "email",
                    message: "Email already exists",
                });
            }

            if (match.phone === phone) {
                return res.status(409).json({
                    field: "phone",
                    message: "Phone number already exists",
                });
            }
        }

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error("validateOrganizerBasic error:", err);
        return res.status(500).json({
            message: "Validation failed",
        });
    }
}

export const verifyOrganizerEmail = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Find the organizer by ID
        const [organizer] = await db
            .select()
            .from(orgsTable)
            .where(eq(orgsTable.id, id));

        if (!organizer) {
            return res.status(404).json({
                message: "Organizer not found",
            });
        }

        // Check if already verified
        if (organizer.verified) {
            // Redirect to frontend login if already verified
            return res.redirect(302, "http://localhost:5173/organizers/login");
        }

        // Update the organizer's verified status
        await db
            .update(orgsTable)
            .set({ verified: true })
            .where(eq(orgsTable.id, id));

        // Redirect to frontend login after successful verification
        res.redirect(302, "http://localhost:5173/organizers/login");
    } catch (error) {
        console.error("Email verification error:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const searchOrganizers = async (req: Request, res: Response) => {
    console.log("searchOrganizers");
    try {
        const { q } = req.query;
        if (!q || typeof q !== "string") {
            return res.json({ organizers: [] });
        }

        const organizers = await db
            .select({
                id: orgsTable.id,
                name: orgsTable.name,
                description: orgsTable.description,
                city: orgsTable.city,
                country: orgsTable.country,
            })
            .from(orgsTable)
            .where(
                or(
                    ilike(orgsTable.name, `%${q}%`),
                    ilike(orgsTable.description, `%${q}%`)
                )
            )
            .limit(20);

        console.log("organizers:", organizers);

        res.json({ organizers });
    } catch (error) {
        console.error("Search organizers error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
