import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, MapPin, Type, AlignLeft, Users, Phone,
  Link, Image, Upload, FileText, DollarSign, Target, Eye,
  MessageSquare, X, Loader2, ChevronRight, ChevronLeft,
  Check, Building2, Hash, Globe, ShieldCheck, Search,
  ChevronDown, AlertCircle, RefreshCw, GraduationCap, UserPlus
} from 'lucide-react';
import apiClient from '../../../services/apiClient';

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
  { value: 'whole_university', label: 'Whole University', icon: Globe },
  { value: 'specific_college', label: 'Specific College', icon: Building2 },
  { value: 'specific_school', label: 'Specific School', icon: GraduationCap },
  { value: 'department', label: 'Department', icon: Hash },
  { value: 'academic_year', label: 'Academic Year', icon: Calendar },
  { value: 'clubs', label: 'Clubs', icon: Users },
  { value: 'staff_only', label: 'Staff Only', icon: ShieldCheck },
  { value: 'invite_only', label: 'Invite Only', icon: UserPlus },
];

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public (visible to all)' },
  { value: 'restricted', label: 'Restricted (targeted audience only)' },
  { value: 'invite_only', label: 'Invite Only (private)' },
];

const FIELD_LABELS = {
  title: 'Event Title',
  description: 'Description',
  organizerName: 'Organizer Name',
  organizerRole: 'Organizer Role',
  venue: 'Venue',
  startDate: 'Start Date',
  startTime: 'Start Time',
  targetAudience: 'Target Audience',
  targetColleges: 'College',
  targetSchools: 'School',
  targetDepartments: 'Department',
  targetAcademicYears: 'Academic Year',
  targetClubs: 'Clubs',
};

const FIELD_STEP = {
  title: 1,
  description: 1,
  organizerName: 1,
  organizerRole: 1,
  venue: 2,
  startDate: 2,
  startTime: 2,
  targetAudience: 3,
  targetColleges: 3,
  targetSchools: 3,
  targetDepartments: 3,
  targetAcademicYears: 3,
  targetClubs: 3,
};

const AUDIENCE_DEPS = {
  specific_college: ['college'],
  specific_school: ['college', 'school'],
  department: ['college', 'school', 'department'],
  academic_year: ['year'],
  clubs: ['clubs'],
  invite_only: ['emails'],
  whole_university: [],
  staff_only: [],
};

function SearchableSelect({ label, options, value, onChange, placeholder, loading, error, onRetry }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = options.find(o => o._id === value);
  const filtered = options.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <label className="block text-xs font-medium text-muted-foreground tracking-wide uppercase">{label}</label>
      <button
        type="button"
        onClick={() => { setOpen(p => !p); setSearch(''); }}
        className={`w-full flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-sm transition-colors ${
          open ? 'ring-1 ring-primary/30' : ''
        }`}
      >
        <span className={selected ? 'text-foreground' : 'text-muted-foreground'}>
          {selected ? selected.name : placeholder || 'Select...'}
        </span>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-xl overflow-hidden"
          >
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
              <Search size={14} className="text-muted-foreground shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" />
                  Loading...
                </div>
              ) : error ? (
                <div className="flex flex-col items-center gap-2 py-4 text-sm">
                  <AlertCircle size={16} className="text-red-400" />
                  <span className="text-red-400">Failed to load</span>
                  {onRetry && (
                    <button
                      type="button"
                      onClick={onRetry}
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <RefreshCw size={12} /> Retry
                    </button>
                  )}
                </div>
              ) : filtered.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No options found</p>
              ) : (
                filtered.map(opt => (
                  <button
                    key={opt._id}
                    type="button"
                    onClick={() => { onChange(opt._id); setOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-white/5 ${
                      value === opt._id ? 'bg-primary/10 text-primary' : 'text-foreground'
                    }`}
                  >
                    {opt.name}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MultiClubSelect({ options, value, onChange, loading, error, onRetry }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = options.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );
  const selectedNames = options.filter(o => value.includes(o._id)).map(o => o.name);

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <label className="block text-xs font-medium text-muted-foreground tracking-wide uppercase">
        <span className="inline-flex items-center gap-1.5"><Users size={13} />Select Clubs</span>
      </label>
      <button
        type="button"
        onClick={() => { setOpen(p => !p); setSearch(''); }}
        className={`w-full flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-sm transition-colors ${
          open ? 'ring-1 ring-primary/30' : ''
        }`}
      >
        <span className={selectedNames.length ? 'text-foreground' : 'text-muted-foreground'}>
          {selectedNames.length ? selectedNames.join(', ') : 'Select clubs...'}
        </span>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-xl overflow-hidden"
          >
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
              <Search size={14} className="text-muted-foreground shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search clubs..."
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                autoFocus
              />
            </div>
            <div className="max-h-52 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" />
                  Loading...
                </div>
              ) : error ? (
                <div className="flex flex-col items-center gap-2 py-4 text-sm">
                  <AlertCircle size={16} className="text-red-400" />
                  <span className="text-red-400">Failed to load clubs</span>
                  {onRetry && (
                    <button
                      type="button"
                      onClick={onRetry}
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <RefreshCw size={12} /> Retry
                    </button>
                  )}
                </div>
              ) : filtered.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No clubs found</p>
              ) : (
                filtered.map(opt => {
                  const checked = value.includes(opt._id);
                  return (
                    <label
                      key={opt._id}
                      className="flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors hover:bg-white/5"
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                        checked ? 'bg-primary border-primary' : 'border-border'
                      }`}>
                        {checked && <Check size={10} className="text-primary-foreground" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          onChange(
                            checked
                              ? value.filter(id => id !== opt._id)
                              : [...value, opt._id]
                          );
                        }}
                        className="hidden"
                      />
                      <span className="text-sm text-foreground">{opt.name}</span>
                    </label>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {options.filter(o => value.includes(o._id)).map(o => (
            <span key={o._id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
              {o.name}
              <button type="button" onClick={() => onChange(value.filter(id => id !== o._id))} className="hover:text-primary-foreground">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

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
    targetSchools: [],
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
  const [submitError, setSubmitError] = useState(null);
  const [step, setStep] = useState(1);
  const fileInputRef = useRef(null);
  const attachmentInputRef = useRef(null);

  const [colleges, setColleges] = useState([]);
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [levels] = useState([
    { _id: 'Year 1', name: 'Year 1' },
    { _id: 'Year 2', name: 'Year 2' },
    { _id: 'Year 3', name: 'Year 3' },
    { _id: 'Year 4', name: 'Year 4' },
    { _id: 'Year 5', name: 'Year 5' },
  ]);

  const [loadingColleges, setLoadingColleges] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [errorColleges, setErrorColleges] = useState(null);
  const [errorSchools, setErrorSchools] = useState(null);
  const [errorDepartments, setErrorDepartments] = useState(null);
  const [errorClubs, setErrorClubs] = useState(null);

  const fetchColleges = useCallback(async (retry) => {
    if (!retry) setLoadingColleges(true);
    setErrorColleges(null);
    try {
      const { data } = await apiClient.get('/dropdowns/colleges');
      setColleges(Array.isArray(data) ? data : []);
    } catch {
      setErrorColleges('Failed to load colleges');
    } finally {
      setLoadingColleges(false);
    }
  }, []);

  const fetchSchools = useCallback(async (collegeId) => {
    setLoadingSchools(true);
    setErrorSchools(null);
    try {
      const params = collegeId ? { collegeId } : {};
      const { data } = await apiClient.get('/dropdowns/schools', { params });
      setSchools(Array.isArray(data) ? data : []);
    } catch {
      setErrorSchools('Failed to load schools');
    } finally {
      setLoadingSchools(false);
    }
  }, []);

  const fetchDepartments = useCallback(async (schoolId) => {
    setLoadingDepartments(true);
    setErrorDepartments(null);
    try {
      const params = schoolId ? { schoolId } : {};
      const { data } = await apiClient.get('/dropdowns/departments', { params });
      setDepartments(Array.isArray(data) ? data : []);
    } catch {
      setErrorDepartments('Failed to load departments');
    } finally {
      setLoadingDepartments(false);
    }
  }, []);

  const fetchClubs = useCallback(async (retry) => {
    if (!retry) setLoadingClubs(true);
    setErrorClubs(null);
    try {
      const { data } = await apiClient.get('/dropdowns/clubs');
      setClubs(Array.isArray(data) ? data : []);
    } catch {
      setErrorClubs('Failed to load clubs');
    } finally {
      setLoadingClubs(false);
    }
  }, []);

  useEffect(() => {
    fetchColleges();
    fetchClubs();
  }, [fetchColleges, fetchClubs]);

  const selectedAudiences = form.targetAudience || [];
  const neededFields = new Set();
  selectedAudiences.forEach(aud => {
    (AUDIENCE_DEPS[aud] || []).forEach(f => neededFields.add(f));
  });
  const needsCollege = neededFields.has('college');
  const needsSchool = neededFields.has('school');
  const needsDepartment = neededFields.has('department');
  const needsYear = neededFields.has('year');
  const needsClubs = neededFields.has('clubs');
  const needsEmails = neededFields.has('emails');

  useEffect(() => {
    if (needsCollege && colleges.length === 0 && !loadingColleges && !errorColleges) {
      fetchColleges();
    }
  }, [needsCollege, colleges.length, loadingColleges, errorColleges, fetchColleges]);

  useEffect(() => {
    if (needsClubs && clubs.length === 0 && !loadingClubs && !errorClubs) {
      fetchClubs();
    }
  }, [needsClubs, clubs.length, loadingClubs, errorClubs, fetchClubs]);

  const selectedCollege = form.targetColleges?.[0] || '';
  const selectedSchool = form.targetSchools?.[0] || '';

  useEffect(() => {
    if (selectedCollege && (needsSchool || needsDepartment)) {
      fetchSchools(selectedCollege);
    } else if (!selectedCollege) {
      setSchools([]);
    }
  }, [selectedCollege, needsSchool, needsDepartment, fetchSchools]);

  useEffect(() => {
    if (selectedSchool && needsDepartment) {
      fetchDepartments(selectedSchool);
    } else if (!selectedSchool) {
      setDepartments([]);
    }
  }, [selectedSchool, needsDepartment, fetchDepartments]);

  const handleChange = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'targetColleges' && value !== prev.targetColleges) {
        updated.targetSchools = [];
        updated.targetDepartments = [];
      }
      if (field === 'targetSchools' && value !== prev.targetSchools) {
        updated.targetDepartments = [];
      }
      return updated;
    });
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validate = () => {
    const errs = {};
    if (!form.title?.trim()) errs.title = 'Title is required';
    if (!form.description?.trim()) errs.description = 'Description is required';
    if (!form.organizerName?.trim()) errs.organizerName = 'Organizer name is required';
    if (!form.organizerRole?.trim()) errs.organizerRole = 'Organizer role is required';
    if (!form.venue?.trim()) errs.venue = 'Venue is required';
    if (!form.startDate) errs.startDate = 'Start date is required';
    if (!form.startTime) errs.startTime = 'Start time is required';
    if (selectedAudiences.length === 0) errs.targetAudience = 'Select at least one audience';
    if (needsCollege && !selectedCollege) errs.targetColleges = 'Select a college';
    if (needsSchool && !selectedSchool) errs.targetSchools = 'Select a school';
    if (needsDepartment && form.targetDepartments?.length === 0) errs.targetDepartments = 'Select at least one department';
    if (needsYear && form.targetAcademicYears?.length === 0) errs.targetAcademicYears = 'Select at least one year';
    if (needsClubs && form.targetClubs?.length === 0) errs.targetClubs = 'Select at least one club';
    setErrors(errs);

    const errFields = Object.keys(errs);
    if (errFields.length > 0) {
      const earliestStep = Math.min(...errFields.map(f => FIELD_STEP[f] || 3));
      setStep(earliestStep);
      setSubmitError(
        `Please fix the following before submitting: ${errFields.map(f => FIELD_LABELS[f] || f).join(', ')}`
      );
    } else {
      setSubmitError(null);
    }

    return errFields.length === 0;
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
    setSubmitError(null);
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
      const eventId = await onSubmit(payload);
      if (eventId) {
        for (const file of attachments) {
          try {
            const { default: eventService } = await import('../../../services/eventService');
            await eventService.uploadAttachment(file, eventId);
          } catch (attachErr) {
            console.error('Attachment upload failed:', attachErr);
          }
        }
      }
    } catch (err) {
      const serverErrors = err.response?.data;
      console.error('Submit error:', JSON.stringify(serverErrors || err.message, null, 2));

      if (serverErrors?.errors?.length) {
        const fieldErrs = {};
        serverErrors.errors.forEach(e => {
          if (e.field) fieldErrs[e.field] = e.message;
        });
        setErrors(prev => ({ ...prev, ...fieldErrs }));

        const errFields = Object.keys(fieldErrs);
        if (errFields.length > 0) {
          const earliestStep = Math.min(...errFields.map(f => FIELD_STEP[f] || 3));
          setStep(earliestStep);
        }

        setSubmitError(
          serverErrors.errors.map(e => `${FIELD_LABELS[e.field] || e.field || ''}: ${e.message}`).join(' | ')
        );
      } else if (serverErrors?.message) {
        setSubmitError(serverErrors.message);
      } else if (err.message === 'Network Error' || !err.response) {
        setSubmitError('Network error: could not reach the server. Please check your connection and try again.');
      } else {
        setSubmitError('Something went wrong while submitting the event. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (label, field, icon, type = 'text', options = null) => (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-muted-foreground tracking-wide uppercase">
        <span className="inline-flex items-center gap-1.5">
          {icon}{label}{FIELD_LABELS[field] && <span className="text-red-400">*</span>}
        </span>
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

  const canProceedToStep3 = form.title?.trim() && form.description?.trim() && form.organizerName?.trim() && form.organizerRole?.trim();

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
                  type="button"
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
            <AnimatePresence>
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mb-4 flex items-start gap-2.5 px-3.5 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-400">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
                      <span className="inline-flex items-center gap-1.5"><Target size={13} />Target Audience<span className="text-red-400">*</span></span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      {AUDIENCE_OPTIONS.map(opt => {
                        const selected = form.targetAudience?.includes(opt.value);
                        const Icon = opt.icon;
                        return (
                          <label
                            key={opt.value}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                              selected
                                ? 'border-primary/40 bg-primary/5'
                                : 'border-border hover:border-primary/20 bg-card'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
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
                            <Icon size={14} className={`shrink-0 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
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

                  <AnimatePresence>
                    {(needsCollege || needsSchool || needsDepartment || needsYear || needsClubs || needsEmails) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div className="h-px bg-border/50" />

                        {needsCollege && (
                          <SearchableSelect
                            label={needsSchool ? 'Select College' : 'Select College'}
                            options={colleges}
                            value={selectedCollege}
                            onChange={val => handleChange('targetColleges', val ? [val] : [])}
                            placeholder="Select College..."
                            loading={loadingColleges}
                            error={errorColleges}
                            onRetry={() => fetchColleges(true)}
                          />
                        )}

                        {needsSchool && selectedCollege && (
                          <SearchableSelect
                            label="Select School under selected College"
                            options={schools}
                            value={selectedSchool}
                            onChange={val => handleChange('targetSchools', val ? [val] : [])}
                            placeholder={loadingSchools ? 'Loading schools...' : 'Select School...'}
                            loading={loadingSchools}
                            error={errorSchools}
                            onRetry={() => fetchSchools(selectedCollege)}
                          />
                        )}

                        {needsSchool && !selectedCollege && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <AlertCircle size={11} />
                            Select a college first to see available schools.
                          </p>
                        )}

                        {needsDepartment && selectedSchool && (
                          <SearchableSelect
                            label="Select Department under selected School"
                            options={departments}
                            value={form.targetDepartments?.[0] || ''}
                            onChange={val => handleChange('targetDepartments', val ? [val] : [])}
                            placeholder={loadingDepartments ? 'Loading departments...' : 'Select Department...'}
                            loading={loadingDepartments}
                            error={errorDepartments}
                            onRetry={() => fetchDepartments(selectedSchool)}
                          />
                        )}

                        {needsDepartment && !selectedSchool && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <AlertCircle size={11} />
                            Select a college and school first to see available departments.
                          </p>
                        )}

                        {needsYear && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-muted-foreground tracking-wide uppercase">
                              <span className="inline-flex items-center gap-1.5"><Calendar size={13} />Select Academic Years</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {levels.map(lvl => {
                                const checked = form.targetAcademicYears?.includes(lvl._id);
                                return (
                                  <label
                                    key={lvl._id}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                                      checked
                                        ? 'border-primary/40 bg-primary/5'
                                        : 'border-border hover:border-primary/20 bg-card'
                                    }`}
                                  >
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                                      checked ? 'bg-primary border-primary' : 'border-border'
                                    }`}>
                                      {checked && <Check size={10} className="text-primary-foreground" />}
                                    </div>
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => {
                                        handleChange('targetAcademicYears',
                                          checked
                                            ? form.targetAcademicYears.filter(y => y !== lvl._id)
                                            : [...(form.targetAcademicYears || []), lvl._id]
                                        );
                                      }}
                                      className="hidden"
                                    />
                                    <span className="text-sm text-foreground">{lvl.name}</span>
                                  </label>
                                );
                              })}
                            </div>
                            {errors.targetAcademicYears && (
                              <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                                <span className="w-1 h-1 rounded-full bg-red-400" />
                                {errors.targetAcademicYears}
                              </p>
                            )}
                          </div>
                        )}

                        {needsClubs && (
                          <MultiClubSelect
                            options={clubs}
                            value={form.targetClubs || []}
                            onChange={val => handleChange('targetClubs', val)}
                            loading={loadingClubs}
                            error={errorClubs}
                            onRetry={() => fetchClubs(true)}
                          />
                        )}

                        {needsEmails && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-muted-foreground tracking-wide uppercase">
                              <span className="inline-flex items-center gap-1.5"><UserPlus size={13} />Invite Users</span>
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Type name or email and press Add..."
                                className="flex-1 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                              />
                              <button
                                type="button"
                                className="px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                              >
                                Add
                              </button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Invite-only email/user management coming soon.
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
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
                  onClick={() => {
                    if (step === 1 && !canProceedToStep3) {
                      const stepErrors = {
                        ...(!form.title?.trim() ? { title: 'Title is required' } : {}),
                        ...(!form.description?.trim() ? { description: 'Description is required' } : {}),
                        ...(!form.organizerName?.trim() ? { organizerName: 'Organizer name is required' } : {}),
                        ...(!form.organizerRole?.trim() ? { organizerRole: 'Organizer role is required' } : {}),
                      };
                      setErrors(prev => ({ ...prev, ...stepErrors }));
                      setSubmitError(
                        `Please fill in the required fields: ${Object.keys(stepErrors).map(f => FIELD_LABELS[f] || f).join(', ')}`
                      );
                      return;
                    }
                    setSubmitError(null);
                    setStep(s => s + 1);
                  }}
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
