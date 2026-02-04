import OpenAI from 'openai'
import { eq, and } from 'drizzle-orm'
import { getDb, schema } from '../db/index.js'
import { config } from '../lib/config.js'

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: config.openrouterApiKey
})

const CHUNK_SIZE = 500 // characters per chunk
const CHUNK_OVERLAP = 50

// Split text into overlapping chunks
function chunkText(text: string): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length)
    chunks.push(text.slice(start, end))
    start = end - CHUNK_OVERLAP
    if (start + CHUNK_OVERLAP >= text.length) break
  }

  return chunks.filter((c) => c.trim().length > 10)
}

// Generate embedding for text
async function getEmbedding(text: string): Promise<number[]> {
  if (!config.openrouterApiKey) {
    throw new Error('OPENROUTER_API_KEY not configured')
  }

  const response = await openai.embeddings.create({
    model: config.embeddingModel,
    input: text
  })

  return response.data[0].embedding
}

// Cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Index a file's content as embeddings
export async function indexFile(userId: string, path: string, content: string): Promise<void> {
  if (!config.openrouterApiKey) return // Skip if no API key

  const db = getDb()
  const chunks = chunkText(content)
  const now = new Date()

  // Delete existing embeddings for this file
  db.delete(schema.embeddings)
    .where(and(eq(schema.embeddings.userId, userId), eq(schema.embeddings.path, path)))
    .run()

  // Generate and store embeddings for each chunk
  for (let i = 0; i < chunks.length; i++) {
    try {
      const embedding = await getEmbedding(chunks[i])

      db.insert(schema.embeddings)
        .values({
          userId,
          path,
          chunkIndex: i,
          content: chunks[i],
          embedding: JSON.stringify(embedding),
          updatedAt: now
        })
        .run()
    } catch (err) {
      console.error(`Failed to embed chunk ${i} of ${path}:`, err)
    }
  }
}

// Semantic search using embeddings
export async function semanticSearch(
  userId: string,
  query: string,
  limit = 10
): Promise<Array<{ path: string; content: string; score: number }>> {
  if (!config.openrouterApiKey) {
    return [] // Fallback to text search in caller
  }

  const db = getDb()

  // Get query embedding
  const queryEmbedding = await getEmbedding(query)

  // Get all user's embeddings
  const allEmbeddings = db
    .select()
    .from(schema.embeddings)
    .where(eq(schema.embeddings.userId, userId))
    .all()

  // Calculate similarity scores
  const scored = allEmbeddings.map((row) => ({
    path: row.path,
    content: row.content,
    score: cosineSimilarity(queryEmbedding, JSON.parse(row.embedding))
  }))

  // Sort by score descending, take top results
  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, limit)
}

// Check if embeddings are available
export function hasEmbeddings(): boolean {
  return Boolean(config.openrouterApiKey)
}
