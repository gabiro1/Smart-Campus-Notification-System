/**
 * Enterprise Notification Engine: E2E Test Script
 * ---------------------------------------------
 * This script manually triggers a notification job into the BullMQ queue
 * to verify if the Worker picks it up and pushes it to Socket/FCM.
 */

import dotenv from 'dotenv';
dotenv.config();

import { produceNotification } from './services/notificationProducer.js';

const testNotification = async () => {
  console.log('🚀 Starting E2E Notification Test...');

  try {
    const job = await produceNotification({
      title: 'Enterprise Sync Test',
      body: 'If you see this, the BullMQ -> Worker -> Socket flow is functional.',
      topic: 'topic_dept_IT', // Mock topic
      room: 'room_dept_IT',  // Mock room
      type: 'event',
      data: {
        screen: 'PulseDetail',
        pulseId: 'test_id_123'
      }
    });

    console.log(`✅ Test Job Queued: ID ${job.id}`);
    console.log('💡 Check your backend console for Worker logs and frontend for the Toast!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Test Failed:', err.message);
    process.exit(1);
  }
};

testNotification();
