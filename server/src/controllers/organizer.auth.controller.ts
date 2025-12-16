import { Request, Response } from "express";
import bycrpt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq, or } from "drizzle-orm";
import db from "../db";
import { orgsTable } from "../db/schema";

const JWT_SECRET = process.env.JWT_SECRET!;

export const organizerSignup = async (req: Request, res: Response) => {
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
      proofOfExistenceUrl,
    } = req.body;

    if (!name || !email || !password || !phone ) {
      return res
        .status(400)
        .json({ error: "Missing required fields" });
    }

    const existingOrg = await db
      .select()
      .from(orgsTable)
      .where(eq(orgsTable.email, email) || eq(orgsTable.phone, phone)
      );

    if (existingOrg.length > 0) {
      return res
        .status(409)
        .json({ error: "Email already exists" });
    }

    const hashedPassword = await bycrpt.hash(password, 10);

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
        proofOfExistenceUrl,
        status: "pending"
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
          proofOfExistenceUrl: orgsTable.proofOfExistenceUrl,
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
      organizer: newOrg,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const organizerLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Missing required fields" });
    }

    const existingOrg = await db
      .select()
      .from(orgsTable)
      .where(eq(orgsTable.email, email));

    if (!existingOrg.length) {
      return res
        .status(404)
        .json({ error: "Organizer not found" });
    }

    const [org] = existingOrg;

    const isPasswordValid = await bycrpt.compare(password, org.passwordHash);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ error: "Invalid credentials" });
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
        proofOfExistenceUrl: org.proofOfExistenceUrl,
        status: org.status,
        createdAt: org.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const organizerLogout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("org_token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
