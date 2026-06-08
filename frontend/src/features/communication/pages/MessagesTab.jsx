import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, Video, Search, Paperclip, Send,
  MoreVertical, FileText, Image as ImageIcon, Link as LinkIcon, MessageSquareOff, ChevronLeft,
  ShieldCheck, Lock, MoreHorizontal, User, Download, Plus
} from "lucide-react";
import { io } from "socket.io-client";
import messageService from "../../../services/messageService";
import { useToast } from "../../../components/ui/ToastContext";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("userInfo") || localStorage.getItem("user")) || { _id: "local_user", name: "Current User" };
  } catch { return { _id: "local_user", name: "Current User" }; }
};

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

  useEffect(() => { activeContactRef.current = activeContact; }, [activeContact]);

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
            unread: false,
            status: 'online'
          };
        });
        setConversations(mapped);
      } else {
        const contactsData = await messageService.getContacts();
        if (contactsData && contactsData.length > 0) {
          setConversations(contactsData.map(c => ({
            _id: c._id, name: c.name, initial: c.name.charAt(0).toUpperCase(),
            role: c.role, time: "New", message: "Start a conversation...", unread: false, status: 'offline'
          })));
        } else {
          setConversations([]);
        }
      }
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
    const newMsg = { _id: Date.now().toString(), senderId: myId, content: inputText, createdAt: new Date().toISOString(), isOptimistic: true };
    setMessages(prev => [...prev, newMsg]);
    setInputText("");
    scrollToBottom();
    try {
      if (activeContact && activeContact._id) {
        await messageService.sendMessage(activeContact._id, newMsg.content);
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

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-background text-foreground overflow-hidden font-sans rounded-t-[32px] border-t border-border relative">
      {/* LEFT PANEL */}
      <div className="w-full lg:w-[340px] xl:w-[380px] border-r border-border flex flex-col bg-card shrink-0 z-10 lg:max-w-[380px]">
        <div className="p-6 border-b border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[12px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
              <ShieldCheck size={14} /> Messages
            </h2>
            <button className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Plus size={14} />
            </button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search directory..."
              className="w-full bg-muted border border-border rounded-lg py-2.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/25 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {isLoadingChats ? (
            <div className="h-full flex flex-col items-center justify-center space-y-3 opacity-50">
              <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-foreground w-1/2 animate-pulse" />
              </div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Syncing</p>
            </div>
          ) : conversations.length === 0 ? (
            <EmptyDirectory />
          ) : (
            conversations.map((contact) => (
              <motion.div key={contact._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                onClick={() => setActiveContact(contact)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                  activeContact?._id === contact._id
                    ? "bg-accent border border-border"
                    : "hover:bg-muted/50 border border-transparent"
                }`}
              >
                <div className="relative shrink-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold bg-muted border border-border text-foreground`}>
                    {contact.initial}
                  </div>
                  {contact.status === 'online' && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className={`text-sm font-medium truncate transition-colors ${activeContact?._id === contact._id ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>{contact.name}</h3>
                    <span className="text-[10px] text-muted-foreground ml-2">{contact.time}</span>
                  </div>
                  <p className={`text-xs truncate transition-colors ${contact.unread ? "text-foreground font-medium" : "text-muted-foreground"}`}>{contact.message}</p>
                </div>
                {activeContact?._id === contact._id && (
                  <motion.div layoutId="active-indicator" className="absolute left-0 w-0.5 h-6 bg-foreground rounded-r-full" />
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* MIDDLE PANEL */}
      <div className="flex-1 flex flex-col bg-background relative z-0">
        <AnimatePresence mode="wait">
          {!activeContact ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center space-y-6"
            >
              <div className="w-24 h-24 bg-muted border border-border rounded-2xl flex items-center justify-center">
                <MessageSquareOff size={36} className="text-muted-foreground" />
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-lg font-semibold text-foreground">Messages</h2>
                <p className="text-xs text-muted-foreground max-w-[260px]">Select a contact to start chatting</p>
              </div>
            </motion.div>
          ) : (
            <motion.div key={activeContact._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col h-full"
            >
              {/* Header */}
              <div className="h-20 border-b border-border px-6 flex items-center justify-between shrink-0 bg-background z-20">
                <div className="flex items-center gap-4">
                  <div onClick={() => setActiveContact(null)} className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
                    <ChevronLeft size={18} className="text-muted-foreground" />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-sm font-bold text-foreground">
                    {activeContact?.initial}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h2 className="text-base font-semibold text-foreground">{activeContact?.name}</h2>
                      <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-[10px] font-medium uppercase">{activeContact?.role || "User"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-success" />
                      <span className="text-[10px] text-muted-foreground">Online</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <HeaderAction icon={Phone} />
                  <HeaderAction icon={Video} />
                  <HeaderAction icon={Search} />
                  <HeaderAction icon={showDetails ? ChevronLeft : MoreHorizontal} active={showDetails} onClick={() => setShowDetails(!showDetails)}
                    className="hidden xl:flex" />
                </div>
              </div>

              {/* Thread */}
              <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-4 custom-scrollbar pb-32">
                <div className="flex justify-center mb-8">
                  <div className="flex items-center gap-2 bg-muted border border-border px-4 py-1.5 rounded-full">
                    <Lock size={10} className="text-muted-foreground" />
                    <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Encrypted</span>
                  </div>
                </div>
                {messages.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center space-y-3 opacity-40">
                    <MessageSquareOff size={24} className="text-muted-foreground" />
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">No messages yet</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => <MessageBubble key={idx} msg={msg} isMe={msg.senderId === (currentUser.id || currentUser._id)} />)
                )}
                <div ref={scrollRef} />
              </div>

              {/* Input */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-30"
              >
                <div className="bg-card border border-border p-2 rounded-2xl shadow-lg flex items-end gap-2 focus-within:border-foreground/25 transition-all">
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all shrink-0">
                    <Paperclip size={18} />
                  </button>
                  <textarea value={inputText} onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(e)}
                    placeholder="Type a message..." rows={1}
                    className="flex-1 bg-transparent text-foreground text-sm py-2.5 px-2 focus:outline-none resize-none max-h-32 min-h-[40px] custom-scrollbar placeholder:text-muted-foreground"
                  />
                  <button onClick={handleSendMessage} disabled={!inputText.trim()}
                    className="w-10 h-10 bg-foreground text-background rounded-xl flex items-center justify-center disabled:opacity-20 transition-all shrink-0 active:scale-90 hover:opacity-90">
                    <Send size={16} />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT PANEL */}
      <AnimatePresence>
        {showDetails && activeContact && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            className="border-l border-border bg-card hidden xl:flex flex-col shrink-0 overflow-y-auto custom-scrollbar"
          >
            <div className="p-8 flex flex-col items-center border-b border-border">
              <div className="w-20 h-20 rounded-2xl bg-muted border border-border mb-6 flex items-center justify-center text-2xl font-bold text-foreground">
                {activeContact?.initial}
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1 text-center">{activeContact?.name}</h2>
              <p className="text-xs text-muted-foreground mb-6 uppercase tracking-wider">{activeContact?.role || "Member"}</p>
              <div className="grid grid-cols-2 gap-2 w-full">
                <ProfileStat label="Status" value="Verified" icon={ShieldCheck} />
                <ProfileStat label="Active" value="Online" icon={User} />
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  Shared <div className="h-px bg-border flex-1" />
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <Thumbnail icon={ImageIcon} count={12} />
                  <Thumbnail icon={FileText} count={4} />
                  <Thumbnail icon={LinkIcon} count={8} />
                </div>
                <button className="w-full py-3 bg-muted border border-border rounded-xl text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all uppercase tracking-wider">
                  Browse All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function HeaderAction({ icon: Icon, active, onClick, className }) {
  return (
    <button onClick={onClick}
      className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-200 ${
        active
          ? 'bg-foreground border-foreground text-background'
          : 'bg-muted border-border text-muted-foreground hover:text-foreground hover:bg-accent'
      } ${className}`}
    >
      <Icon size={16} />
    </button>
  );
}

function MessageBubble({ msg, isMe }) {
  return (
    <motion.div initial={{ opacity: 0, x: isMe ? 20 : -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%] ${isMe ? 'ml-auto' : 'mr-auto'} group`}
    >
      {msg.content && (
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed border ${
          isMe ? "bg-foreground text-background rounded-br-[4px] border-foreground" : "bg-card text-foreground rounded-bl-[4px] border-border"
        }`}>
          {msg.content}
        </div>
      )}
      {(msg.isFile || msg.file) && (
        <div className={`mt-2 p-3 rounded-xl flex items-center gap-3 border cursor-pointer hover:bg-accent transition-all ${
          isMe ? "bg-muted border-border rounded-br-[4px]" : "bg-card border-border rounded-bl-[4px]"
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isMe ? 'bg-background/20 text-background' : 'bg-muted text-muted-foreground'}`}>
            {msg.file?.mimeType?.startsWith('image/') ? <ImageIcon size={18} /> : <FileText size={18} />}
          </div>
          <div className="min-w-0 pr-2">
            <p className="text-sm font-medium text-foreground truncate">{msg.file?.name || "Attached file"}</p>
            <p className="text-[10px] text-muted-foreground">{msg.file?.size ? `${Math.round(msg.file.size/1000)} KB` : 'File'}</p>
          </div>
        </div>
      )}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-muted-foreground mt-1.5 flex items-center gap-2 px-1">
        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        {isMe && <span className="text-muted-foreground">••</span>}
      </div>
    </motion.div>
  );
}

function ProfileStat({ label, value, icon: Icon }) {
  return (
    <div className="p-3 bg-muted border border-border rounded-xl group hover:bg-accent transition-colors">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} className="text-muted-foreground" />
        <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xs font-medium text-foreground">{value}</p>
    </div>
  );
}

function Thumbnail({ icon: Icon, count }) {
  return (
    <div className="aspect-square bg-muted border border-border rounded-xl flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer transition-all">
      <Icon size={16} />
      <span className="text-[10px] font-medium">{count}</span>
    </div>
  );
}

function EmptyDirectory() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 space-y-4 text-center">
      <div className="w-16 h-16 bg-muted border border-border rounded-2xl flex items-center justify-center">
        <Search size={24} className="text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">No contacts yet</p>
        <p className="text-xs text-muted-foreground">No contacts found. Check the Contacts page to find people to message.</p>
      </div>
    </div>
  );
}
