/**
 * Express Middleware
 * Authentication, error handling, rate limiting, etc.
 *
 * @module middleware/index
 */

import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import logger from "../utils/logger.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * JWT Authentication Middleware
 * Validates JWT tokens from Authorization header
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // For now, allow requests without token (optional auth)
  // In production, make this required
  if (!token) {
    req.user = { role: "anonymous" };
    return next();
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    logger.warn("Invalid JWT token:", err.message);
    req.user = { role: "anonymous" };
    next();
  }
};

/**
 * Role-based Access Control Middleware
 * Restricts access based on user role
 */
export const authorizeRole = (allowedRoles = []) => {
  return (req, res, next) => {
    const userRole = req.user?.role || "anonymous";

    if (allowedRoles.length === 0 || allowedRoles.includes(userRole)) {
      next();
    } else {
      res.status(403).json({
        error: "Forbidden",
        message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
      });
    }
  };
};

/**
 * Rate Limiter Middleware
 * Limits requests per IP/user
 */
export const createRateLimiter = (
  windowMs = 15 * 60 * 1000,
  maxRequests = 100,
) => {
  return rateLimit({
    windowMs, // 15 minutes default
    max: maxRequests,
    message: "Too many requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: "Too Many Requests",
        message: "Rate limit exceeded. Please try again later.",
      });
    },
  });
};

/**
 * Global Rate Limiter (all routes)
 */
export const globalRateLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
);

/**
 * GraphQL-specific Rate Limiter (stricter)
 */
export const graphqlRateLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 50,
);

/**
 * Error Handling Middleware
 * Catches and logs errors
 */
export const errorHandler = (err, req, res, _next) => {
  logger.error("Unhandled error:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(err.status || 500).json({
    error: err.name || "Internal Server Error",
    message: err.message || "An unexpected error occurred",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * Request Logging Middleware
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    logger.info(`${req.method} ${req.path}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });

  next();
};

/**
 * CORS Configuration
 */
export const corsConfig = {
  origin: (process.env.CORS_ORIGIN || "http://localhost:3000").split(","),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 3600,
};

/**
 * Generate JWT Token
 * Utility function for testing/auth endpoints
 */
export const generateToken = (user) => {
  const payload = {
    user_id: user.user_id || user.voter_id,
    email: user.email,
    role: user.role || "analyst",
  };

  const options = {
    expiresIn: process.env.JWT_EXPIRY || "7d",
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

export default {
  authenticateToken,
  authorizeRole,
  createRateLimiter,
  globalRateLimiter,
  graphqlRateLimiter,
  errorHandler,
  requestLogger,
  corsConfig,
  generateToken,
};
