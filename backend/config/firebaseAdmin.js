import admin from 'firebase-admin';
import path from 'path';
import { readFileSync } from 'fs';

const serviceAccountPath = path.join(
  process.cwd(),
  'backend',
  'config',
  'FirebaseServc',
  'smart-campus-notification-firebase-adminsdk-fbsvc-3d632ba81d.json'
);

if (!admin.apps.length) {
  try {
    // Read the service account JSON file (Windows-compatible)
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized from JSON file');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    throw error;
  }
}

export default admin;

// Send push notification to a single device
export const sendPushNotification = async (fcmToken, payload) => {
  try {
    const response = await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
    });
    return response;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};

// Send push notification to multiple devices
export const sendMulticastNotification = async (fcmTokens, payload) => {
  try {
    const response = await admin.messaging().sendEachForMulticast({
      tokens: fcmTokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
    });
    return response;
  } catch (error) {
    console.error('Error sending multicast notification:', error);
    throw error;
  }
};

// Subscribe devices to a topic
export const subscribeToTopics = async (registrationTokens, topic) => {
  try {
    const response = await admin.messaging().subscribeToTopic(registrationTokens, topic);
    return response;
  } catch (error) {
    console.error('Error subscribing to topic:', error);
    throw error;
  }
};

// Unsubscribe devices from a topic
export const unsubscribeFromTopic = async (registrationTokens, topic) => {
  try {
    const response = await admin.messaging().unsubscribeFromTopic(registrationTokens, topic);
    return response;
  } catch (error) {
    console.error('Error unsubscribing from topic:', error);
    throw error;
  }
};

// Send notification to a topic
export const sendTopicNotification = async (topic, payload) => {
  try {
    const response = await admin.messaging().send({
      topic: topic,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
    });
    return response;
  } catch (error) {
    console.error('Error sending topic notification:', error);
    throw error;
  }
};

// Get Firebase Storage bucket
export const bucket = admin.storage().bucket();
