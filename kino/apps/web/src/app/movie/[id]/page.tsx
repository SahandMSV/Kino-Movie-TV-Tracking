import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AppNavbar } from "@/components/features/home/home-nav";
import { MediaHero } from "@/components/features/media/media-hero";
import { CastSection } from "@/components/features/media/cast-section";
import { CrewSection } from "@/components/features/media/crew-section";
import { VideosSection } from "@/components/features/media/videos-section";
import { FloatingTracking } from "@/components/features/media/floating-tracking";
import { CollectionSection } from "@/components/features/media/collection-section";
import { RecommendationsSection } from "@/components/features/media/recommendations-section";
import { getMovie, getCollection, getMediaImages } from "@/lib/tmdb/details";
import { getMovieRecommendations } from "@/lib/tmdb/discover";
import { getWatchEntryForMedia } from "@/lib/actions/tracking";

type Props = {
  params: Promise<{ id: string }>;
};

function pickDirector(
  crew: { id: number; name: string; job?: string; profile_path?: string | null }[],
): { name: string; profilePath: string | null; id: number } | null {
  const directors = crew.filter(c => c.job === "Director");
  if (!directors.length) return null;
  const names = [...new Set(directors.map(c => c.name))].join(", ");
  const withPhoto = directors.find(d => d.profile_path) ?? directors[0];
  return {
    name: names,
    profilePath: withPhoto.profile_path ?? null,
    id: withPhoto.id,
  };
}

function pickTrailer(
  videos: { key: string; name?: string; site?: string; type?: string; official?: boolean }[],
): { key: string; name?: string } | null {
  const youtube = videos.filter(v => v.site === "YouTube" && v.key);
  if (!youtube.length) return null;

  const preferred = youtube.filter(v => {
    const type = v.type?.toLowerCase() ?? "";
    return type === "trailer" || type === "teaser";
  });
  if (!preferred.length) return null;

  const score = (v: (typeof preferred)[number]) => {
    const type = v.type?.toLowerCase() ?? "";
    let s = 0;
    if (type === "trailer") s += 100;
    else if (type === "teaser") s += 50;
    if (v.official) s += 25;
    return s;
  };

  const sorted = [...preferred].sort((a, b) => score(b) - score(a));
  const best = sorted[0];
  return best ? { key: best.key, name: best.name } : null;
}

export default async function MoviePage({ params }: Props) {
  const { id } = await params;
  const tmdbId = Number(id);
  if (!Number.isFinite(tmdbId) || tmdbId <= 0) notFound();

  const [session, movie, images] = await Promise.all([
    auth(),
    getMovie(tmdbId).catch(() => null),
    getMediaImages(tmdbId, "movie").catch(() => []),
  ]);

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

  const cast = movie.credits?.cast ?? [];
  const crew = movie.credits?.crew ?? [];
  const videos = movie.videos?.results ?? [];
  const director = pickDirector(crew);
  const trailer = pickTrailer(videos);

  return (
    <div className='flex min-h-screen flex-col'>
      <AppNavbar user={session?.user ?? null} />

      <main className='flex-1 pb-28'>
        <MediaHero
          tmdbId={movie.id}
          title={movie.title}
          overview={movie.overview}
          tagline={movie.tagline}
          posterPath={movie.poster_path}
          backdropPath={movie.backdrop_path}
          releaseDate={movie.release_date}
          runtime={movie.runtime}
          genres={movie.genres}
          status={movie.status}
          mediaType='movie'
          imdbId={movie.external_ids?.imdb_id}
          facebookId={movie.external_ids?.facebook_id}
          instagramId={movie.external_ids?.instagram_id}
          twitterId={movie.external_ids?.twitter_id}
          popularity={movie.popularity}
          director={director}
          trailer={trailer}
          userStatus={watchEntry?.status ?? null}
          isLoggedIn={!!session?.user}
          images={images}
        />

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

      <FloatingTracking
        tmdbId={tmdbId}
        mediaType='movie'
        title={movie.title}
        posterPath={movie.poster_path}
        initialStatus={watchEntry?.status ?? null}
        isLoggedIn={!!session?.user}
      />
    </div>
  );
}
