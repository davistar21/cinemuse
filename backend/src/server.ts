import app from "./app.js";
import config, { validateConfig } from "./config/index.js";
import prisma from "./config/database.js";

// Validate environment variables
validateConfig();

// Start server
const server = app.listen(config.port, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                   🎬 CineMuse API                     ║
╠═══════════════════════════════════════════════════════╣
║  Status:      Running                                 ║
║  Port:        ${String(config.port).padEnd(40)}║
║  Environment: ${config.nodeEnv.padEnd(40)}║
║  Health:      http://localhost:${config.port}/health${" ".repeat(18)}║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    console.log("HTTP server closed");

    // Close database connection
    await prisma.$disconnect();
    console.log("Database connection closed");

    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error("Forcing shutdown...");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle unhandled rejections
process.on("unhandledRejection", (reason: Error) => {
  console.error("Unhandled Rejection:", reason);
  throw reason;
});

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

export default server;
