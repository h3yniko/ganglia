import type { FC } from 'hono/jsx'
import { Layout } from './layout.js'

export const Landing: FC = () => {
  return (
    <Layout title="Welcome">
      <header style="text-align: center; padding: 2rem 0;">
        <h1>Ganglia</h1>
        <p>Memory Service for Claude Code</p>
      </header>

      <div id="auth-container">
        <div id="error-message" class="alert alert-error hidden"></div>

        <article>
          <header>
            <nav>
              <ul>
                <li>
                  <a href="#" id="show-signin" class="contrast">
                    Sign In
                  </a>
                </li>
                <li>
                  <a href="#" id="show-signup">
                    Sign Up
                  </a>
                </li>
              </ul>
            </nav>
          </header>

          <form id="signin-form">
            <label>
              Email
              <input type="email" name="email" required placeholder="you@example.com" />
            </label>
            <label>
              Password
              <input type="password" name="password" required placeholder="••••••••" />
            </label>
            <button type="submit">Sign In</button>
          </form>

          <form id="signup-form" class="hidden">
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
              <input
                type="password"
                name="password"
                required
                minLength={8}
                placeholder="8+ characters"
              />
            </label>
            <button type="submit">Sign Up</button>
          </form>
        </article>
      </div>

      <div id="dashboard-container" class="hidden">
        <nav style="margin-bottom: 2rem;">
          <ul>
            <li>
              <a href="#" id="nav-setup" class="contrast">
                Setup
              </a>
            </li>
            <li>
              <a href="#" id="nav-tokens">
                Tokens
              </a>
            </li>
            <li style="margin-left: auto;">
              <a href="#" id="signout">
                Sign Out
              </a>
            </li>
          </ul>
        </nav>

        <div id="dashboard-content">{/* Content loaded dynamically */}</div>
      </div>
    </Layout>
  )
}

export const TokensView: FC<{
  tokens: Array<{ id: string; name: string; createdAt: Date; lastUsedAt: Date | null }>
}> = ({ tokens }) => {
  return (
    <article>
      <header>
        <h2>API Tokens</h2>
      </header>

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
        <button id="copy-token" style="margin-top: 1rem;">
          Copy to Clipboard
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Created</th>
            <th>Last Used</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="tokens-list">
          {tokens.map((token) => (
            <tr id={`token-${token.id}`}>
              <td>{token.name}</td>
              <td>{new Date(token.createdAt).toLocaleDateString()}</td>
              <td>
                {token.lastUsedAt ? new Date(token.lastUsedAt).toLocaleDateString() : 'Never'}
              </td>
              <td>
                <button class="secondary outline" data-revoke={token.id}>
                  Revoke
                </button>
              </td>
            </tr>
          ))}
          {tokens.length === 0 && (
            <tr>
              <td colSpan={4} style="text-align: center;">
                No tokens yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </article>
  )
}

export const SetupView: FC = () => {
  return (
    <article>
      <header>
        <h2>Claude Code Setup</h2>
      </header>

      <h3>Your Skill URL</h3>
      <p>Your skill URL will be shown here after signing in.</p>
      <p>
        Add this to your <code>~/.claude/CLAUDE.md</code> to enable memory.
      </p>
    </article>
  )
}
