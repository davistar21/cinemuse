/**
 * Embeddings Sync Script
 *
 * This script generates embeddings for all media items using LOCAL Transformers.js
 * and stores them in PostgreSQL (media_embeddings table).
 *
 * Run with: npm run embeddings:sync
 */

import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

import { PrismaClient } from "@prisma/client";
import embeddingService from "../src/services/embedding.service.js"; // Import local service source

const prisma = new PrismaClient();

const BATCH_SIZE = 5; // Smaller batch for local processing

async function main() {
  console.log("🚀 Starting LOCAL embeddings sync...\n");

  // Fetch all media items
  const mediaItems = await prisma.mediaItem.findMany({
    include: {
      tags: {
        include: { tag: true },
      },
      embedding: true,
    },
  });

  console.log(`📚 Found ${mediaItems.length} media items\n`);

  // Filter items without embeddings OR without values (old format)
  const itemsToProcess = mediaItems.filter(
    (item) => !item.embedding || item.embedding.values.length === 0,
  );

  if (itemsToProcess.length === 0) {
    console.log("✅ All items already have local embeddings!");
    return;
  }

  console.log(
    `🔄 Processing ${itemsToProcess.length} items without local embeddings...\n`,
  );

  // Process in batches
  for (let i = 0; i < itemsToProcess.length; i += BATCH_SIZE) {
    const batch = itemsToProcess.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(itemsToProcess.length / BATCH_SIZE);

    console.log(`📦 Batch ${batchNum}/${totalBatches}`);

    // Create embedding texts
    const texts = batch.map((item) =>
      embeddingService.createMediaEmbeddingText({
        title: item.title,
        description: item.description,
        tags: item.tags.map((t) => t.tag.name),
      }),
    );

    // Generate embeddings locally
    console.log("   🧠 Generating local embeddings...");
    const embeddings = await embeddingService.generateBatchEmbeddings(texts);

    // Save to PostgreSQL
    console.log("   💾 Saving to database...");

    for (let j = 0; j < batch.length; j++) {
      const item = batch[j];
      const vector = embeddings[j];

      // Upsert embedding
      await prisma.mediaEmbedding.upsert({
        where: { mediaId: item.id },
        create: {
          mediaId: item.id,
          values: vector,
          modelVersion: "all-MiniLM-L6-v2",
          // Pinecone ID is optional now, set null or random if constraint exists
          pineconeId: `local_${item.id}`,
        },
        update: {
          values: vector,
          modelVersion: "all-MiniLM-L6-v2",
          pineconeId: `update_local_${item.id}`,
        },
      });

      console.log(`   ✓ ${item.type}: ${item.title}`);
    }

    console.log("");
  }

  console.log("✅ Local Embeddings sync complete!");
}

main()
  .catch((e) => {
    console.error("❌ Sync failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
