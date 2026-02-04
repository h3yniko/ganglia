import { existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

// Config with getters to read env at runtime (after dotenv loads)
export const config = {
  get port() {
    return parseInt(process.env.PORT || '3000', 10)
  },
  get dbPath() {
    return process.env.DB_PATH || './data/sqlite.db'
  },

  // Security
  get bcryptRounds() {
    return parseInt(process.env.BCRYPT_ROUNDS || '12', 10)
  },
  tokenPrefix: 'mem_',
  tokenHintLength: 8,

  // Rate limiting
  rateLimitWindow: 15 * 60 * 1000, // 15 minutes
  rateLimitMax: 10, // attempts per window

  // OpenRouter for embeddings
  get openrouterApiKey() {
    return process.env.OPENROUTER_API_KEY || ''
  },
  embeddingModel: 'openai/text-embedding-3-small'
}

export function ensureDataDir() {
  const dir = dirname(config.dbPath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}
