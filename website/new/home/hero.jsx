// =====================================================================
// Vibe Coding block: Homepage Hero V1 · Score before you post
// =====================================================================
// Direct port of HeroV1 from `new home/heroes (1).jsx`. Design unchanged.
//
// Three things wired in on top of the original:
//   1. Right column carousel pulls real videos from `Video Formats`
//      (no filter / sort / count in code — set on the Source tab)
//   2. Outer wrapper is full-bleed: gradient runs edge-to-edge, hero
//      fills exactly one viewport (height: 100vh, capped at 920px)
//   3. CTA is a trojan horse — paste URL or upload file → fake loading
//      animation → redirect straight to /signup. No data is captured,
//      nothing is written to a table.
//
// Visual language: Apple Liquid Glass (macOS Tahoe / iOS 26) tinted in
// Brieflee periwinkle/navy. Glass surfaces use bl-glass / bl-glass-dark
// classes defined in <Keyframes />.
//
// Removed: navigation bar (Softr provides the nav).
//
// SOFTR UI SETUP (one-time):
//   1. Source tab → Database: brieflee leads → Table: Video Formats
//      (filters / sort / count: configure here, not in code)
//   2. Visibility tab → public.
// =====================================================================

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRecords, q } from "@/lib/datasource";

// ----- Video Formats table aliases (carousel read) -----
// Primary field MUST be in the select or useRecords returns error.
const videoFormatsSelect = q.select({
  caption:      "RLkzt",  // primary
  brand:        "0RVhV",
  visualFormat: "chpG7",
  videoUrl:     "e4FOk",
  logoUrl:      "3Q9oG",
});

const SIGNUP_URL = "https://www.brieflee.co/signup";

// Hero background. Base = nav colour (#FAFBFF) so the seam between nav
// and hero disappears. On top of that, a soft periwinkle "cloud"
// centered behind the headline + card area — radial bloom that reads
// like ambient light, no hard top/bottom gradient lines.
const HERO_BG =
  "radial-gradient(ellipse 65% 50% at 50% 50%, rgba(135,156,247,0.28) 0%, rgba(180,192,245,0.14) 40%, rgba(180,192,245,0) 75%), #FAFBFF";

// ----- Design tokens (from heroes.jsx, unchanged) -----
const NAVY = "#001364";
const PERI = "#879CF7";
const PERI2 = "#6B82E8";
const PERI_LIGHT = "#ECF0FF";
const BORDER = "#D6DEFC";
const GREEN = "#22c55e";
const RED = "#ef4444";
const AMBER = "#f59e0b";

const GRADIENTS = [
  "linear-gradient(135deg, #FF6B9D 0%, #C53C7E 100%)",
  "linear-gradient(160deg, #5EE2C9 0%, #2A8E7E 100%)",
  "linear-gradient(150deg, #FFB86B 0%, #E87E45 100%)",
  "linear-gradient(135deg, #879CF7 0%, #4A5EC9 100%)",
  "linear-gradient(140deg, #B4A0FF 0%, #6B5AE0 100%)",
  "linear-gradient(160deg, #FFD66B 0%, #E89E45 100%)",
];

// ----- Headline cycler (kept as-is from heroes.jsx) -----
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

// ----- Sample chip + verdict templates (rotate per record so the
// analysis-stage theatre stays varied without hardcoding per format) -----
const SAMPLE_VERDICTS = [
  { score: 91, status: "PASS",   summary: "Hook + pace + brand all in spec" },
  { score: 42, status: "FAIL",   summary: "Audio quality below 80% threshold" },
  { score: 87, status: "PASS",   summary: "Strong product visibility + face time" },
  { score: 64, status: "REVISE", summary: "Brand mention below 4× threshold" },
  { score: 79, status: "PASS",   summary: "Audibility + pacing nail the format" },
  { score: 73, status: "PASS",   summary: "Face time + pace dialed in" },
];

const SAMPLE_CHIPS = [
  [
    { l: "Visual hook",     v: "0.6s",       ok: true,  pos: { x: -280, y: -220 } },
    { l: "Engagement pace", v: "2.4s / cut", ok: true,  pos: { x: -280, y:  60  } },
    { l: "Brand mention",   v: "3×",         ok: true,  pos: { x:  280, y: -220 } },
    { l: "Product visible", v: "84%",        ok: true,  pos: { x:  280, y:  60  } },
  ],
  [
    { l: "Audibility",      v: "62%",        ok: false, pos: { x: -280, y: -220 } },
    { l: "Visual hook",     v: "3.2s",       ok: false, pos: { x: -280, y:  60  } },
    { l: "Face time",       v: "8%",         ok: false, pos: { x:  280, y: -220 } },
    { l: "Brand mention",   v: "0×",         ok: false, pos: { x:  280, y:  60  } },
  ],
  [
    { l: "Product visible", v: "92%",        ok: true,  pos: { x: -280, y: -220 } },
    { l: "Face time",       v: "44%",        ok: true,  pos: { x: -280, y:  60  } },
    { l: "Legibility",      v: "88%",        ok: true,  pos: { x:  280, y: -220 } },
    { l: "Visual hook",     v: "0.9s",       ok: true,  pos: { x:  280, y:  60  } },
  ],
  [
    { l: "Audibility",      v: "82%",        ok: true,  pos: { x: -280, y: -220 } },
    { l: "Visual hook",     v: "1.4s",       ok: false, pos: { x: -280, y:  60  } },
    { l: "Engagement pace", v: "4.1s",       ok: true,  pos: { x:  280, y: -220 } },
    { l: "Brand mention",   v: "1×",         ok: false, pos: { x:  280, y:  60  } },
  ],
  [
    { l: "Audibility",      v: "94%",        ok: true,  pos: { x: -280, y: -220 } },
    { l: "Face time",       v: "61%",        ok: true,  pos: { x: -280, y:  60  } },
    { l: "Engagement pace", v: "3.2s",       ok: true,  pos: { x:  280, y: -220 } },
    { l: "Legibility",      v: "92%",        ok: true,  pos: { x:  280, y:  60  } },
  ],
  [
    { l: "Face time",       v: "58%",        ok: true,  pos: { x: -280, y: -220 } },
    { l: "Visual hook",     v: "0.7s",       ok: true,  pos: { x: -280, y:  60  } },
    { l: "Engagement pace", v: "2.1s",       ok: true,  pos: { x:  280, y: -220 } },
    { l: "Audibility",      v: "86%",        ok: true,  pos: { x:  280, y:  60  } },
  ],
];

// Defensive read for q.select aliases.
function readField(item, alias) {
  const v = item?.fields?.[alias];
  if (v == null) return null;
  if (Array.isArray(v)) return v[0]?.label ?? v[0] ?? null;
  if (typeof v === "object") return v.label ?? null;
  return v;
}

function isValidShortFormUrl(input) {
  if (!input) return false;
  try {
    const u = new URL(input.trim());
    return /(^|\.)(tiktok\.com|instagram\.com|youtube\.com|youtu\.be|facebook\.com|fb\.watch|x\.com|twitter\.com|linkedin\.com)$/.test(
      u.hostname
    );
  } catch {
    return false;
  }
}
// =====================================================================
// Block — full-bleed: gradient extends edge-to-edge, no centered card
// =====================================================================
export default function Block() {
  return (
    <div className="relative w-full overflow-hidden">
      <HeroV1 />
    </div>
  );
}

// ─── HeroV1: exact port of heroes.jsx HeroV1 (no nav) ────────────────
function HeroV1() {
  // Source tab decides what comes back; we just consume.
  const { data, status } = useRecords({ select: videoFormatsSelect, count: 200 });
  const items = data?.pages?.flatMap((p) => p?.items ?? []) ?? [];
  const cards = items.map((item, i) => {
    const verdict = SAMPLE_VERDICTS[i % SAMPLE_VERDICTS.length];
    return {
      id: item.id,
      format: readField(item, "visualFormat") || "Format",
      brand: readField(item, "brand") || "creator",
      videoUrl: readField(item, "videoUrl") || "",
      logoUrl: readField(item, "logoUrl") || "",
      grad: GRADIENTS[i % GRADIENTS.length],
      score: verdict.score,
      status: verdict.status,
      summary: verdict.summary,
      chips: SAMPLE_CHIPS[i % SAMPLE_CHIPS.length],
    };
  });

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (cards.length === 0) return;
    const t = setInterval(() => setIdx((x) => (x + 1) % cards.length), 5800);
    return () => clearInterval(t);
  }, [cards.length]);

  const card = cards[idx % Math.max(cards.length, 1)];
  const headline = HEADLINES[1]; // locked: "AI watches every video before you do."

  return (
    <>
      {/* Desktop (lg+, ≥1024px) — fixed 1920×1080 canvas with full theatre */}
      <div className="hidden lg:block">
        <DesktopHero card={card} cards={cards} status={status} headline={headline} />
      </div>
      {/* Tablet + mobile (<lg, <1024px) — single vertical stacked layout.
          Same component handles both; the card grows from 280px → 360px
          via Tailwind responsive max-width so tablet feels roomier than
          mobile without changing the layout direction. */}
      <div className="lg:hidden">
        <MobileHero card={card} cards={cards} status={status} headline={headline} />
      </div>
    </>
  );
}

// ─── Desktop hero: the existing 1920×1080 canvas ─────────────────────
function DesktopHero({ card, cards, status, headline }) {
  return (
    <Hero bg={HERO_BG}>
      {/* faint grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${NAVY}08 1px, transparent 1px), linear-gradient(90deg, ${NAVY}08 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          backgroundPosition: "40px 40px",
          maskImage: "radial-gradient(ellipse 100% 70% at 50% 30%, black 0%, transparent 80%)",
        }}
      />

      {/* LEFT: headline + CTA flow.
          left: 240 + width: 760 puts the content column ~240px from the
          canvas left edge, balancing roughly with the empty space on the
          right of the analysis stage so the composition reads as
          centred. */}
      <div style={{ position: "absolute", top: 160, left: 240, width: 760, zIndex: 10 }}>
        <Eyebrow>AI review · 4 seconds per video</Eyebrow>
        <h1
          style={{
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: "-0.035em",
            lineHeight: 0.96,
            margin: "32px 0 0",
            color: NAVY,
            textWrap: "balance",
          }}
        >
          {headline.a}
          <br />
          <span style={{ color: PERI, fontStyle: "italic", fontWeight: 700 }}>{headline.em}</span>
          {headline.b}
        </h1>

        <p
          style={{
            fontSize: 24,
            lineHeight: 1.45,
            color: NAVY,
            opacity: 0.7,
            margin: "32px 0 0",
            maxWidth: 680,
            fontWeight: 500,
          }}
        >
          Brieflee reviews UGC, influencer, and creator content against your brief —
          flagging hook, length, brand mention, and 23 more checks. In seconds, not afternoons.
        </p>

        {/* CTA flow (lead-magnet logic, HeroV1 visual styling) */}
        <CtaFlow />
      </div>

      {/* RIGHT: analysis stage */}
      {status === "pending" || cards.length === 0 ? (
        <AnalysisStagePlaceholder />
      ) : (
        <AnalysisStage key={card.id} card={card} cards={cards} />
      )}
    </Hero>
  );
}

// ─── Tablet + mobile hero: single vertical stacked layout (<lg) ─────
function MobileHero({ card, cards, status, headline }) {
  const ready = status !== "pending" && cards.length > 0;
  return (
    <div
      style={{
        background: HERO_BG,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
      className="relative w-full px-6 py-12"
    >
      <Keyframes />

      <div className="max-w-xl mx-auto space-y-5 md:space-y-6">
        <Eyebrow>AI review · 4 seconds per video</Eyebrow>

        <h1
          className="font-extrabold tracking-tight"
          style={{
            color: NAVY,
            fontSize: "clamp(40px, 9vw, 76px)",
            lineHeight: 0.96,
            letterSpacing: "-0.035em",
            margin: 0,
            textWrap: "balance",
          }}
        >
          {headline.a}
          <br />
          <span style={{ color: PERI, fontStyle: "italic", fontWeight: 700 }}>
            {headline.em}
          </span>
          {headline.b}
        </h1>

        <p
          style={{
            color: NAVY,
            opacity: 0.7,
            fontSize: "clamp(15px, 2.2vw, 18px)",
            lineHeight: 1.5,
            fontWeight: 500,
            margin: 0,
          }}
        >
          Brieflee reviews UGC, influencer, and creator content against your brief —
          flagging hook, length, brand mention, and 23 more checks. In seconds, not
          afternoons.
        </p>

        <CtaFlow />
      </div>

      {/* Video card below the form, centered. Grows on tablet (sm+) so
          it doesn't read as a phone-sized card on a 768px viewport. */}
      <div className="mt-10 mx-auto w-full max-w-[280px] sm:max-w-[360px]">
        {ready ? (
          <MobileFormatCard key={card.id} card={card} cards={cards} />
        ) : (
          <div
            style={{
              width: "100%",
              aspectRatio: "9 / 16",
              borderRadius: 36,
              background: `linear-gradient(155deg, ${PERI_LIGHT} 0%, #DCE3FF 100%)`,
              opacity: 0.6,
              border: "1px solid rgba(255,255,255,0.45)",
              boxShadow: "0 20px 40px -16px rgba(0,19,100,0.22)",
            }}
          />
        )}
      </div>
    </div>
  );
}

function MobileFormatCard({ card, cards = [] }) {
  const verdictColor =
    card.status === "PASS" ? GREEN : card.status === "FAIL" ? RED : AMBER;
  const verdictBg =
    card.status === "PASS" ? "#dcfce7" : card.status === "FAIL" ? "#fee2e2" : "#fef3c7";
  const verdictFg =
    card.status === "PASS" ? "#0f5132" : card.status === "FAIL" ? "#7f1d1d" : "#7c2d12";

  // Pick the next card in the cycle to render behind, peeking
  const activeIdx = cards.findIndex((c) => c.id === card.id);
  const peek = cards[(activeIdx + 1) % Math.max(cards.length, 1)];

  return (
    <div className="relative" style={{ width: "100%", aspectRatio: "9 / 16" }}>
      {/* Glow halo */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: -20,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${PERI}55 0%, transparent 65%)`,
          filter: "blur(40px)",
          zIndex: -1,
        }}
      />

      {/* Peek card behind. Translate is large enough to actually peek past
          the active card edges; no scale so the peek protrudes visibly. */}
      {peek && peek.id !== card.id && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            transform: "translate(22px, 28px) rotate(4deg)",
            opacity: 0.85,
            filter: "blur(0.5px)",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 36,
              clipPath: "inset(0 round 36px)",
              isolation: "isolate",
              background: peek.grad,
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 18px 36px -14px rgba(0,19,100,0.22)",
              border: "1px solid rgba(255,255,255,0.35)",
            }}
          >
            {peek.videoUrl && (
              <video
                src={`${peek.videoUrl}#t=0.3`}
                muted
                playsInline
                preload="metadata"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
              />
            )}
            <div
              style={{
                position: "absolute", inset: 0, opacity: 0.45,
                background: "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.45) 0%, transparent 55%), radial-gradient(circle at 75% 70%, rgba(0,0,0,0.18) 0%, transparent 50%)",
              }}
            />
            <div
              className="bl-glass-dark"
              style={{
                position: "absolute", top: 12, right: 12,
                padding: "5px 10px", borderRadius: 999,
                fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase",
              }}
            >
              {peek.format}
            </div>
          </div>
        </div>
      )}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 36,
          clipPath: "inset(0 round 36px)",
          isolation: "isolate",
          background: card.grad,
          position: "relative",
          overflow: "hidden",
          boxShadow:
            "0 30px 60px -16px rgba(0,19,100,0.30), 0 4px 0 rgba(0,19,100,0.08)",
          border: "1px solid rgba(255,255,255,0.35)",
          animation: "cardEnter 0.7s cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        {card.videoUrl && (
          <video
            src={`${card.videoUrl}#t=0.3`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
        {/* AI scanning shimmer */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0, bottom: 0, left: 0,
            width: "35%",
            background:
              "linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.20) 45%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.20) 55%, transparent 100%)",
            mixBlendMode: "screen",
            pointerEvents: "none",
            animation: "blShimmer 2.6s linear infinite",
          }}
        />
        {/* legibility gradient */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.55) 100%)",
          }}
        />
        {/* Analyzing pill */}
        <div
          className="bl-glass"
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            padding: "6px 10px 6px 8px",
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: NAVY,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: PERI,
              boxShadow: `0 0 0 3px ${PERI}55`,
              animation: "pulseDot 1.1s ease-in-out infinite",
            }}
          />
          Analyzing
        </div>
        {/* Format chip */}
        <div
          className="bl-glass-dark"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            padding: "6px 10px",
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {card.format}
        </div>
        {/* Bottom strip */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "20px 16px 14px",
            background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.55) 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            {card.logoUrl && (
              <img
                src={card.logoUrl}
                alt=""
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 5,
                  objectFit: "contain",
                  background: "rgba(255,255,255,0.92)",
                  padding: 2,
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
            <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
              @{slugify(card.brand)} · take_07.mp4
            </div>
          </div>
          <div
            style={{
              height: 3,
              borderRadius: 999,
              background: "rgba(255,255,255,0.22)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "#fff",
                borderRadius: 999,
                animation: "scrub 4.2s cubic-bezier(0.4,0,0.2,1) forwards",
              }}
            />
          </div>
        </div>
        {/* Verdict ribbon — Apple Liquid Glass, tinted by verdict colour */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            padding: "12px 20px",
            borderRadius: 18,
            background: `linear-gradient(135deg, ${verdictBg}F2 0%, ${verdictBg}CC 100%)`,
            WebkitBackdropFilter: "blur(24px) saturate(220%)",
            backdropFilter: "blur(24px) saturate(220%)",
            border: `1px solid ${verdictColor}55`,
            color: verdictFg,
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: "0.04em",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: `
              0 1px 0 0 rgba(255,255,255,0.8) inset,
              1px 0 0 0 rgba(255,255,255,0.5) inset,
              0 -1px 0 0 ${verdictColor}33 inset,
              0 18px 36px -12px ${verdictColor}66
            `,
            opacity: 0,
            animation: "verdictIn 0.9s 4.2s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          {card.status}
        </div>
      </div>

      {/* Two small floating chips outside the card — left middle + right
          bottom — so phones still get the "AI is checking these things"
          theatre. Positioned to avoid the in-card chip zones. */}
      {card.chips[0] && (
        <div
          aria-hidden={false}
          style={{
            position: "absolute",
            top: "30%",
            left: -14,
            zIndex: 30,
            transform: "translateY(-50%)",
            animation: "chipFloat 5s ease-in-out infinite",
          }}
        >
          <div
            className="bl-glass"
            style={{
              padding: "7px 11px 7px 9px",
              borderRadius: 13,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 22, height: 22, borderRadius: 6,
                background: card.chips[0].ok ? "#dcfce7" : "#fee2e2",
                color: card.chips[0].ok ? "#166534" : "#991b1b",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                {card.chips[0].ok ? <polyline points="20 6 9 17 4 12" /> : <path d="M18 6L6 18M6 6l12 12" />}
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 8, color: NAVY, opacity: 0.55, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {card.chips[0].l}
              </div>
              <div style={{ fontSize: 12, color: NAVY, fontWeight: 800, lineHeight: 1.2 }}>
                {card.chips[0].v}
              </div>
            </div>
          </div>
        </div>
      )}

      {card.chips[1] && (
        <div
          aria-hidden={false}
          style={{
            position: "absolute",
            top: "68%",
            right: -14,
            zIndex: 30,
            transform: "translateY(-50%)",
            animation: "chipFloat 5s ease-in-out 0.7s infinite alternate",
          }}
        >
          <div
            className="bl-glass"
            style={{
              padding: "7px 11px 7px 9px",
              borderRadius: 13,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 22, height: 22, borderRadius: 6,
                background: card.chips[1].ok ? "#dcfce7" : "#fee2e2",
                color: card.chips[1].ok ? "#166534" : "#991b1b",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                {card.chips[1].ok ? <polyline points="20 6 9 17 4 12" /> : <path d="M18 6L6 18M6 6l12 12" />}
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 8, color: NAVY, opacity: 0.55, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {card.chips[1].l}
              </div>
              <div style={{ fontSize: 12, color: NAVY, fontWeight: 800, lineHeight: 1.2 }}>
                {card.chips[1].v}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CTA flow: trojan horse · URL/file → fake loading → /signup ──────
// Pasted URL and uploaded file are both throwaway. After the fake
// loading animation, the user redirects to /signup. No data captured.
function CtaFlow() {
  const [tab, setTab] = useState("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [step, setStep] = useState("hero");
  const [error, setError] = useState("");

  const handleStart = () => {
    setError("");
    if (tab === "url" && !isValidShortFormUrl(url)) {
      setError("Paste a valid TikTok, Instagram Reel, YouTube Short, or Facebook Reel URL.");
      return;
    }
    if (tab === "file" && !file) {
      setError("Choose a video file to upload.");
      return;
    }
    setStep("loading");
    setTimeout(() => {
      window.location.href = SIGNUP_URL;
    }, 3500);
  };

  return (
    <div style={{ marginTop: 44, maxWidth: 720 }}>
      {step === "hero" && (
        <>
          {/* Tab toggle (HeroV1 styling) */}
          <div
            style={{
              display: "inline-flex",
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              border: `1px solid rgba(255,255,255,0.7)`,
              borderRadius: 999,
              padding: 6,
              boxShadow: "0 4px 16px -4px rgba(0,19,100,0.10)",
            }}
          >
            <button
              onClick={() => { setTab("url"); setError(""); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 20px", borderRadius: 999,
                background: tab === "url" ? PERI : "transparent",
                color: tab === "url" ? "#fff" : NAVY,
                opacity: tab === "url" ? 1 : 0.85,
                fontSize: 16, fontWeight: 700,
                border: "none", cursor: "pointer", fontFamily: "inherit",
                boxShadow: tab === "url" ? "0 2px 8px rgba(135,156,247,0.45)" : "none",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Paste URL
            </button>
            <button
              onClick={() => { setTab("file"); setError(""); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 20px", borderRadius: 999,
                background: tab === "file" ? PERI : "transparent",
                color: tab === "file" ? "#fff" : NAVY,
                opacity: tab === "file" ? 1 : 0.85,
                fontSize: 16, fontWeight: 700,
                border: "none", cursor: "pointer", fontFamily: "inherit",
                boxShadow: tab === "file" ? "0 2px 8px rgba(135,156,247,0.45)" : "none",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload file
            </button>
          </div>

          {/* URL field OR file dropzone */}
          {tab === "url" ? (
            <div
              style={{
                marginTop: 16,
                display: "flex", alignItems: "center",
                flexWrap: "wrap", gap: 10,
                background: "#fff",
                border: `1px solid ${BORDER}`,
                borderRadius: 18, padding: 10,
                boxShadow: "0 6px 24px -8px rgba(0,19,100,0.10)",
              }}
            >
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleStart(); }}
                placeholder="https://www.tiktok.com/@creator/video/…"
                style={{
                  flex: 1, minWidth: 200, padding: "0 18px",
                  fontSize: 18, fontWeight: 500, color: NAVY,
                  border: "none", outline: "none", background: "transparent",
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={handleStart}
                className="bl-cta-btn"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "16px 24px", borderRadius: 12,
                  background: PERI, color: "#fff",
                  fontSize: 18, fontWeight: 700, border: "none",
                  fontFamily: "inherit", cursor: "pointer",
                  boxShadow: "0 4px 14px -2px rgba(135,156,247,0.55)",
                }}
              >
                Break it down
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ) : (
            <label
              style={{
                marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
                height: 96, borderRadius: 18,
                border: `2px dashed ${PERI}66`,
                background: `${PERI}10`,
                cursor: "pointer",
                fontSize: 17, color: NAVY, fontWeight: 600,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={PERI} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {file ? <span style={{ fontWeight: 700 }}>{file.name}</span> : "Drop a video file or click to upload"}
              <input
                type="file" accept="video/*" style={{ display: "none" }}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          )}

          {error && (
            <div style={{ marginTop: 12, fontSize: 14, color: RED, fontWeight: 600 }} role="alert">
              {error}
            </div>
          )}

          {/* Value props row */}
          <div className="bl-value-props" style={{ marginTop: 18, display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 22px", fontSize: 15, color: NAVY, fontWeight: 600 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: PERI }} />
              Free, no credit card
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PERI} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Under 60 seconds
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PERI} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Frame by frame
            </div>
          </div>
        </>
      )}

      {step === "loading" && <LoadingCard />}
    </div>
  );
}

function LoadingCard() {
  return (
    <div
      style={{
        marginTop: 16, maxWidth: 520, padding: 28,
        background: "#fff",
        border: `1px solid ${BORDER}`,
        borderRadius: 22,
        boxShadow: "0 16px 36px -10px rgba(0,19,100,0.18)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Spinner color={PERI} />
        <span style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>Analysing your video</span>
      </div>
      {[
        "Detecting hook timing and opening frame",
        "Mapping scene transitions frame by frame",
        "Scoring engagement pacing and CTA placement",
      ].map((t, i) => (
        <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, fontSize: 15, color: NAVY, opacity: i === 2 ? 0.65 : 1 }}>
          {i < 2 ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PERI} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <Spinner color={NAVY} small />
          )}
          {t}
        </div>
      ))}
    </div>
  );
}

function Spinner({ color = NAVY, small }) {
  const size = small ? 14 : 18;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: "briefleeHeroSpin 0.9s linear infinite" }}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ─── Hero wrapper: 1920×1080, JS-scaled AND CENTERED in container ────
// The canvas is centered in both dimensions so when the container is
// wider OR taller than the canvas's 16:9 aspect, the leftover space
// distributes evenly on both sides instead of collecting on the right.
function Hero({ children, bg }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  useLayoutEffect(() => {
    const o = outerRef.current;
    const i = innerRef.current;
    if (!o || !i) return;
    const apply = () => {
      const w = o.clientWidth;
      const h = o.clientHeight;
      if (!w || !h) return;
      const scale = Math.min(w / 1920, h / 1080);
      const tx = (w - 1920 * scale) / 2;
      const ty = (h - 1080 * scale) / 2;
      i.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(o);
    return () => ro.disconnect();
  }, []);
  return (
    <div
      ref={outerRef}
      style={{
        width: "100%",
        // Container height = SHORTER of (16:9 of viewport width, viewport
        // height, 920px ceiling). On wide desktops the canvas fills the
        // viewport. On tablet portrait the container shrinks to the
        // canvas's natural 16:9 height — no giant empty space above and
        // below. On very tall 4K monitors the 920px ceiling stops the
        // hero from going oversized.
        height: "min(calc(100vw * 9 / 16), 100vh, 920px)",
        minHeight: 480,
        position: "relative",
        overflow: "hidden",
        background: bg,
      }}
    >
      <div
        ref={innerRef}
        style={{
          width: 1920,
          height: 1080,
          position: "absolute",
          top: 0,
          left: 0,
          transformOrigin: "top left",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          color: NAVY,
        }}
      >
        <Keyframes />
        {children}
      </div>
    </div>
  );
}

function Keyframes() {
  return (
    <style>{`
      @keyframes cardEnter {
        0%   { opacity: 0; transform: translateY(40px) scale(0.95) rotate(-2deg); }
        100% { opacity: 1; transform: translateY(0)    scale(1)    rotate(0deg); }
      }
      @keyframes chipIn {
        0%   { opacity: 0; transform: translateY(10px) scale(0.92); filter: blur(4px); }
        100% { opacity: 1; transform: translateY(0)    scale(1);    filter: blur(0); }
      }
      @keyframes chipFloat {
        0%, 100% { transform: translateY(0px); }
        50%      { transform: translateY(-6px); }
      }
      @keyframes verdictIn {
        0%   { opacity: 0; transform: translate(-50%, -50%) rotate(-14deg) scale(1.4); }
        55%  { opacity: 1; transform: translate(-50%, -50%) rotate(-10deg) scale(0.96); }
        100% { opacity: 1; transform: translate(-50%, -50%) rotate(-8deg)  scale(1); }
      }
      @keyframes scrub { 0% { width: 0%; } 100% { width: 100%; } }
      @keyframes pulseDot {
        0%, 100% { opacity: 1;   transform: scale(1); }
        50%      { opacity: 0.5; transform: scale(0.85); }
      }
      @keyframes briefleeHeroSpin {
        from { transform: rotate(0deg); } to { transform: rotate(360deg); }
      }
      /* Vertical light strip sweeping horizontally across the active video
         card — the "AI is scanning your video" theatre from the original
         heroes.jsx mockup. */
      @keyframes blShimmer {
        0%   { transform: translateX(-120%) skewX(-12deg); }
        100% { transform: translateX(220%)  skewX(-12deg); }
      }

      /* ─── Apple Liquid Glass (macOS Tahoe / iOS 26 style) ───────────
         Periwinkle/navy tinted. Two-rim inner highlight (white top-left,
         navy bottom-right) creates the perceived 3D curvature; soft outer
         shadow lifts the surface; high backdrop saturation keeps the
         underlying colour vivid through the glass. */
      .bl-glass {
        background: linear-gradient(135deg,
          rgba(255,255,255,0.62) 0%,
          rgba(244,246,255,0.42) 55%,
          rgba(236,240,255,0.34) 100%);
        -webkit-backdrop-filter: blur(28px) saturate(220%);
        backdrop-filter: blur(28px) saturate(220%);
        border: 1px solid rgba(255,255,255,0.55);
        box-shadow:
          /* inner top + left highlight rim */
          0 1px 0 0 rgba(255,255,255,1)    inset,
          1px 0 0 0 rgba(255,255,255,0.6)  inset,
          /* inner bottom + right shadow rim */
          0 -1px 0 0 rgba(0,19,100,0.10)   inset,
          -1px 0 0 0 rgba(0,19,100,0.05)   inset,
          /* outer soft + close drop shadows */
          0 18px 40px -12px rgba(0,19,100,0.22),
          0 4px 12px -4px rgba(0,19,100,0.10);
      }
      .bl-glass-dark {
        background: linear-gradient(135deg,
          rgba(0,19,100,0.72) 0%,
          rgba(0,19,100,0.55) 100%);
        -webkit-backdrop-filter: blur(28px) saturate(220%);
        backdrop-filter: blur(28px) saturate(220%);
        border: 1px solid rgba(255,255,255,0.22);
        color: #fff;
        box-shadow:
          0 1px 0 0 rgba(255,255,255,0.32) inset,
          1px 0 0 0 rgba(255,255,255,0.18) inset,
          0 -1px 0 0 rgba(0,0,0,0.14)      inset,
          0 16px 36px -12px rgba(0,19,100,0.45),
          0 4px 12px -4px rgba(0,19,100,0.18);
      }

      /* Mobile-only overrides (<sm, <640px) — shrink the CTA button,
         value-props row, and eyebrow pill so they don't dominate phone
         screens. */
      @media (max-width: 639px) {
        .bl-cta-btn {
          padding: 11px 16px !important;
          font-size: 14px !important;
          gap: 6px !important;
          border-radius: 10px !important;
        }
        .bl-cta-btn svg {
          width: 13px !important;
          height: 13px !important;
        }
        .bl-value-props {
          font-size: 13px !important;
          gap: 8px 16px !important;
          margin-top: 14px !important;
        }
        .bl-eyebrow {
          font-size: 11px !important;
          padding: 6px 12px !important;
          gap: 7px !important;
          letter-spacing: 0.05em !important;
        }
        .bl-eyebrow span {
          width: 6px !important;
          height: 6px !important;
        }
      }
      /* Tablet-only override (sm to lg, 640–1023px) — the URL input row
         is narrower than on desktop, so the default 16/24 padding +
         18px font on the CTA button reads as oversized. Step it down. */
      @media (min-width: 640px) and (max-width: 1023px) {
        .bl-cta-btn {
          padding: 13px 20px !important;
          font-size: 15px !important;
          gap: 8px !important;
          border-radius: 11px !important;
        }
        .bl-cta-btn svg {
          width: 14px !important;
          height: 14px !important;
        }
      }
    `}</style>
  );
}

// ─── Eyebrow pill ─────────────────────────────────────────────────────
function Eyebrow({ children }) {
  return (
    <div
      className="bl-eyebrow"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 18px",
        background: "rgba(135,156,247,0.16)",
        color: NAVY,
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        borderRadius: 999,
        width: "fit-content",
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: PERI, boxShadow: `0 0 0 3px ${PERI}33` }} />
      {children}
    </div>
  );
}

// ─── Analysis stage (the cycler) ─────────────────────────────────────
function AnalysisStage({ card, cards }) {
  const cardW = 440, cardH = 720;
  const verdictColor = card.status === "PASS" ? GREEN : card.status === "FAIL" ? RED : AMBER;
  const verdictBg = card.status === "PASS" ? "#dcfce7" : card.status === "FAIL" ? "#fee2e2" : "#fef3c7";
  const verdictFg = card.status === "PASS" ? "#0f5132" : card.status === "FAIL" ? "#7f1d1d" : "#7c2d12";
  const activeIdx = cards.findIndex((c) => c.id === card.id);

  return (
    <div style={{ position: "absolute", right: 0, top: 80, width: 1000, height: 1000, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
          width: 700, height: 700, borderRadius: "50%",
          background: `radial-gradient(circle, ${PERI}55 0%, transparent 65%)`,
          filter: "blur(40px)",
        }}
      />

      {[2, 1].map((offset) => {
        const peek = cards[(activeIdx + offset) % cards.length];
        const dz = offset;
        return (
          <div
            key={offset}
            style={{
              position: "absolute", left: "50%", top: "50%",
              marginLeft: -cardW / 2 + dz * 40,
              marginTop: -cardH / 2 + dz * 50,
              width: cardW, height: cardH,
              transform: `scale(${1 - dz * 0.07}) rotate(${dz * 3}deg)`,
              opacity: 1 - dz * 0.22,
              filter: `blur(${dz * 0.5}px)`,
              zIndex: -dz,
            }}
          >
            <div
              style={{
                width: "100%", height: "100%", borderRadius: 48,
                clipPath: "inset(0 round 48px)",
                isolation: "isolate",
                background: peek.grad,
                position: "relative", overflow: "hidden",
                boxShadow: "0 20px 40px -16px rgba(0,19,100,0.22)",
                border: "1px solid rgba(255,255,255,0.35)",
              }}
            >
              {peek.videoUrl && (
                <video
                  src={`${peek.videoUrl}#t=0.3`}
                  muted playsInline preload="metadata"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }}
                />
              )}
              <div
                style={{
                  position: "absolute", inset: 0, opacity: 0.45,
                  background: "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.45) 0%, transparent 55%), radial-gradient(circle at 75% 70%, rgba(0,0,0,0.18) 0%, transparent 50%)",
                }}
              />
              <div
                className="bl-glass-dark"
                style={{
                  position: "absolute", top: 18, right: 18,
                  padding: "8px 14px", borderRadius: 999,
                  fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase",
                }}
              >
                {peek.format}
              </div>
              <div
                className="bl-glass"
                style={{
                  position: "absolute", bottom: 18, left: 18,
                  padding: "6px 12px", borderRadius: 999,
                  fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: NAVY, opacity: 0.8,
                }}
              >
                Queued
              </div>
            </div>
          </div>
        );
      })}

      <div
        style={{
          position: "absolute", left: "50%", top: "50%",
          marginLeft: -cardW / 2, marginTop: -cardH / 2,
          width: cardW, height: cardH,
          animation: "cardEnter 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        }}
      >
        <div
          style={{
            width: "100%", height: "100%", borderRadius: 48,
            clipPath: "inset(0 round 48px)",
            isolation: "isolate",
            background: card.grad,
            position: "relative", overflow: "hidden",
            boxShadow: "0 30px 60px -16px rgba(0,19,100,0.30), 0 4px 0 rgba(0,19,100,0.08)",
            border: "1px solid rgba(255,255,255,0.35)",
          }}
        >
          {card.videoUrl && (
            <video
              src={`${card.videoUrl}#t=0.3`}
              autoPlay muted loop playsInline preload="auto"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}

          {/* AI scanning shimmer — vertical light strip sweeping across */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0, bottom: 0, left: 0,
              width: "35%",
              background:
                "linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.20) 45%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.20) 55%, transparent 100%)",
              mixBlendMode: "screen",
              pointerEvents: "none",
              animation: "blShimmer 2.6s linear infinite",
            }}
          />

          <div
            style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.55) 100%)",
            }}
          />

          <div
            className="bl-glass"
            style={{
              position: "absolute", top: 18, left: 18,
              padding: "8px 12px 8px 10px", borderRadius: 999,
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: NAVY,
            }}
          >
            <span
              style={{
                width: 8, height: 8, borderRadius: "50%", background: PERI,
                boxShadow: `0 0 0 3px ${PERI}55`,
                animation: "pulseDot 1.1s ease-in-out infinite",
              }}
            />
            Analyzing
          </div>

          <div
            className="bl-glass-dark"
            style={{
              position: "absolute", top: 18, right: 18,
              padding: "8px 14px", borderRadius: 999,
              fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase",
            }}
          >
            {card.format}
          </div>

          <div
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              padding: "26px 22px 22px",
              background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.55) 100%)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              {card.logoUrl && (
                <img
                  src={card.logoUrl} alt=""
                  style={{ width: 24, height: 24, borderRadius: 6, objectFit: "contain", background: "rgba(255,255,255,0.92)", padding: 2 }}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              )}
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                @{slugify(card.brand)} · take_07.mp4
              </div>
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600, marginBottom: 12 }}>
              Reviewing against Q3 brief · 26-point checklist
            </div>
            <div style={{ height: 4, borderRadius: 999, background: "rgba(255,255,255,0.22)", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%", background: "#fff", borderRadius: 999,
                  animation: "scrub 4.2s cubic-bezier(0.4, 0, 0.2, 1) forwards",
                }}
              />
            </div>
          </div>

          {/* Verdict ribbon — Apple Liquid Glass, tinted by verdict colour */}
          <div
            style={{
              position: "absolute", left: "50%", top: "50%",
              padding: "18px 30px",
              borderRadius: 24,
              background: `linear-gradient(135deg, ${verdictBg}F2 0%, ${verdictBg}CC 100%)`,
              WebkitBackdropFilter: "blur(28px) saturate(220%)",
              backdropFilter: "blur(28px) saturate(220%)",
              border: `1px solid ${verdictColor}55`,
              color: verdictFg,
              fontSize: 36, fontWeight: 900, letterSpacing: "0.04em",
              display: "flex", alignItems: "center", gap: 14,
              boxShadow: `
                0 1px 0 0 rgba(255,255,255,0.85) inset,
                1px 0 0 0 rgba(255,255,255,0.55) inset,
                0 -1px 0 0 ${verdictColor}33 inset,
                0 24px 48px -12px ${verdictColor}66,
                0 4px 12px -4px rgba(0,19,100,0.18)
              `,
              opacity: 0,
              animation: "verdictIn 0.9s 4.2s cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            {card.status === "PASS" && (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {card.status === "FAIL" && (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            )}
            {card.status === "REVISE" && (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                <path d="M8 16H3v5" />
              </svg>
            )}
            {card.status}
          </div>

          <div
            style={{
              position: "absolute", left: "50%", top: "calc(50% + 78px)",
              transform: "translateX(-50%)",
              fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: "0.06em", textTransform: "uppercase",
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
              opacity: 0,
              animation: "chipIn 0.5s 4.7s both ease",
            }}
          >
            Score {card.score} / 100
          </div>
        </div>
      </div>

      {card.chips.map((c, i) => {
        const enterDelay = 0.8 + i * 0.45;
        const floatDelay = enterDelay + 0.6;
        const floatDur = 4 + i * 0.6;
        const cx = 500 + c.pos.x;
        const cy = 500 + c.pos.y;
        const okBg = c.ok ? "#dcfce7" : "#fee2e2";
        const okFg = c.ok ? "#166534" : "#991b1b";
        const okIcon = c.ok ? <polyline points="20 6 9 17 4 12" /> : <path d="M18 6L6 18M6 6l12 12" />;
        return (
          // Outer wrapper centers the chip on (cx, cy) so left/right chips
          // are visually symmetric around the card edges.
          <div
            key={i}
            style={{
              position: "absolute", left: cx, top: cy,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              style={{
                animation: `chipIn 0.6s ${enterDelay}s both cubic-bezier(0.22, 1, 0.36, 1), chipFloat ${floatDur}s ${floatDelay}s ease-in-out infinite`,
              }}
            >
            <div
              className="bl-glass"
              style={{
                padding: "12px 16px 12px 12px",
                borderRadius: 16,
                display: "flex", alignItems: "center", gap: 12,
              }}
            >
              <div
                style={{
                  width: 30, height: 30, borderRadius: 9,
                  background: okBg, color: okFg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  {okIcon}
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 10, color: NAVY, opacity: 0.55, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>{c.l}</div>
                <div style={{ fontSize: 17, color: NAVY, fontWeight: 800, letterSpacing: "-0.005em" }}>{c.v}</div>
              </div>
            </div>
            </div>
          </div>
        );
      })}

      <div
        style={{
          position: "absolute", left: 500, top: 500 + 320, transform: "translateX(-50%)",
          animation: "chipIn 0.6s 4.5s both ease",
        }}
      >
        <div
          className="bl-glass"
          style={{
            padding: "12px 20px", borderRadius: 999,
            display: "flex", alignItems: "center", gap: 10,
            fontSize: 14, color: NAVY, fontWeight: 700,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: verdictColor }} />
          {card.summary}
        </div>
      </div>
    </div>
  );
}

function AnalysisStagePlaceholder() {
  return (
    <div style={{ position: "absolute", right: 0, top: 80, width: 1000, height: 1000, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute", left: "50%", top: "50%",
          marginLeft: -180, marginTop: -300,
          width: 360, height: 600,
          borderRadius: 28,
          background: `linear-gradient(155deg, ${PERI_LIGHT} 0%, #DCE3FF 100%)`,
          opacity: 0.5,
          border: "1px solid rgba(255,255,255,0.45)",
          boxShadow: "0 20px 40px -16px rgba(0,19,100,0.22)",
        }}
      />
    </div>
  );
}

function slugify(s) {
  return String(s || "creator")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}
