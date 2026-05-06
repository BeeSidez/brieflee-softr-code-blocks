function ReviewTable({ rows, empty }) {
  if (empty) {
    return (
      <div style={{
        background: "#fff", borderRadius: 16, border: "1px solid var(--bl-border)",
        padding: "72px 24px", textAlign: "center",
      }}>
        <img src="../../assets/illustrations/looking-eyes.png" alt="" style={{ width: 80, marginBottom: 14, opacity: .9 }} />
        <h3 style={{ fontSize: 18, color: "var(--bl-fg)", margin: "0 0 6px" }}>No videos yet</h3>
        <p style={{ color: "var(--bl-fg-muted)", margin: 0, fontSize: 14 }}>
          Click "Upload videos" above to drop a CSV or pull from Drive.
        </p>
      </div>
    );
  }
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--bl-border)", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#fafbff", borderBottom: "1px solid var(--bl-border)" }}>
            {["Creator & video", "Brief", "Score", "Hook", "Audio", "Length", "Uploaded"].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, color: "var(--bl-fg-muted)", textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: i === rows.length - 1 ? "none" : "1px solid var(--bl-border)" }}>
              <td style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 56, borderRadius: 8, background: `linear-gradient(135deg, ${r.thumbA}, ${r.thumbB})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><polygon points="6 4 20 12 6 20 6 4" /></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--bl-fg)" }}>{r.creator}</div>
                    <div style={{ fontSize: 12, color: "var(--bl-fg-muted)" }}>{r.title}</div>
                  </div>
                </div>
              </td>
              <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--bl-fg)" }}>{r.brief}</td>
              <td style={{ padding: "14px 16px" }}><ScoreCell score={r.score} status={r.status} /></td>
              <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--bl-fg)" }}>{r.hook}</td>
              <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--bl-fg)" }}>{r.audio}</td>
              <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--bl-fg)" }}>{r.length}</td>
              <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--bl-fg-muted)" }}>{r.up}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
window.ReviewTable = ReviewTable;
