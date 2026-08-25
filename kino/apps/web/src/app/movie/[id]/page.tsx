import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AppNavbar } from "@/components/features/home/home-nav";
import { MediaHero } from "@/components/features/media/media-hero";
import { CastSection } from "@/components/features/media/cast-section";
import { CrewSection } from "@/components/features/media/crew-section";
import { VideosSection } from "@/components/features/media/videos-section";
import { TrackingControls } from "@/components/features/media/tracking-controls";
import { RatingNotes } from "@/components/features/media/rating-notes";
import { CollectionSection } from "@/components/features/media/collection-section";
import { RecommendationsSection } from "@/components/features/media/recommendations-section";
import { getMovie, getCollection } from "@/lib/tmdb/details";
import { getMovieRecommendations } from "@/lib/tmdb/discover";
import { getWatchEntryForMedia } from "@/lib/actions/tracking";
import { deriveReleaseStatus } from "@/lib/tmdb/release-status";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MoviePage({ params }: Props) {
  const { id } = await params;
  const tmdbId = Number(id);
  if (!Number.isFinite(tmdbId) || tmdbId <= 0) notFound();

  const [session, movie] = await Promise.all([auth(), getMovie(tmdbId).catch(() => null)]);

  if (!movie) notFound();

  const [watchEntry, recommendations, collectionParts] = await Promise.all([
    session?.user ? getWatchEntryForMedia(tmdbId, "movie") : null,
    getMovieRecommendations(tmdbId).catch(() => ({ results: [] })),
    movie.belongs_to_collection?.id
      ? getCollection(movie.belongs_to_collection.id)
          .then(c => c.parts)
          .catch(() => undefined)
      : Promise.resolve(undefined),
  ]);

  const release = deriveReleaseStatus(movie.release_dates?.results);

  const cast = movie.credits?.cast ?? [];
  const crew = movie.credits?.crew ?? [];
  const videos = movie.videos?.results ?? [];

  return (
    <div className='flex min-h-screen flex-col'>
      <AppNavbar user={session?.user ?? null} />

      <main className='flex-1 pb-16'>
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
          status={movie.status}
          mediaType='movie'
        />

        {session?.user ? (
          <>
            <TrackingControls
              tmdbId={tmdbId}
              mediaType='movie'
              title={movie.title}
              posterPath={movie.poster_path}
              initialStatus={watchEntry?.status ?? null}
            />
            <RatingNotes
              tmdbId={tmdbId}
              mediaType='movie'
              initialRating={watchEntry?.rating ?? null}
              initialNotes={watchEntry?.notes ?? null}
              hasStatus={!!watchEntry?.status}
            />
          </>
        ) : null}

        {movie.belongs_to_collection ? (
          <CollectionSection
            collection={movie.belongs_to_collection}
            parts={collectionParts}
            currentMovieId={tmdbId}
          />
        ) : null}

        <CastSection cast={cast} />
        <CrewSection crew={crew} />
        <VideosSection videos={videos} />
        <RecommendationsSection movies={recommendations.results} />
      </main>
    </div>
  );
}
