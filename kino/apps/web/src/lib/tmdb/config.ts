export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

// Common sizes
export const POSTER_SIZES = {
  w92: "w92",
  w154: "w154",
  w185: "w185",
  w342: "w342",
  w500: "w500",
  w780: "w780",
  original: "original",
} as const;

export const BACKDROP_SIZES = {
  w300: "w300",
  w780: "w780",
  w1280: "w1280",
  original: "original",
} as const;

export function posterUrl(
  path: string | null | undefined,
  size: keyof typeof POSTER_SIZES = "w500",
) {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${POSTER_SIZES[size]}${path}`;
}

export function backdropUrl(
  path: string | null | undefined,
  size: keyof typeof BACKDROP_SIZES = "w1280",
) {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${BACKDROP_SIZES[size]}${path}`;
}