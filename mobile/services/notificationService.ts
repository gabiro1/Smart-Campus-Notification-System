import * as Notifications from 'expo-notifications';
import { useAuthStore } from '../stores/authStore';

export const initializeFirebase = async () => {
  try {
    // Request notification permissions
    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== 'granted') {
      console.log('Notification permissions not granted');
      return;
    }

    // Get device push token (this is the FCM token in Firebase)
    const token = await Notifications.getExpoPushTokenAsync();

    // Update FCM token in user profile
    if (token.data) {
      const { setFCMToken } = useAuthStore.getState();
      await setFCMToken(token.data);
    }

    // Configure notification channels for Android
    if (Notifications.getNotificationChannelsAsync) {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3b82f6',
      });

      await Notifications.setNotificationChannelAsync('alerts', {
        name: 'Important Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#ef4444',
      });
    }
  } catch (error) {
    console.error('Error initializing Firebase notifications:', error);
  }
};

export const sendLocalNotification = async (title: string, body: string, data?: any) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
        badge: 1,
      },
      trigger: { seconds: 1 },
    });
  } catch (error) {
    console.error('Error sending local notification:', error);
  }
};
