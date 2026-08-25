"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslate } from "@tolgee/react";
import { posterUrl } from "@/lib/tmdb/config";
import type { WatchStatus } from "@/lib/db/models/watch-entry";

export type WatchEntryCard = {
  id: string;
  tmdbId: number;
  mediaType: "movie" | "tv";
  status: WatchStatus;
  title: string;
  posterPath: string | null;
  watchedAt: string | null;
  updatedAt: string | null;
};

type WatchEntryGridProps = {
  entries: WatchEntryCard[];
  emptyTitle: string;
  emptyDescription: string;
};

export function WatchEntryGrid({ entries, emptyTitle, emptyDescription }: WatchEntryGridProps) {
  const { t } = useTranslate();

  if (!entries.length) {
    return (
      <div className='mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6'>
        <h2 className='text-xl font-semibold tracking-tight'>{emptyTitle}</h2>
        <p className='mt-2 max-w-sm text-sm text-muted-foreground'>{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className='mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-10 sm:grid-cols-3 sm:px-6 md:grid-cols-4 lg:grid-cols-6'>
      {entries.map((entry, i) => {
        const img = posterUrl(entry.posterPath, "w185");
        const href = entry.mediaType === "tv" ? `/tv/${entry.tmdbId}` : `/movie/${entry.tmdbId}`;

        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: i * 0.02,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Link
              href={href}
              className='group flex flex-col gap-2 transition-opacity hover:opacity-90'
            >
              <div className='relative aspect-2/3 overflow-hidden rounded-lg border border-border/50 bg-muted'>
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={entry.title}
                    className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                  />
                ) : (
                  <div className='flex h-full items-center justify-center text-xs text-muted-foreground'>
                    —
                  </div>
                )}
              </div>
              <div className='min-w-0 space-y-0.5'>
                <p className='truncate text-sm font-medium'>{entry.title}</p>
                <p className='truncate text-xs text-muted-foreground'>
                  <span className='capitalize'>{entry.mediaType}</span>
                  {" · "}
                  {t(`status.${entry.status}`)}
                </p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
