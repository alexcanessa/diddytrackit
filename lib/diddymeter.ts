import _ from "lodash";
import { TrackDetails } from "./musicbrainzTypes";
import { SpotifyTrackInfo } from "./spotify";

type Entity = {
  id: string;
  name: string;
};

type TrackData = TrackDetails;

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

// Scores for each involvement type, including default for unknown types
export const SCORE_PER_ROLE: Record<string, number> = {
  artist: 50,
  label: 25,
  producer: 15,
  composer: 15,
  mix: 8,
  vocal: 5,
  feature: 10,
  default: 5,
};

const BLACKLIST: BlacklistItem[] = [
  {
    id: "61063817-feda-4d21-8ae5-e488e7632eea",
    name: "Bad Boy South",
    type: "label",
    score: SCORE_PER_ROLE.label,
  },
  {
    id: "29d43312-a8ed-4d7b-9f4e-f5650318aebb",
    name: "Bad Boy Records",
    type: "label",
    score: SCORE_PER_ROLE.label,
  },
  {
    id: "635b9d63-05c1-46ff-a577-0ce030e6e84b",
    name: "Bad Boy Entertainment",
    type: "label",
    score: SCORE_PER_ROLE.label,
  },
  {
    id: "ba4b8ffa-d518-4f75-b0c1-659472cf0a9d",
    name: "Love Label",
    type: "label",
    score: SCORE_PER_ROLE.label,
  },
  {
    id: "cabb4fcf-4067-4ba5-908d-76ee66fcf0c6",
    name: "Diddy",
    type: "artist",
    score: SCORE_PER_ROLE.artist,
  },
  {
    id: "cabb4fcf-4067-4ba5-908d-76ee66fcf0c6",
    name: "Diddy",
    type: "feature",
    score: SCORE_PER_ROLE.feature,
  },
  {
    id: "cabb4fcf-4067-4ba5-908d-76ee66fcf0c6",
    name: "Diddy",
    type: "producer",
    score: SCORE_PER_ROLE.producer,
  },
  {
    id: "cabb4fcf-4067-4ba5-908d-76ee66fcf0c6",
    name: "Diddy",
    type: "mix",
    score: SCORE_PER_ROLE.mix,
  },
  {
    id: "cabb4fcf-4067-4ba5-908d-76ee66fcf0c6",
    name: "Diddy",
    type: "vocal",
    score: SCORE_PER_ROLE.vocal,
  },
  {
    id: "cabb4fcf-4067-4ba5-908d-76ee66fcf0c6",
    name: "Diddy",
    type: "composer",
    score: SCORE_PER_ROLE.composer,
  },
  {
    id: "cabb4fcf-4067-4ba5-908d-76ee66fcf0c6",
    name: "Diddy",
    type: "default",
    score: SCORE_PER_ROLE.default,
  },
  {
    id: "2072f699-049a-4b78-b039-317a1c7cff94",
    name: "Diddy and the Family",
    type: "artist",
    score: SCORE_PER_ROLE.artist,
  },
  {
    id: "c9ba7b22-51bd-4beb-affd-9bf682479f41",
    name: "Bugatti Boyz",
    type: "artist",
    score: SCORE_PER_ROLE.artist,
  },
  {
    id: "480cdd78-e54e-4518-9ec9-572a62d7e1e1",
    name: "Diddy - Dirty Money",
    type: "artist",
    score: SCORE_PER_ROLE.artist,
  },
  {
    id: "3195aa16-a32e-4fde-8dd2-1bdf021ed3ca",
    name: "Three The...",
    type: "artist",
    score: SCORE_PER_ROLE.artist,
  },
];

function getContributionMessage(name: string, type: string): string {
  return `${name} contributed as ${type}`;
}

// Helper to generate score details for given entities and type
const scoreEntities = (entities: Entity[], type: string): ScoreDetail[] => {
  return entities
    .filter((entity) =>
      BLACKLIST.some((item) => item?.id === entity?.id && item.type === type)
    )
    .map((entity) => ({
      reason: getContributionMessage(entity.name, type),
      score:
        BLACKLIST.find((item) => item?.id === entity?.id && item.type === type)
          ?.score || 5,
      type: type as BlacklistItem["type"],
    }));
};

// Main scoring function
export const calculateDiddymeter = (track: TrackData): FinalScore => {
  // Collect score details and remove duplicates by `reason`
  const scoreDetails = _.uniqBy(
    [
      ...scoreEntities([track.artist], "artist"),
      ...scoreEntities(track.features, "feature"),
      ...scoreEntities(track.producers, "producer"),
      ...scoreEntities(track.labels, "label"),
      ...track.involvement.flatMap(({ type, artists }) =>
        scoreEntities(
          artists,
          (SCORE_PER_ROLE[type] ? type : "default") as BlacklistItem["type"]
        )
      ),
    ],
    "reason"
  );

  // Calculate the final score
  return {
    score: scoreDetails.reduce((acc, detail) => acc + detail.score, 0),
    score_details: scoreDetails,
  };
};

// Fallback function using Spotify data
export const calculateDiddymeterFromSpotify = (
  track: SpotifyTrackInfo
): FinalScore => {
  const [mainArtist, ...features] = track.artists;
  const scoreDetails = BLACKLIST.reduce<ScoreDetail[]>((acc, item) => {
    const isMainArtist = item.name.toLowerCase() === mainArtist.toLowerCase();
    const isFeature = features.some(
      (feature) => feature.toLowerCase() === item.name.toLowerCase()
    );

    if (isMainArtist && item.type === "artist") {
      return acc.concat({
        reason: getContributionMessage(mainArtist, "artist"),
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

  // Calculate the total score based on score details
  const finalScore = scoreDetails.reduce(
    (acc, detail) => acc + detail.score,
    0
  );

  return {
    score: finalScore,
    score_details: scoreDetails,
  };
};
