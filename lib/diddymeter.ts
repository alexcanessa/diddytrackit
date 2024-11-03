import { TrackDetails } from "./musicbrainzTypes";

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

// Consolidated blacklist with roles and scores
const BLACKLIST: BlacklistItem[] = [
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
