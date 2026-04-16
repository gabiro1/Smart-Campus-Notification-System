/**
 * SupportPage.jsx
 * ----------------
 * Support tickets page for lecturers to view and manage complaints/reports
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, AlertCircle, Clock, CheckCircle2, XCircle, Send, Loader2, Plus, Search, Filter, Eye, Reply } from 'lucide-react';
import supportService from '../../../services/supportService';
import toast from 'react-hot-toast';

const STATUS_STYLE = {
  open: { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: <Clock size={12} /> },
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', icon: <AlertCircle size={12} /> },
  resolved: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: <CheckCircle2 size={12} /> },
  closed: { bg: 'bg-neutral-500/10', text: 'text-neutral-400', icon: <XCircle size={12} /> },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.open;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase ${s.bg} ${s.text}`}>
      {s.icon}
      {status}
    </span>
  );
}

function TicketCard({ ticket, onView, isAdmin }) {
  const priorityColors = {
    low: 'border-l-neutral-500',
    medium: 'border-l-amber-500',
    high: 'border-l-red-500',
    urgent: 'border-l-red-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all cursor-pointer border-l-4 ${priorityColors[ticket.priority] || 'border-l-neutral-500'}`}
      onClick={() => onView(ticket)}
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="text-sm font-semibold text-white line-clamp-1">{ticket.subject}</h3>
        <StatusBadge status={ticket.status} />
      </div>
      <p className="text-xs text-neutral-500 line-clamp-2 mb-3">{ticket.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-neutral-600">
          {ticket.userId?.name || 'Unknown'} • {new Date(ticket.createdAt).toLocaleDateString()}
        </span>
        {ticket.reply && (
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <Reply size={10} /> Replied
          </span>
        )}
      </div>
    </motion.div>
  );
}

function TicketDetail({ ticket, onClose, onReply, isAdmin }) {
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await onReply(ticket._id, replyText);
      toast.success('Reply sent!');
      onClose();
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{ticket.subject}</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white">
            <XCircle size={20} />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 p-4 bg-background/50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <span className="text-sm font-bold text-blue-400">
                {ticket.userId?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{ticket.userId?.name || 'Unknown User'}</p>
              <p className="text-xs text-neutral-500">{ticket.userId?.email}</p>
            </div>
          </div>

          <div className="p-4 bg-background/30 rounded-xl">
            <p className="text-sm text-neutral-300 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {ticket.reply && (
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <p className="text-xs font-bold text-emerald-400 mb-2">Response:</p>
              <p className="text-sm text-neutral-300 whitespace-pre-wrap">{ticket.reply}</p>
            </div>
          )}
        </div>

        {ticket.status !== 'closed' && isAdmin && (
          <div className="border-t border-white/10 pt-4">
            <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase">Reply to ticket</label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your response..."
              rows={3}
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50"
            />
            <button
              onClick={handleSubmitReply}
              disabled={submitting || !replyText.trim()}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Send Reply
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function SupportPage() {
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  }, []);

  const isAdmin = ['admin', 'principal', 'hod', 'dean'].includes(user?.role);
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showNewTicket, setShowNewTicket] = useState(false);

  const [newTicket, setNewTicket] = useState({ category: 'other', subject: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [activeTab]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      let data;
      if (isAdmin) {
        data = await supportService.getAllTickets();
        data = data.data || data.tickets || [];
      } else {
        data = await supportService.getMyTickets();
        data = data.data || data.tickets || [];
      }
      setTickets(data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
      toast.error('Could not load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.subject.trim() || !newTicket.description.trim()) {
      return toast.error('Please fill in subject and description');
    }
    setSubmitting(true);
    try {
      await supportService.submitTicket(newTicket);
      toast.success('Ticket submitted!');
      setShowNewTicket(false);
      setNewTicket({ category: 'other', subject: '', description: '' });
      fetchTickets();
    } catch (error) {
      toast.error('Failed to submit ticket');
      console.error('Ticket error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (ticketId, reply) => {
    await supportService.replyToTicket(ticketId, { reply });
    fetchTickets();
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description?.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && ticket.status === activeTab;
  });

  const tabs = [
    { id: 'all', label: 'All Tickets' },
    { id: 'open', label: 'Open' },
    { id: 'pending', label: 'Pending' },
    { id: 'resolved', label: 'Resolved' },
  ];

  return (
    <div className="min-h-screen bg-background text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Support & Reports</h1>
            <p className="text-neutral-500 text-sm mt-1">
              {isAdmin ? 'Manage student complaints and reports' : 'Submit and track your support tickets'}
            </p>
          </div>
          {!isAdmin && (
            <button
              onClick={() => setShowNewTicket(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Plus size={16} /> New Ticket
            </button>
          )}
        </header>

        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-blue-500/50"
            />
          </div>
        </div>

        <div className="flex bg-card p-1 rounded-xl border border-white/5 w-fit gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
            <p className="text-neutral-500">Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-20 text-center">
            <MessageSquare size={40} className="text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400 font-medium">No tickets found</p>
            <p className="text-sm text-neutral-500 mt-1">
              {isAdmin ? 'No reports to review' : 'Submit a new ticket if you need help'}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            <AnimatePresence>
              {filteredTickets.map((ticket) => (
                <TicketCard
                  key={ticket._id}
                  ticket={ticket}
                  onView={setSelectedTicket}
                  isAdmin={isAdmin}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {selectedTicket && (
          <TicketDetail
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
            onReply={handleReply}
            isAdmin={isAdmin}
          />
        )}

        {showNewTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowNewTicket(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-white/10 rounded-2xl p-6 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-6">New Support Ticket</h2>
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase">Subject</label>
                  <input
                    type="text"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50"
                    placeholder="Brief description of the issue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase">Description</label>
                  <textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    rows={4}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 resize-none"
                    placeholder="Detailed explanation of your issue..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase">Category</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50"
                  >
                    <option value="bug" className="bg-background">Bug Report</option>
                    <option value="feature_request" className="bg-background">Feature Request</option>
                    <option value="login_issue" className="bg-background">Login Issue</option>
                    <option value="notification_problem" className="bg-background">Notification Problem</option>
                    <option value="other" className="bg-background">Other</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewTicket(false)}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-neutral-400 border border-white/10 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
                  >
                    {submitting ? 'Sending...' : 'Submit Ticket'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}