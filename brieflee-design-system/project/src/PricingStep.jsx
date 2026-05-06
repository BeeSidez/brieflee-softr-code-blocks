function PricingStep({ billingInterval, setBillingInterval, selectedPlanId, setSelectedPlanId, onNext, onBack, tweaks = {} }) {
  const { PLANS: BASE_PLANS, FEATURES, MAX_YEARLY_SAVINGS, yearlySavingsPct, TRIAL_FEATURES, SOCIAL_LOGOS } = window.Brieflee;
  const trialDays = tweaks.trialDays || 7;
  const popularId = tweaks.popularPlan || "crew";
  const PLANS = BASE_PLANS.map((p) => ({ ...p, popular: p.id === popularId }));
  const canNext = Boolean(selectedPlanId);
  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId);

  return (
    <div className="gs-page">
      <div className="text-center mb-6">
        <div style={{ display: "inline-block" }} className="trial-banner">
          <span className="trial-dot"></span>
          {trialDays} days free · No charge until your trial ends
        </div>
        <h1 className="gs-headline">{tweaks.headline || "Pick the plan that fits your team"}</h1>
        <p className="gs-sub">All plans include the full Brieflee toolkit. Cancel any time during your trial with one click.</p>

        <div className="mt-6">
          <IntervalToggle value={billingInterval} onChange={setBillingInterval} maxSavings={MAX_YEARLY_SAVINGS} />
        </div>
      </div>

      <div className="plan-grid mt-8">
        {PLANS.map((p) => {
          const selected = selectedPlanId === p.id;
          const isYearly = billingInterval === "Yearly";
          const monthlyEquivalent = isYearly ? Math.round(p.yearly / 12) : p.monthly;
          const billNote = isYearly ? `Billed $${p.yearly.toLocaleString()} per year` : "Billed monthly";
          const savings = isYearly ? yearlySavingsPct(p) : 0;
          const cls = "plan-card" + (p.popular ? " popular" : "") + (selected ? " selected" : "");

          return (
            <div key={p.id} className={cls} onClick={() => setSelectedPlanId(p.id)}>
              {p.popular && <div className="plan-popular-tag">Most popular</div>}

              <div className="plan-tier">{p.tier}</div>
              <div className="plan-name">For {p.tier === "Creator" ? "solos" : p.tier === "Crew" ? "growing teams" : "agencies"}</div>
              <div className="plan-desc">{p.desc}</div>

              <div className="plan-price-row">
                <span className="plan-price">${monthlyEquivalent}</span>
                <span className="plan-price-suffix">/mo</span>
              </div>
              <div className="plan-bill-note">{billNote}</div>
              {savings > 0 ?
              <span className="plan-savings"><Icons.Zap size={11} /> Save {savings}% vs monthly</span> :
              <span style={{ display: "inline-block", height: 22 }} />}

              <div className="plan-divider"></div>

              <ul className="plan-feature-list">
                <li>
                  <span className="plan-check"><Icons.Check size={11} strokeWidth={3} /></span>
                  <span><strong>{p.maxVideos}</strong> videos reviewed / mo</span>
                </li>
                <li>
                  <span className="plan-check"><Icons.Check size={11} strokeWidth={3} /></span>
                  <span><strong>{p.maxUsers}</strong> {p.maxUsers === 1 ? "seat" : "seats"}, <strong>{p.maxWorkspaces}</strong> {p.maxWorkspaces === 1 ? "workspace" : "workspaces"}</span>
                </li>
                {FEATURES.map((f) =>
                <li key={f.key}>
                    <span className="plan-check"><Icons.Check size={11} strokeWidth={3} /></span>
                    <span>{f.label}</span>
                  </li>
                )}
                {p.extras.map((x) =>
                <li key={x}>
                    <span className="plan-check" style={{ background: "var(--bl-periwinkle)", color: "var(--bl-blue)" }}>
                      <Icons.Sparkles size={11} />
                    </span>
                    <span>{x}</span>
                  </li>
                )}
              </ul>

              <div className="plan-cta">
                {selected ? <><Icons.Check size={14} strokeWidth={3} /> &nbsp;Selected</> : `Start ${trialDays}-day free trial`}
              </div>
            </div>);

        })}
      </div>

      {/* Trust strip — replaces foreplay's "trusted by" + reasons-to-believe */}
      {tweaks.showTrustStrip !== false &&
      <div className="trust-strip">
        {TRIAL_FEATURES.map((t) =>
        <div className="trust-item" key={t.title}>
            <img src={t.sticker} alt="" style={{ width: 32, height: 32, flexShrink: 0, borderStyle: "solid", borderWidth: "0px", objectFit: "cover", borderRadius: "4px" }} />
            <div className="trust-text">
              <strong>{t.title}</strong>
              {t.body}
            </div>
          </div>
        )}
      </div>
      }

      {/* Logo strip / social proof */}
      {tweaks.showLogoStrip !== false &&
      <div className="text-center mt-10">
        <div style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--bl-fg-muted)", fontWeight: 700 }}>
          Trusted by 10,000+ growth teams and agencies
        </div>
        <div className="logo-strip">
          {SOCIAL_LOGOS.map((l) => <span key={l}>{l}</span>)}
        </div>
      </div>
      }

      {/* Sticky CTA bar */}
      <div className="sticky-cta">
        <div className="row gap-3">
          <button className="bl-btn bl-btn-ghost" onClick={onBack}>
            <Icons.ArrowLeft size={14} /> Back
          </button>
          <div style={{ fontSize: 13, color: "var(--bl-fg-muted)" }}>
            {selectedPlan ?
            <><strong style={{ color: "var(--bl-fg)" }}>{selectedPlan.tier}</strong> · ${billingInterval === "Yearly" ? Math.round(selectedPlan.yearly / 12) : selectedPlan.monthly}/mo · {trialDays} days free</> :
            <>Pick a plan to continue · You won't be charged today</>}
          </div>
        </div>
        <button
          className={"bl-btn bl-btn-primary" + (canNext ? " pulse" : "")}
          onClick={onNext}
          disabled={!canNext}>
          
          Continue to checkout <Icons.ArrowRight size={14} />
        </button>
      </div>
    </div>);

}

function IntervalToggle({ value, onChange, maxSavings }) {
  const opts = ["Monthly", "Yearly"];
  return (
    <div className="interval-toggle">
      {opts.map((o) => {
        const active = value === o;
        return (
          <button key={o} className={active ? "active" : ""} onClick={() => onChange(o)}>
            {o}
            {o === "Yearly" && maxSavings > 0 &&
            <span className="save-pill">Save {maxSavings}%</span>
            }
          </button>);

      })}
    </div>);

}

window.PricingStep = PricingStep;