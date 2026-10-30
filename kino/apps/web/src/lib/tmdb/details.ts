import "server-only";

import { tmdbFetch } from "./client";
import { z } from "zod";
import { resolveTmdbLanguage, resolveUiLanguage } from "./locale";
import { isEnglishPostersLocked } from "./locale";
import type { Language } from "@/tolgee/shared";

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

const releaseDateEntrySchema = z.object({
  iso_3166_1: z.string(),
  release_dates: z
    .array(
      z.object({
        certification: z.string().optional(),
        descriptors: z.array(z.string()).optional(),
        iso_639_1: z.string().optional(),
        note: z.string().optional(),
        release_date: z.string(),
        type: z.number(),
      }),
    )
    .default([]),
});

const releaseDatesSchema = z.object({
  results: z.array(releaseDateEntrySchema).default([]),
});

const translationEntrySchema = z.object({
  iso_3166_1: z.string().optional(),
  iso_639_1: z.string(),
  name: z.string().optional(),
  english_name: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

const translationsSchema = z.object({
  translations: z.array(translationEntrySchema).default([]),
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
  belongs_to_collection: belongsToCollectionSchema,
  credits: creditsSchema.optional(),
  videos: videosSchema.optional(),
  external_ids: externalIdsSchema.optional(),
  release_dates: releaseDatesSchema.optional(),
  translations: translationsSchema.optional(),
});

const tvSeasonSummarySchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  overview: z.string().nullable().optional(),
  poster_path: z.string().nullable().optional(),
  season_number: z.number(),
  episode_count: z.number().optional(),
  air_date: z.string().nullable().optional(),
  vote_average: z.number().optional(),
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
  seasons: z.array(tvSeasonSummarySchema).default([]),
  credits: creditsSchema.optional(),
  videos: videosSchema.optional(),
  external_ids: externalIdsSchema.optional(),
  release_dates: releaseDatesSchema.optional(),
  translations: translationsSchema.optional(),
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
  translations: translationsSchema.optional(),
});

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
  translations: translationsSchema.optional(),
});

const tvEpisodeSchema = z.object({
  id: z.number(),
  name: z.string(),
  overview: z.string().nullable().optional(),
  still_path: z.string().nullable().optional(),
  air_date: z.string().nullable().optional(),
  episode_number: z.number(),
  season_number: z.number(),
  runtime: z.number().nullable().optional(),
  vote_average: z.number().optional(),
  vote_count: z.number().optional(),
});

const tvSeasonDetailSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  overview: z.string().nullable().optional(),
  poster_path: z.string().nullable().optional(),
  season_number: z.number(),
  air_date: z.string().nullable().optional(),
  episodes: z.array(tvEpisodeSchema).default([]),
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
export type TvSeasonSummary = z.infer<typeof tvSeasonSummarySchema>;
export type TvEpisode = z.infer<typeof tvEpisodeSchema>;
export type TvSeasonDetail = z.infer<typeof tvSeasonDetailSchema>;

function isNonEmptyText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function pickTranslatedField(
  primary: string | null | undefined,
  translations: z.infer<typeof translationsSchema> | undefined,
  field: string,
  language: Language,
): string | null {
  const entries = translations?.translations ?? [];
  const preferredLanguage = language.toLowerCase();

  if (preferredLanguage === "en") {
    if (isNonEmptyText(primary)) return primary;
  }

  const byLanguage = (code: string) =>
    entries.find(entry => entry.iso_639_1?.toLowerCase() === code)?.data?.[field];

  const preferred = byLanguage(preferredLanguage);
  if (isNonEmptyText(preferred)) return preferred;

  const english = byLanguage("en");
  if (isNonEmptyText(english)) return english;

  if (isNonEmptyText(primary)) return primary;

  for (const entry of entries) {
    const value = entry.data?.[field];
    if (isNonEmptyText(value)) return value;
  }

  return null;
}

function localizedTitle(
  primary: string,
  translations: z.infer<typeof translationsSchema> | undefined,
  language: Language,
  field: "title" | "name",
): string {
  return pickTranslatedField(primary, translations, field, language) ?? primary;
}

function localizedOverview(
  primary: string | null | undefined,
  translations: z.infer<typeof translationsSchema> | undefined,
  language: Language,
): string | null {
  return pickTranslatedField(primary, translations, "overview", language);
}

function localizedTagline(
  primary: string | null | undefined,
  translations: z.infer<typeof translationsSchema> | undefined,
  language: Language,
): string | null {
  return pickTranslatedField(primary, translations, "tagline", language);
}

export async function getMovie(id: number): Promise<MovieDetail> {
  const lockEnglishPosters = await isEnglishPostersLocked();
  const uiLanguage = await resolveUiLanguage();
  const language = lockEnglishPosters ? "en-US" : await resolveTmdbLanguage();

  const data = await tmdbFetch({
    path: `/movie/${id}`,
    searchParams: {
      language,
      append_to_response: "credits,videos,external_ids,release_dates,translations",
    },
    next: { revalidate: 60 * 60 * 6 },
  });

  const parsed = movieDetailSchema.parse(data);

  return {
    ...parsed,
    title: localizedTitle(parsed.title, parsed.translations, uiLanguage, "title"),
    overview: localizedOverview(parsed.overview, parsed.translations, uiLanguage),
    tagline: localizedTagline(parsed.tagline, parsed.translations, uiLanguage),
  };
}

export async function getTv(id: number): Promise<TvDetail> {
  const lockEnglishPosters = await isEnglishPostersLocked();
  const uiLanguage = await resolveUiLanguage();
  const language = lockEnglishPosters ? "en-US" : await resolveTmdbLanguage();

  const data = await tmdbFetch({
    path: `/tv/${id}`,
    searchParams: {
      language,
      append_to_response: "credits,videos,external_ids,release_dates,translations",
    },
    next: { revalidate: 60 * 60 * 6 },
  });

  const parsed = tvDetailSchema.parse(data);

  return {
    ...parsed,
    name: localizedTitle(parsed.name, parsed.translations, uiLanguage, "name"),
    overview: localizedOverview(parsed.overview, parsed.translations, uiLanguage),
    tagline: localizedTagline(parsed.tagline, parsed.translations, uiLanguage),
  };
}

export async function getTvSeason(tvId: number, seasonNumber: number): Promise<TvSeasonDetail> {
  const language = await resolveTmdbLanguage();

  const data = await tmdbFetch({
    path: `/tv/${tvId}/season/${seasonNumber}`,
    searchParams: { language },
    next: { revalidate: 60 * 60 * 12 },
  });

  return tvSeasonDetailSchema.parse(data);
}

export async function getPerson(id: number): Promise<PersonDetail> {
  const lockEnglishPosters = await isEnglishPostersLocked();
  const uiLanguage = await resolveUiLanguage();
  const language = lockEnglishPosters ? "en-US" : await resolveTmdbLanguage();

  const data = await tmdbFetch({
    path: `/person/${id}`,
    searchParams: {
      language,
      append_to_response: "combined_credits,external_ids,translations",
    },
    next: { revalidate: 60 * 60 * 6 },
  });

  const parsed = personDetailSchema.parse(data);

  return {
    ...parsed,
    name: localizedTitle(parsed.name, parsed.translations, uiLanguage, "name"),
    biography: pickTranslatedField(parsed.biography, parsed.translations, "biography", uiLanguage),
  };
}

export async function getCollection(id: number): Promise<CollectionDetail> {
  const lockEnglishPosters = await isEnglishPostersLocked();
  const uiLanguage = await resolveUiLanguage();
  const language = lockEnglishPosters ? "en-US" : await resolveTmdbLanguage();

  const data = await tmdbFetch({
    path: `/collection/${id}`,
    searchParams: {
      language,
      append_to_response: "translations",
    },
    next: { revalidate: 60 * 60 * 12 },
  });

  const parsed = collectionDetailSchema.parse(data);

  return {
    ...parsed,
    name: localizedTitle(parsed.name, parsed.translations, uiLanguage, "name"),
    overview: localizedOverview(parsed.overview, parsed.translations, uiLanguage),
  };
}

export async function getPosterPath(id: number, mediaType: "movie" | "tv"): Promise<string | null> {
  const language = await resolveTmdbLanguage();

  const data = await tmdbFetch({
    path: `/${mediaType}/${id}`,
    searchParams: { language },
    next: { revalidate: 60 * 60 * 6 },
  });

  return z
    .object({
      poster_path: z.string().nullable(),
    })
    .parse(data).poster_path;
}
