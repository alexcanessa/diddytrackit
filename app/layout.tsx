import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import { SpotifyProvider } from "@/components/SpotifyContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: "Diddy Track It?",
  description:
    "See how likely it is that Diddy is cashing in on your Spotify tracks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-gray-50">
        <SpotifyProvider>
          <main>{children}</main>
          <footer className="mt-auto">
            <Footer />
          </footer>
        </SpotifyProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
