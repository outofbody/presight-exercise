import { Router, type Request, type Response } from 'express';
import { faker } from '@faker-js/faker';
import type { FilterParams, PaginatedResponse, Person } from '../types';
import { storage, queue } from '../services';

const router = Router();

// Services are imported from shared services.ts

/**
 * GET /api/people - Paginated list with filtering and search
 * 
 * HIGH-LOAD OPTIMIZATIONS:
 * - Use database indexes on: first_name, last_name, nationality, hobbies
 * - Implement query result caching (Redis) with 1-5 minute TTL
 * - Use connection pooling for database connections
 * - Consider read replicas for read-heavy workloads
 * - Implement cursor-based pagination for very large datasets (>100K records)
 * 
 * CACHING STRATEGY:
 * - Cache key: `people:${page}:${pageSize}:${hobbies}:${nationalities}:${search}`
 * - TTL: 1-5 minutes depending on data freshness requirements
 * - Invalidate cache on data updates
 * 
 * DATABASE QUERY OPTIMIZATION:
 * - Use prepared statements to prevent SQL injection
 * - Add composite indexes for common filter combinations
 * - Use EXPLAIN ANALYZE to optimize slow queries
 */
router.get('/people', async (req: Request<Record<string, never>, PaginatedResponse<Person>, Record<string, never>, FilterParams>, res: Response) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      hobbies: hobbiesParam,
      nationalities: nationalitiesParam,
      search = ''
    } = req.query;

    // Handle array query parameters
    const hobbies = Array.isArray(hobbiesParam) 
      ? hobbiesParam as string[]
      : hobbiesParam 
        ? [hobbiesParam as string]
        : [];
    
    const nationalities = Array.isArray(nationalitiesParam)
      ? nationalitiesParam as string[]
      : nationalitiesParam
        ? [nationalitiesParam as string]
        : [];

    // Use storage abstraction - easy to switch to database
    const result = await storage.getPeople({
      page: Number(page),
      pageSize: Number(pageSize),
      hobbies: hobbies.length > 0 ? hobbies : undefined,
      nationalities: nationalities.length > 0 ? nationalities : undefined,
      search: search as string || undefined
    });

    res.json(result);
  } catch (_error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/people/filters - Get top hobbies and nationalities
 * 
 * HIGH-LOAD OPTIMIZATIONS:
 * - Pre-compute aggregations using materialized views (PostgreSQL)
 * - Cache results in Redis with 5-10 minute TTL (changes infrequently)
 * - Update cache on data mutations
 * - Use database aggregation queries (GROUP BY, COUNT) for efficiency
 * 
 * CACHING:
 * - Cache key: 'filters:top-hobbies' and 'filters:top-nationalities'
 * - TTL: 10 minutes (filter options change rarely)
 * - Invalidate on data updates
 */
router.get('/people/filters', async (_req: Request, res: Response) => {
  try {
    const result = await storage.getFilterOptions();
    res.json(result);
  } catch (_error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/stream - Stream text response character by character
 * 
 * HIGH-LOAD CONSIDERATIONS:
 * - Current: Generates text on-the-fly (fine for low-medium load)
 * - For high-load: Pre-generate and cache text chunks
 * - Use streaming from file system or database for very large content
 * - Implement backpressure handling for slow clients
 * - Consider CDN for static content streaming
 * 
 * OPTIMIZATION OPTIONS:
 * - Cache generated text in Redis with TTL
 * - Stream from file system for large content
 * - Use database streaming for dynamic content
 * - Implement chunked transfer encoding properly
 * 
 * BACKPRESSURE HANDLING:
 * - Check res.writable before writing
 * - Handle 'drain' event for backpressure
 * - Set appropriate highWaterMark for streams
 */
router.get('/stream', (_req: Request, res: Response) => {
  try {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    // TODO: For high-load, cache this text in Redis or generate once
    const text = faker.lorem.paragraphs(32);
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length) {
        // Check if client is still writable (backpressure handling)
        if (res.writable) {
          res.write(text[index]);
          index++;
        } else {
          clearInterval(interval);
          res.end();
        }
      } else {
        clearInterval(interval);
        res.end();
      }
    }, 10); // Send one character every 10ms

    // Handle client disconnect
    _req.on('close', () => {
      clearInterval(interval);
    });
  } catch (_error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/process', async (_req: Request, res: Response) => {
  try {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Task 3: The api endpoint must cache each request into an in-memory queue and respond with pending
    await queue.enqueue(requestId, { timestamp: new Date() });
    
    res.json({
      id: requestId,
      status: 'pending'
    });
  } catch (_error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
