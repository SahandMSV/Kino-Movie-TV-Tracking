# Kino Web

The Next.js web app for [Kino](../../../README.md): track movies and TV shows, rate them, keep private notes and follow episode progress.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui on Base UI · Framer Motion · MongoDB + Mongoose · Auth.js v5 · TMDB · Tolgee

See [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) for the full picture.

## Getting started

Requirements: Node.js 20+, pnpm, a MongoDB instance and a TMDB API read access token.

```bash
pnpm install
```

Create `.env.local` in this folder:

```bash
MONGODB_URI=mongodb://localhost:27017/kino
AUTH_SECRET=your-random-secret
TMDB_ACCESS_TOKEN=your-tmdb-read-access-token
TMDB_API_KEY=your-tmdb-api-key

# Optional
TRAKT_CLIENT_ID=
TRAKT_CLIENT_SECRET=
TRAKT_REDIRECT_URI=http://localhost:3000/api/integrations/trakt/callback
NEXT_PUBLIC_TOLGEE_API_URL=
NEXT_PUBLIC_TOLGEE_API_KEY=
```

Run the dev server:

```bash
pnpm dev
```

Open <http://localhost:3000>.

## Scripts

| Script       | Description                  |
| ------------ | ---------------------------- |
| `pnpm dev`   | Start the development server |
| `pnpm build` | Production build             |
| `pnpm start` | Run the production build     |
| `pnpm lint`  | Run ESLint                   |

## Status page

Open <http://status.localhost:3000> to see health checks for the environment, MongoDB, TMDB and Auth.js. The `/status` path is hidden on other hosts.

## Translations

Message files live in `messages/` (`en`, `de`, `fr`, `es`). See [docs/internationalization.md](../../docs/internationalization.md) for how to add keys or languages.
