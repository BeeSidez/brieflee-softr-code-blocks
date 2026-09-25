/* Document editor: title, subtitle, and section/module blocks.
   Blocks are uncontrolled contentEditable so React never wipes typing. */
(function () {
  const { useRef, useEffect, useState } = React;
  const Icon = window.Icon;

  const C = {
    navy: "var(--bl-fg)", body: "var(--bl-fg-body)", muted: "var(--bl-fg-muted)",
    quiet: "var(--bl-fg-quiet)", border: "var(--bl-border)", peri: "#879cf7",
    blue: "#294ff6", light2: "var(--bl-light-2)", page: "var(--bl-page)",
  };

  // ---- starter content for a freshly added block ---------------------------
  const STARTERS = {
    "Brand": `<p>Exhale is coffee that works with your body, not against it. Low-acid, mushroom-blended, and roasted for a calm, all-day lift, no jitters, no 3pm crash. We started it because we love coffee and hated what it did to us.</p><p>This isn't a product to flog. It's a category fix for anyone who quietly gave up their morning cup. Back that, and the audience feels it.</p>`,
    "The Offer": `<p>Here's the deal for this collaboration:</p><ul><li><b>$450 flat fee</b> per approved video</li><li><b>15% commission</b> on every sale from your code, paid monthly</li><li>Full product bundle sent to you (worth $120)</li></ul>`,
    "Audience / Customer": `<p>Busy 28\u201340s who love coffee but blame it for their anxiety and afternoon crash. They've tried cutting back and hated it. Talk to them like a friend who found a workaround, not a brand selling a cure.</p>`,
    "Product / Feature": `<p><b>Exhale Healthy Coffee</b> \u2014 a ground blend of arabica + functional mushrooms (lion's mane, chaga).</p><ul><li>60% less acidic than standard coffee</li><li>No jitters, no crash \u2014 sustained energy</li><li>Same taste and ritual as your normal cup</li></ul>`,
    "Creator Benefits": `<p>This product sells, the category is hot and the commission compounds. Beyond the money: it fits a wellness-led feed, it's an easy on-camera ritual, and repeat buyers mean recurring commission.</p>`,
    "Deliverables": `<ul><li>1\u00d7 60\u201390s hero video (9:16)</li><li>2\u00d7 15\u201320s cutdowns for paid</li><li>Raw files delivered via Brieflee link</li><li>Due <b>30 April 2026</b></li></ul>`,
    "Hook": `<p>Test one of these openers, first 3 seconds:</p><ol><li><b>Caption:</b> \u201cI quit coffee for 6 months. Then I found this.\u201d</li><li><b>Visual:</b> pouring, then holding your steady hand to camera</li><li><b>Spoken:</b> \u201cRegain control of your health with this one change.\u201d</li></ol>`,
    "Talking Points": `<ul><li>The 3pm crash and why it happens</li><li>Low-acid = easy on the stomach</li><li>You didn't change your routine, just the cup</li></ul>`,
    "Script": `<blockquote>Open on your kitchen. \u201cI didn't think coffee was the problem, until I switched.\u201d Cut to the pour. Hold the mug. \u201cSame ritual, none of the crash.\u201d End on the pack, code on screen.</blockquote>`,
    "Examples": `<p>References to hit the bar and riff on:</p><ul><li>Top-performing testimonial ad (in your library)</li><li>A calm, morning-routine POV you reviewed last month</li></ul>`,
    "Props": `<ul><li>Exhale pack + your usual mug</li><li>Your real morning setup (kettle, kitchen)</li><li>Optional: the old coffee brand you're switching from</li></ul>`,
    "Production Notes": `<ul><li>Shoot vertical 9:16, phone is fine</li><li>Natural morning light, steady framing</li><li>Clean audio \u2014 no wind, no background music over voice</li><li>2\u20133 takes of the hook</li></ul>`,
    "Guidelines": `<p><b>Make sure you:</b></p><ul><li>Say the hook in the first 3 seconds</li><li>Show the pack clearly at least once</li><li>Keep it under 90 seconds</li></ul><p><b>Avoid:</b> medical claims, competitor names, on-screen text covering the product.</p>`,
    "Usage Rights": `<p>Creator-led: the video lives on your channel. Exhale gets rights to amplify it as paid ads on Meta and TikTok for <b>6 months</b>.</p>`,
    "Submissions": `<p>Submit the finished cut through your Brieflee link \u2014 it's checked automatically before it reaches us. No compressed files over chat.</p>`,
    "Contact / Community": `<p>Questions? Reply here or email <b>creators@exhale.co</b>. Join the creator group on Discord for drops, briefs and payouts.</p>`,
    "Creator Info": `<p>Maddie Chen \u00b7 @maddiedrinks \u00b7 Instagram + TikTok</p>`,
    "Extra": `<p>Anything else you need for this one goes here.</p>`,
  };

  // module blocks arrive pre-filled from the workspace
  const MODULE_BODY = {
    "Brand": `<p>Exhale is coffee that works with your body, not against it. Low-acid, mushroom-blended, calm all-day energy.</p>`,
    "Product Info": `<p><b>Exhale Healthy Coffee</b> \u00b7 arabica + lion's mane & chaga \u00b7 60% less acidic \u00b7 $32 / bag.</p>`,
    "Feature Info": `<ul><li>Low acid (60% less)</li><li>Functional mushrooms</li><li>No jitters, no crash</li></ul>`,
    "Content Style": `<p>Warm, honest, first-person. Calm energy over hype. Never clinical.</p>`,
    "Target Audience": `<p>28\u201340, coffee-lovers with afternoon crashes and coffee-anxiety. Wellness-curious, not wellness-obsessed.</p>`,
    "Format": `<p>Vertical 9:16, UGC-native, 60\u201390s hero + 15s cutdowns.</p>`,
    "Concepts": `<p><b>\u201cThe switch\u201d</b> \u2014 same ritual, none of the crash. Morning POV, real kitchen.</p>`,
    "Community": `<p>Discord creator group \u00b7 Ambassador page \u00b7 Affiliate sign-up.</p>`,
    "Contact": `<p>exhale.co \u00b7 creators@exhale.co \u00b7 @exhalecoffee</p>`,
    "Content Reference": `<p>Pulled from your library: 2 top testimonial ads, 1 morning-routine POV.</p>`,
    "Asset Links": `<ul><li>Brand kit (Drive)</li><li>Product shots (Dropbox)</li><li>Logo pack</li></ul>`,
    "Media": `<p>3 product images and 1 b-roll clip attached.</p>`,
    "Music": `<p>Licensed calm lo-fi bed. Keep under the voiceover.</p>`,
    "Output Sizes": `<ul><li>9:16 \u2014 1080\u00d71920 (hero)</li><li>1:1 \u2014 1080\u00d71080 (feed)</li></ul>`,
    "Variant Info": `<p>Variants: Original roast, Decaf, Vanilla.</p>`,
    "Thresholds": `<ul><li>Hook in first 3s</li><li>Product visible \u2265 3s</li><li>Audio clarity \u2265 80</li></ul>`,
    "Review Agents": `<p>Hook timing \u00b7 Brand mention \u00b7 QA checklist (26 items).</p>`,
  };

  window.starterFor = (kind, name) =>
    (kind === "module" ? (MODULE_BODY[name] || `<p>Pulled from your workspace.</p>`) : (STARTERS[name] || `<p></p>`));

  // ---- editable block body -------------------------------------------------
  function Editable({ html, rev, onEdit, placeholder, muted }) {
    const ref = useRef(null);
    useEffect(() => { if (ref.current && ref.current.innerHTML !== html) ref.current.innerHTML = html; }, [rev, muted]);
    return (
      <div ref={ref} className={"bb" + (muted ? " bb-ph" : "")} contentEditable suppressContentEditableWarning
        onInput={onEdit} data-ph={placeholder}
        style={{ outline: "none", fontSize: 15.5, lineHeight: 1.65, color: muted ? "var(--bl-fg-quiet)" : C.body, fontStyle: muted ? "italic" : "normal" }} />
    );
  }

  const isEmptyBody = (b) => !((b.body || "").replace(/<[^>]*>/g, "").trim());

  const FMT_LABEL = { text: "Paragraph", bulletList: "Bullet list", numberedList: "Numbered list", table: "Table", "3col": "3 columns", singleList: "Single-column list", embed: "Embed" };

  function SectionBar({ mode, writing, format, onMode, onWrite }) {
    const seg = (m) => ({ padding: "5px 10px", borderRadius: 7, border: "none", cursor: "pointer", fontFamily: "inherit",
      fontSize: 12, fontWeight: 600, background: mode === m ? "#fff" : "transparent", color: mode === m ? C.navy : C.muted,
      boxShadow: mode === m ? "var(--bl-shadow-xs)" : "none", display: "flex", alignItems: "center", gap: 5 });
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ display: "flex", background: "var(--bl-light-2)", borderRadius: 9, padding: 3, gap: 2 }}>
          <button onClick={() => onMode("placeholder")} style={seg("placeholder")}>Placeholder</button>
          <button onClick={() => onMode("worked")} style={seg("worked")}>Luna Roca</button>
          <button onClick={onWrite} style={{ ...seg("ai"), background: mode === "ai" ? "#879cf7" : "transparent", color: mode === "ai" ? "#fff" : C.blue }}>
            <Icon name="wand" size={12} /> Write with AI</button>
        </div>
        {writing && <span style={{ fontSize: 12, color: C.muted, display: "flex", alignItems: "center", gap: 6 }}>
          <span className="bl-spin" style={{ width: 11, height: 11, border: "2px solid var(--bl-border)", borderTopColor: C.blue, borderRadius: 999, display: "inline-block" }} /> Writing…</span>}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: C.quiet, display: "flex", alignItems: "center", gap: 5 }} title="Preferred text format for this section">
          <Icon name="type" size={12} /> {FMT_LABEL[format] || "Paragraph"}</span>
      </div>
    );
  }

  // ---- Visual Format picker (the ad-format library) ------------------------
  function VisualFormatBlock({ selected, onSelect, onEdit }) {
    const [q, setQ] = useState("");
    const list = window.VISUAL_FORMATS.filter(f =>
      f.name.toLowerCase().includes(q.toLowerCase()) || f.funnel.toLowerCase().includes(q.toLowerCase()));
    return (
      <div>
        {selected && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#f2f5ff",
            border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 20 }}>{selected.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: C.navy, fontSize: 14 }}>{selected.name}</div>
              <div style={{ fontSize: 12.5, color: C.muted }}>{selected.desc}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.blue, background: "#fff", border: `1px solid ${C.border}`,
              padding: "3px 8px", borderRadius: 999, whiteSpace: "nowrap" }}>{selected.funnel}</span>
          </div>
        )}
        <div style={{ position: "relative", marginBottom: 10 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.peri }}>
            <Icon name="search" size={14} /></span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search 42 visual formats..."
            style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px 8px 32px", borderRadius: 8,
              border: `1.5px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: C.page, outline: "none" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))", gap: 8, maxHeight: 260, overflowY: "auto", paddingRight: 2 }}>
          {list.map(f => {
            const on = selected && selected.name === f.name;
            return (
              <button key={f.name} onClick={() => { onSelect(f); onEdit(); }} title={f.desc}
                style={{ textAlign: "left", cursor: "pointer", padding: "10px 11px", borderRadius: 10,
                  border: on ? `1.5px solid ${C.peri}` : `1px solid ${C.border}`,
                  background: on ? "#f2f5ff" : "#fff", boxShadow: on ? "0 0 0 3px rgba(135,156,247,.18)" : "none",
                  transition: "all .15s" }}>
                <div style={{ fontSize: 18, marginBottom: 3 }}>{f.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.navy }}>{f.name}</div>
                <div style={{ fontSize: 11, color: C.quiet, marginTop: 2 }}>{f.funnel}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ---- Channel picker ------------------------------------------------------
  function ChannelBlock({ channels, onToggle }) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 10 }}>
        {window.CHANNELS.map(ch => {
          const on = channels.includes(ch.name);
          return (
            <button key={ch.name} onClick={() => onToggle(ch.name)}
              style={{ cursor: "pointer", padding: "16px 12px", borderRadius: 12, background: "#fff",
                border: on ? `1.5px solid ${C.peri}` : `1px solid ${C.border}`,
                boxShadow: on ? "0 0 0 3px rgba(135,156,247,.18)" : "none", textAlign: "center", transition: "all .15s" }}>
              {ch.img
                ? <img src={ch.img} alt="" style={{ width: 34, height: 34, objectFit: "contain", margin: "0 auto 8px", display: "block" }} />
                : <div style={{ width: 30, height: 30, borderRadius: 8, background: ch.color, margin: "0 auto 8px",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15 }}>
                    {ch.name[0]}</div>}
              <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{ch.name}</div>
            </button>
          );
        })}
      </div>
    );
  }

  // ---- a single block ------------------------------------------------------
  function Block({ block, first, last, focusSet, onEdit, onRemove, onMove, onSelectFormat, onToggleChannel, onOpenFormats, onAiWrite, onSetMode }) {
    const [hover, setHover] = useState(false);
    return (
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        data-screen-label={"Block: " + block.name}
        style={{ position: "relative", padding: "16px 0 22px", borderTop: `1px solid ${C.border}` }}>
        {/* left gutter controls */}
        <div style={{ position: "absolute", left: -40, top: 16, display: "flex", flexDirection: "column", gap: 2,
          opacity: hover ? 1 : 0, transition: "opacity .15s" }}>
          <button title="Move up" disabled={first} onClick={() => onMove(block.id, -1)}
            style={gBtn(first)}><Icon name="chevron-down" size={13} style={{ transform: "rotate(180deg)" }} /></button>
          <span style={{ color: C.quiet, display: "grid", placeItems: "center", height: 16, cursor: "grab" }}><Icon name="grip" size={14} /></span>
          <button title="Move down" disabled={last} onClick={() => onMove(block.id, 1)}
            style={gBtn(last)}><Icon name="chevron-down" size={13} /></button>
        </div>

        {/* header row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ width: 24, height: 24, borderRadius: 7, background: block.kind === "module" ? "#eef1ff" : "#fff",
            border: `1px solid ${C.border}`, display: "none", placeItems: "center", color: C.blue }}>
            <Icon name={block.icon} size={14} /></span>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em", color: C.navy }}>{block.name}</span>
          {block.kind === "module" && (
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".04em", color: C.blue, background: "#eef1ff",
              padding: "2px 7px", borderRadius: 999 }}>FROM WORKSPACE</span>
          )}
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: 2, opacity: hover ? 1 : 0, transition: "opacity .15s" }}>
            {!block.special && (
              <button title="Format" onClick={e => onOpenFormats(block.id, e.currentTarget)} style={tBtn}>
                <Icon name="type" size={14} /></button>
            )}
            <button title="Delete" onClick={() => onRemove(block.id)} style={tBtn}><Icon name="trash" size={14} /></button>
          </div>
        </div>

        {/* body */}
        {block.special === "visual"
          ? <VisualFormatBlock selected={block.selectedFormat} onSelect={f => onSelectFormat(block.id, f)} onEdit={onEdit} />
          : block.special === "channel"
          ? <ChannelBlock channels={block.channels} onToggle={n => onToggleChannel(block.id, n)} />
          : <>
              {block.kind === "section" &&
                <SectionBar mode={block.mode || "placeholder"} writing={block.writing} format={block.format}
                  onMode={(m) => onSetMode(block.id, m)} onWrite={() => onAiWrite(block.id)} />}
              <Editable html={block.body} rev={block.rev || 0} muted={block.mode === "placeholder"} onEdit={onEdit} placeholder={"Write " + block.name + "..."} />
            </>}
      </div>
    );
  }
  const gBtn = (dis) => ({ width: 18, height: 18, borderRadius: 5, border: "none", background: "transparent",
    color: dis ? "#d6dbec" : "var(--bl-fg-quiet)", cursor: dis ? "default" : "pointer", display: "grid", placeItems: "center", padding: 0 });
  const tBtn = { width: 26, height: 26, borderRadius: 7, border: "none", background: "transparent",
    color: "var(--bl-fg-muted)", cursor: "pointer", display: "grid", placeItems: "center" };

  window.DocEditor = function DocEditor({ blocks, emptyStart, focusSet, onEdit, onRemove, onMove, onSelectFormat, onToggleChannel, onOpenFormats, onAddClick, onAiWrite, onSetMode, dense }) {
    const titleRef = useRef(null), subRef = useRef(null);
    useEffect(() => {
      if (titleRef.current) titleRef.current.innerText = emptyStart ? "" : "Creator brief \u2014 Luna Roca";
      if (subRef.current) subRef.current.innerText = emptyStart ? "" : "Hey Maddie, sending you the below to review before we lock the shoot.";
    }, []);
    return (
      <div style={{ maxWidth: 760, margin: "0 auto", padding: dense ? "28px 56px 120px" : "44px 56px 140px" }}>
        <div ref={titleRef} data-role="title" contentEditable suppressContentEditableWarning onInput={onEdit}
          style={{ outline: "none", fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--bl-fg)", lineHeight: 1.15 }} />
        <div ref={subRef} className="bb" data-ph="Add a short intro..." contentEditable suppressContentEditableWarning onInput={onEdit}
          style={{ outline: "none", fontSize: 16, color: "var(--bl-fg-muted)", marginTop: 10, marginBottom: 8, lineHeight: 1.5 }} />
        {blocks.map((b, i) => (
          <Block key={b.id} block={b} first={i === 0} last={i === blocks.length - 1} focusSet={focusSet}
            onEdit={onEdit} onRemove={onRemove} onMove={onMove} onSelectFormat={onSelectFormat}
            onToggleChannel={onToggleChannel} onOpenFormats={onOpenFormats} onAiWrite={onAiWrite} onSetMode={onSetMode} />
        ))}
        <button onClick={e => onAddClick(e.currentTarget)}
          style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 8, background: "transparent",
            border: `1.5px dashed ${C.border}`, color: C.muted, padding: "11px 14px", borderRadius: 10,
            fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", width: "100%", justifyContent: "center" }}>
          <Icon name="plus" size={15} /> Add block
        </button>
      </div>
    );
  };
})();
