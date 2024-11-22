"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import PersonCard, { ArtistPerson } from "@/components/PersonCard";
import { FaCompactDisc } from "react-icons/fa";

export default function ArtistsPage() {
  const [artists, setArtists] = useState<ArtistPerson[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchArtists = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/artists");
        const data: ArtistPerson[] = await response.json();
        setArtists(data);
      } catch (error) {
        console.error("Error fetching artists:", error);
      }
      setIsLoading(false);
    };

    fetchArtists();
  }, []);

  return (
    <div>
      <Header title="What Diddy Do?" layout="slim" />
      <div className="container mx-auto px-4 py-8">
        <div className="text-gray-800 text-center">
          <p>
            The <strong>Diddymeter</strong> tracks problematic{" "}
            <strong>artists, labels, and bands</strong> to assess how much
            visibility or royalties they might receive from music streams. These
            individuals or entities have been flagged due to documented{" "}
            <strong>problematic behaviour</strong>, allegations, or convictions.
          </p>
          <p className="my-4">
            By using this data, the Diddymeter highlights tracks that contribute
            to these flagged individuals, helping create awareness for
            listeners.
          </p>
          <p>Here’s what we track:</p>
        </div>
        <ul className="list-none space-y-4 text-gray-700 max-w-2xl mx-auto">
          <li className="flex items-start">
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#4a306d] text-white font-bold mr-4">
              1
            </span>
            <span>
              <strong>Reason for Inclusion:</strong> A description of the
              actions or allegations that led to their inclusion.
            </span>
          </li>
          <li className="flex items-start">
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#4a306d] text-white font-bold mr-4">
              2
            </span>
            <span>
              <strong>Associated Labels:</strong> Record labels linked to the
              artist, which may earn royalties from their music.
            </span>
          </li>
          <li className="flex items-start">
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#4a306d] text-white font-bold mr-4">
              3
            </span>
            <span>
              <strong>Bands or Collaborations:</strong> Groups the artist has
              been involved with.
            </span>
          </li>
        </ul>
      </div>

      {isLoading ? (
        <FaCompactDisc className="animate-spin text-[#4a306d] text-4xl mx-auto my-2 block" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-4 max-w-5xl mx-auto mt-8">
          {artists.map((artist) => (
            <PersonCard
              key={artist.name.toLowerCase()}
              person={artist}
              type="artist"
            />
          ))}
        </div>
      )}
    </div>
  );
}
