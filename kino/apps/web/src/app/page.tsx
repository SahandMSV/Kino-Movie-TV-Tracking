"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "@/hooks/use-translation";

export default function Home() {
  const { t } = useTranslation();

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-6">
      <div className="absolute right-6 top-6 flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <Card className="w-full max-w-xl">
        <CardContent className="flex flex-col items-center gap-6 p-10 text-center">
          <div className="space-y-3">
            <h1 className="text-6xl">{t("home.title")}</h1>
            <p>{t("home.subtitle")}</p>
            <p>{t("home.description")}</p>
          </div>

          <div className="flex w-full flex-col gap-3 pt-4 sm:w-auto sm:flex-row">
            <Button size="lg" className="sm:min-w-32">
              {t("common.register")}
            </Button>

            <Button variant="outline" size="lg" className="sm:min-w-32">
              {t("common.login")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
