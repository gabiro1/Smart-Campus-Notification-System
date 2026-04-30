import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
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
