// =====================================================================
// /app/review-details — Creator-facing review/example detail page.
//
// Opened as a Softr modal from /brief/details/live when a creator
// clicks one of the example pick cards in the Inspiration section.
// Source: brieflee beta → reviews, find record by URL recordId.
//
// Purpose: help the creator UNDERSTAND why this video is a good
// example. Not the brand-facing review dashboard with PASS/FAIL.
// Tone is "study this, here's the script, here's why it works."
//
// SOFTR UI SETUP:
//   1. Page: /review-details (modal page, size xl, public)
//   2. Source: brieflee beta → reviews, find record by URL recordId
// =====================================================================

import { useState, useEffect, useMemo, useRef } from "react";
import { useRecord, useCurrentRecordId, q } from "@/lib/datasource";
import { Check, ChevronDown, Copy, Star, Clock, User, Sparkles } from "lucide-react";

// ─── Brand palette ────────────────────────────────────────────
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

// ─── Section icons (Brieflee Cloudinary library) ──────────────
const ICON_INSIGHT     = "https://res.cloudinary.com/dchroynzv/image/upload/v1777998690/brieflee_help-icon_faq-big-cartoon-eyes-curious-looking-transparent_2026-05.png";
const ICON_SCRIPT      = "https://res.cloudinary.com/dchroynzv/image/upload/v1777998710/brieflee_icon_smartphone-in-tripod-flat-illustration-transparent_2026-05.png";
const ICON_TRANSCRIPT  = "https://res.cloudinary.com/dchroynzv/image/upload/v1777998691/brieflee_help-icon_notifications-megaphone-loudspeaker-blue-transparent_2026-05.png";
const ICON_THRESHOLDS  = "https://res.cloudinary.com/dchroynzv/image/upload/v1777622906/brieflee_illustration_flat-red-wax-seal-stamp-approved-colour_2026-03.png";
const BRIEFLEE_WORDMARK = "https://res.cloudinary.com/dchroynzv/image/upload/v1777623054/brieflee_logo_logo-pack-2025-vector-blue-v3_2025-03.svg";

// ─── reviews table — read schema ──────────────────────────────
const select = q.select({
  // Identity
  name:                 "Odw6q", // FORMULA — derived from submission name
  // Video sources (one of these will have a playable URL)
  display_url:          "kIbht",
  embed_code:           "E1mnP", // FORMULA → iframe HTML
  thumbnail:            "4rkuC",
  video_file:           "pjCcn", // LOOKUP attachment from the submission
  // Core review fields
  overall_rating:       "uRkEe", // RATING 1–5
  overall_comment:      "Zqqx4",
  decision_reasoning:   "yp7ca",
  recommended_action:   "j6SpS",
  transcript:           "5kQxm",
  adapted_script:       "Z95A7",
  clean_adapted_script: "k99NF", // FORMULA
  analysis:             "TPuFi", // FORMULA — concatenated commentary
  // Submission context
  submission_type:      "zC4Z3", // LOOKUP SELECT
  duration:             "9Hshm", // LOOKUP from submission
  creator_name:         "yFePc",
  creator_first_name:   "2pMor",
  // Brief / brand context
  brief_name:           "N9aaM", // LOOKUP from briefs
  accounts:             "c6csA", // LINKED_RECORD → accounts (we read .label)
  // Threshold breakdown — what scored well / what didn't
  product_screen_time_status:    "MIomy",
  product_screen_time_score:     "wwk9X",
  product_screen_time_comment:   "Golmf",
  hook_speed_status:             "BCdmg",
  hook_speed_score:              "PPgD7",
  hook_speed_comment:            "FleWi",
  visual_hook_status:            "Q8htG",
  visual_hook_score:             "TuCZK",
  visual_hook_comment:           "H8mtq",
  cta_placement_status:          "O5wRt",
  cta_placement_score:           "58szQ",
  cta_placement_comment:         "MfmJY",
  face_time_status:              "GNsfa",
  face_time_score:               "mCcVd",
  face_time_comment:             "wcLV7",
  text_legibility_status:        "gJZmz",
  text_legibility_score:         "CoAzZ",
  text_legibility_comment:       "S60Ob",
  audio_clarity_status:          "O4iGG",
  audio_clarity_score:           "gQ2My",
  audio_clarity_comment:         "ytuTT",
  engagement_pacing_status:      "J6Hlm",
  engagement_pacing_score:       "ZgN1w",
  engagement_pacing_comment:     "dSTFY",
  brand_mention_count_status:    "9kKJP",
  brand_mention_count_score:     "7fAI0",
  brand_mention_count_comment:   "JIpeg",
});

// ─── Threshold definitions (matches the live brief page) ─────
const THRESHOLDS = [
  { key: "product_screen_time", label: "Product visibility",  unit: "%" },
  { key: "hook_speed",          label: "Hook timing",         unit: "s" },
  { key: "visual_hook",         label: "Visual hook",         unit: "%" },
  { key: "cta_placement",       label: "CTA placement",       unit: ""  },
  { key: "face_time",           label: "Creator visibility",  unit: "%" },
  { key: "engagement_pacing",   label: "Scene pacing",        unit: "%" },
  { key: "brand_mention_count", label: "Brand mentions",      unit: ""  },
  { key: "text_legibility",     label: "Text legibility",     unit: "%" },
  { key: "audio_clarity",       label: "Audio clarity",       unit: "%" },
];

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
// embed_code is an HTML iframe string built by a FORMULA. Pull the
// src attribute out so we can render a real <video> element instead
// of nested iframes.
function extractIframeSrc(html) {
  if (!html || typeof html !== "string") return "";
  const m = html.match(/src=['"]([^'"]+)['"]/i);
  return m ? m[1] : "";
}
function isPass(statusLabel) {
  const s = String(statusLabel || "").toUpperCase();
  return s === "PASS" || s === "APPROVED";
}
function isFail(statusLabel) {
  const s = String(statusLabel || "").toUpperCase();
  return s === "FAIL" || s === "REJECTED";
}

// =====================================================================
// MAIN BLOCK
// =====================================================================
export default function Block() {
  const reviewId = useCurrentRecordId() || "";
  const { data: record } = useRecord({ recordId: reviewId, select });
  const f = record?.fields || {};

  // Resolve the playable video URL — preference order:
  //   1. display_url  (manually-set URL on the review)
  //   2. embed_code   (iframe HTML → we extract the src)
  //   3. video_file   (LOOKUP attachment from the submission)
  const videoUrl =
    (typeof f.display_url === "string" && f.display_url.trim()) ||
    extractIframeSrc(f.embed_code) ||
    extractThumbUrl(f.video_file) ||
    "";

  const reviewName     = unwrap(f.name) || "Example video";
  const briefName      = unwrap(f.brief_name) || "";
  const brandName      = asArray(f.accounts)[0]?.label || "";
  const creatorName    = unwrap(f.creator_first_name) || unwrap(f.creator_name) || "";
  const submissionType = selectLabel(f.submission_type) || "";
  const duration       = unwrap(f.duration) || "";
  const rating         = Number(f.overall_rating) || 0;

  const overallComment = unwrap(f.overall_comment);
  const decisionReason = unwrap(f.decision_reasoning);
  const recommended    = unwrap(f.recommended_action);
  const transcript     = unwrap(f.transcript);
  const adaptedScript  = unwrap(f.clean_adapted_script) || unwrap(f.adapted_script);

  // Build threshold rows — only show ones with a status set so we
  // don't render a wall of "—".
  const thresholdRows = useMemo(() => {
    return THRESHOLDS.map(({ key, label, unit }) => {
      const status = selectLabel(f[`${key}_status`]);
      if (!status) return null;
      const scoreRaw = f[`${key}_score`];
      const score = scoreRaw == null || scoreRaw === "" ? "" : String(scoreRaw);
      return {
        key, label, unit,
        status,
        score,
        comment: unwrap(f[`${key}_comment`]),
      };
    }).filter(Boolean);
  }, [f]);

  const passCount = thresholdRows.filter((r) => isPass(r.status)).length;
  const failCount = thresholdRows.filter((r) => isFail(r.status)).length;

  return (
    <>
      <Style />
      <div className="bl-rd">
        <div className="bl-rd-inner container mx-auto px-4 w-full">

          {/* ============ Hero ============ */}
          <header className="bl-rd-hero">
            <div className="bl-rd-hero-video">
              {videoUrl ? (
                <video src={videoUrl} controls preload="metadata" poster={extractThumbUrl(f.thumbnail) || undefined} />
              ) : (
                <div className="bl-rd-hero-video-empty">No video attached</div>
              )}
            </div>
            <div className="bl-rd-hero-meta">
              <div className="bl-rd-hero-tags">
                {submissionType && <span className="bl-rd-tag is-primary">{submissionType}</span>}
                {brandName && <span className="bl-rd-tag">{brandName}</span>}
                {duration && <span className="bl-rd-tag"><Clock size={11} /> {duration}</span>}
                {creatorName && <span className="bl-rd-tag"><User size={11} /> {creatorName}</span>}
              </div>
              <h1 className="bl-rd-title">{reviewName}</h1>
              {briefName && (
                <p className="bl-rd-brief-line">
                  From the brief: <strong>{briefName}</strong>
                </p>
              )}
              {rating > 0 && (
                <div className="bl-rd-rating" aria-label={`Overall rating ${rating} out of 5`}>
                  {[1,2,3,4,5].map((n) => (
                    <Star
                      key={n}
                      size={16}
                      fill={n <= rating ? PERIWINKLE : "transparent"}
                      strokeWidth={n <= rating ? 0 : 1.5}
                      color={n <= rating ? PERIWINKLE : SOFT_MUTED}
                    />
                  ))}
                  <span className="bl-rd-rating-num">{rating}/5</span>
                </div>
              )}
              {thresholdRows.length > 0 && (
                <div className="bl-rd-pass-summary">
                  {passCount > 0 && (
                    <span className="bl-rd-pass-chip is-pass">
                      <Check size={11} strokeWidth={3} /> {passCount} passed
                    </span>
                  )}
                  {failCount > 0 && (
                    <span className="bl-rd-pass-chip is-fail">
                      {failCount} flagged
                    </span>
                  )}
                </div>
              )}
            </div>
          </header>

          {/* ============ Bento grid ============ */}
          <div className="bl-rd-bento">

            {(overallComment || decisionReason || recommended) && (
              <BentoCard
                icon={ICON_INSIGHT}
                title="Why this works"
                tooltip="Why this video earned its score and what to take from it."
                full
              >
                <div className="bl-rd-insight-list">
                  {overallComment && <Insight label="Overall" body={overallComment} />}
                  {decisionReason && <Insight label="Reasoning" body={decisionReason} />}
                  {recommended    && <Insight label="What to try" body={recommended} />}
                </div>
              </BentoCard>
            )}

            {transcript && (
              <BentoCard
                icon={ICON_TRANSCRIPT}
                title="Transcript"
                tooltip="Every word spoken in the video. Pull lines from this to inform your own script."
                wide
                copyText={transcript}
              >
                <pre className="bl-rd-script">{transcript}</pre>
              </BentoCard>
            )}

            {adaptedScript && (
              <BentoCard
                icon={ICON_SCRIPT}
                title="Adapted script"
                tooltip="A clean rewrite of the spoken script you can adapt for your own video."
                copyText={adaptedScript}
              >
                <pre className="bl-rd-script">{adaptedScript}</pre>
              </BentoCard>
            )}

            {thresholdRows.length > 0 && (
              <BentoCard
                icon={ICON_THRESHOLDS}
                title="How it scored"
                tooltip="What our AI flagged. Green checks are bars this video cleared; red marks the ones to do better than."
                full
                defaultOpen
              >
                <div className="bl-rd-thresholds">
                  {thresholdRows.map((r) => (
                    <ThresholdRow key={r.key} row={r} />
                  ))}
                </div>
              </BentoCard>
            )}

          </div>

          <footer className="bl-rd-footer">
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
function Insight({ label, body }) {
  return (
    <div className="bl-rd-insight">
      <span className="bl-rd-insight-label">{label}</span>
      <p className="bl-rd-insight-body">{body}</p>
    </div>
  );
}

function ThresholdRow({ row }) {
  const pass = isPass(row.status);
  const fail = isFail(row.status);
  const tone = pass ? "is-pass" : fail ? "is-fail" : "is-neutral";
  return (
    <div className={`bl-rd-threshold ${tone}`}>
      <div className="bl-rd-threshold-head">
        <span className="bl-rd-threshold-icon">
          {pass ? <Check size={12} strokeWidth={3} /> : fail ? "✕" : "•"}
        </span>
        <span className="bl-rd-threshold-label">{row.label}</span>
        <span className="bl-rd-threshold-status">{row.status}</span>
        {row.score && (
          <span className="bl-rd-threshold-score">{row.score}{row.unit}</span>
        )}
      </div>
      {row.comment && <p className="bl-rd-threshold-comment">{row.comment}</p>}
    </div>
  );
}

// =====================================================================
// BentoCard — mirror of the live brief page
// =====================================================================
function BentoCard({ icon, title, tooltip, wide, full, defaultOpen = true, copyText, children }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const spanClass = full ? "bl-rd-bento-full" : wide ? "bl-rd-bento-wide" : "";
  return (
    <section className={`bl-rd-bento-card ${spanClass}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="bl-rd-bento-head"
      >
        {icon && <img src={icon} alt="" className="bl-rd-bento-icon" draggable={false} />}
        <h3 className="bl-rd-bento-title">
          {title}
          {tooltip && <InlineTooltip text={tooltip} />}
        </h3>
        <ChevronDown
          size={16}
          style={{ color: NAVY, transform: open ? "rotate(0)" : "rotate(-90deg)", transition: "transform 0.15s" }}
        />
      </button>
      {open && (
        <div className="bl-rd-bento-body">
          {children}
          {copyText ? <CopyInlineButton text={copyText} /> : null}
        </div>
      )}
    </section>
  );
}

function InlineTooltip({ text }) {
  if (!text) return null;
  return (
    <span className="bl-rd-tooltip">
      <span className="bl-rd-tooltip-i">i</span>
      <span className="bl-rd-tooltip-text" role="tooltip">{text}</span>
    </span>
  );
}

function CopyInlineButton({ text }) {
  const [copied, setCopied] = useState(false);
  const onClick = (e) => {
    e.stopPropagation();
    if (!text || typeof navigator?.clipboard?.writeText !== "function") return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button type="button" onClick={onClick} className="bl-rd-copy-btn">
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// =====================================================================
// Style
// =====================================================================
function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;500;600;700&display=swap');
      .bl-rd, .bl-rd * { font-family: 'League Spartan', sans-serif; box-sizing: border-box; }
      .bl-rd { background: ${SURFACE}; min-height: 100vh; padding: 24px 0 48px; }
      .bl-rd-inner {
        max-width: 1080px; margin: 0 auto; width: 100%;
        display: flex; flex-direction: column; gap: 20px;
      }

      /* Hero */
      .bl-rd-hero {
        display: grid;
        grid-template-columns: minmax(260px, 360px) 1fr;
        gap: 24px;
        background: #FFFFFF;
        border: 1px solid ${BORDER};
        border-radius: 20px;
        padding: 24px;
        align-items: stretch;
      }
      .bl-rd-hero-video {
        position: relative;
        background: #000;
        border-radius: 14px;
        overflow: hidden;
        aspect-ratio: 9 / 16;
      }
      .bl-rd-hero-video video {
        width: 100%; height: 100%; object-fit: cover;
        background: #000; display: block;
      }
      .bl-rd-hero-video-empty {
        position: absolute; inset: 0;
        display: flex; align-items: center; justify-content: center;
        color: ${SOFT_MUTED}; font-size: 12px;
      }
      .bl-rd-hero-meta {
        display: flex; flex-direction: column; gap: 12px;
        align-self: center;
      }
      .bl-rd-hero-tags {
        display: flex; flex-wrap: wrap; gap: 6px;
      }
      .bl-rd-tag {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 3px 9px;
        background: ${TAG_BG};
        color: ${NAVY_DEEP};
        border-radius: 999px;
        font-size: 10px; font-weight: 500;
        letter-spacing: 0.03em;
      }
      .bl-rd-tag.is-primary {
        background: ${PERIWINKLE};
        color: #FFFFFF;
      }
      .bl-rd-title {
        font-size: 26px; font-weight: 600; color: ${NAVY_DEEP};
        margin: 0; letter-spacing: -0.015em; line-height: 1.15;
      }
      .bl-rd-brief-line {
        margin: 0;
        font-size: 13px; color: ${MUTED}; line-height: 1.45;
      }
      .bl-rd-brief-line strong { color: ${NAVY_DEEP}; font-weight: 600; }
      .bl-rd-rating {
        display: inline-flex; align-items: center; gap: 4px;
      }
      .bl-rd-rating-num {
        margin-left: 6px;
        font-size: 12px; font-weight: 600; color: ${NAVY_DEEP};
      }
      .bl-rd-pass-summary {
        display: inline-flex; gap: 8px;
      }
      .bl-rd-pass-chip {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 3px 10px;
        border-radius: 999px;
        font-size: 11px; font-weight: 600;
      }
      .bl-rd-pass-chip.is-pass {
        background: rgba(45, 170, 99, 0.12); color: ${PASS_GREEN};
      }
      .bl-rd-pass-chip.is-fail {
        background: rgba(217, 38, 38, 0.10); color: ${FAIL_RED};
      }

      /* Bento grid */
      .bl-rd-bento {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }
      .bl-rd-bento-wide { grid-column: span 2; }
      .bl-rd-bento-full { grid-column: span 3; }
      .bl-rd-bento-card {
        background: ${TINT_BG};
        border-radius: 16px;
        padding: 18px;
      }
      .bl-rd-bento-head {
        display: flex; align-items: center; gap: 10px;
        width: 100%; background: transparent; border: none;
        cursor: pointer; text-align: left; padding: 0; margin-bottom: 10px;
      }
      .bl-rd-bento-icon { width: 32px; height: 32px; flex-shrink: 0; object-fit: contain; }
      .bl-rd-bento-title {
        flex: 1 1 auto;
        font-size: 15px; font-weight: 600; color: ${NAVY_DEEP};
        margin: 0;
        display: inline-flex; align-items: center; gap: 6px;
      }
      .bl-rd-bento-body { font-size: 13px; line-height: 1.55; color: ${NAVY_DEEP}; }

      /* Tooltip */
      .bl-rd-tooltip { position: relative; display: inline-flex; }
      .bl-rd-tooltip-i {
        width: 14px; height: 14px;
        background: ${MUTED}; color: #FFFFFF;
        border-radius: 999px;
        font-size: 9px; font-weight: 600;
        display: inline-flex; align-items: center; justify-content: center;
        cursor: help;
      }
      .bl-rd-tooltip-text {
        position: absolute; bottom: 100%; left: 50%;
        transform: translateX(-50%) translateY(-6px);
        background: ${NAVY_DEEP}; color: #FFFFFF;
        font-size: 11px; font-weight: 400; line-height: 1.4;
        padding: 6px 10px; border-radius: 8px;
        white-space: normal; width: 220px;
        opacity: 0; visibility: hidden; pointer-events: none;
        z-index: 100;
      }
      .bl-rd-tooltip:hover .bl-rd-tooltip-text {
        opacity: 1; visibility: visible;
      }

      /* Copy button */
      .bl-rd-copy-btn {
        margin-top: 10px;
        display: inline-flex; align-items: center; gap: 6px;
        height: 30px; padding: 0 12px;
        background: #FFFFFF; color: ${NAVY_DEEP};
        border: 1px solid ${BORDER}; border-radius: 8px;
        font-size: 12px; font-weight: 500; cursor: pointer;
      }
      .bl-rd-copy-btn:hover { border-color: ${PERIWINKLE}; }

      /* Insights (Why this works) */
      .bl-rd-insight-list {
        display: flex; flex-direction: column; gap: 12px;
      }
      .bl-rd-insight {
        background: #FFFFFF;
        border: 1px solid ${BORDER};
        border-radius: 10px;
        padding: 12px 14px;
      }
      .bl-rd-insight-label {
        display: block;
        font-size: 10px; font-weight: 600; color: ${MUTED};
        text-transform: uppercase; letter-spacing: 0.06em;
        margin-bottom: 4px;
      }
      .bl-rd-insight-body {
        margin: 0;
        font-size: 13px; line-height: 1.55; color: ${NAVY_DEEP};
      }

      /* Script blocks */
      .bl-rd-script {
        margin: 0;
        white-space: pre-wrap; font-family: inherit;
        font-size: 13px; line-height: 1.6; color: ${NAVY_DEEP};
        background: #FFFFFF;
        border: 1px solid ${BORDER};
        border-radius: 10px;
        padding: 14px 16px;
        max-height: 360px; overflow: auto;
      }

      /* Threshold breakdown */
      .bl-rd-thresholds {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 10px;
      }
      .bl-rd-threshold {
        background: #FFFFFF;
        border: 1px solid ${BORDER};
        border-radius: 10px;
        padding: 12px 14px;
        display: flex; flex-direction: column; gap: 6px;
      }
      .bl-rd-threshold.is-pass { border-left: 4px solid ${PASS_GREEN}; }
      .bl-rd-threshold.is-fail { border-left: 4px solid ${FAIL_RED}; }
      .bl-rd-threshold-head {
        display: flex; align-items: center; gap: 8px;
        flex-wrap: wrap;
      }
      .bl-rd-threshold-icon {
        width: 20px; height: 20px;
        border-radius: 999px;
        display: inline-flex; align-items: center; justify-content: center;
        background: ${TINT_BG}; color: ${NAVY_DEEP};
        font-size: 11px; font-weight: 700;
        flex-shrink: 0;
      }
      .bl-rd-threshold.is-pass .bl-rd-threshold-icon {
        background: ${PASS_GREEN}; color: #FFFFFF;
      }
      .bl-rd-threshold.is-fail .bl-rd-threshold-icon {
        background: ${FAIL_RED}; color: #FFFFFF;
      }
      .bl-rd-threshold-label {
        flex: 1 1 auto;
        font-size: 13px; font-weight: 600; color: ${NAVY_DEEP};
      }
      .bl-rd-threshold-status {
        font-size: 10px; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.05em;
        color: ${MUTED};
      }
      .bl-rd-threshold.is-pass .bl-rd-threshold-status { color: ${PASS_GREEN}; }
      .bl-rd-threshold.is-fail .bl-rd-threshold-status { color: ${FAIL_RED}; }
      .bl-rd-threshold-score {
        font-size: 11px; font-weight: 600; color: ${NAVY_DEEP};
        padding: 2px 8px;
        background: ${TAG_BG};
        border-radius: 999px;
      }
      .bl-rd-threshold-comment {
        margin: 0;
        font-size: 12px; line-height: 1.45; color: ${MUTED};
      }

      /* Footer */
      .bl-rd-footer {
        display: inline-flex; align-items: center; gap: 6px;
        margin: 16px auto 0;
        font-size: 11px; color: ${MUTED};
      }
      .bl-rd-footer img { height: 18px; width: auto; }

      /* Responsive */
      @media (max-width: 820px) {
        .bl-rd-hero { grid-template-columns: 1fr; }
        .bl-rd-hero-video { aspect-ratio: 9 / 16; max-width: 320px; margin: 0 auto; width: 100%; }
        .bl-rd-bento { grid-template-columns: 1fr; }
        .bl-rd-bento-wide,
        .bl-rd-bento-full { grid-column: span 1; }
        .bl-rd-title { font-size: 22px; }
        .bl-rd-thresholds { grid-template-columns: 1fr; }
      }
    `}</style>
  );
}
