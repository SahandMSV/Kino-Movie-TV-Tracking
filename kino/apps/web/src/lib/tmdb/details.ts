import "server-only";

import { tmdbFetch } from "./client";
import { z } from "zod";

const genreSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const creditPersonSchema = z.object({
  id: z.number(),
  name: z.string(),
  profile_path: z.string().nullable(),
  character: z.string().optional(),
  job: z.string().optional(),
  department: z.string().optional(),
  order: z.number().optional(),
});

const creditsSchema = z.object({
  cast: z.array(creditPersonSchema).default([]),
  crew: z.array(creditPersonSchema).default([]),
});

const videoSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  site: z.string(),
  type: z.string(),
  official: z.boolean().optional(),
  published_at: z.string().optional(),
});

const videosSchema = z.object({
  results: z.array(videoSchema).default([]),
});

const externalIdsSchema = z.object({
  imdb_id: z.string().nullable().optional(),
  wikidata_id: z.string().nullable().optional(),
  facebook_id: z.string().nullable().optional(),
  instagram_id: z.string().nullable().optional(),
  twitter_id: z.string().nullable().optional(),
});

const movieDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  original_title: z.string().optional(),
  overview: z.string().nullable(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  release_date: z.string().nullable(),
  runtime: z.number().nullable(),
  vote_average: z.number(),
  vote_count: z.number(),
  genres: z.array(genreSchema).default([]),
  tagline: z.string().nullable().optional(),
  status: z.string().optional(),
  budget: z.number().optional(),
  revenue: z.number().optional(),
  credits: creditsSchema.optional(),
  videos: videosSchema.optional(),
  external_ids: externalIdsSchema.optional(),
});

const tvDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  original_name: z.string().optional(),
  overview: z.string().nullable(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  first_air_date: z.string().nullable(),
  last_air_date: z.string().nullable().optional(),
  episode_run_time: z.array(z.number()).optional(),
  number_of_seasons: z.number().optional(),
  number_of_episodes: z.number().optional(),
  vote_average: z.number(),
  vote_count: z.number(),
  genres: z.array(genreSchema).default([]),
  tagline: z.string().nullable().optional(),
  status: z.string().optional(),
  credits: creditsSchema.optional(),
  videos: videosSchema.optional(),
  external_ids: externalIdsSchema.optional(),
});

export type MovieDetail = z.infer<typeof movieDetailSchema>;
export type TvDetail = z.infer<typeof tvDetailSchema>;
export type CreditPerson = z.infer<typeof creditPersonSchema>;
export type TmdbVideo = z.infer<typeof videoSchema>;

export async function getMovie(id: number): Promise<MovieDetail> {
  const data = await tmdbFetch({
    path: `/movie/${id}`,
    searchParams: {
      language: "en-US",
      append_to_response: "credits,videos,external_ids",
    },
    next: { revalidate: 60 * 60 * 6 },
  });

  return movieDetailSchema.parse(data);
}

export async function getTv(id: number): Promise<TvDetail> {
  const data = await tmdbFetch({
    path: `/tv/${id}`,
    searchParams: {
      language: "en-US",
      append_to_response: "credits,videos,external_ids",
    },
    next: { revalidate: 60 * 60 * 6 },
  });

  return tvDetailSchema.parse(data);
}
