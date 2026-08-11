import { auth } from "@/auth";
import { AppNavbar } from "@/components/features/home/home-nav";
import { Entrance } from "@/components/common/entrance-wrapper";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <AppNavbar user={session?.user ?? null} />

      <main className="relative flex flex-1 items-center justify-center px-6">
        <Entrance>
          <div className="max-w-md space-y-4 text-center">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Kino
            </h1>
            <p className="text-lg text-muted-foreground">
              Every story worth watching, in one place.
            </p>
            <p className="text-sm text-muted-foreground">
              Track what you watch. Discover what’s next.
            </p>
          </div>
        </Entrance>
      </main>
    </div>
  );
}