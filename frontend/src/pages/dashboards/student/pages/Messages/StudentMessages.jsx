import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Send, Search, Paperclip, ChevronLeft,
  User, BookOpen, Clock, Check, CheckCheck,
  Loader2, FileText, Image as ImageIcon, X,
  GraduationCap, School, CalendarDays, Download,
  Bell, HelpCircle, Users, Pencil, Trash2, Archive, MoreVertical, Rss
} from "lucide-react";
import messagingService from "../../../../../services/messagingService";
import { getSocket, emitTyping, emitRead, joinThread, leaveThread } from "../../../../../features/communication/services/communicationSocket";
import { GlassCard } from "../../../../../components/shared";
import { useAuth } from "../../../../../context/AuthContext";
import toast from "react-hot-toast";
import StudentFeedTab from "./StudentFeedTab";
import StudentQATab from "./StudentQATab";

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

export default function StudentMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [myLecturers, setMyLecturers] = useState([]);
  const [myClassmates, setMyClassmates] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showLecturers, setShowLecturers] = useState(false);
  const [showClassmates, setShowClassmates] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const [sending, setSending] = useState(false);
  const [editingMsg, setEditingMsg] = useState(null);
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

  const fetchMyLecturers = useCallback(async () => {
    try {
      const data = await messagingService.getMyLecturers();
      setMyLecturers(Array.isArray(data) ? data : data?.data || data?.lecturers || []);
    } catch {
      setMyLecturers([]);
    }
  }, []);

  const fetchMyClassmates = useCallback(async () => {
    try {
      const data = await messagingService.getMyClassmates();
      setMyClassmates(Array.isArray(data) ? data : data?.data || []);
    } catch {
      setMyClassmates([]);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchMyLecturers();
    fetchMyClassmates();
  }, []);

  useEffect(() => {
    const sock = getSocket();
    if (!sock) return;

    const handleNewMessage = (data) => {
      const newMsg = data?.message || data;
      const threadId = data?.threadId || newMsg?.threadId || newMsg?.conversationId;
      if (activeConvRef.current?._id === threadId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
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

    const handleMessageUpdated = (data) => {
      const updated = data?.message || data;
      setMessages((prev) => prev.map((m) => m._id === updated._id ? { ...m, ...updated } : m));
    };

    const handleMessageDeleted = (data) => {
      const deletedId = data?.messageId || data?._id;
      if (deletedId) {
        setMessages((prev) => prev.filter((m) => m._id !== deletedId));
      }
    };

    sock.on('message:new', handleNewMessage);
    sock.on('message:read', handleReadReceipt);
    sock.on('thread:typing', handleTyping);
    sock.on('unread:updated', handleUnreadUpdate);
    sock.on('message:updated', handleMessageUpdated);
    sock.on('message:deleted', handleMessageDeleted);

    return () => {
      sock.off('message:new', handleNewMessage);
      sock.off('message:read', handleReadReceipt);
      sock.off('thread:typing', handleTyping);
      sock.off('unread:updated', handleUnreadUpdate);
      sock.off('message:updated', handleMessageUpdated);
      sock.off('message:deleted', handleMessageDeleted);
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
    const content = inputText.trim();

    if (editingMsg) {
      setSending(true);
      try {
        const updated = await messagingService.editMessage(editingMsg, content);
        setMessages((prev) => prev.map((m) => m._id === editingMsg ? { ...m, ...updated } : m));
        setEditingMsg(null);
        setInputText("");
        fetchConversations();
      } catch {
        toast.error("Failed to edit message");
      } finally {
        setSending(false);
      }
      return;
    }

    const optimisticId = `opt-${Date.now()}`;
    const optimisticMsg = {
      _id: optimisticId,
      conversationId: activeConv._id,
      content,
      createdAt: new Date().toISOString(),
      status: 'sending',
      senderRole: 'student',
      senderId: { _id: user?.id, role: 'student' },
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText("");
    setSending(true);
    scrollToBottom();

    try {
      const formData = new FormData();
      formData.append('threadId', activeConv._id);
      formData.append('content', content);
      formData.append('senderRole', 'student');
      const sent = await messagingService.sendMessage(formData);
      setMessages((prev) => {
        if (prev.some((m) => m._id === sent._id)) {
          return prev.filter((m) => m._id !== optimisticId);
        }
        return prev.map((m) => m._id === optimisticId ? { ...sent, status: 'sent' } : m);
      });
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
    formData.append('senderRole', 'student');
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

  const startConversationWithLecturer = async (lecturer) => {
    const existing = conversations.find(
      (c) => c.lecturer?._id === lecturer._id || c.participants?.some((p) => p._id === lecturer._id)
    );
    if (existing) {
      setActiveConv(existing);
      return;
    }
    try {
      const conv = await messagingService.createConversation({
        participantId: lecturer._id,
        participantRole: 'lecturer',
        type: 'direct',
      });
      setActiveConv(conv?.data || conv);
      setShowLecturers(false);
      fetchConversations();
    } catch {
      toast.error("Failed to create conversation");
    }
  };

  const startConversationWithClassmate = async (classmate) => {
    const existing = conversations.find(
      (c) => c.participants?.some((p) => p._id === classmate._id)
    );
    if (existing) {
      setActiveConv(existing);
      return;
    }
    try {
      const conv = await messagingService.createConversation({
        participantId: classmate._id,
        participantRole: 'student',
        type: 'direct',
      });
      setActiveConv(conv?.data || conv);
      setShowClassmates(false);
      fetchConversations();
    } catch {
      toast.error("Failed to create conversation");
    }
  };

  const getConversationPartner = (conv) => {
    if (conv.lecturer) return conv.lecturer;
    if (conv.participants) {
      const currentId = user?.id || user?._id;
      if (!currentId) return conv.participants[0];
      return conv.participants.find((p) => p._id?.toString() !== currentId.toString()) || conv.participants[0];
    }
    return conv.otherUser || {};
  };

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [dropdownConv, setDropdownConv] = useState(null);
  const [dropdownMsg, setDropdownMsg] = useState(null);

  const handleEditMessage = (msg) => {
    setInputText(msg.content);
    setEditingMsg(msg._id);
  };

  const handleCancelEdit = () => {
    setEditingMsg(null);
    setInputText("");
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await messagingService.deleteMessage(msgId);
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
      setConfirmDelete(null);
      toast.success("Message deleted");
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const handleArchiveConversation = async (convId) => {
    try {
      await messagingService.archiveConversation(convId, true);
      setConversations((prev) => prev.filter((c) => c._id !== convId));
      if (activeConv?._id === convId) setActiveConv(null);
      toast.success("Conversation archived");
    } catch {
      toast.error("Failed to archive conversation");
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const partner = getConversationPartner(conv);
    const name = (partner.name || partner.firstName || '').toLowerCase();
    return name.includes(q);
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
                  : activeTab === "feed" ? "Class announcements"
                  : "My questions"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => { setActiveTab("messages"); setActiveConv(null); }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${activeTab === "messages" ? "bg-blue-500/20 text-blue-400" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
                title="Private Messages">
                <MessageSquare size={15} />
              </button>
              {activeTab === "messages" && (
                <>
                  <button onClick={() => setShowLecturers(!showLecturers)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-500/20 transition-all" title="My Lecturers">
                    <GraduationCap size={15} />
                  </button>
                  <button onClick={() => setShowClassmates(!showClassmates)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-all" title="Classmates">
                    <School size={15} />
                  </button>
                </>
              )}
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setShowDropdown((prev) => !prev)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                  title="More">
                  <MoreVertical size={15} />
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
                      <button onClick={() => { setActiveTab("feed"); setActiveConv(null); setShowDropdown(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${activeTab === "feed" ? "bg-blue-500/10 text-blue-400" : "text-foreground hover:bg-accent"}`}>
                        <Rss size={15} />
                        <span>Feed</span>
                      </button>
                      <button onClick={() => { setActiveTab("qa"); setActiveConv(null); setShowDropdown(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${activeTab === "qa" ? "bg-blue-500/10 text-blue-400" : "text-foreground hover:bg-accent"}`}>
                        <HelpCircle size={15} />
                        <span>My Questions</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          {activeTab === "messages" && (
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500/40 transition-all"
              />
            </div>
          )}
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
                Select a lecturer or classmate to start messaging.
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

                const showConvMenu = dropdownConv === conv._id;
                return (
                  <motion.div
                    key={conv._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="relative group"
                  >
                    <button
                      onClick={() => { setActiveConv(conv); setDropdownConv(null); }}
                      className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                        activeConv?._id === conv._id
                          ? 'bg-blue-500/10 border-blue-500/30'
                          : 'bg-black/20 border-white/[0.06] hover:bg-white/[0.04] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                          activeConv?._id === conv._id
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-foreground border border-white/10'
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
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDropdownConv(dropdownConv === conv._id ? null : conv._id); }}
                      className="absolute top-3 right-2 w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                    >
                      <MoreVertical size={13} />
                    </button>
                    {showConvMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setDropdownConv(null)} />
                        <div className="absolute right-2 top-10 z-50 w-40 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                          <button
                            onClick={() => { handleArchiveConversation(conv._id); setDropdownConv(null); }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-foreground hover:bg-accent transition-colors"
                          >
                            <Trash2 size={13} className="text-red-400" />
                            Delete Chat
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        <AnimatePresence>
          {showLecturers && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute left-0 right-0 top-0 bottom-0 z-50 md:relative bg-background md:bg-transparent rounded-2xl flex flex-col"
            >
              <GlassCard padding="p-4" className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={16} className="text-blue-400" />
                    <h3 className="text-sm font-semibold text-foreground">My Lecturers</h3>
                  </div>
                  <button
                    onClick={() => setShowLecturers(false)}
                    className="w-7 h-7 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                  {myLecturers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <BookOpen size={20} className="text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground">No lecturers assigned to your courses yet.</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {myLecturers.map((lect, i) => (
                        <motion.button
                          key={lect._id || i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => startConversationWithLecturer(lect)}
                          className="w-full text-left p-3 rounded-xl bg-black/20 border border-white/[0.06] hover:bg-blue-500/10 hover:border-blue-500/30 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center text-sm font-bold text-foreground shrink-0">
                              {(lect.name || "U").charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-foreground truncate">{lect.name || "Unknown Lecturer"}</h3>
                              <p className="text-xs text-muted-foreground truncate">{lect.course || lect.courseName || "Course Lecturer"}</p>
                            </div>
                            <MessageSquare size={14} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </div>
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showClassmates && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute left-0 right-0 top-0 bottom-0 z-50 md:relative bg-background md:bg-transparent rounded-2xl flex flex-col"
            >
              <GlassCard padding="p-4" className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <School size={16} className="text-emerald-400" />
                    <h3 className="text-sm font-semibold text-foreground">Classmates</h3>
                  </div>
                  <button
                    onClick={() => setShowClassmates(false)}
                    className="w-7 h-7 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                  {myClassmates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Users size={20} className="text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground">No classmates found.</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {myClassmates.map((mate, i) => (
                        <motion.button
                          key={mate._id || i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => startConversationWithClassmate(mate)}
                          className="w-full text-left p-3 rounded-xl bg-black/20 border border-white/[0.06] hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center text-sm font-bold text-foreground shrink-0">
                              {(mate.name || "U").charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-foreground truncate">{mate.name || "Unknown"}</h3>
                              <p className="text-xs text-muted-foreground truncate">
                                {mate.role === 'class_rep' ? 'Class Representative' : 'Classmate'}
                              </p>
                            </div>
                            <MessageSquare size={14} className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </div>
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={`flex-1 flex flex-col ${activeTab !== 'messages' ? 'flex' : (!activeConv ? 'hidden md:flex' : 'flex')}`}>
        {activeTab === "feed" ? (
          <div className="h-full overflow-y-auto custom-scrollbar">
            <StudentFeedTab />
          </div>
        ) : activeTab === "qa" ? (
          <div className="h-full overflow-y-auto custom-scrollbar">
            <StudentQATab />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {!activeConv ? (
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
                  <h3 className="text-lg font-semibold text-foreground mb-2">Your Messages</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Select a conversation from the sidebar, or tap <span className="text-blue-400 font-medium">My Lecturers</span> or <span className="text-emerald-400 font-medium">Classmates</span> to start messaging.
                  </p>
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
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-sm font-bold text-foreground shrink-0">
                              {initial}
                            </div>
                            <div>
                              <h2 className="text-sm font-semibold text-foreground">{name}</h2>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                                {partner.role === 'lecturer' ? 'Lecturer' : partner.role === 'class_rep' ? 'Class Rep' : 'Classmate'}
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <button
                      onClick={() => handleArchiveConversation(activeConv._id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                      title="Archive conversation"
                    >
                      <Archive size={15} />
                    </button>
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
                        const senderId = msg.senderId?._id || msg.senderId;
                        const isMe = senderId?.toString() === user?.id?.toString();
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
                                {msg.edited && <span className="text-[10px] text-muted-foreground ml-1.5">(edited)</span>}
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {isMe && editingMsg !== msg._id && msg.messageType !== "system" && (
                                <div className="relative mr-1">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setDropdownMsg(dropdownMsg === msg._id ? null : msg._id); }}
                                    className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
                                  >
                                    <MoreVertical size={11} />
                                  </button>
                                  {dropdownMsg === msg._id && (
                                    <>
                                      <div className="fixed inset-0 z-40" onClick={() => setDropdownMsg(null)} />
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-50 w-28 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                                        <button
                                          onClick={() => { handleEditMessage(msg); setDropdownMsg(null); }}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-foreground hover:bg-accent transition-colors"
                                        >
                                          <Pencil size={11} />
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => { setConfirmDelete(msg._id); setDropdownMsg(null); }}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-red-400 hover:bg-red-500/10 transition-colors"
                                        >
                                          <Trash2 size={11} />
                                          Delete
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
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
                            {confirmDelete === msg._id && (
                              <div className="flex items-center gap-2 mt-1 px-1">
                                <span className="text-[10px] text-red-400">Delete this message?</span>
                                <button onClick={() => handleDeleteMessage(msg._id)} className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">Delete</button>
                                <button onClick={() => setConfirmDelete(null)} className="text-[10px] px-2 py-0.5 rounded bg-black/40 text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                              </div>
                            )}
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
                  {editingMsg && (
                    <div className="flex items-center justify-between px-1 pb-2 mb-2 border-b border-white/[0.06]">
                      <span className="text-xs text-blue-400 flex items-center gap-1.5">
                        <Pencil size={11} />
                        Editing message
                      </span>
                      <button onClick={handleCancelEdit} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                    </div>
                  )}
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
                      placeholder={editingMsg ? "Edit your message..." : "Type a message..."}
                      rows={1}
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg text-foreground text-sm py-2 px-3 focus:outline-none focus:border-blue-500/40 transition-all resize-none max-h-32 min-h-[38px] custom-scrollbar placeholder:text-muted-foreground"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim() || sending}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all active:scale-90 shrink-0 ${
                        editingMsg
                          ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                          : 'bg-blue-500 text-white hover:bg-blue-400'
                      }`}
                    >
                      {sending ? <Loader2 size={14} className="animate-spin" /> : editingMsg ? <Check size={14} /> : <Send size={14} />}
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
