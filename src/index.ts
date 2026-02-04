import 'dotenv/config'
import { serve } from '@hono/node-server'
import { app } from './app.js'
import { config, ensureDataDir } from './lib/config.js'

ensureDataDir()

console.log(`Starting server on port ${config.port}...`)
serve(
  {
    fetch: app.fetch,
    port: config.port
  },
  (info) => {
    console.log(`Server running at http://localhost:${info.port}`)
  }
)
