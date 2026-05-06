/* global React */
const { useState } = React;

// ============================================================
// Brieflee Signup Image — Variants
// All artboards are 1080×1080 (safe square; Softr's "Cover" fit
// handles minor cropping on either side).
// Background gradient matches Softr's locked side-section bg.
// ============================================================

const NAVY = "#001364";
const PERI = "#879CF7";
const BLUE = "#294ff6";
const PERI_LIGHT = "#ECF0FF";
const PERI_FAINT = "#F4F6FF";
const BORDER = "#D6DEFC";

// The Softr left-side gradient (read off the screenshot)
const SOFTR_BG = "linear-gradient(180deg, #ECF0FF 0%, #DCE3FF 100%)";

// Reusable artboard wrapper. The variant always renders at 1080×1080 internally
// and is scaled via JS to fill its parent (the design canvas's DCArtboard).
// That way both the canvas thumbnail and the focus-mode overlay show the full
// design, regardless of card size.
//
// Each Artboard also exposes a "Download PNG" button (top-right, on hover)
// that captures the inner 1080×1080 surface at full resolution using
// html-to-image (loaded from CDN in the host page).
function Artboard({ children, bg, padding = 80, style, filename = "brieflee-signup" }) {
  const outerRef = React.useRef(null);
  const innerRef = React.useRef(null);
  const [downloading, setDownloading] = React.useState(false);

  React.useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const apply = () => {
      const w = outer.clientWidth;
      const h = outer.clientHeight;
      if (!w || !h) return;
      const s = Math.min(w / 1080, h / 1080);
      inner.style.transform = `scale(${s})`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(outer);
    return () => ro.disconnect();
  }, []);

  async function handleDownload(e) {
    e.stopPropagation();
    if (!innerRef.current || !window.htmlToImage) {
      alert("Download library not loaded yet. Try again in a second.");
      return;
    }
    setDownloading(true);
    try {
      // Temporarily clear the scale transform so we capture at full 1080×1080.
      const inner = innerRef.current;
      const saved = inner.style.transform;
      inner.style.transform = "none";
      const dataUrl = await window.htmlToImage.toPng(inner, {
        width: 1080,
        height: 1080,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: null,
      });
      inner.style.transform = saved;
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${filename}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert("Couldn't generate the PNG. Check the console.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      ref={outerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: bg || SOFTR_BG,
      }}
      className="bl-artboard"
    >
      <div
        ref={innerRef}
        style={{
          width: 1080,
          height: 1080,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
          padding,
          boxSizing: "border-box",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          color: NAVY,
          display: "flex",
          flexDirection: "column",
          ...style,
        }}
      >
        {children}
      </div>

      {/* Download button — sits in artboard's top-right corner */}
      <button
        onClick={handleDownload}
        className="bl-download-btn"
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 5,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 12px",
          background: NAVY,
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.02em",
          cursor: downloading ? "wait" : "pointer",
          opacity: downloading ? 1 : 0,
          transition: "opacity 0.15s ease",
          boxShadow: "0 4px 14px -2px rgba(0,19,100,0.25)",
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        {downloading ? "Saving…" : "Download PNG"}
      </button>
    </div>
  );
}

// ─── Eyebrow pill ─────────────────────────────────────────
function Eyebrow({ children, dark = false }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        background: dark ? NAVY : PERI,
        color: "#fff",
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        borderRadius: 999,
        width: "fit-content",
      }}
    >
      {children}
    </span>
  );
}

// ============================================================
// V1 · Product screenshot — the dashboard speaks for itself
// (Text OFF mode: image carries everything)
// ============================================================
function V1ProductGrid() {
  return (
    <Artboard padding={0} filename="brieflee-v1-product-peek">
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "120px 100px 80px" }}>
        <Eyebrow>Spell check for video</Eyebrow>
        <h1 style={{
          fontSize: 64, fontWeight: 800, letterSpacing: "-0.025em",
          lineHeight: 1.05, margin: "28px 0 20px", color: NAVY,
          textWrap: "pretty",
        }}>
          Score every<br />asset in seconds.
        </h1>
        <p style={{ fontSize: 22, lineHeight: 1.5, color: NAVY, opacity: 0.7, margin: 0, maxWidth: 720 }}>
          Brieflee reviews UGC, influencer, and creator videos against the brief — automatically.
        </p>
      </div>
      {/* product peek */}
      <div style={{
        position: "absolute", left: 100, right: -120, bottom: -60,
        height: 480,
        borderRadius: 24,
        boxShadow: "0 24px 60px -12px rgba(0,19,100,0.25)",
        overflow: "hidden",
        background: "#fff",
      }}>
        <img
          src="assets/feature-output-grid.png"
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "left top" }}
        />
      </div>
    </Artboard>
  );
}

// ============================================================
// V2 · Testimonial card (Vasiliy Gualoto) — Foreplay-style
// ============================================================
function V2Testimonial() {
  return (
    <Artboard padding={80} filename="brieflee-v2-testimonial">
      {/* big quote mark */}
      <div style={{
        position: "absolute", top: 60, left: 80,
        fontSize: 220, lineHeight: 0.8,
        fontFamily: "Georgia, serif",
        color: PERI, opacity: 0.35, fontWeight: 700,
      }}>
        “
      </div>

      <div style={{
        marginTop: 100,
        background: "#fff",
        borderRadius: 28,
        padding: "44px 48px",
        boxShadow: "0 16px 48px -8px rgba(0,19,100,0.12)",
        border: `1px solid ${BORDER}`,
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}>
        {/* stars */}
        <div style={{ display: "flex", gap: 4 }}>
          {[0,1,2,3,4].map(i => (
            <svg key={i} width="22" height="22" viewBox="0 0 24 24" fill={PERI}>
              <path d="M12 2l2.9 6.9 7.5.6-5.7 4.9 1.8 7.3L12 17.8 5.5 21.7l1.8-7.3L1.6 9.5l7.5-.6L12 2z"/>
            </svg>
          ))}
        </div>

        <p style={{
          fontSize: 26, lineHeight: 1.45, color: NAVY,
          fontWeight: 500, margin: 0, textWrap: "pretty",
        }}>
          One person can only watch so many videos in a day. Since we started using Brieflee,
          submissions that don't meet the mark get flagged straight away.
          <span style={{ color: NAVY, opacity: 0.6 }}>{" "}Our influencers actually send better content now because they know exactly what we're checking for.</span>
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
          <img
            src="assets/vasiliy.png"
            alt=""
            style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", background: PERI_LIGHT }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: NAVY }}>Vasiliy Gualoto</div>
            <div style={{ fontSize: 15, color: NAVY, opacity: 0.6 }}>Founder, Influencer Agency</div>
          </div>
          <img src="assets/app-icon-periwinkle.png" alt="" style={{ width: 44, height: 44, borderRadius: 10, opacity: 0.9 }} />
        </div>
      </div>

      {/* small caption under card */}
      <div style={{ marginTop: 32, textAlign: "center", color: NAVY, opacity: 0.55, fontSize: 15, fontWeight: 500, letterSpacing: "0.04em" }}>
        Trusted by agencies reviewing 10,000+ videos a month
      </div>
    </Artboard>
  );
}

// ============================================================
// V3 · Engraving — editorial / premium (clapboard)
// Designed to pair with Softr's heading + text ON
// ============================================================
function V3Engraving() {
  return (
    <Artboard padding={0} filename="brieflee-v3-clapboard">
      {/* Soft periwinkle disc behind the engraving */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        width: 720, height: 720,
        borderRadius: "50%",
        background: `radial-gradient(circle at 50% 40%, ${PERI} 0%, ${PERI} 35%, rgba(135,156,247,0.0) 70%)`,
        opacity: 0.45,
      }} />
      <img
        src="assets/engraving-clapboard.png"
        alt=""
        style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%, -50%) rotate(-8deg)",
          width: 620, height: 620, objectFit: "contain",
          filter: "drop-shadow(0 24px 40px rgba(0,19,100,0.18))",
        }}
      />
      {/* tiny corner mark */}
      <div style={{
        position: "absolute", bottom: 56, left: 0, right: 0,
        textAlign: "center",
        color: NAVY, opacity: 0.55,
        fontSize: 14, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase",
      }}>
        Brieflee · Spell check for video
      </div>
    </Artboard>
  );
}

// ============================================================
// V4 · Stickers / playful — pairs with Softr text
// ============================================================
function V4Stickers() {
  return (
    <Artboard padding={0} filename="brieflee-v4-stickers">
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* central magnifying glass */}
        <img
          src="assets/magnifying-glass.png"
          alt=""
          style={{
            width: 460, height: 460, objectFit: "contain",
            transform: "rotate(-12deg)",
            filter: "drop-shadow(0 18px 30px rgba(0,19,100,0.18))",
          }}
        />
      </div>
      {/* eyes top-right */}
      <img
        src="assets/looking-eyes.png"
        alt=""
        style={{
          position: "absolute", top: 110, right: 100,
          width: 200, height: 200, objectFit: "contain",
          transform: "rotate(8deg)",
          filter: "drop-shadow(0 12px 20px rgba(0,19,100,0.15))",
        }}
      />
      {/* sparkles bottom-left */}
      <img
        src="assets/ai-sparkles.png"
        alt=""
        style={{
          position: "absolute", bottom: 130, left: 110,
          width: 180, height: 180, objectFit: "contain",
          transform: "rotate(-6deg)",
          opacity: 0.95,
        }}
      />
      {/* smiley bottom-right */}
      <img
        src="assets/isometric-smiley.png"
        alt=""
        style={{
          position: "absolute", bottom: 100, right: 90,
          width: 220, height: 220, objectFit: "contain",
          transform: "rotate(14deg)",
        }}
      />
    </Artboard>
  );
}

// ============================================================
// V5 · Big bold typography on the gradient
// (Text OFF mode — type IS the image)
// ============================================================
function V5BoldType() {
  return (
    <Artboard padding={100} filename="brieflee-v5-bold-type">
      <Eyebrow>Spell check for video</Eyebrow>
      <h1 style={{
        fontSize: 132, fontWeight: 800, letterSpacing: "-0.035em",
        lineHeight: 0.95, margin: "44px 0 0", color: NAVY,
        textWrap: "balance",
      }}>
        Stop<br />
        watching<br />
        <span style={{ color: PERI }}>every video.</span>
      </h1>
      <p style={{
        fontSize: 28, lineHeight: 1.4, color: NAVY, opacity: 0.7,
        margin: "auto 0 0", maxWidth: 720, fontWeight: 500,
      }}>
        Brieflee scores every UGC asset against your brief — in seconds, not afternoons.
      </p>
    </Artboard>
  );
}

// ============================================================
// V6 · Score card preview — show the actual output
// (Text OFF mode — product visualization carries the message)
// ============================================================
function V6ScoreCard() {
  const checks = [
    { label: "Hook timing", v: "First 2s", pass: true },
    { label: "Audio quality", v: "92%", pass: true },
    { label: "Brand mention", v: "3×", pass: true },
    { label: "Product visible", v: "90%", pass: true },
    { label: "Length", v: "0:42", pass: true },
    { label: "Caption match", v: "On-brief", pass: true },
  ];
  return (
    <Artboard padding={90} filename="brieflee-v6-score-card">
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <div style={{
          width: 14, height: 14, borderRadius: "50%", background: "#22c55e",
          boxShadow: "0 0 0 5px rgba(34,197,94,0.18)",
        }} />
        <span style={{ fontSize: 15, color: NAVY, opacity: 0.65, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Reviewed in 4.2 seconds
        </span>
      </div>

      <h1 style={{ fontSize: 60, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.05, margin: "0 0 36px", color: NAVY }}>
        Every asset, scored<br />against your brief.
      </h1>

      <div style={{
        background: "#fff", borderRadius: 24, padding: 36,
        border: `1px solid ${BORDER}`,
        boxShadow: "0 16px 40px -8px rgba(0,19,100,0.10)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 14, color: NAVY, opacity: 0.55, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Submission · gymshark-q3-027.mp4
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: NAVY, marginTop: 6 }}>Overall score · 94 / 100</div>
          </div>
          <div style={{
            padding: "10px 18px", background: "#dcfce7", color: "#166534",
            borderRadius: 999, fontSize: 16, fontWeight: 700,
          }}>PASS</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {checks.map((c, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 16px",
              background: PERI_FAINT,
              borderRadius: 12,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span style={{ fontSize: 17, color: NAVY, fontWeight: 600, flex: 1 }}>{c.label}</span>
              <span style={{ fontSize: 15, color: NAVY, opacity: 0.7, fontWeight: 500 }}>{c.v}</span>
            </div>
          ))}
        </div>
      </div>
    </Artboard>
  );
}

// ============================================================
// V7 · Social proof — logos + big stat
// ============================================================
function V7SocialProof() {
  const brands = ["Gymshark", "Glossier", "Liquid I.V.", "Dr. Squatch", "MUD\\WTR", "Magic Spoon", "AG1", "True Classic"];
  return (
    <Artboard padding={100} filename="brieflee-v7-social-proof">
      <Eyebrow>Trusted by ops teams</Eyebrow>
      <h1 style={{
        fontSize: 84, fontWeight: 800, letterSpacing: "-0.03em",
        lineHeight: 1, margin: "32px 0 12px", color: NAVY,
      }}>
        10,000<span style={{ color: PERI }}>+</span>
      </h1>
      <p style={{ fontSize: 26, color: NAVY, opacity: 0.7, margin: 0, fontWeight: 500 }}>
        videos reviewed every month by brands and agencies on Brieflee.
      </p>

      <div style={{
        marginTop: "auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
      }}>
        {brands.map((b) => (
          <div key={b} style={{
            background: "#fff",
            borderRadius: 14,
            border: `1px solid ${BORDER}`,
            padding: "20px 22px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em",
            color: NAVY, opacity: 0.85,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            {b}
          </div>
        ))}
      </div>
    </Artboard>
  );
}

// ============================================================
// V8 · Brain engraving — minimal editorial
// ============================================================
function V8BrainEngraving() {
  return (
    <Artboard padding={0} filename="brieflee-v8-brain">
      <img
        src="assets/engraving-brain.png"
        alt=""
        style={{
          position: "absolute", left: "50%", top: "46%",
          transform: "translate(-50%, -50%)",
          width: 680, height: 680, objectFit: "contain",
          filter: "drop-shadow(0 20px 40px rgba(0,19,100,0.15))",
        }}
      />
      <div style={{
        position: "absolute", bottom: 110, left: 0, right: 0,
        textAlign: "center",
      }}>
        <div style={{
          fontSize: 13, fontWeight: 700, letterSpacing: "0.18em",
          textTransform: "uppercase", color: PERI, marginBottom: 14,
        }}>
          Computer-vision review
        </div>
        <div style={{
          fontSize: 38, fontWeight: 800, letterSpacing: "-0.015em",
          lineHeight: 1.15, color: NAVY, maxWidth: 820, margin: "0 auto",
          textWrap: "balance",
        }}>
          The first set of eyes that<br />never gets tired.
        </div>
      </div>
    </Artboard>
  );
}

// ============================================================
// V9 · Pass / Fail funnel — show the binary moderation visual
// ============================================================
function V9PassFail() {
  return (
    <Artboard padding={0} filename="brieflee-v9-passfail">
      <div style={{ padding: "100px 100px 0" }}>
        <Eyebrow>Automated UGC moderation</Eyebrow>
        <h1 style={{
          fontSize: 56, fontWeight: 800, letterSpacing: "-0.02em",
          lineHeight: 1.05, margin: "24px 0 0", color: NAVY,
        }}>
          Approve, reject, or send<br />revision notes — fast.
        </h1>
      </div>
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0,
        height: 580,
        backgroundImage: "url(assets/feature-binary-pass-fail.png)",
        backgroundSize: "cover",
        backgroundPosition: "left center",
      }} />
    </Artboard>
  );
}

// ============================================================
// V10 · Stat-forward minimal
// ============================================================
function V10Stat() {
  return (
    <Artboard padding={100} filename="brieflee-v10-stat">
      <Eyebrow>Time saved</Eyebrow>
      <div style={{
        marginTop: 60,
        fontSize: 280, fontWeight: 800, letterSpacing: "-0.05em",
        lineHeight: 0.9, color: NAVY,
        fontFeatureSettings: "'tnum'",
      }}>
        96<span style={{ color: PERI }}>%</span>
      </div>
      <div style={{
        marginTop: 24,
        fontSize: 32, fontWeight: 700, color: NAVY, lineHeight: 1.25,
        maxWidth: 720,
        letterSpacing: "-0.01em",
      }}>
        less time spent<br />reviewing video submissions.
      </div>
      <div style={{
        marginTop: "auto",
        display: "flex", alignItems: "center", gap: 14,
        color: NAVY, opacity: 0.65, fontSize: 15, fontWeight: 600,
        letterSpacing: "0.04em", textTransform: "uppercase",
      }}>
        <div style={{ width: 36, height: 1.5, background: NAVY, opacity: 0.4 }} />
        Average across 200+ Brieflee customers
      </div>
    </Artboard>
  );
}

// ============================================================
// V11 · iPhone tripod engraving — vertical-leaning
// ============================================================
function V11Tripod() {
  return (
    <Artboard padding={0} filename="brieflee-v11-tripod">
      {/* faint navy lines */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `repeating-linear-gradient(0deg, transparent 0, transparent 38px, rgba(0,19,100,0.04) 38px, rgba(0,19,100,0.04) 39px)`,
      }} />
      <img
        src="assets/engraving-iphone-tripod.png"
        alt=""
        style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%, -52%)",
          height: 720, objectFit: "contain",
          filter: "drop-shadow(0 24px 40px rgba(0,19,100,0.20))",
        }}
      />
      {/* corner labels */}
      <div style={{
        position: "absolute", top: 60, left: 80,
        fontSize: 14, fontWeight: 700, letterSpacing: "0.18em",
        textTransform: "uppercase", color: NAVY, opacity: 0.7,
      }}>
        Brieflee
      </div>
      <div style={{
        position: "absolute", top: 60, right: 80,
        fontSize: 14, fontWeight: 700, letterSpacing: "0.18em",
        textTransform: "uppercase", color: NAVY, opacity: 0.7,
      }}>
        Est. 2024
      </div>
      <div style={{
        position: "absolute", bottom: 70, left: 0, right: 0,
        textAlign: "center",
        fontSize: 28, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em",
      }}>
        Built for the era of UGC at scale.
      </div>
    </Artboard>
  );
}

// ============================================================
// V12 · QA checklist — the 26-item promise
// ============================================================
function V12Checklist() {
  const items = [
    "Hook lands in first 2 seconds",
    "Audio quality above 80%",
    "Product visible 60% of runtime",
    "Brand mentioned ≥ 1×",
    "Caption matches brief",
    "Aspect ratio 9:16",
    "No competing logos visible",
    "Music cleared for usage",
    "CTA appears in final 3 seconds",
  ];
  return (
    <Artboard padding={90} filename="brieflee-v12-checklist">
      <Eyebrow>26-point QA checklist</Eyebrow>
      <h1 style={{
        fontSize: 56, fontWeight: 800, letterSpacing: "-0.02em",
        lineHeight: 1.05, margin: "24px 0 36px", color: NAVY,
      }}>
        We check the things you<br />don't have time to.
      </h1>

      <div style={{
        background: "#fff", borderRadius: 22,
        border: `1px solid ${BORDER}`,
        boxShadow: "0 12px 32px -8px rgba(0,19,100,0.08)",
        overflow: "hidden",
      }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: "18px 28px",
            borderBottom: i < items.length - 1 ? `1px solid ${PERI_FAINT}` : "none",
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%",
              background: PERI, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <span style={{ fontSize: 19, color: NAVY, fontWeight: 500 }}>{item}</span>
            <span style={{
              marginLeft: "auto",
              fontSize: 13, fontWeight: 700, color: "#166534",
              background: "#dcfce7", padding: "4px 10px", borderRadius: 999,
              letterSpacing: "0.04em",
            }}>PASS</span>
          </div>
        ))}
        <div style={{
          padding: "16px 28px",
          background: PERI_FAINT,
          fontSize: 15, fontWeight: 600, color: NAVY, opacity: 0.7,
          letterSpacing: "0.02em",
        }}>
          + 17 more checks
        </div>
      </div>
    </Artboard>
  );
}

// ============================================================
// Export all
// ============================================================
Object.assign(window, {
  V1ProductGrid, V2Testimonial, V3Engraving, V4Stickers,
  V5BoldType, V6ScoreCard, V7SocialProof, V8BrainEngraving,
  V9PassFail, V10Stat, V11Tripod, V12Checklist,
});
