# Render Setup Guide

Step-by-step instructions to set up PostgreSQL database and backend hosting on Render.

---

## What We're Setting Up

1. **PostgreSQL Database** — Free tier, 256MB storage
2. **Web Service** — For hosting the Express.js backend (later)

---

## Part 1: PostgreSQL Database Setup

### Step 1: Create a Render Account

1. Go to [https://render.com/](https://render.com/)
2. Click **"Get Started for Free"**
3. Sign up with GitHub, GitLab, or email
4. Verify your email if required

---

### Step 2: Create a PostgreSQL Database

1. From your Render Dashboard, click **"New +"** button
2. Select **"PostgreSQL"**
3. Fill in the details:

| Field                  | Value                                                                |
| ---------------------- | -------------------------------------------------------------------- |
| **Name**               | `cinemuse-db`                                                        |
| **Database**           | `cinemuse`                                                           |
| **User**               | Leave as default (auto-generated)                                    |
| **Region**             | Choose closest to you (e.g., `Oregon (US West)` or `Frankfurt (EU)`) |
| **PostgreSQL Version** | `16` (latest)                                                        |
| **Instance Type**      | **Free**                                                             |

4. Click **"Create Database"**

---

### Step 3: Get Your Connection String

1. Wait for the database to finish creating (takes 1-2 minutes)
2. Once ready, click on your database name
3. Scroll down to **"Connections"** section
4. Find **"External Database URL"** — this is your connection string
5. Click the **copy** button

The URL looks like this:

```
postgresql://user:password@host.render.com:5432/cinemuse
```

---

### Step 4: Add to Your Environment

Add this to your `backend/.env` file:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@host.render.com:5432/cinemuse
```

> ⚠️ **Important:** This is a sensitive credential. Never commit it to git!

---

## Part 2: Backend Web Service Setup (Do This Later)

When you're ready to deploy the backend:

### Step 1: Create a Web Service

1. From Render Dashboard, click **"New +"**
2. Select **"Web Service"**
3. Connect your GitHub/GitLab repository
4. Fill in the details:

| Field              | Value                                                 |
| ------------------ | ----------------------------------------------------- |
| **Name**           | `cinemuse-api`                                        |
| **Region**         | Same as your database                                 |
| **Branch**         | `main`                                                |
| **Root Directory** | `backend`                                             |
| **Runtime**        | `Node`                                                |
| **Build Command**  | `npm install && npm run build && npm run db:generate` |
| **Start Command**  | `npm start`                                           |
| **Instance Type**  | **Free**                                              |

---

### Step 2: Add Environment Variables

In the web service settings, add these environment variables:

| Key                | Value                         |
| ------------------ | ----------------------------- |
| `DATABASE_URL`     | Your PostgreSQL external URL  |
| `JWT_SECRET`       | A random 32+ character string |
| `VOYAGE_API_KEY`   | Your Voyage AI key            |
| `VOYAGE_MODEL`     | `voyage-2`                    |
| `PINECONE_API_KEY` | Your Pinecone key             |
| `PINECONE_INDEX`   | `cinemuse`                    |
| `NODE_ENV`         | `production`                  |
| `PORT`             | `3001`                        |

---

### Step 3: Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy
3. Your API will be available at: `https://cinemuse-api.onrender.com`

---

## Free Tier Limits

### PostgreSQL

| Limit       | Value                           |
| ----------- | ------------------------------- |
| Storage     | 256 MB                          |
| Connections | 97 max                          |
| Retention   | 90 days of inactivity → deleted |

### Web Service

| Limit     | Value                   |
| --------- | ----------------------- |
| RAM       | 512 MB                  |
| CPU       | Shared                  |
| Sleep     | After 15 min inactivity |
| Bandwidth | 100 GB/month            |

> 💡 **Tip:** Free web services "sleep" after 15 minutes of inactivity. First request after sleep takes ~30 seconds. For MVP/development, this is fine.

---

## Environment Variables Summary

For local development, your `backend/.env` should have:

```env
# Server
PORT=3001
NODE_ENV=development

# Database (from Render)
DATABASE_URL=postgresql://user:password@host.render.com:5432/cinemuse

# JWT
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters

# Voyage AI
VOYAGE_API_KEY=pa-xxxxxxxxxxxxxxxxxxxxxxxx
VOYAGE_MODEL=voyage-2

# Pinecone (set up separately)
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX=cinemuse
```

---

## Troubleshooting

### "Connection refused" Error

- Make sure you're using the **External Database URL**, not Internal
- Check if your IP is blocked (shouldn't be on free tier)
- Verify the database is running in Render dashboard

### "Database does not exist" Error

- The database name in your URL should match what you created
- Try running `npm run db:push` to create tables

### Slow First Request After Deploy

- Normal for free tier — service sleeps after 15 min
- First request wakes it up (~30 seconds)

---

## Next Steps

1. ✅ Create PostgreSQL database on Render
2. ✅ Copy the External Database URL to `.env`
3. Set up Pinecone (separate guide coming)
4. Run `npm run db:push` to create tables
5. Deploy backend when ready

✅ **Your database is ready!**
