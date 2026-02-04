import type { FC, PropsWithChildren } from 'hono/jsx'

export const Layout: FC<PropsWithChildren<{ title?: string }>> = ({ children, title }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title ? `${title} - Ganglia` : 'Ganglia'}</title>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
        />
        <script src="https://unpkg.com/htmx.org@2.0.4"></script>
        <script src="/static/app.js" defer></script>
        <style>{`
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
          .hidden { display: none; }
          nav ul { list-style: none; margin: 0; padding: 0; display: flex; gap: 1rem; }
        `}</style>
      </head>
      <body>
        <main class="container">{children}</main>
      </body>
    </html>
  )
}
