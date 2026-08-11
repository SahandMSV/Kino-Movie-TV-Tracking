import { tmdbFetch } from "./client";
import { z } from "zod";

// Minimal movie detail
const movieDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  overview: z.string().nullable(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  release_date: z.string().nullable(),
  runtime: z.number().nullable(),
  vote_average: z.number(),
  vote_count: z.number(),
  genres: z.array(z.object({ id: z.number(), name: z.string() })),
  tagline: z.string().nullable().optional(),
});

export async function getMovie(id: number) {
  const data = await tmdbFetch({
    path: `/movie/${id}`,
    searchParams: {
      language: "en-US",
      append_to_response: "credits,videos,external_ids",
    },
    next: { revalidate: 60 * 60 * 6 }, // 6 hours
  });

  return movieDetailSchema.parse(data);
}