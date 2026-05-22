// =====================================================================
// Vibe Coding block: Meta Andromeda Creative Calculator — Hero
// =====================================================================
// First block on /facebook-creative-calculator. Single-card interactive
// calculator. 3 required button-only questions (spend tier, current
// monthly creative output, industry) + 1 optional (creator roster size).
// All calculation is client-side — no Sonar, no Claude, no AI cost.
//
// Result panel reveals inline below the inputs when Calculate is clicked,
// showing:
//   1. Headline: "You need X creatives/month at your spend tier"
//   2. Gap card: "You're at Y%. Gap = Z creatives/month"
//   3. Cost-to-close: UGC / Influencer / In-house, per-creative + monthly
//   4. Format mix recommendation (UGC / Founder / Influencer / Brand-led)
//   5. CTA pointing at Brieflee's brief generator
//
// SOFTR UI SETUP:
//   1. Source tab → not bound to a table (no record creation in hero)
//   2. Visibility tab → public
//
// (Lead capture lives in the separate final-cta block on this page.)
// =====================================================================

import { useState, useMemo, useRef, useEffect } from "react";
import { useRecordCreate, q } from "@/lib/datasource";
import { ArrowRight, Check, Sparkles } from "lucide-react";

const NAVY = "#001364";
const PERIWINKLE = "#879CF7";

// Meta Andromeda calculator table (leads DB, table id ovLaeONEtbZ1BG)
// Schema refreshed 2026-05-19 via Tables API — dropped 43 legacy quiz
// fields, added the 12 new calculator-result fields below.
const createFields = q.select({
  email:                 "4HDoO",
  spendTier:             "H9U4g",
  outputTier:            "Z2Z9n",
  industry:              "Z43dH",
  rosterTier:            "6klFy",
  targetCreatives:       "ej3AR",
  gapCreatives:          "imG8H",
  percentOfTarget:       "60xzW",
  websiteUrl:            "7MWhH",
  pageUrl:               "fFJeL",
  clientUuid:            "NwbMA",
  source:                "PBSRz",
  name:                  "RFCta",
  // New computed/derived fields (added 2026-05-19)
  logoUrl:               "uV6xO",
  overallScore:          "7C69e",
  volumeScore:           "12Mgy",
  formatScore:           "gPK4F",
  annualCostToClose:     "TBggQ",
  annualOpportunityCost: "TSDX2",
});

// ---------------------------------------------------------------------
// Brand logo derivation — Google favicons service, same pattern as the
// brief generator. Free, no API key needed.
// ---------------------------------------------------------------------
function deriveLogoUrl(websiteUrl) {
  try {
    const u = new URL(/^https?:\/\//i.test(websiteUrl) ? websiteUrl : `https://${websiteUrl}`);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=128`;
  } catch {
    return "";
  }
}
function deriveBrandLabel(websiteUrl) {
  try {
    const u = new URL(/^https?:\/\//i.test(websiteUrl) ? websiteUrl : `https://${websiteUrl}`);
    const host = u.hostname.replace(/^www\./, "");
    const root = host.split(".")[0];
    return root ? root.charAt(0).toUpperCase() + root.slice(1) : "";
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------
// Brieflee Cloudinary icons — replacing emojis per brand voice rule
// ---------------------------------------------------------------------
const ICON_GAP        = "https://res.cloudinary.com/dchroynzv/image/upload/v1777998702/brieflee_icon_media-player-interface-icon-transparent_2026-05.png";
const ICON_TARGET     = "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_sticker-blue-target-bullseye-arrow-hit-goal_2026-03.png";
const ICON_MONEY      = "https://res.cloudinary.com/dchroynzv/image/upload/v1777998700/brieflee_icon_hundred-points-100-emoji-transparent_2026-05.png";
const ICON_SHIELD     = "https://res.cloudinary.com/dchroynzv/image/upload/v1777998694/brieflee_icon_approval-stamp-icon-transparent_2026-05.png";
const ICON_CHECKLIST  = "https://res.cloudinary.com/dchroynzv/image/upload/v1777998700/brieflee_icon_lined-bold-blocky-checklist-sticker-transparent_2026-05.png";
const ICON_BOLT       = "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_trendy-flat-lightning-bolt-sticker-transparent_2026-05.png";

// Shared lead-capture workflow — fires alongside the record write so
// EmailIt nurture + Google Sheet backup run for every magnet submission.
const EMAIL_WORKFLOW_URL = "https://workflows-api.softr.io/v1/workflows/1e28685f-1a24-4042-80ac-cadfedef7336/executions/22b90d5d-a73b-43b5-ac1b-f24843b781bd";

// Personal / throwaway email domains — blocked across every Brieflee
// lead-magnet form. Mirrors the shared FREE_EMAIL_DOMAINS list.
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com",
  "yahoo.com", "yahoo.co.uk", "yahoo.fr", "yahoo.de", "ymail.com",
  "hotmail.com", "hotmail.co.uk", "hotmail.fr", "live.com", "live.co.uk",
  "msn.com", "outlook.com", "outlook.co.uk",
  "aol.com",
  "icloud.com", "me.com", "mac.com",
  "proton.me", "protonmail.com", "pm.me",
  "mail.com", "gmx.com", "gmx.de", "gmx.net",
  "yandex.com", "yandex.ru",
  "zoho.com", "hey.com",
  "fastmail.com", "fastmail.fm",
  "tutanota.com", "tutanota.de",
  "mailinator.com", "guerrillamail.com", "10minutemail.com",
  "tempmail.com", "trashmail.com", "throwawaymail.com", "yopmail.com",
]);
function isWorkEmail(value) {
  const v = (value || "").trim().toLowerCase();
  if (!v) return false;
  const at = v.lastIndexOf("@");
  if (at === -1) return false;
  return !FREE_EMAIL_DOMAINS.has(v.slice(at + 1));
}

// ---------------------------------------------------------------------
// Calculator data — tiered lookups + cost ranges. Pure client-side math.
// USD throughout per Bev (2026-05-19).
// ---------------------------------------------------------------------
const SPEND_TIERS = [
  { id: "under-1k",  label: "<$1k",     target: 6,   summary: "starting out" },
  { id: "1-5k",      label: "$1–5k",    target: 15,  summary: "growth phase" },
  { id: "5-25k",     label: "$5–25k",   target: 35,  summary: "scaling" },
  { id: "25-100k",   label: "$25–100k", target: 80,  summary: "performance" },
  { id: "100k-plus", label: "$100k+",   target: 180, summary: "always-on" },
];

const OUTPUT_TIERS = [
  { id: "0-10",      label: "0–10",  value: 5   },
  { id: "11-30",     label: "11–30", value: 20  },
  { id: "31-75",     label: "31–75", value: 50  },
  { id: "75-plus",   label: "75+",   value: 100 },
];

const INDUSTRIES = [
  { id: "ecom",          label: "E-commerce / DTC" },
  { id: "saas",          label: "SaaS" },
  { id: "apps",          label: "Apps" },
  { id: "fintech",       label: "Finance / Fintech" },
  { id: "health-beauty", label: "Health & Beauty" },
  { id: "food-bev",      label: "Food & Beverage" },
  { id: "education",     label: "Education" },
  { id: "other",         label: "Other" },
];

const ROSTER_TIERS = [
  { id: "none",      label: "0" },
  { id: "1-2",       label: "1–2" },
  { id: "3-5",       label: "3–5" },
  { id: "6-10",      label: "6–10" },
  { id: "10-plus",   label: "10+" },
];

// Per-creative production cost ranges (USD)
const COST_PER_CREATIVE = {
  ugc:        { min: 100, max: 250,  label: "UGC creator" },
  influencer: { min: 400, max: 2000, label: "Influencer" },
  inHouse:    { min: 250, max: 600,  label: "In-house" },
};

// Format mix by spend tier — split by content type. Creator-led wins at
// every tier on Meta but the static/video share grows as spend scales.
const FORMAT_MIX_BY_SPEND = {
  "under-1k": [
    { name: "Creator-led", pct: 70, hint: "UGC, founder, customer testimonials" },
    { name: "Static",      pct: 20, hint: "Carousels, product shots" },
    { name: "Video",       pct: 10, hint: "Brand-shot motion" },
  ],
  "1-5k": [
    { name: "Creator-led", pct: 60, hint: "UGC, founder, customer testimonials" },
    { name: "Static",      pct: 25, hint: "Carousels, product shots" },
    { name: "Video",       pct: 15, hint: "Brand-shot motion" },
  ],
  "5-25k": [
    { name: "Creator-led", pct: 55, hint: "UGC, influencer, founder" },
    { name: "Video",       pct: 25, hint: "Brand-shot motion, cinematic b-roll" },
    { name: "Static",      pct: 20, hint: "Carousels, product shots" },
  ],
  "25-100k": [
    { name: "Creator-led", pct: 50, hint: "UGC, influencer, founder" },
    { name: "Video",       pct: 30, hint: "Brand-shot motion, cinematic b-roll" },
    { name: "Static",      pct: 20, hint: "Carousels, product shots" },
  ],
  "100k-plus": [
    { name: "Creator-led", pct: 45, hint: "UGC, influencer, founder, celebrity" },
    { name: "Video",       pct: 35, hint: "Brand-shot motion, cinematic b-roll" },
    { name: "Static",      pct: 20, hint: "Carousels, product shots" },
  ],
};

// QA pressure message scales with volume — manual brief-checking breaks
// down at higher creative volumes, which is the wedge for Brieflee.
const QA_MESSAGE_BY_SPEND = {
  "under-1k":  "Even at 6 creatives/month, briefs slip when you're moving fast. Brieflee scores every output against the brief so nothing wonky goes live.",
  "1-5k":      "15 creatives/month means weekly QA reviews. Brieflee checks every video against the brief in seconds, so you can scale without manually reviewing each one.",
  "5-25k":     "35 creatives/month makes manual QA impossible. Brieflee reviews every video against the brief before launch, catching brand-risk in seconds, not days.",
  "25-100k":   "80 creatives/month across multiple creators means brand drift waiting to happen. Brieflee scores every output against the brief automatically so nothing off-brand makes it to Meta.",
  "100k-plus": "180+ creatives/month is impossible to QA manually. Brieflee runs full review on every video — hook timing, format adherence, brand alignment — before anything goes live.",
};

// Hero asset — looping Brieflee features video (Cloudinary MP4).
const HERO_VIDEO_SRC = "https://res.cloudinary.com/dchroynzv/video/upload/v1777629899/brieflee_feature_brieflee-features-800-x-800-px_2025-07-v3.mp4";
const HERO_VIDEO_ALT = "Brieflee scoring creator videos against the brief";

// Floating 3D Meta + Facebook logos around the hero asset. Desktop + mobile
// coords so the cluster scales down on small screens. Positioned relative
// to the right column of the hero grid.
const META_LOGO = "https://res.cloudinary.com/dchroynzv/image/upload/v1778794660/brieflee_icon_meta-logo-3d-transparent_2026-05.png";
const FACEBOOK_LOGO = "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_facebook-logo-3d-transparent_2026-05.png";
const FLOATING_LOGOS = [
  { src: FACEBOOK_LOGO, alt: "Facebook", desktop: { top: "-10%",   right: "-8%",  size: 110, rotate: 12  }, mobile: { top: "-5%",  right: "-4%",  size: 64, rotate: 12  }, delay: 0,   reverse: false },
  { src: META_LOGO,     alt: "Meta",     desktop: { top: "38%",    right: "-14%", size: 78,  rotate: 6   }, mobile: { top: "40%",  right: "-7%",  size: 46, rotate: 6   }, delay: 0.5, reverse: true  },
  { src: META_LOGO,     alt: "Meta",     desktop: { bottom: "-4%", right: "0%",   size: 92,  rotate: -14 }, mobile: { bottom: "-2%", right: "0%", size: 54, rotate: -14 }, delay: 1.0, reverse: false },
  { src: META_LOGO,     alt: "Meta",     desktop: { bottom: "12%", left: "-12%",  size: 72,  rotate: -8  }, mobile: { bottom: "8%",  left: "-5%", size: 42, rotate: -8  }, delay: 0.3, reverse: true  },
  { src: FACEBOOK_LOGO, alt: "Facebook", desktop: { top: "8%",     left: "-10%",  size: 88,  rotate: 18  }, mobile: { top: "4%",     left: "-5%", size: 52, rotate: 18  }, delay: 0.8, reverse: false },
];

// ---------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------
function formatUsd(n) {
  if (n >= 1000) {
    const k = n / 1000;
    return `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return `$${n.toLocaleString("en-US")}`;
}
function formatRange(min, max) {
  return `${formatUsd(min)}–${formatUsd(max)}`;
}

// ---------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------
function FloatingLogo({ logo, isDesktop }) {
  const dims = isDesktop ? logo.desktop : logo.mobile;
  return (
    <div
      className="absolute z-20"
      style={{
        top: dims.top ?? "auto",
        bottom: dims.bottom ?? "auto",
        left: dims.left ?? "auto",
        right: dims.right ?? "auto",
        width: dims.size,
        height: dims.size,
        transform: `rotate(${dims.rotate}deg)`,
        animation: `briefleeHeroFloatY 7s ease-in-out ${logo.delay}s infinite ${logo.reverse ? "alternate-reverse" : "alternate"}`,
        filter: "drop-shadow(0 12px 24px rgba(99, 102, 241, 0.20))",
        pointerEvents: "none",
      }}
    >
      <img src={logo.src} alt={logo.alt} className="w-full h-full object-contain" draggable={false} />
    </div>
  );
}

function ButtonRow({ label, optional, options, value, onChange }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        {optional ? <span className="text-[11px] text-muted-foreground">Optional</span> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value?.id === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(selected ? null : opt)}
              className={`px-3.5 py-2 rounded-full border-2 text-sm font-semibold transition-colors ${
                selected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary/40"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ResultCard({ icon, title, children, wide }) {
  return (
    <div
      className={`rounded-2xl p-5 md:p-6 ${wide ? "md:col-span-2" : ""}`}
      style={{ background: "rgba(135,156,247,0.08)" }}
    >
      <div className="flex items-center gap-3 mb-3">
        {icon ? <span className="text-2xl">{icon}</span> : null}
        <h3 className="text-lg md:text-xl font-bold leading-none" style={{ color: NAVY }}>
          {title}
        </h3>
      </div>
      <div className="text-sm text-foreground leading-relaxed">{children}</div>
    </div>
  );
}

// Score card — used in the 3-card scorecard row of the result panel.
// `primary` variant is the headline composite score (navy fill, white text).
// Default variant is the supporting cards (tinted periwinkle, navy text).
function ScoreCard({ label, score, caption, primary }) {
  const safeScore = Math.max(0, Math.min(100, Number.isFinite(score) ? score : 0));
  const bg = primary ? NAVY : "rgba(135,156,247,0.10)";
  const textColor = primary ? "#fff" : NAVY;
  const labelColor = primary ? "rgba(255,255,255,0.72)" : NAVY;
  const captionColor = primary ? "rgba(255,255,255,0.78)" : "var(--muted-foreground)";
  const trackBg = primary ? "rgba(255,255,255,0.18)" : "rgba(135,156,247,0.22)";
  const barBg = primary ? "#fff" : PERIWINKLE;

  return (
    <div
      className="rounded-2xl p-5 md:p-6 flex flex-col"
      style={{
        background: bg,
        boxShadow: primary ? "0 10px 30px -12px rgba(0,19,100,0.35)" : "none",
        border: primary ? "none" : "1px solid rgba(135,156,247,0.22)",
      }}
    >
      <div
        className="text-[11px] font-bold uppercase tracking-wider mb-2"
        style={{ color: labelColor, letterSpacing: "0.08em" }}
      >
        {label}
      </div>
      <div className="flex items-baseline gap-1 mb-3">
        <span
          className={primary ? "text-5xl md:text-6xl" : "text-4xl md:text-5xl"}
          style={{ color: textColor, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.02em" }}
        >
          {safeScore}
        </span>
        <span
          className="text-sm md:text-base"
          style={{ color: labelColor, fontWeight: 600 }}
        >
          /100
        </span>
      </div>
      <div
        className="w-full h-1.5 rounded-full overflow-hidden mb-3"
        style={{ background: trackBg }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${safeScore}%`, background: barBg }}
        />
      </div>
      {caption ? (
        <p
          className="text-xs md:text-sm leading-snug"
          style={{ color: captionColor, opacity: primary ? 1 : 0.85 }}
        >
          {caption}
        </p>
      ) : null}
    </div>
  );
}

// =====================================================================
// MAIN BLOCK
// =====================================================================
export default function Block() {
  // Email gate state
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [gateError, setGateError] = useState("");
  const [gateStatus, setGateStatus] = useState("idle"); // idle | submitting | sent
  const isUnlocked = gateStatus === "sent";

  // Calculator state
  const [spend, setSpend] = useState(null);
  const [output, setOutput] = useState(null);
  const [industry, setIndustry] = useState(null);
  const [roster, setRoster] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const resultRef = useRef(null);
  const createRecord = useRecordCreate({ fields: createFields });

  const canCalculate = !!spend && !!output && !!industry;

  async function handleEmailSubmit() {
    if (!email.trim() || !website.trim()) {
      setGateError("Fill in both fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setGateError("Enter a valid work email.");
      return;
    }
    if (!isWorkEmail(email)) {
      setGateError("Use your company email instead. Personal @gmail.com, @yahoo.com, etc. aren't supported.");
      return;
    }
    setGateStatus("submitting");
    setGateError("");
    try {
      await fetch(EMAIL_WORKFLOW_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          website: website.trim(),
          source: "meta-andromeda-calculator",
          page_url: typeof window !== "undefined" ? window.location.href : "",
          submitted_at: new Date().toISOString(),
        }),
      });
    } catch (e) {
      console.error("Lead capture failed (continuing anyway):", e);
    }
    setGateStatus("sent");
  }

  const result = useMemo(() => {
    if (!spend || !output) return null;
    const target = spend.target;
    const current = output.value;
    const gap = Math.max(0, target - current);
    const percentOfTarget = target ? Math.min(100, Math.round((current / target) * 100)) : 0;
    const monthlyCost = (k) => ({
      min: gap * COST_PER_CREATIVE[k].min,
      max: gap * COST_PER_CREATIVE[k].max,
    });

    // Composite scores 0–100
    const volumeScore = percentOfTarget;
    // Format score — roster + spend tier proxy for format diversity
    const rosterFactor = roster
      ? { "none": 0, "1-2": 30, "3-5": 60, "6-10": 85, "10-plus": 100 }[roster.id] ?? 0
      : 40; // unknown roster → middling default
    const formatScore = Math.round(0.5 * volumeScore + 0.5 * rosterFactor);
    const overallScore = Math.round(0.6 * volumeScore + 0.4 * formatScore);

    // Cost analysis — annualised
    const midMonthlyCost = (k) => Math.round((monthlyCost(k).min + monthlyCost(k).max) / 2);
    const annualCostToClose = (midMonthlyCost("ugc") + midMonthlyCost("influencer") + midMonthlyCost("inHouse")) / 3 * 12;
    // Opportunity cost — heuristic: every missing creative per month leaves
    // ~$80–$120 in CPM-fatigue waste depending on spend tier. Higher spend
    // tiers waste more per missing creative because the fatigue curve is
    // steeper.
    const opportunityPerCreativePerMonth =
      spend.id === "100k-plus" ? 200 :
      spend.id === "25-100k"   ? 140 :
      spend.id === "5-25k"     ? 100 :
      spend.id === "1-5k"      ? 60  :
      40;
    const annualOpportunityCost = Math.round(gap * opportunityPerCreativePerMonth * 12);

    // Score verdicts (short)
    const verdictFor = (score) =>
      score >= 80 ? "On target." :
      score >= 60 ? "Close, but you'll fatigue ad sets fast." :
      score >= 40 ? "Big gap. Meta is starving for fresh creative." :
      "Severe under-supply.";

    // Three prioritised actions based on biggest gaps
    const fixesFirst = [];
    if (volumeScore < 80) {
      fixesFirst.push({
        title: `Add ${gap} creatives/month`,
        body: `You're at ${percentOfTarget}% of the target for $${spend.label.replace(/[<$,]/g, "")} spend. Easiest lever: book 2-3 UGC creators to scale output fast.`,
      });
    }
    if (rosterFactor < 60) {
      fixesFirst.push({
        title: roster && roster.id === "none" ? "Build a creator roster" : "Expand your creator roster",
        body: roster && roster.id === "none"
          ? "You have zero creators in rotation. Aim for 3-5 to give Andromeda matching options."
          : `Currently in the ${roster?.label || "small"} bracket. Aim for 6-10 creators to unlock the algorithm's matching headroom.`,
      });
    }
    fixesFirst.push({
      title: "Diversify your format mix",
      body: `Heavy on UGC at your tier is fine, but add a brand-led concept and a static carousel to give Meta different fits.`,
    });

    return {
      target,
      current,
      gap,
      percentOfTarget,
      volumeScore,
      formatScore,
      overallScore,
      annualCostToClose: Math.round(annualCostToClose),
      annualOpportunityCost,
      verdict: verdictFor(overallScore),
      volumeVerdict: verdictFor(volumeScore),
      formatVerdict: verdictFor(formatScore),
      ugc: { perCreative: COST_PER_CREATIVE.ugc, monthly: monthlyCost("ugc") },
      influencer: { perCreative: COST_PER_CREATIVE.influencer, monthly: monthlyCost("influencer") },
      inHouse: { perCreative: COST_PER_CREATIVE.inHouse, monthly: monthlyCost("inHouse") },
      formatMix: FORMAT_MIX_BY_SPEND[spend.id] || [],
      qaMessage: QA_MESSAGE_BY_SPEND[spend.id] || QA_MESSAGE_BY_SPEND["5-25k"],
      fixesFirst: fixesFirst.slice(0, 3),
    };
  }, [spend, output, roster]);

  useEffect(() => {
    if (showResult && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showResult]);

  async function handleCalculate() {
    if (!canCalculate || !isUnlocked || !result) return;

    // Write the calculator submission to the Meta Andromeda table.
    // Fire-and-forget — don't block the result reveal if it fails.
    if (createRecord.enabled) {
      const clientUuid =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `andromeda-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      createRecord
        .mutateAsync({
          email: email.trim(),
          spendTier: spend.label,
          outputTier: output.label,
          industry: industry.label,
          rosterTier: roster?.label || "",
          targetCreatives: result.target,
          gapCreatives: result.gap,
          percentOfTarget: result.percentOfTarget,
          websiteUrl: website.trim(),
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
          clientUuid,
          source: "meta-andromeda-calculator",
          name: `${industry.label} · ${spend.label} · ${new Date().toISOString().slice(0, 10)}`,
          // Computed/derived fields
          logoUrl: deriveLogoUrl(website),
          overallScore: result.overallScore,
          volumeScore: result.volumeScore,
          formatScore: result.formatScore,
          annualCostToClose: result.annualCostToClose,
          annualOpportunityCost: result.annualOpportunityCost,
        })
        .catch((e) => console.error("Andromeda record write failed:", e));
    }

    setShowResult(true);
  }

  return (
    <div className="relative w-full overflow-hidden">
      <style>{`
        @keyframes briefleeHeroFloatY {
          0%   { transform: translateY(0) rotate(var(--rot, 0deg)); }
          100% { transform: translateY(-16px) rotate(var(--rot, 0deg)); }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/[0.03] to-primary/[0.07]" />
      </div>

      <div className="container py-14 md:py-20 lg:py-24 relative">
        <div className="content max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
            {/* LEFT — text + gate/calculator */}
            <div className="space-y-6">
              {/* Eyebrow */}
              <div
                className="inline-flex items-center"
                style={{
                  gap: 10,
                  padding: "10px 18px",
                  background: "rgba(135,156,247,0.16)",
                  color: NAVY,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  borderRadius: 999,
                  width: "fit-content",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: PERIWINKLE,
                    boxShadow: `0 0 0 3px ${PERIWINKLE}33`,
                  }}
                />
                Meta Andromeda Creative Calculator
              </div>

              {/* H1 */}
              <h1 className="font-bold tracking-tight leading-[1.05]">
                <span className="block text-3xl md:text-4xl lg:text-5xl" style={{ color: NAVY }}>
                  How much creative do you need
                </span>
                <span className="block text-3xl md:text-4xl lg:text-5xl mt-1" style={{ color: PERIWINKLE }}>
                  to win on Meta?
                </span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
                Andromeda rewards fresh creative. See the volume you need at your spend tier, where your gap is, and what it costs to close.
              </p>

              {/* Email gate */}
              {!isUnlocked && (
                <div className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.35)]">
                  <div className="flex items-center gap-3 mb-5">
                    <img
                      src="https://res.cloudinary.com/dchroynzv/image/upload/v1778010104/brieflee_icon_padlock-sticker-blue-transparent_2026-05.png"
                      alt=""
                      className="w-10 h-10 shrink-0 object-contain"
                      draggable={false}
                    />
                    <div>
                      <h2 className="text-base font-bold" style={{ color: NAVY }}>Unlock the calculator</h2>
                      <p className="text-xs text-muted-foreground">Drop your work email and brand website to see your gap.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Work email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@brand.com"
                          className="w-full h-11 px-3 rounded-xl border-2 border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Brand website</label>
                        <input
                          type="text"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="brand.com"
                          className="w-full h-11 px-3 rounded-xl border-2 border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    {gateError && <p className="text-sm text-destructive">{gateError}</p>}
                    <button
                      type="button"
                      onClick={handleEmailSubmit}
                      disabled={gateStatus === "submitting"}
                      className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                    >
                      {gateStatus === "submitting" ? "Unlocking…" : "Unlock the calculator"}
                    </button>
                    <p className="text-xs text-muted-foreground text-center">
                      Free to use. One-click unsubscribe from the follow-up emails.
                    </p>
                  </div>
                </div>
              )}

              {/* Inputs card — only after the gate is unlocked */}
              {isUnlocked && (
                <div className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.35)] space-y-5">
                  <ButtonRow
                    label="Monthly Meta ad spend"
                    options={SPEND_TIERS}
                    value={spend}
                    onChange={(o) => { setSpend(o); setShowResult(false); }}
                  />
                  <ButtonRow
                    label="Current monthly creative output"
                    options={OUTPUT_TIERS}
                    value={output}
                    onChange={(o) => { setOutput(o); setShowResult(false); }}
                  />
                  <ButtonRow
                    label="Industry"
                    options={INDUSTRIES}
                    value={industry}
                    onChange={(o) => { setIndustry(o); setShowResult(false); }}
                  />
                  <ButtonRow
                    label="Creator roster size"
                    optional
                    options={ROSTER_TIERS}
                    value={roster}
                    onChange={(o) => { setRoster(o); setShowResult(false); }}
                  />

                  <button
                    type="button"
                    onClick={handleCalculate}
                    disabled={!canCalculate}
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 inline-flex items-center justify-center gap-2"
                  >
                    Calculate my gap <Sparkles className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT — hero video asset + floating logos */}
            <div className="relative mx-auto w-full max-w-[360px] md:max-w-[440px] lg:max-w-[480px] aspect-square mt-6 lg:mt-0">
              <video
                src={HERO_VIDEO_SRC}
                aria-label={HERO_VIDEO_ALT}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover rounded-full shadow-[0_20px_60px_-20px_rgba(0,19,100,0.35)]"
                style={{ background: "rgba(135,156,247,0.08)" }}
              />
              {/* Desktop floating logos */}
              <div className="hidden md:block absolute inset-0 pointer-events-none">
                {FLOATING_LOGOS.map((logo, i) => (
                  <FloatingLogo key={`d-${i}`} logo={logo} isDesktop />
                ))}
              </div>
              {/* Mobile floating logos */}
              <div className="md:hidden absolute inset-0 pointer-events-none">
                {FLOATING_LOGOS.map((logo, i) => (
                  <FloatingLogo key={`m-${i}`} logo={logo} isDesktop={false} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Result panel */}
        {showResult && result ? (
          <div ref={resultRef} className="content max-w-4xl mx-auto mt-10 md:mt-14 space-y-4">
            {/* Brand identity row */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 md:p-6 rounded-2xl bg-card border border-border">
              {deriveLogoUrl(website) ? (
                <img
                  src={deriveLogoUrl(website)}
                  alt={deriveBrandLabel(website) || ""}
                  className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-2xl object-contain bg-white shadow-sm p-2"
                  draggable={false}
                />
              ) : null}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-lg md:text-xl font-bold mb-1" style={{ color: NAVY }}>
                  {deriveBrandLabel(website) || "Your"} readiness for Andromeda
                </h2>
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  {[spend.label, industry.label, `${output.label} creatives/mo`].map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: "rgba(135,156,247,0.16)", color: NAVY }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Headline number */}
            <div
              className="rounded-3xl p-7 md:p-10 text-center"
              style={{ background: "rgba(135,156,247,0.16)" }}
            >
              <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: NAVY }}>
                Recommended monthly output
              </div>
              <div
                className="text-6xl md:text-7xl font-bold tracking-tight mb-2"
                style={{ color: NAVY, lineHeight: 1 }}
              >
                {result.target}
                <span className="text-2xl md:text-3xl font-semibold opacity-70"> creatives/mo</span>
              </div>
              <p className="text-base md:text-lg text-foreground/80 max-w-2xl mx-auto mt-3">
                {spend.summary === "starting out"
                  ? "At <$1k/month you only need volume to test angles. The bar is low but consistency matters."
                  : spend.summary === "growth phase"
                  ? "$1-5k/month spend needs steady variety. Without it, ad sets stagnate within a fortnight."
                  : spend.summary === "scaling"
                  ? "$5-25k/month is where Andromeda's fatigue curve gets steep. Volume is the lever, not bid strategy."
                  : spend.summary === "performance"
                  ? "$25-100k/month: you're competing for impressions against brands with full creative teams. Volume is non-negotiable."
                  : "$100k+/month: you're running an always-on engine. Anything less than this volume leaves performance on the table."}
              </p>
            </div>

            {/* 3-card scorecard row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <ScoreCard
                label="Overall readiness"
                score={result.overallScore}
                caption={result.verdict}
                primary
              />
              <ScoreCard
                label="Volume score"
                score={result.volumeScore}
                caption={`You're at ${result.percentOfTarget}% of target.`}
              />
              <ScoreCard
                label="Format diversity"
                score={result.formatScore}
                caption={result.formatVerdict}
              />
            </div>

            {/* Cost to close + Annual opportunity cost */}
            <div
              className="rounded-2xl p-5 md:p-6"
              style={{ background: "rgba(135,156,247,0.08)" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <img src={ICON_MONEY} alt="" className="w-9 h-9 shrink-0 object-contain" draggable={false} />
                <h3 className="text-lg md:text-xl font-bold leading-none" style={{ color: NAVY }}>
                  Cost to close the {result.gap}-creative gap
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {[
                  { key: "ugc",        data: result.ugc },
                  { key: "influencer", data: result.influencer },
                  { key: "inHouse",    data: result.inHouse },
                ].map(({ key, data }) => (
                  <div key={key} className="rounded-xl bg-white/60 p-4 border border-border/40">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      {COST_PER_CREATIVE[key].label}
                    </div>
                    <div className="text-xl font-bold" style={{ color: NAVY }}>
                      {formatRange(data.monthly.min, data.monthly.max)}
                      <span className="text-sm font-semibold opacity-70">/mo</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatRange(data.perCreative.min, data.perCreative.max)} per creative
                    </div>
                  </div>
                ))}
              </div>

              {/* Annual opportunity cost callout */}
              <div className="rounded-xl border border-border/60 bg-white/40 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Annual opportunity cost if the gap stays open
                  </div>
                  <div className="text-2xl md:text-3xl font-bold" style={{ color: NAVY }}>
                    ~{formatUsd(result.annualOpportunityCost)}/year
                  </div>
                </div>
                <p className="text-xs text-muted-foreground sm:max-w-xs sm:text-right">
                  Estimated wasted spend from ad-fatigue at your tier. Higher spend means a steeper curve.
                </p>
              </div>
            </div>

            {/* Format mix at this tier */}
            <div
              className="rounded-2xl p-5 md:p-6"
              style={{ background: "rgba(135,156,247,0.08)" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <img src={ICON_TARGET} alt="" className="w-9 h-9 shrink-0 object-contain" draggable={false} />
                <h3 className="text-lg md:text-xl font-bold leading-none" style={{ color: NAVY }}>
                  Format mix at this tier
                </h3>
              </div>
              <div className="space-y-3">
                {result.formatMix.map((row) => (
                  <div key={row.name}>
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-sm font-bold w-14 shrink-0" style={{ color: NAVY }}>
                        {row.pct}%
                      </span>
                      <span className="text-sm font-semibold flex-1" style={{ color: NAVY }}>
                        {row.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="w-14 shrink-0" />
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(135,156,247,0.15)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${row.pct}%`, background: PERIWINKLE }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-14 shrink-0" />
                      <span className="text-xs text-muted-foreground">{row.hint}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                Browse{" "}
                <a href="/ugc-video-examples" className="underline font-semibold" style={{ color: NAVY }}>
                  42 UGC formats
                </a>{" "}
                to plan the creator-led share.
              </p>
            </div>

            {/* What to fix first */}
            <div
              className="rounded-2xl p-5 md:p-6"
              style={{ background: "rgba(135,156,247,0.08)" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <img src={ICON_CHECKLIST} alt="" className="w-9 h-9 shrink-0 object-contain" draggable={false} />
                <h3 className="text-lg md:text-xl font-bold leading-none" style={{ color: NAVY }}>
                  What to fix first
                </h3>
              </div>
              <div className="space-y-3">
                {result.fixesFirst.map((fix, i) => (
                  <div key={i} className="rounded-xl bg-white/60 p-4 border border-border/40 flex gap-4">
                    <div
                      className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: NAVY, color: "#fff" }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm md:text-base mb-1" style={{ color: NAVY }}>
                        {fix.title}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{fix.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QA / brand safety + CTA */}
            <div
              className="rounded-2xl p-6 md:p-8"
              style={{ background: NAVY, color: "#fff" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <img src={ICON_SHIELD} alt="" className="w-9 h-9 shrink-0 object-contain" draggable={false} />
                <h3 className="text-xl md:text-2xl font-bold leading-tight">
                  Stop slop before it goes live.
                </h3>
              </div>
              <p className="text-sm md:text-base opacity-90 max-w-2xl leading-relaxed mb-5">
                {result.qaMessage}
              </p>
              <div className="flex flex-wrap gap-3 items-center">
                <a
                  href="/free-tool-ai-brief-generator"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
                  style={{ background: PERIWINKLE, color: NAVY }}
                >
                  Generate a brief for free <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="/free-tool-video-breakdown"
                  className="inline-flex items-center gap-2 h-12 px-5 rounded-xl font-semibold text-sm border-2 transition-colors hover:bg-white/10"
                  style={{ borderColor: "rgba(255,255,255,0.25)", color: "#fff" }}
                >
                  Or check a video first
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* ============================================================ */}
      {/* HOW IT WORKS — 3-step explainer of the calculator flow         */}
      {/* ============================================================ */}
      <div className="relative w-full border-t border-border">
        <div className="container py-14 md:py-20">
          <div className="content max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.1]" style={{ color: NAVY }}>
                How it works
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 md:gap-10">
              {[
                {
                  n: "1",
                  title: "Tell us your spend and current output",
                  body: "Three quick taps. Monthly Meta spend, current creative volume, industry. No typing, no spreadsheet.",
                },
                {
                  n: "2",
                  title: "See your gap instantly",
                  body: "We score your current output against the volume Andromeda is rewarding at your spend tier. You see the number, the gap, and your verdict.",
                },
                {
                  n: "3",
                  title: "Get a cost-to-close plan",
                  body: "The result panel shows the format mix you should aim for, plus what closing the gap costs across UGC, influencer, and in-house. Take it to your team.",
                },
              ].map((s) => (
                <div key={s.n} className="text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4">
                    {s.n}
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2" style={{ color: NAVY }}>
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* WHAT IS META ANDROMEDA — educational long-form (the shift)     */}
      {/* ============================================================ */}
      <div className="relative w-full bg-muted/20 border-y border-border">
        <div className="container py-14 md:py-20">
          <div className="content max-w-3xl mx-auto">
            <div className="text-center mb-10 md:mb-14">
              <div
                className="inline-flex items-center mb-5"
                style={{
                  gap: 10,
                  padding: "8px 16px",
                  background: "rgba(135,156,247,0.16)",
                  color: NAVY,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  borderRadius: 999,
                }}
              >
                The shift
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]" style={{ color: NAVY }}>
                What is Meta Andromeda?
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mt-4 leading-relaxed">
                Plain English, no rocket science. Here's what actually changed and what you have to do about it.
              </p>
            </div>

            <div className="space-y-10">
              <section>
                <h3 className="text-xl md:text-2xl font-bold mb-3" style={{ color: NAVY }}>
                  It's just a tech upgrade.
                </h3>
                <p className="text-base text-foreground leading-relaxed">
                  Andromeda is Meta's ad-ranking engine. Hardware, software, machine learning, mixed together. Interesting if you're an engineer, irrelevant if you're a marketer. The real story is what Andromeda decides to do with the signals it now has.
                </p>
              </section>

              <section>
                <h3 className="text-xl md:text-2xl font-bold mb-3" style={{ color: NAVY }}>
                  Before Andromeda, Meta was shallow.
                </h3>
                <p className="text-base text-foreground leading-relaxed">
                  You looked at shoe ads, clicked on a shoe page, liked some shoe content. Meta concluded: "this person likes shoes." That was the whole logic. Targeting an audience meant telling Meta "find me people who like shoes," and Meta would do its best.
                </p>
              </section>

              <section>
                <h3 className="text-xl md:text-2xl font-bold mb-3" style={{ color: NAVY }}>
                  After Andromeda, Meta watches everything.
                </h3>
                <p className="text-base text-foreground leading-relaxed mb-4">
                  Andromeda doesn't just notice that you like shoes. It notices:
                </p>
                <ul className="space-y-2 text-base text-foreground leading-relaxed">
                  <li className="flex gap-3"><span className="text-primary font-bold shrink-0">•</span> what colour shoes make you stop scrolling</li>
                  <li className="flex gap-3"><span className="text-primary font-bold shrink-0">•</span> which design slows your thumb down</li>
                  <li className="flex gap-3"><span className="text-primary font-bold shrink-0">•</span> when you're browsing vs. when you actually buy</li>
                  <li className="flex gap-3"><span className="text-primary font-bold shrink-0">•</span> whether you respond to video or static, emotional or funny, realistic or aspirational</li>
                  <li className="flex gap-3"><span className="text-primary font-bold shrink-0">•</span> whether you're shopping from your sofa at 11pm, your desk at 11am, or your commute at 8am</li>
                </ul>
                <p className="text-base text-foreground leading-relaxed mt-4">
                  Meta now builds a full behavioural pattern of every single user. Every scroll, every pause, every purchase, connected.
                </p>
              </section>

              <section>
                <h3 className="text-xl md:text-2xl font-bold mb-3" style={{ color: NAVY }}>
                  Targeting moved out of the adset.<br />It lives in your creative now.
                </h3>
                <p className="text-base text-foreground leading-relaxed mb-3">
                  This is the part most teams miss. Meta isn't matching adsets to audiences anymore. It's matching <span className="font-bold">creatives</span> to audiences. The audience signal Meta cares about is no longer your targeting box. It's the variations inside the creative itself.
                </p>
                <p className="text-base text-foreground leading-relaxed">
                  Your creative decides who sees your ad. Not your adset.
                </p>
              </section>

              <section className="grid md:grid-cols-2 gap-4 pt-2">
                <div className="rounded-2xl p-6 border-2" style={{ borderColor: "rgba(34,197,94,0.4)", background: "rgba(34,197,94,0.06)" }}>
                  <h4 className="font-bold text-foreground mb-2">Andromeda helps you when…</h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    You're producing many variations: different angles, formats, personas, contexts. The algorithm has options to test, and matches the right creative to the right person.
                  </p>
                </div>
                <div className="rounded-2xl p-6 border-2" style={{ borderColor: "rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.06)" }}>
                  <h4 className="font-bold text-foreground mb-2">Andromeda hurts you when…</h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    You're producing a handful of similar creatives. Meta has nothing to match against, the algorithm can't do its job, and your ads underperform.
                  </p>
                </div>
              </section>

              <section className="text-center pt-4">
                <p
                  className="inline-block text-base md:text-lg font-semibold leading-relaxed px-6 py-4 rounded-2xl"
                  style={{ background: "rgba(135,156,247,0.16)", color: NAVY }}
                >
                  Multi-variation content = Andromeda is your best ad buyer.<br />
                  One-note content = Andromeda quietly kills your spend.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* WHAT ANDROMEDA DEMANDS — 6 operational benchmark cards         */}
      {/* ============================================================ */}
      <div className="relative w-full border-b border-border">
        <div className="container py-14 md:py-20">
          <div className="content max-w-4xl mx-auto">
            <div className="text-center mb-10 md:mb-14">
              <div
                className="inline-flex items-center mb-5"
                style={{
                  gap: 10,
                  padding: "8px 16px",
                  background: "rgba(135,156,247,0.16)",
                  color: NAVY,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  borderRadius: 999,
                }}
              >
                Operational benchmarks
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]" style={{ color: NAVY }}>
                What Andromeda demands
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mt-4 leading-relaxed max-w-2xl mx-auto">
                Six operational thresholds the brands winning under Andromeda are hitting. The calculator scores you against these.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  icon: "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_trendy-flat-lightning-bolt-sticker-transparent_2026-05.png",
                  title: "Creative volume",
                  body: "The brands winning under Andromeda produce 30+ unique creatives a month. Variation is the targeting signal now. Fewer creatives, fewer matches.",
                  benchmark: "30+ unique creatives / month",
                },
                {
                  icon: "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_trendy-flat-paint-palette-sticker-transparent_2026-05.png",
                  title: "Format spread",
                  body: "Don't stay in one format. Rotate across yappers, demos, founder, reactions, testimonials, greenscreens. Meta matches different formats to different viewers.",
                  benchmark: "4-6 different formats live at any time",
                },
                {
                  icon: "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_sticker-blue-cartoon-eyes-looking-side-navy_2026-03.png",
                  title: "Creator roster",
                  body: "Different creators = different angles, energy, demographics. Andromeda picks. You can't predict who lands with which audience, so give Meta options.",
                  benchmark: "6-10 creators in rotation",
                },
                {
                  icon: "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_sticker-red-stopwatch-timer-countdown_2026-03.png",
                  title: "Approval speed",
                  body: "Brief to live in under a week. Slow approval cycles compound. Every extra day is a creative not being tested, a signal Andromeda doesn't get.",
                  benchmark: "<1 week from brief to live",
                },
                {
                  icon: "https://res.cloudinary.com/dchroynzv/image/upload/v1777998694/brieflee_icon_approval-stamp-icon-transparent_2026-05.png",
                  title: "Acceptance rate",
                  body: "If you're rejecting more than a quarter of submissions, your brief is the problem, not the creators. High rejection rates strangle output.",
                  benchmark: "<25% submissions revised or rejected",
                },
                {
                  icon: "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_sticker-watch-video-button-blue-hand-cursor-cta_2026-03.png",
                  title: "Adset structure",
                  body: "Targeting moved out of the adset and into the creative. Consolidate down. More creatives in fewer adsets lets Andromeda do its job, not the other way around.",
                  benchmark: "1-3 adsets per campaign, not 10+",
                },
              ].map((d) => (
                <div key={d.title} className="bg-card border border-border rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                  <div className="flex items-center gap-4 md:flex-1 md:min-w-0">
                    <img src={d.icon} alt="" className="w-12 h-12 shrink-0 object-contain" draggable={false} />
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground text-base md:text-lg" style={{ color: NAVY }}>{d.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{d.body}</p>
                    </div>
                  </div>
                  <div
                    className="md:w-64 md:shrink-0 md:border-l md:border-border md:pl-6 text-sm font-semibold leading-relaxed"
                    style={{ color: NAVY }}
                  >
                    {d.benchmark}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* FINAL CTA — radial halo, eyebrow + headline + two buttons      */}
      {/* ============================================================ */}
      <section
        className="relative w-full py-20 md:py-28 px-5 md:px-10 overflow-hidden"
        style={{
          background: "radial-gradient(ellipse 65% 50% at 50% 50%, rgba(135,156,247,0.28) 0%, rgba(180,192,245,0.14) 40%, rgba(180,192,245,0) 75%), #FAFBFF",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "min(90vw, 720px)",
            height: "min(70vw, 460px)",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(ellipse at center, rgba(135,156,247,0.30) 0%, rgba(135,156,247,0.12) 35%, rgba(135,156,247,0) 70%)",
            pointerEvents: "none",
            filter: "blur(8px)",
          }}
        />
        <div className="relative max-w-3xl mx-auto flex flex-col items-center text-center">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 18px",
              background: "rgba(135,156,247,0.16)",
              color: NAVY,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              borderRadius: 999,
              width: "fit-content",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: PERIWINKLE,
                boxShadow: `0 0 0 3px ${PERIWINKLE}33`,
              }}
            />
            Get started
          </div>

          <h2
            className="mt-6 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05] text-balance"
            style={{ color: NAVY }}
          >
            Producing more creative is one thing. Making sure it converts is another.
          </h2>

          <p
            className="mt-5 text-base md:text-lg leading-relaxed max-w-xl mx-auto font-medium"
            style={{ color: NAVY, opacity: 0.7 }}
          >
            Brieflee checks every UGC submission against your brief before launch. Pass/fail with timestamps for what to fix.
          </p>

          <div className="mt-9 md:mt-10 flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <a
              href="/sign-up"
              className="inline-flex items-center gap-2.5 px-7 h-12 rounded-xl font-bold text-base text-white transition-transform hover:-translate-y-0.5"
              style={{
                background: NAVY,
                boxShadow: "0 12px 28px -10px rgba(0,19,100,0.35), 0 4px 10px -3px rgba(0,19,100,0.18)",
              }}
            >
              Start free trial
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/book-a-demo"
              className="inline-flex items-center gap-2 px-6 h-12 rounded-xl font-bold text-base transition-transform hover:-translate-y-0.5"
              style={{
                background: "rgba(255,255,255,0.6)",
                color: NAVY,
                boxShadow: "0 0 0 1px rgba(0,19,100,0.14) inset, 0 4px 12px -4px rgba(0,19,100,0.10)",
                backdropFilter: "blur(12px) saturate(180%)",
              }}
            >
              Book a demo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
