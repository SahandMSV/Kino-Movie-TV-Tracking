"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { posterUrl } from "@/lib/tmdb/config";
import type { CreditPerson } from "@/lib/tmdb/details";

type CastSectionProps = {
  cast: CreditPerson[];
};

function pickCast(cast: CreditPerson[], limit = 18) {
  return [...cast].sort((a, b) => (a.order ?? 999) - (b.order ?? 999)).slice(0, limit);
}

export function CastSection({ cast }: CastSectionProps) {
  const top = pickCast(cast);
  if (!top.length) return null;

  return (
    <section className='mx-auto max-w-6xl px-4 py-10 sm:px-6'>
      <h2 className='mb-6 text-xl font-semibold tracking-tight'>Cast</h2>

      <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
        {top.map((person, i) => {
          const img = posterUrl(person.profile_path, "w185");
          return (
            <motion.div
              key={`${person.id}-${person.character ?? i}`}
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
                  {person.character ? (
                    <p className='truncate text-xs text-muted-foreground'>{person.character}</p>
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
