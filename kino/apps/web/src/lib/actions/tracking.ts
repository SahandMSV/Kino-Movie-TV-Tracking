"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { connectMongoose } from "@/lib/db/mongoose";
import { WatchEntry, WATCH_STATUSES, type WatchStatus } from "@/lib/db/models/watch-entry";

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

export type TrackingActionResult = {
  success?: boolean;
  error?: string;
  status?: WatchStatus | null;
};

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session.user.id;
}

export async function setWatchStatus(input: {
  tmdbId: number;
  mediaType: "movie" | "tv";
  status: WatchStatus;
  title: string;
  posterPath?: string | null;
}): Promise<TrackingActionResult> {
  const userId = await requireUserId();
  if (!userId) {
    return { error: "You must be signed in" };
  }

  const parsed = upsertSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid tracking data" };
  }

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
    );

    revalidatePath(`/movie/${tmdbId}`);
    revalidatePath(`/tv/${tmdbId}`);
    revalidatePath("/watchlist");
    revalidatePath("/progress");

    return { success: true, status: entry.status as WatchStatus };
  } catch (err) {
    console.error("setWatchStatus error:", err);
    return { error: "Could not update tracking" };
  }
}

export async function removeWatchEntry(input: {
  tmdbId: number;
  mediaType: "movie" | "tv";
}): Promise<TrackingActionResult> {
  const userId = await requireUserId();
  if (!userId) {
    return { error: "You must be signed in" };
  }

  const parsed = removeSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid tracking data" };
  }

  const { tmdbId, mediaType } = parsed.data;

  try {
    await connectMongoose();
    await WatchEntry.deleteOne({ userId, tmdbId, mediaType });

    revalidatePath(`/movie/${tmdbId}`);
    revalidatePath(`/tv/${tmdbId}`);
    revalidatePath("/watchlist");
    revalidatePath("/progress");

    return { success: true, status: null };
  } catch (err) {
    console.error("removeWatchEntry error:", err);
    return { error: "Could not remove tracking" };
  }
}

export async function getWatchEntryForMedia(
  tmdbId: number,
  mediaType: "movie" | "tv",
): Promise<{ status: WatchStatus } | null> {
  const userId = await requireUserId();
  if (!userId) return null;

  await connectMongoose();
  const entry = await WatchEntry.findOne({ userId, tmdbId, mediaType }).lean();
  if (!entry) return null;
  return { status: entry.status as WatchStatus };
}

export async function listWatchEntriesByStatuses(statuses: WatchStatus[]) {
  const userId = await requireUserId();
  if (!userId) return [];

  await connectMongoose();
  const entries = await WatchEntry.find({
    userId,
    status: { $in: statuses },
  })
    .sort({ updatedAt: -1 })
    .lean();

  return entries.map(e => ({
    id: e._id.toString(),
    tmdbId: e.tmdbId,
    mediaType: e.mediaType as "movie" | "tv",
    status: e.status as WatchStatus,
    title: e.title,
    posterPath: e.posterPath as string | null,
    watchedAt: e.watchedAt ? new Date(e.watchedAt).toISOString() : null,
    updatedAt: e.updatedAt ? new Date(e.updatedAt).toISOString() : null,
  }));
}
