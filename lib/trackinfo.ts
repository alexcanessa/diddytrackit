import { calculateDiddymeter, FinalScore } from "@/lib/diddymeter";
import { getTracksInfo, SpotifyTrackInfo } from "@/lib/spotify";
import { getTrackDetailsByISRC } from "@/lib/musicbrainz";
import { TrackDetails } from "@/lib/musicbrainzTypes";

export type CompleteTrackInfo = SpotifyTrackInfo & {
  score: FinalScore;
};

export async function getCompleteTracksInfo(
  spotifyUrl: string,
  page: number = 1,
  limit: number = 20
): Promise<{ tracks: (CompleteTrackInfo | null)[]; total: number }> {
  // Fetch paginated tracks and total count from Spotify
  const { tracks: tracksInfo, total } = await getTracksInfo(
    spotifyUrl,
    page,
    limit
  );
  const completeTracksInfo: (CompleteTrackInfo | null)[] = [];

  for (const track of tracksInfo) {
    if (!track.isrc || !track.release_date) {
      continue;
    }

    try {
      const trackDetails: TrackDetails | null = await getTrackDetailsByISRC(
        track.isrc,
        track.release_date
      );

      if (!trackDetails) {
        continue;
      }

      const score = calculateDiddymeter(trackDetails);

      completeTracksInfo.push({
        ...track,
        score,
      });
    } catch (error) {
      console.error(
        `Error fetching details for track with ISRC ${track.isrc}:`,
        error
      );
      continue;
    }
  }

  return { tracks: completeTracksInfo, total };
}
