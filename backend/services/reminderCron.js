import cron from 'node-cron';
import Reminder from '../modules/reminder/model/Reminder.js';
import ReminderRecipient from '../modules/reminder/model/ReminderRecipient.js';
import { reminderQueue } from './reminderQueue.js';
import { scheduleReminderJob } from './reminderScheduler.js';
import { resolveRecipients, deliverToRecipient } from '../workers/reminderWorker.js';

/**
 * Safety-Net Reminder Cron
 * ------------------------
 * Runs every 60 seconds as a fallback for any reminders that:
 *   - Were created while Redis was unavailable (no BullMQ job scheduled)
 *   - Have a BullMQ job that was lost (Redis restart without persistence)
 *   - Are in "pending" status and should be "scheduled"
 *
 * When Redis/BullMQ is available, it uses the queue for delivery.
 * When Redis is down, it processes reminders directly (inline).
 */
export const startReminderCron = () => {
  console.log("⏰ Safety-Net Reminder Cron initialized (every 60s)");

  cron.schedule('* * * * *', async () => {
    try {
      // 1. Find reminders stuck in "pending" that should be "scheduled"
      const pendingReminders = await Reminder.find({ status: "pending" }).limit(50);
      for (const reminder of pendingReminders) {
        reminder.status = "scheduled";
        await reminder.save();
        await scheduleReminderJob(reminder._id).catch(() => {});
        console.log(`[ReminderCron] Activated pending reminder ${reminder._id}`);
      }

      // 2. Find scheduled reminders past their time
      const now = new Date();
      const dueReminders = await Reminder.find({
        status: "scheduled",
        scheduledTime: { $lte: now },
      }).limit(50);

      for (const reminder of dueReminders) {
        const hasRecipients = await ReminderRecipient.exists({ reminderId: reminder._id });

        // Try BullMQ first (if Redis available)
        if (!hasRecipients) {
          try {
            await reminderQueue.add('trigger-reminder', {
              reminderId: reminder._id.toString(),
            }, {
              jobId: `cron_${reminder._id}`,
            });
            console.log(`[ReminderCron] Queued reminder ${reminder._id} via BullMQ`);
            continue;
          } catch (_) {
            // Redis unavailable — process directly
          }
        }

        // Direct processing (Redis fallback)
        if (!hasRecipients) {
          console.log(`[ReminderCron] Processing reminder ${reminder._id} directly (no Redis)`);

          reminder.status = 'processing';
          await reminder.save();

          try {
            const recipients = await resolveRecipients(reminder);
            if (recipients.length === 0) {
              reminder.status = 'sent';
              reminder.completed = true;
              reminder.completedAt = new Date();
              await reminder.save();
              continue;
            }

            let transporter = null;
            try {
              const nodemailerMod = await import('nodemailer');
              transporter = nodemailerMod.default.createTransport({
                service: "gmail",
                auth: {
                  user: process.env.EMAIL_USER,
                  pass: process.env.EMAIL_APP_PASSWORD,
                },
              });
            } catch (_) {}

            const results = [];
            for (const recipient of recipients) {
              const result = await deliverToRecipient(recipient, reminder, transporter);
              results.push(result);

              await ReminderRecipient.findOneAndUpdate(
                { reminderId: reminder._id, userId: result.recipientId },
                {
                  $set: {
                    deliveryStatus: result.deliveryStatus,
                    deliveryChannel: result.deliveryChannel,
                    sentAt: result.sentAt,
                    failureReason: result.failureReason,
                    retryCount: 0,
                  },
                  $push: { attempts: { $each: result.attempts } },
                },
                { upsert: true }
              );
            }

            const allFailed = results.every(r => r.deliveryStatus === 'failed');
            const anyDelivered = results.some(r => r.deliveryStatus === 'delivered');

            reminder.status = allFailed ? 'failed' : 'sent';
            if (anyDelivered) {
              reminder.completed = true;
              reminder.completedAt = new Date();
            }
            await reminder.save();

            console.log(`[ReminderCron] Delivered reminder ${reminder._id} to ${results.length} recipients`);
          } catch (error) {
            console.error(`[ReminderCron] Error processing reminder ${reminder._id}:`, error.message);
            reminder.status = 'failed';
            await reminder.save();
          }
        }
      }
    } catch (error) {
      console.error("[ReminderCron] Safety-net error:", error.message);
    }
  });
};
