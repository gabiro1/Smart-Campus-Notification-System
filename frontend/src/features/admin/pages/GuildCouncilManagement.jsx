import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Plus, Trash2, UserPlus, X, Search } from "lucide-react";
import toast from "react-hot-toast";
import guildCouncilService from "../../../services/guildCouncilService";

export default function GuildCouncilManagement() {
  const [positions, setPositions] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [regNumber, setRegNumber] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [assigning, setAssigning] = useState(false);

  const [showAddPosition, setShowAddPosition] = useState(false);
  const [newPositionName, setNewPositionName] = useState("");
  const [addingPosition, setAddingPosition] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [posRes, memRes] = await Promise.all([
        guildCouncilService.getPositions(),
        guildCouncilService.getMembers(),
      ]);
      const pos = posRes.data || [];
      setPositions(pos);
      setMembers(memRes.data || []);
      if (!selectedPosition && pos.length > 0) {
        setSelectedPosition(pos[0].name);
      }
    } catch {
      toast.error("Failed to load guild council data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!regNumber.trim() || !selectedPosition) {
      toast.error("Enter a registration number and select a position");
      return;
    }

    setAssigning(true);
    try {
      const res = await guildCouncilService.assignPosition(regNumber.trim(), selectedPosition);
      toast.success(res.message || "Position assigned");
      setRegNumber("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign position");
    } finally {
      setAssigning(false);
    }
  };

  const handleAddPosition = async () => {
    if (!newPositionName.trim()) {
      toast.error("Enter a position name");
      return;
    }
    setAddingPosition(true);
    try {
      await guildCouncilService.addPosition(newPositionName.trim());
      toast.success("Position added");
      setNewPositionName("");
      setShowAddPosition(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add position");
    } finally {
      setAddingPosition(false);
    }
  };

  const handleRemovePosition = async (positionId, name) => {
    try {
      await guildCouncilService.deletePosition(positionId);
      toast.success(`"${name}" removed`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove position");
    }
  };

  const handleRemoveMember = async (userId, name) => {
    try {
      await guildCouncilService.removePosition(userId);
      toast.success(`Removed ${name} from guild council`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove member");
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Crown size={20} className="text-amber-500" />
          Guild Council
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Assign yearly guild council positions to students by registration number. Assignments apply immediately — no approval required.
          The Guild President also gains event creation &amp; approval access.
        </p>
      </div>

      {/* Assign form */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <UserPlus size={16} className="text-blue-500" />
          Assign Position
        </h2>
        <form onSubmit={handleAssign} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              placeholder="Student registration number"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 sm:w-56"
          >
            {positions.map((p) => (
              <option key={p._id} value={p.name}>{p.name}</option>
            ))}
          </select>

          <button
            type="submit"
            disabled={assigning}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {assigning ? "Assigning..." : "Assign"}
          </button>
        </form>

        {/* Manage position catalog */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">Available positions</p>
            {!showAddPosition && (
              <button
                onClick={() => setShowAddPosition(true)}
                className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 transition-colors"
              >
                <Plus size={12} /> Add position
              </button>
            )}
          </div>

          {showAddPosition && (
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newPositionName}
                onChange={(e) => setNewPositionName(e.target.value)}
                placeholder="e.g. Treasurer"
                autoFocus
                className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button
                onClick={handleAddPosition}
                disabled={addingPosition}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={() => { setShowAddPosition(false); setNewPositionName(""); }}
                className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {positions.map((p) => (
              <span
                key={p._id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-accent text-foreground border border-border"
              >
                {p.isPresident && <Crown size={10} className="text-amber-500" />}
                {p.name}
                {!p.isPresident && (
                  <button
                    onClick={() => handleRemovePosition(p._id, p.name)}
                    className="text-muted-foreground hover:text-red-500 transition-colors"
                    title="Remove position"
                  >
                    <X size={10} />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Current members */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Current Guild Council</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Crown size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No guild council members assigned yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Reg. Number</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Position</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {members.map((m) => (
                    <motion.tr
                      key={m._id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-2.5 text-foreground font-medium">{m.name}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{m.registrationNumber || "-"}</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-500">
                          {m.guildPosition === "Guild President" && <Crown size={10} />}
                          {m.guildPosition}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => handleRemoveMember(m._id, m.name)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                          title="Remove from guild council"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
