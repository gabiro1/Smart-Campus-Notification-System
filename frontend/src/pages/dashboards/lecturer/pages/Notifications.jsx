import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  AlertCircle,
  CheckCircle2,
  Send,
  Clock,
  CheckCheck,
  Loader2,
  Sparkles,
  FileText,
  RefreshCw,
} from "lucide-react";
import notificationService from "../../../../services/notificationService";
import announcementService from "../../../../services/announcementService";
import copilotService from "../../../../services/copilotService";
import toast from "react-hot-toast";

// Helper to format relative time
const formatTimeAgo = (dateString) => {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

export default function Notifications() {
  const [activeTab, setActiveTab] = useState("incoming");
  const [loading, setLoading] = useState(true);
  
  const [incomingNotifications, setIncomingNotifications] = useState([]);
  const [sentAnnouncements, setSentAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Digest state
  const [digestLoading, setDigestLoading] = useState(false);
  const [digest, setDigest] = useState(null);
  const [digestPeriod, setDigestPeriod] = useState("weekly");
  const [generatingDigest, setGeneratingDigest] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const notifResponse = await notificationService.getNotifications();
        const systemNotifs = (notifResponse.data || notifResponse.notifications || [])
          .filter(n => !n.referenceId)
          .map(n => ({
            id: n._id,
            category: "incoming",
            type: n.type || "system",
            title: n.title || "Notification",
            time: formatTimeAgo(n.createdAt),
            desc: n.message || n.content || "",
            unread: n.status === "unread",
            icon: n.type === "alert" ? AlertCircle : Bell,
            color: n.type === "alert" ? "text-amber-400" : "text-blue-400",
            bg: n.type === "alert" ? "bg-amber-400/10" : "bg-blue-400/10",
            border: n.type === "alert" ? "border-amber-400/20" : "border-blue-400/20",
          }));
        
        setIncomingNotifications(systemNotifs);
        setUnreadCount(systemNotifs.filter(n => n.unread).length);
        
        const announceResponse = await announcementService.getLecturerAnnouncements();
        const sentData = (announceResponse.data || [])
          .slice(0, 20)
          .map(ann => {
            const readCount = ann.viewedBy?.length || 0;
            return {
              id: ann._id,
              category: "sent",
              type: "broadcast",
              title: ann.title,
              time: formatTimeAgo(ann.createdAt),
              desc: `Delivered to students`,
              status: "Delivered",
              viewCount: readCount,
              icon: Send,
              color: "text-blue-400",
              bg: "bg-blue-500/10",
              border: "border-blue-500/20",
            };
          });
        
        setSentAnnouncements(sentData);
        
      } catch (error) {
        console.error("Failed to load notifications:", error);
        toast.error("Could not load notifications");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Fetch digest
  const fetchDigest = async () => {
    setDigestLoading(true);
    try {
      const data = await copilotService.getDigestHistory();
      setDigest(data.digest || data);
    } catch (error) {
      console.log("No digest available yet");
      setDigest(null);
    } finally {
      setDigestLoading(false);
    }
  };

  // Generate new digest
  const generateDigest = async () => {
    setGeneratingDigest(true);
    try {
      const data = await copilotService.generateDigest(digestPeriod);
      setDigest(data.digest || data);
      toast.success("Digest generated successfully!");
    } catch (error) {
      toast.error("Failed to generate digest");
    } finally {
      setGeneratingDigest(false);
    }
  };

  useEffect(() => {
    if (activeTab === "digest") {
      fetchDigest();
    }
  }, [activeTab]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setIncomingNotifications(prev => prev.map(n => ({ ...n, unread: false })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const filteredNotifications = activeTab === "incoming" 
    ? incomingNotifications 
    : sentAnnouncements;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
            Notifications
          </h1>
          <p className="text-muted-foreground">
            View system alerts and your broadcast delivery history.
          </p>
        </div>
        {activeTab === "incoming" && unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20 hover:bg-blue-500/20"
          >
            <CheckCheck size={16} /> Mark all as read
          </button>
        )}
      </header>

      {/* Liquid Tabs */}
      <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/10 w-fit relative">
        {[
          { id: "incoming", label: "Inbox", icon: Bell, showBadge: unreadCount > 0 },
          { id: "sent", label: "Sent History", icon: Send },
          { id: "digest", label: "AI Digest", icon: Sparkles },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-6 py-2.5 text-sm font-medium transition-colors z-10 capitalize flex items-center gap-2 ${
              activeTab === tab.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-neutral-300"
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="notification-tabs"
                className="absolute inset-0 bg-white/[0.08] border border-white/10 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <tab.icon size={14} />
            {tab.label}
            {tab.showBadge && unreadCount > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${activeTab === tab.id ? "bg-blue-500 text-foreground" : "bg-white/10 text-muted-foreground"}`}
              >
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Timeline Layout */}
      <div className="relative pt-4">
        {/* Vertical Timeline Line */}
        <div className="absolute left-6 md:left-8 top-8 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-white/10 to-transparent" />

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 size={40} className="animate-spin text-blue-500" />
            <p className="text-muted-foreground text-sm">Loading notifications...</p>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                  className="relative pl-16 md:pl-20 pr-2 group"
                >
                  {/* Timeline Node */}
                  <div
                    className={`absolute left-2 md:left-4 top-4 w-9 h-9 rounded-full flex items-center justify-center border z-10 transition-transform duration-300 group-hover:scale-110 ${note.bg} ${note.border} ${note.unread ? "shadow-[0_0_15px_rgba(59,130,246,0.4)]" : "shadow-lg"}`}
                  >
                    <note.icon size={16} className={note.color} />
                  </div>

                  {/* Content Card */}
                  <GlassCard
                    delay={0}
                    hover={false}
                    className={`p-5 transition-all duration-300 group-hover:bg-white/[0.04] group-hover:border-white/20 ${note.unread ? "border-blue-500/30 bg-blue-500/[0.02]" : ""}`}
                  >
                    {/* Unread Pulsing Badge */}
                    {note.unread && (
                      <span className="absolute top-5 right-5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                      </span>
                    )}

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                      <h3
                        className={`font-semibold text-base ${note.unread ? "text-foreground" : "text-neutral-200"}`}
                      >
                        {note.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-black/40 px-2.5 py-1 rounded-md border border-border w-fit">
                        <Clock size={12} />
                        {note.time}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {note.desc}
                    </p>

                    {/* Sent History Specific Meta */}
                    {note.category === "sent" && (
                      <div className="flex items-center gap-4 pt-4 border-t border-border">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
                          <CheckCheck size={14} /> {note.status}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {note.viewCount || 0} views
                        </span>
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredNotifications.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pl-16 md:pl-20 py-10"
              >
                <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                  <Bell size={32} className="text-neutral-600 mb-3" />
                  <p className="text-muted-foreground font-medium">
                    You're all caught up!
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    No {activeTab} notifications to display right now.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* AI Digest Tab Content */}
      {activeTab === "digest" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-blue-400" />
              <span className="text-sm text-muted-foreground">AI-Powered Digest</span>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={digestPeriod}
                onChange={(e) => setDigestPeriod(e.target.value)}
                className="bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-blue-500/50"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <button
                onClick={generateDigest}
                disabled={generatingDigest}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-foreground text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {generatingDigest ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                Generate
              </button>
            </div>
          </div>

          {digestLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={40} className="animate-spin text-blue-500" />
              <p className="text-muted-foreground text-sm mt-4">Loading digest...</p>
            </div>
          ) : digest ? (
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={18} className="text-emerald-400" />
                <h3 className="text-lg font-semibold text-foreground">Your Notification Summary</h3>
              </div>
              <div className="prose prose-invert max-w-none">
                {typeof digest === 'string' ? (
                  <p className="text-neutral-300 whitespace-pre-wrap">{digest}</p>
                ) : (
                  <div className="space-y-4">
                    {digest.summary && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">Summary</h4>
                        <p className="text-muted-foreground text-sm">{digest.summary}</p>
                      </div>
                    )}
                    {digest.keyPoints && digest.keyPoints.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">Key Points</h4>
                        <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                          {digest.keyPoints.map((point, i) => (
                            <li key={i}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {digest.actionItems && digest.actionItems.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">Action Items</h4>
                        <ul className="list-decimal list-inside text-muted-foreground text-sm space-y-1">
                          {digest.actionItems.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-8 text-center">
              <Sparkles size={40} className="text-neutral-600 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No digest available</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click "Generate" to create an AI summary of your notifications
              </p>
            </GlassCard>
          )}
        </motion.div>
      )}
    </div>
  );
}
