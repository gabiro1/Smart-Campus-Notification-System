export default function Toast({ toasts, removeToast }) {
  const colors = { error: "#ef4444", success: "#10b981", info: "#3b82f6" };
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: colors[t.type] || colors.info,
            color: "#fff",
            padding: "12px 18px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            maxWidth: 300,
            animation: "slideIn 0.3s ease",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <span style={{ flex: 1 }}>{t.msg}</span>
          <button
            onClick={() => removeToast(t.id)}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
