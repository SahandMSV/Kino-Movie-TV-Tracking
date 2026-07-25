import { Entrance } from "@/components/common/entrance-wrapper";
import { HeroCard } from "@/components/features/home/hero-card";
import { UtilityControls } from "@/components/features/home/utility-controls";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-6">
      <UtilityControls />

      <Entrance>
        <HeroCard />
      </Entrance>
    </main>
  );
}
