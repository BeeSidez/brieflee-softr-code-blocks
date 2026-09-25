// =====================================================================
// /submissions/details — Video Review Workspace (design 1B).
//
// Faithful port of "Video Review Workspace.dc.html" direction 1B —
// "Grouped report · key moments · bar score". One card: video on the
// left, bar score + grouped agent report (with per-check thumbnails and
// jump-to-moment) on the right, Ask-Lee bar underneath.
//
// Reads two sources (both READS, no writes):
//   Page: /submissions/details  (opened with ?recordId=<reviewId>)
//   Source 1 — reviews:        find record by URL recordId
//   Source 2 — review_report:  filter where `review` contains URL recordId
//
// The n8n Vertex/Gemini flow writes one review_report row per agent in a
// single pass; this block reads them back, groups them, derives the score
// and verdict, and seeks the video to each check's moment. Ask-Lee is a
// visual affordance for now.
// =====================================================================

import { useState, useMemo, useRef } from "react";
import { useRecord, useRecords, useCurrentRecordId, q } from "@/lib/datasource";
import {
  Video, RefreshCw, Check, Clock, Play, ChevronDown, Star, Send, Lightbulb,
  Zap, ClipboardCheck, Camera, ShieldCheck, Sparkles,
} from "lucide-react";

// ─── Brand palette (matches the design) ──────────────────────
const NAVY       = "#000F4D";
const NAVY_DEEP  = "#001364";
const PERI       = "#879CF7";
const PERI_H     = "#294FF6";
const MUTED      = "#6B7A99";
const SOFT       = "#9aa6c3";
const GREEN      = "#2DAA63";
const RED        = "#d92626";
const AMBER      = "#B26B00";
const BORDER     = "rgba(217,224,255,0.7)";
const BORDER_STR = "rgba(217,224,255,0.9)";
const TAG        = "rgba(135,156,247,0.12)";
const TINT       = "rgba(135,156,247,0.06)";
const LEE_AVATAR = "https://res.cloudinary.com/dspv9nm1n/image/upload/v1771427670/obl2odsrkhunneswor46.png";
const WORDMARK   = "https://res.cloudinary.com/dchroynzv/image/upload/v1777623054/brieflee_logo_logo-pack-2025-vector-blue-v3_2025-03.svg";

// ─── reviews table ───────────────────────────────────────────
const reviewSelect = q.select({
  name:            "Odw6q",
  display_url:     "kIbht",
  embed_code:      "E1mnP",
  thumbnail:       "4rkuC",
  video_file:      "pjCcn",
  overall_rating:  "uRkEe",
  overall_comment: "Zqqx4",
  brief_name:      "N9aaM",
  accounts:        "c6csA",
  submission_type: "zC4Z3",
  duration:        "9Hshm",
});

// ─── review_report table — one row per agent ─────────────────
const reportSelect = q.select({
  threshold:            "E004U",
  score:                "iy2K3",
  threshold_value:      "Q5UCr",
  status:               "TxU8J",
  comment:              "3Pr6i",
  screenshot_url:       "syqU5",
  key_moment_timestamp: "BEfco",
});

// ─── Agent groups ────────────────────────────────────────────
const GROUPS = [
  { id: "hook",       name: "Hook & attention",  short: "Hook",       icon: Zap,            keywords: ["hook", "attention", "pacing", "scene", "mute", "watchable", "cta", "engagement"] },
  { id: "production", name: "Production quality", short: "Production", icon: Camera,         keywords: ["light", "camera", "setting", "background", "audio", "sound", "music", "pronunc", "legib", "caption", "distract", "energy", "authentic", "wardrobe", "appearance"] },
  { id: "brand",      name: "Brand & brief",     short: "Brand",      icon: ClipboardCheck, keywords: ["brief", "brand", "mention", "inspiration", "product", "screen time", "face", "creator visib", "usage"] },
  { id: "compliance", name: "Compliance & safety", short: "Compliance", icon: ShieldCheck,  keywords: ["copyright", "moderation", "safe zone", "safety"] },
  { id: "other",      name: "Other checks",      short: "Other",      icon: Sparkles,       keywords: [] },
];
function classifyGroup(name) {
  const n = String(name || "").toLowerCase();
  for (const g of GROUPS) if (g.keywords.some((k) => n.includes(k))) return g.id;
  return "other";
}

// ─── Helpers ─────────────────────────────────────────────────
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
function asArray(raw) { return Array.isArray(raw) ? raw : raw == null ? [] : [raw]; }
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
function toneOf(status) {
  const s = String(status || "").toUpperCase();
  if (s === "PASS" || s === "ALIGNED" || s === "APPROVED") return "pass";
  if (s === "FAIL" || s === "MISALIGNED" || s === "REJECTED") return "fail";
  return "flag";
}
function toneColor(t) { return t === "fail" ? RED : t === "flag" ? AMBER : GREEN; }
function formatTime(sec) {
  const s = Number(sec);
  if (!Number.isFinite(s) || s < 0) return null;
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}
function numericScore(raw) {
  const m = String(raw ?? "").match(/-?\d+(\.\d+)?/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : null;
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

  const videoUrl =
    (typeof f.display_url === "string" && f.display_url.trim()) ||
    extractIframeSrc(f.embed_code) ||
    extractThumbUrl(f.video_file) || "";
  const posterUrl = extractThumbUrl(f.thumbnail) || undefined;

  const title     = unwrap(f.name) || "Your video";
  const brandName = asArray(f.accounts)[0]?.label || unwrap(f.brief_name) || "";
  const duration  = unwrap(f.duration);
  const subType   = selectLabel(f.submission_type) || "Content review";
  const rating    = Number(f.overall_rating) || 0;
  const overall   = unwrap(f.overall_comment);

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
        screenshot: extractThumbUrl(a.screenshot_url),
        timestamp: ts ? Number(ts) : null,
      };
    }).filter((a) => a.name);
  }, [reportData]);

  const passCount = agents.filter((a) => a.tone === "pass").length;
  const failCount = agents.filter((a) => a.tone === "fail").length;
  const flagCount = agents.filter((a) => a.tone === "flag").length;

  const grouped = useMemo(() =>
    GROUPS.map((g) => ({ ...g, rows: agents.filter((a) => a.group === g.id) }))
      .filter((g) => g.rows.length > 0),
  [agents]);

  const score = useMemo(() => {
    const nums = agents.map((a) => a.num).filter((n) => n != null);
    if (nums.length) return Math.round(nums.reduce((s, n) => s + n, 0) / nums.length);
    if (rating > 0) return Math.round(rating * 20);
    return null;
  }, [agents, rating]);

  const verdict =
    failCount > 0 ? { label: "Flagged", tone: "fail" }
    : flagCount > 0 ? { label: "Needs a look", tone: "flag" }
    : agents.length > 0 ? { label: "Approved", tone: "pass" }
    : null;

  const groupLine = grouped.map((g) => g.short).join(" · ");
  const scorePct = score == null ? 0 : Math.max(0, Math.min(100, score));

  const seek = (s) => {
    const v = videoRef.current;
    if (!v || s == null) return;
    try { v.currentTime = s; v.play?.(); v.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) { /* external embed */ }
  };

  const isLoading = reportStatus === "loading" || reportStatus === "idle";
  const isProcessing = !isLoading && agents.length === 0;

  return (
    <div style={{ padding: "40px 24px 64px", color: NAVY, background: "radial-gradient(120% 80% at 50% -10%, #F4F2FF 0%, #EBEEFA 60%)", fontFamily: "'League Spartan', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;500;600;700&display=swap');
        .blb, .blb * { font-family: 'League Spartan', sans-serif; box-sizing: border-box; }
        .blb-btn:hover { background: #F5F7FF !important; }
        .blb-appr:hover { background: ${PERI_H} !important; }
        .blb-row:hover { background: #F7F9FF; }
        .blb-jump:hover { background: rgba(135,156,247,0.22) !important; }
        .blb-pill:hover { background: rgba(135,156,247,0.1) !important; }
        .blb-ghead:hover { background: rgba(135,156,247,0.1) !important; }
        @keyframes blb-spin { to { transform: rotate(360deg); } }
        @keyframes blb-shim { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>

      <div className="blb" style={{ width: 1080, maxWidth: "100%", margin: "0 auto", background: "#FFFFFF", border: `1px solid ${BORDER_STR}`, borderRadius: 26, boxShadow: "0 40px 90px -50px rgba(0,15,77,0.45)", overflow: "hidden" }}>

        {/* Topbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "0 22px", height: 60, borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 9, background: TAG, color: PERI_H, flex: "0 0 auto" }}><Video size={16} /></span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: NAVY_DEEP, lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
              <div style={{ fontSize: 11, color: SOFT, lineHeight: 1.2 }}>
                {subType}{agents.length > 0 ? ` · ${agents.length} agents · ${passCount} pass` : ""}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "0 0 auto" }}>
            <button className="blb-btn" type="button" onClick={() => refetch?.()} style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 32, padding: "0 13px", borderRadius: 9, border: `1px solid ${BORDER_STR}`, background: "#fff", color: NAVY_DEEP, fontFamily: "inherit", fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}>
              <RefreshCw size={14} /> {isProcessing ? "Check for results" : "Re-run"}
            </button>
            {verdict && (
              <span className="blb-appr" style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 32, padding: "0 13px", borderRadius: 999, background: verdict.tone === "pass" ? PERI : toneColor(verdict.tone), color: "#fff", fontSize: 12.5, fontWeight: 600 }}>
                {verdict.tone === "pass" && <Check size={13} strokeWidth={2.4} />} {verdict.tone === "pass" ? "Approve" : verdict.label}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "stretch" }}>

          {/* Left: video */}
          <div style={{ flex: "1 1 380px", minWidth: 300, padding: "40px 36px 32px", background: "linear-gradient(180deg, #FCFDFF 0%, #F7F9FF 100%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ position: "relative", width: 296, maxWidth: "100%", aspectRatio: "9 / 16", borderRadius: 20, overflow: "hidden", background: "#0B1024", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 30px 60px -30px rgba(0,15,77,0.5)" }}>
              {videoUrl ? (
                <video ref={videoRef} id="bl-review-video" src={videoUrl} controls playsInline preload="metadata" poster={posterUrl} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: SOFT, fontSize: 12 }}>No video attached</div>
              )}
            </div>
            <h2 style={{ margin: "18px 0 10px", fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", color: NAVY_DEEP, textAlign: "center" }}>{title}</h2>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 7, marginBottom: 16 }}>
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 11px", borderRadius: 999, background: PERI, color: "#fff", fontSize: 11, fontWeight: 600 }}>{subType}</span>
              {brandName && <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 11px", borderRadius: 999, background: TAG, color: NAVY_DEEP, fontSize: 11, fontWeight: 500 }}>{brandName}</span>}
              {duration && <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 24, padding: "0 11px", borderRadius: 999, background: TAG, color: NAVY_DEEP, fontSize: 11, fontWeight: 500 }}><Clock size={11} /> {duration}</span>}
            </div>
            {overall && <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: MUTED, fontWeight: 300, textAlign: "center", maxWidth: "40ch" }}>{overall}</p>}
            {rating > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 16 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
                  {[1,2,3,4,5].map((n) => (
                    <Star key={n} size={15} fill={n <= rating ? PERI : "transparent"} strokeWidth={n <= rating ? 0 : 1.5} color={n <= rating ? PERI : SOFT} />
                  ))}
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 500, color: MUTED }}>{rating.toFixed(1)}{brandName ? ` · ${brandName}` : ""}</span>
              </div>
            )}
          </div>

          {/* Right: report panel */}
          <div style={{ flex: "0 1 432px", minWidth: 300, maxWidth: "100%", borderLeft: `1px solid ${BORDER}`, background: "#FFFFFF", display: "flex", flexDirection: "column" }}>

            {/* Score bar */}
            <div style={{ padding: "22px 22px 20px", borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 40, fontWeight: 700, color: NAVY_DEEP, lineHeight: 0.9, letterSpacing: "-0.02em" }}>{score == null ? "—" : score}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: SOFT }}>/ 100</span>
                </div>
                {verdict && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 26, padding: "0 12px", borderRadius: 999, background: verdict.tone === "fail" ? "rgba(217,38,38,0.10)" : verdict.tone === "flag" ? "rgba(178,107,0,0.12)" : "rgba(45,170,99,0.12)", color: toneColor(verdict.tone), fontSize: 12, fontWeight: 600 }}>
                    {verdict.tone === "pass" && <Check size={13} strokeWidth={3} />} {verdict.label}
                  </span>
                )}
              </div>
              <div style={{ margin: "14px 0 8px", height: 9, borderRadius: 999, background: "#E7EAF7", overflow: "hidden" }}>
                <div style={{ width: `${scorePct}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #294FF6, #879CF7)" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11.5, fontWeight: 400, color: MUTED }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: verdict ? toneColor(verdict.tone) : SOFT }} />
                  {agents.length > 0 ? `${passCount} of ${agents.length} checks passed` : "No checks yet"}
                </span>
                {groupLine && <span style={{ color: SOFT }}>{groupLine}</span>}
              </div>
            </div>

            {/* Grouped agents */}
            <div style={{ padding: "12px 14px 6px", display: "flex", flexDirection: "column", gap: 8 }}>
              {isLoading && <Skeleton />}
              {isProcessing && <Processing onRefresh={() => refetch?.()} />}
              {!isLoading && !isProcessing && grouped.map((g, i) => (
                <Group key={g.id} group={g} defaultOpen={i === 0} onSeek={seek} />
              ))}
            </div>

            {/* Ask Lee bar */}
            <div style={{ marginTop: "auto", padding: 16, borderTop: `1px solid ${BORDER}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11 }}>
                <img src={LEE_AVATAR} alt="Lee" style={{ width: 24, height: 24, borderRadius: "50%", flex: "0 0 auto" }} />
                <span style={{ fontSize: 12.5, fontWeight: 500, color: NAVY_DEEP }}>Ask Lee about this review</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 11 }}>
                {["Compare to my brief", "Draft revision notes", "Rewrite the CTA"].map((t) => (
                  <button key={t} className="blb-pill" type="button" style={{ height: 28, padding: "0 12px", borderRadius: 999, border: `1px solid ${BORDER_STR}`, background: "#fff", color: PERI_H, fontFamily: "inherit", fontSize: 11.5, fontWeight: 500, cursor: "pointer" }}>{t}</button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, height: 46, padding: "0 6px 0 16px", borderRadius: 14, border: `1px solid ${BORDER_STR}`, background: "#fff" }}>
                <input placeholder="Ask about this video…" style={{ flex: "1 1 auto", minWidth: 0, border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 13, color: NAVY }} />
                <button aria-label="Send" type="button" className="blb-appr" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 10, border: "none", background: PERI, color: "#fff", cursor: "pointer", flex: "0 0 auto" }}>
                  <Send size={16} />
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 13, fontSize: 10.5, color: SOFT }}>
                <span>Powered by</span>
                <img src={WORDMARK} alt="Brieflee" style={{ height: 13, width: "auto", opacity: 0.85 }} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// Subcomponents
// =====================================================================
function Group({ group, defaultOpen, onSeek }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const Icon = group.icon;
  const pass = group.rows.filter((r) => r.tone === "pass").length;
  const other = group.rows.length - pass;
  const pillTone = other > 0 ? (group.rows.some((r) => r.tone === "fail") ? "fail" : "flag") : "pass";
  return (
    <div style={{ border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
      <button className="blb-ghead" type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
        style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "12px 14px", cursor: "pointer", background: TINT, border: "none", textAlign: "left" }}>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 9, background: "#fff", color: PERI_H, border: `1px solid ${BORDER}`, flex: "0 0 auto" }}><Icon size={16} /></span>
        <span style={{ flex: "1 1 auto", fontSize: 14, fontWeight: 600, color: NAVY_DEEP }}>{group.name}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: toneColor(pillTone), background: pillTone === "fail" ? "rgba(217,38,38,0.10)" : pillTone === "flag" ? "rgba(178,107,0,0.12)" : "rgba(45,170,99,0.12)", padding: "3px 9px", borderRadius: 999 }}>
          {pass} pass{other > 0 ? ` · ${other} flag` : ""}
        </span>
        <ChevronDown size={15} color={SOFT} style={{ flex: "0 0 auto", transition: "transform 0.18s", transform: open ? "rotate(180deg)" : "rotate(0)" }} />
      </button>
      {open && (
        <div style={{ padding: 6 }}>
          {group.rows.map((r) => <Row key={r.id} row={r} icon={group.icon} onSeek={onSeek} />)}
        </div>
      )}
    </div>
  );
}

function Row({ row, icon: GroupIcon, onSeek }) {
  const time = formatTime(row.timestamp);
  const c = toneColor(row.tone);
  return (
    <div className="blb-row" style={{ display: "flex", gap: 12, padding: 10, borderRadius: 11 }}>
      {row.screenshot ? (
        <img src={row.screenshot} alt="" style={{ width: 50, height: 68, borderRadius: 9, objectFit: "cover", flex: "0 0 auto", border: "1px solid rgba(0,0,0,0.06)" }} />
      ) : (
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 50, height: 68, borderRadius: 9, background: row.tone === "pass" ? "rgba(45,170,99,0.1)" : row.tone === "fail" ? "rgba(217,38,38,0.08)" : "rgba(178,107,0,0.1)", color: c, flex: "0 0 auto" }}>
          <GroupIcon size={20} />
        </span>
      )}
      <div style={{ flex: "1 1 auto", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: NAVY_DEEP }}>{row.name}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: c, fontWeight: 600, whiteSpace: "nowrap" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
            {row.value || row.statusLabel}
          </span>
        </div>
        {row.comment && <p style={{ margin: `4px 0 ${time ? 7 : 0}px`, fontSize: 12, lineHeight: 1.5, color: MUTED, fontWeight: 300 }}>{row.comment}</p>}
        {time && (
          <button className="blb-jump" type="button" onClick={() => onSeek(row.timestamp)} style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 24, padding: "0 9px", borderRadius: 999, border: "none", background: TAG, color: PERI_H, fontFamily: "inherit", fontSize: 10.5, fontWeight: 600, cursor: "pointer" }}>
            <Play size={10} fill="currentColor" /> {time}
          </button>
        )}
      </div>
    </div>
  );
}

function Processing({ onRefresh }) {
  return (
    <div style={{ textAlign: "center", padding: "34px 20px" }}>
      <div style={{ width: 30, height: 30, margin: "0 auto 14px", borderRadius: "50%", border: `3px solid ${TAG}`, borderTopColor: PERI, animation: "blb-spin 0.8s linear infinite" }} />
      <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: NAVY_DEEP }}>Watching your video</p>
      <p style={{ margin: "0 0 14px", fontSize: 12, color: MUTED }}>Your agents are scoring every second. This usually takes under a minute.</p>
      <button type="button" onClick={onRefresh} style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 32, padding: "0 14px", background: PERI, color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
        <RefreshCw size={13} /> Check for results
      </button>
    </div>
  );
}

function Skeleton() {
  return (
    <>
      {[1,2,3].map((n) => (
        <div key={n} style={{ height: 60, borderRadius: 14, background: `linear-gradient(90deg, ${TINT}, ${TAG}, ${TINT})`, backgroundSize: "200% 100%", animation: "blb-shim 1.2s ease-in-out infinite" }} />
      ))}
    </>
  );
}
