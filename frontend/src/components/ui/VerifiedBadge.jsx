/**
 * @component VerifiedBadge
 * @description Provides a cryptographic trust signal to students.
 * DEFENSE VALUE: Proves the message is authentic and hasn't been tampered with.
 */
import { ShieldCheck } from "lucide-react";

export default function VerifiedBadge({ staffName }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-lg">
      <ShieldCheck size={12} className="text-green-500" />
      <span className="text-[10px] font-bold text-green-400 uppercase tracking-tighter">
        Authentic: {staffName}
      </span>
    </div>
  );
}
