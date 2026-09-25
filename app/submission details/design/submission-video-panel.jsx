// =====================================================================
// /submissions/details — VIDEO PANEL  (source 1: reviews)
//
// The left half of the Video Review Workspace. Reads ONE source only —
// the `reviews` table — so it's simple to bind and maintain. Renders the
// video, the human-readable overall (rating, summary, what-to-try) and
// the transcript.
//
// The sibling AGENTS RAIL block (source: review_report) seeks this
// video by its DOM id, so the <video> below MUST keep id="bl-review-video".
//
// SOFTR UI SETUP:
//   Page: /submissions/details  (opened with ?recordId=<reviewId>)
//   Source → reviews, find record by URL recordId.
// =====================================================================

import { useRecord, useCurrentRecordId, q } from "@/lib/datasource";
import { Star, Clock, Sparkles, Video } from "lucide-react";

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
  recommended_action: "j6SpS",
  transcript:         "5kQxm",
  brief_name:         "N9aaM", // LOOKUP — empty for Quick check
  accounts:           "c6csA", // LINKED_RECORD → accounts (.label)
  submission_type:    "zC4Z3",
  duration:           "9Hshm",
});

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

// =====================================================================
// MAIN BLOCK
// =====================================================================
export default function Block() {
  const reviewId = useCurrentRecordId() || "";
  const { data: review } = useRecord({ recordId: reviewId, select: reviewSelect });

  const f = review?.fields || {};

  const videoUrl =
    (typeof f.display_url === "string" && f.display_url.trim()) ||
    extractIframeSrc(f.embed_code) ||
    extractThumbUrl(f.video_file) ||
    "";
  const posterUrl = extractThumbUrl(f.thumbnail) || undefined;

  const title       = unwrap(f.name) || "Your video";
  const briefName   = unwrap(f.brief_name);
  const brandName   = asArray(f.accounts)[0]?.label || "";
  const duration    = unwrap(f.duration);
  const subType     = selectLabel(f.submission_type) || "Content review";
  const rating      = Number(f.overall_rating) || 0;
  const overall     = unwrap(f.overall_comment);
  const recommended = unwrap(f.recommended_action);
  const transcript  = unwrap(f.transcript);

  return (
    <>
      <Style />
      <div className="bl-vp">
        <div className="bl-vp-card">

          {/* Topbar */}
          <div className="bl-vp-topbar">
            <span className="bl-vp-topicon"><Video size={16} /></span>
            <div className="bl-vp-topmeta">
              <span className="bl-vp-toptitle">{title}</span>
              <span className="bl-vp-topsub">
                {briefName ? `Scored against ${briefName}` : "Content review · scored against your brief"}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="bl-vp-body">
            <div className="bl-vp-video">
              {videoUrl ? (
                <video id="bl-review-video" src={videoUrl} controls playsInline preload="metadata" poster={posterUrl} />
              ) : (
                <div id="bl-review-video" className="bl-vp-video-empty">No video attached</div>
              )}
            </div>

            <h2 className="bl-vp-title">{title}</h2>

            <div className="bl-vp-tags">
              <span className="bl-vp-tag is-primary">{subType}</span>
              {brandName && <span className="bl-vp-tag">{brandName}</span>}
              {duration && <span className="bl-vp-tag"><Clock size={11} /> {duration}</span>}
            </div>

            {rating > 0 && (
              <div className="bl-vp-rating">
                <span className="bl-vp-stars" aria-label={`Rated ${rating} of 5`}>
                  {[1,2,3,4,5].map((n) => (
                    <Star key={n} size={16}
                      fill={n <= rating ? PERIWINKLE : "transparent"}
                      strokeWidth={n <= rating ? 0 : 1.5}
                      color={n <= rating ? PERIWINKLE : SOFT_MUTED} />
                  ))}
                </span>
                <span className="bl-vp-rating-num">{rating.toFixed(1)}</span>
              </div>
            )}

            {overall && (
              <div className="bl-vp-summary">
                <p>{overall}</p>
                {recommended && (
                  <div className="bl-vp-rec">
                    <div className="bl-vp-rec-head"><Sparkles size={13} /> What to try</div>
                    <p>{recommended}</p>
                  </div>
                )}
              </div>
            )}

            {transcript && (
              <details className="bl-vp-transcript">
                <summary>View transcript</summary>
                <p>{transcript}</p>
              </details>
            )}
          </div>

          <footer className="bl-vp-footer">
            <span>Powered by</span>
            <img src={BRIEFLEE_WORDMARK} alt="Brieflee" />
          </footer>
        </div>
      </div>
    </>
  );
}

// =====================================================================
// Style
// =====================================================================
function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;500;600;700&display=swap');
      .bl-vp, .bl-vp * { font-family: 'League Spartan', sans-serif; box-sizing: border-box; }
      .bl-vp {
        padding: 24px 16px; color: ${NAVY};
        background: radial-gradient(120% 80% at 50% -10%, #F4F2FF 0%, #EBEEFA 60%);
      }
      .bl-vp-card {
        max-width: 460px; margin: 0 auto; background: #FFFFFF;
        border: 1px solid ${BORDER}; border-radius: 24px; overflow: hidden;
        box-shadow: 0 40px 90px -50px rgba(0,15,77,0.45);
      }

      /* Topbar */
      .bl-vp-topbar {
        display: flex; align-items: center; gap: 12px; min-width: 0;
        padding: 0 20px; height: 60px; border-bottom: 1px solid ${BORDER_SOFT};
      }
      .bl-vp-topicon {
        display: inline-flex; align-items: center; justify-content: center;
        width: 30px; height: 30px; border-radius: 9px; flex: 0 0 auto;
        background: ${TAG_BG}; color: ${PERIWINKLE_HOVER};
      }
      .bl-vp-topmeta { min-width: 0; display: flex; flex-direction: column; }
      .bl-vp-toptitle {
        font-size: 14.5px; font-weight: 600; color: ${NAVY_DEEP}; line-height: 1.1;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .bl-vp-topsub { font-size: 11px; color: ${SOFT_MUTED}; line-height: 1.2; }

      /* Body */
      .bl-vp-body {
        padding: 28px 28px 22px;
        background: linear-gradient(180deg, #FCFDFF 0%, #F7F9FF 100%);
        display: flex; flex-direction: column; align-items: center;
      }
      .bl-vp-video {
        position: relative; width: 280px; max-width: 100%; aspect-ratio: 9 / 16;
        border-radius: 18px; overflow: hidden; background: #0B1024;
        border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 26px 54px -28px rgba(0,15,77,0.5);
      }
      .bl-vp-video video { width: 100%; height: 100%; object-fit: cover; display: block; }
      .bl-vp-video-empty {
        position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
        color: ${SOFT_MUTED}; font-size: 12px;
      }
      .bl-vp-title { margin: 16px 0 9px; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; color: ${NAVY_DEEP}; text-align: center; }
      .bl-vp-tags { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; }
      .bl-vp-tag {
        display: inline-flex; align-items: center; gap: 4px; height: 23px; padding: 0 10px;
        border-radius: 999px; background: ${TAG_BG}; color: ${NAVY_DEEP};
        font-size: 10.5px; font-weight: 500;
      }
      .bl-vp-tag.is-primary { background: ${PERIWINKLE}; color: #fff; font-weight: 600; }

      .bl-vp-rating { display: flex; align-items: center; gap: 8px; margin-top: 14px; }
      .bl-vp-stars { display: inline-flex; align-items: center; gap: 2px; }
      .bl-vp-rating-num { font-size: 13px; font-weight: 600; color: ${NAVY_DEEP}; }

      .bl-vp-summary {
        margin-top: 16px; width: 100%; padding: 14px; border-radius: 12px;
        background: #FFFFFF; border: 1px solid ${BORDER_SOFT};
        font-size: 12.5px; line-height: 1.55; color: ${NAVY_DEEP};
      }
      .bl-vp-summary > p { margin: 0; }
      .bl-vp-rec {
        margin-top: 12px; padding: 12px 14px; border-radius: 12px;
        background: rgba(135,156,247,0.08); border: 1px solid ${BORDER_SOFT};
      }
      .bl-vp-rec-head { display: flex; align-items: center; gap: 7px; margin-bottom: 4px; font-size: 12px; font-weight: 600; color: ${PERIWINKLE_HOVER}; }
      .bl-vp-rec p { margin: 0; font-size: 11.5px; line-height: 1.5; color: ${MUTED}; }

      .bl-vp-transcript { margin-top: 16px; width: 100%; }
      .bl-vp-transcript summary { cursor: pointer; font-size: 12.5px; font-weight: 500; color: ${PERIWINKLE_HOVER}; list-style: none; }
      .bl-vp-transcript summary::-webkit-details-marker { display: none; }
      .bl-vp-transcript p { margin: 10px 0 0; font-size: 12px; line-height: 1.6; color: ${MUTED}; font-weight: 300; }

      .bl-vp-footer {
        display: flex; align-items: center; justify-content: center; gap: 6px;
        padding: 14px; border-top: 1px solid ${BORDER_SOFT}; font-size: 11px; color: ${MUTED};
      }
      .bl-vp-footer img { height: 15px; width: auto; }
    `}</style>
  );
}
