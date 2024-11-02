import { MaxInt, SpotifyApi, Track } from "@spotify/web-api-ts-sdk";

export type SpotifyTrackInfo = {
  title: string;
  SID: string;
  isrc?: string;
  album: string;
  release_date: string;
};

export type SpotifyTracksResponse = {
  tracks: SpotifyTrackInfo[];
  total: number;
};

type SpotifyResource = {
  type: "track" | "album" | "playlist";
  id: string;
};

const spotifyApi = SpotifyApi.withClientCredentials(
  process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
  process.env.SPOTIFY_CLIENT_SECRET!
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
    release_date: track.album.release_date,
  };
}

export async function getTracksInfo(
  spotifyUrl: string,
  page: number,
  limit: number
): Promise<SpotifyTracksResponse> {
  const spotifyResource = parseSpotifyUrl(spotifyUrl);

  if (!spotifyResource) {
    throw new Error("Invalid Spotify URL");
  }

  const spotifyApi = await initializeSpotifyApi();
  const { type, id } = spotifyResource;

  if (type === "track") {
    return {
      tracks: [mapTrackToSpotifyTrackInfo(await spotifyApi.tracks.get(id))],
      total: 1,
    };
  }

  if (type === "album") {
    throw new Error("Currently the app doesn't support albums.");
  }

  try {
    const offset = (page - 1) * limit; // Calculate offset for pagination
    const response = await spotifyApi.playlists.getPlaylistItems(
      id,
      undefined,
      undefined,
      limit as MaxInt<10>,
      offset
    );

    return {
      tracks: response.items.map((item) =>
        mapTrackToSpotifyTrackInfo(item.track)
      ),
      total: response.total, // Include the total track count from Spotify’s response
    };
  } catch (error) {
    console.error(error);
    throw new Error(
      "Failed to fetch playlist tracks. Most likely the playlist is too big. We're working on caching as much data as possible."
    );
  }
}

function parseSpotifyUrl(url: string): SpotifyResource | null {
  const regex =
    /https?:\/\/open\.spotify\.com\/(?:intl-\w+\/)?(track|album|playlist)\/([a-zA-Z0-9]+)/;
  const match = url.match(regex) || [];
  const [, type, id] = match;

  if (!(type && id)) {
    return null;
  }

  return {
    type: type as SpotifyResource["type"],
    id,
  };
}
