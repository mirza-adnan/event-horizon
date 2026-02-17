import { Request, Response } from "express";
import db from "../db";
import { externalEventsTable, usersTable, notificationsTable } from "../db/schema";
import { eq, desc, and, or, asc, type SQL } from "drizzle-orm";
import { scrapeEventsWithoutLogin, scrapeFacebookEvents } from "../utils/scraper";
import CATEGORIES from "../utils/categories";
import { generateEmbedding } from "../utils/embeddings";
import { updateUserInterest } from "../utils/user-interests";
import { sql } from "drizzle-orm";
import { Groq } from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const generateSlug = (title: string) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
};

export const scrapeAndSeedEvents = async (req: Request, res: Response) => {
    try {
        // 0. Cleanup: Delete past external events
        await db.delete(externalEventsTable).where(sql`${externalEventsTable.startDate} < NOW()`);

        console.log("Starting scrape and seed...");
        const rawEvents = await scrapeFacebookEvents();

        // 1. Filter: Remove "Happening now"
        const filteredRawEvents = rawEvents.filter((e: any) => {
            const dateStr = e.date ? e.date.toLowerCase() : "";
            return !dateStr.includes("happening now");
        });

        if (filteredRawEvents.length === 0) {
            return res.json({ message: "No events found to process", added: 0 });
        }

        // 2. Filter out duplicates (events already in DB)
        const existingSlugs = await db
            .select({ slug: externalEventsTable.slug })
            .from(externalEventsTable);
        const existingSlugSet = new Set(existingSlugs.map((e) => e.slug));

        // Note: We need to generate a slug to check against DB one-to-one.
        // Since we don't have the final slug yet (LLM cleans title), we can try to filter by Link if available,
        // or just rely on a "best guess" slug from the raw title.
        // Better: Filter by Link since that is unique and extracted directly.
        
        const existingLinks = await db
            .select({ link: externalEventsTable.link })
            .from(externalEventsTable);
        const existingLinkSet = new Set(existingLinks.map((e) => e.link));

        const uniqueEvents = filteredRawEvents.filter((e: any) => {
             // Check Link
             if (existingLinkSet.has(e.link)) return false;
             
             // Check Slug (Basic version)
             const rawSlug = generateSlug(e.title);
             if (existingSlugSet.has(rawSlug)) return false;

             return true;
        });

        console.log(`Filtered duplicates. Raw: ${filteredRawEvents.length}, Unique: ${uniqueEvents.length}`);

        if (uniqueEvents.length === 0) {
            return res.json({ message: "No new events found", added: 0 });
        }

        // 3. Limit for LLM (Increased to 15)
        const eventsToProcess = uniqueEvents.slice(0, 15);

        // 4. Groq LLM Processing
        const prompt = `
        You are an intelligent event assistant.
        Refine the following list of events.
        
        TASKS:
        1. Filter for PRODUCTIVE events only: competitions, hackathons, fests, seminars, workshops, olympiads, conferences, research, networking, career. Discard purely casual parties or unrelated listings.
        2. Format the date into a JavaScript acceptable Date string (ISO 8601 preferred) based on the current year 2026. Use context like "Sat, 23 Oct" -> "2026-10-23".
        3. Assign relevant CATEGORIES from this list (use slugs): ${CATEGORIES.map(
            (c) => c.slug
        ).join(", ")}.
        4. Determine if isOnline (boolean).
       
        INPUT DATA:
        ${JSON.stringify(eventsToProcess)}

        OUTPUT FORMAT:
        Return ONLY a JSON array of objects.
        Schema:
        [
          {
            "title": "string",
            "startDate": "ISO-8601 string",
            "imageUrl": "string",
            "location": "string",
            "isOnline": boolean,
            "link": "string",
            "categories": ["slug1", "slug2"]
          }
        ]
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            response_format: { type: "json_object" },
        });

        const llmContent = chatCompletion.choices[0]?.message?.content;
        let processedEvents: any[] = [];

        try {
            const parsed = JSON.parse(llmContent || "{}");
            if (Array.isArray(parsed)) {
                processedEvents = parsed;
            } else if (parsed.events && Array.isArray(parsed.events)) {
                processedEvents = parsed.events;
            } else {
                const possibleArray = Object.values(parsed).find((val) =>
                    Array.isArray(val)
                );
                if (possibleArray) processedEvents = possibleArray as any[];
            }
        } catch (e) {
            console.error("Failed to parse LLM response", e);
            return res.status(500).json({ error: "Failed to parse LLM response" });
        }

        // 4. De-duplication and Insert
        let addedCount = 0;
        for (const event of processedEvents) {
            const slug = generateSlug(event.title);
            
            // Check if exists
            const existing = await db
                .select()
                .from(externalEventsTable)
                .where(eq(externalEventsTable.slug, slug));

            if (existing.length === 0) {
                const titlePart = (event.title + " ").repeat(2);
                const categoryPart = event.categories ? (event.categories.join(", ") + " ").repeat(3) : "";
                const textToEmbed = `${titlePart}\n${categoryPart}\n${event.description || ""}`;
                const embeddingVector = await generateEmbedding(textToEmbed);

                const [newEvent] = await db.insert(externalEventsTable).values({
                    title: event.title,
                    slug: slug,
                    description: event.description || "",
                    startDate: new Date(event.startDate),
                    imageUrl: event.imageUrl,
                    location: event.location,
                    isOnline: event.isOnline || false,
                    link: event.link.replace('web.facebook.com', 'www.facebook.com'),
                    categories: event.categories || [],
                    clicks: 0,
                    hovers: 0,
                    embedding: embeddingVector,
                }).returning();

                // Notify users with matching interests
                const similarity = sql<number>`1 - (${usersTable.embedding} <=> ${JSON.stringify(embeddingVector)})`;
                const matchingUsers = await db
                    .select({ id: usersTable.id })
                    .from(usersTable)
                    .where(sql`${similarity} > 0.5`);

                if (matchingUsers.length > 0) {
                    const notifications = matchingUsers.map((user) => ({
                        userId: user.id,
                        type: "announcement",
                        message: `New external event matches your interests: ${event.title}`,
                        link: `/events/${newEvent.id}`,
                    }));
                    await db.insert(notificationsTable).values(notifications);
                }
                addedCount++;
            }
        }

        res.json({ message: "Scrape and seed completed", added: addedCount });

    } catch (error: any) {
        console.error("Error in scrapeAndSeedEvents:", error);
        res.status(500).json({
            error: "Scraping failed",
            details: error.message,
        });
    }
};

export const getAllExternalEvents = async (req: Request, res: Response) => {
    try {
        const { q, page = 1, limit = 10, categories, radius, lat, lng } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const limitVal = Number(limit);
        const userLat = lat ? parseFloat(lat as string) : null;
        const userLng = lng ? parseFloat(lng as string) : null;
        const searchRadius = radius ? parseFloat(radius as string) : null;

        let categoryNames: string[] = [];
        if (categories) {
            if (Array.isArray(categories)) categoryNames = categories as string[];
            else categoryNames = [categories as string];
        }

        // Haversine formula for distance in KM
        const distanceExpr = userLat && userLng
            ? sql<number>`6371 * acos(cos(radians(${userLat})) * cos(radians(${externalEventsTable.latitude})) * cos(radians(${externalEventsTable.longitude}) - radians(${userLng})) + sin(radians(${userLat})) * sin(radians(${externalEventsTable.latitude})))`
            : null;

        // 1. Text Search / Interest Embedding
        let similarityExpr;
        if (q && typeof q === "string" && q.trim().length > 0) {
            const queryEmbedding = await generateEmbedding(q);
            similarityExpr = sql<number>`1 - (${externalEventsTable.embedding} <=> ${JSON.stringify(queryEmbedding)})`;
        } else {
            const userId = (req as any).userId;
            if (userId) {
                const [user] = await db.select({ embedding: usersTable.embedding }).from(usersTable).where(eq(usersTable.id, userId));
                if (user?.embedding) {
                    similarityExpr = sql<number>`1 - (${externalEventsTable.embedding} <=> ${JSON.stringify(user.embedding)})`;
                }
            }
        }

        // Build selection object
        const selection: any = {
            id: externalEventsTable.id,
            title: externalEventsTable.title,
            description: externalEventsTable.description,
            startDate: externalEventsTable.startDate,
            imageUrl: externalEventsTable.imageUrl,
            location: externalEventsTable.location,
            isOnline: externalEventsTable.isOnline,
            link: externalEventsTable.link,
            categories: externalEventsTable.categories,
            latitude: externalEventsTable.latitude,
            longitude: externalEventsTable.longitude,
            clicks: externalEventsTable.clicks,
            hovers: externalEventsTable.hovers,
        };
        if (distanceExpr) selection.distance = distanceExpr;
        if (similarityExpr) selection.similarity = similarityExpr;

        let query = db
            .select(selection)
            .from(externalEventsTable)
            .$dynamic();

        const conditions: any[] = [];
        if (similarityExpr && q) {
             conditions.push(sql`${similarityExpr} > 0.25`);
        }

        if (categoryNames.length > 0) {
             conditions.push(sql`${externalEventsTable.categories} ?| ${categoryNames}`);
        }

        if (distanceExpr && searchRadius) {
            conditions.push(sql`${distanceExpr} <= ${searchRadius}`);
        }

        // 4. Time Filter: Only upcoming events
        conditions.push(sql`${externalEventsTable.startDate} >= NOW()`);

        // 5. Ranking
        let orderBy = [];
        if (similarityExpr && distanceExpr) {
            // Blend interest similarity (70%) with proximity (30%) only for events that have coordinates.
            const blendedScore = sql`CASE 
                WHEN ${externalEventsTable.latitude} IS NOT NULL THEN (${similarityExpr} * 0.7) + ((1 / (1 + ${distanceExpr})) * 0.3)
                ELSE ${similarityExpr}
            END`;
            orderBy.push(desc(blendedScore));
        } else if (similarityExpr) {
            orderBy.push(desc(similarityExpr));
        } else if (distanceExpr) {
            orderBy.push(asc(distanceExpr));
        }
        orderBy.push(desc(externalEventsTable.startDate));

        const results = await query
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(...orderBy)
            .limit(limitVal)
            .offset(offset);

        res.json({ events: results });
    } catch (error) {
        console.error("Error fetching external events:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteExternalEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await db.delete(externalEventsTable).where(eq(externalEventsTable.id, id));
        res.json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting external event:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const trackEventStats = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { type, userId } = req.body; // 'click' or 'hover'

        if (type === 'click') {
            await db.execute(
                `UPDATE external_events SET clicks = clicks + 1 WHERE id = '${id}'`
            );

            // PERSONALIZATION: If userId is provided, update user interest embedding
            // Weight: 0.1 (Low - External Click)
            if (userId) {
                try {
                    const [event] = await db
                        .select()
                        .from(externalEventsTable)
                        .where(eq(externalEventsTable.id, id));
                    
                    if (event) {
                        const titlePart = (event.title + " ").repeat(2);
                        const categoryPart = event.categories ? (event.categories.join(", ") + " ").repeat(3) : "";
                        const textToEmbed = `${titlePart}\n${categoryPart}\n${event.description || ""}`;
                        
                        await updateUserInterest(userId, textToEmbed, 0.1, "EXTERNAL_CLICK");
                    }
                } catch (interestError) {
                    console.error("Failed to update user interest from external click:", interestError);
                }
            }
        } else if (type === 'hover') {
            await db.execute(
                `UPDATE external_events SET hovers = hovers + 1 WHERE id = '${id}'`
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Error tracking stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
