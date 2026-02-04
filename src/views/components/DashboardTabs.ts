import { html } from 'hono/html'

export const DashboardTabs = () => html`
  <div class="flex gap-1 mb-8 border-b border-slate-700/50">
    <button
      type="button"
      class="tab-neural"
      :class="view === 'setup' && 'active'"
      @click="view = 'setup'">
      <span class="flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
        Setup
      </span>
    </button>
    <button
      type="button"
      class="tab-neural"
      :class="view === 'tokens' && 'active'"
      @click="view = 'tokens'">
      <span class="flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
        </svg>
        Tokens
      </span>
    </button>
    <button
      type="button"
      class="tab-neural"
      :class="view === 'files' && 'active'"
      @click="view = 'files'; if(files.paths.length === 0) loadManifest()">
      <span class="flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
        </svg>
        Files
      </span>
    </button>
  </div>
`
