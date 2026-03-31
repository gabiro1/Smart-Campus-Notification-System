import { Worker } from 'bullmq';
import redisConnection from '../config/redisConfig.js';
import { io } from '../utils/socketServer.js';
import { sendTopicNotification } from '../config/firebaseAdmin.js';

/**
 * Enterprise Notification Worker (The "Engine Room")
 * ------------------------------------------------
 * Processes all delivery jobs from the 'notification-queue'.
 *
 * Responsibility:
 * 1. Deliver real-time WebSocket events.
 * 2. Dispatch mobile Firebase topic alerts.
 * 3. Handle errors and trigger retries (fault-tolerance).
 */

export const notificationWorker = new Worker(
  'notification-queue',
  async (job) => {
    const { title, body, topic, room, data, type } = job.data;
    
    console.log(`🛠️ Processing Job [${job.id}]: ${title}`);

    try {
      // 1. WebSocket Delivery (Real-time Mounting)
      // Emits to the room (e.g., room_dept_IT) where specific students are listening.
      if (room && io) {
        io.to(room).emit('notification:new', {
          title,
          body,
          data,
          type,
          timestamp: job.data.timestamp,
        });
        console.log(`✅ WebSocket emitted to room: ${room}`);
      }

      // 2. FCM Mobile Delivery (Push Alert)
      // Sends to a Firebase topic (e.g., topic_dept_IT) where mobile devices are subscribed.
      if (topic) {
        // FCM requires all data fields to be strings
        const stringifiedData = Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, String(v)])
        );

        await sendTopicNotification(topic, title, body, stringifiedData);
        console.log(`✅ FCM pushed to topic: ${topic}`);
      }

    } catch (error) {
      console.error(`❌ Worker Error in Job [${job.id}]:`, error.message);
      // Let BullMQ retry the job based on backoff strategy
      throw error; 
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // Process 5 jobs in parallel for scale
  }
);

// Worker Event Hooks
notificationWorker.on('completed', (job) => {
  console.log(`🏁 Job [${job.id}] fully delivered successfully.`);
});

notificationWorker.on('failed', (job, err) => {
  console.error(`🚩 Job [${job.id}] reached a failure state:`, err.message);
});

console.log('👷 BullMQ: Notification Worker Started');
