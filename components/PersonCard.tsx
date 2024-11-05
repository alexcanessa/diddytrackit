/* eslint-disable @next/next/no-img-element */

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

export interface Person {
  name: string;
  involvementType: InvolvementType;
  details: string;
  imageUrl?: string;
}

// Utility function to get initials
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const PersonCard = ({ person }: { person: Person }) => {
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
      <p className="text-sm text-gray-600 mb-2">
        {involvementTypes[person.involvementType]}
      </p>
      <p className="text-gray-700">{person.details}</p>
    </div>
  );
};

export default PersonCard;
