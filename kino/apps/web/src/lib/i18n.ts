import type { TranslationKey } from "./translation-types";

export function getNestedValue<T extends object>(
  obj: T,
  key: TranslationKey,
): string {
  let value: unknown = obj;

  for (const part of key.split(".")) {
    if (value === null || typeof value !== "object" || !(part in value)) {
      return key;
    }

    value = (value as Record<string, unknown>)[part];
  }

  return typeof value === "string" ? value : key;
}
