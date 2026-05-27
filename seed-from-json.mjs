#!/usr/bin/env node
/**
 * seed-from-json.mjs
 * Reads pre-computed embeddings from seed-data.json and inserts into PostgreSQL.
 * No DeepSeek API call needed.
 */
import pg from 'pg';
import { readFileSync } from 'fs';

const { Pool } = pg;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/asistente_juridico';

async function run() {
  const pool = new Pool({ connectionString: DATABASE_URL });

  // Drop and recreate to ensure correct vector dimension
  await pool.query('DROP TABLE IF EXISTS legal_documents');
  await pool.query('CREATE EXTENSION IF NOT EXISTS vector');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS legal_documents (
      id SERIAL PRIMARY KEY,
      specialty TEXT NOT NULL,
      code_name TEXT NOT NULL,
      article_number TEXT,
      title TEXT,
      content TEXT NOT NULL,
      embedding vector(384),
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  try {
    await pool.query('CREATE INDEX IF NOT EXISTS idx_legal_docs_specialty ON legal_documents(specialty)');
  } catch { /* ok */ }

  // Clear existing
  await pool.query('TRUNCATE legal_documents');

  // Load pre-computed embeddings
  const docs = JSON.parse(readFileSync('/app/seed-data.json', 'utf-8'));
  console.log(`Loaded ${docs.length} documents from seed-data.json`);

  let inserted = 0;
  for (const doc of docs) {
    const vec = `[${doc.embedding.join(',')}]`;
    await pool.query(
      `INSERT INTO legal_documents (specialty, code_name, article_number, title, content, embedding)
       VALUES ($1, $2, $3, $4, $5, $6::vector)`,
      [doc.specialty, doc.code_name, doc.article_number, doc.title, doc.content, vec]
    );
    inserted++;
  }

  console.log(`✅ Seeded ${inserted} documents:`);
  const counts = {};
  for (const d of docs) counts[d.specialty] = (counts[d.specialty] || 0) + 1;
  for (const [spec, count] of Object.entries(counts)) {
    console.log(`   • ${spec}: ${count} articles`);
  }

  await pool.end();
}

run().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
