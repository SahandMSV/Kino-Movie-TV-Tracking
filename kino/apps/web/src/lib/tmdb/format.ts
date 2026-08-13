export function formatRuntime(minutes: number | null | undefined): string | null {
  if (minutes == null || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatYear(date: string | null | undefined): string | null {
  if (!date) return null;
  return date.slice(0, 4);
}

export function formatVote(vote: number): string {
  return vote.toFixed(1);
}