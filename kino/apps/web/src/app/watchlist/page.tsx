import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppNavbar } from "@/components/features/home/home-nav";
import { WatchEntryGrid } from "@/components/features/tracking/watch-entry-grid";
import { listWatchEntriesByStatuses } from "@/lib/actions/tracking";
import { getTranslate } from "@/tolgee/server";

export default async function WatchlistPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/register");
  }

  const t = await getTranslate();
  const entries = await listWatchEntriesByStatuses(["plan_to_watch"]);

  return (
    <div className='flex min-h-screen flex-col'>
      <AppNavbar user={session.user} />

      <main className='flex-1'>
        <div className='mx-auto max-w-6xl px-4 pt-10 sm:px-6'>
          <h1 className='text-3xl font-semibold tracking-tight'>{t("watchlist.title")}</h1>
          <p className='mt-1 text-sm text-muted-foreground'>{t("watchlist.subtitle")}</p>
        </div>

        <WatchEntryGrid
          entries={entries}
          emptyTitle={t("watchlist.empty_title")}
          emptyDescription={t("watchlist.empty_description")}
        />
      </main>
    </div>
  );
}
