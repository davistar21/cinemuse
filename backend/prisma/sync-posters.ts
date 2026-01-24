/**
 * Poster Sync Script
 *
 * Fetches poster/cover images for all media items:
 * - Movies & TV Shows: TMDb
 * - Books: Open Library (FREE, no API key!)
 * - Games: IGDB (requires Twitch credentials)
 *
 * Run with: npm run posters:sync
 */

import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

import { PrismaClient, MediaType } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================
// TMDb (Movies & TV Shows)
// ============================================

const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

interface TMDbSearchResponse {
  results: Array<{ id: number; poster_path: string | null }>;
}

function getTmdbHeaders(): Record<string, string> {
  if (TMDB_ACCESS_TOKEN) {
    return {
      Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    };
  }
  return { "Content-Type": "application/json" };
}

function buildTmdbUrl(
  endpoint: string,
  params: Record<string, string> = {},
): string {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  if (!TMDB_ACCESS_TOKEN && TMDB_API_KEY) {
    url.searchParams.set("api_key", TMDB_API_KEY);
  }
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

async function fetchMoviePoster(
  title: string,
  year?: number,
): Promise<string | null> {
  if (!TMDB_API_KEY && !TMDB_ACCESS_TOKEN) return null;

  try {
    const params: Record<string, string> = { query: title };
    if (year) params.year = year.toString();

    const response = await fetch(buildTmdbUrl("/search/movie", params), {
      headers: getTmdbHeaders(),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as TMDbSearchResponse;
    if (data.results.length === 0 || !data.results[0].poster_path) return null;

    return `${TMDB_IMAGE_BASE_URL}${data.results[0].poster_path}`;
  } catch {
    return null;
  }
}

async function fetchTvShowPoster(
  title: string,
  year?: number,
): Promise<string | null> {
  if (!TMDB_API_KEY && !TMDB_ACCESS_TOKEN) return null;

  try {
    const params: Record<string, string> = { query: title };
    if (year) params.first_air_date_year = year.toString();

    const response = await fetch(buildTmdbUrl("/search/tv", params), {
      headers: getTmdbHeaders(),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as TMDbSearchResponse;
    if (data.results.length === 0 || !data.results[0].poster_path) return null;

    return `${TMDB_IMAGE_BASE_URL}${data.results[0].poster_path}`;
  } catch {
    return null;
  }
}

// ============================================
// Open Library (Books) - FREE, NO API KEY!
// ============================================

const OPEN_LIBRARY_SEARCH_URL = "https://openlibrary.org/search.json";
const OPEN_LIBRARY_COVERS_URL = "https://covers.openlibrary.org/b";

interface OpenLibrarySearchResponse {
  docs: Array<{
    key: string;
    title: string;
    cover_i?: number;
    isbn?: string[];
  }>;
}

async function fetchBookCover(title: string): Promise<string | null> {
  try {
    // Search for the book
    const searchUrl = `${OPEN_LIBRARY_SEARCH_URL}?title=${encodeURIComponent(title)}&limit=1`;
    const response = await fetch(searchUrl);

    if (!response.ok) return null;

    const data = (await response.json()) as OpenLibrarySearchResponse;

    if (data.docs.length === 0) return null;

    const book = data.docs[0];

    // Try cover ID first (higher quality)
    if (book.cover_i) {
      return `${OPEN_LIBRARY_COVERS_URL}/id/${book.cover_i}-L.jpg`;
    }

    // Fallback to ISBN if available
    if (book.isbn && book.isbn.length > 0) {
      return `${OPEN_LIBRARY_COVERS_URL}/isbn/${book.isbn[0]}-L.jpg`;
    }

    return null;
  } catch {
    return null;
  }
}

// ============================================
// IGDB (Games) - Requires Twitch credentials
// ============================================

const IGDB_CLIENT_ID = process.env.IGDB_CLIENT_ID;
const IGDB_CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;
const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const IGDB_API_URL = "https://api.igdb.com/v4";

let igdbAccessToken: string | null = null;

async function getIgdbToken(): Promise<string | null> {
  if (!IGDB_CLIENT_ID || !IGDB_CLIENT_SECRET) return null;
  if (igdbAccessToken) return igdbAccessToken;

  try {
    const response = await fetch(
      `${TWITCH_TOKEN_URL}?client_id=${IGDB_CLIENT_ID}&client_secret=${IGDB_CLIENT_SECRET}&grant_type=client_credentials`,
      { method: "POST" },
    );

    if (!response.ok) return null;

    const data = (await response.json()) as { access_token: string };
    igdbAccessToken = data.access_token;
    return igdbAccessToken;
  } catch {
    return null;
  }
}

interface IgdbGame {
  id: number;
  name: string;
  cover?: {
    id: number;
    image_id: string;
  };
}

async function fetchGameCover(title: string): Promise<string | null> {
  const token = await getIgdbToken();
  if (!token || !IGDB_CLIENT_ID) return null;

  try {
    const response = await fetch(`${IGDB_API_URL}/games`, {
      method: "POST",
      headers: {
        "Client-ID": IGDB_CLIENT_ID,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: `search "${title}"; fields name,cover.image_id; limit 1;`,
    });

    if (!response.ok) return null;

    const data = (await response.json()) as IgdbGame[];

    if (data.length === 0 || !data[0].cover?.image_id) return null;

    // IGDB cover URL format
    return `https://images.igdb.com/igdb/image/upload/t_cover_big/${data[0].cover.image_id}.jpg`;
  } catch {
    return null;
  }
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log("🎬 Starting poster/cover sync...\n");

  // Check available APIs
  const hasTmdb = !!(TMDB_API_KEY || TMDB_ACCESS_TOKEN);
  const hasIgdb = !!(IGDB_CLIENT_ID && IGDB_CLIENT_SECRET);

  console.log("📡 API Status:");
  console.log(
    `   TMDb (Movies/Shows): ${hasTmdb ? "✓ Configured" : "✗ Not configured"}`,
  );
  console.log(`   Open Library (Books): ✓ Available (no key needed)`);
  console.log(
    `   IGDB (Games): ${hasIgdb ? "✓ Configured" : "✗ Not configured (optional)"}`,
  );
  console.log("");

  // Fetch all media items
  const mediaItems = await prisma.mediaItem.findMany();
  console.log(`📚 Found ${mediaItems.length} media items\n`);

  // Filter items without posters
  const itemsNeedingPosters = mediaItems.filter((item) => !item.posterUrl);

  if (itemsNeedingPosters.length === 0) {
    console.log("✅ All items already have posters!");
    return;
  }

  console.log(
    `🔄 Fetching posters for ${itemsNeedingPosters.length} items...\n`,
  );

  const stats = { success: 0, failed: 0, skipped: 0 };

  for (const item of itemsNeedingPosters) {
    let posterUrl: string | null = null;

    switch (item.type) {
      case "MOVIE":
        if (hasTmdb) {
          posterUrl = await fetchMoviePoster(
            item.title,
            item.releaseYear ?? undefined,
          );
        }
        break;

      case "SHOW":
        if (hasTmdb) {
          posterUrl = await fetchTvShowPoster(
            item.title,
            item.releaseYear ?? undefined,
          );
        }
        break;

      case "BOOK":
        posterUrl = await fetchBookCover(item.title);
        break;

      case "GAME":
        if (hasIgdb) {
          posterUrl = await fetchGameCover(item.title);
        } else {
          console.log(
            `   ⏭ ${item.type}: ${item.title} (IGDB not configured)`,
          );
          stats.skipped++;
          continue;
        }
        break;
    }

    if (posterUrl) {
      await prisma.mediaItem.update({
        where: { id: item.id },
        data: { posterUrl },
      });
      console.log(`   ✓ ${item.type}: ${item.title}`);
      stats.success++;
    } else {
      console.log(`   ✗ ${item.type}: ${item.title} (not found)`);
      stats.failed++;
    }

    // Small delay to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  console.log("\n✅ Poster sync complete!");
  console.log(`   - ${stats.success} posters fetched`);
  console.log(`   - ${stats.failed} not found`);
  console.log(`   - ${stats.skipped} skipped (API not configured)`);

  if (!hasIgdb && mediaItems.some((m) => m.type === "GAME")) {
    console.log("\n💡 Tip: To get game covers, add IGDB credentials:");
    console.log("   1. Create app at https://dev.twitch.tv/console");
    console.log("   2. Add IGDB_CLIENT_ID and IGDB_CLIENT_SECRET to .env");
  }
}

main()
  .catch((e) => {
    console.error("❌ Sync failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
