"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, ExternalLink, Film, MoreHorizontal, Share2, Tv, X } from "lucide-react";
import {
  SiImdb,
  SiLetterboxd,
  SiRottentomatoes,
  SiMetacritic,
  SiThemoviedatabase,
  SiFacebook,
  SiInstagram,
  SiX,
} from "react-icons/si";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { glassInteractive } from "@/lib/glass";

type MediaTopBarProps = {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title?: string;
  imdbId?: string | null;
  facebookId?: string | null;
  instagramId?: string | null;
  twitterId?: string | null;
};

const glass = glassInteractive;

export function MediaTopBar({
  tmdbId,
  mediaType,
  title,
  imdbId,
  facebookId,
  instagramId,
  twitterId,
}: MediaTopBarProps) {
  const [open, setOpen] = useState(false);

  const tmdbUrl = `https://www.themoviedb.org/${mediaType}/${tmdbId}`;
  const TypeIcon = mediaType === "tv" ? Tv : Film;
  const IconOffset = mediaType === "tv" ? "-2.5" : "-1.5";
  const typeLabel = mediaType === "tv" ? "TV Series" : "Movie";
  const shareTitle = title ?? typeLabel;

  const pageUrl = typeof window !== "undefined" ? window.location.href : `/${mediaType}/${tmdbId}`;

  const imdbUrl =
    imdbId && /^tt\d+$/i.test(imdbId) ? `https://www.imdb.com/title/${imdbId}/` : null;
  const letterboxdUrl =
    mediaType === "movie"
      ? `https://letterboxd.com/tmdb/${tmdbId}`
      : `https://letterboxd.com/tmdb/${tmdbId}/tv`;
  const rtUrl = `https://www.rottentomatoes.com/search?search=${encodeURIComponent(shareTitle)}`;
  const metacriticUrl = `https://www.metacritic.com/search/${encodeURIComponent(
    shareTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
  )}/`;

  const facebookUrl = facebookId ? `https://www.facebook.com/${facebookId}` : null;
  const instagramUrl = instagramId ? `https://www.instagram.com/${instagramId}` : null;
  const twitterUrl = twitterId ? `https://x.com/${twitterId}` : null;

  const hasSocial = !!(facebookUrl || instagramUrl || twitterUrl);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const nativeShare = async () => {
    if (!navigator.share) {
      toast.info("Sharing is not supported on this device");
      return;
    }
    try {
      await navigator.share({
        title: shareTitle,
        text: `Check out ${shareTitle} on Kino`,
        url: pageUrl,
      });
    } catch {
      // cancelled
    }
  };

  const comingSoon = () => toast.info("Coming soon");

  const linkItem = (label: string, href: string, icon: React.ReactNode) => (
    <a
      key={label}
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted/70'
    >
      <span className='flex size-8 items-center justify-center rounded-md bg-muted/60 text-muted-foreground'>
        {icon}
      </span>
      <span className='font-medium'>{label}</span>
    </a>
  );

  return (
    <>
      <div className='flex items-center justify-between gap-3'>
        <p className='flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground'>
          <TypeIcon className='size-5' style={{ transform: `translateY(${IconOffset}px)` }} />
          {typeLabel}
        </p>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='icon'
            className={glass}
            aria-label='Open on TMDB'
            nativeButton={false}
            render={<a href={tmdbUrl} target='_blank' rel='noopener noreferrer' />}
          >
            <ExternalLink className='size-4' />
          </Button>

          <Button
            variant='outline'
            size='icon'
            className={glass}
            aria-label='Share'
            onClick={() => setOpen(true)}
          >
            <Share2 className='size-4' />
          </Button>

          <Button
            variant='outline'
            size='icon'
            className={glass}
            aria-label='More options'
            onClick={comingSoon}
          >
            <MoreHorizontal className='size-4' />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className='fixed inset-0 z-50 bg-background/60 backdrop-blur-sm'
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className='fixed left-1/2 top-[18%] z-50 w-full max-w-md -translate-x-1/2 px-4'
            >
              <div className='overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl'>
                <div className='flex items-center justify-between border-b border-border/50 px-4 py-3'>
                  <div className='min-w-0'>
                    <p className='text-sm font-semibold tracking-tight'>Share</p>
                    <p className='truncate text-xs text-muted-foreground'>{shareTitle}</p>
                  </div>
                  <Button
                    variant='ghost'
                    size='icon-sm'
                    onClick={() => setOpen(false)}
                    aria-label='Close'
                  >
                    <X className='size-4' />
                  </Button>
                </div>

                <div className='max-h-[70vh] space-y-4 overflow-y-auto p-3'>
                  <div className='grid grid-cols-2 gap-2'>
                    <button
                      type='button'
                      onClick={copyLink}
                      className='flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted/60'
                    >
                      <Copy className='size-4' />
                      Copy link
                    </button>
                    <button
                      type='button'
                      onClick={nativeShare}
                      className='flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted/60'
                    >
                      <Share2 className='size-4' />
                      Share…
                    </button>
                  </div>

                  <div>
                    <p className='mb-1.5 px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground'>
                      Platforms
                    </p>
                    <div className='space-y-0.5'>
                      {linkItem("TMDB", tmdbUrl, <SiThemoviedatabase className='size-4' />)}
                      {imdbUrl ? linkItem("IMDb", imdbUrl, <SiImdb className='size-4' />) : null}
                      {linkItem("Letterboxd", letterboxdUrl, <SiLetterboxd className='size-4' />)}
                      {linkItem("Rotten Tomatoes", rtUrl, <SiRottentomatoes className='size-4' />)}
                      {linkItem("Metacritic", metacriticUrl, <SiMetacritic className='size-4' />)}
                    </div>
                  </div>

                  {hasSocial ? (
                    <div>
                      <p className='mb-1.5 px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground'>
                        Social
                      </p>
                      <div className='space-y-0.5'>
                        {facebookUrl
                          ? linkItem("Facebook", facebookUrl, <SiFacebook className='size-4' />)
                          : null}
                        {instagramUrl
                          ? linkItem("Instagram", instagramUrl, <SiInstagram className='size-4' />)
                          : null}
                        {twitterUrl ? linkItem("X", twitterUrl, <SiX className='size-4' />) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

