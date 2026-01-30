import db from "./db";
import { eventsTable, eventCategoriesTable, externalEventsTable } from "./db/schema";
import { eq } from "drizzle-orm";
import { generateEmbedding } from "./utils/embeddings";

async function backfill() {
    console.log("Starting full backfill for all event embeddings...");
    
    // 1. Platform Events
    const events = await db.select().from(eventsTable);
    console.log(`Updating ${events.length} platform events...`);
    for (const event of events) {
        try {
            const categories = await db
                .select({ name: eventCategoriesTable.categoryName })
                .from(eventCategoriesTable)
                .where(eq(eventCategoriesTable.eventId, event.id));
            
            const categoryNames = categories.map(c => c.name).join(", ");
            const titlePart = (event.title + " ").repeat(2);
            const categoryPart = (categoryNames + " ").repeat(3);
            const textToEmbed = `${titlePart}\n${categoryPart}\n${event.description}`;
            const embedding = await generateEmbedding(textToEmbed);
            await db.update(eventsTable).set({ embedding }).where(eq(eventsTable.id, event.id));
        } catch (e) { console.error(e); }
    }

    // 2. External Events
    const externalEvents = await db.select().from(externalEventsTable);
    console.log(`Updating ${externalEvents.length} external events...`);
    for (const event of externalEvents) {
        try {
            const categoryNames = event.categories ? event.categories.join(", ") : "";
            const titlePart = (event.title + " ").repeat(2);
            const categoryPart = (categoryNames + " ").repeat(3);
            const textToEmbed = `${titlePart}\n${categoryPart}\n${event.description || ""}`;
            const embedding = await generateEmbedding(textToEmbed);
            await db.update(externalEventsTable).set({ embedding }).where(eq(externalEventsTable.id, event.id));
        } catch (e) { console.error(e); }
    }

    console.log("Full backfill completed!");
    process.exit(0);
}

backfill();
