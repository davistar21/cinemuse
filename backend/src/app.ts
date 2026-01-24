import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import config from "./config/index.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";
import routes from "./routes/index.js";

// Create Express app
const app: Express = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: config.isProduction
      ? process.env.FRONTEND_URL || "https://cinemuse.vercel.app"
      : ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: {
      message: "Too many requests, please try again later",
      code: "RATE_LIMITED",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

// ============================================
// BODY PARSING MIDDLEWARE
// ============================================

// Parse JSON bodies
app.use(express.json({ limit: "10kb" }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ============================================
// HEALTH CHECK
// ============================================

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "CineMuse API is running",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// ============================================
// API ROUTES
// ============================================

app.use("/api/v1", routes);

// ============================================
// ERROR HANDLING
// ============================================

// Handle 404 routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
