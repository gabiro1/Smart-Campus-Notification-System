import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared";
import { Bell, AlertCircle, CheckCircle2, Megaphone, Loader2, Check } from "lucide-react";
import notificationService from "../../../../services/notificationService";
import toast from "react-hot-toast";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      toast.success("All notifications marked as read");
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'alert': return AlertCircle;
      case 'campaign': return Megaphone;
      default: return Bell;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'alert': return "text-amber-500";
      case 'campaign': return "text-blue-500";
      default: return "text-muted-foreground";
    }
  };

  const getBg = (type) => {
    switch (type) {
      case 'alert': return "bg-amber-500/10";
      case 'campaign': return "bg-blue-500/10";
      default: return "bg-accent";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
            Communication Center
          </h1>
          <p className="text-muted-foreground">
            Manage alerts and student campaign history.
          </p>
        </div>
        <button 
          onClick={handleMarkAllRead}
          className="text-sm text-blue-500 hover:text-blue-400 transition-colors font-medium"
        >
          Mark all as read
        </button>
      </header>

      {notifications.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No Notifications</h3>
          <p className="text-muted-foreground">You're all caught up!</p>
        </GlassCard>
      ) : (
        <GlassCard className="p-8">
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {notifications.map((note, index) => {
              const Icon = getIcon(note.type);
              const color = getColor(note.type);
              const bg = getBg(note.type);
              
              return (
                <div key={note._id || index} className="relative flex items-start group">
                  <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center z-10">
                    <Icon size={18} className={color} />
                  </div>
                  <div className={`ml-14 md:ml-0 w-[calc(100%-3.5rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors ${!note.isRead ? 'border-l-4 border-l-blue-500' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-foreground">{note.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{note.message || note.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {note.createdAt ? new Date(note.createdAt).toLocaleString() : 'Just now'}
                        </p>
                      </div>
                      {!note.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(note._id)}
                          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Check size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}
    </div>
  );
}