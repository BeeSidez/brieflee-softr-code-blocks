function FeatureRow({ flip }) {
  return (
    <section style={{ background: "var(--bl-page)", padding: "80px 32px" }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 64, alignItems: "center",
        direction: flip ? "rtl" : "ltr",
      }}>
        <div style={{ direction: "ltr" }}>
          <span className="bl-eyebrow" style={{ display: "inline-block", marginBottom: 14 }}>Bulk review</span>
          <h2 style={{ fontSize: 38, fontWeight: 700, color: "var(--bl-fg)", letterSpacing: "-0.015em", margin: "0 0 14px", lineHeight: 1.15 }}>
            One CSV. Thirty briefs. 60 seconds.
          </h2>
          <p style={{ fontSize: 17, color: "var(--bl-fg-body)", lineHeight: 1.55, margin: "0 0 20px" }}>
            Drop a single file, get every brief queued and ready. Brieflee pulls
            creators from your Sheets, splits them by deliverable, and runs the
            full QA checklist against each video.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px" }}>
            {["No copy-pasting between tools", "Workspace + brand auto-assigned", "26-item QA template, fully editable"].map(t => (
              <li key={t} style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--bl-fg)", marginBottom: 8, fontSize: 15 }}>
                <span style={{ width: 22, height: 22, borderRadius: 999, background: "#d9e0ff", color: "#294ff6", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                </span>
                {t}
              </li>
            ))}
          </ul>
          <a href="#" style={{ color: "#294ff6", fontWeight: 600, fontSize: 15, display: "inline-flex", alignItems: "center", gap: 6 }}>
            See bulk import → 
          </a>
        </div>
        <div style={{ direction: "ltr", background: "#f4f6fa", borderRadius: 24, padding: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src="../../assets/engravings/engraving-clapboard.png" alt="" style={{ width: "78%", maxWidth: 360 }} />
        </div>
      </div>
    </section>
  );
}
window.FeatureRow = FeatureRow;
