import prisma from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
// MediaType is now a string field, not an enum (SQLite)
import * as embeddingService from "./embedding.service.js";
import * as mediaService from "./media.service.js";
import * as tmdbService from "./tmdb.service.js";
import * as pineconeService from "./pinecone.service.js";

export interface SearchResult {
  id: string;
  type: MediaType;
  title: string;
  description: string | null;
  releaseYear: number | null;
  posterUrl: string | null;
  score: number;
  tags: { name: string }[];
}

export interface MemorySearchParams {
  query: string;
  type?: MediaType;
  limit?: number;
}

/**
 * Cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Parse embedding values from SQLite JSON string
 */
function parseEmbeddingValues(values: string | number[]): number[] {
  if (Array.isArray(values)) return values;
  try {
    return JSON.parse(values);
  } catch {
    return [];
  }
}

import * as groqService from "./groq.service.js";

/**
 * Memory-based semantic search using Groq LLM Expansion
 */
export async function memorySearch(
  params: MemorySearchParams,
): Promise<SearchResult[]> {
  const { query, type, limit = 10 } = params;

  try {
    console.log(`🤖 Expanding query: "${query}"...`);

    // 1. Use Groq to expand query into keywords/titles
    const keywords = await groqService.expandQuery(query);
    console.log(`✨ Expanded to:`, keywords);

    // 2. Perform broad keyword search
    const allResults = new Map<string, SearchResult>();
    const terms = [...new Set([query, ...keywords])];

    for (const term of terms) {
      if (!term) continue;

      const results = await mediaService.searchMedia({
        query: term,
        type,
        limit,
        offset: 0,
      });

      results.items.forEach((item) => {
        if (!allResults.has(item.id)) {
          allResults.set(item.id, {
            id: item.id,
            type: item.type,
            title: item.title,
            description: item.description,
            releaseYear: item.releaseYear,
            posterUrl: item.posterUrl,
            score: term === query ? 1.0 : 0.8,
            tags: item.tags.map((t) => ({ name: t.name })),
          });
        }
      });
    }

    let results = Array.from(allResults.values()).slice(0, limit);

    // 3. REACTIVE FALLBACK (TMDB)
    // If we have very few results, ask TMDB directly using expanded keywords
    // TMDB expects a title, not a description, so we try each keyword
    if (results.length === 0) {
      console.log(
        `🧊 Cold Start: No local results for "${query}". Checking TMDB with keywords...`,
      );

      // Try each keyword (prioritize capitalized ones - likely titles)
      let tmdbResult = null;

      // Sort: capitalized words first (likely movie titles), then others
      const sortedKeywords = [...keywords].sort((a, b) => {
        const aIsTitle = a && a[0] === a[0]?.toUpperCase() && a.includes(" ");
        const bIsTitle = b && b[0] === b[0]?.toUpperCase() && b.includes(" ");
        if (aIsTitle && !bIsTitle) return -1;
        if (!aIsTitle && bIsTitle) return 1;
        return 0;
      });

      // Skip generic genre words
      const genericWords = [
        "science fiction",
        "action",
        "romance",
        "comedy",
        "drama",
        "thriller",
        "horror",
        "adventure",
      ];

      for (const keyword of sortedKeywords) {
        if (!keyword || keyword.length < 3) continue;
        if (genericWords.includes(keyword.toLowerCase())) continue;

        console.log(`  🔍 Trying TMDB search: "${keyword}"`);
        tmdbResult = await tmdbService.searchMulti(keyword);
        if (
          tmdbResult &&
          (tmdbResult.media_type === "movie" || tmdbResult.media_type === "tv")
        ) {
          break; // Found a match
        }
      }

      // If keywords didn't work, try the original query as last resort
      if (!tmdbResult) {
        tmdbResult = await tmdbService.searchMulti(query);
      }

      if (
        tmdbResult &&
        (tmdbResult.media_type === "movie" || tmdbResult.media_type === "tv")
      ) {
        console.log(
          `🔥 Reactive Import: Found "${tmdbResult.title || tmdbResult.name}" on TMDB. Importing...`,
        );

        // Import to DB
        // Check duplication by title to avoid messy duplicates (optimistic check)
        // Ideally we check externalId but we don't store it rigorously yet.
        const existing = await prisma.mediaItem.findFirst({
          where: {
            title: tmdbResult.title || tmdbResult.name,
            type: tmdbResult.media_type === "movie" ? "MOVIE" : "SHOW",
          },
        });

        let newItem;
        if (existing) {
          newItem = await mediaService.getMediaById(existing.id);
        } else {
          newItem = await mediaService.createMedia({
            type: tmdbResult.media_type === "movie" ? "MOVIE" : "SHOW",
            title: (tmdbResult.title || tmdbResult.name)!, // bang ok checked above
            description: tmdbResult.overview,
            releaseYear: tmdbResult.release_date
              ? parseInt(tmdbResult.release_date.split("-")[0])
              : tmdbResult.first_air_date
                ? parseInt(tmdbResult.first_air_date.split("-")[0])
                : undefined,
            posterUrl: tmdbService.getPosterUrl(tmdbResult.poster_path)!,
            tags: [], // No tags initially
          });
        }

        // Add to results
        results.push({
          id: newItem.id,
          type: newItem.type,
          title: newItem.title,
          description: newItem.description,
          releaseYear: newItem.releaseYear,
          posterUrl: newItem.posterUrl,
          score: 0.9, // High score for direct match
          tags: newItem.tags.map((t) => ({ name: t.name })),
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Smart search error:", error);
    return await fallbackKeywordSearch(query, type, limit);
  }
}

/**
 * Fallback keyword search
 */
async function fallbackKeywordSearch(
  query: string,
  type: MediaType | undefined,
  limit: number,
): Promise<SearchResult[]> {
  const result = await mediaService.searchMedia({
    query,
    type,
    limit,
    offset: 0,
  });

  return result.items.map((item) => ({
    id: item.id,
    type: item.type,
    title: item.title,
    description: item.description,
    releaseYear: item.releaseYear,
    posterUrl: item.posterUrl,
    score: 0.5,
    tags: item.tags.map((t) => ({ name: t.name })),
  }));
}

/**
 * Get similar items to a given media item
 */
export async function getSimilarItems(
  mediaId: string,
  options: { limit?: number; crossMedia?: boolean } = {},
): Promise<SearchResult[]> {
  const { limit = 5, crossMedia = true } = options;

  const media = await prisma.mediaItem.findUnique({
    where: { id: mediaId },
    include: {
      embedding: true,
      tags: { include: { tag: true } },
    },
  });

  if (!media) {
    throw ApiError.notFound("Media item not found");
  }

  // 1. Try Pinecone Search
  try {
    const embeddingValues = parseEmbeddingValues(media.embedding.values);
    if (
      embeddingValues.length > 0 &&
      (await pineconeService.isPineconeAvailable())
    ) {
      console.log("🌲 Using Pinecone for similarity...");
      const pineconeResults = await pineconeService.queryVectors({
        vector: embeddingValues,
        topK: limit,
        filter: !crossMedia ? { type: media.type } : undefined,
      });

      // Fetch full objects for the IDs returned by Pinecone
      // We need to preserve the order/scores from Pinecone
      const ids = pineconeResults
        .filter((r) => r.id !== mediaId) // Exclude self
        .map((r) => r.id);

      if (ids.length > 0) {
        const dbItems = await prisma.mediaItem.findMany({
          where: { id: { in: ids } },
          include: { tags: { include: { tag: true } } },
        });

        // Re-order and map
        const itemMap = new Map(dbItems.map((i) => [i.id, i]));

        return pineconeResults
          .filter((r) => r.id !== mediaId && itemMap.has(r.id))
          .map((r) => {
            const item = itemMap.get(r.id)!;
            return {
              id: item.id,
              type: item.type,
              title: item.title,
              description: item.description,
              releaseYear: item.releaseYear,
              posterUrl: item.posterUrl,
              score: r.score,
              tags: item.tags.map((t) => ({ name: t.tag.name })),
            };
          })
          .slice(0, limit);
      }
    }
  } catch (err) {
    console.error("Pinecone search failed, falling back to local:", err);
  }

  // 2. Local Fallback (if Pinecone fails or unavailable)
  const sourceEmbedding = media.embedding
    ? parseEmbeddingValues(media.embedding.values)
    : [];
  if (sourceEmbedding.length === 0) {
    return await getSimilarByTags(media, limit, crossMedia);
  }

  const queryEmbedding = sourceEmbedding;

  // Fetch candidates
  const candidates = await prisma.mediaItem.findMany({
    where: {
      id: { not: mediaId },
      ...(!crossMedia ? { type: media.type } : {}),
    },
    include: {
      embedding: true,
      tags: { include: { tag: true } },
    },
  });

  // Score
  const scored = candidates
    .filter((c) => {
      if (!c.embedding) return false;
      const vals = parseEmbeddingValues(c.embedding.values);
      return vals.length > 0;
    })
    .map((c) => ({
      item: c,
      score: cosineSimilarity(
        queryEmbedding,
        parseEmbeddingValues(c.embedding!.values),
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ item, score }) => ({
    id: item.id,
    type: item.type,
    title: item.title,
    description: item.description,
    releaseYear: item.releaseYear,
    posterUrl: item.posterUrl,
    score,
    tags: item.tags.map((mt) => ({ name: mt.tag.name })),
  }));
}

/**
 * Fallback: Get similar items by shared tags
 */
async function getSimilarByTags(
  media: { id: string; type: MediaType; tags: { tag: { name: string } }[] },
  limit: number,
  crossMedia: boolean,
): Promise<SearchResult[]> {
  const tagNames = media.tags.map((t) => t.tag.name);

  if (tagNames.length === 0) {
    return [];
  }

  const where = {
    id: { not: media.id },
    ...(crossMedia ? {} : { type: media.type }),
    tags: {
      some: {
        tag: {
          name: { in: tagNames },
        },
      },
    },
  };

  const similar = await prisma.mediaItem.findMany({
    where,
    include: {
      tags: { include: { tag: true } },
    },
    take: limit,
  });

  return similar.map((item) => ({
    id: item.id,
    type: item.type,
    title: item.title,
    description: item.description,
    releaseYear: item.releaseYear,
    posterUrl: item.posterUrl,
    score: 0.5,
    tags: item.tags.map((mt) => ({ name: mt.tag.name })),
  }));
}

export default { memorySearch, getSimilarItems };
