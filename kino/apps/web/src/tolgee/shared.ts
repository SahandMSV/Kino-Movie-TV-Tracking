import { Tolgee, FormatSimple } from "@tolgee/web";

export const ALL_LANGUAGES = ["en", "de", "fr", "es"] as const;
export type Language = (typeof ALL_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "en";

export function TolgeeBase() {
  return Tolgee()
    .use(FormatSimple())
    .updateDefaults({
      apiKey: process.env.NEXT_PUBLIC_TOLGEE_API_KEY,
      apiUrl: process.env.NEXT_PUBLIC_TOLGEE_API_URL,
      staticData: {
        en: () => import("../../messages/en.json"),
        de: () => import("../../messages/de.json"),
        fr: () => import("../../messages/fr.json"),
        es: () => import("../../messages/es.json"),
      },
    });
}
