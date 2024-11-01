"use client";

import SingleInputForm from "@/components/SingleInputForm";
import Header from "@/components/Header";
import Results from "@/components/Results"; // Ensure Results component is imported
import { useCallback, useState } from "react";
import { ResponseData } from "@/pages/api/diddymeter";
import Loading from "@/components/Loading";

type SubmitState = "none" | "loading" | "success" | "error";

export default function Home() {
  const [submitState, setSubmitState] = useState<SubmitState>("none");
  const [results, setResults] = useState<ResponseData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      <Header
        title="Diddy Track It?"
        layout={submitState === "none" ? "default" : "slim"}
      />
      <p className="text-center mb-8">
        See how likely it is that Diddy is cashing in on your Spotify tracks.
      </p>

      <div className="flex items-center justify-center mx-auto max-w-[600px]">
        <SingleInputForm
          placeholder="Enter a Spotify track or playlist URL"
          onSubmit={handleSubmit}
        />
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
