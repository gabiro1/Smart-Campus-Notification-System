import cron from 'node-cron';
import User from '../modules/user/model/User.js';
import { generateAndSendDigest } from './digestService.js';

// Configuration for batch processing to avoid rate limits
const BATCH_SIZE = 50; // Process 50 users per batch (adjust based on AI API limits)
const BATCH_DELAY_MS = 2000; // 2 second delay between batches (adjust as needed)

export const startDigestCron = () => {
  console.log('📬 Daily Digest Scheduler initialized...');

  // Run daily at 7:00 AM
  cron.schedule('0 7 * * *', async () => {
    console.log(`[DigestCron] Starting daily digest job at ${new Date().toISOString()}`);
    await processAllUsersDigest();
  });
};

/**
 * Process digest for all active users in batches
 */
const processAllUsersDigest = async () => {
  try {
    // Fetch all users with email addresses (could add filter for notificationPreferences.digestEnabled later)
    const users = await User.find({ email: { $exists: true, $ne: '' } })
      .select('_id email name fcmToken')
      .lean();

    const totalUsers = users.length;
    console.log(`[DigestCron] Found ${totalUsers} users to process`);

    let processedCount = 0;
    let errorCount = 0;

    // Process in batches to avoid overwhelming AI API and email service
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);
      console.log(`[DigestCron] Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(totalUsers / BATCH_SIZE)} (${batch.length} users)`);

      // Process batch in parallel, but with error isolation per user
      const batchPromises = batch.map(async (user) => {
        try {
          const result = await generateAndSendDigest(user, { period: 'daily', filterPriority: 'low' });
          if (result.success && !result.skipped) {
            return { status: 'sent', user: user._id, count: result.notificationCount };
          } else if (result.skipped) {
            return { status: 'skipped', user: user._id };
          } else {
            return { status: 'error', user: user._id, error: result.error };
          }
        } catch (err) {
          return { status: 'error', user: user._id, error: err.message };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);

      // Count results
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          if (result.value.status === 'sent') {
            processedCount++;
          } else if (result.value.status === 'error') {
            errorCount++;
            console.warn(`[DigestCron] Error for user ${result.value.user}: ${result.value.error}`);
          }
        } else {
          errorCount++;
          console.warn(`[DigestCron] Unexpected error:`, result.reason?.message || result.reason);
        }
      });

      // Delay between batches (if more batches remain)
      if (i + BATCH_SIZE < users.length) {
        console.log(`[DigestCron] Batch complete. Waiting ${BATCH_DELAY_MS}ms before next batch...`);
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    console.log(`[DigestCron] Job completed. Total processed: ${processedCount} digests sent. Errors: ${errorCount}`);
  } catch (error) {
    console.error('[DigestCron] Fatal error in processAllUsersDigest:', error);
  }
};
