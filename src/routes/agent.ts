import { Hono } from 'hono'
import { requireAuth, type AuthVariables } from '../middleware/auth.js'
import {
  readFile,
  writeFile,
  listDirectory,
  getAllPaths,
  pathExists,
  searchFiles,
  triggerCompaction
} from '../services/storage.js'
import { listTokens, createToken, revokeToken } from '../services/tokens.js'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

// Path validation - reject traversal attempts
function validatePath(path: string): string | null {
  const decoded = decodeURIComponent(path)
  if (decoded.includes('..') || decoded.includes('\\') || decoded.startsWith('/')) {
    return null
  }
  return decoded.trim() || null
}

// Agent routes - filesystem-like access
const agent = new Hono<{ Variables: AuthVariables }>()

agent.onError((err, c) => {
  console.error('Agent Error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})

agent.use('*', requireAuth)

// Manifest - list all accessible paths
agent.get('/manifest.json', (c) => {
  const user = c.get('user')
  const paths = getAllPaths(user.id)
  return c.json({ paths })
})

// GET - read file or list directory
agent.get('/*', (c) => {
  const user = c.get('user')
  const rawPath = c.req.path.replace('/agent/', '')

  // Handle root path
  if (!rawPath || rawPath === '') {
    const files = listDirectory(user.id, '')
    return c.json({ type: 'directory', path: '', files })
  }

  const path = validatePath(rawPath)
  if (!path) {
    return c.json({ error: 'Invalid path' }, 400)
  }

  // Check if trailing slash (explicit directory request)
  const isExplicitDirectory = rawPath.endsWith('/')
  const cleanPath = path.replace(/\/$/, '')

  const type = pathExists(user.id, cleanPath)

  if (type === null) {
    return c.json({ error: 'Not found' }, 404)
  }

  if (type === 'file' && !isExplicitDirectory) {
    const content = readFile(user.id, cleanPath)
    if (content === null) {
      return c.json({ error: 'File not found' }, 404)
    }
    const contentType = cleanPath.endsWith('.json') ? 'application/json' : 'text/markdown'
    return c.text(content, 200, { 'Content-Type': contentType })
  }

  if (type === 'directory' || isExplicitDirectory) {
    const files = listDirectory(user.id, cleanPath)
    return c.json({ type: 'directory', path: cleanPath, files })
  }

  return c.json({ error: 'Not found' }, 404)
})

// POST - append to file
agent.post('/*', async (c) => {
  const user = c.get('user')
  const rawPath = c.req.path.replace('/agent/', '')

  const path = validatePath(rawPath)
  if (!path) {
    return c.json({ error: 'Invalid path' }, 400)
  }

  const cleanPath = path.replace(/\/$/, '')
  const body = await c.req.text()

  if (!body) {
    return c.json({ error: 'Empty body' }, 400)
  }

  const existing = readFile(user.id, cleanPath)
  const newContent = existing ? existing + '\n\n' + body : body

  writeFile(user.id, cleanPath, newContent)
  triggerCompaction(user.id, cleanPath)

  return c.json({ success: true, path: cleanPath })
})

// PUT - write/overwrite file
agent.put('/*', async (c) => {
  const user = c.get('user')
  const rawPath = c.req.path.replace('/agent/', '')

  const path = validatePath(rawPath)
  if (!path) {
    return c.json({ error: 'Invalid path' }, 400)
  }

  const cleanPath = path.replace(/\/$/, '')
  const body = await c.req.text()

  writeFile(user.id, cleanPath, body)
  return c.json({ success: true, path: cleanPath })
})

// Agent API routes - search and management
const agentApi = new Hono<{ Variables: AuthVariables }>()

agentApi.onError((err, c) => {
  console.error('Agent API Error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})

agentApi.use('*', requireAuth)

// Search (supports semantic search with embeddings)
agentApi.get('/search', async (c) => {
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
agentApi.get('/tokens', (c) => {
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

agentApi.post('/tokens', zValidator('json', createTokenSchema), async (c) => {
  const user = c.get('user')
  const { name } = c.req.valid('json')

  const { token, rawToken } = await createToken(user.id, name)

  return c.json({
    token: {
      id: token.id,
      name: token.name,
      createdAt: token.createdAt
    },
    rawToken
  })
})

agentApi.delete('/tokens/:id', (c) => {
  const user = c.get('user')
  const tokenId = c.req.param('id')

  const revoked = revokeToken(tokenId, user.id)
  if (!revoked) {
    return c.json({ error: 'Token not found or already revoked' }, 404)
  }

  return c.json({ success: true })
})

export { agent, agentApi }
