function ScoreCell({ score, status }) {
  const color = score >= 85 ? "#294ff6" : score >= 70 ? "#f59e0b" : "#e63946";
  const pill = status === "approved"
    ? { bg: "#f0fff4", fg: "#166534", dot: "#38a169", label: "Approved" }
    : status === "pending"
    ? { bg: "#fffbeb", fg: "#92400e", dot: "#f59e0b", label: "Pending" }
    : status === "review"
    ? { bg: "#eef4fd", fg: "#001364", dot: "#7a93ff", label: "Needs review" }
    : { bg: "#fff1f2", fg: "#e63946", dot: "#e63946", label: "Rejected" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 999,
        background: `conic-gradient(${color} 0 ${score}%, #eef4fd ${score}% 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
      }}>
        <div style={{ position: "absolute", inset: 4, borderRadius: 999, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "var(--bl-fg)" }}>{score}</div>
      </div>
      <span style={{
        background: pill.bg, color: pill.fg, padding: "4px 10px",
        borderRadius: 999, fontSize: 11, fontWeight: 600,
        display: "inline-flex", alignItems: "center", gap: 5,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: pill.dot }}></span>
        {pill.label}
      </span>
    </div>
  );
}
window.ScoreCell = ScoreCell;
