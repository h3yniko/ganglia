import { html } from 'hono/html'
import { FileTree } from './FileTree.js'
import { FileContent } from './FileContent.js'

export const FilesView = () => html`
  <div x-show="view === 'files'" class="card-glow rounded-2xl overflow-hidden animate-fade-in">
    <div class="p-8 lg:p-10">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-emerald/20 to-accent-cyan/20 flex items-center justify-center">
          <svg class="w-5 h-5 text-accent-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-white">Memory Files</h2>
      </div>

      <div x-show="files.error" class="alert-error-dark rounded-lg px-4 py-3 mb-6 text-sm" x-text="files.error"></div>

      <div class="flex flex-col md:grid md:grid-cols-[220px_1fr] gap-6 min-h-[450px]">
        <!-- Mobile: Collapsible -->
        <div class="md:hidden">
          <details class="group bg-surface-800/40 rounded-xl border border-slate-700/30">
            <summary class="px-4 py-3 cursor-pointer text-sm font-medium text-slate-300 flex items-center justify-between">
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                </svg>
                File Browser
              </span>
              <svg class="w-4 h-4 text-slate-500 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </summary>
            <div class="px-4 pb-4">
              ${FileTree()}
            </div>
          </details>
        </div>

        <!-- Desktop: Sidebar -->
        <div class="hidden md:block">
          ${FileTree()}
        </div>

        <!-- File Content -->
        ${FileContent()}
      </div>
    </div>
  </div>
`
