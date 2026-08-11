import { tmdbFetch } from "./client";
import {
  tmdbPaginatedSchema,
  tmdbMultiSearchResultSchema,
  type TmdbMultiSearchResult,
} from "./schemas";

const multiSearchResponseSchema = tmdbPaginatedSchema(tmdbMultiSearchResultSchema);

export async function searchMulti(query: string, page = 1) {
  if (!query.trim()) {
    return { page: 1, results: [] as TmdbMultiSearchResult[], total_pages: 0, total_results: 0 };
  }

  const data = await tmdbFetch({
    path: "/search/multi",
    searchParams: {
      query: query.trim(),
      page,
      include_adult: false,
      language: "en-US", // User language preference later
    },
    next: { revalidate: 60 * 30 }, // 30 min
  });

  return multiSearchResponseSchema.parse(data);
}