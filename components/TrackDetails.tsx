import { IconType } from "react-icons";
import {
  FaUserAlt,
  FaMicrophone,
  FaMusic,
  FaRecordVinyl,
  FaHandshake,
  FaBuilding,
  FaRegCommentDots,
  FaUserTie,
} from "react-icons/fa";
import classnames from "classnames";
import { CompleteTrackInfo } from "@/lib/trackinfo";
import { getScoreLabel } from "./CurrentlyPlaying";

type InvolvementType =
  | "artist"
  | "producer"
  | "composer"
  | "mix"
  | "vocal"
  | "feature"
  | "label"
  | "default";

const iconMap: Record<InvolvementType, IconType> = {
  artist: FaUserAlt,
  producer: FaMicrophone,
  composer: FaMusic,
  mix: FaRecordVinyl,
  vocal: FaRegCommentDots,
  feature: FaHandshake,
  label: FaBuilding,
  default: FaUserTie,
};

export const InvolvementIcon = ({ type }: { type: InvolvementType }) => {
  const IconComponent = iconMap[type] || iconMap.default;
  return <IconComponent className="text-[#4a306d]" />;
};

const TrackDetails = ({ track }: { track: CompleteTrackInfo }) => {
  const { title, album, release_date, score } = track;
  const hasScore = score !== null && (score.score || 0) > 0;

  return (
    <div
      className={classnames("p-4 border rounded-lg", {
        "border-red-600": hasScore && score.score > 0,
        "border-gray-300": hasScore && score.score === 0,
        "border-gray-500": score === null,
      })}
    >
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-gray-700">{track.artists.join(", ")}</p>
      <p className="text-gray-500">
        {album}
        {release_date && ` - ${new Date(release_date).toLocaleDateString()}`}
      </p>

      {hasScore && (
        <div className="mt-2">
          <ul className="mt-2 space-y-1">
            {(score?.score_details || []).map((detail, index) => (
              <li
                key={index}
                className="flex items-center space-x-2 text-gray-700"
              >
                <InvolvementIcon type={detail.type} />
                <span>{detail.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-right mt-2">
        <span
          className={classnames("text-sm font-semibold py-1 px-2 rounded-md", {
            "bg-red-500 text-white": hasScore && score.score > 0,
            "bg-green-500 text-white": hasScore && score.score === 0,
            "bg-gray-500 text-white": score === null,
          })}
        >
          Diddy score: {getScoreLabel(score?.score)}
        </span>
      </div>
    </div>
  );
};

export default TrackDetails;
