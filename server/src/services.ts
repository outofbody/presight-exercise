import { InMemoryQueue } from './queue/InMemoryQueue';
import { InMemoryStorage } from './storage/InMemoryStorage';
import type { IQueue } from './queue/QueueInterface';
import type { IStorage } from './storage/StorageInterface';

export const queue: IQueue = new InMemoryQueue();
export const storage: IStorage = new InMemoryStorage();
