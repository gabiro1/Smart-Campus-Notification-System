import Icon, { ICONS } from "../ui/Icon";

const S = {
  input: {
    background: "#161b22",
    border: "1px solid #2d3748",
    borderRadius: 10,
    padding: "10px 14px",
    color: "#e2e8f0",
    fontSize: 13,
    width: "100%",
    outline: "none",
    fontFamily: "inherit",
    colorScheme: "dark",
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    display: "block",
    marginBottom: 6,
  },
};

export default function ReminderModal({
  mode,
  form,
  setForm,
  onSave,
  onClose,
}) {
  // mode: "new" | "edit"
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000000bb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#0d1117",
          border: "1px solid #1f2937",
          borderRadius: 16,
          padding: 28,
          width: "100%",
          maxWidth: 440,
          animation: "fadeUp 0.25s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9" }}>
            {mode === "new" ? "New Reminder" : "Edit Reminder"}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            <Icon d={ICONS.x} size={18} />
          </button>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={S.label}>Title *</label>
            <input
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="Reminder title…"
              style={S.input}
            />
          </div>

          <div>
            <label style={S.label}>Note</label>
            <input
              value={form.note || ""}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              placeholder="Optional note…"
              style={S.input}
            />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Due Date</label>
              <input
                type="datetime-local"
                value={form.dueDate ? form.dueDate.slice(0, 16) : ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dueDate: e.target.value }))
                }
                style={S.input}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Priority</label>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm((p) => ({ ...p, priority: e.target.value }))
                }
                style={S.input}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                background: "transparent",
                border: "1px solid #2d3748",
                borderRadius: 10,
                padding: "10px",
                color: "#9ca3af",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              style={{
                flex: 1,
                background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                border: "none",
                borderRadius: 10,
                padding: "10px",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {mode === "new" ? "Create" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
