"use client";

import { FinalScore } from "@/lib/diddymeter";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";

interface Track {
  title: string;
  artist: string;
  album: string;
  isPlaying: boolean;
  isrc: string;
  score: FinalScore | null;
}

interface SpotifyContextProps {
  userId: string | null;
  accessToken: string | null;
  profilePic: string | null;
  currentlyPlaying: Track | null;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
}

const CURRENTLY_PLAYING_POLL_INTERVAL = 5000;

const SpotifyContext = createContext<SpotifyContextProps | undefined>(
  undefined
);

export const SpotifyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<Track | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [lastCheckedISRC, setLastCheckedISRC] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "code";
  const SCOPES = [
    "user-read-currently-playing",
    "user-read-playback-state",
    "user-read-email",
    "user-read-private",
  ];

  const fetchDiddyScore = useCallback(async (spotifyUrl: string) => {
    try {
      const response = await fetch(`/api/diddymeter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ spotifyUrl }),
      });
      const data = await response.json();

      return {
        score: data.tracks[0].score,
      };
    } catch (error) {
      console.error("Error fetching Diddy score:", error);
      return null;
    }
  }, []);

  const fetchCurrentlyPlaying = useCallback(async () => {
    if (!accessToken) return;

    try {
      const response = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.status === 403) {
        toast.error("Access denied. Please log in again.");
        logout();
        return;
      }

      if (!response.ok) {
        toast.warn("Unable to fetch currently playing track.");
        setCurrentlyPlaying(null);
        return;
      }

      const text = await response.text();

      if (!text) {
        setCurrentlyPlaying(null);
        return;
      }

      const data = JSON.parse(text);

      if (!data.item) {
        setCurrentlyPlaying(null);
        return;
      }

      const {
        name,
        artists,
        album,
        is_playing,
        external_ids,
        external_urls: { spotify: href },
      } = data.item;

      if (external_ids?.isrc === lastCheckedISRC) {
        return;
      }

      const diddyScore = await fetchDiddyScore(href);

      setCurrentlyPlaying({
        title: name,
        artist: artists[0].name,
        album: album.name,
        isPlaying: is_playing,
        isrc: external_ids.isrc,
        score: diddyScore?.score,
      });
      setLastCheckedISRC(external_ids.isrc || null);
    } catch (error) {
      console.error("Error fetching currently playing track:", error);
      toast.error(
        "An error occurred while fetching the currently playing track."
      );
    }
  }, [accessToken, fetchDiddyScore, lastCheckedISRC]);

  const login = () => {
    const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI || ""
    )}&response_type=${RESPONSE_TYPE}&scope=${SCOPES.join("%20")}`;
    window.location.href = authUrl;
  };

  const logout = () => {
    localStorage.removeItem("spotifyAuthCode");
    localStorage.removeItem("spotifyUserId");
    localStorage.removeItem("spotifyAccessToken");
    setUserId(null);
    setAccessToken(null);
    setCurrentlyPlaying(null);
    setProfilePic(null);
    window.location.href = "/";
  };

  useEffect(() => {
    if (accessToken) {
      fetchCurrentlyPlaying();
      const interval = setInterval(
        fetchCurrentlyPlaying,
        CURRENTLY_PLAYING_POLL_INTERVAL
      );

      return () => clearInterval(interval);
    }
  }, [accessToken, fetchCurrentlyPlaying]);

  // Fetch user profile picture and display welcome message
  useEffect(() => {
    if (accessToken) {
      const fetchUserProfile = async () => {
        try {
          const response = await fetch("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (response.ok) {
            const data = await response.json();
            setUserId(data.id);
            setProfilePic(data.images[0]?.url || null);
            toast.success(
              `Welcome ${data.display_name}! Now you can play songs in Spotify and check their score here.`
            );
          } else {
            setProfilePic(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          toast.error("An error occurred while fetching your profile.");
        }
      };
      fetchUserProfile();
    }
  }, [accessToken]);

  useEffect(() => {
    setIsLoading(true);
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get("code");

    if (authCode) {
      localStorage.setItem("spotifyAuthCode", authCode);

      fetch("/api/spotify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: authCode }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user_id && data.access_token) {
            setUserId(data.user_id);
            setAccessToken(data.access_token);
            localStorage.setItem("spotifyUserId", data.user_id);
            localStorage.setItem("spotifyAccessToken", data.access_token);
            window.history.replaceState({}, document.title, "/");
          }
        })
        .catch((error) =>
          console.error("Spotify authentication failed:", error)
        );
    } else {
      setUserId(localStorage.getItem("spotifyUserId"));
      setAccessToken(localStorage.getItem("spotifyAccessToken"));
    }

    setIsLoading(false);
  }, []);

  return (
    <SpotifyContext.Provider
      value={{
        isLoading,
        userId,
        accessToken,
        profilePic,
        currentlyPlaying,
        login,
        logout,
      }}
    >
      {children}
    </SpotifyContext.Provider>
  );
};

export const useSpotify = () => {
  const context = useContext(SpotifyContext);
  if (!context) {
    throw new Error("useSpotify must be used within a SpotifyProvider");
  }
  return context;
};
