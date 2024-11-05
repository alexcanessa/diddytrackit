// app/Home.tsx

"use client";

import SingleInputForm from "@/components/SingleInputForm";
import Header from "@/components/Header";
import LoadingOverlay from "@/components/LoadingOverlay";
import SpotifyLoginButton from "@/components/SpotifyLoginButton";
import { useSpotify } from "@/components/SpotifyContext";
import CurrentlyPlaying from "@/components/CurrentlyPlaying";
import WhySpotify from "@/components/WhySpotify";
import ResultsSection from "@/components/ResultsSection";
import { useCallback, useState } from "react";
import { CompleteTrackInfo } from "@/lib/trackinfo";
import { ResponseData } from "@/pages/api/diddymeter";
import Loading from "@/components/Loading";
import Link from "next/link";

type SubmitState = "none" | "loading" | "success" | "error";

const Separator = () => {
  return <div className="my-4 text-gray-600 text-2xl text-center">•</div>;
};

export default function Home() {
  const [submitState, setSubmitState] = useState<SubmitState>("none");
  const [results, setResults] = useState<CompleteTrackInfo[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const { userId, isLoading } = useSpotify();

  const handleSubmit = useCallback(async (value: string) => {
    setSubmitState("loading");
    setResults([]);
    setProgress(0);

    const limit = 20;
    let page = 1;
    let hasMore = true;

    try {
      const initialResponse = await fetch("/api/diddymeter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ spotifyUrl: value, page, limit }),
      });

      if (!initialResponse.ok) {
        const errorData = await initialResponse.json();
        setErrorMessage(errorData.message || "An unexpected error occurred.");
        setSubmitState("error");
        return;
      }

      const { totalTracks = 0 }: ResponseData = await initialResponse.json();

      const totalBatches = Math.ceil(totalTracks / limit);

      // Reset progress state for fake loading
      setResults([]);
      setProgress(0);
      page = 1;
      hasMore = true;

      while (hasMore) {
        const maxProgress = Math.max((page / totalBatches) * 100, 99);

        // Fake loading within min and max range for the current batch
        const fakeProgressInterval = setInterval(() => {
          setProgress((prevProgress) => {
            const newProgress = prevProgress + Math.random() * 2; // Increment randomly between 0 and 2%
            return Math.min(newProgress, maxProgress); // Cap progress at max for this batch
          });
        }, 300);

        const response = await fetch("/api/diddymeter", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ spotifyUrl: value, page, limit }),
        });

        clearInterval(fakeProgressInterval); // Stop fake progress once batch is fetched

        if (!response.ok) {
          const errorData = await response.json();
          setErrorMessage(errorData.message || "An unexpected error occurred.");
          setSubmitState("error");
          return;
        }

        const data: ResponseData = await response.json();

        setResults((prevResults) => [
          ...prevResults,
          ...(data.tracks?.filter(
            (track): track is CompleteTrackInfo => track !== null
          ) || []),
        ]);

        // Set real progress for the batch and move to the next page
        setProgress(maxProgress);
        hasMore = data.hasMore || false;
        page++;
      }

      setSubmitState("success");
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage("An error occurred. Please try again.");
      setSubmitState("error");
    }
  }, []);

  return (
    <div>
      {isLoading && <LoadingOverlay />}
      <Header
        title="Diddy Track It?"
        layout={submitState === "none" ? "default" : "slim"}
      />
      <p className="text-center px-8 text-lg">
        See how likely it is that Diddy is cashing in on your Spotify tracks.
      </p>
      <p className="text-center mb-9 px-8 text-gray-600 text-sm">
        Diddy is just the start - when other names come up, we will keep{" "}
        <Link href="/involvement" className="text-[#803977] underline">
          the list
        </Link>{" "}
        updated.
      </p>

      <div className="flex flex-col items-center justify-center mx-auto max-w-[500px] px-5">
        <SingleInputForm
          placeholder="Enter a Spotify Track or Playlist URL"
          onSubmit={handleSubmit}
          onClear={() => {
            setResults([]);
            setSubmitState("none");
            setProgress(0);
          }}
        />
        {submitState === "none" &&
          (!userId ? (
            <>
              <div className="flex items-center my-2 space-x-4">
                <span className="h-px w-full bg-gray-300"></span>
                <span className="text-gray-500">or</span>
                <span className="h-px w-full bg-gray-300"></span>
              </div>

              <SpotifyLoginButton />
              <WhySpotify />
            </>
          ) : (
            <>
              <Separator />
              <CurrentlyPlaying />
            </>
          ))}
      </div>

      {submitState !== "none" && (
        <>
          <Separator />
          <div className="max-w-xl mx-auto">
            {submitState === "loading" && <Loading progress={progress} />}
            {submitState === "success" && <ResultsSection results={results} />}
            {submitState === "error" && errorMessage && (
              <p className="text-center mt-8 text-red-500">{errorMessage}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
