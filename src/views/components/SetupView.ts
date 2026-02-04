import { html } from 'hono/html'

export const SetupView = () => html`
  <div x-show="view === 'setup'" class="card-glow rounded-2xl overflow-hidden animate-fade-in">
    <div class="p-8 lg:p-10">
      <div class="flex items-start gap-4 mb-6">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan/20 to-accent-violet/20 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-semibold text-white mb-2">Welcome to Ganglia</h2>
          <p class="text-slate-400 text-sm leading-relaxed">
            Give your Claude Code persistent memory across sessions. Connect it by sending the snippet below.
          </p>
        </div>
      </div>

      <div class="bg-surface-800/60 rounded-xl p-5 mb-6 border border-slate-700/30">
        <h3 class="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">How it works</h3>
        <ol class="space-y-2">
          <li class="flex gap-3 text-sm text-slate-300">
            <span class="w-5 h-5 rounded-full bg-accent-cyan/10 text-accent-cyan text-xs font-medium flex items-center justify-center flex-shrink-0">1</span>
            Copy the snippet below and paste it into Claude Code
          </li>
          <li class="flex gap-3 text-sm text-slate-300">
            <span class="w-5 h-5 rounded-full bg-accent-cyan/10 text-accent-cyan text-xs font-medium flex items-center justify-center flex-shrink-0">2</span>
            Claude will fetch the skill and connect to your memory
          </li>
          <li class="flex gap-3 text-sm text-slate-300">
            <span class="w-5 h-5 rounded-full bg-accent-cyan/10 text-accent-cyan text-xs font-medium flex items-center justify-center flex-shrink-0">3</span>
            Your conversations and learnings persist across sessions
          </li>
        </ol>
      </div>

      <div>
        <h3 class="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Connection snippet</h3>
        <pre class="code-block rounded-xl p-4 text-sm overflow-x-auto whitespace-pre-wrap text-slate-300"><code x-text="claudeMdSnippet"></code></pre>
        <div class="mt-4">
          <button
            type="button"
            class="btn-glow px-5 py-2.5 rounded-lg text-sm flex items-center gap-2"
            @click="copySnippet">
            <svg x-show="!copied" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            <svg x-show="copied" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span x-text="copied ? 'Copied!' : 'Copy to Clipboard'"></span>
          </button>
        </div>
      </div>
    </div>
  </div>
`
