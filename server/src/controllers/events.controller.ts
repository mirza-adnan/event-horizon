import { Request, Response } from "express";
import db from "../db";
import {
    eventsTable,
    categoriesTable,
    eventCategoriesTable,
    segmentsTable,
} from "../db/schema";
import { eq, and, or, desc } from "drizzle-orm";
import axios from "axios";
import { Groq } from "groq-sdk";
import * as cheerio from "cheerio";
import puppeteer, { type ElementHandle } from "puppeteer";
import { scrapeEventsWithoutLogin, scrapeFacebookEvents } from "../utils/scraper";
import CATEGORIES from "../utils/categories";
import { generateEmbedding } from "../utils/embeddings";
import { sql } from "drizzle-orm";

export const createEvent = async (req: Request, res: Response) => {
    try {
        // Extract fields from the request body
        const {
            title,
            description,
            address,
            city,
            country = "Bangladesh",
            startDate,
            endDate,
            status = "draft",
            isOnline = false,
            hasMultipleSegments = true,
        } = req.body;

        // Handle categoryNames - it can come as a string, array, or multiple fields
        // ... (rest of simple parsing)
        let categoryNames: string[] = [];
        if (req.body.categoryNames) {
            if (Array.isArray(req.body.categoryNames)) {
                categoryNames = req.body.categoryNames;
            } else if (typeof req.body.categoryNames === "string") {
                try {
                    // Try parsing if it's a JSON string
                    const parsed = JSON.parse(req.body.categoryNames);
                    if (Array.isArray(parsed)) categoryNames = parsed;
                    else categoryNames = [req.body.categoryNames];
                } catch {
                     categoryNames = [req.body.categoryNames];
                }
            }
        }

        // Handle segments - data can come as JSON string or object
        let segments: Array<{
            id?: number; // Optional ID for updates
            name: string;
            description: string;
            startTime: string;
            endTime: string;
            capacity: number;
            categoryId: string;
            isTeamSegment: boolean;
            isOnline: boolean;
            registrationDeadline?: string;
            minTeamSize?: number;
            maxTeamSize?: number;
        }> = [];

        if (req.body.segments) {
             if (typeof req.body.segments === "string") {
                try {
                    segments = JSON.parse(req.body.segments);
                } catch (parseError) {
                    console.error("Segment parse error", parseError);
                }
            } else if (Array.isArray(req.body.segments)) {
                segments = req.body.segments;
            }
        }

        if (endDate && new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({
                message: "End date must be greater than or equal to start date",
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (new Date(startDate) < today) {
            return res.status(400).json({
                message: "Event start date cannot be in the past",
            });
        }

        const organizerId = (req as any).organizer?.id;
        if (!organizerId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Handle banner file upload if present
        let bannerUrl: string | undefined;
        if (req.file) {
            // Convert absolute path to relative path
            bannerUrl = req.file.path
                .replace(process.cwd(), "")
                .replace(/\\/g, "/");
        }

        if (categoryNames.length > 0) {
            const existingCategories = await db
                .select({ name: categoriesTable.name })
                .from(categoriesTable)
                .where(
                    or(
                        ...categoryNames.map((name) => {
                            console.log("name", name);
                            return eq(categoriesTable.name, name);
                        })
                    )
                );

            const existingCategoryNames = existingCategories.map(
                (cat) => cat.name
            );
            const missingCategories = categoryNames.filter(
                (name) => !existingCategoryNames.includes(name)
            );

            console.log(existingCategories);
            console.log(existingCategoryNames);

            if (missingCategories.length > 0) {
                return res.status(400).json({
                    message: `Categories do not exist: ${missingCategories.join(
                        ", "
                    )}`,
                });
            }
        }

        // Validate segments if provided
        if (segments.length > 0) {
            const eventStartDate = new Date(startDate);
            
            for (const segment of segments) {
                // Check segment start time is not before event start
                if (segment.startTime) {
                    const segmentStart = new Date(segment.startTime);
                    if (segmentStart < eventStartDate) {
                        return res.status(400).json({
                            message: "Segment start time cannot be before event start date"
                        });
                    }

                    // Check if segment start time is in the past
                    // We interpret "not before present date" as roughly today or future.
                    // Using the same 'today' (midnight) check ensures segments aren't on previous days.
                    // If stricter check (now) is needed, use new Date() directly.
                    if (segmentStart < today) {
                        return res.status(400).json({
                            message: "Segment start time cannot be in the past",
                        });
                    }
                }
                
                if (
                    segment.endTime &&
                    segment.endTime.trim() &&
                    new Date(segment.endTime) < new Date(segment.startTime)
                ) {
                    return res.status(400).json({
                        message:
                            "Segment end time must be greater than or equal to start time",
                    });
                }

                if (segment.categoryId) {
                    // Check if category exists
                    const [category] = await db
                        .select({ name: categoriesTable.name })
                        .from(categoriesTable)
                        .where(eq(categoriesTable.name, segment.categoryId));

                    if (!category) {
                        return res.status(400).json({
                            message: `Category does not exist: ${segment.categoryId}`,
                        });
                    }
                }

                // Validate team size fields if isTeamSegment is true
                if (segment.isTeamSegment) {
                    if (
                        segment.minTeamSize === undefined ||
                        segment.minTeamSize < 1
                    ) {
                        return res.status(400).json({
                            message:
                                "Min team size must be at least 1 for team segments",
                        });
                    }

                    if (
                        segment.maxTeamSize === undefined ||
                        segment.maxTeamSize < 1
                    ) {
                        return res.status(400).json({
                            message:
                                "Max team size must be at least 1 for team segments",
                        });
                    }

                    if (segment.minTeamSize > segment.maxTeamSize) {
                        return res.status(400).json({
                            message:
                                "Min team size cannot be greater than max team size",
                        });
                    }
                }
            }
        }

        const result = await db.transaction(async (tx) => {
            const [newEvent] = await tx
                .insert(eventsTable)
                .values({
                    title,
                    description,
                    address,
                    city,
                    country,
                    startDate: new Date(startDate),
                    endDate: endDate ? new Date(endDate) : null,
                    status,
                    bannerUrl, // Use the relative path
                    isOnline: Boolean(isOnline),
                    hasMultipleSegments: Boolean(hasMultipleSegments),
                    organizerId,
                })
                .returning();

            // Generate Embedding for Semantic Search
            // We do this asynchronously to not block the response or outside the transaction if preferred, 
            // but for consistency we can do it here. 
            // Note: If OpenAI fails, we might still want the event created, but for now let's await it.
            try {
                const textToEmbed = `${title}\n${description}\n${categoryNames.join(", ")}`;
                const embeddingVector = await generateEmbedding(textToEmbed);
                
                await tx
                    .update(eventsTable)
                    .set({ embedding: embeddingVector })
                    .where(eq(eventsTable.id, newEvent.id));
            } catch (embedError) {
                console.error("Failed to generate embedding for new event:", embedError);
                // Proceed without embedding, can be backfilled later
            }

            if (categoryNames.length > 0) {
                const eventCategoryValues = categoryNames.map(
                    (categoryName) => ({
                        eventId: newEvent.id,
                        categoryName,
                    })
                );

                await tx
                    .insert(eventCategoriesTable)
                    .values(eventCategoryValues);
            }

            // Create segments if provided
            if (segments.length > 0) {
            
                // Additional validation for Multi Segment events
                if (hasMultipleSegments) {
                    // Check if at least one segment exists
                    // (Already checked by if (segments.length > 0), but good to keep in mind logic)
                }

                const segmentValues = segments.map((segment) => ({
                    name: segment.name,
                    description: segment.description,
                    startTime: new Date(segment.startTime),
                    endTime: segment.endTime && segment.endTime.trim() ? new Date(segment.endTime) : null,
                    capacity: segment.capacity,
                    isTeamSegment: segment.isTeamSegment,
                    isOnline: segment.isOnline,
                    registrationDeadline: segment.registrationDeadline
                        ? new Date(segment.registrationDeadline)
                        : null,
                    minTeamSize: segment.minTeamSize || null,
                    maxTeamSize: segment.maxTeamSize || null,
                    eventId: newEvent.id,
                    categoryId: segment.categoryId || null,
                }));

                await tx.insert(segmentsTable).values(segmentValues);
            }

            return newEvent;
        });

        res.status(201).json({
            message: "Event created.",
            event: result,
        });
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({
            error: "Internal server error",
        });
    }
};

export const getMyEvents = async (req: Request, res: Response) => {
    try {
        const organizerId = (req as any).organizer?.id;
        if (!organizerId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const events = await db
            .select()
            .from(eventsTable)
            .where(eq(eventsTable.organizerId, organizerId));

        res.json({ events });
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getEventById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const organizerId = (req as any).organizer?.id;
        
        if (!organizerId) {
             return res.status(401).json({ message: "Unauthorized" });
        }

        // Fetch Event
        const [event] = await db
            .select()
            .from(eventsTable)
            .where(eq(eventsTable.id, id));

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Basic authorization check
        if (event.organizerId !== organizerId) {
             return res.status(403).json({ message: "Forbidden" });
        }

        // Fetch Segments
        const segments = await db
            .select()
            .from(segmentsTable)
            .where(eq(segmentsTable.eventId, id));

        // Fetch Categories
        const eventCategories = await db
            .select({
                categoryName: eventCategoriesTable.categoryName,
            })
            .from(eventCategoriesTable)
            .where(eq(eventCategoriesTable.eventId, id));

        // Construct response object matching expected validation
        const fullEvent = {
            ...event,
            segments,
            eventCategories: eventCategories
        };

        res.json({ event: fullEvent });

    } catch (error) {
        console.error("Error fetching event:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const updateEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const organizerId = (req as any).organizer?.id;

        if (!organizerId) return res.status(401).json({ message: "Unauthorized" });

        // Verify ownership
        const [existingEvent] = await db.select().from(eventsTable).where(eq(eventsTable.id, id));
        if (!existingEvent) return res.status(404).json({ message: "Event not found" });
        if (existingEvent.organizerId !== organizerId) return res.status(403).json({ message: "Forbidden" });

        const {
            title,
            description,
            address,
            city,
            country,
            startDate,
            endDate,
            status,
            isOnline,
            hasMultipleSegments,
        } = req.body;

         // Handle banner
        let bannerUrl = existingEvent.bannerUrl;
        if (req.file) {
             bannerUrl = req.file.path.replace(process.cwd(), "").replace(/\\/g, "/");
        }

        // Handle Segments and Categories similar to create
        // Simplification for update: Delete all segments/categories and recreate? 
        // Or smart update? For Prototype, delete-recreate is safer/easier for segments if validation passes.
        // Actually, let's keep it robust.

         // ... (Parsing logic same as create - refactor to helper in real app) ...
         let segments: any[] = [];
         if (req.body.segments) {
             if (typeof req.body.segments === "string") {
                try {
                    segments = JSON.parse(req.body.segments);
                } catch (e) {}
             } else if (Array.isArray(req.body.segments)) {
                 segments = req.body.segments;
             }
         }
         
         let categoryNames: string[] = [];
         if (req.body.categoryNames) {
             if (typeof req.body.categoryNames === "string") {
                 try {
                     const parsed = JSON.parse(req.body.categoryNames);
                     if(Array.isArray(parsed)) categoryNames = parsed;
                     else categoryNames = [req.body.categoryNames];
                 } catch {
                     categoryNames = [req.body.categoryNames];
                 }
             } else if (Array.isArray(req.body.categoryNames)) {
                 categoryNames = req.body.categoryNames;
             }
         }

         // Validations
         if (endDate && new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({ message: "End date error" });
         }

         const today = new Date();
         today.setHours(0, 0, 0, 0);

         if (new Date(startDate) < today) {
             return res.status(400).json({
                 message: "Event start date cannot be in the past",
             });
         }
         
         if (segments.length > 0) {
             const eventStartDate = new Date(startDate);
             for (const segment of segments) {
                 if (segment.startTime) {
                     const segmentStart = new Date(segment.startTime);
                     if (segmentStart < eventStartDate) {
                         return res.status(400).json({
                             message: "Segment start time cannot be before event start date"
                         });
                     }
                     if (segmentStart < today) {
                         return res.status(400).json({
                             message: "Segment start time cannot be in the past",
                         });
                     }
                 }
             }
         }

        await db.transaction(async (tx) => {
            // Update Base Event
            await tx.update(eventsTable).set({
                title, description, address, city, country,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                status,
                bannerUrl,
                isOnline: Boolean(isOnline),
                hasMultipleSegments: Boolean(hasMultipleSegments),
                updatedAt: new Date()
            }).where(eq(eventsTable.id, id));

            // Update Categories: Delete all and re-insert
            await tx.delete(eventCategoriesTable).where(eq(eventCategoriesTable.eventId, id));
            if (categoryNames.length > 0) {
                 const catValues = categoryNames.map(name => ({ eventId: id, categoryName: name }));
                 await tx.insert(eventCategoriesTable).values(catValues);
            }

            // Update Segments: Delete all and re-insert
            // NOTE: In a real prod app, preserving IDs is better for related data (registrations).
            // But since this is Draft editing, it is acceptable to replace segments.
            await tx.delete(segmentsTable).where(eq(segmentsTable.eventId, id));
            
            if (segments.length > 0) {
                 const segmentValues = segments.map((segment) => ({
                    name: segment.name,
                    description: segment.description,
                    startTime: new Date(segment.startTime),
                    endTime: segment.endTime && segment.endTime.trim() ? new Date(segment.endTime) : null,
                    capacity: segment.capacity,
                    isTeamSegment: segment.isTeamSegment,
                    isOnline: segment.isOnline,
                    registrationDeadline: segment.registrationDeadline ? new Date(segment.registrationDeadline) : null,
                    minTeamSize: segment.minTeamSize || null,
                    maxTeamSize: segment.maxTeamSize || null,
                    eventId: id,
                    categoryId: segment.categoryId || null,
                }));
                await tx.insert(segmentsTable).values(segmentValues);
            }

            // Update Embedding
            try {
                // We need to re-fetch categories if we want to include them, 
                // but we have categoryNames array from earlier
                const textToEmbed = `${title}\n${description}\n${categoryNames.join(", ")}`;
                const embeddingVector = await generateEmbedding(textToEmbed);
                
                await tx
                    .update(eventsTable)
                    .set({ embedding: embeddingVector })
                    .where(eq(eventsTable.id, id));
            } catch (embedError) {
                console.error("Failed to generate embedding for updated event:", embedError);
            }
        });

        res.json({ message: "Event updated successfully" });

    } catch (error) {
        console.error("Update event error", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export const scrapeFacebookEvent = async (req: any, res: any) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: "URL is required" });

        console.log("here");

        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        await page.setUserAgent({
            userAgent: "Mozilla/5.0 (compatible; EventBot/1.0)",
        });

        // Navigate and wait for the content to actually load
        await page.goto(url, { waitUntil: "networkidle2" });

        // Wait for a common event element so we don't grab the splash screen
        // 'h1' is usually the event title
        try {
            await page.waitForSelector("h1", { timeout: 8000 });
        } catch (e) {
            console.log("Title not found, attempting to extract anyway...");
        }

        // 2. ROBUST "SEE MORE" CLICKING
        try {
             // Scroll down a bit to trigger lazy loading
            await page.evaluate(() => window.scrollBy(0, 500));
            await new Promise((r) => setTimeout(r, 1000));

            const clicked = await page.evaluate(async () => {
                const candidates = Array.from(document.querySelectorAll('div[role="button"], span, div, a'));
                const seeMoreBtn = candidates.find(el => {
                    const t = el.innerText?.toLowerCase().trim();
                    return (t === 'see more' || t === 'read more') && el.offsetParent !== null; // Check visibility
                });

                if (seeMoreBtn) {
                    (seeMoreBtn as HTMLElement).click();
                    return true;
                }
                return false;
            });

            if (clicked) {
                console.log("Clicked 'See more' button");
                await new Promise((r) => setTimeout(r, 1000)); // Wait for text expansion
            } else {
                console.log("'See more' button not found or not visible");
            }
        } catch (err) {
            console.log("Error trying to click See more:", err);
        }

        // 3. SEPARATE EXTRACTION: Text and First Image
        await new Promise((r) => setTimeout(r, 1000));

        const extractedDataFromPage = await page.evaluate(() => {
            const text = document.body.innerText.replace(/\s\s+/g, " ").trim();

            // Find cover photo
            const coverImg = document.querySelector(
                'img[data-imgperflogname="profileCoverPhoto"]'
            ) as HTMLImageElement;

            let imageUrl = null;
            if (coverImg) {
                // If srcset exists, get the highest res link. If not, take the src.
                const srcset = coverImg.getAttribute("srcset");
                if (srcset) {
                    const parts = srcset.split(",");
                    imageUrl = parts[parts.length - 1].trim().split(" ")[0];
                } else {
                    imageUrl = coverImg.src;
                }
            }

            return { cleanText: text, firstImageUrl: imageUrl };
        });

        await browser.close();

        // 4. Send to Groq with specific instructions for segments
        const chatCompletion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content:
                        "You are an expert at extracting event data. You will be provided with a text dump. Extract the event details.",
                },
                {
                    role: "user",
                    content: `
                        Analyze the following text and image URL to extract event details into JSON.
                        
                        CANDIDATE BANNER URL: ${
                            extractedDataFromPage.firstImageUrl
                        }

                        PAGE TEXT:
                        ${extractedDataFromPage.cleanText.substring(0, 15000)}

                        IMPORTANT: Check if this is a Multi-Segment Event (e.g. Schedule, multiple days, multiple sessions, hackathon timeline).
                        If strictly single segment, "segments" should be empty.

                        Assign relevant CATEGORIES from this list (use slugs): ${CATEGORIES.map(
                            (c) => c.slug
                        ).join(", ")}.

                        Return JSON structure:
                        {
                            "title": "Event Title",
                            "description": "Full event description summary",
                            "startDate": "YYYY-MM-DD",
                            "endDate": "YYYY-MM-DD",
                            "startTime": "HH:MM (24h)",
                            "endTime": "HH:MM (24h)",
                            "address": "Physical address",
                            "city": "City",
                            "country": "Country",
                            "bannerUrl": "Use candidate if valid, else null",
                            "isOnline": boolean,
                            "categoryNames": ["Tech", "workshop"],
                            "hasMultipleSegments": boolean,
                            "segments": [
                                {
                                    "name": "Session/Day Title",
                                    "description": "Details",
                                    "startTime": "YYYY-MM-DDTHH:mm:00.000Z" (ISO),
                                    "endTime": "YYYY-MM-DDTHH:mm:00.000Z" (ISO),
                                    "isOnline": boolean
                                    "category": one slug from the list
                                }
                            ]
                        }
                        
                        If exact times for segments are not found, set the startTime equal to the startDate of the event.
                     `,
                },
            ],

            response_format: { type: "json_object" },
            temperature: 0.1,
        });

        const extractedData = JSON.parse(
            chatCompletion.choices[0]?.message?.content || "{}"
        );

        // Convert category slugs to names
        if (extractedData.categoryNames && Array.isArray(extractedData.categoryNames)) {
            extractedData.categoryNames = extractedData.categoryNames.map((slug: string) => {
                const category = CATEGORIES.find(c => c.slug === slug.toLowerCase());
                return category ? category.name : slug;
            });
        }

        // Convert segment category slugs to names
        if (extractedData.segments && Array.isArray(extractedData.segments)) {
            extractedData.segments = extractedData.segments.map((seg: any) => {
                if (seg.category) {
                    const category = CATEGORIES.find(c => c.slug === seg.category.toLowerCase());
                    seg.category = category ? category.name : seg.category;
                }
                return seg;
            });
        }

        console.log("Extracted data:", extractedData);

        res.json({ eventData: extractedData });
    } catch (error: any) {
        res.status(500).json({
            error: "Scraping failed",
            details: error.message,
        });
    }
};

export const scrapeExternalEvents = async (req: Request, res: Response) => {
    try {
        console.log("Starting scrape...");
        const rawEvents = await scrapeEventsWithoutLogin();

        // 1. Local Filter: Remove "Happening now"
        const filteredRawEvents = rawEvents.filter((e: any) => {
            const dateStr = e.date ? e.date.toLowerCase() : "";
            return !dateStr.includes("happening now");
        });

        console.log(
            `Filtered ${
                rawEvents.length - filteredRawEvents.length
            } events (Happening now). Remaining: ${filteredRawEvents.length}`
        );

        if (filteredRawEvents.length === 0) {
            return res.json([]);
        }

        // 2. Groq LLM Processing
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
        ${JSON.stringify(filteredRawEvents.slice(0, 10))}

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

        console.log("Sending to Groq LLM...");
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            response_format: { type: "json_object" }, // Enforce JSON
        });

        const llmContent = chatCompletion.choices[0]?.message?.content;
        let processedEvents = [];

        try {
            // Sometimes models return { "events": [...] } or just [...]
            const parsed = JSON.parse(llmContent);
            if (Array.isArray(parsed)) {
                processedEvents = parsed;
            } else if (parsed.events && Array.isArray(parsed.events)) {
                processedEvents = parsed.events; // Handle wrapped response
            } else {
                // If the root object keys are indices or something else, try to find an array
                const possibleArray = Object.values(parsed).find((val) =>
                    Array.isArray(val)
                );
                if (possibleArray) processedEvents = possibleArray;
            }
        } catch (e) {
            console.error("Failed to parse LLM response", e);
            console.log("Raw LLM response:", llmContent);
        }

        console.log(
            `LLM returned ${processedEvents.length} productive events.`
        );
        console.log(processedEvents);
        res.json(processedEvents);
    } catch (error) {
        console.error("Error in /scrape-events:", error);
        res.status(500).json({
            error: "Scraping failed",
            details: error.message,
        });
    }
};

export const searchEvents = async (req: Request, res: Response) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const limitVal = Number(limit);

        let results;

        if (q && typeof q === "string" && q.trim().length > 0) {
             // Semantic Search
             const queryEmbedding = await generateEmbedding(q);
             // Use distance operator <=> (cosine distance)
             const similarity = sql<number>`1 - (${eventsTable.embedding} <=> ${JSON.stringify(queryEmbedding)})`;

             results = await db
                .select({
                    id: eventsTable.id,
                    title: eventsTable.title,
                    description: eventsTable.description,
                    startDate: eventsTable.startDate,
                    endDate: eventsTable.endDate,
                    bannerUrl: eventsTable.bannerUrl,
                    city: eventsTable.city,
                    country: eventsTable.country,
                    isOnline: eventsTable.isOnline,
                    similarity: similarity
                })
                .from(eventsTable)
                .where(and(
                    eq(eventsTable.status, "published"),
                    sql`${similarity} > 0.25` // Threshold for relevance
                ))
                .orderBy(sql`${similarity} DESC`)
                .limit(limitVal)
                .offset(offset);
        } else {
            // Default: List latest published events
            results = await db
                .select({
                     id: eventsTable.id,
                     title: eventsTable.title,
                     description: eventsTable.description,
                     startDate: eventsTable.startDate,
                     endDate: eventsTable.endDate,
                     bannerUrl: eventsTable.bannerUrl,
                     city: eventsTable.city,
                     country: eventsTable.country,
                     isOnline: eventsTable.isOnline,
                })
                .from(eventsTable)
                .where(eq(eventsTable.status, "published"))
                .orderBy(desc(eventsTable.createdAt))
                .limit(limitVal)
                .offset(offset);
        }

        res.json({ events: results });

    } catch (error: any) {
        console.error("Search error:", error);
        res.status(500).json({ message: "Search failed", error: error.message });
    }
}
