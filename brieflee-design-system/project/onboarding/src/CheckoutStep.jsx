function CheckoutStep({ selectedPlanId, billingInterval, onBack, onComplete, tweaks = {} }) {
  const { PLANS, FEATURES, yearlySavingsPct } = window.Brieflee;
  const trialDays = tweaks.trialDays || 7;
  const ctaCopy = tweaks.ctaCopy || `Pay $0 and start your ${trialDays}-day trial`;
  const plan = PLANS.find((p) => p.id === selectedPlanId);
  if (!plan) {
    return (
      <div className="gs-page text-center">
        <p className="gs-sub">Pick a plan first.</p>
        <button className="bl-btn bl-btn-secondary mt-6" onClick={onBack}>
          <Icons.ArrowLeft size={14} /> Back to plans
        </button>
      </div>
    );
  }

  const isYearly = billingInterval === "Yearly";
  const price = isYearly ? plan.yearly : plan.monthly;
  const monthlyEquivalent = isYearly ? Math.round(plan.yearly / 12) : plan.monthly;
  const savings = isYearly ? yearlySavingsPct(plan) : 0;
  const savedDollars = isYearly ? plan.monthly * 12 - plan.yearly : 0;

  const [card, setCard] = React.useState("");
  const [exp, setExp] = React.useState("");
  const [cvc, setCvc] = React.useState("");
  const [name, setName] = React.useState("");
  const [country, setCountry] = React.useState("United States");
  const [coupon, setCoupon] = React.useState("");

  const formatCard = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
  const formatExp = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + " / " + d.slice(2) : d;
  };

  return (
    <div className="gs-page">
      <div className="text-center mb-6">
        <div className="trial-banner">
          <span className="trial-dot"></span>
          You won't be charged today · Trial starts now
        </div>
        <h1 className="gs-headline">Activate your 7-day free trial</h1>
        <p className="gs-sub">Add a payment method so we can keep you in Brieflee after your trial. Cancel any time, in one click.</p>
      </div>

      <div className="checkout-grid">
        {/* Order summary */}
        <div className="stack gap-4">
          <div className="bl-card summary-card">
            <div className="row-between mb-4">
              <div>
                <div className="plan-tier">{plan.tier} plan</div>
                <div style={{ fontFamily: "var(--bl-font-display)", fontSize: 22, fontWeight: 700, color: "var(--bl-fg)", letterSpacing: "-0.01em" }}>
                  Brieflee {plan.tier} · {billingInterval}
                </div>
              </div>
              <button onClick={onBack} className="bl-btn bl-btn-secondary" style={{ padding: "8px 12px", fontSize: 13 }}>
                Change
              </button>
            </div>

            <ul className="plan-feature-list" style={{ marginBottom: 0 }}>
              <li><span className="plan-check"><Icons.Check size={11} strokeWidth={3} /></span> <span><strong>{plan.maxVideos}</strong> videos / month</span></li>
              <li><span className="plan-check"><Icons.Check size={11} strokeWidth={3} /></span> <span><strong>{plan.maxUsers}</strong> {plan.maxUsers === 1 ? "seat" : "seats"} included</span></li>
              {FEATURES.slice(0, 3).map((f) => (
                <li key={f.key}>
                  <span className="plan-check"><Icons.Check size={11} strokeWidth={3} /></span>
                  <span>{f.label}</span>
                </li>
              ))}
            </ul>

            <div className="summary-divider" />

            <div className="stack gap-2">
              <div className="price-row">
                <span>{billingInterval} subscription</span>
                <span>${price.toLocaleString()}</span>
              </div>
              <div className="price-row">
                <span>7-day trial discount</span>
                <span style={{ color: "var(--bl-success-fg)", fontWeight: 600 }}>−${price.toLocaleString()}</span>
              </div>
              {savedDollars > 0 && (
                <div className="price-row" style={{ color: "var(--bl-success-fg)" }}>
                  <span>Annual savings</span>
                  <span style={{ fontWeight: 600 }}>−${savedDollars.toLocaleString()} ({savings}% off)</span>
                </div>
              )}
              <div className="price-row total">
                <span>Due today</span>
                <span>$0.00</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--bl-fg-muted)", marginTop: 4 }}>
                On {new Date(Date.now() + 7 * 86400000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} you'll be charged ${price.toLocaleString()}{isYearly ? " for the year" : " for the month"}. Cancel any time before then.
              </div>
            </div>
          </div>

          {/* Reasons to believe */}
          <div className="bl-card" style={{ padding: 18 }}>
            <div className="stack gap-3">
              <div className="row gap-3" style={{ alignItems: "flex-start" }}>
                <img src="assets/eyes-blue.png" alt="" style={{ width: 32, height: 32, flexShrink: 0 }} />
                <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                  <strong style={{ color: "var(--bl-fg)" }}>15-day money-back guarantee</strong><br />
                  <span style={{ color: "var(--bl-fg-muted)" }}>Full refund within 15 days, no questions asked.</span>
                </div>
              </div>
              <div className="row gap-3" style={{ alignItems: "flex-start" }}>
                <img src="assets/rocket.png" alt="" style={{ width: 32, height: 32, flexShrink: 0 }} />
                <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                  <strong style={{ color: "var(--bl-fg)" }}>Cancel any time</strong><br />
                  <span style={{ color: "var(--bl-fg-muted)" }}>One click in settings. No emails, no friction.</span>
                </div>
              </div>
              <div className="row gap-3" style={{ alignItems: "flex-start" }}>
                <img src="assets/icon-sparkles.png" alt="" style={{ width: 32, height: 32, flexShrink: 0 }} />
                <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                  <strong style={{ color: "var(--bl-fg)" }}>Secure checkout</strong><br />
                  <span style={{ color: "var(--bl-fg-muted)" }}>Powered by Stripe. We never see your card.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          {tweaks.showTestimonial !== false && (
          <div className="testimonial">
            <div className="row gap-2 mb-3" style={{ color: "#f5b301" }}>
              {[1,2,3,4,5].map((i) => <Icons.Star key={i} size={14} fill="currentColor" />)}
            </div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "var(--bl-fg)" }}>
              "Brieflee cut our UGC review queue from a full afternoon to 12 minutes. The 26-item QA score is the part our brand managers won't shut up about."
            </p>
            <div className="row gap-3 mt-4">
              <div style={{ width: 36, height: 36, borderRadius: 999, background: "var(--bl-periwinkle)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--bl-blue)", fontWeight: 700, fontSize: 14 }}>
                MR
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--bl-fg)" }}>Maya Reyes</div>
                <div style={{ fontSize: 12, color: "var(--bl-fg-muted)" }}>Head of Creator Ops · Hello Bello</div>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Payment form */}
        <div className="bl-card" style={{ padding: 28 }}>
          <div className="row-between mb-4">
            <div className="row gap-2">
              <Icons.CreditCard size={16} />
              <span style={{ fontWeight: 700, color: "var(--bl-fg)" }}>Payment details</span>
            </div>
            <span style={{ fontSize: 11, color: "var(--bl-fg-muted)", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Icons.Lock size={12} /> Encrypted by Stripe
            </span>
          </div>

          <div className="form-grid">
            <div className="full">
              <label className="field-label">Cardholder name</label>
              <input className="bl-input" placeholder="Full name on card" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="full">
              <label className="field-label">Card number</label>
              <input
                className="bl-input"
                placeholder="1234 1234 1234 1234"
                value={card}
                onChange={(e) => setCard(formatCard(e.target.value))}
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="field-label">Expiry</label>
              <input
                className="bl-input"
                placeholder="MM / YY"
                value={exp}
                onChange={(e) => setExp(formatExp(e.target.value))}
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="field-label">CVC</label>
              <input
                className="bl-input"
                placeholder="123"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
              />
            </div>
            <div className="full">
              <label className="field-label">Billing country</label>
              <select className="bl-input" value={country} onChange={(e) => setCountry(e.target.value)}>
                <option>United States</option>
                <option>Canada</option>
                <option>United Kingdom</option>
                <option>Australia</option>
                <option>Germany</option>
                <option>France</option>
              </select>
            </div>
            <div className="full">
              <label className="field-label">Coupon code <span style={{ color: "var(--bl-fg-quiet)", fontWeight: 500 }}>· optional</span></label>
              <div className="row gap-2">
                <input
                  className="bl-input"
                  placeholder="Add coupon"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                />
                <button className="bl-btn bl-btn-secondary" style={{ padding: "10px 16px" }}>Apply</button>
              </div>
            </div>
          </div>

          <button className="bl-btn bl-btn-primary pulse mt-6" style={{ width: "100%", padding: "16px 24px" }} onClick={onComplete}>
            {ctaCopy} <Icons.ArrowRight size={14} />
          </button>

          <p className="text-center mt-4" style={{ fontSize: 12, color: "var(--bl-fg-muted)", lineHeight: 1.55 }}>
            By starting your trial you agree to Brieflee's <a href="#">Terms</a> and <a href="#">Privacy</a>. You won't be charged during the {trialDays}-day trial. End your subscription at any time with one click.
          </p>
        </div>
      </div>

      <div className="text-center mt-10">
        <button className="bl-btn bl-btn-ghost" onClick={onBack}>
          <Icons.ArrowLeft size={14} /> Choose a different plan
        </button>
      </div>
    </div>
  );
}

window.CheckoutStep = CheckoutStep;
