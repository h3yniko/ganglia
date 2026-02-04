import { html } from 'hono/html'

export const Header = () => html`
  <header class="text-center py-8">
    <h1 class="text-3xl font-bold text-base-content">Ganglia</h1>
    <p class="text-base-content/60 mt-2">Memory Service for Claude Code</p>
  </header>
`
