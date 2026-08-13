import { auth } from "@/auth";
import { AppNavbar } from "@/components/features/home/home-nav";
import { NotFoundView } from "@/components/common/not-found-view";

export default async function TvNotFound() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <AppNavbar user={session?.user ?? null} />
      <main className="flex-1">
        <NotFoundView
          title="TV show not found"
          description="This show doesn’t exist or could not be loaded from TMDB."
          primaryHref="/"
          primaryLabel="Back home"
        />
      </main>
    </div>
  );
}