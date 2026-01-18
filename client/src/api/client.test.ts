import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchPeople, fetchFilters, createProcessRequest } from './client';

// Mock fetch globally
global.fetch = vi.fn();

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchPeople', () => {
    it('should fetch people with default params', async () => {
      const mockResponse = {
        data: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchPeople();
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/people')
      );
    });

    it('should include query params in request', async () => {
      const mockResponse = {
        data: [],
        total: 0,
        page: 2,
        pageSize: 10,
        totalPages: 0
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await fetchPeople({ page: 2, pageSize: 10, search: 'John' });
      const callUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(callUrl).toContain('page=2');
      expect(callUrl).toContain('pageSize=10');
      expect(callUrl).toContain('search=John');
    });
  });

  describe('fetchFilters', () => {
    it('should fetch filter options', async () => {
      const mockResponse = {
        hobbies: ['Reading', 'Swimming'],
        nationalities: ['American', 'British']
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchFilters();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createProcessRequest', () => {
    it('should create a process request', async () => {
      const mockResponse = {
        id: 'req_123',
        status: 'pending'
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await createProcessRequest();
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/process'),
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
  });
});
