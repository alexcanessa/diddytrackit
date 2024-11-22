/* eslint-disable @next/next/no-img-element */

// Types for the involvement page
export type InvolvementType =
  | "accused"
  | "victim"
  | "alleged victim"
  | "accusing"
  | "suspected";

export const involvementTypes: Record<InvolvementType, string> = {
  accused: "Accused",
  victim: "Victim",
  "alleged victim": "Alleged Victim",
  accusing: "Accusing",
  suspected: "Suspected",
};

// Types for the artists page
export interface ArtistPerson {
  name: string;
  imageUrl?: string;
  reason: string;
  labels?: { id: number; name: string }[];
  bands?: { id: number; name: string }[];
}

// Types for the involvement page
export interface InvolvementPerson {
  name: string;
  involvementType: InvolvementType;
  details: string;
  imageUrl?: string;
}

type PersonCardProps =
  | { person: InvolvementPerson; type: "involvement" }
  | { person: ArtistPerson; type: "artist" };

// Utility function to get initials
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const PersonCard = ({ person, type }: PersonCardProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col items-center text-center">
      {person.imageUrl ? (
        <img
          src={person.imageUrl}
          alt={person.name}
          className="w-24 h-24 rounded-full object-cover mb-4"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mb-4">
          <span className="text-2xl font-bold text-white">
            {getInitials(person.name)}
          </span>
        </div>
      )}
      <h3 className="text-xl font-semibold">{person.name}</h3>

      {type === "involvement" && (
        <>
          <p className="text-sm text-gray-600 mb-2">
            {involvementTypes[(person as InvolvementPerson).involvementType]}
          </p>
          <p className="text-gray-700">
            {(person as InvolvementPerson).details}
          </p>
        </>
      )}

      {type === "artist" && (
        <>
          <p className="text-gray-700 mb-2">{person.reason}</p>

          <div className="flex flex-wrap justify-center gap-1 mt-2">
            {person.labels?.length
              ? person.labels.map((label) => (
                  <Pill key={label.id} text={label.name} type="label" />
                ))
              : null}

            {person.bands?.length
              ? person.bands.map((band) => (
                  <Pill key={band.id} text={band.name} type="band" />
                ))
              : null}
          </div>
        </>
      )}
    </div>
  );
};

// Reusable Pill component for labels and bands
const Pill = ({ text, type }: { text: string; type: "label" | "band" }) => {
  const colorClass =
    type === "label"
      ? "bg-blue-100 text-blue-800"
      : "bg-green-100 text-green-800";

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}
    >
      {text}
    </span>
  );
};

export default PersonCard;
