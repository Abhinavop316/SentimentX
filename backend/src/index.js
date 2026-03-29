/**
 * Main Application Entry Point
 * Express + Apollo GraphQL Server
 *
 * @module src/index.js
 */

import express from "express";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

// Internal imports
import { initDriver, closeDriver, testConnection } from "./neo4j/driver.js";
import { typeDefs } from "./graphql/schema.js";
import { resolvers } from "./graphql/resolvers.js";
import {
  authenticateToken,
  globalRateLimiter,
  graphqlRateLimiter,
  requestLogger,
  corsConfig,
  errorHandler,
} from "./middleware/index.js";
import logger from "./utils/logger.js";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || "development";
const GRAPHQL_PLAYGROUND = process.env.GRAPHQL_PLAYGROUND !== "false";
let dbConnected = false;

/**
 * Main application startup
 */
const startServer = async () => {
  try {
    // Initialize Express app
    const app = express();
    const httpServer = http.createServer(app);

    // Security middleware
    app.use(helmet());
    app.use(cors(corsConfig));

    // Body parsers
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ limit: "10mb", extended: true }));

    // Logging
    app.use(requestLogger);

    // Rate limiting
    app.use(globalRateLimiter);

    // Authentication
    app.use(authenticateToken);

    // Health check endpoint
    app.get("/health", (req, res) => {
      res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
      });
    });

    // Neo4j connection check endpoint
    app.get("/health/db", async (req, res) => {
      try {
        const isConnected = await testConnection();
        if (isConnected) {
          res.status(200).json({
            status: "connected",
            database: "neo4j",
            timestamp: new Date().toISOString(),
          });
        } else {
          res.status(503).json({
            status: "error",
            database: "neo4j",
            message: "Database connection failed",
          });
        }
      } catch (error) {
        res.status(503).json({
          status: "error",
          database: "neo4j",
          message: error.message,
        });
      }
    });

    // Status endpoint
    app.get("/api/status", (req, res) => {
      res.json({
        service: "SentimentX GraphQL API",
        version: "1.0.0",
        status: "running",
        database: dbConnected ? "connected" : "unavailable",
        environment: NODE_ENV,
        graphql_endpoint: "/graphql",
        playground_enabled: GRAPHQL_PLAYGROUND,
      });
    });

    // Initialize Neo4j driver
    logger.info("Initializing Neo4j driver...");
    initDriver();

    // Test Neo4j connection
    dbConnected = await testConnection();
    if (!dbConnected) {
      logger.warn(
        "Neo4j is currently unavailable. Starting API in degraded mode; GraphQL data queries may fail until DB is reachable.",
      );
    }

    // GraphQL Playground (if enabled)
    if (GRAPHQL_PLAYGROUND) {
      app.get("/graphql", (req, res) => {
        res.send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>SentimentX GraphQL Playground</title>
              <meta charset=utf-8/>
              <meta name="viewport" content="width=device-width, initial-scale=1"/>
              <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/graphql-playground-react/build/static/css/index.css"/>
              <link rel="shortcut icon" href="//cdn.jsdelivr.net/npm/graphql-playground-react/build/favicon.png"/>
              <script src="//cdn.jsdelivr.net/npm/graphql-playground-react/umd/graphql-playground.min.js"></script>
            </head>
            <body>
              <div id="root"></div>
              <script>
                window.addEventListener('load', function (event) {
                  GraphQLPlayground.init(document.getElementById('root'), {
                    endpoint: '/graphql',
                    subscriptionEndpoint: 'ws://localhost:4000/graphql',
                  })
                })
              </script>
            </body>
          </html>
        `);
      });
    }

    // Initialize Apollo Server
    logger.info("Initializing Apollo GraphQL Server...");
    const apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
      introspection: NODE_ENV === "development",
      includeStacktraceInErrorResponses: NODE_ENV === "development",
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
      formatError: (error) => {
        logger.error("GraphQL Error:", {
          message: error.message,
          extensions: error.extensions,
        });
        return {
          message: error.message,
          extensions: {
            code: error.extensions?.code,
            ...(NODE_ENV === "development" && { debugInfo: error.extensions }),
          },
        };
      },
    });

    await apolloServer.start();
    logger.info("✓ Apollo GraphQL Server started");

    // Mount Apollo middleware
    app.use(
      "/graphql",
      graphqlRateLimiter,
      expressMiddleware(apolloServer, {
        context: async ({ req }) => ({
          user: req.user || { role: "anonymous" },
          req,
        }),
      }),
    );

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({
        error: "Not Found",
        message: `Route ${req.method} ${req.path} not found`,
        available_routes: [
          "GET /health",
          "GET /health/db",
          "GET /api/status",
          "POST /graphql",
          "GET /graphql (Playground)",
        ],
      });
    });

    // Error handler
    app.use(errorHandler);

    // Start HTTP server
    httpServer.listen(PORT, () => {
      logger.info(`┌─────────────────────────────────────────────────┐`);
      logger.info(`│ 🚀 SentimentX GraphQL API Server Ready          │`);
      logger.info(`├─────────────────────────────────────────────────┤`);
      logger.info(`│ Environment: ${NODE_ENV.toUpperCase().padEnd(37)}│`);
      logger.info(`│ Port: ${PORT.toString().padEnd(42)}│`);
      logger.info(
        `│ GraphQL Endpoint: http://localhost:${PORT}/graphql`.padEnd(49) + `│`,
      );
      logger.info(
        `│ Playground: ${GRAPHQL_PLAYGROUND ? "Enabled" : "Disabled".padEnd(37)}│`,
      );
      logger.info(
        `│ Health Check: http://localhost:${PORT}/health`.padEnd(49) + `│`,
      );
      logger.info(`└─────────────────────────────────────────────────┘`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info("⏹️  Shutting down server gracefully...");

      httpServer.close(async () => {
        logger.info("✓ HTTP server closed");
        await apolloServer.stop();
        logger.info("✓ Apollo server stopped");
        await closeDriver();
        logger.info("✓ Neo4j driver closed");
        process.exit(0);
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
