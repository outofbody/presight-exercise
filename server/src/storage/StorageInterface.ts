import type { Person } from '../types';

/**
 * Storage Interface for Data Persistence
 * 
 * This abstraction allows easy switching between storage backends:
 * - In-memory (current implementation) - for development/testing
 * - PostgreSQL/MySQL - for relational data with ACID guarantees
 * - MongoDB - for document-based storage with flexible schemas
 * - Redis - for high-performance caching with optional persistence
 * - Elasticsearch - for advanced search capabilities at scale
 * 
 * HIGH-LOAD CONSIDERATIONS:
 * - Use connection pooling (pg-pool, mysql2 pool, MongoDB connection pool)
 * - Implement read replicas for read-heavy workloads
 * - Add caching layer (Redis) for frequently accessed data
 * - Use database indexes on: first_name, last_name, nationality, hobbies
 * - Consider partitioning/sharding for very large datasets (>10M records)
 * 
 * PERSISTENCE STRATEGY:
 * - For production: Use PostgreSQL with proper indexes
 * - For high-read scenarios: Add Redis cache with TTL
 * - For search-heavy: Use Elasticsearch with full-text search
 * - For write-heavy: Use write-through cache pattern
 */
export interface IStorage {
  /**
   * Get paginated people data with filtering
   * 
   * For high-load: Use database indexes and query optimization
   * - Index on: first_name, last_name (for search)
   * - Index on: nationality (for filtering)
   * - Index on: hobbies (GIN index for array contains)
   * - Use LIMIT/OFFSET or cursor-based pagination for large datasets
   */
  getPeople(params: {
    page: number;
    pageSize: number;
    hobbies?: string[];
    nationalities?: string[];
    search?: string;
  }): Promise<{
    data: Person[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>;

  /**
   * Get top hobbies and nationalities for filters
   * 
   * For high-load: Pre-compute and cache these aggregations
   * - Use materialized views (PostgreSQL)
   * - Cache in Redis with 5-10 minute TTL
   * - Update cache on data mutations
   */
  getFilterOptions(): Promise<{
    hobbies: string[];
    nationalities: string[];
  }>;

  /**
   * Initialize storage (connect to DB, load data, etc.)
   * 
   * For high-load: Use connection pooling
   * - Set appropriate pool size based on expected load
   * - Configure connection timeout and retry logic
   */
  initialize(): Promise<void>;

  /**
   * Cleanup resources (close connections, etc.)
   */
  cleanup(): Promise<void>;
}
