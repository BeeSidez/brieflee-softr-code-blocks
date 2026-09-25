// Marketing site — PLAN block, v2. Annual-only rebuild.
//
// Built alongside marketing.jsx, which stays live until launch day. Nothing
// here edits the v1 block.
//
// What changed from v1:
//   • Annual billing only, so the Monthly/Yearly toggle is gone
//   • The 7-day trial is replaced by 30 days, 100% back
//   • New prices and allowances from the annual rebuild
//   • Brief credits are on the card for the first time
//   • A full feature comparison table below the cards
//   • An enquiry row for programmes above 2,000 reviews a month
//
// Anonymous block on the public pricing page. No useRecords / useCurrentUser.
// Click a card → selected → sticky CTA → /sign-up with the tier as a param
// so the post-signup flow resumes on the right plan.

import { useState } from "react";

const CLD = "https://res.cloudinary.com/dchroynzv/image/upload";

const FEAT_ICONS = {
  aiReview:   `${CLD}/v1777998690/brieflee_help-icon_faq-big-cartoon-eyes-curious-looking-transparent_2026-05.png`,
  briefs:     `${CLD}/v1777998696/brieflee_icon_docs-file-icon-transparent_2026-05.png`,
  seats:      `${CLD}/v1777998707/brieflee_icon_simple-bold-lined-id-badge-transparent_2026-05.png`,
  workspaces: `${CLD}/v1777998707/brieflee_icon_simple-bold-lined-computer-transparent_2026-05.png`,
  onboarding: `${CLD}/v1777998697/brieflee_icon_document-approval-illustration-transparent_2026-05.png`,
};

const TRUST_ICONS = {
  moneyBack:    `${CLD}/v1777622976/brieflee_engraving_wallet-overflowing-cash-bills-coins-money-grey_2026-03.png`,
  onboarding:   `${CLD}/v1777622911/brieflee_engraving_party-popper-confetti-streamers-celebration-grey_2026-03.png`,
  stripeSecure: `${CLD}/v1777622954/brieflee_engraving_shop-now-cta-button-3d-engraved-grey_2026-03.png`,
  instantSetup: `${CLD}/v1777622954/brieflee_engraving_hand-pressing-light-switch-button-grey-3d_2026-03.png`,
};

const CUSTOMER_LOGOS = [
  { name: "Shopify", url: `${CLD}/brieflee_customer-logo_shopify-wordmark-with-bag-icon-grey_2026-05.png` },
  { name: "Shark",   url: `${CLD}/brieflee_customer-logo_shark-wordmark-black_2026-05.png` },
  { name: "Halara",  url: `${CLD}/brieflee_customer-logo_halara-wordmark-black_2026-05.png` },
  { name: "Cosrx",   url: `${CLD}/brieflee_customer-logo_cosrx-wordmark-black_2026-05.png` },
  { name: "Indeed",  url: `${CLD}/brieflee_customer-logo_indeed-wordmark-grey_2026-05.png` },
  { name: "Grubhub", url: `${CLD}/brieflee_customer-logo_grubhub-wordmark-with-house-fork-grey_2026-05.png` },
];

// ids are the Yearly pricing rows in the pricing table.
const PLANS = [
  {
    id: "VgmYoJPDykqSGB", tier: "Creator", who: "solos",
    monthly: 33, annual: 399,
    desc: "For solos briefing and reviewing their own creator content.",
    videos: 100, briefCredits: 20, users: 1, workspaces: 1, rank: 0,
  },
  {
    id: "0dy1TIY6dUVNnF", tier: "Crew", who: "growing teams",
    monthly: 189, annual: 2268,
    desc: "For teams running creator content across a few brands.",
    videos: 750, briefCredits: 60, users: 5, workspaces: 5, rank: 1, popular: true,
  },
  {
    id: "eCF6Gzxy6Bv59G", tier: "Studio", who: "creator programmes",
    monthly: 399, annual: 4788,
    desc: "For creator programmes running at volume across many brands.",
    videos: 2000, briefCredits: 180, users: 10, workspaces: 10, rank: 2,
  },
];

const GUARANTEE_DAYS = 30;
const CREDITS_PER_BRIEF = 5;

// On the card itself, kept to the numbers that differ between plans.
const CARD_ROWS = (p) => [
  { iconUrl: FEAT_ICONS.aiReview,   label: "Video credits",  amount: `${p.videos.toLocaleString()}/mo` },
  { iconUrl: FEAT_ICONS.briefs,     label: "Brief credits",  amount: `${p.briefCredits}/mo` },
  { iconUrl: FEAT_ICONS.seats,      label: "Users",          amount: `${p.users}` },
  { iconUrl: FEAT_ICONS.workspaces, label: "Brand profiles", amount: `${p.workspaces}` },
  { iconUrl: FEAT_ICONS.onboarding, label: "Onboarding",     amount: "1-on-1 call" },
];

// The full list, below the cards. `values` is Creator, Crew, Studio in order.
const FEATURE_GROUPS = [
  {
    group: "What you get each month",
    rows: [
      { label: "Video credits", note: "One credit reviews one video against your brief.", values: ["100", "750", "2,000"] },
      { label: "Brief credits", note: `A brief written with AI costs ${CREDITS_PER_BRIEF} credits. Writing one yourself is free.`, values: ["20", "60", "180"] },
    ],
  },
  {
    group: "Your team",
    rows: [
      { label: "Users", note: "People who log in and work in Brieflee.", values: ["1", "5", "10"] },
      { label: "Brand profiles", note: "A separate workspace per brand, with its own voice and rules.", values: ["1", "5", "10"] },
      { label: "Creator guests", note: "Creators submit and see feedback without an account.", values: ["Unlimited", "Unlimited", "Unlimited"] },
    ],
  },
  {
    group: "Briefing",
    rows: [
      { label: "AI brief builder", values: [true, true, true] },
      { label: "Live briefs", note: "A shareable link creators work from.", values: ["Unlimited", "Unlimited", "Unlimited"] },
      { label: "Projects", values: ["Unlimited", "Unlimited", "Unlimited"] },
      { label: "Brief templates", values: [true, true, true] },
    ],
  },
  {
    group: "Reviewing",
    rows: [
      { label: "Review Agents", note: "Each one checks a single thing, like hook speed or brand mentions.", values: ["Unlimited", "Unlimited", "Unlimited"] },
      { label: "Custom thresholds", note: "Set what counts as a pass for your brand.", values: [true, true, true] },
      { label: "Re-reviews", note: "A creator resubmits and it gets checked again. Each one uses a video credit.", values: ["Unlimited", "Unlimited", "Unlimited"] },
      { label: "Review reports", values: [true, true, true] },
    ],
  },
  {
    group: "Working with it",
    rows: [
      { label: "API access", values: [true, true, true] },
      { label: "MCP access", note: "Use Brieflee from Claude or any MCP client.", values: [true, true, true] },
      { label: "1-on-1 onboarding call", values: [true, true, true] },
      { label: "30 day money back", values: [true, true, true] },
    ],
  },
];

const TRUST_ITEMS = [
  { iconUrl: TRUST_ICONS.moneyBack,    title: `${GUARANTEE_DAYS} days, 100% back`, body: "Not saving your team time? Full refund." },
  { iconUrl: TRUST_ICONS.onboarding,   title: "1-on-1 onboarding",                 body: "On every plan, not just the top one." },
  { iconUrl: TRUST_ICONS.stripeSecure, title: "Stripe-secure",                     body: "We never store card details." },
  { iconUrl: TRUST_ICONS.instantSetup, title: "Instant setup",                     body: "Reviewing in under 5 minutes." },
];

const Svg = ({ size = 16, children, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>{children}</svg>
);
const I = {
  Check:      (p) => <Svg {...p}><polyline points="20 6 9 17 4 12" /></Svg>,
  ArrowRight: (p) => <Svg {...p}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></Svg>,
  Shield:     (p) => <Svg {...p}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></Svg>,
};

const SIGNUP_URL = "/sign-up";
const ENQUIRY_URL = "/book-a-demo";

export default function Block() {
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId);
  const canContinue = Boolean(selectedPlan);

  const handleContinue = () => {
    if (!selectedPlan) return;
    window.location.href = `${SIGNUP_URL}?plan=${selectedPlan.tier.toLowerCase()}&interval=yearly`;
  };

  return (
    <div className="gs-root">
      <Style />
      <div className="gs-page">
        <div className="text-center mb-6">
          <div className="guarantee-banner">
            <I.Shield size={13} />
            {GUARANTEE_DAYS} days, 100% back
          </div>
          <h1 className="gs-headline">Simple plans, scaled to your team</h1>
          <p className="gs-sub">
            Every plan includes the full toolkit and a 1-on-1 onboarding call. Billed annually.
          </p>
        </div>

        <div className="plan-grid mt-8">
          {PLANS.map((p) => {
            const selected = selectedPlanId === p.id;
            const cls = "plan-card" + (p.popular ? " popular" : "") + (selected ? " selected" : "");
            return (
              <div
                key={p.id}
                className={cls}
                onClick={() => setSelectedPlanId(p.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedPlanId(p.id); } }}
              >
                {p.popular && <div className="plan-popular-tag">Most popular</div>}
                <div className="plan-tier">{p.tier}</div>
                <div className="plan-name">For {p.who}</div>
                <div className="plan-desc">{p.desc}</div>

                <div className="plan-price-row">
                  <span className="plan-price">${p.monthly}</span>
                  <span className="plan-price-suffix">/mo</span>
                </div>
                <div className="plan-bill-note">Billed ${p.annual.toLocaleString()} per year</div>

                <div className="plan-divider" />
                <ul className="plan-feature-list">
                  {CARD_ROWS(p).map((row) => (
                    <li key={row.label}>
                      <img src={row.iconUrl} alt="" className="plan-feat-icon-img" />
                      <span className="plan-feat-label">{row.label}</span>
                      <span className="plan-feat-amount">{row.amount}</span>
                    </li>
                  ))}
                </ul>

                <div className="plan-cta">
                  {selected ? <><I.Check size={14} strokeWidth={3} />&nbsp;Selected</> : "Choose " + p.tier}
                </div>
              </div>
            );
          })}
        </div>

        <div className="enquiry-row">
          <div>
            <strong>More than 2,000 reviews a month?</strong>
            <span>Programmes at that volume get priced to the programme. Book a call and we will size it with you.</span>
          </div>
          <a className="bl-btn bl-btn-secondary" href={ENQUIRY_URL}>
            Book a call <I.ArrowRight size={14} />
          </a>
        </div>

        <div className="trust-strip">
          {TRUST_ITEMS.map((t) => (
            <div className="trust-item" key={t.title}>
              <img src={t.iconUrl} alt="" className="trust-icon-img" />
              <div className="trust-text">
                <strong>{t.title}</strong>
                {t.body}
              </div>
            </div>
          ))}
        </div>

        <FeatureTable selectedId={selectedPlanId} onSelect={setSelectedPlanId} />

        <div className="text-center mt-10">
          <div className="logo-eyebrow">Trusted by top D2C growth teams and agencies</div>
          <div className="logo-strip">
            {CUSTOMER_LOGOS.map((l) => (
              <img key={l.name} src={l.url} alt={l.name} className="customer-logo" />
            ))}
          </div>
        </div>

        <div className="sticky-cta">
          <div className="row gap-3">
            {selectedPlan ? (
              <div className="plan-summary-flash">
                <strong>{selectedPlan.tier}</strong> · ${selectedPlan.annual.toLocaleString()} a year · {GUARANTEE_DAYS} days, 100% back
              </div>
            ) : (
              <div style={{ fontSize: 13, color: "#555" }}>Pick a plan to continue</div>
            )}
          </div>
          <button
            className={"bl-btn bl-btn-primary" + (canContinue ? " pulse" : "")}
            onClick={handleContinue}
            disabled={!canContinue}
          >
            Get started <I.ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── The full feature list ────────────────────────────────────
// Table on desktop, one stacked card per plan on mobile, so the
// three columns never get squeezed into unreadable slivers.
function FeatureTable({ selectedId, onSelect }) {
  const cell = (v) => (
    <span className="ft-cell">
      {v === true ? <I.Check size={16} className="ft-tick" />
        : v === false ? <span className="ft-dash">–</span>
          : <span className="ft-val">{v}</span>}
    </span>
  );

  return (
    <div className="ft-wrap">
      <h2 className="ft-title">Everything in every plan</h2>
      <p className="ft-sub">The toolkit is the same on all three. What changes is how much you can run through it.</p>

      <div className="ft-table-scroll">
        <table className="ft-table">
          <thead>
            <tr>
              <th className="ft-feature-col"></th>
              {PLANS.map((p) => (
                <th
                  key={p.id}
                  className={"ft-plan-col" + (selectedId === p.id ? " selected" : "")}
                  onClick={() => onSelect(p.id)}
                >
                  <span className="ft-plan-name">{p.tier}</span>
                  <span className="ft-plan-price">${p.monthly}/mo</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURE_GROUPS.flatMap((g) => [
              <tr key={"g-" + g.group} className="ft-group-row">
                <td colSpan={4}>{g.group}</td>
              </tr>,
              ...g.rows.map((r) => (
                <tr key={g.group + "-" + r.label}>
                  <td className="ft-feature-col">
                    <span className="ft-label">{r.label}</span>
                    {r.note && <span className="ft-note">{r.note}</span>}
                  </td>
                  {r.values.map((v, i) => (
                    <td key={PLANS[i].id} className={"ft-plan-col" + (selectedId === PLANS[i].id ? " selected" : "")}>
                      {cell(v)}
                    </td>
                  ))}
                </tr>
              )),
            ])}
          </tbody>
        </table>
      </div>

      <div className="ft-stack">
        {PLANS.map((p, idx) => (
          <div key={p.id} className={"ft-stack-card" + (selectedId === p.id ? " selected" : "")} onClick={() => onSelect(p.id)}>
            <div className="ft-stack-head">
              <span className="ft-plan-name">{p.tier}</span>
              <span className="ft-plan-price">${p.monthly}/mo</span>
            </div>
            {FEATURE_GROUPS.map((g) => (
              <div key={g.group} className="ft-stack-group">
                <div className="ft-stack-group-title">{g.group}</div>
                {g.rows.map((r) => (
                  <div key={r.label} className="ft-stack-row">
                    <span className="ft-label">{r.label}</span>
                    {cell(r.values[idx])}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
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
        --bl-page:        #fafbff;
        --bl-card:        #fff;
        --bl-light-1:     #f8fbff;
        --bl-light-2:     #eef4fd;
        --bl-periwinkle:  #d9e0ff;
        --bl-border:      #d6defc;
        --bl-success:     #38a169;
        --bl-success-bg:  #f0fff4;
        --bl-success-fg:  #166534;
        --bl-radius:      10px;
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

      .gs-page { max-width: 1120px; margin: 0 auto; padding: 28px 24px 96px; }
      .text-center { text-align: center; }
      .mb-6 { margin-bottom: 24px; }
      .mt-6 { margin-top: 24px; }
      .mt-8 { margin-top: 32px; }
      .mt-10 { margin-top: 40px; }
      .row { display: flex; align-items: center; }
      .gap-3 { gap: 12px; }

      .gs-headline { font-size: 32px; line-height: 1.1; letter-spacing: -0.02em; font-weight: 800; color: var(--bl-fg); margin: 0 0 10px; }
      .gs-sub { color: var(--bl-fg-muted); font-size: 16px; line-height: 1.55; margin: 0 auto; max-width: 560px; }

      .guarantee-banner {
        display: inline-flex; align-items: center; gap: 7px;
        background: var(--bl-success-bg); color: var(--bl-success-fg);
        border: 1px solid rgba(56,161,105,0.25);
        font-size: 12.5px; font-weight: 700;
        padding: 6px 14px; border-radius: var(--bl-radius-pill);
        margin-bottom: 18px;
      }

      /* Buttons */
      .bl-btn {
        display: inline-flex; align-items: center; justify-content: center;
        gap: 8px; font: inherit; font-weight: 600; font-size: 15px;
        padding: 14px 24px; border-radius: var(--bl-radius);
        border: none; cursor: pointer; text-decoration: none;
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
      .bl-btn-secondary { background: var(--bl-card); color: var(--bl-fg); border: 1.5px solid var(--bl-border); white-space: nowrap; }
      .bl-btn-secondary:hover { border-color: var(--bl-blue-5); background: #fff; }

      /* Plan grid + cards */
      .plan-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
      @media (max-width: 900px) { .plan-grid { grid-template-columns: 1fr; } }

      .plan-card {
        position: relative; background: var(--bl-card);
        border: 1.5px solid var(--bl-border); border-radius: var(--bl-radius-lg);
        padding: 28px 24px 24px; cursor: pointer;
        transition: all var(--bl-dur) var(--bl-ease);
        display: flex; flex-direction: column;
      }
      .plan-card:hover { transform: translateY(-2px); border-color: var(--bl-blue-4); box-shadow: var(--bl-shadow); }
      .plan-card:focus-visible { outline: none; box-shadow: var(--bl-shadow-glow); }
      .plan-card.popular { border-color: var(--bl-blue-5); box-shadow: 0 12px 32px -10px rgba(135,156,247,0.45); transform: translateY(-4px); }
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
      .plan-divider { height: 1px; background: var(--bl-border); margin: 18px 0 16px; }

      .plan-feature-list { list-style: none; padding: 0; margin: 0 0 22px; display: flex; flex-direction: column; gap: 10px; }
      .plan-feature-list li { display: flex; align-items: center; gap: 10px; font-size: 14px; line-height: 1.4; color: var(--bl-fg-body); }
      .plan-feat-icon-img { width: 28px; height: 28px; flex-shrink: 0; object-fit: contain; }
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

      /* Enquiry row */
      .enquiry-row {
        margin-top: 24px; padding: 20px 24px;
        background: var(--bl-light-1); border: 1px solid var(--bl-border);
        border-radius: var(--bl-radius-lg);
        display: flex; align-items: center; justify-content: space-between; gap: 20px;
      }
      .enquiry-row strong { display: block; color: var(--bl-fg); font-size: 15px; margin-bottom: 3px; }
      .enquiry-row span { font-size: 13.5px; color: var(--bl-fg-muted); line-height: 1.45; }
      @media (max-width: 700px) { .enquiry-row { flex-direction: column; align-items: stretch; text-align: left; } }

      /* Trust strip */
      .trust-strip { margin-top: 32px; display: grid; grid-template-columns: repeat(4,1fr); gap: 18px; }
      @media (max-width: 800px) { .trust-strip { grid-template-columns: repeat(2,1fr); } }
      .trust-item { display: flex; align-items: flex-start; gap: 10px; }
      .trust-icon-img { width: 34px; height: 34px; flex-shrink: 0; object-fit: contain; }
      .trust-text { font-size: 13px; line-height: 1.4; color: var(--bl-fg-body); }
      .trust-text strong { color: var(--bl-fg); display: block; font-weight: 700; margin-bottom: 2px; }

      /* ── Feature table ── */
      .ft-wrap { margin-top: 56px; }
      .ft-title { font-size: 24px; font-weight: 800; color: var(--bl-fg); letter-spacing: -0.02em; margin: 0 0 6px; text-align: center; }
      .ft-sub { font-size: 14.5px; color: var(--bl-fg-muted); text-align: center; margin: 0 auto 28px; max-width: 520px; line-height: 1.5; }

      .ft-table-scroll { overflow-x: auto; }
      /* table-layout: fixed so the declared column widths are honoured exactly.
         With auto layout the browser sizes columns from content, so a long note
         in the feature column can shift the value columns and the ticks stop
         lining up with the text above them. */
      .ft-table { width: 100%; min-width: 640px; table-layout: fixed; border-collapse: collapse; background: var(--bl-card); border: 1px solid var(--bl-border); border-radius: var(--bl-radius-lg); overflow: hidden; }
      .ft-table th, .ft-table td { padding: 14px 18px; text-align: left; vertical-align: middle; }
      .ft-table thead th { background: var(--bl-light-1); border-bottom: 1px solid var(--bl-border); }
      .ft-feature-col { width: 40%; }
      .ft-plan-col { width: 20%; cursor: pointer; transition: background var(--bl-dur) var(--bl-ease); }
      .ft-table thead .ft-plan-col { text-align: center; }
      /* Every value sits in this wrapper and is centred with flex rather than
         text-align, so an inline SVG and a text node land on the same axis
         whatever the surrounding stylesheet does to svg display. */
      .ft-cell { display: flex; align-items: center; justify-content: center; min-height: 22px; }
      .ft-plan-col.selected { background: rgba(41,79,246,0.045); }
      thead .ft-plan-col:hover { background: var(--bl-light-2); }
      .ft-plan-name { display: block; font-size: 14px; font-weight: 700; color: var(--bl-fg); }
      .ft-plan-price { display: block; font-size: 12px; color: var(--bl-fg-muted); font-weight: 500; margin-top: 2px; }

      .ft-group-row td {
        background: var(--bl-light-2); color: var(--bl-fg);
        font-size: 11.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
        padding: 10px 18px;
      }
      .ft-table tbody tr:not(.ft-group-row) { border-top: 1px solid var(--bl-border); }
      .ft-label { display: block; font-size: 14px; color: var(--bl-fg-body); font-weight: 500; }
      .ft-note { display: block; font-size: 12.5px; color: var(--bl-fg-muted); line-height: 1.4; margin-top: 3px; }
      .ft-val { font-size: 14px; font-weight: 700; color: var(--bl-fg); }
      .ft-tick { color: var(--bl-success); }
      .ft-dash { color: #bbb; }

      /* Mobile: stack one card per plan */
      .ft-stack { display: none; flex-direction: column; gap: 16px; }
      .ft-stack-card { background: var(--bl-card); border: 1.5px solid var(--bl-border); border-radius: var(--bl-radius-lg); padding: 20px; cursor: pointer; }
      .ft-stack-card.selected { border-color: var(--bl-blue); box-shadow: 0 0 0 3px rgba(41,79,246,0.10); }
      .ft-stack-head { display: flex; align-items: baseline; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid var(--bl-border); margin-bottom: 12px; }
      .ft-stack-group { margin-bottom: 14px; }
      .ft-stack-group-title { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--bl-fg-muted); margin-bottom: 8px; }
      .ft-stack-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 6px 0; font-size: 13.5px; }
      .ft-stack-row .ft-cell { justify-content: flex-end; min-height: 0; }

      @media (max-width: 760px) {
        .ft-table-scroll { display: none; }
        .ft-stack { display: flex; }
      }

      /* Logos */
      .logo-eyebrow { font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #555; font-weight: 700; }
      .logo-strip { margin-top: 16px; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 32px; }
      .customer-logo { height: 22px; opacity: 0.55; transition: opacity var(--bl-dur) var(--bl-ease); }
      .customer-logo:hover { opacity: 1; }

      /* Sticky CTA */
      .sticky-cta {
        position: sticky; bottom: 0; z-index: 20;
        margin-top: 40px; padding: 14px 20px;
        background: rgba(255,255,255,0.92);
        backdrop-filter: saturate(140%) blur(10px);
        -webkit-backdrop-filter: saturate(140%) blur(10px);
        border: 1px solid var(--bl-border); border-radius: var(--bl-radius-lg);
        box-shadow: 0 -4px 20px -6px rgba(0,19,100,0.10);
        display: flex; align-items: center; justify-content: space-between; gap: 16px;
      }
      @media (max-width: 700px) { .sticky-cta { flex-direction: column; align-items: stretch; } }
      .plan-summary-flash { font-size: 13.5px; color: var(--bl-fg-body); }
      .plan-summary-flash strong { color: var(--bl-fg); }

      @keyframes blPulse {
        0%, 100% { box-shadow: 0 1px 0 0 rgba(255,255,255,0.4) inset, 0 4px 14px -2px rgba(135,156,247,0.45); }
        50%      { box-shadow: 0 1px 0 0 rgba(255,255,255,0.4) inset, 0 6px 22px 0 rgba(135,156,247,0.65); }
      }
      .bl-btn-primary.pulse { animation: blPulse 2.4s var(--bl-ease) infinite; }

      @media (prefers-reduced-motion: reduce) {
        .gs-root *, .gs-root *::before, .gs-root *::after { animation: none !important; transition: none !important; }
      }
    `}</style>
  );
}
