# CineMuse Backend

Memory-based media discovery and recommendation API.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Vector DB:** Pinecone
- **Embeddings:** Voyage AI

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (see [Render setup guide](../docs/render-setup.md))
- Pinecone account (see [Pinecone setup guide](../docs/pinecone-setup.md))
- Voyage AI account (see [Voyage AI setup guide](../docs/voyage-ai-setup.md))

### Installation

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Fill in your environment variables in .env
```

### Environment Variables

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
VOYAGE_API_KEY=pa-xxx
VOYAGE_MODEL=voyage-2
PINECONE_API_KEY=pcsk_xxx
PINECONE_INDEX=cinemuse
```

### Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio
npm run db:studio
```

### Running

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

## API Endpoints

### Authentication

| Method | Endpoint                | Description       |
| ------ | ----------------------- | ----------------- |
| POST   | `/api/v1/auth/register` | Register new user |
| POST   | `/api/v1/auth/login`    | Login user        |
| GET    | `/api/v1/auth/me`       | Get current user  |

### Media

| Method | Endpoint                    | Description       | Auth  |
| ------ | --------------------------- | ----------------- | ----- |
| GET    | `/api/v1/media`             | List all media    | -     |
| GET    | `/api/v1/media/search?q=`   | Keyword search    | -     |
| GET    | `/api/v1/media/:id`         | Get media by ID   | -     |
| GET    | `/api/v1/media/:id/similar` | Get similar items | -     |
| POST   | `/api/v1/media`             | Create media      | Admin |
| PATCH  | `/api/v1/media/:id`         | Update media      | Admin |
| DELETE | `/api/v1/media/:id`         | Delete media      | Admin |

### Search

| Method | Endpoint                | Description            |
| ------ | ----------------------- | ---------------------- |
| POST   | `/api/v1/search/memory` | Semantic memory search |

**Example:**

```json
POST /api/v1/search/memory
{
  "query": "A movie where a guy keeps reliving the same day",
  "type": "MOVIE",
  "limit": 5
}
```

### Lists

| Method | Endpoint                          | Description    | Auth    |
| ------ | --------------------------------- | -------------- | ------- |
| POST   | `/api/v1/lists`                   | Create list    | User    |
| GET    | `/api/v1/lists/:id`               | Get list       | Partial |
| PATCH  | `/api/v1/lists/:id`               | Update list    | Owner   |
| DELETE | `/api/v1/lists/:id`               | Delete list    | Owner   |
| POST   | `/api/v1/lists/:id/items`         | Add item       | Owner   |
| DELETE | `/api/v1/lists/:id/items/:itemId` | Remove item    | Owner   |
| GET    | `/api/v1/users/:userId/lists`     | Get user lists | Partial |

## Project Structure

```
src/
├── config/          # Configuration & database
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Helpers
├── validations/     # Zod schemas
├── app.ts           # Express app
└── server.ts        # Entry point
```

## Scripts

| Script                | Description              |
| --------------------- | ------------------------ |
| `npm run dev`         | Start development server |
| `npm run build`       | Build for production     |
| `npm start`           | Start production server  |
| `npm run db:generate` | Generate Prisma client   |
| `npm run db:migrate`  | Run migrations           |
| `npm run db:push`     | Push schema to DB        |
| `npm run db:seed`     | Seed database            |
| `npm run db:studio`   | Open Prisma Studio       |
