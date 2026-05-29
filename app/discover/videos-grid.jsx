// =====================================================================
// Vibe Coding block: Discover · Videos grid (Block 2 on /discover)
// =====================================================================
// Sits below the formats row on the Discover page. Masonry grid of
// video cards pulled from the beta videos table (JCveYdlP8zW4AP), with:
//
//   • Search across brand / industry / visual format / influencer
//   • Filter pills: Industry, Brand, Format (with format emoji per
//     option), Funnel stage, Hook type, Hook tactic
//   • Save heart (top-right of video) — toggles current user's id on
//     the video's User Swipes link (WJO6I). Mid-mutation shows a
//     spinner; saved state is gray (Motion-style); success / removal
//     fires a sonner toast.
//   • Bookmark button (bottom-right of brand strip) — opens
//     /assign-board?recordId=<videoId> as a "md" Softr modal. The
//     /assign-board page owns the add/remove board logic; this block
//     only reads `boards` to render the filled-vs-outline indicator.
//   • Card click → /videos-details?recordId=<videoId> opened in an
//     XL Softr modal (window.openSwModal). Cmd/ctrl/middle-click falls
//     back to a normal new-tab navigation.
//
// If used on a format detail page, useCurrentRecordId auto-scopes the
// grid to that format. On Discover (no current record), it shows the
// full feed.
//
// SOFTR UI SETUP:
//   1. Source tab → Database: brieflee beta → Table: videos
//   2. Visibility tab → as required (logged-in app users)
//   3. Actions tab → enable Update Record (aliases: userSwipes, boards)
// =====================================================================

import { useMemo, useState } from "react";
import {
  useRecords,
  useRecordUpdate,
  useCurrentRecordId,
  q,
} from "@/lib/datasource";
import { useCurrentUser } from "@/lib/user";
import {
  ChevronDown,
  Search,
  X,
  Building2,
  BadgeCheck,
  Sparkles,
  Heart,
  Bookmark,
  Target,
  Zap,
  Layers,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// ─── videos table (JCveYdlP8zW4AP) aliases ───────────────────
const createFields = q.select({
  name:            "0woCp",  // primary
  slug:            "5Vz0z",  // Seo:slug
  brand:           "qmyIv",  // SELECT
  industry:        "8zXEg",  // SELECT
  influencerCeleb: "tNY4n",  // SINGLE_LINE_TEXT
  visualFormat:    "VuAGy",  // SELECT
  format:          "tnMBF",  // LINKED_RECORD → formats (drives the Format filter pill)
  emoji:           "ZAgA5",  // LOOKUP → emoji string[] (parallel-array to `format`)
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

// SELECT fields normally surface as { id, label } via the Vibe Code
// data layer, but the underlying store sometimes wraps them in an
// array (see app/projects/index statusFor) or hands back a bare
// string. selectLabel collapses all three shapes to a single label,
// so the filter logic and options builder don't silently miss values.
function selectLabel(raw) {
  if (raw == null) return null;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return selectLabel(raw[0]);
  if (typeof raw === "object") return raw.label ?? null;
  return String(raw);
}

// ─── Filter pill: chip wrapping an invisible native <select> ────
// The chip drives the look — icon + label (and the selected value
// when active). A native <select> is layered transparently on top so
// the browser owns the dropdown popup (escapes every stacking-context
// / overflow trap that broke the custom v1 popover) without any
// "Any"-style placeholder text leaking into the chip.
//
// Options may be plain strings OR { label, emoji } objects — the
// Format pill uses the object form so each <option> can show "🤫 ASMR".
function FilterPill({ label, icon: Icon, options, selected, onChange }) {
  const active = selected.length > 0;
  const value = selected[0] || "";

  return (
    <label
      className={`relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 text-sm font-semibold transition-colors cursor-pointer ${
        active
          ? "bg-primary/10 border-primary text-primary"
          : "bg-card border-border text-foreground hover:border-primary/40"
      }`}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span className="shrink-0">{label}</span>
      {active && (
        <span className="truncate max-w-[140px] font-bold opacity-90">
          · {value}
        </span>
      )}
      <ChevronDown className="w-4 h-4 shrink-0 opacity-70" />
      {/* Invisible native select on top — captures clicks across the
          full chip area, browser handles the popup positioning. */}
      <select
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v ? [v] : []);
        }}
        aria-label={label}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      >
        <option value="">All {label.toLowerCase()}</option>
        {options.map((opt) => {
          const optLabel = typeof opt === "string" ? opt : opt.label;
          const optEmoji = typeof opt === "string" ? "" : opt.emoji;
          return (
            <option key={optLabel} value={optLabel}>
              {optEmoji ? `${optEmoji} ${optLabel}` : optLabel}
            </option>
          );
        })}
      </select>
    </label>
  );
}

// ─── Boards button (per-card) ────────────────────────────────
// Click → opens /assign-board?recordId=<videoId> as a "md" Softr
// modal. The /assign-board page handles the actual add/remove board
// logic; this card just shows whether the video is currently on any
// board (filled bookmark) or not (outline).
function BoardsButton({ video, isOnAnyBoard }) {
  const stop = (e) => { e.preventDefault(); e.stopPropagation(); };

  const onClick = (e) => {
    stop(e);
    if (typeof window === "undefined") return;
    const url = `/assign-board?recordId=${encodeURIComponent(video.id)}`;
    if (typeof window.openSwModal === "function") {
      window.openSwModal(url, "md");
    } else {
      window.location.href = url;
    }
  };

  return (
    <button
      type="button"
      data-card-action="boards"
      onMouseDown={stop}
      onClick={onClick}
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
  );
}

// ─── Card ────────────────────────────────────────────────────
function ClipCard({ rec, currentUserId, isSaving, onToggleSave }) {
  const f = rec.fields || {};
  const url = f.videoUrl || "";
  const brand = f.brand?.label || "";
  const logo = f.logoUrl || "";

  // Format chip — first linked format's label (e.g. "ASMR").
  const formats = linkObjects(f.format);
  const formatLabel = formats[0]?.label || "";

  if (!url) return null;

  // Save state: current user present in this video's userSwipes link?
  const swipeIds = linkIds(f.userSwipes);
  const isSaved = currentUserId ? swipeIds.includes(currentUserId) : false;

  // Bookmark visual — filled when the video is on at least one board.
  const isOnAnyBoard = linkIds(f.boards).length > 0;

  // /videos-details is the in-app detail page. Uses the same
  // ?recordId= convention as /projects-invite and /projects/details/
  // (see app/projects/index).
  const href = `/videos-details?recordId=${encodeURIComponent(rec.id)}`;

  const stop = (e) => { e.preventDefault(); e.stopPropagation(); };

  const onCardClick = (e) => {
    // React's synthetic stopPropagation on a nested button doesn't
    // always prevent the native <a> default. So we check here: if
    // the click originated inside an action element, bail before
    // opening the modal. data-card-action is set on the save heart
    // and the bookmark button.
    if (e.target.closest && e.target.closest("[data-card-action]")) {
      e.preventDefault();
      return;
    }
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

        {formatLabel && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-card/90 backdrop-blur text-[10px] font-semibold uppercase tracking-wider text-foreground">
            {formatLabel}
          </span>
        )}

        {/* Save heart — gray when saved (Motion-style), spinner during
            the mutation, disabled when user not logged in. */}
        <button
          type="button"
          data-card-action="save"
          onMouseDown={stop}
          onClick={(e) => { stop(e); if (currentUserId && !isSaving) onToggleSave(rec); }}
          disabled={!currentUserId || isSaving}
          className={`absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-full backdrop-blur shadow-sm transition-colors ${
            isSaving
              ? "bg-card/90 text-muted-foreground"
              : isSaved
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-card/90 text-foreground hover:bg-card"
          } ${!currentUserId ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-label={isSaved ? "Remove from saved" : "Save"}
          title={isSaved ? "Saved — click to remove" : "Save"}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Heart className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
          )}
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

        <BoardsButton video={rec} isOnAnyBoard={isOnAnyBoard} />
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

  // Single mutation hook for the save toggle. The bookmark button on
  // each card delegates board assignment to the /assign-board Softr
  // modal page, so this block doesn't need a board write path.
  const updateRecord = useRecordUpdate({ fields: updateFields });

  // Per-video pending state so spinners stay scoped to the clicked card.
  // A shared `updateRecord.isPending` would spin every card at once.
  const [savingIds, setSavingIds] = useState(() => new Set());

  // Optimistic overlay: { [videoId]: { userSwipes?, boards? } }.
  // Without this, the heart / bookmark wouldn't visually flip until
  // the mutation round-trip + refetch completed — felt like nothing
  // was happening. We set the override immediately on click, then
  // clear it once refetch returns (or on error so the UI reverts).
  const [optimistic, setOptimistic] = useState(() => new Map());

  // Apply any pending optimistic override on top of rec.fields so the
  // card reads the intended state instantly.
  const mergeOptimistic = (rec) => {
    const o = optimistic.get(rec.id);
    if (!o) return rec;
    return {
      ...rec,
      fields: {
        ...rec.fields,
        ...(o.userSwipes !== undefined ? { userSwipes: o.userSwipes } : {}),
        ...(o.boards !== undefined ? { boards: o.boards } : {}),
      },
    };
  };

  const clearOptimisticKey = (videoId, key) => {
    setOptimistic((prev) => {
      const n = new Map(prev);
      const entry = n.get(videoId);
      if (!entry) return prev;
      const { [key]: _drop, ...rest } = entry;
      if (Object.keys(rest).length === 0) n.delete(videoId);
      else n.set(videoId, rest);
      return n;
    });
  };

  const handleToggleSave = async (video) => {
    if (!currentUserId) {
      toast.error("Sign in to save videos");
      return;
    }
    if (updateRecord.enabled === false) {
      toast.error("Update isn't enabled", {
        description: "Turn on Actions → Update Record in Softr Studio.",
      });
      return;
    }
    // Apply optimistic state IMMEDIATELY so the heart flips on click.
    const current = linkObjects(video?.fields?.userSwipes);
    const ids = current.map((u) => u.id);
    const isSaved = ids.includes(currentUserId);
    const nextObjs = isSaved
      ? current.filter((u) => u.id !== currentUserId)
      : [...current, { id: currentUserId, label: "" }];

    setOptimistic((prev) => {
      const n = new Map(prev);
      const entry = n.get(video.id) || {};
      n.set(video.id, { ...entry, userSwipes: nextObjs });
      return n;
    });
    setSavingIds((prev) => {
      const n = new Set(prev);
      n.add(video.id);
      return n;
    });
    try {
      await updateRecord.mutateAsync({
        recordId: video.id,
        fields: { userSwipes: nextObjs.map((u) => ({ id: u.id })) },
      });
      toast.success(isSaved ? "Removed from saved" : "Video saved");
      await refetch?.();
    } catch (err) {
      console.error("[Save toggle] failed:", err);
      toast.error("Couldn't update", { description: err?.message || "Try again." });
    } finally {
      clearOptimisticKey(video.id, "userSwipes");
      setSavingIds((prev) => {
        const n = new Set(prev);
        n.delete(video.id);
        return n;
      });
    }
  };

  // Board assignment lives in the /assign-board modal page now —
  // no handler needed here.

  // Filter state
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    industry:    [],
    brand:       [],
    format:      [],  // selected format labels (e.g. "ASMR")
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
        const label = selectLabel(r?.fields?.[key]);
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
    // Format options pair each linked-format label with its emoji.
    // `emoji` (ZAgA5) is a LOOKUP that returns emojis in the same order
    // as `format` (tnMBF) on each video, so we zip the two arrays.
    const collectFormatWithEmoji = () => {
      const map = new Map(); // label -> emoji
      for (const r of formatScoped) {
        const fmts = linkObjects(r?.fields?.format);
        const emojis = Array.isArray(r?.fields?.emoji) ? r.fields.emoji : [];
        fmts.forEach((fmt, i) => {
          if (!fmt.label || map.has(fmt.label)) return;
          const em = emojis[i];
          map.set(fmt.label, typeof em === "string" ? em : "");
        });
      }
      return Array.from(map.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([label, emoji]) => ({ label, emoji }));
    };
    return {
      industry:    collectSelect("industry"),
      brand:       collectSelect("brand"),
      format:      collectFormatWithEmoji(),
      funnelStage: collectMultiOrLookup("funnelStage"),
      hookType:    collectMultiOrLookup("hookType"),
      hookTactic:  collectMultiOrLookup("hookTactic"),
    };
  }, [formatScoped]);

  // Apply user filters + search on top of the format-scoped set.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = formatScoped.filter((r) => {
      const f = r?.fields || {};
      const industryLabel = selectLabel(f.industry);
      const brandLabel = selectLabel(f.brand);
      const visualFormatLabel = selectLabel(f.visualFormat);

      if (filters.industry.length && !filters.industry.includes(industryLabel)) return false;
      if (filters.brand.length && !filters.brand.includes(brandLabel)) return false;

      if (filters.format.length) {
        const labels = linkObjects(f.format).map((x) => x.label).filter(Boolean);
        if (!filters.format.some((sel) => labels.includes(sel))) return false;
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
        const hay = [f.name, brandLabel, industryLabel, visualFormatLabel, f.influencerCeleb]
          .filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    return result;
  }, [formatScoped, filters, search]);

  const anyFilterActive =
    filters.industry.length ||
    filters.brand.length ||
    filters.format.length ||
    filters.funnelStage.length ||
    filters.hookType.length ||
    filters.hookTactic.length ||
    search.trim();

  function clearAll() {
    setFilters({
      industry: [], brand: [], format: [],
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
                icon={BadgeCheck}
                options={options.brand}
                selected={filters.brand}
                onChange={(v) => setFilters((p) => ({ ...p, brand: v }))}
              />
              <FilterPill
                label="Format"
                icon={Sparkles}
                options={options.format}
                selected={filters.format}
                onChange={(v) => setFilters((p) => ({ ...p, format: v }))}
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
                  rec={mergeOptimistic(rec)}
                  currentUserId={currentUserId}
                  isSaving={savingIds.has(rec.id)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
