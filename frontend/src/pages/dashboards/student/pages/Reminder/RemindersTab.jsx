import React from "react";

export const RemindersTab = ({
  reminders = [], // Defaults to an empty array so .filter() doesn't crash
  loading = {}, // Defaults to empty object so loading.reminders doesn't crash
  S,
  icons,
  setNewReminder,
  setReminderModal,
  toggleComplete,
  deleteReminder,
  fmt,
  Icon,
  Skeleton,
  PriorityDot,
  Badge,
}) => {
  const pending = reminders.filter((r) => !r.completed);
  const done = reminders.filter((r) => r.completed);

  return (
    <div style={S.content}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#f1f5f9",
              letterSpacing: "-0.02em",
            }}
          >
            Reminders
          </h2>
          <p style={{ color: "#4b5563", fontSize: 13, marginTop: 4 }}>
            {pending.length} pending · {done.length} done
          </p>
        </div>
        <button
          style={S.btn}
          onClick={() => {
            setNewReminder({
              title: "",
              note: "",
              dueDate: "",
              priority: "medium",
            });
            setReminderModal("new");
          }}
        >
          <Icon d={icons.plus} size={15} /> New Reminder
        </button>
      </div>

      {loading.reminders ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={S.card}>
              <Skeleton h={16} w="50%" />
            </div>
          ))}
        </div>
      ) : reminders.length === 0 ? (
        <div style={{ ...S.card, textAlign: "center", padding: 48 }}>
          <Icon
            d={icons.reminder}
            size={36}
            style={{
              color: "#374151",
              margin: "0 auto 12px",
              display: "block",
            }}
          />
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>
            No reminders yet
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[...pending, ...done].map((r) => (
            <div
              key={r._id}
              style={{
                ...S.card,
                opacity: r.completed ? 0.6 : 1,
                transition: "all 0.2s",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
              >
                <button
                  onClick={() => toggleComplete(r)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    border: `2px solid ${r.completed ? "#10b981" : "#374151"}`,
                    background: r.completed ? "#10b981" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {r.completed && (
                    <Icon d={icons.check} size={11} stroke="#fff" />
                  )}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    <PriorityDot p={r.priority} />
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#f1f5f9",
                        textDecoration: r.completed ? "line-through" : "none",
                      }}
                    >
                      {r.title}
                    </span>
                    <Badge
                      label={r.priority}
                      color={
                        r.priority === "high"
                          ? "#ef4444"
                          : r.priority === "medium"
                            ? "#f59e0b"
                            : "#10b981"
                      }
                    />
                  </div>
                  {r.note && (
                    <p
                      style={{
                        fontSize: 12,
                        color: "#6b7280",
                        marginBottom: 4,
                      }}
                    >
                      {r.note}
                    </p>
                  )}
                  {r.dueDate && (
                    <span
                      style={{
                        fontSize: 11,
                        color:
                          new Date(r.dueDate) < new Date() && !r.completed
                            ? "#ef4444"
                            : "#4b5563",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Icon d={icons.calendar} size={11} /> Due {fmt(r.dueDate)}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => setReminderModal({ ...r })}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#6b7280",
                      padding: 4,
                    }}
                  >
                    <Icon d={icons.edit} size={14} />
                  </button>
                  <button
                    onClick={() => deleteReminder(r._id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#6b7280",
                      padding: 4,
                    }}
                  >
                    <Icon d={icons.trash} size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
