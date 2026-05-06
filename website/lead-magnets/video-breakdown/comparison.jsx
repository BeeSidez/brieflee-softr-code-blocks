// =====================================================================
// Vibe Coding block: Video Breakdown / Comparison table
// =====================================================================
// Drop into a Softr Vibe Coding block on /free-tool-video-breakdown.
//
// SEO note: this block targets every "Brieflee vs X" + "best video
// breakdown tool" + "best AI video analyzer" query. The most
// SEO-leveraging block on the page after the hero.
// =====================================================================

import { Check, X, Minus } from "lucide-react";

const BRIEFLEE_EYES =
  "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_sticker-blue-cartoon-eyes-looking-side-navy_2026-03.png";

// y = supported, n = not supported, p = partial / kind-of
const COMPETITORS = ["Brieflee", "Frame.io", "Air", "Dropbox Replay", "ChatGPT"];

const ROWS = [
  { label: "Free tier",                              values: ["y", "p", "p", "p", "y"] },
  { label: "Paste TikTok / Reel / Short URL",        values: ["y", "n", "n", "n", "n"] },
  { label: "Upload video file",                      values: ["y", "y", "y", "y", "n"] },
  { label: "Frame-by-frame AI analysis",             values: ["y", "n", "n", "n", "n"] },
  { label: "Hook timing scoring",                    values: ["y", "n", "n", "n", "n"] },
  { label: "CTA placement scoring",                  values: ["y", "n", "n", "n", "n"] },
  { label: "Engagement pattern detection",           values: ["y", "n", "n", "n", "n"] },
  { label: "Generates a creator brief",              values: ["y", "n", "n", "n", "p"] },
  { label: "Remix-ready output",                     values: ["y", "n", "n", "n", "p"] },
  { label: "Stores video files",                     values: ["n", "y", "y", "y", "n"] },
  { label: "Team comments + approvals",              values: ["n", "y", "y", "y", "n"] },
];

const ICON = {
  y: { El: Check, cls: "text-primary",         label: "Yes" },
  n: { El: X,     cls: "text-muted-foreground/40", label: "No" },
  p: { El: Minus, cls: "text-muted-foreground", label: "Partial" },
};

function Cell({ value, isFirst }) {
  const meta = ICON[value];
  const Icon = meta.El;
  return (
    <td
      className={`px-3 md:px-4 py-3 md:py-4 text-center ${
        isFirst ? "bg-primary/[0.06] border-x border-primary/20" : ""
      }`}
    >
      <span className="inline-flex items-center justify-center" aria-label={meta.label}>
        <Icon className={`h-5 w-5 ${meta.cls}`} strokeWidth={value === "y" ? 3 : 2.5} />
      </span>
    </td>
  );
}

export default function Block() {
  return (
    <div className="relative w-full">
      <div className="container py-16 md:py-20 lg:py-24">
        <div className="content max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card pl-1.5 pr-3 py-1 text-xs font-medium text-muted-foreground mb-5">
              <img src={BRIEFLEE_EYES} alt="" className="h-5 w-5" draggable={false} />
              Brieflee vs the rest
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] text-foreground">
              Frame.io organises. Brieflee scores.
            </h2>
            <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
              Frame.io, Air, and Dropbox Replay help you store, comment, and approve
              video. ChatGPT can't process video at all. Brieflee actually breaks down
              the video and tells you why it works.
            </p>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-[0_20px_60px_-25px_hsl(var(--primary)/0.25)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th
                      scope="col"
                      className="px-4 md:px-6 py-4 md:py-5 text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground min-w-[200px]"
                    >
                      Feature
                    </th>
                    {COMPETITORS.map((name, i) => (
                      <th
                        key={name}
                        scope="col"
                        className={`px-3 md:px-4 py-4 md:py-5 text-center text-xs md:text-sm font-bold uppercase tracking-wider ${
                          i === 0
                            ? "bg-primary/[0.06] border-x border-primary/20 text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row, ri) => (
                    <tr
                      key={ri}
                      className={
                        ri !== ROWS.length - 1 ? "border-b border-border/60" : ""
                      }
                    >
                      <th
                        scope="row"
                        className="px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-medium text-foreground text-left"
                      >
                        {row.label}
                      </th>
                      {row.values.map((v, vi) => (
                        <Cell key={vi} value={v} isFirst={vi === 0} />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-primary" strokeWidth={3} />
              Yes
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Minus className="h-4 w-4 text-muted-foreground" />
              Partial
            </span>
            <span className="inline-flex items-center gap-1.5">
              <X className="h-4 w-4 text-muted-foreground/40" />
              No
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
