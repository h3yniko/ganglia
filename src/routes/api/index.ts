import { Hono } from 'hono'
import { requireAuth, type AuthVariables } from '../../middleware/auth.js'
import {
  getBootstrapFiles,
  readFile,
  listDirectory,
  appendToLog,
  searchFiles
} from '../../services/storage.js'
import { listTokens, createToken, revokeToken } from '../../services/tokens.js'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const api = new Hono<{ Variables: AuthVariables }>()

// Global error handler
api.onError((err, c) => {
  console.error('API Error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})

// Path validation - reject traversal attempts
function validatePath(path: string): string | null {
  const decoded = decodeURIComponent(path)
  if (decoded.includes('..') || decoded.includes('\\') || decoded.startsWith('/')) {
    return null
  }
  return decoded.trim() || null
}

// All routes require auth
api.use('*', requireAuth)

// Bootstrap - get all core files in one request
api.get('/bootstrap', (c) => {
  const user = c.get('user')
  const files = getBootstrapFiles(user.id)
  return c.json(files)
})

// Read file
api.get('/file/*', (c) => {
  const user = c.get('user')
  const rawPath = c.req.path.replace('/api/file/', '')
  const path = validatePath(rawPath)

  if (!path) {
    return c.json({ error: 'Invalid path' }, 400)
  }

  const content = readFile(user.id, path)
  if (content === null) {
    return c.json({ error: 'File not found' }, 404)
  }

  return c.text(content, 200, { 'Content-Type': 'text/markdown' })
})

// List directory (prefix search)
api.get('/list/*', (c) => {
  const user = c.get('user')
  const rawPrefix = c.req.path.replace('/api/list/', '')
  const prefix = rawPrefix ? validatePath(rawPrefix) : ''

  if (prefix === null) {
    return c.json({ error: 'Invalid path' }, 400)
  }

  const files = listDirectory(user.id, prefix)
  return c.json({ files })
})

// Append to log
const appendSchema = z.object({
  content: z.string().min(1).max(100000), // 100KB max
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
})

api.post('/logs/append', zValidator('json', appendSchema), (c) => {
  const user = c.get('user')
  const { content, date } = c.req.valid('json')

  try {
    const file = appendToLog(user.id, content, date)
    return c.json({ success: true, file })
  } catch {
    return c.json({ error: 'Failed to append to log' }, 500)
  }
})

// Search (supports semantic search with embeddings)
api.get('/search', async (c) => {
  const user = c.get('user')
  const query = c.req.query('q')
  const limit = parseInt(c.req.query('limit') || '10', 10)

  if (!query) {
    return c.json({ error: 'Missing query parameter q' }, 400)
  }

  const results = await searchFiles(user.id, query, Math.min(limit, 50))
  return c.json({ results })
})

// Token management
api.get('/tokens', (c) => {
  const user = c.get('user')
  const tokens = listTokens(user.id).map((t) => ({
    id: t.id,
    name: t.name,
    hint: t.tokenHint,
    createdAt: t.createdAt,
    lastUsedAt: t.lastUsedAt
  }))
  return c.json({ tokens })
})

const createTokenSchema = z.object({
  name: z.string().min(1).max(100)
})

api.post('/tokens', zValidator('json', createTokenSchema), async (c) => {
  const user = c.get('user')
  const { name } = c.req.valid('json')

  const { token, rawToken } = await createToken(user.id, name)

  return c.json({
    token: {
      id: token.id,
      name: token.name,
      createdAt: token.createdAt
    },
    rawToken // Only shown once!
  })
})

api.delete('/tokens/:id', (c) => {
  const user = c.get('user')
  const tokenId = c.req.param('id')

  const revoked = revokeToken(tokenId, user.id)
  if (!revoked) {
    return c.json({ error: 'Token not found or already revoked' }, 404)
  }

  return c.json({ success: true })
})

export { api }
