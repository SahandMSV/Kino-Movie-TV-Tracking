"use client";

import Link from "next/link";
import { useTranslate } from "@tolgee/react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { posterUrl } from "@/lib/tmdb/config";
import { formatYear } from "@/lib/tmdb/format";
import { MediaImage } from "@/components/common/media-image";
import type { BelongsToCollection, CollectionPart } from "@/lib/tmdb/details";

type CollectionSectionProps = {
  collection: NonNullable<BelongsToCollection>;
  parts?: CollectionPart[];
  currentMovieId?: number;
};

export function CollectionSection({
  collection,
  parts = [],
  currentMovieId,
}: CollectionSectionProps) {
  const { t } = useTranslate();

  const siblings = parts
    .filter(p => p.id !== currentMovieId)
    .sort((a, b) => {
      const da = a.release_date ?? "9999";
      const db = b.release_date ?? "9999";
      return da.localeCompare(db);
    })
    .slice(0, 6);

  return (
    <section className='mx-auto max-w-6xl px-4 py-10 sm:px-6'>
      <div className='mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='text-sm font-medium text-muted-foreground'>
            {t("collection.part_of", { noWrap: true })}
          </p>
          <h2 className='text-xl font-semibold tracking-tight'>
            <Link
              href={`/collection/${collection.id}`}
              className='hover:underline underline-offset-4'
            >
              {collection.name}
            </Link>
          </h2>
        </div>
        <Link
          href={`/collection/${collection.id}`}
          className='flex justify-center items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors'
        >
          {t("collection.view_full", { noWrap: true })}
          <ArrowRight className='size-3.5' />
        </Link>
      </div>

      {siblings.length > 0 ? (
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
          {siblings.map((part, i) => {
            const img = posterUrl(part.poster_path, "w185");
            const year = formatYear(part.release_date);

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
                    <MediaImage
                      src={img}
                      alt={part.title}
                      variant='poster'
                      imgClassName='transition-transform duration-300 group-hover:scale-105'
                    />
                  </div>
                  <div className='min-w-0 space-y-0.5'>
                    <p className='truncate text-sm font-medium'>{part.title}</p>
                    {year ? <p className='truncate text-xs text-muted-foreground'>{year}</p> : null}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
