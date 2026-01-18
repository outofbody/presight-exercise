/**
 * Queue Configuration
 * 
 * This file centralizes queue configuration for easy switching between
 * queue backends for high-load scenarios.
 * 
 * CURRENT: In-memory queue (single server)
 * 
 * TO SWITCH TO HIGH-LOAD:
 * 
 * 1. Update QUEUE_TYPE environment variable:
 *    - 'memory' (current) - InMemoryQueue
 *    - 'redis' - Redis with BullMQ
 *    - 'rabbitmq' - RabbitMQ
 *    - 'sqs' - AWS SQS
 * 
 * 2. Set connection strings:
 *    - REDIS_URL for Redis/BullMQ
 *    - RABBITMQ_URL for RabbitMQ
 *    - AWS_REGION and AWS_ACCESS_KEY for SQS
 * 
 * EXAMPLE PRODUCTION CONFIG:
 * ```env
 * QUEUE_TYPE=redis
 * REDIS_URL=redis://localhost:6379
 * QUEUE_CONCURRENCY=5
 * QUEUE_ATTEMPTS=3
 * QUEUE_TIMEOUT=30000
 * ```
 * 
 * WORKER CONFIGURATION:
 * - Concurrency: Number of jobs processed simultaneously
 * - Attempts: Retry count for failed jobs
 * - Timeout: Max processing time per job
 * - Priority: Support priority queues for urgent requests
 * 
 * SCALING:
 * - Single server: In-memory queue (current)
 * - Multiple servers: Redis/BullMQ (shared queue)
 * - High throughput: Kafka (event streaming)
 */
export const QUEUE_TYPE = process.env.QUEUE_TYPE || 'memory';

export const QUEUE_CONFIG = {
  // Queue backend URL
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  
  // Worker configuration
  concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5', 10),
  attempts: parseInt(process.env.QUEUE_ATTEMPTS || '3', 10),
  timeout: parseInt(process.env.QUEUE_TIMEOUT || '30000', 10), // 30 seconds
  
  // Queue settings
  queueName: process.env.QUEUE_NAME || 'process-requests',
  
  // Persistence
  enablePersistence: process.env.QUEUE_PERSISTENCE === 'true',
  
  // Dead letter queue
  enableDeadLetter: process.env.ENABLE_DEAD_LETTER === 'true',
  deadLetterQueue: process.env.DEAD_LETTER_QUEUE || 'process-requests-dlq',
};
