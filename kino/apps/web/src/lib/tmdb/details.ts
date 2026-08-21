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

const belongsToCollectionSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    poster_path: z.string().nullable().optional(),
    backdrop_path: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

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
  belongs_to_collection: belongsToCollectionSchema,
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

const personCreditItemSchema = z.object({
  id: z.number(),
  media_type: z.enum(["movie", "tv"]),
  title: z.string().optional(),
  name: z.string().optional(),
  original_title: z.string().optional(),
  original_name: z.string().optional(),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  release_date: z.string().nullable().optional(),
  first_air_date: z.string().nullable().optional(),
  character: z.string().nullable().optional(),
  job: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  episode_count: z.number().optional(),
  vote_average: z.number().optional(),
  popularity: z.number().optional(),
});

const combinedCreditsSchema = z.object({
  cast: z.array(personCreditItemSchema).default([]),
  crew: z.array(personCreditItemSchema).default([]),
});

const personDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  biography: z.string().nullable().optional(),
  birthday: z.string().nullable().optional(),
  deathday: z.string().nullable().optional(),
  place_of_birth: z.string().nullable().optional(),
  profile_path: z.string().nullable(),
  known_for_department: z.string().nullable().optional(),
  gender: z.number().optional(),
  also_known_as: z.array(z.string()).optional(),
  popularity: z.number().optional(),
  homepage: z.string().nullable().optional(),
  combined_credits: combinedCreditsSchema.optional(),
  external_ids: externalIdsSchema.optional(),
});

// Collection
const collectionPartSchema = z.object({
  id: z.number(),
  title: z.string(),
  original_title: z.string().optional(),
  overview: z.string().nullable().optional(),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  release_date: z.string().nullable().optional(),
  vote_average: z.number().optional(),
  vote_count: z.number().optional(),
  adult: z.boolean().optional(),
  genre_ids: z.array(z.number()).optional(),
  popularity: z.number().optional(),
  video: z.boolean().optional(),
  media_type: z.literal("movie").optional(),
});

const collectionDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  overview: z.string().nullable().optional(),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  parts: z.array(collectionPartSchema).default([]),
});

export type MovieDetail = z.infer<typeof movieDetailSchema>;
export type TvDetail = z.infer<typeof tvDetailSchema>;
export type PersonDetail = z.infer<typeof personDetailSchema>;
export type PersonCreditItem = z.infer<typeof personCreditItemSchema>;
export type CreditPerson = z.infer<typeof creditPersonSchema>;
export type TmdbVideo = z.infer<typeof videoSchema>;
export type CollectionDetail = z.infer<typeof collectionDetailSchema>;
export type CollectionPart = z.infer<typeof collectionPartSchema>;
export type BelongsToCollection = z.infer<typeof belongsToCollectionSchema>;

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

export async function getPerson(id: number): Promise<PersonDetail> {
  const data = await tmdbFetch({
    path: `/person/${id}`,
    searchParams: {
      language: "en-US",
      append_to_response: "combined_credits,external_ids",
    },
    next: { revalidate: 60 * 60 * 6 },
  });

  return personDetailSchema.parse(data);
}

export async function getCollection(id: number): Promise<CollectionDetail> {
  const data = await tmdbFetch({
    path: `/collection/${id}`,
    searchParams: {
      language: "en-US",
    },
    next: { revalidate: 60 * 60 * 12 },
  });

  return collectionDetailSchema.parse(data);
}
