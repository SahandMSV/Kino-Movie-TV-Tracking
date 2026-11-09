"use client";

import { useEffect, useMemo, useState } from "react";
import { MediaImage } from "@/components/common/media-image";
import { posterUrl } from "@/lib/tmdb/config";
import { ImageGalleryModal } from "./image-gallery-modal";
import type { GalleryImage } from "@/lib/tmdb/details";
import { cn } from "@/lib/utils";

type HeroPosterProps = {
  title: string;
  posterPath?: string | null;
  images?: GalleryImage[];
  className?: string;
};

export function HeroPoster({ title, posterPath, images = [], className }: HeroPosterProps) {
  const [open, setOpen] = useState(false);

  const gallery = useMemo(() => {
    if (!posterPath) return images;
    const rest = images.filter(i => i.path !== posterPath);
    return [{ path: posterPath, kind: "poster" as const }, ...rest];
  }, [images, posterPath]);

  const poster = posterUrl(posterPath, "w500");
  const canOpen = gallery.length > 0;

  // Warm the next couple of gallery images while the user is on the page
  useEffect(() => {
    if (!gallery.length || typeof window === "undefined") return;
    gallery.slice(0, 4).forEach(item => {
      const url =
        item.kind === "backdrop"
          ? `https://image.tmdb.org/t/p/w780${item.path}`
          : `https://image.tmdb.org/t/p/w500${item.path}`;
      const img = new window.Image();
      img.decoding = "async";
      img.src = url;
    });
  }, [gallery]);

  return (
    <>
      <button
        type='button'
        disabled={!canOpen}
        onClick={() => canOpen && setOpen(true)}
        className={cn(
          // aspect-2/3 is what drives the overview card height via the grid row
          "relative aspect-2/3 w-full overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-xl outline-none",
          canOpen &&
            "cursor-zoom-in transition-[box-shadow,transform] hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-ring",
          !canOpen && "cursor-default",
          className,
        )}
        aria-label={canOpen ? `View images for ${title}` : title}
      >
        <MediaImage src={poster} alt={title} variant='poster' priority />
      </button>

      <ImageGalleryModal
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        images={gallery}
        initialIndex={0}
        heroSrc={poster}
      />
    </>
  );
}
