import "server-only";

import { z } from "zod";
import { tmdbFetch } from "./client";
import { isEnglishPostersLocked, resolveTmdbLanguage } from "./locale";
import {
  tmdbPaginatedSchema,
  tmdbMovieListItemSchema,
  tmdbTvListItemSchema,
  type TmdbMovieListItem,
  type TmdbTvListItem,
} from "./schemas";

const movieListResponse = tmdbPaginatedSchema(tmdbMovieListItemSchema);
const tvListResponse = tmdbPaginatedSchema(tmdbTvListItemSchema);

const trendingItemSchema = z.discriminatedUnion("media_type", [
  tmdbMovieListItemSchema.extend({ media_type: z.literal("movie") }),
  tmdbTvListItemSchema.extend({ media_type: z.literal("tv") }),
]);

const trendingResponseSchema = tmdbPaginatedSchema(trendingItemSchema);

export type TrendingItem = z.infer<typeof trendingItemSchema>;

function mergeArtwork<
  T extends {
    id: number;
    poster_path: string | null;
    backdrop_path: string | null;
  },
>(localized: T[], english: T[]): T[] {
  const englishById = new Map(english.map(item => [item.id, item]));

  return localized.map(item => {
    const englishItem = englishById.get(item.id);
    if (!englishItem) return item;

    return {
      ...item,
      poster_path: englishItem.poster_path,
      backdrop_path: englishItem.backdrop_path,
    };
  });
}

export async function getTrending(
  mediaType: "all" | "movie" | "tv" = "all",
  timeWindow: "day" | "week" = "week",
) {
  const language = await resolveTmdbLanguage();
  const locked = await isEnglishPostersLocked();

  if (!locked) {
    const data = await tmdbFetch({
      path: `/trending/${mediaType}/${timeWindow}`,
      searchParams: { language },
      next: { revalidate: 60 * 60 },
    });

    return trendingResponseSchema.parse(data);
  }

  const [localizedData, englishData] = await Promise.all([
    tmdbFetch({
      path: `/trending/${mediaType}/${timeWindow}`,
      searchParams: { language },
      next: { revalidate: 60 * 60 },
    }),
    tmdbFetch({
      path: `/trending/${mediaType}/${timeWindow}`,
      searchParams: { language: "en-US" },
      next: { revalidate: 60 * 60 },
    }),
  ]);

  const localized = trendingResponseSchema.parse(localizedData);
  const english = trendingResponseSchema.parse(englishData);

  return {
    ...localized,
    results: mergeArtwork(localized.results, english.results),
  };
}

export async function getPopularMovies(page = 1) {
  const language = await resolveTmdbLanguage();
  const locked = await isEnglishPostersLocked();

  if (!locked) {
    const data = await tmdbFetch({
      path: "/movie/popular",
      searchParams: { language, page },
      next: { revalidate: 60 * 60 * 6 },
    });

    return movieListResponse.parse(data);
  }

  const [localizedData, englishData] = await Promise.all([
    tmdbFetch({
      path: "/movie/popular",
      searchParams: { language, page },
      next: { revalidate: 60 * 60 * 6 },
    }),
    tmdbFetch({
      path: "/movie/popular",
      searchParams: { language: "en-US", page },
      next: { revalidate: 60 * 60 * 6 },
    }),
  ]);

  const localized = movieListResponse.parse(localizedData);
  const english = movieListResponse.parse(englishData);

  return {
    ...localized,
    results: mergeArtwork(localized.results, english.results),
  };
}

export async function getPopularTv(page = 1) {
  const language = await resolveTmdbLanguage();
  const locked = await isEnglishPostersLocked();

  if (!locked) {
    const data = await tmdbFetch({
      path: "/tv/popular",
      searchParams: { language, page },
      next: { revalidate: 60 * 60 * 6 },
    });

    return tvListResponse.parse(data);
  }

  const [localizedData, englishData] = await Promise.all([
    tmdbFetch({
      path: "/tv/popular",
      searchParams: { language, page },
      next: { revalidate: 60 * 60 * 6 },
    }),
    tmdbFetch({
      path: "/tv/popular",
      searchParams: { language: "en-US", page },
      next: { revalidate: 60 * 60 * 6 },
    }),
  ]);

  const localized = tvListResponse.parse(localizedData);
  const english = tvListResponse.parse(englishData);

  return {
    ...localized,
    results: mergeArtwork(localized.results, english.results),
  };
}

export async function getMovieRecommendations(id: number, page = 1) {
  const language = await resolveTmdbLanguage();
  const locked = await isEnglishPostersLocked();

  if (!locked) {
    const data = await tmdbFetch({
      path: `/movie/${id}/recommendations`,
      searchParams: { language, page },
      next: { revalidate: 60 * 60 * 12 },
    });

    return movieListResponse.parse(data);
  }

  const [localizedData, englishData] = await Promise.all([
    tmdbFetch({
      path: `/movie/${id}/recommendations`,
      searchParams: { language, page },
      next: { revalidate: 60 * 60 * 12 },
    }),
    tmdbFetch({
      path: `/movie/${id}/recommendations`,
      searchParams: { language: "en-US", page },
      next: { revalidate: 60 * 60 * 12 },
    }),
  ]);

  const localized = movieListResponse.parse(localizedData);
  const english = movieListResponse.parse(englishData);

  return {
    ...localized,
    results: mergeArtwork(localized.results, english.results),
  };
}

export async function getTvRecommendations(id: number, page = 1) {
  const language = await resolveTmdbLanguage();
  const locked = await isEnglishPostersLocked();

  if (!locked) {
    const data = await tmdbFetch({
      path: `/tv/${id}/recommendations`,
      searchParams: { language, page },
      next: { revalidate: 60 * 60 * 12 },
    });

    return tvListResponse.parse(data);
  }

  const [localizedData, englishData] = await Promise.all([
    tmdbFetch({
      path: `/tv/${id}/recommendations`,
      searchParams: { language, page },
      next: { revalidate: 60 * 60 * 12 },
    }),
    tmdbFetch({
      path: `/tv/${id}/recommendations`,
      searchParams: { language: "en-US", page },
      next: { revalidate: 60 * 60 * 12 },
    }),
  ]);

  const localized = tvListResponse.parse(localizedData);
  const english = tvListResponse.parse(englishData);

  return {
    ...localized,
    results: mergeArtwork(localized.results, english.results),
  };
}

export type { TmdbMovieListItem, TmdbTvListItem };
