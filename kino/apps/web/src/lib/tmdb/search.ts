import "server-only";

import { tmdbFetch } from "./client";
import { resolveTmdbLanguage } from "./locale";
import {
  tmdbPaginatedSchema,
  tmdbMultiSearchResultSchema,
  type TmdbMultiSearchResult,
} from "./schemas";

const multiSearchResponseSchema = tmdbPaginatedSchema(tmdbMultiSearchResultSchema);

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
