import { ApiError } from "../utils/ApiError.js";
import { pipeline } from "@xenova/transformers";

// Type definition for the pipeline function
type FeatureExtractionPipeline = (
  text: string | string[],
  options?: { pooling?: string; normalize?: boolean },
) => Promise<{ data: Float32Array }>;

// Singleton to hold the pipeline instance
let embeddingPipeline: FeatureExtractionPipeline | null = null;
const MODEL_NAME = "Xenova/all-MiniLM-L6-v2";

/**
 * Get or initialize the embedding pipeline
 */
async function getPipeline(): Promise<FeatureExtractionPipeline> {
  if (!embeddingPipeline) {
    console.log(`Loading local embedding model: ${MODEL_NAME}...`);
    // @ts-ignore - pipeline types are tricky
    embeddingPipeline = await pipeline("feature-extraction", MODEL_NAME);
    console.log("Model loaded successfully!");
  }
  return embeddingPipeline as FeatureExtractionPipeline;
}

export interface EmbeddingResponse {
  embedding: number[];
  model: string;
  usage: {
    totalTokens: number;
  };
}

/**
 * Generate embedding for a single text using local Transformer
 */
export async function generateEmbedding(
  text: string,
): Promise<EmbeddingResponse> {
  try {
    const pipe = await getPipeline();
    const output = await pipe(text, { pooling: "mean", normalize: true });

    // Convert Float32Array to number[]
    const embedding = Array.from(output.data);

    return {
      embedding,
      model: MODEL_NAME,
      usage: {
        totalTokens: text.length / 4, // Rough estimation
      },
    };
  } catch (error) {
    console.error("Embedding error:", error);
    throw ApiError.internal("Failed to generate embedding locally");
  }
}

/**
 * Generate embedding for a search query
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  const result = await generateEmbedding(query);
  return result.embedding;
}

/**
 * Generate embeddings for multiple texts (batch)
 */
export async function generateBatchEmbeddings(
  texts: string[],
): Promise<number[][]> {
  if (texts.length === 0) return [];

  // Xenova pipeline can handle batches, but for stability we'll map
  // or use the built-in batching if supported.
  // For safety and progress tracking, we'll do sequential or Promise.all here
  // since this model is fast.

  try {
    const pipe = await getPipeline();
    const embeddings: number[][] = [];

    // Process in small sub-batches to avoid memory spikes
    for (const text of texts) {
      const output = await pipe(text, { pooling: "mean", normalize: true });
      embeddings.push(Array.from(output.data));
    }

    return embeddings;
  } catch (error) {
    console.error("Batch embedding error:", error);
    throw ApiError.internal("Failed to generate batch embeddings locally");
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
