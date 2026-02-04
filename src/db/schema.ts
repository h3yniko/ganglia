import { sqliteTable, text, integer, index, primaryKey } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  lastAccessAt: integer('last_access_at', { mode: 'timestamp' })
})

export const tokens = sqliteTable(
  'tokens',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    tokenHash: text('token_hash').notNull(),
    tokenHint: text('token_hint').notNull(),
    name: text('name').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
    revokedAt: integer('revoked_at', { mode: 'timestamp' })
  },
  (table) => [
    index('idx_tokens_user').on(table.userId),
    index('idx_tokens_hint').on(table.tokenHint)
  ]
)

// Memory files stored in DB
export const files = sqliteTable(
  'files',
  {
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    path: text('path').notNull(), // e.g., "MEMORY.md", "topics/index.md", "logs/2026-02-02.md"
    content: text('content').notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.path] }),
    index('idx_files_user').on(table.userId)
  ]
)

// Embeddings for semantic search
export const embeddings = sqliteTable(
  'embeddings',
  {
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    path: text('path').notNull(),
    chunkIndex: integer('chunk_index').notNull(),
    content: text('content').notNull(), // The text chunk
    embedding: text('embedding').notNull(), // JSON array of floats
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.path, table.chunkIndex] }),
    index('idx_embeddings_user').on(table.userId)
  ]
)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Token = typeof tokens.$inferSelect
export type NewToken = typeof tokens.$inferInsert
export type File = typeof files.$inferSelect
export type NewFile = typeof files.$inferInsert
export type Embedding = typeof embeddings.$inferSelect
