import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Send, Search, Paperclip, ChevronLeft,
  Check, CheckCheck, Clock, Loader2, FileText, Image as ImageIcon,
  X, User, GraduationCap, School, CalendarDays, Plus,
  UserPlus, AlertCircle, Download, Megaphone, HelpCircle
} from "lucide-react";
import messagingService from "../../../../../services/messagingService";
import { getSocket, emitTyping, emitRead, joinThread, leaveThread } from "../../../../../features/communication/services/communicationSocket";
import { GlassCard } from "../../../../../components/shared";
import toast from "react-hot-toast";
import LecturerBroadcastTab from "./LecturerBroadcastTab";
import LecturerQATab from "./LecturerQATab";

const formatTimeAgo = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
};

const formatMessageTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function LecturerMessages() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const [sending, setSending] = useState(false);

  const [showNewConv, setShowNewConv] = useState(false);
  const [regNo, setRegNo] = useState("");
  const [searchingStudent, setSearchingStudent] = useState(false);
  const [foundStudent, setFoundStudent] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [activeTab, setActiveTab] = useState("messages");

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const activeConvRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => { activeConvRef.current = activeConv; }, [activeConv]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, []);

  const fetchConversations = useCallback(async () => {
    setLoadingChats(true);
    try {
      const data = await messagingService.getConversations();
      const list = Array.isArray(data) ? data : data?.data || data?.conversations || [];
      setConversations(list);
    } catch {
      setConversations([]);
    } finally {
      setLoadingChats(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const sock = getSocket();
    if (!sock) return;

    const handleNewMessage = (data) => {
      const newMsg = data?.message || data;
      const threadId = data?.threadId || newMsg?.threadId || newMsg?.conversationId;
      if (activeConvRef.current?._id === threadId) {
        setMessages((prev) => [...prev, newMsg]);
        scrollToBottom();
        emitRead(threadId, [newMsg._id]);
      }
      fetchConversations();
    };

    const handleReadReceipt = (data) => {
      setMessages((prev) => prev.map((m) =>
        data.messageIds?.includes(m._id) ? { ...m, read: true, status: 'read' } : m
      ));
    };

    const handleTyping = (data) => {
      if (data.threadId === activeConvRef.current?._id) {
        setTypingUsers((prev) => ({
          ...prev,
          [data.threadId]: { userId: data.userId, isTyping: data.isTyping }
        }));
      }
    };

    const handleUnreadUpdate = () => {
      fetchConversations();
    };

    sock.on('message:new', handleNewMessage);
    sock.on('message:read', handleReadReceipt);
    sock.on('thread:typing', handleTyping);
    sock.on('unread:updated', handleUnreadUpdate);

    return () => {
      sock.off('message:new', handleNewMessage);
      sock.off('message:read', handleReadReceipt);
      sock.off('thread:typing', handleTyping);
      sock.off('unread:updated', handleUnreadUpdate);
    };
  }, []);

  useEffect(() => {
    if (activeConv?._id) {
      joinThread(activeConv._id);
      setLoadingMessages(true);
      setMessages([]);
      messagingService.getMessages(activeConv._id)
        .then((data) => {
          const list = Array.isArray(data) ? data : data?.data || data?.messages || [];
          setMessages(list);
          scrollToBottom();
          messagingService.markAsRead(activeConv._id).catch(() => {});
        })
        .catch(() => {
          setMessages([]);
          toast.error("Failed to load messages");
        })
        .finally(() => setLoadingMessages(false));
      return () => leaveThread(activeConv._id);
    }
  }, [activeConv?._id]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeConv || sending) return;

    const optimisticId = `opt-${Date.now()}`;
    const optimisticMsg = {
      _id: optimisticId,
      conversationId: activeConv._id,
      content: inputText.trim(),
      createdAt: new Date().toISOString(),
      status: 'sending',
      senderRole: 'lecturer',
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText("");
    setSending(true);
    scrollToBottom();

    try {
      const formData = new FormData();
      formData.append('threadId', activeConv._id);
      formData.append('content', optimisticMsg.content);
      formData.append('senderRole', 'lecturer');
      const sent = await messagingService.sendMessage(formData);
      setMessages((prev) =>
        prev.map((m) => m._id === optimisticId ? { ...sent, status: 'sent' } : m)
      );
      fetchConversations();
    } catch {
      setMessages((prev) =>
        prev.map((m) => m._id === optimisticId ? { ...m, status: 'failed' } : m)
      );
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (activeConv) {
      emitTyping(activeConv._id, true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        emitTyping(activeConv._id, false);
      }, 1500);
    }
  };

  const handleFileSend = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeConv) return;

    const formData = new FormData();
    formData.append('threadId', activeConv._id);
    formData.append('senderRole', 'lecturer');
    formData.append('file', file);

    try {
      const sent = await messagingService.sendMessage(formData);
      setMessages((prev) => [...prev, { ...sent, status: "sent" }]);
      toast.success("File sent");
      fetchConversations();
      scrollToBottom();
    } catch {
      toast.error("File upload failed");
    }
  };

  const handleSearchStudent = async () => {
    if (!regNo.trim()) return;
    setSearchingStudent(true);
    setSearchError("");
    setFoundStudent(null);
    try {
      const data = await messagingService.searchStudent(regNo.trim());
      const student = data?.data || data?.student || data;
      if (student && student._id) {
        setFoundStudent(student);
      } else {
        setSearchError("Student not found. Check the registration number.");
      }
    } catch {
      setSearchError("Failed to search. Please try again.");
    } finally {
      setSearchingStudent(false);
    }
  };

  const startConversationWithStudent = async (student) => {
    const existing = conversations.find(
      (c) => c.student?._id === student._id || c.participants?.some((p) => p._id === student._id)
    );
    if (existing) {
      setActiveConv(existing);
      setShowNewConv(false);
      setRegNo("");
      setFoundStudent(null);
      return;
    }
    try {
      const conv = await messagingService.createConversation({
        participantId: student._id,
        participantRole: 'student',
        type: 'direct',
      });
      const newConv = conv?.data || conv;
      setActiveConv(newConv);
      setShowNewConv(false);
      setRegNo("");
      setFoundStudent(null);
      fetchConversations();
    } catch {
      toast.error("Failed to create conversation");
    }
  };

  const getConversationPartner = (conv) => {
    if (conv.student) return conv.student;
    if (conv.participants) {
      return conv.participants.find((p) => p.role === 'student') || conv.participants[0];
    }
    return conv.otherUser || {};
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const partner = getConversationPartner(conv);
    const name = (partner.name || partner.firstName || '').toLowerCase();
    const reg = (partner.registrationNumber || '').toLowerCase();
    return name.includes(q) || reg.includes(q);
  });

  const unreadCount = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-3 md:gap-4 pb-4 overflow-hidden">
      <div className={`w-full md:w-[340px] lg:w-[380px] shrink-0 flex flex-col gap-3 ${activeConv && activeTab === 'messages' ? 'hidden md:flex' : 'flex'}`}>
        <GlassCard padding="p-4" className="shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">Messages</h2>
              <p className="text-xs text-muted-foreground">
                {activeTab === "messages" ? (unreadCount > 0 ? `${unreadCount} unread` : "No unread messages")
                  : activeTab === "broadcast" ? "Broadcast history"
                  : "Student questions"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => { setActiveTab("messages"); setActiveConv(null); }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${activeTab === "messages" ? "bg-blue-500/20 text-blue-400" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
                title="Private Messages">
                <MessageSquare size={15} />
              </button>
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setShowDropdown((prev) => !prev)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                  title="More">
                  <Megaphone size={15} />
                </button>
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-1 w-44 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50"
                    >
                      <button onClick={() => { setActiveTab("broadcast"); setActiveConv(null); setShowDropdown(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${activeTab === "broadcast" ? "bg-blue-500/10 text-blue-400" : "text-foreground hover:bg-accent"}`}>
                        <Megaphone size={15} />
                        <span>Broadcast</span>
                      </button>
                      <button onClick={() => { setActiveTab("qa"); setActiveConv(null); setShowDropdown(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${activeTab === "qa" ? "bg-blue-500/10 text-blue-400" : "text-foreground hover:bg-accent"}`}>
                        <HelpCircle size={15} />
                        <span>Q&A</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {activeTab === "messages" && (
                <button onClick={() => { setShowNewConv(true); setRegNo(""); setFoundStudent(null); setSearchError(""); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-500/20 transition-all" title="New Conversation">
                  <Plus size={15} />
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or reg no..."
              className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500/40 transition-all"
            />
          </div>
        </GlassCard>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
          {loadingChats ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-blue-500" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                <MessageSquare size={24} className="text-blue-400" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No conversations yet</p>
              <p className="text-xs text-muted-foreground max-w-[220px] sm:max-w-full">
                Search for a student using a registration number to start a conversation.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredConversations.map((conv) => {
                const partner = getConversationPartner(conv);
                const name = partner.name || partner.firstName || "Unknown";
                const initial = name.charAt(0).toUpperCase();
                const lastMsg = conv.lastMessage || conv.lastMessageContent;
                const lastTime = conv.updatedAt || conv.lastMessageAt;
                const unread = conv.unreadCount || 0;

                return (
                  <motion.button
                    key={conv._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setActiveConv(conv)}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group relative ${
                      activeConv?._id === conv._id
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : 'bg-black/20 border-white/[0.06] hover:bg-white/[0.04] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                        activeConv?._id === conv._id
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-foreground border border-white/10'
                      }`}>
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h3 className="text-sm font-medium text-foreground truncate">{name}</h3>
                          <span className="text-[10px] text-muted-foreground ml-2 shrink-0">
                            {formatTimeAgo(lastTime)}
                          </span>
                        </div>
                        <p className={`text-xs truncate ${unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                          {typeof lastMsg === 'string' ? lastMsg : lastMsg?.content || 'Tap to view conversation'}
                        </p>
                      </div>
                      {unread > 0 && (
                        <div className="shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white">{unread}</span>
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      <div className={`flex-1 flex flex-col ${activeTab !== 'messages' ? 'flex' : (!activeConv && !showNewConv ? 'hidden md:flex' : 'flex')}`}>
        {activeTab === "broadcast" ? (
          <div className="h-full overflow-y-auto custom-scrollbar">
            <LecturerBroadcastTab />
          </div>
        ) : activeTab === "qa" ? (
          <div className="h-full overflow-y-auto custom-scrollbar">
            <LecturerQATab />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {!activeConv && !showNewConv ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center"
              >
                <GlassCard padding="p-8" className="text-center max-w-sm" hover={false}>
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-5">
                    <MessageSquare size={28} className="text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Lecturer Messages</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Select a conversation from the sidebar, or click <span className="text-blue-400 font-medium">New</span> to search for a student by registration number.
                  </p>
                </GlassCard>
              </motion.div>
            ) : showNewConv ? (
              <motion.div
                key="new-conv"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col"
              >
                <GlassCard padding="p-6" className="flex-1" hover={false}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-foreground">New Conversation</h3>
                    <button
                      onClick={() => setShowNewConv(false)}
                      className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="max-w-md mx-auto space-y-6 overflow-y-auto">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Student Registration Number
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={regNo}
                          onChange={(e) => setRegNo(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearchStudent()}
                          placeholder="e.g. 2024001"
                          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500/40 transition-all"
                        />
                        <button
                          onClick={handleSearchStudent}
                          disabled={!regNo.trim() || searchingStudent}
                          className="px-4 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-400 transition-all disabled:opacity-30 flex items-center gap-2"
                        >
                          {searchingStudent ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Search size={14} />
                          )}
                          Search
                        </button>
                      </div>
                      {searchError && (
                        <p className="flex items-center gap-1.5 text-xs text-red-400 mt-2">
                          <AlertCircle size={12} />
                          {searchError}
                        </p>
                      )}
                    </div>

                    {foundStudent && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-lg font-bold text-foreground">
                            {(foundStudent.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-base font-semibold text-foreground">{foundStudent.name}</h4>
                            <p className="text-xs text-muted-foreground">Student</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-black/20 rounded-lg p-2">
                            <GraduationCap size={12} />
                            <span className="truncate">{foundStudent.department || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-black/20 rounded-lg p-2">
                            <School size={12} />
                            <span className="truncate">{foundStudent.registrationNumber || regNo}</span>
                          </div>
                        </div>
                        {foundStudent.academicYear && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-black/20 rounded-lg p-2">
                            <CalendarDays size={12} />
                            <span>Academic Year: {foundStudent.academicYear}</span>
                          </div>
                        )}
                        <button
                          onClick={() => startConversationWithStudent(foundStudent)}
                          className="w-full py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                        >
                          <MessageSquare size={14} />
                          Start Conversation
                        </button>
                      </motion.div>
                    )}

                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        Enter the student's registration number to find them and start messaging.
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div
                key={activeConv._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col h-full"
              >
                <GlassCard padding="p-3 px-4" className="shrink-0" hover={false}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveConv(null)}
                        className="md:hidden w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      {(() => {
                        const partner = getConversationPartner(activeConv);
                        const name = partner.name || partner.firstName || "Unknown";
                        const initial = name.charAt(0).toUpperCase();
                        return (
                          <>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center text-sm font-bold text-foreground shrink-0">
                              {initial}
                            </div>
                            <div>
                              <h2 className="text-sm font-semibold text-foreground">{name}</h2>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                                {partner.registrationNumber
                                  ? `${partner.department || 'Student'}`
                                  : 'Student'}
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </GlassCard>

                <div className="flex-1 overflow-y-auto custom-scrollbar py-4 px-2 sm:px-3 space-y-3">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 size={20} className="animate-spin text-blue-500" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <MessageSquare size={20} className="text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground">No messages yet. Send a message to start the conversation.</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg) => {
                        const isMe = msg.senderRole === 'lecturer';
                        const status = msg.status || msg.readState;
                        return (
                          <motion.div
                            key={msg._id}
                            initial={{ opacity: 0, x: isMe ? 20 : -20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${isMe ? 'ml-auto' : 'mr-auto'} group`}
                          >
                            {msg.file?.url || msg.attachmentUrl ? (
                              <div className={`p-3 rounded-xl border flex items-center gap-3 hover:bg-accent transition-all ${
                                isMe
                                  ? 'bg-blue-500/20 border-blue-500/30 rounded-br-[4px]'
                                  : 'bg-black/40 border-white/10 rounded-bl-[4px]'
                              }`}>
                                <div onClick={() => window.open(msg.file?.url || msg.attachmentUrl, '_blank')} className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                    isMe ? 'bg-blue-500/30 text-blue-300' : 'bg-white/10 text-muted-foreground'
                                  }`}>
                                    {msg.file?.mimeType?.startsWith('image/') || msg.attachmentUrl?.match(/\.(png|jpg|jpeg|gif|webp)/i)
                                      ? <ImageIcon size={18} />
                                      : <FileText size={18} />
                                    }
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                      {msg.file?.name || msg.attachmentUrl?.split('/').pop() || "Attachment"}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {msg.file?.size ? `${Math.round(msg.file.size / 1000)} KB` : 'Tap to open'}
                                    </p>
                                  </div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); const a = document.createElement('a'); a.href = msg.file?.url || msg.attachmentUrl; a.download = msg.file?.name || 'file'; a.click(); }} className={`p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0 ${isMe ? 'text-blue-300' : 'text-muted-foreground'}`} title="Download">
                                  <Download size={16} />
                                </button>
                              </div>
                            ) : (
                              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed border ${
                                isMe
                                  ? 'bg-blue-500/20 text-foreground border-blue-500/30 rounded-br-[4px]'
                                  : 'bg-black/40 text-foreground border-white/10 rounded-bl-[4px]'
                              }`}>
                                {msg.content}
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[10px] text-muted-foreground">
                                {formatMessageTime(msg.createdAt)}
                              </span>
                              {isMe && (
                                <span className="text-[10px]">
                                  {status === 'sending' ? (
                                    <Clock size={10} className="text-muted-foreground" />
                                  ) : status === 'read' || msg.read ? (
                                    <CheckCheck size={10} className="text-blue-400" />
                                  ) : status === 'failed' ? (
                                    <X size={10} className="text-red-400" />
                                  ) : (
                                    <Check size={10} className="text-muted-foreground" />
                                  )}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                      {typingUsers[activeConv._id]?.isTyping && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2 text-xs text-muted-foreground px-1"
                        >
                          <span className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                          </span>
                          Typing...
                        </motion.div>
                      )}
                      <div ref={scrollRef} />
                    </>
                  )}
                </div>

                <GlassCard padding="p-3" className="shrink-0" hover={false}>
                  <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileSend}
                      accept="image/*,.pdf,.docx,.pptx"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all shrink-0"
                    >
                      <Paperclip size={16} />
                    </button>
                    <textarea
                      value={inputText}
                      onChange={handleInputChange}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(e)}
                      placeholder="Type a message..."
                      rows={1}
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg text-foreground text-sm py-2 px-3 focus:outline-none focus:border-blue-500/40 transition-all resize-none max-h-32 min-h-[38px] custom-scrollbar placeholder:text-muted-foreground"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim() || sending}
                      className="w-9 h-9 bg-blue-500 text-white rounded-lg flex items-center justify-center disabled:opacity-30 transition-all hover:bg-blue-400 active:scale-90 shrink-0"
                    >
                      {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    </button>
                  </form>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
