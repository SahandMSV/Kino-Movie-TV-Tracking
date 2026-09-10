"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslate } from "@tolgee/react";
import { Button } from "@/components/ui/button";
import { MediaImage } from "@/components/common/media-image";
import { posterUrl } from "@/lib/tmdb/config";
import { formatYear } from "@/lib/tmdb/format";
import { getTvSeasonAction } from "@/lib/actions/tv-season";
import { setSeasonWatched, toggleEpisodeWatched } from "@/lib/actions/tracking";
import type { TvSeasonSummary, TvSeasonDetail } from "@/lib/tmdb/details";
import type { WatchedEpisode } from "@/lib/db/models/watch-entry";
import { cn } from "@/lib/utils";

type EpisodeProgressProps = {
  tmdbId: number;
  title: string;
  posterPath?: string | null;
  seasons: TvSeasonSummary[];
  initialWatched?: WatchedEpisode[];
  hasStatus: boolean;
};

function epKey(season: number, episode: number) {
  return `${season}:${episode}`;
}

export function EpisodeProgress({
  tmdbId,
  title,
  posterPath,
  seasons,
  initialWatched = [],
  hasStatus,
}: EpisodeProgressProps) {
  const { t } = useTranslate();
  const [watched, setWatched] = useState<Set<string>>(
    () => new Set(initialWatched.map(e => epKey(e.season, e.episode))),
  );
  const [openSeason, setOpenSeason] = useState<number | null>(null);
  const [seasonCache, setSeasonCache] = useState<Record<number, TvSeasonDetail>>({});
  const [loadingSeason, setLoadingSeason] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const regularSeasons = useMemo(
    () =>
      [...seasons]
        .filter(s => s.season_number > 0)
        .sort((a, b) => a.season_number - b.season_number),
    [seasons],
  );

  const specials = useMemo(() => seasons.find(s => s.season_number === 0) ?? null, [seasons]);

  const totalEpisodes = regularSeasons.reduce((sum, s) => sum + (s.episode_count ?? 0), 0);

  const watchedCount = useMemo(() => {
    let count = 0;
    for (const key of watched) {
      const season = Number(key.split(":")[0]);
      if (season > 0) count += 1;
    }
    return count;
  }, [watched]);

  const percent =
    totalEpisodes > 0 ? Math.min(100, Math.round((watchedCount / totalEpisodes) * 100)) : 0;

  if (!regularSeasons.length && !specials) return null;

  const loadSeason = async (seasonNumber: number) => {
    if (seasonCache[seasonNumber]) return seasonCache[seasonNumber];
    setLoadingSeason(seasonNumber);
    const res = await getTvSeasonAction(tmdbId, seasonNumber);
    setLoadingSeason(null);
    if (!res.success || !res.data) {
      toast.error(res.error ?? t("episodes.load_error"));
      return null;
    }
    setSeasonCache(prev => ({ ...prev, [seasonNumber]: res.data! }));
    return res.data;
  };

  const handleToggleSeasonPanel = async (seasonNumber: number) => {
    if (openSeason === seasonNumber) {
      setOpenSeason(null);
      return;
    }
    setOpenSeason(seasonNumber);
    await loadSeason(seasonNumber);
  };

  const handleToggleEpisode = (season: number, episode: number) => {
    if (!hasStatus) {
      toast.error(t("episodes.need_status"));
      return;
    }

    const key = epKey(season, episode);
    const wasWatched = watched.has(key);
    const next = new Set(watched);
    if (wasWatched) next.delete(key);
    else next.add(key);
    setWatched(next);

    startTransition(async () => {
      const res = await toggleEpisodeWatched({
        tmdbId,
        season,
        episode,
        title,
        posterPath,
      });
      if (res.error) {
        setWatched(watched);
        toast.error(res.error);
        return;
      }
      if (res.watchedEpisodes) {
        setWatched(new Set(res.watchedEpisodes.map(e => epKey(e.season, e.episode))));
      }
    });
  };

  const handleMarkSeason = async (seasonNumber: number, markWatched: boolean) => {
    if (!hasStatus) {
      toast.error(t("episodes.need_status"));
      return;
    }

    const detail = seasonCache[seasonNumber] ?? (await loadSeason(seasonNumber));
    if (!detail) return;

    const episodeNumbers = detail.episodes.map(e => e.episode_number);
    const next = new Set(watched);
    for (const ep of episodeNumbers) {
      const key = epKey(seasonNumber, ep);
      if (markWatched) next.add(key);
      else next.delete(key);
    }
    setWatched(next);

    startTransition(async () => {
      const res = await setSeasonWatched({
        tmdbId,
        season: seasonNumber,
        episodes: episodeNumbers,
        watched: markWatched,
        title,
        posterPath,
      });
      if (res.error) {
        setWatched(watched);
        toast.error(res.error);
        return;
      }
      if (res.watchedEpisodes) {
        setWatched(new Set(res.watchedEpisodes.map(e => epKey(e.season, e.episode))));
      }
      toast.success(markWatched ? t("episodes.season_marked") : t("episodes.season_cleared"));
    });
  };

  const renderSeason = (season: TvSeasonSummary) => {
    const n = season.season_number;
    const open = openSeason === n;
    const detail = seasonCache[n];
    const loading = loadingSeason === n;
    const episodeCount = season.episode_count ?? detail?.episodes.length ?? 0;

    let seasonWatched = 0;
    if (detail) {
      for (const ep of detail.episodes) {
        if (watched.has(epKey(n, ep.episode_number))) seasonWatched += 1;
      }
    } else {
      for (const key of watched) {
        if (key.startsWith(`${n}:`)) seasonWatched += 1;
      }
    }

    const allDone = episodeCount > 0 && seasonWatched >= episodeCount;

    return (
      <div key={n} className='overflow-hidden rounded-xl border border-border/60 bg-card/40'>
        <button
          type='button'
          onClick={() => handleToggleSeasonPanel(n)}
          className='flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40'
        >
          <div className='relative hidden h-14 w-10 shrink-0 overflow-hidden rounded-md bg-muted sm:block'>
            <MediaImage src={posterUrl(season.poster_path, "w154")} alt='' variant='poster' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium'>
              {n === 0 ? t("episodes.specials") : t("episodes.season_label", { number: n })}
              {season.name && season.name !== `Season ${n}` ? (
                <span className='text-muted-foreground'> · {season.name}</span>
              ) : null}
            </p>
            <p className='text-xs text-muted-foreground'>
              {seasonWatched}/{episodeCount || "—"} {t("episodes.watched_suffix")}
              {season.air_date ? ` · ${formatYear(season.air_date)}` : null}
            </p>
          </div>
          <div
            className={cn(
              "flex size-6 items-center justify-center rounded-full border text-[10px]",
              allDone
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground",
            )}
          >
            {allDone ? <Check className='size-3.5' /> : null}
          </div>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        {open && (
          <div className='border-t border-border/50 px-3 pb-3 pt-2'>
            <div className='mb-2 flex flex-wrap gap-2'>
              <Button
                type='button'
                size='sm'
                variant='outline'
                disabled={isPending || !hasStatus}
                onClick={() => handleMarkSeason(n, true)}
              >
                {t("episodes.mark_season")}
              </Button>
              <Button
                type='button'
                size='sm'
                variant='ghost'
                disabled={isPending || !hasStatus}
                onClick={() => handleMarkSeason(n, false)}
              >
                {t("episodes.clear_season")}
              </Button>
            </div>

            {loading && !detail ? (
              <div className='flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground'>
                <Loader2 className='size-4 animate-spin' />
                {t("common.loading")}
              </div>
            ) : detail ? (
              <ul className='divide-y divide-border/40'>
                {detail.episodes.map(ep => {
                  const key = epKey(n, ep.episode_number);
                  const isWatched = watched.has(key);
                  const still = posterUrl(ep.still_path, "w185");

                  return (
                    <li key={ep.id}>
                      <button
                        type='button'
                        disabled={isPending}
                        onClick={() => handleToggleEpisode(n, ep.episode_number)}
                        className={cn(
                          "flex w-full items-center gap-3 px-1 py-2.5 text-left transition-colors hover:bg-muted/30",
                          !hasStatus && "opacity-70",
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded-md border",
                            isWatched
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border",
                          )}
                        >
                          {isWatched ? <Check className='size-3' /> : null}
                        </div>

                        <div className='relative hidden h-12 w-20 shrink-0 overflow-hidden rounded-md bg-muted sm:block'>
                          <MediaImage src={still} alt='' variant='thumb' />
                        </div>

                        <div className='min-w-0 flex-1'>
                          <p className='truncate text-sm font-medium'>
                            <span className='text-muted-foreground'>
                              {t("episodes.episode_num", { number: ep.episode_number })}
                            </span>
                            {ep.name ? ` · ${ep.name}` : null}
                          </p>
                          {ep.air_date ? (
                            <p className='text-xs text-muted-foreground'>{ep.air_date}</p>
                          ) : null}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className='mx-auto max-w-6xl space-y-4 px-4 py-10 sm:px-6'>
      <div className='flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h2 className='text-xl font-semibold tracking-tight'>{t("episodes.title")}</h2>
          <p className='text-sm text-muted-foreground'>
            {hasStatus
              ? t("episodes.subtitle", { watched: watchedCount, total: totalEpisodes })
              : t("episodes.need_status")}
          </p>
        </div>
        {totalEpisodes > 0 && (
          <p className='text-sm font-medium tabular-nums text-muted-foreground'>{percent}%</p>
        )}
      </div>

      {totalEpisodes > 0 && (
        <div className='h-1.5 overflow-hidden rounded-full bg-muted'>
          <div
            className='h-full rounded-full bg-primary transition-[width] duration-300'
            style={{ width: `${percent}%` }}
          />
        </div>
      )}

      <div className='space-y-2'>
        {regularSeasons.map(renderSeason)}
        {specials ? renderSeason(specials) : null}
      </div>
    </section>
  );
}
