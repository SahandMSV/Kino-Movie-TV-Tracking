"use server";

import { searchMulti } from "@/lib/tmdb/search";
import { z } from "zod";

const searchSchema = z.object({
  query: z.string().min(1).max(100),
  page: z.coerce.number().int().min(1).max(500).default(1),
});

export async function searchAction(formData: FormData) {
  const parsed = searchSchema.safeParse({
    query: formData.get("query"),
    page: formData.get("page") ?? 1,
  });

  if (!parsed.success) {
    return { error: "Invalid search query" };
  }

  try {
    const results = await searchMulti(parsed.data.query, parsed.data.page);
    return { success: true, data: results };
  } catch (err) {
    console.error("Search error:", err);
    return { error: "Search failed. Please try again." };
  }
}
