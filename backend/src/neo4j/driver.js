/**
 * Neo4j Driver Configuration
 * Manages connection to Neo4j knowledge graph database
 *
 * @module neo4j/driver
 */

import neo4j from "neo4j-driver";
import logger from "../utils/logger.js";
import dotenv from "dotenv";

dotenv.config();

let driver;

/**
 * Initialize Neo4j driver with connection pooling
 * @returns {Driver} Neo4j driver instance
 */
export const initDriver = () => {
  if (driver) {
    logger.warn("Driver already initialized, returning existing instance");
    return driver;
  }

  const uri = `${process.env.NEO4J_PROTOCOL}://${process.env.NEO4J_HOST}:${process.env.NEO4J_PORT}`;

  driver = neo4j.driver(
    uri,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD),
    {
      maxConnectionPoolSize: 50,
      maxConnectionLifetime: 3600000, // 1 hour
      connectionAcquisitionTimeout: 60000, // 60 seconds
      maxTransactionRetryTime: 30000, // 30 seconds
      disableLosslessIntegers: true, // Convert large integers to Numbers
    },
  );

  logger.info(`✓ Neo4j driver initialized: ${uri}`);
  return driver;
};

/**
 * Close Neo4j driver connection
 * @returns {Promise<void>}
 */
export const closeDriver = async () => {
  if (driver) {
    await driver.close();
    logger.info("✓ Neo4j driver closed");
    driver = null;
  }
};

/**
 * Get active Neo4j driver instance
 * @returns {Driver} Neo4j driver instance
 * @throws {Error} If driver not initialized
 */
export const getDriver = () => {
  if (!driver) {
    throw new Error("Neo4j driver not initialized. Call initDriver() first.");
  }
  return driver;
};

/**
 * Test Neo4j connection
 * @returns {Promise<boolean>} Connection status
 */
export const testConnection = async () => {
  try {
    const session = driver.session();
    await session.run("RETURN 1 as test");
    await session.close();
    logger.info("✓ Neo4j connection test passed");
    return true;
  } catch (error) {
    logger.error("✗ Neo4j connection test failed", {
      error: error.message,
    });
    return false;
  }
};

/**
 * Run Cypher query against Neo4j
 * @param {string} query - Cypher query
 * @param {Object} params - Query parameters
 * @param {Object} options - Session options (defaultAccessMode, database)
 * @returns {Promise<Array>} Query results
 */
export const executeQuery = async (query, params = {}, options = {}) => {
  const session = driver.session({
    defaultAccessMode: neo4j.session.READ,
    database: process.env.NEO4J_DATABASE || "neo4j",
    ...options,
  });

  try {
    const result = await session.run(query, params);
    return result.records;
  } catch (error) {
    logger.error("Cypher query error:", {
      query,
      params,
      error: error.message,
    });
    throw error;
  } finally {
    await session.close();
  }
};

/**
 * Run write query against Neo4j
 * @param {string} query - Cypher query (WRITE)
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
export const executeWriteQuery = async (query, params = {}) => {
  const session = driver.session({
    defaultAccessMode: neo4j.session.WRITE,
    database: process.env.NEO4J_DATABASE || "neo4j",
  });

  try {
    const result = await session.run(query, params);
    return result.records;
  } catch (error) {
    logger.error("Write query error:", { query, params, error: error.message });
    throw error;
  } finally {
    await session.close();
  }
};

export default {
  initDriver,
  closeDriver,
  getDriver,
  testConnection,
  executeQuery,
  executeWriteQuery,
};
