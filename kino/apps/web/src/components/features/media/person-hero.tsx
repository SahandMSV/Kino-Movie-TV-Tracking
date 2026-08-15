"use client";

import { motion } from "framer-motion";
import { posterUrl } from "@/lib/tmdb/config";
import { formatYear } from "@/lib/tmdb/format";

type PersonHeroProps = {
  name: string;
  biography?: string | null;
  profilePath?: string | null;
  birthday?: string | null;
  deathday?: string | null;
  placeOfBirth?: string | null;
  knownForDepartment?: string | null;
};

export function PersonHero({
  name,
  biography,
  profilePath,
  birthday,
  deathday,
  placeOfBirth,
  knownForDepartment,
}: PersonHeroProps) {
  const profile = posterUrl(profilePath, "w500");
  const birthYear = formatYear(birthday);
  const deathYear = formatYear(deathday);

  const lifeSpan =
    birthYear && deathYear ? `${birthYear} – ${deathYear}` : birthYear ? `Born ${birthYear}` : null;

  return (
    <section className='relative w-full overflow-hidden'>
      <div className='absolute inset-0 -z-10 bg-muted' />
      <div className='absolute inset-0 -z-10 bg-linear-to-t from-background via-background/90 to-background/40' />

      <div className='mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-16 pt-10 sm:px-6 sm:pt-14 lg:flex-row lg:items-start lg:gap-12'>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className='mx-auto w-48 shrink-0 sm:w-56 lg:mx-0 lg:w-64'
        >
          <div className='relative aspect-2/3 overflow-hidden rounded-xl border border-border/60 bg-muted shadow-2xl'>
            {profile ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile} alt={name} className='h-full w-full object-cover' />
            ) : (
              <div className='flex h-full items-center justify-center text-muted-foreground'>
                No photo
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className='flex flex-1 flex-col gap-4 text-center lg:text-left'
        >
          <div className='space-y-2'>
            <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl'>
              {name}
            </h1>
            {knownForDepartment ? (
              <p className='text-base text-muted-foreground sm:text-lg'>{knownForDepartment}</p>
            ) : null}
          </div>

          <div className='flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground lg:justify-start'>
            {lifeSpan ? <span>{lifeSpan}</span> : null}
            {placeOfBirth ? (
              <>
                {lifeSpan ? <span className='text-border'>·</span> : null}
                <span>{placeOfBirth}</span>
              </>
            ) : null}
          </div>

          {biography ? (
            <p className='mx-auto max-w-2xl whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base lg:mx-0'>
              {biography}
            </p>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
