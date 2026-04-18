import { useEffect, useRef } from "react";
import { useAuth } from "./context/AuthContext"; // Use your context!
import { requestForToken } from "./config/firebase";
import { Toaster } from "react-hot-toast";
import apiClient from "./services/apiClient";
import AppRoutes from "./routes/main/AppRoutes";

import { useRealTimeNotifications } from "./hooks/useRealTimeNotifications";
import SkipLink from "./components/shared/layout/SkipLink";

function App() {
  const { user } = useAuth();
  const stopDoubleFire = useRef(false); // Fix for StrictMode

  // 📡 Mount the Real-Time Notification Engine
  // This listens for WebSocket 'notification:new' events globally
  useRealTimeNotifications();

  useEffect(() => {
    // 1. Only run if user is logged in AND we haven't initialized yet
    if (!user || stopDoubleFire.current) return;

    stopDoubleFire.current = true; // Lock the execution

    const setupNotifications = async () => {
      try {
        const fcmToken = await requestForToken();
        if (fcmToken) {
          // 🚀 PHASE 1: ENTERPRISE DEVICE REGISTRATION
          // Syncs token AND subscribes user to academic topics (dept/level/campus)
          await apiClient.post("/notifications/register-device", { fcmToken });
          console.log("✅ Device registered and academic topics synced.");
        }
      } catch (error) {
        console.error("FCM Setup Error:", error);
        stopDoubleFire.current = false; // Allow retry if it failed
      }
    };

    setupNotifications();
  }, [user]); // Re-run setup when the user logs in

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <SkipLink />
      <div id="main-content">
        <AppRoutes />
      </div>
    </>
  );
}

export default App;
