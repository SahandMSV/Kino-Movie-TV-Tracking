import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AppNavbar } from "@/components/features/home/home-nav";
import { MediaHero } from "@/components/features/media/media-hero";
import { CastSection } from "@/components/features/media/cast-section";
import { CrewSection } from "@/components/features/media/crew-section";
import { VideosSection } from "@/components/features/media/videos-section";
import { FloatingTracking } from "@/components/features/media/floating-tracking";
import { RecommendationsSection } from "@/components/features/media/recommendations-section";
import { EpisodeProgress } from "@/components/features/media/episode-progress";
import { getTv } from "@/lib/tmdb/details";
import { getTvRecommendations } from "@/lib/tmdb/discover";
import { getWatchEntryForMedia } from "@/lib/actions/tracking";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TvPage({ params }: Props) {
  const { id } = await params;

  const tmdbId = Number(id);
  if (!Number.isFinite(tmdbId) || tmdbId <= 0) notFound();

  const [session, show] = await Promise.all([auth(), getTv(tmdbId).catch(() => null)]);

  if (!show) notFound();

  const [watchEntry, recommendations] = await Promise.all([
    session?.user ? getWatchEntryForMedia(tmdbId, "tv") : Promise.resolve(null),
    getTvRecommendations(tmdbId).catch(() => ({ results: [] })),
  ]);

  const cast = show.credits?.cast ?? [];
  const crew = show.credits?.crew ?? [];
  const videos = show.videos?.results ?? [];

  const runtime =
    show.episode_run_time && show.episode_run_time.length > 0 ? show.episode_run_time[0] : null;

  return (
    <div className='flex min-h-screen flex-col'>
      <AppNavbar user={session?.user ?? null} />

      <main className='flex-1 pb-28'>
        <MediaHero
          tmdbId={show.id}
          title={show.name}
          overview={show.overview}
          posterPath={show.poster_path}
          backdropPath={show.backdrop_path}
          firstAirDate={show.first_air_date}
          lastAirDate={show.last_air_date}
          runtime={runtime}
          genres={show.genres}
          status={show.status}
          mediaType='tv'
          imdbId={show.external_ids?.imdb_id}
          facebookId={show.external_ids?.facebook_id}
          instagramId={show.external_ids?.instagram_id}
          twitterId={show.external_ids?.twitter_id}
          numberOfSeasons={show.number_of_seasons}
          numberOfEpisodes={show.number_of_episodes}
        />

        {session?.user ? (
          <EpisodeProgress
            tmdbId={show.id}
            title={show.name}
            posterPath={show.poster_path}
            seasons={show.seasons ?? []}
            initialWatched={watchEntry?.watchedEpisodes ?? []}
            hasStatus={!!watchEntry?.status}
          />
        ) : null}

        <CastSection cast={cast} />
        <CrewSection crew={crew} />
        <VideosSection videos={videos} />
        <RecommendationsSection shows={recommendations.results} />
      </main>

      <FloatingTracking
        tmdbId={tmdbId}
        mediaType='tv'
        title={show.name}
        posterPath={show.poster_path}
        initialStatus={watchEntry?.status ?? null}
        isLoggedIn={!!session?.user}
      />
    </div>
  );
}



