import { html } from 'hono/html'

export const NewFileDialog = () => html`
  <div
    x-show="showNewFileDialog"
    x-cloak
    class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-dark"
    @click.self="showNewFileDialog = false"
    @keydown.escape.window="showNewFileDialog = false">

    <div
      class="card-glow rounded-2xl w-full max-w-md overflow-hidden"
      x-show="showNewFileDialog"
      x-transition:enter="transition ease-out duration-200"
      x-transition:enter-start="opacity-0 scale-95"
      x-transition:enter-end="opacity-100 scale-100"
      x-transition:leave="transition ease-in duration-150"
      x-transition:leave-start="opacity-100 scale-100"
      x-transition:leave-end="opacity-0 scale-95">

      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-white">Create New File</h3>
          <button
            type="button"
            class="text-slate-500 hover:text-slate-300 transition-colors"
            @click="showNewFileDialog = false">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="createFile(newFilePath); showNewFileDialog = false; newFilePath = ''">
          <div class="mb-6">
            <label class="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">File Path</label>
            <input
              type="text"
              x-model="newFilePath"
              placeholder="e.g., topics/newproject.md"
              required
              class="input-dark w-full px-4 py-3 rounded-lg text-sm"
              x-ref="newFileInput"
              x-init="$watch('showNewFileDialog', value => value && $nextTick(() => $refs.newFileInput.focus()))"
            />
            <p class="text-slate-500 text-xs mt-2">
              Path relative to your memory root. Use .md for markdown files.
            </p>
          </div>

          <div class="flex gap-3 justify-end">
            <button
              type="button"
              class="btn-ghost-dark px-4 py-2 rounded-lg text-sm"
              @click="showNewFileDialog = false">
              Cancel
            </button>
            <button
              type="submit"
              class="btn-glow px-4 py-2 rounded-lg text-sm">
              Create File
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
`
