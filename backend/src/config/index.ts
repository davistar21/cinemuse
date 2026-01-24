import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

export const config = {
  // Server
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",

  // Database
  databaseUrl: process.env.DATABASE_URL || "",

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || "fallback-secret-change-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  // Voyage AI (Embeddings)
  voyage: {
    apiKey: process.env.VOYAGE_API_KEY || "",
    model: process.env.VOYAGE_MODEL || "voyage-2",
    baseUrl: "https://api.voyageai.com/v1",
  },

  // Pinecone (Vector DB)
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY || "",
    index: process.env.PINECONE_INDEX || "cinemuse",
  },

  // TMDb (Movie/TV metadata)
  tmdb: {
    apiKey: process.env.TMDB_API_KEY || "",
    accessToken: process.env.TMDB_ACCESS_TOKEN || "",
  },

  // Groq (LLM - for future use)
  groq: {
    apiKey: process.env.GROQ_API_KEY || "",
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
  },
} as const;

// Validate required environment variables
export function validateConfig(): void {
  const requiredVars = ["DATABASE_URL", "JWT_SECRET"];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0 && config.isProduction) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`,
    );
  }

  if (missingVars.length > 0) {
    console.warn(
      `⚠️  Warning: Missing environment variables: ${missingVars.join(", ")}`,
    );
  }
}

export default config;
