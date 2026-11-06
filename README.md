<div align="center">

# 🎬 Kino

### Discover. Watch. Remember.

Track movies and TV shows, keep notes, follow episode progress, and discover what to watch next.

<br />

**🌐 Language: &nbsp; English &nbsp;|&nbsp; [فارسی (Persian)](README.fa.md)**

</div>

---

## About

Kino is a free movie and TV tracking app built for people who love cinema. It runs on the **web** today, with an **Android** app (Expo / React Native) in early development.

Read the reasoning behind the project in [docs/MANIFESTO.md](kino/docs/MANIFESTO.md).

## Features

- **Discover**: trending, popular movies and popular TV carousels on the home page, plus a quick search for movies, shows and people.
- **Detail pages**: movies, TV shows, people and film collections, with cast, crew, trailers, recommendations and release status ("In theaters" badge).
- **Tracking**: Watchlist, Watching, Watched, On hold and Dropped statuses for every title.
- **Ratings and notes**: a 1–10 star rating and private notes per title.
- **Episode progress**: mark single episodes or whole seasons as watched, with a progress bar per show.
- **Watchlist and Progress pages**: virtualized grids with infinite scrolling.
- **Accounts**: email or username login (Auth.js credentials, JWT sessions).
- **Settings**: display name, theme (system / light / dark), interface language, "always use English posters".
- **Languages**: English, German, French and Spanish interfaces via Tolgee.
- **Trakt**: OAuth connection (history sync is planned).
- **Status page**: a service health dashboard served on `status.localhost`.

## Tech stack

| Area      | Technology                                                                |
| --------- | ------------------------------------------------------------------------- |
| Monorepo  | pnpm workspaces (Turborepo config included)                               |
| Web       | Next.js 16 (App Router), React 19, TypeScript, React Compiler             |
| UI        | Tailwind CSS 4, shadcn/ui (base-nova) on Base UI, Framer Motion, Sonner   |
| Data      | MongoDB with Mongoose, Auth.js MongoDB adapter                            |
| Auth      | Auth.js v5 (beta), credentials provider, bcrypt password hashing          |
| Metadata  | [TMDB](https://www.themoviedb.org/) API                                   |
| i18n      | Tolgee (ICU format), `next-themes` for theming                            |
| Mobile    | Expo SDK 57, Expo Router, React Native 0.86                               |

## Repository layout

```bash
.
├── kino/
│   ├── apps/
│   │   ├── web/        # Next.js web app
│   │   └── android/    # Expo (React Native) app, starter stage
│   ├── docs/           # Architecture, i18n and manifesto
│   └── ...             # Workspace config (pnpm, Turborepo, Prettier)
├── LICENSE
└── README.md
```

## Getting started (web)

### Requirements

- Node.js 20 or newer
- pnpm
- A MongoDB instance (local or Atlas)
- A free [TMDB](https://www.themoviedb.org/settings/api) account for the API read access token

### Setup

```bash
cd kino/apps/web
pnpm install
```

Create `kino/apps/web/.env.local` (see [`kino/.env.example`](kino/.env.example)):

```bash
MONGODB_URI=mongodb://localhost:27017/kino
AUTH_SECRET=your-random-secret
TMDB_ACCESS_TOKEN=your-tmdb-read-access-token
TMDB_API_KEY=your-tmdb-api-key

# Optional: Trakt integration
TRAKT_CLIENT_ID=
TRAKT_CLIENT_SECRET=
TRAKT_REDIRECT_URI=http://localhost:3000/api/integrations/trakt/callback

# Optional: Tolgee in-context editing
NEXT_PUBLIC_TOLGEE_API_URL=
NEXT_PUBLIC_TOLGEE_API_KEY=
```

Start the dev server:

```bash
pnpm dev
```

Open <http://localhost:3000>. The status page is available at <http://status.localhost:3000>.

## Android app

The Android app lives in `kino/apps/android` and is still based on the Expo starter template. See its [README](kino/apps/android/README.md).

## Documentation

| Document                                          | Contents                                  |
| ------------------------------------------------- | ----------------------------------------- |
| [Architecture](kino/docs/ARCHITECTURE.md)         | Structure, data flow, models, integrations |
| [Internationalization](kino/docs/internationalization.md) | How translations work, adding a language |
| [Manifesto](kino/docs/MANIFESTO.md)               | Why Kino exists and its principles         |

## License

Copyright © 2026 SahandMSV. All rights reserved. The source code is provided for viewing purposes only; see [LICENSE](LICENSE).
