"use client";

import type { CreditPerson } from "@/lib/tmdb/details";
import { MAX_VISIBLE, PeopleSection, type PersonItem } from "./people-section";

type CastSectionProps = {
  cast: CreditPerson[];
};

function pickCast(cast: CreditPerson[]): PersonItem[] {
  // One row per person; merge multiple characters if the same actor is listed twice.
  const byId = new Map<
    number,
    {
      id: number;
      name: string;
      profilePath: string | null | undefined;
      characters: string[];
      order: number;
    }
  >();

  const sorted = [...cast].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  for (const person of sorted) {
    const character = person.character?.trim();
    const existing = byId.get(person.id);

    if (!existing) {
      byId.set(person.id, {
        id: person.id,
        name: person.name,
        profilePath: person.profile_path,
        characters: character ? [character] : [],
        order: person.order ?? 999,
      });
      continue;
    }

    if (character && !existing.characters.includes(character)) {
      existing.characters.push(character);
    }
    if (!existing.profilePath && person.profile_path) {
      existing.profilePath = person.profile_path;
    }
    existing.order = Math.min(existing.order, person.order ?? 999);
  }

  return [...byId.values()]
    .sort((a, b) => a.order - b.order)
    .slice(0, MAX_VISIBLE)
    .map(entry => ({
      key: String(entry.id),
      id: entry.id,
      name: entry.name,
      role: entry.characters.length ? entry.characters.join(", ") : null,
      profilePath: entry.profilePath,
    }));
}

export function CastSection({ cast }: CastSectionProps) {
  const total = new Set(cast.map(p => p.id)).size;

  return <PeopleSection title='Cast' people={pickCast(cast)} total={total} />;
}

