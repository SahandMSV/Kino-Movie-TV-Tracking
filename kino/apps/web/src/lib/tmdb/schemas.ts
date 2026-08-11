import { z } from "zod";

export const tmdbMovieListItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  original_title: z.string().optional(),
  overview: z.string().nullable(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  release_date: z.string().nullable(),
  vote_average: z.number(),
  vote_count: z.number(),
  popularity: z.number(),
  genre_ids: z.array(z.number()).optional(),
  adult: z.boolean().optional(),
  media_type: z.literal("movie").optional(),
});

export const tmdbTvListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  original_name: z.string().optional(),
  overview: z.string().nullable(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  first_air_date: z.string().nullable(),
  vote_average: z.number(),
  vote_count: z.number(),
  popularity: z.number(),
  genre_ids: z.array(z.number()).optional(),
  media_type: z.literal("tv").optional(),
});

export const tmdbPersonListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  profile_path: z.string().nullable(),
  known_for_department: z.string().nullable().optional(),
  media_type: z.literal("person").optional(),
});

export const tmdbMultiSearchResultSchema = z.discriminatedUnion("media_type", [
  tmdbMovieListItemSchema.extend({ media_type: z.literal("movie") }),
  tmdbTvListItemSchema.extend({ media_type: z.literal("tv") }),
  tmdbPersonListItemSchema.extend({ media_type: z.literal("person") }),
]);

export const tmdbPaginatedSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    page: z.number(),
    results: z.array(item),
    total_pages: z.number(),
    total_results: z.number(),
  });

export type TmdbMovieListItem = z.infer<typeof tmdbMovieListItemSchema>;
export type TmdbTvListItem = z.infer<typeof tmdbTvListItemSchema>;
export type TmdbPersonListItem = z.infer<typeof tmdbPersonListItemSchema>;
export type TmdbMultiSearchResult = z.infer<typeof tmdbMultiSearchResultSchema>;