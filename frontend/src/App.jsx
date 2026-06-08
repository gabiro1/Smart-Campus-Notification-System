import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { requestForToken } from "./config/firebase";
import { Toaster } from "react-hot-toast";
import apiClient from "./services/apiClient";
import AppRoutes from "./routes/main/AppRoutes";
import { useRealTimeNotifications } from "./hooks/useRealTimeNotifications";

import SkipLink from "./components/shared/layout/SkipLink";
import InstallPrompt from "./components/InstallPrompt";
import IOSInstallPrompt from "./components/IOSInstallPrompt";

import { initSWListener } from "./lib/swListener";
import { processSyncQueue } from "./lib/syncQueue";

function App() {
  const { user } = useAuth();
  const stopDoubleFire = useRef(false);

  // ===============================
  // 1. Service Worker Sync Listener
  // ===============================
  useEffect(() => {
    initSWListener(processSyncQueue);
  }, []);

  // ===============================
  // 2. Activity heartbeat - track last active
  // ===============================
  const lastBeatRef = useRef(0);
  const location = useLocation();
  useEffect(() => {
    if (!user) return;
    const beat = () => {
      if (Date.now() - lastBeatRef.current < 120000) return;
      lastBeatRef.current = Date.now();
      apiClient.put('/users/last-active').catch(() => {});
    };
    beat();
    const interval = setInterval(beat, 120000);
    return () => clearInterval(interval);
  }, [user]);

  // Track navigation as activity
  useEffect(() => {
    if (!user) return;
    if (Date.now() - lastBeatRef.current < 30000) return;
    lastBeatRef.current = Date.now();
    apiClient.put('/users/last-active').catch(() => {});
  }, [location.pathname, user]);

  // ===============================
  // 6. Real-time notifications engine
  // ===============================
  useRealTimeNotifications();

  // ===============================
  // 5. Firebase FCM registration
  // ===============================
  useEffect(() => {
    if (!user || stopDoubleFire.current) return;
    stopDoubleFire.current = true;

    const setupNotifications = async () => {
      try {
        const fcmToken = await requestForToken();

        if (fcmToken) {
          await apiClient.post("/notifications/register-device", {
            fcmToken,
          });

          console.log("✅ Device registered and topics synced.");
        }
      } catch (error) {
        console.error("FCM Setup Error:", error);
        stopDoubleFire.current = false;
      }
    };

    setupNotifications();
  }, [user]);

  // ===============================
  // UI
  // ===============================
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <SkipLink />
      <InstallPrompt />
      <IOSInstallPrompt />

      <div id="main-content" className="min-h-screen">
        <AppRoutes />
      </div>
    </>
  );
}

export default App;