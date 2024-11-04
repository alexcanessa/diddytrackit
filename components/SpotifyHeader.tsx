"use client";

import { FaSpotify } from "react-icons/fa";
import { useSpotify } from "@/components/SpotifyContext";
import classnames from "classnames";

export type ProfileButtonProps = {
  className?: string;
};

const ProfileButton = ({ className }: ProfileButtonProps) => {
  const { userId, profilePic } = useSpotify();

  if (!userId) {
    return null;
  }

  return (
    <span
      className={classnames(
        className,
        "flex items-center justify-center w-12 h-12 bg-[#1DB954] rounded-full overflow-hidden shadow-md hover:bg-gray-300 transition border-4 border-[#1DB954]"
      )}
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
  );
};

export default ProfileButton;
