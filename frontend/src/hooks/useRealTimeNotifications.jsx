import { useEffect, useState, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import toast from 'react-hot-toast';
import React from 'react';

/**
 * useRealTimeNotifications
 * ------------------------
 * Handles full lifecycle of notifications:
 * 1. Initial sync (last 20 notifications + unread count)
 * 2. Real-time updates via WebSocket
 * 3. Instant toasts
 * 4. Utility actions: markAsRead, clearAll
 */
export const useRealTimeNotifications = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isThrottled, setIsThrottled] = useState(false);

  // Strict execution guards
  const hasSyncedInitial = useRef(false);
  const isLoadingRef = useRef(false);

  // --- 1. Initial fetch + merge unread count
  const syncNotifications = useCallback(async () => {
    // Guard Clauses: check if unauthenticated, already loading, throttled, or already synced initial
    if (!user || isLoadingRef.current || isThrottled || hasSyncedInitial.current) {
      return;
    }

    isLoadingRef.current = true;
    setLoading(true);

    try {
      const { notifications: fetched, unreadCount: unread } = await notificationService.getNotifications(1, 20);
      setNotifications(fetched || []);
      setUnreadCount(unread || 0);
      hasSyncedInitial.current = true;
    } catch (err) {
      const statusCode = err?.response?.status || err?.status;
      if (statusCode === 429) {
        setIsThrottled(true);
        toast.error('Too many requests. Connection throttled, please wait.');
      } else {
        console.error('❌ Sync Failure:', err.message);
      }
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, [isThrottled]);

  useEffect(() => {
    if (user) {
      syncNotifications();
    }
  }, [user]); // Run when the authenticated user is available

  // --- 2. WebSocket listener for real-time
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notif) => {
      // Validate required fields
      if (!notif._id || !notif.title || !notif.message) return;

      console.log('🔔 Real-time Notification:', notif);

      // Update state
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show toast
      toast.custom((t) => (
        <div
          className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#111] shadow-2xl rounded-[15px] pointer-events-auto flex ring-1 ring-white/10 overflow-hidden border border-white/5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  notif.type === 'event' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  <span className="font-black text-xs uppercase">{notif.type?.[0] || 'N'}</span>
                </div>
              </div>
              <div className="ml-3 flex-1 text-left">
                <p className="text-sm font-bold text-white uppercase tracking-tight">{notif.title}</p>
                <p className="mt-1 text-xs text-neutral-400 leading-relaxed">{notif.message}</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-white/5">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-6 border border-transparent rounded-none rounded-r-[15px] flex items-center justify-center text-xs font-black text-neutral-500 hover:text-white transition-colors"
            >
              CLOSE
            </button>
          </div>
        </div>
      ), { duration: 4000 });
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket]);

  // --- 3. Mark a single notification as read
  const markAsRead = async (notifId) => {
    try {
      await notificationService.markAsRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, status: 'read' } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // --- 4. Mark all as read
  const clearAll = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to clear all notifications:', err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    clearAll,
    syncNotifications,
  };
};