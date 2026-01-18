import type { PaginatedResponse, Person, FilterParams, FilterOptions } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function fetchPeople(params: FilterParams = {}): Promise<PaginatedResponse<Person>> {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.hobbies) params.hobbies.forEach(h => queryParams.append('hobbies', h));
  if (params.nationalities) params.nationalities.forEach(n => queryParams.append('nationalities', n));

  const response = await fetch(`${API_BASE_URL}/people?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch people');
  }
  return response.json();
}

export async function fetchFilters(): Promise<FilterOptions> {
  const response = await fetch(`${API_BASE_URL}/people/filters`);
  if (!response.ok) {
    throw new Error('Failed to fetch filters');
  }
  return response.json();
}

export async function createProcessRequest(): Promise<{ id: string; status: string }> {
  const response = await fetch(`${API_BASE_URL}/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error('Failed to create process request');
  }
  return response.json();
}

export async function* streamText(): AsyncGenerator<string, void, unknown> {
  const response = await fetch(`${API_BASE_URL}/stream`);
  if (!response.ok) {
    throw new Error('Failed to stream text');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('No reader available');
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const char of chunk) {
        yield char;
      }
    }
  } finally {
    reader.releaseLock();
  }
}
