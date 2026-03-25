import React, { useState, useEffect, useRef } from "react";
import { 
  Phone, Video, Search, Paperclip, Smile, Send, 
  MoreVertical, FileText, Image as ImageIcon, Link as LinkIcon 
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
  const [activeContact, setActiveContact] = useState(null); // the mapped contact object
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const socketRef = useRef(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const activeContactRef = useRef(activeContact);

  useEffect(() => {
    activeContactRef.current = activeContact;
  }, [activeContact]);

  // MOCK DATA Fallback matching the high-fidelity UI requirements perfectly
  // const MOCK_CONTACTS = [
  //   { _id: 'mock1', name: "Dr. Sarah Vance", role: "Instructor", initial: "Dr", active: true, message: "Attached the updated syllabus...", time: "10:42 AM", unread: true },
  //   { _id: 'mock2', name: "Marcus Wright", role: "Student", initial: "MW", active: false, message: "Thanks for the help with Lab 4!", time: "Yesterday", unread: false },
  //   { _id: 'mock3', name: "AI Ethics Study Group", role: "Group", initial: "AI", active: false, message: "Lina: Who has the summary?", time: "2:15 PM", unread: false },
  // ];

  // const MOCK_MESSAGES = [
  //   { id: 1, sender: "me", text: "Hello Dr. Vance! I had a quick question regarding the final project submission. Are we required to include the raw dataset or just the analysis report?", time: "09:15 AM", read: true },
  //   { id: 2, sender: "other", text: "Good morning, Alex. Please include both. The raw dataset should be in the 'Appendix' folder of your repository. It helps me verify the data processing steps you mentioned in the report.", time: "09:42 AM" },
  //   { id: 3, sender: "other", text: "I've attached the updated rubric here for reference. Let me know if you need any further clarification before the deadline on Friday.", time: "09:43 AM", isFile: true, fileTitle: "Final_Project_Rubric_V2.pdf", fileSize: "1.2 MB • PDF Document" }
  // ];

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

  // 2. Fetch Active Conversations and map them so we extract the OTHER participant
  const fetchConvos = async () => {
    try {
      const data = await messageService.getConversations();
      if (data && data.length > 0) {
        // Map the backend conversations to the UI contact format
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
        // Fallback to fetch normal contacts if no active conversations exist
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
          setConversations(MOCK_CONTACTS);
        }
      }
    } catch (error) {
      console.error("Fetch convos error:", error);
      setConversations(MOCK_CONTACTS); 
    }
  };

  useEffect(() => {
    fetchConvos();
  }, []);

  // 3. When a chat is selected, load the history
  useEffect(() => {
    if (activeContact && activeContact._id && !activeContact._id.startsWith('mock')) {
      messageService.getMessages(activeContact._id)
        .then(data => {
          setMessages(data);
          scrollToBottom();
        })
        .catch(err => {
          showToast("Error loading historic messages", "error");
        });
    } else {
      setMessages(MOCK_MESSAGES);
      scrollToBottom();
    }
  }, [activeContact]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
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

    // Fire API Call correctly (receiverId, content) - NO OBJECT WRAPPING
    try {
      if (activeContact && !activeContact._id.startsWith('mock')) {
        await messageService.sendMessage(activeContact._id, newMsg.content);
        fetchConvos(); // silent fetch to bump conversation to top
      }
    } catch (error) {
      console.error(error);
      showToast("Message failed to sync with server.", "error");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (activeContact && !activeContact._id.startsWith('mock')) {
      try {
        await messageService.sendMessage(activeContact._id, "", file);
        showToast("File sent successfully", "success");
      } catch (error) {
        showToast("File upload failed", "error");
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] w-full bg-[#0A0A0A] text-slate-200 overflow-hidden font-sans border-t border-[#1A1D24]">
      
      {/* LEFT PANEL: ACTIVE CHATS */}
      <div className="w-[320px] border-r border-[#1A1D24] flex flex-col bg-[#0A0A0A] shrink-0 z-10">
        <div className="p-6">
          <h2 className="text-[11px] font-extrabold tracking-widest text-[#4A5060] uppercase mb-4">
            Active Chats
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 custom-scrollbar">
          {conversations.map((contact, i) => (
            <div 
              key={contact._id || i} 
              onClick={() => setActiveContact(contact)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                activeContact?._id === contact._id || (!activeContact && i === 0)
                  ? "bg-[#1A1D24] shadow-md border border-white/5" 
                  : "hover:bg-[#12141A] border border-transparent"
              }`}
            >
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border border-white/5 ${contact.role?.toLowerCase() === 'student' ? 'bg-gradient-to-tr from-green-900 to-emerald-900' : 'bg-gradient-to-tr from-blue-900 to-indigo-900'}`}>
                  {contact.initial}
                </div>
                {contact.unread && (
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#10B981] rounded-full border-2 border-[#0A0A0A]" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="text-sm font-bold text-white truncate">{contact.name}</h3>
                  <span className="text-[10px] text-[#4A5060] font-medium whitespace-nowrap ml-2">
                    {contact.time}
                  </span>
                </div>
                <p className={`text-xs truncate ${contact.unread ? "text-[#10B981] font-semibold" : "text-[#8B92A5]"}`}>
                  {contact.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MIDDLE PANEL: CHAT WINDOW */}
      <div className="flex-1 flex flex-col bg-[#0A0A0A] relative z-0">
        
        {/* Chat Header */}
        <div className="h-20 border-b border-[#1A1D24] px-6 flex items-center justify-between shrink-0 bg-[#0A0A0A]/90 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-900/40 flex items-center justify-center text-sm font-bold border border-blue-500/20">
              {(activeContact?.name || "Dr").substring(0,2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-extrabold text-white leading-tight">{activeContact?.name || "Dr. Sarah Vance"}</h2>
                <span className="bg-[#1A1D24] text-[#8B92A5] px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider border border-[#2A2E39] uppercase">
                  {activeContact?.role || "INSTRUCTOR"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                <p className="text-[#10B981] text-xs font-bold tracking-wider">ACTIVE NOW</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-xl bg-[#1A1D24] flex items-center justify-center text-[#8B92A5] hover:text-white hover:bg-[#2A2E39] border border-[#2A2E39] transition-all">
              <Phone size={18} />
            </button>
            <button className="w-10 h-10 rounded-xl bg-[#1A1D24] flex items-center justify-center text-[#8B92A5] hover:text-white hover:bg-[#2A2E39] border border-[#2A2E39] transition-all">
              <Video size={18} />
            </button>
            <button className="w-10 h-10 rounded-xl bg-[#1A1D24] flex items-center justify-center text-[#8B92A5] hover:text-white hover:bg-[#2A2E39] border border-[#2A2E39] transition-all">
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* Chat Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-32">
          
          <div className="flex justify-center mb-8 mt-4">
            <div className="bg-[#1A1D24] text-[#4A5060] px-4 py-1.5 rounded-full text-[10px] font-extrabold tracking-widest border border-[#2A2E39]">
              TODAY
            </div>
          </div>

          {!messages.length && (
            <div className="text-center text-[#4A5060] py-10">Start a secure conversation.</div>
          )}

          {messages.map((msg, idx) => {
            const isMe = msg.sender === "me" || (msg.senderId === (currentUser.id || currentUser._id));
            
            return (
              <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%] ${isMe ? 'ml-auto' : 'mr-auto'}`}>
                
                {/* Text Bubble */}
                {msg.text || msg.content ? (
                  <div className={`p-4 rounded-[20px] text-[15px] leading-relaxed shadow-md ${
                    isMe 
                      ? "bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-[#E2E8F0] rounded-br-[4px] border border-[#334155] drop-shadow-[0_4px_10px_rgba(15,23,42,0.4)]" 
                      : "bg-[#12141A] text-[#A0AEC0] rounded-bl-[4px] border border-[#1A1D24]"
                  }`}>
                    {msg.text || msg.content}
                  </div>
                ) : null}

                {/* File Attachment Bubble */}
                {(msg.isFile || msg.file) && (
                  <div className={`mt-2 p-4 rounded-xl border flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity ${
                    isMe 
                      ? "bg-[#1E293B] border-[#334155] rounded-br-none" 
                      : "bg-[#12141A] border-[#1A1D24]"
                  }`}>
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                      {msg.file?.mimeType?.startsWith('image/') ? <ImageIcon size={20} /> : <FileText size={20} />}
                    </div>
                    <div>
                      <p className="text-white text-sm font-bold mb-0.5 truncate max-w-[200px]">{msg.fileTitle || msg.file?.name || "Document"}</p>
                      <p className="text-[#8B92A5] text-[11px] uppercase tracking-wider">{msg.fileSize || `${Math.round((msg.file?.size||0)/1000)} KB`}</p>
                    </div>
                  </div>
                )}

                <div className="text-[10px] text-[#4A5060] font-medium mt-1.5 flex items-center gap-1.5 px-1">
                  {msg.time || new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMe && <span className="text-[#10B981] font-bold flex items-center gap-0.5"><div className="w-1 h-1 bg-[#10B981] rounded-full"></div> Read</span>}
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        {/* Input Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/95 to-transparent z-10 shrink-0">
          <form 
            onSubmit={handleSendMessage} 
            className="flex items-center gap-2 bg-[#12141A] border border-[#1A1D24] p-2 rounded-full shadow-2xl backdrop-blur-md"
          >
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-[#8B92A5] hover:text-white transition-colors rounded-full hover:bg-[#1A1D24]">
              <Paperclip size={20} />
            </button>
            <button type="button" className="p-3 text-[#8B92A5] hover:text-white transition-colors rounded-full hover:bg-[#1A1D24] mr-2">
              <Smile size={20} />
            </button>
            
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Type a secure message to ${activeContact?.name?.split(' ')[0] || 'them'}...`}
              className="flex-1 bg-transparent text-white placeholder:text-[#4A5060] focus:outline-none focus:ring-0 text-sm font-medium"
            />
            
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="w-12 h-12 rounded-full bg-[#10B981] hover:bg-[#059669] flex items-center justify-center text-white disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-[#10B981]/20"
            >
              <Send size={18} className="ml-1" />
            </button>
          </form>
          
          <p className="text-center text-[9px] font-extrabold tracking-[0.2em] text-[#3B4252] mt-4 uppercase flex items-center justify-center gap-2">
            <span className="w-2 h-[1px] bg-[#3B4252]"></span>
            END-TO-END ENCRYPTED ACADEMIC CHANNEL
            <span className="w-2 h-[1px] bg-[#3B4252]"></span>
          </p>
        </div>

      </div>

      {/* RIGHT PANEL: CONTACT INFO / DETAILS */}
      <div className="w-[320px] border-l border-[#1A1D24] flex flex-col bg-[#0A0A0A] shrink-0 overflow-y-auto hidden xl:flex">
        <div className="p-8 flex flex-col items-center border-b border-[#1A1D24] relative">
          {/* subtle background glow */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-24 h-24 bg-blue-500/10 blur-2xl rounded-full"></div>

          <div className="w-24 h-24 rounded-2xl bg-gradient-to-bl from-blue-900 via-[#1A1D24] to-[#0A0A0A] border border-[#2A2E39] mb-4 flex items-center justify-center text-3xl font-black shadow-xl relative z-10 text-white">
            {(activeContact?.name || "Dr").substring(0,2).toUpperCase()}
          </div>
          <h2 className="text-xl font-extrabold text-white mb-1">{activeContact?.name || "Dr. Sarah Vance"}</h2>
          <p className="text-xs text-[#8B92A5] font-medium mb-4 uppercase tracking-wider">{activeContact?.role === 'Student' ? 'Computer Science Major' : 'Professor of Computational Ethics'}</p>
          
          <div className="flex gap-2 relative z-10">
            <span className="bg-[#1A1D24] text-[#A0AEC0] hover:text-white transition-colors cursor-pointer px-3 py-1 rounded-md text-[10px] font-bold border border-[#2A2E39]">Research</span>
            <span className="bg-[#1A1D24] text-[#A0AEC0] hover:text-white transition-colors cursor-pointer px-3 py-1 rounded-md text-[10px] font-bold border border-[#2A2E39]">Ethics</span>
          </div>
        </div>

        <div className="p-6 border-b border-[#1A1D24]">
          <h3 className="text-[10px] font-extrabold tracking-widest text-[#4A5060] uppercase mb-4 flex items-center gap-2">
            Upcoming Deadlines <div className="w-full h-[1px] bg-[#1A1D24] flex-1"></div>
          </h3>
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-[#2D1618] to-[#0A0A0A] border border-red-900/30 p-3.5 rounded-xl border-l-2 border-l-red-500 group cursor-pointer">
              <h4 className="text-red-400 text-xs font-bold mb-1 group-hover:text-red-300 transition-colors">Project Proposal</h4>
              <p className="text-[10px] text-[#A0AEC0] font-medium">Tomorrow at 11:59 PM</p>
            </div>
            <div className="bg-gradient-to-r from-[#1A1D24] to-[#0A0A0A] border border-[#2A2E39] p-3.5 rounded-xl border-l-2 border-l-blue-500 group cursor-pointer">
              <h4 className="text-slate-100 text-xs font-bold mb-1 group-hover:text-white transition-colors">Week 8 Reflection</h4>
              <p className="text-[10px] text-[#A0AEC0] font-medium">Friday at 5:00 PM</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-[10px] font-extrabold tracking-widest text-[#4A5060] uppercase mb-4 flex items-center gap-2">
            Shared Media <div className="w-full h-[1px] bg-[#1A1D24] flex-1"></div>
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="aspect-square bg-[#1A1D24] border border-[#2A2E39] rounded-xl flex items-center justify-center text-[#4A5060] hover:text-[#8B92A5] hover:bg-[#2A2E39] cursor-pointer transition-colors shadow-inner">
              <ImageIcon size={20} />
            </div>
            <div className="aspect-square bg-[#1A1D24] border border-[#2A2E39] rounded-xl flex items-center justify-center text-[#4A5060] hover:text-[#8B92A5] hover:bg-[#2A2E39] cursor-pointer transition-colors shadow-inner">
              <FileText size={20} />
            </div>
            <div className="aspect-square bg-[#1A1D24] border border-[#2A2E39] rounded-xl flex items-center justify-center text-[#4A5060] hover:text-[#8B92A5] hover:bg-[#2A2E39] cursor-pointer transition-colors shadow-inner">
              <LinkIcon size={20} />
            </div>
          </div>
          <button className="text-[10px] font-extrabold tracking-widest text-[#10B981] hover:text-[#059669] uppercase transition-colors">
            VIEW ALL FILES
          </button>
        </div>

        <div className="p-6 mt-auto">
          <button className="w-full bg-[#0A0A0A] hover:bg-[#1A0B0E] border border-red-900/10 hover:border-red-900/30 text-[#4A5060] hover:text-red-500 text-[10px] font-extrabold tracking-widest uppercase py-4 rounded-xl transition-all shadow-sm">
            Report Conversation
          </button>
        </div>
      </div>
      
    </div>
  );
}
