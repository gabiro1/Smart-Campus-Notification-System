export default function ToggleSwitch({ enabled, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => { if (onChange) onChange(!enabled); }}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-all duration-150 ${
        enabled ? "bg-success" : "bg-muted"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-background transition-transform duration-150 ${
          enabled ? "translate-x-[18px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}
