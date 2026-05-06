function App() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);

  const [step, setStep] = React.useState("team");
  const [teamName, setTeamName] = React.useState("");
  const [teamEmails, setTeamEmails] = React.useState(["", "", ""]);
  const [workTypeId, setWorkTypeId] = React.useState(null);
  const [heardAboutUsId, setHeardAboutUsId] = React.useState(null);
  const [billingInterval, setBillingInterval] = React.useState(t.billingDefault || "Yearly");
  const [selectedPlanId, setSelectedPlanId] = React.useState(t.popularPlan || "crew");

  // Apply accent CSS variable live from tweaks
  React.useEffect(() => {
    document.documentElement.style.setProperty("--bl-blue-5", t.accentHex);
  }, [t.accentHex]);

  const STEPS = window.Brieflee.STEPS;
  const goToStep = (id) => {
    setStep(id);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goNext = () => {
    const i = STEPS.findIndex((s) => s.id === step);
    if (i < STEPS.length - 1) goToStep(STEPS[i + 1].id);
  };
  const goBack = () => {
    const i = STEPS.findIndex((s) => s.id === step);
    if (i > 0) goToStep(STEPS[i - 1].id);
  };

  return (
    <div className="gs-shell" data-screen-label={`Get Started · ${step}`}>
      <header className="gs-topbar">
        <div className="gs-topbar-inner">
          <a href="#" aria-label="Brieflee">
            <img src="assets/brieflee-logo.svg" alt="Brieflee" className="gs-logo" />
          </a>
          <div className="gs-stepper-wrap">
            <Stepper currentId={step} />
          </div>
          <div className="gs-help">
            Need help? <a href="#">Contact us</a>
          </div>
        </div>
      </header>

      {step === "team" && (
        <TeamStep
          teamName={teamName} setTeamName={setTeamName}
          teamEmails={teamEmails} setTeamEmails={setTeamEmails}
          onNext={goNext} onSkip={goNext}
        />
      )}
      {step === "personalize" && (
        <PersonalizeStep
          workTypeId={workTypeId} setWorkTypeId={setWorkTypeId}
          heardAboutUsId={heardAboutUsId} setHeardAboutUsId={setHeardAboutUsId}
          onNext={goNext} onBack={goBack}
        />
      )}
      {step === "pricing" && (
        <PricingStep
          billingInterval={billingInterval} setBillingInterval={setBillingInterval}
          selectedPlanId={selectedPlanId} setSelectedPlanId={setSelectedPlanId}
          onNext={goNext} onBack={goBack}
          tweaks={t}
        />
      )}
      {step === "checkout" && (
        <CheckoutStep
          selectedPlanId={selectedPlanId}
          billingInterval={billingInterval}
          onBack={goBack}
          onComplete={() => alert("Trial started! (demo)")}
          tweaks={t}
        />
      )}

      <TweaksPanel title="Onboarding Tweaks">
        <TweakSection label="Jump to step" />
        <TweakRadio
          label="Step"
          value={step}
          options={["team", "personalize", "pricing", "checkout"]}
          onChange={(v) => goToStep(v)}
        />

        <TweakSection label="Brand" />
        <TweakColor label="Accent" value={t.accentHex} onChange={(v) => setTweak("accentHex", v)} />

        <TweakSection label="Pricing" />
        <TweakText label="Headline" value={t.headline} onChange={(v) => setTweak("headline", v)} />
        <TweakRadio
          label="Popular plan"
          value={t.popularPlan}
          options={["creator", "crew", "studio"]}
          onChange={(v) => setTweak("popularPlan", v)}
        />
        <TweakRadio
          label="Default billing"
          value={t.billingDefault}
          options={["Monthly", "Yearly"]}
          onChange={(v) => { setTweak("billingDefault", v); setBillingInterval(v); }}
        />
        <TweakSlider
          label="Trial length"
          value={t.trialDays} min={3} max={30} unit=" days"
          onChange={(v) => setTweak("trialDays", v)}
        />
        <TweakToggle label="Show trust strip" value={t.showTrustStrip}
          onChange={(v) => setTweak("showTrustStrip", v)} />
        <TweakToggle label="Show logo strip" value={t.showLogoStrip}
          onChange={(v) => setTweak("showLogoStrip", v)} />

        <TweakSection label="Checkout" />
        <TweakToggle label="Show testimonial" value={t.showTestimonial}
          onChange={(v) => setTweak("showTestimonial", v)} />
        <TweakText label="Pay button" value={t.ctaCopy}
          onChange={(v) => setTweak("ctaCopy", v)} />
      </TweaksPanel>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App />);
