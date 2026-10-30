import "server-only";

import { auth } from "@/auth";
import { connectMongoose } from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/user";
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

async function getLockEnglishPosters(): Promise<boolean> {
  try {
    const session = await auth();
    if (!session?.user?.id) return true;

    await connectMongoose();

    const user = await User.findById(session.user.id).select("preferences").lean();
    const lock = (user?.preferences as { lockEnglishPosters?: boolean } | undefined)
      ?.lockEnglishPosters;

    return lock ?? true;
  } catch {
    return true;
  }
}

export async function isEnglishPostersLocked(): Promise<boolean> {
  return getLockEnglishPosters();
}

export async function resolveTmdbLanguage(override?: Language): Promise<string> {
  const lockEnglishPosters = await getLockEnglishPosters();

  if (lockEnglishPosters) {
    return TMDB_LOCALE.en;
  }

  const language = override ?? (await getLanguage());
  return toTmdbLanguage(language);
}

export async function resolveUiLanguage(override?: Language): Promise<Language> {
  return override ?? (await getLanguage());
}
