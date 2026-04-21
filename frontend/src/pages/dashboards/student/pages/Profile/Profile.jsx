import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import apiClient from '../../../../../services/apiClient';
import toast from 'react-hot-toast';
import { 
  Mail, Phone, BookOpen, GraduationCap, Building, 
  Loader2, Edit3, X, Plus, Check, Hash,
  Camera, Ticket, CheckCircle, XCircle, 
  Clock, Calendar, User, Shield, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    interests: [],
    level: ''
  });
  
  const [newInterest, setNewInterest] = useState('');
  const fileInputRef = useRef(null);

  // Sync state whenever user context updates
  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        interests: user.interests || [],
        level: user.level || ''
      });
    }
  }, [user, isEditing]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getRefName = (refObj) => {
    if (!refObj) return 'Not assigned';
    if (typeof refObj === 'object' && refObj.name) return refObj.name;
    if (typeof refObj === 'string' && refObj.length > 0) return 'Not assigned'; 
    return 'Not assigned';
  };

  // Handle photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await apiClient.post('/users/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data?.user) {
        updateUser(response.data.user);
        toast.success('Profile photo updated!');
      } else {
        toast.success('Photo uploaded!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interestToRemove)
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await apiClient.put('/users/profile', formData);
      
      if (res.data && res.data.user) {
        updateUser(res.data.user);
      } else {
        updateUser({ ...user, ...formData });
      }
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Format dates
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center text-foreground min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-card backdrop-blur-3xl p-4 md:p-8 sm:p-10 rounded-2xl md:rounded-[32px] border border-border shadow-xl md:shadow-2xl relative overflow-hidden">
        {/* Abstract Background Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -z-10" />

        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10 w-full relative">
          
          {/* Avatar with Photo Upload */}
          <div className="flex-shrink-0 relative">
            <div 
              className="w-28 h-28 bg-blue-600 rounded-full flex items-center justify-center p-1 shadow-xl cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => fileInputRef.current?.click()}
            >
              {user.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={user.name} 
                  className="w-full h-full rounded-full object-cover bg-neutral-900"
                />
              ) : (
                <div className="w-full h-full bg-neutral-900 rounded-full flex items-center justify-center text-4xl font-black text-foreground tracking-tighter">
                  {getInitials(user.name)}
                </div>
              )}
            </div>
            {/* Camera Overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 w-8 h-8 bg-blue-600 hover:bg-blue-500 border-2 border-card rounded-full flex items-center justify-center transition-colors"
              title="Change photo"
            >
              {uploadingPhoto ? (
                <Loader2 size={14} className="animate-spin text-foreground" />
              ) : (
                <Camera size={14} className="text-foreground" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            {/* Online Indicator */}
            <div className="absolute -bottom-1 left-1 w-5 h-5 bg-green-500 border-4 border-card rounded-full" />
          </div>

          <div className="flex-1 text-center sm:text-left pt-2 w-full">
            {!isEditing ? (
              <>
                <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">{user.name}</h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <p className="text-blue-400 font-medium flex items-center gap-2">
                    <GraduationCap size={18} />
                    Student • {user.level || 'Level Not Set'}
                  </p>
                  {/* Student ID Badge */}
                  {user.studentID && (
                    <span className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm font-bold">
                      <Ticket size={14} />
                      {user.studentID}
                    </span>
                  )}
                </div>
                {/* Email Verification Badge */}
                <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
                  {user.emailVerified ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
                      <CheckCircle size={16} />
                      Email Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-red-400 text-sm">
                      <XCircle size={16} />
                      Not Verified
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-4 w-full pr-0 sm:pr-40">
                <div>
                  <label className="text-xs text-muted-foreground font-bold uppercase tracking-widest pl-1 mb-1 block text-left">Full Name</label>
                  <input 
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({...p, name: e.target.value}))}
                    className="w-full bg-black/40 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-bold"
                  />
                </div>
                {/* Level Dropdown */}
                <div>
                  <label className="text-xs text-muted-foreground font-bold uppercase tracking-widest pl-1 mb-1 block text-left">Level / Year</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData(p => ({...p, level: e.target.value}))}
                    className="w-full bg-black/40 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  >
                    <option value="">Select Level</option>
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                    <option value="Year 5">Year 5</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="sm:absolute top-2 right-2 w-full sm:w-auto flex justify-center mt-4 sm:mt-0">
             {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-accent hover:bg-primary/10 border border-border text-foreground px-5 py-2.5 rounded-full text-sm font-bold transition-all w-full sm:w-auto justify-center"
                >
                  <Edit3 size={16} />
                  Edit Profile
                </button>
             ) : (
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2.5 rounded-full text-sm font-bold transition-all disabled:opacity-50"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-foreground px-6 py-2.5 rounded-full text-sm font-bold transition-all disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    Save
                  </button>
                </div>
             )}
          </div>
        </div>

        {/* --- PERSONAL INFO GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 w-full">
          
          <div className="bg-black/30 border border-border p-5 rounded-2xl flex items-start gap-4 transition-colors hover:bg-white/[0.03]">
            <div className="bg-accent p-3 rounded-full text-muted-foreground mt-1 flex-shrink-0">
              <Mail size={18} />
            </div>
            <div className="w-full overflow-hidden">
              <label className="text-xs text-muted-foreground font-bold uppercase tracking-widest pl-1">Email (Read Only)</label>
              <div className="text-foreground font-medium truncate mt-1" title={user.email}>{user.email}</div>
            </div>
          </div>

          <div className="bg-black/30 border border-border p-5 rounded-2xl flex items-start gap-4 transition-colors hover:bg-white/[0.03]">
            <div className="bg-accent p-3 rounded-full text-muted-foreground mt-1 flex-shrink-0">
              <Phone size={18} />
            </div>
            <div className="w-full">
              <label className="text-xs text-muted-foreground font-bold uppercase tracking-widest pl-1 mb-1 block">Phone Number</label>
              {!isEditing ? (
                 <div className="text-foreground font-medium mt-1">{user.phoneNumber || 'Not provided'}</div>
              ) : (
                <input 
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(p => ({...p, phoneNumber: e.target.value}))}
                  placeholder="+250..."
                  className="w-full bg-black/40 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm mt-1"
                />
              )}
            </div>
          </div>
        </div>

        {/* --- ACADEMIC INFO GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 w-full">
          
          {/* College */}
          <div className="bg-black/30 border border-border p-5 rounded-2xl flex items-start gap-4 transition-colors hover:bg-white/[0.03]">
            <div className="bg-accent p-3 rounded-full text-purple-400 mt-1 flex-shrink-0">
              <Building2 size={18} />
            </div>
            <div className="w-full overflow-hidden">
              <label className="text-xs text-muted-foreground font-bold uppercase tracking-widest pl-1">College</label>
              <div className="text-foreground font-medium truncate mt-1">{getRefName(user.college)}</div>
            </div>
          </div>

          {/* School */}
          <div className="bg-black/30 border border-border p-5 rounded-2xl flex items-start gap-4 transition-colors hover:bg-white/[0.03]">
            <div className="bg-accent p-3 rounded-full text-blue-400 mt-1 flex-shrink-0">
              <Building size={18} />
            </div>
            <div className="w-full overflow-hidden">
              <label className="text-xs text-muted-foreground font-bold uppercase tracking-widest pl-1">School</label>
              <div className="text-foreground font-medium truncate mt-1">{getRefName(user.school)}</div>
            </div>
          </div>

          {/* Department */}
          <div className="bg-black/30 border border-border p-5 rounded-2xl flex items-start gap-4 transition-colors hover:bg-white/[0.03]">
            <div className="bg-accent p-3 rounded-full text-emerald-400 mt-1 flex-shrink-0">
              <BookOpen size={18} />
            </div>
            <div className="w-full overflow-hidden">
              <label className="text-xs text-muted-foreground font-bold uppercase tracking-widest pl-1">Department</label>
              <div className="text-foreground font-medium truncate mt-1">{getRefName(user.department)}</div>
            </div>
          </div>

          {/* Class */}
          <div className="bg-black/30 border border-border p-5 rounded-2xl flex items-start gap-4 transition-colors hover:bg-white/[0.03]">
            <div className="bg-accent p-3 rounded-full text-amber-400 mt-1 flex-shrink-0">
              <GraduationCap size={18} />
            </div>
            <div className="w-full overflow-hidden">
              <label className="text-xs text-muted-foreground font-bold uppercase tracking-widest pl-1">Class</label>
              <div className="text-foreground font-medium truncate mt-1">
                {user.classId?.name ? `${user.classId.name} (${user.classId.code || ''})` : 'Not assigned'}
              </div>
            </div>
          </div>
        </div>

        {/* --- INTERESTS --- */}
        <div className="pt-8 border-t border-border w-full">
           <label className="text-xs text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
              <Hash size={14} />
              Interests & Academic Tags
           </label> 

           <div className="flex flex-wrap gap-2.5 items-center">
              <AnimatePresence>
                {(!isEditing ? user.interests : formData.interests)?.map((tag, idx) => (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    key={`${tag}-${idx}`}
                    className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                  >
                    {tag}
                    {isEditing && (
                      <button 
                        onClick={() => handleRemoveInterest(tag)}
                        className="p-0.5 hover:bg-blue-500/20 rounded-full transition-colors ml-1 text-blue-400"
                        title="Remove interest"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </motion.span>
                ))}
              </AnimatePresence> 

              {(!user?.interests?.length && !formData.interests?.length && !isEditing) && (
                <span className="text-neutral-600 text-sm italic py-2">No interests added yet. Click edit to add tags.</span>
              )}

              {isEditing && (
                <div className="flex items-center gap-2 mt-1 sm:mt-0">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInterest();
                      }
                    }}
                    placeholder="Add interest..."
                    className="bg-black/40 border border-border rounded-full px-4 py-2 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-40 placeholder:text-neutral-600"
                  />
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddInterest();
                    }}
                    disabled={!newInterest.trim()}
                    className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-foreground p-2 rounded-full transition-all disabled:opacity-30"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
           </div>
        </div>

        {/* --- ACCOUNT INFO --- */}
        <div className="pt-8 border-t border-border w-full mt-8">
          <label className="text-xs text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
            <Shield size={14} />
            Account Info
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-black/30 border border-border p-4 rounded-xl text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                <User size={16} />
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Role</div>
              <div className="text-foreground font-medium text-sm capitalize">{user.role?.replace('_', ' ')}</div>
            </div>

            <div className="bg-black/30 border border-border p-4 rounded-xl text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                <Calendar size={16} />
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Joined</div>
              <div className="text-foreground font-medium text-sm">{formatDate(user.createdAt)}</div>
            </div>

            <div className="bg-black/30 border border-border p-4 rounded-xl text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                <Clock size={16} />
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Last Active</div>
              <div className="text-foreground font-medium text-sm">{formatDate(user.lastActiveAt)}</div>
            </div>

            <div className="bg-black/30 border border-border p-4 rounded-xl text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                <CheckCircle size={16} />
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Onboarding</div>
              <div className={`font-medium text-sm ${user.hasCompletedOnboarding ? 'text-emerald-400' : 'text-amber-400'}`}>
                {user.hasCompletedOnboarding ? 'Completed' : 'Pending'}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
