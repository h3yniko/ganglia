import { html } from 'hono/html'

export const TokensView = () => html`
  <div x-show="view === 'tokens'" class="card bg-base-100 shadow-md">
    <div class="card-body">
      <h2 class="card-title text-xl mb-4">API Tokens</h2>

      <form @submit.prevent="createToken" class="flex gap-4 items-end mb-6">
        <fieldset class="fieldset flex-1">
          <legend class="fieldset-legend">Token Name</legend>
          <input type="text" x-model="tokenName" required placeholder="e.g., MacBook, Work PC" class="input w-full" />
        </fieldset>
        <button type="submit" class="btn btn-primary" :class="loading && 'loading'">Create</button>
      </form>

      <div x-show="newToken" class="mb-6">
        <div class="alert alert-success mb-4">Token created! Copy it now - you won't see it again.</div>
        <div class="bg-base-200 rounded-lg p-4 font-mono text-sm break-all" x-text="newToken"></div>
        <button type="button" class="btn btn-primary btn-sm mt-4" @click="copyToken" x-text="copied ? 'Copied!' : 'Copy to Clipboard'"></button>
      </div>

      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Created</th>
              <th>Last Used</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <template x-for="token in tokens" :key="token.id">
              <tr>
                <td x-text="token.name"></td>
                <td x-text="new Date(token.createdAt).toLocaleDateString()"></td>
                <td x-text="token.lastUsedAt ? new Date(token.lastUsedAt).toLocaleDateString() : 'Never'"></td>
                <td><button class="btn btn-ghost btn-sm text-error" @click="revokeToken(token.id)">Revoke</button></td>
              </tr>
            </template>
            <tr x-show="tokens.length === 0">
              <td colspan="4" class="text-center text-base-content/50">No tokens yet</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
`
