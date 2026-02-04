import { html } from 'hono/html'

export const Landing = () => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Ganglia</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css" />
      <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js"></script>
      <script src="/static/app.js"></script>
      <style>
        :root {
          --pico-spacing: 0.75rem;
          --pico-typography-spacing-vertical: 1rem;
          --pico-form-element-spacing-vertical: 0.5rem;
          --pico-form-element-spacing-horizontal: 0.75rem;
          --pico-font-size: 93.75%;
          --pico-border-radius: 0.35rem;
          --pico-block-spacing-vertical: 1rem;
        }
        button, [type="submit"], [type="button"], [role="button"] {
          width: auto;
          padding: 0.5rem 1rem;
        }
        input, select, textarea {
          padding: 0.5rem 0.75rem;
        }
        article { padding: 1.25rem; }
        h1 { font-size: 2rem; }
        h2 { font-size: 1.5rem; }
        h3 { font-size: 1.25rem; }

        .token-display {
          font-family: monospace;
          background: var(--pico-code-background-color);
          padding: 1rem;
          border-radius: 8px;
          word-break: break-all;
        }
        .alert {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        .alert-error {
          background: var(--pico-del-color);
          color: white;
        }
        .alert-success {
          background: var(--pico-ins-color);
          color: white;
        }
        [x-cloak] { display: none !important; }
        nav ul { list-style: none; margin: 0; padding: 0; display: flex; gap: 1rem; }

        /* File tree styles */
        .file-tree-item {
          padding: 0.25rem 0.5rem;
          cursor: pointer;
          border-radius: 4px;
          font-size: 0.875rem;
        }
        .file-tree-item:hover {
          background: var(--pico-secondary-background);
        }
        .file-tree-item.selected {
          background: var(--pico-primary-background);
          color: var(--pico-primary-inverse);
        }
        .file-tree-dir {
          font-weight: 600;
        }
        .file-tree-children {
          margin-left: 1rem;
          border-left: 1px dashed var(--pico-muted-border-color);
          padding-left: 0.5rem;
        }
      </style>
    </head>
    <body>
      <main class="container" x-data="dashboard">
        <header style="text-align: center; padding: 2rem 0;">
          <h1>Ganglia</h1>
          <p>Memory Service for Claude Code</p>
        </header>

        <!-- Auth Container -->
        <div x-data="authForms" x-show="!$store.auth.isLoggedIn">
          <div x-show="error" x-text="error" class="alert alert-error"></div>

          <article>
            <header>
              <nav>
                <ul>
                  <li>
                    <a href="#" @click.prevent="mode = 'signin'" :class="mode === 'signin' && 'contrast'">
                      Sign In
                    </a>
                  </li>
                  <li>
                    <a href="#" @click.prevent="mode = 'signup'" :class="mode === 'signup' && 'contrast'">
                      Sign Up
                    </a>
                  </li>
                </ul>
              </nav>
            </header>

            <form x-show="mode === 'signin'" @submit.prevent="signIn">
              <label>
                Email
                <input type="email" name="email" required placeholder="you@example.com" />
              </label>
              <label>
                Password
                <input type="password" name="password" required placeholder="••••••••" />
              </label>
              <button type="submit" :aria-busy="loading">Sign In</button>
            </form>

            <form x-show="mode === 'signup'" @submit.prevent="signUp">
              <label>
                Name
                <input type="text" name="name" required placeholder="Your name" />
              </label>
              <label>
                Email
                <input type="email" name="email" required placeholder="you@example.com" />
              </label>
              <label>
                Password
                <input type="password" name="password" required minlength="8" placeholder="8+ characters" />
              </label>
              <button type="submit" :aria-busy="loading">Sign Up</button>
            </form>
          </article>
        </div>

        <!-- Dashboard Container -->
        <div x-show="$store.auth.isLoggedIn" x-cloak>
          <nav style="margin-bottom: 2rem;">
            <ul>
              <li>
                <a href="#" @click.prevent="view = 'setup'" :class="view === 'setup' && 'contrast'">
                  Setup
                </a>
              </li>
              <li>
                <a href="#" @click.prevent="view = 'tokens'" :class="view === 'tokens' && 'contrast'">
                  Tokens
                </a>
              </li>
              <li>
                <a href="#" @click.prevent="view = 'files'; if(files.paths.length === 0) loadManifest()" :class="view === 'files' && 'contrast'">
                  Files
                </a>
              </li>
              <li style="margin-left: auto;">
                <a href="#" @click.prevent="signOut">Sign Out</a>
              </li>
            </ul>
          </nav>

          <!-- Setup View -->
          <article x-show="view === 'setup'">
            <header><h2>Claude Code Setup</h2></header>
            <p>Send this to your Claude Code</p>
            <pre><code x-text="claudeMdSnippet"></code></pre>
            <button type="button" @click="copySnippet" x-text="copied ? 'Copied!' : 'Copy'"></button>
          </article>

          <!-- Tokens View -->
          <article x-show="view === 'tokens'">
            <header><h2>API Tokens</h2></header>

            <form @submit.prevent="createToken" style="margin-bottom: 2rem;">
              <div style="display: flex; gap: 1rem; align-items: end;">
                <label style="flex: 1; margin-bottom: 0;">
                  Token Name
                  <input type="text" x-model="tokenName" required placeholder="e.g., MacBook, Work PC" />
                </label>
                <button type="submit" :aria-busy="loading">Create</button>
              </div>
            </form>

            <div x-show="newToken" style="margin-bottom: 2rem;">
              <div class="alert alert-success">Token created! Copy it now - you won't see it again.</div>
              <div class="token-display" x-text="newToken"></div>
              <button type="button" @click="copyToken" x-text="copied ? 'Copied!' : 'Copy to Clipboard'" style="margin-top: 1rem;"></button>
            </div>

            <table>
              <thead>
                <tr><th>Name</th><th>Created</th><th>Last Used</th><th>Actions</th></tr>
              </thead>
              <tbody>
                <template x-for="token in tokens" :key="token.id">
                  <tr>
                    <td x-text="token.name"></td>
                    <td x-text="new Date(token.createdAt).toLocaleDateString()"></td>
                    <td x-text="token.lastUsedAt ? new Date(token.lastUsedAt).toLocaleDateString() : 'Never'"></td>
                    <td><button class="secondary outline" @click="revokeToken(token.id)">Revoke</button></td>
                  </tr>
                </template>
                <tr x-show="tokens.length === 0">
                  <td colspan="4" style="text-align: center;">No tokens yet</td>
                </tr>
              </tbody>
            </table>
          </article>

          <!-- Files View -->
          <article x-show="view === 'files'">
            <header><h2>Memory Files</h2></header>

            <div x-show="files.error" x-text="files.error" class="alert alert-error"></div>

            <div style="display: grid; grid-template-columns: 250px 1fr; gap: 1rem; min-height: 400px;">
              <!-- File Tree Sidebar -->
              <div style="border-right: 1px solid var(--pico-muted-border-color); padding-right: 1rem; overflow-y: auto;">
                <button type="button" class="secondary outline" @click="showNewFileDialog = true" style="width: 100%; margin-bottom: 1rem;">
                  + New File
                </button>

                <div x-show="files.loading && !files.tree" style="text-align: center; padding: 1rem;">
                  Loading...
                </div>

                <!-- Root files -->
                <template x-if="files.tree">
                  <div>
                    <template x-for="file in files.tree.files.sort((a, b) => a.name.localeCompare(b.name))" :key="file.path">
                      <div class="file-tree-item" :class="files.currentPath === file.path && 'selected'" @click="selectFile(file.path)" x-text="file.name"></div>
                    </template>

                    <!-- Directories -->
                    <template x-for="dir in Object.values(files.tree.children).sort((a, b) => a.name.localeCompare(b.name))" :key="dir.path">
                      <div>
                        <div class="file-tree-item file-tree-dir" @click="toggleDir(dir.path)">
                          <span x-text="files.expandedDirs.has(dir.path) ? '▼' : '▶'"></span>
                          <span x-text="dir.name + '/'"></span>
                        </div>
                        <div x-show="files.expandedDirs.has(dir.path)" class="file-tree-children">
                          <!-- Nested files -->
                          <template x-for="file in dir.files.sort((a, b) => a.name.localeCompare(b.name))" :key="file.path">
                            <div class="file-tree-item" :class="files.currentPath === file.path && 'selected'" @click="selectFile(file.path)" x-text="file.name"></div>
                          </template>
                          <!-- Nested dirs (one level deep) -->
                          <template x-for="subdir in Object.values(dir.children).sort((a, b) => a.name.localeCompare(b.name))" :key="subdir.path">
                            <div>
                              <div class="file-tree-item file-tree-dir" @click="toggleDir(subdir.path)">
                                <span x-text="files.expandedDirs.has(subdir.path) ? '▼' : '▶'"></span>
                                <span x-text="subdir.name + '/'"></span>
                              </div>
                              <div x-show="files.expandedDirs.has(subdir.path)" class="file-tree-children">
                                <template x-for="file in subdir.files.sort((a, b) => a.name.localeCompare(b.name))" :key="file.path">
                                  <div class="file-tree-item" :class="files.currentPath === file.path && 'selected'" @click="selectFile(file.path)" x-text="file.name"></div>
                                </template>
                              </div>
                            </div>
                          </template>
                        </div>
                      </div>
                    </template>
                  </div>
                </template>
              </div>

              <!-- File Content Panel -->
              <div>
                <template x-if="files.currentPath">
                  <div>
                    <div style="font-family: monospace; margin-bottom: 1rem; color: var(--pico-muted-color);" x-text="files.currentPath"></div>

                    <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem;">
                      <button type="button" :class="files.isEditing ? 'secondary' : 'primary'" @click="files.isEditing = !files.isEditing" x-text="files.isEditing ? 'Cancel' : 'Edit'"></button>
                      <button type="button" x-show="files.isEditing" @click="saveFile" :disabled="files.currentContent === files.originalContent" :aria-busy="files.loading">Save</button>
                    </div>

                    <pre x-show="!files.isEditing" style="white-space: pre-wrap; background: var(--pico-code-background-color); padding: 1rem; border-radius: 8px; max-height: 60vh; overflow-y: auto;"><code x-text="files.currentContent"></code></pre>

                    <textarea x-show="files.isEditing" x-model="files.currentContent" @keydown.tab.prevent="insertTab($event)" style="font-family: monospace; min-height: 60vh; resize: vertical;"></textarea>
                  </div>
                </template>

                <div x-show="!files.currentPath" style="text-align: center; color: var(--pico-muted-color); padding: 2rem;">
                  Select a file to view its contents
                </div>
              </div>
            </div>

            <!-- New File Dialog -->
            <dialog :open="showNewFileDialog">
              <article>
                <header>
                  <button aria-label="Close" rel="prev" @click="showNewFileDialog = false"></button>
                  <h3>Create New File</h3>
                </header>
                <form @submit.prevent="createFile(newFilePath); showNewFileDialog = false; newFilePath = ''">
                  <label>
                    File Path
                    <input type="text" x-model="newFilePath" placeholder="e.g., topics/newproject.md" required />
                  </label>
                  <small>Path relative to your memory root. Include .md extension for markdown files.</small>
                  <button type="submit" style="margin-top: 1rem;">Create</button>
                </form>
              </article>
            </dialog>
          </article>
        </div>
      </main>
    </body>
  </html>
`
