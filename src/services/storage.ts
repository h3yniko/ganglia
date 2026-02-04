import { eq, and, like } from 'drizzle-orm'
import { getDb, schema } from '../db/index.js'
import { indexFile, semanticSearch, hasEmbeddings } from './embeddings.js'
import { compactTodayLog } from './compaction.js'

export function readFile(userId: string, path: string): string | null {
  const db = getDb()
  const file = db
    .select()
    .from(schema.files)
    .where(and(eq(schema.files.userId, userId), eq(schema.files.path, path)))
    .get()

  return file?.content ?? null
}

export function writeFile(userId: string, path: string, content: string): void {
  const db = getDb()
  const now = new Date()

  const existing = db
    .select()
    .from(schema.files)
    .where(and(eq(schema.files.userId, userId), eq(schema.files.path, path)))
    .get()

  if (existing) {
    db.update(schema.files)
      .set({ content, updatedAt: now })
      .where(and(eq(schema.files.userId, userId), eq(schema.files.path, path)))
      .run()
  } else {
    db.insert(schema.files).values({ userId, path, content, updatedAt: now }).run()
  }

  // Index for semantic search (async, don't block)
  indexFile(userId, path, content).catch((err) => {
    console.error(`[embeddings] Failed to index ${path}:`, err)
  })
}

export function listDirectory(userId: string, prefix: string): string[] {
  const db = getDb()

  // Escape LIKE wildcards to prevent injection
  const escaped = prefix.replace(/%/g, '\\%').replace(/_/g, '\\_')
  const searchPrefix = escaped ? escaped + '/' : ''

  const files = db
    .select({ path: schema.files.path })
    .from(schema.files)
    .where(and(eq(schema.files.userId, userId), like(schema.files.path, searchPrefix + '%')))
    .all()

  // Extract immediate children at this level
  const children = new Set<string>()
  for (const file of files) {
    const relative = file.path.slice(searchPrefix.length)
    const firstSegment = relative.split('/')[0]
    children.add(firstSegment)
  }

  return Array.from(children).sort()
}

export function appendToLog(userId: string, content: string, date?: string): string {
  const logDate = date || new Date().toISOString().slice(0, 10)
  const logPath = `logs/${logDate}.md`

  const existing = readFile(userId, logPath)
  const newContent = existing ? existing + '\n\n' + content : content

  writeFile(userId, logPath, newContent)

  // Trigger compaction to merge Retain entries into memory (async)
  compactTodayLog(userId, logDate)

  return logPath
}

export function triggerCompaction(userId: string, path: string): void {
  // Check if this is a log file and trigger compaction
  const match = path.match(/^logs\/(\d{4}-\d{2}-\d{2})\.md$/)
  if (match) {
    compactTodayLog(userId, match[1])
  }
}

export async function searchFiles(
  userId: string,
  query: string,
  limit = 10
): Promise<Array<{ file: string; snippet: string; score?: number }>> {
  if (!query.trim()) return []

  // Try semantic search first if embeddings are available
  if (hasEmbeddings()) {
    try {
      const results = await semanticSearch(userId, query, limit)
      return results.map((r) => ({
        file: r.path,
        snippet: r.content,
        score: r.score
      }))
    } catch (err) {
      console.error('[search] Semantic search failed, falling back to text:', err)
    }
  }

  // Fallback to text search
  const db = getDb()
  const files = db.select().from(schema.files).where(eq(schema.files.userId, userId)).all()

  const results: Array<{ file: string; snippet: string }> = []
  const lowerQuery = query.toLowerCase()

  for (const file of files) {
    if (file.content.toLowerCase().includes(lowerQuery)) {
      const idx = file.content.toLowerCase().indexOf(lowerQuery)
      const start = Math.max(0, idx - 50)
      const end = Math.min(file.content.length, idx + query.length + 50)
      const snippet =
        (start > 0 ? '...' : '') +
        file.content.slice(start, end) +
        (end < file.content.length ? '...' : '')

      results.push({ file: file.path, snippet })
      if (results.length >= limit) break
    }
  }

  return results
}

export function getBootstrapFiles(userId: string): Record<string, string | null> {
  return {
    memory: readFile(userId, 'MEMORY.md'),
    user: readFile(userId, 'USER.md'),
    soul: readFile(userId, 'SOUL.md'),
    identity: readFile(userId, 'IDENTITY.md'),
    topics_index: readFile(userId, 'topics/index.md'),
    manifest: readFile(userId, 'manifest.json')
  }
}

export function getAllPaths(userId: string): string[] {
  const db = getDb()
  const files = db
    .select({ path: schema.files.path })
    .from(schema.files)
    .where(eq(schema.files.userId, userId))
    .all()

  return files.map((f) => f.path).sort()
}

export function pathExists(userId: string, path: string): 'file' | 'directory' | null {
  const db = getDb()

  // Check if exact file exists
  const file = db
    .select({ path: schema.files.path })
    .from(schema.files)
    .where(and(eq(schema.files.userId, userId), eq(schema.files.path, path)))
    .get()

  if (file) return 'file'

  // Check if any files exist under this path (making it a directory)
  const escaped = path.replace(/%/g, '\\%').replace(/_/g, '\\_')
  const childFile = db
    .select({ path: schema.files.path })
    .from(schema.files)
    .where(and(eq(schema.files.userId, userId), like(schema.files.path, escaped + '/%')))
    .limit(1)
    .get()

  if (childFile) return 'directory'

  return null
}
