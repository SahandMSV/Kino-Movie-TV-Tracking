import { Flame } from "lucide-react";
import { backdropUrl, posterUrl } from "@/lib/tmdb/config";
import { formatRuntime, formatVote, formatYear } from "@/lib/tmdb/format";
import { MediaImage } from "@/components/common/media-image";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { glass } from "@/lib/glass";
import { MediaTopBar } from "./media-top-bar";
import { RatingBoxes, type RatingBox } from "./rating-boxes";

type MediaHeroProps = {
  tmdbId: number;
  title: string;
  overview?: string | null;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  runtime?: number | null;
  voteAverage?: number;
  voteCount?: number;
  popularity?: number;
  genres?: { id: number; name: string }[];
  status?: string | null;
  mediaType: "movie" | "tv";
  numberOfSeasons?: number | null;
  numberOfEpisodes?: number | null;
  firstAirDate?: string | null;
  lastAirDate?: string | null;
};

export function MediaHero({
  tmdbId,
  title,
  overview,
  posterPath,
  backdropPath,
  releaseDate,
  runtime,
  voteAverage = 0,
  voteCount = 0,
  popularity,
  genres = [],
  status,
  mediaType,
  numberOfSeasons,
  numberOfEpisodes,
  firstAirDate,
}: MediaHeroProps) {
  const poster = posterUrl(posterPath, "w500");
  // The backdrop is heavily blurred, so a mid-size image is plenty.
  // Fall back to the poster so the hero still has a background.
  const backgroundSrc = backdropUrl(backdropPath, "w780") ?? posterUrl(posterPath, "w342");

  const year = formatYear(releaseDate ?? firstAirDate);
  const runtimeLabel = formatRuntime(runtime);

  const meta: string[] = [];
  if (year) meta.push(year);
  if (runtimeLabel) meta.push(runtimeLabel);
  if (mediaType === "tv" && numberOfSeasons) {
    meta.push(`${numberOfSeasons} season${numberOfSeasons === 1 ? "" : "s"}`);
  }
  if (mediaType === "tv" && numberOfEpisodes) {
    meta.push(`${numberOfEpisodes} episode${numberOfEpisodes === 1 ? "" : "s"}`);
  }
  if (status) meta.push(status);

  const popularityLabel =
    popularity !== undefined && popularity > 0 ? Math.round(popularity).toLocaleString() : null;

  // Order here is the display order. Only TMDB has real data for now;
  // the rest are placeholders until rating integrations exist.
  const ratings: RatingBox[] = [
    {
      id: "tmdb",
      label: "TMDB",
      value: voteAverage > 0 ? formatVote(voteAverage) : null,
      caption: voteAverage > 0 && voteCount > 0 ? `${voteCount.toLocaleString()} votes` : null,
    },
    { id: "imdb", label: "IMDb", value: null },
    { id: "rotten-tomatoes", label: "Rotten Tomatoes", value: null },
    { id: "metacritic", label: "Metacritic", value: null },
  ];

  return (
    // -mt-[57px] pulls the hero up underneath the sticky navbar (h-14 + 1px border),
    // so the glass navbar sits on top of the backdrop and picks up its colors.
    <section className='relative isolate -mt-[57px] w-full overflow-hidden'>
      {/* Blurred backdrop that fades to transparent from top to bottom */}
      {backgroundSrc ? (
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 -z-10'
          style={{
            maskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={backgroundSrc}
            alt=''
            decoding='async'
            className='h-full w-full scale-110 object-cover object-top opacity-60 blur-2xl'
          />
          <div className='absolute inset-0 bg-background/20' />
        </div>
      ) : null}

      <div className='mx-auto max-w-6xl space-y-5 px-4 pb-10 pt-[calc(57px+1rem)] sm:px-6 sm:pt-[calc(57px+1.25rem)]'>
        <MediaTopBar tmdbId={tmdbId} mediaType={mediaType} />

        {/*
          Below lg:  [poster | title, meta, genres] on the first row,
                     overview/ratings card full width underneath.
          lg and up: title + meta on the left and genres + popularity on the right
                     (full-width first row), then [poster | card] with equal heights.
        */}
        <div className='grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-4 gap-y-5 sm:grid-cols-[10rem_minmax(0,1fr)] md:grid-cols-[12rem_minmax(0,1fr)] lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-x-8 lg:gap-y-6'>
          {/* Poster: defines the row height on lg */}
          <div className='self-start lg:row-start-2'>
            <div className='relative aspect-2/3 overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-xl'>
              <MediaImage src={poster} alt={title} variant='poster' priority />
            </div>
          </div>

          {/* Title block */}
          <header className='min-w-0 self-center lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:flex lg:items-end lg:justify-between lg:gap-8 lg:self-auto'>
            <div className='min-w-0 space-y-1 sm:space-y-2'>
              <h1 className='text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-5xl'>
                {title}
              </h1>

              {meta.length > 0 ? (
                <p className='text-xs font-medium tabular-nums text-muted-foreground sm:text-sm'>
                  {meta.join(" · ")}
                </p>
              ) : null}
            </div>

            {genres.length > 0 || popularityLabel ? (
              <div className='mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2 lg:mt-0 lg:max-w-md lg:shrink-0 lg:justify-end'>
                {genres.map(g => (
                  <span
                    key={g.id}
                    className='rounded-full border border-border/60 bg-muted/50 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-sm sm:px-3 sm:py-1 sm:text-xs'
                  >
                    {g.name}
                  </span>
                ))}

                {popularityLabel ? (
                  <span
                    title='TMDB popularity'
                    className='inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium tabular-nums text-amber-700 backdrop-blur-sm sm:px-3 sm:py-1 sm:text-xs dark:text-amber-400'
                  >
                    <Flame className='size-3.5' />
                    {popularityLabel}
                  </span>
                ) : null}
              </div>
            ) : null}
          </header>

          {/*
            Overview / ratings card.
            On lg the inner card is absolutely positioned so it never influences the
            row height: it is always exactly as tall as the poster, and a long
            overview scrolls instead of stretching the row.
          */}
          <div className='relative col-span-2 lg:col-span-1 lg:col-start-2 lg:row-start-2'>
            <div
              className={cn(
                "rounded-3xl border p-4 shadow-xl sm:p-6 lg:absolute lg:inset-0 lg:flex lg:flex-col",
                glass,
              )}
            >
              <div className='space-y-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto'>
                <h2 className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  Overview
                </h2>
                <p className='text-sm leading-relaxed sm:text-base'>
                  {overview || (
                    <span className='text-muted-foreground'>No overview available.</span>
                  )}
                </p>
              </div>

              <Separator className='my-4 sm:my-5 lg:shrink-0' />

              <div className='space-y-2 lg:shrink-0'>
                <h2 className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  Ratings
                </h2>
                <RatingBoxes ratings={ratings} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}