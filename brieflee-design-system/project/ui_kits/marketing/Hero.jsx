function Hero({ onPrimary }) {
  return (
    <section style={{
      background: "linear-gradient(180deg, #ECF0FF 0%, #879CF7 100%)",
      padding: "80px 32px 96px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ maxWidth: 920, margin: "0 auto", position: "relative", zIndex: 2 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#879cf7", color: "#fff",
          padding: "7px 16px", borderRadius: 999,
          fontSize: 12, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.4)",
        }}>
          Automated UGC moderation
        </span>
        <h1 style={{
          fontFamily: "var(--bl-font-display)",
          fontSize: 88, lineHeight: 1.02, fontWeight: 800,
          letterSpacing: "-0.025em", color: "#001364",
          margin: "20px 0 18px",
        }}>
          Spell check<br />for video
        </h1>
        <p style={{
          fontSize: 19, lineHeight: 1.5, color: "#001364",
          maxWidth: 620, margin: "0 auto 32px", opacity: .82,
        }}>
          Brieflee scores every UGC asset in seconds against the thresholds
          you set. Approve, reject, or send revision notes without watching
          every video yourself.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={onPrimary} style={{
            background: "#000f4d", color: "#fff", border: "none",
            padding: "14px 26px", borderRadius: 12, fontWeight: 600, fontSize: 15,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 8px 18px -6px rgba(0,15,77,.4)",
          }}>
            Try it free for 14 days
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </button>
          <button style={{
            background: "rgba(255,255,255,.6)", color: "#001364",
            border: "1.5px solid rgba(0,19,100,.12)",
            padding: "14px 26px", borderRadius: 12, fontWeight: 600, fontSize: 15,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4" /></svg>
            Watch demo
          </button>
        </div>

        {/* product peek */}
        <div style={{
          marginTop: 48, background: "#fff", borderRadius: 24,
          padding: 8, boxShadow: "0 32px 64px -16px rgba(0,15,77,.25)",
          maxWidth: 880, marginLeft: "auto", marginRight: "auto",
        }}>
          <img src="../../assets/screenshots/animated-app-demo.gif"
               alt="Brieflee app demo"
               style={{ width: "100%", borderRadius: 18, display: "block" }} />
        </div>
      </div>

      {/* Floating engraving accents */}
      <img src="../../assets/illustrations/looking-eyes.png" alt=""
        style={{ position: "absolute", left: 60, top: 120, width: 88, transform: "rotate(-12deg)", opacity: .9 }} />
      <img src="../../assets/illustrations/rocket.png" alt=""
        style={{ position: "absolute", right: 60, top: 90, width: 96, transform: "rotate(14deg)", opacity: .9 }} />
    </section>
  );
}
window.Hero = Hero;
