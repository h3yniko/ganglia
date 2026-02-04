import { html } from 'hono/html'

export const AuthForms = () => html`
  <div x-data="authForms" x-show="!$store.auth.isLoggedIn" class="animate-fade-in">
    <div x-show="error" class="alert-error-dark rounded-lg px-4 py-3 mb-6 text-sm" x-text="error"></div>

    <div class="card-glow rounded-2xl overflow-hidden">
      <div class="p-8 lg:p-10">
        <!-- Tabs -->
        <div class="flex gap-1 mb-8 border-b border-slate-700/50">
          <button
            type="button"
            class="tab-neural"
            :class="mode === 'signin' && 'active'"
            @click="mode = 'signin'">
            Sign In
          </button>
          <button
            type="button"
            class="tab-neural"
            :class="mode === 'signup' && 'active'"
            @click="mode = 'signup'">
            Sign Up
          </button>
        </div>

        <!-- Sign In Form -->
        <form x-show="mode === 'signin'" @submit.prevent="signIn" class="space-y-5">
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Email</label>
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              class="input-dark w-full px-4 py-3 rounded-lg text-sm"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Password</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              class="input-dark w-full px-4 py-3 rounded-lg text-sm"
            />
          </div>
          <button
            type="submit"
            class="btn-glow w-full py-3 rounded-lg text-sm flex items-center justify-center gap-2"
            :disabled="loading">
            <span x-show="loading" class="spinner"></span>
            <span x-text="loading ? 'Signing in...' : 'Sign In'"></span>
          </button>
        </form>

        <!-- Sign Up Form -->
        <form x-show="mode === 'signup'" @submit.prevent="signUp" class="space-y-5">
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="Your name"
              class="input-dark w-full px-4 py-3 rounded-lg text-sm"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Email</label>
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              class="input-dark w-full px-4 py-3 rounded-lg text-sm"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Password</label>
            <input
              type="password"
              name="password"
              required
              minlength="8"
              placeholder="At least 8 characters"
              class="input-dark w-full px-4 py-3 rounded-lg text-sm"
            />
            <p class="text-slate-500 text-xs mt-2">Must be at least 8 characters</p>
          </div>
          <button
            type="submit"
            class="btn-glow w-full py-3 rounded-lg text-sm flex items-center justify-center gap-2"
            :disabled="loading">
            <span x-show="loading" class="spinner"></span>
            <span x-text="loading ? 'Creating account...' : 'Create Account'"></span>
          </button>
        </form>
      </div>
    </div>
  </div>
`
