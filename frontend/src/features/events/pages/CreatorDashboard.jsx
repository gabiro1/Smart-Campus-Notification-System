import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Clock, AlertTriangle, CheckCircle, XCircle,
  Calendar, ChevronRight, Plus, Search, Edit3, Send,
  Trash2, Loader2, Ban, MessageSquare, Layers, ShieldCheck,
  Grid, List
} from 'lucide-react';
import eventService from '../../../services/eventService';
import EventForm from './EventForm';
import { useAuth } from '../../../context/AuthContext';

const STATUS_TABS = [
  { key: 'all', label: 'All', icon: Layers },
  { key: 'DRAFT', label: 'Drafts', icon: FileText },
  { key: 'PENDING_REVIEW', label: 'Pending', icon: Clock },
  { key: 'NEEDS_REVISION', label: 'Revise', icon: AlertTriangle },
  { key: 'APPROVED', label: 'Approved', icon: CheckCircle },
  { key: 'REJECTED', label: 'Rejected', icon: XCircle },
  { key: 'PUBLISHED', label: 'Published', icon: Calendar },
  { key: 'CANCELLED', label: 'Cancelled', icon: Ban }
];

const STATUS_STYLES = {
  DRAFT: 'bg-muted text-muted-foreground',
  PENDING_REVIEW: 'bg-amber-500/15 text-amber-400',
  UNDER_REVIEW: 'bg-blue-500/15 text-blue-400',
  NEEDS_REVISION: 'bg-orange-500/15 text-orange-400',
  APPROVED: 'bg-emerald-500/15 text-emerald-400',
  REJECTED: 'bg-red-500/15 text-red-400',
  SCHEDULED: 'bg-purple-500/15 text-purple-400',
  PUBLISHED: 'bg-emerald-500/15 text-emerald-400',
  CANCELLED: 'bg-muted text-muted-foreground',
  EXPIRED: 'bg-muted text-muted-foreground'
};

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canDirectPublish = ['principal', 'admin', 'guild_president'].includes(user?.role);
  const [activeTab, setActiveTab] = useState('all');
  const [events, setEvents] = useState([]);
  const [statusCounts, setStatusCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });

  const fetchEvents = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (activeTab !== 'all') params.status = activeTab;
      if (search) params.search = search;
      const res = await eventService.getMyEvents(params);
      setEvents(res.events || []);
      setStatusCounts(res.statusCounts || []);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleCreateDraft = async (data) => {
    try {
      await eventService.createDraft(data);
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      console.error('Create draft failed:', err);
    }
  };

  const handleUpdateDraft = async (data) => {
    if (!editingEvent) return;
    try {
      await eventService.updateDraft(editingEvent._id, data);
      setEditingEvent(null);
      fetchEvents();
    } catch (err) {
      console.error('Update draft failed:', err);
    }
  };

  const handleSubmit = async (id) => {
    try {
      if (canDirectPublish) {
        await eventService.createAndPublish({ id });
      } else {
        await eventService.submitForReview(id);
      }
      fetchEvents();
    } catch (err) {
      console.error('Submit failed:', err);
    }
  };

  const handlePublishDraft = async (data) => {
    try {
      await eventService.createAndPublish(data);
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      console.error('Publish failed:', err);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this event?')) return;
    try {
      await eventService.cancelEvent(id);
      fetchEvents();
    } catch (err) {
      console.error('Cancel failed:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event permanently?')) return;
    try {
      await eventService.deleteEvent(id);
      fetchEvents();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const getCountForStatus = (status) => {
    const found = statusCounts.find(s => s._id === status);
    return found?.count || 0;
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
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">My Events</h1>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
            {canDirectPublish ? 'Create and publish events directly' : 'Create and manage your event requests'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-card border border-border rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-accent text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              title="List view"
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-accent text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              title="Grid view"
            >
              <Grid size={15} />
            </button>
          </div>
          <button
            onClick={() => { setEditingEvent(null); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all text-sm font-medium shadow-lg shadow-primary/20 shrink-0"
          >
            {canDirectPublish ? <ShieldCheck size={16} /> : <Plus size={16} />}
            {canDirectPublish ? 'Publish' : 'New'}
          </button>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 overflow-x-auto pb-1 lg:scrollbar-none"
      >
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-primary/10 text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
            {tab.key !== 'all' && getCountForStatus(tab.key) > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-medium">
                {getCountForStatus(tab.key)}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative max-w-md"
      >
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search your events..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </motion.div>

      <AnimatePresence>
        {(showForm || editingEvent) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-12 pb-8 bg-black/80 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full max-w-4xl mx-4"
            >
              <EventForm
                initialData={editingEvent}
                isDirectPublish={canDirectPublish}
                onSubmit={editingEvent ? handleUpdateDraft : (canDirectPublish ? handlePublishDraft : handleCreateDraft)}
                onCancel={() => { setShowForm(false); setEditingEvent(null); }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-muted shrink-0" />
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
            <Calendar size={28} className="text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium mb-1">No events yet</p>
          <p className="text-muted-foreground text-sm max-w-xs">
            {activeTab === 'all'
              ? 'Create your first event request to get started.'
              : `No events with status "${activeTab.replace('_', ' ').toLowerCase()}".`}
          </p>
          {activeTab === 'all' && (
            <button
              onClick={() => { setEditingEvent(null); setShowForm(true); }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-all"
            >
              <Plus size={14} />
              Create Event
            </button>
          )}
        </motion.div>
      ) : viewMode === 'grid' ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {events.map(event => (
            <motion.div
              key={event._id}
              variants={itemVariants}
              className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300 group relative"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              {event.posterUrl ? (
                <div className="h-32 overflow-hidden">
                  <img src={event.posterUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="h-32 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <Calendar size={28} className="text-muted-foreground/40" />
                </div>
              )}
              <div className="p-3.5">
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_STYLES[event.status] || STATUS_STYLES.DRAFT}`}>
                    {event.status?.replace(/_/g, ' ')}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 capitalize">
                    {event.category}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 mb-2">{event.title}</h3>
                <div className="space-y-1 text-[11px] text-muted-foreground">
                  <div className="inline-flex items-center gap-1.5">
                    <Calendar size={10} />{new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="inline-flex items-center gap-1.5">
                    <Clock size={10} />{event.startTime}
                  </div>
                  {event.venue && (
                    <div className="inline-flex items-center gap-1.5 truncate max-w-full">
                      <span className="shrink-0">📍</span>{event.venue}
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t border-border px-3.5 py-2 flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-0.5">
                  {event.status === 'DRAFT' && (
                    <>
                      <button onClick={() => { setEditingEvent(event); setShowForm(true); }} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all" title="Edit">
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => {
                          if (canDirectPublish) {
                            if (window.confirm('Publish this event directly?')) handleSubmit(event._id);
                          } else {
                            handleSubmit(event._id);
                          }
                        }}
                        className={`p-1.5 rounded-md transition-all ${
                          canDirectPublish ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                        title={canDirectPublish ? 'Publish directly' : 'Submit for review'}
                      >
                        {canDirectPublish ? <ShieldCheck size={12} /> : <Send size={12} />}
                      </button>
                    </>
                  )}
                  {event.status === 'NEEDS_REVISION' && (
                    <button onClick={() => { setEditingEvent(event); setShowForm(true); }} className="p-1.5 rounded-md text-orange-400 hover:bg-orange-500/10 transition-all" title="Edit & resubmit">
                      <Edit3 size={12} />
                    </button>
                  )}
                  {['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'SCHEDULED'].includes(event.status) && (
                    <button onClick={() => handleCancel(event._id)} className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all" title="Cancel">
                      <Ban size={12} />
                    </button>
                  )}
                  {['DRAFT', 'CANCELLED', 'REJECTED'].includes(event.status) && (
                    <button onClick={() => handleDelete(event._id)} className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <button onClick={() => navigate(`/events/${event._id}`)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all" title="View details">
                  <ChevronRight size={13} />
                </button>
              </div>
            </motion.div>
          ))}
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
              className="bg-card border border-border rounded-xl hover:border-primary/30 transition-all duration-200 relative"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${STATUS_STYLES[event.status] || STATUS_STYLES.DRAFT}`}>
                        {event.status?.replace(/_/g, ' ')}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 capitalize">
                        {event.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground truncate">{event.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} />
                        {event.startTime}
                      </span>
                      {event.venue && (
                        <span className="inline-flex items-center gap-1 truncate max-w-[140px] sm:max-w-[200px]">
                          {event.venue}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    {event.status === 'DRAFT' && (
                      <>
                        <button
                          onClick={() => { setEditingEvent(event); setShowForm(true); }}
                          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                          title="Edit"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => {
                            if (canDirectPublish) {
                              if (window.confirm('Publish this event directly?')) handleSubmit(event._id);
                            } else {
                              handleSubmit(event._id);
                            }
                          }}
                          className={`p-2 rounded-lg transition-all ${
                            canDirectPublish
                              ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                              : 'text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                          title={canDirectPublish ? 'Publish directly' : 'Submit for review'}
                        >
                          {canDirectPublish ? <ShieldCheck size={15} /> : <Send size={15} />}
                        </button>
                      </>
                    )}
                    {event.status === 'NEEDS_REVISION' && (
                      <button
                        onClick={() => { setEditingEvent(event); setShowForm(true); }}
                        className="p-2 rounded-lg text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition-all"
                        title="Edit & resubmit"
                      >
                        <Edit3 size={15} />
                      </button>
                    )}
                    {['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'SCHEDULED'].includes(event.status) && (
                      <button
                        onClick={() => handleCancel(event._id)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Cancel"
                      >
                        <Ban size={15} />
                      </button>
                    )}
                    {['DRAFT', 'CANCELLED', 'REJECTED'].includes(event.status) && (
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => {                       navigate(`/events/${event._id}`); }}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                      title="View details"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>

                {event.revisionNotes && event.status === 'NEEDS_REVISION' && (
                  <div className="mt-3 flex items-start gap-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-sm text-orange-300">
                    <MessageSquare size={14} className="mt-0.5 shrink-0" />
                    <span>Revision requested: {event.revisionNotes}</span>
                  </div>
                )}

                {event.rejectionReason && event.status === 'REJECTED' && (
                  <div className="mt-3 flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300">
                    <XCircle size={14} className="mt-0.5 shrink-0" />
                    <span>Rejected: {event.rejectionReason}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {pagination.pages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-1.5 pt-2"
        >
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => fetchEvents(p)}
              className={`min-w-[32px] h-8 rounded-lg text-xs font-medium transition-all ${
                pagination.page === p
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {p}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
