import Icon, { ICONS } from "./Icon";

export default function Stars({ value = 0, onChange, readonly = false }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.round(value);
        return (
          <button
            key={i}
            onClick={() => !readonly && onChange && onChange(i)}
            style={{
              background: "none",
              border: "none",
              cursor: readonly ? "default" : "pointer",
              padding: 0,
              color: filled ? "#f59e0b" : "#374151",
            }}
          >
            <Icon
              d={ICONS.star}
              size={14}
              fill={filled ? "#f59e0b" : "none"}
              stroke={filled ? "#f59e0b" : "#374151"}
            />
          </button>
        );
      })}
    </div>
  );
}
