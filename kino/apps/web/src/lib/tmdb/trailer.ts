export type TrailerVideo = {
  key: string;
  name?: string;
  site?: string;
  type?: string;
  official?: boolean;
};

/** YouTube trailer or teaser only. Featurettes and clips are not labeled as trailers. */
export function pickTrailer(videos: TrailerVideo[]): { key: string; name?: string } | null {
  const youtube = videos.filter(v => v.site === "YouTube" && v.key);
  const preferred = youtube.filter(v => {
    const type = v.type?.toLowerCase() ?? "";
    return type === "trailer" || type === "teaser";
  });
  if (!preferred.length) return null;

  const score = (video: TrailerVideo) => {
    const type = video.type?.toLowerCase() ?? "";
    let value = 0;
    if (type === "trailer") value += 100;
    else if (type === "teaser") value += 50;
    if (video.official) value += 25;
    return value;
  };

  const best = [...preferred].sort((a, b) => score(b) - score(a))[0];
  return best ? { key: best.key, name: best.name } : null;
}
