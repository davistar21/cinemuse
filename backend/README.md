# CineMuse Backend

The engine behind CineMuse's semantic discovery.

## 🛠️ Tech Stack

- **Node.js & Express:** Production-ready API structure.
- **Prisma:** Modern database toolkit for PostgreSQL.
- **Groq SDK:** High-performance LLM integration for query expansion.
- **Transformers.js:** Local embedding generation for efficient similarity scoring.
- **Zod:** Schema-first validation for all API inputs.

## 📂 Structure

- `src/controllers`: Request handling and response formatting.
- `src/services`: Business logic, AI integration, and DB interaction.
- `src/routes`: API endpoint definitions.
- `src/middleware`: Auth, error handling, and validation.
- `prisma/`: Database schema and seed data.

## 🤖 AI Search Flow

1. **Request:** User sends a natural language query.
2. **Expansion:** Groq (Llama 3) translates the query into conceptual keywords and similar titles.
3. **Database:** Postgres performs a broad keyword search against titles, descriptions, and tags.
4. **Ranking:** Results are ordered by relevance to the expanded concept set.

## 🔌 API Endpoints

### Search

- `POST /api/v1/search/memory` - Semantic/Memory-based search.
  - Body: `{ "query": string, "type": "MOVIE" | "BOOK" | "SHOW" | "GAME" }`

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

### Media

- `GET /api/v1/media` - Paginated media list.
- `GET /api/v1/media/:id` - Detailed view.

## 🚀 Local Development

1. `npm install`
2. Configure `.env` with `DATABASE_URL` and `GROQ_API_KEY`.
3. `npx prisma db push` to setup schema.
4. `npm run dev` to start.
