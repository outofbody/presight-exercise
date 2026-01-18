import type { IStorage } from './StorageInterface';
import type { Person } from '../types';
import { generateMockData, getTopHobbies, getTopNationalities } from '../data/mockData';

/**
 * In-Memory Storage Implementation
 * 
 * CURRENT: Simple in-memory storage for development
 * 
 * TO SWITCH TO HIGH-LOAD:
 * 1. Create new implementation (e.g., PostgresStorage, RedisStorage)
 * 2. Implement IStorage interface
 * 3. Update server/src/index.ts to use new storage
 * 
 * Example migration path:
 * - Development: InMemoryStorage (current)
 * - Staging: PostgresStorage with connection pooling
 * - Production: PostgresStorage + RedisCache (read-through cache)
 * 
 * PERFORMANCE NOTES:
 * - Current: O(n) filtering - fine for <10K records
 * - For >10K: Switch to database with proper indexes
 * - For >1M: Consider Elasticsearch for search, DB for storage
 */
export class InMemoryStorage implements IStorage {
  private data: Person[] = [];

  async initialize(): Promise<void> {
    // Load mock data into memory
    // For production: This would connect to database
    this.data = generateMockData(1000);
  }

  async getPeople(params: {
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
  }> {
    let filteredData = [...this.data];

    // Apply search filter
    // TODO: For high-load, use database full-text search or Elasticsearch
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredData = filteredData.filter(person =>
        person.first_name.toLowerCase().includes(searchLower) ||
        person.last_name.toLowerCase().includes(searchLower)
      );
    }

    // Apply hobby filter
    // TODO: For high-load, use database array contains query with GIN index
    if (params.hobbies && params.hobbies.length > 0) {
      filteredData = filteredData.filter(person =>
        params.hobbies!.some(hobby => person.hobbies.includes(hobby))
      );
    }

    // Apply nationality filter
    // TODO: For high-load, use database WHERE clause with index
    if (params.nationalities && params.nationalities.length > 0) {
      filteredData = filteredData.filter(person =>
        params.nationalities!.includes(person.nationality)
      );
    }

    // Pagination
    // TODO: For high-load, use database LIMIT/OFFSET or cursor-based pagination
    const startIndex = (params.page - 1) * params.pageSize;
    const endIndex = startIndex + params.pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredData.length / params.pageSize);

    return {
      data: paginatedData,
      total: filteredData.length,
      page: params.page,
      pageSize: params.pageSize,
      totalPages
    };
  }

  async getFilterOptions(): Promise<{
    hobbies: string[];
    nationalities: string[];
  }> {
    // TODO: For high-load, cache this result in Redis with TTL
    // Update cache when data changes
    const topHobbies = getTopHobbies(this.data, 20);
    const topNationalities = getTopNationalities(this.data, 20);

    return {
      hobbies: topHobbies,
      nationalities: topNationalities
    };
  }

  async cleanup(): Promise<void> {
    // Cleanup in-memory data if needed
    this.data = [];
  }
}
