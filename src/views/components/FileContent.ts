import { html } from 'hono/html'

export const FileContent = () => html`
  <div
    class="flex-1 min-w-0"
    @keydown.meta.s.prevent="files.isEditing && saveFile()"
    @keydown.ctrl.s.prevent="files.isEditing && saveFile()">

    <template x-if="files.currentPath">
      <div>
        <!-- File Header -->
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-slate-700/30">
          <div class="flex items-center gap-2 min-w-0">
            <span class="font-mono text-sm text-slate-500 truncate" x-text="files.currentPath"></span>
            <span
              x-show="files.currentContent !== files.originalContent"
              class="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-accent-amber"
              title="Unsaved changes">
            </span>
            <span
              x-show="files.isEditing"
              class="flex-shrink-0 text-[10px] font-medium text-accent-amber bg-accent-amber/10 px-1.5 py-0.5 rounded">
              editing
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div x-show="!files.loadingContent" class="flex gap-2 mb-3 h-9">
          <button
            type="button"
            class="text-sm px-4 py-2 rounded-lg transition-colors"
            :class="files.isEditing ? 'btn-ghost-dark' : 'btn-glow'"
            @click="files.isEditing = !files.isEditing"
            x-text="files.isEditing ? 'Cancel' : 'Edit'">
          </button>
          <button
            type="button"
            x-show="files.isEditing"
            class="btn-glow text-sm px-4 py-2 rounded-lg flex items-center gap-2"
            @click="saveFile"
            :disabled="files.currentContent === files.originalContent || files.loading">
            <span x-show="files.loading" class="spinner"></span>
            <span>Save</span>
            <kbd class="hidden sm:inline-flex text-[10px] font-mono bg-black/20 px-1.5 py-0.5 rounded">⌘S</kbd>
          </button>
        </div>

        <!-- Loading -->
        <div x-show="files.loadingContent" class="flex items-center justify-center py-16 text-slate-500">
          <div class="spinner mr-3"></div>
          <span class="text-sm">Loading...</span>
        </div>

        <!-- Read-only View -->
        <pre
          x-show="!files.isEditing && !files.loadingContent"
          class="code-block rounded-xl p-4 text-sm whitespace-pre-wrap min-h-[68vh] max-h-[75vh] overflow-y-auto leading-relaxed text-slate-300"><code x-text="files.currentContent"></code></pre>

        <!-- Editor -->
        <textarea
          x-show="files.isEditing"
          x-model="files.currentContent"
          @keydown.tab.prevent="insertTab($event)"
          class="textarea-dark w-full rounded-xl p-4 text-sm min-h-[68vh] leading-relaxed resize-y">
        </textarea>
      </div>
    </template>

    <!-- Empty State -->
    <div x-show="!files.currentPath && !files.loading" class="flex flex-col items-center justify-center py-16 text-slate-500">
      <svg class="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      <p class="text-sm">Select a file to view its contents</p>
    </div>
  </div>
`
