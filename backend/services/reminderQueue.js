import { Queue } from 'bullmq';
import redisConnection from '../config/redisConfig.js';

export const reminderQueue = new Queue('reminder-queue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      age: 24 * 3600,
      count: 5000,
    },
    removeOnFail: {
      age: 48 * 3600,
    },
  },
});

console.log(' BullMQ: Reminder Queue Initialized');
