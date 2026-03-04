const COLORS = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };

export default function PriorityDot({ priority }) {
  return (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: COLORS[priority] || "#6b7280",
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}
