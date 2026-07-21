# Internationalization (i18n)

## Overview

Kino has a small custom i18n setup rather than pulling in a full library.
The main goals were type safety, simplicity, and not locking us into
anything.

Translation access is isolated behind a single hook, so if we ever want
to move to something like next-intl down the line, we can do it without
touching every component that uses translated strings.

## Goals

Type-safe keys with IDE autocomplete were the main priority — we wanted
invalid keys to fail at compile time, not show up as missing strings in
prod. Beyond that: keep the runtime footprint small, keep translations
centralized in one place, and don't make migration painful later.

## Directory Structure

```

src/
├── hooks/
│ └── use-translation.ts
│
├── lib/
│ ├── translations.ts
│ ├── translation-types.ts
│ └── i18n.ts
│
└── components/
└── language-provider.tsx

```

## How it flows

A component calls `useTranslation()`, which gives you `t()`. Calling
`t("home.title")` looks up the key via `getNestedValue()` against
`translations[currentLanguage]` and hands back the localized string.

## Translation Keys

Keys are generated from the English locale file, so things like
`home.title`, `home.subtitle`, or `common.login` all come from there.
If you typo a key or reference one that doesn't exist, it just won't
compile — no silent fallback to English or blank strings.

## Adding a new translation

1. Add the string to the English locale first.
2. Add the same key to every other locale file.
3. `TranslationKey` updates automatically — no manual type editing needed.
4. Call it with `t()` wherever you need it.

## Language persistence

Selected language gets saved to localStorage and read back when the
provider initializes, so it sticks across reloads.

## Future plans

We're keeping an eye on next-intl and next-international as possible
upgrades. Since every component goes through `useTranslation()` rather
than importing translations directly, swapping the internals later
shouldn't require touching component code.
