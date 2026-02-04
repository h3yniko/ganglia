import { html } from 'hono/html'
import { FileTree } from './FileTree.js'
import { FileContent } from './FileContent.js'

export const FilesView = () => html`
  <div x-show="view === 'files'" class="card bg-base-100 shadow-md">
    <div class="card-body">
      <h2 class="card-title text-xl mb-4">Memory Files</h2>

      <div x-show="files.error" x-text="files.error" class="alert alert-error mb-4"></div>

      <div class="grid grid-cols-[250px_1fr] gap-4 min-h-[400px]">
        ${FileTree()}
        ${FileContent()}
      </div>
    </div>
  </div>
`
