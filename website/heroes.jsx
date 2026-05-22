/* global React */
const { useState, useEffect } = React;

// ============================================================
// Brieflee — Homepage Hero variants
// Three different angles, all 1920×1080 desktop heroes.
// Light mode: periwinkle on cream, navy type.
// ============================================================

const NAVY  = "#001364";
const PERI  = "#879CF7";
const PERI2 = "#6B82E8";
const CREAM = "#F6F4EF";
const PAPER = "#FFFFFF";
const PERI_LIGHT = "#ECF0FF";
const PERI_FAINT = "#F4F6FF";
const BORDER = "#D6DEFC";
const GREEN = "#22c55e";
const RED   = "#ef4444";
const AMBER = "#f59e0b";

// ─── Hero wrapper: 1920×1080, JS-scaled to fit container ────
function Hero({ children, bg = CREAM, style }) {
  const outerRef = React.useRef(null);
  const innerRef = React.useRef(null);
  React.useLayoutEffect(() => {
    const o = outerRef.current, i = innerRef.current;
    if (!o || !i) return;
    const apply = () => {
      const w = o.clientWidth, h = o.clientHeight;
      if (!w || !h) return;
      i.style.transform = `scale(${Math.min(w / 1920, h / 1080)})`;
    };
    apply();
    const ro = new ResizeObserver(apply); ro.observe(o);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={outerRef} style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", background: bg }}>
      <div ref={innerRef} style={{
        width: 1920, height: 1080, position: "absolute", top: 0, left: 0, transformOrigin: "top left",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: NAVY,
        ...style,
      }}>
        {children}
      </div>
    </div>
  );
}

// ─── Shared site nav (Softr-style) ───────────────────────────
function Nav({ light = true }) {
  const fg = light ? NAVY : "#fff";
  return (
    <nav style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 96,
      padding: "0 80px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      zIndex: 50,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 56 }}>
        <img src="assets/brieflee-logo.svg" alt="Brieflee" style={{ height: 32 }} />
        <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
          <NavItem label="Product" hasMenu fg={fg} />
          <NavItem label="Solutions" hasMenu fg={fg} />
          <NavItem label="Resources" hasMenu fg={fg} />
          <NavItem label="Pricing" fg={fg} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: fg, opacity: 0.85 }}>Login</span>
        <button style={{
          background: PERI, color: "#fff", border: "none",
          padding: "14px 24px", borderRadius: 999,
          fontSize: 15, fontWeight: 700, cursor: "pointer",
          fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 1px 0 0 rgba(0,19,100,0.18), 0 8px 24px -8px rgba(135,156,247,0.6)",
        }}>
          Start free trial
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </nav>
  );
}
function NavItem({ label, hasMenu, fg }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 15, fontWeight: 600, color: fg, opacity: 0.85, cursor: "pointer" }}>
      {label}
      {hasMenu && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>}
    </div>
  );
}

// ─── Eyebrow pill ──────────────────────────────────────────
function Eyebrow({ children, variant = "peri" }) {
  const styles = {
    peri: { bg: "rgba(135,156,247,0.16)", fg: NAVY, dot: PERI },
    navy: { bg: NAVY, fg: "#fff", dot: PERI },
  }[variant];
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      padding: "10px 18px",
      background: styles.bg, color: styles.fg,
      fontSize: 14, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
      borderRadius: 999, width: "fit-content",
    }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: styles.dot, boxShadow: `0 0 0 3px ${styles.dot}33` }} />
      {children}
    </div>
  );
}

// ─── Primary / secondary buttons ────────────────────────────
function Btn({ children, primary, large }) {
  const base = {
    border: "none",
    padding: large ? "20px 32px" : "16px 26px",
    borderRadius: 999,
    fontSize: large ? 18 : 16,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex", alignItems: "center", gap: 10,
  };
  if (primary) return (
    <button style={{
      ...base,
      background: PERI, color: "#fff",
      boxShadow: "0 2px 0 0 rgba(0,19,100,0.22), 0 14px 28px -10px rgba(135,156,247,0.7)",
    }}>
      {children}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
    </button>
  );
  return (
    <button style={{
      ...base,
      background: "transparent", color: NAVY,
      border: `1.5px solid ${NAVY}22`,
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill={NAVY}><path d="M8 5v14l11-7z"/></svg>
      {children}
    </button>
  );
}

// ────────────────────────────────────────────────────────────
// Reusable: a scored UGC video tile (used in V1 & V2)
// ────────────────────────────────────────────────────────────
function VideoTile({ score, status, label, creator, gradient, w = 220, h = 290 }) {
  const statusColor = status === "PASS" ? GREEN : status === "FAIL" ? RED : AMBER;
  const statusBg    = status === "PASS" ? "#dcfce7" : status === "FAIL" ? "#fee2e2" : "#fef3c7";
  const statusFg    = status === "PASS" ? "#166534" : status === "FAIL" ? "#991b1b" : "#92400e";
  return (
    <div style={{
      width: w, height: h, borderRadius: 18,
      background: gradient || `linear-gradient(135deg, ${PERI} 0%, ${PERI2} 100%)`,
      position: "relative", overflow: "hidden",
      boxShadow: "0 10px 30px -8px rgba(0,19,100,0.20), 0 2px 0 0 rgba(0,19,100,0.05)",
      border: `1px solid ${BORDER}`,
    }}>
      {/* faux video noise */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.4, background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.35) 0%, transparent 50%)" }} />
      {/* status chip top-right */}
      <div style={{
        position: "absolute", top: 12, right: 12,
        padding: "5px 10px", borderRadius: 999,
        background: statusBg, color: statusFg,
        fontSize: 11, fontWeight: 800, letterSpacing: "0.04em",
      }}>{status}</div>
      {/* score bottom-left */}
      <div style={{
        position: "absolute", bottom: 56, left: 14,
        fontSize: 38, fontWeight: 800, color: "#fff",
        letterSpacing: "-0.02em",
        textShadow: "0 2px 12px rgba(0,0,0,0.25)",
      }}>{score}</div>
      <div style={{
        position: "absolute", bottom: 38, left: 14,
        fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.85)",
        letterSpacing: "0.06em", textTransform: "uppercase",
      }}>Score</div>
      {/* creator strip */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "10px 14px",
        background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.55) 100%)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.9)" }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{creator}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
        </div>
      </div>
      {/* play icon */}
      <div style={{
        position: "absolute", top: "42%", left: "50%", transform: "translate(-50%, -50%)",
        width: 56, height: 56, borderRadius: "50%",
        background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)",
        border: "1.5px solid rgba(255,255,255,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" style={{ marginLeft: 3 }}><path d="M8 5v14l11-7z"/></svg>
      </div>
    </div>
  );
}

// Gradients for tiles
const GRADIENTS = [
  "linear-gradient(135deg, #FF6B9D 0%, #C53C7E 100%)",
  "linear-gradient(160deg, #5EE2C9 0%, #2A8E7E 100%)",
  "linear-gradient(150deg, #FFB86B 0%, #E87E45 100%)",
  "linear-gradient(135deg, #879CF7 0%, #4A5EC9 100%)",
  "linear-gradient(140deg, #B4A0FF 0%, #6B5AE0 100%)",
  "linear-gradient(160deg, #FFD66B 0%, #E89E45 100%)",
];

// ============================================================
// ============================================================
// HERO V1 · "Score every video before you post"
// Animated analysis stage: a video card plays → metrics fade in
// as glass chips → PASS / FAIL ribbon swings in → next video.
// Cycles through formats (POV, ASMR, Try On, Street Interview,
// Podcast, Reaction…) with format-appropriate metrics.
// ============================================================

const ANALYSIS_CARDS = [
  {
    format: "POV", grad: GRADIENTS[3], score: 91, status: "PASS",
    summary: "Hook + pace + brand all in spec",
    chips: [
      { l: "Visual hook",      v: "0.6s",        ok: true,  pos: { x: -280, y: -220 } },
      { l: "Engagement pace",  v: "2.4s / cut",  ok: true,  pos: { x: -280, y:  60  } },
      { l: "Brand mention",    v: "3×",          ok: true,  pos: { x:  280, y: -220 } },
      { l: "Product visible",  v: "84%",         ok: true,  pos: { x:  280, y:  60  } },
    ],
  },
  {
    format: "ASMR", grad: GRADIENTS[1], score: 42, status: "FAIL",
    summary: "Audio quality below 80% threshold",
    chips: [
      { l: "Audibility",       v: "62%",         ok: false, pos: { x: -280, y: -220 } },
      { l: "Visual hook",      v: "3.2s",        ok: false, pos: { x: -280, y:  60  } },
      { l: "Face time",        v: "8%",          ok: false, pos: { x:  280, y: -220 } },
      { l: "Brand mention",    v: "0×",          ok: false, pos: { x:  280, y:  60  } },
    ],
  },
  {
    format: "Try On", grad: GRADIENTS[0], score: 87, status: "PASS",
    summary: "Strong product visibility + face time",
    chips: [
      { l: "Product visible",  v: "92%",         ok: true,  pos: { x: -280, y: -220 } },
      { l: "Face time",        v: "44%",         ok: true,  pos: { x: -280, y:  60  } },
      { l: "Legibility",       v: "88%",         ok: true,  pos: { x:  280, y: -220 } },
      { l: "Visual hook",      v: "0.9s",        ok: true,  pos: { x:  280, y:  60  } },
    ],
  },
  {
    format: "Street Interview", grad: GRADIENTS[4], score: 64, status: "REVISE",
    summary: "Brand mention below 4× threshold",
    chips: [
      { l: "Audibility",       v: "82%",         ok: true,  pos: { x: -280, y: -220 } },
      { l: "Visual hook",      v: "1.4s",        ok: false, pos: { x: -280, y:  60  } },
      { l: "Engagement pace",  v: "4.1s",        ok: true,  pos: { x:  280, y: -220 } },
      { l: "Brand mention",    v: "1×",          ok: false, pos: { x:  280, y:  60  } },
    ],
  },
  {
    format: "Podcast", grad: GRADIENTS[5], score: 79, status: "PASS",
    summary: "Audibility + pacing nail the format",
    chips: [
      { l: "Audibility",       v: "94%",         ok: true,  pos: { x: -280, y: -220 } },
      { l: "Face time",        v: "61%",         ok: true,  pos: { x: -280, y:  60  } },
      { l: "Engagement pace",  v: "3.2s",        ok: true,  pos: { x:  280, y: -220 } },
      { l: "Legibility",       v: "92%",         ok: true,  pos: { x:  280, y:  60  } },
    ],
  },
  {
    format: "Reaction", grad: GRADIENTS[2], score: 73, status: "PASS",
    summary: "Face time + pace dialed in",
    chips: [
      { l: "Face time",        v: "58%",         ok: true,  pos: { x: -280, y: -220 } },
      { l: "Visual hook",      v: "0.7s",        ok: true,  pos: { x: -280, y:  60  } },
      { l: "Engagement pace",  v: "2.1s",        ok: true,  pos: { x:  280, y: -220 } },
      { l: "Audibility",       v: "86%",         ok: true,  pos: { x:  280, y:  60  } },
    ],
  },
];

const HEADLINES = [
  { a: "Review their videos", em: "in seconds.", b: "" },
  { a: "AI watches every video", em: "before", b: " you do." },
  { a: "Every submission,", em: "checked", b: " — so you don't have to." },
  { a: "We watch the videos", em: "so you", b: " don't have to." },
  { a: "Review 10,000 videos", em: "without", b: " watching one." },
  { a: "An AI second pair", em: "of eyes", b: " on every video." },
  { a: "Check every video", em: "before", b: " they post." },
  { a: "Score every UGC asset", em: "in 4", b: " seconds." },
];

function HeroV1() {
  const [idx, setIdx] = React.useState(0);
  const [hl, setHl] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setIdx(x => (x + 1) % ANALYSIS_CARDS.length), 5800);
    return () => clearInterval(t);
  }, []);
  const card = ANALYSIS_CARDS[idx];
  const headline = HEADLINES[hl];
  return (
    <Hero bg="radial-gradient(ellipse 110% 80% at 50% -10%, #DCE3FF 0%, #ECF0FF 35%, #FFFFFF 75%)">
      <Nav />
      {/* faint grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(${NAVY}08 1px, transparent 1px), linear-gradient(90deg, ${NAVY}08 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
        backgroundPosition: "40px 40px",
        maskImage: "radial-gradient(ellipse 100% 70% at 50% 30%, black 0%, transparent 80%)",
      }} />

      {/* LEFT: headline + CTAs */}
      <div style={{ position: "absolute", top: 220, left: 80, width: 920, zIndex: 10 }}>
        <Eyebrow>AI review · 4 seconds per video</Eyebrow>
        <h1 style={{
          fontSize: 124, fontWeight: 800, letterSpacing: "-0.038em",
          lineHeight: 0.94, margin: "32px 0 0", color: NAVY,
          textWrap: "balance",
        }}>
          {headline.a}<br />
          <span style={{ color: PERI, fontStyle: "italic", fontWeight: 700 }}>{headline.em}</span>{headline.b}
        </h1>
        {/* Headline variant picker */}
        <div style={{
          marginTop: 18, display: "flex", flexWrap: "wrap", gap: 8,
          alignItems: "center",
        }}>
          <span style={{ fontSize: 12, color: NAVY, opacity: 0.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginRight: 4 }}>
            Headline ↓
          </span>
          {HEADLINES.map((h, i) => (
            <button key={i} onClick={() => setHl(i)} style={{
              padding: "6px 12px", borderRadius: 999,
              border: `1px solid ${i === hl ? PERI : "rgba(0,19,100,0.15)"}`,
              background: i === hl ? PERI : "rgba(255,255,255,0.6)",
              color: i === hl ? "#fff" : NAVY,
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit",
            }}>
              {i + 1}
            </button>
          ))}
        </div>
        <p style={{
          fontSize: 24, lineHeight: 1.45, color: NAVY, opacity: 0.7,
          margin: "32px 0 0", maxWidth: 680, fontWeight: 500,
        }}>
          Brieflee reviews UGC, influencer, and creator content against your brief — flagging hook, length, brand mention, and 23 more checks. In seconds, not afternoons.
        </p>
        <div style={{ marginTop: 44, maxWidth: 720 }}>
          {/* Tab toggle */}
          <div style={{
            display: "inline-flex",
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: `1px solid rgba(255,255,255,0.7)`,
            borderRadius: 999, padding: 6,
            boxShadow: "0 4px 16px -4px rgba(0,19,100,0.10)",
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 999,
              background: PERI, color: "#fff", fontSize: 16, fontWeight: 700,
              boxShadow: "0 2px 8px rgba(135,156,247,0.45)",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              Paste URL
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 999,
              color: NAVY, fontSize: 16, fontWeight: 700, opacity: 0.85,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload file
            </div>
          </div>
          {/* URL field */}
          <div style={{
            marginTop: 16,
            display: "flex", alignItems: "center",
            background: "#fff",
            border: `1px solid ${BORDER}`,
            borderRadius: 18, padding: 10,
            boxShadow: "0 6px 24px -8px rgba(0,19,100,0.10)",
          }}>
            <div style={{
              flex: 1, padding: "0 18px",
              fontSize: 18, fontWeight: 500, color: NAVY, opacity: 0.55,
            }}>
              https://www.tiktok.com/@creator/video/…
            </div>
            <button style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "16px 24px", borderRadius: 12,
              background: PERI, color: "#fff",
              fontSize: 18, fontWeight: 700, border: "none",
              fontFamily: "inherit", cursor: "pointer",
              boxShadow: "0 4px 14px -2px rgba(135,156,247,0.55)",
            }}>
              Break it down
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          {/* Value props row */}
          <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 28, fontSize: 16, color: NAVY, fontWeight: 600 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: PERI }} />
              Free to use
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PERI} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Under 60 seconds
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PERI} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Frame by frame
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: analysis stage — keyed so animations restart per card */}
      <AnalysisStage key={idx} card={card} />
    </Hero>
  );
}

function AnalysisStage({ card }) {
  const cardW = 360, cardH = 600;
  const verdictColor = card.status === "PASS" ? GREEN : card.status === "FAIL" ? RED : AMBER;
  const verdictBg    = card.status === "PASS" ? "#dcfce7" : card.status === "FAIL" ? "#fee2e2" : "#fef3c7";
  const verdictFg    = card.status === "PASS" ? "#0f5132" : card.status === "FAIL" ? "#7f1d1d" : "#7c2d12";

  return (
    <div style={{
      position: "absolute", right: 0, top: 80, width: 1000, height: 1000,
      pointerEvents: "none",
    }}>
      {/* soft periwinkle glow behind the stage */}
      <div style={{
        position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
        width: 700, height: 700, borderRadius: "50%",
        background: `radial-gradient(circle, ${PERI}55 0%, transparent 65%)`,
        filter: "blur(40px)",
      }} />

      {/* STACK: next 2 cards peeking behind the active one */}
      {[2, 1].map((offset) => {
        const peek = ANALYSIS_CARDS[(ANALYSIS_CARDS.indexOf(card) + offset) % ANALYSIS_CARDS.length];
        const dz = offset; // 1 = closest behind, 2 = furthest
        return (
          <div key={offset} style={{
            position: "absolute", left: "50%", top: "50%",
            marginLeft: -cardW/2 + dz * 40,
            marginTop:  -cardH/2 + dz * 50,
            width: cardW, height: cardH,
            transform: `scale(${1 - dz * 0.07}) rotate(${dz * 3}deg)`,
            opacity: 1 - dz * 0.22,
            filter: `blur(${dz * 0.5}px)`,
            zIndex: -dz,
          }}>
            <div style={{
              width: "100%", height: "100%", borderRadius: 28,
              background: peek.grad,
              position: "relative", overflow: "hidden",
              boxShadow: "0 20px 40px -16px rgba(0,19,100,0.22)",
              border: "1px solid rgba(255,255,255,0.35)",
            }}>
              <div style={{ position: "absolute", inset: 0, opacity: 0.45, background: "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.45) 0%, transparent 55%), radial-gradient(circle at 75% 70%, rgba(0,0,0,0.18) 0%, transparent 50%)" }} />
              <div className="glass-dark" style={{
                position: "absolute", top: 18, right: 18,
                padding: "8px 14px", borderRadius: 999,
                fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase",
              }}>
                {peek.format}
              </div>
              <div className="glass" style={{
                position: "absolute", bottom: 18, left: 18,
                padding: "6px 12px", borderRadius: 999,
                fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: NAVY, opacity: 0.8,
              }}>
                Queued
              </div>
            </div>
          </div>
        );
      })}

      {/* center: video card (active) */}
      <div style={{
        position: "absolute", left: "50%", top: "50%", marginLeft: -cardW/2, marginTop: -cardH/2,
        width: cardW, height: cardH,
        animation: "cardEnter 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
      }}>
        <div style={{
          width: "100%", height: "100%", borderRadius: 28,
          background: card.grad,
          position: "relative", overflow: "hidden",
          boxShadow: "0 30px 60px -16px rgba(0,19,100,0.30), 0 4px 0 rgba(0,19,100,0.08)",
          border: "1px solid rgba(255,255,255,0.35)",
        }}>
          {/* faux video noise */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.45, background: "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.45) 0%, transparent 55%), radial-gradient(circle at 75% 70%, rgba(0,0,0,0.18) 0%, transparent 50%)" }} />
          {/* moving shimmer to suggest playback */}
          <div style={{
            position: "absolute", top: 0, left: 0, bottom: 0, width: "40%",
            background: "linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
            animation: "shimmer 2.6s linear infinite",
          }} />

          {/* play icon */}
          <div style={{
            position: "absolute", top: "44%", left: "50%", transform: "translate(-50%, -50%)",
            width: 86, height: 86, borderRadius: "50%",
            background: "rgba(255,255,255,0.22)", backdropFilter: "blur(10px)",
            border: "1.5px solid rgba(255,255,255,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff" style={{ marginLeft: 4 }}><path d="M8 5v14l11-7z"/></svg>
          </div>

          {/* "ANALYZING" tag top-left */}
          <div className="glass" style={{
            position: "absolute", top: 18, left: 18,
            padding: "8px 12px 8px 10px", borderRadius: 999,
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: NAVY,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%", background: PERI,
              boxShadow: `0 0 0 3px ${PERI}55`,
              animation: "pulseDot 1.1s ease-in-out infinite",
            }} />
            Analyzing
          </div>

          {/* format tag top-right */}
          <div className="glass-dark" style={{
            position: "absolute", top: 18, right: 18,
            padding: "8px 14px", borderRadius: 999,
            fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase",
          }}>
            {card.format}
          </div>

          {/* bottom strip: filename + scrubber */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: "26px 22px 22px",
            background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.55) 100%)",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
              @{card.format.toLowerCase().replace(/\s+/g, "_")}_creator · take_07.mp4
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600, marginBottom: 12 }}>
              Reviewing against Q3 brief · 26-point checklist
            </div>
            <div style={{ height: 4, borderRadius: 999, background: "rgba(255,255,255,0.22)", overflow: "hidden" }}>
              <div style={{
                height: "100%", background: "#fff", borderRadius: 999,
                animation: "scrub 4.2s cubic-bezier(0.4, 0, 0.2, 1) forwards",
              }} />
            </div>
          </div>

          {/* VERDICT ribbon — swings in after analysis */}
          <div style={{
            position: "absolute", left: "50%", top: "50%",
            padding: "18px 30px",
            borderRadius: 18,
            background: verdictBg,
            border: `2px solid ${verdictColor}`,
            color: verdictFg,
            fontSize: 36, fontWeight: 900, letterSpacing: "0.04em",
            display: "flex", alignItems: "center", gap: 14,
            boxShadow: `0 24px 48px -12px ${verdictColor}66, 0 2px 0 rgba(0,0,0,0.05)`,
            opacity: 0,
            animation: "verdictIn 0.9s 4.2s cubic-bezier(0.22, 1, 0.36, 1) both",
          }}>
            {card.status === "PASS" && <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
            {card.status === "FAIL" && <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>}
            {card.status === "REVISE" && <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M8 16H3v5"/></svg>}
            {card.status}
          </div>

          {/* score under verdict — appears later */}
          <div style={{
            position: "absolute", left: "50%", top: "calc(50% + 78px)",
            transform: "translateX(-50%)",
            fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: "0.06em", textTransform: "uppercase",
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            opacity: 0,
            animation: "chipIn 0.5s 4.7s both ease",
          }}>
            Score {card.score} / 100
          </div>
        </div>
      </div>

      {/* FLOATING GLASS CHIPS around the card */}
      {card.chips.map((c, i) => {
        const enterDelay = 0.8 + i * 0.45;     // staggered fade-in
        const floatDelay = enterDelay + 0.6;   // float kicks in after entry
        const floatDur   = 4 + (i * 0.6);
        const cx = 500 + c.pos.x; // 500 is right-stage center
        const cy = 500 + c.pos.y;
        const okBg = c.ok ? "#dcfce7" : "#fee2e2";
        const okFg = c.ok ? "#166534" : "#991b1b";
        const okIcon = c.ok
          ? <polyline points="20 6 9 17 4 12"/>
          : <path d="M18 6L6 18M6 6l12 12"/>;
        return (
          <div key={i} style={{
            position: "absolute", left: cx, top: cy,
            animation: `chipIn 0.6s ${enterDelay}s both cubic-bezier(0.22, 1, 0.36, 1), chipFloat ${floatDur}s ${floatDelay}s ease-in-out infinite`,
          }}>
            <div className="glass" style={{
              padding: "12px 16px 12px 12px",
              borderRadius: 16,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9,
                background: okBg, color: okFg,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">{okIcon}</svg>
              </div>
              <div>
                <div style={{ fontSize: 10, color: NAVY, opacity: 0.55, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>{c.l}</div>
                <div style={{ fontSize: 17, color: NAVY, fontWeight: 800, letterSpacing: "-0.005em" }}>{c.v}</div>
              </div>
            </div>
          </div>
        );
      })}

      {/* summary chip — appears with the verdict */}
      <div style={{
        position: "absolute", left: 500, top: 500 + 320, transform: "translateX(-50%)",
        animation: "chipIn 0.6s 4.5s both ease",
      }}>
        <div className="glass" style={{
          padding: "12px 20px", borderRadius: 999,
          display: "flex", alignItems: "center", gap: 10,
          fontSize: 14, color: NAVY, fontWeight: 700,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: verdictColor }} />
          {card.summary}
        </div>
      </div>
    </div>
  );
}

function Annotation() { return null; } // legacy, unused

// ============================================================
// HERO V2 · "The first eyes on every submission"
// Centered editorial headline over a tiled wall of scored UGC.
// Bold, magazine-like, novel: the type sits on top of the product.
// ============================================================
function HeroV2() {
  // Build a 6×3 mosaic of small video tiles behind the headline
  const tiles = [];
  const stats = ["PASS","PASS","WARN","PASS","FAIL","PASS","PASS","PASS","WARN","PASS","PASS","FAIL","PASS","WARN","PASS","PASS","PASS","PASS"];
  const scores= [94,88,62,77,38,91,82,79,55,86,93,42,71,68,84,89,76,90];
  for (let i = 0; i < 18; i++) {
    tiles.push({
      score: scores[i], status: stats[i],
      label: ["Hook","Length","Caption","Brand","Audio","Pace"][i % 6] + " review",
      creator: "@creator_" + (100 + i),
      gradient: GRADIENTS[i % GRADIENTS.length],
    });
  }
  return (
    <Hero bg={CREAM}>
      <Nav />
      {/* TILE WALL - bottom layer */}
      <div style={{
        position: "absolute", inset: 0,
        display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gridTemplateRows: "repeat(3, 1fr)",
        padding: "100px 40px 40px",
        gap: 18,
        opacity: 0.55,
      }}>
        {tiles.map((t, i) => (
          <div key={i} style={{ transform: `rotate(${(i % 3 - 1) * 1.5}deg)` }}>
            <VideoTile {...t} w="100%" h="100%" />
          </div>
        ))}
      </div>
      {/* radial vignette to spotlight center */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 60% 55% at 50% 52%, ${CREAM} 0%, ${CREAM}EE 35%, transparent 75%)`,
      }} />

      {/* CENTER content */}
      <div style={{
        position: "absolute", top: 220, left: 0, right: 0,
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
        padding: "0 80px",
      }}>
        <Eyebrow>26-point QA checklist</Eyebrow>
        <h1 style={{
          fontSize: 156, fontWeight: 800, letterSpacing: "-0.045em",
          lineHeight: 0.88, margin: "28px 0 0", color: NAVY,
          textWrap: "balance",
          textShadow: `0 2px 0 ${CREAM}, 0 -1px 0 ${CREAM}, 2px 0 0 ${CREAM}, -2px 0 0 ${CREAM}`,
        }}>
          The first<br />
          set of <span style={{
            background: `linear-gradient(180deg, ${PERI} 0%, ${PERI2} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontStyle: "italic",
          }}>eyes</span> on<br />
          every video.
        </h1>
        <div style={{ display: "flex", gap: 16, marginTop: 48 }}>
          <Btn primary large>Start free trial</Btn>
          <Btn large>Watch 90-sec demo</Btn>
        </div>
        <div style={{ marginTop: 24, fontSize: 14, color: NAVY, opacity: 0.6, fontWeight: 600, letterSpacing: "0.04em" }}>
          7-day free trial · Reviewing in 5 minutes
        </div>
      </div>

      {/* floating chips */}
      <FloatingChip x={120} y={920} label="Hook timing" v="✓ 0.8s" />
      <FloatingChip x={1500} y={880} label="Brand mention" v="✓ 3×" />
      <FloatingChip x={140} y={300} label="Score" v="94/100" big />
      <FloatingChip x={1560} y={300} label="Reviewed in" v="4.2s" />
    </Hero>
  );
}

function FloatingChip({ x, y, label, v, big }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)",
      background: PAPER,
      padding: big ? "16px 22px" : "12px 18px",
      borderRadius: 16,
      border: `1px solid ${BORDER}`,
      boxShadow: "0 16px 36px -10px rgba(0,19,100,0.22)",
      display: "flex", alignItems: "center", gap: 12,
      zIndex: 20,
    }}>
      <div style={{
        width: big ? 32 : 24, height: big ? 32 : 24, borderRadius: 8,
        background: PERI_LIGHT, color: PERI,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width={big ? 18 : 14} height={big ? 18 : 14} viewBox="0 0 24 24" fill="none" stroke={PERI2} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div>
        <div style={{ fontSize: 11, color: NAVY, opacity: 0.55, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontSize: big ? 22 : 16, color: NAVY, fontWeight: 800 }}>{v}</div>
      </div>
    </div>
  );
}

// ============================================================
// HERO V3 · "Inbox to approved in 4 seconds"
// Two-panel split: chaotic inbox on left, clean approved on right.
// Bold visual metaphor — before / after the product runs.
// ============================================================
function HeroV3() {
  return (
    <Hero bg={CREAM}>
      <Nav />

      {/* Headline strip across top */}
      <div style={{ position: "absolute", top: 180, left: 0, right: 0, padding: "0 80px", textAlign: "center" }}>
        <Eyebrow>Computer vision review</Eyebrow>
        <h1 style={{
          fontSize: 116, fontWeight: 800, letterSpacing: "-0.035em",
          lineHeight: 0.96, margin: "26px 0 0", color: NAVY,
          textWrap: "balance",
        }}>
          From inbox to approved<br />
          <span style={{ color: PERI, fontStyle: "italic" }}>in 4 seconds.</span>
        </h1>
      </div>

      {/* split panels */}
      <div style={{ position: "absolute", top: 540, left: 80, right: 80, height: 440, display: "flex", gap: 36 }}>
        {/* LEFT: chaos inbox */}
        <div style={{ flex: 1, position: "relative" }}>
          <div style={{
            position: "absolute", top: -32, left: 0,
            display: "flex", alignItems: "center", gap: 10,
            fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: NAVY, opacity: 0.55,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: RED }} />
            Without Brieflee
          </div>
          <div style={{
            width: "100%", height: "100%", borderRadius: 24,
            background: PAPER,
            border: `1px solid ${BORDER}`,
            padding: 24, overflow: "hidden",
            position: "relative",
          }}>
            {/* messy stack of submissions */}
            {[
              { who: "@curology_ugc", when: "12 min ago", what: "submission_v3_final.mp4" },
              { who: "@magic.spoon",  when: "27 min ago", what: "MAGICSPOON_HOOK_TEST.mov" },
              { who: "@ridge.creator", when: "1 hr ago",  what: "ridge-wallet-q3-aspect-2.mp4" },
              { who: "@ag1.aria",     when: "2 hr ago",  what: "AG1_aria_take7_REVISED.mp4" },
              { who: "@mudwtr.tom",   when: "3 hr ago",  what: "mudwtr_tom_hook_FIX.mov" },
              { who: "@truecla.maya", when: "5 hr ago",  what: "true-classic-day12-v9.mp4" },
              { who: "@drsquatch.k",  when: "yesterday", what: "DR_SQUATCH_round4_FINAL_v2.mov" },
            ].map((s, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "10px 8px",
                borderBottom: i < 6 ? `1px solid ${PERI_FAINT}` : "none",
                fontSize: 14,
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: GRADIENTS[i % GRADIENTS.length], flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: NAVY }}>{s.who}</div>
                  <div style={{ fontSize: 12, color: NAVY, opacity: 0.55, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.what}</div>
                </div>
                <div style={{ fontSize: 12, color: NAVY, opacity: 0.45, fontWeight: 600 }}>{s.when}</div>
                <div style={{ fontSize: 11, color: AMBER, fontWeight: 800, letterSpacing: "0.04em", padding: "4px 8px", background: "#fef3c7", borderRadius: 6 }}>PENDING</div>
              </div>
            ))}
            {/* counter overlay */}
            <div style={{
              position: "absolute", top: 18, right: 18,
              background: "#fee2e2", color: "#991b1b",
              padding: "8px 14px", borderRadius: 999,
              fontSize: 13, fontWeight: 800,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              47 unreviewed
            </div>
          </div>
        </div>

        {/* MIDDLE: arrow + brieflee badge */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: "0 4px" }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: PERI, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 16px 32px -8px rgba(135,156,247,0.6), 0 2px 0 rgba(0,19,100,0.2)",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: NAVY, opacity: 0.6, textAlign: "center" }}>
            Brieflee<br />4.2s
          </div>
        </div>

        {/* RIGHT: clean approved stack */}
        <div style={{ flex: 1, position: "relative" }}>
          <div style={{
            position: "absolute", top: -32, left: 0,
            display: "flex", alignItems: "center", gap: 10,
            fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: NAVY, opacity: 0.55,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN }} />
            With Brieflee
          </div>
          <div style={{
            width: "100%", height: "100%", borderRadius: 24,
            background: PAPER,
            border: `1px solid ${BORDER}`,
            padding: 24, overflow: "hidden",
            position: "relative",
            boxShadow: "0 24px 48px -12px rgba(135,156,247,0.35)",
          }}>
            {[
              { who: "@curology_ugc",  score: 94, status: "PASS",   note: "Send to client" },
              { who: "@magic.spoon",   score: 38, status: "FAIL",   note: "Hook lost at 0:04" },
              { who: "@ridge.creator", score: 87, status: "PASS",   note: "Send to client" },
              { who: "@ag1.aria",      score: 62, status: "REVISE", note: "Caption off-brief" },
              { who: "@mudwtr.tom",    score: 91, status: "PASS",   note: "Send to client" },
              { who: "@truecla.maya",  score: 79, status: "PASS",   note: "Send to client" },
              { who: "@drsquatch.k",   score: 48, status: "FAIL",   note: "Brand mention missing" },
            ].map((s, i) => {
              const c = s.status === "PASS" ? GREEN : s.status === "FAIL" ? RED : AMBER;
              const cb = s.status === "PASS" ? "#dcfce7" : s.status === "FAIL" ? "#fee2e2" : "#fef3c7";
              const cf = s.status === "PASS" ? "#166534" : s.status === "FAIL" ? "#991b1b" : "#92400e";
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "10px 8px",
                  borderBottom: i < 6 ? `1px solid ${PERI_FAINT}` : "none",
                  fontSize: 14,
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: GRADIENTS[i % GRADIENTS.length], flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: NAVY }}>{s.who}</div>
                    <div style={{ fontSize: 12, color: NAVY, opacity: 0.55 }}>{s.note}</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: NAVY, letterSpacing: "-0.02em", minWidth: 44, textAlign: "right" }}>{s.score}</div>
                  <div style={{ fontSize: 11, color: cf, background: cb, fontWeight: 800, letterSpacing: "0.04em", padding: "4px 8px", borderRadius: 6, minWidth: 52, textAlign: "center" }}>{s.status}</div>
                </div>
              );
            })}
            <div style={{
              position: "absolute", top: 18, right: 18,
              background: "#dcfce7", color: "#166534",
              padding: "8px 14px", borderRadius: 999,
              fontSize: 13, fontWeight: 800,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              All 47 reviewed
            </div>
          </div>
        </div>
      </div>

      {/* CTAs above the panels, just under headline */}
      <div style={{ position: "absolute", top: 440, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 16 }}>
        <Btn primary large>Start free trial</Btn>
        <Btn large>Watch 90-sec demo</Btn>
      </div>
    </Hero>
  );
}

Object.assign(window, { HeroV1, HeroV2, HeroV3 });
