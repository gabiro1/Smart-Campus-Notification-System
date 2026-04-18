/**
 * GovernancePage.jsx
 * -------------------
 * Unified Governance Dashboard page.
 * - Lecturers see the AnnouncementForm + their own submissions.
 * - HoD / Dean / Principal see an ApprovalInbox + AnnouncementForm.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenSquare, Inbox, Clock, CheckCircle2, XCircle, LayoutGrid, Trash2, Edit2, Loader2 } from 'lucide-react';
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
// MY SUBMISSIONS LIST WITH CRUD
// ============================================================
function MySubmissions({ refresh, role }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        governanceService.getMine()
            .then((r) => setItems(r.data || []))
            .catch(() => toast.error('Failed to load your submissions'))
            .finally(() => setLoading(false));
    }, [refresh]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        setDeletingId(id);
        try {
            await governanceService.delete(id);
            toast.success('Announcement deleted');
            setItems((prev) => prev.filter((item) => item._id !== id));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete');
        } finally {
            setDeletingId(null);
        }
    };

    const handleUpdate = async (data) => {
        try {
            await governanceService.update(editingItem._id, data);
            toast.success('Announcement updated');
            setItems((prev) => prev.map((item) => item._id === editingItem._id ? { ...item, ...data } : item));
            setEditingItem(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update');
        }
    };

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
            <AnimatePresence>
                {items.map((item) => (
                    <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-start gap-4 p-4 bg-background border border-white/5 rounded-[10px]"
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                            </div>
                            <p className="text-xs text-neutral-500 truncate">{item.content}</p>
                            {item.departmentId?.name && (
                                <p className="text-[10px] text-blue-400 mt-1">
                                    Department: {item.departmentId.name}
                                </p>
                            )}
                            {item.rejectionReason && (
                                <p className="text-xs text-red-400 mt-1 italic">
                                    Rejected: "{item.rejectionReason}"
                                </p>
                            )}
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-2">
                            <StatusBadge status={item.status} />
                            <span className="text-[10px] text-neutral-600 capitalize">{item.targetScope}</span>
                            
                            {/* CRUD Actions - only for non-published */}
                            {item.status !== 'published' && (
                                <div className="flex items-center gap-1 mt-2">
                                    <button
                                        onClick={() => setEditingItem(item)}
                                        className="p-1.5 rounded-md text-neutral-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        disabled={deletingId === item._id}
                                        className="p-1.5 rounded-md text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                        title="Delete"
                                    >
                                        {deletingId === item._id ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <Trash2 size={14} />
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setEditingItem(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-card border border-white/10 rounded-[15px] p-4 md:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-bold text-white mb-4">Edit Announcement</h3>
                            <EditForm 
                                item={editingItem} 
                                onSave={handleUpdate} 
                                onCancel={() => setEditingItem(null)} 
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================================================
// EDIT FORM COMPONENT
// ============================================================
function EditForm({ item, onSave, onCancel }) {
    const [form, setForm] = useState({
        title: item.title || '',
        content: item.content || '',
        priority: item.priority || 'medium',
        targetScope: item.targetScope || '',
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave(form);
        setSaving(false);
    };

    const SCOPE_OPTIONS = [
        { value: 'module', label: 'Module / Course' },
        { value: 'department', label: 'Department' },
        { value: 'school', label: 'School' },
        { value: 'college', label: 'College-Wide' },
    ];

    const PRIORITY_OPTIONS = [
        { value: 'high', label: 'High', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
        { value: 'medium', label: 'Medium', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
        { value: 'low', label: 'Low', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-neutral-500 mb-2">Title</label>
                <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-background border border-white/10 text-white rounded-[10px] px-4 py-3 text-sm outline-none focus:border-blue-500/50"
                />
            </div>
            <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-neutral-500 mb-2">Content</label>
                <textarea
                    rows={4}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="w-full bg-background border border-white/10 text-white rounded-[10px] px-4 py-3 text-sm outline-none focus:border-blue-500/50 resize-none"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-neutral-500 mb-2">Priority</label>
                    <div className="flex gap-2">
                        {PRIORITY_OPTIONS.map((p) => (
                            <button
                                key={p.value}
                                type="button"
                                onClick={() => setForm({ ...form, priority: p.value })}
                                className={`flex-1 py-2 rounded-[10px] text-[11px] font-bold border transition-all ${
                                    form.priority === p.value
                                        ? p.color
                                        : 'bg-background border-white/10 text-neutral-500'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-neutral-500 mb-2">Scope</label>
                    <select
                        value={form.targetScope}
                        onChange={(e) => setForm({ ...form, targetScope: e.target.value })}
                        className="w-full bg-background border border-white/10 text-white rounded-[10px] px-4 py-3 text-sm outline-none focus:border-blue-500/50"
                    >
                        <option value="" disabled>Select...</option>
                        {SCOPE_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value} className="bg-background">{s.label}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-3 rounded-[10px] text-sm font-bold text-neutral-400 border border-white/10 hover:bg-white/5"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 rounded-[10px] text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
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
        <div className="min-h-screen bg-background text-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Page Header */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Announcement Governance</h1>
                    <p className="text-neutral-500 mt-1 text-sm">
                        Create and manage official academic announcements. Role: <span className="text-blue-400 font-semibold capitalize">{user?.role}</span>
                    </p>
                </div>

                {/* Tab Bar */}
                <div className="flex bg-card p-1.5 rounded-[10px] border border-white/5 gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [&::-moz-scrollbar]:hidden [&::-ms-scrollbar]:hidden">
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
                            <div className="bg-card border border-white/5 rounded-[15px] p-6 md:p-8">
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
