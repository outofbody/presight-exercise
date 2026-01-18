import express, { type Express } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Worker } from 'worker_threads';
import path from 'path';
import { existsSync } from 'fs';
import apiRoutes from './routes/api';
import { queue, storage } from './services';

const app: Express = express();
const httpServer = createServer(app);

/**
 * Socket.IO Configuration
 * 
 * HIGH-LOAD OPTIMIZATIONS:
 * - Use Redis adapter for horizontal scaling across multiple servers
 * - Enable sticky sessions (session affinity) for load balancers
 * - Configure appropriate ping/pong timeouts
 * - Use compression for large payloads
 * - Consider WebSocket connection pooling
 * 
 * TO SWITCH TO MULTI-SERVER:
 * ```typescript
 * import { createAdapter } from '@socket.io/redis-adapter';
 * import { createClient } from 'redis';
 * 
 * const pubClient = createClient({ url: process.env.REDIS_URL });
 * const subClient = pubClient.duplicate();
 * await Promise.all([pubClient.connect(), subClient.connect()]);
 * 
 * io.adapter(createAdapter(pubClient, subClient));
 * ```
 */
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  },
  // TODO: For high-load, add Redis adapter
  // adapter: createAdapter(pubClient, subClient),
});

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

// Services are imported from shared services.ts

// Track active workers for cleanup
// TODO: For high-load with BullMQ, workers are managed separately
const requestQueue: Map<string, { worker: Worker; socketId?: string }> = new Map();

/**
 * Get the correct worker path for both development and production
 * - Development (tsx): Use a JavaScript wrapper that loads the TypeScript file via tsx
 * - Production: Use the compiled JavaScript file directly
 */
function getWorkerPath(): string {
  const tsPath = path.join(__dirname, 'workers', 'processWorker.ts');
  const jsPath = path.join(__dirname, 'workers', 'processWorker.js');
  const wrapperPath = path.join(__dirname, 'workers', 'processWorkerWrapper.js');
  
  // In development (tsx), use the wrapper that loads TypeScript via tsx
  if (existsSync(tsPath) && !existsSync(jsPath)) {
    return wrapperPath;
  }
  
  // Production mode: use compiled JavaScript file directly
  return jsPath;
}

/**
 * Initialize storage and queue
 * 
 * For high-load: This connects to database/Redis
 * - Database: Establishes connection pool
 * - Redis: Connects to Redis cluster
 * - Queue: Sets up queue workers
 */
async function initializeServices(): Promise<void> {
  await storage.initialize();
  await queue.initialize();
}

/**
 * WebSocket Connection Handler
 * 
 * HIGH-LOAD CONSIDERATIONS:
 * - Current: Worker threads on same server (fine for <100 concurrent requests)
 * - For high-load: Use distributed queue (BullMQ/Redis) with separate worker servers
 * - Implement connection rate limiting
 * - Use Redis pub/sub for cross-server communication
 * - Monitor connection count and implement circuit breakers
 * 
 * SCALING PATTERNS:
 * - Single server: Current implementation (worker threads)
 * - Multiple servers: BullMQ workers on separate servers
 * - Very high load: Kafka + worker pool + Redis pub/sub
 */
io.on('connection', (socket) => {
  // Client connected

  socket.on('process-request', async (data: { id: string }) => {
    const requestId = data.id;
    
    // In Task 3, the request is already enqueued in the API route
    // But we check status or ensure it's there
    const status = await queue.getStatus(requestId);
    if (status === 'pending') {
      // Proceed to process
    }
    
    // CURRENT: Create worker thread on same server
    // For high-load: Workers run on separate servers and process from queue
    const workerPath = getWorkerPath();
    const worker = new Worker(workerPath, {
      execArgv: []
    });
    
    // Store in local queue for cleanup (only needed for worker threads)
    // TODO: For BullMQ, workers are managed separately
    requestQueue.set(requestId, { worker, socketId: socket.id });

    // Send request to worker
    worker.postMessage({ id: requestId, data: {} });

    // Listen for worker response
    worker.on('message', async (response: { id: string; result: string }) => {
      // Mark as completed in queue
      await queue.complete(response.id, response.result);
      
      // Emit result to the client
      // TODO: For high-load, use Redis pub/sub to notify across servers
      io.emit('process-result', {
        id: response.id,
        status: 'completed',
        result: response.result
      });

      // Clean up
      requestQueue.delete(response.id);
      worker.terminate();
    });

    worker.on('error', async (error) => {
      console.error('Worker error:', error);
      
      // Mark as failed in queue
      await queue.fail(requestId, error.message);
      
      io.emit('process-result', {
        id: requestId,
        status: 'error',
        result: `Error: ${error.message}`
      });
      requestQueue.delete(requestId);
    });
  });

  socket.on('disconnect', () => {
    // Client disconnected
    // TODO: For high-load, clean up any pending requests for this socket
  });
});

/**
 * Server Startup
 * 
 * HIGH-LOAD CONSIDERATIONS:
 * - Use process managers (PM2, systemd) for auto-restart
 * - Enable clustering for multi-core utilization
 * - Set up health checks for load balancers
 * - Configure graceful shutdown (SIGTERM handling)
 * - Monitor memory and CPU usage
 * 
 * CLUSTERING EXAMPLE:
 * ```typescript
 * import cluster from 'cluster';
 * import os from 'os';
 * 
 * if (cluster.isPrimary) {
 *   const numWorkers = os.cpus().length;
 *   for (let i = 0; i < numWorkers; i++) {
 *     cluster.fork();
 *   }
 * } else {
 *   // Worker process - start server
 *   httpServer.listen(PORT);
 * }
 * ```
 */
async function startServer(): Promise<void> {
  await initializeServices();
  
  httpServer.listen(PORT, () => {
    // Server is running on port ${PORT}
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

/**
 * Graceful Shutdown
 * 
 * For high-load: Properly close all connections
 * - Close database connection pools
 * - Close Redis connections
 * - Finish processing current requests
 * - Close WebSocket connections gracefully
 */
async function gracefulShutdown(): Promise<void> {
  // Stop accepting new connections
  httpServer.close(() => {
    // Close all worker threads
    requestQueue.forEach(({ worker }) => {
      worker.terminate();
    });
    
    // Cleanup storage and queue
    storage.cleanup().catch(console.error);
    queue.cleanup().catch(console.error);
    
    process.exit(0);
  });
  
  // Force shutdown after timeout
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
