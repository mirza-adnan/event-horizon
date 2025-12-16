import { Request, Response } from "express";
import bycrpt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq, or } from "drizzle-orm";
import db from "../db";
import { orgsTable } from "../db/schema";
import fs from "fs";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function organizerRegister(req: Request, res: Response) {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Proof of existence is required",
            });
        }

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

        if (!name || !email || !password || !phone) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: "Missing required fields" });
        }

        const existingOrg = await db
            .select()
            .from(orgsTable)
            .where(
                or(
                    eq(orgsTable.email, email),
                    eq(orgsTable.phone, phone),
                    eq(orgsTable.name, name)
                )
            );

        if (existingOrg.length > 0) {
            fs.unlinkSync(req.file.path);
            let problem = "";
            if (existingOrg[0].name === name) {
                problem = "name";
            } else if (existingOrg[0].email === email) {
                problem = "email";
            } else if (existingOrg[0].phone === phone) {
                problem = "phone number";
            }

            return res.status(409).json({
                message: `An organier with this ${problem} already exists.`,
            });
        }

        const proofUrl = `/uploads/organizers/${req.file.filename}`;

        const passwordHash = await bycrpt.hash(password, 10);

        const [newOrg] = await db
            .insert(orgsTable)
            .values({
                name,
                email,
                passwordHash,
                phone,
                address,
                city,
                country,
                website,
                description,
                proofUrl,
                status: "pending",
            })
            .returning({
                id: orgsTable.id,
                name: orgsTable.name,
                email: orgsTable.email,
                phone: orgsTable.phone,
                address: orgsTable.address,
                city: orgsTable.city,
                country: orgsTable.country,
                website: orgsTable.website,
                description: orgsTable.description,
                proofUrl: orgsTable.proofUrl,
                status: orgsTable.status,
                createdAt: orgsTable.createdAt,
            });

        const token = jwt.sign({ orgId: newOrg.id }, JWT_SECRET, {
            expiresIn: "1h",
        });

        res.cookie("org_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000,
        });

        res.status(201).json({
            message:
                "Your registration is successful and is pending admin approval",
            organizer: newOrg,
        });
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        console.error("Error in organizer registration:", error);
        res.status(500).json({ error: "Error in organizer registration" });
    }
}

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

        const isPasswordValid = await bycrpt.compare(
            password,
            org.passwordHash
        );

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        if (org.status == "rejected") {
            return res
                .status(403)
                .json({ error: "Organizer account is rejected" });
        }

        const token = jwt.sign({ orgId: org.id }, JWT_SECRET, {
            expiresIn: "1h",
        });

        res.cookie("org_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000,
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
                createdAt: org.createdAt,
            },
        });
    } catch (error) {
        console.error("Error in orgaizer login:", error);
        res.status(500).json({ error: "Error in organizer login" });
    }
}

export async function organizerLogout(req: Request, res: Response) {
    try {
        res.clearCookie("org_token");
        res.status(200).send();
    } catch (error) {
        console.error("Error in organizer logout:", error);
        res.status(500).json({ error: "Error in organizer logout" });
    }
}
