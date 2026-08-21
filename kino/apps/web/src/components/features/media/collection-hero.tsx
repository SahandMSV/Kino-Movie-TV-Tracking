"use client";

import { motion } from "framer-motion";
import { backdropUrl, posterUrl } from "@/lib/tmdb/config";

type CollectionHeroProps = {
  name: string;
  overview?: string | null;
  posterPath?: string | null;
  backdropPath?: string | null;
  partCount: number;
};

export function CollectionHero({
  name,
  overview,
  posterPath,
  backdropPath,
  partCount,
}: CollectionHeroProps) {
  const poster = posterUrl(posterPath, "w500");
  const backdrop = backdropUrl(backdropPath, "w1280");

  return (
    <section className='relative w-full overflow-hidden'>
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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className='mx-auto w-48 shrink-0 sm:w-56 lg:mx-0 lg:w-64'
        >
          <div className='relative aspect-2/3 overflow-hidden rounded-xl border border-border/60 bg-muted shadow-2xl'>
            {poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster} alt={name} className='h-full w-full object-cover' />
            ) : (
              <div className='flex h-full items-center justify-center text-muted-foreground'>
                No poster
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className='flex flex-1 flex-col gap-4 text-center lg:text-left'
        >
          <div className='space-y-2'>
            <p className='text-sm font-medium tracking-wide text-muted-foreground uppercase'>
              Collection
            </p>
            <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl'>
              {name}
            </h1>
            <p className='text-sm text-muted-foreground'>
              {partCount} film{partCount === 1 ? "" : "s"}
            </p>
          </div>

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
