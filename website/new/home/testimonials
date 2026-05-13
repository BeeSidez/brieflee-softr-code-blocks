// =====================================================================
// Vibe Coding block: Homepage · Testimonials (Wall of Love)
// =====================================================================
// Two-row marquee of customer quotes pulled from the Testimonials table.
// Top row scrolls left, bottom scrolls right, both pause on hover.
//
// Card styling matches the rest of the new homepage (solution / plan /
// revisions): liquid-glass fill, shimmer outline, NAVY text, PERI stars.
// Section background = HERO_BG (cloud-in-the-middle), font = Plus Jakarta.
//
// SOFTR UI SETUP:
//   1. Source tab → Testimonials table.
//   2. Visibility tab → public.
// =====================================================================

import { useRecords, q } from "@/lib/datasource";

const NAVY = "#001364";
const PERI = "#879CF7";
const STAR = "#FFC83D"; // warm gold — only used on the rating

const HERO_BG =
  "radial-gradient(ellipse 65% 50% at 50% 50%, rgba(135,156,247,0.28) 0%, rgba(180,192,245,0.14) 40%, rgba(180,192,245,0) 75%), #FAFBFF";

// Field aliases — must match the Source tab field IDs.
const select = q.select({
  name: "Epb5M",
  title: "aXyVM",
  review: "9YIaR",
  avatar: "bcHbT",
  rating: "saxUQ",
});

// =====================================================================
// Block
// =====================================================================
export default function Block() {
  const { data, status } = useRecords({ select, count: 100 });

  return (
    <section
      className="relative w-full py-16 md:py-24 lg:py-28 overflow-hidden"
      style={{
        background: HERO_BG,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <Keyframes />

      {/* Section header */}
      <div className="max-w-3xl mx-auto px-5 md:px-10 flex flex-col items-center text-center">
        <Eyebrow>Wall of love</Eyebrow>
        <h2
          className="mt-6 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] text-balance"
          style={{ color: NAVY }}
        >
          Loved by teams that check every video.
        </h2>
        <p
          className="mt-5 text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-medium"
          style={{ color: NAVY, opacity: 0.7 }}
        >
          What growth teams, agencies, and creator marketers say after letting
          Brieflee review their content.
        </p>
      </div>

      {status === "pending" && (
        <div
          className="mt-12 text-center text-sm font-medium"
          style={{ color: NAVY, opacity: 0.55 }}
        >
          Loading testimonials…
        </div>
      )}

      {status === "error" && (
        <div
          className="mt-12 text-center text-sm font-medium"
          style={{ color: NAVY, opacity: 0.55 }}
        >
          Couldn't load testimonials right now.
        </div>
      )}

      {status === "success" && (
        <div className="max-w-6xl mx-auto mt-12 md:mt-16">
          <Marquee data={data} />
        </div>
      )}
    </section>
  );
}

// ─── Marquee · three opposing rows (L · R · L) ────────────────────────
function Marquee({ data }) {
  const items = data?.pages?.flatMap((p) => p?.items ?? []) ?? [];
  if (items.length === 0) return null;

  // Split items into three roughly-equal slices so each row shows a
  // different sequence. If a slice is empty (very few testimonials),
  // fall back to the first slice so the row still scrolls.
  const n = items.length;
  const a = Math.ceil(n / 3);
  const b = Math.ceil((n - a) / 2);
  const sliceA = items.slice(0, a);
  const sliceB = items.slice(a, a + b);
  const sliceC = items.slice(a + b);
  const rowA = sliceA;
  const rowB = sliceB.length ? sliceB : sliceA;
  const rowC = sliceC.length ? sliceC : sliceA;

  // Duplicate each row so the CSS keyframe loops seamlessly.
  const rowAItems = [...rowA, ...rowA];
  const rowBItems = [...rowB, ...rowB];
  const rowCItems = [...rowC, ...rowC];

  return (
    <div className="testi-rows">
      <div className="testi-row">
        <div className="testi-track testi-track-left">
          {rowAItems.map((item, i) => (
            <TestimonialCard key={`a-${i}`} item={item} />
          ))}
        </div>
      </div>
      <div className="testi-row">
        <div className="testi-track testi-track-right">
          {rowBItems.map((item, i) => (
            <TestimonialCard key={`b-${i}`} item={item} />
          ))}
        </div>
      </div>
      <div className="testi-row">
        <div className="testi-track testi-track-left">
          {rowCItems.map((item, i) => (
            <TestimonialCard key={`c-${i}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Single card · liquid glass + shimmer (matches solution.jsx) ────
function TestimonialCard({ item }) {
  const f = item?.fields ?? {};
  const name = f.name || "Anonymous";
  const title = f.title || "";
  const review = f.review || "";
  const rating = typeof f.rating === "number" ? f.rating : 0;

  // Avatar may come back as an attachment array OR a plain URL string.
  const avatarUrl = Array.isArray(f.avatar)
    ? f.avatar[0]?.url
    : f.avatar;

  return (
    <div className="testi-card shimmer-card">
      <Stars value={rating} />
      <p className="testi-quote" style={{ color: NAVY }}>
        {review}
      </p>
      <div className="testi-author">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="testi-avatar"
            draggable={false}
          />
        ) : (
          <div className="testi-avatar-fallback" aria-hidden="true">
            {String(name).charAt(0).toUpperCase()}
          </div>
        )}
        <div className="testi-author-text">
          <div className="testi-name" style={{ color: NAVY }}>
            {name}
          </div>
          {title && (
            <div className="testi-title" style={{ color: NAVY, opacity: 0.6 }}>
              {title}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Stars · inline SVG, peri fill ───────────────────────────────────
function Stars({ value }) {
  return (
    <div className="testi-stars" aria-label={`Rated ${value} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            fill={i < value ? STAR : "rgba(0,19,100,0.12)"}
          />
        </svg>
      ))}
    </div>
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
      /* ─── Shimmer outline (matches solution / plan cards) ────── */
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

      /* ─── Marquee rows · 3 stacked, alternating direction ───── */
      .testi-rows {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .testi-row {
        position: relative;
        overflow: hidden;
        /* Tighter fade now that the row is contained to ~1140 — keeps
           more cards readable while still softening the edges. */
        -webkit-mask-image: linear-gradient(
          to right,
          transparent 0,
          #000 4%,
          #000 96%,
          transparent 100%
        );
                mask-image: linear-gradient(
          to right,
          transparent 0,
          #000 4%,
          #000 96%,
          transparent 100%
        );
      }
      .testi-track {
        display: flex;
        gap: 18px;
        width: max-content;
        will-change: transform;
        padding: 8px 10px; /* breathing room so shimmer doesn't clip */
      }
      /* Slightly different durations so the 3 rows don't sync up
         mechanically — eyes catch the variety without it feeling busy. */
      .testi-track-left  { animation: marquee-left  55s linear infinite; }
      .testi-track-right { animation: marquee-right 65s linear infinite; }
      .testi-row:nth-child(3) .testi-track-left { animation-duration: 60s; }
      .testi-row:hover .testi-track { animation-play-state: paused; }
      @keyframes marquee-left  { from { transform: translateX(0);    } to { transform: translateX(-50%); } }
      @keyframes marquee-right { from { transform: translateX(-50%); } to { transform: translateX(0);    } }
      @media (prefers-reduced-motion: reduce) {
        .testi-track-left, .testi-track-right { animation: none; }
      }

      /* ─── Card · Apple Liquid Glass (mirrors solution.jsx) ──── */
      .testi-card {
        flex-shrink: 0;
        width: 340px;
        min-height: 220px;
        border-radius: 24px;
        padding: 22px 22px 20px;
        display: flex;
        flex-direction: column;
        gap: 14px;
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
      }
      @media (max-width: 640px) {
        .testi-card { width: 300px; padding: 20px; }
      }

      /* ─── Card content ──────────────────────────────────────── */
      .testi-stars { display: flex; gap: 4px; }
      .testi-quote {
        margin: 0;
        font-size: 15px;
        font-weight: 500;
        line-height: 1.55;
        letter-spacing: -0.005em;
        display: -webkit-box;
        -webkit-line-clamp: 7;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .testi-author {
        margin-top: auto;
        display: flex;
        align-items: center;
        gap: 12px;
        padding-top: 6px;
      }
      .testi-avatar {
        width: 40px;
        height: 40px;
        border-radius: 999px;
        object-fit: cover;
        flex-shrink: 0;
        border: 1px solid rgba(135,156,247,0.25);
      }
      .testi-avatar-fallback {
        width: 40px;
        height: 40px;
        border-radius: 999px;
        background: rgba(135,156,247,0.18);
        color: ${NAVY};
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        font-weight: 700;
        flex-shrink: 0;
      }
      .testi-author-text { min-width: 0; }
      .testi-name {
        font-size: 14px;
        font-weight: 700;
        letter-spacing: -0.005em;
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .testi-title {
        font-size: 12.5px;
        font-weight: 500;
        line-height: 1.35;
        margin-top: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `}</style>
  );
}
