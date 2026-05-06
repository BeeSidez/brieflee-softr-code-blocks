function BriefCard({ name, count, status }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid var(--bl-border)",
      borderRadius: 14, padding: 16,
      display: "flex", flexDirection: "column", gap: 10,
      cursor: "pointer", transition: "all .2s",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 20px -4px rgba(41,79,246,.15)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(135,156,247,.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#294ff6" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h6" /></svg>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999,
          background: status === "live" ? "#f0fff4" : "#eef4fd",
          color: status === "live" ? "#166534" : "#001364",
        }}>{status === "live" ? "Live" : "Draft"}</span>
      </div>
      <div>
        <h4 style={{ margin: "0 0 4px", fontSize: 15, color: "var(--bl-fg)", fontWeight: 700 }}>{name}</h4>
        <p style={{ margin: 0, fontSize: 12, color: "var(--bl-fg-muted)" }}>{count} videos · 26 QA criteria</p>
      </div>
    </div>
  );
}
window.BriefCard = BriefCard;
