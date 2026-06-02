import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Inbox, Mail, Clock, AlertCircle, ChevronRight, RefreshCw } from 'lucide-react';
import communicationService from '../services/communicationService';
import { useCommunicationSocket, joinThread } from '../services/communicationSocket';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'academic', label: 'Academic' },
  { key: 'support', label: 'Support' },
  { key: 'requests', label: 'Requests' },
  { key: 'escalations', label: 'Escalations' },
  { key: 'unread', label: 'Unread' },
];

function getTypeIcon(type) {
  switch (type) {
    case 'course_discussion': return '📚';
    case 'office_ticket': return '🎫';
    case 'structured_request': return '📋';
    case 'escalation': return '⚡';
    case 'announcement_reply': return '📢';
    default: return '💬';
  }
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function InboxView() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const typeParam = filter === 'all' || filter === 'unread' ? undefined : filter;
      const result = await communicationService.getConversations({
        type: typeParam,
        status: filter === 'unread' ? 'unread' : undefined,
        search: search || undefined,
        page,
        limit: 20
      });
      setConversations(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, search, page]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useCommunicationSocket({
    onMessageNew: (data) => {
      if (data.threadId) fetchConversations();
    },
    onThreadUpdated: () => fetchConversations(),
    onTicketStatus: () => fetchConversations(),
    onRequestStatus: () => fetchConversations(),
  });

  const handleSelect = (conv) => {
    joinThread(conv._id);
    navigate(`/student/communication/inbox/${conv._id}`);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Inbox size={20} className="text-primary" />
            <h1 className="text-lg font-semibold text-foreground">Inbox</h1>
            {pagination && (
              <span className="text-xs text-muted-foreground">{pagination.total} conversations</span>
            )}
          </div>
          <button onClick={fetchConversations} className="p-2 rounded-lg hover:bg-accent text-muted-foreground">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="flex gap-1 px-4 py-2 bg-muted/30 border-b border-border overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              filter === f.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && conversations.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Inbox size={40} className="mb-2 opacity-40" />
            <p className="text-sm">No conversations found</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const unread = conv.myUnreadCount || 0;
            const otherParticipant = conv.participants?.find(p => p._id !== 'you') || conv.participants?.[0];
            return (
              <div
                key={conv._id}
                onClick={() => handleSelect(conv)}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-border transition-colors hover:bg-accent/50 ${
                  unread > 0 ? 'bg-primary/5' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                  unread > 0 ? 'bg-primary/20' : 'bg-muted'
                }`}>
                  {otherParticipant?.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm truncate ${unread > 0 ? 'font-semibold text-foreground' : 'text-foreground'}`}>
                      {otherParticipant?.name || 'Unknown'}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {timeAgo(conv.lastMessageAt || conv.updatedAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs">{getTypeIcon(conv.threadType)}</span>
                    <span className="text-xs text-muted-foreground capitalize">{conv.context?.name || conv.threadType?.replace('_', ' ')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {conv.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {unread > 0 && (
                    <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-primary text-primary-foreground min-w-[20px] text-center">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                  {conv.urgency === 'high' || conv.urgency === 'critical' ? (
                    <AlertCircle size={14} className="text-red-500" />
                  ) : null}
                  <ChevronRight size={14} className="text-muted-foreground" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between p-3 border-t border-border bg-card">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-foreground disabled:opacity-40 hover:bg-accent/80"
          >
            Previous
          </button>
          <span className="text-xs text-muted-foreground">{page} / {pagination.pages}</span>
          <button
            disabled={page >= pagination.pages}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-foreground disabled:opacity-40 hover:bg-accent/80"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
