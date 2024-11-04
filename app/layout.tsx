import type { Metadata } from "next";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import Footer from "@/components/Footer";
import { SpotifyProvider } from "@/components/SpotifyContext";
import { BurgerMenuProvider, BurgerMenuWindow } from "@/components/BurgerMenu";

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
          <BurgerMenuProvider>
            <BurgerMenuWindow
              menuItems={[
                { label: "Diddy Track It?", href: "/" },
                { label: "Diddy Do It?", href: "/involvement" },
              ]}
            />
            <main>{children}</main>
            <footer className="mt-auto">
              <Footer />
            </footer>
          </BurgerMenuProvider>
        </SpotifyProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
