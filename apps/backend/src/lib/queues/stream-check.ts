import { Queue } from 'bullmq';
import { STREAM_CHECK_INTERVAL } from '@/constants';
import { JobName, QueueName } from '../../types/queues';
import redis from '../redis';

export const streamCheckQueue = new Queue(QueueName.StreamCheck, {
  connection: redis,
});

export const scheduleStreamCheckQueue = new Queue(
  QueueName.ScheduleStreamCheck,
  {
    connection: redis,
  }
);

await scheduleStreamCheckQueue.upsertJobScheduler(JobName.ScheduleStreamCheck, {
  every: STREAM_CHECK_INTERVAL,
});

// Set the max listeners for the queues
scheduleStreamCheckQueue.setMaxListeners(100);

// Set the global concurrency for the queues
await streamCheckQueue.setGlobalConcurrency(10);
await scheduleStreamCheckQueue.setGlobalConcurrency(1);
