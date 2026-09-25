/* Right rail: Details + the Sections / Modules accordion.
   Only one of Sections / Modules is expanded at a time. */
(function () {
  const { useState } = React;
  const Icon = window.Icon;

  const C = { navy: "var(--bl-fg)", body: "var(--bl-fg-body)", muted: "var(--bl-fg-muted)",
    quiet: "var(--bl-fg-quiet)", border: "var(--bl-border)", peri: "#879cf7", blue: "#294ff6", page: "var(--bl-page)" };

  const STATUS = [
    { name: "Draft", color: "#aeb4c8" }, { name: "Review", color: "#f8d313" },
    { name: "Approved", color: "#41d33e" }, { name: "Shared", color: "#879cf7" },
    { name: "Live", color: "#294ff6" }, { name: "Complete", color: "#197a16" },
  ];

  function Field({ children, icon }) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 11px", background: "#fff",
        border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 13, color: C.body, cursor: "pointer" }}>
        {icon && <span style={{ color: C.peri }}>{icon}</span>}
        <span style={{ flex: 1 }}>{children}</span>
        <span style={{ color: C.quiet }}><Icon name="chevrons-up-down" size={13} /></span>
      </div>
    );
  }

  function Details({ status, setStatus }) {
    const [open, setOpen] = useState(false);
    const cur = STATUS.find(s => s.name === status) || STATUS[0];
    return (
      <div style={{ padding: "16px 16px 8px" }}>
        <div style={sectHead}><Icon name="info" size={13} /> DETAILS</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 7, padding: "9px 11px", background: "#fff",
            border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 13, color: C.body }}>
            <span style={{ color: C.peri }}><Icon name="calendar" size={14} /></span> 30 Apr 2026
          </div>
          <div style={{ position: "relative" }}>
            <button onClick={() => setOpen(o => !o)} style={{ height: "100%", display: "flex", alignItems: "center", gap: 7,
              padding: "9px 12px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 13,
              fontWeight: 600, color: C.navy, cursor: "pointer", fontFamily: "inherit" }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: cur.color }} />{cur.name}
            </button>
            {open && (
              <div style={pop}>
                {STATUS.map(s => (
                  <button key={s.name} onClick={() => { setStatus(s.name); setOpen(false); }} style={popItem}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: s.color }} />{s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{ marginBottom: 8 }}><Field>No brand selected</Field></div>
        <div><Field icon={<Icon name="search" size={13} />}>Search or create board</Field></div>
      </div>
    );
  }

  function Row({ icon, name, sub, added, onClick, showAdd, tag, tagColor }) {
    const [h, setH] = useState(false);
    return (
      <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ width: "100%", textAlign: "left", display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 11px",
          border: "none", borderRadius: 9, cursor: "pointer", fontFamily: "inherit",
          background: added ? "#f2f5ff" : (h ? "#f7f9ff" : "transparent"), transition: "background .12s" }}>
        <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: 8, background: "#fff",
          border: `1px solid ${C.border}`, display: "grid", placeItems: "center", color: C.blue, marginTop: 1 }}>
          {window.SECTION_ICONS && window.SECTION_ICONS[name]
            ? <img src={window.SECTION_ICONS[name]} alt="" style={{ width: 20, height: 20, objectFit: "contain" }} />
            : <Icon name={icon} size={15} />}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: C.navy }}>{name}</span>
            {tag && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".04em", color: tagColor,
              border: `1px solid ${tagColor}33`, padding: "1px 5px", borderRadius: 999 }}>{tag}</span>}
          </span>
          {sub && <span style={{ display: "block", fontSize: 11.5, color: C.muted, lineHeight: 1.4, marginTop: 2,
            overflow: "hidden", textOverflow: "ellipsis", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", display: "-webkit-box" }}>{sub}</span>}
        </span>
        <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 6, marginTop: 2, display: "grid", placeItems: "center",
          background: added ? C.peri : "transparent", color: added ? "#fff" : C.quiet,
          border: added ? "none" : `1px solid ${C.border}` }}>
          <Icon name={added ? "check" : "plus"} size={13} stroke={2.4} /></span>
      </button>
    );
  }

  function Accordion({ label, icon, count, open, onToggle, children }) {
    return (
      <div style={{ borderTop: `1px solid ${C.border}` }}>
        <button onClick={onToggle} style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "13px 16px",
          background: open ? "#fff" : "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
          <span style={{ color: C.blue }}><Icon name={icon} size={15} /></span>
          <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: C.navy }}>{label}</span>
          {count > 0 && <span style={{ fontSize: 10.5, fontWeight: 700, color: C.blue, background: "#eef1ff", padding: "1px 7px", borderRadius: 999 }}>{count}</span>}
          <span style={{ flex: 1 }} />
          <span style={{ color: C.quiet, transform: open ? "rotate(90deg)" : "none", transition: "transform .18s" }}><Icon name="chevron-right" size={15} /></span>
        </button>
        {open && <div style={{ padding: "2px 8px 12px" }}>{children}</div>}
      </div>
    );
  }

  function Search({ value, onChange, ph }) {
    return (
      <div style={{ position: "relative", margin: "4px 4px 8px" }}>
        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.peri }}><Icon name="search" size={14} /></span>
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={ph}
          style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px 8px 32px", borderRadius: 8,
            border: `1.5px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: C.page, outline: "none" }} />
      </div>
    );
  }

  function ModulesPanel({ focus, onPickFocus, onClearFocus, onToggleModule, onToggleFormat, addedModules, vfName, showDesc }) {
    const [ftype, setFtype] = useState("product");
    const [adding, setAdding] = useState(false);
    const [url, setUrl] = useState("");
    const list = ftype === "product" ? window.WORKSPACE.products : window.WORKSPACE.features;
    const generic = window.MODULES.filter(m => !m.blueprint);
    const bp = focus ? window.blueprintFor(focus) : null;
    const seg = (k) => ({ flex: 1, padding: "6px 0", borderRadius: 7, border: "none", cursor: "pointer", fontFamily: "inherit",
      fontSize: 12.5, fontWeight: 600, textTransform: "capitalize", background: ftype === k ? "#fff" : "transparent",
      color: ftype === k ? C.navy : C.muted, boxShadow: ftype === k ? "var(--bl-shadow-xs)" : "none" });

    return (
      <div>
        <div style={{ fontSize: 11.5, color: C.muted, padding: "0 8px 8px", lineHeight: 1.5 }}>
          Pulled from your workspace. First, pick what this video is selling.</div>

        <div style={groupLbl}>Brand blueprint</div>
        <div style={{ padding: "0 4px" }}>
          <Row icon="sparkles" name="Brand" sub={showDesc ? "Your mission and USPs, the reasons this brand is worth backing." : null} added={addedModules.has("Brand")}
            onClick={() => onToggleModule({ name: "Brand", icon: "sparkles", body: window.starterFor("section", "Brand") })} />
        </div>

        {!focus ? (
          <div style={{ padding: "0 4px" }}>
            <div style={{ display: "flex", background: "var(--bl-light-2)", borderRadius: 9, padding: 3, margin: "2px 4px 10px" }}>
              {["product", "feature"].map(k => <button key={k} onClick={() => setFtype(k)} style={seg(k)}>{k}</button>)}
            </div>
            {list.map(p => (
              <button key={p.name} onClick={() => onPickFocus({ ...p, type: ftype })} style={focusRow}>
                <span style={rowIco}><Icon name={ftype === "product" ? "package" : "zap"} size={15} /></span>
                <span style={{ flex: 1, textAlign: "left" }}>
                  <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: C.navy }}>{p.name}</span>
                  <span style={{ display: "block", fontSize: 11.5, color: C.muted }}>{p.sub}</span>
                </span>
                <span style={{ color: C.quiet }}><Icon name="chevron-right" size={15} /></span>
              </button>
            ))}
            {!adding ? (
              <button onClick={() => setAdding(true)} style={addProdBtn}><Icon name="plus" size={14} /> Add a {ftype}</button>
            ) : (
              <div style={addForm}>
                <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 8, lineHeight: 1.5 }}>
                  Give the {ftype} so AI can write from it:</div>
                <input value={url} onChange={e => setUrl(e.target.value)} placeholder={"Paste " + ftype + " URL"}
                  style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 8,
                    border: `1.5px solid ${C.border}`, fontSize: 12.5, fontFamily: "inherit", background: "#fff", outline: "none" }} />
                <div style={{ textAlign: "center", fontSize: 11, color: C.quiet, margin: "7px 0" }}>or</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px",
                  border: `1.5px dashed ${C.border}`, borderRadius: 8, fontSize: 12, color: C.muted }}>
                  <Icon name="upload-cloud" size={16} /> Upload or paste a description</div>
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <button onClick={() => { onPickFocus({ name: url ? "New " + ftype : "New " + ftype, sub: url || "Added just now", type: ftype }); setAdding(false); setUrl(""); }}
                    style={primBtn}>Add {ftype}</button>
                  <button onClick={() => { setAdding(false); setUrl(""); }} style={ghostBtn}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: "0 4px" }}>
            <div style={focusChip}>
              <span style={rowIco}><Icon name={focus.type === "feature" ? "zap" : "package"} size={14} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: ".05em", color: C.blue, textTransform: "uppercase" }}>{focus.type} focus</span>
                <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{focus.name}</span>
              </span>
              <button onClick={onClearFocus} style={changeBtn}>Change</button>
            </div>
            <div style={groupLbl}>From the brand blueprint</div>
            <Row icon="star" name="Content Style" sub={showDesc ? bp.contentStyle : null} added={addedModules.has("Content Style")}
              onClick={() => onToggleModule({ name: "Content Style", icon: "star", body: `<p>${bp.contentStyle}</p>` })} />
            <Row icon="target" name="Target Audience" sub={showDesc ? bp.audience : null} added={addedModules.has("Target Audience")}
              onClick={() => onToggleModule({ name: "Target Audience", icon: "target", body: `<p>${bp.audience}</p>` })} />
            <div style={subLbl}>Concepts \u00b7 3 to choose</div>
            {bp.concepts.map(c => <Row key={c.name} icon="pen-tool" name={c.name} sub={showDesc ? c.desc : null} added={addedModules.has(c.name)}
              onClick={() => onToggleModule({ name: c.name, icon: "pen-tool", body: `<p><b>${c.name}</b> \u2014 ${c.desc}</p>` })} />)}
            <div style={subLbl}>Format \u00b7 3 to choose</div>
            {bp.formats.map(fn => { const vf = window.VISUAL_FORMATS.find(x => x.name === fn);
              return <Row key={fn} icon="layout" name={fn} sub={showDesc && vf ? vf.desc : null} added={vfName === fn} onClick={() => onToggleFormat(fn)} />; })}
            <div style={subLbl}>Hooks \u00b7 3 to choose</div>
            {bp.hooks.map((h, i) => <Row key={i} icon="zap" name={"Hook " + (i + 1)} sub={showDesc ? h : null} added={addedModules.has("Hook " + (i + 1))}
              onClick={() => onToggleModule({ name: "Hook " + (i + 1), icon: "zap", body: `<p>${h}</p>` })} />)}
            <div style={subLbl}>CTAs \u00b7 3 to choose</div>
            {bp.ctas.map((c, i) => <Row key={i} icon="message-square" name={"CTA " + (i + 1)} sub={showDesc ? c : null} added={addedModules.has("CTA " + (i + 1))}
              onClick={() => onToggleModule({ name: "CTA " + (i + 1), icon: "message-square", body: `<p>${c}</p>` })} />)}
          </div>
        )}

        <div style={groupLbl}>Add to brief</div>
        <div style={{ padding: "0 4px" }}>
          {generic.map(m => <Row key={m.name} icon={m.icon} name={m.name} sub={showDesc ? m.desc : null} added={addedModules.has(m.name)}
            onClick={() => onToggleModule(m)} />)}
        </div>
      </div>
    );
  }

  window.Rail = function Rail({ side = "right", showDesc = true, openPanel, setOpenPanel, addedSections, addedModules, onToggleSection, onToggleModule, status, setStatus, focus, onPickFocus, onClearFocus, onToggleFormat, vfName }) {
    const [qs, setQs] = useState("");
    const secs = window.BIBLE.filter(s => s.name.toLowerCase().includes(qs.toLowerCase()));
    return (
      <aside style={{ width: 340, flexShrink: 0, background: "#FAFBFF",
        borderLeft: side === "right" ? `1px solid ${C.border}` : "none",
        borderRight: side === "left" ? `1px solid ${C.border}` : "none",
        height: "100%", overflowY: "auto" }}>
        <Details status={status} setStatus={setStatus} />
        <Accordion label="Sections" icon="layout-template" count={addedSections.size}
          open={openPanel === "sections"} onToggle={() => setOpenPanel(openPanel === "sections" ? null : "sections")}>
          <div style={{ fontSize: 11.5, color: C.muted, padding: "0 8px 8px", lineHeight: 1.5 }}>
            The building blocks of the brief. Add a section to drop it into the page.</div>
          <Search value={qs} onChange={setQs} ph="Search sections..." />
          {secs.map(s => (
            <Row key={s.name} icon={s.icon} name={s.name} sub={showDesc ? s.what : null} added={addedSections.has(s.name)}
              onClick={() => onToggleSection(s)} tag={s.live ? "LIVE" : null} tagColor="#197a16" />
          ))}
        </Accordion>
        <Accordion label="Modules" icon="layers" count={addedModules.size}
          open={openPanel === "modules"} onToggle={() => setOpenPanel(openPanel === "modules" ? null : "modules")}>
          <ModulesPanel focus={focus} onPickFocus={onPickFocus} onClearFocus={onClearFocus}
            onToggleModule={onToggleModule} onToggleFormat={onToggleFormat}
            addedModules={addedModules} vfName={vfName} showDesc={showDesc} />
        </Accordion>
      </aside>
    );
  };

  const sectHead = { display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, letterSpacing: ".05em",
    textTransform: "uppercase", color: "var(--bl-fg-muted)", marginBottom: 12 };
  const groupLbl = { fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase",
    color: "var(--bl-fg-quiet)", padding: "10px 12px 4px" };
  const subLbl = { fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase",
    color: "var(--bl-blue-5)", padding: "12px 12px 2px" };
  const rowIco = { width: 28, height: 28, flexShrink: 0, borderRadius: 8, background: "#fff",
    border: "1px solid var(--bl-border)", display: "grid", placeItems: "center", color: "var(--bl-blue)" };
  const focusRow = { width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 11px", marginBottom: 4,
    border: "1px solid var(--bl-border)", borderRadius: 10, background: "#fff", cursor: "pointer", fontFamily: "inherit" };
  const addProdBtn = { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px",
    border: "1.5px dashed var(--bl-border)", borderRadius: 10, background: "transparent", color: "var(--bl-fg-muted)",
    fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginTop: 4 };
  const addForm = { border: "1px solid var(--bl-border)", borderRadius: 10, background: "#fff", padding: 12, marginTop: 4 };
  const primBtn = { flex: 1, padding: "8px 0", border: "none", borderRadius: 8, background: "#879cf7", color: "#fff",
    fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" };
  const ghostBtn = { padding: "8px 14px", border: "1px solid var(--bl-border)", borderRadius: 8, background: "#fff",
    color: "var(--bl-fg)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
  const focusChip = { display: "flex", alignItems: "center", gap: 10, padding: "10px 11px", marginBottom: 4,
    background: "#f2f5ff", border: "1px solid var(--bl-border)", borderRadius: 10 };
  const changeBtn = { flexShrink: 0, padding: "5px 10px", border: "1px solid var(--bl-border)", borderRadius: 7, background: "#fff",
    color: "var(--bl-blue)", fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
  const pop = { position: "absolute", right: 0, top: "calc(100% + 6px)", background: "#fff", borderRadius: 10,
    border: `1px solid var(--bl-border)`, boxShadow: "var(--bl-shadow-lg)", padding: 6, zIndex: 30, width: 150 };
  const popItem = { width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 9px", border: "none",
    background: "transparent", borderRadius: 7, fontSize: 13, color: "var(--bl-fg)", cursor: "pointer", fontFamily: "inherit", textAlign: "left" };
})();
