import { query } from './db'

export { closePool } from './db'

const DEEPSEEK_API_KEY = () => process.env.DEEPSEEK_API_KEY

export async function ensureTable(): Promise<void> {
  await query('CREATE EXTENSION IF NOT EXISTS vector', [])
  await query(`
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
  `, [])
  try {
    await query(`CREATE INDEX IF NOT EXISTS idx_legal_docs_specialty ON legal_documents(specialty)`, [])
  } catch { /* index may already exist */ }
}

export async function embedText(text: string): Promise<number[]> {
  // Use local fastembed model via Python subprocess (no API key needed)
  const { execSync } = await import('child_process')
  const scriptPath = process.cwd() + '/scripts/embed.py'
  try {
    const out = execSync(`echo ${JSON.stringify(text)} | python3 "${scriptPath}"`, {
      encoding: 'utf-8',
      timeout: 30000,
      maxBuffer: 1024 * 1024,
    })
    return JSON.parse(out.trim())
  } catch (err) {
    console.error('[rag] Local embedding failed:', (err as Error).message)
    return []
  }
}

export async function storeDocument(doc: {
  specialty: string
  code_name: string
  article_number?: string
  title?: string
  content: string
}): Promise<void> {
  const embedding = await embedText(doc.content)
  const vec = `[${embedding.join(',')}]`

  await query(
    `INSERT INTO legal_documents (specialty, code_name, article_number, title, content, embedding)
     VALUES ($1, $2, $3, $4, $5, $6::vector)`,
    [doc.specialty, doc.code_name, doc.article_number || null, doc.title || null, doc.content, vec]
  )
}

export async function searchSimilar(
  queryText: string,
  specialty?: string,
  limit = 5
): Promise<Array<{
  content: string
  code_name: string
  article_number: string | null
  title: string | null
  similarity: number
}>> {
  try {
    const embedding = await embedText(queryText)
    const vec = `[${embedding.join(',')}]`

    let sql = `
      SELECT content, code_name, article_number, title,
             1 - (embedding <=> $1::vector) AS similarity
      FROM legal_documents
    `
    const params: any[] = [vec]

    if (specialty) {
      sql += ` WHERE specialty = $2`
      params.push(specialty)
    }

    sql += ` ORDER BY embedding <=> $1::vector LIMIT $${params.length + 1}`
    params.push(limit)

    const result = await query(sql, params)
    return (result?.rows || []).map((r: any) => ({
      content: r.content,
      code_name: r.code_name,
      article_number: r.article_number,
      title: r.title,
      similarity: r.similarity,
    }))
  } catch (err) {
    console.error('[rag] searchSimilar failed:', err)
    return []
  }
}

export async function buildRagContext(
  queryText: string,
  specialty?: string
): Promise<string> {
  try {
    const results = await searchSimilar(queryText, specialty, 5)
    if (results.length === 0) return ''

    const lines = results.map((r) => {
      const ref = r.article_number
        ? `${r.code_name}, Art. ${r.article_number}`
        : `${r.code_name}`
      return `- ${ref}`
    })

    return (
      `--- Referencias legales relevantes ---\n` +
      lines.join('\n') +
      `\n---`
    )
  } catch (err) {
    console.error('[rag] buildRagContext failed:', err)
    return ''
  }
}
