# Voyage AI Setup Guide

Step-by-step instructions to get your Voyage AI API key for CineMuse embeddings.

---

## What is Voyage AI?

Voyage AI provides high-quality text embeddings optimized for semantic search. We'll use it to convert movie/book descriptions into vectors that Pinecone can search.

**Free Tier:** 50 million tokens/month (more than enough for MVP)

---

## Step 1: Create an Account

1. Go to [https://www.voyageai.com/](https://www.voyageai.com/)
2. Click **"Get Started"** or **"Sign Up"**
3. Sign up with your email or Google account
4. Verify your email if required

---

## Step 2: Get Your API Key

1. After logging in, go to the **Dashboard**
2. Navigate to **API Keys** section (usually in the sidebar or under Settings)
3. Click **"Create API Key"** or copy your existing key
4. **Important:** Copy this key immediately — you won't be able to see it again!

---

## Step 3: Add to Your Environment

Add this to your `backend/.env` file:

```env
# Voyage AI Configuration
VOYAGE_API_KEY=your_voyage_api_key_here
VOYAGE_MODEL=voyage-2
```

### Available Models

| Model                     | Dimensions | Best For                        |
| ------------------------- | ---------- | ------------------------------- |
| `voyage-2`                | 1024       | General purpose (recommended)   |
| `voyage-large-2`          | 1536       | Higher accuracy, more expensive |
| `voyage-lite-02-instruct` | 1024       | Faster, slightly lower quality  |

**We'll use `voyage-2`** — best balance of quality and speed.

---

## Step 4: Verify It Works

Once the backend is set up, you can test with:

```bash
curl https://api.voyageai.com/v1/embeddings \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "voyage-2",
    "input": "A movie about time loops"
  }'
```

You should get a response with a `data` array containing your embedding vector.

---

## Usage Limits (Free Tier)

| Limit            | Value                 |
| ---------------- | --------------------- |
| Monthly tokens   | 50,000,000            |
| Rate limit       | 300 requests/minute   |
| Max input length | 4,000 tokens per text |

This is **more than enough** for our MVP. A typical movie description is ~100 tokens.

---

## Environment Variables Summary

```env
VOYAGE_API_KEY=pa-xxxxxxxxxxxxxxxxxxxxxxxx
VOYAGE_MODEL=voyage-2
```

---

## Troubleshooting

### "Invalid API Key" Error

- Double-check you copied the full key
- Make sure there are no extra spaces
- Verify the key is active in your Voyage AI dashboard

### Rate Limit Errors

- The free tier allows 300 requests/minute
- If you hit this, implement request batching (already planned in our backend)

---

## Next Steps

Once you have your API key:

1. Add it to `backend/.env`
2. Set up Pinecone (for storing the vectors)
3. Set up Render PostgreSQL (for storing media data)

✅ **You're ready for embeddings!**
