export interface Person {
  avatar: string;
  first_name: string;
  last_name: string;
  age: number;
  nationality: string;
  hobbies: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FilterParams {
  page?: number;
  pageSize?: number;
  hobbies?: string[];
  nationalities?: string[];
  search?: string;
}

export interface WebSocketRequest {
  id: string;
  status: 'pending' | 'completed';
  result?: string;
}
