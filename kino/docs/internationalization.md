# Internationalization (i18n)

## Overview

Kino uses [Tolgee](https://tolgee.io) with the ICU message format for interface translations. Supported languages today: **English (`en`)**, **German (`de`)**, **French (`fr`)** and **Spanish (`es`)**. English is the default.

There are two separate language concerns:

1. **Interface language**: the text of Kino itself, handled by Tolgee and the `messages/*.json` files.
2. **Content language**: titles, overviews and taglines from TMDB, plus artwork, controlled by `lib/tmdb/locale.ts`.

> The README is also available in Persian ([README.fa.md](../../README.fa.md)). Persian is not yet a language of the app itself.

## Files

```bash
apps/web/
├── messages/
│   ├── en.json            # Source of truth
│   ├── de.json
│   ├── fr.json
│   └── es.json
└── src/
    ├── tolgee/
    │   ├── shared.ts      # Languages, default language, Tolgee base config
    │   ├── language.ts    # Server Actions: get/set the language cookie
    │   ├── server.tsx     # getTolgee, getTranslate, T for Server Components
    │   └── client.tsx     # TolgeeNextProvider for Client Components
    ├── lib/tmdb/locale.ts # Maps UI language to TMDB locale
    └── components/
        ├── language-switcher.tsx
        └── features/settings/settings-form.tsx
```

## How it flows

1. `getLanguage()` (`tolgee/language.ts`) reads the `kino_lang` cookie. If it is missing or invalid it detects the language from `Accept-Language`, then falls back to `en`.
2. `RootLayout` resolves the language, loads the required static data and passes both to `TolgeeNextProvider`, which also sets `<html lang>`.
3. **Server Components** use `const t = await getTranslate()`.
4. **Client Components** use `const { t } = useTranslate()` from `@tolgee/react`.
5. Changing language (navbar switcher or Settings) calls `setLanguage(code)` to store the cookie, then `tolgee.changeLanguage(code)` and `router.refresh()`. The Settings page also saves the choice to the user's `preferences.language`.

Translations are bundled as static JSON (`staticData` in `tolgee/shared.ts`), so the app works without a Tolgee account. `NEXT_PUBLIC_TOLGEE_API_URL` and `NEXT_PUBLIC_TOLGEE_API_KEY` are only needed for in-context editing.

## Message keys

Keys are grouped by area: `common`, `home`, `nav`, `auth`, `not_found`, `watchlist`, `progress`, `status`, `collection`, `episodes`, `settings`.

Examples:

```tsx
t("home.title");
t("home.welcome_back", { name });
t("collection.part_count", { count: 3 });          // ICU plural
t("episodes.subtitle", { watched: 4, total: 10 });
t(`status.${entry.status}`);                        // plan_to_watch, watching, ...
```

Keys are plain strings, so a typo is not caught at compile time; missing keys are visible at runtime.

## Adding a translation key

1. Add the key to `messages/en.json`.
2. Add the same key to `de.json`, `fr.json` and `es.json`. Keep the structure identical.
3. Use `t("group.key")` in the component.
4. Use ICU syntax for variables and plurals, for example `{count, plural, one {# film} other {# films}}`.

## Adding a language

1. Create `messages/<code>.json` with every key from `en.json`.
2. In `tolgee/shared.ts`: add the code to `ALL_LANGUAGES` and a loader to `staticData`.
3. In `lib/tmdb/locale.ts`: add the TMDB locale to `TMDB_LOCALE` (for example `fa: "fa-IR"`).
4. Add its display name to the `labels` map in `language-switcher.tsx` and `LANG_LABELS` in `settings-form.tsx`.
5. The Zod schema in `lib/actions/settings.ts` derives from `ALL_LANGUAGES`, so no change is needed there.
6. For a right-to-left language such as Persian, also set `dir="rtl"` on `<html>` in `app/layout.tsx` and review layouts that use left/right utilities.

## Content language and posters

- `resolveUiLanguage()` returns the interface language; it is used to pick translated titles, overviews and taglines from TMDB's `translations` data.
- `resolveTmdbLanguage()` returns the TMDB locale used for requests.
- **Always use English posters** (`preferences.lockEnglishPosters`, default on) makes `resolveTmdbLanguage()` return `en-US`. List endpoints (trending, popular, recommendations, search) fetch both localized and English results and keep the English artwork. Signed-out visitors always get English artwork.

## Known gaps

Several strings are still hard-coded in English and should be moved into `messages/*.json`:

- Tracking controls and toasts (`tracking-controls.tsx`), rating and notes (`rating-notes.tsx`)
- Section headings "Cast", "Crew", "Videos", "More like this", "Acting"
- Search modal placeholder and empty states, account menu label, "Settings" item in the navbar
- Release badge text, hero metadata ("season(s)", "episode(s)", "votes", "Born")
- Not-found page overrides, status page, validation messages from Server Actions
- Theme toggle labels (System / Light / Dark)

## Future plans

Persian as a fourth-plus app language (with RTL support), and moving the remaining hard-coded strings into the message files.
