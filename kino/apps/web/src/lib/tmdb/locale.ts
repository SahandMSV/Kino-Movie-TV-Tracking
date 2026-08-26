import "server-only";

import { getLanguage } from "@/tolgee/language";
import type { Language } from "@/tolgee/shared";

const TMDB_LOCALE: Record<Language, string> = {
  en: "en-US",
  de: "de-DE",
  fr: "fr-FR",
  es: "es-ES",
};

export function toTmdbLanguage(lang: Language): string {
  return TMDB_LOCALE[lang] ?? TMDB_LOCALE.en;
}

export async function resolveTmdbLanguage(override?: Language): Promise<string> {
  const lang = override ?? (await getLanguage());
  return toTmdbLanguage(lang);
}
