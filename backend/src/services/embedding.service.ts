import config from "../config/index.js";
import { ApiError } from "../utils/ApiError.js";

interface VoyageEmbeddingData {
  data: Array<{ embedding: number[] }>;
  usage?: { total_tokens: number };
}

export interface EmbeddingResponse {
  embedding: number[];
  model: string;
  usage: {
    totalTokens: number;
  };
}

/**
 * Generate embedding for a text using Voyage AI
 */
export async function generateEmbedding(
  text: string,
): Promise<EmbeddingResponse> {
  if (!config.voyage.apiKey) {
    throw ApiError.internal("Voyage AI API key not configured");
  }

  try {
    const response = await fetch(`${config.voyage.baseUrl}/embeddings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.voyage.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.voyage.model,
        input: text,
        input_type: "document",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Voyage AI error:", error);
      throw ApiError.internal(
        `Embedding generation failed: ${response.status}`,
      );
    }

    const data = (await response.json()) as VoyageEmbeddingData;

    return {
      embedding: data.data[0].embedding,
      model: config.voyage.model,
      usage: {
        totalTokens: data.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Embedding error:", error);
    throw ApiError.internal("Failed to generate embedding");
  }
}

/**
 * Generate embedding for a search query
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  if (!config.voyage.apiKey) {
    throw ApiError.internal("Voyage AI API key not configured");
  }

  try {
    const response = await fetch(`${config.voyage.baseUrl}/embeddings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.voyage.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.voyage.model,
        input: query,
        input_type: "query", // Optimized for queries
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Voyage AI error:", error);
      throw ApiError.internal(`Query embedding failed: ${response.status}`);
    }

    const data = (await response.json()) as VoyageEmbeddingData;
    return data.data[0].embedding;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Query embedding error:", error);
    throw ApiError.internal("Failed to generate query embedding");
  }
}

/**
 * Generate embeddings for multiple texts (batch)
 */
export async function generateBatchEmbeddings(
  texts: string[],
): Promise<number[][]> {
  if (!config.voyage.apiKey) {
    throw ApiError.internal("Voyage AI API key not configured");
  }

  if (texts.length === 0) return [];
  if (texts.length > 128) {
    throw ApiError.badRequest("Maximum 128 texts per batch");
  }

  try {
    const response = await fetch(`${config.voyage.baseUrl}/embeddings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.voyage.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.voyage.model,
        input: texts,
        input_type: "document",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Voyage AI batch error:", error);
      throw ApiError.internal(`Batch embedding failed: ${response.status}`);
    }

    const data = (await response.json()) as VoyageEmbeddingData;
    return data.data.map((item) => item.embedding);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Batch embedding error:", error);
    throw ApiError.internal("Failed to generate batch embeddings");
  }
}

/**
 * Create a composite text for embedding a media item
 */
export function createMediaEmbeddingText(media: {
  title: string;
  description?: string | null;
  tags?: string[];
}): string {
  const parts = [media.title];

  if (media.description) {
    parts.push(media.description);
  }

  if (media.tags && media.tags.length > 0) {
    parts.push(`Tags: ${media.tags.join(", ")}`);
  }

  return parts.join("\n\n");
}

export default {
  generateEmbedding,
  generateQueryEmbedding,
  generateBatchEmbeddings,
  createMediaEmbeddingText,
};
