import Announcement from "../modules/announcement/model/Announcement.js";
import User from "../modules/user/model/User.js";
import NotificationLog from "../modules/notification/models/NotificationLog.js";
import { getPersonalizedContentBatch } from "../services/aiPersonalizationService.js";
import { sendMulticastNotification } from "../config/firebaseAdmin.js";
import { shouldSendNow } from "../utils/quietHours.js";
import { ensureCachedTranslation } from "../services/translationService.js";
import mongoose from "mongoose";
import { fileURLToPath } from 'url';

// Scheduled Announcements Worker
// Runs every 5 minutes to dispatch announcements whose scheduled time has arrived
export const processScheduledAnnouncements = async () => {
  console.log(`[ScheduledWorker] Checking for announcements to dispatch at ${new Date().toISOString()}`);

  try {
    const now = new Date();

    // Find all scheduled announcements that are due (process oldest first)
    const dueAnnouncements = await Announcement.find({
      status: "Scheduled",
      scheduledAt: { $lte: now }
    }).sort({ scheduledAt: 1 }).lean();

    if (dueAnnouncements.length === 0) {
      console.log(`[ScheduledWorker] No scheduled announcements to process`);
      return;
    }

    console.log(`[ScheduledWorker] Found ${dueAnnouncements.length} scheduled announcement(s) to dispatch`);

    for (const announcement of dueAnnouncements) {
      try {
        const announcementId = announcement._id;
        const targetClass = announcement.targetClass;
        const title = announcement.title;
        const content = announcement.content;
        const lecturerId = announcement.lecturer;
        const announcementPriority = announcement.aiMetadata?.priority || 'medium';

        // 1. Fetch students in class with fcmToken, quietHours, and languagePreference
        const students = await User.find({ classId: targetClass })
          .select('_id role fcmToken quietHours languagePreference')
          .lean();

        // 2. Filter by quiet hours and have tokens
        const validRecipients = students.filter(u => {
          const hasToken = u.fcmToken && u.fcmToken.trim() !== "";
          if (!hasToken) return false;
          // Check quiet hours: only send if canSendNow returns true
          return shouldSendNow(u, announcementPriority);
        });

        // 3. Ensure Kinyarwanda translation is cached if needed (for Rw students)
        let cachedRw = null;
        try {
          cachedRw = await ensureCachedTranslation(announcementId, title, content, students);
        } catch (err) {
          console.warn(`[ScheduledWorker] Translation failed for ${announcementId}:`, err.message);
        }

        // 4. Generate personalized content per student (for ALL students, not just valid recipients)
        let personalizedMap;
        try {
          personalizedMap = await getPersonalizedContentBatch(title, content, students);
        } catch (err) {
          console.warn(`[ScheduledWorker] Personalization failed for ${announcementId}:`, err.message);
          personalizedMap = new Map();
          students.forEach(u => personalizedMap.set(u._id.toString(), { title, message: content }));
        }

        // 5. Override with Kinyarwanda translation for Rw-preferred students
        if (cachedRw) {
          students.filter(s => s.languagePreference === 'rw').forEach(s => {
            personalizedMap.set(s._id.toString(), { title: cachedRw.title, message: cachedRw.body });
          });
        }

        // 4. Send Push Notifications with quiet hours filtering
        if (validRecipients.length > 0) {
          // Group tokens by personalized variant to minimize API calls
          const tokenGroups = new Map();
          validRecipients.forEach(user => {
            const variant = personalizedMap.get(user._id.toString()) || { title, message: content };
            const key = `${variant.title}|||${variant.message}`;
            if (!tokenGroups.has(key)) tokenGroups.set(key, { title: variant.title, body: variant.message, tokens: [] });
            tokenGroups.get(key).tokens.push(user.fcmToken);
          });

          // Send each group as a multicast (max 500 tokens per batch)
          const pushPromises = [];
          for (const { title: pushTitle, body: pushBody, tokens } of tokenGroups.values()) {
            pushPromises.push(
              sendMulticastNotification(tokens, pushTitle, pushBody).catch(err => {
                console.error(`[ScheduledWorker] Push failed for ${tokens.length} tokens:`, err.message);
              })
            );
          }
          await Promise.all(pushPromises);
          console.log(`[ScheduledWorker] Sent push to ${validRecipients.length} devices (filtered by quiet hours)`);
        } else {
          console.log(`[ScheduledWorker] No valid recipients with tokens and quiet hours allowance for announcement ${announcementId}`);
        }

        // 5. Create Notification Logs for ALL students (not just push recipients) for audit/history
        // Include both valid recipients and those who didn't receive push (due to quiet hours/tokens)
        // Use the same personalized variants for consistency
        if (students.length > 0) {
          const logs = students.map((student) => {
            const variant = personalizedMap.get(student._id.toString()) || { title, message: content };
            return {
              studentId: student._id,
              senderId: lecturerId,
              title: variant.title,
              message: variant.message,
              type: "announcement",
              status: "unread",
              referenceId: announcementId,
              priority: announcementPriority,
              requiresAcknowledgment: announcement.requiresAcknowledgment || false,
              acknowledgedAt: null
            };
          });

          try {
            await NotificationLog.insertMany(logs);
            console.log(`[ScheduledWorker] Created ${logs.length} notification logs for announcement ${announcementId}`);
          } catch (logErr) {
            console.error(`[ScheduledWorker] Failed to create notification logs for ${announcementId}:`, logErr.message);
          }
        }

        // 6. Update announcement status to Active and clear scheduledAt
        const result = await Announcement.findByIdAndUpdate(
          announcementId,
          {
            $set: { status: "Active" },
            $unset: { scheduledAt: "" }
          },
          { new: true }
        );

        if (result) {
          console.log(`[ScheduledWorker] Announcement ${announcementId} marked as Active`);
        } else {
          console.error(`[ScheduledWorker] Failed to update announcement ${announcementId} status`);
        }

      } catch (err) {
        console.error(`[ScheduledWorker] Error processing announcement ${announcement._id}:`, err.message);
        // Continue with next announcement - one failure shouldn't stop others
      }
    }

    console.log(`[ScheduledWorker] Processing complete. Dispatched ${dueAnnouncements.length} announcement(s)`);

  } catch (error) {
    console.error("[ScheduledWorker] Fatal error:", error);
  }
};

// For manual testing
const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  processScheduledAnnouncements().then(() => {
    console.log("Test run complete");
    process.exit(0);
  });
}
