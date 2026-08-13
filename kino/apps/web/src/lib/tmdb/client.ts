// this file is only used in server-side code, so we can guarantee this never ships to the browser
import "server-only";

import { TMDB_BASE_URL } from "./config";

const accessToken = process.env.TMDB_ACCESS_TOKEN;

if (!accessToken) {
  throw new Error('Missing environment variable: "TMDB_ACCESS_TOKEN"');
}

type TmdbFetchOptions = {
  path: string;
  searchParams?: Record<string, string | number | boolean | undefined>;
  next?: NextFetchRequestConfig; // for caching
};

export async function tmdbFetch<T>({
  path,
  searchParams = {},
  next,
}: TmdbFetchOptions): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${path}`);

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      accept: "application/json",
    },
    next,
  });

  if (!res.ok) {
    // Basic handling - improve later (rate-limit retry, logging, etc.)
    const body = await res.text();
    throw new Error(`TMDB ${res.status} ${res.statusText}: ${path} — ${body.slice(0, 200)}`);
  }

  return res.json() as Promise<T>;
}
