import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AppNavbar } from "@/components/features/home/home-nav";
import { MediaHero } from "@/components/features/media/media-hero";
import { CastSection } from "@/components/features/media/cast-section";
import { VideosSection } from "@/components/features/media/videos-section";
import { getTv } from "@/lib/tmdb/details";
import { formatRuntime } from "@/lib/tmdb/format";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TvPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isFinite(numericId) || numericId <= 0) {
    notFound();
  }

  const session = await auth();

  let show;
  try {
    show = await getTv(numericId);
  } catch {
    notFound();
  }

  const cast = show.credits?.cast ?? [];
  const videos = show.videos?.results ?? [];

  const episodeRuntime =
    show.episode_run_time && show.episode_run_time.length > 0 ? show.episode_run_time[0] : null;

  const extraMetaParts: string[] = [];
  if (show.number_of_seasons) {
    extraMetaParts.push(
      `${show.number_of_seasons} season${show.number_of_seasons === 1 ? "" : "s"}`,
    );
  }
  if (show.number_of_episodes) {
    extraMetaParts.push(
      `${show.number_of_episodes} episode${show.number_of_episodes === 1 ? "" : "s"}`,
    );
  }

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
          extraMeta={extraMetaParts.length ? extraMetaParts.join(" · ") : null}
        />

        <CastSection cast={cast} />
        <VideosSection videos={videos} />
      </main>
    </div>
  );
}
