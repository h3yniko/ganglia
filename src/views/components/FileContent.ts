import { html } from 'hono/html'

export const FileContent = () => html`
  <div>
    <template x-if="files.currentPath">
      <div>
        <div class="font-mono text-sm text-base-content/50 mb-4" x-text="files.currentPath"></div>

        <div class="flex gap-2 mb-4">
          <button type="button" class="btn btn-sm" :class="files.isEditing ? 'btn-ghost' : 'btn-primary'" @click="files.isEditing = !files.isEditing" x-text="files.isEditing ? 'Cancel' : 'Edit'"></button>
          <button type="button" x-show="files.isEditing" class="btn btn-primary btn-sm" @click="saveFile" :disabled="files.currentContent === files.originalContent" :class="files.loading && 'loading'">Save</button>
        </div>

        <pre x-show="!files.isEditing" class="bg-base-200 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-[60vh] overflow-y-auto"><code x-text="files.currentContent"></code></pre>

        <textarea x-show="files.isEditing" x-model="files.currentContent" @keydown.tab.prevent="insertTab($event)" class="textarea w-full font-mono text-sm min-h-[60vh] resize-y"></textarea>
      </div>
    </template>

    <div x-show="!files.currentPath" class="text-center text-base-content/50 p-8">
      Select a file to view its contents
    </div>
  </div>
`
