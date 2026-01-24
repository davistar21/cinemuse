# Pinecone Setup Guide

Step-by-step instructions to set up Pinecone vector database for CineMuse semantic search.

---

## What is Pinecone?

Pinecone is a vector database that stores embeddings and enables fast similarity search. When a user describes a movie from memory, we:

1. Convert their description → embedding (via Voyage AI)
2. Search Pinecone for similar embeddings
3. Return matching movies/books/shows

**Free Tier:** 1 index, 100K vectors, 1 pod (more than enough for MVP)

---

## Step 1: Create a Pinecone Account

1. Go to [https://www.pinecone.io/](https://www.pinecone.io/)
2. Click **"Start Free"** or **"Sign Up"**
3. Sign up with Google, GitHub, or email
4. Verify your email if required

---

## Step 2: Create an Index

After logging in:

1. Click **"Create Index"** (or you'll be prompted on first login)
2. Fill in the details:

| Field             | Value                                  |
| ----------------- | -------------------------------------- |
| **Index Name**    | `cinemuse`                             |
| **Dimensions**    | `1024`                                 |
| **Metric**        | `cosine`                               |
| **Cloud**         | AWS                                    |
| **Region**        | `us-east-1` (or closest to you)        |
| **Capacity Mode** | Serverless (recommended for free tier) |

3. Click **"Create Index"**

> ⚠️ **Important:** Dimensions must match the embedding model!
>
> - Voyage `voyage-2` = **1024** dimensions
> - If you switch models later, you'll need a new index

---

## Step 3: Get Your API Key

1. In the Pinecone console, go to **"API Keys"** (left sidebar)
2. Copy your **default API key**
3. Note your **Environment** (e.g., `us-east-1-aws`)

---

## Step 4: Add to Your Environment

Add this to your `backend/.env` file:

```env
# Pinecone Configuration
PINECONE_API_KEY=pcsk_xxxxxxxxxxxxxxxxxxxxxxxx
PINECONE_INDEX=cinemuse
```

> 💡 The new Pinecone SDK (v2+) doesn't require environment — it's embedded in the API key.

---

## Step 5: Verify It Works

Once the backend is set up, you can test with this Node.js snippet:

```javascript
import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({ apiKey: "YOUR_API_KEY" });
const index = pc.index("cinemuse");

// Check index stats
const stats = await index.describeIndexStats();
console.log(stats);
// Should show: { namespaces: {}, dimension: 1024, ... }
```

---

## Understanding the Index Structure

### What We Store

For each media item, we store:

```javascript
{
  id: "media_abc123",           // Unique ID
  values: [0.1, 0.2, ...],      // 1024-dim embedding vector
  metadata: {
    mediaId: "abc123",          // Reference to PostgreSQL
    type: "MOVIE",              // MOVIE | BOOK | SHOW | GAME
    title: "Groundhog Day",     // For display in results
    releaseYear: 1993,          // For filtering
    tags: ["comedy", "time-loop", "romance"]
  }
}
```

### How Queries Work

```javascript
// User searches: "movie where guy keeps reliving same day"
const results = await index.query({
  vector: userQueryEmbedding, // 1024-dim vector
  topK: 10, // Get top 10 matches
  filter: { type: "MOVIE" }, // Optional: filter by type
  includeMetadata: true,
});

// Returns: [{ id, score, metadata }, ...]
```

---

## Free Tier Limits

| Limit         | Value          |
| ------------- | -------------- |
| Indexes       | 1              |
| Vectors       | 100,000        |
| Pods          | 1 (serverless) |
| Queries/month | Unlimited      |
| Storage       | 2 GB           |

### What This Means for CineMuse

- **100K vectors** = 100K media items with embeddings
- Way more than enough for MVP
- Can store movies, books, shows, and games combined

---

## Environment Variables Summary

```env
PINECONE_API_KEY=pcsk_xxxxxxxxxxxxxxxxxxxxxxxx
PINECONE_INDEX=cinemuse
```

---

## Troubleshooting

### "Index not found" Error

- Double-check the index name matches exactly: `cinemuse`
- Make sure the index finished creating (takes 1-2 minutes)
- Verify you're using the correct API key

### "Dimension mismatch" Error

- Your embedding dimensions don't match the index
- Voyage `voyage-2` produces 1024 dimensions
- The index must be created with `dimensions: 1024`

### Rate Limit Errors

- Unlikely on free tier for normal usage
- If hit, implement request batching

---

## Index Management Commands

Useful commands for the Pinecone console or API:

```javascript
// Get index stats
const stats = await index.describeIndexStats();

// Delete all vectors (start fresh)
await index.deleteAll();

// Delete specific vectors
await index.deleteMany(["id1", "id2"]);
```

---

## Next Steps

1. ✅ Create Pinecone account
2. ✅ Create `cinemuse` index with 1024 dimensions
3. ✅ Copy API key to `.env`
4. Run backend seed script to populate vectors
5. Test semantic search!

✅ **Your vector database is ready!**
