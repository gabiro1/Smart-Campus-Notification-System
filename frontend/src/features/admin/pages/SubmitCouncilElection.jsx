import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Send, Search, Vote, X, Loader2, Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2, Menu } from "lucide-react";
import * as XLSX from "xlsx";
import userService from "../../../services/userService";
import leadershipService from "../../../services/studentLeadershipService";

export default function SubmitCouncilElection() {
  const [electionId, setElectionId] = useState("");
  const [positions, setPositions] = useState([
    { title: "President", userId: "", voteCount: "", totalVotes: "", runnerUp: "", _userName: "", _userEmail: "" },
  ]);
  const [voterTurnout, setVoterTurnout] = useState("");
  const [eligibleVoters, setEligibleVoters] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [searchingUser, setSearchingUser] = useState(false);
  const [showUserPicker, setShowUserPicker] = useState(null);

  const [message, setMessage] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  const searchUsers = async (query) => {
    if (query.length < 2) { setUserResults([]); return; }
    setSearchingUser(true);
    try {
      const res = await userService.searchUsers(query);
      setUserResults(res?.data || []);
    } catch { setUserResults([]); }
    setSearchingUser(false);
  };

  useEffect(() => {
    if (userSearch.length < 2) { setUserResults([]); return; }
    const timer = setTimeout(() => searchUsers(userSearch), 300);
    return () => clearTimeout(timer);
  }, [userSearch]);

  const selectUser = (idx, user) => {
    const updated = [...positions];
    updated[idx] = { ...updated[idx], userId: user._id, _userName: user.name, _userEmail: user.email };
    setPositions(updated);
    setShowUserPicker(null);
    setUserSearch("");
    setUserResults([]);
  };

  const addPosition = () => {
    setPositions([...positions, { title: "", userId: "", voteCount: "", totalVotes: "", runnerUp: "", _userName: "", _userEmail: "" }]);
  };

  const removePosition = (idx) => {
    if (positions.length <= 1) return;
    setPositions(positions.filter((_, i) => i !== idx));
  };

  const updatePosition = (idx, field, value) => {
    const updated = [...positions];
    updated[idx] = { ...updated[idx], [field]: value };
    setPositions(updated);
  };

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      ["Title", "Candidate Email", "Vote Count", "Total Votes", "Runner Up"],
      ["President", "john.doe@university.edu", "3200", "5000", "Jane Smith"],
      ["Vice President", "jane.smith@university.edu", "2800", "5000", "Bob Brown"],
      ["Treasurer", "bob.brown@university.edu", "2500", "5000", ""],
      ["Secretary", "alice.lee@university.edu", "2200", "5000", ""],
      ["Financial Secretary", "chris.evans@university.edu", "2000", "5000", ""],
      ["Public Relations Officer", "diana.garcia@university.edu", "2100", "5000", ""],
      ["Welfare Director", "frank.obi@university.edu", "1900", "5000", ""],
      ["Sports Director", "grace.nkosi@university.edu", "1800", "5000", ""],
      ["Academic Director", "henry.park@university.edu", "1750", "5000", ""],
      ["Entertainment Director", "isabel.torres@university.edu", "1700", "5000", ""],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 25 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws, "Council Positions");
    XLSX.writeFile(wb, "guild-council-template.xlsx");
  };

  const lookupUserByEmail = async (email) => {
    try {
      const res = await userService.searchUsers(email);
      const users = res?.data || [];
      return users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) || null;
    } catch {
      return null;
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setMessage(null);
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const headerRow = rows.findIndex((r) =>
        r.some((c) => typeof c === "string" && c.toLowerCase().includes("title"))
      );
      if (headerRow === -1) {
        setMessage({ type: "error", text: "Could not find a 'Title' column header in the first sheet." });
        setParsing(false);
        return;
      }

      const headers = rows[headerRow].map((h) => String(h).toLowerCase().trim());
      const titleIdx = headers.findIndex((h) => h.includes("title"));
      const emailIdx = headers.findIndex((h) => h.includes("email"));
      const votesIdx = headers.findIndex((h) => h.includes("vote count") || h.includes("votes received") || (h.includes("vote") && h.includes("count")));
      const totalIdx = headers.findIndex((h) => h.includes("total votes") || (h.includes("total") && h.includes("vote")));
      const runnerIdx = headers.findIndex((h) => h.includes("runner") || h.includes("runner-up") || h.includes("runner up"));

      if (titleIdx === -1) {
        setMessage({ type: "error", text: "Excel must have a 'Title' column." });
        setParsing(false);
        return;
      }
      if (emailIdx === -1) {
        setMessage({ type: "error", text: "Excel must have a 'Candidate Email' column." });
        setParsing(false);
        return;
      }

      const dataRows = rows.slice(headerRow + 1).filter((r) => r[titleIdx] && String(r[titleIdx]).trim());
      if (dataRows.length === 0) {
        setMessage({ type: "error", text: "No data rows found after the header." });
        setParsing(false);
        return;
      }

      const parsed = [];
      for (const row of dataRows) {
        const email = String(row[emailIdx] || "").trim();
        let user = null;
        if (email) {
          user = await lookupUserByEmail(email);
        }
        parsed.push({
          title: String(row[titleIdx] || "").trim(),
          userId: user?._id || "",
          _userName: user?.name || "",
          _userEmail: user?.email || email || "",
          voteCount: String(row[votesIdx] ?? ""),
          totalVotes: String(row[totalIdx] ?? ""),
          runnerUp: String(row[runnerIdx] || "").trim(),
          _notFound: !user && !!email,
        });
      }

      const notFound = parsed.filter((p) => p._notFound);
      if (notFound.length > 0) {
        setMessage({
          type: "warning",
          text: `${notFound.length} candidate(s) could not be matched by email (they will still be added — you can assign manually).`,
        });
      } else {
        setMessage({ type: "success", text: `Parsed ${parsed.length} positions from "${file.name}". Review and submit.` });
      }

      setPositions(parsed);
    } catch (err) {
      console.error("Parse error:", err);
      setMessage({ type: "error", text: "Failed to parse Excel file. Check the format and try again." });
    }
    setParsing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!electionId.trim()) { setMessage({ type: "error", text: "Election ID is required" }); return; }

    const emptyTitles = positions.some((p) => !p.title.trim());
    const noCandidates = positions.some((p) => !p.userId && !p._notFound);
    if (emptyTitles) { setMessage({ type: "error", text: "All positions must have a title" }); return; }
    if (noCandidates) { setMessage({ type: "error", text: "All positions must have a candidate assigned (search and select)" }); return; }

    setSubmitting(true);
    setMessage(null);
    try {
      const payload = {
        electionId: electionId.trim(),
        positions: positions.map((p) => ({
          title: p.title.trim(),
          userId: p.userId,
          voteCount: parseInt(p.voteCount) || 0,
          totalVotes: parseInt(p.totalVotes) || 0,
          runnerUp: p.runnerUp || "",
        })),
        voterTurnout: parseInt(voterTurnout) || 0,
        eligibleVoters: parseInt(eligibleVoters) || 0,
      };
      await leadershipService.submitCouncilElection(payload);
      setMessage({ type: "success", text: "Council election submitted for principal approval!" });
      setElectionId("");
      setPositions([{ title: "President", userId: "", voteCount: "", totalVotes: "", runnerUp: "", _userName: "", _userEmail: "" }]);
      setVoterTurnout("");
      setEligibleVoters("");
      setFileName("");
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to submit election" });
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="p-3 rounded-xl bg-amber-500/10 shrink-0 self-start">
          <Vote size={24} className="text-amber-500" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Submit Guild Council Election</h1>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Upload an Excel file with the full election results, or enter each position manually.
            The principal will review and approve the entire council at once.
          </p>
        </div>
      </div>

      {message && (
        <div className={`px-4 sm:px-5 py-3.5 rounded-xl text-sm font-medium border flex items-start gap-3 ${
          message.type === "success" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
          message.type === "warning" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
          "bg-red-500/10 text-red-500 border-red-500/20"
        }`}>
          {message.type === "success" ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> :
           <AlertCircle size={18} className="mt-0.5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        <section className="bg-card border border-border rounded-xl sm:rounded-2xl p-5 sm:p-7 space-y-5">
          <h2 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-widest">Election Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Election ID <span className="text-red-500">*</span></label>
              <input value={electionId} onChange={(e) => setElectionId(e.target.value)}
                placeholder="e.g., GUILD-2025-2026"
                className="w-full px-3.5 py-2.5 sm:py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Voter Turnout</label>
              <input type="number" min="0" value={voterTurnout} onChange={(e) => setVoterTurnout(e.target.value)}
                placeholder="e.g., 2450"
                className="w-full px-3.5 py-2.5 sm:py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Eligible Voters</label>
              <input type="number" min="0" value={eligibleVoters} onChange={(e) => setEligibleVoters(e.target.value)}
                placeholder="e.g., 5000"
                className="w-full px-3.5 py-2.5 sm:py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
            </div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-xl sm:rounded-2xl p-5 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-widest">Excel Upload</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Columns: <strong>Title, Candidate Email, Vote Count, Total Votes, Runner Up</strong>
              </p>
            </div>
            <button type="button" onClick={downloadTemplate}
              className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-all text-xs font-medium"
            ><Download size={15} /> Download Template</button>
          </div>
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl sm:rounded-2xl p-8 sm:p-10 md:p-12 text-center cursor-pointer transition-all hover:border-blue-500/50 hover:bg-blue-500/5 ${
              fileName ? "border-emerald-500/40 bg-emerald-500/5" : "border-border"
            }`}
          >
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileUpload} />
            {parsing ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={36} className="animate-spin text-blue-500" />
                <p className="text-sm text-muted-foreground">Parsing file...</p>
              </div>
            ) : fileName ? (
              <div className="flex flex-col items-center gap-3">
                <FileSpreadsheet size={40} className="text-emerald-500" />
                <p className="text-sm sm:text-base font-medium text-foreground">{fileName}</p>
                <p className="text-xs text-muted-foreground">Tap or click to replace</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-full bg-muted/50">
                  <Upload size={28} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-medium text-foreground">Drop Excel file here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">Supports .xlsx and .xls files</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="bg-card border border-border rounded-xl sm:rounded-2xl p-5 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-widest">
                Council Positions
                <span className="ml-2 text-xs font-normal text-muted-foreground lowercase">({positions.length} total)</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Review and edit each position before submitting</p>
            </div>
            <button type="button" onClick={addPosition}
              className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500/20 transition-all text-xs font-medium"
            ><Plus size={15} /> Add Position</button>
          </div>

          <div className="space-y-4 sm:space-y-5">
            {positions.map((pos, idx) => (
              <div key={idx} className={`bg-background border rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 transition-all ${
                pos._notFound ? "border-amber-500/40 bg-amber-500/[0.03]" : "border-border"
              }`}>
                <div className="flex items-center justify-between mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-border/50">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                      {pos.title || "New Position"}
                    </span>
                    {pos._notFound && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-medium">
                        <AlertCircle size={10} /> Unmatched
                      </span>
                    )}
                  </div>
                  {positions.length > 1 && (
                    <button type="button" onClick={() => removePosition(idx)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-all text-xs font-medium"
                    ><Trash2 size={13} /> Remove</button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Title <span className="text-red-500">*</span></label>
                    <input value={pos.title} onChange={(e) => updatePosition(idx, "title", e.target.value)}
                      placeholder="e.g., Vice President"
                      className="w-full px-3.5 py-2.5 sm:py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      list="position-titles" required />
                    <datalist id="position-titles">
                      <option value="President" /><option value="Vice President" /><option value="Treasurer" />
                      <option value="Secretary" /><option value="Financial Secretary" /><option value="Public Relations Officer" />
                      <option value="Welfare Director" /><option value="Sports Director" /><option value="Academic Director" />
                      <option value="Entertainment Director" />
                    </datalist>
                  </div>

                  <div className="lg:col-span-1">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Candidate <span className="text-red-500">*</span></label>
                    {pos._userName ? (
                      <div className="flex items-center justify-between px-3.5 py-2.5 sm:py-2 bg-background border border-border rounded-xl gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {pos._userName.charAt(0)}
                            </span>
                            {pos._userName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate pl-8">{pos._userEmail}</p>
                        </div>
                        <button type="button" onClick={() => {
                          const updated = [...positions];
                          updated[idx] = { ...updated[idx], userId: "", _userName: "", _userEmail: "" };
                          setPositions(updated);
                        }} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg shrink-0"><X size={14} /></button>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="flex items-center gap-2.5 px-3.5 py-2.5 sm:py-2 bg-background border border-border rounded-xl cursor-pointer hover:border-blue-500/50 transition-all"
                          onClick={() => setShowUserPicker(showUserPicker === idx ? null : idx)}>
                          <Search size={15} className="text-muted-foreground shrink-0" />
                          <span className="text-sm text-muted-foreground">Search for a student...</span>
                        </div>
                        {showUserPicker === idx && (
                          <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-xl z-10 overflow-hidden">
                            <div className="p-2.5 border-b border-border/50">
                              <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                                placeholder="Type name or email..."
                                className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                autoFocus />
                            </div>
                            <div className="max-h-48 overflow-y-auto divide-y divide-border/50">
                              {searchingUser && (
                                <p className="px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
                                  <Loader2 size={12} className="animate-spin" /> Searching...
                                </p>
                              )}
                              {!searchingUser && userResults.length === 0 && userSearch.length >= 2 && (
                                <p className="px-4 py-3 text-xs text-muted-foreground">No students found</p>
                              )}
                              {userResults.map((u) => (
                                <button key={u._id} type="button" onClick={() => selectUser(idx, u)}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-all text-left"
                                >
                                  <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-bold shrink-0">{u.name?.charAt(0)}</div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{u.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Votes</label>
                      <input type="number" min="0" value={pos.voteCount} onChange={(e) => updatePosition(idx, "voteCount", e.target.value)}
                        placeholder="0" className="w-full px-3.5 py-2.5 sm:py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Total</label>
                      <input type="number" min="0" value={pos.totalVotes} onChange={(e) => updatePosition(idx, "totalVotes", e.target.value)}
                        placeholder="0" className="w-full px-3.5 py-2.5 sm:py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Runner-up</label>
                    <input value={pos.runnerUp} onChange={(e) => updatePosition(idx, "runnerUp", e.target.value)}
                      placeholder="e.g., John Doe"
                      className="w-full px-3.5 py-2.5 sm:py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="sticky bottom-4 sm:static bg-background sm:bg-transparent border border-border sm:border-0 rounded-xl sm:rounded-none p-4 sm:p-0 shadow-lg sm:shadow-none">
          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 sm:py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 active:bg-blue-700 transition-all text-sm font-medium disabled:opacity-50 shadow-sm"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {submitting ? "Submitting..." : "Submit Council Election for Approval"}
          </button>
        </div>
      </form>
    </div>
  );
}
