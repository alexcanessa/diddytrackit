import React from "react";

export type PillProps = {
  text: string;
  type: "label" | "band";
};

const Pill = ({ text, type }: { text: string; type: "label" | "band" }) => {
  const colorClass =
    type === "label"
      ? "bg-blue-100 text-blue-800 border-blue-300"
      : "bg-green-100 text-green-800 border-green-300";

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}
      title={type === "label" ? "Record Label" : "Band"}
    >
      {text}
    </span>
  );
};

export default Pill;
