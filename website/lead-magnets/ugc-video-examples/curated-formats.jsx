// =====================================================================
// Vibe Coding block: Curated formats row (Block 1 of /ugc-video-examples)
// =====================================================================
// Horizontal-scrolling row of format archetype cards, Motion-style.
// Light gray panel per card with a 3-clip fanned stack on top of real
// VFL thumbnails. Format name underneath. That's it.
//
// Thumbnails come from `Sample Clip URLs` on each Format record (LONG_TEXT,
// 3 Video URLs newline-separated). Pre-baked by
//   Brieflee/formats-table/populate_sample_clips.py
// so we can render real thumbnails in one query instead of N+1.
//
// Click card → Softr Item-Details SEO page at
//   /ugc-formats/{slug}/r/{recordId}
//
// SOFTR UI SETUP (one-time):
//   1. Source tab → Database: brieflee leads → Table: Formats
//   2. Actions tab → nothing (read-only)
//   3. Visibility tab → public
// =====================================================================

import { useEffect, useRef, useState } from "react";
import { useRecords, q } from "@/lib/datasource";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

// Email-gate flag set by the gate.jsx block at the top of the page.
const UNLOCK_KEY = "brieflee_ugc_unlocked";

const createFields = q.select({
  name:            "DTyOH",  // SINGLE_LINE_TEXT (primary)
  slug:            "ncAxJ",  // SEO:Slug
  sampleClipUrls:  "devrZ",  // LONG_TEXT, 3 Video URLs newline-separated
  videoFormats:    "HyVmY",  // LINKED_RECORD count, used for sort ordering
});

const PAGE_SLUG = "ugc-formats";
const NAVY = "#001364";
const PERIWINKLE = "#879CF7";
const BRIEFLEE_EYES = "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_sticker-blue-cartoon-eyes-looking-side-navy_2026-03.png";

// 3-clip stack on a light gray panel. Real thumbnails from VFL Video URLs.
function FormatCard({ rec }) {
  const f = rec?.fields || {};
  const name = f.name || "";
  const slug = f.slug || "";

  const urls = (f.sampleClipUrls || "")
    .split("\n")
    .map((u) => u.trim())
    .filter(Boolean)
    .slice(0, 3);

  const href = slug
    ? `/${PAGE_SLUG}/${slug}/r/${rec.id}`
    : `/${PAGE_SLUG}/r/${rec.id}`;

  // Stack layout — middle on top, left rotated -8°, right rotated +8°.
  const layout = [
    { rotate: -8, x: "-22%", y: "4%",  z: 1 },
    { rotate:  0, x: "0",    y: "0",   z: 3 },
    { rotate:  8, x: "22%",  y: "4%",  z: 2 },
  ];

  return (
    <a
      href={href}
      className="group shrink-0 w-[180px] md:w-[200px] snap-start outline-none rounded-2xl"
    >
      {/* Gray panel */}
      <div className="aspect-square rounded-2xl bg-muted/60 relative overflow-hidden transition-colors group-hover:bg-muted">
        {/* 3-clip fanned stack */}
        <div className="absolute inset-0 flex items-center justify-center">
          {urls.length === 0 ? (
            <div className="text-xs text-muted-foreground">No clips yet</div>
          ) : (
            urls.map((url, i) => {
              // If fewer than 3 clips, layout the available ones around the center.
              const slot =
                urls.length === 1 ? layout[1] :
                urls.length === 2 ? [layout[0], layout[2]][i] :
                layout[i];
              return (
                <div
                  key={url}
                  className="absolute w-[58%] aspect-[4/5] rounded-xl overflow-hidden shadow-md border-2 border-card transition-transform duration-300 group-hover:scale-[1.03]"
                  style={{
                    transform: `translate(${slot.x}, ${slot.y}) rotate(${slot.rotate}deg)`,
                    zIndex: slot.z,
                  }}
                >
                  <video
                    src={url}
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Name only — left aligned, single line clip, bold */}
      <div
        className="mt-3 px-1 font-bold text-foreground text-sm md:text-base leading-snug truncate"
        style={{ color: NAVY }}
      >
        {name}
      </div>
    </a>
  );
}

// =====================================================================
// MAIN BLOCK
// =====================================================================
export default function Block() {
  const scrollerRef = useRef(null);
  const { data, status } = useRecords({ select: createFields, count: 100 });
  const formats = data?.pages?.flatMap((p) => p?.items ?? []) ?? [];

  // Gated reveal: hidden until the visitor submits the email gate at the
  // top of the page. The gate sets a localStorage flag + dispatches a
  // 'brieflee-ugc-unlocked' event so we reveal without a page refresh.
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setUnlocked(window.localStorage.getItem(UNLOCK_KEY) === "1");
    const onUnlock = () => setUnlocked(true);
    window.addEventListener("brieflee-ugc-unlocked", onUnlock);
    return () => window.removeEventListener("brieflee-ugc-unlocked", onUnlock);
  }, []);
  if (!unlocked) return null;

  // Sort by linked-record count desc so the most-populated formats lead.
  const sorted = [...formats].sort((a, b) => {
    const ac = Array.isArray(a?.fields?.videoFormats) ? a.fields.videoFormats.length : 0;
    const bc = Array.isArray(b?.fields?.videoFormats) ? b.fields.videoFormats.length : 0;
    return bc - ac;
  });

  function scrollBy(delta) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <div className="relative w-full">
      <div className="container pt-14 md:pt-20 pb-8 md:pb-10">
        <div className="content max-w-6xl mx-auto">
          {/* Section header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6 md:mb-8">
            <div className="max-w-2xl">
              <div
                className="inline-flex items-center mb-5"
                style={{
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
                    background: PERIWINKLE,
                    boxShadow: `0 0 0 3px ${PERIWINKLE}33`,
                  }}
                />
                UGC Video Examples
              </div>
              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05] text-foreground"
                style={{ color: NAVY }}
              >
                UGC Video Examples by Format
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mt-3 leading-relaxed">
                Browse 600+ real UGC video examples from top brands. Filter by format, hook, or funnel stage. Generate a brief for any format in under 2 minutes.
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => scrollBy(-440)}
                aria-label="Scroll formats left"
                className="w-10 h-10 rounded-full border border-border bg-card text-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollBy(440)}
                aria-label="Scroll formats right"
                className="w-10 h-10 rounded-full border border-border bg-card text-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Horizontal scroller */}
          {status === "loading" || status === "pending" ? (
            <div className="flex gap-4 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="shrink-0 w-[180px] md:w-[200px]">
                  <div className="aspect-square rounded-2xl bg-muted animate-pulse mb-3" />
                  <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p>No formats to show yet. Check back soon.</p>
            </div>
          ) : (
            <div
              ref={scrollerRef}
              className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 scroll-smooth"
              style={{ scrollbarWidth: "thin" }}
            >
              {sorted.map((rec) => (
                <FormatCard key={rec.id} rec={rec} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
