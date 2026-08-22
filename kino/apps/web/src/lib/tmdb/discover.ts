import "server-only";

import { tmdbFetch } from "./client";
import {
  tmdbPaginatedSchema,
  tmdbMovieListItemSchema,
  tmdbTvListItemSchema,
  type TmdbMovieListItem,
  type TmdbTvListItem,
} from "./schemas";
import { z } from "zod";

const movieListResponse = tmdbPaginatedSchema(tmdbMovieListItemSchema);
const tvListResponse = tmdbPaginatedSchema(tmdbTvListItemSchema);

const trendingItemSchema = z.discriminatedUnion("media_type", [
  tmdbMovieListItemSchema.extend({ media_type: z.literal("movie") }),
  tmdbTvListItemSchema.extend({ media_type: z.literal("tv") }),
]);

const trendingResponseSchema = tmdbPaginatedSchema(trendingItemSchema);

export type TrendingItem = z.infer<typeof trendingItemSchema>;

export async function getTrending(
  mediaType: "all" | "movie" | "tv" = "all",
  timeWindow: "day" | "week" = "week",
) {
  const data = await tmdbFetch({
    path: `/trending/${mediaType}/${timeWindow}`,
    searchParams: { language: "en-US" },
    next: { revalidate: 60 * 60 },
  });
  return trendingResponseSchema.parse(data);
}

export async function getPopularMovies(page = 1) {
  const data = await tmdbFetch({
    path: "/movie/popular",
    searchParams: { language: "en-US", page },
    next: { revalidate: 60 * 60 * 6 },
  });
  return movieListResponse.parse(data);
}

export async function getPopularTv(page = 1) {
  const data = await tmdbFetch({
    path: "/tv/popular",
    searchParams: { language: "en-US", page },
    next: { revalidate: 60 * 60 * 6 },
  });
  return tvListResponse.parse(data);
}

export async function getMovieRecommendations(id: number, page = 1) {
  const data = await tmdbFetch({
    path: `/movie/${id}/recommendations`,
    searchParams: { language: "en-US", page },
    next: { revalidate: 60 * 60 * 12 },
  });
  return movieListResponse.parse(data);
}

export async function getTvRecommendations(id: number, page = 1) {
  const data = await tmdbFetch({
    path: `/tv/${id}/recommendations`,
    searchParams: { language: "en-US", page },
    next: { revalidate: 60 * 60 * 12 },
  });
  return tvListResponse.parse(data);
}

export type { TmdbMovieListItem, TmdbTvListItem };
