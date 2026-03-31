/**
 * GovernancePage.jsx
 * -------------------
 * Unified Governance Dashboard page.
 * - Lecturers see the AnnouncementForm + their own submissions.
 * - HoD / Dean / Principal see an ApprovalInbox + AnnouncementForm.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenSquare, Inbox, Clock, CheckCircle2, XCircle, LayoutGrid } from 'lucide-react';
import AnnouncementForm from '../../../components/governance/AnnouncementForm';
import ApprovalInbox from '../../../components/governance/ApprovalInbox';
import governanceService from '../../../services/governanceService';
import toast from 'react-hot-toast';

// ============================================================
// STATUS BADGE
// ============================================================
const STATUS_STYLE = {
    published: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: <CheckCircle2 size={11} /> },
    pending:   { bg: 'bg-amber-500/10',   text: 'text-amber-400',   icon: <Clock size={11} /> },
    rejected:  { bg: 'bg-red-500/10',     text: 'text-red-400',     icon: <XCircle size={11} /> },
    draft:     { bg: 'bg-white/5',        text: 'text-neutral-400', icon: <PenSquare size={11} /> },
};

function StatusBadge({ status }) {
    const s = STATUS_STYLE[status] || STATUS_STYLE.draft;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${s.bg} ${s.text}`}>
            {s.icon}
            {status}
        </span>
    );
}

// ============================================================
// MY SUBMISSIONS LIST
// ============================================================
function MySubmissions({ refresh, role }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        governanceService.getMine()
            .then((r) => setItems(r.data || []))
            .catch(() => toast.error('Failed to load your submissions'))
            .finally(() => setLoading(false));
    }, [refresh]);

    if (loading) return (
        <div className="py-8 text-center text-neutral-600 text-sm">Loading submissions...</div>
    );

    if (items.length === 0) return (
        <div className="py-8 text-center text-neutral-600 text-sm">
            You haven't sent any governance announcements yet.
        </div>
    );

    return (
        <div className="space-y-3">
            {items.map((item) => (
                <div key={item._id} className="flex items-start gap-4 p-4 bg-[#111111] border border-white/5 rounded-[10px]">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                        </div>
                        <p className="text-xs text-neutral-500 truncate">{item.content}</p>
                        {item.rejectionReason && (
                            <p className="text-xs text-red-400 mt-1 italic">
                                Rejected: "{item.rejectionReason}"
                            </p>
                        )}
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2">
                        <StatusBadge status={item.status} />
                        <span className="text-[10px] text-neutral-600 capitalize">{item.targetScope}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function GovernancePage() {
    const user = useMemo(() => {
        try { return JSON.parse(localStorage.getItem('user') || '{}'); }
        catch { return {}; }
    }, []);

    const isReviewer = ['hod', 'dean', 'principal', 'admin'].includes(user?.role);
    const [activeTab, setActiveTab] = useState(isReviewer ? 'inbox' : 'create');
    const [refreshKey, setRefreshKey] = useState(0);

    const tabs = [
        ...(isReviewer ? [{ id: 'inbox',  label: 'Approval Inbox', icon: <Inbox size={16} /> }] : []),
        { id: 'create', label: 'New Announcement',    icon: <PenSquare size={16} /> },
        { id: 'mine',   label: 'My Submissions',       icon: <LayoutGrid size={16} /> },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold">Announcement Governance</h1>
                    <p className="text-neutral-500 mt-1 text-sm">
                        Create and manage official academic announcements. Role: <span className="text-blue-400 font-semibold capitalize">{user?.role}</span>
                    </p>
                </div>

                {/* Tab Bar */}
                <div className="flex bg-[#0D0D0D] p-1.5 rounded-[10px] border border-white/5 w-fit gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-[8px] text-[12px] font-bold transition-all ${
                                activeTab === tab.id
                                    ? 'bg-white/10 text-white'
                                    : 'text-neutral-500 hover:text-white'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'inbox'  && <ApprovalInbox />}
                        {activeTab === 'create' && (
                            <AnnouncementForm onSuccess={() => { setRefreshKey((k) => k + 1); setActiveTab('mine'); }} />
                        )}
                        {activeTab === 'mine' && (
                            <div className="bg-[#0D0D0D] border border-white/5 rounded-[15px] p-6 md:p-8">
                                <h2 className="text-xl font-bold mb-6">My Submissions</h2>
                                <MySubmissions refresh={refreshKey} role={user?.role} />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
