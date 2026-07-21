"use client";

import { useLanguage } from "@/components/language-provider";
import { translations } from "@/lib/translations";

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: string): string => {
    // Support nested keys like "home.title"
    return key
      .split(".")
      .reduce((obj, k) => obj?.[k] ?? key, translations[language]) as string;
  };

  return { t, language };
}
