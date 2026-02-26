import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from './stores/authStore';
import { initializeFirebase } from './services/notificationService';
import AuthStack from './navigation/AuthStack';
import MainStack from './navigation/MainStack';
import { ActivityIndicator, View } from 'react-native';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const { isLoggedIn, isLoading, bootstrap } = useAuthStore();

  useEffect(() => {
    // Initialize app
    bootstrap();
    initializeFirebase();

    // Listen for notifications
    const subscription = Notifications.addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      // Handle notification tap
      console.log('Notification tapped:', data);
    });

    return () => subscription.remove();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#09090b' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        {isLoggedIn ? <MainStack /> : <AuthStack />}
      </NavigationContainer>
      <Toast />
    </GestureHandlerRootView>
  );
}
