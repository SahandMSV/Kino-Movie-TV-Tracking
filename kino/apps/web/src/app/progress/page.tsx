import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppNavbar } from "@/components/features/home/home-nav";
import { WatchEntryGrid } from "@/components/features/tracking/watch-entry-grid";
import { listWatchEntriesByStatuses } from "@/lib/actions/tracking";
import { getTranslate } from "@/tolgee/server";

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/register");
  }

  const t = await getTranslate();
  const watching = await listWatchEntriesByStatuses(["watching"]);
  const watched = await listWatchEntriesByStatuses(["watched"]);

  return (
    <div className='flex min-h-screen flex-col'>
      <AppNavbar user={session.user} />

      <main className='flex-1 pb-16'>
        <div className='mx-auto max-w-6xl px-4 pt-10 sm:px-6'>
          <h1 className='text-3xl font-semibold tracking-tight'>{t("progress.title")}</h1>
          <p className='mt-1 text-sm text-muted-foreground'>{t("progress.subtitle")}</p>
        </div>

        <div className='mx-auto max-w-6xl px-4 pt-8 sm:px-6'>
          <h2 className='text-xl font-semibold tracking-tight'>{t("progress.watching")}</h2>
        </div>
        <WatchEntryGrid
          entries={watching}
          emptyTitle={t("progress.empty_watching_title")}
          emptyDescription={t("progress.empty_watching_desc")}
        />

        <div className='mx-auto max-w-6xl px-4 pt-4 sm:px-6'>
          <h2 className='text-xl font-semibold tracking-tight'>{t("progress.watched")}</h2>
        </div>
        <WatchEntryGrid
          entries={watched}
          emptyTitle={t("progress.empty_watched_title")}
          emptyDescription={t("progress.empty_watched_desc")}
        />
      </main>
    </div>
  );
}
