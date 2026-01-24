/**
 * Embeddings Sync Script
 *
 * This script generates embeddings for all media items and stores them in Pinecone.
 * Run after seeding the database to enable semantic search.
 *
 * Run with: npm run embeddings:sync
 */

import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================
// CONFIG
// ============================================

const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY;
const VOYAGE_MODEL = process.env.VOYAGE_MODEL || "voyage-2";
const VOYAGE_BASE_URL = "https://api.voyageai.com/v1";

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX || "cinemuse";

const BATCH_SIZE = 10; // Process 10 items at a time

// ============================================
// HELPERS
// ============================================

/**
 * Create embedding text from media item
 */
function createEmbeddingText(media: {
  title: string;
  description: string | null;
  tags: string[];
}): string {
  const parts = [media.title];

  if (media.description) {
    parts.push(media.description);
  }

  if (media.tags.length > 0) {
    parts.push(`Tags: ${media.tags.join(", ")}`);
  }

  return parts.join("\n\n");
}

/**
 * Generate embeddings using Voyage AI
 */
async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (!VOYAGE_API_KEY) {
    throw new Error("VOYAGE_API_KEY not set in environment");
  }

  const response = await fetch(`${VOYAGE_BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VOYAGE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: VOYAGE_MODEL,
      input: texts,
      input_type: "document",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Voyage AI error: ${response.status} - ${error}`);
  }

  const data = (await response.json()) as {
    data: Array<{ embedding: number[] }>;
    usage?: { total_tokens: number };
  };

  console.log(`   📊 Used ${data.usage?.total_tokens || 0} tokens`);

  return data.data.map((item) => item.embedding);
}

/**
 * Upsert vectors to Pinecone
 */
async function upsertToPinecone(
  vectors: Array<{
    id: string;
    values: number[];
    metadata: Record<string, string | number | string[]>;
  }>,
): Promise<void> {
  if (!PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY not set in environment");
  }

  // Get the index host from Pinecone
  const indexResponse = await fetch(
    `https://api.pinecone.io/indexes/${PINECONE_INDEX}`,
    {
      headers: {
        "Api-Key": PINECONE_API_KEY,
      },
    },
  );

  if (!indexResponse.ok) {
    const error = await indexResponse.text();
    throw new Error(`Failed to get Pinecone index info: ${error}`);
  }

  const indexInfo = (await indexResponse.json()) as { host: string };
  const host = indexInfo.host;

  // Upsert vectors
  const upsertResponse = await fetch(`https://${host}/vectors/upsert`, {
    method: "POST",
    headers: {
      "Api-Key": PINECONE_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ vectors }),
  });

  if (!upsertResponse.ok) {
    const error = await upsertResponse.text();
    throw new Error(`Pinecone upsert error: ${error}`);
  }
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log("🚀 Starting embeddings sync...\n");

  // Validate environment
  if (!VOYAGE_API_KEY) {
    console.error(
      "❌ VOYAGE_API_KEY not set. Please add it to your .env file.",
    );
    console.error("   See docs/voyage-ai-setup.md for instructions.");
    process.exit(1);
  }

  if (!PINECONE_API_KEY) {
    console.error(
      "❌ PINECONE_API_KEY not set. Please add it to your .env file.",
    );
    console.error("   See docs/pinecone-setup.md for instructions.");
    process.exit(1);
  }

  // Fetch all media items without embeddings (or all for re-sync)
  const mediaItems = await prisma.mediaItem.findMany({
    include: {
      tags: {
        include: { tag: true },
      },
      embedding: true,
    },
  });

  console.log(`📚 Found ${mediaItems.length} media items\n`);

  // Filter items without embeddings
  const itemsToProcess = mediaItems.filter((item) => !item.embedding);

  if (itemsToProcess.length === 0) {
    console.log("✅ All items already have embeddings!");
    console.log(
      "   To re-generate all embeddings, delete them from the database first.",
    );
    return;
  }

  console.log(
    `🔄 Processing ${itemsToProcess.length} items without embeddings...\n`,
  );

  // Process in batches
  for (let i = 0; i < itemsToProcess.length; i += BATCH_SIZE) {
    const batch = itemsToProcess.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(itemsToProcess.length / BATCH_SIZE);

    console.log(`📦 Batch ${batchNum}/${totalBatches}`);

    // Create embedding texts
    const texts = batch.map((item) =>
      createEmbeddingText({
        title: item.title,
        description: item.description,
        tags: item.tags.map((t) => t.tag.name),
      }),
    );

    // Generate embeddings
    console.log("   🧠 Generating embeddings...");
    const embeddings = await generateEmbeddings(texts);

    // Prepare vectors for Pinecone
    const vectors = batch.map((item, index) => ({
      id: `media_${item.id}`,
      values: embeddings[index],
      metadata: {
        mediaId: item.id,
        type: item.type,
        title: item.title,
        releaseYear: item.releaseYear || 0,
        tags: item.tags.map((t) => t.tag.name),
      },
    }));

    // Upsert to Pinecone
    console.log("   📤 Uploading to Pinecone...");
    await upsertToPinecone(vectors);

    // Save embedding records to PostgreSQL
    for (const item of batch) {
      await prisma.mediaEmbedding.create({
        data: {
          mediaId: item.id,
          pineconeId: `media_${item.id}`,
          modelVersion: VOYAGE_MODEL,
        },
      });
    }

    // Log progress
    for (const item of batch) {
      console.log(`   ✓ ${item.type}: ${item.title}`);
    }

    console.log("");

    // Small delay to avoid rate limits
    if (i + BATCH_SIZE < itemsToProcess.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log("✅ Embeddings sync complete!");
  console.log(`   - ${itemsToProcess.length} items processed`);
  console.log("\n🔍 You can now test semantic search!");
  console.log(
    '   Try: POST /api/v1/search/memory with {"query": "movie about time loops"}',
  );
}

main()
  .catch((e) => {
    console.error("❌ Sync failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
