import { Activity, Flame, Sprout, TrendingUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tier = {
  min: number;
  label: string;
  icon: LucideIcon;
  /** Tailwind classes for the icon chip */
  tone: string;
  /** How many of the 4 meter bars are lit */
  bars: number;
};

// Ordered high -> low. TMDB popularity is an unbounded score: ~10 is quiet,
// 100+ is trending, 300+ is a breakout. Tweak the thresholds to taste.
const TIERS: Tier[] = [
  {
    min: 300,
    label: "On fire",
    icon: Flame,
    tone: "bg-orange-500/15 text-orange-400 ring-orange-500/30",
    bars: 4,
  },
  {
    min: 100,
    label: "Trending",
    icon: TrendingUp,
    tone: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
    bars: 3,
  },
  {
    min: 30,
    label: "Steady",
    icon: Activity,
    tone: "bg-sky-500/15 text-sky-400 ring-sky-500/30",
    bars: 2,
  },
  {
    min: 0,
    label: "Niche",
    icon: Sprout,
    tone: "bg-muted text-muted-foreground ring-border",
    bars: 1,
  },
];

export function getPopularityTier(popularity: number): Tier {
  return TIERS.find(t => popularity >= t.min) ?? TIERS[TIERS.length - 1];
}

type PopularityBadgeProps = {
  popularity?: number | null;
  className?: string;
};

export function PopularityBadge({ popularity, className }: PopularityBadgeProps) {
  if (popularity == null || popularity <= 0) return null;

  const tier = getPopularityTier(popularity);
  const Icon = tier.icon;

  return (
    <div
      className={cn("flex items-center gap-3", className)}
      title={`TMDB popularity score: ${popularity.toFixed(1)}`}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full ring-1",
          tier.tone,
        )}
      >
        <Icon className='size-4' aria-hidden />
      </span>

      <div className='min-w-0 leading-tight'>
        <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
          Popularity
        </p>
        <p className='text-sm font-semibold tabular-nums'>
          {tier.label}
          <span className='ml-2 font-normal text-muted-foreground'>
            {Math.round(popularity).toLocaleString()}
          </span>
        </p>
      </div>

      {/* 4-step meter */}
      <div className='ml-auto flex items-end gap-0.5' aria-hidden>
        {[0, 1, 2, 3].map(i => (
          <span
            key={i}
            style={{ height: `${8 + i * 4}px` }}
            className={cn("w-1 rounded-full", i < tier.bars ? "bg-current" : "bg-white/15")}
          />
        ))}
      </div>
    </div>
  );
}
