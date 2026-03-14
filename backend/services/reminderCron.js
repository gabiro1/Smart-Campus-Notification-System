import cron from 'node-cron';
import Reminder from '../modules/reminder/model/Reminder.js';
import User from '../modules/user/model/User.js'; 
// 1. Import your custom wrapper function instead of 'admin'
import { sendPushNotification } from '../config/firebaseAdmin.js'; 

export const startReminderCron = () => {
  console.log("⏰ Reminder Time-Tracker initialized...");

  // Runs automatically every single minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      // Find all reminders that are due, not yet completed, and haven't triggered a notification
      const dueReminders = await Reminder.find({
        dueDate: { $lte: now }, 
        completed: false,
        notified: false
      }).populate('studentId'); 

      if (dueReminders.length > 0) {
        console.log(`Found ${dueReminders.length} due reminders! Processing...`);

        for (const reminder of dueReminders) {
          const student = reminder.studentId;

          // Check if the student exists and has a device token registered
          if (student && student.fcmToken) {
            
            // Set up the text for the notification
            const title = `⏰ Reminder: ${reminder.title}`;
            const body = reminder.note || "This task is due right now.";

            try {
              // 2. Use your custom function to send the alert!
              await sendPushNotification(student.fcmToken, title, body);
              console.log(`✅ Push sent to ${student.name} for: "${reminder.title}"`);
            } catch (pushError) {
              console.error(`❌ Push failed for ${student.name}:`, pushError.message);
            }

          } else {
             console.log(`⚠️ Skipped push: No FCM token for student ${student?._id}`);
          }

          // CRITICAL: Mark as notified so we don't spam them again next minute
          reminder.notified = true;
          await reminder.save();
        }
      }
    } catch (error) {
      console.error("Cron Job Error:", error);
    }
  });
};