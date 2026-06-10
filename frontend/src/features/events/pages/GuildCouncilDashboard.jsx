import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, CheckCircle, XCircle, AlertTriangle, Calendar,
  Search, Eye, MessageSquare, Loader2, Shield,
  AlertOctagon, BarChart3, Send, Ban, ExternalLink,
  RefreshCw, FileText, Users, Activity, ChevronDown,
  Flag, Filter
} from 'lucide-react';
import eventService from '../../../services/eventService';
import { useSocket } from '../../../context/SocketContext';

const REVIEW_TABS = [
  { key: 'pending', label: 'Pending', icon: Clock, status: 'PENDING_REVIEW' },
  { key: 'under_review', label: 'Reviewing', icon: Eye, status: 'UNDER_REVIEW' },
  { key: 'needs_revision', label: 'Revisions', icon: AlertTriangle, status: 'NEEDS_REVISION' },
  { key: 'approved', label: 'Approved', icon: CheckCircle, status: 'APPROVED' },
  { key: 'scheduled', label: 'Scheduled', icon: Calendar, status: 'SCHEDULED' },
  { key: 'published', label: 'Published', icon: Send, status: 'PUBLISHED' },
  { key: 'rejected', label: 'Rejected', icon: XCircle, status: 'REJECTED' },
];

const STATUS_STYLES = {
  DRAFT: 'bg-muted text-muted-foreground',
  PENDING_REVIEW: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  UNDER_REVIEW: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  NEEDS_REVISION: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
  APPROVED: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  REJECTED: 'bg-red-500/15 text-red-400 border border-red-500/20',
  SCHEDULED: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
  PUBLISHED: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  CANCELLED: 'bg-muted text-muted-foreground',
  EXPIRED: 'bg-muted text-muted-foreground'
};

function ConflictBadge({ conflicts }) {
  if (!conflicts?.length) return null;
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-400">
      <AlertOctagon size={10} />
      {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''}
    </span>
  );
}

const MODAL_COLORS = {
  emerald: {
    bg: 'bg-emerald-500/10', text: 'text-emerald-400',
    btn: 'bg-emerald-600 hover:bg-emerald-500'
  },
  red: {
    bg: 'bg-red-500/10', text: 'text-red-400',
    btn: 'bg-red-600 hover:bg-red-500'
  },
  orange: {
    bg: 'bg-orange-500/10', text: 'text-orange-400',
    btn: 'bg-orange-600 hover:bg-orange-500'
  },
  purple: {
    bg: 'bg-purple-500/10', text: 'text-purple-400',
    btn: 'bg-purple-600 hover:bg-purple-500'
  },
  blue: {
    bg: 'bg-blue-500/10', text: 'text-blue-400',
    btn: 'bg-blue-600 hover:bg-blue-500'
  }
};

const MODAL_CONFIGS = {
  approve: { label: 'Approve Event', color: 'emerald', icon: CheckCircle, placeholder: 'Optional approval note...' },
  reject: { label: 'Reject Event', color: 'red', icon: XCircle, placeholder: 'Reason for rejection (required)...', required: true },
  revision: { label: 'Request Revision', color: 'orange', icon: AlertTriangle, placeholder: 'What needs to be changed (required)...', required: true },
  publish: { label: 'Publish Event', color: 'emerald', icon: Send, placeholder: 'Optional publish note...' },
  schedule: { label: 'Schedule Event', color: 'purple', icon: Calendar, placeholder: 'Schedule notes...' },
  escalate: { label: 'Escalate Event', color: 'blue', icon: Flag, placeholder: 'Reason for escalation...' },
};

function ActionModal({ actionType, event, comment, loading, onCommentChange, onClose, onAction }) {
  const config = MODAL_CONFIGS[actionType];
  if (!config || !event) return null;

  const colors = MODAL_COLORS[config.color] || MODAL_COLORS.blue;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-card border border-border sm:rounded-xl shadow-2xl max-w-lg w-full h-full sm:h-auto overflow-y-auto sm:overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.bg}`}>
              <config.icon size={18} className={colors.text} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{config.label}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{event.title}</p>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Calendar size={12} />{new Date(event.startDate).toLocaleDateString()}</span>
            <span className="inline-flex items-center gap-1"><Users size={12} />{event.organizerName}</span>
          </div>
          {actionType === 'schedule' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Scheduled Date</label>
              <input
                type="date"
                value={comment ? comment.split('T')[0] : event.startDate?.split('T')[0] || ''}
                onChange={e => onCommentChange(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{config.required ? 'Reason *' : 'Comment'}</label>
            <textarea
              value={actionType === 'schedule' ? '' : comment}
              onChange={e => onCommentChange(e.target.value)}
              placeholder={config.placeholder}
              rows={3}
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
              disabled={actionType === 'schedule'}
            />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-border flex items-center justify-end gap-3 bg-muted/20">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onAction(actionType)}
            disabled={loading || (config.required && !comment.trim())}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white ${colors.btn} transition-colors disabled:opacity-50 shadow-sm`}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {config.label}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function GuildCouncilDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [actionComment, setActionComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [statusGroups, setStatusGroups] = useState([]);

  const fetchQueue = useCallback(async () => {
    if (activeTab === 'analytics') return;
    setLoading(true);
    try {
      const params = { limit: 50, search: search || undefined };
      const tab = REVIEW_TABS.find(t => t.key === activeTab);
      if (tab?.status) {
        if (activeTab === 'pending') params.status = 'PENDING_REVIEW';
        else if (activeTab === 'under_review') params.status = 'UNDER_REVIEW';
        else if (activeTab === 'needs_revision') params.status = 'NEEDS_REVISION';
        else if (activeTab === 'approved') params.status = 'APPROVED';
        else if (activeTab === 'scheduled') params.status = 'SCHEDULED';
        else if (activeTab === 'published') params.status = 'PUBLISHED';
        else if (activeTab === 'rejected') params.status = 'REJECTED';
        else params.status = ['PENDING_REVIEW', 'UNDER_REVIEW', 'NEEDS_REVISION'];
      }
      const res = await eventService.getReviewQueue(params);
      setEvents(res.events || []);
      const statusRes = await eventService.getReviewQueueByStatus().catch(err => {
        console.warn('Status counts fetch failed:', err?.response?.data || err.message);
        return { statusGroups: [] };
      });
      setStatusGroups(statusRes.statusGroups || []);
    } catch (err) {
      console.error('Queue fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const analyticsRes = await eventService.getDashboardAnalytics();
      setAnalytics(analyticsRes.analytics || analyticsRes);
      const statusRes = await eventService.getReviewQueueByStatus().catch(err => {
        console.warn('Status counts fetch failed:', err?.response?.data || err.message);
        return { statusGroups: [] };
      });
      setStatusGroups(statusRes.statusGroups || []);
    } catch (err) {
      console.error('Analytics fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const { socket } = useSocket();

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    } else {
      fetchQueue();
    }
  }, [activeTab, fetchQueue, fetchAnalytics]);

  useEffect(() => {
    if (!socket) return;
    const handleEventSubmitted = () => {
      if (activeTab !== 'analytics') fetchQueue();
    };
    socket.on('event:submitted', handleEventSubmitted);
    return () => { socket.off('event:submitted', handleEventSubmitted); };
  }, [socket, activeTab, fetchQueue]);

  const handleAction = useCallback(async (action) => {
    if (!selectedEvent) return;
    setActionLoading(true);
    try {
      switch (action) {
        case 'approve':
          await eventService.approveEvent(selectedEvent._id, actionComment);
          break;
        case 'reject':
          if (!actionComment.trim()) { alert('Rejection reason required'); setActionLoading(false); return; }
          await eventService.rejectEvent(selectedEvent._id, actionComment);
          break;
        case 'revision':
          if (!actionComment.trim()) { alert('Revision notes required'); setActionLoading(false); return; }
          await eventService.requestRevision(selectedEvent._id, actionComment);
          break;
        case 'publish':
          await eventService.publishApprovedEvent(selectedEvent._id, actionComment);
          break;
        case 'schedule':
          await eventService.scheduleEvent(selectedEvent._id, actionComment || selectedEvent.startDate, '');
          break;
        case 'escalate':
          await eventService.escalateEvent(selectedEvent._id, actionComment);
          break;
      }
      setActionModal(null);
      setSelectedEvent(null);
      setActionComment('');
      fetchQueue();
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setActionLoading(false);
    }
  }, [selectedEvent, actionComment, fetchQueue]);

  const getCountByStatus = (status) => {
    const group = statusGroups.find(s => s._id === status);
    return group?.count || 0;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
  };



  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 space-y-6">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Shield size={16} className="text-blue-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Event Moderation</h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base ml-10">
            Review, approve, and manage all campus event requests
          </p>
        </div>
        <button
          onClick={() => { setActiveTab('analytics'); if (activeTab === 'analytics') fetchAnalytics(); else fetchQueue(); }}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          <RefreshCw size={14} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2"
      >
        {REVIEW_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeTab === tab.key
                ? 'border-primary/30 bg-primary/5'
                : 'border-border bg-card hover:border-primary/20'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <tab.icon size={14} className={activeTab === tab.key ? 'text-foreground' : 'text-muted-foreground'} />
              <span className="text-lg font-bold text-foreground">{getCountByStatus(tab.status || '')}</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">{tab.label}</p>
          </button>
        ))}
        <button
          onClick={() => setActiveTab('analytics')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeTab === 'analytics'
              ? 'border-primary/30 bg-primary/5'
              : 'border-border bg-card hover:border-primary/20'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <BarChart3 size={14} className={activeTab === 'analytics' ? 'text-foreground' : 'text-muted-foreground'} />
          </div>
          <p className="text-[10px] text-muted-foreground leading-tight">Analytics</p>
        </button>
      </motion.div>

      {activeTab !== 'analytics' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative max-w-md"
        >
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, organizer, department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </motion.div>
      )}

      {activeTab === 'analytics' ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                  <div className="h-3 w-20 bg-muted rounded mb-3" />
                  <div className="h-8 w-12 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Activity size={14} />
                    <span className="text-xs font-medium">Total Events</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{analytics?.totalEvents || 0}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center gap-2 text-emerald-400 mb-2">
                    <CheckCircle size={14} />
                    <span className="text-xs font-medium">Published</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{analytics?.publishedCount || 0}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center gap-2 text-amber-400 mb-2">
                    <Clock size={14} />
                    <span className="text-xs font-medium">Pending</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{analytics?.pendingCount || 0}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <XCircle size={14} />
                    <span className="text-xs font-medium">Rejected</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{analytics?.rejectedCount || 0}</p>
                </div>
              </div>

              {analytics?.categoryDistribution?.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="font-semibold text-foreground mb-3 text-sm">Category Distribution</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {analytics.categoryDistribution.map(cat => (
                      <div key={cat._id} className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg">
                        <span className="text-xs text-muted-foreground capitalize">{cat._id}</span>
                        <span className="text-xs font-medium text-foreground">{cat.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      ) : (
        <>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-lg bg-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <div className="h-5 w-16 bg-muted rounded" />
                        <div className="h-5 w-20 bg-muted rounded" />
                      </div>
                      <div className="h-4 w-3/4 bg-muted rounded" />
                      <div className="h-3 w-1/2 bg-muted rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <CheckCircle size={28} className="text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium mb-1">Queue is clear</p>
              <p className="text-muted-foreground text-sm">No events waiting in this queue.</p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-2"
            >
              {events.map((event, index) => (
                <motion.div
                  key={event._id}
                  variants={itemVariants}
                  className="bg-card border border-border rounded-xl hover:border-primary/30 transition-all duration-200"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      {event.posterUrl ? (
                        <img src={event.posterUrl} alt="" className="w-10 sm:w-14 h-10 sm:h-14 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-10 sm:w-14 h-10 sm:h-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <FileText size={16} className="sm:size-5 text-muted-foreground" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${STATUS_STYLES[event.status] || STATUS_STYLES.DRAFT}`}>
                            {event.status?.replace(/_/g, ' ')}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 capitalize">
                            {event.category}
                          </span>
                          <ConflictBadge conflicts={event.conflicts} />
                        </div>

                        <h3 className="font-semibold text-foreground truncate">{event.title}</h3>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                          <span className="inline-flex items-center gap-1"><Users size={12} />{event.organizerName || event.createdBy?.name}</span>
                          <span className="inline-flex items-center gap-1"><Calendar size={12} />{new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span className="inline-flex items-center gap-1"><Clock size={12} />{event.startTime}</span>
                          {event.expectedAttendance > 0 && (
                            <span className="inline-flex items-center gap-1"><Users size={12} />{event.expectedAttendance} attendees</span>
                          )}
                        </div>

                        {event.notesToReviewers && (
                          <div className="mt-2 flex items-start gap-1.5 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300">
                            <MessageSquare size={12} className="mt-0.5 shrink-0" />
                            <span>{event.notesToReviewers}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        {event.status === 'PENDING_REVIEW' && (
                          <>
                            <button onClick={() => { setSelectedEvent(event); setActionModal('approve'); }} className="inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-500 transition-all shadow-sm" title="Approve">
                              <CheckCircle size={12} /> <span className="hidden sm:inline">Approve</span>
                            </button>
                            <button onClick={() => { setSelectedEvent(event); setActionModal('revision'); }} className="inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-medium hover:bg-orange-500 transition-all shadow-sm" title="Request revision">
                              <AlertTriangle size={12} /> <span className="hidden sm:inline">Revise</span>
                            </button>
                            <button onClick={() => { setSelectedEvent(event); setActionModal('reject'); }} className="inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-500 transition-all shadow-sm" title="Reject">
                              <XCircle size={12} /> <span className="hidden sm:inline">Reject</span>
                            </button>
                          </>
                        )}
                        {event.status === 'APPROVED' && (
                          <>
                            <button onClick={() => { setSelectedEvent(event); setActionModal('publish'); }} className="inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-500 transition-all shadow-sm" title="Publish">
                              <Send size={12} /> <span className="hidden sm:inline">Publish</span>
                            </button>
                            <button onClick={() => { setSelectedEvent(event); setActionModal('schedule'); }} className="inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-500 transition-all shadow-sm" title="Schedule">
                              <Calendar size={12} /> <span className="hidden sm:inline">Schedule</span>
                            </button>
                          </>
                        )}
                        <button onClick={() => navigate(`/guild/events/${event._id}`)} className="inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs font-medium hover:text-foreground hover:bg-accent transition-all" title="View details">
                          <ExternalLink size={12} /> <span className="hidden sm:inline">View</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </>
      )}

      <AnimatePresence>
        {actionModal && (
          <ActionModal
            actionType={actionModal}
            event={selectedEvent}
            comment={actionComment}
            loading={actionLoading}
            onCommentChange={setActionComment}
            onClose={() => { setActionModal(null); setActionComment(''); }}
            onAction={handleAction}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
