import "server-only";

import type { RatingBox } from "@/components/features/media/rating-boxes";

const MDBLIST_BASE_URL = "https://api.mdblist.com";
const REVALIDATE_SECONDS = 60 * 60 * 24;
const REQUEST_TIMEOUT_MS = 5000;

type MediaType = "movie" | "tv";

type ProviderId = "imdb" | "rotten-tomatoes" | "metacritic" | "letterboxd";

export type RatingInput = {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  releaseDate?: string | null;
  imdbId?: string | null;
};

type RawRating = Record<string, unknown>;

// Order here is the display order.
const PROVIDERS: { id: ProviderId; label: string; caption: string; votesLabel: string }[] = [
  { id: "imdb", label: "IMDb", caption: "User rating", votesLabel: "votes" },
  {
    id: "rotten-tomatoes",
    label: "Rotten Tomatoes",
    caption: "Tomatometer",
    votesLabel: "reviews",
  },
  { id: "metacritic", label: "Metacritic", caption: "Metascore", votesLabel: "reviews" },
  { id: "letterboxd", label: "Letterboxd", caption: "Member average", votesLabel: "ratings" },
];

const PROVIDER_HOSTS: Record<ProviderId, string[]> = {
  imdb: ["imdb.com"],
  "rotten-tomatoes": ["rottentomatoes.com"],
  metacritic: ["metacritic.com"],
  letterboxd: ["letterboxd.com", "boxd.it"],
};

function asRecord(value: unknown): RawRating | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  return value as RawRating;
}

function getRatingEntries(payload: unknown): RawRating[] {
  const root = asRecord(payload);
  const ratings = root?.ratings;

  if (Array.isArray(ratings)) {
    return ratings.map(asRecord).filter((rating): rating is RawRating => rating !== null);
  }

  const ratingsRecord = asRecord(ratings);

  if (ratingsRecord) {
    return Object.entries(ratingsRecord).map(([source, value]) => {
      const details = asRecord(value);

      return details ? { source, ...details } : { source, value };
    });
  }

  return [];
}

function normalizeProvider(source: unknown): ProviderId | null {
  if (typeof source !== "string") return null;

  const normalized = source.toLowerCase().replace(/[^a-z]/g, "");

  if (normalized === "imdb") return "imdb";

  if (normalized.includes("letterboxd")) return "letterboxd";

  if (normalized.includes("metacritic") && !normalized.includes("user")) {
    return "metacritic";
  }

  if (
    (normalized.includes("rottentomatoes") ||
      normalized.includes("tomato") ||
      normalized === "rt" ||
      normalized.startsWith("rtcritic")) &&
    !normalized.includes("audience") &&
    !normalized.includes("popcorn")
  ) {
    return "rotten-tomatoes";
  }

  return null;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") return null;

  const match = value.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);

  if (!match) return null;

  const result = Number(match[0]);

  return Number.isFinite(result) ? result : null;
}

function getRatingValue(rating: RawRating | undefined, provider: ProviderId): number | null {
  if (!rating) return null;

  let value = toNumber(rating.value ?? rating.rating);

  if (value === null) {
    // Fall back to MDBList's normalized 0-100 score.
    const score = toNumber(rating.score);

    if (score === null) return null;

    value = provider === "imdb" ? score / 10 : provider === "letterboxd" ? score / 20 : score;
  }

  // 0 means "no score yet" on every provider.
  return value > 0 ? value : null;
}

function formatRating(provider: ProviderId, value: number): string {
  switch (provider) {
    case "imdb":
      return `${value.toFixed(1)}/10`;

    case "rotten-tomatoes":
      return `${Math.round(value)}%`;

    case "metacritic":
      return `${Math.round(value)}`;

    case "letterboxd":
      return `${value.toFixed(1)}/5`;
  }
}

function getVotes(rating: RawRating | undefined, label: string): string | null {
  if (!rating) return null;

  const votes = toNumber(rating.votes ?? rating.vote_count);

  if (votes === null || votes <= 0) return null;

  return `${Math.round(votes).toLocaleString("en-US")} ${label}`;
}

function getDirectProviderUrl(rating: RawRating | undefined, provider: ProviderId): string | null {
  if (!rating) return null;

  const candidate = rating.url ?? rating.link;

  if (typeof candidate !== "string") return null;

  try {
    const url = new URL(candidate);

    if (url.protocol !== "https:") return null;

    const hostname = url.hostname.toLowerCase();

    const allowed = PROVIDER_HOSTS[provider].some(
      domain => hostname === domain || hostname.endsWith(`.${domain}`),
    );

    return allowed ? url.toString() : null;
  } catch {
    return null;
  }
}

function getFallbackUrl(
  provider: ProviderId,
  input: RatingInput,
  hasProviderEntry: boolean,
): string | null {
  const year = input.releaseDate?.slice(0, 4);
  const searchTerm = `${input.title}${year ? ` ${year}` : ""}`;

  switch (provider) {
    case "imdb": {
      const imdbId = input.imdbId;

      if (imdbId && /^tt\d+$/i.test(imdbId)) {
        return `https://www.imdb.com/title/${imdbId}/`;
      }

      const url = new URL("https://www.imdb.com/find/");
      url.searchParams.set("q", searchTerm);

      return url.toString();
    }

    case "rotten-tomatoes": {
      const url = new URL("https://www.rottentomatoes.com/search");
      url.searchParams.set("search", searchTerm);

      return url.toString();
    }

    case "metacritic": {
      const slug = searchTerm
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      return slug ? `https://www.metacritic.com/search/${slug}/` : "https://www.metacritic.com/";
    }

    case "letterboxd": {
      // Letterboxd redirects /tmdb/{id} for films. TV is only supported for a
      // few entries, so only link when MDBList actually returned a Letterboxd rating.
      if (input.mediaType === "movie") {
        return `https://letterboxd.com/tmdb/${input.tmdbId}`;
      }

      return hasProviderEntry ? `https://letterboxd.com/tmdb/${input.tmdbId}/tv` : null;
    }
  }
}

function buildRatingBoxes(
  entries: RawRating[],
  input: RatingInput,
  unavailableMessage?: string,
): RatingBox[] {
  const ratingsByProvider = new Map<ProviderId, RawRating>();

  for (const entry of entries) {
    const provider = normalizeProvider(entry.source);

    if (provider && !ratingsByProvider.has(provider)) {
      ratingsByProvider.set(provider, entry);
    }
  }

  return PROVIDERS.map(provider => {
    const rating = ratingsByProvider.get(provider.id);
    const value = getRatingValue(rating, provider.id);

    const href =
      getDirectProviderUrl(rating, provider.id) ??
      getFallbackUrl(provider.id, input, rating !== undefined);

    let caption: string;

    if (value !== null) {
      caption = getVotes(rating, provider.votesLabel) ?? provider.caption;
    } else if (unavailableMessage) {
      caption = unavailableMessage;
    } else if (provider.id === "letterboxd" && input.mediaType === "tv") {
      caption = "Not on Letterboxd";
    } else {
      caption = "No rating yet";
    }

    return {
      id: provider.id,
      label: provider.label,
      value: value === null ? null : formatRating(provider.id, value),
      caption,
      href,
    };
  });
}

/**
 * Fetches IMDb, Rotten Tomatoes, Metacritic and Letterboxd ratings from MDBList
 * (keyed by TMDB id). Never throws: on any failure the boxes render empty with
 * a short reason, and still link to the provider where possible.
 */
export async function getExternalRatings(input: RatingInput): Promise<RatingBox[]> {
  const apiKey = process.env.MDBLIST_API_KEY;

  if (!apiKey) {
    return buildRatingBoxes([], input, "Not configured");
  }

  const kind = input.mediaType === "movie" ? "movie" : "show";
  const url = new URL(`${MDBLIST_BASE_URL}/tmdb/${kind}/${input.tmdbId}`);
  url.searchParams.set("apikey", apiKey);

  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (res.status === 404) {
      return buildRatingBoxes([], input);
    }

    if (!res.ok) {
      return buildRatingBoxes([], input, "Unavailable");
    }

    return buildRatingBoxes(getRatingEntries(await res.json()), input);
  } catch {
    return buildRatingBoxes([], input, "Unavailable");
  }
}

