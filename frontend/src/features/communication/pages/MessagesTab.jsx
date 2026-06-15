import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Paperclip, Send,
  FileText, Image as ImageIcon, MessageSquareOff, ChevronLeft,
  Plus
} from "lucide-react";
import { io } from "socket.io-client";
import messageService from "../../../services/messageService";
import { useToast } from "../../../components/ui/ToastContext";
import NewConversationModal from "./NewConversationModal";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("userInfo") || localStorage.getItem("user")) || { _id: "local_user", name: "Current User" };
  } catch { return { _id: "local_user", name: "Current User" }; }
};

export default function MessagesTab() {
  const { showToast } = useToast();
  const [currentUser] = useState(getStoredUser());
  const [conversations, setConversations] = useState([]);
  const [rawConversations, setRawConversations] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [showNewConv, setShowNewConv] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const socketRef = useRef(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const activeContactRef = useRef(activeContact);
  const conversationsRef = useRef(conversations);

  useEffect(() => { activeContactRef.current = activeContact; }, [activeContact]);
  useEffect(() => { conversationsRef.current = conversations; }, [conversations]);

  useEffect(() => {
    const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace('/api', '');
    const token = localStorage.getItem("token");

    socketRef.current = io(API_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current.on("connect", () => {
      fetchConvos();
    });

    socketRef.current.on("connect_error", (err) => {
      console.warn("[Socket] Connection error:", err.message);
    });

    const senderNameFromConvos = (senderId) => {
      if (!senderId || !conversationsRef.current) return "Someone";
      const found = conversationsRef.current.find(c => c._id === senderId);
      return found?.name || "Someone";
    };

    socketRef.current.on("newMessage", (newMsg) => {
      const senderId = newMsg.senderId?._id || newMsg.senderId;
      const isActive = activeContactRef.current && activeContactRef.current._id === senderId;
      if (isActive) {
        setMessages((prev) => {
          const exists = prev.some(m => m._id === newMsg._id);
          if (exists) return prev;
          return [...prev, newMsg];
        });
        scrollToBottom();
      } else {
        const senderName = newMsg.senderId?.name || senderNameFromConvos(senderId);
        showToast(`New message from ${senderName}`, "info");
      }
      fetchConvos();
    });

    socketRef.current.on("message:new", (data) => {
      const msg = data?.message;
      if (!msg) return;
      const senderId = msg.senderId?._id || msg.senderId;
      const isActive = activeContactRef.current && activeContactRef.current._id === senderId;
      if (isActive) {
        setMessages((prev) => {
          const exists = prev.some(m => m._id === msg._id);
          if (exists) return prev;
          return [...prev, msg];
        });
        scrollToBottom();
      } else {
        const senderName = msg.senderId?.name || senderNameFromConvos(senderId);
        showToast(`New message from ${senderName}`, "info");
      }
      fetchConvos();
    });

    socketRef.current.on("message:new", (data) => {
      const msg = data?.message;
      if (!msg) return;
      const isActive = activeContactRef.current && activeContactRef.current._id === msg.senderId;
      if (isActive) {
        setMessages((prev) => {
          const exists = prev.some(m => m._id === msg._id);
          if (exists) return prev;
          return [...prev, msg];
        });
        scrollToBottom();
      } else {
        const senderName = msg.senderId?.name || msg.senderName || "Someone";
        showToast(`New message from ${senderName}`, "info");
      }
      fetchConvos();
    });

    socketRef.current.on("unread:updated", () => {
      fetchConvos();
    });

    return () => socketRef.current?.disconnect();
  }, [currentUser]);

  const fetchConvos = async () => {
    setIsLoadingChats(true);
    try {
      const data = await messageService.getConversations();
      const convList = Array.isArray(data) ? data : data?.data || data?.conversations || [];
      setRawConversations(convList);
      const mapped = convList.map(conv => {
        const otherUser = conv.participants?.find(p => p._id !== (currentUser._id || currentUser.id)) || conv.participants?.[0] || {};
        return {
          _id: otherUser._id,
          name: otherUser.name || "Unknown",
          initial: (otherUser.name || "U").charAt(0).toUpperCase(),
          role: otherUser.role || "User",
          time: new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          message: conv.lastMessage?.content || "Tap to view conversation...",
          unread: false,
          status: 'online',
        };
      });
      setConversations(mapped);
    } catch {
      setConversations([]);
    } finally {
      setIsLoadingChats(false);
    }
  };

  useEffect(() => { fetchConvos(); }, []);

  useEffect(() => {
    if (activeContact && activeContact._id) {
      messageService.getMessages(activeContact._id)
        .then(data => { setMessages(Array.isArray(data) ? data : []); scrollToBottom(); })
        .catch(() => { setMessages([]); showToast("Failed to sync chat history.", "error"); });
    } else { setMessages([]); }
  }, [activeContact]);

  const scrollToBottom = () => {
    setTimeout(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, 50);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    const myId = currentUser._id || currentUser.id;
    const tempId = Date.now().toString();
    const optimisticMsg = { _id: tempId, senderId: myId, content: inputText, createdAt: new Date().toISOString(), isOptimistic: true };
    setMessages(prev => [...prev, optimisticMsg]);
    setInputText("");
    scrollToBottom();
    try {
      if (activeContact && activeContact._id) {
        const sent = await messageService.sendMessage(activeContact._id, optimisticMsg.content);
        // Replace optimistic message with real one
        if (sent && sent._id) {
          setMessages(prev => prev.map(m => m._id === tempId ? sent : m));
        }
        fetchConvos();
      }
    } catch { showToast("Message failed to sync", "error"); }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeContact) return;
    try {
      await messageService.sendMessage(activeContact._id, "", file);
      showToast("File sent successfully", "success");
    } catch { showToast("File upload failed", "error"); }
  };

  const handleNewConversation = (result) => {
    if (!result) return;
    const partner = result.participants?.find(
      (p) => p._id !== (currentUser._id || currentUser.id)
    ) || result.participants?.[0] || result.lecturer || result.student || {};

    setActiveContact({
      _id: partner._id || result._id,
      name: partner.name || 'Unknown',
      initial: (partner.name || 'U').charAt(0).toUpperCase(),
      role: partner.role || 'User',
      time: 'Now',
      message: result.lastMessage?.content || 'Start a conversation...',
      unread: false,
      status: 'online',
    });
    fetchConvos();
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    return conv.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden relative">
      {/* LEFT PANEL */}
      <div className={`w-full md:w-[340px] lg:w-[380px] border-r border-white/5 flex flex-col bg-white/[0.02] backdrop-blur-xl shrink-0 z-10 lg:max-w-[380px] ${activeContact ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 sm:p-5 border-b border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Messages</h2>
            <button
              onClick={() => setShowNewConv(true)}
              className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 transition-all"
              title="New Message"
            >
              <Plus size={15} />
            </button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-white/[0.02] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {isLoadingChats ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center mb-4">
                <MessageSquareOff size={24} className="text-neutral-500" />
              </div>
              <p className="text-sm font-medium text-white mb-1">No conversations yet</p>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Click <span className="text-blue-400 font-medium">+</span> to find someone and start messaging.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredConversations.map((contact) => (
                <motion.button
                  key={contact._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setActiveContact(contact)}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                    activeContact?._id === contact._id
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'bg-transparent border-transparent hover:bg-white/[0.02] hover:border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 border ${
                      activeContact?._id === contact._id
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-white border-white/10'
                    }`}>
                      {contact.initial}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="text-sm font-medium text-white truncate">{contact.name}</h3>
                        <span className="text-[10px] text-neutral-500 ml-2 shrink-0">{contact.time}</span>
                      </div>
                      <p className="text-xs text-neutral-500 truncate">{contact.message}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* MIDDLE PANEL */}
      <div className={`flex-1 flex flex-col relative z-0 bg-transparent ${!activeContact ? 'hidden md:flex md:items-center md:justify-center' : 'flex'}`}>
        <AnimatePresence mode="wait">
          {!activeContact ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="hidden md:flex flex-col items-center justify-center"
            >
              <div className="w-20 h-20 bg-white/[0.02] border border-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl mb-5">
                <MessageSquareOff size={32} className="text-neutral-500" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-1">Messages</h2>
              <p className="text-xs text-neutral-500 max-w-[240px] text-center">
                Select a conversation to start chatting
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={activeContact._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col h-full"
            >
              {/* Chat Header */}
              <div className="h-16 border-b border-white/5 px-4 sm:px-5 flex items-center gap-3 shrink-0 bg-white/[0.02] backdrop-blur-xl">
                <button
                  onClick={() => setActiveContact(null)}
                  className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {activeContact?.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold text-white truncate">{activeContact?.name}</h2>
                  <p className="text-[10px] text-neutral-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    {activeContact?.role || "User"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-3 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                    <MessageSquareOff size={20} className="text-neutral-500 mb-2" />
                    <p className="text-xs text-neutral-500">No messages yet. Send a message to start the conversation.</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, idx) => {
                      const isMe = msg.senderId === (currentUser.id || currentUser._id);
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: isMe ? 20 : -20, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${isMe ? 'ml-auto' : 'mr-auto'} group`}
                        >
                          {msg.content && (
                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed border ${
                              isMe
                                ? 'bg-blue-500/20 text-white border-blue-500/30 rounded-br-[4px]'
                                : 'bg-white/[0.02] text-white border-white/10 rounded-bl-[4px]'
                            }`}>
                              {msg.content}
                            </div>
                          )}
                          {(msg.isFile || msg.file) && (
                            <div className={`mt-2 p-3 rounded-xl border flex items-center gap-3 cursor-pointer hover:bg-white/[0.04] transition-all ${
                              isMe
                                ? 'bg-blue-500/20 border-blue-500/30 rounded-br-[4px]'
                                : 'bg-white/[0.02] border-white/10 rounded-bl-[4px]'
                            }`}>
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                isMe ? 'bg-blue-500/30 text-blue-300' : 'bg-white/5 text-neutral-400'
                              }`}>
                                {msg.file?.mimeType?.startsWith('image/') ? <ImageIcon size={18} /> : <FileText size={18} />}
                              </div>
                              <div className="min-w-0 pr-2">
                                <p className="text-sm font-medium text-white truncate">{msg.file?.name || "Attached file"}</p>
                                <p className="text-[10px] text-neutral-500">{msg.file?.size ? `${Math.round(msg.file.size/1000)} KB` : 'File'}</p>
                              </div>
                            </div>
                          )}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-neutral-500 mt-1 px-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </motion.div>
                      );
                    })}
                    <div ref={scrollRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="px-4 sm:px-5 py-3 border-t border-white/5 bg-white/[0.02] backdrop-blur-xl">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.docx,.pptx"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/5 transition-all shrink-0"
                  >
                    <Paperclip size={16} />
                  </button>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(e)}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 bg-white/[0.02] border border-white/10 rounded-lg text-white text-sm py-2 px-3 focus:outline-none focus:border-blue-500/50 transition-all resize-none max-h-32 min-h-[38px] custom-scrollbar placeholder:text-neutral-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="w-9 h-9 bg-blue-500 text-white rounded-lg flex items-center justify-center disabled:opacity-30 transition-all hover:bg-blue-400 active:scale-90 shrink-0"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={showNewConv}
        onClose={() => setShowNewConv(false)}
        onSelect={handleNewConversation}
        conversations={rawConversations}
      />
    </div>
  );
}
