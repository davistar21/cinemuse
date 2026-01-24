import { Pinecone } from "@pinecone-database/pinecone";
import config from "../config/index.js";
import { ApiError } from "../utils/ApiError.js";
import { MediaType } from "@prisma/client";

// Pinecone client singleton
let pineconeClient: Pinecone | null = null;

/**
 * Get or initialize Pinecone client
 */
export function getPinecone(): Pinecone {
  if (!config.pinecone.apiKey) {
    throw ApiError.internal("Pinecone API key not configured");
  }

  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: config.pinecone.apiKey,
    });
  }

  return pineconeClient;
}

/**
 * Get Pinecone index
 */
export function getIndex() {
  return getPinecone().index(config.pinecone.index);
}

export interface VectorMetadata {
  mediaId: string;
  type: MediaType;
  title: string;
  releaseYear?: number;
  tags?: string[];
}

export interface UpsertVectorParams {
  id: string;
  values: number[];
  metadata: VectorMetadata;
}

/**
 * Convert VectorMetadata to Pinecone-compatible record
 */
function toPineconeMetadata(
  metadata: VectorMetadata,
): Record<string, string | number | boolean | string[]> {
  const result: Record<string, string | number | boolean | string[]> = {
    mediaId: metadata.mediaId,
    type: metadata.type,
    title: metadata.title,
  };

  if (metadata.releaseYear !== undefined) {
    result.releaseYear = metadata.releaseYear;
  }

  if (metadata.tags !== undefined) {
    result.tags = metadata.tags;
  }

  return result;
}

/**
 * Upsert a vector to Pinecone
 */
export async function upsertVector(params: UpsertVectorParams): Promise<void> {
  const index = getIndex();

  await index.upsert([
    {
      id: params.id,
      values: params.values,
      metadata: toPineconeMetadata(params.metadata),
    },
  ]);
}

/**
 * Upsert multiple vectors to Pinecone
 */
export async function upsertVectors(
  vectors: UpsertVectorParams[],
): Promise<void> {
  if (vectors.length === 0) return;

  const index = getIndex();

  // Batch in chunks of 100 (Pinecone limit)
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await index.upsert(
      batch.map((v) => ({
        id: v.id,
        values: v.values,
        metadata: toPineconeMetadata(v.metadata),
      })),
    );
  }
}

export interface QueryResult {
  id: string;
  score: number;
  metadata: VectorMetadata;
}

export interface QueryParams {
  vector: number[];
  topK?: number;
  filter?: {
    type?: MediaType;
    releaseYear?: { $gte?: number; $lte?: number };
  };
}

/**
 * Query Pinecone for similar vectors
 */
export async function queryVectors(
  params: QueryParams,
): Promise<QueryResult[]> {
  const index = getIndex();

  // Build filter
  const filter: Record<string, unknown> = {};
  if (params.filter?.type) {
    filter.type = params.filter.type;
  }
  if (params.filter?.releaseYear) {
    filter.releaseYear = params.filter.releaseYear;
  }

  try {
    const results = await index.query({
      vector: params.vector,
      topK: params.topK || 10,
      includeMetadata: true,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
    });

    return (results.matches || []).map((match) => ({
      id: match.id,
      score: match.score || 0,
      metadata: match.metadata as unknown as VectorMetadata,
    }));
  } catch (error) {
    console.error("Pinecone query error:", error);
    throw ApiError.internal("Vector search failed");
  }
}

/**
 * Delete a vector by ID
 */
export async function deleteVector(id: string): Promise<void> {
  const index = getIndex();
  await index.deleteOne(id);
}

/**
 * Delete multiple vectors by ID
 */
export async function deleteVectors(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const index = getIndex();
  await index.deleteMany(ids);
}

/**
 * Get index statistics
 */
export async function getIndexStats() {
  const index = getIndex();
  return await index.describeIndexStats();
}

/**
 * Check if Pinecone is available
 */
export async function isPineconeAvailable(): Promise<boolean> {
  try {
    if (!config.pinecone.apiKey) return false;
    await getIndexStats();
    return true;
  } catch {
    return false;
  }
}

export default {
  getPinecone,
  getIndex,
  upsertVector,
  upsertVectors,
  queryVectors,
  deleteVector,
  deleteVectors,
  getIndexStats,
  isPineconeAvailable,
};
