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
      <div className="p-4 border-b border-white/5 bg-white/[0.02] backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Inbox size={20} className="text-blue-400" />
            <h1 className="text-lg font-semibold text-white">Inbox</h1>
            {pagination && (
              <span className="text-xs text-neutral-500">{pagination.total} conversations</span>
            )}
          </div>
          <button onClick={fetchConversations} className="p-2 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 backdrop-blur-xl"
          />
        </div>
      </div>

      <div className="flex gap-1 px-4 py-2 bg-white/[0.01] border-b border-white/5 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              filter === f.key
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-white/[0.02] text-neutral-500 hover:bg-white/[0.04] hover:text-white border border-white/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && conversations.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-neutral-500">
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
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-white/5 transition-colors hover:bg-white/[0.02] ${
                  unread > 0 ? 'bg-blue-500/[0.03]' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 border border-white/10 ${
                  unread > 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-white/[0.02] text-neutral-400'
                }`}>
                  {otherParticipant?.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm truncate ${unread > 0 ? 'font-semibold text-white' : 'text-white'}`}>
                      {otherParticipant?.name || 'Unknown'}
                    </span>
                    <span className="text-xs text-neutral-500 shrink-0">
                      {timeAgo(conv.lastMessageAt || conv.updatedAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-neutral-500 capitalize">{conv.context?.name || conv.threadType?.replace('_', ' ')}</span>
                  </div>
                  <p className="text-xs text-neutral-500 truncate mt-0.5">
                    {conv.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {unread > 0 && (
                    <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-blue-500 text-white min-w-[20px] text-center">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                  {conv.urgency === 'high' || conv.urgency === 'critical' ? (
                    <AlertCircle size={14} className="text-red-400" />
                  ) : null}
                  <ChevronRight size={14} className="text-neutral-500" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between p-3 border-t border-white/5 bg-white/[0.02] backdrop-blur-xl">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/[0.02] border border-white/10 text-white disabled:opacity-40 hover:bg-white/[0.04]"
          >
            Previous
          </button>
          <span className="text-xs text-neutral-500">{page} / {pagination.pages}</span>
          <button
            disabled={page >= pagination.pages}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/[0.02] border border-white/10 text-white disabled:opacity-40 hover:bg-white/[0.04]"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
