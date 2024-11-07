import axios from "axios";
import {
  Recording,
  Release,
  TrackDetails,
  ReleaseDetails,
  NameId,
  Label,
  Relation,
  ArtistCredit,
  Involvement,
} from "@/lib/musicbrainzTypes";
import { sleep, withLimit } from "@/lib/cache";

const BASE_URL = "https://musicbrainz.org/ws/2";
const USER_AGENT = "DiddyTrackIt/1.0 (canessa.alex@gmail.com)";

function normalizeDate(date: string): string {
  if (/^\d{4}$/.test(date)) {
    return `${date}-01-01`;
  }
  if (/^\d{4}-\d{2}$/.test(date)) {
    return `${date}-01`;
  }
  return date;
}

function differenceInDays(date1: string, date2: string): number {
  const time1 = new Date(date1).getTime();
  const time2 = new Date(date2).getTime();
  return Math.abs((time1 - time2) / (1000 * 60 * 60 * 24));
}

function findClosestRelease(
  releases: Release[],
  targetDate: string = "1989-01-01"
): Release {
  const normalizedTargetDate = normalizeDate(targetDate);

  // Attempt to find the closest official release
  const closestOfficialRelease = releases
    .filter((release) => release.status === "Official" && release.date)
    .reduce<Release | null>((closest, release) => {
      const daysDifference = differenceInDays(
        normalizeDate(release.date),
        normalizedTargetDate
      );
      return !closest ||
        daysDifference <
          differenceInDays(normalizeDate(closest.date), normalizedTargetDate)
        ? release
        : closest;
    }, null);

  // If no official release is close enough, fallback to closest release regardless of status
  const closestAnyRelease =
    closestOfficialRelease ||
    releases
      .filter((release) => release.date)
      .reduce<Release | null>((closest, release) => {
        const daysDifference = differenceInDays(
          normalizeDate(release.date),
          normalizedTargetDate
        );
        return !closest ||
          daysDifference <
            differenceInDays(normalizeDate(closest.date), normalizedTargetDate)
          ? release
          : closest;
      }, null);

  // Final fallback: return the earliest release if none found
  return (
    closestAnyRelease ||
    releases.reduce<Release>(
      (earliest, release) =>
        !earliest || normalizeDate(release.date) < normalizeDate(earliest.date)
          ? release
          : earliest,
      releases[0] // Fallback to the first release if none have dates
    )
  );
}

export type RelationsByType = Record<string, NameId[]>;

export function transformRelations(relations: Relation[]): RelationsByType {
  return relations.reduce<RelationsByType>((acc, relation) => {
    const { type, artist } = relation;

    if (!type || !artist) return acc;

    return {
      ...acc,
      [type]: [...(acc[type] || []), { name: artist.name, id: artist.id }],
    };
  }, {});
}

export async function getTrackDetailsByISRC(
  isrc: string,
  targetDate?: string
): Promise<TrackDetails | null> {
  const recording = await fetchRecordingByISRC(isrc);

  if (!recording) {
    return null;
  }

  const closestRelease = findClosestRelease(
    recording.releases || [],
    targetDate
  );

  const { transformedRelations } = await fetchRecordingDetails(recording.id);
  const { artist, features, labels } = await fetchReleaseDetails(
    closestRelease.id,
    recording["artist-credit"]
  );

  const producers = transformedRelations["producer"] || [];
  const involvement: Involvement[] = Object.entries(transformedRelations)
    .filter(([type]) => type !== "producer")
    .map(([type, artists]) => ({ type, artists }));

  return {
    title: recording.title,
    artist,
    features,
    closestReleaseDate: closestRelease.date,
    labels,
    producers,
    involvement,
  };
}

const MAX_ATTEMPTS = 3;
const RETRY_DELAY = 2000;

async function fetchRecordingByISRC(
  isrc: string,
  attempt: number = 1
): Promise<Recording | null> {
  return withLimit<Recording | null>(async () => {
    try {
      const response = await axios.get<{ recordings: Recording[] }>(
        `${BASE_URL}/recording`,
        {
          headers: { "User-Agent": USER_AGENT },
          params: { query: `isrc:${isrc}`, fmt: "json" },
        }
      );
      return response.data.recordings?.[0] || null;
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 503 &&
        attempt < MAX_ATTEMPTS
      ) {
        await sleep(RETRY_DELAY * Math.pow(2, attempt - 1));
        return fetchRecordingByISRC(isrc, attempt + 1);
      }

      throw new Error("Failed to fetch recording by ISRC " + isrc);
    }
  });
}

type FetchRecordingDetails = {
  transformedRelations: RelationsByType;
  producers: NameId[];
};

async function fetchRecordingDetails(
  recordingId: string
): Promise<FetchRecordingDetails> {
  return withLimit<FetchRecordingDetails>(async () => {
    const response = await axios.get<Recording>(
      `${BASE_URL}/recording/${recordingId}`,
      {
        headers: { "User-Agent": USER_AGENT },
        params: { inc: "artist-rels", fmt: "json" },
      }
    );

    const relations = response.data.relations || [];
    const transformedRelations = transformRelations(relations);
    const producers = extractProducers(relations);

    return { transformedRelations, producers };
  });
}

type FetchReleaseDetails = {
  artist: NameId;
  features: NameId[];
  labels: Label[];
};

async function fetchReleaseDetails(
  releaseId: string,
  artistCredit: ArtistCredit[]
): Promise<FetchReleaseDetails> {
  return withLimit<FetchReleaseDetails>(async () => {
    const response = await axios.get<ReleaseDetails>(
      `${BASE_URL}/release/${releaseId}`,
      {
        headers: { "User-Agent": USER_AGENT },
        params: { inc: "labels+artists", fmt: "json" },
      }
    );

    const artist = {
      id: response.data["artist-credit"][0].artist?.id || "Not found",
      name: response.data["artist-credit"][0].artist?.name || "Not found",
    };

    const features = extractFeatures(artistCredit, artist.id);
    const labels =
      response.data["label-info"].map(({ label: { name, id } }) => ({
        name,
        id,
      })) || [];

    return { artist, features, labels };
  });
}

function extractProducers(relations: Relation[]): NameId[] {
  return (
    relations
      .filter((relation): relation is Relation => relation.type === "producer")
      .map(({ artist: { name, id } }) => ({ id, name })) || []
  );
}

function extractFeatures(
  artistCredit: ArtistCredit[],
  mainArtistId: string
): NameId[] {
  return artistCredit
    .map(({ artist }) => ({ id: artist.id, name: artist.name }))
    .filter((feature) => feature.id !== mainArtistId);
}

// A utility function to process the ISRCs with batching
export async function processISRCsInBatches(
  isrcs: string[],
  targetDates: string[]
): Promise<(TrackDetails | null)[]> {
  const results: (TrackDetails | null)[] = [];

  for (let i = 0; i < isrcs.length; i++) {
    const trackDetails = await getTrackDetailsByISRC(isrcs[i], targetDates[i]);
    results.push(trackDetails);
  }

  return results;
}
