// =====================================================================
// Vibe Coding block: Per-format video grid (Block 2 of /ugc-formats)
// =====================================================================
// Same masonry + filter pattern as grid.jsx on the main page, but:
//   - Auto-filters to the current Format (via useCurrentRecordId on the
//     Format detail page) so only that format's clips show
//   - Drops the Format filter pill (we're already inside one format)
//   - No Brieflee CTA — the CTA lives elsewhere on this page
//
// Filters available: Industry + Brand + search.
// Click card → /ugc-videos/r/{video-id}
//
// SOFTR UI SETUP (one-time):
//   1. /ugc-formats page already exists from format-details.jsx setup
//   2. Source tab on THIS block → Database: brieflee leads → Table: Video Formats
//   3. Visibility tab → public
//   4. No Actions tab config (read-only)
// =====================================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { useRecords, useCurrentRecordId, q } from "@/lib/datasource";
import {
  ChevronDown, Check, Search, X, Building2, Sparkles,
} from "lucide-react";

const createFields = q.select({
  name:             "vWiQd",  // FORMULA (primary)
  slug:             "2W93k",  // SEO:Slug — Softr routing helper
  brand:            "0RVhV",  // SELECT
  industry:         "vfn4W",  // SELECT
  influencerCeleb:  "fkAzJ",  // SINGLE_LINE_TEXT
  visualFormat:     "chpG7",  // SELECT
  format:           "6SF01",  // LINKED_RECORD → Formats (filter target)
  formatTags:       "tReml",  // SELECT multi
  videoUrl:         "e4FOk",  // URL
  logoUrl:          "3Q9oG",  // URL
  dateAdded:        "5MBak",  // CREATED_AT
});

function timeSince(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (!then) return "";
  const diffMs = Date.now() - then;
  const day = 24 * 60 * 60 * 1000;
  const d = Math.floor(diffMs / day);
  if (d < 1) return "today";
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

// ---------------------------------------------------------------------
// Filter pill: dropdown of distinct values with multi-select checkboxes.
// ---------------------------------------------------------------------
function FilterPill({ label, icon: Icon, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const active = selected.length > 0;

  function toggle(value) {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(next);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 text-sm font-semibold transition-colors ${
          active
            ? "bg-primary/10 border-primary text-primary"
            : "bg-card border-border text-foreground hover:border-primary/40"
        }`}
      >
        {Icon && <Icon className="w-4 h-4" />}
        <span>{label}</span>
        {active && (
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
            {selected.length}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-72 max-h-[380px] overflow-y-auto bg-card border border-border rounded-2xl shadow-xl z-30 p-2">
          {options.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground">No options yet</div>
          ) : (
            options.map((opt) => {
              const isSelected = selected.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggle(opt)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm text-left hover:bg-muted ${
                    isSelected ? "bg-primary/5" : ""
                  }`}
                >
                  <span className="text-foreground truncate pr-2">{opt}</span>
                  {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                </button>
              );
            })
          )}
          {active && (
            <div className="border-t border-border mt-2 pt-2">
              <button
                type="button"
                onClick={() => onChange([])}
                className="w-full text-sm text-muted-foreground hover:text-foreground py-1.5"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// One grid card: video thumbnail + brand strip.
// Click → video detail page.
// ---------------------------------------------------------------------
function ClipCard({ rec }) {
  const f = rec.fields || {};
  const url = f.videoUrl || "";
  const brand = f.brand?.label || "";
  const logo = f.logoUrl || "";
  const formatTag = Array.isArray(f.formatTags) && f.formatTags[0]?.label;
  const date = timeSince(f.dateAdded);

  if (!url) return null;

  const href = `/ugc-videos/${f.slug || "video"}/r/${rec.id}`;
  return (
    <a
      href={href}
      onClick={(e) => {
        if (typeof window !== "undefined" && typeof window.openSwModal === "function") {
          e.preventDefault();
          window.openSwModal(href, "xl");
        }
      }}
      className="group break-inside-avoid mb-3 md:mb-4 block w-full text-left bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/40 transition-colors shadow-sm hover:shadow-md"
    >
      <div className="relative">
        <video
          src={url}
          muted
          playsInline
          preload="metadata"
          className="w-full h-auto object-cover bg-muted"
        />
        {formatTag && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-card/90 backdrop-blur text-[10px] font-semibold uppercase tracking-wider text-foreground">
            {formatTag}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          {logo ? (
            <img src={logo} alt="" className="w-6 h-6 rounded-md object-cover shrink-0" draggable={false} />
          ) : (
            <div className="w-6 h-6 rounded-md bg-muted shrink-0" />
          )}
          <span className="font-semibold text-foreground text-sm truncate">{brand || "Brand"}</span>
        </div>
      </div>
    </a>
  );
}

// =====================================================================
// MAIN BLOCK
// =====================================================================
export default function Block() {
  const currentFormatId = useCurrentRecordId();
  const { data, status } = useRecords({ select: createFields, count: 100 });
  const allRecords = data?.pages?.flatMap((p) => p?.items ?? []) ?? [];

  // Filter state — Format pill removed; only Industry + Brand + search.
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    industry: [],
    brand: [],
  });

  // Auto-filter to the current Format record (page context).
  const formatFiltered = useMemo(() => {
    if (!currentFormatId) return allRecords;
    return allRecords.filter((r) => {
      const fmt = r?.fields?.format;
      if (Array.isArray(fmt)) return fmt.some((x) => x?.id === currentFormatId);
      return fmt?.id === currentFormatId;
    });
  }, [allRecords, currentFormatId]);

  // Build distinct option lists from the format-filtered set.
  const options = useMemo(() => {
    const collect = (key) => {
      const set = new Set();
      for (const r of formatFiltered) {
        const v = r?.fields?.[key];
        const label = v?.label;
        if (label) set.add(label);
      }
      return Array.from(set).sort();
    };
    return {
      industry: collect("industry"),
      brand: collect("brand"),
    };
  }, [formatFiltered]);

  // Apply user filters + search on top of the format-scoped set.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return formatFiltered.filter((r) => {
      const f = r?.fields || {};
      if (filters.industry.length && !filters.industry.includes(f.industry?.label)) return false;
      if (filters.brand.length && !filters.brand.includes(f.brand?.label)) return false;
      if (q) {
        const hay = [f.name, f.brand?.label, f.industry?.label, f.visualFormat?.label, f.influencerCeleb]
          .filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [formatFiltered, filters, search]);

  const anyFilterActive =
    filters.industry.length || filters.brand.length || search.trim();

  function clearAll() {
    setFilters({ industry: [], brand: [] });
    setSearch("");
  }

  return (
    <div id="grid" className="relative w-full">
      <div className="container py-8 md:py-10">
        <div className="content max-w-6xl mx-auto">

          {/* Filter row */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6 md:mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by brand, industry…"
                className="w-full h-11 pl-10 pr-3 rounded-xl border-2 border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterPill
                label="Industry"
                icon={Building2}
                options={options.industry}
                selected={filters.industry}
                onChange={(v) => setFilters((p) => ({ ...p, industry: v }))}
              />
              <FilterPill
                label="Brand"
                icon={Building2}
                options={options.brand}
                selected={filters.brand}
                onChange={(v) => setFilters((p) => ({ ...p, brand: v }))}
              />
              {anyFilterActive && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Result count */}
          <div className="text-sm text-muted-foreground mb-4">
            {status === "loading" || status === "pending"
              ? "Loading…"
              : `${filtered.length.toLocaleString()} ${filtered.length === 1 ? "video" : "videos"}`}
          </div>

          {/* Grid (CSS-columns masonry) */}
          {status === "loading" || status === "pending" ? (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="break-inside-avoid mb-3 md:mb-4 rounded-2xl bg-muted animate-pulse"
                  style={{ height: 200 + (i % 4) * 80 }}
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="mb-3">No videos match these filters.</p>
              {anyFilterActive && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-primary font-semibold hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4">
              {filtered.map((rec) => (
                <ClipCard key={rec.id} rec={rec} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
