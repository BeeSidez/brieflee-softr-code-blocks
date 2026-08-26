// Plan page — UPGRADE / DOWNGRADE block (design lifted from /get-started,
// with current-plan grey-out + downgrade confirmation modal).
// Visible when the user has an active Stripe subscription.
//
// Annual billing only, with a 30-day 100% money-back guarantee. There is no
// trial and no monthly option, so the interval toggle is gone.
//
// The current plan is matched on TIER, from the `tier (pricing)` lookup
// (r6pjJ), rather than on the pricing row id. Row ids churn: the 2026 annual
// repricing added a new row per tier and retired the old one, so Studio's
// live row moved from KHrjkggVIoUOze to eCF6Gzxy6Bv59G and any id hardcoded
// here would have stopped recognising anyone's plan. Tier survives that.
//
// Checkout goes to the three annual Payment Links below, each of which
// redirects to /payment-success?session_id=…. Anyone arriving from this
// block is logged in, so they land on the thank-you rather than on signup.

import { useState } from "react";
import { useRecords, q } from "@/lib/datasource";

const select = q.select({
  tier:   "r6pjJ", // tier (pricing) LOOKUP → "Creator" / "Crew" / "Studio"
  status: "kClk9", // status SELECT — "Active" / "Inactive". Active vs lapsed.
});

// Annual Payment Links, Stripe live account acct_1RD0maIG1gGY9y21, all
// carrying metadata card:annual-2026.
const CHECKOUT_URL = {
  Creator: "https://buy.stripe.com/fZueVe02H4aQeEl6CtcAo0N",
  Crew:    "https://buy.stripe.com/7sY7sM3eTdLq53L9OFcAo0L",
  Studio:  "https://buy.stripe.com/28E14og1F4aQ8fXgd3cAo0M",
};

const CLD = "https://res.cloudinary.com/dchroynzv/image/upload";

// Feature row icons (transparent PNGs from Bev's manifest, lifted from /get-started)
const FEAT_ICONS = {
  aiReview:    `${CLD}/v1777998690/brieflee_help-icon_faq-big-cartoon-eyes-curious-looking-transparent_2026-05.png`,
  briefs:      `${CLD}/v1777998696/brieflee_icon_docs-file-icon-transparent_2026-05.png`,
  qa:          `${CLD}/v1777998697/brieflee_icon_document-approval-illustration-transparent_2026-05.png`,
  revisions:   `${CLD}/v1777998714/brieflee_icon_wax-seal-of-approval-stamp-transparent_2026-05.png`,
  storyboard:  `${CLD}/v1777998703/brieflee_icon_movie-clapper-illustration-transparent_2026-05.png`,
  remix:       `${CLD}/v1777998705/brieflee_icon_retro-cassette-tape-transparent_2026-05.png`,
  seats:       `${CLD}/v1777998707/brieflee_icon_simple-bold-lined-id-badge-transparent_2026-05.png`,
  workspaces:  `${CLD}/v1777998707/brieflee_icon_simple-bold-lined-computer-transparent_2026-05.png`,
};

// Annual only. `reads` is the monthly-equivalent headline, `price` is the
// once-a-year charge, `perReview` is price ÷ (maxVideos × 12). The per-review
// figure falls 0.33 → 0.25 → 0.20 up the ladder, which is the clearest
// argument for moving up and the honest one against dropping down.
const PLANS = [
  { id: "creator-annual", tier: "Creator", price: 588, reads: 49, perReview: "0.33",
    desc: "For solos running their own creator content.",
    maxVideos: 150, maxWorkspaces: 1, maxUsers: 1, rank: 0 },
  { id: "crew-annual", tier: "Crew", price: 2268, reads: 189, perReview: "0.25",
    desc: "For growing teams briefing creators every month.",
    maxVideos: 750, maxWorkspaces: 5, maxUsers: 5, popular: true, rank: 1 },
  { id: "studio-annual", tier: "Studio", price: 4788, reads: 399, perReview: "0.20",
    desc: "For agencies and creator programmes at scale.",
    maxVideos: 2000, maxWorkspaces: 10, maxUsers: 10, rank: 2 },
];

const FEATURE_ROWS = (plan) => [
  { iconUrl: FEAT_ICONS.aiReview,   label: "Video reviews",        amount: `${plan.maxVideos.toLocaleString()}/mo` },
  { iconUrl: FEAT_ICONS.briefs,     label: "Live briefs",          amount: "Unlimited" },
  { iconUrl: FEAT_ICONS.qa,         label: "Review Agents",        amount: "Unlimited" },
  { iconUrl: FEAT_ICONS.revisions,  label: "Re-reviews",           amount: "Included" },
  { iconUrl: FEAT_ICONS.storyboard, label: "AI brief builder",     amount: "Included" },
  { iconUrl: FEAT_ICONS.remix,      label: "Ask Lee, API and MCP", amount: "Included" },
  { iconUrl: FEAT_ICONS.seats,      label: "Seats",                amount: `${plan.maxUsers}` },
  { iconUrl: FEAT_ICONS.workspaces, label: "Brand profiles",       amount: `${plan.maxWorkspaces}` },
];

const Svg = ({ size = 16, children, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>{children}</svg>
);
const I = {
  Check:      (p) => <Svg {...p}><polyline points="20 6 9 17 4 12" /></Svg>,
  ArrowRight: (p) => <Svg {...p}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></Svg>,
  ArrowLeft:  (p) => <Svg {...p}><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></Svg>,
  X:          (p) => <Svg {...p}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></Svg>,
  Zap:        (p) => <Svg {...p}><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></Svg>,
  AlertTri:   (p) => <Svg {...p}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></Svg>,
};


export default function Block() {
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [downgradeTarget, setDowngradeTarget] = useState(null);
  const { data, status } = useRecords({ select, count: 1 });

  const userRecord = data?.pages?.[0]?.items?.[0];
  const f = userRecord?.fields || {};

  // A lookup arrives as an array, as a {label} object, or as a bare string
  // depending on the field, so unwrap all three rather than guessing.
  const readLabel = (v) => {
    const first = Array.isArray(v) ? v[0] : v;
    if (first && typeof first === "object") return first.label ?? first.value ?? "";
    return first ?? "";
  };

  const currentTier = String(readLabel(f.tier) || "") || null;
  const currentPlan = PLANS.find((p) => p.tier === currentTier) || null;
  const currentRank = currentPlan?.rank ?? null;

  // status field on users — SELECT with "Active" / "Inactive". Anything
  // not exactly "active" (case-insensitive) treats the plan link on the
  // user record as their HISTORICAL plan, not the one they're paying for.
  const rawStatus = Array.isArray(f.status)
    ? (f.status[0] ?? "")
    : (f.status ?? "");
  const statusLabel = typeof rawStatus === "object" && rawStatus
    ? (rawStatus.label ?? rawStatus.value ?? "")
    : rawStatus;
  const isActive = String(statusLabel).toLowerCase() === "active";

  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId);

  /* Referly attributes a referred purchase through client_reference_id. The
     tracker script exposes window.affiliateId on every page and nothing else
     writes that parameter, so it is free. Checkout navigates by assignment
     rather than by anchor, so a link click handler would never see it. It has
     to happen here. */
  const withAffiliate = (url) => {
    if (!url) return url;
    const id = typeof window !== "undefined" ? window.affiliateId : null;
    if (!id) return url;
    if (url.indexOf("client_reference_id=") !== -1) return url;
    return url + (url.indexOf("?") === -1 ? "?" : "&") + "client_reference_id=" + encodeURIComponent(id);
  };

  const goTo = (plan) => {
    const url = withAffiliate(CHECKOUT_URL[plan.tier]);
    if (url) window.location.href = url;
  };

  const handleContinue = () => {
    if (!selectedPlan) return;
    // When the user isn't currently paying, every plan is a fresh
    // subscribe — skip the "same plan" bail and the downgrade modal,
    // go straight to the Payment Link.
    if (!isActive) {
      goTo(selectedPlan);
      return;
    }
    if (currentTier === selectedPlan.tier) return;
    if (currentRank !== null && selectedPlan.rank < currentRank) {
      setDowngradeTarget(selectedPlan);
      return;
    }
    goTo(selectedPlan);
  };
  const confirmDowngrade = () => {
    if (downgradeTarget) {
      const t = downgradeTarget;
      setDowngradeTarget(null);
      goTo(t);
    }
  };

  if (status === "pending") {
    return <div className="gs-root"><div className="gs-page text-center" style={{ padding: 48, color: "#555" }}>Loading plans…</div></div>;
  }

  return (
    <div className="gs-root">
      <Style />
      <div className="gs-page">
        <div className="text-center mb-6">
          {currentTier && isActive && (
            <div className="trial-banner">
              <span className="trial-dot"></span>
              You're currently on {currentTier} · Switch any time
            </div>
          )}
          {currentTier && !isActive && (
            <div className="trial-banner trial-banner-lapsed">
              <span className="trial-dot"></span>
              You were previously on {currentTier} · Pick a plan to restart
            </div>
          )}
          <h1 className="gs-headline">{isActive ? "Switch your plan" : "Restart your plan"}</h1>
          <p className="gs-sub">
            {isActive
              ? "Move up for more capacity, or down to a smaller tier. Every plan is billed annually and Stripe prorates the difference automatically."
              : "Your subscription isn't active right now. Pick any plan below to start reviewing again. Billed annually, with 30 days at 100% back."}
          </p>
        </div>

        <div className="plan-grid mt-8">
          {PLANS.map((p) => {
            // Same TIER as the user's current plan (Creator/Crew/Studio) — the
            // badge attaches at the tier level, since monthly vs yearly is the
            // same plan, just a different billing cadence.
            const isSameTier = currentPlan != null && currentTier === p.tier;
            const isCurrent = isSameTier && isActive;
            const isPrevious = isSameTier && !isActive;
            const isSelected = selectedPlanId === p.id;
            const cls = "plan-card" +
              // Don't paint the user's own tier as "popular"; the current /
              // previous plan badge wins that visual slot.
              (p.popular && !isSameTier ? " popular" : "") +
              (isSelected && !isCurrent ? " selected" : "") +
              (isCurrent ? " is-current" : "") +
              (isPrevious ? " is-previous" : "");

            const ctaText = isCurrent
              ? "Your current plan"
              : !isActive
                ? (isSameTier ? `Restart ${p.tier}` : `Start ${p.tier}`)
                : (currentRank !== null && p.rank < currentRank)
                  ? `Downgrade to ${p.tier}`
                  : (currentRank !== null && p.rank > currentRank)
                    ? `Upgrade to ${p.tier}`
                    : `Switch to ${p.tier}`;

            return (
              <div key={p.id} className={cls}
                onClick={() => { if (!isCurrent) setSelectedPlanId(p.id); }}>
                {p.popular && !isSameTier && <div className="plan-popular-tag">Most popular</div>}
                {isCurrent && <div className="plan-popular-tag" style={{ background: "var(--bl-navy)" }}>Your current plan</div>}
                {isPrevious && <div className="plan-popular-tag" style={{ background: "var(--bl-fg-muted)" }}>Your previous plan</div>}
                <div className="plan-tier">{p.tier}</div>
                <div className="plan-name">For {p.tier === "Creator" ? "solos" : p.tier === "Crew" ? "growing teams" : "agencies"}</div>
                <div className="plan-desc">{p.desc}</div>
                <div className="plan-price-row">
                  <span className="plan-price">${p.reads}</span>
                  <span className="plan-price-suffix">/mo</span>
                </div>
                <div className="plan-bill-note">Billed ${p.price.toLocaleString()} once a year</div>
                <span className="plan-savings"><I.Zap size={11} /> ${p.perReview} a review</span>
                <div className="plan-divider"></div>
                <ul className="plan-feature-list">
                  {FEATURE_ROWS(p).map((row) => (
                    <li key={row.label}>
                      <img src={row.iconUrl} alt="" className="plan-feat-icon-img" />
                      <span className="plan-feat-label">{row.label}</span>
                      <span className="plan-feat-amount">{row.amount}</span>
                    </li>
                  ))}
                </ul>
                <div className="plan-cta">
                  {isSelected && !isCurrent
                    ? <><I.Check size={14} strokeWidth={3} /> &nbsp;Selected</>
                    : ctaText}
                </div>
              </div>
            );
          })}
        </div>

        <div className="sticky-cta">
          <div className="row gap-3">
            {selectedPlan ? (
              <div className="plan-summary-flash">
                <strong>{selectedPlan.tier}</strong> · ${selectedPlan.price.toLocaleString()} a year · {selectedPlan.maxVideos.toLocaleString()} reviews a month
              </div>
            ) : (
              <div style={{ fontSize: 13, color: "#555" }}>Pick a plan to continue · Stripe prorates automatically</div>
            )}
          </div>
          <button className={"bl-btn bl-btn-primary" + (selectedPlan ? " pulse" : "")}
            onClick={handleContinue} disabled={!selectedPlan}>
            {selectedPlan && isActive && currentRank !== null && selectedPlan.rank < currentRank
              ? <>Continue downgrade <I.ArrowRight size={14} /></>
              : <>Continue to checkout <I.ArrowRight size={14} /></>}
          </button>
        </div>
      </div>

      {downgradeTarget && (
        <DowngradeModal
          current={currentPlan}
          target={downgradeTarget}
          onClose={() => setDowngradeTarget(null)}
          onConfirm={confirmDowngrade}
        />
      )}
    </div>
  );
}

function DowngradeModal({ current, target, onClose, onConfirm }) {
  if (!current || !target) return null;
  const lostVideos = current.maxVideos - target.maxVideos;
  const lostWorkspaces = current.maxWorkspaces - target.maxWorkspaces;
  const lostSeats = current.maxUsers - target.maxUsers;
  // Dropping a tier raises what each review costs. That is the honest
  // argument against it, and it beats an invented hours-saved figure.
  const dearer = Number(target.perReview) > Number(current.perReview);

  return (
    <div className="dg-modal-bg" onClick={onClose}>
      <div className="dg-modal" onClick={(e) => e.stopPropagation()}>
        <button className="dg-modal-close" onClick={onClose} aria-label="Close">
          <I.X size={16} />
        </button>
        <div className="dg-modal-icon">
          <I.AlertTri size={28} />
        </div>
        <h2 className="dg-modal-title">Are you sure you want to downgrade?</h2>
        <p className="dg-modal-sub">
          You'll move from <strong>{current.tier}</strong> to <strong>{target.tier}</strong>. Here's what changes:
        </p>
        <ul className="dg-modal-list">
          {dearer && (
            <li><span className="dg-bad">Every review costs more</span> <span className="dg-from">(${current.perReview} → ${target.perReview})</span></li>
          )}
          {lostVideos > 0 && (
            <li><span className="dg-bad">−{lostVideos.toLocaleString()} reviews / month</span> <span className="dg-from">({current.maxVideos.toLocaleString()} → {target.maxVideos.toLocaleString()})</span></li>
          )}
          {lostWorkspaces > 0 && (
            <li><span className="dg-bad">−{lostWorkspaces} {lostWorkspaces === 1 ? "brand profile" : "brand profiles"}</span> <span className="dg-from">({current.maxWorkspaces} → {target.maxWorkspaces})</span></li>
          )}
          {lostSeats > 0 && (
            <li><span className="dg-bad">−{lostSeats} {lostSeats === 1 ? "seat" : "seats"}</span> <span className="dg-from">({current.maxUsers} → {target.maxUsers})</span></li>
          )}
        </ul>
        <p className="dg-note">Your changes take effect at your next billing date. Stripe handles the proration.</p>
        <div className="dg-actions">
          <button className="bl-btn bl-btn-primary" onClick={onClose} style={{ flex: 1 }}>Stay on {current.tier}</button>
          <button className="link-btn" onClick={onConfirm} style={{ flex: 0, padding: "12px 18px" }}>Continue downgrade</button>
        </div>
      </div>
    </div>
  );
}


function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

      .gs-root {
        --bl-blue:        #294ff6;
        --bl-blue-2:      #4466f8;
        --bl-blue-4:      #7a93ff;
        --bl-blue-5:      #879cf7;
        --bl-navy:        #000f4d;
        --bl-fg:          #001364;
        --bl-fg-body:     #333;
        --bl-fg-muted:    #555;
        --bl-fg-quiet:    #bbb;
        --bl-page:        #fafbff;
        --bl-card:        #fff;
        --bl-container:   #ecf0ff;
        --bl-light-1:     #f8fbff;
        --bl-light-2:     #eef4fd;
        --bl-periwinkle:  #d9e0ff;
        --bl-border:      #d6defc;
        --bl-success:     #38a169;
        --bl-success-bg:  #f0fff4;
        --bl-success-fg:  #166534;
        --bl-radius:      10px;
        --bl-radius-md:   12px;
        --bl-radius-lg:   16px;
        --bl-radius-pill: 999px;
        --bl-shadow:      0 4px 14px -2px rgba(41,79,246,0.10), 0 2px 6px -2px rgba(0,19,100,0.06);
        --bl-shadow-glow: 0 0 0 4px rgba(135,156,247,0.20);
        --bl-ease:        cubic-bezier(0.32, 0.72, 0, 1);
        --bl-dur:         200ms;
        --gs-font:        'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        font-family: var(--gs-font);
        color: var(--bl-fg-body);
        background: var(--bl-page);
        min-height: 100vh;
      }
      .gs-root *, .gs-root *::before, .gs-root *::after { box-sizing: border-box; }
      .gs-root, .gs-root * { font-family: var(--gs-font); }

      .gs-shell { min-height: 100vh; }

      .gs-topbar {
        position: sticky; top: 0; z-index: 10;
        background: rgba(250,251,255,0.86);
        backdrop-filter: saturate(140%) blur(10px);
        -webkit-backdrop-filter: saturate(140%) blur(10px);
        border-bottom: 1px solid var(--bl-border);
      }
      .gs-topbar-inner {
        max-width: 1200px; margin: 0 auto;
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center; gap: 24px;
        padding: 16px 24px;
      }
      .gs-logo { height: 26px; display: block; justify-self: start; }
      .gs-stepper-wrap { display: flex; justify-content: center; }
      .gs-help { color: var(--bl-fg-muted); font-size: 14px; justify-self: end; }
      .gs-help a { font-weight: 600; color: var(--bl-blue); text-decoration: none; }
      @media (max-width: 820px) {
        .gs-topbar-inner { grid-template-columns: auto 1fr; gap: 12px; }
        .gs-stepper-wrap { display: none; }
        .gs-help { justify-self: end; }
      }
      @media (max-width: 520px) {
        .gs-help { display: none; }
        .gs-topbar-inner { grid-template-columns: 1fr; justify-items: center; }
        .gs-logo { justify-self: center; }
      }

      .gs-page {
        max-width: 1120px; margin: 0 auto;
        padding: 28px 24px 96px;
      }
      .gs-page-narrow { max-width: 560px; }
      .gs-page-medium { max-width: 760px; }

      .gs-headline {
        font-size: 32px; line-height: 1.1; letter-spacing: -0.02em;
        font-weight: 800; color: var(--bl-fg);
        margin: 0 0 10px;
      }
      .gs-sub {
        color: var(--bl-fg-muted);
        font-size: 16px; line-height: 1.55;
        margin: 0 auto;
        max-width: 560px;
      }
      .gs-eyebrow {
        font-size: 12px; letter-spacing: 0.08em;
        font-weight: 700; text-transform: uppercase;
        color: var(--bl-blue-5);
        margin-bottom: 14px;
        display: block;
      }

      /* Stepper */
      .step-row {
        display: inline-flex; align-items: center; gap: 0;
        padding: 6px 8px;
        background: rgba(216,216,255,0.35);
        border: 1px solid var(--bl-border);
        border-radius: var(--bl-radius-pill);
      }
      .step-pill {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 6px 12px;
        border-radius: var(--bl-radius-pill);
        font-size: 13px; font-weight: 600;
        color: var(--bl-fg-muted);
        transition: all var(--bl-dur) var(--bl-ease);
      }
      .step-pill .step-dot {
        width: 18px; height: 18px;
        border-radius: 999px;
        background: transparent;
        border: 1.5px solid var(--bl-border);
        display: inline-flex; align-items: center; justify-content: center;
        font-size: 11px; font-weight: 700; color: var(--bl-fg-muted);
      }
      .step-pill.done { color: var(--bl-fg); }
      .step-pill.done .step-dot { background: var(--bl-success); border-color: var(--bl-success); color: #fff; }
      .step-pill.active { background: #fff; color: var(--bl-fg); box-shadow: 0 1px 3px rgba(0,19,100,0.08); }
      .step-pill.active .step-dot { background: var(--bl-blue); border-color: var(--bl-blue); color: #fff; }
      .step-sep { display: inline-block; width: 16px; height: 1px; background: var(--bl-border); margin: 0 4px; }

      /* Inputs */
      .bl-input {
        width: 100%; font: inherit; font-size: 15px;
        color: var(--bl-fg); background: var(--bl-card);
        border: 1.5px solid var(--bl-border);
        border-radius: var(--bl-radius);
        padding: 12px 14px; outline: none;
        transition: border-color var(--bl-dur) var(--bl-ease), box-shadow var(--bl-dur) var(--bl-ease);
      }
      .bl-input::placeholder { color: var(--bl-fg-quiet); }
      .bl-input:focus { border-color: var(--bl-blue-5); box-shadow: var(--bl-shadow-glow); }

      /* Buttons */
      .bl-btn {
        display: inline-flex; align-items: center; justify-content: center;
        gap: 8px; font: inherit; font-weight: 600; font-size: 15px;
        padding: 14px 24px; border-radius: var(--bl-radius);
        border: none; cursor: pointer;
        transition: transform var(--bl-dur) var(--bl-ease), box-shadow var(--bl-dur) var(--bl-ease), background var(--bl-dur) var(--bl-ease), opacity var(--bl-dur) var(--bl-ease);
      }
      .bl-btn[disabled] { cursor: not-allowed; opacity: 0.45; }
      .bl-btn-primary {
        background: var(--bl-blue-5); color: #fff;
        box-shadow: 0 1px 0 0 rgba(255,255,255,0.4) inset, 0 4px 14px -2px rgba(135,156,247,0.45);
      }
      .bl-btn-primary:hover:not([disabled]) {
        background: var(--bl-blue-4); transform: translateY(-1px);
        box-shadow: 0 1px 0 0 rgba(255,255,255,0.4) inset, 0 8px 20px -2px rgba(135,156,247,0.55);
      }
      .bl-btn-ghost { background: transparent; color: var(--bl-fg-muted); font-weight: 500; }
      .bl-btn-ghost:hover:not([disabled]) { color: var(--bl-fg); }
      .bl-btn-secondary { background: var(--bl-card); color: var(--bl-fg); border: 1.5px solid var(--bl-border); }
      .bl-btn-secondary:hover:not([disabled]) { border-color: var(--bl-blue-5); background: #fff; }

      /* Card */
      .bl-card {
        background: var(--bl-card);
        border: 1px solid var(--bl-border);
        border-radius: var(--bl-radius-lg);
      }

      /* Field labels */
      .field-label {
        display: block; font-size: 13px; font-weight: 600;
        color: var(--bl-fg); margin-bottom: 8px;
      }
      .field-help { font-size: 12px; color: var(--bl-fg-muted); margin-top: 6px; }

      /* Option chip */
      .opt-chip {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 10px 16px; border-radius: var(--bl-radius-pill);
        background: #fff; border: 1.5px solid var(--bl-border);
        color: var(--bl-fg); font: inherit;
        font-size: 14px; font-weight: 500; cursor: pointer;
        transition: all var(--bl-dur) var(--bl-ease);
      }
      .opt-chip:hover { border-color: var(--bl-blue-5); background: var(--bl-light-1); }
      .opt-chip.selected {
        background: var(--bl-blue-5); border-color: var(--bl-blue-5); color: #fff;
        box-shadow: 0 4px 14px -2px rgba(135,156,247,0.45);
      }

      /* Plan grid + cards */
      .plan-grid {
        display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px;
      }
      @media (max-width: 900px) { .plan-grid { grid-template-columns: 1fr; } }

      .plan-card {
        position: relative; background: var(--bl-card);
        border: 1.5px solid var(--bl-border);
        border-radius: var(--bl-radius-lg);
        padding: 28px 24px 24px;
        cursor: pointer;
        transition: all var(--bl-dur) var(--bl-ease);
        display: flex; flex-direction: column;
      }
      .plan-card:hover { transform: translateY(-2px); border-color: var(--bl-blue-4); box-shadow: var(--bl-shadow); }
      .plan-card.popular {
        border-color: var(--bl-blue-5);
        box-shadow: 0 12px 32px -10px rgba(135,156,247,0.45);
        transform: translateY(-4px);
      }
      .plan-card.selected { border-color: var(--bl-blue); box-shadow: 0 0 0 3px rgba(41,79,246,0.12), var(--bl-shadow); }
      .plan-popular-tag {
        position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
        background: var(--bl-blue); color: #fff;
        font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
        padding: 5px 12px; border-radius: var(--bl-radius-pill); white-space: nowrap;
      }
      .plan-tier { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 700; color: var(--bl-fg-muted); }
      .plan-name { font-size: 22px; font-weight: 700; color: var(--bl-fg); letter-spacing: -0.01em; margin: 4px 0 6px; }
      .plan-desc { font-size: 13px; color: var(--bl-fg-muted); line-height: 1.45; min-height: 38px; }
      .plan-price-row { display: flex; align-items: baseline; gap: 6px; margin: 18px 0 4px; }
      .plan-price { font-size: 44px; font-weight: 800; letter-spacing: -0.025em; color: var(--bl-fg); line-height: 1; }
      .plan-price-suffix { font-size: 14px; color: var(--bl-fg-muted); font-weight: 500; }
      .plan-bill-note { font-size: 12px; color: var(--bl-fg-muted); min-height: 18px; }
      .plan-savings {
        display: inline-flex; align-items: center; gap: 4px;
        font-size: 11px; font-weight: 700;
        background: var(--bl-success-bg); color: var(--bl-success-fg);
        padding: 3px 8px; border-radius: var(--bl-radius-pill); margin-top: 4px;
      }
      .plan-divider { height: 1px; background: var(--bl-border); margin: 18px 0 16px; }

      /* Feature row: icon + label + amount on right (Foreplay-style) */
      .plan-feature-list { list-style: none; padding: 0; margin: 0 0 22px; display: flex; flex-direction: column; gap: 10px; }
      .plan-feature-list li {
        display: flex; align-items: center; gap: 10px;
        font-size: 14px; line-height: 1.4; color: var(--bl-fg-body);
      }
      .plan-feat-icon-img {
        width: 28px; height: 28px;
        flex-shrink: 0;
        object-fit: contain;
      }
      .plan-feat-label { flex: 1; min-width: 0; }
      .plan-feat-amount { color: var(--bl-fg); font-weight: 700; font-size: 13px; }

      .plan-cta {
        margin-top: auto; text-align: center;
        padding: 12px 16px; border-radius: var(--bl-radius);
        font-size: 14px; font-weight: 600;
        background: var(--bl-light-2); color: var(--bl-fg);
        border: 1.5px solid transparent;
        display: flex; align-items: center; justify-content: center; gap: 6px;
      }
      .plan-card.popular .plan-cta { background: var(--bl-blue-5); color: #fff; }
      .plan-card.selected .plan-cta { background: var(--bl-blue); color: #fff; }

      /* Interval toggle */
      .interval-toggle {
        display: inline-flex; padding: 4px;
        background: rgba(216,216,255,0.4);
        border: 1px solid var(--bl-border);
        border-radius: var(--bl-radius-pill);
        position: relative;
      }
      .interval-toggle button {
        position: relative; z-index: 1;
        font: inherit; font-size: 14px; font-weight: 600;
        color: var(--bl-fg-muted);
        background: transparent; border: none;
        padding: 8px 18px; border-radius: var(--bl-radius-pill);
        cursor: pointer;
        display: inline-flex; align-items: center; gap: 8px;
        transition: color var(--bl-dur) var(--bl-ease);
        white-space: nowrap;
      }
      .interval-toggle button.active { color: var(--bl-fg); background: #fff; box-shadow: 0 1px 3px rgba(0,19,100,0.08); }
      .save-pill {
        font-size: 10px; font-weight: 700;
        background: var(--bl-success-bg); color: var(--bl-success-fg);
        padding: 2px 6px; border-radius: var(--bl-radius-pill); white-space: nowrap;
      }

      /* Trust strip */
      .trust-strip {
        display: grid; grid-template-columns: repeat(4, 1fr);
        gap: 16px; margin-top: 32px;
      }
      @media (max-width: 800px) { .trust-strip { grid-template-columns: repeat(2,1fr); } }
      .trust-item {
        display: flex; gap: 12px; align-items: flex-start;
        padding: 14px 16px; background: rgba(255,255,255,0.6);
        border: 1px solid var(--bl-border);
        border-radius: var(--bl-radius);
      }
      .trust-icon-img {
        width: 44px; height: 44px;
        flex-shrink: 0;
        object-fit: contain;
      }
      .trust-text { font-size: 13px; line-height: 1.4; color: var(--bl-fg-body); }
      .trust-text strong { color: var(--bl-fg); display: block; font-weight: 700; margin-bottom: 2px; }

      /* Reasons-to-believe icon (checkout left column) */
      .rtb-icon {
        width: 32px; height: 32px; border-radius: 10px;
        background: var(--bl-light-2); color: var(--bl-blue);
        display: inline-flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }

      /* Logo strip */
      .logo-strip {
        display: flex; flex-wrap: wrap;
        align-items: center; justify-content: center;
        gap: 36px; margin-top: 22px;
      }
      .customer-logo {
        height: 22px;
        width: auto;
        opacity: 0.7;
        filter: grayscale(1);
        transition: opacity var(--bl-dur) var(--bl-ease);
      }
      .customer-logo:hover { opacity: 1; }

      /* Personalize layout — single column, content centered in each card */
      .personalize-grid {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin-top: 24px;
        max-width: 640px;
        margin-left: auto;
        margin-right: auto;
      }
      .personalize-card {
        background: var(--bl-card);
        border: 1px solid var(--bl-border);
        border-radius: var(--bl-radius-lg);
        padding: 28px 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .personalize-card-icon {
        width: 56px; height: 56px;
        object-fit: contain;
        margin-bottom: 12px;
      }
      .personalize-card-title {
        font-size: 18px; font-weight: 700; color: #001364;
        margin-bottom: 4px;
      }
      .personalize-card-sub {
        font-size: 13px; color: #555;
        margin-bottom: 18px;
      }
      .personalize-card-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
      }

      /* Team hero — was eyes, now Brieflee logo */
      .team-hero {
        display: flex; align-items: center; justify-content: center;
        margin-bottom: 28px;
      }
      .team-hero img {
        width: 72px; height: 72px;
        border-radius: 20px;
        background: linear-gradient(180deg, #ecf0ff 0%, rgba(135,156,247,0.45) 100%);
        padding: 12px;
        box-shadow: 0 12px 32px -10px rgba(135,156,247,0.45);
      }

      /* Trial banner */
      .trial-banner {
        display: inline-flex; align-items: center; gap: 10px;
        padding: 8px 14px;
        background: var(--bl-success-bg); color: var(--bl-success-fg);
        border: 1px solid #c6f0d6;
        border-radius: var(--bl-radius-pill);
        font-size: 13px; font-weight: 600;
        margin-bottom: 18px; white-space: nowrap;
        max-width: 100%;
      }
      .trial-dot {
        width: 8px; height: 8px; border-radius: 999px;
        background: var(--bl-success);
        box-shadow: 0 0 0 4px rgba(56,161,105,0.18);
      }

      /* Sticky CTA */
      .sticky-cta {
        position: sticky; bottom: 16px; margin-top: 28px;
        background: rgba(255,255,255,0.92);
        backdrop-filter: saturate(140%) blur(10px);
        -webkit-backdrop-filter: saturate(140%) blur(10px);
        border: 1px solid var(--bl-border);
        border-radius: var(--bl-radius-lg);
        padding: 14px 18px;
        display: flex; align-items: center; justify-content: space-between;
        gap: 14px; box-shadow: var(--bl-shadow);
      }
      @media (max-width: 700px) { .sticky-cta { flex-direction: column; align-items: stretch; } }

      /* Checkout layout */
      .checkout-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 24px; align-items: start;
      }
      @media (max-width: 900px) { .checkout-grid { grid-template-columns: 1fr; } }

      .checkout-trust-icon {
        width: 36px; height: 36px;
        flex-shrink: 0;
        object-fit: contain;
      }

      .summary-card { padding: 24px; }
      .summary-divider { height: 1px; background: var(--bl-border); margin: 18px 0; }

      .price-row {
        display: flex; justify-content: space-between;
        font-size: 14px; color: var(--bl-fg-body);
        padding: 4px 0;
      }
      .price-row.total {
        font-weight: 700; font-size: 18px; color: var(--bl-fg);
        padding-top: 12px;
        border-top: 1px dashed var(--bl-border);
      }

      .testimonial {
        background: linear-gradient(180deg, var(--bl-container) 0%, #fff 100%);
        border: 1px solid var(--bl-border);
        border-radius: var(--bl-radius-lg);
        padding: 22px 24px; position: relative;
      }

      .pay-panel { padding: 28px; }
      .pay-trust-grid {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
        margin-bottom: 24px;
      }
      .pay-trust {
        display: inline-flex; align-items: center; justify-content: center;
        gap: 6px; padding: 10px 12px;
        background: var(--bl-light-2); color: var(--bl-fg);
        border-radius: var(--bl-radius);
        font-size: 12px; font-weight: 600;
      }
      .pay-cta { width: 100%; padding: 18px 24px; font-size: 16px; }

      /* Helpers */
      .text-center { text-align: center; }
      .row { display: flex; align-items: center; gap: 12px; }
      .row-between { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
      .stack { display: flex; flex-direction: column; }
      .gap-2 { gap: 8px; } .gap-3 { gap: 12px; } .gap-4 { gap: 16px; }
      .mt-2 { margin-top: 8px; } .mt-3 { margin-top: 12px; } .mt-4 { margin-top: 16px; }
      .mt-6 { margin-top: 24px; } .mt-8 { margin-top: 32px; } .mt-10 { margin-top: 40px; }
      .mb-3 { margin-bottom: 12px; } .mb-4 { margin-bottom: 16px; } .mb-6 { margin-bottom: 24px; }

      .nav-row { display: flex; align-items: center; justify-content: space-between; margin-top: 28px; }

      .ic-btn {
        flex-shrink: 0; width: 40px; height: 40px;
        border-radius: 10px;
        background: transparent; border: 1.5px solid var(--bl-border);
        color: var(--bl-fg-muted); cursor: pointer;
        display: inline-flex; align-items: center; justify-content: center;
      }
      .ic-btn:hover { color: var(--bl-fg); border-color: var(--bl-blue-5); }

      .link-btn {
        background: transparent; border: none; padding: 0; cursor: pointer;
        color: var(--bl-blue); font-weight: 600; font-size: 13px;
      }

      @keyframes blPulse {
        0%, 100% { box-shadow: 0 1px 0 0 rgba(255,255,255,0.4) inset, 0 4px 14px -2px rgba(135,156,247,0.45); }
        50%      { box-shadow: 0 1px 0 0 rgba(255,255,255,0.4) inset, 0 8px 28px 0 rgba(135,156,247,0.7); }
      }
      .bl-btn-primary.pulse { animation: blPulse 2.4s var(--bl-ease) infinite; }

      @keyframes blFlash {
        0%, 100% {
          background: rgba(217, 224, 255, 0.5);
          box-shadow: 0 0 0 0 rgba(41,79,246,0.18);
          transform: scale(1);
        }
        50% {
          background: rgba(217, 224, 255, 0.9);
          box-shadow: 0 0 0 6px rgba(41,79,246,0.10);
          transform: scale(1.015);
        }
      }
      .plan-summary-flash {
        font-size: 14px;
        font-weight: 600;
        color: var(--bl-fg);
        padding: 8px 14px;
        border-radius: var(--bl-radius-pill);
        border: 1.5px solid var(--bl-blue);
        white-space: nowrap;
        animation: blFlash 1.6s var(--bl-ease) infinite;
      }
      .plan-summary-flash strong { color: var(--bl-blue); font-weight: 800; }
      /* Current-plan greying for upgrade block */
      .plan-card.is-current { background: var(--bl-light-2); opacity: 0.85; cursor: not-allowed; }
      .plan-card.is-current:hover { transform: none; border-color: var(--bl-border); box-shadow: none; }
      .plan-card.is-current .plan-cta { background: var(--bl-border); color: var(--bl-fg-muted); cursor: not-allowed; }

      /* Previous-plan styling — user lapsed off this plan. Still
         clickable so they can restart, but visually distinguished. */
      .plan-card.is-previous { border-color: var(--bl-fg-muted); }
      .plan-card.is-previous .plan-cta { background: var(--bl-light-2); color: var(--bl-fg); }
      .plan-card.is-previous.selected { border-color: var(--bl-blue); }
      .plan-card.is-previous.selected .plan-cta { background: var(--bl-blue); color: #fff; }

      /* Trial banner — lapsed variant (subdued instead of green) */
      .trial-banner-lapsed {
        background: var(--bl-light-2);
        color: var(--bl-fg);
        border-color: var(--bl-border);
      }
      .trial-banner-lapsed .trial-dot {
        background: var(--bl-fg-muted);
        box-shadow: 0 0 0 4px rgba(107, 122, 153, 0.18);
      }

      /* Downgrade modal */
      .dg-modal-bg {
        position: fixed; inset: 0;
        background: rgba(0, 19, 100, 0.45);
        display: flex; align-items: center; justify-content: center;
        padding: 20px; z-index: 100;
        animation: dg-fade 180ms cubic-bezier(0.32,0.72,0,1);
      }
      @keyframes dg-fade { from { opacity: 0; } to { opacity: 1; } }
      .dg-modal {
        position: relative; background: #fff; border-radius: 20px;
        padding: 32px 28px; max-width: 460px; width: 100%; text-align: center;
        box-shadow: 0 24px 64px -12px rgba(0,15,77,0.30);
      }
      .dg-modal-close {
        position: absolute; top: 16px; right: 16px;
        width: 32px; height: 32px; border-radius: 999px;
        background: var(--bl-light-1); color: var(--bl-fg-muted);
        border: none; cursor: pointer;
        display: inline-flex; align-items: center; justify-content: center;
      }
      .dg-modal-icon {
        width: 56px; height: 56px; border-radius: 999px;
        background: #fff7ed; color: #f97316;
        display: inline-flex; align-items: center; justify-content: center;
        margin-bottom: 16px;
      }
      .dg-modal-title { font-size: 22px; font-weight: 800; color: var(--bl-fg); margin: 0 0 8px; letter-spacing: -0.01em; }
      .dg-modal-sub { font-size: 14px; color: var(--bl-fg-muted); line-height: 1.55; margin: 0 0 20px; }
      .dg-modal-sub strong { color: var(--bl-fg); }
      .dg-modal-list {
        list-style: none; padding: 14px 16px; margin: 0 0 18px; text-align: left;
        background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px;
      }
      .dg-modal-list li { font-size: 13px; line-height: 1.6; padding: 4px 0; }
      .dg-bad { color: #b91c1c; font-weight: 700; }
      .dg-from { color: var(--bl-fg-muted); font-size: 12px; margin-left: 4px; }
      .dg-note { font-size: 12px; color: var(--bl-fg-muted); line-height: 1.5; margin: 0 0 20px; }
      .dg-actions { display: flex; gap: 8px; align-items: center; }
      @media (max-width: 480px) { .dg-actions { flex-direction: column; align-items: stretch; } }
    `}</style>
  );
}