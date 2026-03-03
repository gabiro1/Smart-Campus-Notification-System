import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ShieldCheck, Info, AlertTriangle, Check, Trash2 } from "lucide-react";
import Navbar from "../../../layouts/Navbar";
import apiClient from "../../../services/apiClient";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get("/notifications/my-alerts"); // Adjusted to your route
      setNotifications(data || []);
    } catch (error) {
      console.error("Error loading notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 p-6 md:p-12 pt-32 max-w-4xl mx-auto w-full space-y-8">
        <header className="flex justify-between items-end border-b border-white/5 pb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Notifications</h1>
            <p className="text-neutral-500 font-medium mt-1">Stay updated with verified campus pulses.</p>
          </div>
          <button className="text-xs font-bold text-blue-500 hover:underline">Clear all</button>
        </header>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20 text-neutral-600 animate-pulse uppercase text-xs font-bold tracking-widest">Synchronizing Pulses...</div>
          ) : (
            <AnimatePresence>
              {notifications.map((notif) => (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`glass p-5 rounded-[28px] border flex gap-5 items-start transition-all ${
                    notif.status === 'unread' ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/5 opacity-70'
                  }`}
                >
                  <div className={`p-3 rounded-2xl ${
                    notif.priority === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {notif.priority === 'high' ? <AlertTriangle size={20} /> : <Info size={20} />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm text-white">{notif.title}</h4>
                      {notif.isVerified && (
                        <span className="flex items-center gap-1 text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">
                          <ShieldCheck size={10} /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-400 text-xs leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-neutral-600 font-bold mt-2 block uppercase">{notif.timeAgo}</span>
                  </div>

                  <button className="p-2 text-neutral-600 hover:text-white transition-colors">
                    <Check size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}