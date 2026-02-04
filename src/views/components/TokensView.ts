import { html } from 'hono/html'

export const TokensView = () => html`
  <div x-show="view === 'tokens'" class="card-glow rounded-2xl overflow-hidden animate-fade-in">
    <div class="p-8 lg:p-10">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-violet/20 to-accent-cyan/20 flex items-center justify-center">
          <svg class="w-5 h-5 text-accent-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-white">API Tokens</h2>
      </div>

      <div x-show="tokenError" class="alert-error-dark rounded-lg px-4 py-3 mb-6 text-sm" x-text="tokenError"></div>

      <!-- Create Token Form -->
      <form @submit.prevent="createToken" class="flex gap-3 items-end mb-8">
        <div class="flex-1">
          <label class="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Token Name</label>
          <input
            type="text"
            x-model="tokenName"
            required
            placeholder="e.g., MacBook, Work PC"
            class="input-dark w-full px-4 py-2.5 rounded-lg text-sm"
          />
        </div>
        <button
          type="submit"
          class="btn-glow px-5 py-2.5 rounded-lg text-sm flex items-center gap-2"
          :disabled="loading">
          <span x-show="loading" class="spinner"></span>
          <span>Create</span>
        </button>
      </form>

      <!-- New Token Display -->
      <div x-show="newToken" class="mb-8 p-5 bg-surface-800/60 rounded-xl border border-accent-emerald/30">
        <div class="alert-success-dark rounded-lg px-4 py-3 mb-4 text-sm flex items-center gap-2">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Token created! Copy it now — you won't see it again.
        </div>
        <div class="code-block rounded-lg p-3 font-mono text-sm break-all text-accent-cyan" x-text="newToken"></div>
        <button
          type="button"
          class="btn-glow px-4 py-2 rounded-lg text-sm mt-4 flex items-center gap-2"
          @click="copyToken">
          <svg x-show="!copied" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
          <svg x-show="copied" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <span x-text="copied ? 'Copied!' : 'Copy'"></span>
        </button>
      </div>

      <!-- Tokens Table -->
      <div>
        <h3 class="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">Your tokens</h3>
        <div class="overflow-x-auto rounded-xl border border-slate-700/30">
          <table class="w-full table-dark">
            <thead class="bg-surface-800/40">
              <tr>
                <th class="text-left">Name</th>
                <th class="text-left hidden sm:table-cell">Hint</th>
                <th class="text-left hidden sm:table-cell">Created</th>
                <th class="text-left">Last Used</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <template x-for="token in tokens" :key="token.id">
                <tr>
                  <td class="font-medium text-white" x-text="token.name"></td>
                  <td class="hidden sm:table-cell">
                    <span class="font-mono text-xs text-slate-500" x-text="token.hint ? 'gng_...' + token.hint : '—'"></span>
                  </td>
                  <td class="hidden sm:table-cell text-sm" x-text="new Date(token.createdAt).toLocaleDateString()"></td>
                  <td class="text-sm" x-text="token.lastUsedAt ? new Date(token.lastUsedAt).toLocaleDateString() : 'Never'"></td>
                  <td class="text-right">
                    <button
                      class="text-accent-rose hover:text-accent-rose/80 text-xs font-medium transition-colors"
                      @click="revokeToken(token.id)">
                      Revoke
                    </button>
                  </td>
                </tr>
              </template>
              <tr x-show="tokens.length === 0">
                <td colspan="5" class="text-center text-slate-500 py-8">
                  <svg class="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                  </svg>
                  No tokens yet
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
`
