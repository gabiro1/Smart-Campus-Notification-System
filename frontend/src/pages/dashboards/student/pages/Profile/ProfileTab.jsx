 const ProfileTab = () => (
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
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#f1f5f9",
            letterSpacing: "-0.02em",
          }}
        >
          My Profile
        </h2>
        <button
          style={editProfile ? S.btn : S.btnGhost}
          onClick={() => {
            if (editProfile) saveProfile();
            else {
              setProfileForm({ ...user });
              setEditProfile(true);
            }
          }}
        >
          <Icon d={editProfile ? icons.check : icons.edit} size={14} />{" "}
          {editProfile ? "Save Changes" : "Edit Profile"}
        </button>
      </div>
      <div
        style={{
          ...S.card,
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            fontWeight: 800,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>
            {user?.name}
          </h3>
          <p style={{ fontSize: 13, color: "#6b7280" }}>{user?.email}</p>
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <Badge label={user?.role || "student"} color="#3b82f6" />
            {user?.year && <Badge label={user.year} color="#6366f1" />}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 16,
        }}
      >
        {[
          { label: "Full Name", key: "name" },
          { label: "Email", key: "email" },
          { label: "Department", key: "department" },
          { label: "School", key: "school" },
          { label: "Year", key: "year" },
        ].map(({ label, key }) => (
          <div key={key} style={{ ...S.card, padding: "14px 16px" }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#4b5563",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                display: "block",
                marginBottom: 6,
              }}
            >
              {label}
            </label>
            {editProfile ? (
              <input
                value={profileForm[key] || ""}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, [key]: e.target.value }))
                }
                style={{ ...S.input, padding: "8px 12px", fontSize: 13 }}
              />
            ) : (
              <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>
                {user?.[key] || (
                  <span style={{ color: "#374151" }}>Not set</span>
                )}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );