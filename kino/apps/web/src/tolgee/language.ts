"use server";

import { cookies, headers } from "next/headers";
import { detectLanguageFromHeaders } from "@tolgee/react/server";
import { ALL_LANGUAGES, DEFAULT_LANGUAGE, type Language } from "./shared";

const COOKIE = "kino_lang";

export async function setLanguage(locale: string) {
  const store = await cookies();
  store.set(COOKIE, locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}

export async function getLanguage(): Promise<Language> {
  const store = await cookies();
  const locale = store.get(COOKIE)?.value;
  if (locale && (ALL_LANGUAGES as readonly string[]).includes(locale)) {
    return locale as Language;
  }
  const detected = detectLanguageFromHeaders(await headers(), [...ALL_LANGUAGES]);
  return (detected as Language) || DEFAULT_LANGUAGE;
}
