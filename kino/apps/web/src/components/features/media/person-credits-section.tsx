"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { posterUrl } from "@/lib/tmdb/config";
import { formatYear } from "@/lib/tmdb/format";
import type { PersonCreditItem } from "@/lib/tmdb/details";

type PersonCreditsSectionProps = {
  cast: PersonCreditItem[];
  crew: PersonCreditItem[];
};

function creditTitle(item: PersonCreditItem) {
  return item.title ?? item.name ?? "Untitled";
}

function creditDate(item: PersonCreditItem) {
  return item.release_date ?? item.first_air_date ?? null;
}

function creditHref(item: PersonCreditItem) {
  return item.media_type === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`;
}

function pickCredits(items: PersonCreditItem[], limit = 24): PersonCreditItem[] {
  const seen = new Set<string>();
  const sorted = [...items].sort((a, b) => {
    const dateA = creditDate(a) ?? "";
    const dateB = creditDate(b) ?? "";
    if (dateA !== dateB) return dateB.localeCompare(dateA);
    return (b.popularity ?? 0) - (a.popularity ?? 0);
  });

  const result: PersonCreditItem[] = [];
  for (const item of sorted) {
    const key = `${item.media_type}-${item.id}-${item.character ?? item.job ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
    if (result.length >= limit) break;
  }
  return result;
}

function CreditGrid({ title, items }: { title: string; items: PersonCreditItem[] }) {
  if (!items.length) return null;

  return (
    <section className='mx-auto max-w-6xl px-4 py-10 sm:px-6'>
      <h2 className='mb-6 text-xl font-semibold tracking-tight'>{title}</h2>

      <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
        {items.map((item, i) => {
          const img = posterUrl(item.poster_path, "w185");
          const year = formatYear(creditDate(item));
          const role = item.character ?? item.job ?? null;

          return (
            <motion.div
              key={`${item.media_type}-${item.id}-${item.character ?? item.job ?? i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: i * 0.02,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                href={creditHref(item)}
                className='group flex flex-col gap-2 transition-opacity hover:opacity-90'
              >
                <div className='relative aspect-2/3 overflow-hidden rounded-lg border border-border/50 bg-muted'>
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt={creditTitle(item)}
                      className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                    />
                  ) : (
                    <div className='flex h-full items-center justify-center text-xs text-muted-foreground'>
                      —
                    </div>
                  )}
                </div>
                <div className='min-w-0 space-y-0.5'>
                  <p className='truncate text-sm font-medium'>{creditTitle(item)}</p>
                  <p className='truncate text-xs text-muted-foreground'>
                    <span className='capitalize'>{item.media_type}</span>
                    {year ? ` · ${year}` : null}
                    {role ? ` · ${role}` : null}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export function PersonCreditsSection({ cast, crew }: PersonCreditsSectionProps) {
  const topCast = pickCredits(cast, 24);
  const topCrew = pickCredits(crew, 18);

  if (!topCast.length && !topCrew.length) return null;

  return (
    <>
      <CreditGrid title='Acting' items={topCast} />
      <CreditGrid title='Crew' items={topCrew} />
    </>
  );
}
