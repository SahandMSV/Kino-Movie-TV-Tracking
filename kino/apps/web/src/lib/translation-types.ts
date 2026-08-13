import { translations } from "./translations";

export type Translation = typeof translations.en;

/**
 * Creates:
 * "common.register"
 * "common.login"
 * "home.title"
 * ...
 */
type NestedKeyOf<T> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown> ? `${K}.${NestedKeyOf<T[K]>}` : K;
}[keyof T & string];

export type TranslationKey = NestedKeyOf<Translation>;
