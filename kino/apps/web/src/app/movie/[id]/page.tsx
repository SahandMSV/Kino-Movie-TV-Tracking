import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AppNavbar } from "@/components/features/home/home-nav";
import { MediaHero } from "@/components/features/media/media-hero";
import { CastSection } from "@/components/features/media/cast-section";
import { VideosSection } from "@/components/features/media/videos-section";
import { getMovie } from "@/lib/tmdb/details";
import { formatRuntime } from "@/lib/tmdb/format";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MoviePage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isFinite(numericId) || numericId <= 0) {
    notFound();
  }

  const session = await auth();

  let movie;
  try {
    movie = await getMovie(numericId);
  } catch {
    notFound();
  }

  const cast = movie.credits?.cast ?? [];
  const videos = movie.videos?.results ?? [];

  return (
    <div className="flex min-h-screen flex-col">
      <AppNavbar user={session?.user ?? null} />

      <main className="flex-1">
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
        />

        <CastSection cast={cast} />
        <VideosSection videos={videos} />
      </main>
    </div>
  );
}