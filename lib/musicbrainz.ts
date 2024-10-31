import axios from 'axios';
import { Recording, Release, TrackDetails, ProducerRelation, ReleaseDetails } from './musicbrainzTypes';

const BASE_URL = 'https://musicbrainz.org/ws/2';
const USER_AGENT = 'DiddyTrackIt/1.0 (canessa.alex@gmail.com)';
const MAX_DATE_MARGIN_DAYS = 30; // Maximum date difference in days for matching

/**
 * Calculates the absolute difference in days between two dates.
 */
function differenceInDays(date1: string, date2: string): number {
  const time1 = new Date(date1).getTime();
  const time2 = new Date(date2).getTime();
  return Math.abs((time1 - time2) / (1000 * 60 * 60 * 24));
}

/**
 * Finds the closest "Official" release to the target date within a specified margin.
 */
function findClosestOfficialRelease(releases: Release[], targetDate: string): Release | null {
  return releases.reduce<Release | null>((closestRelease, release) => {
    if (release.status !== 'Official' || !release.date) {
     return closestRelease;
    }

    if (release.date === targetDate) {
      return release;
    }

    const differenceInDaysToTarget = differenceInDays(release.date, targetDate);

    if (
      differenceInDaysToTarget <= MAX_DATE_MARGIN_DAYS &&
      (!closestRelease || differenceInDaysToTarget < differenceInDays(closestRelease.date, targetDate))
    ) {
      return release;
    }

    return closestRelease;
  }, null);
}

/**
 * Retrieves track details by ISRC, including closest release date, label, and producers.
 */
export async function getTrackDetailsByISRC(isrc: string, targetDate: string): Promise<TrackDetails> {
  // Step 1: Search for the recording by ISRC
  const recordingResponse = await axios.get<{ recordings: Recording[] }>(`${BASE_URL}/recording`, {
    headers: { 'User-Agent': USER_AGENT },
    params: { query: `isrc:${isrc}`, fmt: 'json' }
  });

  const recording = recordingResponse.data.recordings?.[0];
  if (!recording || !recording.id) throw new Error("No recording found for this ISRC.");

  const closestRelease = findClosestOfficialRelease(recording.releases || [], targetDate);
  if (!closestRelease) {
    throw new Error("No matching official release found close to the target date.");
  }

  // Step 3: Retrieve producer details from recording relations
  const recordingDetailsResponse = await axios.get<Recording>(`${BASE_URL}/recording/${recording.id}`, {
    headers: { 'User-Agent': USER_AGENT },
    params: { inc: 'artist-rels', fmt: 'json' }
  });

  const producers = recordingDetailsResponse.data.relations
    ?.filter((relation): relation is ProducerRelation => relation.type === 'producer')
    .map(({ artist: { name, id }}) => ({ id, name })) || [];

  // Step 4: Retrieve label details from the closest release
  const releaseDetailsResponse = await axios.get<ReleaseDetails>(`${BASE_URL}/release/${closestRelease.id}`, {
    headers: { 'User-Agent': USER_AGENT },
    params: { inc: 'labels+artists', fmt: 'json' }
  });
  const artist =  {
    id: releaseDetailsResponse.data["artist-credit"][0].artist.id,
    name: releaseDetailsResponse.data["artist-credit"][0].artist.name
  };
  const features = recording['artist-credit']
    .map(artist => {
      return {
        id: artist.artist.id,
        name: artist.artist.name
      };
    })
    .filter((feature => feature.id !== artist.id));
  const labels = releaseDetailsResponse.data["label-info"].map(({ label: { name, id } }) => ({ name, id })) || [];;

  return {
    title: recording.title,
    artist,
    features,
    closestReleaseDate: closestRelease.date,
    labels,
    producers,
  };
}
