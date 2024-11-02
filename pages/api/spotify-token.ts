// pages/api/spotify-token.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code } = req.body;

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!,
    }),
  });

  const data = await response.json();

  if (data.access_token) {
    // Use the access token to fetch Spotify user ID
    const userResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
      },
    });

    const userData = await userResponse.json();

    res.status(200).json({
      access_token: data.access_token,
      user_id: userData.id,
    });
  } else {
    res.status(400).json({ error: "Spotify authorization failed" });
  }
}
