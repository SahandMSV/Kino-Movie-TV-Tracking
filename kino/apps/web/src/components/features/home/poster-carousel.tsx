"use client";

import { PosterCard } from "@/components/features/media/poster-card";
import { cn } from "@/lib/utils";

export type CarouselItem = {
  id: number;
  title: string;
  posterPath?: string | null;
  mediaType: "movie" | "tv";
  year?: string | null;
  subtitle?: string | null;
  href?: string;
  badge?: React.ReactNode;
};

type PosterCarouselProps = {
  title: string;
  items: CarouselItem[];
  href?: string;
  emptyMessage?: string;
  className?: string;
};

export function PosterCarousel({
  title,
  items,
  href,
  emptyMessage = "Nothing here yet",
  className,
}: PosterCarouselProps) {
  if (!items.length) {
    return (
      <section className={cn("space-y-4", className)}>
        <div className='flex items-end justify-between px-4 sm:px-6'>
          <h2 className='text-xl font-semibold tracking-tight'>{title}</h2>
        </div>
        <p className='px-4 text-sm text-muted-foreground sm:px-6'>{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className={cn("space-y-4", className)}>
      <div className='flex items-end justify-between px-4 sm:px-6'>
        <h2 className='text-xl font-semibold tracking-tight'>{title}</h2>
        {href ? (
          <a
            href={href}
            className='text-sm text-muted-foreground transition-colors hover:text-foreground'
          >
            View all →
          </a>
        ) : null}
      </div>

      <div className='scrollbar-none flex gap-4 overflow-x-auto px-4 pb-2 sm:px-6'>
        {items.map((item, i) => (
          <PosterCard
            key={`${item.mediaType}-${item.id}`}
            id={item.id}
            title={item.title}
            posterPath={item.posterPath}
            mediaType={item.mediaType}
            year={item.year}
            subtitle={item.subtitle}
            href={item.href}
            badge={item.badge}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
