function CTA() {
  return (
    <section style={{
      background: "linear-gradient(180deg, #ecf0ff 0%, #879cf7 100%)",
      padding: "80px 32px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      <img src="../../assets/illustrations/rocket.png" alt=""
        style={{ position: "absolute", left: "10%", top: 50, width: 110, transform: "rotate(-18deg)", opacity: .85 }} />
      <img src="../../assets/illustrations/fire.png" alt=""
        style={{ position: "absolute", right: "12%", top: 60, width: 80, transform: "rotate(12deg)", opacity: .85 }} />

      <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
        <h2 style={{
          fontFamily: "var(--bl-font-display)",
          fontSize: 56, fontWeight: 800, color: "#001364",
          letterSpacing: "-0.025em", lineHeight: 1.05, margin: "0 0 16px",
        }}>
          Stop watching every video
        </h2>
        <p style={{ fontSize: 18, color: "#001364", opacity: .8, margin: "0 0 28px", lineHeight: 1.5 }}>
          Try Brieflee free for 14 days. No credit card. Score 50 videos on us.
        </p>
        <button style={{
          background: "#000f4d", color: "#fff", border: "none",
          padding: "16px 32px", borderRadius: 12, fontWeight: 600, fontSize: 16,
          cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8,
          boxShadow: "0 12px 24px -8px rgba(0,15,77,.45)",
        }}>
          Get started free
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
        </button>
      </div>
    </section>
  );
}
window.CTA = CTA;
