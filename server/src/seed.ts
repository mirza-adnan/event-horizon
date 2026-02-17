
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { faker } from "@faker-js/faker";
import * as schema from "./db/schema";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function seed() {
    console.log("🌱 Starting seed...");

    // 1. Clear existing data (optional, be careful in prod)
    // await db.delete(schema.segmentsTable);
    // await db.delete(schema.eventsTable);
    // await db.delete(schema.orgsTable);
    // await db.delete(schema.usersTable);

    // 2. Create Users
    console.log("Creating users...");
    const users = [];
    for (let i = 0; i < 5; i++) {
        const hashedPassword = await bcrypt.hash("password123", 10);
        const [user] = await db
            .insert(schema.usersTable)
            .values({
                email: faker.internet.email(),
                passwordHash: hashedPassword,
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                bio: faker.person.bio(),
                dateOfBirth: faker.date.birthdate().toISOString(),
                verified: true,
            })
            .returning();
        users.push(user);
    }

    // 3. Create Organizers
    console.log("Creating organizers...");
    const organizers = [];
    for (let i = 0; i < 3; i++) {
        const hashedPassword = await bcrypt.hash("orgpass123", 10);
        const [org] = await db
            .insert(schema.orgsTable)
            .values({
                name: faker.company.name() + " Events",
                email: faker.internet.email(),
                passwordHash: hashedPassword,
                phone: faker.phone.number(),
                address: faker.location.streetAddress(),
                city: faker.location.city(),
                country: "Bangladesh",
                description: faker.company.catchPhrase(),
                status: "verified",
                verified: true,
            })
            .returning();
        organizers.push(org);
    }

    // 4. Create Events
    console.log("Creating events...");

    // Event 1: Single Segment, Offline (Hackathon)
    const [event1] = await db
        .insert(schema.eventsTable)
        .values({
            title: "Dhaka Tech Hackathon 2026",
            description: "A 24-hour intense coding competition for students.",
            address: "ICCB, Dhaka",
            city: "Dhaka",
            startDate: new Date("2026-03-15"),
            endDate: new Date("2026-03-16"),
            status: "published",
            isOnline: false,
            hasMultipleSegments: false,
            organizerId: organizers[0].id,
            registrationFee: 500,
        })
        .returning();

    await db.insert(schema.segmentsTable).values({
        name: "Main Hackathon",
        description: "The core hacking duration.",
        startTime: new Date("2026-03-15T09:00:00Z"),
        endTime: new Date("2026-03-16T09:00:00Z"),
        eventId: event1.id,
        isTeamSegment: true,
        minTeamSize: 3,
        maxTeamSize: 5,
        registrationFee: 500,
        isOnline: false,
    });

    // Event 2: Multi-Segment, Online (Workshop Series)
    const [event2] = await db
        .insert(schema.eventsTable)
        .values({
            title: "Full Stack Mastery Series",
            description: "A series of webinars on modern web development.",
            city: "Online",
            country: "Global",
            startDate: new Date("2026-04-01"),
            endDate: new Date("2026-04-05"),
            status: "published",
            isOnline: true,
            hasMultipleSegments: true,
            organizerId: organizers[1].id,
            registrationFee: 0,
        })
        .returning();

    await db.insert(schema.segmentsTable).values([
        {
            name: "Session 1: React Basics",
            description: "Introduction to components and state.",
            startTime: new Date("2026-04-01T14:00:00Z"),
            endTime: new Date("2026-04-01T16:00:00Z"),
            eventId: event2.id,
            isTeamSegment: false,
            registrationFee: 0,
            isOnline: true,
        },
        {
            name: "Session 2: Advanced Backend",
            description: "Node.js and Database optimization.",
            startTime: new Date("2026-04-03T14:00:00Z"),
            endTime: new Date("2026-04-03T16:00:00Z"),
            eventId: event2.id,
            isTeamSegment: false,
            registrationFee: 50, // Paid segment
            isOnline: true,
        },
    ]);

    // Event 3: Hybrid / Mixed (Robotics Comp)
    const [event3] = await db
        .insert(schema.eventsTable)
        .values({
            title: "National Robotics League",
            description: "Battle of the bots.",
            address: "BUET Auditorium",
            city: "Dhaka",
            startDate: new Date("2026-05-10"),
            endDate: new Date("2026-05-12"),
            status: "published",
            isOnline: false,
            hasMultipleSegments: true,
            organizerId: organizers[2].id,
            registrationFee: 2000,
        })
        .returning();

    await db.insert(schema.segmentsTable).values([
        {
            name: "Qualifying Round (Online)",
            description: "Technical quiz and simulation.",
            startTime: new Date("2026-05-01T10:00:00Z"),
            endTime: new Date("2026-05-01T14:00:00Z"),
            eventId: event3.id,
            isTeamSegment: true,
            minTeamSize: 2,
            maxTeamSize: 4,
            isOnline: true,
        },
        {
            name: "Final Showdown",
            description: "Physical battle at the venue.",
            startTime: new Date("2026-05-12T09:00:00Z"),
            endTime: new Date("2026-05-12T18:00:00Z"),
            eventId: event3.id,
            isTeamSegment: true,
            minTeamSize: 2,
            maxTeamSize: 4,
            isOnline: false,
        },
    ]);

    console.log("✅ Seed completed successfully!");
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
