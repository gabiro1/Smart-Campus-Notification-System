// public/firebase-messaging-sw.js

// Import Firebase scripts (Compatible versions for Service Workers)
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
// Paste your config values here again (it runs in a separate background thread)
firebase.initializeApp({
  apiKey: "AIzaSyDWA0trlWcC2drKMJfTWQxCmfbTr1ysjKc",
  authDomain: "smart-campus-notification.firebaseapp.com",
  projectId: "smart-campus-notification",
  storageBucket: "smart-campus-notification.firebasestorage.app",
  messagingSenderId: "345617696590",
  appId: "1:345617696590:web:a16cd0327034c67146801f",
  measurementId: "G-73RG2WJSCC"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Customize the default browser notification
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico' // Add your university/app logo here
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});