import { html } from 'hono/html'

export const NewFileDialog = () => html`
  <dialog class="modal" :class="showNewFileDialog && 'modal-open'">
    <div class="modal-box">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="showNewFileDialog = false">✕</button>
      <h3 class="font-bold text-lg mb-4">Create New File</h3>
      <form @submit.prevent="createFile(newFilePath); showNewFileDialog = false; newFilePath = ''">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">File Path</legend>
          <input type="text" x-model="newFilePath" placeholder="e.g., topics/newproject.md" required class="input w-full" />
          <p class="fieldset-label text-base-content/50">Path relative to your memory root. Include .md extension for markdown files.</p>
        </fieldset>
        <div class="modal-action">
          <button type="submit" class="btn btn-primary">Create</button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="showNewFileDialog = false">close</button>
    </form>
  </dialog>
`
