import { DiscogsTrackDetails } from "@/lib/discogs";
import { SpotifyTrackInfo } from "@/lib/spotify";

type Entity = {
  id: string;
  name: string;
};

type BlacklistItem = Entity & {
  type:
    | "artist"
    | "producer"
    | "composer"
    | "mix"
    | "vocal"
    | "feature"
    | "label"
    | "default";
  score: number;
};

type ScoreDetail = {
  reason: string;
  score: number;
  type: BlacklistItem["type"];
};

export type FinalScore = {
  score: number;
  score_details: ScoreDetail[];
};

// Consolidated blacklist with scores
const BLACKLIST: BlacklistItem[] = [
  { id: "173538", name: "Diddy", type: "artist", score: 25 },
];

function getContributionMessage(name: string, type: string): string {
  return `${name} contributed as ${type}`;
}

// Helper to generate score details for given entities and type
const scoreEntities = (
  entities: Entity[],
  type: BlacklistItem["type"]
): ScoreDetail[] => {
  return entities
    .filter((entity) =>
      BLACKLIST.some(
        (item) => item.id === entity.id.toString() && item.type === type
      )
    )
    .map((entity) => ({
      reason: getContributionMessage(entity.name, type),
      score:
        BLACKLIST.find(
          (item) => item.id === entity.id.toString() && item.type === type
        )?.score || 5,
      type,
    }));
};

// Calculates Diddymeter score for Discogs track data
export const calculateDiddymeter = (track: DiscogsTrackDetails): FinalScore => {
  const scoreDetails: ScoreDetail[] = [
    ...scoreEntities(
      [{ id: track.artist.id.toString(), name: track.artist.name }],
      "artist"
    ),
    ...scoreEntities(
      track.labels.map((label) => ({
        id: label.id.toString(),
        name: label.name,
      })),
      "label"
    ),
    // Add other roles as needed based on your requirements
  ];

  return {
    score: scoreDetails.reduce((acc, detail) => acc + detail.score, 0),
    score_details: scoreDetails,
  };
};

// Calculates Diddymeter score using Spotify track info as fallback
export const calculateDiddymeterFromSpotify = (
  track: SpotifyTrackInfo
): FinalScore => {
  const scoreDetails = BLACKLIST.reduce<ScoreDetail[]>((acc, item) => {
    const isMainArtist =
      item.name.toLowerCase() === track.artists[0].toLowerCase();
    const isFeature = track.artists
      .slice(1)
      .some((artist) => artist.toLowerCase() === item.name.toLowerCase());

    if (isMainArtist && item.type === "artist") {
      return acc.concat({
        reason: getContributionMessage(track.artists[0], "artist"),
        score: item.score,
        type: "artist",
      });
    }

    if (isFeature && item.type === "feature") {
      return acc.concat({
        reason: getContributionMessage(item.name, "feature"),
        score: item.score,
        type: "feature",
      });
    }

    return acc;
  }, []);

  const finalScore = scoreDetails.reduce(
    (acc, detail) => acc + detail.score,
    0
  );

  return {
    score: finalScore,
    score_details: scoreDetails,
  };
};
