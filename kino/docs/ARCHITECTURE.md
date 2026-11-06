# Architecture

## Overview

**Kino** is a pnpm monorepo for tracking movies, TV shows and related media. The **web** app is the primary product today; the **Android** app (Expo) is at the starter stage.

### Current structure

```bash
kino/
├── apps/
│   ├── web/           # Next.js 16 App Router + React 19 (active)
│   └── android/       # Expo SDK 57 + Expo Router (starter template)
├── docs/              # You are here
├── package.json       # Root scripts (turbo, prettier)
├── pnpm-workspace.yaml
├── prettier.config.mjs
└── turbo.json
```

### Planned structure

The workspace is already configured for `packages/*`, but none of these exist yet. They are the intended home for code shared between web and mobile:

```bash
packages/
├── ui/            # Shared components
├── types/         # Shared TypeScript types
├── api/           # API clients / contracts
├── db/            # Database schemas and models
├── lib/           # Utilities and business logic
└── config/        # Shared configuration
```

Today the models, TMDB client and schemas live inside `apps/web/src/lib`.

## Web app (`apps/web`)

### Stack

| Concern    | Choice                                                         |
| ---------- | -------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Server Components, Server Actions)     |
| Language   | TypeScript (strict), React 19 with React Compiler              |
| Styling    | Tailwind CSS 4, shadcn/ui `base-nova` style on `@base-ui/react` |
| Animation  | Framer Motion                                                  |
| Database   | MongoDB through Mongoose (models) and the native driver (Auth adapter) |
| Auth       | Auth.js v5 beta, credentials provider, JWT sessions            |
| Validation | Zod                                                            |
| i18n       | Tolgee (see [internationalization.md](./internationalization.md)) |

### Source layout

```bash
src/
├── app/                 # Routes (App Router)
│   ├── page.tsx         # Home: carousels
│   ├── movie/[id]/      # Movie detail
│   ├── tv/[id]/         # TV detail + episode progress
│   ├── person/[id]/     # Person detail + credits
│   ├── collection/[id]/ # Film collection
│   ├── watchlist/       # plan_to_watch entries
│   ├── progress/        # watching + watched entries
│   ├── settings/        # Profile, appearance, language, integrations
│   ├── register/        # Landing + login/signup sliding card
│   ├── status/          # Health dashboard (status.localhost only)
│   └── api/auth/        # Auth.js route handlers
├── components/
│   ├── ui/              # shadcn primitives
│   ├── common/          # MediaImage, SlidingCard, NotFoundView, Entrance
│   └── features/        # home, media, settings, status, tracking
├── lib/
│   ├── actions/         # Server Actions (auth, tracking, settings, search, ...)
│   ├── db/              # mongodb.ts, mongoose.ts, models/
│   ├── integrations/    # Trakt
│   ├── status/          # Health checks
│   └── tmdb/            # TMDB client, schemas, details, discover, search
├── tolgee/              # i18n setup (client, server, language cookie)
├── auth.ts              # Auth.js config (credentials + adapter)
├── auth.config.ts       # Edge-safe base config
└── proxy.ts             # Host-based routing for the status page
```

### Request and data flow

1. A Server Component page (for example `movie/[id]/page.tsx`) calls `auth()` for the session and the TMDB helpers in `lib/tmdb` for metadata.
2. TMDB responses are fetched through `tmdbFetch` (server only, bearer token), validated with Zod and cached with `next: { revalidate }` (1 to 12 hours depending on the endpoint).
3. If the user is signed in, the page also loads their `WatchEntry` through `getWatchEntryForMedia`.
4. Client components (`TrackingControls`, `RatingNotes`, `EpisodeProgress`) call Server Actions in `lib/actions/tracking.ts`, update local state optimistically and revalidate the affected paths.

### Data models

**User** (`lib/db/models/user.ts`)

- `email`, `username` (unique, lowercase), `passwordHash` (not selected by default), `name`, `image`
- `preferences`: `language`, `theme`, `lockEnglishPosters` (default `true`)
- `trakt`: `connected`, `username`, `accessToken`/`refreshToken` (encrypted, not selected by default), `expiresAt`, `connectedAt`

**WatchEntry** (`lib/db/models/watch-entry.ts`)

- `userId`, `tmdbId`, `mediaType` (`movie` or `tv`), `status`, `title`, `posterPath`
- `status` is one of `plan_to_watch`, `watching`, `watched`, `dropped`, `on_hold`
- `watchedAt`, `rating` (0.5 to 10), `notes` (max 4000 chars), `watchedEpisodes` (`{ season, episode }[]`)
- Unique index on `(userId, mediaType, tmdbId)`; list index on `(userId, status, updatedAt)`

### Tracking behaviour

- Setting status to `watched` stores `watchedAt`; any other status clears it.
- Rating, notes and episode changes require an existing entry (a status must be set first).
- Marking an episode or season watched on a `plan_to_watch` or `on_hold` show promotes it to `watching`.
- Lists use cursor pagination on `(updatedAt, _id)`; the cursor is encoded as `ISO_DATE__ID`.
- Poster paths are refreshed from TMDB at list time and fall back to the stored value.

### Authentication

Auth.js v5 with a credentials provider (email or username plus password). Passwords are hashed with bcrypt (12 rounds). Sessions are JWTs carrying `id` and `username`. Registration (`registerAction`) validates with Zod, creates the user and signs in automatically. There is no email verification or password reset yet; the "Forgot password" and "Terms" buttons are placeholders.

### Language and artwork

- UI language comes from the `kino_lang` cookie, falling back to the `Accept-Language` header, then English.
- TMDB text is requested in the UI language, with fallbacks to translations and English.
- When `lockEnglishPosters` is on (default, also used for signed-out visitors), artwork comes from the `en-US` response and is merged over the localized results.

### TMDB integration

`lib/tmdb` contains: `client.ts` (authenticated fetch), `config.ts` (image URL helpers), `schemas.ts` and `details.ts` (Zod schemas and types), `discover.ts` (trending, popular, recommendations), `search.ts` (multi search), `locale.ts` (language resolution) and `release-status.ts` (theatrical/digital status from release dates, preferring US).

### Trakt integration

`lib/integrations/trakt.ts` implements the OAuth authorization-code flow, token refresh, and encrypted token storage (AES-256-GCM with a key derived from `AUTH_SECRET`). `connect` and `callback` handlers use a short-lived `kino_trakt_oauth_state` cookie to validate state. Syncing history and progress is not implemented yet.

### Status page

`proxy.ts` rewrites requests on `status.localhost` to `/status` and hides `/status` on every other host. The page runs checks for the environment, MongoDB, Mongoose, TMDB, Auth.js and the Node runtime (`lib/status/checks.ts`), and each card can re-run its own check through a Server Action.

## Android app (`apps/android`)

Expo SDK 57 with Expo Router and typed routes, the React Compiler and native tabs. The code is still the starter template with a placeholder home screen. Agent guidance for Expo lives in `apps/android/AGENTS.md`.

## Environment variables

| Variable                                       | Required | Purpose                          |
| ---------------------------------------------- | -------- | -------------------------------- |
| `MONGODB_URI`                                  | yes      | MongoDB connection               |
| `AUTH_SECRET`                                  | yes      | Auth.js secret and Trakt key     |
| `TMDB_ACCESS_TOKEN`                            | yes      | TMDB API read access token       |
| `TMDB_API_KEY`                                 | no       | Reported by the status page      |
| `TRAKT_CLIENT_ID`, `TRAKT_CLIENT_SECRET`, `TRAKT_REDIRECT_URI` | no | Trakt OAuth      |
| `NEXT_PUBLIC_TOLGEE_API_URL`, `NEXT_PUBLIC_TOLGEE_API_KEY`     | no | Tolgee in-context editing |

## Known gaps

- The Trakt `connect` and `callback` handlers are under `src/lib/integrations/trakt/`, but the settings page links to `/api/integrations/trakt/connect`. Route handlers only work inside `src/app`, so they should move to `src/app/api/integrations/trakt/{connect,callback}/route.ts`.
- `turbo.json` uses the older `pipeline` key (Turborepo 2 expects `tasks`), and `turbo` is not listed as a dependency, so root `pnpm dev` will not work yet.
- `docker-compose.yml` is empty.
- Some UI strings are still hard-coded in English (see the i18n doc).
- `.env.example` does not list the Trakt and Tolgee variables.
