import {
  calculateDiddymeter,
  calculateDiddymeterFromSpotify,
  FinalScore,
  BlacklistItem,
  ScorePerRole,
} from "@/lib/diddymeter";
import { getTracksInfo, SpotifyTrackInfo } from "@/lib/spotify";
import { getTrackDetailsByQuery } from "@/lib/musicbrainz";
import { TrackDetails } from "@/lib/musicbrainzTypes";
import { withCache } from "./cache";

export type CompleteTrackInfo = SpotifyTrackInfo & {
  score: FinalScore | null;
  error?: string;
};

const getFullTrackInfo = async (
  track: SpotifyTrackInfo & { isrc: string },
  {
    scorePerRole,
    blackList,
  }: {
    scorePerRole: ScorePerRole;
    blackList: BlacklistItem[];
  }
): Promise<CompleteTrackInfo | null> => {
  return withCache(`track-${track.SID}-${track.isrc}`, async () => {
    const trackDetails: TrackDetails | null =
      await getTrackDetailsByQuery(track);

    if (!trackDetails) {
      return {
        ...track,
        score: calculateDiddymeterFromSpotify(track, blackList),
      };
    }

    let score: FinalScore = calculateDiddymeter(
      trackDetails,
      scorePerRole,
      blackList
    );

    // Fallback to Spotify score if score is 0
    if (score.score === 0) {
      score = calculateDiddymeterFromSpotify(track, blackList);
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
  limit: number = 20,
  {
    scorePerRole,
    blackList,
  }: {
    scorePerRole: ScorePerRole;
    blackList: BlacklistItem[];
  }
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
      const completeTrackInfo = await getFullTrackInfo(
        {
          ...restOfTrack,
          isrc,
        },
        {
          scorePerRole,
          blackList,
        }
      );
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
