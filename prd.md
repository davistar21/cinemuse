- Frontend: **Next.js**
- Backend: **Express**
- ORM: **Prisma**
- DB: **PostgreSQL**
- Vector DB: **Pinecone (free tier)**
- Hosting: **Render**
- Budget-aware, but production-minded

No fluff. This is something you could hand to yourself or a teammate and start building immediately.

---

# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Product Name (CineMuse)

**Recall** (placeholder)
_A memory-based media discovery and recommendation platform._

---

## 1. Product Overview

### 1.1 Problem Statement

People often remember **fragments** of a story, not its title:

- a scene
- a vibe
- a character type
- a vague plot point

Existing platforms (IMDb, Goodreads, Letterboxd) assume users already know _what they’re looking for_.

### 1.2 Solution

Recall allows users to:

- Describe a movie/book/show/game **from memory**
- Get **likely matches** using semantic similarity
- Receive **cross-media recommendations** based on taste, mood, and themes
- Curate personal lists and contribute community tags

---

## 2. Goals & Non-Goals

### 2.1 Goals

- Accurate “memory-based identification”
- Fast semantic search (<500ms for top results)
- Clean, maintainable backend architecture
- Scalable data model (even on free tiers)
- Strong backend ownership (no BaaS shortcuts)

### 2.2 Non-Goals (for MVP)

- Real-time chat or AI agents
- Full LLM conversations
- Social feeds or messaging
- Monetization

---

## 3. Target Users

### Primary

- Movie / book / series enthusiasts
- People who “half-remember” stories
- Students, creators, binge-watchers

### Secondary

- Writers researching inspiration
- Gamers discovering narrative-driven games
- Communities like TikTok “help me find this movie” posters

---

## 4. Core User Flows

### 4.1 Identify-from-Memory Flow

1. User enters a free-text description
2. Backend converts input → embedding
3. Pinecone similarity search
4. Results ranked + filtered
5. User clicks a result → detail page

### 4.2 Recommendation Flow

1. User views a title
2. Backend finds similar embeddings
3. Returns cross-media recommendations
4. User saves to list

### 4.3 Personal Curation Flow

1. User creates a list
2. Adds items
3. Leaves notes or reviews
4. Lists appear on profile

---

## 5. Functional Requirements

### 5.1 Authentication

- Email + password (JWT)
- Optional OAuth later
- Roles:
  - USER
  - ADMIN (internal moderation)

### 5.2 Media Entities

Supported types:

- Movie
- Book
- TV Show
- Game

Each item must support:

- Metadata
- Tags
- Embeddings
- User-generated content

### 5.3 Search & Discovery

- Keyword search (Postgres full-text)
- Semantic search (Pinecone)
- Hybrid ranking (semantic + metadata boost)

### 5.4 Lists & Profiles

- Custom lists (watchlist, readlist, etc.)
- Favorites
- Reviews (simple text + rating)

---

## 6. Non-Functional Requirements

### Performance

- Search response < 700ms
- Pinecone query < 300ms

### Scalability

- Stateless API
- Batch embedding ingestion
- Background jobs for heavy processing

### Reliability

- Graceful failure if Pinecone is unavailable
- Cached popular queries

---

## 7. Backend Architecture (MANDATORY)

```
Next.js Frontend
      ↓
Express API (Render)
      ↓
Prisma ORM
      ↓
PostgreSQL
      ↓
Pinecone (Vectors)
```

### API Style

- REST (clean, explicit endpoints)
- Versioned (`/api/v1`)

---

## 8. Data Model (High-Level)

### User

```
id
email
password_hash
username
created_at
```

### MediaItem

```
id
type (MOVIE | BOOK | SHOW | GAME)
title
description
release_year
language
created_at
```

### MediaEmbedding

```
media_id
embedding_id (pinecone)
model_version
```

### Tag

```
id
name
category (mood | theme | genre | trope)
```

### MediaTag

```
media_id
tag_id
```

### Review

```
id
user_id
media_id
rating
content
created_at
```

### List

```
id
user_id
name
description
```

### ListItem

```
list_id
media_id
order
```

---

## 9. Vector Search Requirements (Pinecone)

### Index

- One main index
- Dimension depends on embedding model (e.g. 384 / 768)

### Stored Metadata

- media_id
- type
- release_year
- tags

### Queries

- Top-K similarity search
- Metadata filtering by type/year
- Optional re-ranking in backend

---

## 10. Embedding Strategy

### MVP

- Single embedding per media item
- Source text:
  - title
  - description
  - tags
  - themes

- User query embedded the same way

### Versioning

- Store `model_version`
- Allow re-embedding later without breaking queries

---

## 11. API Endpoints (Initial)

### Auth

- `POST /auth/register`
- `POST /auth/login`

### Media

- `GET /media/:id`
- `GET /media/search?q=`
- `POST /media` (admin only)

### Memory Search

- `POST /search/memory`

```json
{
  "query": "A movie about time loops and regret"
}
```

### Lists

- `POST /lists`
- `POST /lists/:id/items`
- `GET /users/:id/lists`

---

## 12. Error Handling

- Clear error codes
- Pinecone failures → fallback to keyword search
- Rate-limit search endpoints

---

## 13. Metrics to Track (Early)

- Search → click-through rate
- Query → successful match rate
- Most common failed queries
- Saved items per user

---

## 14. Future Enhancements (Out of Scope for MVP)

- Community tagging
- Confidence scoring (“we’re 78% sure”)
- Collaborative filtering
- LLM-based clarification questions
- Public API

---

## 15. Risks & Mitigations

### Pinecone Free Tier Limits

**Mitigation:**

- Cache results
- Limit embedding creation per user
- Batch ingestion only

### Data Quality

**Mitigation:**

- Start with fewer but cleaner items
- Manual curation for first dataset

### Cold Start

**Mitigation:**

- Seed curated collections
- Focus on “memory search” as hero feature

---

## 16. Definition of MVP Success

- User can describe a vague story
- System returns relevant matches
- User saves at least one item
- API remains stable under basic load
- Backend is clean, testable, and extensible
