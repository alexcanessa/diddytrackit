import { BlacklistItem, ScorePerRole } from "@/lib/diddymeter";
import { getCompleteTracksInfo, CompleteTrackInfo } from "@/lib/trackinfo";
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export type ResponseData = {
  tracks?: (CompleteTrackInfo | null)[];
  count?: number;
  totalScore?: number;
  message: string;
  page?: number;
  hasMore?: boolean;
  totalTracks?: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const spotifyUrl: string = req.body.spotifyUrl;
  const page: number = parseInt(req.body.page, 10) || 1;
  const limit: number = parseInt(req.body.limit, 10) || 20;

  try {
    // Fetch blacklist data from the database
    const dbBlacklist = await prisma.artist.findMany({
      include: {
        labels: true,
        bands: true,
      },
    });

    // Transform database data into the expected BlacklistItem format
    const blackList: BlacklistItem[] = dbBlacklist.flatMap((artist) => {
      const artistEntries: BlacklistItem[] = [
        {
          id: artist.id.toString(),
          name: artist.name,
          type: "artist",
          score: 50, // Default score for artist
        },
      ];

      const labelEntries: BlacklistItem[] = artist.labels.map((label) => ({
        id: label.id.toString(),
        name: label.name,
        type: "label",
        score: 25, // Default score for label
      }));

      const bandEntries: BlacklistItem[] = artist.bands.map((band) => ({
        id: band.id.toString(),
        name: band.name,
        type: "artist", // Bands are treated as artists in this case
        score: 50, // Default score for artist in a band
      }));

      return [...artistEntries, ...labelEntries, ...bandEntries];
    });

    // Fetch score data from the database
    const dbScores = await prisma.score.findMany();
    const scorePerRole: ScorePerRole = dbScores.reduce(
      (acc, { type, value }) => ({ ...acc, [type as string]: value }),
      {} as ScorePerRole
    );

    // Fetch tracks and calculate scores
    const { tracks, total } = await getCompleteTracksInfo(
      spotifyUrl,
      page,
      limit,
      {
        scorePerRole,
        blackList,
      }
    );

    const totalScore = tracks.reduce(
      (acc, track) => acc + (track?.score?.score || 0),
      0
    );

    const hasMore = page * limit < total; // Check if there's more data to fetch

    res.status(200).json({
      message: "Tracks successfully retrieved",
      totalScore,
      count: tracks.length,
      tracks,
      page,
      hasMore,
      totalTracks: total,
    });
  } catch (error: unknown) {
    console.error("Error in API handler:", error);

    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
}
