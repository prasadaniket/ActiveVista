/*
  server.js
  Purpose: Primary server entrypoint used in production/dev; sets CORS, body parsers, logging,
           security hardening, mounts user/workout routes, and starts HTTP server after DB connection.
*/
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import UserRoutes from "./routes/userRoute.js";
import WorkoutRoutes from "./routes/workoutRoute.js";

// Load environment variables
dotenv.config();

const app = express();

// ═══════════════════════════════════════════════════════
// CORS — MUST be first so preflight OPTIONS get proper headers
// ═══════════════════════════════════════════════════════
app.use(cors({
  origin: [
    "http://localhost:5173", // Vite default port
    "http://localhost:3000", // React default port
    "http://localhost:4000"  // Server port
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Handle preflight OPTIONS requests immediately (skip all other middleware)
app.options("/{*splat}", cors());

// ═══════════════════════════════════════════════════════
// SECURITY MIDDLEWARE
// ═══════════════════════════════════════════════════════

// 1. Helmet — sets secure HTTP headers (X-Content-Type-Options, X-Frame-Options, etc.)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// 2. Rate Limiting — general API: 500 requests per 15 minutes per IP
//    (a SPA sends many small API calls on each page load)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS", // never rate-limit preflight
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});
app.use("/api", generalLimiter);

// 3. Stricter rate limit for auth endpoints: 30 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
});
app.use("/api/user/signin", authLimiter);
app.use("/api/user/signup", authLimiter);

// 4. NoSQL Injection Sanitization — sanitize req.body and req.params
//    (express-mongo-sanitize is incompatible with Express 5.x getter-only req.query)
const sanitizeObj = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      sanitizeObj(obj[key]);
    }
  }
};
app.use((req, res, next) => {
  sanitizeObj(req.body);
  sanitizeObj(req.params);
  next();
});

// 5. HTTP Parameter Pollution protection
app.use(hpp());

// ═══════════════════════════════════════════════════════
// STANDARD MIDDLEWARE
// ═══════════════════════════════════════════════════════

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
let server; // module-level so gracefulShutdown can access it

const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  if (!server) {
    process.exit(0);
    return;
  }
  server.close((err) => {
    if (err) {
      console.error("❌ Error during server shutdown:", err);
      process.exit(1);
    }
    console.log("✅ HTTP server closed");
    // Close existing Mongoose connection (don't open a new one)
    import("mongoose").then(({ default: mongoose }) => {
      mongoose.connection.close(false).then(() => {
        console.log("✅ Database connection closed");
        process.exit(0);
      }).catch((error) => {
        console.error("❌ Error closing database connection:", error);
        process.exit(1);
      });
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
    
    // Start server (assign to module-level `server`)
    server = app.listen(PORT, () => {
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
await startServer();

export default app;
