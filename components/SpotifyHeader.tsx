"use client";

import { FaSpotify } from "react-icons/fa";
import { useSpotify } from "@/components/SpotifyContext";
import classnames from "classnames";

export type ProfileButtonProps = {
  className?: string;
};

const ProfileButton = ({ className }: ProfileButtonProps) => {
  const { userId, profilePic, logout } = useSpotify();

  if (!userId) {
    return null;
  }

  return (
    <div
      className={classnames(
        className,
        "flex flex-row items-center space-x-4 w-full justify-between p-5"
      )}
    >
      <button
        onClick={logout}
        className="px-4 py-1 rounded-full bg-red-500 text-white text-sm font-medium hover:bg-gray-300 transition-colors duration-200"
      >
        Logout
      </button>
      <span
        className={
          "flex items-center justify-center w-12 h-12 bg-[#1DB954] rounded-full overflow-hidden shadow-md hover:bg-gray-300 transition border-4 border-[#1DB954]"
        }
      >
        {profilePic ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profilePic}
            alt="User Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <FaSpotify className="text-white text-3xl" />
        )}
      </span>
    </div>
  );
};

export default ProfileButton;
