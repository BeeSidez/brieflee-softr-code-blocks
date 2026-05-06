function TopBar({ workspace, onUpload }) {
  return (
    <header style={{
      background: "#fff", borderBottom: "1px solid var(--bl-border)",
      padding: "14px 28px", display: "flex", alignItems: "center", gap: 16,
      position: "sticky", top: 0, zIndex: 10,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "6px 12px",
        background: "var(--bl-light-2)", borderRadius: 10,
        fontSize: 13, fontWeight: 600, color: "var(--bl-fg)",
      }}>
        <span style={{ width: 18, height: 18, borderRadius: 6, background: "linear-gradient(135deg,#7a93ff,#294ff6)" }}></span>
        {workspace}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
      </div>
      <div style={{ flex: 1, position: "relative", maxWidth: 480 }}>
        <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#7a93ff" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        <input placeholder="Search briefs, creators, videos..." style={{
          width: "100%", border: "1.5px solid var(--bl-border)", borderRadius: 10,
          padding: "9px 12px 9px 36px", fontSize: 14, fontFamily: "inherit",
          background: "#fafbff", outline: "none",
        }} />
      </div>
      <button style={{
        background: "transparent", border: "1.5px solid var(--bl-border)",
        padding: "8px 14px", borderRadius: 10, color: "var(--bl-fg)",
        fontSize: 13, fontWeight: 600, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
        Bulk import
      </button>
      <button onClick={onUpload} style={{
        background: "#879cf7", border: "none", color: "#fff",
        padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
        cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
        boxShadow: "0 1px 3px rgba(41,79,246,.18), inset 0 1px 0 rgba(255,255,255,.3)",
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        Upload videos
      </button>
    </header>
  );
}
window.TopBar = TopBar;
