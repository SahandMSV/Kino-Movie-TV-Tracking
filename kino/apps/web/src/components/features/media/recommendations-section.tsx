"use client";

import { PosterCarousel, type CarouselItem } from "@/components/features/home/poster-carousel";
import { formatYear } from "@/lib/tmdb/format";
import type { TmdbMovieListItem, TmdbTvListItem } from "@/lib/tmdb/discover";

type RecommendationsSectionProps = {
  movies?: TmdbMovieListItem[];
  shows?: TmdbTvListItem[];
  title?: string;
};

export function RecommendationsSection({
  movies = [],
  shows = [],
  title = "More like this",
}: RecommendationsSectionProps) {
  const items: CarouselItem[] = [
    ...movies.slice(0, 12).map(m => ({
      id: m.id,
      title: m.title,
      posterPath: m.poster_path,
      mediaType: "movie" as const,
      year: formatYear(m.release_date),
    })),
    ...shows.slice(0, 12).map(s => ({
      id: s.id,
      title: s.name,
      posterPath: s.poster_path,
      mediaType: "tv" as const,
      year: formatYear(s.first_air_date),
    })),
  ];

  if (!items.length) return null;

  return (
    <div className='mx-auto max-w-6xl py-10'>
      <PosterCarousel title={title} items={items} />
    </div>
  );
}
