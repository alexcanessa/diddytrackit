import {
  calculateDiddymeter,
  calculateDiddymeterFromSpotify,
  FinalScore,
} from "@/lib/diddymeter";
import { getTracksInfo, SpotifyTrackInfo } from "@/lib/spotify";
import { getTrackDetailsByMetadata } from "@/lib/musicbrainz";
import { withCache } from "@/lib/cache";

export type CompleteTrackInfo = SpotifyTrackInfo & {
  score: FinalScore | null;
  error?: string;
};

const getFullTrackInfo = async (
  track: SpotifyTrackInfo
): Promise<CompleteTrackInfo | null> => {
  return withCache(`track-${track.SID}`, async () => {
    // Fetch track details by metadata only
    const trackDetailsByMetadata = await getTrackDetailsByMetadata(
      track.title,
      track.artists[0],
      track.album,
      track.release_date
    );

    // Calculate the score based on metadata details if available
    const score =
      trackDetailsByMetadata && Object.keys(trackDetailsByMetadata).length > 0
        ? calculateDiddymeter(trackDetailsByMetadata)
        : null;

    // Fallback to Spotify score if no valid score was obtained
    const finalScore =
      score && score.score > 0 ? score : calculateDiddymeterFromSpotify(track);

    return {
      ...track,
      score: finalScore,
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
        `Error fetching details for track with title ${track.title}`,
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
