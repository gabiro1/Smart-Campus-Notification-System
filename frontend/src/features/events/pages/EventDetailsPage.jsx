import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, MapPin, Users, Star, FileText,
  CheckCircle, XCircle, AlertTriangle, Send, Ban,
  ArrowLeft, ExternalLink, Download, MessageSquare,
  Shield, User, Building2, Eye, Loader2, ChevronDown,
  ChevronUp, Info, Globe, Hash, DollarSign, Target
} from 'lucide-react';
import eventService from '../../../services/eventService';
import { useAuth } from '../../../context/AuthContext';
import { Tag } from 'lucide-react';

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

const STATUS_ICONS = {
  DRAFT: FileText, PENDING_REVIEW: Clock, UNDER_REVIEW: Eye,
  NEEDS_REVISION: AlertTriangle, APPROVED: CheckCircle, REJECTED: XCircle,
  SCHEDULED: Calendar, PUBLISHED: Send, CANCELLED: Ban, EXPIRED: Clock
};

export default function EventDetailsPage() {
  const { eventId: id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTimeline, setShowTimeline] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await eventService.getEventDetails(id);
        setEvent(res.event || res);
      } catch (err) {
        console.error('Failed to fetch event:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleAction = async (action) => {
    setActionLoading(true);
    try {
      let res;
      switch (action) {
        case 'approve': res = await eventService.approveEvent(id, comment); break;
        case 'reject': res = await eventService.rejectEvent(id, comment); break;
        case 'revision': res = await eventService.requestRevision(id, comment); break;
        case 'publish': res = await eventService.publishApprovedEvent(id, comment); break;
        case 'schedule': res = await eventService.scheduleEvent(id, event?.startDate || comment); break;
        case 'submit': res = await eventService.submitForReview(id); break;
        case 'cancel': res = await eventService.cancelEvent(id, comment); break;
      }
      if (res?.event) setEvent(prev => ({ ...prev, ...res.event }));
      setShowCommentInput(null);
      setComment('');
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const canReview = ['guild_president', 'principal', 'admin'].includes(user?.role);
  const isOwner = event?.createdBy?._id === user?.id || event?.createdBy === user?.id;
  const canOverride = ['principal', 'admin'].includes(user?.role);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="h-6 w-20 bg-muted rounded animate-pulse mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card border border-border rounded-xl h-96 animate-pulse" />
              <div className="bg-card border border-border rounded-xl h-48 animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl h-48 animate-pulse" />
              <div className="bg-card border border-border rounded-xl h-64 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Info size={28} className="text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium">Event not found</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const StatusIcon = STATUS_ICONS[event.status] || FileText;

  const QuickActionButton = ({ onClick, icon: Icon, label, color = 'primary', disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled || actionLoading}
      className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 shadow-sm ${
        color === 'emerald' ? 'bg-emerald-600 text-white hover:bg-emerald-500' :
        color === 'red' ? 'bg-red-600 text-white hover:bg-red-500' :
        color === 'orange' ? 'bg-orange-600 text-white hover:bg-orange-500' :
        color === 'purple' ? 'bg-purple-600 text-white hover:bg-purple-500' :
        'bg-primary text-primary-foreground hover:opacity-90'
      }`}
    >
      {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              {event.posterUrl && (
                <div className="h-48 sm:h-56 md:h-64 overflow-hidden">
                  <img src={event.posterUrl} alt={event.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 ${STATUS_STYLES[event.status]}`}>
                    <StatusIcon size={12} />
                    {event.status?.replace(/_/g, ' ')}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 capitalize inline-flex items-center gap-1">
                    <Tag size={12} />{event.category}
                  </span>
                </div>

                <h1 className="text-xl md:text-2xl font-bold text-foreground mb-3">{event.title}</h1>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{event.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 p-4 bg-muted/30 border border-border rounded-xl">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar size={14} className="text-blue-400" />
                      <span>{new Date(event.startDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}{event.endDate && ` – ${new Date(event.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock size={14} className="text-blue-400" />
                      <span>{event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin size={14} className="text-blue-400" />
                      <span>{event.venue}</span>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User size={14} className="text-blue-400" />
                      <span>{event.organizerName || event.createdBy?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 size={14} className="text-blue-400" />
                      <span>{event.organizerRole || event.createdBy?.role || 'N/A'}</span>
                    </div>
                    {event.expectedAttendance > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users size={14} className="text-blue-400" />
                        <span>{event.expectedAttendance} expected</span>
                      </div>
                    )}
                  </div>
                </div>

                {(event.externalRegistrationLink || event.livestreamLink) && (
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    {event.externalRegistrationLink && (
                      <a href={event.externalRegistrationLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-sm">
                        <ExternalLink size={14} />
                        Register Externally
                      </a>
                    )}
                    {event.livestreamLink && (
                      <a href={event.livestreamLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-500 transition-all shadow-sm">
                        <ExternalLink size={14} />
                        Join Livestream
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-xl overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              <button
                onClick={() => setShowTimeline(!showTimeline)}
                className="w-full px-4 sm:px-6 py-4 flex items-center justify-between border-b border-border"
              >
                <h3 className="font-semibold text-foreground text-sm inline-flex items-center gap-2">
                  <Clock size={14} />
                  Approval Timeline
                </h3>
                {showTimeline ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
              </button>
              {showTimeline && (
                <div className="p-6">
                  {event.auditTrail?.timeline?.length > 0 ? (
                    <div className="relative space-y-4">
                      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
                      {event.auditTrail.timeline.map((entry, i) => (
                        <div key={i} className="relative pl-8">
                          <div className={`absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 flex items-center justify-center bg-card ${
                            entry.type === 'STATUS_CHANGE' && entry.toStatus === 'REJECTED' ? 'border-red-500' :
                            entry.toStatus === 'PUBLISHED' ? 'border-emerald-500' :
                            entry.toStatus === 'APPROVED' ? 'border-emerald-500' :
                            'border-primary'
                          }`}>
                            <div className={`w-[5px] h-[5px] rounded-full ${
                              entry.type === 'STATUS_CHANGE' && entry.toStatus === 'REJECTED' ? 'bg-red-500' :
                              entry.toStatus === 'PUBLISHED' ? 'bg-emerald-500' :
                              entry.toStatus === 'APPROVED' ? 'bg-emerald-500' :
                              'bg-primary'
                            }`} />
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-foreground">
                              {entry.type === 'STATUS_CHANGE'
                                ? `${(entry.fromStatus || 'Created').replace(/_/g, ' ')} → ${entry.toStatus.replace(/_/g, ' ')}`
                                : entry.action}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {entry.user?.name || 'System'} ({entry.role || entry.user?.role || 'system'})
                              <span className="mx-1">•</span>
                              {new Date(entry.date).toLocaleString()}
                            </p>
                            {(entry.reason || entry.comment) && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                &ldquo;{entry.reason || entry.comment}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No timeline data available</p>
                  )}
                </div>
              )}
            </motion.div>

            {event.notesToReviewers && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl"
              >
                <div className="flex items-start gap-2">
                  <MessageSquare size={15} className="text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-300">Notes to Reviewers</p>
                    <p className="text-sm text-blue-400/80 mt-1">{event.notesToReviewers}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {event.status === 'REJECTED' && event.rejectionReason && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
              >
                <div className="flex items-start gap-2">
                  <XCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-300">Rejection Reason</p>
                    <p className="text-sm text-red-400/80 mt-1">{event.rejectionReason}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {event.status === 'NEEDS_REVISION' && event.revisionNotes && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle size={15} className="text-orange-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-orange-300">Revision Required</p>
                    <p className="text-sm text-orange-400/80 mt-1">{event.revisionNotes}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="space-y-4">
            {canReview && ['PENDING_REVIEW', 'UNDER_REVIEW'].includes(event.status) && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card border border-border rounded-xl p-4 space-y-2 relative"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 inline-flex items-center gap-2">
                  <Shield size={12} />
                  Review Actions
                </h4>
                {showCommentInput === 'approve' ? (
                  <div className="space-y-2">
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Approval note (optional)..."
                      rows={2}
                      className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                    />
                    <div className="flex gap-2">
                      <QuickActionButton onClick={() => handleAction('approve')} icon={CheckCircle} label="Confirm" color="emerald" />
                      <button onClick={() => { setShowCommentInput(null); setComment(''); }} className="px-3 py-2 text-xs text-muted-foreground">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <QuickActionButton onClick={() => setShowCommentInput('approve')} icon={CheckCircle} label="Approve" color="emerald" />
                )}

                {showCommentInput === 'revision' ? (
                  <div className="space-y-2">
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="What needs to change? *"
                      rows={2}
                      className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                    />
                    <div className="flex gap-2">
                      <QuickActionButton onClick={() => handleAction('revision')} icon={AlertTriangle} label="Request Revision" color="orange" />
                      <button onClick={() => { setShowCommentInput(null); setComment(''); }} className="px-3 py-2 text-xs text-muted-foreground">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <QuickActionButton onClick={() => setShowCommentInput('revision')} icon={AlertTriangle} label="Request Revision" color="orange" />
                )}

                {showCommentInput === 'reject' ? (
                  <div className="space-y-2">
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Reason for rejection *"
                      rows={2}
                      className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                    />
                    <div className="flex gap-2">
                      <QuickActionButton onClick={() => handleAction('reject')} icon={XCircle} label="Confirm Reject" color="red" />
                      <button onClick={() => { setShowCommentInput(null); setComment(''); }} className="px-3 py-2 text-xs text-muted-foreground">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <QuickActionButton onClick={() => setShowCommentInput('reject')} icon={XCircle} label="Reject" color="red" />
                )}
              </motion.div>
            )}

            {canReview && event.status === 'APPROVED' && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card border border-border rounded-xl p-4 space-y-2 relative"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 inline-flex items-center gap-2">
                  <Send size={12} />
                  Publication
                </h4>
                <QuickActionButton onClick={() => handleAction('publish')} icon={Send} label="Publish Now" color="emerald" />
                <QuickActionButton onClick={() => handleAction('schedule')} icon={Calendar} label="Schedule" color="purple" />
              </motion.div>
            )}

            {isOwner && event.status === 'DRAFT' && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card border border-border rounded-xl p-4 space-y-2 relative"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Creator Actions</h4>
                <QuickActionButton onClick={() => handleAction('submit')} icon={Send} label="Submit for Review" />
                <QuickActionButton onClick={() => handleAction('cancel')} icon={Ban} label="Cancel Event" color="red" />
              </motion.div>
            )}

            {canOverride && !['DRAFT', 'CANCELLED', 'EXPIRED'].includes(event.status) && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card border border-amber-500/20 rounded-xl p-4 space-y-2 relative"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider inline-flex items-center gap-2">
                  <Shield size={12} />
                  Override
                </h4>
                <select
                  onChange={async e => {
                    const val = e.target.value;
                    if (!val) return;
                    if (!confirm(`Override status to ${val.replace(/_/g, ' ')}?`)) return;
                    setActionLoading(true);
                    try {
                      const reason = window.prompt('Reason for override:') || '';
                      const res = await eventService.overrideDecision(id, val, reason);
                      if (res?.event) setEvent(prev => ({ ...prev, ...res.event }));
                    } catch (err) {
                      console.error('Override failed:', err);
                    } finally {
                      setActionLoading(false);
                    }
                    e.target.value = '';
                  }}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 appearance-none cursor-pointer"
                >
                  <option value="">Change status...</option>
                  <option value="PUBLISHED">Force Publish</option>
                  <option value="APPROVED">Force Approve</option>
                  <option value="REJECTED">Force Reject</option>
                  <option value="CANCELLED">Force Cancel</option>
                </select>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-xl p-4 space-y-3 relative"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Event Info</h4>
              <div className="space-y-2.5 text-sm divide-y divide-border">
                {[
                  { label: 'Created by', value: event.createdBy?.name || 'Unknown' },
                  { label: 'Department', value: event.departmentClub || event.createdBy?.department || 'N/A' },
                  { label: 'Visibility', value: (event.visibilitySettings || 'public').replace(/_/g, ' '), icon: Eye },
                  { label: 'Audience', value: (event.targetAudience || []).join(', ').replace(/_/g, ' '), icon: Target },
                  { label: 'QR Check-in', value: event.qrCheckIn ? 'Enabled' : 'Disabled' },
                  ...(event.budgetRequest > 0 ? [{ label: 'Budget', value: `RWF ${event.budgetRequest.toLocaleString()}`, icon: DollarSign }] : []),
                  { label: 'Created', value: new Date(event.createdAt).toLocaleDateString() },
                  { label: 'Updated', value: new Date(event.updatedAt).toLocaleDateString() },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between pt-2.5 first:pt-0">
                    <span className="text-muted-foreground text-xs">{item.label}</span>
                    <span className="text-foreground text-xs font-medium text-right max-w-[60%] truncate capitalize">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {event.attachments?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-card border border-border rounded-xl p-4 space-y-2 relative"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider inline-flex items-center gap-2">
                  <FileText size={12} />
                  Attachments ({event.attachments.length})
                </h4>
                {event.attachments.map(att => (
                  <a
                    key={att._id}
                    href={att.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-muted/50 border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
                  >
                    <FileText size={13} />
                    <span className="truncate flex-1">{att.originalName}</span>
                    <Download size={12} className="shrink-0" />
                  </a>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
