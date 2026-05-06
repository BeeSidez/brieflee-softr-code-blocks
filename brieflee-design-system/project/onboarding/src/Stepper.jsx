function Stepper({ currentId }) {
  const { STEPS } = window.Brieflee;
  const idx = STEPS.findIndex((s) => s.id === currentId);
  return (
    <div className="step-row">
      {STEPS.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        const klass = active ? "step-pill active" : done ? "step-pill done" : "step-pill";
        return (
          <React.Fragment key={s.id}>
            <div className={klass}>
              <span className="step-dot">
                {done ? <Icons.Check size={11} strokeWidth={3} /> : i + 1}
              </span>
              <span>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="step-sep" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

window.Stepper = Stepper;
