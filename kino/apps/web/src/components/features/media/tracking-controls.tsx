"use client";

import { useState, useTransition } from "react";
import { Bookmark, Check, Eye, Loader2, Pause, X, Ban } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setWatchStatus, removeWatchEntry } from "@/lib/actions/tracking";
import type { WatchStatus } from "@/lib/db/models/watch-entry";
import { cn } from "@/lib/utils";

type TrackingControlsProps = {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  initialStatus?: WatchStatus | null;
};

const ACTIONS: {
  status: WatchStatus;
  label: string;
  icon: typeof Bookmark;
}[] = [
  { status: "plan_to_watch", label: "Watchlist", icon: Bookmark },
  { status: "watching", label: "Watching", icon: Eye },
  { status: "watched", label: "Watched", icon: Check },
  { status: "on_hold", label: "On hold", icon: Pause },
  { status: "dropped", label: "Dropped", icon: Ban },
];

export function TrackingControls({
  tmdbId,
  mediaType,
  title,
  posterPath,
  initialStatus = null,
}: TrackingControlsProps) {
  const [status, setStatus] = useState<WatchStatus | null>(initialStatus);
  const [isPending, startTransition] = useTransition();

  const applyStatus = (next: WatchStatus) => {
    startTransition(async () => {
      const res = await setWatchStatus({
        tmdbId,
        mediaType,
        status: next,
        title,
        posterPath,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      setStatus(res.status ?? next);

      const messages: Record<WatchStatus, string> = {
        plan_to_watch: "Added to watchlist",
        watching: "Marked as watching",
        watched: "Marked as watched",
        on_hold: "Put on hold",
        dropped: "Marked as dropped",
      };
      toast.success(messages[next]);
    });
  };

  const clear = () => {
    startTransition(async () => {
      const res = await removeWatchEntry({ tmdbId, mediaType });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setStatus(null);
      toast.success("Removed from tracking");
    });
  };

  return (
    <div className='mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2 px-4 pb-6 sm:px-6 lg:justify-start'>
      {ACTIONS.map(({ status: s, label, icon: Icon }) => {
        const active = status === s;
        return (
          <Button
            key={s}
            type='button'
            size='sm'
            variant={active ? "default" : "outline"}
            disabled={isPending}
            onClick={() => applyStatus(s)}
            className={cn(active && "pointer-events-none")}
          >
            {isPending && active ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <Icon className='size-4' />
            )}
            {label}
          </Button>
        );
      })}

      {status ? (
        <Button type='button' size='sm' variant='ghost' disabled={isPending} onClick={clear}>
          <X className='size-4' />
          Remove
        </Button>
      ) : null}
    </div>
  );
}
