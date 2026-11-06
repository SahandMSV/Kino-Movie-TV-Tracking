"use client";

import { ExternalLink, Film, MoreHorizontal, Share2, Tv } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { glassInteractive } from "@/lib/glass";

type MediaTopBarProps = {
  tmdbId: number;
  mediaType: "movie" | "tv";
};

const glass = glassInteractive;

export function MediaTopBar({ tmdbId, mediaType }: MediaTopBarProps) {
  const tmdbUrl = `https://www.themoviedb.org/${mediaType}/${tmdbId}`;
  const TypeIcon = mediaType === "tv" ? Tv : Film;
  const typeLabel = mediaType === "tv" ? "TV Series" : "Movie";

  const comingSoon = () => toast.info("Coming soon");

  return (
    <div className='flex items-center justify-between gap-3'>
      <p className='flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground'>
        <TypeIcon className='size-4' />
        {typeLabel}
      </p>

      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='icon'
          className={glass}
          aria-label='Open on TMDB'
          nativeButton={false}
          render={<a href={tmdbUrl} target='_blank' rel='noopener noreferrer' />}
        >
          <ExternalLink className='size-4' />
        </Button>

        <Button
          variant='outline'
          size='icon'
          className={glass}
          aria-label='Share'
          onClick={comingSoon}
        >
          <Share2 className='size-4' />
        </Button>

        <Button
          variant='outline'
          size='icon'
          className={glass}
          aria-label='More options'
          onClick={comingSoon}
        >
          <MoreHorizontal className='size-4' />
        </Button>
      </div>
    </div>
  );
}