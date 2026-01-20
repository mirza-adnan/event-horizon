import { Request, Response } from "express";
import db from "../db";
import { externalEventsTable } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { scrapeEventsWithoutLogin, scrapeFacebookEvents } from "../utils/scraper";
import CATEGORIES from "../utils/categories";
import { generateEmbedding } from "../utils/embeddings";
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
        console.log("Starting scrape and seed...");
        const rawEvents = await scrapeEventsWithoutLogin();

        // 1. Filter: Remove "Happening now"
        const filteredRawEvents = rawEvents.filter((e: any) => {
            const dateStr = e.date ? e.date.toLowerCase() : "";
            return !dateStr.includes("happening now");
        });

        if (filteredRawEvents.length === 0) {
            return res.json({ message: "No events found to process", added: 0 });
        }

        // 2. Limit for LLM (as per previous request)
        const eventsToProcess = filteredRawEvents.slice(0, 10);

        // 3. Groq LLM Processing
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
                const textToEmbed = `${event.title}\n${event.description || ""}\n${
                    event.categories ? event.categories.join(", ") : ""
                }`;
                const embeddingVector = await generateEmbedding(textToEmbed);

                await db.insert(externalEventsTable).values({
                    title: event.title,
                    slug: slug,
                    description: event.description || "",
                    startDate: new Date(event.startDate),
                    imageUrl: event.imageUrl,
                    location: event.location,
                    isOnline: event.isOnline || false,
                    link: event.link,
                    categories: event.categories || [],
                    clicks: 0,
                    hovers: 0,
                    embedding: embeddingVector,
                });
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
        const { q } = req.query;

        let events;

        if (q && typeof q === "string" && q.trim().length > 0) {
            const queryEmbedding = await generateEmbedding(q);
             // Use cosine distance for similarity sort
            events = await db
                .select()
                .from(externalEventsTable)
                .orderBy(sql`${externalEventsTable.embedding} <=> ${JSON.stringify(queryEmbedding)}`);
        } else {
            events = await db
                .select()
                .from(externalEventsTable)
                .orderBy(desc(externalEventsTable.startDate));
        }

        res.json({ events });
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
        const { type } = req.body; // 'click' or 'hover'

        if (type === 'click') {
            await db.execute(
                `UPDATE external_events SET clicks = clicks + 1 WHERE id = '${id}'`
            );
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
