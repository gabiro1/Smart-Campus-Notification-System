import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import apiClient from '../../../../../services/apiClient';
import toast from 'react-hot-toast';
import { 
  Mail, Phone, BookOpen, GraduationCap, Building, 
  Loader2, Edit3, X, Plus, Check, Hash 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    interests: []
  });
  
  const [newInterest, setNewInterest] = useState('');

  // Sync state whenever user context updates and we are not actively in edit mode
  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        interests: user.interests || []
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
      
      // Update the main app user context with the new data
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

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center text-white min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-white/[0.02] backdrop-blur-3xl p-8 sm:p-10 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden">
        {/* Abstract Background Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -z-10" />

        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10 w-full relative">
          
          <div className="flex-shrink-0 relative">
            <div className="w-28 h-28 bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 rounded-full flex items-center justify-center p-1 shadow-2xl">
              <div className="w-full h-full bg-neutral-900 rounded-full flex items-center justify-center text-4xl font-black text-white tracking-tighter">
                {getInitials(user.name)}
              </div>
            </div>
            {/* Online Indicator */}
            <div className="absolute bottom-1 right-2 w-6 h-6 bg-green-500 border-4 border-neutral-900 rounded-full" />
          </div>

          <div className="flex-1 text-center sm:text-left pt-2 w-full">
            {!isEditing ? (
              <>
                <h1 className="text-3xl font-black text-white tracking-tight mb-2">{user.name}</h1>
                <p className="text-blue-400 font-medium flex items-center justify-center sm:justify-start gap-2">
                  <GraduationCap size={18} />
                  Student • {user.level || 'Level Not Set'}
                </p>
              </>
            ) : (
              <div className="space-y-4 w-full pr-0 sm:pr-40">
                <div>
                  <label className="text-xs text-neutral-400 font-bold uppercase tracking-widest pl-1 mb-1 block text-left">Full Name</label>
                  <input 
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({...p, name: e.target.value}))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="sm:absolute top-2 right-2 w-full sm:w-auto flex justify-center mt-4 sm:mt-0">
             {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all w-full sm:w-auto justify-center"
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
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    Save
                  </button>
                </div>
             )}
          </div>

        </div>

        {/* --- DETAILS GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 w-full">
          
          <div className="bg-black/30 border border-white/5 p-5 rounded-2xl flex items-start gap-4 transition-colors hover:bg-white/[0.03]">
            <div className="bg-white/5 p-3 rounded-full text-neutral-400 mt-1 flex-shrink-0">
              <Mail size={18} />
            </div>
            <div className="w-full overflow-hidden">
              <label className="text-xs text-neutral-500 font-bold uppercase tracking-widest pl-1">Email (Read Only)</label>
              <div className="text-white font-medium truncate mt-1" title={user.email}>{user.email}</div>
            </div>
          </div>

          <div className="bg-black/30 border border-white/5 p-5 rounded-2xl flex items-start gap-4 transition-colors hover:bg-white/[0.03]">
            <div className="bg-white/5 p-3 rounded-full text-neutral-400 mt-1 flex-shrink-0">
              <Phone size={18} />
            </div>
            <div className="w-full">
              <label className="text-xs text-neutral-500 font-bold uppercase tracking-widest pl-1 mb-1 block">Phone Number</label>
              {!isEditing ? (
                 <div className="text-white font-medium mt-1">{user.phoneNumber || 'Not provided'}</div>
              ) : (
                <input 
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(p => ({...p, phoneNumber: e.target.value}))}
                  placeholder="+250..."
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm mt-1"
                />
              )}
            </div>
          </div>

          <div className="bg-black/30 border border-white/5 p-5 rounded-2xl flex items-start gap-4 transition-colors hover:bg-white/[0.03]">
            <div className="bg-white/5 p-3 rounded-full text-neutral-400 mt-1 flex-shrink-0">
              <Building size={18} />
            </div>
            <div className="w-full overflow-hidden">
              <label className="text-xs text-neutral-500 font-bold uppercase tracking-widest pl-1">School</label>
              <div className="text-white font-medium truncate mt-1">{getRefName(user.school)}</div>
            </div>
          </div>

          <div className="bg-black/30 border border-white/5 p-5 rounded-2xl flex items-start gap-4 transition-colors hover:bg-white/[0.03]">
            <div className="bg-white/5 p-3 rounded-full text-neutral-400 mt-1 flex-shrink-0">
              <BookOpen size={18} />
            </div>
            <div className="w-full overflow-hidden">
              <label className="text-xs text-neutral-500 font-bold uppercase tracking-widest pl-1">Department</label>
              <div className="text-white font-medium truncate mt-1">{getRefName(user.department)}</div>
            </div>
          </div>

        </div>

        {/* --- INTERESTS --- */}
        <div className="pt-8 border-t border-white/5 w-full">
           <label className="text-xs text-neutral-500 font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
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

              {/* Add Interest Input Tracker */}
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
                    className="bg-black/40 border border-white/10 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-40 placeholder:text-neutral-600"
                  />
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddInterest();
                    }}
                    disabled={!newInterest.trim()}
                    className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white p-2 rounded-full transition-all disabled:opacity-30 disabled:hover:bg-blue-600/20 disabled:hover:text-blue-400"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
}
