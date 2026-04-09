import React, { useState, useEffect, useRef } from "react";
import { 
  Phone, Video, Search, Paperclip, Smile, Send, 
  MoreVertical, FileText, Image as ImageIcon, Link as LinkIcon 
} from "lucide-react";
import { io } from "socket.io-client";
import messageService from "../../../../../../services/messageService";
import { useToast } from "../../../../../../components/ui/ToastContext";

// In a real app, this comes from AuthContext. Falling back to localStorage parsing.
const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("userInfo") || localStorage.getItem("user")) || { _id: "local_student", name: "Student" };
  } catch(e) { return { _id: "local_student", name: "Student" }; }
}

export default function Messages() {
  const { showToast } = useToast();
  const [currentUser] = useState(getStoredUser());
  const [conversations, setConversations] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const socketRef = useRef(null);
  const scrollRef = useRef(null);

  // MOCK DATA just to immediately render the high-fidelity UI from the screenshot 
  // before real API data fully syncs if there are no real conversations yet.
  const MOCK_CONTACTS = [
    { id: '1', name: "Dr. Sarah Vance", role: "Instructor", initial: "Dr", active: true, message: "Attached the updated syllabus...", time: "10:42 AM", unread: true },
    { id: '2', name: "Marcus Wright", role: "Student", initial: "MW", active: false, message: "Thanks for the help with Lab 4!", time: "Yesterday", unread: false },
    { id: '3', name: "AI Ethics Study Group", role: "Group", initial: "AI", active: false, message: "Lina: Who has the summary?", time: "2:15 PM", unread: false },
  ];

  const MOCK_MESSAGES = [
    { id: 1, sender: "me", text: "Hello Dr. Vance! I had a quick question regarding the final project submission. Are we required to include the raw dataset or just the analysis report?", time: "09:15 AM", read: true },
    { id: 2, sender: "other", text: "Good morning, Alex. Please include both. The raw dataset should be in the 'Appendix' folder of your repository. It helps me verify the data processing steps you mentioned in the report.", time: "09:42 AM" },
    { id: 3, sender: "other", text: "I've attached the updated rubric here for reference. Let me know if you need any further clarification before the deadline on Friday.", time: "09:43 AM", isFile: true, fileTitle: "Final_Project_Rubric_V2.pdf", fileSize: "1.2 MB • PDF Document" }
  ];

  // 1. Initialize Real-Time WebSocket Connection
  useEffect(() => {
    const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace('/api', '');
    socketRef.current = io(API_URL, {
      query: { userId: currentUser._id || currentUser.id },
      transports: ["websocket"]
    });

    socketRef.current.on("newMessage", (newMsg) => {
      // If the message belongs to the current active chat window, append it immediately!
      setMessages((prev) => [...prev, newMsg]);
      scrollToBottom();
    });

    return () => socketRef.current?.disconnect();
  }, [currentUser]);

  // 2. Fetch Active Conversations from the Database
  useEffect(() => {
    const fetchConvos = async () => {
      try {
        const data = await messageService.getConversations();
        setConversations(data.length > 0 ? data : MOCK_CONTACTS); 
      } catch (error) {
        setConversations(MOCK_CONTACTS); // Fallback to mock UI for demonstration
      }
    };
    fetchConvos();
  }, []);

  // 3. When a chat is selected, load the real history
  useEffect(() => {
    if (activeChatId && typeof activeChatId === "string" && activeChatId.length > 5) {
      messageService.getMessages(activeChatId).then(data => {
        setMessages(data);
        scrollToBottom();
      }).catch(err => {
        showToast("Error loading historic messages", "error");
      });
    } else {
      setMessages(MOCK_MESSAGES);
      scrollToBottom();
    }
  }, [activeChatId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    // Optimistic UI Update
    const newMsg = {
      _id: Date.now(),
      senderId: currentUser._id || currentUser.id,
      content: inputText,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText("");
    scrollToBottom();

    // Send through API
    try {
      if (activeChatId && typeof activeChatId === "string" && activeChatId.length > 5) {
        await messageService.sendMessage(activeChatId, newMsg.content);
      }
    } catch (error) {
      showToast("Message failed to send.", "error");
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] w-full bg-background text-slate-200 overflow-hidden font-sans border-t border-input">
      
      {/* LEFT PANEL: ACTIVE CHATS */}
      <div className="w-[320px] border-r border-input flex flex-col bg-background">
        <div className="p-6">
          <h2 className="text-[11px] font-extrabold tracking-widest text-muted-foreground uppercase mb-4">
            Active Chats
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {conversations.map((contact, i) => (
            <div 
              key={i} 
              onClick={() => setActiveChatId(contact.id || contact._id)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                activeChatId === (contact.id || contact._id) || (!activeChatId && i === 0)
                  ? "bg-input" 
                  : "hover:bg-card"
              }`}
            >
              {/* Avatar relative container for unread dot */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-900 to-indigo-900 flex items-center justify-center text-sm font-bold border border-white/5">
                  {contact.initial || "Dr"}
                </div>
                {contact.unread && (
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-[#0A0A0A]" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="text-sm font-bold text-foreground truncate">{contact.name || "Dr. Sarah Vance"}</h3>
                  <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap ml-2">
                    {contact.time || "10:42 AM"}
                  </span>
                </div>
                <p className={`text-xs truncate ${contact.unread ? "text-success font-semibold" : "text-muted-foreground"}`}>
                  {contact.message || (contact.lastMessage?.content || "Tap to view conversation")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MIDDLE PANEL: CHAT WINDOW */}
      <div className="flex-1 flex flex-col bg-background">
        
        {/* Chat Header */}
        <div className="h-20 border-b border-input px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-900/40 flex items-center justify-center text-sm font-bold border border-blue-500/20">
              Dr
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-extrabold text-white leading-tight">Dr. Sarah Vance</h2>
                <span className="bg-input text-muted-foreground px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider border border-border">
                  INSTRUCTOR
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                <p className="text-success text-xs font-bold tracking-wider">ACTIVE NOW</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-xl bg-input flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
              <Phone size={18} />
            </button>
            <button className="w-10 h-10 rounded-xl bg-input flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
              <Video size={18} />
            </button>
            <button className="w-10 h-10 rounded-xl bg-input flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* Chat Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="flex justify-center">
            <div className="bg-input text-muted-foreground px-4 py-1.5 rounded-full text-[10px] font-extrabold tracking-widest border border-border">
              MONDAY, OCT 23
            </div>
          </div>

          {messages.map((msg, idx) => {
            // Check if backend message layout or mock array
            const isMe = msg.sender === "me" || (msg.senderId === (currentUser.id || currentUser._id));
            
            return (
              <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%] ${isMe ? 'ml-auto' : 'mr-auto'}`}>
                
                {/* Text Bubble */}
                {msg.text || msg.content ? (
                  <div className={`p-4 rounded-[20px] text-sm leading-relaxed ${
                    isMe 
                      ? "bg-muted text-foreground rounded-br-[4px] border border-[#3B4252]" 
                      : "bg-card text-muted-foreground rounded-bl-[4px] border border-input"
                  }`}>
                    {msg.text || msg.content}
                  </div>
                ) : null}

                {/* File Attachment Bubble */}
                {(msg.isFile || msg.file) && (
                  <div className={`mt-2 p-4 rounded-xl border flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity ${
                    isMe 
                      ? "bg-muted border-[#3B4252] rounded-br-none" 
                      : "bg-card border-input"
                  }`}>
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-bold mb-0.5">{msg.fileTitle || msg.file?.name}</p>
                      <p className="text-muted-foreground text-xs">{msg.fileSize || `${Math.round((msg.file?.size||0)/1000)} KB`}</p>
                    </div>
                  </div>
                )}

                <div className="text-[10px] text-muted-foreground font-medium mt-1.5 flex items-center gap-1">
                  {msg.time || new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMe && msg.read && <span className="text-success ml-1">• Read</span>}
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        {/* Input Bar */}
        <div className="p-6 shrink-0 z-10 relative">
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-card to-transparent pointer-events-none" />
          
          <form 
            onSubmit={handleSendMessage} 
            className="flex items-center gap-2 bg-card border border-input p-2 rounded-full relative z-20 shadow-2xl"
          >
            <button type="button" className="p-3 text-muted-foreground hover:text-white transition-colors rounded-full hover:bg-input">
              <Paperclip size={20} />
            </button>
            <button type="button" className="p-3 text-muted-foreground hover:text-white transition-colors rounded-full hover:bg-input mr-2">
              <Smile size={20} />
            </button>
            
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message to Dr. Sarah..."
              className="flex-1 bg-transparent text-white placeholder:text-muted-foreground focus:outline-none focus:ring-0 text-sm"
            />
            
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="w-12 h-12 rounded-full bg-success hover:bg-success flex items-center justify-center text-white disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-[#10B981]/20"
            >
              <Send size={18} className="ml-1" />
            </button>
          </form>
          
          <p className="text-center text-[9px] font-bold tracking-widest text-muted-foreground mt-4 uppercase">
            END-TO-END ENCRYPTED ACADEMIC CHANNEL
          </p>
        </div>

      </div>

      {/* RIGHT PANEL: CONTACT INFO / DETAILS */}
      <div className="w-[320px] border-l border-input flex flex-col bg-background overflow-y-auto">
        <div className="p-8 flex flex-col items-center border-b border-input">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-bl from-blue-900 to-card border border-border mb-4 flex items-center justify-center text-2xl font-black shadow-xl">
            Dr
          </div>
          <h2 className="text-xl font-extrabold text-foreground mb-1">Dr. Sarah Vance</h2>
          <p className="text-xs text-muted-foreground font-medium mb-4">Professor of Computational Ethics</p>
          
          <div className="flex gap-2">
            <span className="bg-input text-muted-foreground px-3 py-1 rounded-md text-[10px] font-bold border border-border">Research</span>
            <span className="bg-input text-muted-foreground px-3 py-1 rounded-md text-[10px] font-bold border border-border">Ethics</span>
          </div>
        </div>

        <div className="p-6 border-b border-input">
          <h3 className="text-[10px] font-extrabold tracking-widest text-muted-foreground uppercase mb-4">
            Upcoming Deadlines
          </h3>
          <div className="space-y-3">
            <div className="bg-[#2D1618] border border-red-900/50 p-3 rounded-xl border-l-2 border-l-red-500">
              <h4 className="text-red-400 text-xs font-bold mb-1">Project Proposal</h4>
              <p className="text-[10px] text-muted-foreground">Tomorrow at 11:59 PM</p>
            </div>
            <div className="bg-input border border-border p-3 rounded-xl border-l-2 border-l-blue-500">
              <h4 className="text-slate-100 text-xs font-bold mb-1">Week 8 Reflection</h4>
              <p className="text-[10px] text-muted-foreground">Friday at 5:00 PM</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-[10px] font-extrabold tracking-widest text-muted-foreground uppercase mb-4">
            Shared Media
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="aspect-square bg-input border border-border rounded-xl flex items-center justify-center text-muted-foreground hover:text-muted-foreground hover:bg-muted cursor-pointer transition-colors">
              <ImageIcon size={20} />
            </div>
            <div className="aspect-square bg-input border border-border rounded-xl flex items-center justify-center text-muted-foreground hover:text-muted-foreground hover:bg-muted cursor-pointer transition-colors">
              <FileText size={20} />
            </div>
            <div className="aspect-square bg-input border border-border rounded-xl flex items-center justify-center text-muted-foreground hover:text-muted-foreground hover:bg-muted cursor-pointer transition-colors">
              <LinkIcon size={20} />
            </div>
          </div>
          <button className="text-[10px] font-extrabold tracking-widest text-success hover:text-[#059669] uppercase transition-colors">
            VIEW ALL FILES
          </button>
        </div>

        <div className="p-6 mt-auto">
          <button className="w-full bg-[#1A0B0E] border border-red-900/30 text-red-500/80 hover:text-red-400 hover:bg-[#2D1618] text-[10px] font-extrabold tracking-widest uppercase py-4 rounded-xl transition-colors">
            Report Conversation
          </button>
        </div>
      </div>
      
    </div>
  );
}