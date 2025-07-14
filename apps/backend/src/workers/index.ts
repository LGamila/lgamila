import path from 'node:path';
import { Worker } from 'bullmq';
import redis from '@/lib/redis';
import { QueueName } from '@/types/queues';

export const scheduleStreamCheckWorker = new Worker(
  QueueName.ScheduleStreamCheck,
  path.join(import.meta.dirname, '../', 'workers/schedule-stream-check.ts'),
  {
    connection: redis,
    concurrency: 1,
  }
);

export const streamCheckWorker = new Worker(
  QueueName.StreamCheck,
  path.join(import.meta.dirname, '../', 'workers/stream-check.ts'),
  {
    connection: redis,
    concurrency: 10,
  }
);
