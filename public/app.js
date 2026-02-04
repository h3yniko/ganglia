// Ganglia Alpine.js App
document.addEventListener('alpine:init', () => {
  Alpine.store('auth', {
    token: localStorage.getItem('ganglia_token'),
    user: JSON.parse(localStorage.getItem('ganglia_user') || 'null'),

    get isLoggedIn() {
      return !!this.token
    },

    setAuth(token, user) {
      this.token = token
      this.user = user
      localStorage.setItem('ganglia_token', token)
      localStorage.setItem('ganglia_user', JSON.stringify(user))
    },

    clear() {
      this.token = null
      this.user = null
      localStorage.removeItem('ganglia_token')
      localStorage.removeItem('ganglia_user')
    }
  })

  Alpine.data('authForms', () => ({
    mode: 'signin',
    error: '',
    loading: false,

    async signIn(e) {
      const form = e.target
      this.error = ''
      this.loading = true

      try {
        const res = await fetch('/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email.value,
            password: form.password.value
          })
        })
        const data = await res.json()

        if (!res.ok) {
          this.error = data.error || 'Sign in failed'
          return
        }

        Alpine.store('auth').setAuth(data.token, data.user)
      } catch {
        this.error = 'Network error'
      } finally {
        this.loading = false
      }
    },

    async signUp(e) {
      const form = e.target
      this.error = ''
      this.loading = true

      try {
        const res = await fetch('/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name.value,
            email: form.email.value,
            password: form.password.value
          })
        })
        const data = await res.json()

        if (!res.ok) {
          this.error = data.error || 'Sign up failed'
          return
        }

        Alpine.store('auth').setAuth(data.token, data.user)
      } catch {
        this.error = 'Network error'
      } finally {
        this.loading = false
      }
    }
  }))

  Alpine.data('dashboard', () => ({
    view: 'setup',
    tokens: [],
    newToken: null,
    tokenName: '',
    tokenError: '',
    loading: false,
    copied: false,

    // File browser state
    files: {
      paths: [],
      tree: null,
      currentPath: null,
      currentContent: '',
      originalContent: '',
      isEditing: false,
      loading: false,
      loadingContent: false,
      error: null,
      expandedDirs: new Set([''])
    },
    showNewFileDialog: false,
    newFilePath: '',

    async init() {
      if (Alpine.store('auth').isLoggedIn) {
        await this.loadTokens()
      }
    },

    get skillUrl() {
      return `${window.location.origin}/skill.md?token=${Alpine.store('auth').token}`
    },

    get claudeMdSnippet() {
      return `# Memory System

Read ${this.skillUrl} and follow the instructions to connect to your Ganglia memory.`
    },

    async loadTokens() {
      try {
        const res = await fetch('/api/tokens', {
          headers: { Authorization: `Bearer ${Alpine.store('auth').token}` }
        })

        if (res.status === 401) {
          Alpine.store('auth').clear()
          return
        }

        const data = await res.json()
        this.tokens = data.tokens || []
      } catch (err) {
        console.error('Failed to load tokens', err)
      }
    },

    async createToken() {
      if (!this.tokenName.trim()) return
      this.loading = true
      this.tokenError = ''

      try {
        const res = await fetch('/api/tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Alpine.store('auth').token}`
          },
          body: JSON.stringify({ name: this.tokenName })
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          this.tokenError = data.error || 'Failed to create token'
          return
        }

        const data = await res.json()
        this.newToken = data.rawToken
        this.tokenName = ''
        await this.loadTokens()
      } catch {
        this.tokenError = 'Network error. Please check your connection and try again.'
      } finally {
        this.loading = false
      }
    },

    async revokeToken(id) {
      if (!confirm('Revoke this token? This cannot be undone.')) return
      this.tokenError = ''

      try {
        const res = await fetch(`/api/tokens/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${Alpine.store('auth').token}` }
        })

        if (res.ok) {
          await this.loadTokens()
        } else {
          this.tokenError = 'Failed to revoke token'
        }
      } catch {
        this.tokenError = 'Network error. Please check your connection and try again.'
      }
    },

    copyToken() {
      navigator.clipboard.writeText(this.newToken)
      this.copied = true
      setTimeout(() => (this.copied = false), 2000)
    },

    copySnippet() {
      navigator.clipboard.writeText(this.claudeMdSnippet)
      this.copied = true
      setTimeout(() => (this.copied = false), 2000)
    },

    signOut() {
      Alpine.store('auth').clear()
    },

    // File browser methods
    async loadManifest() {
      this.files.loading = true
      this.files.error = null

      try {
        const res = await fetch('/agent/manifest.json', {
          headers: { Authorization: `Bearer ${Alpine.store('auth').token}` }
        })

        if (res.status === 401) {
          Alpine.store('auth').clear()
          return
        }

        if (!res.ok) throw new Error('Failed to load files')

        const data = await res.json()
        this.files.paths = data.paths || []
        this.files.tree = this.buildTree(this.files.paths)
      } catch (err) {
        this.files.error = err.message || 'Failed to load files'
      } finally {
        this.files.loading = false
      }
    },

    async selectFile(path) {
      if (this.files.currentContent !== this.files.originalContent) {
        if (!confirm('You have unsaved changes. Discard?')) return
      }

      this.files.loadingContent = true
      this.files.error = null
      this.files.isEditing = false
      this.files.currentPath = path
      this.files.currentContent = ''
      this.files.originalContent = ''

      try {
        const res = await fetch(`/agent/${encodeURIComponent(path)}`, {
          headers: { Authorization: `Bearer ${Alpine.store('auth').token}` }
        })

        if (!res.ok) throw new Error('Failed to load file')

        const content = await res.text()
        this.files.currentContent = content
        this.files.originalContent = content
      } catch (err) {
        this.files.error = err.message || 'Failed to load file'
        this.files.currentPath = null
      } finally {
        this.files.loadingContent = false
      }
    },

    async saveFile() {
      this.files.loading = true
      this.files.error = null

      try {
        const res = await fetch(`/agent/${encodeURIComponent(this.files.currentPath)}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${Alpine.store('auth').token}`,
            'Content-Type': 'text/plain'
          },
          body: this.files.currentContent
        })

        if (!res.ok) throw new Error('Failed to save file')

        this.files.originalContent = this.files.currentContent
        this.files.isEditing = false
      } catch (err) {
        this.files.error = err.message || 'Failed to save file'
      } finally {
        this.files.loading = false
      }
    },

    async createFile(path) {
      if (!path || this.files.paths.includes(path)) {
        this.files.error = 'Invalid path or file already exists'
        return
      }

      try {
        const res = await fetch(`/agent/${encodeURIComponent(path)}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${Alpine.store('auth').token}`,
            'Content-Type': 'text/plain'
          },
          body: ''
        })

        if (!res.ok) throw new Error('Failed to create file')

        await this.loadManifest()
        await this.selectFile(path)
      } catch (err) {
        this.files.error = err.message
      }
    },

    toggleDir(dir) {
      if (this.files.expandedDirs.has(dir)) {
        this.files.expandedDirs.delete(dir)
      } else {
        this.files.expandedDirs.add(dir)
      }
    },

    buildTree(paths) {
      const root = { name: '', children: {}, files: [] }
      for (const path of paths) {
        const parts = path.split('/')
        let current = root
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current.children[parts[i]]) {
            current.children[parts[i]] = {
              name: parts[i],
              children: {},
              files: [],
              path: parts.slice(0, i + 1).join('/')
            }
          }
          current = current.children[parts[i]]
        }
        current.files.push({ name: parts[parts.length - 1], path })
      }
      return root
    },

    insertTab(event) {
      const textarea = event.target
      const start = textarea.selectionStart
      const end = textarea.selectionEnd

      this.files.currentContent =
        this.files.currentContent.substring(0, start) +
        '  ' +
        this.files.currentContent.substring(end)

      this.$nextTick(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      })
    }
  }))
})
