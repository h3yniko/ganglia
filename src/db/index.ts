import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { config } from '../lib/config.js'
import * as schema from './schema.js'

let sqlite: Database.Database | null = null
let db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function getDb() {
  if (!db) {
    sqlite = new Database(config.dbPath)
    sqlite.pragma('journal_mode = WAL')
    db = drizzle(sqlite, { schema })
  }
  return db
}

export function closeDb() {
  if (sqlite) {
    sqlite.close()
    sqlite = null
    db = null
  }
}

export { schema }
