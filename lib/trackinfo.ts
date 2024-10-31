import { calculateDiddymeter } from "@/lib/diddymeter";
import { getTracksInfo, SpotifyTrackInfo } from '@/lib/spotify';
import { getTrackDetailsByISRC } from '@/lib/musicbrainz';
import { Label, NameId, TrackDetails } from '@/lib/musicbrainzTypes';

export type CompleteTrackInfo = SpotifyTrackInfo & {
  artist: NameId;
  features: NameId[];
  producers: NameId[];
  labels: Label[];
  closestReleaseDate?: string;
};

/**
 * Retrieves complete track information, including producers and label if available
 * @param spotifyUrl - Spotify URL for the track
 * @returns Array of complete track information with optional producers and label
 */
export async function getCompleteTracksInfo(spotifyUrl: string): Promise<(CompleteTrackInfo | null)[]> {
  const tracksInfo = await getTracksInfo(spotifyUrl);

  return Promise.all(
    tracksInfo.map(async (track) => {
      if (!track.isrc || !track.release_date) {
        return null;
      }

      try {
        const { producers, labels, closestReleaseDate, artist, features }: TrackDetails = await getTrackDetailsByISRC(track.isrc, track.release_date);

        const completeTrack: CompleteTrackInfo = {
          ...track,
          artist,
          features,
          producers,
          labels,
          closestReleaseDate
        };

        return {
          ...completeTrack,
          score: calculateDiddymeter(completeTrack)
        }
      } catch (error) {
        console.error(`Error fetching details for track with ISRC ${track.isrc}:`, error);
        return null;
      }
    })
  );
}
