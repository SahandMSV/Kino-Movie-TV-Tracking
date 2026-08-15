"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { posterUrl } from "@/lib/tmdb/config";
import type { CreditPerson } from "@/lib/tmdb/details";

type CrewSectionProps = {
  crew: CreditPerson[];
};

const PRIORITY_JOBS = new Set([
  "Director",
  "Writer",
  "Screenplay",
  "Story",
  "Creator",
  "Executive Producer",
  "Producer",
  "Director of Photography",
  "Original Music Composer",
  "Editor",
]);

function pickCrew(crew: CreditPerson[]): CreditPerson[] {
  const scored = crew
    .filter(p => p.job)
    .map(p => {
      const job = p.job ?? "";
      let score = 0;
      if (job === "Director") score += 100;
      else if (job === "Creator") score += 90;
      else if (job === "Writer" || job === "Screenplay" || job === "Story") score += 80;
      else if (job === "Executive Producer") score += 50;
      else if (job === "Producer") score += 40;
      else if (PRIORITY_JOBS.has(job)) score += 30;
      else score += 5;
      return { person: p, score };
    })
    .sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const result: CreditPerson[] = [];

  for (const { person } of scored) {
    const key = `${person.id}-${person.job}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(person);
    if (result.length >= 12) break;
  }

  return result;
}

export function CrewSection({ crew }: CrewSectionProps) {
  const selected = pickCrew(crew);
  if (!selected.length) return null;

  return (
    <section className='mx-auto max-w-6xl px-4 py-10 sm:px-6'>
      <h2 className='mb-6 text-xl font-semibold tracking-tight'>Crew</h2>

      <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
        {selected.map((person, i) => {
          const img = posterUrl(person.profile_path, "w185");
          return (
            <motion.div
              key={`${person.id}-${person.job ?? i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: i * 0.03,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                href={`/person/${person.id}`}
                className='group flex flex-col gap-2 transition-opacity hover:opacity-90'
              >
                <div className='relative aspect-2/3 overflow-hidden rounded-lg border border-border/50 bg-muted'>
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt={person.name}
                      className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                    />
                  ) : (
                    <div className='flex h-full items-center justify-center text-xs text-muted-foreground'>
                      —
                    </div>
                  )}
                </div>
                <div className='min-w-0 space-y-0.5'>
                  <p className='truncate text-sm font-medium'>{person.name}</p>
                  {person.job ? (
                    <p className='truncate text-xs text-muted-foreground'>{person.job}</p>
                  ) : null}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
