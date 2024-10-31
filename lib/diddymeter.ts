import { CompleteTrackInfo } from "./trackinfo";

type Entity = {
  id: string;
  name: string;
};

type TrackData = CompleteTrackInfo;

type BlacklistItem = Entity & {
  type: "artist" | "producer" | "label" | "feature";
  score: number;
};

type ScoreDetail = {
  reason: string;
  score: number;
};

export type FinalScore = {
  score: number;
  score_details: ScoreDetail[];
};

export const SCORE_PER_ROLE: Record<string, number> = {
  artist: 50,    // Primary contributor, highest royalty
  label: 25,     // Significant share as rightsholder
  producer: 10,  // Minor share, but important
  feature: 15,   // Lower royalty share than main artist
};

// Combined blacklist
const BLACKLIST: BlacklistItem[] = [
  { id: "635b9d63-05c1-46ff-a577-0ce030e6e84b", name: "Bad Boy Entertainment", type: "label", score: SCORE_PER_ROLE.label },
  { id: "cabb4fcf-4067-4ba5-908d-76ee66fcf0c6", name: "Diddy", type: "artist", score: SCORE_PER_ROLE.artist },
  { id: "cabb4fcf-4067-4ba5-908d-76ee66fcf0c6", name: "Diddy", type: "feature", score: SCORE_PER_ROLE.feature },
  { id: "cabb4fcf-4067-4ba5-908d-76ee66fcf0c6", name: "Diddy", type: "producer", score: SCORE_PER_ROLE.producer },
];

// Message templates for each type
const MESSAGE_TEMPLATES: Record<BlacklistItem["type"], (name: string) => string> = {
  artist: name => `${name} is the main artist`,
  feature: name => `${name} is featuring on the track`,
  producer: name => `${name} produced the track`,
  label: name => `The track is under ${name}`
};

// General function to check and score
const checkAndScore = (
  entities: Entity[],
  blacklistType: BlacklistItem["type"]
): ScoreDetail[] => {
  return entities
      .filter(entity => BLACKLIST.some(item => item.id === entity.id && item.type === blacklistType))
      .map(matchedEntity => {
          const { name, score } = BLACKLIST.find(item => item.id === matchedEntity.id && item.type === blacklistType)!;
          return {
              reason: MESSAGE_TEMPLATES[blacklistType](name),
              score
          };
      });
};

export const calculateDiddymeter = (track: TrackData): FinalScore => {
  const scoreDetails: ScoreDetail[] = [
      ...checkAndScore([track.artist], "artist"),
      ...checkAndScore(track.features, "feature"),
      ...checkAndScore(track.producers, "producer"),
      ...checkAndScore(track.labels, "label")
  ];

  return {
      score: scoreDetails.reduce((acc, detail) => acc + detail.score, 0),
      score_details: scoreDetails
  };
};
