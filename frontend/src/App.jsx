import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

// --- NEW: Firebase & Notifications Imports ---
import { requestForToken, onMessageListener } from "./config/firebase"; // Make sure this path points to your new firebase.js file
import toast, { Toaster } from "react-hot-toast";
import apiClient from "./services/apiClient"; // Adjust this path to wherever your Axios apiClient is

/**
 * @main App
 * @description The root of the application.
 * Manages global providers, routing, and background push notifications.
 */
function App() {
  useEffect(() => {
    // 1. Check if user is logged in (using the same key from your ProtectedRoute)
    const token = localStorage.getItem("authToken");
    if (!token) return;

    // 2. Ask for Notification Permission & Get FCM Token
    const setupNotifications = async () => {
      const fcmToken = await requestForToken();

      if (fcmToken) {
        // 3. Send the token to your backend to save in the User's profile
        try {
          // Note: Adjust this URL to match your backend profile update endpoint
          await apiClient.put("/users/profile", { fcmToken: fcmToken });
          console.log("FCM Token saved to database successfully!");
        } catch (error) {
          console.error("Failed to save FCM token to DB", error);
        }
      }
    };

    setupNotifications();

    // 4. Listen for incoming messages while the user is actively using the app
    const listenForMessages = async () => {
      try {
        const payload = await onMessageListener();

        // Show a beautiful custom toast notification when a message arrives!
        toast.custom(
          (t) => (
            <div
              className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-[#111] shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-white/10`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-bold text-white">
                      {payload?.notification?.title || "New Notification"}
                    </p>
                    <p className="mt-1 text-sm text-neutral-400">
                      {payload?.notification?.body}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-white/10">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-bold text-blue-500 hover:text-blue-400 focus:outline-none transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ),
          { duration: 6000 },
        ); // Stays on screen for 6 seconds

        // Loop the listener so it catches the next message too
        listenForMessages();
      } catch (err) {
        console.log("Message listener failed: ", err);
      }
    };

    listenForMessages();
  }, []); // Empty dependency array means this runs exactly once when the app opens

  return (
    <BrowserRouter>
      {/* Global Toaster for Push Notifications */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Your Routing System */}
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
