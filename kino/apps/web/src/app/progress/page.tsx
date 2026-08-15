import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppNavbar } from "@/components/features/home/home-nav";
import { WatchEntryGrid } from "@/components/features/tracking/watch-entry-grid";
import { listWatchEntriesByStatuses } from "@/lib/actions/tracking";

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/register");
  }

  const watching = await listWatchEntriesByStatuses(["watching"]);
  const watched = await listWatchEntriesByStatuses(["watched"]);

  return (
    <div className='flex min-h-screen flex-col'>
      <AppNavbar user={session.user} />

      <main className='flex-1 pb-16'>
        <div className='mx-auto max-w-6xl px-4 pt-10 sm:px-6'>
          <h1 className='text-3xl font-semibold tracking-tight'>Progress</h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            What you’re watching and what you’ve finished.
          </p>
        </div>

        <div className='mx-auto max-w-6xl px-4 pt-8 sm:px-6'>
          <h2 className='text-xl font-semibold tracking-tight'>Watching</h2>
        </div>
        <WatchEntryGrid
          entries={watching}
          emptyTitle='Nothing in progress'
          emptyDescription='Mark a title as Watching on its detail page.'
        />

        <div className='mx-auto max-w-6xl px-4 pt-4 sm:px-6'>
          <h2 className='text-xl font-semibold tracking-tight'>Watched</h2>
        </div>
        <WatchEntryGrid
          entries={watched}
          emptyTitle='No watched titles yet'
          emptyDescription='Mark movies and shows as Watched when you finish them.'
        />
      </main>
    </div>
  );
}
