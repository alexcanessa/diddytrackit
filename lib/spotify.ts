import { SpotifyApi, Track } from '@spotify/web-api-ts-sdk';

if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
  throw new Error("SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in the environment.");
}

export type SpotifyTrackInfo = {
  title: string;
  SID: string;
  isrc?: string;
  album: string;
  release_date: string;
};

type SpotifyResource = {
  type: 'track' | 'album' | 'playlist';
  id: string;
};

const spotifyApi = SpotifyApi.withClientCredentials(
  process.env.SPOTIFY_CLIENT_ID,
  process.env.SPOTIFY_CLIENT_SECRET
);

async function initializeSpotifyApi() {
  const token = await spotifyApi.getAccessToken();
  if (!token) {
    try {
      await spotifyApi.authenticate();
    } catch (error) {
      throw new Error("Spotify API token refresh failed.\n\n" + error);
    }
  }
  return spotifyApi;
}

function mapTrackToSpotifyTrackInfo(track: Track): SpotifyTrackInfo {
  return {
    title: track.name,
    SID: track.id,
    isrc: track.external_ids?.isrc,
    album: track.album.name,
    release_date: track.album.release_date
  };
}

async function getTracksInfo(spotifyUrl: string): Promise<SpotifyTrackInfo[]> {
  const spotifyResource = parseSpotifyUrl(spotifyUrl);

  if (!spotifyResource) {
    throw new Error("Invalid Spotify URL");
  }

  const spotifyApi = await initializeSpotifyApi();
  const { type, id } = spotifyResource;

  if (type === "album") {
    throw new Error("Currently the app doesn't support albums");
  }

  if (type === "track") {
    return [mapTrackToSpotifyTrackInfo(await spotifyApi.tracks.get(id))];
  }

  const response = await spotifyApi.playlists.getPlaylistItems(id);

  if (response.total > response.limit) {
    // @todo: should really handle pagination 🙄.
    throw new Error("Playlist or album is too large to fetch all tracks.");
  }

  return response.items.map(item => {
    return mapTrackToSpotifyTrackInfo(item.track);
  });
}

function parseSpotifyUrl(url: string): SpotifyResource | null {
  const regex = /https?:\/\/open\.spotify\.com\/(?:intl-\w+\/)?(track|album|playlist)\/([a-zA-Z0-9]+)/;
  const match = url.match(regex) || [];
  const [, type, id] = match;

  if (!(type && id)) {
    return null;
  }
  
  return {
    type: type as SpotifyResource['type'],
    id,
  };
}

export { getTracksInfo };
