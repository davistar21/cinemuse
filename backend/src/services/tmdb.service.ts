/**
 * TMDb Service
 *
 * Integrates with The Movie Database API to fetch posters and metadata
 * for movies and TV shows.
 *
 * TMDb API Docs: https://developer.themoviedb.org/docs
 */

import config from "../config/index.js";
import { ApiError } from "../utils/ApiError.js";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// Image sizes available: w92, w154, w185, w342, w500, w780, original
const POSTER_SIZE = "w500";
const BACKDROP_SIZE = "w1280";

interface TMDbSearchResult {
  id: number;
  title?: string; // Movies
  name?: string; // TV Shows
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date?: string; // Movies
  first_air_date?: string; // TV Shows
  vote_average: number;
  media_type?: string;
}

interface TMDbSearchResponse {
  page: number;
  results: TMDbSearchResult[];
  total_pages: number;
  total_results: number;
}

/**
 * Get authorization headers for TMDb API
 */
function getHeaders(): Record<string, string> {
  // Prefer access token over API key
  if (config.tmdb.accessToken) {
    return {
      Authorization: `Bearer ${config.tmdb.accessToken}`,
      "Content-Type": "application/json",
    };
  }

  return {
    "Content-Type": "application/json",
  };
}

/**
 * Build API URL with optional API key (if not using access token)
 */
function buildUrl(
  endpoint: string,
  params: Record<string, string> = {},
): string {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);

  // Add API key if not using access token
  if (!config.tmdb.accessToken && config.tmdb.apiKey) {
    url.searchParams.set("api_key", config.tmdb.apiKey);
  }

  // Add additional params
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}

/**
 * Get full poster URL from TMDb path
 */
export function getPosterUrl(posterPath: string | null): string | null {
  if (!posterPath) return null;
  return `${TMDB_IMAGE_BASE_URL}/${POSTER_SIZE}${posterPath}`;
}

/**
 * Get full backdrop URL from TMDb path
 */
export function getBackdropUrl(backdropPath: string | null): string | null {
  if (!backdropPath) return null;
  return `${TMDB_IMAGE_BASE_URL}/${BACKDROP_SIZE}${backdropPath}`;
}

/**
 * Search for a movie by title
 */
export async function searchMovie(
  title: string,
  year?: number,
): Promise<TMDbSearchResult | null> {
  if (!config.tmdb.apiKey && !config.tmdb.accessToken) {
    console.warn("TMDb API not configured");
    return null;
  }

  try {
    const params: Record<string, string> = { query: title };
    if (year) {
      params.year = year.toString();
    }

    const url = buildUrl("/search/movie", params);
    const response = await fetch(url, { headers: getHeaders() });

    if (!response.ok) {
      console.error(`TMDb search failed: ${response.status}`);
      return null;
    }

    const data = (await response.json()) as TMDbSearchResponse;

    if (data.results.length === 0) {
      return null;
    }

    // Return the first (most relevant) result
    return data.results[0];
  } catch (error) {
    console.error("TMDb search error:", error);
    return null;
  }
}

/**
 * Search for a TV show by title
 */
export async function searchTvShow(
  title: string,
  year?: number,
): Promise<TMDbSearchResult | null> {
  if (!config.tmdb.apiKey && !config.tmdb.accessToken) {
    console.warn("TMDb API not configured");
    return null;
  }

  try {
    const params: Record<string, string> = { query: title };
    if (year) {
      params.first_air_date_year = year.toString();
    }

    const url = buildUrl("/search/tv", params);
    const response = await fetch(url, { headers: getHeaders() });

    if (!response.ok) {
      console.error(`TMDb TV search failed: ${response.status}`);
      return null;
    }

    const data = (await response.json()) as TMDbSearchResponse;

    if (data.results.length === 0) {
      return null;
    }

    return data.results[0];
  } catch (error) {
    console.error("TMDb TV search error:", error);
    return null;
  }
}

/**
 * Search for any media (movie or TV) using multi-search
 */
export async function searchMulti(
  title: string,
): Promise<TMDbSearchResult | null> {
  if (!config.tmdb.apiKey && !config.tmdb.accessToken) {
    console.warn("TMDb API not configured");
    return null;
  }

  try {
    const url = buildUrl("/search/multi", { query: title });
    const response = await fetch(url, { headers: getHeaders() });

    if (!response.ok) {
      console.error(`TMDb multi-search failed: ${response.status}`);
      return null;
    }

    const data = (await response.json()) as TMDbSearchResponse;

    // Filter to only movies and TV shows
    const filtered = data.results.filter(
      (r) => r.media_type === "movie" || r.media_type === "tv",
    );

    if (filtered.length === 0) {
      return null;
    }

    return filtered[0];
  } catch (error) {
    console.error("TMDb multi-search error:", error);
    return null;
  }
}

/**
 * Fetch poster URL for a media item based on type and title
 */
export async function fetchPosterForMedia(
  type: "MOVIE" | "SHOW" | "BOOK" | "GAME",
  title: string,
  year?: number,
): Promise<string | null> {
  let result: TMDbSearchResult | null = null;

  switch (type) {
    case "MOVIE":
      result = await searchMovie(title, year);
      break;
    case "SHOW":
      result = await searchTvShow(title, year);
      break;
    case "BOOK":
    case "GAME":
      // TMDb doesn't have books/games, could integrate other APIs later
      return null;
    default:
      return null;
  }

  if (!result) {
    return null;
  }

  return getPosterUrl(result.poster_path);
}

/**
 * Check if TMDb is configured and accessible
 */
export async function isTmdbAvailable(): Promise<boolean> {
  if (!config.tmdb.apiKey && !config.tmdb.accessToken) {
    return false;
  }

  try {
    const url = buildUrl("/configuration");
    const response = await fetch(url, { headers: getHeaders() });
    return response.ok;
  } catch {
    return false;
  }
}

export default {
  searchMovie,
  searchTvShow,
  searchMulti,
  getPosterUrl,
  getBackdropUrl,
  fetchPosterForMedia,
  isTmdbAvailable,
};
