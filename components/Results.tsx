import { ResponseData } from "@/pages/api/diddymeter";
import Track from "@/components/TrackDetails";

function getScoreColor(score: number, totalTracks: number): string {
  const scorePerTrack = score / totalTracks;

  if (scorePerTrack === 0) return "text-green-600";
  if (scorePerTrack <= 1) return "text-yellow-500"; // Low impact
  if (scorePerTrack <= 2) return "text-orange-500"; // Medium impact
  if (scorePerTrack <= 3) return "text-red-500"; // High impact

  return "text-red-700"; // Very high impact
}

function getMessageBasedOnScore(
  score: number,
  scoredTracksCount: number
): string {
  if (scoredTracksCount === 0)
    return `Looks like Diddy isn't cashing in on any of your tracks!`;

  const scorePerTrack = score / scoredTracksCount;

  if (scorePerTrack > 3)
    return `High chance Diddy is cashing in on ${scoredTracksCount} song(s)!`;
  if (scorePerTrack > 2)
    return `Fair chance Diddy is earning from ${scoredTracksCount} song(s).`;
  if (scorePerTrack > 1)
    return `Moderate chance Diddy is profiting from ${scoredTracksCount} song(s).`;
  return `Low chance Diddy is making something from ${scoredTracksCount} song(s).`;
}

function ScoreMeter({
  children,
  score,
  totalTracks,
}: {
  children: React.ReactNode;
  score: number;
  totalTracks: number;
}) {
  const scoreColor = getScoreColor(score, totalTracks);
  return (
    <p className={`text-xl font-semibold mt-4 ${scoreColor}`}>{children}</p>
  );
}

function Results({ data }: { data: Partial<ResponseData> }) {
  const {
    message = "Fetching tracks...",
    totalScore = 0,
    count = 0,
    tracks = [],
  } = data;

  if (!tracks.length && count === 0) {
    return <p>No tracks found.</p>;
  }

  const scoredTracksCount = tracks.filter(
    (track) => (track?.score?.score || 0) > 0
  ).length;
  const userMessage = getMessageBasedOnScore(totalScore, scoredTracksCount);
  const sortedTracks = [...tracks].sort(
    (a, b) => (b?.score?.score || 0) - (a?.score?.score || 0)
  );

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <ScoreMeter score={totalScore} totalTracks={count}>
          {userMessage}
        </ScoreMeter>
        <p className="text-gray-600">
          {message} ({tracks.length}/{count} tracks analysed)
        </p>
      </div>

      <div className="space-y-4">
        {sortedTracks.map(
          (track) => track && <Track key={track.SID} track={track} />
        )}
      </div>
    </div>
  );
}

export default Results;
