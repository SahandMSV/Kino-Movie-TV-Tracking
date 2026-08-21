import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AppNavbar } from "@/components/features/home/home-nav";
import { CollectionHero } from "@/components/features/media/collection-hero";
import { CollectionPartsGrid } from "@/components/features/media/collection-parts-grid";
import { getCollection } from "@/lib/tmdb/details";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CollectionPage({ params }: Props) {
  const { id } = await params;
  const collectionId = Number(id);
  if (!Number.isFinite(collectionId) || collectionId <= 0) notFound();

  const [session, collection] = await Promise.all([
    auth(),
    getCollection(collectionId).catch(() => null),
  ]);

  if (!collection) notFound();

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

        <div className='mx-auto max-w-6xl px-4 pt-2 sm:px-6'>
          <h2 className='text-xl font-semibold tracking-tight'>Films in this collection</h2>
        </div>

        <CollectionPartsGrid parts={collection.parts} />
      </main>
    </div>
  );
}
