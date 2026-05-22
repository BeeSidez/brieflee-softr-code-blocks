// =====================================================================
// Vibe Coding block: Homepage · Final CTA (12)
// =====================================================================
// Last block on the homepage, above the footer. Big centered headline +
// two-button CTA. Intentionally no card chrome — the visual quiet vs
// the feature-card sections above signals "this is the decision moment."
//
// Headline picked from Bev's pre-approved set (relief-promise variant —
// the others are capability claims; relief is stronger for closing).
//
// SOFTR UI SETUP:
//   1. Source tab → none required.
//   2. Visibility tab → public.
// =====================================================================

const NAVY = "#001364";
const PERI = "#879CF7";

const HERO_BG =
  "radial-gradient(ellipse 65% 50% at 50% 50%, rgba(135,156,247,0.28) 0%, rgba(180,192,245,0.14) 40%, rgba(180,192,245,0) 75%), #FAFBFF";

// Canonical homepage URLs — /sign-up (hyphen) is the homepage signup;
// /signup (no hyphen) is a separate lead-magnet page, don't use it here.
const SIGNUP_URL = "/sign-up";
const DEMO_URL = "/book-a-demo";

// =====================================================================
// Block
// =====================================================================
export default function Block() {
  return (
    <section
      className="relative w-full py-20 md:py-28 lg:py-36 px-5 md:px-10 overflow-hidden"
      style={{
        background: HERO_BG,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <Keyframes />

      {/* Soft peri halo behind the headline — extra weight at the closing
          moment without going full card-chrome. */}
      <div className="cta-halo" aria-hidden="true" />

      <div className="relative max-w-3xl mx-auto flex flex-col items-center text-center">
        <Eyebrow>Get started</Eyebrow>

        <h2
          className="mt-6 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] text-balance"
          style={{ color: NAVY }}
        >
          We watch the videos, so you don't have to.
        </h2>

        <p
          className="mt-5 text-base md:text-lg leading-relaxed max-w-xl mx-auto font-medium"
          style={{ color: NAVY, opacity: 0.7 }}
        >
          Drop in a video. See it reviewed in seconds.
        </p>

        <div className="mt-9 md:mt-10 flex flex-wrap items-center justify-center gap-3 md:gap-4">
          <a href={SIGNUP_URL} className="cta-primary">
            Start free trial
            <Arrow />
          </a>
          <a href={DEMO_URL} className="cta-secondary">
            Book a demo
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Arrow icon ───────────────────────────────────────────────────────
function Arrow() {
  return (
    <svg
      width="18"
      height="18"
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

// ─── Halo + button CSS ───────────────────────────────────────────────
function Keyframes() {
  return (
    <style>{`
      /* Soft peri glow centered behind the headline — adds visual weight
         to the closing moment without competing with feature cards above. */
      .cta-halo {
        position: absolute;
        left: 50%;
        top: 50%;
        width: min(90vw, 720px);
        height: min(70vw, 460px);
        transform: translate(-50%, -50%);
        background: radial-gradient(
          ellipse at center,
          rgba(135,156,247,0.30) 0%,
          rgba(135,156,247,0.12) 35%,
          rgba(135,156,247,0) 70%
        );
        pointer-events: none;
        filter: blur(8px);
      }

      /* ─── Primary CTA (navy fill) ────────────────────────────── */
      .cta-primary {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 16px 28px;
        background: ${NAVY};
        color: #ffffff;
        font-size: 16px;
        font-weight: 700;
        letter-spacing: -0.005em;
        border-radius: 12px;
        text-decoration: none;
        transition: transform 0.25s ease, box-shadow 0.25s ease;
        box-shadow:
          0 12px 28px -10px rgba(0,19,100,0.35),
          0 4px 10px -3px rgba(0,19,100,0.18),
          0 0 0 1px rgba(255,255,255,0.12) inset;
      }
      .cta-primary:hover {
        transform: translateY(-2px);
        box-shadow:
          0 18px 36px -12px rgba(0,19,100,0.45),
          0 6px 14px -4px rgba(0,19,100,0.22),
          0 0 0 1px rgba(255,255,255,0.18) inset;
      }
      .cta-primary svg { transition: transform 0.25s ease; }
      .cta-primary:hover svg { transform: translateX(3px); }

      /* ─── Secondary CTA (glass) ──────────────────────────────── */
      .cta-secondary {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 16px 26px;
        background: rgba(255,255,255,0.6);
        color: ${NAVY};
        font-size: 16px;
        font-weight: 700;
        letter-spacing: -0.005em;
        border-radius: 12px;
        text-decoration: none;
        -webkit-backdrop-filter: blur(12px) saturate(180%);
        backdrop-filter: blur(12px) saturate(180%);
        transition: transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
        box-shadow:
          0 0 0 1px rgba(0,19,100,0.14) inset,
          0 4px 12px -4px rgba(0,19,100,0.10);
      }
      .cta-secondary:hover {
        transform: translateY(-2px);
        background: rgba(255,255,255,0.88);
        box-shadow:
          0 0 0 1px rgba(0,19,100,0.22) inset,
          0 8px 16px -6px rgba(0,19,100,0.15);
      }

      /* Stack buttons full-width on tiny screens */
      @media (max-width: 480px) {
        .cta-primary, .cta-secondary {
          width: 100%;
          justify-content: center;
        }
      }
    `}</style>
  );
}
