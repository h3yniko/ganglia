import { html } from 'hono/html'
import {
  Header,
  AuthForms,
  DashboardTabs,
  SetupView,
  TokensView,
  FilesView,
  NewFileDialog,
} from './components/index.js'

export const Landing = () => html`
  <!DOCTYPE html>
  <html lang="en" data-theme="corporate">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Ganglia</title>
      <link href="https://cdn.jsdelivr.net/npm/daisyui@5.5.17/dist/full.min.css" rel="stylesheet" />
      <script src="https://cdn.tailwindcss.com"></script>
      <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.15.8/dist/cdn.min.js"></script>
      <script src="/static/app.js"></script>
      <style>
        [x-cloak] { display: none !important; }
      </style>
    </head>
    <body class="min-h-screen bg-base-200">
      <main class="container mx-auto px-4 max-w-4xl py-8" x-data="dashboard">
        ${Header()}

        <!-- Auth Container -->
        ${AuthForms()}

        <!-- Dashboard Container -->
        <div x-show="$store.auth.isLoggedIn" x-cloak>
          ${DashboardTabs()}
          ${SetupView()}
          ${TokensView()}
          ${FilesView()}
          ${NewFileDialog()}
        </div>
      </main>
    </body>
  </html>
`
