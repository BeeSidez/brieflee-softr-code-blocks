// =====================================================================
// /submissions/details — AGENTS RAIL  (source 2: review_report)
//
// The right half of the Video Review Workspace. Reads ONE source only —
// the `review_report` table (one row per agent) — so it's simple to bind
// and maintain. It derives the 0–100 score, the verdict and the checks
// count from those rows, then groups them into a collapsible checklist.
//
// Jump-to-moment seeks the sibling VIDEO PANEL block by DOM id
// (#bl-review-video), exactly how the design's own script does it. No
// per-agent API calls: the n8n Vertex/Gemini flow writes every row in one
// pass; this block just reads them back.
//
// SOFTR UI SETUP:
//   Page: /submissions/details  (opened with ?recordId=<reviewId>)
//   Source → review_report, filter where `review` contains URL recordId.
// =====================================================================

import { useState, useMemo } from "react";
import { useRecords, q } from "@/lib/datasource";
import {
  Check, ChevronDown, Play, RefreshCw,
  Zap, ClipboardCheck, Camera, ShieldCheck, Sparkles,
} from "lucide-react";

// ─── Brand palette ───────────────────────────────────────────
const NAVY        = "#000F4D";
const NAVY_DEEP   = "#001364";
const PERIWINKLE  = "#879CF7";
const PERIWINKLE_HOVER = "#294FF6";
const MUTED       = "#6B7A99";
const SOFT_MUTED  = "#9aa6c3";
const BORDER      = "rgba(217, 224, 255, 0.8)";
const BORDER_SOFT = "rgba(217, 224, 255, 0.55)";
const TAG_BG      = "rgba(135, 156, 247, 0.12)";
const TINT_BG     = "rgba(135, 156, 247, 0.05)";
const PASS_GREEN  = "#2DAA63";
const FAIL_RED    = "#d92626";
const FLAG_AMBER  = "#B26B00";
const BRIEFLEE_WORDMARK = "https://res.cloudinary.com/dchroynzv/image/upload/v1777623054/brieflee_logo_logo-pack-2025-vector-blue-v3_2025-03.svg";

// ─── review_report table — one row per agent ──────────────────
const reportSelect = q.select({
  threshold:            "E004U", // agent name
  score:                "iy2K3",
  threshold_value:      "Q5UCr", // value with unit
  status:               "TxU8J", // SELECT: PASS/FAIL/FLAGGED/…
  comment:              "3Pr6i",
  key_moment_timestamp: "BEfco", // SELECT — integer seconds
});

// ─── Agent groups — classify each report row by its name ──────
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
function numericScore(raw) {
  const m = String(raw ?? "").match(/-?\d+(\.\d+)?/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : null;
}

// Seek the sibling VIDEO PANEL block by DOM id.
function seekReviewVideo(seconds) {
  if (seconds == null || typeof document === "undefined") return;
  const v = document.getElementById("bl-review-video");
  if (!v || typeof v.play !== "function") return;
  try { v.currentTime = seconds; v.play(); v.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) { /* external embed */ }
}

// =====================================================================
// MAIN BLOCK
// =====================================================================
export default function Block() {
  const { data: reportData, status: reportStatus, refetch } =
    useRecords({ select: reportSelect, count: 60 });

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
        num: numericScore(a.score),
        comment: unwrap(a.comment),
        timestamp: ts ? Number(ts) : null,
      };
    }).filter((a) => a.name);
  }, [reportData]);

  const passCount = agents.filter((a) => a.tone === "pass").length;
  const failCount = agents.filter((a) => a.tone === "fail").length;
  const flagCount = agents.filter((a) => a.tone === "flag").length;

  const grouped = useMemo(() => {
    return GROUPS.map((g) => ({
      ...g,
      rows: agents.filter((a) => a.group === g.id),
    })).filter((g) => g.rows.length > 0);
  }, [agents]);

  const overallScore = useMemo(() => {
    const nums = agents.map((a) => a.num).filter((n) => n != null);
    if (!nums.length) return null;
    return Math.round(nums.reduce((s, n) => s + n, 0) / nums.length);
  }, [agents]);

  const verdict =
    failCount > 0 ? { label: "Flagged", head: "Needs changes", tone: "fail" }
    : flagCount > 0 ? { label: "Needs a look", head: "Almost there", tone: "flag" }
    : agents.length > 0 ? { label: "Approved", head: "Brief-ready", tone: "pass" }
    : null;

  const isLoading = reportStatus === "loading" || reportStatus === "idle";
  const isProcessing = !isLoading && agents.length === 0;

  const scorePct = overallScore == null ? 0 : Math.max(0, Math.min(100, overallScore));
  const ringStyle = {
    background: `conic-gradient(${PERIWINKLE_HOVER} 0%, ${PERIWINKLE} ${scorePct}%, #E7EAF7 ${scorePct}% 100%)`,
  };

  return (
    <>
      <Style />
      <div className="bl-ar">
        <div className="bl-ar-card">

          {/* Scoreboard band */}
          {(overallScore != null || verdict) && (
            <div className="bl-ar-band">
              {overallScore != null && (
                <div className="bl-ar-ring" style={ringStyle}>
                  <div className="bl-ar-ring-in">
                    <span className="bl-ar-ring-num">{overallScore}</span>
                    <span className="bl-ar-ring-den">/ 100</span>
                  </div>
                </div>
              )}
              <div className="bl-ar-band-meta">
                <div className="bl-ar-band-label">Video score</div>
                {verdict && <div className="bl-ar-band-head">{verdict.head}</div>}
                <div className="bl-ar-band-row">
                  {verdict && (
                    <span className={`bl-ar-pill is-${verdict.tone}`}>
                      {verdict.tone === "pass" && <Check size={12} strokeWidth={3} />}
                      {verdict.label}
                    </span>
                  )}
                  {agents.length > 0 && (
                    <span className="bl-ar-checks">{passCount} of {agents.length} checks passed</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="bl-ar-head">
            <span className="bl-ar-title">Review agents</span>
            <button type="button" className="bl-ar-rerun" onClick={() => refetch?.()}>
              <RefreshCw size={13} /> {isProcessing ? "Check for results" : "Re-run"}
            </button>
          </div>

          <div className="bl-ar-list">
            {isLoading && <RailSkeleton />}

            {isProcessing && (
              <div className="bl-ar-processing">
                <div className="bl-ar-spinner" />
                <p className="bl-ar-proc-title">Watching your video</p>
                <p className="bl-ar-proc-sub">Your agents are scoring every second. This usually takes under a minute.</p>
                <button type="button" className="bl-ar-refresh" onClick={() => refetch?.()}>
                  <RefreshCw size={13} /> Check for results
                </button>
              </div>
            )}

            {!isLoading && !isProcessing && grouped.map((g, i) => (
              <AgentGroup key={g.id} group={g} defaultOpen={i === 0} />
            ))}
          </div>

          <footer className="bl-ar-footer">
            <span>Powered by</span>
            <img src={BRIEFLEE_WORDMARK} alt="Brieflee" />
          </footer>
        </div>
      </div>
    </>
  );
}

// =====================================================================
// Subcomponents
// =====================================================================
function AgentGroup({ group, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const Icon = group.icon;
  const pass = group.rows.filter((r) => r.tone === "pass").length;
  const other = group.rows.length - pass;
  return (
    <div className="bl-ar-group">
      <button type="button" className="bl-ar-group-head" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="bl-ar-group-icon"><Icon size={15} /></span>
        <span className="bl-ar-group-name">{group.name}</span>
        <span className="bl-ar-group-count">{pass} pass{other > 0 ? ` · ${other} flag` : ""}</span>
        <ChevronDown size={15} className="bl-ar-chev" style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }} />
      </button>
      {open && (
        <div className="bl-ar-group-body">
          {group.rows.map((r) => <AgentRow key={r.id} row={r} />)}
        </div>
      )}
    </div>
  );
}

function AgentRow({ row }) {
  const time = formatTime(row.timestamp);
  return (
    <div className={`bl-ar-agent is-${row.tone}`}>
      <div className="bl-ar-agent-top">
        <span className="bl-ar-agent-name">{row.name}</span>
        <span className={`bl-ar-agent-score is-${row.tone}`}>
          <span className={`bl-ar-dot is-${row.tone}`} />
          {row.value || row.statusLabel}
        </span>
      </div>
      {row.comment && <p className="bl-ar-agent-comment">{row.comment}</p>}
      {time && (
        <button type="button" className="bl-ar-jump" onClick={() => seekReviewVideo(row.timestamp)}>
          <Play size={10} /> Jump to {time}
        </button>
      )}
    </div>
  );
}

function RailSkeleton() {
  return (
    <div className="bl-ar-skel">
      {[1,2,3,4].map((n) => <div key={n} className="bl-ar-skel-row" />)}
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
      .bl-ar, .bl-ar * { font-family: 'League Spartan', sans-serif; box-sizing: border-box; }
      .bl-ar {
        padding: 24px 16px; color: ${NAVY};
        background: radial-gradient(120% 80% at 50% -10%, #F4F2FF 0%, #EBEEFA 60%);
      }
      .bl-ar-card {
        max-width: 560px; margin: 0 auto; background: #FFFFFF;
        border: 1px solid ${BORDER}; border-radius: 24px; overflow: hidden;
        box-shadow: 0 40px 90px -50px rgba(0,15,77,0.45);
      }

      /* Scoreboard band */
      .bl-ar-band {
        display: flex; flex-wrap: wrap; align-items: center; gap: 20px;
        padding: 22px 24px; border-bottom: 1px solid ${BORDER_SOFT}; background: ${TINT_BG};
      }
      .bl-ar-ring { position: relative; width: 78px; height: 78px; flex: 0 0 auto; border-radius: 50%; }
      .bl-ar-ring-in {
        position: absolute; inset: 8px; border-radius: 50%; background: #fff;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
      }
      .bl-ar-ring-num { font-size: 23px; font-weight: 700; color: ${NAVY_DEEP}; line-height: 1; }
      .bl-ar-ring-den { font-size: 9.5px; font-weight: 500; color: ${SOFT_MUTED}; }
      .bl-ar-band-meta { min-width: 0; }
      .bl-ar-band-label { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: ${SOFT_MUTED}; }
      .bl-ar-band-head { margin: 3px 0 8px; font-size: 18px; font-weight: 700; color: ${NAVY_DEEP}; letter-spacing: -0.01em; }
      .bl-ar-band-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
      .bl-ar-pill { display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 9px; border-radius: 999px; font-size: 11px; font-weight: 600; }
      .bl-ar-pill.is-pass { background: rgba(45,170,99,0.12); color: ${PASS_GREEN}; }
      .bl-ar-pill.is-flag { background: rgba(178,107,0,0.12); color: ${FLAG_AMBER}; }
      .bl-ar-pill.is-fail { background: rgba(217,38,38,0.10); color: ${FAIL_RED}; }
      .bl-ar-checks { font-size: 12px; color: ${MUTED}; }

      /* Header */
      .bl-ar-head {
        display: flex; align-items: center; justify-content: space-between; gap: 10px;
        padding: 16px 20px 10px;
      }
      .bl-ar-title { font-size: 15px; font-weight: 600; color: ${NAVY_DEEP}; }
      .bl-ar-rerun {
        display: inline-flex; align-items: center; gap: 7px; height: 30px; padding: 0 12px;
        border-radius: 9px; border: 1px solid ${BORDER}; background: #fff; color: ${NAVY_DEEP};
        font-family: inherit; font-size: 12px; font-weight: 500; cursor: pointer;
      }
      .bl-ar-rerun:hover { background: #F5F7FF; }

      .bl-ar-list { padding: 0 16px 8px; }

      .bl-ar-group { border: 1px solid ${BORDER_SOFT}; border-radius: 12px; overflow: hidden; margin-bottom: 8px; }
      .bl-ar-group-head {
        display: flex; align-items: center; gap: 9px; width: 100%; padding: 11px 12px;
        background: ${TINT_BG}; border: none; cursor: pointer; text-align: left;
      }
      .bl-ar-group-icon {
        width: 26px; height: 26px; border-radius: 8px; flex-shrink: 0;
        display: inline-flex; align-items: center; justify-content: center;
        background: ${TAG_BG}; color: ${PERIWINKLE_HOVER};
      }
      .bl-ar-group-name { flex: 1 1 auto; font-size: 13px; font-weight: 600; color: ${NAVY_DEEP}; }
      .bl-ar-group-count { font-size: 11px; color: ${MUTED}; white-space: nowrap; }
      .bl-ar-chev { color: ${MUTED}; transition: transform 0.15s; flex-shrink: 0; }

      .bl-ar-group-body { padding: 2px; }
      .bl-ar-agent { padding: 11px 10px; border-top: 1px solid ${BORDER_SOFT}; }
      .bl-ar-agent:first-child { border-top: none; }
      .bl-ar-agent-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
      .bl-ar-agent-name { font-size: 13px; font-weight: 600; color: ${NAVY_DEEP}; }
      .bl-ar-agent-score { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; white-space: nowrap; }
      .bl-ar-agent-score.is-pass { color: ${PASS_GREEN}; }
      .bl-ar-agent-score.is-flag { color: ${FLAG_AMBER}; }
      .bl-ar-agent-score.is-fail { color: ${FAIL_RED}; }
      .bl-ar-dot { width: 7px; height: 7px; border-radius: 50%; }
      .bl-ar-dot.is-pass { background: ${PASS_GREEN}; }
      .bl-ar-dot.is-flag { background: ${FLAG_AMBER}; }
      .bl-ar-dot.is-fail { background: ${FAIL_RED}; }
      .bl-ar-agent-comment { margin: 4px 0 0; font-size: 11.5px; line-height: 1.45; color: ${SOFT_MUTED}; font-weight: 300; }
      .bl-ar-jump {
        display: inline-flex; align-items: center; gap: 5px; margin-top: 8px;
        font-size: 11px; color: ${PERIWINKLE_HOVER}; background: ${TAG_BG};
        border: none; padding: 4px 9px; border-radius: 999px; cursor: pointer;
      }
      .bl-ar-jump:hover { background: rgba(135,156,247,0.22); }

      /* Processing / skeleton */
      .bl-ar-processing { text-align: center; padding: 36px 20px; }
      .bl-ar-spinner {
        width: 30px; height: 30px; margin: 0 auto 14px; border-radius: 50%;
        border: 3px solid ${TAG_BG}; border-top-color: ${PERIWINKLE}; animation: bl-spin 0.8s linear infinite;
      }
      @keyframes bl-spin { to { transform: rotate(360deg); } }
      .bl-ar-proc-title { margin: 0 0 4px; font-size: 14px; font-weight: 600; color: ${NAVY_DEEP}; }
      .bl-ar-proc-sub { margin: 0 0 14px; font-size: 12px; color: ${MUTED}; }
      .bl-ar-refresh {
        display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 14px;
        background: ${PERIWINKLE}; color: #fff; border: none; border-radius: 8px;
        font-size: 12px; font-weight: 600; cursor: pointer;
      }
      .bl-ar-refresh:hover { background: ${PERIWINKLE_HOVER}; }
      .bl-ar-skel { display: flex; flex-direction: column; gap: 8px; }
      .bl-ar-skel-row { height: 52px; border-radius: 12px; background: linear-gradient(90deg, ${TINT_BG}, ${TAG_BG}, ${TINT_BG}); background-size: 200% 100%; animation: bl-shim 1.2s ease-in-out infinite; }
      @keyframes bl-shim { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

      .bl-ar-footer {
        display: flex; align-items: center; justify-content: center; gap: 6px;
        padding: 14px; border-top: 1px solid ${BORDER_SOFT}; font-size: 11px; color: ${MUTED};
      }
      .bl-ar-footer img { height: 15px; width: auto; }
    `}</style>
  );
}
