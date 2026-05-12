import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

/**
 * Firebase Service Account from environment variables
 * IMPORTANT: privateKey must preserve newline formatting
 */
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

/**
 * Validate required env variables before initializing Firebase
 * This prevents silent failures at runtime
 */
if (
  !serviceAccount.projectId ||
  !serviceAccount.clientEmail ||
  !serviceAccount.privateKey
) {
  throw new Error("❌ Missing Firebase environment variables in .env file");
}

/**
 * Initialize Firebase Admin SDK (only once)
 */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${serviceAccount.projectId}.appspot.com`,
  });

  console.log("✅ Firebase Admin initialized successfully");
}

/**
 * Export initialized Firebase Admin instance
 */
export default admin;

/**
 * =========================
 * FIREBASE MESSAGING HELPERS
 * =========================
 */

// Send push notification to single device
export const sendPushNotification = async (fcmToken, payload) => {
  try {
    return await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
    });
  } catch (error) {
    console.error("❌ Error sending push notification:", error);
    throw error;
  }
};

// Send push notification to multiple devices
export const sendMulticastNotification = async (fcmTokens, payload) => {
  try {
    return await admin.messaging().sendEachForMulticast({
      tokens: fcmTokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
    });
  } catch (error) {
    console.error("❌ Error sending multicast notification:", error);
    throw error;
  }
};

// Subscribe devices to topic
export const subscribeToTopic = async (tokens, topic) => {
  try {
    return await admin.messaging().subscribeToTopic(tokens, topic);
  } catch (error) {
    console.error("❌ Error subscribing to topic:", error);
    throw error;
  }
};

// Unsubscribe devices from topic
export const unsubscribeFromTopic = async (tokens, topic) => {
  try {
    return await admin.messaging().unsubscribeFromTopic(tokens, topic);
  } catch (error) {
    console.error("❌ Error unsubscribing from topic:", error);
    throw error;
  }
};

// Send notification to topic
export const sendTopicNotification = async (topic, payload) => {
  try {
    return await admin.messaging().send({
      topic,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
    });
  } catch (error) {
    console.error("❌ Error sending topic notification:", error);
    throw error;
  }
};

// Firebase Storage bucket (optional usage)
export const bucket = admin.storage().bucket();