import Icon, { ICONS } from "../ui/Icon";

const NAV_ITEMS = [
  { id: "feed", label: "Feed", icon: ICONS.feed },
  { id: "notifications", label: "Alerts", icon: ICONS.bell },
  { id: "reminders", label: "Tasks", icon: ICONS.reminder },
  { id: "summary", label: "AI", icon: ICONS.spark },
  { id: "profile", label: "Me", icon: ICONS.user },
];

export default function BottomNav({ tab, setTab, unreadCount, pendingCount }) {
  const badges = { notifications: unreadCount, reminders: pendingCount };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#0a0f1aee",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid #1f2937",
        zIndex: 100,
        display: "flex",
        justifyContent: "space-around",
        padding: "8px 0 16px",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const badge = badges[item.id] || 0;
        const active = tab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              position: "relative",
              padding: "4px 14px",
            }}
          >
            {badge > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 0,
                  right: 8,
                  width: 14,
                  height: 14,
                  background: "#ef4444",
                  borderRadius: "50%",
                  fontSize: 9,
                  fontWeight: 800,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {badge}
              </span>
            )}
            <Icon
              d={item.icon}
              size={20}
              stroke={active ? "#60a5fa" : "#4b5563"}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: active ? "#60a5fa" : "#4b5563",
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
