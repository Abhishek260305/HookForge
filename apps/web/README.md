# Hookforge web

Next.js dashboard for Hookforge.

## Quick start

```bash
cd apps/web
cp .env.example .env.local
npm install
npm run dev
```

- App: http://localhost:3000  
- Dashboard: http://localhost:3000/overview  

GitHub OAuth is optional. Without `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`, the dashboard uses local auth bypass.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run gql:gen` | Regenerate GraphQL types from the stub schema |

## Layout

- `/` — landing  
- `/login` — Auth.js GitHub sign-in  
- `/overview`, `/runs`, `/workflows`, `/settings` — dashboard shell  

GraphQL client stub: `src/lib/graphql/` (points at `NEXT_PUBLIC_GRAPHQL_URL`).
