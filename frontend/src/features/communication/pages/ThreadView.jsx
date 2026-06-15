import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, MoreVertical, Info, Flag, Trash2 } from 'lucide-react';
import communicationService from '../services/communicationService';
import { useCommunicationSocket, joinThread, leaveThread, emitTyping, emitRead } from '../services/communicationSocket';

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(date).toLocaleDateString();
}

export default function ThreadView() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showActions, setShowActions] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!threadId) return;
    joinThread(threadId);

    const fetchData = async () => {
      try {
        const [threadData, messagesData] = await Promise.all([
          communicationService.getConversation(threadId),
          communicationService.getMessages(threadId, { limit: 100 })
        ]);
        setThread(threadData);
        setMessages(messagesData.data || []);
        emitRead(threadId, []);
        await communicationService.markAsRead(threadId);
      } catch (err) {
        console.error('Failed to load thread:', err);
      }
    };
    fetchData();

    return () => leaveThread(threadId);
  }, [threadId]);

  useCommunicationSocket({
    onMessageNew: (data) => {
      if (data.threadId === threadId) {
        setMessages(prev => [...prev, data.message]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    },
    onThreadTyping: (data) => {
      if (data.threadId === threadId) {
        setTypingUsers(prev => ({ ...prev, [data.userId]: data.isTyping }));
        if (!data.isTyping) {
          setTimeout(() => setTypingUsers(prev => ({ ...prev, [data.userId]: false })), 1000);
        }
      }
    },
    onMessageRead: (data) => {
      if (data.threadId === threadId) {
        setMessages(prev => prev.map(m =>
          data.messageIds?.includes(m._id) ? { ...m, isRead: true, readAt: data.readAt } : m
        ));
      }
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !fileInputRef.current?.files?.length) return;
    setSending(true);
    try {
      const formData = new FormData();
      formData.append('threadId', threadId);
      formData.append('content', input);
      if (fileInputRef.current?.files?.[0]) {
        formData.append('file', fileInputRef.current.files[0]);
      }
      const msg = await communicationService.sendMessage(formData);
      setMessages(prev => [...prev, msg]);
      setInput('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    emitTyping(threadId, true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(threadId, false), 2000);
  };

  const handleFlag = async (msgId) => {
    try {
      await communicationService.flagMessage(msgId, 'Reported by user');
    } catch { /* ignore */ }
  };

  const handleDelete = async (msgId) => {
    try {
      await communicationService.deleteMessage(msgId);
      setMessages(prev => prev.filter(m => m._id !== msgId));
    } catch { /* ignore */ }
  };

  const otherParticipant = thread?.participants?.find(p => p._id !== 'you');

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-white/[0.02] backdrop-blur-xl shrink-0">
        <button onClick={() => navigate('/student/communication/inbox')} className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white">
          <ArrowLeft size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-sm font-medium text-blue-400">
          {otherParticipant?.name?.charAt(0) || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-white truncate">{otherParticipant?.name || 'Unknown'}</h2>
          <p className="text-xs text-neutral-500 capitalize">{thread?.context?.name || thread?.threadType?.replace('_', ' ') || ''}</p>
        </div>
        <div className="relative">
          <button onClick={() => setShowActions(v => v === 'actions' ? null : 'actions')} className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white">
            <MoreVertical size={18} />
          </button>
          {showActions === 'actions' && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg shadow-lg z-50 py-1">
              <button onClick={() => navigate(`/student/communication/contacts`)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-white/[0.04]">
                <Info size={14} /> View Contact
              </button>
              <button onClick={() => { setShowActions(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-400 hover:bg-white/[0.04]">
                <Flag size={14} /> Report
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.map((msg) => {
          const isMine = msg.senderRole === 'mine' || false;
          return (
            <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}>
              <div className={`max-w-[75%] ${isMine ? 'order-1' : 'order-1'}`}>
                <div className={`relative px-3 py-2 rounded-2xl text-sm border ${
                  isMine
                    ? 'bg-blue-500/20 text-white border-blue-500/30 rounded-br-md'
                    : 'bg-white/[0.02] text-white border-white/10 rounded-bl-md'
                }`}>
                  {!isMine && msg.senderId?.name && (
                    <p className="text-xs font-medium text-neutral-400 mb-1">{msg.senderId.name}</p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  {msg.file?.url && (
                    <a
                      href={msg.file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 mt-1 text-xs underline ${
                        isMine ? 'text-blue-300' : 'text-blue-400'
                      }`}
                    >
                      <Paperclip size={12} />
                      {msg.file.name}
                    </a>
                  )}
                  {msg.messageType === 'poll' && msg.poll && (
                    <div className="mt-2 space-y-1">
                      {msg.poll.options?.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="flex-1 h-6 bg-white/5 rounded relative overflow-hidden">
                            <div className="h-full bg-white/10 rounded" style={{ width: `${msg.poll.voters ? (opt.voters?.length / Math.max(...msg.poll.options.map(o => o.voters?.length || 0)) * 100) : 0}%` }} />
                            <span className="absolute inset-0 flex items-center px-2 text-xs text-white">{opt.text} ({opt.voters?.length || 0})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-[10px] text-neutral-500">{timeAgo(msg.createdAt)}</span>
                  {msg.isRead && isMine && <span className="text-[10px] text-blue-400">✓✓</span>}
                  <button onClick={() => handleFlag(msg._id)} className="opacity-0 group-hover:opacity-100 p-0.5 text-neutral-500 hover:text-red-400">
                    <Flag size={10} />
                  </button>
                  {isMine && (
                    <button onClick={() => handleDelete(msg._id)} className="opacity-0 group-hover:opacity-100 p-0.5 text-neutral-500 hover:text-red-400">
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {Object.values(typingUsers).some(v => v) && (
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <div className="flex gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            Someone is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-3 border-t border-white/5 bg-white/[0.02] backdrop-blur-xl">
        <div className="flex items-end gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg hover:bg-white/5 text-neutral-400 shrink-0"
          >
            <Paperclip size={18} />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" onChange={() => {}} />
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-3 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 max-h-32 backdrop-blur-xl"
              style={{ minHeight: '38px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={sending || (!input.trim() && !fileInputRef.current?.files?.length)}
            className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-400 disabled:opacity-40 shrink-0 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
