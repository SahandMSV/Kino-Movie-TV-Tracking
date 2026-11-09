"use client";

import { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { posterUrl, backdropUrl } from "@/lib/tmdb/config";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "@/lib/tmdb/details";

type ImageGalleryModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  images: GalleryImage[];
  initialIndex?: number;
  /** Same URL as the hero poster so the first frame is instant from cache */
  heroSrc?: string | null;
};

function displayUrl(item: GalleryImage): string {
  // Match sizes the rest of the app already uses so CDN hits are warm
  if (item.kind === "backdrop") {
    return backdropUrl(item.path, "w780")!;
  }
  return posterUrl(item.path, "w500")!;
}

function thumbUrl(item: GalleryImage): string {
  if (item.kind === "backdrop") {
    return backdropUrl(item.path, "w300")!;
  }
  return posterUrl(item.path, "w154")!;
}

function preload(url: string) {
  if (typeof window === "undefined") return;
  const img = new window.Image();
  img.decoding = "async";
  img.src = url;
}

export function ImageGalleryModal({
  open,
  onClose,
  title,
  images,
  initialIndex = 0,
  heroSrc = null,
}: ImageGalleryModalProps) {
  const [index, setIndex] = useState(initialIndex);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setIndex(Math.min(Math.max(0, initialIndex), Math.max(0, images.length - 1)));
  }, [open, initialIndex, images.length]);

  // Preload current + neighbors when open / index changes
  useEffect(() => {
    if (!open || !images.length) return;
    const urls = [
      displayUrl(images[index]),
      images[(index + 1) % images.length] && displayUrl(images[(index + 1) % images.length]),
      images[(index - 1 + images.length) % images.length] &&
        displayUrl(images[(index - 1 + images.length) % images.length]),
    ].filter(Boolean) as string[];
    urls.forEach(preload);
  }, [open, index, images]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const go = useCallback(
    (delta: number) => {
      if (!images.length) return;
      setIndex(i => (i + delta + images.length) % images.length);
    },
    [images.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, go]);

  if (!mounted || !images.length) return null;

  const current = images[index];
  // First slide: prefer the exact hero URL so the browser cache hits immediately
  const src = index === initialIndex && heroSrc ? heroSrc : displayUrl(current);

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key='gallery'
          className='fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <button
            type='button'
            className='absolute inset-0 bg-black/70 backdrop-blur-sm'
            aria-label='Close gallery'
            onClick={onClose}
          />

          <motion.div
            role='dialog'
            aria-modal='true'
            aria-label={`${title} images`}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className='pointer-events-auto relative flex max-h-[min(92vh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl'
          >
            <div className='flex shrink-0 items-center justify-between gap-3 border-b border-border/50 px-4 py-3'>
              <div className='min-w-0'>
                <p className='truncate text-sm font-semibold tracking-tight'>{title}</p>
                <p className='text-xs text-muted-foreground'>
                  {index + 1} / {images.length}
                  <span className='mx-1.5 text-border'>·</span>
                  <span className='capitalize'>{current.kind}</span>
                </p>
              </div>
              <Button
                type='button'
                variant='ghost'
                size='icon-sm'
                onClick={onClose}
                aria-label='Close'
              >
                <X className='size-4' />
              </Button>
            </div>

            <div className='relative flex min-h-0 flex-1 items-center justify-center bg-muted/30 px-2 py-4 sm:px-4'>
              {images.length > 1 ? (
                <>
                  <Button
                    type='button'
                    variant='secondary'
                    size='icon'
                    className='absolute left-2 z-10 size-9 rounded-full shadow-md sm:left-3'
                    onClick={() => go(-1)}
                    aria-label='Previous image'
                  >
                    <ChevronLeft className='size-4' />
                  </Button>
                  <Button
                    type='button'
                    variant='secondary'
                    size='icon'
                    className='absolute right-2 z-10 size-9 rounded-full shadow-md sm:right-3'
                    onClick={() => go(1)}
                    aria-label='Next image'
                  >
                    <ChevronRight className='size-4' />
                  </Button>
                </>
              ) : null}

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={src}
                src={src}
                alt=''
                draggable={false}
                onDragStart={e => e.preventDefault()}
                className={cn(
                  "max-h-[min(58vh,640px)] max-w-full select-none object-contain",
                  current.kind === "poster" ? "rounded-lg shadow-lg" : "rounded-md",
                )}
              />
            </div>

            {images.length > 1 ? (
              <div className='shrink-0 border-t border-border/50 bg-card/80 px-3 py-2.5'>
                <div className='flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                  {images.map((item, i) => {
                    const active = i === index;
                    return (
                      <button
                        key={item.path}
                        type='button'
                        onClick={() => setIndex(i)}
                        className={cn(
                          "relative h-14 w-10 shrink-0 overflow-hidden rounded-md border transition-all sm:h-16 sm:w-12",
                          active
                            ? "border-primary ring-2 ring-primary/40"
                            : "border-border/50 opacity-70 hover:opacity-100",
                          item.kind === "backdrop" && "w-16 sm:w-20",
                        )}
                        aria-label={`Image ${i + 1}`}
                        aria-current={active}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumbUrl(item)}
                          alt=''
                          draggable={false}
                          loading='lazy'
                          className='h-full w-full select-none object-cover'
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
