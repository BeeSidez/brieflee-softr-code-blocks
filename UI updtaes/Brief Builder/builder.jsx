/* Brief Builder — top bar, format menu, autosave, and the App that wires it all. */
(function () {
  const { useState, useMemo, useRef, useEffect } = React;
  const Icon = window.Icon;

  const C = { navy: "#001364", navy2: "#001b6f", peri: "#879cf7", blue: "#294ff6",
    border: "var(--bl-border)", muted: "var(--bl-fg-muted)", page: "var(--bl-page)" };

  let SEQ = 100;
  const uid = () => "b" + (++SEQ);

  const BENTRY = (name) => window.BIBLE.find(s => s.name === name);
  const bodyForMode = (e, mode) => (mode === "worked" ? e.worked : e.placeholder);
  const sectionBlock = (name, mode) => {
    const e = BENTRY(name); if (!e) return null;
    if (e.special === "visual") return { id: uid(), kind: "section", name: e.name, icon: e.icon, format: e.format, special: "visual", selectedFormat: null };
    const m = mode || "placeholder";
    return { id: uid(), kind: "section", name: e.name, icon: e.icon, format: e.format, mode: m, body: bodyForMode(e, m) };
  };

  const { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle } = window;
  const TWEAK_DEFAULTS = {
    density: "comfortable",
    railSide: "right",
    sample: true,
    railDescriptions: true,
  };

  const makeSample = () => {
    const vf = sectionBlock("Visual Format");
    if (vf) vf.selectedFormat = window.VISUAL_FORMATS.find(f => f.name === "Testimonial");
    return [
      sectionBlock("Brand", "worked"),
      sectionBlock("The Offer", "worked"),
      sectionBlock("Audience / Customer", "worked"),
      sectionBlock("Product / Feature", "worked"),
      sectionBlock("Hook", "worked"),
      vf,
      { id: uid(), kind: "module", name: "Channel", icon: "rectangle", special: "channel", channels: ["Facebook", "Instagram"] },
    ].filter(Boolean);
  };

  const TEXT_STARTERS = {
    "Heading": `<p style="font-size:22px;font-weight:700;color:var(--bl-fg);margin:0">New heading</p>`,
    "Bullet List": `<ul><li>List item</li><li>List item</li></ul>`,
    "Numbered List": `<ol><li>List item</li><li>List item</li></ol>`,
    "Task List": `<ul data-task="1"><li>To-do item</li><li>To-do item</li></ul>`,
    "Blockquote": `<blockquote>Quoted text</blockquote>`,
    "Code Block": `<pre><code>// code</code></pre>`,
    "Table": `<table><thead><tr><th>Column</th><th>Column</th></tr></thead><tbody><tr><td>Cell</td><td>Cell</td></tr><tr><td>Cell</td><td>Cell</td></tr></tbody></table>`,
    "Horizontal Rule": `<hr/>`,
    "3-Column Block": `<div class="cols3"><div>Column one</div><div>Column two</div><div>Column three</div></div>`,
    "Embed Block": `<div class="embedbox">\u2295 Paste a link, video or preview URL</div>`,
  };

  // ---- floating format menu ------------------------------------------------
  function FormatMenu({ rect, onPick, onClose }) {
    useEffect(() => {
      const h = () => onClose();
      window.addEventListener("mousedown", h, true);
      window.addEventListener("scroll", h, true);
      return () => { window.removeEventListener("mousedown", h, true); window.removeEventListener("scroll", h, true); };
    }, []);
    if (!rect) return null;
    const top = Math.min(rect.bottom + 6, window.innerHeight - 380);
    const left = Math.min(rect.left, window.innerWidth - 250);
    return (
      <div onMouseDown={e => e.stopPropagation()} style={{ position: "fixed", top, left, width: 236, zIndex: 60,
        background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: "var(--bl-shadow-lg)", padding: 6 }}>
        {window.TEXT_FORMATS.map(g => (
          <div key={g.group}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase",
              color: "var(--bl-fg-quiet)", padding: "8px 10px 4px" }}>{g.group}</div>
            {g.items.map(it => (
              <button key={it.name} onClick={() => onPick(it)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", border: "none", background: "transparent", borderRadius: 8, cursor: "pointer",
                fontFamily: "inherit", textAlign: "left" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f5f7ff"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${C.border}`,
                  display: "grid", placeItems: "center", color: C.blue }}><Icon name={it.icon} size={14} /></span>
                <span>
                  <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.navy }}>{it.name}</span>
                  <span style={{ display: "block", fontSize: 11, color: "var(--bl-fg-muted)" }}>{it.desc}</span>
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // ---- top bar -------------------------------------------------------------
  function TopBar({ title, saving, savedAt, sample, onToggleSample, onPreview }) {
    const btn = { display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 9,
      background: "#fff", color: C.navy, border: `1px solid ${C.border}`, fontSize: 13, fontWeight: 600,
      cursor: "pointer", fontFamily: "inherit" };
    const icoBtn = { width: 34, height: 34, borderRadius: 9, background: "#fff", color: C.navy,
      border: `1px solid ${C.border}`, cursor: "pointer", display: "grid", placeItems: "center" };
    return (
      <header style={{ background: "#FAFBFF", color: C.navy, borderBottom: `1px solid ${C.border}`,
        padding: "0 16px", height: 56, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button style={icoBtn} title="Back"><Icon name="arrow-left" size={16} /></button>
        <div style={{ display: "flex", background: "var(--bl-light-2)", borderRadius: 9, padding: 3 }}>
          <span style={{ padding: "5px 13px", borderRadius: 7, background: "#fff", color: C.navy, fontSize: 13, fontWeight: 700, boxShadow: "var(--bl-shadow-xs)" }}>Brief</span>
          <span style={{ padding: "5px 13px", borderRadius: 7, color: "var(--bl-fg-muted)", fontSize: 13, fontWeight: 600 }}>Content</span>
        </div>
        <div style={{ flex: 1, textAlign: "center", fontSize: 14, fontWeight: 600, color: C.navy,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: "0 12px" }}>{title || "Untitled Brief"}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "var(--bl-fg-muted)", marginRight: 4 }}>
          {saving
            ? (<><span className="bl-spin" style={{ width: 12, height: 12, border: "2px solid var(--bl-border)", borderTopColor: C.blue, borderRadius: 999, display: "inline-block" }} /> Saving...</>)
            : (<><span style={{ color: "var(--bl-success-fg)" }}><Icon name="check" size={13} /></span> Saved {savedAt}</>)}
        </div>
        <div style={{ display: "flex", background: "var(--bl-light-2)", borderRadius: 9, padding: 3, marginRight: 2 }} title="Preview the brief empty or with sample content">
          {[["empty", "Empty"], ["sample", "Sample"]].map(([k, lbl]) => {
            const on = (k === "sample") === !!sample;
            return (
              <button key={k} onClick={() => onToggleSample(k === "sample")} style={{ padding: "5px 11px", borderRadius: 7, border: "none",
                cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 600,
                background: on ? "#fff" : "transparent", color: on ? C.navy : "var(--bl-fg-muted)", boxShadow: on ? "var(--bl-shadow-xs)" : "none" }}>{lbl}</button>
            );
          })}
        </div>
        <button style={btn} title="Format toolbar"><Icon name="wand" size={15} /></button>
        <button style={btn} onClick={onPreview} title="See the creator-facing view"><Icon name="eye" size={14} /> Preview</button>
        <button style={btn}><Icon name="share" size={14} /> Share</button>
        <button style={{ ...btn, background: "#879cf7", color: "#fff", border: "none" }}><Icon name="layout-template" size={14} /> Template</button>
        <button style={icoBtn} title="Comments"><Icon name="message-circle" size={16} /></button>
      </header>
    );
  }

  // ---- app -----------------------------------------------------------------
  function App() {
    const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
    const [blocks, setBlocks] = useState(makeSample);
    const [docKey, setDocKey] = useState(0);
    const [openPanel, setOpenPanel] = useState("sections");
    const [status, setStatus] = useState("Draft");
    const [title, setTitle] = useState("Creator brief \u2014 Luna Roca");
    const [focus, setFocus] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState("just now");
    const [menu, setMenu] = useState(null); // {rect, target}
    const timer = useRef(null);

    const firstTweak = useRef(true);
    useEffect(() => {
      if (firstTweak.current) { firstTweak.current = false; return; }
      if (t.sample) { setBlocks(makeSample()); setTitle("Creator brief \u2014 Luna Roca"); }
      else { setBlocks([]); setTitle("Untitled Brief"); }
      setFocus(null);
      setDocKey(k => k + 1);
    }, [t.sample]);

    const triggerSave = () => {
      setSaving(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setSaving(false);
        setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      }, 750);
    };
    const onEdit = (e) => {
      if (e && e.target && e.target.dataset && e.target.dataset.role === "title") setTitle(e.target.innerText);
      triggerSave();
    };

    const addedSections = useMemo(() => new Set(blocks.filter(b => b.kind === "section").map(b => b.name)), [blocks]);
    const addedModules = useMemo(() => new Set(blocks.filter(b => b.kind === "module").map(b => b.name)), [blocks]);

    const toggleSection = (s) => {
      setBlocks(bs => {
        if (bs.some(b => b.kind === "section" && b.name === s.name)) return bs.filter(b => !(b.kind === "section" && b.name === s.name));
        const nb = sectionBlock(s.name, s.name === "Brand" ? "worked" : "placeholder");
        return nb ? [...bs, nb] : bs;
      });
      triggerSave();
    };
    const setMode = (id, mode) => {
      setBlocks(bs => bs.map(b => {
        if (b.id !== id) return b;
        const e = BENTRY(b.name); if (!e) return b;
        return { ...b, mode, writing: false, body: bodyForMode(e, mode), rev: (b.rev || 0) + 1 };
      }));
      triggerSave();
    };
    const toggleModule = (m) => {
      setBlocks(bs => {
        if (bs.some(b => b.kind === "module" && b.name === m.name)) return bs.filter(b => !(b.kind === "module" && b.name === m.name));
        const special = m.special || (m.name === "Channel" ? "channel" : null);
        const nb = { id: uid(), kind: "module", name: m.name, icon: m.icon || "layers", special,
          ...(special === "channel" ? { channels: [] } : { body: m.body || window.starterFor("module", m.name) }) };
        return [...bs, nb];
      });
      triggerSave();
    };
    const removeBlock = (id) => { setBlocks(bs => bs.filter(b => b.id !== id)); triggerSave(); };
    const moveBlock = (id, dir) => setBlocks(bs => {
      const i = bs.findIndex(b => b.id === id), j = i + dir;
      if (i < 0 || j < 0 || j >= bs.length) return bs;
      const n = bs.slice(); const tmp = n[i]; n[i] = n[j]; n[j] = tmp; return n;
    });
    const selectFormat = (id, f) => { setBlocks(bs => bs.map(b => b.id === id ? { ...b, selectedFormat: f } : b)); triggerSave(); };    const toggleChannel = (id, name) => { setBlocks(bs => bs.map(b => b.id === id
      ? { ...b, channels: b.channels.includes(name) ? b.channels.filter(c => c !== name) : [...b.channels, name] } : b)); triggerSave(); };

    const pickFocus = (f) => {
      setFocus(f);
      setBlocks(bs => {
        const name = "Product / Feature";
        const body = `<p><b>${f.name}</b> \u2014 ${f.sub}. ${f.type === "feature" ? "Feature" : "Product"} focus for this video.</p>`;
        const i = bs.findIndex(b => b.name === name);
        if (i >= 0) return bs.map(b => b.name === name ? { ...b, body, rev: (b.rev || 0) + 1 } : b);
        return [...bs, { id: uid(), kind: "section", name, icon: "package", body }];
      });
      triggerSave();
    };
    const clearFocus = () => setFocus(null);
    const toggleFormat = (name) => {
      const f = window.VISUAL_FORMATS.find(x => x.name === name);
      setBlocks(bs => {
        const vf = bs.find(b => b.special === "visual");
        if (vf) return bs.map(b => b.special === "visual"
          ? { ...b, selectedFormat: b.selectedFormat && b.selectedFormat.name === name ? null : f } : b);
        return [...bs, { id: uid(), kind: "section", name: "Visual Format", icon: "layout", special: "visual", selectedFormat: f }];
      });
      triggerSave();
    };
    const aiWrite = async (id) => {
      const b0 = blocks.find(b => b.id === id);
      const entry = b0 && BENTRY(b0.name);
      setBlocks(bs => bs.map(b => b.id === id ? { ...b, writing: true, mode: "ai" } : b));
      setSaving(true);
      const finish = (html) => {
        setBlocks(bs => bs.map(b => b.id === id ? { ...b, writing: false, mode: "ai", body: html, rev: (b.rev || 0) + 1 } : b));
        setSaving(false);
        setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      };
      try {
        if (window.claude && window.claude.complete && entry && entry.prompt) {
          const brand = "Luna Roca (the Volcanic Roller: a reusable volcanic-stone tool that absorbs facial oil without smudging makeup)";
          const p = entry.prompt.replace("[BRAND NAME or WEBSITE URL]", brand).replace("[CREATOR TYPE]", "Affiliate")
            + "\n\nReturn ONLY the section content as clean HTML (use <p>, <ul><li>, <b>, or a <table> if the format calls for it). No preamble, no code fences.";
          const out = await window.claude.complete(p);
          finish(out && out.trim() ? out : (entry ? entry.worked : "<p>Draft.</p>"));
          return;
        }
      } catch (e) { /* fall through to simulated draft */ }
      setTimeout(() => finish(entry ? entry.worked : "<p>Draft written by AI.</p>"), 1100);
    };
    const vfName = useMemo(() => { const vf = blocks.find(b => b.special === "visual"); return vf && vf.selectedFormat ? vf.selectedFormat.name : null; }, [blocks]);

    const openFormats = (target, el) => setMenu({ rect: el.getBoundingClientRect(), target });
    const pickFormat = (it) => {
      const nb = { id: uid(), kind: "text", name: it.name, icon: it.icon, format: it.name, body: TEXT_STARTERS[it.name] || "<p></p>" };
      setBlocks(bs => {
        if (menu.target === "add") return [...bs, nb];
        const i = bs.findIndex(b => b.id === menu.target);
        return [...bs.slice(0, i + 1), nb, ...bs.slice(i + 1)];
      });
      setMenu(null); triggerSave();
    };

    const docEl = (
      <main data-screen-label="Brief document" style={{ flex: 1, overflowY: "auto", background: "#fff", order: t.railSide === "left" ? 2 : 1 }}>
        <window.DocEditor key={docKey} blocks={blocks} emptyStart={!t.sample} focusSet={!!focus} onEdit={onEdit} onRemove={removeBlock} onMove={moveBlock}
          onSelectFormat={selectFormat} onToggleChannel={toggleChannel} onAiWrite={aiWrite} onSetMode={setMode}
          onOpenFormats={(id, el) => openFormats(id, el)} onAddClick={(el) => openFormats("add", el)} dense={t.density === "compact"} />
      </main>
    );
    const railEl = (
      <window.Rail key="rail" side={t.railSide} showDesc={t.railDescriptions} openPanel={openPanel} setOpenPanel={setOpenPanel}
        addedSections={addedSections} addedModules={addedModules}
        onToggleSection={toggleSection} onToggleModule={toggleModule} status={status} setStatus={setStatus}
        focus={focus} onPickFocus={pickFocus} onClearFocus={clearFocus} onToggleFormat={toggleFormat} vfName={vfName} />
    );
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#fff", overflow: "hidden" }}>
        <TopBar title={title} saving={saving} savedAt={savedAt} sample={t.sample} onToggleSample={v => setTweak("sample", v)} onPreview={() => setShowPreview(true)} />
        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
          {docEl}
          <div style={{ order: t.railSide === "left" ? 1 : 2, display: "flex" }}>{railEl}</div>
        </div>
        {menu && <FormatMenu rect={menu.rect} onPick={pickFormat} onClose={() => setMenu(null)} />}
        {showPreview && (
          <div onClick={() => setShowPreview(false)} style={{ position: "fixed", inset: 0, zIndex: 80,
            background: "rgba(0,19,100,.35)", display: "grid", placeItems: "center" }}>
            <div onClick={e => e.stopPropagation()} style={{ width: 440, maxWidth: "90vw", background: "#fff", borderRadius: 16,
              boxShadow: "var(--bl-shadow-lg)", padding: "28px 26px", textAlign: "center" }}>
              <div style={{ width: 200, height: 120, margin: "0 auto 18px", borderRadius: 12,
                background: "linear-gradient(180deg,#ecf0ff,#879cf7)", display: "grid", placeItems: "center", color: "#fff" }}>
                <Icon name="eye" size={34} /></div>
              <h3 style={{ margin: "0 0 8px", fontSize: 20, color: C.navy }}>Creator preview</h3>
              <p style={{ margin: "0 0 18px", fontSize: 14, color: "var(--bl-fg-muted)", lineHeight: 1.55 }}>
                This opens the creator-facing view of the brief — hero, submission details, “what our AI checks”, and the Submit flow.
                Wiring up your existing preview page here.</p>
              <button onClick={() => setShowPreview(false)} style={{ background: "#879cf7", color: "#fff", border: "none",
                padding: "10px 20px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Got it</button>
            </div>
          </div>
        )}
        <TweaksPanel>
          <TweakSection label="Layout" />
          <TweakRadio label="Rail side" value={t.railSide} options={["left", "right"]} onChange={v => setTweak("railSide", v)} />
          <TweakRadio label="Density" value={t.density} options={["comfortable", "compact"]} onChange={v => setTweak("density", v)} />
          <TweakSection label="Content" />
          <TweakToggle label="Sample brief" value={t.sample} onChange={v => setTweak("sample", v)} />
          <TweakToggle label="Section descriptions" value={t.railDescriptions} onChange={v => setTweak("railDescriptions", v)} />
        </TweaksPanel>
      </div>
    );
  }
  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
})();
