function Footer() {
  const cols = [
    { h: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap", "API"] },
    { h: "Use cases", links: ["Brands", "Agencies", "Influencer programs", "UGC review"] },
    { h: "Company", links: ["About", "Blog", "Careers", "Press"] },
    { h: "Legal", links: ["Terms", "Privacy", "DPA", "Subprocessors"] },
  ];
  return (
    <footer style={{ background: "#152237", color: "rgba(255,255,255,.72)", padding: "64px 32px 28px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr repeat(4, 1fr)", gap: 32, marginBottom: 48 }}>
          <div>
            <img src="../../assets/logos/brieflee-wordmark-white.png" alt="Brieflee" style={{ height: 28, marginBottom: 14 }} />
            <p style={{ fontSize: 14, lineHeight: 1.55, opacity: .7, margin: 0 }}>
              Spell check for video. Built for brands and agencies managing
              creator content at scale.
            </p>
          </div>
          {cols.map(c => (
            <div key={c.h}>
              <h5 style={{ color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", margin: "0 0 14px" }}>{c.h}</h5>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {c.links.map(l => (
                  <li key={l}><a href="#" style={{ color: "rgba(255,255,255,.7)", fontSize: 14 }}>{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.1)", paddingTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,.5)" }}>© 2026 Brieflee, Inc. All rights reserved.</span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,.5)" }}>Made in Brooklyn · Lisbon · Remote</span>
        </div>
      </div>
    </footer>
  );
}
window.Footer = Footer;
