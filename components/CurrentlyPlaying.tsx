import { useSpotify } from "@/components/SpotifyContext";
import { FaMusic } from "react-icons/fa";
import { InvolvementIcon } from "./TrackDetails";

const CurrentlyPlaying = () => {
  const { currentlyPlaying } = useSpotify();

  if (!currentlyPlaying) {
    return null; // Do not render if no track is playing
  }

  return (
    <div className="flex flex-col w-full items-center p-4 rounded-lg shadow-lg bg-white max-w-md mx-auto mt-5 border border-gray-200">
      <div className="flex w-full">
        <div className="mr-4 text-indigo-600 animate-pulse">
          <FaMusic className="mt-2 text-3xl" />
        </div>

        <div className="text-left w-full overflow-hidden">
          <h2 className="text-xl font-semibold text-gray-800 truncate">
            {currentlyPlaying.title}
          </h2>
          <p className="text-gray-500 mb-2 truncate">
            {currentlyPlaying.album}
          </p>
        </div>
      </div>

      {currentlyPlaying.score !== null && (
        <div className="mt-2 w-full">
          {/* Score Details Breakdown */}
          {currentlyPlaying.score?.score_details?.length > 0 && (
            <ul className="mt-2 text-sm space-y-1">
              {currentlyPlaying.score.score_details.map((detail, index) => (
                <li
                  key={index}
                  className="flex items-start space-x-2 text-gray-700 text-left"
                >
                  <span className="mt-1">
                    <InvolvementIcon type={detail.type} />
                  </span>
                  <span>{`${detail.reason} (+${detail.score})`}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="text-right">
            <span
              className={`text-sm font-semibold py-1 px-2 rounded-md ${
                currentlyPlaying.score?.score > 0
                  ? "bg-red-500 text-white"
                  : "bg-green-500 text-white"
              }`}
            >
              Diddy Score: {currentlyPlaying.score?.score || "N/A"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentlyPlaying;
