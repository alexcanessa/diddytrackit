import { useSpotify } from "@/components/SpotifyContext";
import { FaMusic } from "react-icons/fa";
import classnames from "classnames";
import { InvolvementIcon } from "./TrackDetails";

const boxClasses =
  "flex flex-col text-left items-start justify-center p-4 rounded-lg shadow-lg bg-white max-w-md mx-auto border border-gray-200";

export const getScoreLabel = (score?: number): string => {
  if (score === undefined) {
    return "N/D";
  }

  if (score === 0) {
    return "Zero!";
  }

  if (score < 10) {
    return "Low";
  }

  if (score < 25) {
    return "Medium";
  }

  if (score <= 50) {
    return "High";
  }

  return "Very High";
};

const CurrentlyPlaying = () => {
  const { currentlyPlaying } = useSpotify();

  if (!currentlyPlaying) {
    return (
      <div className={boxClasses}>
        <p className="text-gray-600 text-lg">
          🎶 Play something on your Spotify to see the score!
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Keep the music going and let{" "}
          <span className="font-semibold text-indigo-500">DiddyTrackIt</span> do
          the rest.
        </p>
      </div>
    );
  }

  return (
    <div className={classnames(boxClasses, "w-full")}>
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
              {(currentlyPlaying.score?.score_details || []).map(
                (detail, index) => (
                  <li
                    key={index}
                    className="flex items-start space-x-2 text-gray-700 text-left"
                  >
                    <span className="mt-1">
                      <InvolvementIcon type={detail.type} />
                    </span>
                    <span>{detail.reason}</span>
                  </li>
                )
              )}
            </ul>
          )}

          <div className="text-right mt-2">
            <span
              className={`text-sm font-semibold py-1 px-2 rounded-md ${
                currentlyPlaying.score?.score > 0
                  ? "bg-red-500 text-white"
                  : "bg-green-500 text-white"
              }`}
            >
              Diddy score: {getScoreLabel(currentlyPlaying.score?.score || 0)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentlyPlaying;
