
import db from "./db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Fixing embedding column dimensions...");
  try {
    // Force the column to be dimension 384
    await db.execute(sql`ALTER TABLE events ALTER COLUMN embedding TYPE vector(384);`);
    console.log("Successfully altered events.embedding to vector(384)!");
  } catch (error) {
    console.error("Failed to alter column:", error);
  }
  process.exit(0);
}

main();
