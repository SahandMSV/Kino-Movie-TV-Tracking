import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Entrance } from "@/components/common/entrance-wrapper";
import { HeroCard } from "@/components/features/home/hero-card";

export default async function RegisterPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  return (
    <main className='relative flex min-h-screen items-center justify-center px-6'>
      <Entrance>
        <HeroCard />
      </Entrance>
    </main>
  );
}
