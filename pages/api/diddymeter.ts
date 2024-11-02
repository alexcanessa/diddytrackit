import { getCompleteTracksInfo, CompleteTrackInfo } from "@/lib/trackinfo";
import type { NextApiRequest, NextApiResponse } from "next";

export type ResponseData = {
  tracks?: (CompleteTrackInfo | null)[];
  count?: number;
  totalScore?: number;
  message: string;
  page?: number;
  hasMore?: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const spotifyUrl = req.body.spotifyUrl;
  const page = parseInt(req.body.page, 10) || 1;
  const limit = parseInt(req.body.limit, 10) || 20;

  try {
    const tracksInfo = await getCompleteTracksInfo(spotifyUrl, page, limit);
    const totalScore = tracksInfo.reduce(
      (acc, track) => acc + (track?.score.score || 0),
      0
    );

    const hasMore = tracksInfo.length === limit; // If we fetched `limit` tracks, assume there's more to fetch.

    res.status(200).json({
      message: "Tracks successfully retrieved",
      totalScore,
      count: tracksInfo.length,
      tracks: tracksInfo,
      page,
      hasMore,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
}
