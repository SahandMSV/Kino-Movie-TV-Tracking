"use client";

import { useState, useTransition } from "react";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setRatingAndNotes } from "@/lib/actions/tracking";
import { cn } from "@/lib/utils";

type RatingNotesProps = {
  tmdbId: number;
  mediaType: "movie" | "tv";
  initialRating?: number | null;
  initialNotes?: string | null;
  /** Only show if the user already has a status */
  hasStatus: boolean;
};

const STARS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export function RatingNotes({
  tmdbId,
  mediaType,
  initialRating = null,
  initialNotes = null,
  hasStatus,
}: RatingNotesProps) {
  const [rating, setRating] = useState<number | null>(initialRating);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [isPending, startTransition] = useTransition();
  const [hovered, setHovered] = useState<number | null>(null);

  if (!hasStatus) return null;

  const displayValue = hovered ?? rating;

  const save = (nextRating: number | null, nextNotes: string) => {
    startTransition(async () => {
      const res = await setRatingAndNotes({
        tmdbId,
        mediaType,
        rating: nextRating,
        notes: nextNotes.trim() || null,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      setRating(res.rating ?? null);
      setNotes(res.notes ?? "");
      toast.success("Saved");
    });
  };

  const handleStarClick = (value: number) => {
    // Clicking the same star again clears the rating
    const next = rating === value ? null : value;
    setRating(next);
    save(next, notes);
  };

  const handleNotesBlur = () => {
    // Only save if something actually changed
    if ((notes.trim() || null) !== (initialNotes ?? null)) {
      save(rating, notes);
    }
  };

  return (
    <div className='mx-auto max-w-6xl space-y-5 px-4 pb-8 sm:px-6'>
      {/* Rating */}
      <div className='space-y-2'>
        <p className='text-sm font-medium text-muted-foreground'>Your rating</p>
        <div className='flex flex-wrap items-center gap-1'>
          {STARS.map(value => {
            const filled = displayValue !== null && value <= displayValue;
            return (
              <button
                key={value}
                type='button'
                disabled={isPending}
                onClick={() => handleStarClick(value)}
                onMouseEnter={() => setHovered(value)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  "rounded p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  filled ? "text-amber-500" : "text-muted-foreground/40 hover:text-amber-500/70",
                )}
                aria-label={`Rate ${value} out of 10`}
              >
                <Star className={cn("size-5", filled && "fill-current")} strokeWidth={1.5} />
              </button>
            );
          })}
          {rating !== null && (
            <span className='ml-2 text-sm tabular-nums text-muted-foreground'>
              {rating.toFixed(1)}
            </span>
          )}
          {isPending && <Loader2 className='ml-2 size-4 animate-spin text-muted-foreground' />}
        </div>
      </div>

      {/* Private notes */}
      <div className='space-y-2'>
        <p className='text-sm font-medium text-muted-foreground'>Private notes</p>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          disabled={isPending}
          placeholder='Thoughts, quotes, scenes you loved…'
          rows={3}
          maxLength={4000}
          className={cn(
            "w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm",
            "placeholder:text-muted-foreground/60",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:opacity-60",
          )}
        />
        <p className='text-xs text-muted-foreground'>
          Only you can see these notes. Changes save when you leave the field.
        </p>
      </div>
    </div>
  );
}
