import { useEffect, useRef } from "react";
import { useAuth } from "./context/AuthContext"; // Use your context!
import { requestForToken, onMessageListener } from "./config/firebase";
import toast, { Toaster } from "react-hot-toast";
import apiClient from "./services/apiClient";
import AppRoutes from "./routes/main/AppRoutes";

function App() {
  const { user } = useAuth();
  const stopDoubleFire = useRef(false); // Fix for StrictMode

  useEffect(() => {
    // 1. Only run if user is logged in AND we haven't initialized yet
    if (!user || stopDoubleFire.current) return;

    stopDoubleFire.current = true; // Lock the execution

    const setupNotifications = async () => {
      try {
        const fcmToken = await requestForToken();
        if (fcmToken) {
          // 2. Sync token with backend
          await apiClient.put("/users/profile", { fcmToken });
          console.log("FCM Token synced successfully.");
        }
      } catch (error) {
        console.error("FCM Setup Error:", error);
        stopDoubleFire.current = false; // Allow retry if it failed
      }
    };

    const startListener = async () => {
      try {
        // Use a standard non-recursive approach
        // or ensure onMessageListener returns a clean payload
        const payload = await onMessageListener();

        toast.custom(
          (t) => (
            <div
              className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-[#111] shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-white/10`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-bold text-white">
                      {payload?.notification?.title || "New Message"}
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
                  className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-bold text-blue-500 hover:text-blue-400 focus:outline-none"
                >
                  Close
                </button>
              </div>
            </div>
          ),
          { duration: 6000 },
        );

        // Re-initiate listener only after receiving a message
        startListener();
      } catch (err) {
        console.error("Listener died:", err);
      }
    };

    setupNotifications();
    startListener();
  }, [user]); // Re-run setup when the user logs in

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <AppRoutes />
    </>
  );
}

export default App;
