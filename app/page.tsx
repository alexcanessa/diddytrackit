"use client";

import SingleInputForm from "@/components/SingleInputForm";
import Header from "@/components/Header";
import Results from "@/components/Results"; // Ensure Results component is imported
import { useCallback, useState } from "react";
import { ResponseData } from "@/pages/api/diddymeter";
import Loading from "@/components/Loading";
import SpotifyLoginButton from "@/components/SpotifyLoginButton";
import { useSpotify } from "@/components/SpotifyContext";
import CurrentlyPlaying from "@/components/CurrentlyPlaying";
import LoadingOverlay from "@/components/LoadingOverlay";

type SubmitState = "none" | "loading" | "success" | "error";

const WhySpotify = () => {
  return (
    <div className="mt-4 max-w-md mx-auto text-center text-gray-500 text-sm leading-tight">
      <p className="mt-1">
        Connect with Spotify to let{" "}
        <span className="text-indigo-500 font-semibold">DiddyTrackIt</span>{" "}
        monitor your current track, alerting you if royalties might go to
        Diddy—without storing any playlist or track data.
      </p>
    </div>
  );
};

export default function Home() {
  const [submitState, setSubmitState] = useState<SubmitState>("none");
  const [results, setResults] = useState<ResponseData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { userId, isLoading } = useSpotify();

  const handleSubmit = useCallback(async (value: string) => {
    setSubmitState("loading");

    try {
      const response = await fetch("/api/diddymeter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ spotifyUrl: value }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "An unexpected error occurred.");
        setSubmitState("error");
        return;
      }

      const data: ResponseData = await response.json();
      setResults(data);
      setSubmitState("success");
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage(
        "An error occurred while connecting to the server. Please try again."
      );
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
      <p className="text-center mb-9 text-gray-600 text-sm">
        Diddy is just the start - when other names come up, we will keep the
        list updated.
      </p>

      <div className="flex flex-col items-center justify-center mx-auto max-w-[500px] px-5">
        <SingleInputForm
          placeholder="Enter a Spotify track URL"
          onSubmit={handleSubmit}
          onClear={() => {
            setResults(null);
            setSubmitState("none");
          }}
        />
        {submitState === "none" && !userId ? (
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
            <div className="my-4 text-gray-600 text-2xl">•</div>
            <CurrentlyPlaying />
          </>
        )}
      </div>

      <div className="mt-10">
        {submitState === "loading" && <Loading />}
        {submitState === "success" && results && <Results data={results} />}
        {submitState === "error" && errorMessage && (
          <p className="text-center mt-8 text-red-500">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
