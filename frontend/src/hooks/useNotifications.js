import { useState, useCallback } from 'react';
import notificationService from '../services/notificationService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const getNotifications = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getNotifications(page, limit);
      setNotifications(data.notifications);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (eventId) => {
    try {
      await notificationService.markAsRead(eventId);
      setNotifications(
        notifications.map((n) =>
          n.eventId === eventId ? { ...n, read: true } : n
        )
      );
      getUnreadCount();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [notifications]);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(
        notifications.filter((n) => n._id !== notificationId)
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [notifications]);

  const getAISummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getAISummary();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUnreadCount = useCallback(async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getAISummary,
    getUnreadCount,
  };
};
