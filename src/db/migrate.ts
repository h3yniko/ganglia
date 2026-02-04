import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { config, ensureDataDir } from '../lib/config.js'

ensureDataDir()

const sqlite = new Database(config.dbPath)
sqlite.pragma('journal_mode = WAL')
const db = drizzle(sqlite)

console.log('Running migrations...')
migrate(db, { migrationsFolder: './drizzle' })
console.log('Migrations complete')

sqlite.close()
