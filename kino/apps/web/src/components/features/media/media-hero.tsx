"use client";

import { motion } from "framer-motion";
import { backdropUrl, posterUrl } from "@/lib/tmdb/config";
import { formatRuntime, formatVote, formatYear } from "@/lib/tmdb/format";

type MediaHeroProps = {
  title: string;
  tagline?: string | null;
  overview?: string | null;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  runtime?: number | null;
  voteAverage?: number;
  voteCount?: number;
  genres?: { id: number; name: string }[];
  status?: string | null;
  mediaType: "movie" | "tv";
  // TV-only extras
  numberOfSeasons?: number | null;
  numberOfEpisodes?: number | null;
  firstAirDate?: string | null;
  lastAirDate?: string | null;
};

export function MediaHero({
  title,
  tagline,
  overview,
  posterPath,
  backdropPath,
  releaseDate,
  runtime,
  voteAverage = 0,
  voteCount = 0,
  genres = [],
  status,
  mediaType,
  numberOfSeasons,
  numberOfEpisodes,
  firstAirDate,
  lastAirDate,
}: MediaHeroProps) {
  const poster = posterUrl(posterPath, "w500");
  const backdrop = backdropUrl(backdropPath, "w1280");
  const year = formatYear(releaseDate ?? firstAirDate);
  const runtimeLabel = formatRuntime(runtime);
  const voteLabel = voteAverage > 0 ? formatVote(voteAverage) : null;

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

  return (
    <section className='relative w-full overflow-hidden'>
      {/* Backdrop */}
      <div className='absolute inset-0 -z-10'>
        {backdrop ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={backdrop} alt='' className='h-full w-full object-cover object-top opacity-40' />
        ) : (
          <div className='h-full w-full bg-muted' />
        )}
        <div className='absolute inset-0 bg-linear-to-t from-background via-background/90 to-background/40' />
      </div>

      <div className='mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-10 pt-10 sm:px-6 sm:pt-14 lg:flex-row lg:items-start lg:gap-12'>
        {/* Poster */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className='mx-auto w-48 shrink-0 sm:w-56 lg:mx-0 lg:w-64'
        >
          <div className='relative aspect-2/3 overflow-hidden rounded-xl border border-border/60 bg-muted shadow-2xl'>
            {poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster} alt={title} className='h-full w-full object-cover' />
            ) : (
              <div className='flex h-full items-center justify-center text-muted-foreground'>
                No poster
              </div>
            )}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className='flex flex-1 flex-col gap-4 text-center lg:text-left'
        >
          <div className='space-y-2'>
            <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl'>
              {title}
            </h1>
            {tagline ? (
              <p className='text-base italic text-muted-foreground sm:text-lg'>{tagline}</p>
            ) : null}
          </div>

          {/* Meta row */}
          {meta.length > 0 && (
            <div className='flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground lg:justify-start'>
              {meta.map((item, i) => (
                <span key={item} className='flex items-center gap-x-3'>
                  {i > 0 && <span className='text-border'>·</span>}
                  {item}
                </span>
              ))}
            </div>
          )}

          {/* Genres */}
          {genres.length > 0 && (
            <div className='flex flex-wrap justify-center gap-2 lg:justify-start'>
              {genres.map(g => (
                <span
                  key={g.id}
                  className='rounded-full border border-border/60 bg-muted/50 px-2.5 py-0.5 text-xs font-medium'
                >
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {/* Rating */}
          {voteLabel && (
            <div className='flex items-center justify-center gap-2 text-sm lg:justify-start'>
              <span className='font-semibold tabular-nums text-foreground'>{voteLabel}</span>
              <span className='text-muted-foreground'>
                / 10
                {voteCount > 0 ? ` · ${voteCount.toLocaleString()} votes` : null}
              </span>
            </div>
          )}

          {/* Overview */}
          {overview ? (
            <p className='mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:mx-0'>
              {overview}
            </p>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
