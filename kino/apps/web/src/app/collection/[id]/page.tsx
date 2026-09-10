import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AppNavbar } from "@/components/features/home/home-nav";
import { CollectionHero } from "@/components/features/media/collection-hero";
import { CollectionPartsGrid } from "@/components/features/media/collection-parts-grid";
import { getCollection } from "@/lib/tmdb/details";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    return { title: "Collection · Kino" };
  }

  try {
    const collection = await getCollection(numericId);
    return {
      title: `${collection.name} · Kino`,
      description: collection.overview ?? undefined,
    };
  } catch {
    return { title: "Collection · Kino" };
  }
}

export default async function CollectionPage({ params }: Props) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    notFound();
  }

  const session = await auth();

  let collection;
  try {
    collection = await getCollection(numericId);
  } catch {
    notFound();
  }

  return (
    <div className='flex min-h-screen flex-col'>
      <AppNavbar user={session?.user ?? null} />
      <main className='flex-1 pb-16'>
        <CollectionHero
          name={collection.name}
          overview={collection.overview}
          posterPath={collection.poster_path}
          backdropPath={collection.backdrop_path}
          partCount={collection.parts.length}
        />
        <CollectionPartsGrid parts={collection.parts} />
      </main>
    </div>
  );
}