function PersonalizeStep({ workTypeId, setWorkTypeId, heardAboutUsId, setHeardAboutUsId, onNext, onBack }) {
  const { WORK_TYPE_OPTIONS, HEARD_FROM_OPTIONS } = window.Brieflee;
  const canNext = Boolean(workTypeId && heardAboutUsId);

  return (
    <div className="gs-page gs-page-medium">
      <div className="text-center mb-6">
        <span className="gs-eyebrow">Step 2 of 4 · Personalize</span>
        <h1 className="gs-headline">Tell us about your work</h1>
        <p className="gs-sub">We'll tune Brieflee's review thresholds, brief templates and onboarding examples to fit how you work.</p>
      </div>

      <div className="personalize-grid">
        <div className="personalize-card" style={{ textAlign: "center" }}>
          <div className="row gap-3 mb-4" style={{ alignItems: "flex-start" }}>
            <img src="assets/looking-eyes.png" alt="" style={{ width: 40, height: 40, marginTop: -4, flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: "var(--bl-fg)", textAlign: "left" }}>Your work</div>
              <div style={{ fontSize: 12, color: "var(--bl-fg-muted)" }}>What best describes you?</div>
            </div>
          </div>
          <div className="row gap-2" style={{ flexWrap: "wrap", textAlign: "justify" }}>
            {WORK_TYPE_OPTIONS.map((opt) => {
              const sel = workTypeId === opt.id;
              return (
                <button
                  key={opt.id}
                  className={"opt-chip" + (sel ? " selected" : "")}
                  onClick={() => setWorkTypeId(opt.id)}>
                  
                  {sel && <Icons.Check size={12} strokeWidth={3} />}
                  {opt.label}
                </button>);

            })}
          </div>
        </div>

        <div className="personalize-card">
          <div className="row gap-3 mb-4" style={{ alignItems: "flex-start" }}>
            <img src="assets/eyes-blue.png" alt="" style={{ width: 40, height: 40, marginTop: -4, flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: "var(--bl-fg)", lineHeight: 1.3 }}>How did you find us?</div>
              <div style={{ fontSize: 12, color: "var(--bl-fg-muted)" }}>Helps us know what's working.</div>
            </div>
          </div>
          <div className="row gap-2" style={{ flexWrap: "wrap" }}>
            {HEARD_FROM_OPTIONS.map((opt) => {
              const sel = heardAboutUsId === opt.id;
              return (
                <button
                  key={opt.id}
                  className={"opt-chip" + (sel ? " selected" : "")}
                  onClick={() => setHeardAboutUsId(opt.id)}>
                  
                  {sel && <Icons.Check size={12} strokeWidth={3} />}
                  {opt.label}
                </button>);

            })}
          </div>
        </div>
      </div>

      <div className="nav-row">
        <button className="bl-btn bl-btn-ghost" onClick={onBack}>
          <Icons.ArrowLeft size={14} /> Back
        </button>
        <button className={"bl-btn bl-btn-primary" + (canNext ? " pulse" : "")} onClick={onNext} disabled={!canNext}>
          Continue <Icons.ArrowRight size={14} />
        </button>
      </div>
    </div>);

}

window.PersonalizeStep = PersonalizeStep;