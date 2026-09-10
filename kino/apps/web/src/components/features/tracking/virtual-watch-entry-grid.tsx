"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useVirtualizer } from "@tanstack/react-virtual";
import { motion } from "framer-motion";
import { useTranslate } from "@tolgee/react";
import { posterUrl } from "@/lib/tmdb/config";
import { MediaImage } from "@/components/common/media-image";
import { Skeleton } from "@/components/ui/skeleton";
import { listWatchEntriesByStatuses, type WatchEntryListItem } from "@/lib/actions/tracking";
import type { WatchStatus } from "@/lib/db/models/watch-entry";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 36;
const GAP = 16;
const ESTIMATED_ROW_HEIGHT = 280;

function useColumnCount() {
  const [cols, setCols] = useState(2);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1024) setCols(6);
      else if (w >= 768) setCols(4);
      else if (w >= 640) setCols(3);
      else setCols(2);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return cols;
}

type VirtualWatchEntryGridProps = {
  statuses: WatchStatus[];
  initialEntries: WatchEntryListItem[];
  initialCursor: string | null;
  emptyTitle: string;
  emptyDescription: string;
  className?: string;
};

export function VirtualWatchEntryGrid({
  statuses,
  initialEntries,
  initialCursor,
  emptyTitle,
  emptyDescription,
  className,
}: VirtualWatchEntryGridProps) {
  const { t } = useTranslate();
  const parentRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [entries, setEntries] = useState(initialEntries);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [isPending, startTransition] = useTransition();
  const cols = useColumnCount();

  const rows = useMemo(() => {
    const result: WatchEntryListItem[][] = [];
    for (let i = 0; i < entries.length; i += cols) {
      result.push(entries.slice(i, i + cols));
    }
    return result;
  }, [entries, cols]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 6,
  });

  const loadMore = useCallback(() => {
    if (!cursor || isPending) return;

    startTransition(async () => {
      const res = await listWatchEntriesByStatuses(statuses, {
        limit: PAGE_SIZE,
        cursor,
      });
      setEntries(prev => {
        const seen = new Set(prev.map(e => e.id));
        const next = res.entries.filter(e => !seen.has(e.id));
        return [...prev, ...next];
      });
      setCursor(res.nextCursor);
    });
  }, [cursor, isPending, statuses]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !cursor) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [cursor, loadMore]);

  if (!entries.length && !isPending) {
    return (
      <div className='mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6'>
        <h2 className='text-xl font-semibold tracking-tight'>{emptyTitle}</h2>
        <p className='mt-2 max-w-sm text-sm text-muted-foreground'>{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className={cn("mx-auto max-w-6xl px-4 sm:px-6", className)}>
      <div ref={parentRef} className='h-[min(100vh,920px)] overflow-auto scrollbar-none'>
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map(virtualRow => {
            const row = rows[virtualRow.index] ?? [];
            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className='absolute left-0 top-0 w-full'
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div
                  className='grid gap-4'
                  style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                    marginBottom: GAP,
                  }}
                >
                  {row.map((entry, i) => {
                    const img = posterUrl(entry.posterPath, "w185");
                    const href =
                      entry.mediaType === "tv" ? `/tv/${entry.tmdbId}` : `/movie/${entry.tmdbId}`;

                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.28,
                          delay: Math.min(i * 0.03, 0.18),
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <Link
                          href={href}
                          className='group flex flex-col gap-2 transition-opacity hover:opacity-90'
                        >
                          <div className='relative aspect-2/3 overflow-hidden rounded-lg border border-border/50 bg-muted'>
                            <MediaImage
                              src={img}
                              alt={entry.title}
                              variant='poster'
                              priority
                              imgClassName='transition-transform duration-300 group-hover:scale-105'
                            />
                          </div>
                          <div className='min-w-0 space-y-0.5'>
                            <p className='truncate text-sm font-medium'>{entry.title}</p>
                            <p className='truncate text-xs text-muted-foreground'>
                              <span className='capitalize'>{entry.mediaType}</span>
                              {" · "}
                              {t(`status.${entry.status}`)}
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {cursor && (
          <div ref={loadMoreRef} className='flex justify-center py-8'>
            {isPending ? (
              <div
                className='grid w-full gap-4'
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: cols }).map((_, i) => (
                  <div key={i} className='flex flex-col gap-2'>
                    <Skeleton className='aspect-2/3 w-full rounded-lg' />
                    <Skeleton className='h-4 w-3/4' />
                    <Skeleton className='h-3 w-1/2' />
                  </div>
                ))}
              </div>
            ) : (
              <span className='text-xs text-muted-foreground'>{t("common.loading")}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
