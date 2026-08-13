"use client";

import { motion } from "framer-motion";
import type { TmdbVideo } from "@/lib/tmdb/details";

type VideosSectionProps = {
  videos: TmdbVideo[];
};

function pickVideos(videos: TmdbVideo[]): TmdbVideo[] {
  const youtube = videos.filter(v => v.site === "YouTube" && v.key);

  const score = (v: TmdbVideo) => {
    const type = v.type?.toLowerCase() ?? "";
    let s = 0;
    if (type === "trailer") s += 100;
    else if (type === "teaser") s += 50;
    else if (type === "clip") s += 20;
    if (v.official) s += 25;
    return s;
  };

  return [...youtube].sort((a, b) => score(b) - score(a)).slice(0, 6);
}

function youtubeEmbedUrl(key: string) {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
  });
  return `https://www.youtube-nocookie.com/embed/${key}?${params.toString()}`;
}

export function VideosSection({ videos }: VideosSectionProps) {
  const selected = pickVideos(videos);
  if (!selected.length) return null;

  return (
    <section className='mx-auto max-w-6xl px-4 py-10 sm:px-6'>
      <h2 className='mb-6 text-xl font-semibold tracking-tight'>Videos</h2>

      <div className='grid gap-6 sm:grid-cols-2'>
        {selected.map((video, i) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: i * 0.04,
              ease: [0.22, 1, 0.36, 1],
            }}
            className='space-y-2'
          >
            <div className='relative aspect-video overflow-hidden rounded-xl border border-border/50 bg-muted shadow-sm'>
              <iframe
                src={youtubeEmbedUrl(video.key)}
                title={video.name}
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                allowFullScreen
                loading='lazy'
                referrerPolicy='strict-origin-when-cross-origin'
                className='absolute inset-0 h-full w-full border-0'
              />
            </div>
            <div className='min-w-0 px-0.5'>
              <p className='truncate text-sm font-medium'>{video.name}</p>
              <p className='text-xs text-muted-foreground capitalize'>
                {video.type}
                {video.official ? " · Official" : null}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
