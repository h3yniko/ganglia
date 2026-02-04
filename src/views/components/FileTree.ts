import { html } from 'hono/html'

export const FileTree = () => html`
  <div class="overflow-y-auto pr-2 md:border-r md:border-slate-700/30 md:pr-4">
    <button
      type="button"
      class="w-full mb-4 px-3 py-2 rounded-lg border border-dashed border-slate-600/50 text-slate-400 text-sm hover:border-accent-cyan/50 hover:text-accent-cyan transition-colors flex items-center justify-center gap-2"
      @click="showNewFileDialog = true">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>
      New File
    </button>

    <!-- Loading -->
    <div x-show="files.loading && !files.tree" class="text-center py-8 text-slate-500">
      <div class="spinner mx-auto mb-3"></div>
      <span class="text-sm">Loading...</span>
    </div>

    <!-- Empty State -->
    <div x-show="!files.loading && files.tree && files.paths.length === 0" class="text-center py-8">
      <svg class="w-10 h-10 mx-auto mb-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      </svg>
      <p class="text-slate-500 text-sm mb-1">No files yet</p>
      <p class="text-slate-600 text-xs">Create your first file</p>
    </div>

    <!-- File Tree -->
    <template x-if="files.tree && files.paths.length > 0">
      <nav class="space-y-1">
        <!-- Root files -->
        <template x-for="file in files.tree.files.sort((a, b) => a.name.localeCompare(b.name))" :key="file.path">
          <a
            href="#"
            class="tree-item block text-sm truncate"
            :class="files.currentPath === file.path && 'active'"
            @click.prevent="selectFile(file.path)">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4 flex-shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span x-text="file.name" class="truncate"></span>
            </span>
          </a>
        </template>

        <!-- Directories -->
        <template x-for="dir in Object.values(files.tree.children).sort((a, b) => a.name.localeCompare(b.name))" :key="dir.path">
          <div class="mt-2">
            <button
              type="button"
              class="w-full text-left tree-item text-sm font-medium flex items-center gap-2"
              @click="toggleDir(dir.path)">
              <svg
                class="w-4 h-4 flex-shrink-0 transition-transform opacity-50"
                :class="files.expandedDirs.has(dir.path) && 'rotate-90'"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <svg class="w-4 h-4 flex-shrink-0 text-accent-amber/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
              </svg>
              <span x-text="dir.name" class="truncate"></span>
            </button>

            <div x-show="files.expandedDirs.has(dir.path)" class="ml-4 mt-1 pl-2 border-l border-slate-700/30 space-y-1">
              <!-- Nested files -->
              <template x-for="file in dir.files.sort((a, b) => a.name.localeCompare(b.name))" :key="file.path">
                <a
                  href="#"
                  class="tree-item block text-sm truncate"
                  :class="files.currentPath === file.path && 'active'"
                  @click.prevent="selectFile(file.path)">
                  <span class="flex items-center gap-2">
                    <svg class="w-4 h-4 flex-shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <span x-text="file.name" class="truncate"></span>
                  </span>
                </a>
              </template>

              <!-- Nested dirs (one level deep) -->
              <template x-for="subdir in Object.values(dir.children).sort((a, b) => a.name.localeCompare(b.name))" :key="subdir.path">
                <div class="mt-1">
                  <button
                    type="button"
                    class="w-full text-left tree-item text-sm font-medium flex items-center gap-2"
                    @click="toggleDir(subdir.path)">
                    <svg
                      class="w-4 h-4 flex-shrink-0 transition-transform opacity-50"
                      :class="files.expandedDirs.has(subdir.path) && 'rotate-90'"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                    <svg class="w-4 h-4 flex-shrink-0 text-accent-amber/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                    </svg>
                    <span x-text="subdir.name" class="truncate"></span>
                  </button>

                  <div x-show="files.expandedDirs.has(subdir.path)" class="ml-4 mt-1 pl-2 border-l border-slate-700/30 space-y-1">
                    <template x-for="file in subdir.files.sort((a, b) => a.name.localeCompare(b.name))" :key="file.path">
                      <a
                        href="#"
                        class="tree-item block text-sm truncate"
                        :class="files.currentPath === file.path && 'active'"
                        @click.prevent="selectFile(file.path)">
                        <span class="flex items-center gap-2">
                          <svg class="w-4 h-4 flex-shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                          <span x-text="file.name" class="truncate"></span>
                        </span>
                      </a>
                    </template>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>
      </nav>
    </template>
  </div>
`
