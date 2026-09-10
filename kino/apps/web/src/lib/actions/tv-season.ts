"use server";

import { z } from "zod";
import { getTvSeason } from "@/lib/tmdb/details";

const schema = z.object({
  tvId: z.coerce.number().int().positive(),
  season: z.coerce.number().int().min(0),
});

export async function getTvSeasonAction(tvId: number, season: number) {
  const parsed = schema.safeParse({ tvId, season });
  if (!parsed.success) {
    return { error: "Invalid season request" as const };
  }

  try {
    const data = await getTvSeason(parsed.data.tvId, parsed.data.season);
    return { success: true as const, data };
  } catch (err) {
    console.error("getTvSeasonAction error:", err);
    return { error: "Could not load season" as const };
  }
}
