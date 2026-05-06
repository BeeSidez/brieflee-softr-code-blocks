function Dropzone({ active, onActivate, onDone }) {
  if (!active) return null;
  return (
    <div onClick={onDone} style={{
      position: "fixed", inset: 0, background: "rgba(0,15,77,.45)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
      backdropFilter: "blur(2px)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 24, padding: 40, width: 560,
        boxShadow: "0 32px 64px -16px rgba(0,15,77,.35)",
      }}>
        <h3 style={{ margin: "0 0 6px", color: "var(--bl-fg)", fontSize: 20, fontWeight: 700 }}>Upload videos</h3>
        <p style={{ margin: "0 0 22px", color: "var(--bl-fg-muted)", fontSize: 14 }}>Drop a CSV with public links, or upload files directly.</p>
        <div style={{
          border: "2px dashed var(--bl-border)", borderRadius: 16,
          padding: 32, textAlign: "center",
          background: "#fafbff",
        }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#eef4fd", color: "#879cf7", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--bl-fg)", marginBottom: 4 }}>Drop your video files here</div>
          <div style={{ fontSize: 13, color: "var(--bl-fg-muted)", marginBottom: 14 }}>or click to browse from your computer</div>
          <button onClick={onDone} style={{
            background: "#879cf7", color: "#fff", border: "none",
            padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer",
          }}>Use sample data</button>
        </div>
      </div>
    </div>
  );
}
window.Dropzone = Dropzone;
