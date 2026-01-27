import prisma from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { MediaType } from "@prisma/client";
import * as embeddingService from "./embedding.service.js";
import * as mediaService from "./media.service.js";

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
    // We'll search for each keyword and aggregate results
    // Ideally we'd use a more complex query, but loop is simple for now

    const allResults = new Map<string, SearchResult>();

    // Also include original query
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
            score: term === query ? 1.0 : 0.8, // Higher score for exact original matches
            tags: item.tags.map((t) => ({ name: t.name })),
          });
        }
      });
    }

    return Array.from(allResults.values()).slice(0, limit);
  } catch (error) {
    console.error("Smart search error:", error);
    // Fallback to basic
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

  // Fallback to tags if no embedding
  if (!media.embedding || media.embedding.values.length === 0) {
    return await getSimilarByTags(media, limit, crossMedia);
  }

  const queryEmbedding = media.embedding.values;

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
    .filter((c) => c.embedding && c.embedding.values.length > 0)
    .map((c) => ({
      item: c,
      score: cosineSimilarity(queryEmbedding, c.embedding!.values),
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
