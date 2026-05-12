import { useEffect, useState, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import toast from 'react-hot-toast';
import React from 'react';

export const useRealTimeNotifications = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isThrottled, setIsThrottled] = useState(false);
  const isLoadingRef = useRef(false);

  const syncNotifications = useCallback(async () => {
    if (!user || isLoadingRef.current || isThrottled) return;

    isLoadingRef.current = true;
    setLoading(true);

    try {
      const res = await notificationService.getNotifications({ page: 1, limit: 20 });
      const fetched = res?.notifications || res?.data || [];
      const unread = res?.unreadCount ?? res?.unread ?? 0;
      setNotifications(fetched);
      setUnreadCount(unread);
    } catch (err) {
      const statusCode = err?.response?.status || err?.status;
      if (statusCode === 429) {
        setIsThrottled(true);
        toast.error('Too many requests. Connection throttled, please wait.');
      } else {
        console.error('Notification sync failure:', err.message);
      }
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, [isThrottled]);

  useEffect(() => {
    if (user) syncNotifications();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    syncNotifications();
    const interval = setInterval(syncNotifications, 15000);
    return () => clearInterval(interval);
  }, [user, syncNotifications]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notif) => {
      if (!notif?.title) return;

      const normalized = {
        _id: notif._id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: notif.title,
        message: notif.message || notif.body || '',
        body: notif.body || notif.message || '',
        type: notif.type || 'info',
        data: notif.data || {},
        status: 'unread',
        createdAt: notif.timestamp || new Date().toISOString(),
      };

      console.log('Real-time Notification:', normalized);

      setNotifications((prev) => {
        const exists = prev.some((n) => n._id === normalized._id);
        return exists ? prev : [normalized, ...prev];
      });
      setUnreadCount((prev) => prev + 1);

      toast.custom(
        (t) => (
          <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#111] shadow-2xl rounded-[15px] pointer-events-auto flex ring-1 ring-white/10 overflow-hidden border border-white/5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      normalized.type === 'event'
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    <span className="font-black text-xs uppercase">{normalized.type?.[0] || 'N'}</span>
                  </div>
                </div>
                <div className="ml-3 flex-1 text-left">
                  <p className="text-sm font-bold text-white uppercase tracking-tight">{normalized.title}</p>
                  <p className="mt-1 text-xs text-neutral-400 leading-relaxed">{normalized.message}</p>
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
        ),
        { duration: 4000 }
      );
    };

    socket.on('notification:new', handleNewNotification);
    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket]);

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
