import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AppNavbar } from "@/components/features/home/home-nav";
import { MediaHero } from "@/components/features/media/media-hero";
import { TrackingControls } from "@/components/features/media/tracking-controls";
import { CastSection } from "@/components/features/media/cast-section";
import { CrewSection } from "@/components/features/media/crew-section";
import { VideosSection } from "@/components/features/media/videos-section";
import { getTv } from "@/lib/tmdb/details";
import { getWatchEntryForMedia } from "@/lib/actions/tracking";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    return { title: "TV Show · Kino" };
  }

  try {
    const show = await getTv(numericId);
    return {
      title: `${show.name} · Kino`,
      description: show.overview ?? undefined,
    };
  } catch {
    return { title: "TV Show · Kino" };
  }
}

export default async function TvDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isFinite(numericId) || numericId <= 0) {
    notFound();
  }

  let show;
  try {
    show = await getTv(numericId);
  } catch {
    notFound();
  }

  const session = await auth();
  const watchEntry = session?.user ? await getWatchEntryForMedia(numericId, "tv") : null;

  const episodeRuntime =
    show.episode_run_time && show.episode_run_time.length > 0 ? show.episode_run_time[0] : null;

  const seasonsLabel =
    show.number_of_seasons != null
      ? `${show.number_of_seasons} season${show.number_of_seasons === 1 ? "" : "s"}`
      : null;

  const episodesLabel =
    show.number_of_episodes != null
      ? `${show.number_of_episodes} episode${show.number_of_episodes === 1 ? "" : "s"}`
      : null;

  const extraMeta = [seasonsLabel, episodesLabel].filter(Boolean).join(" · ") || null;

  return (
    <div className='flex min-h-screen flex-col'>
      <AppNavbar user={session?.user ?? null} />

      <main className='flex-1'>
        <MediaHero
          title={show.name}
          tagline={show.tagline}
          overview={show.overview}
          posterPath={show.poster_path}
          backdropPath={show.backdrop_path}
          releaseDate={show.first_air_date}
          runtime={episodeRuntime}
          voteAverage={show.vote_average}
          voteCount={show.vote_count}
          genres={show.genres}
          extraMeta={extraMeta}
        />

        {session?.user ? (
          <TrackingControls
            tmdbId={show.id}
            mediaType='tv'
            title={show.name}
            posterPath={show.poster_path}
            initialStatus={watchEntry?.status ?? null}
          />
        ) : null}

        <CastSection cast={show.credits?.cast ?? []} />
        <CrewSection crew={show.credits?.crew ?? []} />
        <VideosSection videos={show.videos?.results ?? []} />
      </main>
    </div>
  );
}
