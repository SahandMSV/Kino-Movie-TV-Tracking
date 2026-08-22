import "server-only";

export type ReleaseStatus = "theatrical_window" | "digital" | "upcoming_digital" | "unknown";

export type ReleaseDateEntry = {
  iso_3166_1: string;
  release_dates: {
    certification?: string;
    descriptors?: string[];
    iso_639_1?: string;
    note?: string;
    release_date: string;
    type: number;
  }[];
};

const TYPE_THEATRICAL_LIMITED = 2;
const TYPE_THEATRICAL = 3;
const TYPE_DIGITAL = 4;

export function deriveReleaseStatus(
  results: ReleaseDateEntry[] | undefined | null,
  preferredCountry = "US",
): {
  status: ReleaseStatus;
  digitalDate: string | null;
  theatricalDate: string | null;
} {
  if (!results?.length) {
    return { status: "unknown", digitalDate: null, theatricalDate: null };
  }

  const country =
    results.find(r => r.iso_3166_1 === preferredCountry) ??
    results.find(r => r.iso_3166_1 === "US") ??
    results[0];

  if (!country) {
    return { status: "unknown", digitalDate: null, theatricalDate: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let earliestTheatrical: string | null = null;
  let earliestDigital: string | null = null;

  for (const rd of country.release_dates) {
    const date = rd.release_date?.slice(0, 10);
    if (!date) continue;

    if (rd.type === TYPE_THEATRICAL || rd.type === TYPE_THEATRICAL_LIMITED) {
      if (!earliestTheatrical || date < earliestTheatrical) {
        earliestTheatrical = date;
      }
    }
    if (rd.type === TYPE_DIGITAL) {
      if (!earliestDigital || date < earliestDigital) {
        earliestDigital = date;
      }
    }
  }

  if (earliestDigital) {
    const digital = new Date(earliestDigital);
    if (digital <= today) {
      return {
        status: "digital",
        digitalDate: earliestDigital,
        theatricalDate: earliestTheatrical,
      };
    }
    return {
      status: "upcoming_digital",
      digitalDate: earliestDigital,
      theatricalDate: earliestTheatrical,
    };
  }

  if (earliestTheatrical) {
    return {
      status: "theatrical_window",
      digitalDate: null,
      theatricalDate: earliestTheatrical,
    };
  }

  return { status: "unknown", digitalDate: null, theatricalDate: null };
}
