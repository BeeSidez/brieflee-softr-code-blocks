function Sidebar({ active, onChange }) {
  const items = [
    { id: "home", icon: "M3 12l9-9 9 9M5 10v10h14V10" },
    { id: "briefs", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h6" },
    { id: "videos", icon: "M23 7l-7 5 7 5V7zM1 5h15v14H1z" },
    { id: "creators", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
    { id: "library", icon: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" },
    { id: "settings", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" },
  ];
  return (
    <aside style={{
      width: 64, background: "#fff", borderRight: "1px solid var(--bl-border)",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "16px 0", gap: 6, position: "sticky", top: 0, height: "100vh",
    }}>
      <img src="../../assets/logos/app-icon.png" alt="Brieflee"
           style={{ width: 36, height: 36, borderRadius: 10, marginBottom: 14, boxShadow: "0 4px 10px -2px rgba(41,79,246,.35)" }} />
      {items.map(it => (
        <button key={it.id} onClick={() => onChange(it.id)} style={{
          width: 40, height: 40, borderRadius: 10, border: "none",
          background: active === it.id ? "rgba(135,156,247,.18)" : "transparent",
          color: active === it.id ? "#294ff6" : "#7a93ff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .2s",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={it.icon} />
          </svg>
        </button>
      ))}
      <div style={{ marginTop: "auto", width: 36, height: 36, borderRadius: 999, background: "linear-gradient(135deg, #d9e0ff, #879cf7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>
        AB
      </div>
    </aside>
  );
}
window.Sidebar = Sidebar;
