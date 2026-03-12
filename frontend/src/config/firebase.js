// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDWA0trlWcC2drKMJfTWQxCmfbTr1ysjKc",
  authDomain: "smart-campus-notification.firebaseapp.com",
  projectId: "smart-campus-notification",
  storageBucket: "smart-campus-notification.firebasestorage.app",
  messagingSenderId: "345617696590",
  appId: "1:345617696590:web:a16cd0327034c67146801f",
  measurementId: "G-73RG2WJSCC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = getMessaging(app);

// Helper function to request permission and get the token
export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, { 
      // GET THIS VAPID KEY FROM FIREBASE CONSOLE:
      // Project Settings -> Cloud Messaging -> Web Push certificates -> Generate Key Pair
      vapidKey: "BN3T4wSQdQRkeWOThW3WjDzoW_1H01rrUUaSEc358Aac2u8g3Wcoft1u0ARJLZxRQCzdEUesJaGoMv34vbJf03Y" 
    });
    
    if (currentToken) {
      console.log('FCM Token generated:', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
    return null;
  }
};

// Helper function to listen for messages when the app is OPEN
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });