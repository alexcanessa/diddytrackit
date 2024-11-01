import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Diddy Track It?',
    short_name: 'DiddyTrackIt',
    description: "See how likely it is that Diddy is cashing in on your Spotify tracks",
    start_url: '/',
    display: 'standalone',
    background_color: '#1e0a45',
    theme_color: '#1e0a45',
    icons: [
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-512x512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      }
    ],
  };
}
