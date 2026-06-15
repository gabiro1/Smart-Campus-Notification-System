import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Search, Users, Clock, ChevronRight, ChevronLeft,
  GraduationCap, School, Building2, MessageSquare, Loader2,
  User, Mail, Hash, BookOpen
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import userService from "../../../services/userService";
import adminService from "../../../services/adminService";
import messagingService from "../../../services/messagingService";
import toast from "react-hot-toast";

const TABS = [
  { id: "search", label: "Search", icon: Search },
  { id: "structure", label: "Browse", icon: Building2 },
  { id: "recent", label: "Recent", icon: Clock },
];

export default function NewConversationModal({ isOpen, onClose, onSelect, conversations }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("search");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef(null);

  // Structure state
  const [hierarchy, setHierarchy] = useState({});
  const [loadingHierarchy, setLoadingHierarchy] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [deptUsers, setDeptUsers] = useState([]);
  const [loadingDeptUsers, setLoadingDeptUsers] = useState(false);

  // Recent contacts
  const [recentContacts, setRecentContacts] = useState([]);

  // Resolve existing conversations into a set of user IDs
  const getExistingPartnerIds = useCallback(() => {
    const currentId = user?.id?.toString();
    const ids = new Set();
    (conversations || []).forEach((conv) => {
      if (conv.participants) {
        conv.participants.forEach((p) => {
          const pid = p._id?.toString();
          if (pid && pid !== currentId) ids.add(pid);
        });
      }
      if (conv.lecturer?._id) ids.add(conv.lecturer._id.toString());
      if (conv.student?._id) ids.add(conv.student._id.toString());
    });
    return ids;
  }, [conversations, user]);

  // Debounced user search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await userService.searchUsers(searchQuery.trim());
        const users = res.users || res.data || [];
        setSearchResults(Array.isArray(users) ? users : []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery]);

  // Fetch hierarchy for structure tab
  useEffect(() => {
    if (activeTab !== "structure") return;
    if (Object.keys(hierarchy).length > 0) return;

    const fetchHierarchy = async () => {
      setLoadingHierarchy(true);
      try {
        const res = await adminService.getHierarchy();
        const data = res.data || res || {};
        setHierarchy(data);
      } catch {
        toast.error("Failed to load academic structure");
      } finally {
        setLoadingHierarchy(false);
      }
    };
    fetchHierarchy();
  }, [activeTab, hierarchy]);

  // Fetch users for selected department
  useEffect(() => {
    if (!selectedDept) {
      setDeptUsers([]);
      return;
    }
    const fetchDeptUsers = async () => {
      setLoadingDeptUsers(true);
      try {
        const res = await adminService.getUsers(1, 50, { department: selectedDept }, true);
        const users = res.users || res.data || [];
        setDeptUsers(Array.isArray(users) ? users : []);
      } catch {
        setDeptUsers([]);
      } finally {
        setLoadingDeptUsers(false);
      }
    };
    fetchDeptUsers();
  }, [selectedDept]);

  // Build recent contacts from existing conversations
  useEffect(() => {
    if (activeTab !== "recent") return;
    const currentId = user?.id?.toString();
    const seen = new Set();
    const contacts = [];

    (conversations || []).forEach((conv) => {
      let partner = null;
      if (conv.participants) {
        partner = conv.participants.find((p) => p._id?.toString() !== currentId);
      }
      if (!partner && conv.lecturer) partner = conv.lecturer;
      if (!partner && conv.student) partner = conv.student;

      if (partner && partner._id && !seen.has(partner._id.toString())) {
        seen.add(partner._id.toString());
        contacts.push({
          _id: partner._id,
          name: partner.name || "Unknown",
          role: partner.role || "User",
          department: partner.department || "",
          lastMessageAt: conv.updatedAt || conv.lastMessageAt,
        });
      }
    });

    contacts.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
    setRecentContacts(contacts.slice(0, 10));
  }, [activeTab, conversations, user]);

  const handleSelectUser = async (targetUser) => {
    if (!targetUser?._id) return;

    const currentId = user?.id?.toString();
    const targetId = targetUser._id.toString();
    const existingPartnerIds = getExistingPartnerIds();

    // Check if there's already a conversation with this user
    if (existingPartnerIds.has(targetId)) {
      const existingConv = (conversations || []).find((conv) => {
        if (conv.participants) {
          const ids = conv.participants.map((p) => p._id?.toString());
          return ids.includes(targetId) && ids.includes(currentId);
        }
        return false;
      });
      if (existingConv) {
        onSelect(existingConv);
        onClose();
        return;
      }
    }

    // Create new conversation
    try {
      const conv = await messagingService.createConversation({
        participantId: targetId,
        participantRole: targetUser.role || "student",
        type: "direct",
      });
      const newConv = conv?.data || conv;
      onSelect(newConv);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create conversation");
    }
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      lecturer: "bg-blue-500/10 text-blue-400",
      student: "bg-green-500/10 text-green-400",
      hod: "bg-purple-500/10 text-purple-400",
      admin: "bg-amber-500/10 text-amber-400",
      staff: "bg-neutral-500/10 text-neutral-400",
      class_rep: "bg-emerald-500/10 text-emerald-400",
    };
    return roleColors[role] || "bg-neutral-500/10 text-neutral-400";
  };

  const getInitial = (name) => (name || "?").charAt(0).toUpperCase();

  const availableSchools = Object.keys(hierarchy[selectedCollege] || {});
  const availableDepartments = hierarchy[selectedCollege]?.[selectedSchool] || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[85vh] sm:max-h-[80vh] flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h2 className="text-lg font-semibold text-white">New Message</h2>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Tab Bar */}
              <div className="flex gap-1 px-4 py-2 border-b border-white/5 bg-white/[0.01]">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : "text-neutral-500 hover:text-white hover:bg-white/[0.04] border border-transparent"
                    }`}
                  >
                    <tab.icon size={13} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                {/* === SEARCH TAB === */}
                {activeTab === "search" && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, email, or ID..."
                        autoFocus
                        className="w-full bg-white/[0.02] border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500/50 transition-all"
                      />
                      {searching && (
                        <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 animate-spin" />
                      )}
                    </div>

                    {searchResults.length > 0 ? (
                      <div className="space-y-1">
                        {searchResults.map((result) => (
                          <button
                            key={result._id}
                            onClick={() => handleSelectUser(result)}
                            className="w-full text-left p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all group flex items-center gap-3"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-sm font-bold text-white shrink-0">
                              {getInitial(result.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="text-sm font-medium text-white truncate">{result.name}</h4>
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getRoleBadge(result.role)}`}>
                                  {result.role}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-neutral-500">
                                {result.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail size={10} /> {result.email}
                                  </span>
                                )}
                                {result.registrationNumber && (
                                  <span className="flex items-center gap-1">
                                    <Hash size={10} /> {result.registrationNumber}
                                  </span>
                                )}
                              </div>
                              {result.department && (
                                <p className="text-[10px] text-neutral-600 mt-0.5">{result.department}</p>
                              )}
                            </div>
                            <MessageSquare size={14} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </button>
                        ))}
                      </div>
                    ) : searchQuery.length >= 2 && !searching ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Search size={24} className="text-neutral-600 mb-2" />
                        <p className="text-xs text-neutral-500">No users found for "{searchQuery}"</p>
                      </div>
                    ) : searchQuery.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Users size={24} className="text-neutral-600 mb-2" />
                        <p className="text-xs text-neutral-500">Type a name, email, or ID to find someone</p>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* === STRUCTURE TAB === */}
                {activeTab === "structure" && (
                  <div className="space-y-3">
                    {loadingHierarchy ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 size={20} className="animate-spin text-blue-400" />
                      </div>
                    ) : (
                      <>
                        {/* College level */}
                        <div>
                          <label className="text-[10px] font-medium uppercase text-neutral-500 tracking-wider mb-1.5 block">College</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {Object.keys(hierarchy).map((college) => (
                              <button
                                key={college}
                                onClick={() => { setSelectedCollege(college); setSelectedSchool(""); setSelectedDept(""); }}
                                className={`text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all border ${
                                  selectedCollege === college
                                    ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                    : "bg-white/[0.02] text-neutral-400 border-white/5 hover:bg-white/[0.04] hover:text-white"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <School size={13} className="shrink-0" />
                                  <span className="truncate">{college}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* School level */}
                        {selectedCollege && availableSchools.length > 0 && (
                          <div>
                            <label className="text-[10px] font-medium uppercase text-neutral-500 tracking-wider mb-1.5 block">School</label>
                            <div className="grid grid-cols-2 gap-1.5">
                              {availableSchools.map((school) => (
                                <button
                                  key={school}
                                  onClick={() => { setSelectedSchool(school); setSelectedDept(""); }}
                                  className={`text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all border ${
                                    selectedSchool === school
                                      ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                      : "bg-white/[0.02] text-neutral-400 border-white/5 hover:bg-white/[0.04] hover:text-white"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Building2 size={13} className="shrink-0" />
                                    <span className="truncate">{school}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Department level */}
                        {selectedSchool && availableDepartments.length > 0 && (
                          <div>
                            <label className="text-[10px] font-medium uppercase text-neutral-500 tracking-wider mb-1.5 block">Department</label>
                            <div className="grid grid-cols-2 gap-1.5">
                              {availableDepartments.map((dept) => {
                                const deptName = typeof dept === "string" ? dept : dept.name || dept._id;
                                const deptId = typeof dept === "string" ? dept : dept._id || dept;
                                return (
                                  <button
                                    key={deptId}
                                    onClick={() => setSelectedDept(deptId)}
                                    className={`text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all border ${
                                      selectedDept === deptId
                                        ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                        : "bg-white/[0.02] text-neutral-400 border-white/5 hover:bg-white/[0.04] hover:text-white"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <BookOpen size={13} className="shrink-0" />
                                      <span className="truncate">{deptName}</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Users in selected department */}
                        {selectedDept && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-[10px] font-medium uppercase text-neutral-500 tracking-wider">Members</label>
                              {loadingDeptUsers && <Loader2 size={12} className="animate-spin text-blue-400" />}
                            </div>
                            {loadingDeptUsers ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 size={16} className="animate-spin text-blue-400" />
                              </div>
                            ) : deptUsers.length > 0 ? (
                              <div className="space-y-1">
                                {deptUsers.map((u) => (
                                  <button
                                    key={u._id}
                                    onClick={() => handleSelectUser(u)}
                                    className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all group flex items-center gap-3"
                                  >
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                                      u.role === "lecturer" || u.role === "hod"
                                        ? "bg-blue-500/20 text-blue-400"
                                        : "bg-green-500/20 text-green-400"
                                    } border border-white/10`}>
                                      {getInitial(u.name)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-white truncate">{u.name}</span>
                                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${getRoleBadge(u.role)}`}>
                                          {u.role}
                                        </span>
                                      </div>
                                      {u.registrationNumber && (
                                        <p className="text-[10px] text-neutral-500 mt-0.5">ID: {u.registrationNumber}</p>
                                      )}
                                    </div>
                                    <MessageSquare size={13} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                  </button>
                                ))}
                              </div>
                            ) : selectedDept && !loadingDeptUsers ? (
                              <p className="text-xs text-neutral-500 text-center py-4">No members found in this department</p>
                            ) : null}
                          </div>
                        )}

                        {!selectedCollege && (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Building2 size={24} className="text-neutral-600 mb-2" />
                            <p className="text-xs text-neutral-500">Select a college to browse its structure</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* === RECENT TAB === */}
                {activeTab === "recent" && (
                  <div>
                    {recentContacts.length > 0 ? (
                      <div className="space-y-1">
                        {recentContacts.map((contact) => (
                          <button
                            key={contact._id}
                            onClick={() => handleSelectUser(contact)}
                            className="w-full text-left p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all group flex items-center gap-3"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/10 flex items-center justify-center text-sm font-bold text-white shrink-0">
                              {getInitial(contact.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="text-sm font-medium text-white truncate">{contact.name}</h4>
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getRoleBadge(contact.role)}`}>
                                  {contact.role}
                                </span>
                              </div>
                              {contact.department && (
                                <p className="text-xs text-neutral-500">{contact.department}</p>
                              )}
                              {contact.lastMessageAt && (
                                <p className="text-[10px] text-neutral-600 mt-0.5">
                                  Last message: {new Date(contact.lastMessageAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <MessageSquare size={14} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Clock size={24} className="text-neutral-600 mb-2" />
                        <p className="text-xs text-neutral-500">No recent contacts yet</p>
                        <p className="text-[10px] text-neutral-600 mt-1">Start a conversation to see contacts here</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer tip */}
              <div className="p-3 border-t border-white/5 bg-white/[0.01]">
                <p className="text-[10px] text-neutral-600 text-center">
                  Select a person to start a private conversation
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
