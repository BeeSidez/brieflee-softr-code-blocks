// =====================================================================
// Vibe Coding block: Discover · Videos grid (Block 2 on /discover)
// =====================================================================
// Sits below the formats row on the Discover page. Masonry grid of
// video cards pulled from the beta videos table (JCveYdlP8zW4AP), with:
//
//   • Search across brand / industry / visual format / influencer
//   • Filter pills: Industry, Brand, Format Tags, Funnel stage,
//     Hook type, Hook tactic
//   • Save heart (top-right of video) — toggles current user's id on
//     the video's User Swipes link (WJO6I)
//   • Bookmark menu (bottom-right of brand strip) — toggles which of
//     the user's boards the video belongs to via the boards link
//     (IniNB → boards table XiLxhAkyOL9yrX). Board creation lives in
//     the Discover sidebar nav, not here.
//   • Card click → /videos-details/r/<videoId> opened in an XL Softr
//     modal (window.openSwModal). Cmd/ctrl/middle-click falls back to
//     a normal new-tab navigation.
//
// If used on a format detail page, useCurrentRecordId auto-scopes the
// grid to that format. On Discover (no current record), it shows the
// full feed.
//
// SOFTR UI SETUP:
//   1. Source tab → Database: brieflee beta → Table: videos
//   2. Add a second data source → Table: boards
//   3. Visibility tab → as required (logged-in app users)
//   4. Actions tab → enable Update Record (aliases: userSwipes, boards)
// =====================================================================

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useRecord,
  useRecords,
  useRecordUpdate,
  useCurrentRecordId,
  q,
} from "@/lib/datasource";
import { useCurrentUser } from "@/lib/user";
import {
  ChevronDown,
  Check,
  Search,
  X,
  Building2,
  Sparkles,
  Heart,
  Bookmark,
  Tag,
  Target,
  Zap,
  Layers,
} from "lucide-react";

// ─── videos table (JCveYdlP8zW4AP) aliases ───────────────────
const createFields = q.select({
  name:            "0woCp",  // primary
  slug:            "5Vz0z",  // Seo:slug
  brand:           "qmyIv",  // SELECT
  industry:        "8zXEg",  // SELECT
  influencerCeleb: "tNY4n",  // SINGLE_LINE_TEXT
  visualFormat:    "VuAGy",  // SELECT
  format:          "tnMBF",  // LINKED_RECORD → formats (per-format scope)
  formatTags:      "nSNCc",  // SELECT (multi)
  funnelStage:     "EzI2F",  // LOOKUP → SELECT[] (from linked format)
  hookType:        "rsP5n",  // LOOKUP → SELECT[]
  hookTactic:      "MC9qB",  // LOOKUP → SELECT[]
  videoUrl:        "FiIAK",  // URL
  logoUrl:         "V2EkP",  // URL
  userSwipes:      "WJO6I",  // LINKED_RECORD → users (save state)
  boards:          "IniNB",  // LINKED_RECORD → boards
});

// Writeable subset — only the two link fields that the card actions touch.
const updateFields = q.select({
  userSwipes: "WJO6I",
  boards:     "IniNB",
});

// ─── boards table (XiLxhAkyOL9yrX) aliases ───────────────────
const boardsSelect = q.select({
  name:  "dsjPO",  // primary
  emoji: "695Lf",  // SELECT
  user:  "enk5I",  // LINKED_RECORD → users (board owner)
});

const NAVY = "#001364";
const PERIWINKLE = "#879CF7";

// ─── Helpers ─────────────────────────────────────────────────
// LINKED_RECORD / LOOKUP fields surface as either [{id,label}] or [id].
// Reduce to a list of {id,label} so callers can read either piece.
function linkObjects(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") return { id: item, label: "" };
      if (item && typeof item === "object") return { id: item.id || item, label: item.label || "" };
      return null;
    })
    .filter(Boolean);
}
function linkIds(raw) {
  return linkObjects(raw).map((o) => o.id).filter(Boolean);
}
// Lookup labels — used for the funnel/hook filter pills. Each row's
// lookup is an array of SELECT objects from the linked format.
function lookupLabels(raw) {
  return linkObjects(raw).map((o) => o.label).filter(Boolean);
}

// ─── Filter pill: multi-select dropdown ──────────────────────
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

// ─── Boards menu (per-card) ──────────────────────────────────
// Click bookmark icon → popover lists the user's boards. Each is a
// toggle (checked = video is on that board). Empty state nudges
// the user toward the sidebar where new boards get created.
function BoardsMenu({ video, boards, currentBoardIds, onToggleBoard }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const stop = (e) => { e.preventDefault(); e.stopPropagation(); };

  useEffect(() => {
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const isOnAnyBoard = currentBoardIds.length > 0;

  return (
    <div className="relative" ref={ref} onMouseDown={stop} onClick={stop}>
      <button
        type="button"
        onClick={(e) => { stop(e); setOpen((o) => !o); }}
        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
          isOnAnyBoard
            ? "text-primary bg-primary/10 hover:bg-primary/15"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
        aria-label={isOnAnyBoard ? "Manage boards" : "Add to board"}
        title={isOnAnyBoard ? "On a board — manage" : "Add to board"}
      >
        <Bookmark className="w-4 h-4" fill={isOnAnyBoard ? "currentColor" : "none"} />
      </button>

      {open && (
        <div
          className="absolute bottom-full right-0 mb-2 w-64 max-h-[320px] overflow-y-auto bg-card border border-border rounded-2xl shadow-xl z-40 p-2"
        >
          <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Add to board
          </div>
          {boards.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground">
              No boards yet. Create one from the sidebar to organize your saves.
            </div>
          ) : (
            boards.map((b) => {
              const isOn = currentBoardIds.includes(b.id);
              const name = b?.fields?.name || "Untitled board";
              const emoji = b?.fields?.emoji?.label || "";
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={(e) => { stop(e); onToggleBoard(video, b.id); }}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm text-left hover:bg-muted ${
                    isOn ? "bg-primary/5" : ""
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    {emoji && <span className="shrink-0">{emoji}</span>}
                    <span className="text-foreground truncate">{name}</span>
                  </span>
                  {isOn && <Check className="w-4 h-4 text-primary shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ─── Card ────────────────────────────────────────────────────
function ClipCard({ rec, currentUserId, boards, onToggleSave, onToggleBoard }) {
  const f = rec.fields || {};
  const url = f.videoUrl || "";
  const brand = f.brand?.label || "";
  const logo = f.logoUrl || "";
  const formatTag = Array.isArray(f.formatTags) && f.formatTags[0]?.label;

  if (!url) return null;

  // Save state: current user present in this video's userSwipes link?
  const swipeIds = linkIds(f.userSwipes);
  const isSaved = currentUserId ? swipeIds.includes(currentUserId) : false;

  // Boards this video already belongs to.
  const boardIds = linkIds(f.boards);

  const href = `/videos-details/r/${rec.id}`;

  const stop = (e) => { e.preventDefault(); e.stopPropagation(); };

  const onCardClick = (e) => {
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
      onClick={onCardClick}
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

        {/* Save heart — disabled when user not logged in. */}
        <button
          type="button"
          onMouseDown={stop}
          onClick={(e) => { stop(e); if (currentUserId) onToggleSave(rec); }}
          disabled={!currentUserId}
          className={`absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-card/90 backdrop-blur shadow-sm transition-colors ${
            isSaved
              ? "text-rose-500 hover:text-rose-600"
              : "text-foreground hover:text-rose-500"
          } ${currentUserId ? "" : "opacity-50 cursor-not-allowed"}`}
          aria-label={isSaved ? "Remove from saved" : "Save"}
          title={isSaved ? "Saved" : "Save"}
        >
          <Heart className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
        </button>
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

        <BoardsMenu
          video={rec}
          boards={boards}
          currentBoardIds={boardIds}
          onToggleBoard={onToggleBoard}
        />
      </div>
    </a>
  );
}

// =====================================================================
// MAIN BLOCK
// =====================================================================
export default function Block() {
  const user = useCurrentUser();
  const currentUserId = user?.id || null;

  const currentFormatId = useCurrentRecordId();
  const { data, status, refetch } = useRecords({ select: createFields, count: 500 });
  const allRecords = data?.pages?.flatMap((p) => p?.items ?? []) ?? [];

  // Boards owned by the current user — the "Add to board" menu picks from here.
  const { data: boardsData } = useRecords({ select: boardsSelect, count: 200 });
  const allBoards = boardsData?.pages?.flatMap((p) => p?.items ?? []) ?? [];
  const myBoards = useMemo(() => {
    if (!currentUserId) return [];
    return allBoards.filter((b) => {
      const ownerIds = linkIds(b?.fields?.user);
      return ownerIds.includes(currentUserId);
    });
  }, [allBoards, currentUserId]);

  // Single mutation hook for both save + board toggles.
  const updateRecord = useRecordUpdate({ fields: updateFields });

  const handleToggleSave = (video) => {
    if (!currentUserId) return;
    const current = linkObjects(video?.fields?.userSwipes);
    const ids = current.map((u) => u.id);
    const isSaved = ids.includes(currentUserId);
    const next = isSaved
      ? current.filter((u) => u.id !== currentUserId).map((u) => ({ id: u.id }))
      : [...current.map((u) => ({ id: u.id })), { id: currentUserId }];
    updateRecord.mutateAsync({ recordId: video.id, fields: { userSwipes: next } })
      .then(() => refetch?.())
      .catch((err) => console.error("Save toggle failed:", err));
  };

  const handleToggleBoard = (video, boardId) => {
    const current = linkObjects(video?.fields?.boards);
    const ids = current.map((b) => b.id);
    const isOn = ids.includes(boardId);
    const next = isOn
      ? current.filter((b) => b.id !== boardId).map((b) => ({ id: b.id }))
      : [...current.map((b) => ({ id: b.id })), { id: boardId }];
    updateRecord.mutateAsync({ recordId: video.id, fields: { boards: next } })
      .then(() => refetch?.())
      .catch((err) => console.error("Board toggle failed:", err));
  };

  // Filter state
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    industry:    [],
    brand:       [],
    formatTags:  [],
    funnelStage: [],
    hookType:    [],
    hookTactic:  [],
  });

  // Auto-scope to the current format record when this block sits on a
  // format detail page. No-op when useCurrentRecordId returns null
  // (Discover index page).
  const formatScoped = useMemo(() => {
    if (!currentFormatId) return allRecords;
    return allRecords.filter((r) => {
      const fmt = r?.fields?.format;
      if (Array.isArray(fmt)) return fmt.some((x) => x?.id === currentFormatId);
      return fmt?.id === currentFormatId;
    });
  }, [allRecords, currentFormatId]);

  // Distinct option lists per filter pill — built from the format-scoped
  // set so options track the page context.
  const options = useMemo(() => {
    const collectSelect = (key) => {
      const set = new Set();
      for (const r of formatScoped) {
        const v = r?.fields?.[key];
        const label = v?.label;
        if (label) set.add(label);
      }
      return Array.from(set).sort();
    };
    const collectMultiOrLookup = (key) => {
      const set = new Set();
      for (const r of formatScoped) {
        for (const label of lookupLabels(r?.fields?.[key])) set.add(label);
      }
      return Array.from(set).sort();
    };
    return {
      industry:    collectSelect("industry"),
      brand:       collectSelect("brand"),
      formatTags:  collectMultiOrLookup("formatTags"),
      funnelStage: collectMultiOrLookup("funnelStage"),
      hookType:    collectMultiOrLookup("hookType"),
      hookTactic:  collectMultiOrLookup("hookTactic"),
    };
  }, [formatScoped]);

  // Apply user filters + search on top of the format-scoped set.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return formatScoped.filter((r) => {
      const f = r?.fields || {};
      if (filters.industry.length && !filters.industry.includes(f.industry?.label)) return false;
      if (filters.brand.length && !filters.brand.includes(f.brand?.label)) return false;

      if (filters.formatTags.length) {
        const labels = lookupLabels(f.formatTags);
        if (!filters.formatTags.some((sel) => labels.includes(sel))) return false;
      }
      if (filters.funnelStage.length) {
        const labels = lookupLabels(f.funnelStage);
        if (!filters.funnelStage.some((sel) => labels.includes(sel))) return false;
      }
      if (filters.hookType.length) {
        const labels = lookupLabels(f.hookType);
        if (!filters.hookType.some((sel) => labels.includes(sel))) return false;
      }
      if (filters.hookTactic.length) {
        const labels = lookupLabels(f.hookTactic);
        if (!filters.hookTactic.some((sel) => labels.includes(sel))) return false;
      }

      if (q) {
        const hay = [f.name, f.brand?.label, f.industry?.label, f.visualFormat?.label, f.influencerCeleb]
          .filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [formatScoped, filters, search]);

  const anyFilterActive =
    filters.industry.length ||
    filters.brand.length ||
    filters.formatTags.length ||
    filters.funnelStage.length ||
    filters.hookType.length ||
    filters.hookTactic.length ||
    search.trim();

  function clearAll() {
    setFilters({
      industry: [], brand: [], formatTags: [],
      funnelStage: [], hookType: [], hookTactic: [],
    });
    setSearch("");
  }

  return (
    <div id="videos-grid" className="relative w-full">
      <div className="container py-6 md:py-8">
        <div className="content max-w-7xl mx-auto">

          {/* Filter row */}
          <div className="flex flex-col gap-3 mb-6 md:mb-8">
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
              <FilterPill
                label="Format tags"
                icon={Tag}
                options={options.formatTags}
                selected={filters.formatTags}
                onChange={(v) => setFilters((p) => ({ ...p, formatTags: v }))}
              />
              <FilterPill
                label="Funnel stage"
                icon={Layers}
                options={options.funnelStage}
                selected={filters.funnelStage}
                onChange={(v) => setFilters((p) => ({ ...p, funnelStage: v }))}
              />
              <FilterPill
                label="Hook type"
                icon={Zap}
                options={options.hookType}
                selected={filters.hookType}
                onChange={(v) => setFilters((p) => ({ ...p, hookType: v }))}
              />
              <FilterPill
                label="Hook tactic"
                icon={Target}
                options={options.hookTactic}
                selected={filters.hookTactic}
                onChange={(v) => setFilters((p) => ({ ...p, hookTactic: v }))}
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
                <ClipCard
                  key={rec.id}
                  rec={rec}
                  currentUserId={currentUserId}
                  boards={myBoards}
                  onToggleSave={handleToggleSave}
                  onToggleBoard={handleToggleBoard}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
