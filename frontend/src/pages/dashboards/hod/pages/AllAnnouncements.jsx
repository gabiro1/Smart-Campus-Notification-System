import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared";
import { Search, Filter, MoreVertical, Archive, Eye, Loader2 } from "lucide-react";
import announcementService from "@/services/announcementService";
import governanceService from "@/services/governanceService";
import toast from "react-hot-toast";

export default function AllAnnouncements() {
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const [myAnns, governanceFeed] = await Promise.all([
          announcementService.getLecturerAnnouncements().catch(() => ({ data: [] })),
          governanceService.getFeed().catch(() => ({ data: [] })),
        ]);
        
        const allAnns = [
          ...(myAnns.data || []).map(a => ({ ...a, source: 'my' })),
          ...(governanceFeed.data || []).map(a => ({ ...a, source: 'governance' })),
        ];
        setAnnouncements(allAnns);
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
        toast.error("Failed to load announcements");
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'pending': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'archived': return 'text-neutral-400 bg-neutral-500/10 border-neutral-500/20';
      default: return 'text-neutral-400 bg-white/5 border-white/5';
    }
  };

  const filteredAnnouncements = announcements.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || item.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Department Archive
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          Global view of all communications across your department.
        </p>
      </header>

      <GlassCard className="p-0 overflow-hidden flex flex-col min-h-[600px]">
        {/* Filters */}
        <div className="p-4 md:p-5 border-b border-white/5 bg-white/[0.01] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by title or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <div className="md:col-span-3">
            <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-blue-500/50 appearance-none">
              <option value="">All Sources</option>
              <option value="my">My Announcements</option>
              <option value="governance">Governance</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-blue-500/50 appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="md:col-span-1 flex justify-end">
            <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-neutral-500">
            <p>No announcements found</p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5 text-[11px] uppercase tracking-widest text-neutral-500">
                  <th className="p-5 font-semibold">Title & Source</th>
                  <th className="p-5 font-semibold">Target</th>
                  <th className="p-5 font-semibold">Date Sent</th>
                  <th className="p-5 font-semibold">Views</th>
                  <th className="p-5 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAnnouncements.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="p-5">
                      <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {item.source === 'governance' ? 'Governance' : 'Direct'}
                      </p>
                    </td>
                    <td className="p-5">
                      <span className="px-2.5 py-1 text-xs font-medium bg-white/5 rounded-md border border-white/5 text-neutral-300">
                        {item.targetLevel ? `Year ${item.targetLevel}` : item.targetAudience || 'All'}
                      </span>
                    </td>
                    <td className="p-5 text-sm text-neutral-400">
                      {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          {item.viewedBy?.length || 0}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-md border ${getStatusColor(item.status)}`}>
                        {item.status || 'Published'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
