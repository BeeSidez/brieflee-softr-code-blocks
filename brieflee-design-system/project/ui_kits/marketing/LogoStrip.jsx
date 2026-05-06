function LogoStrip() {
  const brands = ["Bonjuru", "Northshore", "Studio Forty", "Mae & Co", "Pacificborn", "Olive+Twig"];
  return (
    <section style={{ background: "#fff", padding: "40px 32px", borderBottom: "1px solid var(--bl-border)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
        <p style={{
          fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase",
          fontWeight: 600, color: "var(--bl-fg-muted)", marginBottom: 18,
        }}>
          Trusted by brands and agencies reviewing 10,000+ videos a month
        </p>
        <div style={{ display: "flex", gap: 48, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
          {brands.map(b => (
            <span key={b} style={{
              fontFamily: "var(--bl-font-display)", fontSize: 22, fontWeight: 700,
              color: "var(--bl-fg)", opacity: .55, letterSpacing: "-0.01em",
            }}>{b}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
window.LogoStrip = LogoStrip;
