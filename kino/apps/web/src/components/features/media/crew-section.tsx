"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { posterUrl } from "@/lib/tmdb/config";
import { MediaImage } from "@/components/common/media-image";
import type { CreditPerson } from "@/lib/tmdb/details";

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

function pickCrew(crew: CreditPerson[], limit = 12) {
  const scored = [...crew].map(c => {
    const job = c.job ?? "";
    const idx = PRIORITY_JOBS.indexOf(job);
    return { ...c, _score: idx === -1 ? 100 : idx };
  });

  const seen = new Set<string>();
  const unique = scored.filter(c => {
    const key = `${c.id}-${c.job}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.sort((a, b) => a._score - b._score).slice(0, limit);
}

export function CrewSection({ crew }: CrewSectionProps) {
  const top = pickCrew(crew);
  if (!top.length) return null;

  return (
    <section className='mx-auto max-w-6xl px-4 py-10 sm:px-6'>
      <h2 className='mb-6 text-xl font-semibold tracking-tight'>Crew</h2>

      <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
        {top.map((person, i) => {
          const img = posterUrl(person.profile_path, "w185");
          return (
            <motion.div
              key={`${person.id}-${person.job ?? i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: i * 0.02,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                href={`/person/${person.id}`}
                className='group flex flex-col gap-2 transition-opacity hover:opacity-90'
              >
                <div className='relative aspect-2/3 overflow-hidden rounded-lg border border-border/50 bg-muted'>
                  <MediaImage
                    src={img}
                    alt={person.name}
                    variant='profile'
                    imgClassName='transition-transform duration-300 group-hover:scale-105'
                  />
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
