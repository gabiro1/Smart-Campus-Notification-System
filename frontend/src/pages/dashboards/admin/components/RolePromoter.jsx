/**
 * @component RolePromoter
 * @description Used by Super-Admins to elevate a student to a specific Committee Title.
 * Logic: When 'Student Committee' is selected, a sub-role dropdown appears.
 */

import { useState } from "react";
import { UserPlus, ShieldCheck } from "lucide-react";

const COMMITTEE_TITLES = [
  "President",
  "Vice President",
  "Speaker",
  "Minister of Finance",
  "Minister of Sports",
  "Minister of Welfare",
];

export default function RolePromoter({ userName }) {
  const [mainRole, setMainRole] = useState("Student");
  const [subRole, setSubRole] = useState("");

  return (
    <div className="glass p-6 rounded-3xl border border-white/10 space-y-4">
      <h3 className="text-sm font-bold flex items-center gap-2">
        <UserPlus size={16} className="text-blue-500" />
        Assign Role: {userName}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main Role Selection */}
        <select
          onChange={(e) => setMainRole(e.target.value)}
          className="bg-neutral-900 border border-white/10 rounded-xl p-3 text-sm outline-none text-white"
        >
          <option value="Student">Student (Default)</option>
          <option value="Lecturer">Lecturer</option>
          <option value="HoD">HoD</option>
          <option value="StudCommittee">Student Committee</option>
        </select>

        {/* Dynamic Sub-Role Selection (Only shows if StudCommittee is picked) */}
        {mainRole === "StudCommittee" && (
          <select
            onChange={(e) => setSubRole(e.target.value)}
            className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-3 text-sm outline-none text-blue-400 animate-in fade-in slide-in-from-left-2"
          >
            <option value="">Select Title...</option>
            {COMMITTEE_TITLES.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
        )}
      </div>

      {subRole && (
        <div className="flex items-center gap-2 text-[10px] text-green-400 font-bold uppercase p-2 bg-green-500/5 rounded-lg border border-green-500/10">
          <ShieldCheck size={12} />
          Confirmed: User will broadcast as "The Office of the {subRole}"
        </div>
      )}
    </div>
  );
}
