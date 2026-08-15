"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchAction } from "@/lib/actions/search";
import { posterUrl } from "@/lib/tmdb/config";
import type { TmdbMultiSearchResult } from "@/lib/tmdb/schemas";

type SearchModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbMultiSearchResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("query", value);
      const res = await searchAction(formData);
      if (res.success && res.data) {
        setResults(res.data.results.slice(0, 8));
      }
    });
  };

  const handleSelect = (item: TmdbMultiSearchResult) => {
    onOpenChange(false);

    if (item.media_type === "movie") {
      router.push(`/movie/${item.id}`);
    } else if (item.media_type === "tv") {
      router.push(`/tv/${item.id}`);
    } else if (item.media_type === "person") {
      router.push(`/person/${item.id}`);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className='fixed inset-0 z-50 bg-black/40 backdrop-blur-sm'
            onClick={() => onOpenChange(false)}
          />

          <motion.div
            role='dialog'
            aria-modal='true'
            aria-label='Search'
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className='fixed left-1/2 top-[12%] z-50 w-full max-w-xl -translate-x-1/2 px-4'
          >
            <div className='overflow-hidden rounded-xl border border-border bg-popover shadow-2xl'>
              <div className='flex items-center gap-2 border-b border-border px-3'>
                <Search className='size-4 shrink-0 text-muted-foreground' />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder='Search movies, shows, people…'
                  className='h-12 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0'
                  autoComplete='off'
                />
                <Button
                  variant='ghost'
                  size='icon'
                  className='shrink-0'
                  onClick={() => onOpenChange(false)}
                  aria-label='Close search'
                >
                  <X className='size-4' />
                </Button>
              </div>

              <div className='max-h-[60vh] overflow-y-auto'>
                {isPending && (
                  <p className='px-4 py-6 text-center text-sm text-muted-foreground'>Searching…</p>
                )}

                {!isPending && query && results.length === 0 && (
                  <p className='px-4 py-6 text-center text-sm text-muted-foreground'>
                    No results for “{query}”
                  </p>
                )}

                {!isPending && results.length > 0 && (
                  <ul className='py-1'>
                    {results.map(item => {
                      const title =
                        item.media_type === "movie"
                          ? item.title
                          : item.media_type === "tv"
                            ? item.name
                            : item.name;

                      const subtitle =
                        item.media_type === "movie"
                          ? item.release_date?.slice(0, 4)
                          : item.media_type === "tv"
                            ? item.first_air_date?.slice(0, 4)
                            : item.known_for_department;

                      const image =
                        item.media_type === "person" ? item.profile_path : item.poster_path;

                      return (
                        <li key={`${item.media_type}-${item.id}`}>
                          <button
                            type='button'
                            className='flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/60'
                            onClick={() => handleSelect(item)}
                          >
                            <div className='relative size-10 shrink-0 overflow-hidden rounded-md bg-muted'>
                              {image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={posterUrl(image, "w92") ?? undefined}
                                  alt=''
                                  className='size-full object-cover'
                                />
                              ) : (
                                <div className='flex size-full items-center justify-center text-xs text-muted-foreground'>
                                  —
                                </div>
                              )}
                            </div>
                            <div className='min-w-0 flex-1'>
                              <p className='truncate text-sm font-medium'>{title}</p>
                              <p className='truncate text-xs text-muted-foreground'>
                                <span className='capitalize'>{item.media_type}</span>
                                {subtitle ? ` · ${subtitle}` : null}
                              </p>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {!query && (
                  <p className='px-4 py-8 text-center text-sm text-muted-foreground'>
                    Type to search movies, TV shows & people
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
