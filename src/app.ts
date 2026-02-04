import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { serveStatic } from '@hono/node-server/serve-static'
import { auth } from './routes/auth.js'
import { api } from './routes/api/index.js'
import { agent, agentApi } from './routes/agent.js'
import { ui } from './routes/ui.jsx'

const app = new Hono()

app.use('*', logger())
app.use('*', secureHeaders())
app.use(
  '/static/*',
  serveStatic({ root: './public', rewriteRequestPath: (path) => path.replace('/static', '') })
)

// Health check (no auth)
app.get('/api/health', (c) => c.json({ status: 'ok', version: '1.0.0' }))

// Auth routes (no auth required)
app.route('/auth', auth)

// API routes (auth required) - legacy
app.route('/api', api)

// Agent routes (auth required)
app.route('/agent', agent)
app.route('/agent-api', agentApi)

// UI routes
app.route('/', ui)

export { app }
