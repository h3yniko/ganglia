import { html } from 'hono/html'

export const DashboardTabs = () => html`
  <div role="tablist" class="tabs tabs-border mb-6">
    <a role="tab" class="tab" :class="view === 'setup' && 'tab-active'" @click.prevent="view = 'setup'" href="#">
      Setup
    </a>
    <a role="tab" class="tab" :class="view === 'tokens' && 'tab-active'" @click.prevent="view = 'tokens'" href="#">
      Tokens
    </a>
    <a role="tab" class="tab" :class="view === 'files' && 'tab-active'" @click.prevent="view = 'files'; if(files.paths.length === 0) loadManifest()" href="#">
      Files
    </a>
    <a role="tab" class="tab ml-auto" @click.prevent="signOut" href="#">
      Sign Out
    </a>
  </div>
`
