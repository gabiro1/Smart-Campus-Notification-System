import { useState, useEffect, useCallback } from "react";
import { NotificationsTab } from "./NotificationsTab";
import notificationService from "../../../../../services/notificationService";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [notifFilter, setNotifFilter] = useState("all");
  const [loading, setLoading] = useState({ notifs: true });
  const [markAllRead] = useState(() => async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, status: "read" })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  });

  const markRead = useCallback(async (notification) => {
    if (notification.status === "read") return;
    try {
      await notificationService.markAsRead(notification._id);
      setNotifications(prev =>
        prev.map(n => n._id === notification._id ? { ...n, status: "read" } : n)
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  }, []);

  const deleteNotif = useCallback(async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  }, []);

  const ago = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(prev => ({ ...prev, notifs: true }));
        const response = await notificationService.getNotifications();
        const data = response.data || response.notifications || [];
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoading(prev => ({ ...prev, notifs: false }));
      }
    };

    fetchNotifications();
  }, []);

  return (
    <NotificationsTab
      notifications={notifications}
      notifFilter={notifFilter}
      loading={loading}
      setNotifFilter={setNotifFilter}
      markAllRead={markAllRead}
      markRead={markRead}
      deleteNotif={deleteNotif}
      ago={ago}
    />
  );
}
