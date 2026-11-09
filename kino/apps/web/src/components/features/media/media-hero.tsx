import { Flame, Play } from "lucide-react";
import Link from "next/link";
import { backdropUrl, posterUrl } from "@/lib/tmdb/config";
import { formatRuntime, formatYear } from "@/lib/tmdb/format";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { glass } from "@/lib/glass";
import type { WatchStatus } from "@/lib/db/models/watch-entry";
import { MediaTopBar } from "./media-top-bar";
import { ExternalRatings } from "./external-ratings";
import { OverviewBody } from "./overview-body";
import { HeroPoster } from "./hero-poster";
import type { GalleryImage } from "@/lib/tmdb/details";

type TrailerInfo = {
  key: string;
  name?: string;
};

type DirectorInfo = {
  name: string;
  profilePath?: string | null;
  id?: number | null;
  role?: "creator" | "director";
};

type MediaHeroProps = {
  tmdbId: number;
  title: string;
  overview?: string | null;
  tagline?: string | null;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  runtime?: number | null;
  popularity?: number;
  genres?: { id: number; name: string }[];
  status?: string | null;
  mediaType: "movie" | "tv";
  imdbId?: string | null;
  numberOfSeasons?: number | null;
  numberOfEpisodes?: number | null;
  firstAirDate?: string | null;
  lastAirDate?: string | null;
  facebookId?: string | null;
  instagramId?: string | null;
  twitterId?: string | null;
  director?: DirectorInfo | null;
  trailer?: TrailerInfo | null;
  userStatus?: WatchStatus | null;
  isLoggedIn?: boolean;
  images?: GalleryImage[];
};

function youtubeWatchUrl(key: string) {
  return `https://www.youtube.com/watch?v=${key}`;
}

export function MediaHero({
  tmdbId,
  title,
  overview,
  posterPath,
  backdropPath,
  releaseDate,
  runtime,
  popularity,
  genres = [],
  status,
  mediaType,
  imdbId,
  numberOfSeasons,
  numberOfEpisodes,
  firstAirDate,
  facebookId,
  instagramId,
  twitterId,
  director,
  trailer,
  images,
  userStatus = null,
  isLoggedIn = false,
}: MediaHeroProps) {
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

  const directorAvatar = director?.profilePath ? posterUrl(director.profilePath, "w185") : null;
  const directorLabel =
    director?.role === "creator" || (mediaType === "tv" && director?.role !== "director")
      ? "Created by"
      : "Directed by";

  return (
    <section className='relative isolate -mt-[57px] w-full overflow-hidden'>
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
        <MediaTopBar
          tmdbId={tmdbId}
          mediaType={mediaType}
          title={title}
          posterPath={posterPath}
          imdbId={imdbId}
          facebookId={facebookId}
          instagramId={instagramId}
          twitterId={twitterId}
          userStatus={userStatus}
          isLoggedIn={isLoggedIn}
        />

        {/*
          Poster column owns the row height via aspect-2/3.
          Overview card is absolute inset-0 on lg so it matches that height exactly.
        */}
        <div className='grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-4 gap-y-5 sm:grid-cols-[10rem_minmax(0,1fr)] md:grid-cols-[12rem_minmax(0,1fr)] lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-x-8 lg:gap-y-6'>
          <HeroPoster title={title} posterPath={posterPath} images={images} />

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

            {genres.length > 0 ? (
              <div className='mt-3 flex flex-wrap items-center gap-1 sm:gap-1.5 lg:mt-0 lg:max-w-md lg:shrink-0 lg:justify-end'>
                {genres.map(g => (
                  <span
                    key={g.id}
                    className={cn(
                      "rounded-full border border-border/60 bg-muted/50 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-sm sm:px-3 sm:py-1 sm:text-xs",
                      glass,
                    )}
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            ) : null}
          </header>

          <div className='relative col-span-2 min-h-0 lg:col-span-1 lg:col-start-2 lg:row-start-2'>
            {/* On lg, height is 100% of the poster-driven grid row */}
            <div
              className={cn(
                "rounded-3xl border p-4 shadow-xl sm:p-6",
                "lg:absolute lg:inset-0 lg:flex lg:flex-col",
                glass,
              )}
            >
              <div className='flex min-h-0 flex-1 flex-col gap-3'>
                <div className='flex shrink-0 items-center justify-between gap-3'>
                  <h2 className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                    Overview
                  </h2>
                  {trailer ? (
                    <Button
                      size='sm'
                      variant='secondary'
                      className='rounded-full'
                      nativeButton={false}
                      render={
                        <a
                          href={youtubeWatchUrl(trailer.key)}
                          target='_blank'
                          rel='noopener noreferrer'
                        />
                      }
                    >
                      <Play className='size-3.5 fill-current' data-icon='inline-start' />
                      Trailer
                    </Button>
                  ) : null}
                </div>

                <OverviewBody>
                  <p className='text-sm leading-relaxed sm:text-base'>
                    {overview || (
                      <span className='text-muted-foreground'>No overview available.</span>
                    )}
                  </p>
                </OverviewBody>

                {director ? (
                  <div className='shrink-0'>
                    {director.id ? (
                      <Link
                        href={`/person/${director.id}`}
                        className='group flex items-center gap-3 rounded-xl transition-opacity hover:opacity-90'
                      >
                        <div className='relative size-10 shrink-0 overflow-hidden rounded-full border border-border/60 bg-muted'>
                          {directorAvatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={directorAvatar}
                              alt=''
                              className='size-full object-cover'
                              draggable={false}
                            />
                          ) : null}
                        </div>
                        <div className='min-w-0'>
                          <p className='text-[11px] text-muted-foreground'>{directorLabel}</p>
                          <p className='truncate text-sm font-medium group-hover:underline'>
                            {director.name}
                          </p>
                        </div>
                      </Link>
                    ) : (
                      <div className='flex items-center gap-3'>
                        <div className='size-10 shrink-0 rounded-full border border-border/60 bg-muted' />
                        <div className='min-w-0'>
                          <p className='text-[11px] text-muted-foreground'>{directorLabel}</p>
                          <p className='truncate text-sm font-medium'>{director.name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              <Separator className='my-4 sm:my-5 lg:shrink-0' />

              <div className='space-y-2 lg:shrink-0'>
                <div className='flex items-center justify-between gap-3'>
                  <h2 className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                    Ratings
                  </h2>
                  {popularity != null && popularity > 0 ? (
                    <span
                      title={`TMDB popularity: ${Math.round(popularity).toLocaleString()}`}
                      className='inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium tabular-nums text-amber-700 sm:text-xs dark:text-amber-400'
                    >
                      <Flame className='size-3.5' />
                      {Math.round(popularity).toLocaleString()}
                    </span>
                  ) : null}
                </div>
                <ExternalRatings
                  tmdbId={tmdbId}
                  mediaType={mediaType}
                  title={title}
                  releaseDate={releaseDate ?? firstAirDate}
                  imdbId={imdbId}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
