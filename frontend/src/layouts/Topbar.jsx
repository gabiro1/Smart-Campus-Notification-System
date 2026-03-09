import Icon, { ICONS } from "../ui/Icon";

const TAB_TITLES = {
  feed: "Event Feed",
  notifications: "Notifications",
  reminders: "Reminders",
  summary: "AI Summary",
  profile: "My Profile",
};

export default function Topbar({ tab, user, unreadCount, setTab }) {
  const initials =
    user?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ST";

  return (
    <div
      style={{
        background: "#0a0f1aee",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1f2937",
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 800, color: "#f1f5f9" }}>
        {TAB_TITLES[tab]}
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Notification bell */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setTab("notifications")}
            style={{
              background: "transparent",
              border: "1px solid #2d3748",
              borderRadius: 10,
              padding: "8px 10px",
              color: "#9ca3af",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Icon d={ICONS.bell} size={16} />
          </button>
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                width: 16,
                height: 16,
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
              {unreadCount}
            </span>
          )}
        </div>

        {/* Avatar */}
        <div
          onClick={() => setTab("profile")}
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 800,
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {initials}
        </div>
      </div>
    </div>
  );
}
