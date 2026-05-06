function TeamStep({ teamName, setTeamName, teamEmails, setTeamEmails, onNext, onSkip }) {
  const setEmail = (i, v) => setTeamEmails(teamEmails.map((e, k) => (k === i ? v : e)));
  const addEmail = () => setTeamEmails([...teamEmails, ""]);
  const removeEmail = (i) => setTeamEmails(teamEmails.filter((_, k) => k !== i));
  const canNext = teamName.trim().length > 0;
  const inviteCount = teamEmails.filter((e) => e.trim()).length;

  return (
    <div className="gs-page gs-page-narrow">
      <div className="text-center mb-6">
        <div className="team-hero">
          <img src="assets/eyes-blue.png" alt="" />
        </div>
        <span className="gs-eyebrow">Step 1 of 4 · Set up your workspace</span>
        <h1 className="gs-headline">Name your team and invite your crew</h1>
        <p className="gs-sub">Brieflee is built for review across briefs, brands and teammates. You can always add more people later.</p>
      </div>

      <div className="bl-card" style={{ padding: 28 }}>
        <label className="field-label" htmlFor="team-name">Team name</label>
        <input
          id="team-name"
          className="bl-input"
          placeholder="e.g. Ad Rockstars"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />
        <div className="field-help">This becomes your workspace title across Brieflee.</div>

        <div className="mt-6">
          <label className="field-label">
            <span className="row gap-2">
              <Icons.Mail size={14} />
              <span>Invite teammates</span>
              <span style={{ color: "var(--bl-fg-quiet)", fontWeight: 500 }}>· optional</span>
            </span>
          </label>
          <div className="stack gap-2">
            {teamEmails.map((val, i) => (
              <div key={i} className="row gap-2">
                <input
                  className="bl-input"
                  type="email"
                  placeholder="name@company.com"
                  value={val}
                  onChange={(e) => setEmail(i, e.target.value)}
                />
                {teamEmails.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEmail(i)}
                    aria-label="Remove"
                    style={{
                      flexShrink: 0, width: 40, height: 40, borderRadius: 10,
                      background: "transparent", border: "1.5px solid var(--bl-border)",
                      color: "var(--bl-fg-muted)", cursor: "pointer",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Icons.X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addEmail}
            className="row gap-2 mt-3"
            style={{
              background: "transparent", border: "none", padding: 0, cursor: "pointer",
              color: "var(--bl-blue)", fontWeight: 600, fontSize: 13,
            }}
          >
            <Icons.Plus size={14} /> Add another teammate
          </button>
        </div>
      </div>

      <div className="nav-row">
        <button className="bl-btn bl-btn-ghost" onClick={onSkip}>Skip for now</button>
        <button
          className="bl-btn bl-btn-primary"
          onClick={onNext}
          disabled={!canNext}
        >
          {inviteCount > 0 ? <><Icons.Send size={14} /> Send {inviteCount} invite{inviteCount > 1 ? "s" : ""} & continue</> : <>Continue <Icons.ArrowRight size={14} /></>}
        </button>
      </div>

      <p className="text-center mt-6" style={{ fontSize: 12, color: "var(--bl-fg-quiet)" }}>
        Teammates get a free seat under your trial. No card needed for them.
      </p>
    </div>
  );
}

window.TeamStep = TeamStep;
