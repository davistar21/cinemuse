# Understanding the CineMuse Backend: A Learning Guide

Hey Tayo! This guide breaks down every pattern and concept in the backend code. No fluff, just understanding.

---

## Table of Contents

1. [The Big Picture](#1-the-big-picture)
2. [Project Structure Explained](#2-project-structure-explained)
3. [The Service Pattern](#3-the-service-pattern)
4. [Understanding Each Service](#4-understanding-each-service)
5. [Middleware Explained](#5-middleware-explained)
6. [The Request Flow](#6-the-request-flow)
7. [TypeScript Patterns Used](#7-typescript-patterns-used)

---

## 1. The Big Picture

### What is a Backend?

Your Next.js app has API routes, right? A separate Express backend is essentially the same thing, but:

- **Standalone**: Runs as its own server (not bundled with frontend)
- **More Control**: Full Express configuration, middleware, etc.
- **Scalable**: Can scale independently from frontend
- **Cleaner Separation**: Frontend team and backend team can work separately

### Our Architecture

```
User → Next.js Frontend → Express API → PostgreSQL + Pinecone
                              ↓
                      Voyage AI (embeddings)
```

When a user searches "movie about time loops", the flow is:

1. Frontend sends POST to `/api/v1/search/memory`
2. Express receives the request
3. Controller calls the Search Service
4. Search Service:
   - Calls Voyage AI to convert text → numbers (embedding)
   - Calls Pinecone to find similar embeddings
   - Calls PostgreSQL to get full media details
5. Response sent back to frontend

---

## 2. Project Structure Explained

```
src/
├── config/        # Settings and database connection
├── controllers/   # Handle HTTP requests (thin layer)
├── middleware/    # Functions that run BEFORE controllers
├── routes/        # Define URL → controller mapping
├── services/      # Business logic (the real work)
├── validations/   # Define what valid input looks like
├── utils/         # Helper functions
├── app.ts         # Express setup
└── server.ts      # Start the server
```

### Why This Structure?

**Separation of Concerns** — each folder has ONE job:

| Folder      | Job                            | Analogy         |
| ----------- | ------------------------------ | --------------- |
| Routes      | "What URLs exist?"             | Restaurant menu |
| Controllers | "Receive order, send response" | Waiter          |
| Services    | "Actually cook the food"       | Chef            |
| Middleware  | "Check ID before entry"        | Bouncer         |
| Validations | "Is this order valid?"         | Order form      |

---

## 3. The Service Pattern

This is the most important pattern in the codebase. Let me explain it clearly.

### The Problem

Without services, your code looks like this (BAD):

```typescript
// In your controller or API route
app.post("/users", async (req, res) => {
  // Validation
  if (!req.body.email) return res.status(400).json({ error: "Email required" });

  // Check if exists
  const existing = await prisma.user.findUnique({
    where: { email: req.body.email },
  });
  if (existing) return res.status(409).json({ error: "Email taken" });

  // Hash password
  const hash = await bcrypt.hash(req.body.password, 12);

  // Create user
  const user = await prisma.user.create({
    data: { email: req.body.email, passwordHash: hash },
  });

  // Generate token
  const token = jwt.sign({ userId: user.id }, SECRET);

  res.json({ user, token });
});
```

Problems:

- 🔴 Can't reuse this logic elsewhere
- 🔴 Hard to test (need to mock HTTP)
- 🔴 Controller is doing too much
- 🔴 Mixing HTTP concerns with business logic

### The Solution: Services

```typescript
// auth.service.ts — JUST the business logic
export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) throw ApiError.conflict("Email taken");

  const hash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: { email: input.email, passwordHash: hash },
  });
  const token = generateToken({ userId: user.id });

  return { user, token };
}

// auth.controller.ts — JUST handles HTTP
export const register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
});
```

Benefits:

- ✅ Service can be called from anywhere (other services, scripts, jobs)
- ✅ Easy to test (just call the function)
- ✅ Controller is thin and focused
- ✅ Each piece has ONE job

---

## 4. Understanding Each Service

### 4.1 auth.service.ts

```typescript
import bcrypt from "bcryptjs";
import prisma from "../config/database.js";
import { generateToken } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const { email, password, username } = input;

  // Check if email already exists
  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingEmail) {
    throw ApiError.conflict("Email already registered");
  }

  // Hash password (NEVER store plain passwords!)
  const passwordHash = await bcrypt.hash(password, 12);
  // The "12" is the salt rounds — higher = more secure but slower
  // 12 is a good balance (takes ~250ms to hash)

  // Create user in database
  const user = await prisma.user.create({
    data: { email, username, passwordHash },
    select: { id: true, email: true, username: true, role: true },
    // select: only return these fields (security — don't return passwordHash!)
  });

  // Generate JWT token
  const token = generateToken({ userId: user.id, role: user.role });

  return { user, token };
}
```

**Key Concepts:**

1. **Password Hashing**: We NEVER store plain passwords. `bcrypt.hash()` converts "password123" into something like "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4D..." which is irreversible.

2. **Throwing Errors**: Instead of returning `{ error: 'Something wrong' }`, we `throw` errors. The error middleware catches them and sends proper HTTP responses.

3. **Select**: Prisma's `select` is like SQL's `SELECT column1, column2` — only fetch what you need.

---

### 4.2 media.service.ts

```typescript
export async function createMedia(
  input: CreateMediaInput,
): Promise<MediaWithTags> {
  const { tags: tagNames, ...mediaData } = input;
  // This is "destructuring" — extract tags separately, keep the rest

  const media = await prisma.mediaItem.create({
    data: {
      ...mediaData, // Spread: insert all properties from mediaData
      tags: tagNames
        ? {
            // This creates the "join table" entries (MediaTag)
            create: tagNames.map((tagName) => ({
              tag: {
                connectOrCreate: {
                  where: { name: tagName.toLowerCase() },
                  create: {
                    name: tagName.toLowerCase(),
                    category: "GENRE" as TagCategory,
                  },
                },
              },
            })),
          }
        : undefined,
    },
    include: {
      tags: { include: { tag: true } },
    },
  });

  return {
    ...media,
    tags: media.tags.map((mt) => mt.tag),
  };
}
```

**Key Concepts:**

1. **Destructuring**: `const { tags, ...rest } = input` splits an object:
   - `tags` = the tags property
   - `rest` = everything else

2. **Spread Operator**: `...mediaData` expands object properties:

   ```typescript
   const mediaData = { title: "Inception", type: "MOVIE" };
   prisma.create({ data: { ...mediaData, language: "English" } });
   // Same as: { data: { title: 'Inception', type: 'MOVIE', language: 'English' } }
   ```

3. **connectOrCreate**: Prisma magic — "find this tag, or create it if it doesn't exist"

4. **Many-to-Many Relations**: A movie can have many tags, a tag can belong to many movies. This is handled by the `MediaTag` join table.

---

### 4.3 embedding.service.ts

This is the "AI" part. Let me break it down:

```typescript
export async function generateEmbedding(
  text: string,
): Promise<EmbeddingResponse> {
  // Make HTTP request to Voyage AI
  const response = await fetch(`${config.voyage.baseUrl}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.voyage.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.voyage.model,
      input: text,
      input_type: "document",
    }),
  });

  if (!response.ok) {
    throw ApiError.internal(`Embedding failed: ${response.status}`);
  }

  const data = (await response.json()) as VoyageEmbeddingData;

  return {
    embedding: data.data[0].embedding, // Array of 1024 numbers!
    model: config.voyage.model,
    usage: { totalTokens: data.usage?.total_tokens || 0 },
  };
}
```

**What is an Embedding?**

An embedding converts text into numbers that capture meaning:

```
"A movie about time loops" → [0.23, -0.45, 0.12, ..., 0.89]  (1024 numbers)
"Groundhog Day"            → [0.21, -0.48, 0.14, ..., 0.91]  (similar numbers!)
"A recipe for pasta"       → [0.89, 0.12, -0.67, ..., -0.34] (very different!)
```

Similar meanings → similar numbers → we can find "similar" items by comparing these numbers!

---

### 4.4 pinecone.service.ts

Pinecone stores and searches embeddings:

```typescript
export async function queryVectors(
  params: QueryParams,
): Promise<QueryResult[]> {
  const index = getIndex();

  const results = await index.query({
    vector: params.vector, // The 1024 numbers from user's query
    topK: params.topK || 10, // Return top 10 matches
    includeMetadata: true, // Also return title, type, etc.
    filter: Object.keys(filter).length > 0 ? filter : undefined,
  });

  return (results.matches || []).map((match) => ({
    id: match.id,
    score: match.score || 0, // 0 to 1, higher = more similar
    metadata: match.metadata as unknown as VectorMetadata,
  }));
}
```

**How Pinecone Works:**

1. We store each movie as: `{ id, vector: [1024 numbers], metadata: { title, type, year } }`
2. When user searches, we convert their query to 1024 numbers
3. Pinecone finds the vectors that are "closest" (most similar)
4. We get back IDs and similarity scores

---

### 4.5 search.service.ts

This ties everything together:

```typescript
export async function memorySearch(
  params: MemorySearchParams,
): Promise<SearchResult[]> {
  const { query, type, limit = 10 } = params;

  // Step 1: Check if Pinecone is available
  const pineconeAvailable = await pineconeService.isPineconeAvailable();

  if (!pineconeAvailable) {
    // Fallback to simple keyword search if Pinecone is down
    return await fallbackKeywordSearch(query, type, limit);
  }

  try {
    // Step 2: Convert user's text to numbers
    const queryEmbedding = await embeddingService.generateQueryEmbedding(query);

    // Step 3: Find similar vectors in Pinecone
    const vectorResults = await pineconeService.queryVectors({
      vector: queryEmbedding,
      topK: limit,
      filter: type ? { type } : undefined,
    });

    if (vectorResults.length === 0) return [];

    // Step 4: Get full media details from PostgreSQL
    const mediaIds = vectorResults.map((r) => r.metadata.mediaId);
    const mediaItems = await prisma.mediaItem.findMany({
      where: { id: { in: mediaIds } },
      include: { tags: { include: { tag: true } } },
    });

    // Step 5: Combine results with similarity scores
    const mediaMap = new Map(mediaItems.map((m) => [m.id, m]));
    // ...

    return results;
  } catch (error) {
    // If anything fails, fall back to keyword search
    return await fallbackKeywordSearch(query, type, limit);
  }
}
```

**The Fallback Pattern:**

Notice how we ALWAYS have a backup plan:

- Pinecone down? → Use keyword search
- Embedding fails? → Use keyword search

This is **graceful degradation** — the app keeps working even when parts fail.

---

## 5. Middleware Explained

Middleware = functions that run BEFORE your controller.

```typescript
// This request:
POST /api/v1/media { title: "Inception", type: "MOVIE" }

// Goes through:
[Rate Limit] → [CORS] → [Auth] → [Validation] → [Controller]
```

### auth.middleware.ts

```typescript
export const authenticate = async (req, res, next) => {
  // 1. Get token from header
  const authHeader = req.headers.authorization;
  // Header looks like: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw ApiError.unauthorized("No token provided");
  }

  const token = authHeader.split(" ")[1]; // Get the actual token

  // 2. Verify token (checks signature and expiration)
  const payload = verifyToken(token);

  // 3. Get user from database
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });

  // 4. Attach user to request (available in controller!)
  req.user = user;

  // 5. Continue to next middleware/controller
  next();
};
```

**The `next()` Function:**

Express middleware forms a chain. `next()` says "I'm done, continue to the next function."

```
authenticate() → validate() → controller()
       ↓              ↓            ↓
    next()         next()      res.json()
```

If you DON'T call `next()`, the request hangs forever!

---

### validate.middleware.ts

```typescript
export const validate = (schema: AnyZodObject) => {
  return async (req, res, next) => {
    try {
      // Validate request against schema
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next(); // Valid! Continue.
    } catch (error) {
      next(error); // Invalid! Pass error to error handler.
    }
  };
};
```

Used like:

```typescript
router.post("/register", validate(registerSchema), authController.register);
//                       ↑ middleware              ↑ controller
```

---

## 6. The Request Flow

Let's trace a complete request:

```
POST /api/v1/auth/register
Body: { email: "tayo@example.com", password: "secret123", username: "tayo" }
```

### Step by Step:

1. **Express receives request** (`app.ts`)
   - CORS check ✓
   - Rate limit check ✓
   - Body parsed to JSON ✓

2. **Router matches URL** (`routes/index.ts` → `routes/auth.routes.ts`)

   ```typescript
   router.post("/register", validate(registerSchema), authController.register);
   ```

3. **Validation middleware** (`validate.middleware.ts`)
   - Checks: email is valid format? password >= 8 chars? username valid?
   - If invalid → error thrown → goes to error handler
   - If valid → `next()`

4. **Controller** (`auth.controller.ts`)

   ```typescript
   export const register = catchAsync(async (req, res) => {
     const result = await authService.register(req.body);
     res.status(201).json({ success: true, data: result });
   });
   ```

5. **Service** (`auth.service.ts`)
   - Check email not taken
   - Hash password
   - Create user in database
   - Generate JWT
   - Return `{ user, token }`

6. **Response sent**
   ```json
   {
     "success": true,
     "data": {
       "user": {
         "id": "clx...",
         "email": "tayo@example.com",
         "username": "tayo"
       },
       "token": "eyJhbGciOiJIUzI1NiIs..."
     }
   }
   ```

---

## 7. TypeScript Patterns Used

### Pattern 1: Type Aliases & Interfaces

```typescript
// Define what an AuthResponse looks like
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
  token: string;
}

// Now TypeScript ensures we return this shape
export async function register(input: RegisterInput): Promise<AuthResponse> {
  // If we forget to include 'token', TypeScript yells at us!
}
```

### Pattern 2: Generics

```typescript
// T is a placeholder for "any type"
const catchAsync = (fn: (req, res, next) => Promise<void>) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

This wraps async functions to catch errors automatically.

### Pattern 3: Type Assertions

```typescript
const id = req.params.id as string;
// "I know this is a string, trust me TypeScript"
```

Use sparingly — only when YOU know better than TypeScript.

### Pattern 4: Optional Chaining

```typescript
const year = data.usage?.total_tokens || 0;
// If usage is undefined, don't crash — just return 0
```

---

## Summary

| Concept         | One-liner                                     |
| --------------- | --------------------------------------------- |
| **Services**    | Business logic, reusable, no HTTP knowledge   |
| **Controllers** | Thin layer, handles HTTP, calls services      |
| **Middleware**  | Functions that run before controller          |
| **Embeddings**  | Convert text to numbers for similarity search |
| **Pinecone**    | Database for searching those numbers          |
| **Prisma**      | Type-safe database queries                    |
| **Zod**         | Validate input before using it                |
| **JWT**         | Encoded token proving user identity           |

---

## Next Steps

1. Run the seed script: `npm run db:seed`
2. Start the server: `npm run dev`
3. Test the health endpoint: `curl http://localhost:3001/health`
4. Try registering a user!

You've got this, Tayo! 🚀
