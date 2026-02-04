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
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Ganglia — Memory for Claude</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Syne:wght@700;800&display=swap" rel="stylesheet">
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
          theme: {
            extend: {
              colors: {
                surface: {
                  900: '#0a0f1a',
                  800: '#0f172a',
                  700: '#1e293b',
                  600: '#334155',
                },
                accent: {
                  cyan: '#22d3ee',
                  violet: '#a78bfa',
                  emerald: '#34d399',
                  amber: '#fbbf24',
                  rose: '#fb7185',
                }
              },
              fontFamily: {
                display: ['Syne', 'system-ui', 'sans-serif'],
                body: ['Instrument Sans', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
              }
            }
          }
        }
      </script>
      <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.15.8/dist/cdn.min.js"></script>
      <script src="/static/app.js"></script>
      <style>
        [x-cloak] { display: none !important; }

        body {
          background: #0a0f1a;
          background-image:
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 211, 238, 0.08), transparent),
            radial-gradient(ellipse 60% 40% at 100% 100%, rgba(167, 139, 250, 0.06), transparent);
        }

        /* Subtle animated gradient on cards */
        .card-glow {
          position: relative;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9));
          border: 1px solid rgba(148, 163, 184, 0.1);
        }
        .card-glow::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(167, 139, 250, 0.1), transparent 60%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        /* Input styling */
        .input-dark {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.15);
          color: #f1f5f9;
          transition: all 0.2s ease;
        }
        .input-dark::placeholder {
          color: rgba(148, 163, 184, 0.5);
        }
        .input-dark:focus {
          outline: none;
          border-color: rgba(34, 211, 238, 0.5);
          box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.1);
        }

        /* Button styling */
        .btn-glow {
          background: linear-gradient(135deg, #22d3ee, #06b6d4);
          color: #0f172a;
          font-weight: 600;
          border: none;
          transition: all 0.2s ease;
        }
        .btn-glow:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(34, 211, 238, 0.4);
        }
        .btn-glow:active {
          transform: translateY(0);
        }

        .btn-ghost-dark {
          color: #94a3b8;
          background: transparent;
          border: 1px solid rgba(148, 163, 184, 0.2);
          transition: all 0.2s ease;
        }
        .btn-ghost-dark:hover {
          color: #f1f5f9;
          border-color: rgba(148, 163, 184, 0.4);
          background: rgba(148, 163, 184, 0.1);
        }

        /* Tab styling */
        .tab-neural {
          color: #64748b;
          padding: 0.75rem 1.25rem;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
          font-weight: 500;
        }
        .tab-neural:hover {
          color: #94a3b8;
        }
        .tab-neural.active {
          color: #22d3ee;
          border-bottom-color: #22d3ee;
        }

        /* Code block styling */
        .code-block {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.1);
          font-family: 'JetBrains Mono', monospace;
        }

        /* Table styling */
        .table-dark th {
          color: #64748b;
          font-weight: 500;
          text-transform: uppercase;
          font-size: 0.7rem;
          letter-spacing: 0.05em;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }
        .table-dark td {
          padding: 0.875rem 1rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.05);
          color: #cbd5e1;
        }
        .table-dark tr:hover td {
          background: rgba(34, 211, 238, 0.02);
        }

        /* Menu / File tree */
        .tree-item {
          color: #94a3b8;
          padding: 0.5rem 0.75rem;
          border-radius: 0.375rem;
          transition: all 0.15s ease;
        }
        .tree-item:hover {
          color: #f1f5f9;
          background: rgba(148, 163, 184, 0.08);
        }
        .tree-item.active {
          color: #22d3ee;
          background: rgba(34, 211, 238, 0.1);
        }

        /* Alert styling */
        .alert-success-dark {
          background: rgba(52, 211, 153, 0.1);
          border: 1px solid rgba(52, 211, 153, 0.3);
          color: #34d399;
        }
        .alert-error-dark {
          background: rgba(251, 113, 133, 0.1);
          border: 1px solid rgba(251, 113, 133, 0.3);
          color: #fb7185;
        }

        /* Modal styling */
        .modal-dark {
          background: rgba(10, 15, 26, 0.8);
          backdrop-filter: blur(4px);
        }

        /* Textarea */
        .textarea-dark {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.15);
          color: #f1f5f9;
          font-family: 'JetBrains Mono', monospace;
          line-height: 1.6;
        }
        .textarea-dark:focus {
          outline: none;
          border-color: rgba(34, 211, 238, 0.5);
          box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.1);
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.2);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.3);
        }

        /* Loading spinner */
        .spinner {
          border: 2px solid rgba(34, 211, 238, 0.2);
          border-top-color: #22d3ee;
          border-radius: 50%;
          width: 1.25rem;
          height: 1.25rem;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Fade in animation */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
      </style>
    </head>
    <body class="min-h-screen font-body text-slate-300 antialiased">
      <main class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-10 lg:py-14" x-data="dashboard">
        ${Header()}

        <!-- Auth Container -->
        ${AuthForms()}

        <!-- Dashboard Container -->
        <div x-show="$store.auth.isLoggedIn" x-cloak class="animate-fade-in">
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
