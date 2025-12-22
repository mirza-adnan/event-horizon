import { categoriesTable } from "../../db/schema";
import { drizzle } from "drizzle-orm/node-postgres";

async function seedCategories() {
    try {
        const db = drizzle("database url here");
        const categoriesToSeed = [
            { name: "Tech", slug: "tech" },
            { name: "Business", slug: "business" },
            { name: "Education", slug: "education" },
            { name: "Science", slug: "science" },
            { name: "Arts", slug: "arts" },
            { name: "Sports", slug: "sports" },
            { name: "Music", slug: "music" },
            { name: "Gaming", slug: "gaming" },
            { name: "Health", slug: "health" },
            { name: "Environment", slug: "environment" },
            { name: "Social", slug: "social" },
            { name: "Innovation", slug: "innovation" },
            { name: "Startup", slug: "startup" },
            { name: "Conference", slug: "conference" },
            { name: "Workshop", slug: "workshop" },
            { name: "Seminar", slug: "seminar" },
            { name: "Competition", slug: "competition" },
            { name: "Quiz", slug: "quiz" },
            { name: "Networking", slug: "networking" },
            { name: "Career", slug: "career" },
            { name: "Research", slug: "research" },
            { name: "Entertainment", slug: "entertainment" },
            { name: "Food", slug: "food" },
            { name: "Travel", slug: "travel" },
            { name: "Fashion", slug: "fashion" },
            { name: "Design", slug: "design" },
            { name: "Media", slug: "media" },
            { name: "Politics", slug: "politics" },
            { name: "Economics", slug: "economics" },
            { name: "Law", slug: "law" },
            { name: "Philosophy", slug: "philosophy" },
            { name: "Psychology", slug: "psychology" },
            { name: "Religion", slug: "religion" },
            { name: "Culture", slug: "culture" },
            { name: "Community", slug: "community" },
        ];
        console.log("Seeding categories...");
        await db.insert(categoriesTable).values(categoriesToSeed);
        console.log(
            `${categoriesToSeed.length} categories seeded successfully!`
        );
    } catch (error) {
        console.error("Error seeding categories:", error);
        throw error;
    }
}
seedCategories().catch(console.error);
