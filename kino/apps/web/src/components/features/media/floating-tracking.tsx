"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { removeWatchEntry, setWatchStatus } from "@/lib/actions/tracking";
import type { WatchStatus } from "@/lib/db/models/watch-entry";
import { cn } from "@/lib/utils";
import { glassInteractive } from "@/lib/glass";

type FloatingTrackingProps = {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  initialStatus?: WatchStatus | null;
  isLoggedIn: boolean;
};

type Target = Extract<WatchStatus, "watched" | "plan_to_watch">;

export function FloatingTracking({
  tmdbId,
  mediaType,
  title,
  posterPath,
  initialStatus = null,
  isLoggedIn,
}: FloatingTrackingProps) {
  const router = useRouter();
  const [status, setStatus] = useState<WatchStatus | null>(initialStatus);
  const [pending, setPending] = useState<Target | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggle = (target: Target) => {
    if (!isLoggedIn) {
      toast.error("Sign in to track titles");
      router.push("/register");
      return;
    }

    setPending(target);

    startTransition(async () => {
      const isActive = status === target;

      const res = isActive
        ? await removeWatchEntry({ tmdbId, mediaType })
        : await setWatchStatus({ tmdbId, mediaType, status: target, title, posterPath });

      setPending(null);

      if (res.error) {
        toast.error(res.error);
        return;
      }

      if (isActive) {
        setStatus(null);
        toast.success("Removed from tracking");
        return;
      }

      setStatus(res.status ?? target);
      toast.success(target === "watched" ? "Marked as watched" : "Saved");
    });
  };

  const items: { target: Target; label: string; icon: typeof Check }[] = [
    { target: "plan_to_watch", label: "Save", icon: Bookmark },
    { target: "watched", label: "Watched", icon: Check },
  ];

  return (
    <div className='dark fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6 sm:flex-row'>
      {items.map(({ target, label, icon: Icon }) => {
        const active = status === target;
        const loading = isPending && pending === target;

        return (
          <Button
            key={target}
            type='button'
            size='lg'
            variant={active ? "default" : "outline"}
            disabled={isPending}
            onClick={() => toggle(target)}
            aria-pressed={active}
            className={cn("h-11 rounded-full px-5 shadow-lg", !active && glassInteractive)}
          >
            {loading ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <Icon
                className={cn("size-4", active && target === "plan_to_watch" && "fill-current")}
              />
            )}
            {label}
          </Button>
        );
      })}
    </div>
  );
}
