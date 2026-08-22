import { auth } from "@/auth";
import { AppNavbar } from "@/components/features/home/home-nav";
import { PosterCarousel, type CarouselItem } from "@/components/features/home/poster-carousel";
import { ReleaseBadge } from "@/components/features/media/release-badge";
import { listWatchEntriesByStatuses } from "@/lib/actions/tracking";
import { getTrending, getPopularMovies, getPopularTv } from "@/lib/tmdb/discover";
import { getMovie } from "@/lib/tmdb/details";
import { deriveReleaseStatus } from "@/lib/tmdb/release-status";
import { formatYear } from "@/lib/tmdb/format";
import { Entrance } from "@/components/common/entrance-wrapper";

async function enrichWithReleaseStatus(items: CarouselItem[], limit = 8): Promise<CarouselItem[]> {
  const moviesToEnrich = items.filter(i => i.mediaType === "movie").slice(0, limit);

  const results = await Promise.allSettled(
    moviesToEnrich.map(async item => {
      const movie = await getMovie(item.id);
      const release = deriveReleaseStatus(movie.release_dates?.results);
      return { id: item.id, release };
    }),
  );

  const statusMap = new Map<number, ReturnType<typeof deriveReleaseStatus>>();
  for (const r of results) {
    if (r.status === "fulfilled") {
      statusMap.set(r.value.id, r.value.release);
    }
  }

  return items.map(item => {
    const release = statusMap.get(item.id);
    if (!release || release.status !== "theatrical_window") {
      return item;
    }
    return {
      ...item,
      badge: <ReleaseBadge status={release.status} onlyTheaters />,
    };
  });
}

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className='flex min-h-screen flex-col'>
        <AppNavbar user={null} />
        <main className='relative flex flex-1 items-center justify-center px-6'>
          <Entrance>
            <div className='max-w-md space-y-4 text-center'>
              <h1 className='text-4xl font-semibold tracking-tight sm:text-5xl'>Kino</h1>
              <p className='text-lg text-muted-foreground'>
                Every story worth watching, in one place.
              </p>
              <p className='text-sm text-muted-foreground'>
                Track what you watch. Discover what’s next.
              </p>
            </div>
          </Entrance>
        </main>
      </div>
    );
  }

  const [watching, watchlist, trending, popularMovies, popularTv] = await Promise.all([
    listWatchEntriesByStatuses(["watching"]),
    listWatchEntriesByStatuses(["plan_to_watch"]),
    getTrending("all", "week").catch(() => ({ results: [] })),
    getPopularMovies().catch(() => ({ results: [] })),
    getPopularTv().catch(() => ({ results: [] })),
  ]);

  const continueWatching: CarouselItem[] = watching.slice(0, 12).map(e => ({
    id: e.tmdbId,
    title: e.title,
    posterPath: e.posterPath,
    mediaType: e.mediaType,
    subtitle: "Watching",
  }));

  const watchlistItems: CarouselItem[] = watchlist.slice(0, 12).map(e => ({
    id: e.tmdbId,
    title: e.title,
    posterPath: e.posterPath,
    mediaType: e.mediaType,
    subtitle: "Watchlist",
  }));

  let trendingItems: CarouselItem[] = trending.results
    .filter(r => r.media_type === "movie" || r.media_type === "tv")
    .slice(0, 14)
    .map(r => {
      if (r.media_type === "movie") {
        return {
          id: r.id,
          title: r.title,
          posterPath: r.poster_path,
          mediaType: "movie" as const,
          year: formatYear(r.release_date),
        };
      }
      return {
        id: r.id,
        title: r.name,
        posterPath: r.poster_path,
        mediaType: "tv" as const,
        year: formatYear(r.first_air_date),
      };
    });

  let popularMovieItems: CarouselItem[] = popularMovies.results.slice(0, 12).map(m => ({
    id: m.id,
    title: m.title,
    posterPath: m.poster_path,
    mediaType: "movie" as const,
    year: formatYear(m.release_date),
  }));

  const popularTvItems: CarouselItem[] = popularTv.results.slice(0, 12).map(s => ({
    id: s.id,
    title: s.name,
    posterPath: s.poster_path,
    mediaType: "tv" as const,
    year: formatYear(s.first_air_date),
  }));

  [trendingItems, popularMovieItems] = await Promise.all([
    enrichWithReleaseStatus(trendingItems, 8),
    enrichWithReleaseStatus(popularMovieItems, 8),
  ]);

  return (
    <div className='flex min-h-screen flex-col'>
      <AppNavbar user={session.user} />

      <main className='flex-1 pb-16 pt-8'>
        <div className='mx-auto max-w-6xl space-y-12'>
          <div className='px-4 sm:px-6'>
            <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
              Welcome back, {session.user.name ?? session.user.username}
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Pick up where you left off or discover something new.
            </p>
          </div>

          <PosterCarousel
            title='Continue Watching'
            items={continueWatching}
            href='/progress'
            emptyMessage='Nothing in progress. Mark a title as Watching on its page.'
          />

          <PosterCarousel
            title='Your Watchlist'
            items={watchlistItems}
            href='/watchlist'
            emptyMessage='Your watchlist is empty. Add titles from their detail pages.'
          />

          <PosterCarousel title='Trending this week' items={trendingItems} />

          <PosterCarousel title='Popular Movies' items={popularMovieItems} />

          <PosterCarousel title='Popular TV' items={popularTvItems} />
        </div>
      </main>
    </div>
  );
}
