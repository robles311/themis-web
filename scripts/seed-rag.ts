#!/usr/bin/env npx tsx
/**
 * Seed script for populating the vector database with legal documents.
 *
 * Usage:
 *   npx tsx scripts/seed-rag.ts
 *
 * Prerequisites:
 *   - DATABASE_URL environment variable must be set
 *   - PostgreSQL with pgvector extension must be running
 *   - Dependencies installed: pg, @types/pg
 */
import { ensureTable, storeDocument, closePool } from "@/lib/rag";
import { SEED_DOCUMENTS } from "@/lib/seed-docs";

async function main(): Promise<void> {
  console.log("=".repeat(60));
  console.log("  LEGAL ASSISTANT - RAG Database Seeder");
  console.log("=".repeat(60));
  console.log();

  // Validate DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("ERROR: DATABASE_URL environment variable is not set.");
    console.error("Usage: DATABASE_URL=postgresql://user:pass@host:5432/db npx tsx scripts/seed-rag.ts");
    process.exit(1);
  }

  console.log(`[1/4] Connecting to database...`);
  console.log(`      Host: ${extractHost(databaseUrl)}`);

  try {
    // Step 1: Ensure the table and extension exist
    console.log(`[2/4] Ensuring documents table exists...`);
    await ensureTable();
    console.log(`      ✓ Table ready`);

    // Step 2: Seed documents
    console.log(`[3/4] Seeding ${SEED_DOCUMENTS.length} documents...`);
    console.log();

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < SEED_DOCUMENTS.length; i++) {
      const doc = SEED_DOCUMENTS[i];
      const progress = `[${i + 1}/${SEED_DOCUMENTS.length}]`;

      try {
        process.stdout.write(`  ${progress} ${doc.title}... `);
        await storeDocument({
          specialty: doc.specialty,
          code_name: doc.code_name,
          article_number: doc.article_number,
          title: doc.title,
          content: doc.content,
        });
        console.log("✓");
        successCount++;
      } catch (docError) {
        console.log("✗");
        console.error(`  Error storing document "${doc.title}":`, docError);
        errorCount++;
      }
    }

    console.log();
    console.log(`[4/4] Seeding complete.`);
    console.log(`      ✓ ${successCount} documents seeded successfully`);
    if (errorCount > 0) {
      console.log(`      ✗ ${errorCount} documents failed`);
    }

    await closePool();

    console.log();
    console.log("=".repeat(60));
    console.log(`  DONE - ${successCount}/${SEED_DOCUMENTS.length} documents stored`);
    console.log("=".repeat(60));

    if (errorCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error();
    console.error("FATAL ERROR during seeding:");
    console.error(error);
    try {
      await closePool();
    } catch {
      // ignore close errors on fatal exit
    }
    process.exit(1);
  }
}

/**
 * Extract host information from a database URL for display.
 */
function extractHost(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}:${parsed.port || "5432"}`;
  } catch {
    return url;
  }
}

// Run the main function
main();
