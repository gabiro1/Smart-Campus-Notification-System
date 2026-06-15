import crypto from 'crypto';
import Reminder from '../modules/reminder/model/Reminder.js';
import { reminderQueue } from './reminderQueue.js';

const generateJobId = (reminderId) => {
  const hash = crypto.createHash('md5')
    .update(`reminder_${reminderId}`)
    .digest('hex');
  return `reminder_trigger_${hash}`;
};

export const scheduleReminderJob = async (reminderId) => {
  try {
    const reminder = await Reminder.findById(reminderId);
    if (!reminder) {
      throw new Error(`Reminder ${reminderId} not found`);
    }

    if (reminder.status !== 'scheduled') {
      console.log(`[ReminderScheduler] Reminder ${reminderId} status is ${reminder.status}, skipping scheduling`);
      return;
    }

    const now = new Date();
    const scheduledTime = new Date(reminder.scheduledTime);

    if (scheduledTime <= now) {
      console.log(`[ReminderScheduler] Reminder ${reminderId} scheduledTime is in the past, triggering immediately`);
      await reminderQueue.add('trigger-reminder', {
        reminderId: reminderId.toString(),
      }, {
        jobId: generateJobId(reminderId),
      });
      return { immediate: true };
    }

    const delay = scheduledTime.getTime() - now.getTime();
    const jobId = generateJobId(reminderId);

    const existingJob = await reminderQueue.getJob(jobId);
    if (existingJob) {
      console.log(`[ReminderScheduler] Job ${jobId} already exists, skipping`);
      return;
    }

    const job = await reminderQueue.add('trigger-reminder', {
      reminderId: reminderId.toString(),
    }, {
      jobId,
      delay,
      removeOnComplete: { age: 24 * 3600 },
      removeOnFail: { age: 48 * 3600 },
    });

    console.log(`[ReminderScheduler] Scheduled reminder ${reminderId} in ${Math.round(delay / 1000)}s`);
    return { jobId, delay: Math.round(delay / 1000) };
  } catch (error) {
    console.error('[ReminderScheduler] Error scheduling reminder:', error);
    throw error;
  }
};

export const cancelReminderJob = async (reminderId) => {
  try {
    const jobId = generateJobId(reminderId);
    const job = await reminderQueue.getJob(jobId);
    if (job) {
      await job.remove();
      console.log(`[ReminderScheduler] Cancelled job ${jobId} for reminder ${reminderId}`);
    }
    return { cancelled: !!job };
  } catch (error) {
    console.error('[ReminderScheduler] Error cancelling reminder:', error);
    throw error;
  }
};

export const rescheduleReminderJob = async (reminderId) => {
  await cancelReminderJob(reminderId);
  return await scheduleReminderJob(reminderId);
};
