"use client";

import { useLanguage } from "@/components/language-provider";
import { getNestedValue } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/translation-types";
import { translations } from "@/lib/translations";

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: TranslationKey) => getNestedValue(translations[language], key);

  return {
    t,
    language,
  };
}
