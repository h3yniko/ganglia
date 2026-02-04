import 'dotenv/config'
import { serve } from '@hono/node-server'
import { app } from './app.js'
import { config, ensureDataDir } from './lib/config.js'

ensureDataDir()

console.log(`Starting server on port ${config.port}...`)
const server = serve(
  {
    fetch: app.fetch,
    port: config.port
  },
  (info) => {
    console.log(`Server running at http://localhost:${info.port}`)
  }
)

const shutdown = () => {
  server.close()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
