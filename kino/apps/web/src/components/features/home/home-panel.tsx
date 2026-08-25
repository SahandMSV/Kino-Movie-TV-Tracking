"use client";

import { Button } from "@/components/ui/button";
import { useTranslate } from "@tolgee/react";

type HomePanelProps = {
  onLogin: () => void;
  onRegister: () => void;
};

export function HomePanel({ onLogin, onRegister }: HomePanelProps) {
  const { t } = useTranslate();

  return (
    <div className='flex h-full w-full flex-col items-center justify-center text-center'>
      <div className='mb-8 space-y-3'>
        <h1 className='text-6xl font-semibold tracking-tight'>{t("home.title")}</h1>
        <p className='text-xl text-muted-foreground'>{t("home.subtitle")}</p>
        <p className='mx-auto max-w-xs text-sm text-muted-foreground'>{t("home.description")}</p>
      </div>

      <div className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row'>
        <Button size='lg' className='sm:min-w-32' onClick={onRegister}>
          {t("common.register")}
        </Button>

        <Button variant='outline' size='lg' className='sm:min-w-32' onClick={onLogin}>
          {t("common.login")}
        </Button>
      </div>
    </div>
  );
}
