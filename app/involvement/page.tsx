"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Chip from "@/components/Chip";
import PersonCard, {
  Person,
  InvolvementType,
  involvementTypes,
} from "@/components/PersonCard";
import { FaCompactDisc } from "react-icons/fa";

type InvolvementCounts = Record<InvolvementType, number>;

export default function InvolvementPage() {
  const [selectedTypes, setSelectedTypes] = useState<InvolvementType[]>([]);
  const [peopleData, setPeopleData] = useState<Person[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Count the occurrences of each involvement type in the data
  const involvementCounts = useMemo(() => {
    return peopleData.reduce<Partial<InvolvementCounts>>((counts, person) => {
      const currentCount = counts[person.involvementType] || 0;

      return {
        ...counts,
        [person.involvementType]: currentCount + 1,
      };
    }, {});
  }, [peopleData]);

  const toggleType = (type: InvolvementType) => {
    setSelectedTypes(
      (prevSelected) =>
        prevSelected.includes(type)
          ? prevSelected.filter((t) => t !== type) // Deselect if already selected
          : [...prevSelected, type] // Add if not selected
    );
  };

  useEffect(() => {
    // Show all if no chips selected or all types are selected
    if (
      selectedTypes.length === 0 ||
      selectedTypes.length === Object.keys(involvementTypes).length
    ) {
      setFilteredPeople(peopleData);
      return;
    }

    // Filter people based on selected involvement types
    setFilteredPeople(
      peopleData.filter((person) =>
        selectedTypes.includes(person.involvementType)
      )
    );
  }, [selectedTypes, peopleData]);

  useEffect(() => {
    const fetchPeopleData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/involvements");
        const data: Person[] = await response.json();
        setPeopleData(data);
        setFilteredPeople(data); // Initial display of all data
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setIsLoading(false);
    };

    fetchPeopleData();
  }, []);

  return (
    <div>
      <Header title="Diddy Do It?" layout="slim" />
      <p className="text-center px-8 text-lg">
        Discover the individuals connected to the Diddy scandal and their roles.
      </p>

      <div className="flex justify-center my-6 gap-2 flex-wrap">
        {Object.entries(involvementTypes).map(([type, label]) => {
          // @note: For some reason entries removes the type definition.
          const involvementType = type as InvolvementType;
          const count = involvementCounts[involvementType] || 0;

          return (
            <Chip
              key={type}
              label={`${label} (${count})`}
              isSelected={selectedTypes.includes(involvementType)}
              onClick={() => toggleType(involvementType)}
              disabled={count === 0}
            />
          );
        })}
      </div>
      {isLoading ? (
        <FaCompactDisc className="animate-spin text-[#4a306d] text-4xl mx-auto my-2 block" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-4 max-w-5xl mx-auto">
          {filteredPeople.map((person) => (
            <PersonCard key={person.name.toLowerCase()} person={person} />
          ))}
        </div>
      )}
    </div>
  );
}
