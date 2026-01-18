/**
 * Queue Interface for Request Processing
 * 
 * This abstraction allows easy switching between queue backends:
 * - In-memory Map (current) - for single-server development
 * - Redis + BullMQ - for distributed queue with persistence
 * - RabbitMQ - for enterprise message queue
 * - AWS SQS - for cloud-based queue service
 * - PostgreSQL + pg-boss - for database-backed queue
 * 
 * HIGH-LOAD CONSIDERATIONS:
 * - Use Redis/BullMQ for horizontal scaling across multiple servers
 * - Implement priority queues for urgent requests
 * - Add dead-letter queue for failed jobs
 * - Use job batching for high-throughput scenarios
 * - Monitor queue depth and processing rate
 * 
 * PERSISTENCE STRATEGY:
 * - For development: In-memory (current) - data lost on restart
 * - For staging: Redis with persistence (RDB + AOF)
 * - For production: Redis Cluster or RabbitMQ with persistence
 * 
 * SCALING PATTERNS:
 * - Single server: In-memory queue (current)
 * - Multiple servers: Redis/BullMQ with worker pool
 * - Very high load: Kafka for event streaming + workers
 */
export interface IQueue {
  /**
   * Add a request to the queue
   * 
   * For high-load: Use Redis LPUSH or BullMQ add()
   * - Set job options: attempts, timeout, priority
   * - Use job IDs for tracking
   */
  enqueue(requestId: string, data: unknown): Promise<void>;

  /**
   * Get queue status for a request
   * 
   * For high-load: Query Redis or BullMQ job status
   */
  getStatus(requestId: string): Promise<'pending' | 'processing' | 'completed' | 'failed'>;

  /**
   * Mark request as completed
   * 
   * For high-load: Update job status in Redis/BullMQ
   */
  complete(requestId: string, result: string): Promise<void>;

  /**
   * Mark request as failed
   * 
   * For high-load: Move to dead-letter queue if retries exhausted
   */
  fail(requestId: string, error: string): Promise<void>;

  /**
   * Initialize queue (connect to Redis, etc.)
   * 
   * For high-load: Set up connection pool, configure retries
   */
  initialize(): Promise<void>;

  /**
   * Cleanup queue resources
   */
  cleanup(): Promise<void>;
}
