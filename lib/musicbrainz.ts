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
  if (/^\d{4}$/.test(date)) return `${date}-01-01`;
  if (/^\d{4}-\d{2}$/.test(date)) return `${date}-01`;
  return date;
}

function differenceInDays(date1: string, date2: string): number {
  const time1 = new Date(date1).getTime();
  const time2 = new Date(date2).getTime();
  return Math.abs((time1 - time2) / (1000 * 60 * 60 * 24));
}

interface EnhancedRelease extends Release {
  "artist-credit"?: ArtistCredit[];
  title?: string;
  releases?: Release[];
}

function findClosestRelease(
  releases: EnhancedRelease[] | undefined,
  targetAlbum?: string,
  targetDate: string = "1989-03-20"
): EnhancedRelease | null {
  if (!releases || releases.length === 0) return null; // Check for undefined or empty array

  const normalizedTargetDate = normalizeDate(targetDate);
  let relevantReleases = null;

  // Filter releases that match the target album name
  if (targetAlbum) {
    const normalizedTargetAlbum = targetAlbum.toLowerCase();
    const matchingAlbumReleases = releases.filter(
      (release) => release.title?.toLowerCase() === normalizedTargetAlbum
    );

    // If there are matching album releases, find the closest by date
    relevantReleases = matchingAlbumReleases.length
      ? matchingAlbumReleases
      : releases; // Fallback to all releases if no exact match
  }

  return (relevantReleases || releases).reduce<EnhancedRelease | null>(
    (closest, release) => {
      const daysDifference = differenceInDays(
        normalizeDate(release.date || ""),
        normalizedTargetDate
      );
      return !closest ||
        daysDifference <
          differenceInDays(
            normalizeDate(closest.date || ""),
            normalizedTargetDate
          )
        ? release
        : closest;
    },
    null
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

export async function getTrackDetailsByMetadata(
  title: string,
  artist: string,
  album?: string,
  targetDate?: string
): Promise<TrackDetails | null> {
  const query = `recording:"${normalizeQueryItem(title)}" AND artist:"${artist}"${album ? ` AND release:"${album}"` : ""}`;
  const recording = await fetchRecordingByMetadata(query);

  if (!recording) {
    return null;
  }

  const closestRelease = findClosestRelease(
    (recording.releases as EnhancedRelease[]) || [],
    album,
    targetDate
  );
  if (!closestRelease) return null;

  const { transformedRelations } = await fetchRecordingDetails(recording.id);
  const {
    artist: mainArtist,
    features,
    labels,
  } = await fetchReleaseDetails(
    closestRelease.id,
    recording["artist-credit"] || []
  );

  const producers = transformedRelations["producer"] || [];
  const involvement: Involvement[] = Object.entries(transformedRelations)
    .filter(([type]) => type !== "producer")
    .map(([type, artists]) => ({ type, artists }));

  return {
    title: recording.title || "",
    artist: mainArtist,
    features,
    closestReleaseDate: closestRelease.date,
    labels,
    producers,
    involvement,
  };
}

const normalizeQueryItem = (title: string): string => {
  return title.replace(/[(-].*?$/g, "").trim();
};

const MAX_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        const retryAfter = error.response.headers["retry-after"];
        const delay = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : RETRY_DELAY;
        console.warn(
          `Rate limit exceeded. Retrying in ${delay / 1000} seconds...`
        );
        await sleep(delay);
        return fetchRecordingByISRC(isrc, attempt + 1);
      }
      throw new Error("Failed to fetch recording by ISRC " + isrc);
    }
  });
}

async function fetchRecordingByMetadata(
  query: string
): Promise<Recording | null> {
  return withLimit<Recording | null>(async () => {
    const response = await axios.get<{ recordings: Recording[] }>(
      `${BASE_URL}/recording`,
      {
        headers: { "User-Agent": USER_AGENT },
        params: { query, fmt: "json" },
      }
    );

    return response.data.recordings?.[0] || null;
  });
}

type FetchRecordingDetails = {
  transformedRelations: RelationsByType;
  producers: NameId[];
};

async function fetchRecordingDetails(
  recordingId: string
): Promise<FetchRecordingDetails> {
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
  const response = await axios.get<ReleaseDetails>(
    `${BASE_URL}/release/${releaseId}`,
    {
      headers: { "User-Agent": USER_AGENT },
      params: { inc: "labels+artists", fmt: "json" },
    }
  );

  const artist = {
    id: response.data["artist-credit"]?.[0]?.artist?.id || "Not found",
    name: response.data["artist-credit"]?.[0]?.artist?.name || "Not found",
  };
  const features = extractFeatures(artistCredit, artist.id);
  const labels =
    response.data["label-info"].map(({ label: { name, id } }) => ({
      name,
      id,
    })) || [];

  return { artist, features, labels };
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
