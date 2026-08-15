import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AppNavbar } from "@/components/features/home/home-nav";
import { MediaHero } from "@/components/features/media/media-hero";
import { TrackingControls } from "@/components/features/media/tracking-controls";
import { CastSection } from "@/components/features/media/cast-section";
import { CrewSection } from "@/components/features/media/crew-section";
import { VideosSection } from "@/components/features/media/videos-section";
import { getMovie } from "@/lib/tmdb/details";
import { getWatchEntryForMedia } from "@/lib/actions/tracking";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    return { title: "Movie · Kino" };
  }

  try {
    const movie = await getMovie(numericId);
    return {
      title: `${movie.title} · Kino`,
      description: movie.overview ?? undefined,
    };
  } catch {
    return { title: "Movie · Kino" };
  }
}

export default async function MovieDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isFinite(numericId) || numericId <= 0) {
    notFound();
  }

  let movie;
  try {
    movie = await getMovie(numericId);
  } catch {
    notFound();
  }

  const session = await auth();
  const watchEntry = session?.user ? await getWatchEntryForMedia(numericId, "movie") : null;

  return (
    <div className='flex min-h-screen flex-col'>
      <AppNavbar user={session?.user ?? null} />

      <main className='flex-1'>
        <MediaHero
          title={movie.title}
          tagline={movie.tagline}
          overview={movie.overview}
          posterPath={movie.poster_path}
          backdropPath={movie.backdrop_path}
          releaseDate={movie.release_date}
          runtime={movie.runtime}
          voteAverage={movie.vote_average}
          voteCount={movie.vote_count}
          genres={movie.genres}
          extraMeta={movie.status ?? null}
        />

        {session?.user ? (
          <TrackingControls
            tmdbId={movie.id}
            mediaType='movie'
            title={movie.title}
            posterPath={movie.poster_path}
            initialStatus={watchEntry?.status ?? null}
          />
        ) : null}

        <CastSection cast={movie.credits?.cast ?? []} />
        <CrewSection crew={movie.credits?.crew ?? []} />
        <VideosSection videos={movie.videos?.results ?? []} />
      </main>
    </div>
  );
}
