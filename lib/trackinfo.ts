import {
  calculateDiddymeter,
  calculateDiddymeterFromSpotify,
  FinalScore,
} from "@/lib/diddymeter";
import { getTracksInfo, SpotifyTrackInfo } from "@/lib/spotify";
import { fetchDiscogsRelease, DiscogsTrackDetails } from "@/lib/discogs";
import { withCache } from "./cache";

export type CompleteTrackInfo = SpotifyTrackInfo & {
  score: FinalScore | null;
  error?: string;
};

const isCloseMatch = (title1: string, title2: string): boolean => {
  const normalizedTitle1 = title1.toLowerCase();
  const normalizedTitle2 = title2.toLowerCase();

  return (
    normalizedTitle1.includes(normalizedTitle2) ||
    normalizedTitle2.includes(normalizedTitle1)
  );
};

const getFullTrackInfo = async (
  track: SpotifyTrackInfo
): Promise<CompleteTrackInfo | null> => {
  return withCache(`track-${track.SID}`, async () => {
    // Query Discogs using track title, main artist, and album name
    const queryTitle = `${track.title} ${track.artists.join(" ")}`;
    const trackDetails: DiscogsTrackDetails[] = await fetchDiscogsRelease(
      queryTitle,
      track.artists[0], // Main artist for more accurate matching
      track.album, // Album name if available
      track.release_date?.split("-")[0] // Year if available
    );

    // If no details are returned, fall back to Spotify-only scoring
    if (!trackDetails || trackDetails.length === 0) {
      return {
        ...track,
        score: calculateDiddymeterFromSpotify(track),
      };
    }

    // Find the best match from Discogs results
    const bestMatch = trackDetails.find(
      (detail) =>
        isCloseMatch(track.title, detail.title) &&
        isCloseMatch(track.artists[0], detail.artist.name)
    );

    // Calculate the score based on the best matching Discogs details
    let score: FinalScore = bestMatch
      ? calculateDiddymeter(bestMatch)
      : { score: 0, score_details: [] };

    // If the score is 0, fall back to Spotify-only score calculation
    if (score.score === 0) {
      score = calculateDiddymeterFromSpotify(track);
    }

    return {
      ...track,
      score,
    };
  });
};

export async function getCompleteTracksInfo(
  spotifyUrl: string,
  page: number = 1,
  limit: number = 20
): Promise<{ tracks: (CompleteTrackInfo | null)[]; total: number }> {
  const { tracks: tracksInfo, total } = await getTracksInfo(
    spotifyUrl,
    page,
    limit
  );

  const completeTracksInfo: (CompleteTrackInfo | null)[] = [];

  for (const track of tracksInfo) {
    try {
      const completeTrackInfo = await getFullTrackInfo(track);
      completeTracksInfo.push(completeTrackInfo);
    } catch (error) {
      console.error(
        `Error fetching details for track with SID ${track.SID}:`,
        error
      );
      completeTracksInfo.push({
        ...track,
        score: null,
        error: "Error fetching details",
      });
    }
  }

  return { tracks: completeTracksInfo, total };
}
