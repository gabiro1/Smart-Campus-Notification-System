import { useState, useEffect } from "react";
import leadershipService from "../../services/studentLeadershipService";
import { Shield, Users, Medal, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StudentLeadershipCard() {
  const [activeGP, setActiveGP] = useState(null);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const [gpRes, statsRes] = await Promise.all([
          leadershipService.getActiveGuildPresident().catch(() => ({ data: null })),
          leadershipService.getStats().catch(() => ({ data: {} })),
        ]);
        setActiveGP(gpRes?.data || null);
        setStats(statsRes?.data || {});
      } catch {}
    };
    fetch();
  }, []);

  if (!activeGP && !stats) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-emerald-500" />
          <h3 className="text-sm font-semibold text-foreground">Student Leadership</h3>
        </div>
      </div>

      {activeGP ? (
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-sm shrink-0">
            {activeGP.userId?.name?.charAt(0) || "G"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{activeGP.userId?.name || "Guild President"}</p>
            <p className="text-[10px] text-muted-foreground">Guild President (Elected)</p>
          </div>
          <Medal size={16} className="text-emerald-500 shrink-0" />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No active Guild President</p>
      )}

      {stats && (stats.activeClassReps > 0 || stats.totalClassReps > 0) && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Users size={14} />
          <span>{stats.activeClassReps} Active Class Representatives</span>
          <span className="text-muted-foreground/50">|</span>
          <span>{stats.totalClassReps} Total</span>
        </div>
      )}
    </div>
  );
}
