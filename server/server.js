/*
  server.js
  Purpose: Primary server entrypoint used in production/dev; sets CORS, body parsers, logging,
           mounts user/workout routes, and starts HTTP server after DB connection.
*/
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import UserRoutes from "./routes/userRoute.js";
import WorkoutRoutes from "./routes/workoutRoute.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173", // Vite default port
    "http://localhost:3000", // React default port
    "http://localhost:4000"  // Server port
  ],
  credentials: true,
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🏃‍♂️ ActiveVista Fitness Tracker API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/user/signup, /api/user/signin",
      dashboard: "/api/user/dashboard",
      workouts: "/api/user/workout"
    }
  });
});

app.use("/api/user", UserRoutes);
app.use("/api/workout", WorkoutRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  server.close((err) => {
    if (err) {
      console.error("❌ Error during server shutdown:", err);
      process.exit(1);
    }
    
    console.log("✅ HTTP server closed");
    
    // Close database connection
    connectDB().then(() => {
      console.log("✅ Database connection closed");
      process.exit(0);
    }).catch((error) => {
      console.error("❌ Error closing database connection:", error);
      process.exit(1);
    });
  });
};

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`
🚀 ActiveVista Server Started Successfully!
📡 Server running on: http://localhost:${PORT}
🌍 Environment: ${process.env.NODE_ENV || "development"}
📊 Database: Connected
⏰ Started at: ${new Date().toISOString()}
      `);
    });

    return server;
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
const server = await startServer();

export default app;
