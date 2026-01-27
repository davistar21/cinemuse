# CineMuse - Discover Media Through Memories

CineMuse is an immersive, cinematic media discovery platform that uses AI to help you find movies, books, shows, and games based on natural language descriptions, moods, and "vibes" rather than just keywords.

![CineMuse Version 1.0](https://img.shields.io/badge/version-1.0.0-blueviolet)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black)
![Express](https://img.shields.io/badge/Backend-Express.js-blue)
![Groq](https://img.shields.io/badge/AI-Groq%20Llama%203-red)

## 🎨 The Vision

Most search engines are rigid. They require you to remember exactly what a title is. CineMuse is built for those "I remember a scene where..." or "I want something that feels like..." moments. Using a combination of local vector embeddings and Groq LLM-enhanced search, CineMuse understands context and emotion.

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+
- PostgreSQL database
- Groq API Key

### 2. Setup

**Clone the repository:**

```bash
git clone https://github.com/davistar21/cinemuse.git
cd cinemuse
```

**Backend Setup:**

```bash
cd backend
npm install
# Copy .env.example to .env and fill in your DATABASE_URL and GROQ_API_KEY
npx prisma db push
npx prisma db seed
npm run dev
```

**Frontend Setup:**

```bash
cd frontend
npm install
npm run dev
```

## 🏗️ Architecture

### [Backend](./backend)

- **Framework:** Express.js with TypeScript
- **ORM:** Prisma with PostgreSQL
- **AI Integration:**
  - **Local Embeddings:** `all-MiniLM-L6-v2` via Transformers.js for semantic understanding.
  - **Smart Expansion:** Groq (Llama 3) for translating natural language into database queries.
- **Search Logic:** Hybrid approach combining keyword matching with LLM query expansion.

### [Frontend](./frontend)

- **Framework:** Next.js 15 (App Router)
- **Styling:** Vanilla CSS with custom "Mood Palettes" (Noir, Sci-Fi, Romance, etc.)
- **State Management:** Zustand
- **Animations:** Framer Motion for cinematic transitions and parallax effects.

## 🛠️ Key Features

- **Memory Search:** Search for media using descriptive, emotional language.
- **Mood Palettes:** Dynamic UI that shifts color schemes based on the content's mood.
- **Cross-Media Discovery:** Find a book that feels like your favorite movie.
- **Collections:** Organize your discoveries into custom, aesthetic lists.

## 📄 License

MIT
