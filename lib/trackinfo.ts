import {
  calculateDiddymeter,
  calculateDiddymeterFromSpotify,
  FinalScore,
} from "@/lib/diddymeter";
import { getTracksInfo, SpotifyTrackInfo } from "@/lib/spotify";
import { getTrackDetailsByISRC } from "@/lib/musicbrainz";
import { TrackDetails } from "@/lib/musicbrainzTypes";
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
  track: SpotifyTrackInfo & { isrc: string }
): Promise<CompleteTrackInfo | null> => {
  return withCache(`track-${track.SID}-${track.isrc}`, async () => {
    const trackDetails: TrackDetails | null = await getTrackDetailsByISRC(
      track.isrc,
      track.release_date
    );

    if (!trackDetails) {
      return {
        ...track,
        score: calculateDiddymeterFromSpotify(track),
      };
    }

    const isTitleMatch = isCloseMatch(track.title, trackDetails.title);
    const isArtistMatch = trackDetails.artist
      ? isCloseMatch(track.artists[0], trackDetails.artist.name)
      : false;

    let score: FinalScore =
      isTitleMatch && isArtistMatch
        ? calculateDiddymeter(trackDetails)
        : { score: 0, score_details: [] }; // Set score to 0 if matches are not close

    // Fallback to Spotify score if score is 0
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
    const { isrc, ...restOfTrack } = track;

    if (!isrc) {
      continue;
    }

    try {
      const completeTrackInfo = await getFullTrackInfo({
        ...restOfTrack,
        isrc,
      });
      completeTracksInfo.push(completeTrackInfo);
    } catch {
      console.error(`Error fetching details for track with ISRC ${track.isrc}`);
      completeTracksInfo.push({
        ...track,
        score: null,
        error: "Error fetching details",
      });
    }
  }

  return { tracks: completeTracksInfo, total };
}
