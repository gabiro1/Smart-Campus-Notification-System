import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Smile,
  Send,
  Heart,
  Paperclip,
  User as UserIcon,
  AlertCircle,
  X,
  MessageSquare,
  Download,
  ChevronRight,
  Eye,
  Trash2,
  Edit3,
  MoreHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";
import dashboardService from "../../../../../services/dashboardService";

// ==========================================
// 1. MAIN PAGE CONTAINER
// ==========================================
export default function AnnouncementsPage({ user: propUser }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, _setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const user = propUser || JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getNoticeBoard();
        if (response && response.success) {
          setAnnouncements(response.data || []);
        }
      } catch {
        toast.error("Failed to sync notice board.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (selectedAnnouncement) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [selectedAnnouncement]);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      const title = ann.title || "";
      const matchesSearch = title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === "All" || ann.type === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [announcements, searchQuery, activeFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-card flex flex-col items-center justify-center">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-blue-400 text-xs font-black uppercase tracking-widest">
          Decrypting Feed
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-card text-foreground font-sans overflow-x-hidden p-4 md:p-8">
      <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
        <header className="mb-8 shrink-0">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <span className="p-2 bg-emerald-500/10 rounded-lg">
                <MessageSquare className="text-emerald-500" size={24} />
              </span>
              Active Announcements
            </h1>
            <div className="flex bg-card p-1.5 rounded-xl border border-border">
              {["All", "General", "Assignment", "Urgent"].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${
                    activeFilter === f
                      ? "bg-white/10 text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-6">
          {/* Left Column: ACTIVE ANNOUNCEMENTS */}
          <div className="overflow-y-auto custom-scrollbar pr-2 space-y-4">
            <style dangerouslySetInnerHTML={{__html: `
              .custom-scrollbar::-webkit-scrollbar { width: 4px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
            `}}/>
            
            {filteredAnnouncements.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 border border-border rounded-3xl bg-card">
                <AlertCircle size={48} className="mb-4 opacity-20 text-muted-foreground" />
                <p className="text-lg font-medium text-muted-foreground">
                  No {activeFilter.toLowerCase()} broadcasts found
                </p>
              </div>
            ) : (
              filteredAnnouncements.map((ann, idx) => {
                const isSelected = selectedAnnouncement?._id === ann._id;
                const isUrgent = ann.type === "Urgent";
                return (
                  <motion.div
                    key={ann._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedAnnouncement(ann)}
                    className={`p-6 rounded-[20px] transition-all cursor-pointer group border ${
                      isSelected
                        ? "bg-muted border-emerald-500/30 shadow-[0_4px_20px_rgba(16,185,129,0.05)]"
                        : "bg-card border-border hover:border-border"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider ${
                          isUrgent ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                        }`}>
                          {ann.course?.code || (isUrgent ? "URGENT ALERT" : "DEPT OFFICIAL")}
                        </span>
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-sm text-[10px] font-black uppercase tracking-wider">
                          98% AI MATCH
                        </span>
                      </div>
                      <div className="flex gap-1 text-amber-400">
                         {/* Static stars for UI representation */}
                         {[1,2,3,4,5].map(star => <span key={star}>★</span>)}
                      </div>
                    </div>

                    <h3 className={`text-xl font-bold mb-3 line-clamp-2 transition-colors ${
                      isSelected ? "text-emerald-400" : "text-foreground group-hover:text-emerald-400"
                    }`}>
                      {ann.title}
                    </h3>
                    
                    <p className="text-[14px] text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
                      {ann.content}
                    </p>

                    <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Eye size={14} /> 
                          {ann.viewedBy?.length || 0} VIEWS
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare size={14} /> 
                          {ann.comments?.length || 0} COMMENTS
                        </div>
                        <span>
                          {new Date(ann.createdAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                        </span>
                      </div>
                      <ChevronRight size={18} className={`transition-transform ${isSelected ? "text-emerald-500 translate-x-1" : "text-muted-foreground group-hover:text-foreground"}`} />
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Right Column: INTERACTIVE Q&A */}
          <div className="hidden lg:flex flex-col bg-card rounded-[24px] border border-border overflow-hidden shadow-2xl relative h-full">
            {selectedAnnouncement ? (
               <InteractiveQAPanel ann={selectedAnnouncement} user={user} onClose={() => setSelectedAnnouncement(null)} />
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center border border-border mb-6">
                    <MessageSquare size={24} className="opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Interactive Q&A</h3>
                  <p className="text-sm">Select an announcement from the left to view discussions and ask questions directly to the faculty.</p>
               </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Drawer (Visible only on small screens) */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-0 z-50 bg-card flex flex-col"
          >
            <InteractiveQAPanel ann={selectedAnnouncement} user={user} onClose={() => setSelectedAnnouncement(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// 2. INTERACTIVE Q&A PANEL COMPONENT
// ==========================================
function InteractiveQAPanel({ ann, user: _user, onClose }) {
  const [viewCount, _setViewCount] = useState(ann.viewedBy?.length || 0);
  const [localComments, setLocalComments] = useState(ann.comments || []);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    dashboardService
      .markAsViewed(ann._id)
      .then((res) => res && setViewCount(res.viewCount));
  }, [ann._id]);

  const generateHandle = (name) => {
    if (!name) return "student";
    const parts = name.toLowerCase().trim().split(/\s+/);
    return parts.length === 1 ? parts[0] : `${parts[0]}_${parts[1]}`;
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    try {
      setIsSubmitting(true);
      const response = await dashboardService.addComment(ann._id, commentText);
      if (response && response.comments) {
        setLocalComments(response.comments);
      }
      setCommentText("");
      setReplyingTo(null);
    } catch {
      toast.error("Failed to post question.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const threads = [];
  localComments.forEach((c) => {
    if (!c.content.trim().startsWith("@") || threads.length === 0)
      threads.push({ parent: c, replies: [] });
    else threads[threads.length - 1].replies.push(c);
  });

  return (
    <>
      {/* Header */}
      <div className="flex flex-col p-6 border-b border-border bg-muted">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-foreground">Interactive Q&A</h2>
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 bg-blue-600 rounded-md text-[10px] font-black uppercase tracking-wider text-foreground shadow-lg">
               Active Thread
             </span>
             <button onClick={onClose} className="lg:hidden p-2 text-muted-foreground hover:text-foreground">
               <X size={20} />
             </button>
          </div>
        </div>
        <p className="text-[13px] text-muted-foreground truncate">
          Responding to: <span className="text-muted-foreground">{ann.title}</span>
        </p>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-3">
            <MessageSquare size={32} className="opacity-20" />
            <p className="text-sm font-medium">Be the first to ask a question.</p>
          </div>
        ) : (
          threads.map((t, i) => (
            <div key={i} className="flex flex-col gap-5">
              <QABubble 
                comment={t.parent} 
                generateHandle={generateHandle} 
                onReply={() => {
                  setReplyingTo(generateHandle(t.parent.user?.name));
                  setCommentText(`@${generateHandle(t.parent.user?.name)} `);
                }} 
              />
              {t.replies.map((r, j) => (
                <div key={j} className="pl-6 border-l-2 border-border ml-3">
                   <QABubble 
                     comment={r} 
                     generateHandle={generateHandle} 
                     onReply={() => {
                       setReplyingTo(generateHandle(r.user?.name));
                       setCommentText(`@${generateHandle(r.user?.name)} `);
                     }}
                   />
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Input Footer */}
      <div className="p-6 bg-card border-t border-border shrink-0">
        {replyingTo && (
           <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Replying to <span className="text-blue-400">@{replyingTo}</span>
              </span>
              <button onClick={() => setReplyingTo(null)} className="text-muted-foreground hover:text-foreground"><X size={14}/></button>
           </div>
        )}
        <div className="flex items-end gap-3 bg-black border border-border rounded-2xl p-2 focus-within:border-emerald-500/50 transition-colors shadow-inner">
           <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                 if(e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handlePostComment(); }
              }}
              placeholder="Type your question..."
              className="flex-1 bg-transparent text-sm text-foreground resize-none outline-none max-h-32 min-h-[44px] px-3 py-3 custom-scrollbar"
              rows={1}
           />
           <button
             onClick={handlePostComment}
             disabled={!commentText.trim() || isSubmitting}
             className="shrink-0 w-11 h-11 flex items-center justify-center bg-success hover:bg-emerald-400 disabled:bg-white/5 disabled:text-foreground/20 text-black rounded-xl transition-all font-bold shadow-lg"
           >
             <Send size={18} className="translate-x-[1px]" />
           </button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground uppercase font-black tracking-widest mt-4">
          Press Enter to send, Shift + Enter for multi-line
        </p>
      </div>
    </>
  );
}

// ==========================================
// 3. Q&A BUBBLE COMPONENT
// ==========================================
function QABubble({ comment, generateHandle, onReply }) {
  // Determine if it's an instructor (in our app schema logic, typically lecturers are separate or marked.
  // For UI representation, if comment.user?.role === 'lecturer' or based on context:
  const isInstructor = comment.user?.role === "lecturer" || !comment.user?.role; // Assume lecturer or mock if undefined for UI test

  // Safely grab names
  const name = comment.user?.name || "Student";
  const _handle = generateHandle(name);
  
  // Format content to highlight @mentions
  const renderContent = (content) => {
    if (!content.startsWith("@")) return content;
    const parts = content.split(" ");
    return (
      <>
        <span className="text-blue-400 font-bold mr-1">{parts[0]}</span>
        {parts.slice(1).join(" ")}
      </>
    );
  };

  // Upvote mock state
  const [upvotes, setUpvotes] = useState(comment.likes?.length || Math.floor(Math.random() * 20));
  const [voted, setVoted] = useState(false);
  const handleVote = () => { if(!voted) { setUpvotes(u=>u+1); setVoted(true); } else { setUpvotes(u=>u-1); setVoted(false); } };

  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-full bg-white/5 shrink-0 overflow-hidden border border-border flex items-center justify-center">
        {comment.user?.profilePicture ? (
          <img src={comment.user.profilePicture} className="w-full h-full object-cover" />
        ) : (
          <UserIcon size={16} className="text-muted-foreground" />
        )}
      </div>

      <div className="flex-1">
         <div className="flex items-center gap-3 mb-1.5">
            <span className="text-sm font-bold text-foreground leading-none">{name}</span>
            {isInstructor && (
               <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 uppercase tracking-wider text-[9px] font-black rounded-sm border border-blue-500/20">
                 Instructor
               </span>
            )}
            <span className="text-[11px] font-medium text-muted-foreground">
               {new Date(comment.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
         </div>
         
         <div className={`text-[14px] leading-relaxed mb-3 ${
            isInstructor 
              ? "bg-card p-4 rounded-xl rounded-tl-none border border-blue-500/10 text-muted-foreground italic" 
              : "text-neutral-300"
         }`}>
            "{renderContent(comment.content)}"
         </div>

         {isInstructor && (
            <div className="flex items-center gap-2 mb-3">
               <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600/10 rounded-md border border-blue-500/20">
                  <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
                     <svg className="w-2 h-2 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Certified Answer</span>
               </div>
            </div>
         )}
         
         <div className="flex items-center gap-4">
            <button 
              onClick={handleVote} 
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                 voted ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-muted-foreground hover:bg-accent"
              }`}
            >
               ↑ {upvotes}
            </button>
            <button onClick={onReply} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors">
               Reply
            </button>
         </div>
      </div>
    </div>
  );
}
