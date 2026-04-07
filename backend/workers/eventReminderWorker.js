import { Worker } from 'bullmq';
import redisConnection from '../config/redisConfig.js';
import { sendEventReminder } from '../services/eventReminderScheduler.js';

/**
 * Event Reminder Worker
 * ---------------------
 * Processes delayed reminder jobs for events (T-24h and T-1h).
 *
 * This worker pulls jobs from the 'event-reminder-queue' and executes
 * the reminder dispatch logic. Each job includes:
 * - eventId: The event to remind about
 * - reminderType: '24h' or '1h'
 * - eventTitle, eventDateTime, eventLocation: Pre-fetched data for idempotency
 *
 * The worker retries failed jobs with exponential backoff (3 attempts).
 */

export const eventReminderWorker = new Worker(
  'event-reminder-queue',
  async (job) => {
    const { eventId, reminderType, eventTitle, eventDateTime, eventLocation } = job.data;

    console.log(`[EventReminderWorker] 🤖 Processing ${reminderType} reminder for event: ${eventTitle} (ID: ${eventId})`);

    try {
      const result = await sendEventReminder(
        eventId,
        reminderType,
        eventTitle,
        eventDateTime,
        eventLocation
      );

      console.log(`[EventReminderWorker] ✅ ${reminderType} reminder dispatched for event ${eventId}. Recipients: ${result.recipientsCount || 0}`);
      return result;

    } catch (error) {
      console.error(`[EventReminderWorker] ❌ Error processing ${reminderType} reminder for event ${eventId}:`, error.message);
      // Throw to let BullMQ retry with backoff
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 3, // Process up to 3 reminder jobs in parallel
  }
);

// Worker Event Hooks
eventReminderWorker.on('completed', (job) => {
  console.log(`[EventReminderWorker] 🏁 Job [${job.id}] completed successfully`);
});

eventReminderWorker.on('failed', (job, err) => {
  console.error(`[EventReminderWorker] 🚩 Job [${job.id}] failed after ${job.attemptsMade} attempts:`, err.message);
});

eventReminderWorker.on('error', (err) => {
  console.error('[EventReminderWorker] 💥 Worker fatal error:', err);
});

console.log('👷 BullMQ: Event Reminder Worker Started');
