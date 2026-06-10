import { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  Eye, 
  Check, 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Users, 
  Clock, 
  MessageSquare,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock component to match user's architecture
const GlassCard = ({ children, className = "" }) => (
  <div className={`backdrop-blur-xl bg-zinc-900/40 border border-white/10 rounded-2xl shadow-2xl ${className}`}>
    {children}
  </div>
);

const INITIAL_REQUESTS = [
  {
    id: 1,
    hod: "Dr. A. Smith",
    dept: "Computer Science",
    title: "Urgent: Server Maintenance & Virtual Lab Outage",
    content: "Please be advised that the main server cluster will undergo emergency maintenance tonight. All virtual environments will be inaccessible from 23:00 to 02:00. Plan your final project submissions accordingly.",
    target: "All CS Students",
    audienceCount: 1420,
    date: "Jun 10, 2026",
    priority: "CRITICAL",
    status: "PENDING",
    attachments: [{ name: "sys-maintenance-scope.pdf", size: "1.2 MB" }]
  },
  {
    id: 2,
    hod: "Prof. M. Johnson",
    dept: "Engineering",
    title: "Civil Workshop Relocation - Heavy Machinery Notice",
    content: "The Year 3 and 4 structural workshops are shifting to Block G. Do not enter the old workshop wing after Tuesday morning due to crane operations. Wear safety equipment near the perimeter.",
    target: "Year 3 & 4 Students",
    audienceCount: 680,
    date: "Jun 10, 2026",
    priority: "HIGH",
    status: "PENDING",
    attachments: [{ name: "block_g_layout.dwg", size: "14.5 MB" }]
  },
  {
    id: 3,
    hod: "Dr. K. Lee",
    dept: "Mathematics",
    title: "Pan-African Math Olympiad Registration Deadline",
    content: "Final registrations for the upcoming Olympiad close this Friday. The department will sponsor entry fees for the top 15 ranked applicants based on Mid-Term performance.",
    target: "All Math Students",
    audienceCount: 410,
    date: "Jun 09, 2026",
    priority: "MEDIUM",
    status: "PENDING",
    attachments: []
  },
  {
    id: 4,
    hod: "Dr. A. Smith",
    dept: "Computer Science",
    title: "Annual Hackathon Guidelines & Api Keys Distribution",
    content: "Registered teams can now pull their API documentation keys from the dashboard. Remember that external open-source libraries are restricted unless disclosed in your initial architecture proposal document.",
    target: "Year 2 Students",
    audienceCount: 520,
    date: "Jun 08, 2026",
    priority: "LOW",
    status: "PENDING",
    attachments: [{ name: "hackathon_rules_v2.pdf", size: "430 KB" }]
  }
];

export default function DeanApprovals() {
  // Master Array State (Preserves data structures for auditing/metrics)
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  
  // UI Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionConfirmation, setActionConfirmation] = useState(null);
  const [rejectionComment, setRejectionComment] = useState("");

  // Pagination Engine State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Real-time Analytic Aggregations derived directly from state
  const metrics = useMemo(() => {
    return {
      pending: requests.filter(r => r.status === "PENDING").length,
      approvedToday: requests.filter(r => r.status === "APPROVED").length,
      rejectedToday: requests.filter(r => r.status === "REJECTED").length,
      totalAudience: requests.filter(r => r.status === "PENDING").reduce((acc, curr) => acc + curr.audienceCount, 0)
    };
  }, [requests]);

  // Clean, Deterministic Multi-parameter Search Filter Pipeline
  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      if (item.status !== "PENDING") return false;
      
      const normalizedSearch = searchQuery.toLowerCase();
      const matchesSearch = 
        item.title.toLowerCase().includes(normalizedSearch) ||
        item.hod.toLowerCase().includes(normalizedSearch) ||
        item.content.toLowerCase().includes(normalizedSearch);

      const matchesDept = selectedDept === "All" || item.dept === selectedDept;
      const matchesPriority = selectedPriority === "All" || item.priority === selectedPriority;

      return matchesSearch && matchesDept && matchesPriority;
    });
  }, [requests, searchQuery, selectedDept, selectedPriority]);

  // Paginated Slicing calculation
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRequests, currentPage]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  // Core Mutation Handlers
  const executeApproval = (id) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: "APPROVED" } : req));
    setSelectedItem(null);
    setActionConfirmation(null);
  };

  const executeRejection = (id) => {
    // In real-world apps, append rejectionComment payload here to API call
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: "REJECTED" } : req));
    setSelectedItem(null);
    setActionConfirmation(null);
    setRejectionComment("");
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case "CRITICAL": return "bg-rose-500/10 border-rose-500/30 text-rose-400";
      case "HIGH": return "bg-orange-500/10 border-orange-500/30 text-orange-400";
      case "MEDIUM": return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      case "LOW": return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
    }
  };

  return (
    <div className="space-y-6 p-8 min-h-screen bg-[#09090b] text-zinc-100 selection:bg-blue-500/30">
      
      {/* Executive Header Layer */}
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Academic Governance Console
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Review, sign off, and broadcast administrative notices across university networks.
          </p>
        </div>
        
        {/* Dynamic Executive Metric Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full xl:w-auto">
          <div className="bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-2.5">
            <span className="text-xs text-zinc-500 font-medium block">Queue Status</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ShieldAlert size={14} className="text-amber-500" />
              <span className="text-base font-bold text-amber-500">{metrics.pending} Pending</span>
            </div>
          </div>
          <div className="bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-2.5">
            <span className="text-xs text-zinc-500 font-medium block">Projected Blast Impact</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Users size={14} className="text-blue-400" />
              <span className="text-base font-bold text-zinc-200">{metrics.totalAudience.toLocaleString()} Students</span>
            </div>
          </div>
          <div className="bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-2.5">
            <span className="text-xs text-zinc-500 font-medium block">Approved Session</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span className="text-base font-bold text-emerald-400">+{metrics.approvedToday}</span>
            </div>
          </div>
          <div className="bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-2.5">
            <span className="text-xs text-zinc-500 font-medium block">Rejected Session</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <X size={14} className="text-rose-400" />
              <span className="text-base font-bold text-rose-400">-{metrics.rejectedToday}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Table Interface Grid */}
      <GlassCard className="p-0 overflow-hidden flex flex-col">
        
        {/* Advanced Query Manipulation Engine Header */}
        <div className="p-4 bg-white/[0.02] border-b border-white/5 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search documents, text components, or faculty..."
              className="w-full bg-zinc-950/60 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
          </div>
          
          <div className="md:col-span-3">
            <select
              value={selectedDept}
              onChange={(e) => { setSelectedDept(e.target.value); setCurrentPage(1); }}
              className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-500/50 transition-all cursor-pointer"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Mathematics">Mathematics</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedPriority}
              onChange={(e) => { setSelectedPriority(e.target.value); setCurrentPage(1); }}
              className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-500/50 transition-all cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button 
              onClick={() => { setSearchQuery(""); setSelectedDept("All"); setSelectedPriority("All"); }}
              className="flex items-center justify-center gap-2 px-3 py-2 w-full bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white transition-colors"
            >
              <Filter size={14} /> Clear System Filters
            </button>
          </div>
        </div>

        {/* Data Matrix Area */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
            <thead>
              <tr className="bg-white/[0.01] border-b border-white/5 text-[11px] uppercase tracking-wider text-zinc-500 font-bold">
                <th className="p-4 w-[25%] pl-6">Faculty Requestor</th>
                <th className="p-4 w-[40%]">Document Blueprint Target</th>
                <th className="p-4 w-[20%]">Distribution Matrix</th>
                <th className="p-4 w-[15%] text-right pr-6">Action Interface</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {paginatedRequests.map((item) => (
                  <motion.tr
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30, backgroundColor: "rgba(239, 68, 68, 0.05)" }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className="hover:bg-white/[0.01] transition-colors group"
                  >
                    <td className="p-4 pl-6 vertical-top align-top">
                      <div className="font-semibold text-zinc-200 text-sm">{item.hod}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{item.dept}</div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] tracking-wide font-extrabold rounded-md border ${getPriorityStyles(item.priority)}`}>
                          {item.priority}
                        </span>
                        <span className="text-zinc-500 text-xs flex items-center gap-1">
                          <Clock size={11} /> {item.date}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-zinc-300 group-hover:text-blue-400 transition-colors mt-1.5 truncate pr-4">
                        {item.title}
                      </p>
                    </td>
                    <td className="p-4 align-top">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-zinc-900 border border-white/5 rounded-lg text-zinc-300">
                        <Users size={12} className="text-zinc-500" />
                        <span>{item.target}</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-1 pl-1">
                        Est: <span className="font-semibold text-zinc-400">{item.audienceCount.toLocaleString()}</span> nodes
                      </div>
                    </td>
                    <td className="p-4 align-top text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="p-2 text-zinc-400 hover:text-blue-400 bg-white/5 hover:bg-blue-500/10 rounded-lg border border-white/5 transition-all"
                          aria-label={`Review details for document ${item.title}`}
                          title="Detailed Audit View"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setActionConfirmation({ id: item.id, type: "APPROVE", title: item.title })}
                          className="p-2 text-zinc-400 hover:text-emerald-400 bg-white/5 hover:bg-emerald-500/10 rounded-lg border border-white/5 transition-all"
                          aria-label={`Direct approve ${item.title}`}
                          title="Instant Approvals Deployment"
                        >
                          <Check size={15} />
                        </button>
                        <button
                          onClick={() => setActionConfirmation({ id: item.id, type: "REJECT", title: item.title })}
                          className="p-2 text-zinc-400 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 rounded-lg border border-white/5 transition-all"
                          aria-label={`Direct reject ${item.title}`}
                          title="Administrative Rejection Form"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-16 text-center text-zinc-500">
                    <CheckCircle2 size={36} className="mx-auto mb-3 text-zinc-700 stroke-[1.5]" />
                    <p className="font-semibold text-zinc-300 text-base">Clear Backlog Queue</p>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                      All structural department approvals matching current logic indices have been processed.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Scalable Data Pagination Engine Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/5 bg-zinc-950/20 flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              Showing page <span className="text-zinc-300 font-semibold">{currentPage}</span> of <span className="text-zinc-300 font-semibold">{totalPages}</span> ({filteredRequests.length} results)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Primary Structural Presentation Layer: Detailed Audit Overlay */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="relative w-full max-w-3xl bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl z-10 overflow-hidden"
            >
              {/* Header Context Indicator */}
              <div className="flex justify-between items-start gap-4 pb-4 mb-5 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 text-[10px] font-black tracking-wide rounded border ${getPriorityStyles(selectedItem.priority)}`}>
                      {selectedItem.priority}
                    </span>
                    <span className="text-zinc-500 text-xs font-mono">{selectedItem.dept}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {selectedItem.title}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Origination Node: <span className="text-zinc-200 font-medium">{selectedItem.hod}</span> • Filed Timestamp: <span className="text-zinc-200">{selectedItem.date}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-zinc-500 hover:text-white bg-white/5 p-1.5 rounded-lg border border-white/5 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Verified Content Window Render Block */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Sanitized Document Payload</h4>
                  <div className="bg-zinc-950/60 border border-white/5 rounded-xl p-4 text-sm text-zinc-300 leading-relaxed max-h-[220px] overflow-y-auto custom-scrollbar">
                    {selectedItem.content}
                  </div>
                </div>

                {/* Conditional File Infrastructure Block */}
                {selectedItem.attachments.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Cryptographic File Hashes Attached</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedItem.attachments.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 bg-white/[0.02] border border-white/5 rounded-lg text-xs">
                          <div className="flex items-center gap-2 text-zinc-300 truncate">
                            <FileText size={14} className="text-blue-400 shrink-0" />
                            <span className="truncate">{file.name}</span>
                          </div>
                          <span className="text-zinc-500 font-mono text-[10px] ml-2 shrink-0">{file.size}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target Broadcast Pipeline Context Matrix */}
                <div className="bg-blue-500/[0.02] border border-blue-500/10 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                      <ArrowLeftRight size={15} />
                    </div>
                    <div>
                      <span className="text-xs text-zinc-400 block">Target Group Domain</span>
                      <span className="text-sm font-semibold text-blue-400">{selectedItem.target}</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-zinc-400 block">Calculated API Edge Endpoints</span>
                    <span className="text-sm font-mono font-bold text-zinc-200">{selectedItem.audienceCount.toLocaleString()} Network Targets</span>
                  </div>
                </div>
              </div>

              {/* Action Interface Strip */}
              <div className="flex flex-col sm:flex-row gap-2 justify-between items-center pt-5 mt-6 border-t border-white/5">
                <button
                  onClick={() => { /* Real core engine state logic hooks for modifications */ }}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all flex items-center justify-center gap-1.5"
                >
                  <MessageSquare size={14} /> Send Content Back to HoD
                </button>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setActionConfirmation({ id: selectedItem.id, type: "REJECT", title: selectedItem.title })}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/10 transition-colors"
                  >
                    Reject Payload
                  </button>
                  <button
                    onClick={() => setActionConfirmation({ id: selectedItem.id, type: "APPROVE", title: selectedItem.title })}
                    className="w-full sm:w-auto px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Check size={14} /> Authorize Deployment
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Secondary Guard Layer: Confirmation Execution Intermediary Modal */}
      <AnimatePresence>
        {actionConfirmation && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActionConfirmation(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-xl p-5 shadow-2xl z-10"
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl shrink-0 ${actionConfirmation.type === "APPROVE" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                  {actionConfirmation.type === "APPROVE" ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Confirm System Governance Execution
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    You are initiating structural execution on notice: <span className="text-zinc-200 font-medium">"{actionConfirmation.title}"</span>. This alteration cannot be instantly rolled back via the frontend client.
                  </p>
                </div>
              </div>

              {/* Dynamic Rejection Commentary Stream Block Injection */}
              {actionConfirmation.type === "REJECT" && (
                <div className="mt-4">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Reason for Execution Interruption (Sent to Faculty)</label>
                  <textarea
                    required
                    value={rejectionComment}
                    onChange={(e) => setRejectionComment(e.target.value)}
                    placeholder="Provide detailed explanations regarding editorial issues or regulatory non-compliance..."
                    className="w-full h-24 bg-zinc-950 border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500/40 transition-colors resize-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-white/5">
                <button
                  onClick={() => { setActionConfirmation(null); setRejectionComment(""); }}
                  className="px-3.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (actionConfirmation.type === "APPROVE") {
                      executeApproval(actionConfirmation.id);
                    } else {
                      executeRejection(actionConfirmation.id);
                    }
                  }}
                  disabled={actionConfirmation.type === "REJECT" && !rejectionComment.trim()}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    actionConfirmation.type === "APPROVE" 
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white" 
                      : "bg-rose-600 hover:bg-rose-500 text-white"
                  }`}
                >
                  {actionConfirmation.type === "APPROVE" ? "Confirm & Deploy" : "Confirm Rejection"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
