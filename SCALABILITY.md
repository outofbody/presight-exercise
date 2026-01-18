# Scalability and High-Load Architecture

This document describes how the application is structured to support high-load scenarios and easy migration to production-grade infrastructure.

## Architecture Overview

The application uses **abstraction layers** for storage and queue management, making it easy to switch from in-memory implementations to production-ready solutions without changing business logic.

## Current Implementation (Development)

- **Storage**: In-memory (no persistence)
- **Queue**: In-memory Map (single server)
- **WebSockets**: Socket.IO without adapter (single server)
- **Workers**: Node.js worker threads (same process)

## High-Load Migration Path

### 1. Storage Layer (`server/src/storage/`)

**Current**: `InMemoryStorage`
- Stores data in memory
- No persistence
- Fine for <10K records

**Production Options**:

#### PostgreSQL (Recommended for most cases)
```typescript
// Create: server/src/storage/PostgresStorage.ts
import { Pool } from 'pg';
export class PostgresStorage implements IStorage {
  private pool: Pool;
  
  async initialize() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20, // Connection pool size
    });
  }
  
  async getPeople(params) {
    // Use indexed queries
    const query = `
      SELECT * FROM people 
      WHERE ($1::text IS NULL OR first_name ILIKE $1 OR last_name ILIKE $1)
      AND ($2::text[] IS NULL OR nationality = ANY($2))
      AND ($3::text[] IS NULL OR hobbies && $3)
      LIMIT $4 OFFSET $5
    `;
    // ... execute with indexes
  }
}
```

**Required Database Indexes**:
```sql
CREATE INDEX idx_people_first_name ON people USING gin(to_tsvector('english', first_name));
CREATE INDEX idx_people_last_name ON people USING gin(to_tsvector('english', last_name));
CREATE INDEX idx_people_nationality ON people(nationality);
CREATE INDEX idx_people_hobbies ON people USING gin(hobbies);
```

#### Redis (For caching layer)
```typescript
// Use as L2 cache with PostgreSQL as L3
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Cache query results
const cacheKey = `people:${JSON.stringify(params)}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
// ... query database
await redis.setex(cacheKey, 300, JSON.stringify(result)); // 5 min TTL
```

#### MongoDB (For document storage)
```typescript
import { MongoClient } from 'mongodb';
export class MongoStorage implements IStorage {
  async getPeople(params) {
    const query: any = {};
    if (params.search) {
      query.$or = [
        { first_name: { $regex: params.search, $options: 'i' } },
        { last_name: { $regex: params.search, $options: 'i' } }
      ];
    }
    // ... use indexes
  }
}
```

**Migration Steps**:
1. Create new storage class implementing `IStorage`.
2. Update `server/src/services.ts` to instantiate the new storage implementation.
3. Keep all route/business logic code unchanged, as they consume the shared instance via `import { storage } from './services'`.
4. Run standard validations to confirm the new storage backend.

### 2. Queue Layer (`server/src/queue/`)

**Current**: `InMemoryQueue`
- Single server only
- No persistence
- Data lost on restart

**Production Options**:

#### Redis + BullMQ (Recommended)
```typescript
// Create: server/src/queue/RedisQueue.ts
import Bull from 'bull';
export class RedisQueue implements IQueue {
  private queue: Bull.Queue;
  
  async initialize() {
    this.queue = new Bull('process-requests', {
      redis: { host: 'localhost', port: 6379 },
      defaultJobOptions: {
        attempts: 3,
        timeout: 30000,
      }
    });
    
    // Process jobs with worker pool
    this.queue.process(5, async (job) => {
      // Process in worker
      return await processRequest(job.data);
    });
  }
  
  async enqueue(requestId: string, data: unknown) {
    await this.queue.add({ id: requestId, data });
  }
}
```

**Worker Server** (separate process):
```typescript
// server/src/workers/queueWorker.ts
import Bull from 'bull';
const queue = new Bull('process-requests', { redis: '...' });

queue.process(5, async (job) => {
  // Process job
  const result = await processInWorker(job.data);
  
  // Emit via Redis pub/sub
  await redis.publish('process-result', JSON.stringify({
    id: job.data.id,
    status: 'completed',
    result
  }));
});
```

#### RabbitMQ (Enterprise option)
```typescript
import amqp from 'amqplib';
const connection = await amqp.connect(process.env.RABBITMQ_URL);
const channel = await connection.createChannel();
await channel.assertQueue('process-requests', { durable: true });
```

**Migration Steps**:
1. Create new queue class implementing `IQueue`.
2. Update `server/src/services.ts` to instantiate the new queue implementation.
3. Configure worker servers (separate processes) to connect to the same queue backend (e.g., Redis).
4. All existing logic in `api.ts` and `index.ts` remains decoupled via the `import { queue } from './services'` pattern.

### 3. WebSocket Scaling

**Current**: Socket.IO without adapter (single server)

**Multi-Server Setup**:
```typescript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

**Load Balancer Configuration**:
- Use sticky sessions (session affinity)
- Configure health checks
- Set appropriate timeouts

### 4. Connection Pooling

**PostgreSQL**:
```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum pool size
  min: 5,  // Minimum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

**MongoDB**:
```typescript
const client = new MongoClient(uri, {
  maxPoolSize: 10,
  minPoolSize: 5,
});
```

**Redis**:
```typescript
const redis = new Redis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
});
```

### 5. Caching Strategy

**Multi-Level Caching**:

1. **L1 Cache**: In-memory (Node.js Map) - Hot data
2. **L2 Cache**: Redis - Frequently accessed data (1-5 min TTL)
3. **L3 Storage**: Database - Persistent storage

**Cache Invalidation**:
- Invalidate on data mutations
- Use cache tags for related data
- Implement cache warming for filter options

### 6. Performance Optimizations

#### Database Indexes
```sql
-- Full-text search
CREATE INDEX idx_people_search ON people 
  USING gin(to_tsvector('english', first_name || ' ' || last_name));

-- Array contains (hobbies)
CREATE INDEX idx_people_hobbies ON people USING gin(hobbies);

-- Nationality filter
CREATE INDEX idx_people_nationality ON people(nationality);
```

#### Query Optimization
- Use prepared statements
- Implement cursor-based pagination for large datasets
- Use EXPLAIN ANALYZE to optimize slow queries
- Consider read replicas for read-heavy workloads

#### Caching
- Cache filter options (top hobbies/nationalities) - 10 min TTL
- Cache query results with appropriate TTL
- Use cache keys: `people:${page}:${pageSize}:${filters}`

### 7. Monitoring and Observability

**Metrics to Monitor**:
- Request rate (RPS)
- Response times (p50, p95, p99)
- Database connection pool usage
- Queue depth
- Cache hit rate
- WebSocket connection count
- Memory and CPU usage

**Tools**:
- Prometheus + Grafana for metrics
- ELK stack for logging
- APM tools (New Relic, Datadog)

### 8. Deployment Architecture

**Development**:
- Single server
- In-memory storage/queue

**Staging**:
- Single server with PostgreSQL
- Redis for caching
- Basic monitoring

**Production**:
- Multiple server instances (load balanced)
- PostgreSQL with read replicas
- Redis cluster for caching/queue
- Separate worker servers
- Full monitoring and alerting

## Environment Variables

```env
# Storage
STORAGE_TYPE=postgres  # memory | postgres | mongodb | redis
DATABASE_URL=postgresql://user:pass@host:5432/dbname?pool_size=20
REDIS_URL=redis://localhost:6379

# Queue
QUEUE_TYPE=redis  # memory | redis | rabbitmq | sqs
QUEUE_CONCURRENCY=5
QUEUE_ATTEMPTS=3
QUEUE_TIMEOUT=30000

# Caching
USE_CACHE=true
CACHE_TTL=300

# Performance
DB_POOL_SIZE=20
ENABLE_READ_REPLICAS=true
READ_REPLICA_URL=postgresql://...
```

## Migration Checklist

- [ ] Create production storage implementation
- [ ] Create production queue implementation
- [ ] Set up database with proper indexes
- [ ] Configure connection pooling
- [ ] Set up Redis for caching/queue
- [ ] Configure Socket.IO Redis adapter
- [ ] Set up worker servers
- [ ] Configure load balancer with sticky sessions
- [ ] Set up monitoring and alerting
- [ ] Load testing and optimization
- [ ] Document deployment procedures

## Performance Targets

- **API Response Time**: < 100ms (p95)
- **WebSocket Latency**: < 50ms
- **Queue Processing**: < 2s per job
- **Database Queries**: < 50ms (p95)
- **Cache Hit Rate**: > 80%

## Conclusion

The application is structured with clear abstraction layers, making it straightforward to migrate from development to high-load production environments. All business logic remains unchanged - only the storage and queue implementations need to be swapped.
