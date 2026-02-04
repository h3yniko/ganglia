import { html } from 'hono/html'

export const SetupView = () => html`
  <div x-show="view === 'setup'" class="card bg-base-100 shadow-md">
    <div class="card-body">
      <h2 class="card-title text-xl mb-4">Claude Code Setup</h2>
      <p class="text-base-content/70 mb-4">Send this to your Claude Code</p>
      <pre class="bg-base-200 rounded-lg p-4 font-mono text-sm overflow-x-auto whitespace-pre-wrap"><code x-text="claudeMdSnippet"></code></pre>
      <div class="card-actions mt-4">
        <button type="button" class="btn btn-primary btn-sm" @click="copySnippet" x-text="copied ? 'Copied!' : 'Copy'"></button>
      </div>
    </div>
  </div>
`
