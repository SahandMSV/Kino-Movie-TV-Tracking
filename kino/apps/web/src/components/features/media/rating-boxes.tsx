import { cn } from "@/lib/utils";
import { SiImdb, SiRottentomatoes, SiMetacritic, SiLetterboxd } from "react-icons/si";

export type RatingBox = {
  id: string;
  label: string;
  /** null renders the placeholder state */
  value: string | null;
  caption?: string | null;
  /** Provider page; when set the whole card is a link */
  href?: string | null;
};

type RatingBoxesProps = {
  ratings: RatingBox[];
  className?: string;
};

function ProviderIcon({ id }: { id: string }) {
  const common = "size-4 shrink-0 text-muted-foreground";

  switch (id) {
    case "imdb":
      return <SiImdb className={common} aria-hidden />;
    case "rotten-tomatoes":
      return <SiRottentomatoes className={common} aria-hidden />;
    case "metacritic":
      return <SiMetacritic className={common} aria-hidden />;
    case "letterboxd":
      return <SiLetterboxd className={common} aria-hidden />;
    default:
      return null;
  }
}

export function RatingBoxes({ ratings, className }: RatingBoxesProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-1.5 sm:grid-cols-4", className)}>
      {ratings.map(rating => {
        const boxClass = cn(
          "flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2",
          rating.href &&
            "transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        );

        const content = (
          <>
            <div className='min-w-0 flex-1'>
              <p className='flex items-center gap-1.5 truncate text-[11px] font-medium leading-none text-muted-foreground'>
                <ProviderIcon id={rating.id} />
                <span className='truncate'>{rating.label}</span>
              </p>
              {rating.caption ? (
                <p className='mt-1 truncate text-[10px] leading-none text-muted-foreground/80'>
                  {rating.caption}
                </p>
              ) : null}
            </div>
            <p
              className={cn(
                "shrink-0 text-xl font-semibold tabular-nums leading-none",
                rating.value === null && "text-muted-foreground/40",
              )}
            >
              {rating.value ?? "—"}
            </p>
          </>
        );

        return rating.href ? (
          <a
            key={rating.id}
            href={rating.href}
            target='_blank'
            rel='noopener noreferrer'
            className={boxClass}
          >
            {content}
            <span className='sr-only'>(opens in a new tab)</span>
          </a>
        ) : (
          <div key={rating.id} className={boxClass}>
            {content}
          </div>
        );
      })}
    </div>
  );

}