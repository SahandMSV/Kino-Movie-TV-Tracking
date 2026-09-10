"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { connectMongoose } from "@/lib/db/mongoose";
import {
  WatchEntry,
  WATCH_STATUSES,
  type WatchStatus,
  type WatchedEpisode,
} from "@/lib/db/models/watch-entry";

const mediaTypeSchema = z.enum(["movie", "tv"]);
const statusSchema = z.enum(WATCH_STATUSES);

const upsertSchema = z.object({
  tmdbId: z.coerce.number().int().positive(),
  mediaType: mediaTypeSchema,
  status: statusSchema,
  title: z.string().min(1).max(500),
  posterPath: z.string().nullable().optional(),
});

const removeSchema = z.object({
  tmdbId: z.coerce.number().int().positive(),
  mediaType: mediaTypeSchema,
});

const ratingNotesSchema = z.object({
  tmdbId: z.coerce.number().int().positive(),
  mediaType: mediaTypeSchema,
  rating: z.number().min(0.5).max(10).multipleOf(0.5).nullable().optional(),
  notes: z.string().max(4000).nullable().optional(),
});

const episodeKeySchema = z.object({
  tmdbId: z.coerce.number().int().positive(),
  season: z.coerce.number().int().min(0),
  episode: z.coerce.number().int().min(1),
  title: z.string().min(1).max(500),
  posterPath: z.string().nullable().optional(),
});

const seasonProgressSchema = z.object({
  tmdbId: z.coerce.number().int().positive(),
  season: z.coerce.number().int().min(0),
  episodes: z.array(z.coerce.number().int().min(1)).min(1),
  watched: z.boolean(),
  title: z.string().min(1).max(500),
  posterPath: z.string().nullable().optional(),
});

export type TrackingActionResult = {
  success?: boolean;
  error?: string;
  status?: WatchStatus | null;
  rating?: number | null;
  notes?: string | null;
  watchedEpisodes?: WatchedEpisode[];
};

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user.id;
}

function episodeKey(ep: WatchedEpisode) {
  return `${ep.season}:${ep.episode}`;
}

function toPlainEpisodes(list: unknown): WatchedEpisode[] {
  if (!Array.isArray(list)) return [];
  const out: WatchedEpisode[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const season = Number((item as WatchedEpisode).season);
    const episode = Number((item as WatchedEpisode).episode);
    if (!Number.isFinite(season) || !Number.isFinite(episode)) continue;
    out.push({ season, episode });
  }
  return out;
}

function uniqueEpisodes(list: WatchedEpisode[]): WatchedEpisode[] {
  const seen = new Set<string>();
  const out: WatchedEpisode[] = [];
  for (const ep of list) {
    const k = episodeKey(ep);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ season: ep.season, episode: ep.episode });
  }
  return out.sort((a, b) => a.season - b.season || a.episode - b.episode);
}

export async function setWatchStatus(input: {
  tmdbId: number;
  mediaType: "movie" | "tv";
  status: WatchStatus;
  title: string;
  posterPath?: string | null;
}): Promise<TrackingActionResult> {
  const userId = await requireUserId();
  if (!userId) return { error: "You must be signed in" };

  const parsed = upsertSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid tracking data" };

  const { tmdbId, mediaType, status, title, posterPath } = parsed.data;

  try {
    await connectMongoose();

    const watchedAt = status === "watched" ? new Date() : null;

    const entry = await WatchEntry.findOneAndUpdate(
      { userId, tmdbId, mediaType },
      {
        $set: {
          status,
          title,
          posterPath: posterPath ?? null,
          watchedAt,
        },
      },
      { upsert: true, new: true },
    ).lean();

    revalidatePath(`/movie/${tmdbId}`);
    revalidatePath(`/tv/${tmdbId}`);
    revalidatePath("/watchlist");
    revalidatePath("/progress");

    return {
      success: true,
      status: entry!.status as WatchStatus,
      rating: (entry!.rating as number | null) ?? null,
      notes: (entry!.notes as string | null) ?? null,
      watchedEpisodes: toPlainEpisodes(entry!.watchedEpisodes),
    };
  } catch (err) {
    console.error("setWatchStatus error:", err);
    return { error: "Could not update tracking" };
  }
}

export async function setRatingAndNotes(input: {
  tmdbId: number;
  mediaType: "movie" | "tv";
  rating?: number | null;
  notes?: string | null;
}): Promise<TrackingActionResult> {
  const userId = await requireUserId();
  if (!userId) return { error: "You must be signed in" };

  const parsed = ratingNotesSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid rating or notes" };

  const { tmdbId, mediaType, rating, notes } = parsed.data;

  try {
    await connectMongoose();

    const existing = await WatchEntry.findOne({ userId, tmdbId, mediaType }).lean();
    if (!existing) {
      return { error: "Add a status first (Watchlist / Watching / Watched…)" };
    }

    const update: Record<string, unknown> = {};
    if (rating !== undefined) update.rating = rating;
    if (notes !== undefined) update.notes = notes === "" ? null : notes;

    const entry = await WatchEntry.findOneAndUpdate(
      { userId, tmdbId, mediaType },
      { $set: update },
      { new: true },
    ).lean();

    revalidatePath(`/movie/${tmdbId}`);
    revalidatePath(`/tv/${tmdbId}`);
    revalidatePath("/watchlist");
    revalidatePath("/progress");

    return {
      success: true,
      status: entry!.status as WatchStatus,
      rating: (entry!.rating as number | null) ?? null,
      notes: (entry!.notes as string | null) ?? null,
      watchedEpisodes: toPlainEpisodes(entry!.watchedEpisodes),
    };
  } catch (err) {
    console.error("setRatingAndNotes error:", err);
    return { error: "Could not save rating / notes" };
  }
}

export async function removeWatchEntry(input: {
  tmdbId: number;
  mediaType: "movie" | "tv";
}): Promise<TrackingActionResult> {
  const userId = await requireUserId();
  if (!userId) return { error: "You must be signed in" };

  const parsed = removeSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid tracking data" };

  const { tmdbId, mediaType } = parsed.data;

  try {
    await connectMongoose();
    await WatchEntry.deleteOne({ userId, tmdbId, mediaType });

    revalidatePath(`/movie/${tmdbId}`);
    revalidatePath(`/tv/${tmdbId}`);
    revalidatePath("/watchlist");
    revalidatePath("/progress");

    return { success: true, status: null, rating: null, notes: null, watchedEpisodes: [] };
  } catch (err) {
    console.error("removeWatchEntry error:", err);
    return { error: "Could not remove tracking" };
  }
}

export async function toggleEpisodeWatched(input: {
  tmdbId: number;
  season: number;
  episode: number;
  title: string;
  posterPath?: string | null;
}): Promise<TrackingActionResult> {
  const userId = await requireUserId();
  if (!userId) return { error: "You must be signed in" };

  const parsed = episodeKeySchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid episode data" };

  const { tmdbId, season, episode, title, posterPath } = parsed.data;

  try {
    await connectMongoose();

    const existing = await WatchEntry.findOne({ userId, tmdbId, mediaType: "tv" }).lean();
    if (!existing) {
      return { error: "Add a status first (Watchlist / Watching / Watched…)" };
    }

    const current = uniqueEpisodes(toPlainEpisodes(existing.watchedEpisodes));
    const key = `${season}:${episode}`;
    const exists = current.some(e => episodeKey(e) === key);

    const next = exists
      ? current.filter(e => episodeKey(e) !== key)
      : uniqueEpisodes([...current, { season, episode }]);

    const shouldPromote =
      !exists && (existing.status === "plan_to_watch" || existing.status === "on_hold");

    const entry = await WatchEntry.findOneAndUpdate(
      { userId, tmdbId, mediaType: "tv" },
      {
        $set: {
          watchedEpisodes: next,
          title,
          posterPath: posterPath ?? (existing.posterPath as string | null) ?? null,
          ...(shouldPromote ? { status: "watching" as WatchStatus, watchedAt: null } : {}),
        },
      },
      { new: true },
    ).lean();

    revalidatePath(`/tv/${tmdbId}`);
    revalidatePath("/progress");
    revalidatePath("/watchlist");

    return {
      success: true,
      status: entry!.status as WatchStatus,
      rating: (entry!.rating as number | null) ?? null,
      notes: (entry!.notes as string | null) ?? null,
      watchedEpisodes: toPlainEpisodes(entry!.watchedEpisodes),
    };
  } catch (err) {
    console.error("toggleEpisodeWatched error:", err);
    return { error: "Could not update episode progress" };
  }
}

export async function setSeasonWatched(input: {
  tmdbId: number;
  season: number;
  episodes: number[];
  watched: boolean;
  title: string;
  posterPath?: string | null;
}): Promise<TrackingActionResult> {
  const userId = await requireUserId();
  if (!userId) return { error: "You must be signed in" };

  const parsed = seasonProgressSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid season data" };

  const { tmdbId, season, episodes, watched, title, posterPath } = parsed.data;

  try {
    await connectMongoose();

    const existing = await WatchEntry.findOne({ userId, tmdbId, mediaType: "tv" }).lean();
    if (!existing) {
      return { error: "Add a status first (Watchlist / Watching / Watched…)" };
    }

    const current = uniqueEpisodes(toPlainEpisodes(existing.watchedEpisodes));
    const withoutSeason = current.filter(e => e.season !== season);
    const next = watched
      ? uniqueEpisodes([...withoutSeason, ...episodes.map(ep => ({ season, episode: ep }))])
      : withoutSeason;

    const shouldPromote =
      watched && (existing.status === "plan_to_watch" || existing.status === "on_hold");

    const entry = await WatchEntry.findOneAndUpdate(
      { userId, tmdbId, mediaType: "tv" },
      {
        $set: {
          watchedEpisodes: next,
          title,
          posterPath: posterPath ?? (existing.posterPath as string | null) ?? null,
          ...(shouldPromote ? { status: "watching" as WatchStatus, watchedAt: null } : {}),
        },
      },
      { new: true },
    ).lean();

    revalidatePath(`/tv/${tmdbId}`);
    revalidatePath("/progress");
    revalidatePath("/watchlist");

    return {
      success: true,
      status: entry!.status as WatchStatus,
      rating: (entry!.rating as number | null) ?? null,
      notes: (entry!.notes as string | null) ?? null,
      watchedEpisodes: toPlainEpisodes(entry!.watchedEpisodes),
    };
  } catch (err) {
    console.error("setSeasonWatched error:", err);
    return { error: "Could not update season progress" };
  }
}

export async function getWatchEntryForMedia(
  tmdbId: number,
  mediaType: "movie" | "tv",
): Promise<{
  status: WatchStatus;
  rating: number | null;
  notes: string | null;
  watchedEpisodes: WatchedEpisode[];
} | null> {
  const userId = await requireUserId();
  if (!userId) return null;

  await connectMongoose();
  const entry = await WatchEntry.findOne({ userId, tmdbId, mediaType }).lean();
  if (!entry) return null;

  return {
    status: entry.status as WatchStatus,
    rating: (entry.rating as number | null) ?? null,
    notes: (entry.notes as string | null) ?? null,
    watchedEpisodes: toPlainEpisodes(entry.watchedEpisodes),
  };
}

export type WatchEntryListItem = {
  id: string;
  tmdbId: number;
  mediaType: "movie" | "tv";
  status: WatchStatus;
  title: string;
  posterPath: string | null;
  watchedAt: string | null;
  updatedAt: string | null;
  rating: number | null;
  notes: string | null;
  watchedEpisodes: WatchedEpisode[];
};

export type ListWatchEntriesResult = {
  entries: WatchEntryListItem[];
  nextCursor: string | null;
};

function encodeCursor(updatedAt: Date, id: string): string {
  return `${updatedAt.toISOString()}__${id}`;
}

function decodeCursor(cursor: string): { updatedAt: Date; id: string } | null {
  const [iso, id] = cursor.split("__");
  if (!iso || !id) return null;
  const updatedAt = new Date(iso);
  if (Number.isNaN(updatedAt.getTime())) return null;
  return { updatedAt, id };
}

export async function listWatchEntriesByStatuses(
  statuses: WatchStatus[],
  options?: { limit?: number; cursor?: string | null },
): Promise<ListWatchEntriesResult> {
  const userId = await requireUserId();
  if (!userId) return { entries: [], nextCursor: null };

  const limit = Math.min(Math.max(options?.limit ?? 48, 1), 100);
  const cursor = options?.cursor ? decodeCursor(options.cursor) : null;

  await connectMongoose();

  const query: Record<string, unknown> = {
    userId,
    status: { $in: statuses },
  };

  if (cursor) {
    query.$or = [
      { updatedAt: { $lt: cursor.updatedAt } },
      { updatedAt: cursor.updatedAt, _id: { $lt: cursor.id } },
    ];
  }

  const docs = await WatchEntry.find(query)
    .sort({ updatedAt: -1, _id: -1 })
    .limit(limit + 1)
    .lean();

  const hasMore = docs.length > limit;
  const page = hasMore ? docs.slice(0, limit) : docs;

  const entries: WatchEntryListItem[] = page.map(e => ({
    id: e._id.toString(),
    tmdbId: e.tmdbId,
    mediaType: e.mediaType as "movie" | "tv",
    status: e.status as WatchStatus,
    title: e.title,
    posterPath: e.posterPath as string | null,
    watchedAt: e.watchedAt ? new Date(e.watchedAt).toISOString() : null,
    updatedAt: e.updatedAt ? new Date(e.updatedAt).toISOString() : null,
    rating: (e.rating as number | null) ?? null,
    notes: (e.notes as string | null) ?? null,
    watchedEpisodes: toPlainEpisodes(e.watchedEpisodes),
  }));

  const last = page[page.length - 1];
  const nextCursor =
    hasMore && last?.updatedAt ? encodeCursor(new Date(last.updatedAt), last._id.toString()) : null;

  return { entries, nextCursor };
}