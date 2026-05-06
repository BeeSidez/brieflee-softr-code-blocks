function Stats() {
  const items = [
    { n: "12s", l: "Average time to score a 30-second video" },
    { n: "26", l: "QA criteria evaluated per asset" },
    { n: "94%", l: "Of customers say it pays for itself in week one" },
  ];
  return (
    <section style={{
      background: "linear-gradient(135deg, #001364 0%, #152237 100%)",
      padding: "72px 32px",
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32,
      }}>
        {items.map(it => (
          <div key={it.n} style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: "var(--bl-font-display)",
              fontSize: 64, fontWeight: 800, color: "#879cf7",
              letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 10,
            }}>{it.n}</div>
            <div style={{ color: "rgba(255,255,255,.78)", fontSize: 15, lineHeight: 1.4, maxWidth: 240, margin: "0 auto" }}>
              {it.l}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
window.Stats = Stats;
