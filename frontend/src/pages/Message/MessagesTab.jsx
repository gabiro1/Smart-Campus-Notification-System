import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone, Video, Search, Paperclip, Smile, Send, Zap,
  MoreVertical, FileText, Image as ImageIcon, Link as LinkIcon, MessageSquareOff, ChevronLeft,
  ShieldCheck, Lock, MoreHorizontal, User, Download, Plus, Trash2
} from "lucide-react";
import { io } from "socket.io-client";
import messageService from "../../services/messageService";
import { useToast } from "../../components/ui/ToastContext";

// Retrieve current logged in user from localStorage to establish the correct socket map
const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("userInfo") || localStorage.getItem("user")) || { _id: "local_user", name: "Current User" };
  } catch(e) { return { _id: "local_user", name: "Current User" }; }
}

export default function MessagesTab() {
  const { showToast } = useToast();
  const [currentUser] = useState(getStoredUser());
  const [conversations, setConversations] = useState([]);
  const [activeContact, setActiveContact] = useState(null); 
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  
  const socketRef = useRef(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const activeContactRef = useRef(activeContact);

  useEffect(() => {
    activeContactRef.current = activeContact;
  }, [activeContact]);

  // 1. Initialize Real-Time WebSocket Connection
  useEffect(() => {
    const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace('/api', '');
    
    socketRef.current = io(API_URL, {
      query: { userId: currentUser._id || currentUser.id },
      transports: ["websocket"]
    });

    socketRef.current.on("newMessage", (newMsg) => {
      if (activeContactRef.current && activeContactRef.current._id === newMsg.senderId) {
        setMessages((prev) => [...prev, newMsg]);
        scrollToBottom();
      }
      fetchConvos(); 
    });

    return () => socketRef.current?.disconnect();
  }, [currentUser]);

  // 2. Fetch Active Conversations
  const fetchConvos = async () => {
    setIsLoadingChats(true);
    try {
      const data = await messageService.getConversations();
      if (data && data.length > 0) {
        const mapped = data.map(conv => {
          const otherUser = conv.participants.find(p => p._id !== (currentUser._id || currentUser.id)) || conv.participants[0];
          return {
            _id: otherUser._id, 
            name: otherUser.name || "Unknown",
            initial: (otherUser.name || "U").charAt(0).toUpperCase(),
            role: otherUser.role || "User",
            time: new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            message: conv.lastMessage?.content || "Tap to view conversation...",
            unread: false, // Update logic if backend supports unread count
            status: 'online' // Mock for UI
          };
        });
        setConversations(mapped);
      } else {
        const contactsData = await messageService.getContacts();
        if (contactsData && contactsData.length > 0) {
          const contactMapped = contactsData.map(c => ({
              _id: c._id, 
              name: c.name,
              initial: c.name.charAt(0).toUpperCase(),
              role: c.role,
              time: "New",
              message: "Start a conversation...",
              unread: false,
              status: 'offline'
          }));
          setConversations(contactMapped);
        } else {
          setConversations([]);
        }
      }
    } catch (error) {
      console.error("Fetch convos error:", error);
      setConversations([]); 
    } finally {
      setIsLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchConvos();
  }, []);

  // 3. Select Contact -> Fetch History
  useEffect(() => {
    if (activeContact && activeContact._id) {
      messageService.getMessages(activeContact._id)
        .then(data => {
          setMessages(Array.isArray(data) ? data : []);
          scrollToBottom();
        })
        .catch(err => {
          setMessages([]);
          showToast("Failed to sync chat history.", "error");
        });
    } else {
      setMessages([]);
    }
  }, [activeContact]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const myId = currentUser._id || currentUser.id;
    const newMsg = {
      _id: Date.now().toString(),
      senderId: myId,
      content: inputText,
      createdAt: new Date().toISOString(),
      isOptimistic: true
    };
    
    setMessages(prev => [...prev, newMsg]);
    setInputText("");
    scrollToBottom();

    try {
      if (activeContact && activeContact._id) {
        await messageService.sendMessage(activeContact._id, newMsg.content);
        fetchConvos(); 
      }
    } catch (error) {
      showToast("Message failed to sync", "error");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeContact) return;
    
    try {
      await messageService.sendMessage(activeContact._id, "", file);
      showToast("File sent successfully", "success");
    } catch (error) {
      showToast("File upload failed", "error");
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-[#050505] text-slate-200 overflow-hidden font-sans rounded-t-[32px] border-t border-white/5 shadow-2xl relative">
      
      {/* ---------------- LEFT PANEL: DIRECTORY ---------------- */}
      <div className="w-[340px] lg:w-[380px] border-r border-white/5 flex flex-col bg-[#080808] shrink-0 z-10">
        <div className="p-8 border-b border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[12px] font-black tracking-[0.3em] text-blue-500 uppercase flex items-center gap-2">
              <ShieldCheck size={16} /> Secure Portal
            </h2>
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
              <Plus size={14} className="text-neutral-500" />
            </div>
          </div>
          
          <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-blue-500 transition-colors" />
            <input 
               type="text" 
               placeholder="Search directory..." 
               className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-semibold text-white focus:bg-white/[0.05] focus:border-blue-500/50 outline-none transition-all placeholder:text-neutral-700 shadow-inner"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {isLoadingChats ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
              <div className="h-2 w-24 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-1/2 animate-shimmer"></div>
              </div>
              <p className="text-[9px] font-black tracking-widest uppercase">Syncing Roster</p>
            </div>
          ) : conversations.length === 0 ? (
            <EmptyDirectory />
          ) : (
            conversations.map((contact) => (
              <motion.div 
                key={contact._id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setActiveContact(contact)}
                className={`flex items-center gap-4 p-4 rounded-[22px] cursor-pointer transition-all duration-300 relative group ${
                  activeContact?._id === contact._id
                    ? "bg-white/[0.06] shadow-2xl border border-white/5" 
                    : "hover:bg-white/[0.02] border border-transparent"
                }`}
              >
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black bg-gradient-to-br transition-transform group-hover:scale-105 duration-300 ${
                    contact.role?.toLowerCase() === 'student' 
                      ? 'from-emerald-900/40 to-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.1)]' 
                      : 'from-blue-900/40 to-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                  }`}>
                    {contact.initial}
                  </div>
                  {contact.status === 'online' && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-[#080808] z-10" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-sm font-bold truncate transition-colors ${activeContact?._id === contact._id ? "text-white" : "text-neutral-400 group-hover:text-white"}`}>{contact.name}</h3>
                    <span className="text-[9px] text-neutral-600 font-black tracking-tighter uppercase ml-2 tabular-nums">
                      {contact.time}
                    </span>
                  </div>
                  <p className={`text-[11px] truncate transition-colors leading-relaxed font-medium ${contact.unread ? "text-emerald-400 font-bold" : "text-neutral-600 group-hover:text-neutral-500"}`}>
                    {contact.message}
                  </p>
                </div>

                {activeContact?._id === contact._id && (
                  <motion.div layoutId="active-indicator" className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* ---------------- MIDDLE PANEL: ENCRYPTED THREAD ---------------- */}
      <div className="flex-1 flex flex-col bg-[#050505] relative z-0">
        
        <AnimatePresence mode="wait">
          {!activeContact ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center space-y-8"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full group-hover:bg-blue-500/30 transition-all duration-700"></div>
                <div className="w-32 h-32 bg-white/[0.03] border border-white/10 rounded-[40px] flex items-center justify-center shadow-2xl relative z-10 rotate-6 transition-transform hover:rotate-12 duration-500">
                  <MessageSquareOff size={48} className="text-neutral-700 -rotate-6" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-white tracking-tighter">Secure Communication</h2>
                <p className="text-[11px] text-neutral-600 max-w-[280px] font-semibold uppercase tracking-[0.2em] leading-loose">
                  Select a contact to begin an end-to-end encrypted session
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key={activeContact._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col h-full"
            >
              {/* Header */}
              <div className="h-24 border-b border-white/5 px-8 flex items-center justify-between shrink-0 bg-[#050505]/80 backdrop-blur-3xl z-20">
                <div className="flex items-center gap-5">
                  <div onClick={() => setActiveContact(null)} className="md:hidden p-2 hover:bg-white/5 rounded-full transition-colors cursor-pointer mr-2">
                    <ChevronLeft size={20} />
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-lg font-black text-neutral-500 shadow-xl overflow-hidden group">
                     <span className="group-hover:scale-110 transition-transform duration-300">{activeContact?.initial}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-lg font-black text-white tracking-tighter leading-none">{activeContact?.name}</h2>
                      <span className="bg-blue-600/10 text-blue-400 px-2 py-0.5 rounded-lg text-[9px] font-black tracking-widest border border-blue-500/20 uppercase">
                        {activeContact?.role || "STUDENT"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[9px] font-black tracking-[0.2em] text-emerald-500/80 uppercase">Active Session</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <HeaderAction icon={Phone} />
                  <HeaderAction icon={Video} />
                  <HeaderAction icon={Search} />
                  <HeaderAction 
                    icon={showDetails ? ChevronLeft : MoreHorizontal} 
                    active={showDetails} 
                    onClick={() => setShowDetails(!showDetails)}
                    className="hidden xl:flex rotate-180"
                  />
                </div>
              </div>

              {/* Thread */}
              <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 custom-scrollbar pb-32">
                <div className="flex justify-center mb-12">
                  <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 px-6 py-2 rounded-full shadow-inner">
                    <Lock size={12} className="text-neutral-700" />
                    <span className="text-[9px] font-black tracking-[0.3em] text-neutral-600 uppercase">E2EE Applied</span>
                  </div>
                </div>

                {messages.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center space-y-4 opacity-30">
                     <MessageSquareOff size={32} className="text-neutral-500" />
                     <p className="text-[10px] font-black tracking-[0.3em] uppercase">No previous handshake</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <MessageBubble key={idx} msg={msg} isMe={msg.senderId === (currentUser.id || currentUser._id)} />
                  ))
                )}
                <div ref={scrollRef} />
              </div>

              {/* Input */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-8 z-30"
              >
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-2.5 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-end gap-2 focus-within:border-blue-500/30 transition-all">
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()} 
                    className="w-12 h-12 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all shrink-0 active:scale-90"
                  >
                    <Paperclip size={20} />
                  </button>
                  
                  <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(e)}
                    placeholder="Type a secure message..."
                    className="flex-1 bg-transparent text-white text-sm font-medium py-3.5 px-2 focus:outline-none resize-none max-h-32 min-h-[48px] custom-scrollbar"
                    rows={1}
                  />
                  
                  <button 
                    onClick={handleSendMessage}
                    disabled={!inputText.trim()}
                    className="w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 disabled:opacity-20 transition-all shrink-0 active:scale-90"
                  >
                    <Send size={18} className="translate-x-[1px]" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ---------------- RIGHT PANEL: DETAILS (Glass Overlay) ---------------- */}
      <AnimatePresence>
        {showDetails && activeContact && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 360, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-white/5 bg-[#080808] hidden xl:flex flex-col shrink-0 overflow-y-auto z-40 custom-scrollbar"
          >
            <div className="p-10 flex flex-col items-center border-b border-white/5 relative bg-gradient-to-b from-white/[0.02] to-transparent">
              <div className="w-28 h-28 rounded-[38px] bg-white/[0.03] border border-white/10 mb-8 flex items-center justify-center text-4xl font-black text-white shadow-2xl rotate-6 group overflow-hidden">
                <span className="scale-110 group-hover:scale-125 transition-transform duration-700">{activeContact?.initial}</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tighter mb-1 text-center">{activeContact?.name}</h2>
              <p className="text-[10px] text-neutral-600 font-black tracking-[0.3em] uppercase mb-8">{activeContact?.role || "MEMBER"}</p>
              
              <div className="grid grid-cols-2 gap-3 w-full">
                <ProfileStat label="Status" value="Verified" icon={ShieldCheck} color="text-emerald-500" />
                <ProfileStat label="Vibe" value="Active" icon={Zap} color="text-blue-500" />
              </div>
              
              <button className="w-full mt-8 py-4 bg-white/5 border border-white/10 text-white text-[10px] font-black tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 uppercase hover:bg-white/10 transition-all">
                <User size={14} /> Full Profile
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black tracking-[0.3em] text-neutral-700 uppercase flex items-center gap-3">
                  Transferred Assets <div className="h-px bg-white/5 flex-1" />
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <Thumbnail icon={ImageIcon} count={12} />
                  <Thumbnail icon={FileText} count={4} />
                  <Thumbnail icon={LinkIcon} count={8} />
                </div>
                <button className="w-full py-4 bg-[#0A0A0A] border border-white/5 rounded-2xl text-[9px] font-black tracking-[0.3em] text-neutral-600 uppercase hover:text-white hover:border-white/10 transition-all">
                  Browse Repository
                </button>
              </div>

              <div className="pt-8">
                 <button className="w-full py-4 group border border-red-500/10 hover:bg-red-500/10 hover:border-red-500/30 rounded-2xl transition-all">
                    <span className="text-[10px] font-black tracking-[0.3em] text-neutral-700 group-hover:text-red-500 uppercase">Restrict Account</span>
                 </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENTS (Enhanced Atomic Fragments) ---

function HeaderAction({ icon: Icon, active, onClick, className }) {
  return (
    <button 
      onClick={onClick}
      className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
        active 
          ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
          : 'bg-white/[0.03] border-white/10 text-neutral-500 hover:text-white hover:border-white/20'
      } ${className}`}
    >
      <Icon size={18} />
    </button>
  );
}

function MessageBubble({ msg, isMe }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: isMe ? 20 : -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%] ${isMe ? 'ml-auto' : 'mr-auto'} group`}
    >
      {msg.content && (
        <div className={`px-5 py-4 rounded-[24px] text-sm leading-relaxed shadow-2xl border transition-all hover:brightness-110 ${
          isMe 
            ? "bg-gradient-to-br from-blue-700 to-indigo-900 text-white rounded-br-[4px] border-white/10 shadow-blue-900/10" 
            : "bg-white/[0.03] text-neutral-300 rounded-bl-[4px] border-white/5"
        }`}>
          {msg.content}
        </div>
      )}

      {(msg.isFile || msg.file) && (
        <div className={`mt-2 p-4 rounded-[22px] flex items-center gap-4 border cursor-pointer hover:bg-white/5 transition-all shadow-xl ${
          isMe ? "bg-white/[0.05] border-white/10 rounded-br-[4px]" : "bg-white/[0.02] border-white/5 rounded-bl-[4px]"
        }`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isMe ? 'bg-blue-600/20 text-blue-400' : 'bg-white/5 text-neutral-500'}`}>
            {msg.file?.mimeType?.startsWith('image/') ? <ImageIcon size={22} /> : <FileText size={22} />}
          </div>
          <div className="min-w-0 pr-4">
            <p className="text-sm font-bold text-white mb-0.5 truncate">{msg.file?.name || "Attached Asset"}</p>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest leading-none">
                {msg.file?.size ? `${Math.round(msg.file.size/1000)} KB` : 'Handover'}
              </p>
              <Download size={10} className="text-neutral-700" />
            </div>
          </div>
        </div>
      )}

      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-neutral-700 font-black mt-3 flex items-center gap-3 px-1 tracking-widest uppercase">
        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        {isMe && <div className="flex gap-0.5"><div className="w-1 h-1 bg-blue-500/50 rounded-full" /><div className="w-1 h-1 bg-blue-500 rounded-full" /></div>}
      </div>
    </motion.div>
  );
}

function ProfileStat({ label, value, icon: Icon, color }) {
  return (
    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-3xl flex-1 group hover:border-white/10 transition-colors">
      <div className="flex items-center gap-2 mb-2 opacity-50">
        <Icon size={12} className={color} />
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-xs font-black text-white">{value}</p>
    </div>
  );
}

function Thumbnail({ icon: Icon, count }) {
  return (
    <div className="aspect-square bg-white/[0.02] border border-white/5 rounded-[22px] flex flex-col items-center justify-center gap-2 text-neutral-700 hover:text-blue-500 hover:border-blue-500/30 cursor-pointer transition-all hover:-translate-y-1">
      <Icon size={20} />
      <span className="text-[9px] font-black tabular-nums">{count}</span>
    </div>
  );
}

function EmptyDirectory() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 space-y-6 text-center">
       <div className="w-20 h-20 bg-white/[0.02] border border-white/5 rounded-[32px] flex items-center justify-center">
         <Search size={32} className="text-neutral-800" />
       </div>
       <div className="space-y-1">
         <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]">Directory Empty</p>
         <p className="text-[11px] text-neutral-700 leading-relaxed font-semibold">No classmates or faculty members found in your current clusters.</p>
       </div>
    </div>
  );
}
