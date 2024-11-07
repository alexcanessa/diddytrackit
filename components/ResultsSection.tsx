import Results from "@/components/Results";
import { CompleteTrackInfo } from "@/lib/trackinfo";

export interface ResultsSectionProps {
  results: CompleteTrackInfo[];
}

const ResultsSection = ({ results }: ResultsSectionProps) => (
  <Results
    data={{
      tracks: results,
      message: "Tracks successfully retrieved",
      totalScore: results.reduce(
        (acc, track) => acc + (track?.score?.score || 0),
        0
      ),
      count: results.length,
      page: 1,
      hasMore: false,
    }}
  />
);

export default ResultsSection;
