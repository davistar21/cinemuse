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
    "Find movies, shows, books, and games using natural language descriptions of feelings, scenes, and vibes.",
  keywords: [
    "movies",
    "TV shows",
    "books",
    "games",
    "recommendation",
    "AI",
    "semantic search",
  ],
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
