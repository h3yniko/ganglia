import { html } from 'hono/html'

export const AuthForms = () => html`
  <div x-data="authForms" x-show="!$store.auth.isLoggedIn">
    <div x-show="error" x-text="error" class="alert alert-error mb-4"></div>

    <div class="card bg-base-100 shadow-md">
      <div class="card-body">
        <div role="tablist" class="tabs tabs-border mb-6">
          <a role="tab" class="tab" :class="mode === 'signin' && 'tab-active'" @click.prevent="mode = 'signin'" href="#">
            Sign In
          </a>
          <a role="tab" class="tab" :class="mode === 'signup' && 'tab-active'" @click.prevent="mode = 'signup'" href="#">
            Sign Up
          </a>
        </div>

        <form x-show="mode === 'signin'" @submit.prevent="signIn" class="space-y-4">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Email</legend>
            <input type="email" name="email" required placeholder="you@example.com" class="input w-full" />
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Password</legend>
            <input type="password" name="password" required placeholder="••••••••" class="input w-full" />
          </fieldset>
          <button type="submit" class="btn btn-primary w-full" :class="loading && 'loading'">Sign In</button>
        </form>

        <form x-show="mode === 'signup'" @submit.prevent="signUp" class="space-y-4">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Name</legend>
            <input type="text" name="name" required placeholder="Your name" class="input w-full" />
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Email</legend>
            <input type="email" name="email" required placeholder="you@example.com" class="input w-full" />
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Password</legend>
            <input type="password" name="password" required minlength="8" placeholder="8+ characters" class="input w-full" />
          </fieldset>
          <button type="submit" class="btn btn-primary w-full" :class="loading && 'loading'">Sign Up</button>
        </form>
      </div>
    </div>
  </div>
`
