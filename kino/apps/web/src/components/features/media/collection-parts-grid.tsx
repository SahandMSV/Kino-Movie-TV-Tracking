"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { posterUrl } from "@/lib/tmdb/config";
import { formatYear, formatVote } from "@/lib/tmdb/format";
import type { CollectionPart } from "@/lib/tmdb/details";

type CollectionPartsGridProps = {
  parts: CollectionPart[];
};

export function CollectionPartsGrid({ parts }: CollectionPartsGridProps) {
  // Chronological order
  const ordered = [...parts].sort((a, b) => {
    const da = a.release_date ?? "9999";
    const db = b.release_date ?? "9999";
    return da.localeCompare(db);
  });

  if (!ordered.length) {
    return (
      <div className='mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6'>
        <h2 className='text-xl font-semibold tracking-tight'>No films found</h2>
        <p className='mt-2 max-w-sm text-sm text-muted-foreground'>
          This collection currently has no parts available.
        </p>
      </div>
    );
  }

  return (
    <div className='mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-10 sm:grid-cols-3 sm:px-6 md:grid-cols-4 lg:grid-cols-6'>
      {ordered.map((part, i) => {
        const img = posterUrl(part.poster_path, "w185");
        const year = formatYear(part.release_date);
        const vote =
          part.vote_average && part.vote_average > 0 ? formatVote(part.vote_average) : null;

        return (
          <motion.div
            key={part.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: i * 0.02,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Link
              href={`/movie/${part.id}`}
              className='group flex flex-col gap-2 transition-opacity hover:opacity-90'
            >
              <div className='relative aspect-2/3 overflow-hidden rounded-lg border border-border/50 bg-muted'>
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={part.title}
                    className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                  />
                ) : (
                  <div className='flex h-full items-center justify-center text-xs text-muted-foreground'>
                    —
                  </div>
                )}
              </div>
              <div className='min-w-0 space-y-0.5'>
                <p className='truncate text-sm font-medium'>{part.title}</p>
                <p className='truncate text-xs text-muted-foreground'>
                  {year}
                  {year && vote ? " · " : null}
                  {vote ? `${vote}` : null}
                </p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
