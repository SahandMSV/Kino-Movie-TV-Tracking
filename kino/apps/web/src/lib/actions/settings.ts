"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { connectMongoose } from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/user";
import { ALL_LANGUAGES } from "@/tolgee/shared";

const preferencesSchema = z.object({
  language: z.enum(ALL_LANGUAGES).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  lockEnglishPosters: z.boolean().optional(),
  name: z.string().trim().max(80).optional(),
});

export type SettingsActionResult = {
  success?: boolean;
  error?: string;
};

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user.id;
}

export async function updatePreferences(
  input: z.infer<typeof preferencesSchema>,
): Promise<SettingsActionResult> {
  const userId = await requireUserId();
  if (!userId) return { error: "You must be signed in" };

  const parsed = preferencesSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid settings" };

  try {
    await connectMongoose();

    const update: Record<string, unknown> = {};
    if (parsed.data.language !== undefined) {
      update["preferences.language"] = parsed.data.language;
    }
    if (parsed.data.theme !== undefined) {
      update["preferences.theme"] = parsed.data.theme;
    }
    if (parsed.data.lockEnglishPosters !== undefined) {
      update["preferences.lockEnglishPosters"] = parsed.data.lockEnglishPosters;
    }
    if (parsed.data.name !== undefined) {
      update.name = parsed.data.name || null;
    }

    await User.findByIdAndUpdate(userId, { $set: update });

    revalidatePath("/settings");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("updatePreferences error:", err);
    return { error: "Could not save settings" };
  }
}

export async function getUserPreferences() {
  const userId = await requireUserId();
  if (!userId) return null;

  await connectMongoose();
  const user = await User.findById(userId).lean();
  if (!user) return null;

  return {
    name: user.name ?? null,
    username: user.username,
    email: user.email,
    image: user.image ?? null,
    preferences: {
      language: (user.preferences as any)?.language ?? "en",
      theme: (user.preferences as any)?.theme ?? "system",
      lockEnglishPosters: (user.preferences as any)?.lockEnglishPosters ?? true,
    },
  };
}
