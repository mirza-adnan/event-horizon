import db from "../db";
import { usersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { generateEmbedding } from "./embeddings";

/**
 * Updates a user's interest embedding based on new interaction.
 * 
 * @param userId - The ID of the user
 * @param textToEmbed - The text content to generate an embedding for
 * @param weight - The weight of this new interaction (0 to 1). 
 *                 Higher weight means the new interest affects the profile more.
 *                 e.g. Registration = 0.5, Bookmark = 0.3, View = 0.1
 * @param actionType - For logging purposes (e.g., "Registration", "Bookmark")
 */
export const updateUserInterest = async (
    userId: string, 
    textToEmbed: string, 
    weight: number,
    actionType: string
) => {
    try {
        if (!textToEmbed || !textToEmbed.trim()) return;

        console.log(`[Interest Tracking] Processing ${actionType} for User ${userId} with weight ${weight}`);

        const interestEmbedding = await generateEmbedding(textToEmbed);

        const [user] = await db
            .select({ embedding: usersTable.embedding })
            .from(usersTable)
            .where(eq(usersTable.id, userId));

        if (!user) {
            console.error(`[Interest Tracking] User ${userId} not found`);
            return;
        }

        let finalEmbedding: number[];

        if (user.embedding) {
            // Weighted moving average
            // New = Old * (1 - weight) + Interest * weight
            const oldWeight = 1 - weight;
            
            finalEmbedding = user.embedding.map((val: number, i: number) => 
                (val * oldWeight) + (interestEmbedding[i] * weight)
            );

            // Normalize the vector (Cosine Similarity relies on unit vectors usually, 
            // but pgvector handles it. Normalizing is good practice for consistent weights).
            const magnitude = Math.sqrt(finalEmbedding.reduce((sum, val) => sum + val * val, 0));
            if (magnitude > 0) {
                finalEmbedding = finalEmbedding.map(val => val / magnitude);
            }
        } else {
            // First interaction becomes the baseline
            finalEmbedding = interestEmbedding;
        }

        await db
            .update(usersTable)
            .set({ embedding: finalEmbedding })
            .where(eq(usersTable.id, userId));
            
        console.log(`[Interest Tracking] Successfully updated embedding for ${actionType}`);

    } catch (error) {
        console.error(`[Interest Tracking] Failed to update for ${actionType}:`, error);
    }
};
