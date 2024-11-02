"use client";

import { FaSpotify } from "react-icons/fa";
import { useSpotify } from "@/components/SpotifyContext";

const SpotifyLoginButton = () => {
  const { login } = useSpotify();

  return (
    <button
      onClick={login}
      className="flex items-center justify-between w-full px-6 py-4 rounded-full bg-[#1DB954] text-white font-semibold text-lg shadow-md hover:bg-[#1ed760] focus:outline-none"
    >
      <span>Login with Spotify</span>
      <FaSpotify className="text-3xl" />
    </button>
  );
};

export default SpotifyLoginButton;
