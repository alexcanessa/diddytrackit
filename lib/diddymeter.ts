import { TrackDetails } from "./musicbrainzTypes";
import { SpotifyTrackInfo } from "./spotify";

type Entity = {
  id: string;
  name: string;
};

type TrackData = TrackDetails;

export type BlacklistItem = Entity & {
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

export type ScorePerRole = Record<BlacklistItem["type"], number>;

type MessageTemplate = (name: string, type: string) => string;
type ContributionType =
  | "artist"
  | "producer"
  | "composer"
  | "mix"
  | "vocal"
  | "feature"
  | "label"
  | "default";

const typeToMessage: Record<ContributionType, MessageTemplate> = {
  artist: (name) => `${name} is the main artist of this track`,
  feature: (name) => `${name} is featured on this track`,
  producer: (name) => `${name} produced this track`,
  label: (name) => `This track is released under ${name}`,
  mix: (name) => `${name} mixed this track`,
  vocal: (name) => `${name} sang on this track`,
  composer: (name) => `${name} composed the music for this track`,
  default: (name) => `${name} contributed to this track`,
};

const defaultMessage: MessageTemplate = (name, type) =>
  `${name} contributed as ${type}`;

function getContributionMessage(name: string, type: ContributionType): string {
  return (typeToMessage[type] || defaultMessage)(name, type);
}

// Reusable function to check and score based on type
const scoreEntities = (
  entities: Entity[],
  type: ContributionType,
  scorePerRole: ScorePerRole,
  blackList: BlacklistItem[]
): ScoreDetail[] => {
  return entities
    .filter((entity) =>
      blackList.some((item) => item.id === entity.id && item.type === type)
    )
    .map((entity) => {
      const blacklistItem = blackList.find(
        (item) => item.id === entity.id && item.type === type
      );
      return {
        reason: getContributionMessage(
          blacklistItem?.name ?? entity.name,
          type
        ),
        score: blacklistItem?.score ?? scorePerRole.default,
        type: type,
      };
    });
};

// Main scoring function, handling known types and default cases
export const calculateDiddymeter = (
  track: TrackData,
  scorePerRole: ScorePerRole,
  blackList: BlacklistItem[]
): FinalScore => {
  const scoreDetails: ScoreDetail[] = [
    ...scoreEntities([track.artist], "artist", scorePerRole, blackList),
    ...scoreEntities(track.features, "feature", scorePerRole, blackList),
    ...scoreEntities(track.producers, "producer", scorePerRole, blackList),
    ...scoreEntities(track.labels, "label", scorePerRole, blackList),
    ...track.involvement.flatMap(({ type, artists }) =>
      scoreEntities(
        artists,
        (type in scorePerRole ? type : "default") as ContributionType,
        scorePerRole,
        blackList
      )
    ),
  ];

  return {
    score: scoreDetails.reduce((acc, detail) => acc + detail.score, 0),
    score_details: scoreDetails,
  };
};

export const calculateDiddymeterFromSpotify = (
  track: SpotifyTrackInfo,
  blackList: BlacklistItem[]
): FinalScore => {
  const [mainArtist, ...features] = track.artists;
  const scoreDetails = blackList.reduce<ScoreDetail[]>((acc, item) => {
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
