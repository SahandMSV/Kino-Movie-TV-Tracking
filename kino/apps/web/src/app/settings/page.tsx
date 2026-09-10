import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppNavbar } from "@/components/features/home/home-nav";
import { SettingsForm } from "@/components/features/settings/settings-form";
import { getUserPreferences } from "@/lib/actions/settings";
import { getTranslate } from "@/tolgee/server";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/register");
  }

  const t = await getTranslate();
  const data = await getUserPreferences();
  if (!data) {
    redirect("/register");
  }

  return (
    <div className='flex min-h-screen flex-col'>
      <AppNavbar user={session.user} />

      <main className='flex-1 pb-16'>
        <div className='mx-auto max-w-2xl px-4 pt-10 sm:px-6'>
          <h1 className='text-3xl font-semibold tracking-tight'>{t("settings.title")}</h1>
          <p className='mt-1 text-sm text-muted-foreground'>{t("settings.subtitle")}</p>

          <div className='mt-10'>
            <SettingsForm initial={data} />
          </div>
        </div>
      </main>
    </div>
  );
}
