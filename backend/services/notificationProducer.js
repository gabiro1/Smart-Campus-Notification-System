import { notificationQueue } from './notificationQueue.js';
import crypto from 'crypto'; // For idempotent JobId

/**
 * Enterprise Notification Producer
 * -------------------------------
 * Adds notification jobs to the async queue.
 *
 * This layer ensures jobs are formed correctly and prevents
 * double-firing if multiple system triggers are called quickly.
 */

export const produceNotification = async (payload, options = {}) => {
  try {
    const {
      title,
      body,
      topic,          // e.g. 'topic_dept_IT', 'topic_level_Year_4'
      room,           // e.g. 'room_dept_IT', 'room_level_Year_4' (WebSockets)
      data = {},      // Deep link metadata (screen, ID, etc.)
      type = 'event', // 'event', 'reminder', 'announcement'
      jobIdPrefix = 'notif'
    } = payload;

    if (!title || !body || (!topic && !room)) {
      throw new Error('❌ Notification payload incomplete: Need title, body, and topic/room target.');
    }

    // 1. Generate Idempotent JobId (Title + Body + Target + DateSlug)
    // This prevents re-sending the exact same alert if the system double-triggers
    const hash = crypto.createHash('md5')
      .update(`${title}-${body}-${topic || room}-${new Date().toISOString().slice(0, 16)}`)
      .digest('hex');
    
    const jobId = `${jobIdPrefix}_${hash}`;

    // 2. Add Job to Queue
    const job = await notificationQueue.add(
      'deliver-notification',
      {
        title,
        body,
        topic, 
        room,
        data,
        type,
        timestamp: new Date().toISOString(),
      },
      {
        jobId, // The unique key for idempotency
        ...options
      }
    );

    console.log(`📡 Job Added to Queue: [${jobId}] Target: ${topic || room}`);
    return job;

  } catch (error) {
    console.error('❌ Notification Producer Error:', error.message);
    throw error;
  }
};
