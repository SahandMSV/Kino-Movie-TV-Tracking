"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, ExternalLink, Layers, MoreHorizontal, Share2, X } from "lucide-react";
import { SiThemoviedatabase } from "react-icons/si";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { glassInteractive } from "@/lib/glass";

type CollectionTopBarProps = {
  collectionId: number;
  title: string;
};

const glass = glassInteractive;

export function CollectionTopBar({ collectionId, title }: CollectionTopBarProps) {
  const [open, setOpen] = useState(false);

  const tmdbUrl = `https://www.themoviedb.org/collection/${collectionId}`;
  const pageUrl =
    typeof window !== "undefined" ? window.location.href : `/collection/${collectionId}`;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

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
        title,
        text: `Check out ${title} on Kino`,
        url: pageUrl,
      });
    } catch {
      // cancelled
    }
  };

  return (
    <>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex min-w-0 items-center gap-2'>
          <span className={cnChip()} title='Collection'>
            <Layers className='size-3.5' />
            Collection
          </span>
        </div>

        <div className='flex items-center gap-1.5'>
          <Button
            type='button'
            size='icon-sm'
            variant='ghost'
            className={glass}
            onClick={() => setOpen(true)}
            aria-label='More'
          >
            <MoreHorizontal className='size-4' />
          </Button>
        </div>
      </div>

      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  key='sheet'
                  className='fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <button
                    type='button'
                    className='absolute inset-0 bg-black/50'
                    aria-label='Close'
                    onClick={() => setOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className='pointer-events-auto w-full max-w-md'
                  >
                    <div className='flex max-h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl'>
                      <div className='flex items-center justify-between border-b border-border/50 px-4 py-3'>
                        <div className='min-w-0'>
                          <p className='text-sm font-semibold tracking-tight'>Share</p>
                          <p className='truncate text-xs text-muted-foreground'>{title}</p>
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

                      <div className='min-h-0 space-y-4 overflow-y-auto p-3'>
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
                            Open on
                          </p>
                          <a
                            href={tmdbUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted/60'
                          >
                            <SiThemoviedatabase className='size-4' />
                            TMDB
                            <ExternalLink className='ml-auto size-3.5 text-muted-foreground' />
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}

function cnChip() {
  return (
    "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur-sm " +
    glassInteractive
  );
}
