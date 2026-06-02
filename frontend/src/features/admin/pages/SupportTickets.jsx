import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Loader2, Search, CheckCircle, Clock, AlertCircle, X, Mail, User } from "lucide-react";
import supportService from "../../../services/supportService";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  open: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", dot: "bg-blue-500" },
  in_review: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", dot: "bg-yellow-500" },
  resolved: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", dot: "bg-green-500" },
  closed: { bg: "bg-neutral-500/10", border: "border-neutral-500/30", text: "text-neutral-400", dot: "bg-neutral-500" }
};

const CATEGORY_LABELS = {
  bug: "Bug",
  feature_request: "Feature Request",
  login_issue: "Login Issue",
  notification_problem: "Notification Problem",
  other: "Other"
};

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ open: 0, in_review: 0, resolved: 0, closed: 0, total: 0 });
  const [filters, setFilters] = useState({ status: "all", category: "all" });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  useEffect(() => {
    loadTickets();
  }, [filters]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await supportService.getAllTickets({
        status: filters.status !== "all" ? filters.status : undefined,
        category: filters.category !== "all" ? filters.category : undefined
      });
      if (response.success) {
        setTickets(response.tickets || []);
        setCounts(response.counts || {});
      }
    } catch {
      console.error("Failed to load tickets:");
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (status) => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply");
      return;
    }
    setSending(true);
    try {
      const response = await supportService.replyToTicket(selectedTicket._id, {
        adminReply: replyText,
        status
      });
      if (response.success) {
        toast.success(`Ticket ${status === 'resolved' ? 'resolved' : 'updated'}!`);
        setReplyText("");
        setSelectedTicket(null);
        loadTickets();
      }
    } catch {
      toast.error("Failed to reply");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (ticketId) => {
    if (!confirm("Delete this ticket?")) return;
    try {
      await supportService.deleteTicket(ticketId);
      toast.success("Ticket deleted");
      setSelectedTicket(null);
      loadTickets();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (!ticket) return false;
    if (!searchQ) return true;
    const q = searchQ.toLowerCase();
    return (
      ticket.subject?.toLowerCase().includes(q) ||
      ticket.description?.toLowerCase().includes(q) ||
      ticket.userId?.name?.toLowerCase().includes(q) ||
      ticket.ticketNumber?.toString().includes(q)
    );
  });

  return (
    <div className="p-4 lg:p-6 w-full text-foreground">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
            <HelpCircle className="text-cyan-500" size={20} />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold">Support Tickets</h1>
            <p className="text-sm text-muted-foreground">Manage student reports and issues</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { key: "open", label: "Open", icon: AlertCircle },
          { key: "in_review", label: "In Review", icon: Clock },
          { key: "resolved", label: "Resolved", icon: CheckCircle },
          { key: "total", label: "Total", icon: HelpCircle }
        ].map((stat) => (
          <div key={stat.key} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon size={14} className="text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className="text-xl font-semibold text-foreground">{counts[stat.key] || 0}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            className="w-full bg-card border border-border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_review">In Review</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={filters.category}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          className="bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none"
        >
          <option value="all">All Categories</option>
          <option value="bug">Bug</option>
          <option value="feature_request">Feature Request</option>
          <option value="login_issue">Login Issue</option>
          <option value="notification_problem">Notification Problem</option>
          <option value="other">Other</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-cyan-500" size={40} />
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-20 border border-border rounded-2xl bg-card">
          <HelpCircle size={40} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No tickets found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => {
            if (!ticket) return null;
            const colors = STATUS_COLORS[ticket.status] || STATUS_COLORS.open;
            return (
              <motion.div
                key={ticket._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${colors.bg} border ${colors.border} rounded-2xl p-5 cursor-pointer hover:border-white/30 transition-colors`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-muted-foreground">#{ticket.ticketNumber}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${colors.bg} ${colors.text}`}>
                        {ticket.status?.replace('_', ' ') || 'open'}
                      </span>
                      <span className="px-2 py-0.5 bg-accent rounded text-[10px] text-muted-foreground">
                        {CATEGORY_LABELS[ticket.category] || ticket.category || 'Other'}
                      </span>
                    </div>
                    <h3 className="font-bold text-foreground mb-1">{ticket.subject || 'No subject'}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description || 'No description'}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {ticket.userId?.name || "Unknown"}
                      </span>
                      <span>{ticket.userId?.role}</span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {ticket.adminReply && (
                    <div className="ml-4 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                      <p className="text-xs text-green-400 font-medium">Replied</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedTicket(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground">#{selectedTicket.ticketNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${STATUS_COLORS[selectedTicket.status]?.bg} ${STATUS_COLORS[selectedTicket.status]?.text}`}>
                    {selectedTicket.status.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-0.5 bg-accent rounded text-[10px] text-muted-foreground">
                    {CATEGORY_LABELS[selectedTicket.category]}
                  </span>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <h2 className="text-xl font-bold text-foreground mb-2">{selectedTicket.subject}</h2>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Mail size={12} />
                  {selectedTicket.userId?.email}
                </span>
                <span className="flex items-center gap-1">
                  <User size={12} />
                  {selectedTicket.userId?.name} ({selectedTicket.userId?.role})
                </span>
                <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
              </div>

              <div className="bg-accent rounded-xl p-4 mb-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {selectedTicket.adminReply && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-4">
                  <p className="text-xs font-bold text-green-400 mb-2">Admin Reply:</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedTicket.adminReply}</p>
                </div>
              )}

              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground mb-2">Reply to this ticket:</p>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-cyan-500/50 min-h-[100px] resize-none mb-3"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReply("in_review")}
                    disabled={sending}
                    className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-500 text-foreground rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
                  >
                    Mark In Review
                  </button>
                  <button
                    onClick={() => handleReply("resolved")}
                    disabled={sending}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-foreground rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    Resolve
                  </button>
                  <button
                    onClick={() => handleDelete(selectedTicket._id)}
                    className="py-2 px-4 bg-red-600/50 hover:bg-red-600 text-foreground rounded-xl font-bold text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
