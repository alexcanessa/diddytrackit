import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

type ArtistResponse = {
  id: number;
  name: string;
  imageUrl: string | null;
  reason: string;
  labels: { id: number; name: string }[];
  bands: { id: number; name: string }[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    const artists = await prisma.artist.findMany({
      include: {
        labels: true,
        bands: true,
      },
    });

    const response: ArtistResponse[] = artists.map((artist) => ({
      id: artist.id,
      name: artist.name,
      imageUrl: artist.imageUrl,
      reason: artist.reason || "No reason provided",
      labels: artist.labels.map((label) => ({
        id: label.id,
        name: label.name,
      })),
      bands: artist.bands.map((band) => ({ id: band.id, name: band.name })),
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching artists:", error);
    res.status(500).json({ message: "Failed to fetch artists" });
  }
}
