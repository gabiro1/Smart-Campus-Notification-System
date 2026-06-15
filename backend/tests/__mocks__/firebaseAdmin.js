const mockMessaging = {
  send: () => Promise.resolve('mock-message-id'),
  sendEachForMulticast: () => Promise.resolve({ successCount: 1, failureCount: 0 }),
  subscribeToTopic: () => Promise.resolve({ successCount: 1 }),
  unsubscribeFromTopic: () => Promise.resolve({ successCount: 1 }),
};

const mockAdmin = {
  apps: [],
  messaging: () => mockMessaging,
  storage: () => ({ bucket: () => ({}) }),
  credential: { cert: () => ({}) },
  initializeApp: () => {},
  auth: () => ({
    verifyIdToken: () => Promise.resolve({
      uid: 'mock-firebase-uid',
      email: 'firebase@test.com',
      name: 'Firebase User',
      picture: '',
    }),
  }),
};

export default mockAdmin;

export const sendPushNotification = () => Promise.resolve('mock-message-id');
export const sendMulticastNotification = () => Promise.resolve({ successCount: 1, failureCount: 0 });
export const subscribeToTopic = () => Promise.resolve({ successCount: 1 });
export const unsubscribeFromTopic = () => Promise.resolve({ successCount: 1 });
export const sendTopicNotification = () => Promise.resolve('mock-message-id');
export const bucket = {};
