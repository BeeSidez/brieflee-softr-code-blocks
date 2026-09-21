// =====================================================================
// Vibe Coding block: Single video clip detail (in-app modal)
// =====================================================================
// Renders inside the /videos-details Softr modal — opened from each
// card on the Discover videos grid via window.openSwModal(url, "xl").
//
// Big video player on the left, brand + QA + thresholds on the right.
// All QA + threshold values come through LOOKUP fields from the linked
// Format archetype, so this is one record + zero extra queries.
//
// SOFTR UI SETUP (one-time):
//   1. Create a Softr page at /videos-details with List Details enabled
//   2. Source tab → Database: brieflee beta → Table: videos
//   3. Visibility tab → logged-in app users
//   4. Page renders this block when a record ID is in the URL.
// =====================================================================

import { useRecord, useCurrentRecordId, q } from "@/lib/datasource";
import { Check, ChevronRight, Tag } from "lucide-react";

const videoFields = q.select({
  name:             "0woCp",  // FORMULA
  brand:            "qmyIv",  // SELECT
  industry:         "8zXEg",  // SELECT
  influencerCeleb:  "tNY4n",  // SINGLE_LINE_TEXT
  visualFormat:     "VuAGy",  // SINGLE_LINE_TEXT
  format:           "tnMBF",  // LINKED_RECORD → Formats
  formatTags:       "nSNCc",  // SELECT multi
  videoUrl:         "FiIAK",  // URL
  logoUrl:          "V2EkP",  // URL

  // Format archetype lookups (per-format QA rules + thresholds)
  descriptionLookup:       "gJOOB",
  whyItWorksLookup:        "IcImr",
  qaChecklistLookup:       "dGeM7",
  hookTacticLookup:        "MC9qB",
  hookTypeLookup:          "rsP5n",
  funnelStageLookup:       "EzI2F",
  productVisibilityLookup: "mvGj8",
  audioHookTimingLookup:   "W0PfM",
  visualHookLookup:        "ttkiO",
  ctaPlacementLookup:      "dIzTi",
  faceTimeLookup:          "JprfU",
  textLegibilityLookup:    "ZQhe6",
  audioClarityLookup:      "DFX8k",
  engagementPacingLookup:  "6uxDz",
  brandMentionCountLookup: "W0PfM",
});

const NAVY = "#001364";
const BRIEFLEE_EYES = "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_sticker-blue-cartoon-eyes-looking-side-navy_2026-03.png";

// Helpers
function selectLabels(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.map((x) => x?.label || x).filter(Boolean);
  return [v?.label || v].filter(Boolean);
}
function lookupFirst(v) {
  if (!v) return "";
  if (Array.isArray(v)) {
    const first = v[0];
    if (first?.label) return first.label;
    return first || "";
  }
  return v?.label || v || "";
}

function ThresholdRow({ label, value }) {
  if (!value || value === "None") return null;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  );
}

// =====================================================================
// MAIN BLOCK
// =====================================================================
export default function Block() {
  const recordId = useCurrentRecordId();
  const { data: record } = useRecord({ recordId, select: videoFields });
  const f = record?.fields || {};
  const brand = f.brand?.label || "";
  const industry = f.industry?.label || "";
  const visualFormat = typeof f.visualFormat === "string" ? f.visualFormat : "";
  const logo = f.logoUrl || "";
  const url = f.videoUrl || "";
  const influencer = f.influencerCeleb || "";

  const hookTactics  = selectLabels(f.hookTacticLookup);
  const hookTypes    = selectLabels(f.hookTypeLookup);
  const funnelStages = selectLabels(f.funnelStageLookup);
  const qaItems      = selectLabels(f.qaChecklistLookup);
  const description  = lookupFirst(f.descriptionLookup);
  const whyItWorks   = lookupFirst(f.whyItWorksLookup);

  const thresholds = [
    { label: "Product visibility",  value: lookupFirst(f.productVisibilityLookup) },
    { label: "Audio hook timing",   value: lookupFirst(f.audioHookTimingLookup) },
    { label: "Visual hook",         value: lookupFirst(f.visualHookLookup) },
    { label: "CTA placement",       value: lookupFirst(f.ctaPlacementLookup) },
    { label: "Face time",           value: lookupFirst(f.faceTimeLookup) },
    { label: "Text legibility",     value: lookupFirst(f.textLegibilityLookup) },
    { label: "Audio clarity",       value: lookupFirst(f.audioClarityLookup) },
    { label: "Engagement pacing",   value: lookupFirst(f.engagementPacingLookup) },
    { label: "Brand mention count", value: lookupFirst(f.brandMentionCountLookup) },
  ];

  // Build format-detail link if we have the linked Format record id.
  const formatLinked = Array.isArray(f.format) ? f.format[0] : f.format;
  const formatId = formatLinked?.id;
  const formatHref = formatId ? `/swipe-formats/r/${formatId}` : `/discover`;

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/[0.03] to-primary/[0.07]" />
      </div>

      <div className="container py-8 md:py-10">
        <div className="content max-w-6xl mx-auto">

          {/* Two-column layout — video left, ALL info stacked right */}
          <div className="grid md:grid-cols-[2fr_3fr] gap-6 md:gap-10 mb-8">

            {/* Video player */}
            <div className="flex items-start justify-center">
              {url ? (
                <video
                  src={url}
                  controls
                  controlsList="nodownload noplaybackrate noremoteplayback"
                  disablePictureInPicture
                  autoPlay
                  muted
                  playsInline
                  className="rounded-2xl max-h-[80vh] w-auto max-w-full"
                />
              ) : (
                <div className="p-16 text-center text-muted-foreground">No video</div>
              )}
            </div>

            {/* Info column — everything stacks here */}
            <div className="space-y-5">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 backdrop-blur pl-1.5 pr-3 py-1 text-xs font-medium text-muted-foreground">
                <img src={BRIEFLEE_EYES} alt="" className="h-5 w-5" draggable={false} />
                UGC Video Example
              </div>

              {/* Brand row */}
              <div className="flex items-center gap-3">
                {logo ? (
                  <img src={logo} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" draggable={false} />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-muted shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="font-bold text-foreground text-xl truncate" style={{ color: NAVY }}>{brand || "Brand"}</div>
                  {(industry || influencer) && (
                    <div className="text-sm text-muted-foreground truncate">
                      {industry}
                      {industry && influencer ? " · " : ""}
                      {influencer && `with ${influencer}`}
                    </div>
                  )}
                </div>
              </div>

              {/* Format pill linking back to format detail */}
              {visualFormat && (
                <a
                  href={formatHref}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Tag className="w-3 h-3" /> {visualFormat}
                </a>
              )}

              {/* Quick facts */}
              <dl className="space-y-2 text-sm">
                {hookTactics.length > 0 && (
                  <div className="flex gap-3">
                    <dt className="text-muted-foreground w-28 shrink-0">Hook tactic</dt>
                    <dd className="text-foreground">{hookTactics.join(", ")}</dd>
                  </div>
                )}
                {hookTypes.length > 0 && (
                  <div className="flex gap-3">
                    <dt className="text-muted-foreground w-28 shrink-0">Hook type</dt>
                    <dd className="text-foreground">{hookTypes.join(", ")}</dd>
                  </div>
                )}
                {funnelStages.length > 0 && (
                  <div className="flex gap-3">
                    <dt className="text-muted-foreground w-28 shrink-0">Funnel stage</dt>
                    <dd className="text-foreground">{funnelStages.join(", ")}</dd>
                  </div>
                )}
              </dl>

              {/* QA + Numbers side by side inside the right column */}
              <div className="border-t border-border pt-5 grid sm:grid-cols-2 gap-6">
                {qaItems.length > 0 && (
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Before you run it, check</h2>
                    <ul className="space-y-2">
                      {qaItems.map((q) => (
                        <li key={q} className="flex items-start gap-2 text-sm text-foreground">
                          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">The numbers</h2>
                  <div>
                    {thresholds.map((t) => (
                      <ThresholdRow key={t.label} label={t.label} value={t.value} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Why this format works */}
              {whyItWorks && (
                <div className="border-t border-border pt-5">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Why this format works</h2>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{whyItWorks}</p>
                </div>
              )}
            </div>
          </div>

          {/* See more in this format — full width below */}
          {visualFormat && formatId && (
            <a
              href={formatHref}
              className="flex items-center justify-between gap-3 bg-card border border-border rounded-2xl p-5 md:p-6 hover:border-primary/40 transition-colors group"
            >
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Want more like this?</div>
                <div className="text-lg font-bold text-foreground" style={{ color: NAVY }}>See every {visualFormat} video example</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform" />
            </a>
          )}

        </div>
      </div>
    </div>
  );
}
