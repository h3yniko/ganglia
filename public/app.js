// Token storage and auth management
const TOKEN_KEY = 'ganglia_token'
const USER_KEY = 'ganglia_user'

function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
  configureHtmx()
}

function getUser() {
  const user = localStorage.getItem(USER_KEY)
  return user ? JSON.parse(user) : null
}

function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

function configureHtmx() {
  const token = getToken()
  if (token) {
    document.body.setAttribute('hx-headers', JSON.stringify({
      'Authorization': `Bearer ${token}`
    }))
  }
}

function showError(message) {
  const el = document.getElementById('error-message')
  el.textContent = message
  el.classList.remove('hidden')
}

function hideError() {
  document.getElementById('error-message').classList.add('hidden')
}

function setActiveNav(activeId) {
  document.getElementById('nav-tokens')?.classList.toggle('contrast', activeId === 'nav-tokens')
  document.getElementById('nav-setup')?.classList.toggle('contrast', activeId === 'nav-setup')
}

function showDashboard() {
  document.getElementById('auth-container').classList.add('hidden')
  document.getElementById('dashboard-container').classList.remove('hidden')
  loadSetup()
}

function showAuth() {
  document.getElementById('auth-container').classList.remove('hidden')
  document.getElementById('dashboard-container').classList.add('hidden')
}

async function handleSignIn(e) {
  e.preventDefault()
  hideError()

  const form = e.target
  const data = {
    email: form.email.value,
    password: form.password.value
  }

  try {
    const res = await fetch('/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    const result = await res.json()

    if (!res.ok) {
      showError(result.error || 'Sign in failed')
      return
    }

    setToken(result.token)
    setUser(result.user)
    showDashboard()
  } catch (err) {
    showError('Network error')
  }
}

async function handleSignUp(e) {
  e.preventDefault()
  hideError()

  const form = e.target
  const data = {
    name: form.name.value,
    email: form.email.value,
    password: form.password.value
  }

  try {
    const res = await fetch('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    const result = await res.json()

    if (!res.ok) {
      showError(result.error || 'Sign up failed')
      return
    }

    setToken(result.token)
    setUser(result.user)
    showDashboard()
  } catch (err) {
    showError('Network error')
  }
}

async function loadTokens() {
  setActiveNav('nav-tokens')
  const token = getToken()
  if (!token) return

  try {
    const res = await fetch('/api/tokens', {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!res.ok) {
      if (res.status === 401) {
        clearAuth()
        showAuth()
      }
      return
    }

    const { tokens } = await res.json()
    renderTokens(tokens)
  } catch (err) {
    console.error('Failed to load tokens', err)
  }
}

function renderTokens(tokens) {
  const content = document.getElementById('dashboard-content')
  content.innerHTML = `
    <article>
      <header><h2>API Tokens</h2></header>
      <form id="create-token-form" style="margin-bottom: 2rem;">
        <div style="display: flex; gap: 1rem; align-items: end;">
          <label style="flex: 1; margin-bottom: 0;">
            Token Name
            <input type="text" name="name" required placeholder="e.g., MacBook, Work PC" />
          </label>
          <button type="submit" style="width: auto;">Create</button>
        </div>
      </form>
      <div id="new-token-display" class="hidden" style="margin-bottom: 2rem;">
        <div class="alert alert-success">Token created! Copy it now - you won't see it again.</div>
        <div class="token-display" id="new-token-value"></div>
        <button id="copy-token" style="margin-top: 1rem;">Copy to Clipboard</button>
      </div>
      <table>
        <thead>
          <tr><th>Name</th><th>Created</th><th>Last Used</th><th>Actions</th></tr>
        </thead>
        <tbody id="tokens-list">
          ${tokens.length ? tokens.map(t => `
            <tr id="token-${t.id}">
              <td>${t.name}</td>
              <td>${new Date(t.createdAt).toLocaleDateString()}</td>
              <td>${t.lastUsedAt ? new Date(t.lastUsedAt).toLocaleDateString() : 'Never'}</td>
              <td><button class="secondary outline" data-revoke="${t.id}">Revoke</button></td>
            </tr>
          `).join('') : '<tr><td colspan="4" style="text-align: center;">No tokens yet</td></tr>'}
        </tbody>
      </table>
    </article>
  `

  document.getElementById('create-token-form').addEventListener('submit', handleCreateToken)
  document.querySelectorAll('[data-revoke]').forEach(btn => {
    btn.addEventListener('click', () => handleRevokeToken(btn.dataset.revoke))
  })
  const copyBtn = document.getElementById('copy-token')
  if (copyBtn) {
    copyBtn.addEventListener('click', handleCopyToken)
  }
}

async function handleCreateToken(e) {
  e.preventDefault()
  const form = e.target
  const name = form.name.value

  try {
    const res = await fetch('/api/tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ name })
    })

    if (!res.ok) {
      alert('Failed to create token')
      return
    }

    const { rawToken } = await res.json()

    // Show the token
    const display = document.getElementById('new-token-display')
    document.getElementById('new-token-value').textContent = rawToken
    display.classList.remove('hidden')

    form.reset()
    loadTokens()
  } catch (err) {
    alert('Network error')
  }
}

async function handleRevokeToken(tokenId) {
  if (!confirm('Are you sure you want to revoke this token?')) return

  try {
    const res = await fetch(`/api/tokens/${tokenId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })

    if (res.ok) {
      loadTokens()
    } else {
      alert('Failed to revoke token')
    }
  } catch (err) {
    alert('Network error')
  }
}

function handleCopyToken() {
  const token = document.getElementById('new-token-value').textContent
  navigator.clipboard.writeText(token).then(() => {
    alert('Token copied to clipboard!')
  })
}

function loadSetup() {
  setActiveNav('nav-setup')
  const token = getToken()
  const baseUrl = window.location.origin
  const skillUrl = `${baseUrl}/skill.md?token=${token}`

  const claudeMdSnippet = `# Memory System

Read ${skillUrl} and follow the instructions to connect to your Ganglia memory.`

  const content = document.getElementById('dashboard-content')
  content.innerHTML = `
    <article>
      <header><h2>Claude Code Setup</h2></header>

      <p>Add this to your <code>~/.claude/CLAUDE.md</code>:</p>
      <pre><code id="claude-md-snippet">${claudeMdSnippet}</code></pre>
      <button id="copy-snippet" type="button">Copy</button>
    </article>
  `

  document.getElementById('copy-snippet').addEventListener('click', () => {
    navigator.clipboard.writeText(claudeMdSnippet).then(() => {
      const btn = document.getElementById('copy-snippet')
      btn.textContent = 'Copied!'
      setTimeout(() => btn.textContent = 'Copy', 2000)
    })
  })
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Tab switching
  document.getElementById('show-signin')?.addEventListener('click', (e) => {
    e.preventDefault()
    document.getElementById('signin-form').classList.remove('hidden')
    document.getElementById('signup-form').classList.add('hidden')
    e.target.classList.add('contrast')
    document.getElementById('show-signup').classList.remove('contrast')
  })

  document.getElementById('show-signup')?.addEventListener('click', (e) => {
    e.preventDefault()
    document.getElementById('signup-form').classList.remove('hidden')
    document.getElementById('signin-form').classList.add('hidden')
    e.target.classList.add('contrast')
    document.getElementById('show-signin').classList.remove('contrast')
  })

  // Form handlers
  document.getElementById('signin-form')?.addEventListener('submit', handleSignIn)
  document.getElementById('signup-form')?.addEventListener('submit', handleSignUp)

  // Nav handlers
  document.getElementById('nav-tokens')?.addEventListener('click', (e) => {
    e.preventDefault()
    loadTokens()
  })

  document.getElementById('nav-setup')?.addEventListener('click', (e) => {
    e.preventDefault()
    loadSetup()
  })

  document.getElementById('signout')?.addEventListener('click', (e) => {
    e.preventDefault()
    clearAuth()
    showAuth()
  })

  // Check if already logged in
  const token = getToken()
  if (token) {
    configureHtmx()
    showDashboard()
  }
})
