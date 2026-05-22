// =====================================================================
// Vibe Coding block: Homepage · Audiences (9) · Built for how you work
// =====================================================================
// Three audience cards (D2C / Apps / Agencies) — Frame.io-style
// "industries" pattern, inline on the homepage. Mirrors the design
// system of solution.jsx / plan.jsx / revisions.jsx: HERO_BG section,
// Plus Jakarta Sans, eyebrow + h2 header, liquid-glass shimmer cards.
//
// Copy from `Brieflee Homepage Copy.md § 9`. "ship" swapped to
// "publish" per the no-ship voice rule.
//
// Icon picks (engravings — appropriate for tile-sized accents per the
// asset-hierarchy rule):
//   - D2C       → luxury-handbag-in-open-gift-box (shopping/D2C luxe)
//   - Apps      → iphone-on-mini-tripod-filming-setup
//   - Agencies  → team-high-five-group-celebration-four-people
//
// SOFTR UI SETUP:
//   1. Source tab → none required.
//   2. Visibility tab → public.
// =====================================================================

const NAVY = "#001364";
const PERI = "#879CF7";

const HERO_BG =
  "radial-gradient(ellipse 65% 50% at 50% 50%, rgba(135,156,247,0.28) 0%, rgba(180,192,245,0.14) 40%, rgba(180,192,245,0) 75%), #FAFBFF";

const CLD = "https://res.cloudinary.com/dchroynzv/image/upload";

// ----- Audience cards ------------------------------------------------
const AUDIENCES = [
  {
    label: "For D2C brands",
    body: "Run 50 creator submissions a week without burning out your creative lead. Brand standards set once and enforced on every video.",
    cta: "For D2C",
    href: "/e-commerce",
    icon: `${CLD}/brieflee_engraving_luxury-handbag-in-open-gift-box-tissue-paper-grey_2026-03.png`,
    iconAlt: "Luxury handbag in an open gift box — D2C brand engraving",
  },
  {
    label: "For App marketers",
    body: "Localised UGC, multiple ad accounts, hundreds of creators. Brieflee scales to whatever you publish.",
    cta: "For Apps",
    href: "/mobile-apps",
    icon: `${CLD}/brieflee_engraving_iphone-on-mini-tripod-filming-setup-grey-3d_2026-03.png`,
    iconAlt: "iPhone on a mini tripod ready to film — app marketing engraving",
  },
  {
    label: "For creator agencies",
    body: "Run 10 clients without 10 separate workspaces. One workspace per client, every brief and every review in one place.",
    cta: "For Agencies",
    href: "/marketing-agencies",
    icon: `${CLD}/brieflee_engraving_team-high-five-group-celebration-four-people_2026-03.png`,
    iconAlt: "Four people high-fiving in a team celebration — agency engraving",
  },
];

// =====================================================================
// Block
// =====================================================================
export default function Block() {
  return (
    <section
      className="relative w-full py-16 md:py-24 lg:py-28 px-5 md:px-10"
      style={{
        background: HERO_BG,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <Keyframes />

      {/* Section header */}
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
        <Eyebrow>Use cases</Eyebrow>
        <h2
          className="mt-6 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] text-balance"
          style={{ color: NAVY }}
        >
          Built for how you work.
        </h2>
        <p
          className="mt-5 text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-medium"
          style={{ color: NAVY, opacity: 0.7 }}
        >
          Whether you're a D2C brand, an app marketer, or a creator agency —
          Brieflee fits the shape of your workflow.
        </p>
      </div>

      {/* 3 cards · 3 columns on lg, 2 cols on md, stacked on mobile */}
      <div className="max-w-6xl mx-auto mt-12 md:mt-16 audience-grid">
        {AUDIENCES.map((a) => (
          <AudienceCard key={a.label} card={a} />
        ))}
      </div>
    </section>
  );
}

// ─── Audience card · liquid glass + shimmer (matches solution.jsx) ──
function AudienceCard({ card }) {
  return (
    <a
      href={card.href}
      className="audience-card shimmer-card"
      aria-label={`${card.label} — learn more`}
    >
      <img
        src={card.icon}
        alt={card.iconAlt}
        draggable={false}
        className="audience-icon"
      />
      <h3 className="audience-title" style={{ color: NAVY }}>
        {card.label}
      </h3>
      <p className="audience-body" style={{ color: NAVY }}>
        {card.body}
      </p>
      <span className="audience-cta" style={{ color: NAVY }}>
        {card.cta}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </span>
    </a>
  );
}

// ─── Eyebrow · copied verbatim from hero / solution ──────────────────
function Eyebrow({ children }) {
  return (
    <div
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
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: PERI,
          boxShadow: `0 0 0 3px ${PERI}33`,
        }}
      />
      {children}
    </div>
  );
}

// ─── Keyframes + shared CSS ──────────────────────────────────────────
function Keyframes() {
  return (
    <style>{`
      /* ─── Grid · 3-col on lg, 2-col on md, stacked on mobile ──── */
      .audience-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
      }
      @media (min-width: 640px) {
        .audience-grid { grid-template-columns: 1fr 1fr; gap: 18px; }
      }
      @media (min-width: 1024px) {
        .audience-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; }
      }

      /* ─── Shimmer outline (mirrors solution / plan cards) ────── */
      @property --shimmer-angle {
        syntax: '<angle>';
        initial-value: 0deg;
        inherits: false;
      }
      @keyframes shimmer-rotate { to { --shimmer-angle: 360deg; } }
      .shimmer-card {
        position: relative;
        background: transparent;
      }
      .shimmer-card::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 2px;
        background: conic-gradient(
          from var(--shimmer-angle, 0deg),
          rgba(135,156,247,0.18) 0deg,
          rgba(135,156,247,0.18) 200deg,
          rgba(135,156,247,0.85) 250deg,
          #ffffff 280deg,
          rgba(135,156,247,0.85) 310deg,
          rgba(135,156,247,0.18) 360deg
        );
        -webkit-mask:
          linear-gradient(#000 0 0) content-box,
          linear-gradient(#000 0 0);
        -webkit-mask-composite: xor;
                mask-composite: exclude;
        pointer-events: none;
        animation: shimmer-rotate 3.5s linear infinite;
      }
      /* Stagger card shimmers so they don't sweep together */
      .audience-card:nth-child(2)::before { animation-delay: -1.1s; }
      .audience-card:nth-child(3)::before { animation-delay: -2.2s; }

      /* ─── Card · Apple Liquid Glass (matches solution.jsx) ──── */
      .audience-card {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 28px 26px 24px;
        border-radius: 24px;
        text-decoration: none;
        background: linear-gradient(135deg,
          rgba(255,255,255,0.55) 0%,
          rgba(244,246,255,0.38) 55%,
          rgba(236,240,255,0.28) 100%);
        -webkit-backdrop-filter: blur(24px) saturate(200%);
        backdrop-filter: blur(24px) saturate(200%);
        box-shadow:
          0 1px 0 0 rgba(255,255,255,0.95)  inset,
          1px 0 0 0 rgba(255,255,255,0.55)  inset,
          0 -1px 0 0 rgba(0,19,100,0.08)    inset,
          -1px 0 0 0 rgba(0,19,100,0.04)    inset,
          0 14px 36px -12px rgba(0,19,100,0.18),
          0 4px 12px -4px rgba(0,19,100,0.08);
        transition: transform 0.25s ease, box-shadow 0.25s ease;
      }
      .audience-card:hover {
        transform: translateY(-3px);
        box-shadow:
          0 1px 0 0 rgba(255,255,255,0.95)  inset,
          1px 0 0 0 rgba(255,255,255,0.55)  inset,
          0 -1px 0 0 rgba(0,19,100,0.08)    inset,
          -1px 0 0 0 rgba(0,19,100,0.04)    inset,
          0 22px 44px -14px rgba(0,19,100,0.24),
          0 6px 14px -4px rgba(0,19,100,0.10);
      }
      .audience-card:hover .audience-cta svg { transform: translateX(4px); }

      /* ─── Card content ──────────────────────────────────────── */
      .audience-icon {
        width: 64px;
        height: 64px;
        object-fit: contain;
        display: block;
        margin-bottom: 4px;
        filter: drop-shadow(0 6px 14px rgba(0,19,100,0.10));
      }
      .audience-title {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        letter-spacing: -0.01em;
        line-height: 1.2;
      }
      .audience-body {
        margin: 0;
        font-size: 14.5px;
        font-weight: 500;
        opacity: 0.72;
        line-height: 1.55;
      }
      .audience-cta {
        margin-top: auto;
        padding-top: 8px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: -0.005em;
      }
      .audience-cta svg {
        transition: transform 0.25s ease;
      }

      /* Tablet (sm-lg) — slight type tighten */
      @media (min-width: 640px) and (max-width: 1023px) {
        .audience-title { font-size: 19px; }
        .audience-body  { font-size: 14px; }
      }

      /* Mobile — tighter padding */
      @media (max-width: 639px) {
        .audience-card { padding: 24px 22px 22px; gap: 12px; }
        .audience-icon { width: 56px; height: 56px; }
        .audience-title { font-size: 18px; }
        .audience-body  { font-size: 14px; }
      }
    `}</style>
  );
}
