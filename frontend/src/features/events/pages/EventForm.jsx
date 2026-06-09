import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, MapPin, Type, AlignLeft, Users, Phone,
  Link, Image, Upload, FileText, DollarSign, Target, Eye,
  MessageSquare, X, Loader2, ChevronRight, ChevronLeft,
  Check, Building2, Hash, Globe, ShieldCheck
} from 'lucide-react';

const CATEGORIES = [
  { value: 'academic', label: 'Academic' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'sports', label: 'Sports' },
  { value: 'social', label: 'Social' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'ceremony', label: 'Ceremony' },
  { value: 'competition', label: 'Competition' },
  { value: 'fundraiser', label: 'Fundraiser' },
  { value: 'orientation', label: 'Orientation' },
  { value: 'other', label: 'Other' }
];

const AUDIENCE_OPTIONS = [
  { value: 'whole_university', label: 'Whole University' },
  { value: 'specific_college', label: 'Specific College' },
  { value: 'department', label: 'Department' },
  { value: 'academic_year', label: 'Academic Year' },
  { value: 'clubs', label: 'Clubs' },
  { value: 'staff_only', label: 'Staff Only' },
  { value: 'invite_only', label: 'Invite Only' }
];

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public (visible to all)' },
  { value: 'restricted', label: 'Restricted (targeted audience only)' },
  { value: 'invite_only', label: 'Invite Only (private)' }
];

export default function EventForm({ initialData = null, onSubmit, onCancel, isDirectPublish = false }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'other',
    organizerName: '',
    organizerRole: '',
    departmentClub: '',
    venue: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    targetAudience: ['whole_university'],
    targetColleges: [],
    targetDepartments: [],
    targetAcademicYears: [],
    targetClubs: [],
    expectedAttendance: '',
    contactInfo: '',
    externalRegistrationLink: '',
    livestreamLink: '',
    budgetRequest: '',
    attendanceTracking: false,
    qrCheckIn: false,
    visibilitySettings: 'public',
    notesToReviewers: '',
    ...initialData
  });

  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(initialData?.posterUrl || null);
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const fileInputRef = useRef(null);
  const attachmentInputRef = useRef(null);

  const validate = () => {
    const errs = {};
    if (!form.title?.trim()) errs.title = 'Title is required';
    if (!form.description?.trim()) errs.description = 'Description is required';
    if (!form.organizerName?.trim()) errs.organizerName = 'Organizer name is required';
    if (!form.organizerRole?.trim()) errs.organizerRole = 'Organizer role is required';
    if (!form.venue?.trim()) errs.venue = 'Venue is required';
    if (!form.startDate) errs.startDate = 'Start date is required';
    if (!form.startTime) errs.startTime = 'Start time is required';
    if (form.targetAudience?.length === 0) errs.targetAudience = 'Select at least one audience';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handlePoster = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  const handleAttachment = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      let posterUrl = form.posterUrl;
      if (posterFile) {
        const { default: eventService } = await import('../../../services/eventService');
        const uploadRes = await eventService.uploadPoster(posterFile);
        posterUrl = uploadRes.posterUrl;
      }
      const payload = {
        ...form,
        posterUrl,
        expectedAttendance: Number(form.expectedAttendance) || 0,
        budgetRequest: Number(form.budgetRequest) || 0
      };
      await onSubmit(payload);
      for (const file of attachments) {
        try {
          const { default: eventService } = await import('../../../services/eventService');
          await eventService.uploadAttachment(file, null);
        } catch (attachErr) {
          console.error('Attachment upload failed:', attachErr);
        }
      }
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (label, field, icon, type = 'text', options = null) => (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-muted-foreground tracking-wide uppercase">
        <span className="inline-flex items-center gap-1.5">{icon}{label}</span>
      </label>
      {options ? (
        <select
          value={form[field]}
          onChange={e => handleChange(field, e.target.value)}
          className={`w-full rounded-lg border ${errors[field] ? 'border-red-500/50' : 'border-border'} bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors appearance-none`}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          value={form[field]}
          onChange={e => handleChange(field, e.target.value)}
          rows={4}
          className={`w-full rounded-lg border ${errors[field] ? 'border-red-500/50' : 'border-border'} bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors resize-none`}
        />
      ) : type === 'checkbox' ? (
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            form[field] ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50'
          }`}>
            {form[field] && <Check size={12} className="text-primary-foreground" />}
          </div>
          <input
            type="checkbox"
            checked={form[field]}
            onChange={e => handleChange(field, e.target.checked)}
            className="hidden"
          />
          <span className="text-sm text-muted-foreground">Enable</span>
        </label>
      ) : (
        <input
          type={type}
          value={form[field]}
          onChange={e => handleChange(field, e.target.value)}
          className={`w-full rounded-lg border ${errors[field] ? 'border-red-500/50' : 'border-border'} bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors`}
        />
      )}
      {errors[field] && (
        <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
          <span className="w-1 h-1 rounded-full bg-red-400" />
          {errors[field]}
        </p>
      )}
    </div>
  );

  const steps = [
    { num: 1, label: 'Basic Info', desc: 'Title, description & organizer' },
    { num: 2, label: 'Schedule & Venue', desc: 'Date, time & location' },
    { num: 3, label: 'Audience & Review', desc: 'Targeting & submission' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        <div className="px-6 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-3 mb-1">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDirectPublish ? 'bg-emerald-500/10' : 'bg-blue-500/10'}`}>
              {isDirectPublish ? <ShieldCheck size={16} className="text-emerald-400" /> : <FileText size={16} className="text-blue-400" />}
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {isDirectPublish ? 'Publish New Event' : 'New Event Request'}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isDirectPublish
                  ? 'Publish directly to the entire campus'
                  : 'Submit for review by the Guild Council'}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center flex-1">
                <button
                  onClick={() => setStep(s.num)}
                  className="flex items-center gap-2 text-left"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s.num
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : step > s.num
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {step > s.num ? <Check size={12} /> : s.num}
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-xs font-medium ${
                      step === s.num ? 'text-foreground' : 'text-muted-foreground'
                    }`}>{s.label}</p>
                    <p className="text-[10px] text-muted-foreground/60">{s.desc}</p>
                  </div>
                </button>
                {i < steps.length - 1 && (
                  <div className="flex-1 mx-3 h-px bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField('Event Title', 'title', <Type size={13} />)}
                    {renderField('Category', 'category', <Hash size={13} />, 'select', CATEGORIES)}
                  </div>
                  {renderField('Description', 'description', <AlignLeft size={13} />, 'textarea')}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField('Organizer Name', 'organizerName', <Users size={13} />)}
                    {renderField('Organizer Role', 'organizerRole', <Building2 size={13} />)}
                  </div>
                  {renderField('Department / Club', 'departmentClub', <Globe size={13} />)}
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {renderField('Venue', 'venue', <MapPin size={13} />)}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField('Start Date', 'startDate', <Calendar size={13} />, 'date')}
                    {renderField('End Date', 'endDate', <Calendar size={13} />, 'date')}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField('Start Time', 'startTime', <Clock size={13} />, 'time')}
                    {renderField('End Time', 'endTime', <Clock size={13} />, 'time')}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField('Expected Attendance', 'expectedAttendance', <Users size={13} />, 'number')}
                    {renderField('Contact Information', 'contactInfo', <Phone size={13} />)}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                      <span className="inline-flex items-center gap-1.5"><Target size={13} />Target Audience</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {AUDIENCE_OPTIONS.map(opt => {
                        const selected = form.targetAudience?.includes(opt.value);
                        return (
                          <label
                            key={opt.value}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                              selected
                                ? 'border-primary/40 bg-primary/5'
                                : 'border-border hover:border-primary/20 bg-card'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                              selected ? 'bg-primary border-primary' : 'border-border'
                            }`}>
                              {selected && <Check size={10} className="text-primary-foreground" />}
                            </div>
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={e => {
                                const val = opt.value;
                                const current = form.targetAudience || [];
                                if (val === 'whole_university') {
                                  handleChange('targetAudience', e.target.checked ? ['whole_university'] : []);
                                } else {
                                  const next = current.filter(v => v !== 'whole_university');
                                  handleChange('targetAudience', e.target.checked ? [...next, val] : next);
                                }
                              }}
                              className="hidden"
                            />
                            <span className="text-sm text-foreground">{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                    {errors.targetAudience && (
                      <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                        <span className="w-1 h-1 rounded-full bg-red-400" />
                        {errors.targetAudience}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField('Visibility', 'visibilitySettings', <Eye size={13} />, 'select', VISIBILITY_OPTIONS)}
                    {renderField('Budget Request (RWF)', 'budgetRequest', <DollarSign size={13} />, 'number')}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField('Registration Link', 'externalRegistrationLink', <Link size={13} />)}
                    {renderField('Livestream Link', 'livestreamLink', <Link size={13} />)}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {renderField('Attendance Tracking', 'attendanceTracking', <FileText size={13} />, 'checkbox')}
                    {renderField('QR Check-in', 'qrCheckIn', <Hash size={13} />, 'checkbox')}
                  </div>

                  {!isDirectPublish && renderField('Notes to Reviewers', 'notesToReviewers', <MessageSquare size={13} />, 'textarea')}

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                      <span className="inline-flex items-center gap-1.5"><Image size={13} />Event Poster</span>
                    </label>
                    <div className="flex items-center gap-4 mt-1">
                      {posterPreview && (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
                          <img src={posterPreview} alt="Poster preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => { setPosterFile(null); setPosterPreview(null); }}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all bg-card"
                      >
                        <Upload size={14} />
                        {posterPreview ? 'Change Poster' : 'Upload Poster'}
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePoster} className="hidden" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                      <span className="inline-flex items-center gap-1.5"><FileText size={13} />Additional Attachments</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => attachmentInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all bg-card"
                    >
                      <Upload size={14} />
                      Add Files
                    </button>
                    <input ref={attachmentInputRef} type="file" multiple onChange={handleAttachment} className="hidden" />
                    {attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {attachments.map((file, i) => (
                          <div key={i} className="flex items-center justify-between px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm">
                            <span className="text-muted-foreground truncate max-w-[160px] sm:max-w-[300px]">{file.name}</span>
                            <button type="button" onClick={() => removeAttachment(i)} className="text-muted-foreground hover:text-red-400 transition-colors p-1">
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/20">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(s => s - 1)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {onCancel && (
                <button type="button" onClick={onCancel} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cancel
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(s => s + 1)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-sm"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 shadow-sm"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {isDirectPublish ? 'Publish Event' : 'Submit for Review'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
