import { auth } from "@/auth";
import { AppNavbar } from "@/components/features/home/home-nav";
import { NotFoundView } from "@/components/common/not-found-view";

export default async function PersonNotFound() {
  const session = await auth();

  return (
    <div className='flex min-h-screen flex-col'>
      <AppNavbar user={session?.user ?? null} />
      <main className='flex-1'>
        <NotFoundView
          title='Person not found'
          description='This person doesn’t exist or couldn’t be loaded.'
          primaryHref='/'
          primaryLabel='Back home'
        />
      </main>
    </div>
  );
}
