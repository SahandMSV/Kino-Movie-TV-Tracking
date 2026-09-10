"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useTolgee, useTranslate } from "@tolgee/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updatePreferences } from "@/lib/actions/settings";
import { setLanguage } from "@/tolgee/language";
import { ALL_LANGUAGES } from "@/tolgee/shared";

type InitialData = {
  name: string | null;
  username: string;
  email: string;
  image: string | null;
  preferences: {
    language: string;
    theme: string;
    lockEnglishPosters: boolean;
  };
};

const LANG_LABELS: Record<string, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
};

export function SettingsForm({ initial }: { initial: InitialData }) {
  const { t } = useTranslate();
  const router = useRouter();
  const tolgee = useTolgee(["language"]);
  const { setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(initial.name ?? "");
  const [language, setLocalLanguage] = useState(initial.preferences.language);
  const [theme, setLocalTheme] = useState(initial.preferences.theme);
  const [lockEnglishPosters, setLockEnglishPosters] = useState(
    initial.preferences.lockEnglishPosters,
  );

  const save = () => {
    startTransition(async () => {
      const res = await updatePreferences({
        name: name.trim() || undefined,
        language: language as any,
        theme: theme as any,
        lockEnglishPosters,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      if (language !== tolgee.getLanguage()) {
        await setLanguage(language);
        await tolgee.changeLanguage(language);
      }
      setTheme(theme);

      toast.success(t("settings.saved"));
      router.refresh();
    });
  };

  return (
    <div className='space-y-10'>
      {/* Profile */}
      <section className='space-y-4'>
        <div>
          <h2 className='text-lg font-medium'>{t("settings.profile")}</h2>
          <p className='text-sm text-muted-foreground'>{t("settings.profile_desc")}</p>
        </div>
        <div className='space-y-3'>
          <div className='space-y-1.5'>
            <Label htmlFor='display-name'>{t("settings.display_name")}</Label>
            <Input
              id='display-name'
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={initial.username}
              maxLength={80}
            />
          </div>
          <div className='space-y-1.5'>
            <Label>{t("settings.username")}</Label>
            <Input value={`@${initial.username}`} disabled />
          </div>
          <div className='space-y-1.5'>
            <Label>{t("settings.email")}</Label>
            <Input value={initial.email} disabled />
          </div>
        </div>
      </section>

      <Separator />

      {/* Appearance */}
      <section className='space-y-4'>
        <div>
          <h2 className='text-lg font-medium'>{t("settings.appearance")}</h2>
          <p className='text-sm text-muted-foreground'>{t("settings.appearance_desc")}</p>
        </div>
        <div className='space-y-1.5'>
          <Label>{t("settings.theme")}</Label>
          <Select
            value={theme}
            onValueChange={value => {
              if (value !== null) {
                setLocalTheme(value);
              }
            }}
          >
            <SelectTrigger className='w-full sm:w-64'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='system'>{t("settings.theme_system")}</SelectItem>
              <SelectItem value='light'>{t("settings.theme_light")}</SelectItem>
              <SelectItem value='dark'>{t("settings.theme_dark")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <Separator />

      {/* Language */}
      <section className='space-y-4'>
        <div>
          <h2 className='text-lg font-medium'>{t("settings.language")}</h2>
          <p className='text-sm text-muted-foreground'>{t("settings.language_desc")}</p>
        </div>
        <div className='space-y-1.5'>
          <Label>{t("settings.ui_language")}</Label>
          <Select
            value={language}
            onValueChange={value => {
              if (value !== null) {
                setLocalLanguage(value);
              }
            }}
          >
            <SelectTrigger className='w-full sm:w-64'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_LANGUAGES.map(code => (
                <SelectItem key={code} value={code}>
                  {LANG_LABELS[code]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <Separator />

      {/* Images */}
      <section className='space-y-4'>
        <div>
          <h2 className='text-lg font-medium'>{t("settings.images")}</h2>
          <p className='text-sm text-muted-foreground'>{t("settings.images_desc")}</p>
        </div>
        <div className='flex items-center justify-between gap-4 rounded-lg border border-border/60 px-4 py-3'>
          <div className='space-y-0.5'>
            <Label htmlFor='lock-english' className='text-sm font-medium'>
              {t("settings.lock_english_posters")}
            </Label>
            <p className='text-xs text-muted-foreground'>
              {t("settings.lock_english_posters_desc")}
            </p>
          </div>
          <Switch
            id='lock-english'
            checked={lockEnglishPosters}
            onCheckedChange={setLockEnglishPosters}
          />
        </div>
      </section>

      <Separator />

      {/* Integrations */}
      <section className='space-y-4'>
        <div>
          <h2 className='text-lg font-medium'>{t("settings.integrations")}</h2>
          <p className='text-sm text-muted-foreground'>{t("settings.integrations_desc")}</p>
        </div>
        <div className='flex items-center justify-between gap-4 rounded-lg border border-border/60 px-4 py-3'>
          <div className='space-y-0.5'>
            <p className='text-sm font-medium'>Trakt</p>
            <p className='text-xs text-muted-foreground'>{t("settings.trakt_desc")}</p>
          </div>
          <Button variant='secondary' size='sm' disabled>
            {t("settings.connect_trakt")}
          </Button>
        </div>
      </section>

      <div className='pt-2'>
        <Button onClick={save} disabled={isPending}>
          {isPending ? t("common.loading") : t("common.save")}
        </Button>
      </div>
    </div>
  );
}
