import "server-only";

import { tmdbFetch } from "./client";
import { isEnglishPostersLocked, resolveTmdbLanguage } from "./locale";
import {
  tmdbPaginatedSchema,
  tmdbMultiSearchResultSchema,
  type TmdbMultiSearchResult,
} from "./schemas";

const multiSearchResponseSchema = tmdbPaginatedSchema(tmdbMultiSearchResultSchema);

function mergeArtwork(
  localized: TmdbMultiSearchResult[],
  english: TmdbMultiSearchResult[],
): TmdbMultiSearchResult[] {
  const englishById = new Map(
    english
      .filter(item => item.media_type === "movie" || item.media_type === "tv")
      .map(item => [`${item.media_type}:${item.id}`, item]),
  );

  return localized.map(item => {
    if (item.media_type !== "movie" && item.media_type !== "tv") return item;

    const englishItem = englishById.get(`${item.media_type}:${item.id}`);
    if (!englishItem || (englishItem.media_type !== "movie" && englishItem.media_type !== "tv")) {
      return item;
    }

    return {
      ...item,
      poster_path: englishItem.poster_path,
      backdrop_path: englishItem.backdrop_path,
    };
  });
}

export async function searchMulti(query: string, page = 1) {
  if (!query.trim()) {
    return {
      page: 1,
      results: [] as TmdbMultiSearchResult[],
      total_pages: 0,
      total_results: 0,
    };
  }

  const language = await resolveTmdbLanguage();
  const locked = await isEnglishPostersLocked();

  if (!locked) {
    const data = await tmdbFetch({
      path: "/search/multi",
      searchParams: {
        query: query.trim(),
        page,
        include_adult: false,
        language,
      },
      next: { revalidate: 60 * 30 },
    });

    return multiSearchResponseSchema.parse(data);
  }

  const [localizedData, englishData] = await Promise.all([
    tmdbFetch({
      path: "/search/multi",
      searchParams: {
        query: query.trim(),
        page,
        include_adult: false,
        language,
      },
      next: { revalidate: 60 * 30 },
    }),
    tmdbFetch({
      path: "/search/multi",
      searchParams: {
        query: query.trim(),
        page,
        include_adult: false,
        language: "en-US",
      },
      next: { revalidate: 60 * 30 },
    }),
  ]);

  const localized = multiSearchResponseSchema.parse(localizedData);
  const english = multiSearchResponseSchema.parse(englishData);

  return {
    ...localized,
    results: mergeArtwork(localized.results, english.results),
  };
}
