import { getCompleteTracksInfo, CompleteTrackInfo } from "@/lib/trackinfo";
import type { NextApiRequest, NextApiResponse } from 'next'
 
type ResponseData = {
  tracks?: (CompleteTrackInfo | null)[];
  count?: number;
  totalScore?: number;
  message: string;
}
 
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' })
    return
  }

  const spotifyUrl = req.body.spotifyUrl;

  try {
    const tracksInfo = await getCompleteTracksInfo(spotifyUrl);
    const totalScore = tracksInfo.reduce((acc, track) => (acc + (track?.score.score || 0)), 0);
    
    res.status(200).json({ message: "Tracks succesfully retrieved", totalScore, count: tracksInfo.length, tracks: tracksInfo });

  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message })
    } else {
      res.status(500).json({ message: 'An unknown error occurred' })
    }
  }
}
