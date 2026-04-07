import cron from 'node-cron';
import { processScheduledAnnouncements } from '../workers/scheduledAnnouncementWorker.js';

export const startScheduledAnnouncementCron = () => {
  console.log("⏰ Scheduled Announcement Worker initialized...");

  // Run every 5 minutes: */5 * * * *
  cron.schedule('*/5 * * * *', async () => {
    try {
      await processScheduledAnnouncements();
    } catch (error) {
      console.error("[ScheduledCron] Fatal error in cron execution:", error);
    }
  });

  console.log("✅ Scheduled Announcement Cron: Runs every 5 minutes");
};
