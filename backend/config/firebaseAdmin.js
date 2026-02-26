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
 * Send a push notification via Firebase Cloud Messaging
 * @param {string} token - Device FCM token
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

export { sendPushNotification };
