import { Queue } from 'bullmq';
import redisConnection from '../config/redisConfig.js';

/**
 * Enterprise Notification Queue
 * ----------------------------
 * Handles background delivery of all system alerts (Events, Reminders, Directives).
 * 
 * Configured with:
 * - Exponential backoff (retries: 3)
 * - Auto-removal of completed/failed jobs to save Redis memory
 */
export const notificationQueue = new Queue('notification-queue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000, // 5s, 10s, 20s...
    },
    removeOnComplete: {
      age: 3600, // Keep for 1 hour
      count: 1000,
    },
    removeOnFail: {
      age: 24 * 3600, // Keep failed jobs for 24 hours for debugging
    },
  },
});

console.log('📦 BullMQ: Notification Queue Initialized');
