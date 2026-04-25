import cron from 'node-cron';
import Reminder from '../modules/reminder/model/Reminder.js';
import User from '../modules/user/model/User.js';
import Notification from '../modules/notification/models/Notification.js';
import { sendPushNotification } from '../config/firebaseAdmin.js';

let io = null;

export const startReminderCron = async () => {
  try {
    const socketModule = await import('../utils/socketServer.js');
    io = socketModule.io;
  } catch (e) {
    console.log("⚠️ Socket server not ready yet");
  }

  console.log("⏰ Reminder Time-Tracker initialized...");

  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      const dueReminders = await Reminder.find({
        dueDate: { $lte: now }, 
        completed: false,
        notified: false
      }).populate('studentId'); 

      if (dueReminders.length > 0) {
        console.log(`Found ${dueReminders.length} due reminders! Processing...`);

        for (const reminder of dueReminders) {
          const student = reminder.studentId;

          if (!student) {
            reminder.notified = true;
            await reminder.save();
            continue;
          }

          try {
            const notification = new Notification({
              studentId: student._id,
              title: `⏰ Reminder: ${reminder.title}`,
              message: reminder.note || "This is due now!",
              type: "reminder",
              status: "unread",
              category: reminder.category || "general",
              priority: reminder.priority || "medium",
              referenceId: reminder._id,
            });
            await notification.save();

            if (io) {
              const room = `user_${student._id}`;
              io.to(room).emit('notification:new', {
                _id: notification._id,
                title: notification.title,
                message: notification.message,
                type: 'reminder',
                status: 'unread',
                createdAt: new Date(),
              });
            }

            if (student.fcmToken && student.fcmToken.trim()) {
              await sendPushNotification(
                student.fcmToken,
                `⏰ ${reminder.title}`,
                reminder.note || "This is due now!"
              );
            }
          } catch (err) {
            console.error(`Reminder notification error:`, err.message);
          }

          reminder.notified = true;
          await reminder.save();
        }
      }
    } catch (error) {
      console.error("Reminder Cron Error:", error.message);
    }
  });
};