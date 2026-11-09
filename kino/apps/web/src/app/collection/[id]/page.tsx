import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AppNavbar } from "@/components/features/home/home-nav";
import { CollectionHero } from "@/components/features/media/collection-hero";
import { CollectionPartsGrid } from "@/components/features/media/collection-parts-grid";
import { getCollection, getMediaImages } from "@/lib/tmdb/details";

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

  const [session, collectionResult, images] = await Promise.all([
    auth(),
    getCollection(numericId).catch(() => null),
    getMediaImages(numericId, "collection").catch(() => []),
  ]);

  if (!collectionResult) notFound();
  const collection = collectionResult;

  // Collection API has no popularity; use the strongest part signal if present
  const popularity = collection.parts.reduce<number | null>((max, part) => {
    const p = part.popularity;
    if (p == null || !(p > 0)) return max;
    return max == null ? p : Math.max(max, p);
  }, null);

  return (
    <div className='flex min-h-screen flex-col'>
      <AppNavbar user={session?.user ?? null} />
      <main className='flex-1 pb-16'>
        <CollectionHero
          collectionId={collection.id}
          name={collection.name}
          overview={collection.overview}
          posterPath={collection.poster_path}
          backdropPath={collection.backdrop_path}
          partCount={collection.parts.length}
          popularity={popularity}
          images={images}
        />
        <CollectionPartsGrid parts={collection.parts} />
      </main>
    </div>
  );
}
