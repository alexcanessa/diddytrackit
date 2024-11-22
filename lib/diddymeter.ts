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
  {
    id: "b7cf4746-d8b8-4f15-a76f-a2745e860825",
    name: "Janice Combs Publishing, Inc.",
    type: "label",
    score: SCORE_PER_ROLE.label,
  },
  {
    id: "c2d25856-a09a-4d15-b404-77dd19c19e63",
    name: "R. Kelly",
    type: "artist",
    score: SCORE_PER_ROLE.artist,
  },
  {
    id: "c234fa42-e6a6-443e-937e-2f4b073538a3",
    name: "Chris Brown",
    type: "artist",
    score: SCORE_PER_ROLE.artist,
  },
  {
    id: "2282c539-05a2-477c-82b7-fe40798d37f3",
    name: "Tekashi 6ix9ine",
    type: "artist",
    score: SCORE_PER_ROLE.artist,
  },
  {
    id: "2c1f05d8-987e-4e43-987c-aa9bdc265f8c",
    name: "Ian Watkins (Lostprophets)",
    type: "artist",
    score: SCORE_PER_ROLE.artist,
  },
  {
    id: "5e05d900-51e0-4dda-81e2-f4c0bd7ed5e6",
    name: "Gary Glitter",
    type: "artist",
    score: SCORE_PER_ROLE.artist,
  },
  {
    id: "e7b587f7-e678-47c1-81dd-e7bb7855b0f9",
    name: "Phil Spector",
    type: "artist",
    score: SCORE_PER_ROLE.artist,
  },
  {
    id: "637504e3-be95-4005-83ee-3ebb91f9fcf9",
    name: "Sid Vicious",
    type: "artist",
    score: SCORE_PER_ROLE.artist,
  },
  {
    id: "2787bddf-6439-4c73-8162-5f4a1e5fa030",
    name: "Boy George",
    type: "artist",
    score: SCORE_PER_ROLE.artist,
  },
  {
    id: "31424ace-6e99-4322-8ef8-66dafa32cfac",
    name: "The Pied Piper",
    type: "artist",
    score: SCORE_PER_ROLE.artist,
  },
  {
    id: "f1d83aa8-7830-4aa6-906f-ac19d8862155",
    name: "R. Kelly Publishing Inc.",
    type: "label",
    score: SCORE_PER_ROLE.label,
  },
  {
    id: "ef6e2e49-aa93-41bd-89b0-8c7d2f260a83",
    name: "Lostprophets",
    type: "artist",
    score: SCORE_PER_ROLE.artist,
  },
  {
    id: "d11ea68a-59ed-484a-976c-24eba358280e",
    name: "Philles Records",
    type: "label",
    score: SCORE_PER_ROLE.label,
  },
  {
    id: "e5db18cb-4b1f-496d-a308-548b611090d3",
    name: "Sex Pistols",
    type: "artist",
    score: SCORE_PER_ROLE.artist,
  },
  {
    id: "81435053-e1a2-48a4-adfd-e89f310c7b38",
    name: "Culture Club",
    type: "artist",
    score: SCORE_PER_ROLE.artist,
  },
];

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
  type: ContributionType
): ScoreDetail[] => {
  return entities
    .filter((entity) =>
      BLACKLIST.some((item) => item.id === entity.id && item.type === type)
    )
    .map((entity) => {
      const blacklistItem = BLACKLIST.find(
        (item) => item.id === entity.id && item.type === type
      );
      return {
        reason: getContributionMessage(
          blacklistItem?.name ?? entity.name,
          type
        ),
        score: blacklistItem?.score ?? SCORE_PER_ROLE.default,
        type: type,
      };
    });
};

// Main scoring function, handling known types and default cases
export const calculateDiddymeter = (track: TrackData): FinalScore => {
  const scoreDetails: ScoreDetail[] = [
    ...scoreEntities([track.artist], "artist"),
    ...scoreEntities(track.features, "feature"),
    ...scoreEntities(track.producers, "producer"),
    ...scoreEntities(track.labels, "label"),
    ...track.involvement.flatMap(({ type, artists }) =>
      scoreEntities(
        artists,
        (SCORE_PER_ROLE[type] ? type : "default") as ContributionType
      )
    ),
  ];

  return {
    score: scoreDetails.reduce((acc, detail) => acc + detail.score, 0),
    score_details: scoreDetails,
  };
};

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
