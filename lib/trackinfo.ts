import { calculateDiddymeter, FinalScore } from "@/lib/diddymeter";
import { getTracksInfo, SpotifyTrackInfo } from '@/lib/spotify';
import { getTrackDetailsByISRC, } from '@/lib/musicbrainz';
import { Label, NameId, TrackDetails } from '@/lib/musicbrainzTypes';

export type CompleteTrackInfo = SpotifyTrackInfo & {
  score: FinalScore;
};

export async function getCompleteTracksInfo(spotifyUrl: string): Promise<(CompleteTrackInfo | null)[]> {
  const tracksInfo = await getTracksInfo(spotifyUrl);
  const completeTracksInfo: (CompleteTrackInfo | null)[] = [];

  for (let track of tracksInfo) {
    if (!track.isrc || !track.release_date) {
      continue;
    }

    
    try {
      const trackDetails: TrackDetails | null = await getTrackDetailsByISRC(track.isrc, track.release_date);
      
      if (!trackDetails) {
        continue;
      }
      
      const score = calculateDiddymeter(trackDetails);
      
      completeTracksInfo.push({
        ...track,
        // ...trackDetails,
        score
      });
    } catch (error) {
      console.error(`Error fetching details for track with ISRC ${track.isrc}:`, error);
      continue;
    }
  }

  return completeTracksInfo;
}
