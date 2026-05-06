function FeatureGrid() {
  const features = [
    { sticker: "../../assets/illustrations/looking-eyes.png", title: "Watches every second",
      body: "Computer vision evaluates hook timing, audio quality, brand visibility, and 23 other thresholds you control." },
    { sticker: "../../assets/illustrations/magnifying-glass.png", title: "Catches what you'd miss",
      body: "Off-brief moments, missing CTAs, blurry frames, audio drops. Surfaced as inline notes, not a vague score." },
    { sticker: "../../assets/illustrations/bullseye.png", title: "Locked to your brief",
      body: "Upload your brief or build it from a template. Brieflee aligns scoring to your exact creative direction." },
  ];
  return (
    <section style={{ background: "#fff", padding: "96px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="bl-eyebrow" style={{ display: "inline-block", marginBottom: 12 }}>How it works</span>
          <h2 style={{ fontSize: 44, fontWeight: 800, color: "var(--bl-fg)", letterSpacing: "-0.02em", margin: 0 }}>
            Reviews you don&rsquo;t have to watch
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {features.map(f => (
            <div key={f.title} style={{
              background: "#FAFBFF", border: "1px solid var(--bl-border)",
              borderRadius: 20, padding: 28,
            }}>
              <div style={{
                width: 96, height: 96, borderRadius: 24,
                background: "rgba(135,156,247,.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 18,
              }}>
                <img src={f.sticker} alt="" style={{ width: 64, height: 64, objectFit: "contain" }} />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--bl-fg)", margin: "0 0 8px" }}>{f.title}</h3>
              <p style={{ color: "var(--bl-fg-body)", lineHeight: 1.55, margin: 0 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
window.FeatureGrid = FeatureGrid;
