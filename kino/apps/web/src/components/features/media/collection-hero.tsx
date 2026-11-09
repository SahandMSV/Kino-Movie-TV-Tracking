"use client";

import { Flame } from "lucide-react";
import { useTranslate } from "@tolgee/react";
import { backdropUrl, posterUrl } from "@/lib/tmdb/config";
import { MediaImage } from "@/components/common/media-image";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { glass } from "@/lib/glass";
import { OverviewBody } from "./overview-body";
import { CollectionTopBar } from "./collection-top-bar";
import { HeroPoster } from "./hero-poster";
import type { GalleryImage } from "@/lib/tmdb/details";

type CollectionHeroProps = {
  collectionId: number;
  name: string;
  overview?: string | null;
  posterPath?: string | null;
  backdropPath?: string | null;
  partCount: number;
  images?: GalleryImage[];
  /** Max popularity across parts, if any */
  popularity?: number | null;
};

export function CollectionHero({
  collectionId,
  name,
  overview,
  posterPath,
  backdropPath,
  partCount,
  images,
  popularity = null,
}: CollectionHeroProps) {
  const { t } = useTranslate();
  const backgroundSrc = backdropUrl(backdropPath, "w780") ?? posterUrl(posterPath, "w342");

  const meta: string[] = [];
  if (partCount > 0) {
    meta.push(t("collection.part_count", { count: partCount }));
  }

  return (
    <section className='relative isolate -mt-[57px] w-full overflow-hidden'>
      {backgroundSrc ? (
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 -z-10'
          style={{
            maskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={backgroundSrc}
            alt=''
            decoding='async'
            className='h-full w-full scale-110 object-cover object-top opacity-60 blur-2xl'
          />
          <div className='absolute inset-0 bg-background/20' />
        </div>
      ) : null}

      <div className='mx-auto max-w-6xl space-y-5 px-4 pb-10 pt-[calc(57px+1rem)] sm:px-6 sm:pt-[calc(57px+1.25rem)]'>
        <CollectionTopBar collectionId={collectionId} title={name} />

        <div className='grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-4 gap-y-5 sm:grid-cols-[10rem_minmax(0,1fr)] md:grid-cols-[12rem_minmax(0,1fr)] lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-x-8 lg:gap-y-6'>
          <HeroPoster title={name} posterPath={posterPath} images={images} />

          <header className='min-w-0 self-center lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:flex lg:items-end lg:justify-between lg:gap-8 lg:self-auto'>
            <div className='min-w-0 space-y-1 sm:space-y-2'>
              <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                {t("collection.label")}
              </p>
              <h1 className='text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-5xl'>
                {name}
              </h1>
              {meta.length > 0 ? (
                <p className='text-xs font-medium tabular-nums text-muted-foreground sm:text-sm'>
                  {meta.join(" · ")}
                </p>
              ) : null}
            </div>
          </header>

          <div className='relative col-span-2 min-h-0 lg:col-span-1 lg:col-start-2 lg:row-start-2'>
            <div
              className={cn(
                "rounded-3xl border p-4 shadow-xl sm:p-6 lg:absolute lg:inset-0 lg:flex lg:flex-col",
                glass,
              )}
            >
              <div className='flex min-h-0 flex-1 flex-col gap-3'>
                <div className='flex shrink-0 items-center justify-between gap-3'>
                  <h2 className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                    Overview
                  </h2>
                  {popularity != null && popularity > 0 ? (
                    <span
                      title={`TMDB popularity: ${Math.round(popularity).toLocaleString()}`}
                      className='inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium tabular-nums text-amber-700 sm:text-xs dark:text-amber-400'
                    >
                      <Flame className='size-3.5' />
                      {Math.round(popularity).toLocaleString()}
                    </span>
                  ) : null}
                </div>

                <OverviewBody>
                  <p className='text-sm leading-relaxed sm:text-base'>
                    {overview?.trim() ? (
                      overview
                    ) : (
                      <span className='text-muted-foreground'>No overview available.</span>
                    )}
                  </p>
                </OverviewBody>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
