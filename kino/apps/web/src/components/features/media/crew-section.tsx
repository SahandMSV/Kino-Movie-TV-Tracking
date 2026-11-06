"use client";

import type { CreditPerson } from "@/lib/tmdb/details";
import { MAX_VISIBLE, PeopleSection, type PersonItem } from "./people-section";

type CrewSectionProps = {
  crew: CreditPerson[];
};

const PRIORITY_JOBS = [
  "Director",
  "Writer",
  "Screenplay",
  "Story",
  "Producer",
  "Executive Producer",
  "Director of Photography",
  "Original Music Composer",
  "Editor",
];

function jobScore(job: string | null | undefined) {
  const idx = PRIORITY_JOBS.indexOf(job ?? "");
  return idx === -1 ? 100 : idx;
}

function pickCrew(crew: CreditPerson[]): PersonItem[] {
  // Group every credit by person so Nolan (Director / Writer / Producer)
  // becomes a single row with roles merged.
  const byId = new Map<
    number,
    {
      id: number;
      name: string;
      profilePath: string | null | undefined;
      jobs: string[];
      bestScore: number;
    }
  >();

  for (const person of crew) {
    const job = person.job?.trim();
    const existing = byId.get(person.id);

    if (!existing) {
      byId.set(person.id, {
        id: person.id,
        name: person.name,
        profilePath: person.profile_path,
        jobs: job ? [job] : [],
        bestScore: jobScore(job),
      });
      continue;
    }

    if (job && !existing.jobs.includes(job)) {
      existing.jobs.push(job);
    }
    // Prefer a profile photo when later credits include one.
    if (!existing.profilePath && person.profile_path) {
      existing.profilePath = person.profile_path;
    }
    existing.bestScore = Math.min(existing.bestScore, jobScore(job));
  }

  // Within each person, order jobs by priority (Director before Writer, etc.).
  for (const entry of byId.values()) {
    entry.jobs.sort((a, b) => jobScore(a) - jobScore(b));
  }

  return [...byId.values()]
    .sort((a, b) => a.bestScore - b.bestScore || a.name.localeCompare(b.name))
    .slice(0, MAX_VISIBLE)
    .map(entry => ({
      key: String(entry.id),
      id: entry.id,
      name: entry.name,
      role: entry.jobs.length ? entry.jobs.join(", ") : null,
      profilePath: entry.profilePath,
    }));
}

export function CrewSection({ crew }: CrewSectionProps) {
  const total = new Set(crew.map(p => p.id)).size;

  return <PeopleSection title='Crew' people={pickCrew(crew)} total={total} />;
}


