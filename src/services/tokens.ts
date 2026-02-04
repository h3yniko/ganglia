import { eq, and, isNull } from 'drizzle-orm'
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid'
import { getDb, schema } from '../db/index.js'
import type { Token } from '../db/schema.js'
import { config } from '../lib/config.js'

export interface TokenWithRaw {
  token: Token
  rawToken: string // Only available on creation
}

export async function createToken(userId: string, name: string): Promise<TokenWithRaw> {
  const db = getDb()
  const id = nanoid()
  const randomPart = nanoid(32)
  const rawToken = config.tokenPrefix + randomPart
  const tokenHint = randomPart.slice(0, config.tokenHintLength)
  const tokenHash = await bcrypt.hash(rawToken, config.bcryptRounds)
  const now = new Date()

  const [token] = db
    .insert(schema.tokens)
    .values({
      id,
      userId,
      tokenHash,
      tokenHint,
      name: name.trim(),
      createdAt: now
    })
    .returning()
    .all()

  return { token, rawToken }
}

export function listTokens(userId: string): Token[] {
  const db = getDb()
  return db
    .select()
    .from(schema.tokens)
    .where(and(eq(schema.tokens.userId, userId), isNull(schema.tokens.revokedAt)))
    .all()
}

export function revokeToken(tokenId: string, userId: string): boolean {
  const db = getDb()
  const result = db
    .update(schema.tokens)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(schema.tokens.id, tokenId),
        eq(schema.tokens.userId, userId),
        isNull(schema.tokens.revokedAt)
      )
    )
    .run()
  return result.changes > 0
}

export async function verifyToken(
  rawToken: string
): Promise<{ userId: string; tokenId: string } | null> {
  if (!rawToken.startsWith(config.tokenPrefix)) {
    return null
  }

  // Extract hint from token for fast lookup
  const randomPart = rawToken.slice(config.tokenPrefix.length)
  const hint = randomPart.slice(0, config.tokenHintLength)

  const db = getDb()

  // Query only tokens matching the hint (usually 0-1 results)
  const candidates = db
    .select()
    .from(schema.tokens)
    .where(and(eq(schema.tokens.tokenHint, hint), isNull(schema.tokens.revokedAt)))
    .all()

  // Verify with bcrypt (now O(1) instead of O(n))
  for (const token of candidates) {
    const valid = await bcrypt.compare(rawToken, token.tokenHash)
    if (valid) {
      // Update last used
      db.update(schema.tokens)
        .set({ lastUsedAt: new Date() })
        .where(eq(schema.tokens.id, token.id))
        .run()
      return { userId: token.userId, tokenId: token.id }
    }
  }

  return null
}

export function getTokenById(tokenId: string): Token | undefined {
  const db = getDb()
  return db.select().from(schema.tokens).where(eq(schema.tokens.id, tokenId)).get()
}
