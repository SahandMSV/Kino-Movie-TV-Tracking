"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { posterUrl } from "@/lib/tmdb/config";
import { cn } from "@/lib/utils";

type PosterCardProps = {
  id: number;
  title: string;
  posterPath?: string | null;
  mediaType: "movie" | "tv";
  year?: string | null;
  subtitle?: string | null;
  href?: string;
  className?: string;
  index?: number;
  badge?: React.ReactNode;
};

export function PosterCard({
  id,
  title,
  posterPath,
  mediaType,
  year,
  subtitle,
  href,
  className,
  index = 0,
  badge,
}: PosterCardProps) {
  const img = posterUrl(posterPath, "w185");
  const link = href ?? (mediaType === "tv" ? `/tv/${id}` : `/movie/${id}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: Math.min(index * 0.03, 0.3),
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn("w-35 shrink-0 sm:w-40", className)}
    >
      <Link href={link} className='group flex flex-col gap-2 transition-opacity hover:opacity-90'>
        <div className='relative aspect-2/3 overflow-hidden rounded-lg border border-border/50 bg-muted'>
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={title}
              className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
            />
          ) : (
            <div className='flex h-full items-center justify-center text-xs text-muted-foreground'>
              —
            </div>
          )}
          {badge ? <div className='absolute right-0.75 top-0 z-10'>{badge}</div> : null}
        </div>

        <div className='min-w-0 space-y-0.5'>
          <p className='truncate text-sm font-medium'>{title}</p>
          {(year || subtitle) && (
            <p className='truncate text-xs text-muted-foreground'>
              {year}
              {year && subtitle ? " · " : null}
              {subtitle}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
