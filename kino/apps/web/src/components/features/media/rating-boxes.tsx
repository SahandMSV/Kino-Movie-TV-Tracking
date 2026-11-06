import { cn } from "@/lib/utils";

export type RatingBox = {
  /** Stable id, useful later when users reorder / toggle providers */
  id: string;
  label: string;
  /** null renders the placeholder state */
  value: string | null;
  caption?: string | null;
};

type RatingBoxesProps = {
  /** Rendered in the given order */
  ratings: RatingBox[];
  className?: string;
};

export function RatingBoxes({ ratings, className }: RatingBoxesProps) {
  return (
    <div className={cn("grid gap-2 grid-cols-[repeat(auto-fit,minmax(6.5rem,1fr))]", className)}>
      {ratings.map(rating => (
        <div
          key={rating.id}
          className='min-w-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5'
        >
          <p className='truncate text-xs font-medium text-muted-foreground'>{rating.label}</p>
          <p
            className={cn(
              "mt-1 text-xl font-semibold tabular-nums leading-none",
              rating.value === null && "text-muted-foreground/40",
            )}
          >
            {rating.value ?? "—"}
          </p>
          <p className='mt-1 h-4 truncate text-[11px] text-muted-foreground'>
            {rating.caption ?? (rating.value === null ? "Not connected" : "")}
          </p>
        </div>
      ))}
    </div>
  );
}