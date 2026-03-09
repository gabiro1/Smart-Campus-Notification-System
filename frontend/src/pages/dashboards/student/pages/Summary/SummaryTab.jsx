const SummaryTab = () => (
  <div style={S.content}>
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 6,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon d={icons.spark} size={17} stroke="#fff" />
        </div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#f1f5f9",
            letterSpacing: "-0.02em",
          }}
        >
          AI Summary
        </h2>
      </div>
      <p style={{ color: "#4b5563", fontSize: 13, marginLeft: 44 }}>
        Your personalized briefing
      </p>
    </div>
    <div
      style={{
        background: "linear-gradient(135deg,#0f172a,#1e1b4b)",
        border: "1px solid #4338ca40",
        borderRadius: 20,
        padding: 28,
        marginBottom: 20,
      }}
    >
      {loading.summary ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Skeleton h={16} />
          <Skeleton h={16} w="90%" />
        </div>
      ) : (
        <p style={{ fontSize: 14, color: "#c7d2fe", lineHeight: 1.8 }}>
          {summary.split("**").map((part, i) =>
            i % 2 === 1 ? (
              <strong key={i} style={{ color: "#a5b4fc", fontWeight: 700 }}>
                {part}
              </strong>
            ) : (
              part
            ),
          )}
        </p>
      )}
    </div>
  </div>
);
