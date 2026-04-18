/**
 * AnnouncementForm.jsx
 * ---------------------
 * Premium Dark-Mode form for creating governance announcements.
 * Includes smart UX: live escalation preview based on role + scope selection.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, AlertTriangle, CheckCircle, XCircle, ChevronDown, Loader2, Megaphone, Building2, Sparkles, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';
import governanceService from '../../services/governanceService';
import copilotService from '../../services/copilotService';

// ============================================================
// CONSTANTS
// ============================================================
const SCOPE_OPTIONS = [
    { value: 'module',     label: 'Module / Course',   description: 'Targets students in your specific course.' },
    { value: 'department', label: 'Department',         description: 'Targets everyone in your department.' },
    { value: 'school',     label: 'School',             description: 'Targets the entire school/faculty.' },
    { value: 'college',    label: 'College-Wide',       description: 'Targets the entire college.' },
];

const PRIORITY_OPTIONS = [
    { value: 'high',   label: 'High',   color: 'text-red-400    border-red-500/30    bg-red-500/10' },
    { value: 'medium', label: 'Medium', color: 'text-amber-400  border-amber-500/30  bg-amber-500/10' },
    { value: 'low',    label: 'Low',    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
];

// ============================================================
// SMART ESCALATION PREVIEW ENGINE
// ============================================================
function computePreview(role, scope) {
    if (!role || !scope) return null;

    const denied = { type: 'denied' };
    const ok     = { type: 'ok',      message: 'This announcement will be published immediately.' };

    if (role === 'lecturer') {
        if (scope === 'module')     return ok;
        if (scope === 'department') return { type: 'warn', message: 'Requires HoD approval before publication.' };
        return denied;
    }
    if (role === 'hod') {
        if (scope === 'module' || scope === 'department') return ok;
        if (scope === 'school')  return { type: 'warn', message: 'Requires Dean approval before publication.' };
        return denied; // college
    }
    if (role === 'dean') {
        if (['module', 'department', 'school'].includes(scope)) return ok;
        return { type: 'warn', message: 'Requires Principal approval before publication.' };
    }
    if (role === 'principal' || role === 'admin') return ok;

    return null;
}

// ============================================================
// COMPONENT
// ============================================================
export default function AnnouncementForm({ onSuccess }) {
    const user = useMemo(() => {
        try { return JSON.parse(localStorage.getItem('user') || '{}'); }
        catch { return {}; }
    }, []);

    const [form, setForm] = useState({ title: '', content: '', priority: 'medium', targetScope: '', targetDepartment: '' });
    const [submitting, setSub] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [loadingDepts, setLoadingDepts] = useState(false);
    
    // AI Polish state
    const [aiPolishing, setAIPolishing] = useState(false);

    useEffect(() => {
        if (form.targetScope === 'department') {
            setLoadingDepts(true);
            governanceService.getDepartments()
                .then((data) => setDepartments(data.departments || data || []))
                .catch(() => setDepartments([]))
                .finally(() => setLoadingDepts(false));
        } else {
            setDepartments([]);
            setForm((f) => ({ ...f, targetDepartment: '' }));
        }
    }, [form.targetScope]);

    const preview = computePreview(user?.role, form.targetScope);

    const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

    // AI Polish - Improve existing content
    const handleAIPolish = async () => {
        if (!form.title.trim() && !form.content.trim()) {
            return toast.error('Write something first, then AI can polish it');
        }
        setAIPolishing(true);
        try {
            const polishPrompt = `You are a professional academic communication expert. Polish and improve the following announcement to make it more engaging, professional, and well-structured. Keep the same meaning but make it clearer and more impactful. 

Title: ${form.title || '(no title)'}
Content: ${form.content || '(no content)'}

Respond in this JSON format only: {"title": "polished title", "content": "polished content that is well-written, engaging, and maintains a professional tone"}`;
            
            const result = await copilotService.ask(polishPrompt);
            let aiResponse = result.answer || result.response || result;
            
            try {
                if (typeof aiResponse === 'string') {
                    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);
                        if (parsed.title) setForm(f => ({ ...f, title: parsed.title }));
                        if (parsed.content) setForm(f => ({ ...f, content: parsed.content }));
                        toast.success('Content polished!');
                    }
                }
            } catch (_parseError) {
                toast.error('AI response format issue, please try again');
            }
        } catch (error) {
            console.error('AI Polish error:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please refresh the page and try again.');
            } else {
                toast.error('Failed to polish content. Please try again.');
            }
        } finally {
            setAIPolishing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.content.trim() || !form.targetScope) {
            return toast.error('Please fill in all required fields.');
        }
        if (form.targetScope === 'department' && !form.targetDepartment) {
            return toast.error('Please select a department.');
        }
        if (preview?.type === 'denied') {
            return toast.error('Your role does not permit this target scope.');
        }
        try {
            setSub(true);
            const submitData = { ...form };
            if (form.targetScope === 'department') {
                submitData.departmentId = form.targetDepartment;
            }
            const result = await governanceService.create(submitData);
            toast.success(result.message || 'Announcement submitted!');
            setForm({ title: '', content: '', priority: 'medium', targetScope: '', targetDepartment: '' });
            onSuccess?.();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to submit announcement.';
            toast.error(msg);
        } finally {
            setSub(false);
        }
    };

    return (
        <div className="bg-card border border-white/5 rounded-[15px] p-6 md:p-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-500/10 rounded-[10px] border border-blue-500/20">
                    <Megaphone className="text-blue-400" size={22} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Broadcast Announcement</h2>
                    <p className="text-sm text-neutral-500 mt-0.5">
                        Create an official academic announcement. Your role ({user?.role || '...'}
                        ) determines routing and approval.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

                {/* AI Polish Section */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/5 to-blue-500/5 border border-white/5 rounded-[10px]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Sparkles size={18} className="text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">AI Polish Assistant</p>
                            <p className="text-xs text-neutral-500">Write your announcement, then let AI polish it to sound more professional</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleAIPolish}
                        disabled={aiPolishing || (!form.title.trim() && !form.content.trim())}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {aiPolishing ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Wand2 size={16} />
                        )}
                        Polish My Writing
                    </button>
                </div>

                {/* TITLE */}
                <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-neutral-500 mb-2">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. Midterm Examination Schedule Update"
                        value={form.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="w-full bg-background border border-white/10 text-white rounded-[10px] px-4 py-3 text-sm outline-none focus:border-blue-500/50 transition-colors placeholder:text-neutral-600"
                    />
                </div>

                {/* CONTENT */}
                <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-neutral-500 mb-2">
                        Content <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        rows={5}
                        placeholder="Write the detailed announcement content here..."
                        value={form.content}
                        onChange={(e) => handleChange('content', e.target.value)}
                        className="w-full bg-background border border-white/10 text-white rounded-[10px] px-4 py-3 text-sm outline-none focus:border-blue-500/50 transition-colors placeholder:text-neutral-600 resize-none"
                    />
                </div>

                {/* PRIORITY + SCOPE ROW */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* PRIORITY */}
                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-neutral-500 mb-2">
                            Priority
                        </label>
                        <div className="flex gap-2">
                            {PRIORITY_OPTIONS.map((p) => (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => handleChange('priority', p.value)}
                                    className={`flex-1 py-2.5 rounded-[10px] text-[11px] font-bold border transition-all ${
                                        form.priority === p.value
                                            ? p.color
                                            : 'bg-background border-white/10 text-neutral-500 hover:border-white/20'
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* TARGET SCOPE */}
                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-neutral-500 mb-2">
                            Target Scope <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                value={form.targetScope}
                                onChange={(e) => handleChange('targetScope', e.target.value)}
                                className="w-full appearance-none bg-background border border-white/10 text-white rounded-[10px] px-4 py-3 text-sm outline-none focus:border-blue-500/50 transition-colors pr-10"
                            >
                                <option value="" disabled className="text-neutral-500">Select target scope...</option>
                                {SCOPE_OPTIONS.map((s) => (
                                    <option key={s.value} value={s.value} className="bg-background">
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* DEPARTMENT SELECTOR - Shows when department scope is selected */}
                <AnimatePresence>
                    {form.targetScope === 'department' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <label className="block text-[11px] font-black uppercase tracking-widest text-neutral-500 mb-2">
                                Select Department <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                {loadingDepts ? (
                                    <div className="flex items-center gap-2 bg-background border border-white/10 rounded-[10px] px-4 py-3 text-neutral-500">
                                        <Loader2 size={16} className="animate-spin" />
                                        <span className="text-sm">Loading departments...</span>
                                    </div>
                                ) : (
                                    <select
                                        value={form.targetDepartment}
                                        onChange={(e) => handleChange('targetDepartment', e.target.value)}
                                        className="w-full appearance-none bg-background border border-white/10 text-white rounded-[10px] px-4 py-3 text-sm outline-none focus:border-blue-500/50 transition-colors pr-10"
                                    >
                                        <option value="" disabled className="text-neutral-500">Choose a department...</option>
                                        {departments.map((dept) => (
                                            <option key={dept._id} value={dept._id} className="bg-background">
                                                {dept.name} {dept.code && `(${dept.code})`}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                <Building2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                            </div>
                            <p className="text-xs text-neutral-500 mt-2">
                                The Head of Department (HoD) will review and approve this announcement.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ESCALATION PREVIEW ALERT */}
                <AnimatePresence>
                    {preview && (
                        <motion.div
                            key={preview.type}
                            initial={{ opacity: 0, y: -8, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -8, height: 0 }}
                            className={`overflow-hidden`}
                        >
                            <div className={`flex items-start gap-3 rounded-[10px] p-4 border ${
                                preview.type === 'ok'
                                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                                    : preview.type === 'warn'
                                    ? 'bg-amber-500/5 border-amber-500/20 text-amber-400'
                                    : 'bg-red-500/5 border-red-500/20 text-red-400'
                            }`}>
                                {preview.type === 'ok'    && <CheckCircle  size={18} className="shrink-0 mt-0.5" />}
                                {preview.type === 'warn'  && <AlertTriangle size={18} className="shrink-0 mt-0.5" />}
                                {preview.type === 'denied'&& <XCircle      size={18} className="shrink-0 mt-0.5" />}
                                <div>
                                    <p className="text-sm font-semibold">
                                        {preview.type === 'ok'     && 'Auto-Publish'}
                                        {preview.type === 'warn'   && 'Approval Required'}
                                        {preview.type === 'denied' && 'Action Denied'}
                                    </p>
                                    <p className="text-xs mt-0.5 opacity-80">
                                        {preview.type === 'denied'
                                            ? 'Your role does not have permission for this target scope. Please escalate through your supervisor.'
                                            : preview.message}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* SUBMIT */}
                <button
                    type="submit"
                    disabled={submitting || preview?.type === 'denied'}
                    className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-white/20 text-white font-bold py-3.5 rounded-[10px] transition-all text-sm shadow-lg shadow-blue-600/20 disabled:shadow-none"
                >
                    {submitting ? (
                        <><Loader2 size={18} className="animate-spin" /> Submitting...</>
                    ) : (
                        <><Send size={18} /> Submit Announcement</>
                    )}
                </button>
            </form>
        </div>
    );
}
