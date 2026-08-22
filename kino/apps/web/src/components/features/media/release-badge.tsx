"use client";

import { cn } from "@/lib/utils";
import type { ReleaseStatus } from "@/lib/tmdb/release-status";

type ReleaseBadgeProps = {
  status: ReleaseStatus;
  digitalDate?: string | null;
  className?: string;
  onlyTheaters?: boolean;
};

export function ReleaseBadge({
  status,
  digitalDate,
  className,
  onlyTheaters = false,
}: ReleaseBadgeProps) {
  if (onlyTheaters) {
    if (status !== "theatrical_window") return null;

    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md border border-white/20",
          "bg-black/40 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-white",
          "backdrop-blur-md backdrop-saturate-150",
          "shadow-sm",
          className,
        )}
      >
        In theaters
      </span>
    );
  }

  // Fallback styles (not used on home, but kept for completeness)
  if (status === "theatrical_window") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md border border-white/20",
          "bg-black/40 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-white",
          "backdrop-blur-md backdrop-saturate-150",
          className,
        )}
      >
        Not available digitally yet
      </span>
    );
  }

  if (status === "upcoming_digital" && digitalDate) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md border border-white/15",
          "bg-black/35 px-1.5 py-0.5 text-[10px] font-medium text-white/90",
          "backdrop-blur-md",
          className,
        )}
      >
        Digital {digitalDate.slice(0, 10)}
      </span>
    );
  }

  if (status === "digital") {
    return (
      <span
        className={cn(
          "inline-flex items-center border border-white/15",
          "bg-black/35 px-1.5 py-0.5 text-[10px] font-medium text-white/90",
          "backdrop-blur-md",
          className,
        )}
      >
        Available digitally
      </span>
    );
  }

  return null;
}
