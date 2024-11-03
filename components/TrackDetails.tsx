import { IconType } from "react-icons";
import {
  FaMicrophone,
  FaUserAlt,
  FaRegHandshake,
  FaMusic,
  FaRecordVinyl,
} from "react-icons/fa";
import { CompleteTrackInfo } from "@/lib/trackinfo";

type InvolvementType =
  | "artist"
  | "producer"
  | "composer"
  | "mix"
  | "vocal"
  | "feature"
  | "label"
  | "default";

export const InvolvementIcon = ({ type }: { type: InvolvementType }) => {
  const iconMap: Record<InvolvementType, IconType> = {
    artist: FaUserAlt,
    producer: FaMicrophone,
    composer: FaMusic,
    mix: FaRecordVinyl,
    vocal: FaMusic,
    feature: FaRegHandshake,
    label: FaUserAlt,
    default: FaUserAlt,
  };

  const IconComponent = iconMap[type] || iconMap.default;
  return <IconComponent className="text-indigo-600" />;
};

const TrackDetails = ({ track }: { track: CompleteTrackInfo }) => {
  const { title, album, release_date, score } = track;
  const hasScore = score.score > 0;

  return (
    <div
      className={`p-4 border rounded-lg ${hasScore ? "border-red-600" : "border-gray-300"}`}
    >
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-gray-700">{track.artists.join(", ")}</p>
      <p className="text-gray-500">
        {album} - {release_date}
      </p>

      {hasScore && (
        <div className="mt-2">
          <ul className="mt-2 space-y-1">
            {score.score_details.map((detail, index) => (
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
    </div>
  );
};

export default TrackDetails;
