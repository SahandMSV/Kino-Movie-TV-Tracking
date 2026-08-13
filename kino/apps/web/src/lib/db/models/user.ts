import { Schema, model, models, type InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 32,
      match: [/^[a-z0-9_]+$/, "Username can only contain letters, numbers and underscores"],
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // never return by default
    },
    name: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    emailVerified: {
      type: Date,
    },
    preferences: {
      language: { type: String, default: "en" },
      theme: { type: String, default: "system" },
    },
  },
  {
    timestamps: true,
  },
);

export type UserDocument = InferSchemaType<typeof UserSchema> & {
  _id: Schema.Types.ObjectId;
};

export const User = models.User || model("User", UserSchema);
