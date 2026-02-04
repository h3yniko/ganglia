import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { createUser, getUserByEmail, verifyPassword } from '../services/users.js'
import { createToken } from '../services/tokens.js'
import { config } from '../lib/config.js'

const auth = new Hono()

// Simple in-memory rate limiter
const attempts = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const record = attempts.get(key)

  if (!record || record.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + config.rateLimitWindow })
    return true
  }

  if (record.count >= config.rateLimitMax) {
    return false
  }

  record.count++
  return true
}

function getClientIp(c: { req: { header: (name: string) => string | undefined } }): string {
  return c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip') || 'unknown'
}

const signupSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8)
})

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

auth.post('/signup', zValidator('json', signupSchema), async (c) => {
  const ip = getClientIp(c)
  if (!checkRateLimit(`signup:${ip}`)) {
    return c.json({ error: 'Too many attempts, please try again later' }, 429)
  }

  const { email, name, password } = c.req.valid('json')

  const existing = getUserByEmail(email)
  if (existing) {
    // Perform dummy hash to prevent timing-based enumeration
    await bcrypt.hash(password, config.bcryptRounds)
    return c.json({ error: 'Unable to create account' }, 400)
  }

  const user = await createUser(email, name, password)
  const { rawToken } = await createToken(user.id, 'Default')

  return c.json({
    user: { id: user.id, email: user.email, name: user.name },
    token: rawToken
  })
})

auth.post('/signin', zValidator('json', signinSchema), async (c) => {
  const ip = getClientIp(c)
  if (!checkRateLimit(`signin:${ip}`)) {
    return c.json({ error: 'Too many attempts, please try again later' }, 429)
  }

  const { email, password } = c.req.valid('json')

  const user = getUserByEmail(email)
  if (!user) {
    // Dummy hash to prevent timing-based enumeration
    await bcrypt.hash(password, config.bcryptRounds)
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  const valid = await verifyPassword(user, password)
  if (!valid) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  // Create a new token for this sign-in
  const { rawToken } = await createToken(
    user.id,
    `Session ${new Date().toISOString().slice(0, 10)}`
  )

  return c.json({
    user: { id: user.id, email: user.email, name: user.name },
    token: rawToken
  })
})

export { auth }
