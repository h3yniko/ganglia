import { createMiddleware } from 'hono/factory'
import { verifyToken } from '../services/tokens.js'
import { getUserById } from '../services/users.js'
import type { User } from '../db/schema.js'

export type AuthVariables = {
  user: User
  tokenId: string
  rawToken: string
}

export const requireAuth = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid Authorization header' }, 401)
  }

  const rawToken = authHeader.slice(7)
  const tokenData = await verifyToken(rawToken)

  if (!tokenData) {
    return c.json({ error: 'Invalid or revoked token' }, 401)
  }

  const user = getUserById(tokenData.userId)
  if (!user) {
    return c.json({ error: 'User not found' }, 401)
  }

  c.set('user', user)
  c.set('tokenId', tokenData.tokenId)
  c.set('rawToken', rawToken)

  await next()
})
