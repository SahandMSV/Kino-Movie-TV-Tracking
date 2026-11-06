"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { MediaImage } from "@/components/common/media-image";
import { posterUrl } from "@/lib/tmdb/config";

export type PersonItem = {
  key: string;
  id: number;
  name: string;
  role?: string | null;
  profilePath?: string | null;
};

type PeopleSectionProps = {
  title: string;
  people: PersonItem[];
  /** Total unique people available (shown next to the show-all control) */
  total: number;
};

/** People shown on the detail page before "Show all". */
export const MAX_VISIBLE = 12;

export function PeopleSection({ title, people, total }: PeopleSectionProps) {
  if (!people.length) return null;

  const visible = people.slice(0, MAX_VISIBLE);

  // Placeholder: will link to the dedicated full cast/crew page later.
  const showAll = () => toast.info("Coming soon");

  return (
    <section className='mx-auto max-w-6xl px-4 py-10 sm:px-6'>
      <div className='mb-8 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between'>
        <div className='space-y-1'>
          <h2 className='text-xl font-semibold tracking-tight'>{title}</h2>
          {total > 0 ? (
            <p className='text-sm text-muted-foreground'>{total.toLocaleString()} credited</p>
          ) : null}
        </div>

        {total > visible.length ? (
          <button
            type='button'
            onClick={showAll}
            className='flex items-center gap-2 self-start text-sm text-muted-foreground transition-colors hover:text-foreground sm:self-auto'
          >
            Show all
            <ArrowRight className='size-3.5' />
          </button>
        ) : null}
      </div>

      {/*
        Equal-width columns, shared row height, generous gaps so the list breathes.
        Avatar + text stay left-aligned inside each cell for a clean grid.
      */}
      <ul className='grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3'>
        {visible.map(person => {
          const img = posterUrl(person.profilePath, "w185");

          return (
            <li key={person.key} className='min-w-0'>
              <Link
                href={`/person/${person.id}`}
                className='group flex items-center gap-4 rounded-lg outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring'
              >
                <div className='relative size-12 shrink-0 overflow-hidden rounded-full border border-border/50 bg-muted sm:size-14'>
                  <MediaImage src={img} alt={person.name} variant='profile' />
                </div>

                <div className='min-w-0 flex-1 space-y-0.5'>
                  <p className='truncate text-sm font-medium leading-snug'>{person.name}</p>
                  {person.role ? (
                    <p className='line-clamp-2 text-xs leading-relaxed text-muted-foreground'>
                      {person.role}
                    </p>
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

