/**
 * @component LanguageToggle
 * @description Ensures the system is inclusive for all members of the UR community.
 */
export default function LanguageToggle() {
  return (
    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
      <button className="px-3 py-1 text-xs font-bold bg-blue-600 rounded-lg text-white">
        EN
      </button>
      <button className="px-3 py-1 text-xs font-bold text-neutral-500 hover:text-white transition-colors">
        KN
      </button>
    </div>
  );
}
