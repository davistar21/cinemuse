import prisma from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { MediaType } from "@prisma/client";
import * as embeddingService from "./embedding.service.js";
import * as pineconeService from "./pinecone.service.js";
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
 * Memory-based semantic search using Pinecone
 */
export async function memorySearch(
  params: MemorySearchParams,
): Promise<SearchResult[]> {
  const { query, type, limit = 10 } = params;

  // Check if Pinecone is available
  const pineconeAvailable = await pineconeService.isPineconeAvailable();

  if (!pineconeAvailable) {
    console.warn("Pinecone unavailable, falling back to keyword search");
    return await fallbackKeywordSearch(query, type, limit);
  }

  try {
    // Generate query embedding
    const queryEmbedding = await embeddingService.generateQueryEmbedding(query);

    // Search Pinecone
    const vectorResults = await pineconeService.queryVectors({
      vector: queryEmbedding,
      topK: limit,
      filter: type ? { type } : undefined,
    });

    if (vectorResults.length === 0) {
      return [];
    }

    // Get full media data from PostgreSQL
    const mediaIds = vectorResults.map((r) => r.metadata.mediaId);
    const mediaItems = await prisma.mediaItem.findMany({
      where: { id: { in: mediaIds } },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    // Map results with scores
    const mediaMap = new Map(mediaItems.map((m) => [m.id, m]));
    const results: SearchResult[] = [];

    for (const vectorResult of vectorResults) {
      const media = mediaMap.get(vectorResult.metadata.mediaId);
      if (media) {
        results.push({
          id: media.id,
          type: media.type,
          title: media.title,
          description: media.description,
          releaseYear: media.releaseYear,
          posterUrl: media.posterUrl,
          score: vectorResult.score,
          tags: media.tags.map((mt) => ({ name: mt.tag.name })),
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Semantic search error:", error);
    // Fallback to keyword search
    return await fallbackKeywordSearch(query, type, limit);
  }
}

/**
 * Fallback keyword search when Pinecone is unavailable
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
    score: 0.5, // Fixed score for keyword matches
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

  // Get the media item
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

  // If no embedding exists, return empty or fallback
  if (!media.embedding) {
    console.warn(`No embedding for media ${mediaId}, using tags fallback`);
    return await getSimilarByTags(media, limit, crossMedia);
  }

  // Get the embedding from Pinecone and find similar
  const pineconeAvailable = await pineconeService.isPineconeAvailable();

  if (!pineconeAvailable) {
    return await getSimilarByTags(media, limit, crossMedia);
  }

  // Create embedding text and generate query
  const embeddingText = embeddingService.createMediaEmbeddingText({
    title: media.title,
    description: media.description,
    tags: media.tags.map((t) => t.tag.name),
  });

  const queryEmbedding =
    await embeddingService.generateQueryEmbedding(embeddingText);

  // Query for similar, excluding self
  const vectorResults = await pineconeService.queryVectors({
    vector: queryEmbedding,
    topK: limit + 1, // +1 to account for self
    filter: crossMedia ? undefined : { type: media.type },
  });

  // Filter out self and get media data
  const filteredResults = vectorResults.filter(
    (r) => r.metadata.mediaId !== mediaId,
  );
  const mediaIds = filteredResults
    .slice(0, limit)
    .map((r) => r.metadata.mediaId);

  const similarItems = await prisma.mediaItem.findMany({
    where: { id: { in: mediaIds } },
    include: {
      tags: { include: { tag: true } },
    },
  });

  const mediaMap = new Map(similarItems.map((m) => [m.id, m]));
  const results: SearchResult[] = [];

  for (const vectorResult of filteredResults.slice(0, limit)) {
    const item = mediaMap.get(vectorResult.metadata.mediaId);
    if (item) {
      results.push({
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        releaseYear: item.releaseYear,
        posterUrl: item.posterUrl,
        score: vectorResult.score,
        tags: item.tags.map((mt) => ({ name: mt.tag.name })),
      });
    }
  }

  return results;
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
    score: 0.5, // Fixed score for tag-based matches
    tags: item.tags.map((mt) => ({ name: mt.tag.name })),
  }));
}

export default { memorySearch, getSimilarItems };
