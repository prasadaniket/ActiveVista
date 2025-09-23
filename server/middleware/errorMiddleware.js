/*
  middleware/errorMiddleware.js
  Purpose: Create error helper, global error handler, and 404 handler.
*/
// Custom error handler middleware
export const createError = (status, message) => {
  const err = new Error();
  err.status = status;
  err.message = message;
  return err;
};

// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";

  // Log error for debugging
  console.error("❌ Error:", {
    status,
    message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  return res.status(status).json({
    success: false,
    status,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// 404 handler
export const notFound = (req, res, next) => {
  const error = createError(404, `Not Found - ${req.originalUrl}`);
  next(error);
};
