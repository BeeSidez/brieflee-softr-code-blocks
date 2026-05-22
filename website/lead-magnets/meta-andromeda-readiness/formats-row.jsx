// =====================================================================
// Vibe Coding block: Sample formats row — "this is what variation looks like"
// =====================================================================
// Sits between the Andromeda explainer and the readiness quiz.
// Shows a horizontal scroll of format archetype cards pulled live from
// the Formats table (same fanned-stack design as /ugc-video-examples
// curated-formats.jsx). Visual proof of what "multi-format variation"
// actually means — turns the abstract Andromeda rule into a catalogue
// the visitor can browse.
//
// Click "Browse all 42 →" → /ugc-formats
//
// SOFTR UI SETUP:
//   1. Source tab → Database: brieflee leads → Table: Formats
//   2. Visibility tab → public
// =====================================================================

import { useRef } from "react";
import { useRecords, q } from "@/lib/datasource";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const createFields = q.select({
  name:            "DTyOH",  // SINGLE_LINE_TEXT (primary)
  slug:            "ncAxJ",  // SEO:Slug
  sampleClipUrls:  "devrZ",  // LONG_TEXT, 3 Video URLs newline-separated
  videoFormats:    "HyVmY",  // LINKED_RECORD count — sort by popularity
});

const PAGE_SLUG = "ugc-formats";
const NAVY = "#001364";

// 3-clip stack layout — middle on top, left -8°, right +8°. Same as
// curated-formats.jsx so visitors get visual consistency across the funnel.
const FAN_LAYOUT = [
  { rotate: -8, x: "-22%", y: "4%",  z: 1 },
  { rotate:  0, x: "0",    y: "0",   z: 3 },
  { rotate:  8, x: "22%",  y: "4%",  z: 2 },
];

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

  return (
    <a href={href} className="group shrink-0 w-[170px] md:w-[190px] snap-start outline-none rounded-2xl">
      <div className="aspect-square rounded-2xl bg-muted/60 relative overflow-hidden transition-colors group-hover:bg-muted">
        <div className="absolute inset-0 flex items-center justify-center">
          {urls.length === 0 ? (
            <div className="text-xs text-muted-foreground">No clips yet</div>
          ) : (
            urls.map((url, i) => {
              const slot =
                urls.length === 1 ? FAN_LAYOUT[1] :
                urls.length === 2 ? [FAN_LAYOUT[0], FAN_LAYOUT[2]][i] :
                FAN_LAYOUT[i];
              return (
                <div
                  key={url}
                  className="absolute w-[58%] aspect-[4/5] rounded-xl overflow-hidden shadow-md border-2 border-card transition-transform duration-300 group-hover:scale-[1.03]"
                  style={{
                    transform: `translate(${slot.x}, ${slot.y}) rotate(${slot.rotate}deg)`,
                    zIndex: slot.z,
                  }}
                >
                  <video src={url} muted playsInline preload="metadata"
                    className="w-full h-full object-cover pointer-events-none" />
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="mt-3 px-1 font-bold text-foreground text-sm md:text-base leading-snug truncate" style={{ color: NAVY }}>
        {name}
      </div>
    </a>
  );
}

export default function Block() {
  const scrollerRef = useRef(null);
  const { data, status } = useRecords({ select: createFields, count: 100 });
  const formats = data?.pages?.flatMap((p) => p?.items ?? []) ?? [];

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
      <div className="container py-12 md:py-16">
        <div className="content max-w-6xl mx-auto">

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6 md:mb-8">
            <div className="max-w-2xl">
              <div
                className="inline-flex items-center mb-4"
                style={{
                  gap: 10,
                  padding: "8px 16px",
                  background: "rgba(135,156,247,0.16)",
                  color: NAVY,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  borderRadius: 999,
                }}
              >
                What variation looks like
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.1]" style={{ color: NAVY }}>
                42 UGC formats. Real brands. Real ads.
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mt-3 leading-relaxed">
                Andromeda rewards multi-format variation. Here are the 42 formats high-performing brands rotate through. Click any to see real video examples.
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

          {status === "loading" || status === "pending" ? (
            <div className="flex gap-4 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="shrink-0 w-[170px] md:w-[190px]">
                  <div className="aspect-square rounded-2xl bg-muted animate-pulse mb-3" />
                  <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p>No formats to show yet.</p>
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

          <div className="flex justify-center mt-8">
            <a
              href="/ugc-video-examples"
              className="inline-flex items-center gap-2 px-6 h-12 rounded-xl border-2 border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Browse all 42 formats with real examples
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
