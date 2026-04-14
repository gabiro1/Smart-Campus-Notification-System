import React, { useState, useEffect, useMemo } from "react";
import apiClient from "../../../../services/apiClient";
import messageService from "../../../../services/messageService";
import { toast, Toaster } from "react-hot-toast";
import {
  Search,
  Plus,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  BookOpen,
  Mail,
  Phone,
  X,
  Loader2,
  MessageSquare,
  User,
  Activity,
  Clock,
  History,
  ShieldCheck,
  Send,
} from "lucide-react";

const LecturerManagement = () => {
  // --- CORE STATE ---
  const [activeTab, setActiveTab] = useState("manage"); // "manage" | "history"
  const [lecturers, setLecturers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // --- MODALS & PANELS ---
  const [assignModal, setAssignModal] = useState({
    isOpen: false,
    lecturerId: null,
  });
  const [selectedClassId, setSelectedClassId] = useState("");
  const [removeModal, setRemoveModal] = useState({
    isOpen: false,
    lecturerId: null,
    classId: null,
    className: "",
    lecturerName: "",
  });
  const [smsModal, setSmsModal] = useState({
    isOpen: false,
    lecturer: null,
    message: "",
  });
  const [detailsPanel, setDetailsPanel] = useState({
    isOpen: false,
    lecturer: null,
  });

  const [processingAction, setProcessingAction] = useState(false);

  // --- DATA FETCHING ---
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [lecturersRes, classesRes] = await Promise.all([
        apiClient.get("/classes/lecturers"),
        apiClient.get("/classes"),
      ]);

      setLecturers(
        Array.isArray(lecturersRes.data)
          ? lecturersRes.data
          : lecturersRes.data?.data || [],
      );
      setClasses(
        Array.isArray(classesRes.data)
          ? classesRes.data
          : classesRes.data?.data || [],
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load department data.",
      );
      toast.error("Data Sync Failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      // Calling the history endpoint we discussed
      const res = await messageService.getSentHistory(1);
      setHistory(res.data || []);
    } catch (err) {
      toast.error("Could not retrieve dispatch logs.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === "history") fetchHistory();
  }, [activeTab]);

  // --- ACTIONS ---
  const handleAssignClass = async (e) => {
    e.preventDefault();
    setProcessingAction(true);
    try {
      await apiClient.post(`/classes/assign/${assignModal.lecturerId}`, {
        classId: selectedClassId,
      });
      await fetchData();
      toast.success("Allocation updated successfully!");
      setAssignModal({ isOpen: false, lecturerId: null });
      setSelectedClassId("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error assigning class.");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRemoveClass = async () => {
    setProcessingAction(true);
    try {
      await apiClient.delete(
        `/classes/remove/${removeModal.lecturerId}/${removeModal.classId}`,
      );
      await fetchData();
      toast.success("Allocation revoked.");
      setRemoveModal({
        isOpen: false,
        lecturerId: null,
        classId: null,
        className: "",
        lecturerName: "",
      });
      if (detailsPanel.isOpen)
        setDetailsPanel({ isOpen: false, lecturer: null });
    } catch (err) {
      toast.error("Revoke failed.");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setProcessingAction(true);
    try {
      await messageService.sendStaffNotification({
        targetUserId: smsModal.lecturer.id || smsModal.lecturer._id,
        email: smsModal.lecturer.email,
        name: smsModal.lecturer.name,
        fcmToken: smsModal.lecturer.fcmToken,
        title: "Official Dispatch",
        message: smsModal.message,
      });

      toast.success("Omnichannel alert dispatched!");
      setSmsModal({ isOpen: false, lecturer: null, message: "" });
      if (activeTab === "history") fetchHistory(); // Refresh history if viewing it
    } catch (err) {
      toast.error("Dispatch Error: Target unreachable.");
    } finally {
      setProcessingAction(false);
    }
  };

  // --- FILTERING & PAGINATION ---
  const filteredLecturers = useMemo(() => {
    return (lecturers || []).filter(
      (l) =>
        (l?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l?.email || "").toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [lecturers, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLecturers.length / itemsPerPage),
  );
  const paginatedLecturers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLecturers.slice(start, start + itemsPerPage);
  }, [filteredLecturers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="w-full min-h-screen bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-background text-foreground p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <Toaster position="top-right" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-foreground mb-2">
              Staff Command
            </h1>
            <p className="text-muted-foreground text-sm">
              Orchestrate department allocations and omnichannel communications.
            </p>
          </div>

          {/* Tab Navigation System */}
          <div className="flex p-1.5 bg-accent backdrop-blur-xl rounded-2xl border border-border w-fit">
            <button
              onClick={() => setActiveTab("manage")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "manage" ? "bg-blue-600 text-foreground shadow-lg shadow-blue-600/20" : "text-muted-foreground hover:text-foreground"}`}
            >
              <User size={14} /> DIRECTORY
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "history" ? "bg-blue-600 text-foreground shadow-lg shadow-blue-600/20" : "text-muted-foreground hover:text-foreground"}`}
            >
              <History size={14} /> DISPATCH LOGS
            </button>
          </div>
        </header>

        {activeTab === "manage" ? (
          <>
            {/* Search & Filter Bar */}
            <div className="relative w-full md:w-96 mb-8 group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-400 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Search staff database..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-accent border border-border rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-blue-500/50 focus:bg-accent transition-all shadow-2xl"
              />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="animate-spin text-blue-500" size={40} />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedLecturers.map((lecturer) => (
                    <div
                      key={lecturer.id || lecturer._id}
                      className="group bg-accent backdrop-blur-xl border border-border rounded-[2.5rem] p-6 hover:border-blue-500/30 transition-all hover:-translate-y-2 cursor-pointer relative overflow-hidden"
                      onClick={() =>
                        setDetailsPanel({ isOpen: true, lecturer })
                      }
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-border flex items-center justify-center font-black text-2xl text-blue-400">
                          {lecturer.name?.charAt(0)}
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border ${lecturer.assignedClasses?.length > 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-neutral-500/10 text-muted-foreground border-neutral-500/20"}`}
                        >
                          {lecturer.assignedClasses?.length > 0
                            ? "ACTIVE"
                            : "IDLE"}
                        </div>
                      </div>

                      <h3 className="text-xl font-black mb-1 group-hover:text-blue-400 transition-colors">
                        {lecturer.name}
                      </h3>
                      <p className="text-muted-foreground text-xs font-medium mb-6 flex items-center gap-2">
                        <Mail size={12} /> {lecturer.email}
                      </p>

                      <div className="bg-black/40 rounded-2xl p-4 border border-border mb-8">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            Workload
                          </span>
                          <span className="text-xs font-bold text-blue-400">
                            {lecturer.assignedClasses?.length || 0} Modules
                          </span>
                        </div>
                        <div className="w-full bg-accent h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full transition-all duration-1000"
                            style={{
                              width: `${Math.min((lecturer.assignedClasses?.length || 0) * 25, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div
                        className="flex gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() =>
                            setSmsModal({ isOpen: true, lecturer, message: "" })
                          }
                          className="flex-1 bg-accent hover:bg-accent border border-border rounded-xl py-3 text-[10px] font-black flex items-center justify-center gap-2 transition-all"
                        >
                          <MessageSquare size={14} /> NOTIFY
                        </button>
                        <button
                          onClick={() =>
                            setAssignModal({
                              isOpen: true,
                              lecturerId: lecturer.id || lecturer._id,
                            })
                          }
                          className="flex-1 bg-blue-600 hover:bg-blue-500 rounded-xl py-3 text-[10px] font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                        >
                          <Plus size={14} /> ALLOCATE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="mt-12 flex items-center justify-center gap-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-3 bg-accent border border-border rounded-2xl disabled:opacity-20 hover:bg-accent transition-all"
                  >
                    <ChevronLeft />
                  </button>
                  <span className="text-xs font-black tracking-widest text-muted-foreground uppercase">
                    Page {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-3 bg-accent border border-border rounded-2xl disabled:opacity-20 hover:bg-accent transition-all"
                  >
                    <ChevronRight />
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          /* --- DISPATCH LOGS / HISTORY VIEW --- */
          <div className="bg-accent backdrop-blur-xl border border-border rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            {historyLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-blue-500" size={30} />
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.03] text-muted-foreground uppercase text-[10px] font-black tracking-widest border-b border-border">
                  <tr>
                    <th className="px-8 py-6">Recipient</th>
                    <th className="px-8 py-6">Message Content</th>
                    <th className="px-8 py-6">Dispatch Date</th>
                    <th className="px-8 py-6 text-right">Channels</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {history.map((log) => (
                    <tr
                      key={log._id}
                      className="hover:bg-accent transition-colors"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-accent border border-border flex items-center justify-center text-xs font-bold text-blue-400">
                            {log.studentId?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-xs">
                              {log.studentId?.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-medium">
                              {log.studentId?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-muted-foreground max-w-xs truncate italic text-xs">
                        "{log.message}"
                      </td>
                      <td className="px-8 py-5 text-muted-foreground text-xs font-medium">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <span
                            className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/10"
                            title="Email dispatched"
                          >
                            <Mail size={14} />
                          </span>
                          <span
                            className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/10"
                            title="Push alert dispatched"
                          >
                            <Activity size={14} />
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-20 text-muted-foreground font-bold uppercase tracking-widest text-xs"
                      >
                        No dispatch records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* --- NOTIFY MODAL (OMNICHANNEL) --- */}
      {smsModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="bg-background border border-border rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black mb-1 flex items-center gap-2 text-foreground">
              <ShieldCheck className="text-blue-500" /> Dispatch Memo
            </h3>
            <p className="text-muted-foreground text-xs font-medium mb-8">
              Send an official administrative alert to{" "}
              <b>{smsModal.lecturer.name}</b> via Email & Push.
            </p>

            <form onSubmit={handleSendNotification}>
              <div className="mb-6">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 block">
                  Official Message
                </label>
                <textarea
                  required
                  value={smsModal.message}
                  onChange={(e) =>
                    setSmsModal({ ...smsModal, message: e.target.value })
                  }
                  placeholder="Type the assignment or department update here..."
                  className="w-full bg-accent border border-border rounded-2xl p-5 text-sm min-h-[160px] outline-none focus:border-blue-500 transition-all text-foreground custom-scrollbar shadow-inner"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setSmsModal({ isOpen: false, lecturer: null, message: "" })
                  }
                  className="flex-1 py-4 text-xs font-black text-muted-foreground hover:text-foreground transition-all"
                >
                  CANCEL
                </button>
                <button
                  disabled={processingAction || !smsModal.message.trim()}
                  className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-xs font-black tracking-widest shadow-lg shadow-blue-600/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {processingAction ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <>
                      <Send size={14} /> DISPATCH NOW
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SLIDE-OVER DETAILS PANEL --- */}
      {detailsPanel.isOpen && detailsPanel.lecturer && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            onClick={() => setDetailsPanel({ isOpen: false, lecturer: null })}
          ></div>
          <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-background border-l border-border z-[120] p-10 animate-in slide-in-from-right duration-500 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
            <button
              onClick={() => setDetailsPanel({ isOpen: false, lecturer: null })}
              className="absolute top-8 right-8 p-3 hover:bg-accent rounded-2xl transition-all text-muted-foreground hover:text-foreground"
            >
              <X />
            </button>

            <div className="flex flex-col items-center text-center mt-12 mb-12">
              <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-border flex items-center justify-center text-4xl font-black text-blue-400 mb-6 shadow-2xl shadow-blue-500/10">
                {detailsPanel.lecturer.name.charAt(0)}
              </div>
              <h2 className="text-3xl font-black mb-1">
                {detailsPanel.lecturer.name}
              </h2>
              <p className="text-muted-foreground text-sm font-medium mb-6 uppercase tracking-widest">
                Senior Faculty Member
              </p>
              <div className="flex gap-4">
                <span className="flex items-center gap-2 px-4 py-2 bg-accent rounded-xl text-xs font-bold border border-border">
                  <Mail size={12} /> EMAIL
                </span>
                <span className="flex items-center gap-2 px-4 py-2 bg-accent rounded-xl text-xs font-bold border border-border">
                  <Phone size={12} /> CALL
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div className="mb-10">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Course Allocations
                  </h4>
                  <button
                    onClick={() =>
                      setAssignModal({
                        isOpen: true,
                        lecturerId:
                          detailsPanel.lecturer.id || detailsPanel.lecturer._id,
                      })
                    }
                    className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/10 hover:bg-blue-500/20 transition-all"
                  >
                    + ADD NEW
                  </button>
                </div>
                <div className="space-y-4">
                  {detailsPanel.lecturer.assignedClasses?.map((cls) => (
                    <div
                      key={cls.id}
                      className="group flex items-center justify-between p-5 bg-accent border border-border rounded-3xl hover:border-blue-500/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center">
                          <BookOpen size={18} />
                        </div>
                        <div>
                          <p className="font-black text-sm">{cls.name}</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">
                            {cls.code} • Level {cls.level}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRemoveModal({
                            isOpen: true,
                            lecturerId:
                              detailsPanel.lecturer.id ||
                              detailsPanel.lecturer._id,
                            classId: cls.id,
                            className: cls.name,
                            lecturerName: detailsPanel.lecturer.name,
                          });
                        }}
                        className="p-3 text-red-400 hover:bg-red-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                setSmsModal({
                  isOpen: true,
                  lecturer: detailsPanel.lecturer,
                  message: "",
                })
              }
              className="mt-6 w-full py-5 bg-accent border border-border rounded-3xl text-xs font-black tracking-widest hover:bg-accent transition-all flex items-center justify-center gap-3"
            >
              <Send size={14} /> DISPATCH DIRECTIVE
            </button>
          </div>
        </>
      )}

      {/* --- ALLOCATE CLASS MODAL --- */}
      {assignModal.isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="bg-background border border-border rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
              <BookOpen className="text-blue-500" /> Module Allocation
            </h3>
            <form onSubmit={handleAssignClass}>
              <div className="mb-8">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 block">
                  Available Modules
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full bg-accent border border-border rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-all appearance-none text-foreground font-bold shadow-inner"
                >
                  <option value="" className="bg-black">
                    Choose module...
                  </option>
                  {classes.map((c) => (
                    <option
                      key={c.id || c._id}
                      value={c.id || c._id}
                      className="bg-black"
                    >
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setAssignModal({ isOpen: false, lecturerId: null })
                  }
                  className="flex-1 py-4 text-xs font-black text-muted-foreground hover:text-foreground transition-all"
                >
                  CANCEL
                </button>
                <button
                  disabled={!selectedClassId || processingAction}
                  className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-xs font-black tracking-widest disabled:opacity-50 shadow-lg shadow-blue-600/30"
                >
                  {processingAction ? (
                    <Loader2 className="animate-spin mx-auto" />
                  ) : (
                    "UPDATE LOAD"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- REMOVE MODAL --- */}
      {removeModal.isOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="bg-background border border-red-500/20 rounded-[2.5rem] w-full max-w-xs p-8 shadow-2xl text-center">
            <div className="w-20 h-20 bg-red-500/10 border border-red-500/10 rounded-[2rem] flex items-center justify-center text-red-500 mx-auto mb-6">
              <AlertTriangle size={36} />
            </div>
            <h3 className="text-xl font-black mb-2 text-foreground italic underline">
              SECURITY CHECK
            </h3>
            <p className="text-muted-foreground text-xs font-medium mb-8">
              Revoke <b>{removeModal.className}</b> from{" "}
              <b>{removeModal.lecturerName}</b>?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setRemoveModal({ isOpen: false })}
                className="flex-1 py-3 text-xs font-black text-muted-foreground"
              >
                CANCEL
              </button>
              <button
                onClick={handleRemoveClass}
                className="flex-1 py-3 bg-red-600 rounded-2xl text-xs font-black shadow-lg shadow-red-600/30"
              >
                REVOKE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerManagement;
