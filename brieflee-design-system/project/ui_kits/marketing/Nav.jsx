// Marketing top nav. Click "Try free for 14 days" → trial-active pill flips on.
function Nav({ trialActive, onTrialClick }) {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(250, 251, 255, 0.85)",
      backdropFilter: "blur(8px)",
      borderBottom: "1px solid var(--bl-border)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "14px 32px",
        display: "flex", alignItems: "center", gap: 32,
      }}>
        <a href="#" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="../../assets/logos/brieflee-wordmark.png" alt="Brieflee" style={{ height: 26 }} />
        </a>
        <div style={{ display: "flex", gap: 28, marginLeft: 24, flex: 1 }}>
          {["Product", "Use cases", "Pricing", "Docs", "Changelog"].map(l => (
            <a key={l} href="#" style={{ color: "var(--bl-fg)", fontSize: 14, fontWeight: 500 }}>{l}</a>
          ))}
        </div>
        <a href="#" style={{ color: "var(--bl-fg)", fontSize: 14, fontWeight: 500 }}>Sign in</a>
        <button onClick={onTrialClick} style={{
          background: "#879cf7", color: "#fff", border: "none",
          padding: "9px 18px", borderRadius: 10, fontWeight: 600, fontSize: 14,
          cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          boxShadow: "0 1px 3px rgba(41,79,246,.18), inset 0 1px 0 rgba(255,255,255,.3)",
        }}>
          {trialActive ? "Trial active ✓" : "Try free for 14 days"}
        </button>
      </div>
    </nav>
  );
}
window.Nav = Nav;
