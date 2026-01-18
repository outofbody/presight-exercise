import { parentPort } from 'worker_threads';

interface WorkerMessage {
  id: string;
  data: unknown;
}

interface WorkerResponse {
  id: string;
  result: string;
}

if (parentPort) {
  parentPort.on('message', (message: WorkerMessage) => {
    // Simulate processing with 2 second timeout
    setTimeout(() => {
      const result = `Processed result for request ${message.id} at ${new Date().toISOString()}`;
      
      const response: WorkerResponse = {
        id: message.id,
        result
      };

      parentPort?.postMessage(response);
    }, 2000);
  });
}
