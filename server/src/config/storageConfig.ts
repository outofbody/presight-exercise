/**
 * Storage Configuration
 * 
 * This file centralizes storage configuration to make it easy to switch
 * between different storage backends for high-load scenarios.
 * 
 * CURRENT: In-memory storage (development)
 * 
 * TO SWITCH TO PRODUCTION/HIGH-LOAD:
 * 
 * 1. Update STORAGE_TYPE environment variable:
 *    - 'memory' (current) - InMemoryStorage
 *    - 'postgres' - PostgreSQL with connection pooling
 *    - 'mongodb' - MongoDB with connection pooling
 *    - 'redis' - Redis with persistence
 *    - 'elasticsearch' - Elasticsearch for search
 * 
 * 2. Set connection strings in environment:
 *    - DATABASE_URL for PostgreSQL/MongoDB
 *    - REDIS_URL for Redis
 *    - ELASTICSEARCH_URL for Elasticsearch
 * 
 * 3. Update imports in server/src/index.ts to use new storage
 * 
 * EXAMPLE PRODUCTION CONFIG:
 * ```env
 * STORAGE_TYPE=postgres
 * DATABASE_URL=postgresql://user:pass@host:5432/dbname?pool_size=20
 * REDIS_URL=redis://localhost:6379
 * USE_CACHE=true
 * CACHE_TTL=300
 * ```
 * 
 * CONNECTION POOLING:
 * - PostgreSQL: Use pg-pool with 10-20 connections
 * - MongoDB: Use connection pool with maxPoolSize: 10
 * - Redis: Use ioredis with connection pool
 * 
 * CACHING STRATEGY:
 * - L1: In-memory cache (Node.js Map) for hot data
 * - L2: Redis cache with TTL for frequently accessed data
 * - L3: Database for persistent storage
 */
export const STORAGE_TYPE = process.env.STORAGE_TYPE || 'memory';

export const STORAGE_CONFIG = {
  // Database connection (for PostgreSQL/MongoDB)
  databaseUrl: process.env.DATABASE_URL,
  
  // Redis connection (for caching/queue)
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // Connection pool settings
  poolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
  
  // Caching settings
  useCache: process.env.USE_CACHE === 'true',
  cacheTtl: parseInt(process.env.CACHE_TTL || '300', 10), // 5 minutes default
  
  // Performance settings
  enableReadReplicas: process.env.ENABLE_READ_REPLICAS === 'true',
  readReplicaUrl: process.env.READ_REPLICA_URL,
};
