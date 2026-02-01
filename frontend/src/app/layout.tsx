import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CineMuse - Discover Media Through Memories",
  description:
    "Find movies, shows, books, and games using natural language descriptions of feelings, scenes, and vibes. AI-powered entertainment discovery.",
  keywords: [
    "movies",
    "TV shows",
    "books",
    "games",
    "recommendation",
    "AI",
    "semantic search",
    "movie finder",
    "entertainment discovery",
  ],
  authors: [{ name: "CineMuse" }],
  creator: "CineMuse",
  openGraph: {
    title: "CineMuse - Discover Entertainment That Matches Your Vibe",
    description:
      "AI-powered movie and entertainment discovery. Describe a feeling, get the perfect recommendation.",
    url: "https://cinemuse.app",
    siteName: "CineMuse",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CineMuse - Discover entertainment that matches your vibe",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CineMuse - Discover Entertainment That Matches Your Vibe",
    description:
      "AI-powered movie and entertainment discovery. Describe a feeling, get the perfect recommendation.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  metadataBase: new URL("https://cinemuse.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={` antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
