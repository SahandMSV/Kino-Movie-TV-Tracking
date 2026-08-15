import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AppNavbar } from "@/components/features/home/home-nav";
import { PersonHero } from "@/components/features/media/person-hero";
import { PersonCreditsSection } from "@/components/features/media/person-credits-section";
import { getPerson } from "@/lib/tmdb/details";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    return { title: "Person · Kino" };
  }

  try {
    const person = await getPerson(numericId);
    return {
      title: `${person.name} · Kino`,
      description: person.biography?.slice(0, 160) || undefined,
    };
  } catch {
    return { title: "Person · Kino" };
  }
}

export default async function PersonDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isFinite(numericId) || numericId <= 0) {
    notFound();
  }

  let person;
  try {
    person = await getPerson(numericId);
  } catch {
    notFound();
  }

  const session = await auth();

  return (
    <div className='flex min-h-screen flex-col'>
      <AppNavbar user={session?.user ?? null} />

      <main className='flex-1'>
        <PersonHero
          name={person.name}
          biography={person.biography}
          profilePath={person.profile_path}
          birthday={person.birthday}
          deathday={person.deathday}
          placeOfBirth={person.place_of_birth}
          knownForDepartment={person.known_for_department}
        />

        <PersonCreditsSection
          cast={person.combined_credits?.cast ?? []}
          crew={person.combined_credits?.crew ?? []}
        />
      </main>
    </div>
  );
}
