import { Suspense } from "react";
import { getExternalRatings, type RatingInput } from "@/lib/integrations/mdblist/ratings";
import { RatingBoxes, type RatingBox } from "./rating-boxes";

const LOADING: RatingBox[] = [
  { id: "imdb", label: "IMDb", value: null, caption: "Loading…" },
  { id: "rotten-tomatoes", label: "Rotten Tomatoes", value: null, caption: "Loading…" },
  { id: "metacritic", label: "Metacritic", value: null, caption: "Loading…" },
  { id: "letterboxd", label: "Letterboxd", value: null, caption: "Loading…" },
];

async function ExternalRatingsInner(props: RatingInput) {
  const ratings = await getExternalRatings(props);

  return <RatingBoxes ratings={ratings} />;
}

/** Streams the ratings in so a slow provider never blocks the hero. */
export function ExternalRatings(props: RatingInput) {
  return (
    <Suspense fallback={<RatingBoxes ratings={LOADING} className='animate-pulse' />}>
      <ExternalRatingsInner {...props} />
    </Suspense>
  );
}

