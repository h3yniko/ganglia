# Ganglia

Memory service for Claude Code. Store and retrieve memory files via REST API.

## Quick Start

```bash
npm install
npm run db:migrate
npm run dev
```

Server runs at `http://localhost:3000`

## API

All `/api/*` endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check (no auth) |
| GET | `/api/bootstrap` | Get all core memory files |
| GET | `/api/file/:path` | Read a file |
| GET | `/api/list/:prefix` | List files by prefix |
| POST | `/api/logs/append` | Append to log file |
| GET | `/api/search?q=` | Search files |
| GET | `/api/tokens` | List your tokens |
| POST | `/api/tokens` | Create new token |
| DELETE | `/api/tokens/:id` | Revoke token |

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Create account |
| POST | `/auth/signin` | Sign in, get token |

## Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run format   # Run Prettier
```

## Docker

```bash
docker compose up
```

Runs migrations automatically, then starts the app.
