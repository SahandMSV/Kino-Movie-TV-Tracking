# Kino Android

The mobile app for [Kino](../../../README.md), built with Expo SDK 57, Expo Router and React Native 0.86.

> **Status:** early stage. The code is still based on the Expo starter template (placeholder home screen and an Explore tab). Tracking features currently exist only in the web app.

## Getting started

```bash
pnpm install
pnpm start
```

From the Expo output you can open the app in an Android emulator, a development build or Expo Go.

| Script           | Description                    |
| ---------------- | ------------------------------ |
| `pnpm start`     | Start the Expo dev server      |
| `pnpm android`   | Start and open on Android      |
| `pnpm ios`       | Start and open on iOS          |
| `pnpm web`       | Start and open on web          |
| `pnpm lint`      | Run Expo lint                  |

## Project layout

```bash
src/
├── app/           # File-based routes (index, explore, _layout)
├── components/    # Themed components, tabs, splash animation
├── constants/     # Theme colors, spacing, fonts
└── hooks/         # Color scheme and theme hooks
```

Routing is handled by [Expo Router](https://docs.expo.dev/router/introduction). Native tabs are defined in `src/components/app-tabs.tsx`, with a web variant in `app-tabs.web.tsx`.

## Notes

- Check the [Expo SDK 57 docs](https://docs.expo.dev/versions/v57.0.0/) before changing code (see `AGENTS.md`).
- The `.gitignore` excludes the generated `/android` and `/ios` native folders.
- Planned: reuse the web app's data model and TMDB logic through shared packages (see [Architecture](../../docs/ARCHITECTURE.md)).
