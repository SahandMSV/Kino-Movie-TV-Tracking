import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AppNavbar } from "@/components/features/home/home-nav";
import { MediaHero } from "@/components/features/media/media-hero";
import { CastSection } from "@/components/features/media/cast-section";
import { CrewSection } from "@/components/features/media/crew-section";
import { VideosSection } from "@/components/features/media/videos-section";
import { TrackingControls } from "@/components/features/media/tracking-controls";
import { RatingNotes } from "@/components/features/media/rating-notes";
import { getTv } from "@/lib/tmdb/details";
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

  const watchEntry = session?.user ? await getWatchEntryForMedia(tmdbId, "tv") : null;

  const cast = show.credits?.cast ?? [];
  const crew = show.credits?.crew ?? [];
  const videos = show.videos?.results ?? [];

  const runtime =
    show.episode_run_time && show.episode_run_time.length > 0 ? show.episode_run_time[0] : null;

  return (
    <div className='flex min-h-screen flex-col'>
      <AppNavbar user={session?.user ?? null} />

      <main className='flex-1 pb-16'>
        <MediaHero
          title={show.name}
          tagline={show.tagline}
          overview={show.overview}
          posterPath={show.poster_path}
          backdropPath={show.backdrop_path}
          firstAirDate={show.first_air_date}
          lastAirDate={show.last_air_date}
          runtime={runtime}
          voteAverage={show.vote_average}
          voteCount={show.vote_count}
          genres={show.genres}
          status={show.status}
          mediaType='tv'
          numberOfSeasons={show.number_of_seasons}
          numberOfEpisodes={show.number_of_episodes}
        />

        {session?.user ? (
          <>
            <TrackingControls
              tmdbId={tmdbId}
              mediaType='tv'
              title={show.name}
              posterPath={show.poster_path}
              initialStatus={watchEntry?.status ?? null}
            />
            <RatingNotes
              tmdbId={tmdbId}
              mediaType='tv'
              initialRating={watchEntry?.rating ?? null}
              initialNotes={watchEntry?.notes ?? null}
              hasStatus={!!watchEntry?.status}
            />
          </>
        ) : null}

        <CastSection cast={cast} />
        <CrewSection crew={crew} />
        <VideosSection videos={videos} />
      </main>
    </div>
  );
}
