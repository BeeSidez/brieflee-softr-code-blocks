// =====================================================================
// /app/video-workspace — Brieflee video workspace (Grammarly-style).
//
// One video, one stored analysis, surfaced through a grouped agent rail.
// Powers BOTH:
//   • Quick check  — standalone "drop a video, get it scored" (no brief)
//   • Campaign     — a creator submission reviewed against a brief
// The only difference is which review_report rows exist; this renderer
// is identical for both.
//
// HOW THE DATA WORKS (no per-agent API calls):
//   The n8n Vertex/Gemini flow analyses the whole video in ONE call and
//   writes one row per agent into `review_report`. This block just reads
//   those rows back and groups them. Clicking an agent costs nothing.
//
// SOFTR UI SETUP (two sources in one Vibe block):
//   Page: /video-workspace  (opened with ?recordId=<reviewId>)
//   Source 1 — reviews:        find record by URL recordId  (the video + overall)
//   Source 2 — review_report:  filter where `review` contains URL recordId
//                              (the agent rows for the rail)
// =====================================================================

import { useState, useMemo, useRef } from "react";
import { useRecord, useRecords, useCurrentRecordId, q } from "@/lib/datasource";
import {
  Check, ChevronDown, Star, Play, Clock, RefreshCw,
  Zap, ClipboardCheck, Camera, ShieldCheck, Sparkles,
} from "lucide-react";

// ─── Brand palette (matches review-details) ──────────────────
const NAVY        = "#000F4D";
const NAVY_DEEP   = "#001364";
const PERIWINKLE  = "#879CF7";
const PERIWINKLE_HOVER = "#294FF6";
const MUTED       = "#6B7A99";
const SOFT_MUTED  = "#9aa6c3";
const BORDER      = "rgba(217, 224, 255, 0.55)";
const TAG_BG      = "rgba(135, 156, 247, 0.10)";
const TINT_BG     = "rgba(135, 156, 247, 0.08)";
const SURFACE     = "#FAFBFF";
const PASS_GREEN  = "#2DAA63";
const FAIL_RED    = "#d92626";
const FLAG_AMBER  = "#B26B00";
const BRIEFLEE_WORDMARK = "https://res.cloudinary.com/dchroynzv/image/upload/v1777623054/brieflee_logo_logo-pack-2025-vector-blue-v3_2025-03.svg";

// ─── reviews table — the video + the overall verdict ──────────
const reviewSelect = q.select({
  name:               "Odw6q", // FORMULA — title
  display_url:        "kIbht",
  embed_code:         "E1mnP", // FORMULA → iframe HTML (we pull the src)
  thumbnail:          "4rkuC",
  video_file:         "pjCcn", // LOOKUP attachment from the submission
  overall_rating:     "uRkEe", // RATING 1–5
  overall_comment:    "Zqqx4",
  decision_reasoning: "yp7ca",
  recommended_action: "j6SpS",
  transcript:         "5kQxm",
  brief_name:         "N9aaM", // LOOKUP — empty for Quick check
  accounts:           "c6csA", // LINKED_RECORD → accounts (.label)
  submission_type:    "zC4Z3",
  duration:           "9Hshm",
});

// ─── review_report table — one row per agent ──────────────────
const reportSelect = q.select({
  threshold:            "E004U", // agent name
  score:                "iy2K3",
  threshold_value:      "Q5UCr", // value with unit
  rating:               "uRkEe",
  severity:             "oO0ev", // SELECT
  status:               "TxU8J", // SELECT: PASS/FAIL/FLAGGED/…
  comment:              "3Pr6i",
  screenshot_url:       "syqU5",
  key_moment_timestamp: "BEfco", // SELECT — integer seconds
});

// ─── Agent groups — classify each report row by its name ──────
// Priority order matters: first group whose keyword matches wins.
const GROUPS = [
  { id: "compliance", name: "Compliance & safety",  icon: ShieldCheck,    keywords: ["copyright", "moderation", "safe zone", "safety"] },
  { id: "hook",       name: "Hook & attention",     icon: Zap,            keywords: ["hook", "attention", "pacing", "scene", "mute", "watchable", "cta", "engagement"] },
  { id: "brand",      name: "Brand & brief",        icon: ClipboardCheck, keywords: ["brief", "brand", "mention", "inspiration", "product", "screen time", "face", "creator visib", "usage"] },
  { id: "production", name: "Production quality",    icon: Camera,         keywords: ["light", "camera", "setting", "background", "audio", "sound", "music", "pronunc", "legib", "caption", "distract", "energy", "authentic", "wardrobe", "appearance"] },
  { id: "other",      name: "Other checks",         icon: Sparkles,       keywords: [] },
];

function classifyGroup(thresholdName) {
  const n = String(thresholdName || "").toLowerCase();
  for (const g of GROUPS) {
    if (g.keywords.some((k) => n.includes(k))) return g.id;
  }
  return "other";
}

// ─── Helpers ──────────────────────────────────────────────────
function unwrap(raw) {
  if (raw == null) return "";
  if (typeof raw === "string") return raw.trim();
  if (Array.isArray(raw)) return raw.map(unwrap).filter(Boolean).join(", ");
  if (typeof raw === "object") return raw.label || raw.value || raw.name || "";
  return String(raw);
}
function selectLabel(raw) {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return raw.map(selectLabel).filter(Boolean).join(", ");
  return raw.label || "";
}
function asArray(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw == null) return [];
  return [raw];
}
function extractThumbUrl(raw) {
  if (!raw) return null;
  if (typeof raw === "string") return raw;
  const first = Array.isArray(raw) ? raw[0] : raw;
  if (!first) return null;
  if (typeof first === "string") return first;
  return first.thumbnailUrl || first.url || null;
}
function extractIframeSrc(html) {
  if (!html || typeof html !== "string") return "";
  const m = html.match(/src=['"]([^'"]+)['"]/i);
  return m ? m[1] : "";
}
// Map the six status labels onto three visual tones.
function toneOf(statusLabel) {
  const s = String(statusLabel || "").toUpperCase();
  if (s === "PASS" || s === "ALIGNED" || s === "APPROVED") return "pass";
  if (s === "FAIL" || s === "MISALIGNED" || s === "REJECTED") return "fail";
  return "flag"; // FLAGGED, NEEDS ADJUSTMENT, anything else
}
function formatTime(sec) {
  const s = Number(sec);
  if (!Number.isFinite(s) || s < 0) return null;
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
}

// =====================================================================
// MAIN BLOCK
// =====================================================================
export default function Block() {
  const reviewId = useCurrentRecordId() || "";
  const { data: review } = useRecord({ recordId: reviewId, select: reviewSelect });
  const { data: reportData, status: reportStatus, refetch } =
    useRecords({ select: reportSelect, count: 60 });

  const f = review?.fields || {};
  const videoRef = useRef(null);

  // Resolve a playable URL (same order as review-details).
  const videoUrl =
    (typeof f.display_url === "string" && f.display_url.trim()) ||
    extractIframeSrc(f.embed_code) ||
    extractThumbUrl(f.video_file) ||
    "";
  const posterUrl = extractThumbUrl(f.thumbnail) || undefined;

  const title        = unwrap(f.name) || "Your video";
  const briefName    = unwrap(f.brief_name);
  const brandName    = asArray(f.accounts)[0]?.label || "";
  const duration     = unwrap(f.duration);
  const subType      = selectLabel(f.submission_type);
  const rating       = Number(f.overall_rating) || 0;
  const overall      = unwrap(f.overall_comment);
  const reasoning    = unwrap(f.decision_reasoning);
  const recommended  = unwrap(f.recommended_action);

  // Build agent rows from review_report.
  const agents = useMemo(() => {
    const rows = Array.isArray(reportData) ? reportData : [];
    return rows.map((r, i) => {
      const a = r?.fields || {};
      const name = unwrap(a.threshold);
      const ts = selectLabel(a.key_moment_timestamp);
      return {
        id: r.id || `a${i}`,
        name,
        group: classifyGroup(name),
        tone: toneOf(selectLabel(a.status)),
        statusLabel: selectLabel(a.status),
        value: unwrap(a.threshold_value) || unwrap(a.score),
        comment: unwrap(a.comment),
        severity: selectLabel(a.severity),
        timestamp: ts ? Number(ts) : null,
      };
    }).filter((a) => a.name);
  }, [reportData]);

  const passCount = agents.filter((a) => a.tone === "pass").length;
  const failCount = agents.filter((a) => a.tone === "fail").length;
  const flagCount = agents.filter((a) => a.tone === "flag").length;

  // Group the agents, preserving GROUPS order, dropping empty groups.
  const grouped = useMemo(() => {
    return GROUPS.map((g) => ({
      ...g,
      rows: agents.filter((a) => a.group === g.id),
    })).filter((g) => g.rows.length > 0);
  }, [agents]);

  // Overall verdict — use stored reasoning, fall back to counts.
  const verdict =
    failCount > 0 ? { label: "Flagged", tone: "fail" }
    : flagCount > 0 ? { label: "Needs a look", tone: "flag" }
    : agents.length > 0 ? { label: "Approved", tone: "pass" }
    : null;

  const seekTo = (seconds) => {
    const v = videoRef.current;
    if (!v || seconds == null) return;
    try { v.currentTime = seconds; v.play?.(); } catch (e) { /* external embed */ }
  };

  const isLoading = reportStatus === "loading" || reportStatus === "idle";
  const isProcessing = !isLoading && agents.length === 0;

  return (
    <>
      <Style />
      <div className="bl-vw">
        <div className="bl-vw-inner">

          {/* ── Left: video + overall verdict ── */}
          <aside className="bl-vw-left">
            <div className="bl-vw-video">
              {videoUrl ? (
                <video ref={videoRef} src={videoUrl} controls preload="metadata" poster={posterUrl} />
              ) : (
                <div className="bl-vw-video-empty">No video attached</div>
              )}
            </div>

            <div className="bl-vw-tags">
              {subType && <span className="bl-vw-tag is-primary">{subType}</span>}
              {brandName && <span className="bl-vw-tag">{brandName}</span>}
              {duration && <span className="bl-vw-tag"><Clock size={11} /> {duration}</span>}
            </div>

            <h1 className="bl-vw-title">{title}</h1>
            {briefName && <p className="bl-vw-brief">Against the brief: <strong>{briefName}</strong></p>}

            {(verdict || rating > 0) && (
              <div className="bl-vw-verdict">
                {verdict && <span className={`bl-vw-badge is-${verdict.tone}`}>{verdict.label}</span>}
                {rating > 0 && (
                  <span className="bl-vw-stars" aria-label={`Rated ${rating} of 5`}>
                    {[1,2,3,4,5].map((n) => (
                      <Star key={n} size={15}
                        fill={n <= rating ? PERIWINKLE : "transparent"}
                        strokeWidth={n <= rating ? 0 : 1.5}
                        color={n <= rating ? PERIWINKLE : SOFT_MUTED} />
                    ))}
                  </span>
                )}
              </div>
            )}

            {agents.length > 0 && (
              <div className="bl-vw-counts">
                {passCount > 0 && <span className="bl-vw-count is-pass"><Check size={11} strokeWidth={3} /> {passCount} passed</span>}
                {flagCount > 0 && <span className="bl-vw-count is-flag">{flagCount} to review</span>}
                {failCount > 0 && <span className="bl-vw-count is-fail">{failCount} flagged</span>}
              </div>
            )}

            {overall && (
              <div className="bl-vw-summary">
                <p>{overall}</p>
                {recommended && <p className="bl-vw-rec"><strong>What to try:</strong> {recommended}</p>}
              </div>
            )}
          </aside>

          {/* ── Right: the agent rail ── */}
          <section className="bl-vw-rail">
            <div className="bl-vw-rail-head">
              <h2 className="bl-vw-rail-title">Review agents</h2>
              <span className="bl-vw-rail-cap"><Zap size={12} /> one analysis · pulled from saved</span>
            </div>

            {isLoading && <RailSkeleton />}

            {isProcessing && (
              <div className="bl-vw-processing">
                <div className="bl-vw-spinner" />
                <p className="bl-vw-proc-title">Watching your video</p>
                <p className="bl-vw-proc-sub">Your agents are scoring every second. This usually takes under a minute.</p>
                <button type="button" className="bl-vw-refresh" onClick={() => refetch?.()}>
                  <RefreshCw size={13} /> Check for results
                </button>
              </div>
            )}

            {!isLoading && !isProcessing && grouped.map((g, i) => (
              <AgentGroup key={g.id} group={g} defaultOpen={i === 0} onJump={seekTo} />
            ))}
          </section>

        </div>

        <footer className="bl-vw-footer">
          <span>Powered by</span>
          <img src={BRIEFLEE_WORDMARK} alt="Brieflee" />
        </footer>
      </div>
    </>
  );
}

// =====================================================================
// Subcomponents
// =====================================================================
function AgentGroup({ group, defaultOpen, onJump }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const Icon = group.icon;
  const pass = group.rows.filter((r) => r.tone === "pass").length;
  const other = group.rows.length - pass;
  return (
    <div className="bl-vw-group">
      <button type="button" className="bl-vw-group-head" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="bl-vw-group-icon"><Icon size={15} /></span>
        <span className="bl-vw-group-name">{group.name}</span>
        <span className="bl-vw-group-count">{pass} pass{other > 0 ? ` · ${other} flag` : ""}</span>
        <ChevronDown size={15} className="bl-vw-chev" style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }} />
      </button>
      {open && (
        <div className="bl-vw-group-body">
          {group.rows.map((r) => <AgentRow key={r.id} row={r} onJump={onJump} />)}
        </div>
      )}
    </div>
  );
}

function AgentRow({ row, onJump }) {
  const [open, setOpen] = useState(false);
  const time = formatTime(row.timestamp);
  return (
    <div className={`bl-vw-agent is-${row.tone}`}>
      <button type="button" className="bl-vw-agent-head" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className={`bl-vw-dot is-${row.tone}`} />
        <span className="bl-vw-agent-name">{row.name}</span>
        {row.value && <span className="bl-vw-agent-val">{row.value}</span>}
        <ChevronDown size={13} className="bl-vw-chev" style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }} />
      </button>
      {open && (
        <div className="bl-vw-agent-body">
          {row.comment && <p className="bl-vw-agent-comment">{row.comment}</p>}
          <div className="bl-vw-agent-foot">
            <span className={`bl-vw-status is-${row.tone}`}>{row.statusLabel}</span>
            {time && (
              <button type="button" className="bl-vw-jump" onClick={() => onJump(row.timestamp)}>
                <Play size={11} /> Jump to {time}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RailSkeleton() {
  return (
    <div className="bl-vw-skel">
      {[1,2,3,4].map((n) => <div key={n} className="bl-vw-skel-row" />)}
    </div>
  );
}

// =====================================================================
// Style
// =====================================================================
function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;500;600;700&display=swap');
      .bl-vw, .bl-vw * { font-family: 'League Spartan', sans-serif; box-sizing: border-box; }
      .bl-vw { background: ${SURFACE}; min-height: 100vh; padding: 24px 0 40px; }
      .bl-vw-inner {
        max-width: 1100px; margin: 0 auto; width: 100%; padding: 0 16px;
        display: grid; grid-template-columns: minmax(300px, 380px) 1fr; gap: 22px;
        align-items: start;
      }

      /* Left column */
      .bl-vw-left { position: sticky; top: 20px; display: flex; flex-direction: column; gap: 12px; }
      .bl-vw-video {
        position: relative; background: #000; border-radius: 16px; overflow: hidden;
        aspect-ratio: 9 / 16; max-height: 520px; border: 1px solid ${BORDER};
      }
      .bl-vw-video video { width: 100%; height: 100%; object-fit: cover; display: block; background: #000; }
      .bl-vw-video-empty {
        position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
        color: ${SOFT_MUTED}; font-size: 12px;
      }
      .bl-vw-tags { display: flex; flex-wrap: wrap; gap: 6px; }
      .bl-vw-tag {
        display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px;
        background: ${TAG_BG}; color: ${NAVY_DEEP}; border-radius: 999px;
        font-size: 10px; font-weight: 500; letter-spacing: 0.03em;
      }
      .bl-vw-tag.is-primary { background: ${PERIWINKLE}; color: #FFFFFF; }
      .bl-vw-title { font-size: 22px; font-weight: 600; color: ${NAVY_DEEP}; margin: 0; line-height: 1.15; letter-spacing: -0.015em; }
      .bl-vw-brief { margin: 0; font-size: 12px; color: ${MUTED}; }
      .bl-vw-brief strong { color: ${NAVY_DEEP}; font-weight: 600; }

      .bl-vw-verdict { display: flex; align-items: center; gap: 10px; margin-top: 2px; }
      .bl-vw-badge { font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 999px; }
      .bl-vw-badge.is-pass { background: rgba(45,170,99,0.12); color: ${PASS_GREEN}; }
      .bl-vw-badge.is-fail { background: rgba(217,38,38,0.10); color: ${FAIL_RED}; }
      .bl-vw-badge.is-flag { background: rgba(178,107,0,0.12); color: ${FLAG_AMBER}; }
      .bl-vw-stars { display: inline-flex; align-items: center; gap: 2px; }

      .bl-vw-counts { display: flex; flex-wrap: wrap; gap: 6px; }
      .bl-vw-count { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 999px; }
      .bl-vw-count.is-pass { background: rgba(45,170,99,0.12); color: ${PASS_GREEN}; }
      .bl-vw-count.is-flag { background: rgba(178,107,0,0.12); color: ${FLAG_AMBER}; }
      .bl-vw-count.is-fail { background: rgba(217,38,38,0.10); color: ${FAIL_RED}; }

      .bl-vw-summary {
        background: #FFFFFF; border: 1px solid ${BORDER}; border-radius: 12px;
        padding: 14px; font-size: 13px; line-height: 1.55; color: ${NAVY_DEEP};
      }
      .bl-vw-summary p { margin: 0 0 8px; }
      .bl-vw-summary p:last-child { margin-bottom: 0; }
      .bl-vw-rec { color: ${MUTED}; }
      .bl-vw-rec strong { color: ${NAVY_DEEP}; font-weight: 600; }

      /* Rail */
      .bl-vw-rail { display: flex; flex-direction: column; gap: 8px; }
      .bl-vw-rail-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px; }
      .bl-vw-rail-title { font-size: 16px; font-weight: 600; color: ${NAVY_DEEP}; margin: 0; }
      .bl-vw-rail-cap { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; color: ${SOFT_MUTED}; }

      .bl-vw-group { border: 1px solid ${BORDER}; border-radius: 12px; overflow: hidden; background: #FFFFFF; }
      .bl-vw-group-head {
        display: flex; align-items: center; gap: 9px; width: 100%; padding: 12px 14px;
        background: ${TINT_BG}; border: none; cursor: pointer; text-align: left;
      }
      .bl-vw-group-icon {
        width: 26px; height: 26px; border-radius: 8px; flex-shrink: 0;
        display: inline-flex; align-items: center; justify-content: center;
        background: #FFFFFF; color: ${PERIWINKLE_HOVER}; border: 1px solid ${BORDER};
      }
      .bl-vw-group-name { flex: 1 1 auto; font-size: 13.5px; font-weight: 600; color: ${NAVY_DEEP}; }
      .bl-vw-group-count { font-size: 11px; color: ${MUTED}; white-space: nowrap; }
      .bl-vw-chev { color: ${MUTED}; transition: transform 0.15s; flex-shrink: 0; }

      .bl-vw-group-body { padding: 4px; }
      .bl-vw-agent { border-radius: 9px; }
      .bl-vw-agent + .bl-vw-agent { margin-top: 2px; }
      .bl-vw-agent-head {
        display: flex; align-items: center; gap: 9px; width: 100%; padding: 9px 10px;
        background: transparent; border: none; cursor: pointer; text-align: left; border-radius: 9px;
      }
      .bl-vw-agent-head:hover { background: ${SURFACE}; }
      .bl-vw-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
      .bl-vw-dot.is-pass { background: ${PASS_GREEN}; }
      .bl-vw-dot.is-fail { background: ${FAIL_RED}; }
      .bl-vw-dot.is-flag { background: ${FLAG_AMBER}; }
      .bl-vw-agent-name { flex: 1 1 auto; font-size: 13px; color: ${NAVY_DEEP}; }
      .bl-vw-agent-val { font-size: 12px; color: ${MUTED}; }
      .bl-vw-agent-body { padding: 0 10px 10px 27px; }
      .bl-vw-agent-comment { margin: 0 0 8px; font-size: 12.5px; line-height: 1.5; color: ${MUTED}; }
      .bl-vw-agent-foot { display: flex; align-items: center; gap: 10px; }
      .bl-vw-status { font-size: 10px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
      .bl-vw-status.is-pass { color: ${PASS_GREEN}; }
      .bl-vw-status.is-fail { color: ${FAIL_RED}; }
      .bl-vw-status.is-flag { color: ${FLAG_AMBER}; }
      .bl-vw-jump {
        display: inline-flex; align-items: center; gap: 5px; font-size: 11px; color: ${PERIWINKLE_HOVER};
        background: ${TAG_BG}; border: none; padding: 4px 9px; border-radius: 999px; cursor: pointer;
      }
      .bl-vw-jump:hover { background: rgba(135,156,247,0.20); }

      /* Processing / skeleton */
      .bl-vw-processing {
        text-align: center; padding: 36px 20px; background: #FFFFFF;
        border: 1px solid ${BORDER}; border-radius: 12px;
      }
      .bl-vw-spinner {
        width: 30px; height: 30px; margin: 0 auto 14px; border-radius: 50%;
        border: 3px solid ${TAG_BG}; border-top-color: ${PERIWINKLE}; animation: bl-spin 0.8s linear infinite;
      }
      @keyframes bl-spin { to { transform: rotate(360deg); } }
      .bl-vw-proc-title { margin: 0 0 4px; font-size: 14px; font-weight: 600; color: ${NAVY_DEEP}; }
      .bl-vw-proc-sub { margin: 0 0 14px; font-size: 12px; color: ${MUTED}; }
      .bl-vw-refresh {
        display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 14px;
        background: ${PERIWINKLE}; color: #FFFFFF; border: none; border-radius: 8px;
        font-size: 12px; font-weight: 600; cursor: pointer;
      }
      .bl-vw-refresh:hover { background: ${PERIWINKLE_HOVER}; }
      .bl-vw-skel { display: flex; flex-direction: column; gap: 8px; }
      .bl-vw-skel-row { height: 50px; border-radius: 12px; background: linear-gradient(90deg, ${TINT_BG}, ${TAG_BG}, ${TINT_BG}); background-size: 200% 100%; animation: bl-shim 1.2s ease-in-out infinite; }
      @keyframes bl-shim { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

      .bl-vw-footer { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 22px; font-size: 11px; color: ${MUTED}; }
      .bl-vw-footer img { height: 16px; width: auto; }

      @media (max-width: 860px) {
        .bl-vw-inner { grid-template-columns: 1fr; }
        .bl-vw-left { position: static; max-width: 380px; margin: 0 auto; width: 100%; }
      }
    `}</style>
  );
}
