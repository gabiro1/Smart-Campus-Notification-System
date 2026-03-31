/**
 * ApprovalInbox.jsx
 * ------------------
 * Premium Dark-Mode Approval Inbox for HoD, Dean, and Principal.
 * Lists all pending announcements with Approve/Reject functionality.
 * Uses framer-motion for smooth layout shifts and reveal animations.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
    CheckCircle, XCircle, Clock, User, ArrowRight, Loader2,
    Inbox, AlertTriangle, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import governanceService from '../../services/governanceService';

// ============================================================
// HELPERS
// ============================================================
const PRIORITY_STYLE = {
    high:   { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/20' },
    medium: { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/20' },
    low:    { bg: 'bg-emerald-500/10',text: 'text-emerald-400',border: 'border-emerald-500/20' },
};

const SCOPE_LABEL = {
    module:     'Module / Course',
    department: 'Department',
    school:     'School',
    college:    'College-Wide',
};

function timeAgo(date) {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60)    return `${diff}s ago`;
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

// ============================================================
// SINGLE PENDING CARD
// ============================================================
function PendingCard({ item, onDecision }) {
    const [expanded,        setExpanded]        = useState(false);
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [reason,          setReason]          = useState('');
    const [loading,         setLoading]         = useState(false);

    const pStyle = PRIORITY_STYLE[item.priority] || PRIORITY_STYLE.medium;

    const handleAction = async (action) => {
        if (action === 'reject' && !showRejectInput) {
            setShowRejectInput(true);
            return;
        }
        if (action === 'reject' && !reason.trim()) {
            toast.error('Please provide a rejection reason.');
            return;
        }

        try {
            setLoading(true);
            const result = await governanceService.review(item._id, action, reason);
            toast.success(result.message);
            onDecision(item._id);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="bg-[#141414] border border-white/5 rounded-[15px] overflow-hidden"
        >
            {/* Card Header */}
            <div className="p-5">
                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${pStyle.bg} ${pStyle.text} ${pStyle.border} border`}>
                        {item.priority} priority
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {SCOPE_LABEL[item.targetScope] || item.targetScope}
                    </span>
                    <span className="ml-auto text-[11px] text-neutral-500 font-medium">
                        {timeAgo(item.createdAt)}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white mb-2 leading-snug">{item.title}</h3>

                {/* Author */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                        {item.authorId?.profilePicture
                            ? <img src={item.authorId.profilePicture} className="w-full h-full object-cover" alt="" />
                            : <User size={13} className="text-neutral-500" />
                        }
                    </div>
                    <span className="text-[13px] text-neutral-300">
                        <span className="font-semibold">{item.authorName || item.authorId?.name || 'Unknown'}</span>
                        <span className="text-neutral-500"> · {item.authorRole}</span>
                    </span>
                </div>

                {/* Content Preview / Expand */}
                <div className="mb-5">
                    <p className={`text-sm text-neutral-400 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
                        {item.content}
                    </p>
                    {item.content.length > 180 && (
                        <button
                            onClick={() => setExpanded((e) => !e)}
                            className="mt-2 flex items-center gap-1 text-[11px] font-bold text-neutral-500 hover:text-white uppercase tracking-widest"
                        >
                            {expanded ? 'Show less' : 'Read more'}
                            <ChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
                        </button>
                    )}
                </div>

                {/* Action Buttons */}
                {!loading ? (
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleAction('approve')}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 rounded-[10px] font-bold text-sm transition-all"
                        >
                            <CheckCircle size={16} /> Approve
                        </button>
                        <button
                            onClick={() => handleAction('reject')}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-transparent hover:bg-red-500/10 text-red-400 border border-red-500/30 hover:border-red-500/50 rounded-[10px] font-bold text-sm transition-all"
                        >
                            <XCircle size={16} /> Reject
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2 py-3 text-neutral-400">
                        <Loader2 size={18} className="animate-spin" /> Processing...
                    </div>
                )}
            </div>

            {/* Rejection Reason Input (Revealed on Reject click) */}
            <AnimatePresence>
                {showRejectInput && !loading && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-3">
                            <p className="text-[11px] font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
                                <AlertTriangle size={13} /> Rejection Reason Required
                            </p>
                            <textarea
                                rows={3}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Explain why this announcement is being rejected..."
                                className="w-full bg-[#111111] border border-red-500/20 focus:border-red-500/50 text-white rounded-[10px] px-4 py-3 text-sm outline-none transition-colors placeholder:text-neutral-600 resize-none"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleAction('reject')}
                                    className="flex-1 py-2.5 bg-red-600/80 hover:bg-red-600 text-white rounded-[10px] font-bold text-sm transition-all"
                                >
                                    Confirm Reject
                                </button>
                                <button
                                    onClick={() => { setShowRejectInput(false); setReason(''); }}
                                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-[10px] font-bold text-sm transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ============================================================
// MAIN INBOX COMPONENT
// ============================================================
export default function ApprovalInbox() {
    const [items,   setItems]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    const fetchPending = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await governanceService.getPending();
            setItems(result.data || []);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to load inbox.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPending(); }, [fetchPending]);

    // Remove card from local state after decision
    const handleDecision = (id) => {
        setItems((prev) => prev.filter((item) => item._id !== id));
    };

    return (
        <div className="bg-[#0D0D0D] border border-white/5 rounded-[15px] p-6 md:p-8">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-[10px] border border-amber-500/20">
                        <Inbox className="text-amber-400" size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Approval Inbox</h2>
                        <p className="text-sm text-neutral-500 mt-0.5">
                            {items.length} announcement{items.length !== 1 ? 's' : ''} waiting for your review
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchPending}
                    disabled={loading}
                    className="text-[11px] font-black uppercase tracking-widest text-neutral-500 hover:text-white flex items-center gap-1 transition-colors"
                >
                    {loading ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
                    Refresh
                </button>
            </div>

            {/* States */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-16 text-neutral-500 gap-3">
                    <Loader2 size={32} className="animate-spin" />
                    <p className="text-sm font-medium">Fetching pending announcements...</p>
                </div>
            )}

            {error && !loading && (
                <div className="flex flex-col items-center justify-center py-16 text-red-400 gap-3">
                    <XCircle size={32} className="opacity-50" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {!loading && !error && items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-neutral-600 gap-3">
                    <CheckCircle size={40} className="opacity-30" />
                    <h3 className="text-lg font-bold text-white">All clear!</h3>
                    <p className="text-sm text-center max-w-xs">
                        There are no announcements waiting for your approval right now.
                    </p>
                </div>
            )}

            {/* Cards Grid */}
            {!loading && !error && items.length > 0 && (
                <LayoutGroup>
                    <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <AnimatePresence>
                            {items.map((item) => (
                                <PendingCard
                                    key={item._id}
                                    item={item}
                                    onDecision={handleDecision}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </LayoutGroup>
            )}

            {/* Stats Footer */}
            {!loading && items.length > 0 && (
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-neutral-600">
                    <span className="flex items-center gap-2">
                        <Clock size={13} /> {items.length} pending
                    </span>
                    <span className="flex items-center gap-2">
                        Approve or reject to route <ArrowRight size={13} />
                    </span>
                </div>
            )}
        </div>
    );
}
