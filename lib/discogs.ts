import axios from "axios";
import { withCacheAndLimit } from "./cache";

const DISCOGS_API_URL = "https://api.discogs.com/database/search";
const DISCOGS_RELEASE_URL = "https://api.discogs.com/releases";
const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN!;

export interface DiscogsTrackDetails {
  id: number;
  title: string;
  artist: { id: number; name: string };
  album: string;
  year: string | null;
  labels: { id: number; name: string }[];
  contributors: { id: number; name: string; role: string }[];
}

interface DiscogsSearchResult {
  id: number;
  title: string;
  year?: string;
  label?: string[];
  type: string;
  resource_url: string;
}

interface DiscogsSearchResponse {
  results: DiscogsSearchResult[];
}

interface DiscogsReleaseResponse {
  title: string;
  year: string | null;
  artists: { id: number; name: string }[];
  labels: { id: number; name: string }[];
  extraartists: { id: number; name: string; role: string }[];
}

function normalizeQuery(query: string): string {
  return query.replace(/\(.*?$/g, "").trim();
}

export async function fetchDiscogsRelease(
  title: string,
  artist: string,
  album?: string,
  year?: string
): Promise<DiscogsTrackDetails | null> {
  const normalizedTitle = normalizeQuery(title);
  const queryParams = new URLSearchParams({
    token: DISCOGS_TOKEN,
    track: normalizedTitle,
    artist: "B.I.G.",
    // release_title: album || "",
    // year: year || "",
    type: "release",
  });

  const url = `${DISCOGS_API_URL}?${queryParams.toString()}`;

  const searchResponse = await withCacheAndLimit<DiscogsSearchResponse>(
    `discogs-${normalizedTitle}-${artist}-${album}-${year}`,
    async () => {
      const result = await axios.get<DiscogsSearchResponse>(url);
      return result.data;
    }
  );

  if (searchResponse.results.length === 0) {
    return null; // No match found
  }

  // Get the best match (first result) and fetch detailed release info
  const bestMatch = searchResponse.results[0];
  const releaseUrl = `${DISCOGS_RELEASE_URL}/${bestMatch.id}`;

  const releaseResponse = await withCacheAndLimit<DiscogsReleaseResponse>(
    `discogs-release-${bestMatch.id}`,
    async () => {
      const result = await axios.get<DiscogsReleaseResponse>(releaseUrl, {
        headers: { Authorization: `Discogs token ${DISCOGS_TOKEN}` },
      });
      return result.data;
    }
  );

  console.log("====================================");
  console.log(releaseResponse);
  console.log("====================================");

  // Map release data to DiscogsTrackDetails structure
  return {
    id: bestMatch.id,
    title: releaseResponse.title,
    artist: releaseResponse.artists[0], // Use the main artist
    album: album || "Unknown Album",
    year: releaseResponse.year,
    labels: releaseResponse.labels.map((label) => ({
      id: label.id,
      name: label.name,
    })),
    contributors: releaseResponse.extraartists.map((artist) => ({
      id: artist.id,
      name: artist.name,
      role: artist.role,
    })),
  };
}
