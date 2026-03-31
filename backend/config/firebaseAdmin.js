import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';

// 1. Resolve the path to your Firebase service account JSON file
const serviceAccountPath = path.resolve(
  './config/FirebaseServc/smart-campus-notification-firebase-adminsdk-fbsvc-a5e6cb3afb.json'
);

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

// 2. Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  //  Ensure this matches your Firebase Console -> Storage settings
  storageBucket: "smart-campus-notification.firebasestorage.app" 
});

// 3. Create the Storage Bucket instance
const bucket = admin.storage().bucket();

/**
 * Send a push notification to a SINGLE device
 */
const sendPushNotification = async (token, title, body) => {
  const message = {
    notification: { title, body },
    token,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending message:', error);
    throw error;
  }
};

/**
 * Send a push notification to MULTIPLE devices at once
 */
const sendMulticastNotification = async (tokens, title, body) => {
  if (!tokens || tokens.length === 0) {
    console.log("⚠️ No FCM tokens provided. Skipping push notification.");
    return null;
  }

  const BATCH_SIZE = 500;
  const batches = [];
  
  for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
    batches.push(tokens.slice(i, i + BATCH_SIZE));
  }

  let totalSuccess = 0;
  let totalFailure = 0;

  console.log(`📡 Sending multicast notification to ${tokens.length} devices...`);

  for (const batch of batches) {
    const message = {
      notification: { title, body },
      tokens: batch, 
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      totalSuccess += response.successCount;
      totalFailure += response.failureCount;
    } catch (error) {
      console.error('❌ Error sending multicast batch:', error);
    }
  }

  console.log(`🏁 Broadcast Complete! Success: ${totalSuccess}, Failed: ${totalFailure}`);
  return { totalSuccess, totalFailure };
};

/**
 * Subscribe a device token to one or more topics
 * Used for scale: topic_dept_CS, topic_level_Year4, etc.
 */
const subscribeToTopics = async (token, topics) => {
  try {
    for (const topic of topics) {
      // Topics must match regex: [a-zA-Z0-9-_.~%]+
      // We will sanitize topics in the controller, but this is the delivery logic.
      await admin.messaging().subscribeToTopic(token, topic);
      console.log(`✅ Subscribed token to topic: ${topic}`);
    }
    return { success: true };
  } catch (error) {
    console.error('❌ Error subscribing to topics:', error);
    throw error;
  }
};

/**
 * Send a notification to a specific topic (Enterprise Scale)
 */
const sendTopicNotification = async (topic, title, body, data = {}) => {
  const message = {
    notification: { title, body },
    data: data, // Custom metadata for deep linking (must be strings)
    topic: topic,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log(`✅ Successfully sent topic message [${topic}]:`, response);
    return response;
  } catch (error) {
    console.error('❌ Error sending topic message:', error);
    throw error;
  }
};

// 4. Export everything for use in your controllers
export { 
  bucket, 
  sendPushNotification, 
  sendMulticastNotification, 
  subscribeToTopics, 
  sendTopicNotification 
};