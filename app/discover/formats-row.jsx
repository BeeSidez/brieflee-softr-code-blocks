// =====================================================================
// Vibe Coding block: Discover · Formats row (horizontal scroller)
// =====================================================================
// Adapted from the lead-magnet /ugc-video-examples curated-formats block.
// Same fanned-stack card design, but now wired to the BETA app database
// instead of the leads database:
//
//   formats table → 3yQSKToyjBWLSX
//   videos  table → JCveYdlP8zW4AP   (Feature checkbox = WIjIZ)
//
// Each card prefers Feature=true clips from the linked videos table —
// top featured clip lands in the MIDDLE slot (z:3, the front of the
// fan), with the others fanning to left/right. Falls back to the
// Video URL lookup so cards never look empty while videos load.
//
// Click a card → /swipe-formats/<slug>/r/<recordId> (Softr record detail).
//
// SOFTR UI SETUP:
//   1. Source tab → Database: brieflee beta → Table: formats
//   2. Add a second data source → Table: videos
//   3. Visibility tab → as required
// =====================================================================

import { useRef, useMemo } from "react";
import { useRecords, q } from "@/lib/datasource";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

// ----- formats table (3yQSKToyjBWLSX) -----
const formatSelect = q.select({
  name:         "wYhAb",  // SINGLE_LINE_TEXT (primary)
  slug:         "Aco4j",  // Seo:slug
  videoFormats: "5NFjM",  // LINKED_RECORD → videos table
  videoUrls:    "3rWLE",  // LOOKUP (all video URLs — fallback)
});

// ----- videos table (JCveYdlP8zW4AP) -----
// Pulled so we can prefer Feature=true clips on each format card.
const videoSelect = q.select({
  name:     "0woCp",  // primary — required
  formats:  "tnMBF",  // LINKED_RECORD → formats table
  feature:  "WIjIZ",  // CHECKBOX
  videoUrl: "FiIAK",  // URL
});

const PAGE_SLUG = "swipe-formats";
const NAVY = "#001364";
const BRIEFLEE_EYES = "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_sticker-blue-cartoon-eyes-looking-side-navy_2026-03.png";

const FAN_LAYOUT = [
  { rotate: -8, x: "-22%", y: "4%", z: 1 },  // left
  { rotate:  0, x: "0",    y: "0",  z: 3 },  // middle (front)
  { rotate:  8, x: "22%",  y: "4%", z: 2 },  // right
];

function FormatCard({ rec, urls }) {
  const f = rec?.fields || {};
  const name = f.name || "";
  const slug = f.slug || "";

  const href = slug
    ? `/${PAGE_SLUG}/${slug}/r/${rec.id}`
    : `/${PAGE_SLUG}/r/${rec.id}`;

  // Open in an XL Softr modal. Keep the href so middle-click /
  // cmd-click still works for "open in new tab", and so screen
  // readers see this as a link. Fall back to a normal navigation
  // when openSwModal isn't available (e.g. previewing outside Softr).
  const onClick = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    if (typeof window === "undefined") return;
    if (typeof window.openSwModal === "function") {
      e.preventDefault();
      window.openSwModal(href, "xl");
    }
  };

  return (
    <a
      href={href}
      onClick={onClick}
      className="group shrink-0 w-[180px] md:w-[200px] snap-start outline-none rounded-2xl"
    >
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

      <div
        className="mt-3 px-1 font-bold text-foreground text-sm md:text-base leading-snug truncate"
        style={{ color: NAVY }}
      >
        {name}
      </div>
    </a>
  );
}

export default function Block() {
  const scrollerRef = useRef(null);

  const { data: formatsData, status } = useRecords({ select: formatSelect, count: 100 });
  const { data: videosData }          = useRecords({ select: videoSelect,  count: 500 });

  const formats = formatsData?.pages?.flatMap((p) => p?.items ?? []) ?? [];
  const videos  = videosData?.pages?.flatMap((p) => p?.items ?? []) ?? [];

  // Map: format record id → array of featured video URLs (Feature checkbox).
  const featuredByFormatId = useMemo(() => {
    const map = new Map();
    for (const v of videos) {
      const f = v?.fields || {};
      if (!f.feature) continue;
      const url = f.videoUrl;
      if (!url) continue;
      const links = Array.isArray(f.formats) ? f.formats : [];
      for (const link of links) {
        const fid = typeof link === "string" ? link : link?.id;
        if (!fid) continue;
        if (!map.has(fid)) map.set(fid, []);
        map.get(fid).push(url);
      }
    }
    return map;
  }, [videos]);

  // Sort by linked-video count desc so most-populated formats lead.
  const sorted = [...formats].sort((a, b) => {
    const ac = Array.isArray(a?.fields?.videoFormats) ? a.fields.videoFormats.length : 0;
    const bc = Array.isArray(b?.fields?.videoFormats) ? b.fields.videoFormats.length : 0;
    return bc - ac;
  });

  // Pick 3 URLs for a format: top Feature=true clip lands in the MIDDLE slot
  // (FAN_LAYOUT index 1, z:3). Left + right fill with remaining featured, then
  // fall back to the regular LOOKUP urls so cards never look empty.
  function urlsFor(rec) {
    const featured = featuredByFormatId.get(rec.id) || [];
    const fallback = Array.isArray(rec?.fields?.videoUrls) ? rec.fields.videoUrls : [];

    if (featured.length === 0) {
      return fallback.slice(0, 3);
    }

    const seen = new Set();
    const pool = [];
    for (const u of [...featured, ...fallback]) {
      if (u && !seen.has(u)) { seen.add(u); pool.push(u); }
    }

    if (pool.length === 1) return [pool[0]];           // single → middle slot
    if (pool.length === 2) return [pool[1], pool[0]];  // best featured on the right (more visible than left)
    return [pool[1], pool[0], pool[2]];                // 3+ → top featured in middle, others on left/right
  }

  function scrollBy(delta) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <div className="relative w-full">
      {/* Hide the horizontal scrollbar — navigation lives in the
          chevron buttons at the top of the row. */}
      <style>{`.bl-formats-scroller::-webkit-scrollbar { display: none; }`}</style>
      <div className="container pt-6 md:pt-8 pb-6 md:pb-8">
        <div className="content max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5 md:mb-6">
            <div className="max-w-2xl">
              {/* App-scale heading — matches app/projects/index .bl-projects-title. */}
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: NAVY,
                  letterSpacing: "-0.015em",
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                Discover
              </h1>
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
              className="bl-formats-scroller flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {sorted.map((rec) => (
                <FormatCard key={rec.id} rec={rec} urls={urlsFor(rec)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
