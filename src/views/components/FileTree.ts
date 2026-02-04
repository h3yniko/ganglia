import { html } from 'hono/html'

export const FileTree = () => html`
  <div class="border-r border-base-300 pr-4 overflow-y-auto">
    <button type="button" class="btn btn-outline btn-sm w-full mb-4" @click="showNewFileDialog = true">
      + New File
    </button>

    <div x-show="files.loading && !files.tree" class="text-center p-4 text-base-content/50">
      Loading...
    </div>

    <!-- Root files -->
    <template x-if="files.tree">
      <ul class="menu menu-sm bg-base-100 rounded-box w-full">
        <template x-for="file in files.tree.files.sort((a, b) => a.name.localeCompare(b.name))" :key="file.path">
          <li>
            <a :class="files.currentPath === file.path && 'menu-active'" @click.prevent="selectFile(file.path)" x-text="file.name" href="#"></a>
          </li>
        </template>

        <!-- Directories -->
        <template x-for="dir in Object.values(files.tree.children).sort((a, b) => a.name.localeCompare(b.name))" :key="dir.path">
          <li>
            <details :open="files.expandedDirs.has(dir.path)">
              <summary class="font-semibold" @click.prevent="toggleDir(dir.path)">
                <span x-text="dir.name"></span>
              </summary>
              <ul>
                <!-- Nested files -->
                <template x-for="file in dir.files.sort((a, b) => a.name.localeCompare(b.name))" :key="file.path">
                  <li>
                    <a :class="files.currentPath === file.path && 'menu-active'" @click.prevent="selectFile(file.path)" x-text="file.name" href="#"></a>
                  </li>
                </template>
                <!-- Nested dirs (one level deep) -->
                <template x-for="subdir in Object.values(dir.children).sort((a, b) => a.name.localeCompare(b.name))" :key="subdir.path">
                  <li>
                    <details :open="files.expandedDirs.has(subdir.path)">
                      <summary class="font-semibold" @click.prevent="toggleDir(subdir.path)">
                        <span x-text="subdir.name"></span>
                      </summary>
                      <ul>
                        <template x-for="file in subdir.files.sort((a, b) => a.name.localeCompare(b.name))" :key="file.path">
                          <li>
                            <a :class="files.currentPath === file.path && 'menu-active'" @click.prevent="selectFile(file.path)" x-text="file.name" href="#"></a>
                          </li>
                        </template>
                      </ul>
                    </details>
                  </li>
                </template>
              </ul>
            </details>
          </li>
        </template>
      </ul>
    </template>
  </div>
`
