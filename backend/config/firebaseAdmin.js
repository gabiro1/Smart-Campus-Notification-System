// backend/config/firebaseAdmin.js
import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';

// Resolve the path to your Firebase service account JSON file
const serviceAccountPath = path.resolve(
  './config/FirebaseServc/smart-campus-notification-firebase-adminsdk-fbsvc-a5e6cb3afb.json'
);

// Read and parse the JSON file
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

/**
 * Send a push notification to a SINGLE device
 * Best for: Approvals, password resets, personal reminders
 * * @param {string} token - Device FCM token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 */
const sendPushNotification = async (token, title, body) => {
  const message = {
    notification: { title, body },
    token,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Send a push notification to MULTIPLE devices at once (Highly efficient)
 * Best for: Department broadcasts, campus-wide alerts, new events
 * Features: Automatically splits tokens into batches of 500 to respect Firebase limits.
 * * @param {Array<string>} tokens - Array of device FCM tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 */
const sendMulticastNotification = async (tokens, title, body) => {
  if (!tokens || tokens.length === 0) {
    console.log("No FCM tokens provided. Skipping push notification.");
    return null;
  }

  // Firebase limits multicast to 500 tokens per request.
  // We chunk the array into batches of 500 to handle massive campus broadcasts.
  const BATCH_SIZE = 500;
  const batches = [];
  
  for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
    batches.push(tokens.slice(i, i + BATCH_SIZE));
  }

  let totalSuccess = 0;
  let totalFailure = 0;

  console.log(`Sending multicast notification to ${tokens.length} devices in ${batches.length} batch(es)...`);

  for (const batch of batches) {
    const message = {
      notification: { title, body },
      tokens: batch, // Array of up to 500 tokens
    };

    try {
      // Use sendEachForMulticast (the modern Firebase v11+ method)
      const response = await admin.messaging().sendEachForMulticast(message);
      totalSuccess += response.successCount;
      totalFailure += response.failureCount;

      // Optional: Log failed tokens if you want to clean up your database later
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.error(`Failed to send to token ${batch[idx]}:`, resp.error.message);
          }
        });
      }
    } catch (error) {
      console.error('Error sending multicast batch:', error);
    }
  }

  console.log(`Broadcast Complete! Success: ${totalSuccess}, Failed: ${totalFailure}`);
  return { totalSuccess, totalFailure };
};

export { sendPushNotification, sendMulticastNotification };