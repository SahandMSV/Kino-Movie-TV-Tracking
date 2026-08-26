"use client";

import { useState } from "react";
import { Film, ImageIcon, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type MediaImageVariant = "poster" | "profile" | "backdrop" | "thumb";

type MediaImageProps = {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  imgClassName?: string;
  variant?: MediaImageVariant;
  sizes?: string;
  priority?: boolean;
};

const ICONS: Record<MediaImageVariant, typeof Film> = {
  poster: Film,
  profile: User,
  backdrop: ImageIcon,
  thumb: ImageIcon,
};

export function MediaImage({
  src,
  alt = "",
  className,
  imgClassName,
  variant = "poster",
  sizes,
  priority = false,
}: MediaImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const showPlaceholder = !src || failed;
  const Icon = ICONS[variant];

  if (showPlaceholder) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-muted text-muted-foreground/50",
          className,
        )}
        aria-hidden={alt ? undefined : true}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
      >
        <Icon className='size-[28%] max-h-10 max-w-10 min-h-4 min-w-4' strokeWidth={1.25} />
      </div>
    );
  }

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-muted", className)}>
      <div
        className={cn(
          "absolute inset-0 bg-muted transition-opacity duration-500",
          loaded ? "opacity-0" : "opacity-100",
        )}
        aria-hidden
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding='async'
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn(
          "h-full w-full object-cover transition-[opacity,filter] duration-500 ease-out",
          loaded ? "opacity-100 blur-0" : "opacity-0 blur-md",
          imgClassName,
        )}
      />
    </div>
  );
}
