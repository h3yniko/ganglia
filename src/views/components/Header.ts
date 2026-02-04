import { html } from 'hono/html'

export const Header = () => html`
  <header class="py-6 mb-10">
    <div class="text-center mb-4">
      <h1 class="font-display text-4xl font-extrabold tracking-tight text-white">
        <span class="bg-gradient-to-r from-accent-cyan via-cyan-300 to-accent-violet bg-clip-text text-transparent">Ganglia</span>
      </h1>
      <p class="text-slate-500 text-sm mt-2 tracking-wide">Memory Service for Claude Code</p>
    </div>
    <div x-show="$store.auth.isLoggedIn" x-cloak class="flex items-center justify-center gap-3 text-sm">
      <span class="text-slate-500" x-text="$store.auth.user?.email"></span>
      <span class="text-slate-700">·</span>
      <button type="button" class="text-slate-400 hover:text-white transition-colors" @click="signOut">Sign Out</button>
    </div>
  </header>
`
