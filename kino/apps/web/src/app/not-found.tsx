import { auth } from "@/auth";
import { AppNavbar } from "@/components/features/home/home-nav";
import { NotFoundView } from "@/components/common/not-found-view";

export default async function GlobalNotFound() {
  const session = await auth();

  return (
    <div className='flex min-h-screen flex-col'>
      <AppNavbar user={session?.user ?? null} />
      <main className='flex-1'>
        <NotFoundView />
      </main>
    </div>
  );
}
