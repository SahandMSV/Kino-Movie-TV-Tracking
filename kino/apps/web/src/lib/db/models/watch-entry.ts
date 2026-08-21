import { Schema, model, models, type InferSchemaType, Types } from "mongoose";

export const WATCH_STATUSES = [
  "plan_to_watch",
  "watching",
  "watched",
  "dropped",
  "on_hold",
] as const;

export type WatchStatus = (typeof WATCH_STATUSES)[number];

const WatchEntrySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tmdbId: {
      type: Number,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ["movie", "tv"],
      required: true,
    },
    status: {
      type: String,
      enum: WATCH_STATUSES,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    posterPath: {
      type: String,
      default: null,
    },
    watchedAt: {
      type: Date,
      default: null,
    },
    // NEW
    rating: {
      type: Number,
      min: 0.5,
      max: 10,
      default: null,
    },
    notes: {
      type: String,
      maxlength: 4000,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

WatchEntrySchema.index({ userId: 1, mediaType: 1, tmdbId: 1 }, { unique: true });
WatchEntrySchema.index({ userId: 1, status: 1, updatedAt: -1 });

export type WatchEntryDocument = InferSchemaType<typeof WatchEntrySchema> & {
  _id: Types.ObjectId;
};

export const WatchEntry = models.WatchEntry || model("WatchEntry", WatchEntrySchema);
