import React, { useState, useEffect, useRef } from "react";
import { 
  Phone, Video, Search, Paperclip, Smile, Send, 
  MoreVertical, FileText, Image as ImageIcon, Link as LinkIcon, MessageSquareOff, ChevronLeft
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
  
  const socketRef = useRef(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const activeContactRef = useRef(activeContact);

  useEffect(() => {
    activeContactRef.current = activeContact;
  }, [activeContact]);

  // 1. Initialize Real-Time WebSocket Connection
  useEffect(() => {
    // Strip trailing /api if present
    const API_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace('/api', '');
    
    socketRef.current = io(API_URL, {
      query: { userId: currentUser._id || currentUser.id },
      transports: ["websocket"]
    });

    socketRef.current.on("newMessage", (newMsg) => {
      // Append if it's targeted for the currently open chat!
      if (activeContactRef.current && activeContactRef.current._id === newMsg.senderId) {
        setMessages((prev) => [...prev, newMsg]);
        scrollToBottom();
      }
      fetchConvos(); // Refresh the sidebar unread status
    });

    return () => socketRef.current?.disconnect();
  }, [currentUser]);

  // 2. Fetch Active Conversations mapped 1-to-1 with Database
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
            unread: false
          };
        });
        setConversations(mapped);
      } else {
        // Fallback to fetch raw contacts if ZERO history exists
        const contactsData = await messageService.getContacts();
        if (contactsData && contactsData.length > 0) {
          const contactMapped = contactsData.map(c => ({
              _id: c._id, 
              name: c.name,
              initial: c.name.charAt(0).toUpperCase(),
              role: c.role,
              time: "New",
              message: "Start a conversation...",
              unread: false
          }));
          setConversations(contactMapped);
        } else {
          setConversations([]);
        }
      }
    } catch (error) {
      console.error("Fetch convos error:", error);
      setConversations([]); // Defensive DB Fallback
    } finally {
      setIsLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchConvos();
  }, []);

  // 3. Select Contact -> Fetch Message History
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

    // Fast-Optimistic UI Add
    const myId = currentUser._id || currentUser.id;
    const newMsg = {
      _id: Date.now().toString(),
      senderId: myId,
      content: inputText,
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMsg]);
    setInputText("");
    scrollToBottom();

    try {
      if (activeContact && activeContact._id) {
        await messageService.sendMessage(activeContact._id, newMsg.content);
        fetchConvos(); // sync sidebar 
      }
    } catch (error) {
      console.error(error);
      showToast("Message failed to sync with server.", "error");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (activeContact && activeContact._id) {
      try {
        await messageService.sendMessage(activeContact._id, "", file);
        showToast("File sent successfully", "success");
      } catch (error) {
        showToast("File upload failed", "error");
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] w-full bg-background text-slate-200 overflow-hidden font-sans border-t border-white/5 shadow-2xl">
      
      {/* ---------------- LEFT PANEL: CONTACTS ---------------- */}
      <div className="w-[320px] lg:w-[350px] border-r border-input flex flex-col bg-background shrink-0 z-10 transition-all">
        <div className="p-6 border-b border-input sticky top-0 bg-background/95 backdrop-blur-xl z-20">
          <h2 className="text-[11px] font-extrabold tracking-widest text-muted-foreground uppercase flex items-center gap-2 mb-4">
            <MessageSquareOff size={14} className="text-blue-500" /> Secure Directory
          </h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground mb-[1px]" />
            <input 
               type="text" 
               placeholder="Search directory..." 
               className="w-full bg-input border border-border rounded-xl py-2.5 pl-9 pr-4 text-xs font-medium text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all placeholder:text-muted-foreground"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar relative">
          {isLoadingChats ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground space-y-4">
              <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-extrabold tracking-widest uppercase">Syncing Roster...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-70">
               <div className="w-16 h-16 bg-input rounded-[1.5rem] flex items-center justify-center border border-border shadow-inner">
                 <Search size={24} className="text-muted-foreground" />
               </div>
               <div className="text-center">
                 <p className="text-xs font-extrabold text-muted-foreground tracking-widest uppercase mb-1">Directory Empty</p>
                 <p className="text-[10px] text-muted-foreground max-w-[200px] mx-auto">No students or staff found in your assigned modules.</p>
               </div>
            </div>
          ) : (
            conversations.map((contact, i) => (
              <div 
                key={contact._id || i} 
                onClick={() => setActiveContact(contact)}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-300 ease-out group ${
                  activeContact?._id === contact._id
                    ? "bg-input shadow-[0_4px_15px_rgba(0,0,0,0.5)] border border-border" 
                    : "hover:bg-white/[0.02] border border-transparent"
                }`}
              >
                <div className="relative shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border ${activeContact?._id === contact._id ? 'border-white/10' : 'border-transparent'} shadow-inner ${contact.role?.toLowerCase() === 'student' ? 'bg-gradient-to-tr from-emerald-900/40 to-green-800/20 text-emerald-500' : 'bg-gradient-to-tr from-blue-900/40 to-indigo-800/20 text-blue-500'}`}>
                    {contact.initial}
                  </div>
                  {contact.unread && (
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0A0A0A] shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className={`text-sm font-bold truncate transition-colors ${activeContact?._id === contact._id ? "text-white" : "text-slate-300 group-hover:text-white"}`}>{contact.name}</h3>
                    <span className="text-[9px] text-muted-foreground font-extrabold tracking-wider whitespace-nowrap ml-2">
                      {contact.time}
                    </span>
                  </div>
                  <p className={`text-xs truncate transition-colors ${contact.unread ? "text-emerald-400 font-bold" : "text-muted-foreground group-hover:text-slate-400"}`}>
                    {contact.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ---------------- MIDDLE PANEL: CHAT WINDOW ---------------- */}
      <div className="flex-1 flex flex-col bg-background relative z-0">
        
        {!activeContact ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-24 h-24 mb-6 relative">
              <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full animate-pulse"></div>
              <div className="w-full h-full bg-input border border-border rounded-3xl flex items-center justify-center rotate-3 shadow-2xl relative z-10 transition-transform hover:rotate-6 duration-500">
                <MessageSquareOff size={32} className="text-muted-foreground -rotate-3" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Select a Conversation</h2>
            <p className="text-xs text-muted-foreground max-w-[280px] text-center font-medium leading-relaxed">
              Choose a student or faculty member from the directory panel to initiate an end-to-end encrypted session.
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-20 border-b border-input px-6 lg:px-8 flex items-center justify-between shrink-0 bg-background/90 backdrop-blur-xl z-20">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-input flex items-center justify-center text-sm font-bold text-muted-foreground border border-border shadow-inner">
                  {(activeContact?.name || "U").charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2.5 mb-0.5">
                    <h2 className="text-[16px] font-extrabold text-white tracking-tight">{activeContact?.name}</h2>
                    <span className="bg-input text-muted-foreground px-2 py-0.5 rounded-md text-[9px] font-bold tracking-widest border border-border uppercase">
                      {activeContact?.role || "USER"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse" />
                    <p className="text-emerald-500 text-[10px] font-extrabold tracking-widest uppercase">SECURE CONNECTION</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="w-9 h-9 rounded-xl bg-input hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-white transition-colors border border-border">
                  <Phone size={16} />
                </button>
                <button className="w-9 h-9 rounded-xl bg-input hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-white transition-colors border border-border">
                  <Video size={16} />
                </button>
                <button className="w-9 h-9 rounded-xl bg-input hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-white transition-colors border border-border">
                  <Search size={16} />
                </button>
              </div>
            </div>

            {/* Chat Thread */}
            <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6 space-y-6 custom-scrollbar pb-36 relative">
              <div className="flex justify-center mb-10 mt-2">
                <div className="bg-input text-muted-foreground px-4 py-1.5 rounded-full text-[9px] font-extrabold tracking-[0.2em] border border-border shadow-sm uppercase">
                  SECURE CHANNEL ESTABLISHED
                </div>
              </div>

              {!messages.length && (
                <div className="flex items-center justify-center h-40">
                   <p className="text-[10px] font-extrabold tracking-widest text-muted-foreground uppercase">No message history found</p>
                </div>
              )}

              {messages.map((msg, idx) => {
                const isMe = msg.sender === "me" || (msg.senderId === (currentUser.id || currentUser._id));
                
                return (
                  <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%] ${isMe ? 'ml-auto' : 'mr-auto'} group`}>
                    
                    {msg.text || msg.content ? (
                      <div className={`px-5 py-3.5 rounded-[20px] text-[14px] leading-relaxed shadow-md transition-all ${
                        isMe 
                          ? "bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-[#E2E8F0] rounded-br-[4px] border border-[#334155] drop-shadow-[0_4px_10px_rgba(15,23,42,0.3)]" 
                          : "bg-[#12141A] text-muted-foreground rounded-bl-[4px] border border-input"
                      }`}>
                        {msg.text || msg.content}
                      </div>
                    ) : null}

                    {/* File Attachments */}
                    {(msg.isFile || msg.file) && (
                      <div className={`mt-2 p-3.5 rounded-2xl flex items-center gap-4 cursor-pointer hover:opacity-80 transition-all shadow-sm ${
                        isMe 
                          ? "bg-[#1E293B] border border-[#334155] rounded-br-[4px]" 
                          : "bg-[#12141A] border border-input rounded-bl-[4px]"
                      }`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isMe ? 'bg-blue-500/10 text-blue-400' : 'bg-input text-muted-foreground border border-border'}`}>
                          {msg.file?.mimeType?.startsWith('image/') ? <ImageIcon size={20} /> : <FileText size={20} />}
                        </div>
                        <div className="min-w-0 pr-4">
                          <p className={`text-[13px] font-bold mb-0.5 truncate ${isMe ? 'text-white' : 'text-slate-300'}`}>
                             {msg.fileTitle || msg.file?.name || "Attached Document"}
                          </p>
                          <p className={`text-[9px] uppercase tracking-widest font-extrabold ${isMe ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                             {msg.fileSize || `${Math.round((msg.file?.size||0)/1000)} KB`}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] text-muted-foreground font-extrabold mt-2 flex items-center gap-1.5 px-1 tracking-widest uppercase">
                      {msg.time || new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isMe && <span className="text-success flex items-center gap-1"><div className="w-1 h-1 bg-success rounded-full"></div> Sent</span>}
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {/* Input Form */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pt-16 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/95 to-transparent z-10 shrink-0 pointer-events-none">
              <form 
                onSubmit={handleSendMessage} 
                className="flex items-center gap-2 bg-[#12141A] border border-input p-2 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-3xl pointer-events-auto transition-all focus-within:border-border focus-within:bg-[#151820]"
              >
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-muted-foreground hover:text-white transition-colors rounded-full hover:bg-input active:scale-95">
                  <Paperclip size={18} />
                </button>
                <button type="button" className="p-3 text-muted-foreground hover:text-white transition-colors rounded-full hover:bg-input active:scale-95 hidden sm:block">
                  <Smile size={18} />
                </button>
                
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a secure message..."
                  className="flex-1 bg-transparent text-white placeholder:text-muted-foreground focus:outline-none focus:ring-0 text-[14px] font-medium px-2"
                />
                
                <button 
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-blue-500/20 disabled:shadow-none shrink-0"
                >
                  <Send size={16} className="translate-x-[1px]" />
                </button>
              </form>
              <p className="text-center text-[9px] font-extrabold tracking-[0.2em] text-[#3B4252] mt-5 uppercase flex items-center justify-center gap-3">
                <span className="w-4 h-px bg-input"></span>
                END-TO-END ENCRYPTED
                <span className="w-4 h-px bg-input"></span>
              </p>
            </div>
          </>
        )}
      </div>

      {/* ---------------- RIGHT PANEL: DETAILS (Only when active) ---------------- */}
      <div className={`w-[320px] border-l border-input hidden xl:flex flex-col bg-background shrink-0 overflow-y-auto transition-all ${activeContact ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
        {activeContact && (
          <>
            <div className="p-8 flex flex-col items-center border-b border-input relative">
              <div className="absolute top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full mix-blend-screen pointer-events-none"></div>

              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#1A1D24] to-[#0A0A0A] border border-border mb-6 flex items-center justify-center text-3xl font-black text-muted-foreground shadow-xl relative z-10 rotate-3 transition-transform hover:rotate-6">
                {(activeContact?.name || "U").charAt(0).toUpperCase()}
              </div>
              <h2 className="text-[17px] font-black text-white mb-1 shadow-sm leading-tight text-center">{activeContact?.name}</h2>
              <p className="text-[10px] text-muted-foreground font-extrabold mb-6 uppercase tracking-widest">{activeContact?.role || "University Member"}</p>
              
              <div className="flex gap-2 relative z-10 w-full">
                 <button className="flex-1 py-3 bg-input hover:bg-muted border border-border text-muted-foreground hover:text-white rounded-xl text-[10px] font-extrabold tracking-widest transition-all flex items-center justify-center gap-2 uppercase">
                   <Search size={14} /> View Profile
                 </button>
              </div>
            </div>

            <div className="p-6 border-b border-input">
              <h3 className="text-[9px] font-extrabold tracking-[0.2em] text-muted-foreground uppercase mb-4 flex items-center gap-3">
                Shared Files <div className="h-px bg-input flex-1"></div>
              </h3>
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="aspect-square bg-input border border-border rounded-2xl flex items-center justify-center text-muted-foreground hover:text-muted-foreground hover:border-[#4A5060] cursor-pointer transition-all hover:-translate-y-1 shadow-inner">
                  <ImageIcon size={20} />
                </div>
                <div className="aspect-square bg-input border border-border rounded-2xl flex items-center justify-center text-muted-foreground hover:text-muted-foreground hover:border-[#4A5060] cursor-pointer transition-all hover:-translate-y-1 shadow-inner">
                  <FileText size={20} />
                </div>
                <div className="aspect-square bg-input border border-border rounded-2xl flex items-center justify-center text-muted-foreground hover:text-muted-foreground hover:border-[#4A5060] cursor-pointer transition-all hover:-translate-y-1 shadow-inner">
                  <LinkIcon size={20} />
                </div>
              </div>
              <button className="w-full text-[10px] font-extrabold tracking-[0.2em] text-muted-foreground hover:text-muted-foreground uppercase transition-colors bg-[#12141A] hover:bg-input py-3.5 rounded-xl border border-input hover:border-border">
                Browse Repository
              </button>
            </div>
            
            <div className="p-6 mt-auto">
              <button className="w-full bg-background hover:bg-[#1A0B0E] border border-red-900/10 hover:border-red-900/30 text-muted-foreground hover:text-red-500 text-[10px] font-extrabold tracking-widest uppercase py-4 rounded-xl transition-all shadow-sm">
                Report User
              </button>
            </div>
          </>
        )}
      </div>
      
    </div>
  );
}
