/* @ds-bundle: {"format":3,"namespace":"BriefleeDesignSystem_019de4","components":[],"sourceHashes":{"Brieflee Homepage/design-canvas.jsx":"5d0e39003628","Brieflee Homepage/heroes.jsx":"1e0b317f17ae","Brieflee Homepage/tweaks-panel.jsx":"a1107c630a56","Brieflee Signup Image/design-canvas.jsx":"5d0e39003628","Brieflee Signup Image/variants.jsx":"8d8b95568ae7","Welcome Emails/design-canvas.jsx":"5d0e39003628","Welcome Emails/emails.jsx":"2f92fa12f9cd","app.jsx":"0c543a4d96a3","icons.jsx":"3969057511c2","onboarding/src/App.jsx":"75f54a3b7164","onboarding/src/CheckoutStep.jsx":"483eacc6a770","onboarding/src/PersonalizeStep.jsx":"bf6ea808f12c","onboarding/src/PricingStep.jsx":"24f8751f95d8","onboarding/src/Stepper.jsx":"af519c35a8db","onboarding/src/TeamStep.jsx":"fb6d0e964923","onboarding/src/data.jsx":"baf99e80c95a","onboarding/src/icons.jsx":"38fb65fe7a61","onboarding/src/tweaks-panel.jsx":"ea982af775f0","sections.jsx":"ba23a64b1765","src/PersonalizeStep.jsx":"36b932575cdd","src/PricingStep.jsx":"53fe5ae881a0","tweaks-panel.jsx":"a1107c630a56","ui_kits/app/BriefCard.jsx":"4d1470f99bcd","ui_kits/app/Dropzone.jsx":"2da724260622","ui_kits/app/ReviewTable.jsx":"e788b2c7638d","ui_kits/app/ScoreCell.jsx":"b24e219c60a5","ui_kits/app/Sidebar.jsx":"cf2db5a6915d","ui_kits/app/TopBar.jsx":"4e6fca9b5cc0","ui_kits/marketing/CTA.jsx":"41db98735d96","ui_kits/marketing/FeatureGrid.jsx":"655d92073a04","ui_kits/marketing/FeatureRow.jsx":"0930ee3ff171","ui_kits/marketing/Footer.jsx":"8dfaffdfa0d8","ui_kits/marketing/Hero.jsx":"b6ea6291722a","ui_kits/marketing/LogoStrip.jsx":"b09800887957","ui_kits/marketing/Nav.jsx":"b99ad257ac68","ui_kits/marketing/Stats.jsx":"51499db14832"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.BriefleeDesignSystem_019de4 = window.BriefleeDesignSystem_019de4 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// Brieflee Homepage/design-canvas.jsx
try { (() => {
// DesignCanvas.jsx — Figma-ish design canvas wrapper
// Warm gray grid bg + Sections + Artboards + PostIt notes.
// Artboards are reorderable (grip-drag), labels/titles are inline-editable,
// and any artboard can be opened in a fullscreen focus overlay (←/→/Esc).
// State persists to a .design-canvas.state.json sidecar via the host
// bridge. No assets, no deps.
//
// Usage:
//   <DesignCanvas>
//     <DCSection id="onboarding" title="Onboarding" subtitle="First-run variants">
//       <DCArtboard id="a" label="A · Dusk" width={260} height={480}>…</DCArtboard>
//       <DCArtboard id="b" label="B · Minimal" width={260} height={480}>…</DCArtboard>
//     </DCSection>
//   </DesignCanvas>

const DC = {
  bg: '#f0eee9',
  grid: 'rgba(0,0,0,0.06)',
  label: 'rgba(60,50,40,0.7)',
  title: 'rgba(40,30,20,0.85)',
  subtitle: 'rgba(60,50,40,0.6)',
  postitBg: '#fef4a8',
  postitText: '#5a4a2a',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
};

// One-time CSS injection (classes are dc-prefixed so they don't collide with
// the hosted design's own styles).
if (typeof document !== 'undefined' && !document.getElementById('dc-styles')) {
  const s = document.createElement('style');
  s.id = 'dc-styles';
  s.textContent = ['.dc-editable{cursor:text;outline:none;white-space:nowrap;border-radius:3px;padding:0 2px;margin:0 -2px}', '.dc-editable:focus{background:#fff;box-shadow:0 0 0 1.5px #c96442}', '[data-dc-slot]{transition:transform .18s cubic-bezier(.2,.7,.3,1)}', '[data-dc-slot].dc-dragging{transition:none;z-index:10;pointer-events:none}', '[data-dc-slot].dc-dragging .dc-card{box-shadow:0 12px 40px rgba(0,0,0,.25),0 0 0 2px #c96442;transform:scale(1.02)}', '.dc-card{transition:box-shadow .15s,transform .15s}', '.dc-card *{scrollbar-width:none}', '.dc-card *::-webkit-scrollbar{display:none}', '.dc-labelrow{display:flex;align-items:center;gap:4px;height:24px}', '.dc-grip{cursor:grab;display:flex;align-items:center;padding:5px 4px;border-radius:4px;transition:background .12s}', '.dc-grip:hover{background:rgba(0,0,0,.08)}', '.dc-grip:active{cursor:grabbing}', '.dc-labeltext{cursor:pointer;border-radius:4px;padding:3px 6px;display:flex;align-items:center;transition:background .12s}', '.dc-labeltext:hover{background:rgba(0,0,0,.05)}', '.dc-expand{position:absolute;bottom:100%;right:0;margin-bottom:5px;z-index:2;opacity:0;transition:opacity .12s,background .12s;', '  width:22px;height:22px;border-radius:5px;border:none;cursor:pointer;padding:0;', '  background:transparent;color:rgba(60,50,40,.7);display:flex;align-items:center;justify-content:center}', '.dc-expand:hover{background:rgba(0,0,0,.06);color:#2a251f}', '[data-dc-slot]:hover .dc-expand{opacity:1}'].join('\n');
  document.head.appendChild(s);
}
const DCCtx = React.createContext(null);

// ─────────────────────────────────────────────────────────────
// DesignCanvas — stateful wrapper around the pan/zoom viewport.
// Owns runtime state (per-section order, renamed titles/labels, focused
// artboard). Order/titles/labels persist to a .design-canvas.state.json
// sidecar next to the HTML. Reads go via plain fetch() so the saved
// arrangement is visible anywhere the HTML + sidecar are served together
// (omelette preview, direct link, downloaded zip). Writes go through the
// host's window.omelette bridge — editing requires the omelette runtime.
// Focus is ephemeral.
// ─────────────────────────────────────────────────────────────
const DC_STATE_FILE = '.design-canvas.state.json';
function DesignCanvas({
  children,
  minScale,
  maxScale,
  style
}) {
  const [state, setState] = React.useState({
    sections: {},
    focus: null
  });
  // Hold rendering until the sidecar read settles so the saved order/titles
  // appear on first paint (no source-order flash). didRead gates writes until
  // the read settles so the empty initial state can't clobber a slow read;
  // skipNextWrite suppresses the one echo-write that would otherwise follow
  // hydration.
  const [ready, setReady] = React.useState(false);
  const didRead = React.useRef(false);
  const skipNextWrite = React.useRef(false);
  React.useEffect(() => {
    let off = false;
    fetch('./' + DC_STATE_FILE).then(r => r.ok ? r.json() : null).then(saved => {
      if (off || !saved || !saved.sections) return;
      skipNextWrite.current = true;
      setState(s => ({
        ...s,
        sections: saved.sections
      }));
    }).catch(() => {}).finally(() => {
      didRead.current = true;
      if (!off) setReady(true);
    });
    const t = setTimeout(() => {
      if (!off) setReady(true);
    }, 150);
    return () => {
      off = true;
      clearTimeout(t);
    };
  }, []);
  React.useEffect(() => {
    if (!didRead.current) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    const t = setTimeout(() => {
      window.omelette?.writeFile(DC_STATE_FILE, JSON.stringify({
        sections: state.sections
      })).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [state.sections]);

  // Build registries synchronously from children so FocusOverlay can read
  // them in the same render. Only direct DCSection > DCArtboard children are
  // walked — wrapping them in other elements opts out of focus/reorder.
  const registry = {}; // slotId -> { sectionId, artboard }
  const sectionMeta = {}; // sectionId -> { title, subtitle, slotIds[] }
  const sectionOrder = [];
  React.Children.forEach(children, sec => {
    if (!sec || sec.type !== DCSection) return;
    const sid = sec.props.id ?? sec.props.title;
    if (!sid) return;
    sectionOrder.push(sid);
    const persisted = state.sections[sid] || {};
    const srcIds = [];
    React.Children.forEach(sec.props.children, ab => {
      if (!ab || ab.type !== DCArtboard) return;
      const aid = ab.props.id ?? ab.props.label;
      if (!aid) return;
      registry[`${sid}/${aid}`] = {
        sectionId: sid,
        artboard: ab
      };
      srcIds.push(aid);
    });
    const kept = (persisted.order || []).filter(k => srcIds.includes(k));
    sectionMeta[sid] = {
      title: persisted.title ?? sec.props.title,
      subtitle: sec.props.subtitle,
      slotIds: [...kept, ...srcIds.filter(k => !kept.includes(k))]
    };
  });
  const api = React.useMemo(() => ({
    state,
    section: id => state.sections[id] || {},
    patchSection: (id, p) => setState(s => ({
      ...s,
      sections: {
        ...s.sections,
        [id]: {
          ...s.sections[id],
          ...(typeof p === 'function' ? p(s.sections[id] || {}) : p)
        }
      }
    })),
    setFocus: slotId => setState(s => ({
      ...s,
      focus: slotId
    }))
  }), [state]);

  // Esc exits focus; any outside pointerdown commits an in-progress rename.
  React.useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') api.setFocus(null);
    };
    const onPd = e => {
      const ae = document.activeElement;
      if (ae && ae.isContentEditable && !ae.contains(e.target)) ae.blur();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPd, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPd, true);
    };
  }, [api]);
  return /*#__PURE__*/React.createElement(DCCtx.Provider, {
    value: api
  }, /*#__PURE__*/React.createElement(DCViewport, {
    minScale: minScale,
    maxScale: maxScale,
    style: style
  }, ready && children), state.focus && registry[state.focus] && /*#__PURE__*/React.createElement(DCFocusOverlay, {
    entry: registry[state.focus],
    sectionMeta: sectionMeta,
    sectionOrder: sectionOrder
  }));
}

// ─────────────────────────────────────────────────────────────
// DCViewport — transform-based pan/zoom (internal)
//
// Input mapping (Figma-style):
//   • trackpad pinch  → zoom   (ctrlKey wheel; Safari gesture* events)
//   • trackpad scroll → pan    (two-finger)
//   • mouse wheel     → zoom   (notched; distinguished from trackpad scroll)
//   • middle-drag / primary-drag-on-bg → pan
//
// Transform state lives in a ref and is written straight to the DOM
// (translate3d + will-change) so wheel ticks don't go through React —
// keeps pans at 60fps on dense canvases.
// ─────────────────────────────────────────────────────────────
function DCViewport({
  children,
  minScale = 0.1,
  maxScale = 8,
  style = {}
}) {
  const vpRef = React.useRef(null);
  const worldRef = React.useRef(null);
  const tf = React.useRef({
    x: 0,
    y: 0,
    scale: 1
  });
  const apply = React.useCallback(() => {
    const {
      x,
      y,
      scale
    } = tf.current;
    const el = worldRef.current;
    if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }, []);
  React.useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const zoomAt = (cx, cy, factor) => {
      const r = vp.getBoundingClientRect();
      const px = cx - r.left,
        py = cy - r.top;
      const t = tf.current;
      const next = Math.min(maxScale, Math.max(minScale, t.scale * factor));
      const k = next / t.scale;
      // keep the world point under the cursor fixed
      t.x = px - (px - t.x) * k;
      t.y = py - (py - t.y) * k;
      t.scale = next;
      apply();
    };

    // Mouse-wheel vs trackpad-scroll heuristic. A physical wheel sends
    // line-mode deltas (Firefox) or large integer pixel deltas with no X
    // component (Chrome/Safari, typically multiples of 100/120). Trackpad
    // two-finger scroll sends small/fractional pixel deltas, often with
    // non-zero deltaX. ctrlKey is set by the browser for trackpad pinch.
    const isMouseWheel = e => e.deltaMode !== 0 || e.deltaX === 0 && Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 40;
    const onWheel = e => {
      e.preventDefault();
      if (isGesturing) return; // Safari: gesture* owns the pinch — discard concurrent wheels
      if (e.ctrlKey) {
        // trackpad pinch (or explicit ctrl+wheel)
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else if (isMouseWheel(e)) {
        // notched mouse wheel — fixed-ratio step per click
        zoomAt(e.clientX, e.clientY, Math.exp(-Math.sign(e.deltaY) * 0.18));
      } else {
        // trackpad two-finger scroll — pan
        tf.current.x -= e.deltaX;
        tf.current.y -= e.deltaY;
        apply();
      }
    };

    // Safari sends native gesture* events for trackpad pinch with a smooth
    // e.scale; preferring these over the ctrl+wheel fallback gives a much
    // better feel there. No-ops on other browsers. Safari also fires
    // ctrlKey wheel events during the same pinch — isGesturing makes
    // onWheel drop those entirely so they neither zoom nor pan.
    let gsBase = 1;
    let isGesturing = false;
    const onGestureStart = e => {
      e.preventDefault();
      isGesturing = true;
      gsBase = tf.current.scale;
    };
    const onGestureChange = e => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, gsBase * e.scale / tf.current.scale);
    };
    const onGestureEnd = e => {
      e.preventDefault();
      isGesturing = false;
    };

    // Drag-pan: middle button anywhere, or primary button on canvas
    // background (anything that isn't an artboard or an inline editor).
    let drag = null;
    const onPointerDown = e => {
      const onBg = !e.target.closest('[data-dc-slot], .dc-editable');
      if (!(e.button === 1 || e.button === 0 && onBg)) return;
      e.preventDefault();
      vp.setPointerCapture(e.pointerId);
      drag = {
        id: e.pointerId,
        lx: e.clientX,
        ly: e.clientY
      };
      vp.style.cursor = 'grabbing';
    };
    const onPointerMove = e => {
      if (!drag || e.pointerId !== drag.id) return;
      tf.current.x += e.clientX - drag.lx;
      tf.current.y += e.clientY - drag.ly;
      drag.lx = e.clientX;
      drag.ly = e.clientY;
      apply();
    };
    const onPointerUp = e => {
      if (!drag || e.pointerId !== drag.id) return;
      vp.releasePointerCapture(e.pointerId);
      drag = null;
      vp.style.cursor = '';
    };
    vp.addEventListener('wheel', onWheel, {
      passive: false
    });
    vp.addEventListener('gesturestart', onGestureStart, {
      passive: false
    });
    vp.addEventListener('gesturechange', onGestureChange, {
      passive: false
    });
    vp.addEventListener('gestureend', onGestureEnd, {
      passive: false
    });
    vp.addEventListener('pointerdown', onPointerDown);
    vp.addEventListener('pointermove', onPointerMove);
    vp.addEventListener('pointerup', onPointerUp);
    vp.addEventListener('pointercancel', onPointerUp);
    return () => {
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('gesturestart', onGestureStart);
      vp.removeEventListener('gesturechange', onGestureChange);
      vp.removeEventListener('gestureend', onGestureEnd);
      vp.removeEventListener('pointerdown', onPointerDown);
      vp.removeEventListener('pointermove', onPointerMove);
      vp.removeEventListener('pointerup', onPointerUp);
      vp.removeEventListener('pointercancel', onPointerUp);
    };
  }, [apply, minScale, maxScale]);
  const gridSvg = `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M120 0H0v120' fill='none' stroke='${encodeURIComponent(DC.grid)}' stroke-width='1'/%3E%3C/svg%3E")`;
  return /*#__PURE__*/React.createElement("div", {
    ref: vpRef,
    className: "design-canvas",
    style: {
      height: '100vh',
      width: '100vw',
      background: DC.bg,
      overflow: 'hidden',
      overscrollBehavior: 'none',
      touchAction: 'none',
      position: 'relative',
      fontFamily: DC.font,
      boxSizing: 'border-box',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: worldRef,
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      transformOrigin: '0 0',
      willChange: 'transform',
      width: 'max-content',
      minWidth: '100%',
      minHeight: '100%',
      padding: '60px 0 80px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: -6000,
      backgroundImage: gridSvg,
      backgroundSize: '120px 120px',
      pointerEvents: 'none',
      zIndex: -1
    }
  }), children));
}

// ─────────────────────────────────────────────────────────────
// DCSection — editable title + h-row of artboards in persisted order
// ─────────────────────────────────────────────────────────────
function DCSection({
  id,
  title,
  subtitle,
  children,
  gap = 48
}) {
  const ctx = React.useContext(DCCtx);
  const sid = id ?? title;
  const all = React.Children.toArray(children);
  const artboards = all.filter(c => c && c.type === DCArtboard);
  const rest = all.filter(c => !(c && c.type === DCArtboard));
  const srcOrder = artboards.map(a => a.props.id ?? a.props.label);
  const sec = ctx && sid && ctx.section(sid) || {};
  const order = React.useMemo(() => {
    const kept = (sec.order || []).filter(k => srcOrder.includes(k));
    return [...kept, ...srcOrder.filter(k => !kept.includes(k))];
  }, [sec.order, srcOrder.join('|')]);
  const byId = Object.fromEntries(artboards.map(a => [a.props.id ?? a.props.label, a]));
  return /*#__PURE__*/React.createElement("div", {
    "data-dc-section": sid,
    style: {
      marginBottom: 80,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 60px 56px'
    }
  }, /*#__PURE__*/React.createElement(DCEditable, {
    tag: "div",
    value: sec.title ?? title,
    onChange: v => ctx && sid && ctx.patchSection(sid, {
      title: v
    }),
    style: {
      fontSize: 28,
      fontWeight: 600,
      color: DC.title,
      letterSpacing: -0.4,
      marginBottom: 6,
      display: 'inline-block'
    }
  }), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      color: DC.subtitle
    }
  }, subtitle)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap,
      padding: '0 60px',
      alignItems: 'flex-start',
      width: 'max-content'
    }
  }, order.map(k => /*#__PURE__*/React.createElement(DCArtboardFrame, {
    key: k,
    sectionId: sid,
    artboard: byId[k],
    order: order,
    label: (sec.labels || {})[k] ?? byId[k].props.label,
    onRename: v => ctx && ctx.patchSection(sid, x => ({
      labels: {
        ...x.labels,
        [k]: v
      }
    })),
    onReorder: next => ctx && ctx.patchSection(sid, {
      order: next
    }),
    onFocus: () => ctx && ctx.setFocus(`${sid}/${k}`)
  }))), rest);
}

// DCArtboard — marker; rendered by DCArtboardFrame via DCSection.
function DCArtboard() {
  return null;
}
function DCArtboardFrame({
  sectionId,
  artboard,
  label,
  order,
  onRename,
  onReorder,
  onFocus
}) {
  const {
    id: rawId,
    label: rawLabel,
    width = 260,
    height = 480,
    children,
    style = {}
  } = artboard.props;
  const id = rawId ?? rawLabel;
  const ref = React.useRef(null);

  // Live drag-reorder: dragged card sticks to cursor; siblings slide into
  // their would-be slots in real time via transforms. DOM order only
  // changes on drop.
  const onGripDown = e => {
    e.preventDefault();
    e.stopPropagation();
    const me = ref.current;
    // translateX is applied in local (pre-scale) space but pointer deltas and
    // getBoundingClientRect().left are screen-space — divide by the viewport's
    // current scale so the dragged card tracks the cursor at any zoom level.
    const scale = me.getBoundingClientRect().width / me.offsetWidth || 1;
    const peers = Array.from(document.querySelectorAll(`[data-dc-section="${sectionId}"] [data-dc-slot]`));
    const homes = peers.map(el => ({
      el,
      id: el.dataset.dcSlot,
      x: el.getBoundingClientRect().left
    }));
    const slotXs = homes.map(h => h.x);
    const startIdx = order.indexOf(id);
    const startX = e.clientX;
    let liveOrder = order.slice();
    me.classList.add('dc-dragging');
    const layout = () => {
      for (const h of homes) {
        if (h.id === id) continue;
        const slot = liveOrder.indexOf(h.id);
        h.el.style.transform = `translateX(${(slotXs[slot] - h.x) / scale}px)`;
      }
    };
    const move = ev => {
      const dx = ev.clientX - startX;
      me.style.transform = `translateX(${dx / scale}px)`;
      const cur = homes[startIdx].x + dx;
      let nearest = 0,
        best = Infinity;
      for (let i = 0; i < slotXs.length; i++) {
        const d = Math.abs(slotXs[i] - cur);
        if (d < best) {
          best = d;
          nearest = i;
        }
      }
      if (liveOrder.indexOf(id) !== nearest) {
        liveOrder = order.filter(k => k !== id);
        liveOrder.splice(nearest, 0, id);
        layout();
      }
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      const finalSlot = liveOrder.indexOf(id);
      me.classList.remove('dc-dragging');
      me.style.transform = `translateX(${(slotXs[finalSlot] - homes[startIdx].x) / scale}px)`;
      // After the settle transition, kill transitions + clear transforms +
      // commit the reorder in the same frame so there's no visual snap-back.
      setTimeout(() => {
        for (const h of homes) {
          h.el.style.transition = 'none';
          h.el.style.transform = '';
        }
        if (liveOrder.join('|') !== order.join('|')) onReorder(liveOrder);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          for (const h of homes) h.el.style.transition = '';
        }));
      }, 180);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    "data-dc-slot": id,
    style: {
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-labelrow",
    style: {
      position: 'absolute',
      bottom: '100%',
      left: -4,
      marginBottom: 4,
      color: DC.label
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-grip",
    onPointerDown: onGripDown,
    title: "Drag to reorder"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "13",
    viewBox: "0 0 9 13",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "11",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "11",
    r: "1.1"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-labeltext",
    onClick: onFocus,
    title: "Click to focus"
  }, /*#__PURE__*/React.createElement(DCEditable, {
    value: label,
    onChange: onRename,
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 15,
      fontWeight: 500,
      color: DC.label,
      lineHeight: 1
    }
  }))), /*#__PURE__*/React.createElement("button", {
    className: "dc-expand",
    onClick: onFocus,
    onPointerDown: e => e.stopPropagation(),
    title: "Focus"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 1h4v4M5 11H1V7M11 1L7.5 4.5M1 11l3.5-3.5"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-card",
    style: {
      borderRadius: 2,
      boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)',
      overflow: 'hidden',
      width,
      height,
      background: '#fff',
      ...style
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb',
      fontSize: 13,
      fontFamily: DC.font
    }
  }, id)));
}

// Inline rename — commits on blur or Enter.
function DCEditable({
  value,
  onChange,
  style,
  tag = 'span',
  onClick
}) {
  const T = tag;
  return /*#__PURE__*/React.createElement(T, {
    className: "dc-editable",
    contentEditable: true,
    suppressContentEditableWarning: true,
    onClick: onClick,
    onPointerDown: e => e.stopPropagation(),
    onBlur: e => onChange && onChange(e.currentTarget.textContent),
    onKeyDown: e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.currentTarget.blur();
      }
    },
    style: style
  }, value);
}

// ─────────────────────────────────────────────────────────────
// Focus mode — overlay one artboard; ←/→ within section, ↑/↓ across
// sections, Esc or backdrop click to exit.
// ─────────────────────────────────────────────────────────────
function DCFocusOverlay({
  entry,
  sectionMeta,
  sectionOrder
}) {
  const ctx = React.useContext(DCCtx);
  const {
    sectionId,
    artboard
  } = entry;
  const sec = ctx.section(sectionId);
  const meta = sectionMeta[sectionId];
  const peers = meta.slotIds;
  const aid = artboard.props.id ?? artboard.props.label;
  const idx = peers.indexOf(aid);
  const secIdx = sectionOrder.indexOf(sectionId);
  const go = d => {
    const n = peers[(idx + d + peers.length) % peers.length];
    if (n) ctx.setFocus(`${sectionId}/${n}`);
  };
  const goSection = d => {
    const ns = sectionOrder[(secIdx + d + sectionOrder.length) % sectionOrder.length];
    const first = sectionMeta[ns] && sectionMeta[ns].slotIds[0];
    if (first) ctx.setFocus(`${ns}/${first}`);
  };
  React.useEffect(() => {
    const k = e => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goSection(-1);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        goSection(1);
      }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  });
  const {
    width = 260,
    height = 480,
    children
  } = artboard.props;
  const [vp, setVp] = React.useState({
    w: window.innerWidth,
    h: window.innerHeight
  });
  React.useEffect(() => {
    const r = () => setVp({
      w: window.innerWidth,
      h: window.innerHeight
    });
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);
  const scale = Math.max(0.1, Math.min((vp.w - 200) / width, (vp.h - 260) / height, 2));
  const [ddOpen, setDd] = React.useState(false);
  const Arrow = ({
    dir,
    onClick
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onClick();
    },
    style: {
      position: 'absolute',
      top: '50%',
      [dir]: 28,
      transform: 'translateY(-50%)',
      border: 'none',
      background: 'rgba(255,255,255,.08)',
      color: 'rgba(255,255,255,.9)',
      width: 44,
      height: 44,
      borderRadius: 22,
      fontSize: 18,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background .15s'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.18)',
    onMouseLeave: e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: dir === 'left' ? 'M11 3L5 9l6 6' : 'M7 3l6 6-6 6'
  })));

  // Portal to body so position:fixed is the real viewport regardless of any
  // transform on DesignCanvas's ancestors (including the canvas zoom itself).
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    onClick: () => ctx.setFocus(null),
    onWheel: e => e.preventDefault(),
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(24,20,16,.6)',
      backdropFilter: 'blur(14px)',
      fontFamily: DC.font,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 72,
      display: 'flex',
      alignItems: 'flex-start',
      padding: '16px 20px 0',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setDd(o => !o),
    style: {
      border: 'none',
      background: 'transparent',
      color: '#fff',
      cursor: 'pointer',
      padding: '6px 8px',
      borderRadius: 6,
      textAlign: 'left',
      fontFamily: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: -0.3
    }
  }, meta.title), /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 11 11",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    style: {
      opacity: .7
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 4l3.5 3.5L9 4"
  }))), meta.subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 13,
      opacity: .6,
      fontWeight: 400,
      marginTop: 2
    }
  }, meta.subtitle)), ddOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: 4,
      background: '#2a251f',
      borderRadius: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,.4)',
      padding: 4,
      minWidth: 200,
      zIndex: 10
    }
  }, sectionOrder.map(sid => /*#__PURE__*/React.createElement("button", {
    key: sid,
    onClick: () => {
      setDd(false);
      const f = sectionMeta[sid].slotIds[0];
      if (f) ctx.setFocus(`${sid}/${f}`);
    },
    style: {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      border: 'none',
      cursor: 'pointer',
      background: sid === sectionId ? 'rgba(255,255,255,.1)' : 'transparent',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: 5,
      fontSize: 14,
      fontWeight: sid === sectionId ? 600 : 400,
      fontFamily: 'inherit'
    }
  }, sectionMeta[sid].title)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => ctx.setFocus(null),
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.12)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent',
    style: {
      border: 'none',
      background: 'transparent',
      color: 'rgba(255,255,255,.7)',
      width: 32,
      height: 32,
      borderRadius: 16,
      fontSize: 20,
      cursor: 'pointer',
      lineHeight: 1,
      transition: 'background .12s'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 64,
      bottom: 56,
      left: 100,
      right: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: width * scale,
      height: height * scale,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      background: '#fff',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 20px 80px rgba(0,0,0,.4)'
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb'
    }
  }, aid))), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 14,
      fontWeight: 500,
      opacity: .85,
      textAlign: 'center'
    }
  }, (sec.labels || {})[aid] ?? artboard.props.label, /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .5,
      marginLeft: 10,
      fontVariantNumeric: 'tabular-nums'
    }
  }, idx + 1, " / ", peers.length))), /*#__PURE__*/React.createElement(Arrow, {
    dir: "left",
    onClick: () => go(-1)
  }), /*#__PURE__*/React.createElement(Arrow, {
    dir: "right",
    onClick: () => go(1)
  }), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 8
    }
  }, peers.map((p, i) => /*#__PURE__*/React.createElement("button", {
    key: p,
    onClick: () => ctx.setFocus(`${sectionId}/${p}`),
    style: {
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      width: 6,
      height: 6,
      borderRadius: 3,
      background: i === idx ? '#fff' : 'rgba(255,255,255,.3)'
    }
  })))), document.body);
}

// ─────────────────────────────────────────────────────────────
// Post-it — absolute-positioned sticky note
// ─────────────────────────────────────────────────────────────
function DCPostIt({
  children,
  top,
  left,
  right,
  bottom,
  rotate = -2,
  width = 180
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top,
      left,
      right,
      bottom,
      width,
      background: DC.postitBg,
      padding: '14px 16px',
      fontFamily: '"Comic Sans MS", "Marker Felt", "Segoe Print", cursive',
      fontSize: 14,
      lineHeight: 1.4,
      color: DC.postitText,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      transform: `rotate(${rotate}deg)`,
      zIndex: 5
    }
  }, children);
}
Object.assign(window, {
  DesignCanvas,
  DCSection,
  DCArtboard,
  DCPostIt
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "Brieflee Homepage/design-canvas.jsx", error: String((e && e.message) || e) }); }

// Brieflee Homepage/heroes.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React */
const {
  useState,
  useEffect
} = React;

// ============================================================
// Brieflee — Homepage Hero variants
// Three different angles, all 1920×1080 desktop heroes.
// Light mode: periwinkle on cream, navy type.
// ============================================================

const NAVY = "#001364";
const PERI = "#879CF7";
const PERI2 = "#6B82E8";
const CREAM = "#F6F4EF";
const PAPER = "#FFFFFF";
const PERI_LIGHT = "#ECF0FF";
const PERI_FAINT = "#F4F6FF";
const BORDER = "#D6DEFC";
const GREEN = "#22c55e";
const RED = "#ef4444";
const AMBER = "#f59e0b";

// ─── Hero wrapper: 1920×1080, JS-scaled to fit container ────
function Hero({
  children,
  bg = CREAM,
  style
}) {
  const outerRef = React.useRef(null);
  const innerRef = React.useRef(null);
  React.useLayoutEffect(() => {
    const o = outerRef.current,
      i = innerRef.current;
    if (!o || !i) return;
    const apply = () => {
      const w = o.clientWidth,
        h = o.clientHeight;
      if (!w || !h) return;
      i.style.transform = `scale(${Math.min(w / 1920, h / 1080)})`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(o);
    return () => ro.disconnect();
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    ref: outerRef,
    style: {
      width: "100%",
      height: "100%",
      position: "relative",
      overflow: "hidden",
      background: bg
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: innerRef,
    style: {
      width: 1920,
      height: 1080,
      position: "absolute",
      top: 0,
      left: 0,
      transformOrigin: "top left",
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      color: NAVY,
      ...style
    }
  }, children));
}

// ─── Shared site nav (Softr-style) ───────────────────────────
function Nav({
  light = true
}) {
  const fg = light ? NAVY : "#fff";
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 96,
      padding: "0 80px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      zIndex: 50
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 56
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/brieflee-logo.svg",
    alt: "Brieflee",
    style: {
      height: 32
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 36,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(NavItem, {
    label: "Product",
    hasMenu: true,
    fg: fg
  }), /*#__PURE__*/React.createElement(NavItem, {
    label: "Solutions",
    hasMenu: true,
    fg: fg
  }), /*#__PURE__*/React.createElement(NavItem, {
    label: "Resources",
    hasMenu: true,
    fg: fg
  }), /*#__PURE__*/React.createElement(NavItem, {
    label: "Pricing",
    fg: fg
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      color: fg,
      opacity: 0.85
    }
  }, "Login"), /*#__PURE__*/React.createElement("button", {
    style: {
      background: PERI,
      color: "#fff",
      border: "none",
      padding: "14px 24px",
      borderRadius: 999,
      fontSize: 15,
      fontWeight: 700,
      cursor: "pointer",
      fontFamily: "inherit",
      display: "flex",
      alignItems: "center",
      gap: 8,
      boxShadow: "0 1px 0 0 rgba(0,19,100,0.18), 0 8px 24px -8px rgba(135,156,247,0.6)"
    }
  }, "Start free trial", /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  })))));
}
function NavItem({
  label,
  hasMenu,
  fg
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 5,
      fontSize: 15,
      fontWeight: 600,
      color: fg,
      opacity: 0.85,
      cursor: "pointer"
    }
  }, label, hasMenu && /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "6 9 12 15 18 9"
  })));
}

// ─── Eyebrow pill ──────────────────────────────────────────
function Eyebrow({
  children,
  variant = "peri"
}) {
  const styles = {
    peri: {
      bg: "rgba(135,156,247,0.16)",
      fg: NAVY,
      dot: PERI
    },
    navy: {
      bg: NAVY,
      fg: "#fff",
      dot: PERI
    }
  }[variant];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 18px",
      background: styles.bg,
      color: styles.fg,
      fontSize: 14,
      fontWeight: 700,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      borderRadius: 999,
      width: "fit-content"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: styles.dot,
      boxShadow: `0 0 0 3px ${styles.dot}33`
    }
  }), children);
}

// ─── Primary / secondary buttons ────────────────────────────
function Btn({
  children,
  primary,
  large
}) {
  const base = {
    border: "none",
    padding: large ? "20px 32px" : "16px 26px",
    borderRadius: 999,
    fontSize: large ? 18 : 16,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 10
  };
  if (primary) return /*#__PURE__*/React.createElement("button", {
    style: {
      ...base,
      background: PERI,
      color: "#fff",
      boxShadow: "0 2px 0 0 rgba(0,19,100,0.22), 0 14px 28px -10px rgba(135,156,247,0.7)"
    }
  }, children, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  })));
  return /*#__PURE__*/React.createElement("button", {
    style: {
      ...base,
      background: "transparent",
      color: NAVY,
      border: `1.5px solid ${NAVY}22`
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: NAVY
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8 5v14l11-7z"
  })), children);
}

// ────────────────────────────────────────────────────────────
// Reusable: a scored UGC video tile (used in V1 & V2)
// ────────────────────────────────────────────────────────────
function VideoTile({
  score,
  status,
  label,
  creator,
  gradient,
  w = 220,
  h = 290
}) {
  const statusColor = status === "PASS" ? GREEN : status === "FAIL" ? RED : AMBER;
  const statusBg = status === "PASS" ? "#dcfce7" : status === "FAIL" ? "#fee2e2" : "#fef3c7";
  const statusFg = status === "PASS" ? "#166534" : status === "FAIL" ? "#991b1b" : "#92400e";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: w,
      height: h,
      borderRadius: 18,
      background: gradient || `linear-gradient(135deg, ${PERI} 0%, ${PERI2} 100%)`,
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 10px 30px -8px rgba(0,19,100,0.20), 0 2px 0 0 rgba(0,19,100,0.05)",
      border: `1px solid ${BORDER}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      opacity: 0.4,
      background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.35) 0%, transparent 50%)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 12,
      right: 12,
      padding: "5px 10px",
      borderRadius: 999,
      background: statusBg,
      color: statusFg,
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: "0.04em"
    }
  }, status), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 56,
      left: 14,
      fontSize: 38,
      fontWeight: 800,
      color: "#fff",
      letterSpacing: "-0.02em",
      textShadow: "0 2px 12px rgba(0,0,0,0.25)"
    }
  }, score), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 38,
      left: 14,
      fontSize: 11,
      fontWeight: 600,
      color: "rgba(255,255,255,0.85)",
      letterSpacing: "0.06em",
      textTransform: "uppercase"
    }
  }, "Score"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: "10px 14px",
      background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.55) 100%)",
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 18,
      height: 18,
      borderRadius: "50%",
      background: "rgba(255,255,255,0.9)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: "#fff"
    }
  }, creator), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "rgba(255,255,255,0.7)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, label))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "42%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 56,
      height: 56,
      borderRadius: "50%",
      background: "rgba(255,255,255,0.18)",
      backdropFilter: "blur(8px)",
      border: "1.5px solid rgba(255,255,255,0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "#fff",
    style: {
      marginLeft: 3
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8 5v14l11-7z"
  }))));
}

// Gradients for tiles
const GRADIENTS = ["linear-gradient(135deg, #FF6B9D 0%, #C53C7E 100%)", "linear-gradient(160deg, #5EE2C9 0%, #2A8E7E 100%)", "linear-gradient(150deg, #FFB86B 0%, #E87E45 100%)", "linear-gradient(135deg, #879CF7 0%, #4A5EC9 100%)", "linear-gradient(140deg, #B4A0FF 0%, #6B5AE0 100%)", "linear-gradient(160deg, #FFD66B 0%, #E89E45 100%)"];

// ============================================================
// ============================================================
// HERO V1 · "Score every video before you post"
// Animated analysis stage: a video card plays → metrics fade in
// as glass chips → PASS / FAIL ribbon swings in → next video.
// Cycles through formats (POV, ASMR, Try On, Street Interview,
// Podcast, Reaction…) with format-appropriate metrics.
// ============================================================

const ANALYSIS_CARDS = [{
  format: "POV",
  grad: GRADIENTS[3],
  score: 91,
  status: "PASS",
  summary: "Hook + pace + brand all in spec",
  chips: [{
    l: "Visual hook",
    v: "0.6s",
    ok: true,
    pos: {
      x: -280,
      y: -220
    }
  }, {
    l: "Engagement pace",
    v: "2.4s / cut",
    ok: true,
    pos: {
      x: -280,
      y: 60
    }
  }, {
    l: "Brand mention",
    v: "3×",
    ok: true,
    pos: {
      x: 280,
      y: -220
    }
  }, {
    l: "Product visible",
    v: "84%",
    ok: true,
    pos: {
      x: 280,
      y: 60
    }
  }]
}, {
  format: "ASMR",
  grad: GRADIENTS[1],
  score: 42,
  status: "FAIL",
  summary: "Audio quality below 80% threshold",
  chips: [{
    l: "Audibility",
    v: "62%",
    ok: false,
    pos: {
      x: -280,
      y: -220
    }
  }, {
    l: "Visual hook",
    v: "3.2s",
    ok: false,
    pos: {
      x: -280,
      y: 60
    }
  }, {
    l: "Face time",
    v: "8%",
    ok: false,
    pos: {
      x: 280,
      y: -220
    }
  }, {
    l: "Brand mention",
    v: "0×",
    ok: false,
    pos: {
      x: 280,
      y: 60
    }
  }]
}, {
  format: "Try On",
  grad: GRADIENTS[0],
  score: 87,
  status: "PASS",
  summary: "Strong product visibility + face time",
  chips: [{
    l: "Product visible",
    v: "92%",
    ok: true,
    pos: {
      x: -280,
      y: -220
    }
  }, {
    l: "Face time",
    v: "44%",
    ok: true,
    pos: {
      x: -280,
      y: 60
    }
  }, {
    l: "Legibility",
    v: "88%",
    ok: true,
    pos: {
      x: 280,
      y: -220
    }
  }, {
    l: "Visual hook",
    v: "0.9s",
    ok: true,
    pos: {
      x: 280,
      y: 60
    }
  }]
}, {
  format: "Street Interview",
  grad: GRADIENTS[4],
  score: 64,
  status: "REVISE",
  summary: "Brand mention below 4× threshold",
  chips: [{
    l: "Audibility",
    v: "82%",
    ok: true,
    pos: {
      x: -280,
      y: -220
    }
  }, {
    l: "Visual hook",
    v: "1.4s",
    ok: false,
    pos: {
      x: -280,
      y: 60
    }
  }, {
    l: "Engagement pace",
    v: "4.1s",
    ok: true,
    pos: {
      x: 280,
      y: -220
    }
  }, {
    l: "Brand mention",
    v: "1×",
    ok: false,
    pos: {
      x: 280,
      y: 60
    }
  }]
}, {
  format: "Podcast",
  grad: GRADIENTS[5],
  score: 79,
  status: "PASS",
  summary: "Audibility + pacing nail the format",
  chips: [{
    l: "Audibility",
    v: "94%",
    ok: true,
    pos: {
      x: -280,
      y: -220
    }
  }, {
    l: "Face time",
    v: "61%",
    ok: true,
    pos: {
      x: -280,
      y: 60
    }
  }, {
    l: "Engagement pace",
    v: "3.2s",
    ok: true,
    pos: {
      x: 280,
      y: -220
    }
  }, {
    l: "Legibility",
    v: "92%",
    ok: true,
    pos: {
      x: 280,
      y: 60
    }
  }]
}, {
  format: "Reaction",
  grad: GRADIENTS[2],
  score: 73,
  status: "PASS",
  summary: "Face time + pace dialed in",
  chips: [{
    l: "Face time",
    v: "58%",
    ok: true,
    pos: {
      x: -280,
      y: -220
    }
  }, {
    l: "Visual hook",
    v: "0.7s",
    ok: true,
    pos: {
      x: -280,
      y: 60
    }
  }, {
    l: "Engagement pace",
    v: "2.1s",
    ok: true,
    pos: {
      x: 280,
      y: -220
    }
  }, {
    l: "Audibility",
    v: "86%",
    ok: true,
    pos: {
      x: 280,
      y: 60
    }
  }]
}];
const HEADLINES = [{
  a: "Review their videos",
  em: "in seconds.",
  b: ""
}, {
  a: "AI watches every video",
  em: "before",
  b: " you do."
}, {
  a: "Every submission,",
  em: "checked",
  b: " — so you don't have to."
}, {
  a: "We watch the videos",
  em: "so you",
  b: " don't have to."
}, {
  a: "Review 10,000 videos",
  em: "without",
  b: " watching one."
}, {
  a: "An AI second pair",
  em: "of eyes",
  b: " on every video."
}, {
  a: "Check every video",
  em: "before",
  b: " they post."
}, {
  a: "Score every UGC asset",
  em: "in 4",
  b: " seconds."
}];
function HeroV1() {
  const [idx, setIdx] = React.useState(0);
  const [hl, setHl] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setIdx(x => (x + 1) % ANALYSIS_CARDS.length), 5800);
    return () => clearInterval(t);
  }, []);
  const card = ANALYSIS_CARDS[idx];
  const headline = HEADLINES[hl];
  return /*#__PURE__*/React.createElement(Hero, {
    bg: "radial-gradient(ellipse 110% 80% at 50% -10%, #DCE3FF 0%, #ECF0FF 35%, #FFFFFF 75%)"
  }, /*#__PURE__*/React.createElement(Nav, null), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      backgroundImage: `linear-gradient(${NAVY}08 1px, transparent 1px), linear-gradient(90deg, ${NAVY}08 1px, transparent 1px)`,
      backgroundSize: "80px 80px",
      backgroundPosition: "40px 40px",
      maskImage: "radial-gradient(ellipse 100% 70% at 50% 30%, black 0%, transparent 80%)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 220,
      left: 80,
      width: 920,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "AI review \xB7 4 seconds per video"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 124,
      fontWeight: 800,
      letterSpacing: "-0.038em",
      lineHeight: 0.94,
      margin: "32px 0 0",
      color: NAVY,
      textWrap: "balance"
    }
  }, headline.a, /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: PERI,
      fontStyle: "italic",
      fontWeight: 700
    }
  }, headline.em), headline.b), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: NAVY,
      opacity: 0.5,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      marginRight: 4
    }
  }, "Headline \u2193"), HEADLINES.map((h, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => setHl(i),
    style: {
      padding: "6px 12px",
      borderRadius: 999,
      border: `1px solid ${i === hl ? PERI : "rgba(0,19,100,0.15)"}`,
      background: i === hl ? PERI : "rgba(255,255,255,0.6)",
      color: i === hl ? "#fff" : NAVY,
      fontSize: 12,
      fontWeight: 700,
      cursor: "pointer",
      fontFamily: "inherit"
    }
  }, i + 1))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 24,
      lineHeight: 1.45,
      color: NAVY,
      opacity: 0.7,
      margin: "32px 0 0",
      maxWidth: 680,
      fontWeight: 500
    }
  }, "Brieflee reviews UGC, influencer, and creator content against your brief \u2014 flagging hook, length, brand mention, and 23 more checks. In seconds, not afternoons."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 44,
      maxWidth: 720
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      background: "rgba(255,255,255,0.65)",
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
      border: `1px solid rgba(255,255,255,0.7)`,
      borderRadius: 999,
      padding: 6,
      boxShadow: "0 4px 16px -4px rgba(0,19,100,0.10)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 20px",
      borderRadius: 999,
      background: PERI,
      color: "#fff",
      fontSize: 16,
      fontWeight: 700,
      boxShadow: "0 2px 8px rgba(135,156,247,0.45)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
  })), "Paste URL"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 20px",
      borderRadius: 999,
      color: NAVY,
      fontSize: 16,
      fontWeight: 700,
      opacity: 0.85
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "17 8 12 3 7 8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "3",
    x2: "12",
    y2: "15"
  })), "Upload file")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "flex",
      alignItems: "center",
      background: "#fff",
      border: `1px solid ${BORDER}`,
      borderRadius: 18,
      padding: 10,
      boxShadow: "0 6px 24px -8px rgba(0,19,100,0.10)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      padding: "0 18px",
      fontSize: 18,
      fontWeight: 500,
      color: NAVY,
      opacity: 0.55
    }
  }, "https://www.tiktok.com/@creator/video/\u2026"), /*#__PURE__*/React.createElement("button", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "16px 24px",
      borderRadius: 12,
      background: PERI,
      color: "#fff",
      fontSize: 18,
      fontWeight: 700,
      border: "none",
      fontFamily: "inherit",
      cursor: "pointer",
      boxShadow: "0 4px 14px -2px rgba(135,156,247,0.55)"
    }
  }, "Break it down", /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      display: "flex",
      alignItems: "center",
      gap: 28,
      fontSize: 16,
      color: NAVY,
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: PERI
    }
  }), "Free, no credit card"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: PERI,
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  })), "Under 60 seconds"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: PERI,
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  })), "Frame by frame")))), /*#__PURE__*/React.createElement(AnalysisStage, {
    key: idx,
    card: card
  }));
}
function AnalysisStage({
  card
}) {
  const cardW = 360,
    cardH = 600;
  const verdictColor = card.status === "PASS" ? GREEN : card.status === "FAIL" ? RED : AMBER;
  const verdictBg = card.status === "PASS" ? "#dcfce7" : card.status === "FAIL" ? "#fee2e2" : "#fef3c7";
  const verdictFg = card.status === "PASS" ? "#0f5132" : card.status === "FAIL" ? "#7f1d1d" : "#7c2d12";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      right: 0,
      top: 80,
      width: 1000,
      height: 1000,
      pointerEvents: "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      width: 700,
      height: 700,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${PERI}55 0%, transparent 65%)`,
      filter: "blur(40px)"
    }
  }), [2, 1].map(offset => {
    const peek = ANALYSIS_CARDS[(ANALYSIS_CARDS.indexOf(card) + offset) % ANALYSIS_CARDS.length];
    const dz = offset; // 1 = closest behind, 2 = furthest
    return /*#__PURE__*/React.createElement("div", {
      key: offset,
      style: {
        position: "absolute",
        left: "50%",
        top: "50%",
        marginLeft: -cardW / 2 + dz * 40,
        marginTop: -cardH / 2 + dz * 50,
        width: cardW,
        height: cardH,
        transform: `scale(${1 - dz * 0.07}) rotate(${dz * 3}deg)`,
        opacity: 1 - dz * 0.22,
        filter: `blur(${dz * 0.5}px)`,
        zIndex: -dz
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: "100%",
        height: "100%",
        borderRadius: 28,
        background: peek.grad,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 20px 40px -16px rgba(0,19,100,0.22)",
        border: "1px solid rgba(255,255,255,0.35)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        opacity: 0.45,
        background: "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.45) 0%, transparent 55%), radial-gradient(circle at 75% 70%, rgba(0,0,0,0.18) 0%, transparent 50%)"
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "glass-dark",
      style: {
        position: "absolute",
        top: 18,
        right: 18,
        padding: "8px 14px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: "0.08em",
        textTransform: "uppercase"
      }
    }, peek.format), /*#__PURE__*/React.createElement("div", {
      className: "glass",
      style: {
        position: "absolute",
        bottom: 18,
        left: 18,
        padding: "6px 12px",
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: NAVY,
        opacity: 0.8
      }
    }, "Queued")));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "50%",
      top: "50%",
      marginLeft: -cardW / 2,
      marginTop: -cardH / 2,
      width: cardW,
      height: cardH,
      animation: "cardEnter 0.7s cubic-bezier(0.22, 1, 0.36, 1) both"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      height: "100%",
      borderRadius: 28,
      background: card.grad,
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 30px 60px -16px rgba(0,19,100,0.30), 0 4px 0 rgba(0,19,100,0.08)",
      border: "1px solid rgba(255,255,255,0.35)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      opacity: 0.45,
      background: "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.45) 0%, transparent 55%), radial-gradient(circle at 75% 70%, rgba(0,0,0,0.18) 0%, transparent 50%)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      width: "40%",
      background: "linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
      animation: "shimmer 2.6s linear infinite"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "44%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 86,
      height: 86,
      borderRadius: "50%",
      background: "rgba(255,255,255,0.22)",
      backdropFilter: "blur(10px)",
      border: "1.5px solid rgba(255,255,255,0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "30",
    height: "30",
    viewBox: "0 0 24 24",
    fill: "#fff",
    style: {
      marginLeft: 4
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8 5v14l11-7z"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "glass",
    style: {
      position: "absolute",
      top: 18,
      left: 18,
      padding: "8px 12px 8px 10px",
      borderRadius: 999,
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: NAVY
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: PERI,
      boxShadow: `0 0 0 3px ${PERI}55`,
      animation: "pulseDot 1.1s ease-in-out infinite"
    }
  }), "Analyzing"), /*#__PURE__*/React.createElement("div", {
    className: "glass-dark",
    style: {
      position: "absolute",
      top: 18,
      right: 18,
      padding: "8px 14px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 800,
      letterSpacing: "0.08em",
      textTransform: "uppercase"
    }
  }, card.format), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: "26px 22px 22px",
      background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.55) 100%)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: "#fff",
      marginBottom: 4
    }
  }, "@", card.format.toLowerCase().replace(/\s+/g, "_"), "_creator \xB7 take_07.mp4"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "rgba(255,255,255,0.7)",
      fontWeight: 600,
      marginBottom: 12
    }
  }, "Reviewing against Q3 brief \xB7 26-point checklist"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 4,
      borderRadius: 999,
      background: "rgba(255,255,255,0.22)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      background: "#fff",
      borderRadius: 999,
      animation: "scrub 4.2s cubic-bezier(0.4, 0, 0.2, 1) forwards"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "50%",
      top: "50%",
      padding: "18px 30px",
      borderRadius: 18,
      background: verdictBg,
      border: `2px solid ${verdictColor}`,
      color: verdictFg,
      fontSize: 36,
      fontWeight: 900,
      letterSpacing: "0.04em",
      display: "flex",
      alignItems: "center",
      gap: 14,
      boxShadow: `0 24px 48px -12px ${verdictColor}66, 0 2px 0 rgba(0,0,0,0.05)`,
      opacity: 0,
      animation: "verdictIn 0.9s 4.2s cubic-bezier(0.22, 1, 0.36, 1) both"
    }
  }, card.status === "PASS" && /*#__PURE__*/React.createElement("svg", {
    width: "32",
    height: "32",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  })), card.status === "FAIL" && /*#__PURE__*/React.createElement("svg", {
    width: "32",
    height: "32",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6L6 18M6 6l12 12"
  })), card.status === "REVISE" && /*#__PURE__*/React.createElement("svg", {
    width: "32",
    height: "32",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 12a9 9 0 0 1 15-6.7L21 8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 3v5h-5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 12a9 9 0 0 1-15 6.7L3 16"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 16H3v5"
  })), card.status), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "50%",
      top: "calc(50% + 78px)",
      transform: "translateX(-50%)",
      fontSize: 14,
      fontWeight: 800,
      color: "#fff",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      textShadow: "0 2px 8px rgba(0,0,0,0.5)",
      opacity: 0,
      animation: "chipIn 0.5s 4.7s both ease"
    }
  }, "Score ", card.score, " / 100"))), card.chips.map((c, i) => {
    const enterDelay = 0.8 + i * 0.45; // staggered fade-in
    const floatDelay = enterDelay + 0.6; // float kicks in after entry
    const floatDur = 4 + i * 0.6;
    const cx = 500 + c.pos.x; // 500 is right-stage center
    const cy = 500 + c.pos.y;
    const okBg = c.ok ? "#dcfce7" : "#fee2e2";
    const okFg = c.ok ? "#166534" : "#991b1b";
    const okIcon = c.ok ? /*#__PURE__*/React.createElement("polyline", {
      points: "20 6 9 17 4 12"
    }) : /*#__PURE__*/React.createElement("path", {
      d: "M18 6L6 18M6 6l12 12"
    });
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        position: "absolute",
        left: cx,
        top: cy,
        animation: `chipIn 0.6s ${enterDelay}s both cubic-bezier(0.22, 1, 0.36, 1), chipFloat ${floatDur}s ${floatDelay}s ease-in-out infinite`
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "glass",
      style: {
        padding: "12px 16px 12px 12px",
        borderRadius: 16,
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 30,
        height: 30,
        borderRadius: 9,
        background: okBg,
        color: okFg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "3.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, okIcon)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: NAVY,
        opacity: 0.55,
        fontWeight: 800,
        letterSpacing: "0.08em",
        textTransform: "uppercase"
      }
    }, c.l), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 17,
        color: NAVY,
        fontWeight: 800,
        letterSpacing: "-0.005em"
      }
    }, c.v))));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 500,
      top: 500 + 320,
      transform: "translateX(-50%)",
      animation: "chipIn 0.6s 4.5s both ease"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass",
    style: {
      padding: "12px 20px",
      borderRadius: 999,
      display: "flex",
      alignItems: "center",
      gap: 10,
      fontSize: 14,
      color: NAVY,
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: verdictColor
    }
  }), card.summary)));
}
function Annotation() {
  return null;
} // legacy, unused

// ============================================================
// HERO V2 · "The first eyes on every submission"
// Centered editorial headline over a tiled wall of scored UGC.
// Bold, magazine-like, novel: the type sits on top of the product.
// ============================================================
function HeroV2() {
  // Build a 6×3 mosaic of small video tiles behind the headline
  const tiles = [];
  const stats = ["PASS", "PASS", "WARN", "PASS", "FAIL", "PASS", "PASS", "PASS", "WARN", "PASS", "PASS", "FAIL", "PASS", "WARN", "PASS", "PASS", "PASS", "PASS"];
  const scores = [94, 88, 62, 77, 38, 91, 82, 79, 55, 86, 93, 42, 71, 68, 84, 89, 76, 90];
  for (let i = 0; i < 18; i++) {
    tiles.push({
      score: scores[i],
      status: stats[i],
      label: ["Hook", "Length", "Caption", "Brand", "Audio", "Pace"][i % 6] + " review",
      creator: "@creator_" + (100 + i),
      gradient: GRADIENTS[i % GRADIENTS.length]
    });
  }
  return /*#__PURE__*/React.createElement(Hero, {
    bg: CREAM
  }, /*#__PURE__*/React.createElement(Nav, null), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "grid",
      gridTemplateColumns: "repeat(6, 1fr)",
      gridTemplateRows: "repeat(3, 1fr)",
      padding: "100px 40px 40px",
      gap: 18,
      opacity: 0.55
    }
  }, tiles.map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      transform: `rotate(${(i % 3 - 1) * 1.5}deg)`
    }
  }, /*#__PURE__*/React.createElement(VideoTile, _extends({}, t, {
    w: "100%",
    h: "100%"
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: `radial-gradient(ellipse 60% 55% at 50% 52%, ${CREAM} 0%, ${CREAM}EE 35%, transparent 75%)`
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 220,
      left: 0,
      right: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      padding: "0 80px"
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "26-point QA checklist"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 156,
      fontWeight: 800,
      letterSpacing: "-0.045em",
      lineHeight: 0.88,
      margin: "28px 0 0",
      color: NAVY,
      textWrap: "balance",
      textShadow: `0 2px 0 ${CREAM}, 0 -1px 0 ${CREAM}, 2px 0 0 ${CREAM}, -2px 0 0 ${CREAM}`
    }
  }, "The first", /*#__PURE__*/React.createElement("br", null), "set of ", /*#__PURE__*/React.createElement("span", {
    style: {
      background: `linear-gradient(180deg, ${PERI} 0%, ${PERI2} 100%)`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      fontStyle: "italic"
    }
  }, "eyes"), " on", /*#__PURE__*/React.createElement("br", null), "every video."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16,
      marginTop: 48
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    primary: true,
    large: true
  }, "Start free trial"), /*#__PURE__*/React.createElement(Btn, {
    large: true
  }, "Watch 90-sec demo")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      fontSize: 14,
      color: NAVY,
      opacity: 0.6,
      fontWeight: 600,
      letterSpacing: "0.04em"
    }
  }, "Free 14-day trial \xB7 No credit card \xB7 Reviewing in 5 minutes")), /*#__PURE__*/React.createElement(FloatingChip, {
    x: 120,
    y: 920,
    label: "Hook timing",
    v: "\u2713 0.8s"
  }), /*#__PURE__*/React.createElement(FloatingChip, {
    x: 1500,
    y: 880,
    label: "Brand mention",
    v: "\u2713 3\xD7"
  }), /*#__PURE__*/React.createElement(FloatingChip, {
    x: 140,
    y: 300,
    label: "Score",
    v: "94/100",
    big: true
  }), /*#__PURE__*/React.createElement(FloatingChip, {
    x: 1560,
    y: 300,
    label: "Reviewed in",
    v: "4.2s"
  }));
}
function FloatingChip({
  x,
  y,
  label,
  v,
  big
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: x,
      top: y,
      transform: "translate(-50%, -50%)",
      background: PAPER,
      padding: big ? "16px 22px" : "12px 18px",
      borderRadius: 16,
      border: `1px solid ${BORDER}`,
      boxShadow: "0 16px 36px -10px rgba(0,19,100,0.22)",
      display: "flex",
      alignItems: "center",
      gap: 12,
      zIndex: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: big ? 32 : 24,
      height: big ? 32 : 24,
      borderRadius: 8,
      background: PERI_LIGHT,
      color: PERI,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: big ? 18 : 14,
    height: big ? 18 : 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: PERI2,
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: NAVY,
      opacity: 0.55,
      fontWeight: 700,
      letterSpacing: "0.06em",
      textTransform: "uppercase"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: big ? 22 : 16,
      color: NAVY,
      fontWeight: 800
    }
  }, v)));
}

// ============================================================
// HERO V3 · "Inbox to approved in 4 seconds"
// Two-panel split: chaotic inbox on left, clean approved on right.
// Bold visual metaphor — before / after the product runs.
// ============================================================
function HeroV3() {
  return /*#__PURE__*/React.createElement(Hero, {
    bg: CREAM
  }, /*#__PURE__*/React.createElement(Nav, null), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 180,
      left: 0,
      right: 0,
      padding: "0 80px",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Computer vision review"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 116,
      fontWeight: 800,
      letterSpacing: "-0.035em",
      lineHeight: 0.96,
      margin: "26px 0 0",
      color: NAVY,
      textWrap: "balance"
    }
  }, "From inbox to approved", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: PERI,
      fontStyle: "italic"
    }
  }, "in 4 seconds."))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 540,
      left: 80,
      right: 80,
      height: 440,
      display: "flex",
      gap: 36
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: -32,
      left: 0,
      display: "flex",
      alignItems: "center",
      gap: 10,
      fontSize: 13,
      fontWeight: 800,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: NAVY,
      opacity: 0.55
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: RED
    }
  }), "Without Brieflee"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      height: "100%",
      borderRadius: 24,
      background: PAPER,
      border: `1px solid ${BORDER}`,
      padding: 24,
      overflow: "hidden",
      position: "relative"
    }
  }, [{
    who: "@curology_ugc",
    when: "12 min ago",
    what: "submission_v3_final.mp4"
  }, {
    who: "@magic.spoon",
    when: "27 min ago",
    what: "MAGICSPOON_HOOK_TEST.mov"
  }, {
    who: "@ridge.creator",
    when: "1 hr ago",
    what: "ridge-wallet-q3-aspect-2.mp4"
  }, {
    who: "@ag1.aria",
    when: "2 hr ago",
    what: "AG1_aria_take7_REVISED.mp4"
  }, {
    who: "@mudwtr.tom",
    when: "3 hr ago",
    what: "mudwtr_tom_hook_FIX.mov"
  }, {
    who: "@truecla.maya",
    when: "5 hr ago",
    what: "true-classic-day12-v9.mp4"
  }, {
    who: "@drsquatch.k",
    when: "yesterday",
    what: "DR_SQUATCH_round4_FINAL_v2.mov"
  }].map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "10px 8px",
      borderBottom: i < 6 ? `1px solid ${PERI_FAINT}` : "none",
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: 6,
      background: GRADIENTS[i % GRADIENTS.length],
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: NAVY
    }
  }, s.who), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: NAVY,
      opacity: 0.55,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, s.what)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: NAVY,
      opacity: 0.45,
      fontWeight: 600
    }
  }, s.when), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: AMBER,
      fontWeight: 800,
      letterSpacing: "0.04em",
      padding: "4px 8px",
      background: "#fef3c7",
      borderRadius: 6
    }
  }, "PENDING"))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 18,
      right: 18,
      background: "#fee2e2",
      color: "#991b1b",
      padding: "8px 14px",
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 800,
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 6v6l4 2"
  })), "47 unreviewed"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 14,
      padding: "0 4px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 72,
      height: 72,
      borderRadius: 20,
      background: PERI,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 16px 32px -8px rgba(135,156,247,0.6), 0 2px 0 rgba(0,19,100,0.2)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "32",
    height: "32",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: NAVY,
      opacity: 0.6,
      textAlign: "center"
    }
  }, "Brieflee", /*#__PURE__*/React.createElement("br", null), "4.2s")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: -32,
      left: 0,
      display: "flex",
      alignItems: "center",
      gap: 10,
      fontSize: 13,
      fontWeight: 800,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: NAVY,
      opacity: 0.55
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: GREEN
    }
  }), "With Brieflee"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      height: "100%",
      borderRadius: 24,
      background: PAPER,
      border: `1px solid ${BORDER}`,
      padding: 24,
      overflow: "hidden",
      position: "relative",
      boxShadow: "0 24px 48px -12px rgba(135,156,247,0.35)"
    }
  }, [{
    who: "@curology_ugc",
    score: 94,
    status: "PASS",
    note: "Send to client"
  }, {
    who: "@magic.spoon",
    score: 38,
    status: "FAIL",
    note: "Hook lost at 0:04"
  }, {
    who: "@ridge.creator",
    score: 87,
    status: "PASS",
    note: "Send to client"
  }, {
    who: "@ag1.aria",
    score: 62,
    status: "REVISE",
    note: "Caption off-brief"
  }, {
    who: "@mudwtr.tom",
    score: 91,
    status: "PASS",
    note: "Send to client"
  }, {
    who: "@truecla.maya",
    score: 79,
    status: "PASS",
    note: "Send to client"
  }, {
    who: "@drsquatch.k",
    score: 48,
    status: "FAIL",
    note: "Brand mention missing"
  }].map((s, i) => {
    const c = s.status === "PASS" ? GREEN : s.status === "FAIL" ? RED : AMBER;
    const cb = s.status === "PASS" ? "#dcfce7" : s.status === "FAIL" ? "#fee2e2" : "#fef3c7";
    const cf = s.status === "PASS" ? "#166534" : s.status === "FAIL" ? "#991b1b" : "#92400e";
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "10px 8px",
        borderBottom: i < 6 ? `1px solid ${PERI_FAINT}` : "none",
        fontSize: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 32,
        height: 32,
        borderRadius: 6,
        background: GRADIENTS[i % GRADIENTS.length],
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: NAVY
      }
    }, s.who), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: NAVY,
        opacity: 0.55
      }
    }, s.note)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 22,
        fontWeight: 800,
        color: NAVY,
        letterSpacing: "-0.02em",
        minWidth: 44,
        textAlign: "right"
      }
    }, s.score), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: cf,
        background: cb,
        fontWeight: 800,
        letterSpacing: "0.04em",
        padding: "4px 8px",
        borderRadius: 6,
        minWidth: 52,
        textAlign: "center"
      }
    }, s.status));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 18,
      right: 18,
      background: "#dcfce7",
      color: "#166534",
      padding: "8px 14px",
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 800,
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  })), "All 47 reviewed")))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 440,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    primary: true,
    large: true
  }, "Start free trial"), /*#__PURE__*/React.createElement(Btn, {
    large: true
  }, "Watch 90-sec demo")));
}
Object.assign(window, {
  HeroV1,
  HeroV2,
  HeroV3
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "Brieflee Homepage/heroes.jsx", error: String((e && e.message) || e) }); }

// Brieflee Homepage/tweaks-panel.jsx
try { (() => {
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;width:100%;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : {
      [keyOrEdits]: val
    };
    setValues(prev => ({
      ...prev,
      ...edits
    }));
    window.parent.postMessage({
      type: '__edit_mode_set_keys',
      edits
    }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', {
      detail: edits
    }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({
  title = 'Tweaks',
  noDeckControls = false,
  children
}) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  // Auto-inject a rail toggle when a <deck-stage> is on the page. The
  // toggle drives the deck's per-viewer _railVisible via window message;
  // state is mirrored from the same localStorage key the deck reads so
  // the control reflects reality across reloads. The mechanism is the
  // message — authors who want custom placement can post it directly
  // and pass noDeckControls to suppress this one.
  const hasDeckStage = React.useMemo(() => typeof document !== 'undefined' && !!document.querySelector('deck-stage'), []);
  // Hide the toggle until the host has actually enabled the rail (the
  // __omelette_rail_enabled window message, posted only when the
  // omelette_deck_rail_enabled flag is on for this user). The initial read
  // covers TweaksPanel mounting after the message already arrived; the
  // listener covers the common case of mounting first.
  const [railEnabled, setRailEnabled] = React.useState(() => hasDeckStage && !!document.querySelector('deck-stage')?._railEnabled);
  React.useEffect(() => {
    if (!hasDeckStage || railEnabled) return undefined;
    const onMsg = e => {
      if (e.data && e.data.type === '__omelette_rail_enabled') setRailEnabled(true);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [hasDeckStage, railEnabled]);
  const [railVisible, setRailVisible] = React.useState(() => {
    try {
      return localStorage.getItem('deck-stage.railVisible') !== '0';
    } catch (e) {
      return true;
    }
  });
  const toggleRail = on => {
    setRailVisible(on);
    window.postMessage({
      type: '__deck_rail_visible',
      on
    }, '*');
  };
  const offsetRef = React.useRef({
    x: 16,
    y: 16
  });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth,
      h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = e => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({
      type: '__edit_mode_available'
    }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({
      type: '__edit_mode_dismissed'
    }, '*');
  };
  const onDragStart = e => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX,
      sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = ev => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, __TWEAKS_STYLE), /*#__PURE__*/React.createElement("div", {
    ref: dragRef,
    className: "twk-panel",
    "data-noncommentable": "",
    style: {
      right: offsetRef.current.x,
      bottom: offsetRef.current.y
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-hd",
    onMouseDown: onDragStart
  }, /*#__PURE__*/React.createElement("b", null, title), /*#__PURE__*/React.createElement("button", {
    className: "twk-x",
    "aria-label": "Close tweaks",
    onMouseDown: e => e.stopPropagation(),
    onClick: dismiss
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "twk-body"
  }, children, hasDeckStage && railEnabled && !noDeckControls && /*#__PURE__*/React.createElement(TweakSection, {
    label: "Deck"
  }, /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Thumbnail rail",
    value: railVisible,
    onChange: toggleRail
  })))));
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "twk-sect"
  }, label), children);
}
function TweakRow({
  label,
  value,
  children,
  inline = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: inline ? 'twk-row twk-row-h' : 'twk-row'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label), value != null && /*#__PURE__*/React.createElement("span", {
    className: "twk-val"
  }, value)), children);
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label,
    value: `${value}${unit}`
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "twk-slider",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(Number(e.target.value))
  }));
}
function TweakToggle({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "twk-toggle",
    "data-on": value ? '1' : '0',
    role: "switch",
    "aria-checked": !!value,
    onClick: () => onChange(!value)
  }, /*#__PURE__*/React.createElement("i", null)));
}
function TweakRadio({
  label,
  value,
  options,
  onChange
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = o => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({
    2: 16,
    3: 10
  }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = s => {
      const m = options.find(o => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return /*#__PURE__*/React.createElement(TweakSelect, {
      label: label,
      value: value,
      options: options,
      onChange: s => onChange(resolve(s))
    });
  }
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;
  const segAt = clientX => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = e => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = ev => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    role: "radiogroup",
    onPointerDown: onPointerDown,
    className: dragging ? 'twk-seg dragging' : 'twk-seg'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-seg-thumb",
    style: {
      left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
      width: `calc((100% - 4px) / ${n})`
    }
  }), opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "radio",
    "aria-checked": o.value === value
  }, o.label))));
}
function TweakSelect({
  label,
  value,
  options,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("select", {
    className: "twk-field",
    value: value,
    onChange: e => onChange(e.target.value)
  }, options.map(o => {
    const v = typeof o === 'object' ? o.value : o;
    const l = typeof o === 'object' ? o.label : o;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })));
}
function TweakText({
  label,
  value,
  placeholder,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("input", {
    className: "twk-field",
    type: "text",
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakNumber({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange
}) {
  const clamp = n => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({
    x: 0,
    val: 0
  });
  const onScrubStart = e => {
    e.preventDefault();
    startRef.current = {
      x: e.clientX,
      val: value
    };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = ev => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-num"
  }, /*#__PURE__*/React.createElement("span", {
    className: "twk-num-lbl",
    onPointerDown: onScrubStart
  }, label), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: e => onChange(clamp(Number(e.target.value)))
  }), unit && /*#__PURE__*/React.createElement("span", {
    className: "twk-num-unit"
  }, unit));
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = n >> 16 & 255,
    g = n >> 8 & 255,
    b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}
const __TwkCheck = ({
  light
}) => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 14 14",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 7.2 5.8 10 11 4.2",
  fill: "none",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  stroke: light ? 'rgba(0,0,0,.78)' : '#fff'
}));

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({
  label,
  value,
  options,
  onChange
}) {
  if (!options || !options.length) {
    return /*#__PURE__*/React.createElement("div", {
      className: "twk-row twk-row-h"
    }, /*#__PURE__*/React.createElement("div", {
      className: "twk-lbl"
    }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("input", {
      type: "color",
      className: "twk-swatch",
      value: value,
      onChange: e => onChange(e.target.value)
    }));
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = o => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-chips",
    role: "radiogroup"
  }, options.map((o, i) => {
    const colors = Array.isArray(o) ? o : [o];
    const [hero, ...rest] = colors;
    const sup = rest.slice(0, 4);
    const on = key(o) === cur;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      type: "button",
      className: "twk-chip",
      role: "radio",
      "aria-checked": on,
      "data-on": on ? '1' : '0',
      "aria-label": colors.join(', '),
      title: colors.join(' · '),
      style: {
        background: hero
      },
      onClick: () => onChange(o)
    }, sup.length > 0 && /*#__PURE__*/React.createElement("span", null, sup.map((c, j) => /*#__PURE__*/React.createElement("i", {
      key: j,
      style: {
        background: c
      }
    }))), on && /*#__PURE__*/React.createElement(__TwkCheck, {
      light: __twkIsLight(hero)
    }));
  })));
}
function TweakButton({
  label,
  onClick,
  secondary = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: secondary ? 'twk-btn secondary' : 'twk-btn',
    onClick: onClick
  }, label);
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "Brieflee Homepage/tweaks-panel.jsx", error: String((e && e.message) || e) }); }

// Brieflee Signup Image/design-canvas.jsx
try { (() => {
// DesignCanvas.jsx — Figma-ish design canvas wrapper
// Warm gray grid bg + Sections + Artboards + PostIt notes.
// Artboards are reorderable (grip-drag), labels/titles are inline-editable,
// and any artboard can be opened in a fullscreen focus overlay (←/→/Esc).
// State persists to a .design-canvas.state.json sidecar via the host
// bridge. No assets, no deps.
//
// Usage:
//   <DesignCanvas>
//     <DCSection id="onboarding" title="Onboarding" subtitle="First-run variants">
//       <DCArtboard id="a" label="A · Dusk" width={260} height={480}>…</DCArtboard>
//       <DCArtboard id="b" label="B · Minimal" width={260} height={480}>…</DCArtboard>
//     </DCSection>
//   </DesignCanvas>

const DC = {
  bg: '#f0eee9',
  grid: 'rgba(0,0,0,0.06)',
  label: 'rgba(60,50,40,0.7)',
  title: 'rgba(40,30,20,0.85)',
  subtitle: 'rgba(60,50,40,0.6)',
  postitBg: '#fef4a8',
  postitText: '#5a4a2a',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
};

// One-time CSS injection (classes are dc-prefixed so they don't collide with
// the hosted design's own styles).
if (typeof document !== 'undefined' && !document.getElementById('dc-styles')) {
  const s = document.createElement('style');
  s.id = 'dc-styles';
  s.textContent = ['.dc-editable{cursor:text;outline:none;white-space:nowrap;border-radius:3px;padding:0 2px;margin:0 -2px}', '.dc-editable:focus{background:#fff;box-shadow:0 0 0 1.5px #c96442}', '[data-dc-slot]{transition:transform .18s cubic-bezier(.2,.7,.3,1)}', '[data-dc-slot].dc-dragging{transition:none;z-index:10;pointer-events:none}', '[data-dc-slot].dc-dragging .dc-card{box-shadow:0 12px 40px rgba(0,0,0,.25),0 0 0 2px #c96442;transform:scale(1.02)}', '.dc-card{transition:box-shadow .15s,transform .15s}', '.dc-card *{scrollbar-width:none}', '.dc-card *::-webkit-scrollbar{display:none}', '.dc-labelrow{display:flex;align-items:center;gap:4px;height:24px}', '.dc-grip{cursor:grab;display:flex;align-items:center;padding:5px 4px;border-radius:4px;transition:background .12s}', '.dc-grip:hover{background:rgba(0,0,0,.08)}', '.dc-grip:active{cursor:grabbing}', '.dc-labeltext{cursor:pointer;border-radius:4px;padding:3px 6px;display:flex;align-items:center;transition:background .12s}', '.dc-labeltext:hover{background:rgba(0,0,0,.05)}', '.dc-expand{position:absolute;bottom:100%;right:0;margin-bottom:5px;z-index:2;opacity:0;transition:opacity .12s,background .12s;', '  width:22px;height:22px;border-radius:5px;border:none;cursor:pointer;padding:0;', '  background:transparent;color:rgba(60,50,40,.7);display:flex;align-items:center;justify-content:center}', '.dc-expand:hover{background:rgba(0,0,0,.06);color:#2a251f}', '[data-dc-slot]:hover .dc-expand{opacity:1}'].join('\n');
  document.head.appendChild(s);
}
const DCCtx = React.createContext(null);

// ─────────────────────────────────────────────────────────────
// DesignCanvas — stateful wrapper around the pan/zoom viewport.
// Owns runtime state (per-section order, renamed titles/labels, focused
// artboard). Order/titles/labels persist to a .design-canvas.state.json
// sidecar next to the HTML. Reads go via plain fetch() so the saved
// arrangement is visible anywhere the HTML + sidecar are served together
// (omelette preview, direct link, downloaded zip). Writes go through the
// host's window.omelette bridge — editing requires the omelette runtime.
// Focus is ephemeral.
// ─────────────────────────────────────────────────────────────
const DC_STATE_FILE = '.design-canvas.state.json';
function DesignCanvas({
  children,
  minScale,
  maxScale,
  style
}) {
  const [state, setState] = React.useState({
    sections: {},
    focus: null
  });
  // Hold rendering until the sidecar read settles so the saved order/titles
  // appear on first paint (no source-order flash). didRead gates writes until
  // the read settles so the empty initial state can't clobber a slow read;
  // skipNextWrite suppresses the one echo-write that would otherwise follow
  // hydration.
  const [ready, setReady] = React.useState(false);
  const didRead = React.useRef(false);
  const skipNextWrite = React.useRef(false);
  React.useEffect(() => {
    let off = false;
    fetch('./' + DC_STATE_FILE).then(r => r.ok ? r.json() : null).then(saved => {
      if (off || !saved || !saved.sections) return;
      skipNextWrite.current = true;
      setState(s => ({
        ...s,
        sections: saved.sections
      }));
    }).catch(() => {}).finally(() => {
      didRead.current = true;
      if (!off) setReady(true);
    });
    const t = setTimeout(() => {
      if (!off) setReady(true);
    }, 150);
    return () => {
      off = true;
      clearTimeout(t);
    };
  }, []);
  React.useEffect(() => {
    if (!didRead.current) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    const t = setTimeout(() => {
      window.omelette?.writeFile(DC_STATE_FILE, JSON.stringify({
        sections: state.sections
      })).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [state.sections]);

  // Build registries synchronously from children so FocusOverlay can read
  // them in the same render. Only direct DCSection > DCArtboard children are
  // walked — wrapping them in other elements opts out of focus/reorder.
  const registry = {}; // slotId -> { sectionId, artboard }
  const sectionMeta = {}; // sectionId -> { title, subtitle, slotIds[] }
  const sectionOrder = [];
  React.Children.forEach(children, sec => {
    if (!sec || sec.type !== DCSection) return;
    const sid = sec.props.id ?? sec.props.title;
    if (!sid) return;
    sectionOrder.push(sid);
    const persisted = state.sections[sid] || {};
    const srcIds = [];
    React.Children.forEach(sec.props.children, ab => {
      if (!ab || ab.type !== DCArtboard) return;
      const aid = ab.props.id ?? ab.props.label;
      if (!aid) return;
      registry[`${sid}/${aid}`] = {
        sectionId: sid,
        artboard: ab
      };
      srcIds.push(aid);
    });
    const kept = (persisted.order || []).filter(k => srcIds.includes(k));
    sectionMeta[sid] = {
      title: persisted.title ?? sec.props.title,
      subtitle: sec.props.subtitle,
      slotIds: [...kept, ...srcIds.filter(k => !kept.includes(k))]
    };
  });
  const api = React.useMemo(() => ({
    state,
    section: id => state.sections[id] || {},
    patchSection: (id, p) => setState(s => ({
      ...s,
      sections: {
        ...s.sections,
        [id]: {
          ...s.sections[id],
          ...(typeof p === 'function' ? p(s.sections[id] || {}) : p)
        }
      }
    })),
    setFocus: slotId => setState(s => ({
      ...s,
      focus: slotId
    }))
  }), [state]);

  // Esc exits focus; any outside pointerdown commits an in-progress rename.
  React.useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') api.setFocus(null);
    };
    const onPd = e => {
      const ae = document.activeElement;
      if (ae && ae.isContentEditable && !ae.contains(e.target)) ae.blur();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPd, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPd, true);
    };
  }, [api]);
  return /*#__PURE__*/React.createElement(DCCtx.Provider, {
    value: api
  }, /*#__PURE__*/React.createElement(DCViewport, {
    minScale: minScale,
    maxScale: maxScale,
    style: style
  }, ready && children), state.focus && registry[state.focus] && /*#__PURE__*/React.createElement(DCFocusOverlay, {
    entry: registry[state.focus],
    sectionMeta: sectionMeta,
    sectionOrder: sectionOrder
  }));
}

// ─────────────────────────────────────────────────────────────
// DCViewport — transform-based pan/zoom (internal)
//
// Input mapping (Figma-style):
//   • trackpad pinch  → zoom   (ctrlKey wheel; Safari gesture* events)
//   • trackpad scroll → pan    (two-finger)
//   • mouse wheel     → zoom   (notched; distinguished from trackpad scroll)
//   • middle-drag / primary-drag-on-bg → pan
//
// Transform state lives in a ref and is written straight to the DOM
// (translate3d + will-change) so wheel ticks don't go through React —
// keeps pans at 60fps on dense canvases.
// ─────────────────────────────────────────────────────────────
function DCViewport({
  children,
  minScale = 0.1,
  maxScale = 8,
  style = {}
}) {
  const vpRef = React.useRef(null);
  const worldRef = React.useRef(null);
  const tf = React.useRef({
    x: 0,
    y: 0,
    scale: 1
  });
  const apply = React.useCallback(() => {
    const {
      x,
      y,
      scale
    } = tf.current;
    const el = worldRef.current;
    if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }, []);
  React.useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const zoomAt = (cx, cy, factor) => {
      const r = vp.getBoundingClientRect();
      const px = cx - r.left,
        py = cy - r.top;
      const t = tf.current;
      const next = Math.min(maxScale, Math.max(minScale, t.scale * factor));
      const k = next / t.scale;
      // keep the world point under the cursor fixed
      t.x = px - (px - t.x) * k;
      t.y = py - (py - t.y) * k;
      t.scale = next;
      apply();
    };

    // Mouse-wheel vs trackpad-scroll heuristic. A physical wheel sends
    // line-mode deltas (Firefox) or large integer pixel deltas with no X
    // component (Chrome/Safari, typically multiples of 100/120). Trackpad
    // two-finger scroll sends small/fractional pixel deltas, often with
    // non-zero deltaX. ctrlKey is set by the browser for trackpad pinch.
    const isMouseWheel = e => e.deltaMode !== 0 || e.deltaX === 0 && Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 40;
    const onWheel = e => {
      e.preventDefault();
      if (isGesturing) return; // Safari: gesture* owns the pinch — discard concurrent wheels
      if (e.ctrlKey) {
        // trackpad pinch (or explicit ctrl+wheel)
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else if (isMouseWheel(e)) {
        // notched mouse wheel — fixed-ratio step per click
        zoomAt(e.clientX, e.clientY, Math.exp(-Math.sign(e.deltaY) * 0.18));
      } else {
        // trackpad two-finger scroll — pan
        tf.current.x -= e.deltaX;
        tf.current.y -= e.deltaY;
        apply();
      }
    };

    // Safari sends native gesture* events for trackpad pinch with a smooth
    // e.scale; preferring these over the ctrl+wheel fallback gives a much
    // better feel there. No-ops on other browsers. Safari also fires
    // ctrlKey wheel events during the same pinch — isGesturing makes
    // onWheel drop those entirely so they neither zoom nor pan.
    let gsBase = 1;
    let isGesturing = false;
    const onGestureStart = e => {
      e.preventDefault();
      isGesturing = true;
      gsBase = tf.current.scale;
    };
    const onGestureChange = e => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, gsBase * e.scale / tf.current.scale);
    };
    const onGestureEnd = e => {
      e.preventDefault();
      isGesturing = false;
    };

    // Drag-pan: middle button anywhere, or primary button on canvas
    // background (anything that isn't an artboard or an inline editor).
    let drag = null;
    const onPointerDown = e => {
      const onBg = !e.target.closest('[data-dc-slot], .dc-editable');
      if (!(e.button === 1 || e.button === 0 && onBg)) return;
      e.preventDefault();
      vp.setPointerCapture(e.pointerId);
      drag = {
        id: e.pointerId,
        lx: e.clientX,
        ly: e.clientY
      };
      vp.style.cursor = 'grabbing';
    };
    const onPointerMove = e => {
      if (!drag || e.pointerId !== drag.id) return;
      tf.current.x += e.clientX - drag.lx;
      tf.current.y += e.clientY - drag.ly;
      drag.lx = e.clientX;
      drag.ly = e.clientY;
      apply();
    };
    const onPointerUp = e => {
      if (!drag || e.pointerId !== drag.id) return;
      vp.releasePointerCapture(e.pointerId);
      drag = null;
      vp.style.cursor = '';
    };
    vp.addEventListener('wheel', onWheel, {
      passive: false
    });
    vp.addEventListener('gesturestart', onGestureStart, {
      passive: false
    });
    vp.addEventListener('gesturechange', onGestureChange, {
      passive: false
    });
    vp.addEventListener('gestureend', onGestureEnd, {
      passive: false
    });
    vp.addEventListener('pointerdown', onPointerDown);
    vp.addEventListener('pointermove', onPointerMove);
    vp.addEventListener('pointerup', onPointerUp);
    vp.addEventListener('pointercancel', onPointerUp);
    return () => {
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('gesturestart', onGestureStart);
      vp.removeEventListener('gesturechange', onGestureChange);
      vp.removeEventListener('gestureend', onGestureEnd);
      vp.removeEventListener('pointerdown', onPointerDown);
      vp.removeEventListener('pointermove', onPointerMove);
      vp.removeEventListener('pointerup', onPointerUp);
      vp.removeEventListener('pointercancel', onPointerUp);
    };
  }, [apply, minScale, maxScale]);
  const gridSvg = `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M120 0H0v120' fill='none' stroke='${encodeURIComponent(DC.grid)}' stroke-width='1'/%3E%3C/svg%3E")`;
  return /*#__PURE__*/React.createElement("div", {
    ref: vpRef,
    className: "design-canvas",
    style: {
      height: '100vh',
      width: '100vw',
      background: DC.bg,
      overflow: 'hidden',
      overscrollBehavior: 'none',
      touchAction: 'none',
      position: 'relative',
      fontFamily: DC.font,
      boxSizing: 'border-box',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: worldRef,
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      transformOrigin: '0 0',
      willChange: 'transform',
      width: 'max-content',
      minWidth: '100%',
      minHeight: '100%',
      padding: '60px 0 80px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: -6000,
      backgroundImage: gridSvg,
      backgroundSize: '120px 120px',
      pointerEvents: 'none',
      zIndex: -1
    }
  }), children));
}

// ─────────────────────────────────────────────────────────────
// DCSection — editable title + h-row of artboards in persisted order
// ─────────────────────────────────────────────────────────────
function DCSection({
  id,
  title,
  subtitle,
  children,
  gap = 48
}) {
  const ctx = React.useContext(DCCtx);
  const sid = id ?? title;
  const all = React.Children.toArray(children);
  const artboards = all.filter(c => c && c.type === DCArtboard);
  const rest = all.filter(c => !(c && c.type === DCArtboard));
  const srcOrder = artboards.map(a => a.props.id ?? a.props.label);
  const sec = ctx && sid && ctx.section(sid) || {};
  const order = React.useMemo(() => {
    const kept = (sec.order || []).filter(k => srcOrder.includes(k));
    return [...kept, ...srcOrder.filter(k => !kept.includes(k))];
  }, [sec.order, srcOrder.join('|')]);
  const byId = Object.fromEntries(artboards.map(a => [a.props.id ?? a.props.label, a]));
  return /*#__PURE__*/React.createElement("div", {
    "data-dc-section": sid,
    style: {
      marginBottom: 80,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 60px 56px'
    }
  }, /*#__PURE__*/React.createElement(DCEditable, {
    tag: "div",
    value: sec.title ?? title,
    onChange: v => ctx && sid && ctx.patchSection(sid, {
      title: v
    }),
    style: {
      fontSize: 28,
      fontWeight: 600,
      color: DC.title,
      letterSpacing: -0.4,
      marginBottom: 6,
      display: 'inline-block'
    }
  }), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      color: DC.subtitle
    }
  }, subtitle)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap,
      padding: '0 60px',
      alignItems: 'flex-start',
      width: 'max-content'
    }
  }, order.map(k => /*#__PURE__*/React.createElement(DCArtboardFrame, {
    key: k,
    sectionId: sid,
    artboard: byId[k],
    order: order,
    label: (sec.labels || {})[k] ?? byId[k].props.label,
    onRename: v => ctx && ctx.patchSection(sid, x => ({
      labels: {
        ...x.labels,
        [k]: v
      }
    })),
    onReorder: next => ctx && ctx.patchSection(sid, {
      order: next
    }),
    onFocus: () => ctx && ctx.setFocus(`${sid}/${k}`)
  }))), rest);
}

// DCArtboard — marker; rendered by DCArtboardFrame via DCSection.
function DCArtboard() {
  return null;
}
function DCArtboardFrame({
  sectionId,
  artboard,
  label,
  order,
  onRename,
  onReorder,
  onFocus
}) {
  const {
    id: rawId,
    label: rawLabel,
    width = 260,
    height = 480,
    children,
    style = {}
  } = artboard.props;
  const id = rawId ?? rawLabel;
  const ref = React.useRef(null);

  // Live drag-reorder: dragged card sticks to cursor; siblings slide into
  // their would-be slots in real time via transforms. DOM order only
  // changes on drop.
  const onGripDown = e => {
    e.preventDefault();
    e.stopPropagation();
    const me = ref.current;
    // translateX is applied in local (pre-scale) space but pointer deltas and
    // getBoundingClientRect().left are screen-space — divide by the viewport's
    // current scale so the dragged card tracks the cursor at any zoom level.
    const scale = me.getBoundingClientRect().width / me.offsetWidth || 1;
    const peers = Array.from(document.querySelectorAll(`[data-dc-section="${sectionId}"] [data-dc-slot]`));
    const homes = peers.map(el => ({
      el,
      id: el.dataset.dcSlot,
      x: el.getBoundingClientRect().left
    }));
    const slotXs = homes.map(h => h.x);
    const startIdx = order.indexOf(id);
    const startX = e.clientX;
    let liveOrder = order.slice();
    me.classList.add('dc-dragging');
    const layout = () => {
      for (const h of homes) {
        if (h.id === id) continue;
        const slot = liveOrder.indexOf(h.id);
        h.el.style.transform = `translateX(${(slotXs[slot] - h.x) / scale}px)`;
      }
    };
    const move = ev => {
      const dx = ev.clientX - startX;
      me.style.transform = `translateX(${dx / scale}px)`;
      const cur = homes[startIdx].x + dx;
      let nearest = 0,
        best = Infinity;
      for (let i = 0; i < slotXs.length; i++) {
        const d = Math.abs(slotXs[i] - cur);
        if (d < best) {
          best = d;
          nearest = i;
        }
      }
      if (liveOrder.indexOf(id) !== nearest) {
        liveOrder = order.filter(k => k !== id);
        liveOrder.splice(nearest, 0, id);
        layout();
      }
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      const finalSlot = liveOrder.indexOf(id);
      me.classList.remove('dc-dragging');
      me.style.transform = `translateX(${(slotXs[finalSlot] - homes[startIdx].x) / scale}px)`;
      // After the settle transition, kill transitions + clear transforms +
      // commit the reorder in the same frame so there's no visual snap-back.
      setTimeout(() => {
        for (const h of homes) {
          h.el.style.transition = 'none';
          h.el.style.transform = '';
        }
        if (liveOrder.join('|') !== order.join('|')) onReorder(liveOrder);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          for (const h of homes) h.el.style.transition = '';
        }));
      }, 180);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    "data-dc-slot": id,
    style: {
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-labelrow",
    style: {
      position: 'absolute',
      bottom: '100%',
      left: -4,
      marginBottom: 4,
      color: DC.label
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-grip",
    onPointerDown: onGripDown,
    title: "Drag to reorder"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "13",
    viewBox: "0 0 9 13",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "11",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "11",
    r: "1.1"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-labeltext",
    onClick: onFocus,
    title: "Click to focus"
  }, /*#__PURE__*/React.createElement(DCEditable, {
    value: label,
    onChange: onRename,
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 15,
      fontWeight: 500,
      color: DC.label,
      lineHeight: 1
    }
  }))), /*#__PURE__*/React.createElement("button", {
    className: "dc-expand",
    onClick: onFocus,
    onPointerDown: e => e.stopPropagation(),
    title: "Focus"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 1h4v4M5 11H1V7M11 1L7.5 4.5M1 11l3.5-3.5"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-card",
    style: {
      borderRadius: 2,
      boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)',
      overflow: 'hidden',
      width,
      height,
      background: '#fff',
      ...style
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb',
      fontSize: 13,
      fontFamily: DC.font
    }
  }, id)));
}

// Inline rename — commits on blur or Enter.
function DCEditable({
  value,
  onChange,
  style,
  tag = 'span',
  onClick
}) {
  const T = tag;
  return /*#__PURE__*/React.createElement(T, {
    className: "dc-editable",
    contentEditable: true,
    suppressContentEditableWarning: true,
    onClick: onClick,
    onPointerDown: e => e.stopPropagation(),
    onBlur: e => onChange && onChange(e.currentTarget.textContent),
    onKeyDown: e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.currentTarget.blur();
      }
    },
    style: style
  }, value);
}

// ─────────────────────────────────────────────────────────────
// Focus mode — overlay one artboard; ←/→ within section, ↑/↓ across
// sections, Esc or backdrop click to exit.
// ─────────────────────────────────────────────────────────────
function DCFocusOverlay({
  entry,
  sectionMeta,
  sectionOrder
}) {
  const ctx = React.useContext(DCCtx);
  const {
    sectionId,
    artboard
  } = entry;
  const sec = ctx.section(sectionId);
  const meta = sectionMeta[sectionId];
  const peers = meta.slotIds;
  const aid = artboard.props.id ?? artboard.props.label;
  const idx = peers.indexOf(aid);
  const secIdx = sectionOrder.indexOf(sectionId);
  const go = d => {
    const n = peers[(idx + d + peers.length) % peers.length];
    if (n) ctx.setFocus(`${sectionId}/${n}`);
  };
  const goSection = d => {
    const ns = sectionOrder[(secIdx + d + sectionOrder.length) % sectionOrder.length];
    const first = sectionMeta[ns] && sectionMeta[ns].slotIds[0];
    if (first) ctx.setFocus(`${ns}/${first}`);
  };
  React.useEffect(() => {
    const k = e => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goSection(-1);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        goSection(1);
      }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  });
  const {
    width = 260,
    height = 480,
    children
  } = artboard.props;
  const [vp, setVp] = React.useState({
    w: window.innerWidth,
    h: window.innerHeight
  });
  React.useEffect(() => {
    const r = () => setVp({
      w: window.innerWidth,
      h: window.innerHeight
    });
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);
  const scale = Math.max(0.1, Math.min((vp.w - 200) / width, (vp.h - 260) / height, 2));
  const [ddOpen, setDd] = React.useState(false);
  const Arrow = ({
    dir,
    onClick
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onClick();
    },
    style: {
      position: 'absolute',
      top: '50%',
      [dir]: 28,
      transform: 'translateY(-50%)',
      border: 'none',
      background: 'rgba(255,255,255,.08)',
      color: 'rgba(255,255,255,.9)',
      width: 44,
      height: 44,
      borderRadius: 22,
      fontSize: 18,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background .15s'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.18)',
    onMouseLeave: e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: dir === 'left' ? 'M11 3L5 9l6 6' : 'M7 3l6 6-6 6'
  })));

  // Portal to body so position:fixed is the real viewport regardless of any
  // transform on DesignCanvas's ancestors (including the canvas zoom itself).
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    onClick: () => ctx.setFocus(null),
    onWheel: e => e.preventDefault(),
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(24,20,16,.6)',
      backdropFilter: 'blur(14px)',
      fontFamily: DC.font,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 72,
      display: 'flex',
      alignItems: 'flex-start',
      padding: '16px 20px 0',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setDd(o => !o),
    style: {
      border: 'none',
      background: 'transparent',
      color: '#fff',
      cursor: 'pointer',
      padding: '6px 8px',
      borderRadius: 6,
      textAlign: 'left',
      fontFamily: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: -0.3
    }
  }, meta.title), /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 11 11",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    style: {
      opacity: .7
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 4l3.5 3.5L9 4"
  }))), meta.subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 13,
      opacity: .6,
      fontWeight: 400,
      marginTop: 2
    }
  }, meta.subtitle)), ddOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: 4,
      background: '#2a251f',
      borderRadius: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,.4)',
      padding: 4,
      minWidth: 200,
      zIndex: 10
    }
  }, sectionOrder.map(sid => /*#__PURE__*/React.createElement("button", {
    key: sid,
    onClick: () => {
      setDd(false);
      const f = sectionMeta[sid].slotIds[0];
      if (f) ctx.setFocus(`${sid}/${f}`);
    },
    style: {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      border: 'none',
      cursor: 'pointer',
      background: sid === sectionId ? 'rgba(255,255,255,.1)' : 'transparent',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: 5,
      fontSize: 14,
      fontWeight: sid === sectionId ? 600 : 400,
      fontFamily: 'inherit'
    }
  }, sectionMeta[sid].title)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => ctx.setFocus(null),
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.12)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent',
    style: {
      border: 'none',
      background: 'transparent',
      color: 'rgba(255,255,255,.7)',
      width: 32,
      height: 32,
      borderRadius: 16,
      fontSize: 20,
      cursor: 'pointer',
      lineHeight: 1,
      transition: 'background .12s'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 64,
      bottom: 56,
      left: 100,
      right: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: width * scale,
      height: height * scale,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      background: '#fff',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 20px 80px rgba(0,0,0,.4)'
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb'
    }
  }, aid))), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 14,
      fontWeight: 500,
      opacity: .85,
      textAlign: 'center'
    }
  }, (sec.labels || {})[aid] ?? artboard.props.label, /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .5,
      marginLeft: 10,
      fontVariantNumeric: 'tabular-nums'
    }
  }, idx + 1, " / ", peers.length))), /*#__PURE__*/React.createElement(Arrow, {
    dir: "left",
    onClick: () => go(-1)
  }), /*#__PURE__*/React.createElement(Arrow, {
    dir: "right",
    onClick: () => go(1)
  }), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 8
    }
  }, peers.map((p, i) => /*#__PURE__*/React.createElement("button", {
    key: p,
    onClick: () => ctx.setFocus(`${sectionId}/${p}`),
    style: {
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      width: 6,
      height: 6,
      borderRadius: 3,
      background: i === idx ? '#fff' : 'rgba(255,255,255,.3)'
    }
  })))), document.body);
}

// ─────────────────────────────────────────────────────────────
// Post-it — absolute-positioned sticky note
// ─────────────────────────────────────────────────────────────
function DCPostIt({
  children,
  top,
  left,
  right,
  bottom,
  rotate = -2,
  width = 180
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top,
      left,
      right,
      bottom,
      width,
      background: DC.postitBg,
      padding: '14px 16px',
      fontFamily: '"Comic Sans MS", "Marker Felt", "Segoe Print", cursive',
      fontSize: 14,
      lineHeight: 1.4,
      color: DC.postitText,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      transform: `rotate(${rotate}deg)`,
      zIndex: 5
    }
  }, children);
}
Object.assign(window, {
  DesignCanvas,
  DCSection,
  DCArtboard,
  DCPostIt
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "Brieflee Signup Image/design-canvas.jsx", error: String((e && e.message) || e) }); }

// Brieflee Signup Image/variants.jsx
try { (() => {
/* global React */
const {
  useState
} = React;

// ============================================================
// Brieflee Signup Image — Variants
// All artboards are 1080×1080 (safe square; Softr's "Cover" fit
// handles minor cropping on either side).
// Background gradient matches Softr's locked side-section bg.
// ============================================================

const NAVY = "#001364";
const PERI = "#879CF7";
const BLUE = "#294ff6";
const PERI_LIGHT = "#ECF0FF";
const PERI_FAINT = "#F4F6FF";
const BORDER = "#D6DEFC";

// The Softr left-side gradient (read off the screenshot)
const SOFTR_BG = "linear-gradient(180deg, #ECF0FF 0%, #DCE3FF 100%)";

// Reusable artboard wrapper. The variant always renders at 1080×1080 internally
// and is scaled via JS to fill its parent (the design canvas's DCArtboard).
// That way both the canvas thumbnail and the focus-mode overlay show the full
// design, regardless of card size.
//
// Each Artboard also exposes a "Download PNG" button (top-right, on hover)
// that captures the inner 1080×1080 surface at full resolution using
// html-to-image (loaded from CDN in the host page).
function Artboard({
  children,
  bg,
  padding = 80,
  style,
  filename = "brieflee-signup"
}) {
  const outerRef = React.useRef(null);
  const innerRef = React.useRef(null);
  const [downloading, setDownloading] = React.useState(false);
  React.useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const apply = () => {
      const w = outer.clientWidth;
      const h = outer.clientHeight;
      if (!w || !h) return;
      const s = Math.min(w / 1080, h / 1080);
      inner.style.transform = `scale(${s})`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(outer);
    return () => ro.disconnect();
  }, []);
  async function handleDownload(e) {
    e.stopPropagation();
    if (!innerRef.current || !window.htmlToImage) {
      alert("Download library not loaded yet. Try again in a second.");
      return;
    }
    setDownloading(true);
    try {
      // Temporarily clear the scale transform so we capture at full 1080×1080.
      const inner = innerRef.current;
      const saved = inner.style.transform;
      inner.style.transform = "none";
      const dataUrl = await window.htmlToImage.toPng(inner, {
        width: 1080,
        height: 1080,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: null
      });
      inner.style.transform = saved;
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${filename}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert("Couldn't generate the PNG. Check the console.");
    } finally {
      setDownloading(false);
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    ref: outerRef,
    style: {
      width: "100%",
      height: "100%",
      position: "relative",
      overflow: "hidden",
      background: bg || SOFTR_BG
    },
    className: "bl-artboard"
  }, /*#__PURE__*/React.createElement("div", {
    ref: innerRef,
    style: {
      width: 1080,
      height: 1080,
      transformOrigin: "top left",
      position: "absolute",
      top: 0,
      left: 0,
      padding,
      boxSizing: "border-box",
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      color: NAVY,
      display: "flex",
      flexDirection: "column",
      ...style
    }
  }, children), /*#__PURE__*/React.createElement("button", {
    onClick: handleDownload,
    className: "bl-download-btn",
    style: {
      position: "absolute",
      top: 12,
      right: 12,
      zIndex: 5,
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "8px 12px",
      background: NAVY,
      color: "#fff",
      border: "none",
      borderRadius: 8,
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.02em",
      cursor: downloading ? "wait" : "pointer",
      opacity: downloading ? 1 : 0,
      transition: "opacity 0.15s ease",
      boxShadow: "0 4px 14px -2px rgba(0,19,100,0.25)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "7 10 12 15 17 10"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "15",
    x2: "12",
    y2: "3"
  })), downloading ? "Saving…" : "Download PNG"));
}

// ─── Eyebrow pill ─────────────────────────────────────────
function Eyebrow({
  children,
  dark = false
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 16px",
      background: dark ? NAVY : PERI,
      color: "#fff",
      fontSize: 14,
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      borderRadius: 999,
      width: "fit-content"
    }
  }, children);
}

// ============================================================
// V1 · Product screenshot — the dashboard speaks for itself
// (Text OFF mode: image carries everything)
// ============================================================
function V1ProductGrid() {
  return /*#__PURE__*/React.createElement(Artboard, {
    padding: 0,
    filename: "brieflee-v1-product-peek"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      padding: "120px 100px 80px"
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Spell check for video"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 64,
      fontWeight: 800,
      letterSpacing: "-0.025em",
      lineHeight: 1.05,
      margin: "28px 0 20px",
      color: NAVY,
      textWrap: "pretty"
    }
  }, "Score every", /*#__PURE__*/React.createElement("br", null), "asset in seconds."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 22,
      lineHeight: 1.5,
      color: NAVY,
      opacity: 0.7,
      margin: 0,
      maxWidth: 720
    }
  }, "Brieflee reviews UGC, influencer, and creator videos against the brief \u2014 automatically.")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 100,
      right: -120,
      bottom: -60,
      height: 480,
      borderRadius: 24,
      boxShadow: "0 24px 60px -12px rgba(0,19,100,0.25)",
      overflow: "hidden",
      background: "#fff"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/feature-output-grid.png",
    alt: "",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: "left top"
    }
  })));
}

// ============================================================
// V2 · Testimonial card (Vasiliy Gualoto) — Foreplay-style
// ============================================================
function V2Testimonial() {
  return /*#__PURE__*/React.createElement(Artboard, {
    padding: 80,
    filename: "brieflee-v2-testimonial"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 60,
      left: 80,
      fontSize: 220,
      lineHeight: 0.8,
      fontFamily: "Georgia, serif",
      color: PERI,
      opacity: 0.35,
      fontWeight: 700
    }
  }, "\u201C"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 100,
      background: "#fff",
      borderRadius: 28,
      padding: "44px 48px",
      boxShadow: "0 16px 48px -8px rgba(0,19,100,0.12)",
      border: `1px solid ${BORDER}`,
      display: "flex",
      flexDirection: "column",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4
    }
  }, [0, 1, 2, 3, 4].map(i => /*#__PURE__*/React.createElement("svg", {
    key: i,
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: PERI
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 2l2.9 6.9 7.5.6-5.7 4.9 1.8 7.3L12 17.8 5.5 21.7l1.8-7.3L1.6 9.5l7.5-.6L12 2z"
  })))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 26,
      lineHeight: 1.45,
      color: NAVY,
      fontWeight: 500,
      margin: 0,
      textWrap: "pretty"
    }
  }, "One person can only watch so many videos in a day. Since we started using Brieflee, submissions that don't meet the mark get flagged straight away.", /*#__PURE__*/React.createElement("span", {
    style: {
      color: NAVY,
      opacity: 0.6
    }
  }, " ", "Our influencers actually send better content now because they know exactly what we're checking for.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/vasiliy.png",
    alt: "",
    style: {
      width: 64,
      height: 64,
      borderRadius: "50%",
      objectFit: "cover",
      background: PERI_LIGHT
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      color: NAVY
    }
  }, "Vasiliy Gualoto"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      color: NAVY,
      opacity: 0.6
    }
  }, "Founder, Influencer Agency")), /*#__PURE__*/React.createElement("img", {
    src: "assets/app-icon-periwinkle.png",
    alt: "",
    style: {
      width: 44,
      height: 44,
      borderRadius: 10,
      opacity: 0.9
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      textAlign: "center",
      color: NAVY,
      opacity: 0.55,
      fontSize: 15,
      fontWeight: 500,
      letterSpacing: "0.04em"
    }
  }, "Trusted by agencies reviewing 10,000+ videos a month"));
}

// ============================================================
// V3 · Engraving — editorial / premium (clapboard)
// Designed to pair with Softr's heading + text ON
// ============================================================
function V3Engraving() {
  return /*#__PURE__*/React.createElement(Artboard, {
    padding: 0,
    filename: "brieflee-v3-clapboard"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      width: 720,
      height: 720,
      borderRadius: "50%",
      background: `radial-gradient(circle at 50% 40%, ${PERI} 0%, ${PERI} 35%, rgba(135,156,247,0.0) 70%)`,
      opacity: 0.45
    }
  }), /*#__PURE__*/React.createElement("img", {
    src: "assets/engraving-clapboard.png",
    alt: "",
    style: {
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%) rotate(-8deg)",
      width: 620,
      height: 620,
      objectFit: "contain",
      filter: "drop-shadow(0 24px 40px rgba(0,19,100,0.18))"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 56,
      left: 0,
      right: 0,
      textAlign: "center",
      color: NAVY,
      opacity: 0.55,
      fontSize: 14,
      fontWeight: 600,
      letterSpacing: "0.12em",
      textTransform: "uppercase"
    }
  }, "Brieflee \xB7 Spell check for video"));
}

// ============================================================
// V4 · Stickers / playful — pairs with Softr text
// ============================================================
function V4Stickers() {
  return /*#__PURE__*/React.createElement(Artboard, {
    padding: 0,
    filename: "brieflee-v4-stickers"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/magnifying-glass.png",
    alt: "",
    style: {
      width: 460,
      height: 460,
      objectFit: "contain",
      transform: "rotate(-12deg)",
      filter: "drop-shadow(0 18px 30px rgba(0,19,100,0.18))"
    }
  })), /*#__PURE__*/React.createElement("img", {
    src: "assets/looking-eyes.png",
    alt: "",
    style: {
      position: "absolute",
      top: 110,
      right: 100,
      width: 200,
      height: 200,
      objectFit: "contain",
      transform: "rotate(8deg)",
      filter: "drop-shadow(0 12px 20px rgba(0,19,100,0.15))"
    }
  }), /*#__PURE__*/React.createElement("img", {
    src: "assets/ai-sparkles.png",
    alt: "",
    style: {
      position: "absolute",
      bottom: 130,
      left: 110,
      width: 180,
      height: 180,
      objectFit: "contain",
      transform: "rotate(-6deg)",
      opacity: 0.95
    }
  }), /*#__PURE__*/React.createElement("img", {
    src: "assets/isometric-smiley.png",
    alt: "",
    style: {
      position: "absolute",
      bottom: 100,
      right: 90,
      width: 220,
      height: 220,
      objectFit: "contain",
      transform: "rotate(14deg)"
    }
  }));
}

// ============================================================
// V5 · Big bold typography on the gradient
// (Text OFF mode — type IS the image)
// ============================================================
function V5BoldType() {
  return /*#__PURE__*/React.createElement(Artboard, {
    padding: 100,
    filename: "brieflee-v5-bold-type"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Spell check for video"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 132,
      fontWeight: 800,
      letterSpacing: "-0.035em",
      lineHeight: 0.95,
      margin: "44px 0 0",
      color: NAVY,
      textWrap: "balance"
    }
  }, "Stop", /*#__PURE__*/React.createElement("br", null), "watching", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: PERI
    }
  }, "every video.")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 28,
      lineHeight: 1.4,
      color: NAVY,
      opacity: 0.7,
      margin: "auto 0 0",
      maxWidth: 720,
      fontWeight: 500
    }
  }, "Brieflee scores every UGC asset against your brief \u2014 in seconds, not afternoons."));
}

// ============================================================
// V6 · Score card preview — show the actual output
// (Text OFF mode — product visualization carries the message)
// ============================================================
function V6ScoreCard() {
  const checks = [{
    label: "Hook timing",
    v: "First 2s",
    pass: true
  }, {
    label: "Audio quality",
    v: "92%",
    pass: true
  }, {
    label: "Brand mention",
    v: "3×",
    pass: true
  }, {
    label: "Product visible",
    v: "90%",
    pass: true
  }, {
    label: "Length",
    v: "0:42",
    pass: true
  }, {
    label: "Caption match",
    v: "On-brief",
    pass: true
  }];
  return /*#__PURE__*/React.createElement(Artboard, {
    padding: 90,
    filename: "brieflee-v6-score-card"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 14,
      height: 14,
      borderRadius: "50%",
      background: "#22c55e",
      boxShadow: "0 0 0 5px rgba(34,197,94,0.18)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      color: NAVY,
      opacity: 0.65,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase"
    }
  }, "Reviewed in 4.2 seconds")), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 60,
      fontWeight: 800,
      letterSpacing: "-0.02em",
      lineHeight: 1.05,
      margin: "0 0 36px",
      color: NAVY
    }
  }, "Every asset, scored", /*#__PURE__*/React.createElement("br", null), "against your brief."), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      borderRadius: 24,
      padding: 36,
      border: `1px solid ${BORDER}`,
      boxShadow: "0 16px 40px -8px rgba(0,19,100,0.10)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: NAVY,
      opacity: 0.55,
      fontWeight: 600,
      letterSpacing: "0.05em",
      textTransform: "uppercase"
    }
  }, "Submission \xB7 gymshark-q3-027.mp4"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 28,
      fontWeight: 700,
      color: NAVY,
      marginTop: 6
    }
  }, "Overall score \xB7 94 / 100")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 18px",
      background: "#dcfce7",
      color: "#166534",
      borderRadius: 999,
      fontSize: 16,
      fontWeight: 700
    }
  }, "PASS")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, checks.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "14px 16px",
      background: PERI_FAINT,
      borderRadius: 12
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#22c55e",
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 17,
      color: NAVY,
      fontWeight: 600,
      flex: 1
    }
  }, c.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      color: NAVY,
      opacity: 0.7,
      fontWeight: 500
    }
  }, c.v))))));
}

// ============================================================
// V7 · Social proof — logos + big stat
// ============================================================
function V7SocialProof() {
  const brands = ["Gymshark", "Glossier", "Liquid I.V.", "Dr. Squatch", "MUD\\WTR", "Magic Spoon", "AG1", "True Classic"];
  return /*#__PURE__*/React.createElement(Artboard, {
    padding: 100,
    filename: "brieflee-v7-social-proof"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Trusted by ops teams"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 84,
      fontWeight: 800,
      letterSpacing: "-0.03em",
      lineHeight: 1,
      margin: "32px 0 12px",
      color: NAVY
    }
  }, "10,000", /*#__PURE__*/React.createElement("span", {
    style: {
      color: PERI
    }
  }, "+")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 26,
      color: NAVY,
      opacity: 0.7,
      margin: 0,
      fontWeight: 500
    }
  }, "videos reviewed every month by brands and agencies on Brieflee."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14
    }
  }, brands.map(b => /*#__PURE__*/React.createElement("div", {
    key: b,
    style: {
      background: "#fff",
      borderRadius: 14,
      border: `1px solid ${BORDER}`,
      padding: "20px 22px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: "-0.01em",
      color: NAVY,
      opacity: 0.85,
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }
  }, b))));
}

// ============================================================
// V8 · Brain engraving — minimal editorial
// ============================================================
function V8BrainEngraving() {
  return /*#__PURE__*/React.createElement(Artboard, {
    padding: 0,
    filename: "brieflee-v8-brain"
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/engraving-brain.png",
    alt: "",
    style: {
      position: "absolute",
      left: "50%",
      top: "46%",
      transform: "translate(-50%, -50%)",
      width: 680,
      height: 680,
      objectFit: "contain",
      filter: "drop-shadow(0 20px 40px rgba(0,19,100,0.15))"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 110,
      left: 0,
      right: 0,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: PERI,
      marginBottom: 14
    }
  }, "Computer-vision review"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 38,
      fontWeight: 800,
      letterSpacing: "-0.015em",
      lineHeight: 1.15,
      color: NAVY,
      maxWidth: 820,
      margin: "0 auto",
      textWrap: "balance"
    }
  }, "The first set of eyes that", /*#__PURE__*/React.createElement("br", null), "never gets tired.")));
}

// ============================================================
// V9 · Pass / Fail funnel — show the binary moderation visual
// ============================================================
function V9PassFail() {
  return /*#__PURE__*/React.createElement(Artboard, {
    padding: 0,
    filename: "brieflee-v9-passfail"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "100px 100px 0"
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Automated UGC moderation"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 56,
      fontWeight: 800,
      letterSpacing: "-0.02em",
      lineHeight: 1.05,
      margin: "24px 0 0",
      color: NAVY
    }
  }, "Approve, reject, or send", /*#__PURE__*/React.createElement("br", null), "revision notes \u2014 fast.")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 580,
      backgroundImage: "url(assets/feature-binary-pass-fail.png)",
      backgroundSize: "cover",
      backgroundPosition: "left center"
    }
  }));
}

// ============================================================
// V10 · Stat-forward minimal
// ============================================================
function V10Stat() {
  return /*#__PURE__*/React.createElement(Artboard, {
    padding: 100,
    filename: "brieflee-v10-stat"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Time saved"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 60,
      fontSize: 280,
      fontWeight: 800,
      letterSpacing: "-0.05em",
      lineHeight: 0.9,
      color: NAVY,
      fontFeatureSettings: "'tnum'"
    }
  }, "96", /*#__PURE__*/React.createElement("span", {
    style: {
      color: PERI
    }
  }, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      fontSize: 32,
      fontWeight: 700,
      color: NAVY,
      lineHeight: 1.25,
      maxWidth: 720,
      letterSpacing: "-0.01em"
    }
  }, "less time spent", /*#__PURE__*/React.createElement("br", null), "reviewing video submissions."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto",
      display: "flex",
      alignItems: "center",
      gap: 14,
      color: NAVY,
      opacity: 0.65,
      fontSize: 15,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 1.5,
      background: NAVY,
      opacity: 0.4
    }
  }), "Average across 200+ Brieflee customers"));
}

// ============================================================
// V11 · iPhone tripod engraving — vertical-leaning
// ============================================================
function V11Tripod() {
  return /*#__PURE__*/React.createElement(Artboard, {
    padding: 0,
    filename: "brieflee-v11-tripod"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      backgroundImage: `repeating-linear-gradient(0deg, transparent 0, transparent 38px, rgba(0,19,100,0.04) 38px, rgba(0,19,100,0.04) 39px)`
    }
  }), /*#__PURE__*/React.createElement("img", {
    src: "assets/engraving-iphone-tripod.png",
    alt: "",
    style: {
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -52%)",
      height: 720,
      objectFit: "contain",
      filter: "drop-shadow(0 24px 40px rgba(0,19,100,0.20))"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 60,
      left: 80,
      fontSize: 14,
      fontWeight: 700,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: NAVY,
      opacity: 0.7
    }
  }, "Brieflee"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 60,
      right: 80,
      fontSize: 14,
      fontWeight: 700,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: NAVY,
      opacity: 0.7
    }
  }, "Est. 2024"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 70,
      left: 0,
      right: 0,
      textAlign: "center",
      fontSize: 28,
      fontWeight: 700,
      color: NAVY,
      letterSpacing: "-0.01em"
    }
  }, "Built for the era of UGC at scale."));
}

// ============================================================
// V12 · QA checklist — the 26-item promise
// ============================================================
function V12Checklist() {
  const items = ["Hook lands in first 2 seconds", "Audio quality above 80%", "Product visible 60% of runtime", "Brand mentioned ≥ 1×", "Caption matches brief", "Aspect ratio 9:16", "No competing logos visible", "Music cleared for usage", "CTA appears in final 3 seconds"];
  return /*#__PURE__*/React.createElement(Artboard, {
    padding: 90,
    filename: "brieflee-v12-checklist"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "26-point QA checklist"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 56,
      fontWeight: 800,
      letterSpacing: "-0.02em",
      lineHeight: 1.05,
      margin: "24px 0 36px",
      color: NAVY
    }
  }, "We check the things you", /*#__PURE__*/React.createElement("br", null), "don't have time to."), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      borderRadius: 22,
      border: `1px solid ${BORDER}`,
      boxShadow: "0 12px 32px -8px rgba(0,19,100,0.08)",
      overflow: "hidden"
    }
  }, items.map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "18px 28px",
      borderBottom: i < items.length - 1 ? `1px solid ${PERI_FAINT}` : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 26,
      height: 26,
      borderRadius: "50%",
      background: PERI,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 19,
      color: NAVY,
      fontWeight: 500
    }
  }, item), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      fontSize: 13,
      fontWeight: 700,
      color: "#166534",
      background: "#dcfce7",
      padding: "4px 10px",
      borderRadius: 999,
      letterSpacing: "0.04em"
    }
  }, "PASS"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 28px",
      background: PERI_FAINT,
      fontSize: 15,
      fontWeight: 600,
      color: NAVY,
      opacity: 0.7,
      letterSpacing: "0.02em"
    }
  }, "+ 17 more checks")));
}

// ============================================================
// Export all
// ============================================================
Object.assign(window, {
  V1ProductGrid,
  V2Testimonial,
  V3Engraving,
  V4Stickers,
  V5BoldType,
  V6ScoreCard,
  V7SocialProof,
  V8BrainEngraving,
  V9PassFail,
  V10Stat,
  V11Tripod,
  V12Checklist
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "Brieflee Signup Image/variants.jsx", error: String((e && e.message) || e) }); }

// Welcome Emails/design-canvas.jsx
try { (() => {
// DesignCanvas.jsx — Figma-ish design canvas wrapper
// Warm gray grid bg + Sections + Artboards + PostIt notes.
// Artboards are reorderable (grip-drag), labels/titles are inline-editable,
// and any artboard can be opened in a fullscreen focus overlay (←/→/Esc).
// State persists to a .design-canvas.state.json sidecar via the host
// bridge. No assets, no deps.
//
// Usage:
//   <DesignCanvas>
//     <DCSection id="onboarding" title="Onboarding" subtitle="First-run variants">
//       <DCArtboard id="a" label="A · Dusk" width={260} height={480}>…</DCArtboard>
//       <DCArtboard id="b" label="B · Minimal" width={260} height={480}>…</DCArtboard>
//     </DCSection>
//   </DesignCanvas>

const DC = {
  bg: '#f0eee9',
  grid: 'rgba(0,0,0,0.06)',
  label: 'rgba(60,50,40,0.7)',
  title: 'rgba(40,30,20,0.85)',
  subtitle: 'rgba(60,50,40,0.6)',
  postitBg: '#fef4a8',
  postitText: '#5a4a2a',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
};

// One-time CSS injection (classes are dc-prefixed so they don't collide with
// the hosted design's own styles).
if (typeof document !== 'undefined' && !document.getElementById('dc-styles')) {
  const s = document.createElement('style');
  s.id = 'dc-styles';
  s.textContent = ['.dc-editable{cursor:text;outline:none;white-space:nowrap;border-radius:3px;padding:0 2px;margin:0 -2px}', '.dc-editable:focus{background:#fff;box-shadow:0 0 0 1.5px #c96442}', '[data-dc-slot]{transition:transform .18s cubic-bezier(.2,.7,.3,1)}', '[data-dc-slot].dc-dragging{transition:none;z-index:10;pointer-events:none}', '[data-dc-slot].dc-dragging .dc-card{box-shadow:0 12px 40px rgba(0,0,0,.25),0 0 0 2px #c96442;transform:scale(1.02)}', '.dc-card{transition:box-shadow .15s,transform .15s}', '.dc-card *{scrollbar-width:none}', '.dc-card *::-webkit-scrollbar{display:none}', '.dc-labelrow{display:flex;align-items:center;gap:4px;height:24px}', '.dc-grip{cursor:grab;display:flex;align-items:center;padding:5px 4px;border-radius:4px;transition:background .12s}', '.dc-grip:hover{background:rgba(0,0,0,.08)}', '.dc-grip:active{cursor:grabbing}', '.dc-labeltext{cursor:pointer;border-radius:4px;padding:3px 6px;display:flex;align-items:center;transition:background .12s}', '.dc-labeltext:hover{background:rgba(0,0,0,.05)}', '.dc-expand{position:absolute;bottom:100%;right:0;margin-bottom:5px;z-index:2;opacity:0;transition:opacity .12s,background .12s;', '  width:22px;height:22px;border-radius:5px;border:none;cursor:pointer;padding:0;', '  background:transparent;color:rgba(60,50,40,.7);display:flex;align-items:center;justify-content:center}', '.dc-expand:hover{background:rgba(0,0,0,.06);color:#2a251f}', '[data-dc-slot]:hover .dc-expand{opacity:1}'].join('\n');
  document.head.appendChild(s);
}
const DCCtx = React.createContext(null);

// ─────────────────────────────────────────────────────────────
// DesignCanvas — stateful wrapper around the pan/zoom viewport.
// Owns runtime state (per-section order, renamed titles/labels, focused
// artboard). Order/titles/labels persist to a .design-canvas.state.json
// sidecar next to the HTML. Reads go via plain fetch() so the saved
// arrangement is visible anywhere the HTML + sidecar are served together
// (omelette preview, direct link, downloaded zip). Writes go through the
// host's window.omelette bridge — editing requires the omelette runtime.
// Focus is ephemeral.
// ─────────────────────────────────────────────────────────────
const DC_STATE_FILE = '.design-canvas.state.json';
function DesignCanvas({
  children,
  minScale,
  maxScale,
  style
}) {
  const [state, setState] = React.useState({
    sections: {},
    focus: null
  });
  // Hold rendering until the sidecar read settles so the saved order/titles
  // appear on first paint (no source-order flash). didRead gates writes until
  // the read settles so the empty initial state can't clobber a slow read;
  // skipNextWrite suppresses the one echo-write that would otherwise follow
  // hydration.
  const [ready, setReady] = React.useState(false);
  const didRead = React.useRef(false);
  const skipNextWrite = React.useRef(false);
  React.useEffect(() => {
    let off = false;
    fetch('./' + DC_STATE_FILE).then(r => r.ok ? r.json() : null).then(saved => {
      if (off || !saved || !saved.sections) return;
      skipNextWrite.current = true;
      setState(s => ({
        ...s,
        sections: saved.sections
      }));
    }).catch(() => {}).finally(() => {
      didRead.current = true;
      if (!off) setReady(true);
    });
    const t = setTimeout(() => {
      if (!off) setReady(true);
    }, 150);
    return () => {
      off = true;
      clearTimeout(t);
    };
  }, []);
  React.useEffect(() => {
    if (!didRead.current) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    const t = setTimeout(() => {
      window.omelette?.writeFile(DC_STATE_FILE, JSON.stringify({
        sections: state.sections
      })).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [state.sections]);

  // Build registries synchronously from children so FocusOverlay can read
  // them in the same render. Only direct DCSection > DCArtboard children are
  // walked — wrapping them in other elements opts out of focus/reorder.
  const registry = {}; // slotId -> { sectionId, artboard }
  const sectionMeta = {}; // sectionId -> { title, subtitle, slotIds[] }
  const sectionOrder = [];
  React.Children.forEach(children, sec => {
    if (!sec || sec.type !== DCSection) return;
    const sid = sec.props.id ?? sec.props.title;
    if (!sid) return;
    sectionOrder.push(sid);
    const persisted = state.sections[sid] || {};
    const srcIds = [];
    React.Children.forEach(sec.props.children, ab => {
      if (!ab || ab.type !== DCArtboard) return;
      const aid = ab.props.id ?? ab.props.label;
      if (!aid) return;
      registry[`${sid}/${aid}`] = {
        sectionId: sid,
        artboard: ab
      };
      srcIds.push(aid);
    });
    const kept = (persisted.order || []).filter(k => srcIds.includes(k));
    sectionMeta[sid] = {
      title: persisted.title ?? sec.props.title,
      subtitle: sec.props.subtitle,
      slotIds: [...kept, ...srcIds.filter(k => !kept.includes(k))]
    };
  });
  const api = React.useMemo(() => ({
    state,
    section: id => state.sections[id] || {},
    patchSection: (id, p) => setState(s => ({
      ...s,
      sections: {
        ...s.sections,
        [id]: {
          ...s.sections[id],
          ...(typeof p === 'function' ? p(s.sections[id] || {}) : p)
        }
      }
    })),
    setFocus: slotId => setState(s => ({
      ...s,
      focus: slotId
    }))
  }), [state]);

  // Esc exits focus; any outside pointerdown commits an in-progress rename.
  React.useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') api.setFocus(null);
    };
    const onPd = e => {
      const ae = document.activeElement;
      if (ae && ae.isContentEditable && !ae.contains(e.target)) ae.blur();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPd, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPd, true);
    };
  }, [api]);
  return /*#__PURE__*/React.createElement(DCCtx.Provider, {
    value: api
  }, /*#__PURE__*/React.createElement(DCViewport, {
    minScale: minScale,
    maxScale: maxScale,
    style: style
  }, ready && children), state.focus && registry[state.focus] && /*#__PURE__*/React.createElement(DCFocusOverlay, {
    entry: registry[state.focus],
    sectionMeta: sectionMeta,
    sectionOrder: sectionOrder
  }));
}

// ─────────────────────────────────────────────────────────────
// DCViewport — transform-based pan/zoom (internal)
//
// Input mapping (Figma-style):
//   • trackpad pinch  → zoom   (ctrlKey wheel; Safari gesture* events)
//   • trackpad scroll → pan    (two-finger)
//   • mouse wheel     → zoom   (notched; distinguished from trackpad scroll)
//   • middle-drag / primary-drag-on-bg → pan
//
// Transform state lives in a ref and is written straight to the DOM
// (translate3d + will-change) so wheel ticks don't go through React —
// keeps pans at 60fps on dense canvases.
// ─────────────────────────────────────────────────────────────
function DCViewport({
  children,
  minScale = 0.1,
  maxScale = 8,
  style = {}
}) {
  const vpRef = React.useRef(null);
  const worldRef = React.useRef(null);
  const tf = React.useRef({
    x: 0,
    y: 0,
    scale: 1
  });
  const apply = React.useCallback(() => {
    const {
      x,
      y,
      scale
    } = tf.current;
    const el = worldRef.current;
    if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }, []);
  React.useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const zoomAt = (cx, cy, factor) => {
      const r = vp.getBoundingClientRect();
      const px = cx - r.left,
        py = cy - r.top;
      const t = tf.current;
      const next = Math.min(maxScale, Math.max(minScale, t.scale * factor));
      const k = next / t.scale;
      // keep the world point under the cursor fixed
      t.x = px - (px - t.x) * k;
      t.y = py - (py - t.y) * k;
      t.scale = next;
      apply();
    };

    // Mouse-wheel vs trackpad-scroll heuristic. A physical wheel sends
    // line-mode deltas (Firefox) or large integer pixel deltas with no X
    // component (Chrome/Safari, typically multiples of 100/120). Trackpad
    // two-finger scroll sends small/fractional pixel deltas, often with
    // non-zero deltaX. ctrlKey is set by the browser for trackpad pinch.
    const isMouseWheel = e => e.deltaMode !== 0 || e.deltaX === 0 && Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 40;
    const onWheel = e => {
      e.preventDefault();
      if (isGesturing) return; // Safari: gesture* owns the pinch — discard concurrent wheels
      if (e.ctrlKey) {
        // trackpad pinch (or explicit ctrl+wheel)
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else if (isMouseWheel(e)) {
        // notched mouse wheel — fixed-ratio step per click
        zoomAt(e.clientX, e.clientY, Math.exp(-Math.sign(e.deltaY) * 0.18));
      } else {
        // trackpad two-finger scroll — pan
        tf.current.x -= e.deltaX;
        tf.current.y -= e.deltaY;
        apply();
      }
    };

    // Safari sends native gesture* events for trackpad pinch with a smooth
    // e.scale; preferring these over the ctrl+wheel fallback gives a much
    // better feel there. No-ops on other browsers. Safari also fires
    // ctrlKey wheel events during the same pinch — isGesturing makes
    // onWheel drop those entirely so they neither zoom nor pan.
    let gsBase = 1;
    let isGesturing = false;
    const onGestureStart = e => {
      e.preventDefault();
      isGesturing = true;
      gsBase = tf.current.scale;
    };
    const onGestureChange = e => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, gsBase * e.scale / tf.current.scale);
    };
    const onGestureEnd = e => {
      e.preventDefault();
      isGesturing = false;
    };

    // Drag-pan: middle button anywhere, or primary button on canvas
    // background (anything that isn't an artboard or an inline editor).
    let drag = null;
    const onPointerDown = e => {
      const onBg = !e.target.closest('[data-dc-slot], .dc-editable');
      if (!(e.button === 1 || e.button === 0 && onBg)) return;
      e.preventDefault();
      vp.setPointerCapture(e.pointerId);
      drag = {
        id: e.pointerId,
        lx: e.clientX,
        ly: e.clientY
      };
      vp.style.cursor = 'grabbing';
    };
    const onPointerMove = e => {
      if (!drag || e.pointerId !== drag.id) return;
      tf.current.x += e.clientX - drag.lx;
      tf.current.y += e.clientY - drag.ly;
      drag.lx = e.clientX;
      drag.ly = e.clientY;
      apply();
    };
    const onPointerUp = e => {
      if (!drag || e.pointerId !== drag.id) return;
      vp.releasePointerCapture(e.pointerId);
      drag = null;
      vp.style.cursor = '';
    };
    vp.addEventListener('wheel', onWheel, {
      passive: false
    });
    vp.addEventListener('gesturestart', onGestureStart, {
      passive: false
    });
    vp.addEventListener('gesturechange', onGestureChange, {
      passive: false
    });
    vp.addEventListener('gestureend', onGestureEnd, {
      passive: false
    });
    vp.addEventListener('pointerdown', onPointerDown);
    vp.addEventListener('pointermove', onPointerMove);
    vp.addEventListener('pointerup', onPointerUp);
    vp.addEventListener('pointercancel', onPointerUp);
    return () => {
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('gesturestart', onGestureStart);
      vp.removeEventListener('gesturechange', onGestureChange);
      vp.removeEventListener('gestureend', onGestureEnd);
      vp.removeEventListener('pointerdown', onPointerDown);
      vp.removeEventListener('pointermove', onPointerMove);
      vp.removeEventListener('pointerup', onPointerUp);
      vp.removeEventListener('pointercancel', onPointerUp);
    };
  }, [apply, minScale, maxScale]);
  const gridSvg = `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M120 0H0v120' fill='none' stroke='${encodeURIComponent(DC.grid)}' stroke-width='1'/%3E%3C/svg%3E")`;
  return /*#__PURE__*/React.createElement("div", {
    ref: vpRef,
    className: "design-canvas",
    style: {
      height: '100vh',
      width: '100vw',
      background: DC.bg,
      overflow: 'hidden',
      overscrollBehavior: 'none',
      touchAction: 'none',
      position: 'relative',
      fontFamily: DC.font,
      boxSizing: 'border-box',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: worldRef,
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      transformOrigin: '0 0',
      willChange: 'transform',
      width: 'max-content',
      minWidth: '100%',
      minHeight: '100%',
      padding: '60px 0 80px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: -6000,
      backgroundImage: gridSvg,
      backgroundSize: '120px 120px',
      pointerEvents: 'none',
      zIndex: -1
    }
  }), children));
}

// ─────────────────────────────────────────────────────────────
// DCSection — editable title + h-row of artboards in persisted order
// ─────────────────────────────────────────────────────────────
function DCSection({
  id,
  title,
  subtitle,
  children,
  gap = 48
}) {
  const ctx = React.useContext(DCCtx);
  const sid = id ?? title;
  const all = React.Children.toArray(children);
  const artboards = all.filter(c => c && c.type === DCArtboard);
  const rest = all.filter(c => !(c && c.type === DCArtboard));
  const srcOrder = artboards.map(a => a.props.id ?? a.props.label);
  const sec = ctx && sid && ctx.section(sid) || {};
  const order = React.useMemo(() => {
    const kept = (sec.order || []).filter(k => srcOrder.includes(k));
    return [...kept, ...srcOrder.filter(k => !kept.includes(k))];
  }, [sec.order, srcOrder.join('|')]);
  const byId = Object.fromEntries(artboards.map(a => [a.props.id ?? a.props.label, a]));
  return /*#__PURE__*/React.createElement("div", {
    "data-dc-section": sid,
    style: {
      marginBottom: 80,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 60px 56px'
    }
  }, /*#__PURE__*/React.createElement(DCEditable, {
    tag: "div",
    value: sec.title ?? title,
    onChange: v => ctx && sid && ctx.patchSection(sid, {
      title: v
    }),
    style: {
      fontSize: 28,
      fontWeight: 600,
      color: DC.title,
      letterSpacing: -0.4,
      marginBottom: 6,
      display: 'inline-block'
    }
  }), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      color: DC.subtitle
    }
  }, subtitle)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap,
      padding: '0 60px',
      alignItems: 'flex-start',
      width: 'max-content'
    }
  }, order.map(k => /*#__PURE__*/React.createElement(DCArtboardFrame, {
    key: k,
    sectionId: sid,
    artboard: byId[k],
    order: order,
    label: (sec.labels || {})[k] ?? byId[k].props.label,
    onRename: v => ctx && ctx.patchSection(sid, x => ({
      labels: {
        ...x.labels,
        [k]: v
      }
    })),
    onReorder: next => ctx && ctx.patchSection(sid, {
      order: next
    }),
    onFocus: () => ctx && ctx.setFocus(`${sid}/${k}`)
  }))), rest);
}

// DCArtboard — marker; rendered by DCArtboardFrame via DCSection.
function DCArtboard() {
  return null;
}
function DCArtboardFrame({
  sectionId,
  artboard,
  label,
  order,
  onRename,
  onReorder,
  onFocus
}) {
  const {
    id: rawId,
    label: rawLabel,
    width = 260,
    height = 480,
    children,
    style = {}
  } = artboard.props;
  const id = rawId ?? rawLabel;
  const ref = React.useRef(null);

  // Live drag-reorder: dragged card sticks to cursor; siblings slide into
  // their would-be slots in real time via transforms. DOM order only
  // changes on drop.
  const onGripDown = e => {
    e.preventDefault();
    e.stopPropagation();
    const me = ref.current;
    // translateX is applied in local (pre-scale) space but pointer deltas and
    // getBoundingClientRect().left are screen-space — divide by the viewport's
    // current scale so the dragged card tracks the cursor at any zoom level.
    const scale = me.getBoundingClientRect().width / me.offsetWidth || 1;
    const peers = Array.from(document.querySelectorAll(`[data-dc-section="${sectionId}"] [data-dc-slot]`));
    const homes = peers.map(el => ({
      el,
      id: el.dataset.dcSlot,
      x: el.getBoundingClientRect().left
    }));
    const slotXs = homes.map(h => h.x);
    const startIdx = order.indexOf(id);
    const startX = e.clientX;
    let liveOrder = order.slice();
    me.classList.add('dc-dragging');
    const layout = () => {
      for (const h of homes) {
        if (h.id === id) continue;
        const slot = liveOrder.indexOf(h.id);
        h.el.style.transform = `translateX(${(slotXs[slot] - h.x) / scale}px)`;
      }
    };
    const move = ev => {
      const dx = ev.clientX - startX;
      me.style.transform = `translateX(${dx / scale}px)`;
      const cur = homes[startIdx].x + dx;
      let nearest = 0,
        best = Infinity;
      for (let i = 0; i < slotXs.length; i++) {
        const d = Math.abs(slotXs[i] - cur);
        if (d < best) {
          best = d;
          nearest = i;
        }
      }
      if (liveOrder.indexOf(id) !== nearest) {
        liveOrder = order.filter(k => k !== id);
        liveOrder.splice(nearest, 0, id);
        layout();
      }
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      const finalSlot = liveOrder.indexOf(id);
      me.classList.remove('dc-dragging');
      me.style.transform = `translateX(${(slotXs[finalSlot] - homes[startIdx].x) / scale}px)`;
      // After the settle transition, kill transitions + clear transforms +
      // commit the reorder in the same frame so there's no visual snap-back.
      setTimeout(() => {
        for (const h of homes) {
          h.el.style.transition = 'none';
          h.el.style.transform = '';
        }
        if (liveOrder.join('|') !== order.join('|')) onReorder(liveOrder);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          for (const h of homes) h.el.style.transition = '';
        }));
      }, 180);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    "data-dc-slot": id,
    style: {
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-labelrow",
    style: {
      position: 'absolute',
      bottom: '100%',
      left: -4,
      marginBottom: 4,
      color: DC.label
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-grip",
    onPointerDown: onGripDown,
    title: "Drag to reorder"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "13",
    viewBox: "0 0 9 13",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "11",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "11",
    r: "1.1"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-labeltext",
    onClick: onFocus,
    title: "Click to focus"
  }, /*#__PURE__*/React.createElement(DCEditable, {
    value: label,
    onChange: onRename,
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 15,
      fontWeight: 500,
      color: DC.label,
      lineHeight: 1
    }
  }))), /*#__PURE__*/React.createElement("button", {
    className: "dc-expand",
    onClick: onFocus,
    onPointerDown: e => e.stopPropagation(),
    title: "Focus"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 1h4v4M5 11H1V7M11 1L7.5 4.5M1 11l3.5-3.5"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-card",
    style: {
      borderRadius: 2,
      boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)',
      overflow: 'hidden',
      width,
      height,
      background: '#fff',
      ...style
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb',
      fontSize: 13,
      fontFamily: DC.font
    }
  }, id)));
}

// Inline rename — commits on blur or Enter.
function DCEditable({
  value,
  onChange,
  style,
  tag = 'span',
  onClick
}) {
  const T = tag;
  return /*#__PURE__*/React.createElement(T, {
    className: "dc-editable",
    contentEditable: true,
    suppressContentEditableWarning: true,
    onClick: onClick,
    onPointerDown: e => e.stopPropagation(),
    onBlur: e => onChange && onChange(e.currentTarget.textContent),
    onKeyDown: e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.currentTarget.blur();
      }
    },
    style: style
  }, value);
}

// ─────────────────────────────────────────────────────────────
// Focus mode — overlay one artboard; ←/→ within section, ↑/↓ across
// sections, Esc or backdrop click to exit.
// ─────────────────────────────────────────────────────────────
function DCFocusOverlay({
  entry,
  sectionMeta,
  sectionOrder
}) {
  const ctx = React.useContext(DCCtx);
  const {
    sectionId,
    artboard
  } = entry;
  const sec = ctx.section(sectionId);
  const meta = sectionMeta[sectionId];
  const peers = meta.slotIds;
  const aid = artboard.props.id ?? artboard.props.label;
  const idx = peers.indexOf(aid);
  const secIdx = sectionOrder.indexOf(sectionId);
  const go = d => {
    const n = peers[(idx + d + peers.length) % peers.length];
    if (n) ctx.setFocus(`${sectionId}/${n}`);
  };
  const goSection = d => {
    const ns = sectionOrder[(secIdx + d + sectionOrder.length) % sectionOrder.length];
    const first = sectionMeta[ns] && sectionMeta[ns].slotIds[0];
    if (first) ctx.setFocus(`${ns}/${first}`);
  };
  React.useEffect(() => {
    const k = e => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goSection(-1);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        goSection(1);
      }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  });
  const {
    width = 260,
    height = 480,
    children
  } = artboard.props;
  const [vp, setVp] = React.useState({
    w: window.innerWidth,
    h: window.innerHeight
  });
  React.useEffect(() => {
    const r = () => setVp({
      w: window.innerWidth,
      h: window.innerHeight
    });
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);
  const scale = Math.max(0.1, Math.min((vp.w - 200) / width, (vp.h - 260) / height, 2));
  const [ddOpen, setDd] = React.useState(false);
  const Arrow = ({
    dir,
    onClick
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onClick();
    },
    style: {
      position: 'absolute',
      top: '50%',
      [dir]: 28,
      transform: 'translateY(-50%)',
      border: 'none',
      background: 'rgba(255,255,255,.08)',
      color: 'rgba(255,255,255,.9)',
      width: 44,
      height: 44,
      borderRadius: 22,
      fontSize: 18,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background .15s'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.18)',
    onMouseLeave: e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: dir === 'left' ? 'M11 3L5 9l6 6' : 'M7 3l6 6-6 6'
  })));

  // Portal to body so position:fixed is the real viewport regardless of any
  // transform on DesignCanvas's ancestors (including the canvas zoom itself).
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    onClick: () => ctx.setFocus(null),
    onWheel: e => e.preventDefault(),
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(24,20,16,.6)',
      backdropFilter: 'blur(14px)',
      fontFamily: DC.font,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 72,
      display: 'flex',
      alignItems: 'flex-start',
      padding: '16px 20px 0',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setDd(o => !o),
    style: {
      border: 'none',
      background: 'transparent',
      color: '#fff',
      cursor: 'pointer',
      padding: '6px 8px',
      borderRadius: 6,
      textAlign: 'left',
      fontFamily: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: -0.3
    }
  }, meta.title), /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 11 11",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    style: {
      opacity: .7
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 4l3.5 3.5L9 4"
  }))), meta.subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 13,
      opacity: .6,
      fontWeight: 400,
      marginTop: 2
    }
  }, meta.subtitle)), ddOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: 4,
      background: '#2a251f',
      borderRadius: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,.4)',
      padding: 4,
      minWidth: 200,
      zIndex: 10
    }
  }, sectionOrder.map(sid => /*#__PURE__*/React.createElement("button", {
    key: sid,
    onClick: () => {
      setDd(false);
      const f = sectionMeta[sid].slotIds[0];
      if (f) ctx.setFocus(`${sid}/${f}`);
    },
    style: {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      border: 'none',
      cursor: 'pointer',
      background: sid === sectionId ? 'rgba(255,255,255,.1)' : 'transparent',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: 5,
      fontSize: 14,
      fontWeight: sid === sectionId ? 600 : 400,
      fontFamily: 'inherit'
    }
  }, sectionMeta[sid].title)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => ctx.setFocus(null),
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.12)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent',
    style: {
      border: 'none',
      background: 'transparent',
      color: 'rgba(255,255,255,.7)',
      width: 32,
      height: 32,
      borderRadius: 16,
      fontSize: 20,
      cursor: 'pointer',
      lineHeight: 1,
      transition: 'background .12s'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 64,
      bottom: 56,
      left: 100,
      right: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: width * scale,
      height: height * scale,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      background: '#fff',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 20px 80px rgba(0,0,0,.4)'
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb'
    }
  }, aid))), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 14,
      fontWeight: 500,
      opacity: .85,
      textAlign: 'center'
    }
  }, (sec.labels || {})[aid] ?? artboard.props.label, /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .5,
      marginLeft: 10,
      fontVariantNumeric: 'tabular-nums'
    }
  }, idx + 1, " / ", peers.length))), /*#__PURE__*/React.createElement(Arrow, {
    dir: "left",
    onClick: () => go(-1)
  }), /*#__PURE__*/React.createElement(Arrow, {
    dir: "right",
    onClick: () => go(1)
  }), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 8
    }
  }, peers.map((p, i) => /*#__PURE__*/React.createElement("button", {
    key: p,
    onClick: () => ctx.setFocus(`${sectionId}/${p}`),
    style: {
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      width: 6,
      height: 6,
      borderRadius: 3,
      background: i === idx ? '#fff' : 'rgba(255,255,255,.3)'
    }
  })))), document.body);
}

// ─────────────────────────────────────────────────────────────
// Post-it — absolute-positioned sticky note
// ─────────────────────────────────────────────────────────────
function DCPostIt({
  children,
  top,
  left,
  right,
  bottom,
  rotate = -2,
  width = 180
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top,
      left,
      right,
      bottom,
      width,
      background: DC.postitBg,
      padding: '14px 16px',
      fontFamily: '"Comic Sans MS", "Marker Felt", "Segoe Print", cursive',
      fontSize: 14,
      lineHeight: 1.4,
      color: DC.postitText,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      transform: `rotate(${rotate}deg)`,
      zIndex: 5
    }
  }, children);
}
Object.assign(window, {
  DesignCanvas,
  DCSection,
  DCArtboard,
  DCPostIt
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "Welcome Emails/design-canvas.jsx", error: String((e && e.message) || e) }); }

// Welcome Emails/emails.jsx
try { (() => {
/* global React */
// ============================================================
// Brieflee Welcome Emails — 4 design options
// Each email renders inside a faux desktop mail-client chrome
// (Gmail-like) so the user can read them as inbox messages.
// Email body is a fixed 600px column — the email industry standard.
// ============================================================

const NAVY = "#001364";
const NAVY_DARKER = "#000f4d";
const PERI = "#879CF7";
const PERI_LIGHT = "#ECF0FF";
const PERI_FAINT = "#F4F6FF";
const BLUE = "#294ff6";
const BORDER = "#D6DEFC";
const BG_PAGE = "#FAFBFF";
const FG_BODY = "#333333";
const FG_MUTED = "#555555";
const FG_QUIET = "#9aa3b8";

// Outer artboard size (display-only). Each artboard auto-scales to fit
// its DCArtboard host. Total width gives some left/right gutter so the
// email column reads like it's in a real client window.
const ARTBOARD_W = 760;
const ARTBOARD_H = 1100;
const EMAIL_W = 600;

// ─── Email-client chrome ─────────────────────────────────
// A simplified mail-client header that frames every email so they
// look like real inbox messages, not bare HTML files.
function MailClientFrame({
  subject,
  fromName,
  fromEmail,
  preheader,
  time,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: ARTBOARD_W,
      minHeight: ARTBOARD_H,
      background: "#f1f3f6",
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "12px 16px",
      background: "#e9ecf1",
      borderBottom: "1px solid #dde0e6"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 12,
      height: 12,
      borderRadius: "50%",
      background: "#ff5f57"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 12,
      height: 12,
      borderRadius: "50%",
      background: "#febc2e"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 12,
      height: 12,
      borderRadius: "50%",
      background: "#28c840"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 16,
      fontSize: 13,
      fontWeight: 600,
      color: "#5a6072",
      letterSpacing: "-0.005em"
    }
  }, "Inbox \xB7 1 new message")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 32px 16px",
      background: "#fff",
      borderBottom: "1px solid #ebedf2"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: "#1f2330",
      letterSpacing: "-0.015em",
      marginBottom: 12
    }
  }, subject), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: "50%",
      background: PERI,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      fontSize: 14,
      letterSpacing: "0.02em"
    }
  }, "B"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "#1f2330"
    }
  }, fromName, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 400,
      color: "#717687"
    }
  }, "<", fromEmail, ">")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#8a8f9e",
      marginTop: 2
    }
  }, "to you \xB7 ", time)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: "#717687",
      padding: "4px 10px",
      border: "1px solid #e1e3eb",
      borderRadius: 999
    }
  }, "Inbox")), preheader && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      fontSize: 12,
      color: "#8a8f9e",
      fontStyle: "italic"
    }
  }, "Preview: ", preheader)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: "#f1f3f6",
      padding: "32px 0 48px",
      display: "flex",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: EMAIL_W,
      background: "#ffffff",
      boxShadow: "0 1px 2px 0 rgba(0,19,100,0.04)"
    }
  }, children)));
}

// ─── Tiny atoms reused across emails ─────────────────────
function Eyebrow({
  children,
  color = PERI
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color
    }
  }, children);
}
function PrimaryButton({
  children,
  fullWidth = false
}) {
  return /*#__PURE__*/React.createElement("a", {
    style: {
      display: fullWidth ? "block" : "inline-block",
      padding: "16px 28px",
      background: PERI,
      color: "#fff",
      fontSize: 15,
      fontWeight: 700,
      letterSpacing: "-0.005em",
      borderRadius: 10,
      textAlign: "center",
      textDecoration: "none",
      boxShadow: "0 4px 14px -2px rgba(41,79,246,0.25)"
    }
  }, children);
}
function SecondaryLink({
  children
}) {
  return /*#__PURE__*/React.createElement("a", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: BLUE,
      textDecoration: "none"
    }
  }, children, " \u2192");
}
function FooterUnsub() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "28px 40px 32px",
      background: "#fafbff",
      borderTop: `1px solid ${BORDER}`,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/brieflee-wordmark.png",
    alt: "Brieflee",
    style: {
      height: 18,
      opacity: 0.7,
      marginBottom: 14
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: FG_QUIET,
      lineHeight: 1.6
    }
  }, "Brieflee Inc. \xB7 2261 Market St \xB7 San Francisco, CA 94114", /*#__PURE__*/React.createElement("br", null), "You're receiving this because you signed up for a Brieflee trial.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("a", {
    style: {
      color: FG_QUIET,
      textDecoration: "underline"
    }
  }, "Unsubscribe"), " · ", /*#__PURE__*/React.createElement("a", {
    style: {
      color: FG_QUIET,
      textDecoration: "underline"
    }
  }, "Manage preferences"), " · ", /*#__PURE__*/React.createElement("a", {
    style: {
      color: FG_QUIET,
      textDecoration: "underline"
    }
  }, "View in browser")));
}

// ============================================================
// E1 · EDITORIAL ENGRAVING
// Premium magazine feel. Engraving illustration in the hero,
// minimal copy, single CTA. For a brand-led "first impression."
// ============================================================
function E1Editorial() {
  return /*#__PURE__*/React.createElement(MailClientFrame, {
    subject: "Welcome to Brieflee",
    fromName: "Brieflee",
    fromEmail: "hello@brieflee.co",
    time: "9:42 AM",
    preheader: "Your trial is live. Here's how to score your first video in under a minute."
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(180deg, #ECF0FF 0%, #DCE3FF 100%)",
      padding: "28px 40px 24px",
      textAlign: "center",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/brieflee-wordmark.png",
    alt: "Brieflee",
    style: {
      height: 20,
      marginBottom: 20
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 160,
      height: 160,
      margin: "0 auto",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      borderRadius: "50%",
      background: `radial-gradient(circle at 50% 40%, rgba(135,156,247,0.45) 0%, rgba(135,156,247,0) 65%)`
    }
  }), /*#__PURE__*/React.createElement("img", {
    src: "assets/engraving-clapboard.png",
    alt: "",
    style: {
      position: "absolute",
      inset: 0,
      margin: "auto",
      width: 140,
      height: 140,
      objectFit: "contain",
      transform: "rotate(-6deg)",
      filter: "drop-shadow(0 10px 18px rgba(0,19,100,0.18))"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: NAVY,
      opacity: 0.55,
      marginTop: 16
    }
  }, "Spell check for video")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "48px 56px 40px",
      color: NAVY
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    color: BLUE
  }, "A short note from the team"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 38,
      fontWeight: 800,
      letterSpacing: "-0.025em",
      lineHeight: 1.05,
      margin: "16px 0 20px",
      color: NAVY,
      textWrap: "balance"
    }
  }, "Welcome to Brieflee, Sarah."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      lineHeight: 1.65,
      color: FG_BODY,
      margin: "0 0 16px"
    }
  }, "Reviewing creator content shouldn't take afternoons. Brieflee scores every UGC, influencer, and customer video against the brief you set, in seconds \u2014 so you can spend your day on the work that actually needs your eyes on it."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      lineHeight: 1.65,
      color: FG_BODY,
      margin: "0 0 32px"
    }
  }, "Your 14-day trial is live. The fastest way to feel the magic is to run one of your own videos through the system. It takes about a minute."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 32
    }
  }, /*#__PURE__*/React.createElement(PrimaryButton, null, "Score your first video")), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 28,
      borderTop: `1px solid ${BORDER}`,
      fontSize: 14,
      lineHeight: 1.6,
      color: FG_MUTED
    }
  }, "Reply to this email any time. A real person on our team reads every reply. We'd love to hear what you're trying to solve."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      fontSize: 14,
      color: NAVY,
      fontWeight: 600
    }
  }, "\u2014 Anna", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 400,
      color: FG_MUTED
    }
  }, "Co-founder, Brieflee"))), /*#__PURE__*/React.createElement(FooterUnsub, null));
}

// ============================================================
// E2 · FRIENDLY STICKER
// Brighter, warmer feel. Sticker rocket illustration, 3-step
// "Get started" cards. Good for a self-serve audience.
// ============================================================
function E2Sticker() {
  const steps = [{
    n: "01",
    title: "Set your brief",
    body: "Spell out hook timing, length, brand mentions, and 26 other QA checks. Save it as a template you reuse."
  }, {
    n: "02",
    title: "Drop in your videos",
    body: "Bulk upload up to 500 assets at once via CSV or drag-and-drop. We scan in seconds."
  }, {
    n: "03",
    title: "Approve, reject, or revise",
    body: "Send revision notes straight from the score card. Creators get clear feedback, you save hours."
  }];
  return /*#__PURE__*/React.createElement(MailClientFrame, {
    subject: "\uD83C\uDF89 You're in. Let's score your first video",
    fromName: "Anna at Brieflee",
    fromEmail: "anna@brieflee.co",
    time: "9:42 AM",
    preheader: "3 steps and you'll see your first score. No credit card, no setup call."
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(180deg, #ECF0FF 0%, #C9D4FF 100%)",
      padding: "28px 40px 28px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/brieflee-wordmark.png",
    alt: "Brieflee",
    style: {
      height: 20,
      marginBottom: 16
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height: 120,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/rocket.png",
    alt: "",
    style: {
      width: 120,
      height: 120,
      objectFit: "contain",
      transform: "rotate(-8deg)",
      filter: "drop-shadow(0 12px 18px rgba(0,19,100,0.18))"
    }
  }), /*#__PURE__*/React.createElement("img", {
    src: "assets/ai-sparkles.png",
    alt: "",
    style: {
      position: "absolute",
      top: 0,
      right: 130,
      width: 50,
      height: 50,
      transform: "rotate(12deg)"
    }
  })), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 28,
      fontWeight: 800,
      letterSpacing: "-0.02em",
      lineHeight: 1.1,
      margin: "14px 0 6px",
      color: NAVY,
      textWrap: "balance"
    }
  }, "You're in, Sarah."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      lineHeight: 1.5,
      color: NAVY,
      opacity: 0.7,
      margin: "0 auto",
      maxWidth: 420,
      fontWeight: 500
    }
  }, "Your 14-day trial just started. Three quick steps and you'll see your first score.")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "36px 40px 8px"
    }
  }, steps.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      gap: 18,
      padding: "20px 0",
      borderBottom: i < steps.length - 1 ? `1px solid ${BORDER}` : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flexShrink: 0,
      width: 40,
      height: 40,
      borderRadius: 10,
      background: PERI_LIGHT,
      color: NAVY,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 13,
      fontWeight: 800,
      letterSpacing: "0.02em"
    }
  }, s.n), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      color: NAVY,
      marginBottom: 6,
      letterSpacing: "-0.01em"
    }
  }, s.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      lineHeight: 1.55,
      color: FG_BODY
    }
  }, s.body))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "24px 40px 40px",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement(PrimaryButton, {
    fullWidth: true
  }, "Open Brieflee \xA0\u2192"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      fontSize: 13,
      color: FG_MUTED
    }
  }, "Stuck? Hit reply or ", /*#__PURE__*/React.createElement("a", {
    style: {
      color: BLUE,
      fontWeight: 600
    }
  }, "book a 15-min onboarding"), ".")), /*#__PURE__*/React.createElement(FooterUnsub, null));
}

// ============================================================
// E3 · SCORE CARD DEMO
// Leads with a fully-rendered fake score card so the user
// sees the product output the moment they open the email.
// "Here's what you came for." Reads as utility, not marketing.
// ============================================================
function E3ScoreCard() {
  const checks = [{
    label: "Hook timing",
    v: "First 1.8s",
    pass: true
  }, {
    label: "Audio quality",
    v: "92%",
    pass: true
  }, {
    label: "Brand mention",
    v: "3×",
    pass: true
  }, {
    label: "Product visible",
    v: "61% of runtime",
    pass: true
  }, {
    label: "Aspect ratio",
    v: "9:16",
    pass: true
  }, {
    label: "Caption match",
    v: "On-brief",
    pass: true
  }];
  return /*#__PURE__*/React.createElement(MailClientFrame, {
    subject: "Welcome \u2014 here's a sample Brieflee score",
    fromName: "Brieflee",
    fromEmail: "hello@brieflee.co",
    time: "9:42 AM",
    preheader: "A real sample output, plus a link to score one of your own."
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(180deg, #ECF0FF 0%, #ECF0FF 100%)",
      padding: "32px 40px 28px",
      borderBottom: `1px solid ${BORDER}`
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/brieflee-wordmark.png",
    alt: "Brieflee",
    style: {
      height: 20,
      marginBottom: 22
    }
  }), /*#__PURE__*/React.createElement(Eyebrow, {
    color: NAVY
  }, "Welcome to your trial"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 30,
      fontWeight: 800,
      letterSpacing: "-0.02em",
      lineHeight: 1.1,
      margin: "10px 0 8px",
      color: NAVY,
      textWrap: "balance"
    }
  }, "This is what every video", /*#__PURE__*/React.createElement("br", null), "will look like in Brieflee."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      lineHeight: 1.55,
      color: NAVY,
      opacity: 0.7,
      margin: 0,
      fontWeight: 500
    }
  }, "Below is a real score on a sample submission. Yours arrives in about 4 seconds per video.")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "28px 32px 8px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      border: `1px solid ${BORDER}`,
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 4px 14px -2px rgba(41,79,246,0.06)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      padding: 16,
      borderBottom: `1px solid ${PERI_FAINT}`,
      background: PERI_FAINT
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 60,
      height: 80,
      borderRadius: 8,
      background: `linear-gradient(135deg, ${PERI} 0%, ${BLUE} 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "#fff"
  }, /*#__PURE__*/React.createElement("polygon", {
    points: "6 4 20 12 6 20 6 4"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: NAVY,
      opacity: 0.6,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      marginBottom: 4
    }
  }, "Sample \xB7 gymshark-q3-027.mp4"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: NAVY,
      letterSpacing: "-0.01em",
      marginBottom: 8
    }
  }, "Reviewed in 4.2 seconds"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "#166534",
      background: "#dcfce7",
      padding: "4px 10px",
      borderRadius: 999
    }
  }, "PASS \xB7 94 / 100"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: FG_MUTED,
      fontWeight: 500
    }
  }, "6 of 6 checks")))), /*#__PURE__*/React.createElement("div", null, checks.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 16px",
      borderBottom: i < checks.length - 1 ? `1px solid ${PERI_FAINT}` : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 22,
      height: 22,
      borderRadius: "50%",
      background: PERI,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: NAVY,
      flex: 1
    }
  }, c.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: FG_MUTED,
      fontWeight: 500
    }
  }, c.v)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "24px 32px 40px"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      lineHeight: 1.6,
      color: FG_BODY,
      margin: "0 0 20px"
    }
  }, "Ready to run your own? Upload one video, point Brieflee at your brief, and we'll have a score for you faster than your coffee cools off."), /*#__PURE__*/React.createElement(PrimaryButton, {
    fullWidth: true
  }, "Score one of your videos"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      textAlign: "center",
      fontSize: 13,
      color: FG_MUTED
    }
  }, "Want a guided tour first? ", /*#__PURE__*/React.createElement("a", {
    style: {
      color: BLUE,
      fontWeight: 600
    }
  }, "Watch the 90-second demo"), ".")), /*#__PURE__*/React.createElement(FooterUnsub, null));
}

// ============================================================
// E4 · MINIMAL TYPE-FIRST
// No imagery in the body. All-type hero, single CTA, three
// quick links in the footer. Reads like Linear / Stripe email.
// ============================================================
function E4Minimal() {
  return /*#__PURE__*/React.createElement(MailClientFrame, {
    subject: "Welcome to Brieflee",
    fromName: "Brieflee",
    fromEmail: "hello@brieflee.co",
    time: "9:42 AM",
    preheader: "Your trial is active. One link gets you to your first score."
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "28px 48px 0",
      borderBottom: `1px solid ${BORDER}`
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/brieflee-wordmark.png",
    alt: "Brieflee",
    style: {
      height: 22,
      marginBottom: 24
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "48px 48px 40px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: PERI,
      marginBottom: 18
    }
  }, "Trial \xB7 14 days \xB7 Active"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 48,
      fontWeight: 800,
      letterSpacing: "-0.03em",
      lineHeight: 1,
      margin: "0 0 24px",
      color: NAVY,
      textWrap: "balance"
    }
  }, "Spell check", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: PERI
    }
  }, "for video.")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 17,
      lineHeight: 1.6,
      color: FG_BODY,
      margin: "0 0 16px",
      maxWidth: 460
    }
  }, "Hi Sarah, welcome to Brieflee. You've got 14 days to run as many videos through the system as you'd like."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 17,
      lineHeight: 1.6,
      color: FG_BODY,
      margin: "0 0 36px",
      maxWidth: 460
    }
  }, "The single most useful thing you can do today: upload one video and watch it get scored. Everything else clicks into place after that."), /*#__PURE__*/React.createElement(PrimaryButton, null, "Open Brieflee")), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: `1px solid ${BORDER}`,
      padding: "32px 48px",
      background: BG_PAGE
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: NAVY,
      opacity: 0.55,
      marginBottom: 16
    }
  }, "While you're here"), [{
    t: "Set up your first brief",
    d: "26-point QA checklist · ~3 minutes"
  }, {
    t: "Bulk import videos from a CSV",
    d: "Up to 500 assets at once"
  }, {
    t: "Invite your team",
    d: "Free seats during trial"
  }].map((l, i) => /*#__PURE__*/React.createElement("a", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      padding: "14px 0",
      borderBottom: i < 2 ? `1px solid ${BORDER}` : "none",
      textDecoration: "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: NAVY,
      marginBottom: 2
    }
  }, l.t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: FG_MUTED
    }
  }, l.d)), /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: BLUE,
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "9 18 15 12 9 6"
  }))))), /*#__PURE__*/React.createElement(FooterUnsub, null));
}

// ============================================================
// Each variant gets wrapped in a fixed-size 1080×wide artboard
// that auto-scales to fill its DCArtboard.
// ============================================================
function ArtboardScaler({
  children
}) {
  const outerRef = React.useRef(null);
  const innerRef = React.useRef(null);
  React.useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const apply = () => {
      const w = outer.clientWidth;
      const h = outer.clientHeight;
      if (!w || !h) return;
      const s = Math.min(w / ARTBOARD_W, h / ARTBOARD_H);
      inner.style.transform = `scale(${s})`;
      // Center horizontally if scaled-down width is less than outer width
      const scaledW = ARTBOARD_W * s;
      const scaledH = ARTBOARD_H * s;
      inner.style.left = `${(w - scaledW) / 2}px`;
      inner.style.top = `${(h - scaledH) / 2}px`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(outer);
    return () => ro.disconnect();
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    ref: outerRef,
    style: {
      width: "100%",
      height: "100%",
      position: "relative",
      overflow: "hidden",
      background: "#e6e9ef"
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: innerRef,
    style: {
      width: ARTBOARD_W,
      height: ARTBOARD_H,
      position: "absolute",
      top: 0,
      left: 0,
      transformOrigin: "top left"
    }
  }, children));
}
function E1() {
  return /*#__PURE__*/React.createElement(ArtboardScaler, null, /*#__PURE__*/React.createElement(E1Editorial, null));
}
function E2() {
  return /*#__PURE__*/React.createElement(ArtboardScaler, null, /*#__PURE__*/React.createElement(E2Sticker, null));
}
function E3() {
  return /*#__PURE__*/React.createElement(ArtboardScaler, null, /*#__PURE__*/React.createElement(E3ScoreCard, null));
}
function E4() {
  return /*#__PURE__*/React.createElement(ArtboardScaler, null, /*#__PURE__*/React.createElement(E4Minimal, null));
}
Object.assign(window, {
  E1,
  E2,
  E3,
  E4
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "Welcome Emails/emails.jsx", error: String((e && e.message) || e) }); }

// app.jsx
try { (() => {
// ============================================================
// Brieflee Home v2 — app shell + Tweaks
// ============================================================
const {
  useState,
  useEffect
} = React;
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "accent": "periwinkle",
  "headline": "default",
  "heroVariant": "tiles",
  "density": "comfy",
  "engravings": true,
  "stat1": "turnaround",
  "stat2": "auto"
} /*EDITMODE-END*/;
const ACCENT_PALETTES = {
  periwinkle: {
    name: "Periwinkle",
    accent: "#6B5FDC",
    soft: "#DCD5FF",
    tint: "#ECE8FF",
    swatch: "#6B5FDC",
    peri700: "#534AC0"
  },
  iris: {
    name: "Iris",
    accent: "#8B5CF6",
    soft: "#E0D4FE",
    tint: "#F0E9FF",
    swatch: "#8B5CF6",
    peri700: "#6D3CD9"
  },
  cobalt: {
    name: "Cobalt",
    accent: "#3B5BDB",
    soft: "#CFD8F8",
    tint: "#E2E8FB",
    swatch: "#3B5BDB",
    peri700: "#2A45B5"
  },
  coral: {
    name: "Coral",
    accent: "#E0654B",
    soft: "#FAD0C5",
    tint: "#FDE7DF",
    swatch: "#E0654B",
    peri700: "#B84A33"
  },
  forest: {
    name: "Forest",
    accent: "#3D8A6B",
    soft: "#BDE2D0",
    tint: "#DEF1E7",
    swatch: "#3D8A6B",
    peri700: "#2C6E54"
  }
};
const THEMES = {
  light: {
    bg: "#F4F2FE",
    cream: "#F8F6FF",
    paper: "#FFFFFF",
    ink900: "#0B1240"
  },
  dark: {
    bg: "#0A0F2E",
    cream: "#FFFFFF",
    paper: "#161C45",
    ink900: "#FFFFFF"
  },
  hybrid: {
    bg: "#F4F2FE",
    cream: "#F8F6FF",
    paper: "#FFFFFF",
    ink900: "#0B1240"
  } // dark accents on stat callouts only
};
const DENSITY = {
  compact: {
    sectionPad: 80,
    modulePad: 40
  },
  comfy: {
    sectionPad: 120,
    modulePad: 60
  },
  spacious: {
    sectionPad: 160,
    modulePad: 88
  }
};
function applyTokens(t) {
  const root = document.documentElement;
  const pal = ACCENT_PALETTES[t.accent] || ACCENT_PALETTES.periwinkle;
  root.style.setProperty("--accent", pal.accent);
  root.style.setProperty("--accent-soft", pal.soft);
  root.style.setProperty("--accent-tint", pal.tint);
  root.style.setProperty("--peri-100", pal.tint);
  root.style.setProperty("--peri-200", pal.soft);
  root.style.setProperty("--peri-300", pal.soft);
  root.style.setProperty("--peri-500", pal.accent);
  root.style.setProperty("--peri-600", pal.accent);
  root.style.setProperty("--peri-700", pal.peri700);
  const theme = THEMES[t.theme] || THEMES.light;
  if (t.theme === "dark") {
    root.style.setProperty("--bg", "#0A0F2E");
    root.style.setProperty("--paper", "#161C45");
    root.style.setProperty("--cream", "#F4F2FE");
    root.style.setProperty("--ink-900", "#FFFFFF");
    root.style.setProperty("--ink-800", "#F0F1FA");
    root.style.setProperty("--ink-700", "#D8DCEE");
    root.style.setProperty("--ink-600", "#B2B8DA");
    root.style.setProperty("--ink-500", "#9298C2");
    root.style.setProperty("--ink-400", "#6B73A1");
    root.style.setProperty("--ink-300", "#535B89");
    root.style.setProperty("--ink-200", "#2D346B");
    root.style.setProperty("--ink-100", "#222957");
  } else {
    root.style.setProperty("--bg", theme.bg);
    root.style.setProperty("--paper", theme.paper);
    root.style.setProperty("--cream", theme.cream);
    root.style.setProperty("--ink-900", "#0B1240");
    root.style.setProperty("--ink-800", "#141B58");
    root.style.setProperty("--ink-700", "#1F2670");
    root.style.setProperty("--ink-600", "#2E3580");
    root.style.setProperty("--ink-500", "#4A5198");
    root.style.setProperty("--ink-400", "#6970B3");
    root.style.setProperty("--ink-300", "#9097CC");
    root.style.setProperty("--ink-200", "#C6CAE3");
    root.style.setProperty("--ink-100", "#E4E7F4");
  }
  const d = DENSITY[t.density] || DENSITY.comfy;
  document.body.style.setProperty("--section-pad", d.sectionPad + "px");
  document.body.style.setProperty("--module-pad", d.modulePad + "px");
}
function App() {
  const tw = window.useTweaks ? window.useTweaks(TWEAK_DEFAULTS) : null;
  const t = tw ? tw[0] : TWEAK_DEFAULTS;
  const setTweak = tw ? tw[1] : () => {};
  const [navOpen, setNavOpen] = useState(null);
  useEffect(() => {
    applyTokens(t);
  }, [t.accent, t.theme, t.density]);
  useEffect(() => {
    applyTokens(t);
  }, []); // initial

  // For "hybrid" theme, second stat callout uses light variant
  const stat2Light = t.theme === "hybrid";
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(window.Nav, {
    navOpen: navOpen,
    setNavOpen: setNavOpen
  }), /*#__PURE__*/React.createElement(window.Hero, {
    t: t
  }), /*#__PURE__*/React.createElement(window.Trust, null), /*#__PURE__*/React.createElement(window.Overview, null), /*#__PURE__*/React.createElement(window.Contrast, null), /*#__PURE__*/React.createElement(window.CatBanner, {
    kind: "PLAN"
  }), /*#__PURE__*/React.createElement(window.BriefsModule, null), /*#__PURE__*/React.createElement(window.StoryboardModule, null), /*#__PURE__*/React.createElement(window.SwipeModule, null), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "60px 0"
    }
  }, /*#__PURE__*/React.createElement(window.Stat, {
    copyKey: t.stat1,
    set: window.STAT_COPIES
  })), /*#__PURE__*/React.createElement(window.CatBanner, {
    kind: "REVIEW"
  }), /*#__PURE__*/React.createElement(window.AIReviewModule, null), /*#__PURE__*/React.createElement(window.QAModule, null), /*#__PURE__*/React.createElement(window.RevisionsModule, null), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "60px 0"
    }
  }, /*#__PURE__*/React.createElement(window.Stat, {
    copyKey: t.stat2,
    set: window.STAT_COPIES_2,
    light: stat2Light
  })), /*#__PURE__*/React.createElement(window.Audience, null), /*#__PURE__*/React.createElement(window.Testimonials, null), /*#__PURE__*/React.createElement(window.Pricing, null), /*#__PURE__*/React.createElement(window.FinalCTA, null), /*#__PURE__*/React.createElement(window.Footer, null), window.TweaksPanel && /*#__PURE__*/React.createElement(window.TweaksPanel, {
    title: "Tweaks"
  }, /*#__PURE__*/React.createElement(window.TweakSection, {
    title: "Theme"
  }, /*#__PURE__*/React.createElement(window.TweakRadio, {
    label: "Theme",
    value: t.theme,
    onChange: v => setTweak("theme", v),
    options: [{
      value: "light",
      label: "Light"
    }, {
      value: "dark",
      label: "Dark"
    }, {
      value: "hybrid",
      label: "Hybrid"
    }]
  }), /*#__PURE__*/React.createElement(window.TweakColor, {
    label: "Accent",
    value: t.accent,
    onChange: v => setTweak("accent", v),
    options: Object.entries(ACCENT_PALETTES).map(([k, p]) => ({
      value: k,
      color: p.swatch,
      label: p.name
    }))
  })), /*#__PURE__*/React.createElement(window.TweakSection, {
    title: "Hero"
  }, /*#__PURE__*/React.createElement(window.TweakSelect, {
    label: "Headline",
    value: t.headline,
    onChange: v => setTweak("headline", v),
    options: [{
      value: "default",
      label: "Brief / Review / Approve"
    }, {
      value: "workflow",
      label: "Run UGC like a real workflow"
    }, {
      value: "inOne",
      label: "From brief to approved"
    }, {
      value: "finished",
      label: "Brands & agencies finish on"
    }]
  }), /*#__PURE__*/React.createElement(window.TweakRadio, {
    label: "Visual",
    value: t.heroVariant,
    onChange: v => setTweak("heroVariant", v),
    options: [{
      value: "tiles",
      label: "3 tiles"
    }, {
      value: "dashboard",
      label: "Dashboard"
    }, {
      value: "diagram",
      label: "Diagram"
    }]
  })), /*#__PURE__*/React.createElement(window.TweakSection, {
    title: "Layout"
  }, /*#__PURE__*/React.createElement(window.TweakRadio, {
    label: "Density",
    value: t.density,
    onChange: v => setTweak("density", v),
    options: [{
      value: "compact",
      label: "Compact"
    }, {
      value: "comfy",
      label: "Comfy"
    }, {
      value: "spacious",
      label: "Spacious"
    }]
  }), /*#__PURE__*/React.createElement(window.TweakToggle, {
    label: "Engraving icons",
    value: t.engravings,
    onChange: v => setTweak("engravings", v)
  })), /*#__PURE__*/React.createElement(window.TweakSection, {
    title: "Stat callouts"
  }, /*#__PURE__*/React.createElement(window.TweakSelect, {
    label: "Stat 1 (between PLAN/REVIEW)",
    value: t.stat1,
    onChange: v => setTweak("stat1", v),
    options: [{
      value: "turnaround",
      label: "2× turnaround cut"
    }, {
      value: "replace",
      label: "4 tools, 11 threads replaced"
    }, {
      value: "speed",
      label: "3 days to first submission"
    }]
  }), /*#__PURE__*/React.createElement(window.TweakSelect, {
    label: "Stat 2 (after REVIEW)",
    value: t.stat2,
    onChange: v => setTweak("stat2", v),
    options: [{
      value: "auto",
      label: "80% auto-approved"
    }, {
      value: "catch",
      label: "100% off-brand caught"
    }, {
      value: "volume",
      label: "3× more reviewed"
    }]
  }))), !t.engravings && /*#__PURE__*/React.createElement("style", null, `
          .over-card .glyph, .aud-card .hdr .ico, .mm-icon { display:none; }
        `));
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "app.jsx", error: String((e && e.message) || e) }); }

// icons.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Minimal line icons — sketch-feel, currentColor stroke
const Icon = ({
  d,
  size = 20,
  fill = "none",
  stroke = 2
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: fill,
  stroke: "currentColor",
  strokeWidth: stroke,
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, Array.isArray(d) ? d.map((p, i) => /*#__PURE__*/React.createElement("path", {
  key: i,
  d: p
})) : /*#__PURE__*/React.createElement("path", {
  d: d
}));
const IconBrief = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: ["M7 3h8l4 4v14H7z", "M14 3v4h4", "M10 11h8M10 15h8M10 19h5"]
}));
const IconStoryboard = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: ["M3 6h6v6H3zM12 6h9v6h-9zM3 15h9v6H3zM15 15h6v6h-6z"]
}));
const IconSwipe = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: ["M8 4h10a2 2 0 0 1 2 2v10M4 8v10a2 2 0 0 0 2 2h10", "M4 8a2 2 0 0 1 2-2h2"]
}));
const IconReview = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: ["M3 7l9-4 9 4v10l-9 4-9-4z", "M3 7l9 4 9-4M12 11v10"]
}));
const IconQA = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: ["M9 12l2 2 4-4", "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"]
}));
const IconRev = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: ["M21 12a9 9 0 1 1-3-6.7", "M21 4v5h-5"]
}));
const IconCheck = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: "M5 12l5 5L20 7"
}));
const IconArrow = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: ["M5 12h14", "M13 5l7 7-7 7"]
}));
const IconCaret = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: "M6 9l6 6 6-6"
}));
const IconShop = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: ["M6 7h12l-1 13H7z", "M9 7a3 3 0 0 1 6 0"]
}));
const IconPhone = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: ["M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z", "M10 18h4"]
}));
const IconTeam = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: ["M16 14a4 4 0 1 0-8 0", "M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M20 20a4 4 0 0 0-3-3.87", "M4 20a4 4 0 0 1 3-3.87"]
}));
const IconBolt = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: "M13 3L5 14h6l-1 7 8-11h-6z"
}));
const IconCircle = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: "M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z"
}));
const IconClock = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: ["M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z", "M12 7v5l3 2"]
}));
const IconClose = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: ["M6 6l12 12", "M18 6L6 18"]
}));
const IconFlag = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: ["M5 21V4", "M5 4h12l-2 4 2 4H5"]
}));
const IconLayers = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: ["M12 3l9 5-9 5-9-5z", "M3 13l9 5 9-5", "M3 18l9 5 9-5"]
}));
Object.assign(window, {
  IconBrief,
  IconStoryboard,
  IconSwipe,
  IconReview,
  IconQA,
  IconRev,
  IconCheck,
  IconArrow,
  IconCaret,
  IconShop,
  IconPhone,
  IconTeam,
  IconBolt,
  IconCircle,
  IconClock,
  IconClose,
  IconFlag,
  IconLayers
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "icons.jsx", error: String((e && e.message) || e) }); }

// onboarding/src/App.jsx
try { (() => {
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
  const goToStep = id => {
    setStep(id);
    if (typeof window !== "undefined") window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  const goNext = () => {
    const i = STEPS.findIndex(s => s.id === step);
    if (i < STEPS.length - 1) goToStep(STEPS[i + 1].id);
  };
  const goBack = () => {
    const i = STEPS.findIndex(s => s.id === step);
    if (i > 0) goToStep(STEPS[i - 1].id);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "gs-shell",
    "data-screen-label": `Get Started · ${step}`
  }, /*#__PURE__*/React.createElement("header", {
    className: "gs-topbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "gs-topbar-inner"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    "aria-label": "Brieflee"
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/brieflee-logo.svg",
    alt: "Brieflee",
    className: "gs-logo"
  })), /*#__PURE__*/React.createElement("div", {
    className: "gs-stepper-wrap"
  }, /*#__PURE__*/React.createElement(Stepper, {
    currentId: step
  })), /*#__PURE__*/React.createElement("div", {
    className: "gs-help"
  }, "Need help? ", /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Contact us")))), step === "team" && /*#__PURE__*/React.createElement(TeamStep, {
    teamName: teamName,
    setTeamName: setTeamName,
    teamEmails: teamEmails,
    setTeamEmails: setTeamEmails,
    onNext: goNext,
    onSkip: goNext
  }), step === "personalize" && /*#__PURE__*/React.createElement(PersonalizeStep, {
    workTypeId: workTypeId,
    setWorkTypeId: setWorkTypeId,
    heardAboutUsId: heardAboutUsId,
    setHeardAboutUsId: setHeardAboutUsId,
    onNext: goNext,
    onBack: goBack
  }), step === "pricing" && /*#__PURE__*/React.createElement(PricingStep, {
    billingInterval: billingInterval,
    setBillingInterval: setBillingInterval,
    selectedPlanId: selectedPlanId,
    setSelectedPlanId: setSelectedPlanId,
    onNext: goNext,
    onBack: goBack,
    tweaks: t
  }), step === "checkout" && /*#__PURE__*/React.createElement(CheckoutStep, {
    selectedPlanId: selectedPlanId,
    billingInterval: billingInterval,
    onBack: goBack,
    onComplete: () => alert("Trial started! (demo)"),
    tweaks: t
  }), /*#__PURE__*/React.createElement(TweaksPanel, {
    title: "Onboarding Tweaks"
  }, /*#__PURE__*/React.createElement(TweakSection, {
    label: "Jump to step"
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Step",
    value: step,
    options: ["team", "personalize", "pricing", "checkout"],
    onChange: v => goToStep(v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Brand"
  }), /*#__PURE__*/React.createElement(TweakColor, {
    label: "Accent",
    value: t.accentHex,
    onChange: v => setTweak("accentHex", v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Pricing"
  }), /*#__PURE__*/React.createElement(TweakText, {
    label: "Headline",
    value: t.headline,
    onChange: v => setTweak("headline", v)
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Popular plan",
    value: t.popularPlan,
    options: ["creator", "crew", "studio"],
    onChange: v => setTweak("popularPlan", v)
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Default billing",
    value: t.billingDefault,
    options: ["Monthly", "Yearly"],
    onChange: v => {
      setTweak("billingDefault", v);
      setBillingInterval(v);
    }
  }), /*#__PURE__*/React.createElement(TweakSlider, {
    label: "Trial length",
    value: t.trialDays,
    min: 3,
    max: 30,
    unit: " days",
    onChange: v => setTweak("trialDays", v)
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Show trust strip",
    value: t.showTrustStrip,
    onChange: v => setTweak("showTrustStrip", v)
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Show logo strip",
    value: t.showLogoStrip,
    onChange: v => setTweak("showLogoStrip", v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Checkout"
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Show testimonial",
    value: t.showTestimonial,
    onChange: v => setTweak("showTestimonial", v)
  }), /*#__PURE__*/React.createElement(TweakText, {
    label: "Pay button",
    value: t.ctaCopy,
    onChange: v => setTweak("ctaCopy", v)
  })));
}
const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "onboarding/src/App.jsx", error: String((e && e.message) || e) }); }

// onboarding/src/CheckoutStep.jsx
try { (() => {
function CheckoutStep({
  selectedPlanId,
  billingInterval,
  onBack,
  onComplete,
  tweaks = {}
}) {
  const {
    PLANS,
    FEATURES,
    yearlySavingsPct
  } = window.Brieflee;
  const trialDays = tweaks.trialDays || 7;
  const ctaCopy = tweaks.ctaCopy || `Pay $0 and start your ${trialDays}-day trial`;
  const plan = PLANS.find(p => p.id === selectedPlanId);
  if (!plan) {
    return /*#__PURE__*/React.createElement("div", {
      className: "gs-page text-center"
    }, /*#__PURE__*/React.createElement("p", {
      className: "gs-sub"
    }, "Pick a plan first."), /*#__PURE__*/React.createElement("button", {
      className: "bl-btn bl-btn-secondary mt-6",
      onClick: onBack
    }, /*#__PURE__*/React.createElement(Icons.ArrowLeft, {
      size: 14
    }), " Back to plans"));
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
  const formatCard = v => v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
  const formatExp = v => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + " / " + d.slice(2) : d;
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "gs-page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center mb-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "trial-banner"
  }, /*#__PURE__*/React.createElement("span", {
    className: "trial-dot"
  }), "You won't be charged today \xB7 Trial starts now"), /*#__PURE__*/React.createElement("h1", {
    className: "gs-headline"
  }, "Activate your 7-day free trial"), /*#__PURE__*/React.createElement("p", {
    className: "gs-sub"
  }, "Add a payment method so we can keep you in Brieflee after your trial. Cancel any time, in one click.")), /*#__PURE__*/React.createElement("div", {
    className: "checkout-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stack gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bl-card summary-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row-between mb-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "plan-tier"
  }, plan.tier, " plan"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--bl-font-display)",
      fontSize: 22,
      fontWeight: 700,
      color: "var(--bl-fg)",
      letterSpacing: "-0.01em"
    }
  }, "Brieflee ", plan.tier, " \xB7 ", billingInterval)), /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    className: "bl-btn bl-btn-secondary",
    style: {
      padding: "8px 12px",
      fontSize: 13
    }
  }, "Change")), /*#__PURE__*/React.createElement("ul", {
    className: "plan-feature-list",
    style: {
      marginBottom: 0
    }
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", {
    className: "plan-check"
  }, /*#__PURE__*/React.createElement(Icons.Check, {
    size: 11,
    strokeWidth: 3
  })), " ", /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, plan.maxVideos), " videos / month")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", {
    className: "plan-check"
  }, /*#__PURE__*/React.createElement(Icons.Check, {
    size: 11,
    strokeWidth: 3
  })), " ", /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, plan.maxUsers), " ", plan.maxUsers === 1 ? "seat" : "seats", " included")), FEATURES.slice(0, 3).map(f => /*#__PURE__*/React.createElement("li", {
    key: f.key
  }, /*#__PURE__*/React.createElement("span", {
    className: "plan-check"
  }, /*#__PURE__*/React.createElement(Icons.Check, {
    size: 11,
    strokeWidth: 3
  })), /*#__PURE__*/React.createElement("span", null, f.label)))), /*#__PURE__*/React.createElement("div", {
    className: "summary-divider"
  }), /*#__PURE__*/React.createElement("div", {
    className: "stack gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "price-row"
  }, /*#__PURE__*/React.createElement("span", null, billingInterval, " subscription"), /*#__PURE__*/React.createElement("span", null, "$", price.toLocaleString())), /*#__PURE__*/React.createElement("div", {
    className: "price-row"
  }, /*#__PURE__*/React.createElement("span", null, "7-day trial discount"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--bl-success-fg)",
      fontWeight: 600
    }
  }, "\u2212$", price.toLocaleString())), savedDollars > 0 && /*#__PURE__*/React.createElement("div", {
    className: "price-row",
    style: {
      color: "var(--bl-success-fg)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "Annual savings"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600
    }
  }, "\u2212$", savedDollars.toLocaleString(), " (", savings, "% off)")), /*#__PURE__*/React.createElement("div", {
    className: "price-row total"
  }, /*#__PURE__*/React.createElement("span", null, "Due today"), /*#__PURE__*/React.createElement("span", null, "$0.00")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--bl-fg-muted)",
      marginTop: 4
    }
  }, "On ", new Date(Date.now() + 7 * 86400000).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }), " you'll be charged $", price.toLocaleString(), isYearly ? " for the year" : " for the month", ". Cancel any time before then."))), /*#__PURE__*/React.createElement("div", {
    className: "bl-card",
    style: {
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "stack gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row gap-3",
    style: {
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/eyes-blue.png",
    alt: "",
    style: {
      width: 32,
      height: 32,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      lineHeight: 1.4
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "var(--bl-fg)"
    }
  }, "15-day money-back guarantee"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--bl-fg-muted)"
    }
  }, "Full refund within 15 days, no questions asked."))), /*#__PURE__*/React.createElement("div", {
    className: "row gap-3",
    style: {
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/rocket.png",
    alt: "",
    style: {
      width: 32,
      height: 32,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      lineHeight: 1.4
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "var(--bl-fg)"
    }
  }, "Cancel any time"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--bl-fg-muted)"
    }
  }, "One click in settings. No emails, no friction."))), /*#__PURE__*/React.createElement("div", {
    className: "row gap-3",
    style: {
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/icon-sparkles.png",
    alt: "",
    style: {
      width: 32,
      height: 32,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      lineHeight: 1.4
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "var(--bl-fg)"
    }
  }, "Secure checkout"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--bl-fg-muted)"
    }
  }, "Powered by Stripe. We never see your card."))))), tweaks.showTestimonial !== false && /*#__PURE__*/React.createElement("div", {
    className: "testimonial"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row gap-2 mb-3",
    style: {
      color: "#f5b301"
    }
  }, [1, 2, 3, 4, 5].map(i => /*#__PURE__*/React.createElement(Icons.Star, {
    key: i,
    size: 14,
    fill: "currentColor"
  }))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14,
      lineHeight: 1.5,
      color: "var(--bl-fg)"
    }
  }, "\"Brieflee cut our UGC review queue from a full afternoon to 12 minutes. The 26-item QA score is the part our brand managers won't shut up about.\""), /*#__PURE__*/React.createElement("div", {
    className: "row gap-3 mt-4"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 999,
      background: "var(--bl-periwinkle)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--bl-blue)",
      fontWeight: 700,
      fontSize: 14
    }
  }, "MR"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: "var(--bl-fg)"
    }
  }, "Maya Reyes"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--bl-fg-muted)"
    }
  }, "Head of Creator Ops \xB7 Hello Bello"))))), /*#__PURE__*/React.createElement("div", {
    className: "bl-card",
    style: {
      padding: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row-between mb-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row gap-2"
  }, /*#__PURE__*/React.createElement(Icons.CreditCard, {
    size: 16
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: "var(--bl-fg)"
    }
  }, "Payment details")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--bl-fg-muted)",
      display: "inline-flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icons.Lock, {
    size: 12
  }), " Encrypted by Stripe")), /*#__PURE__*/React.createElement("div", {
    className: "form-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "full"
  }, /*#__PURE__*/React.createElement("label", {
    className: "field-label"
  }, "Cardholder name"), /*#__PURE__*/React.createElement("input", {
    className: "bl-input",
    placeholder: "Full name on card",
    value: name,
    onChange: e => setName(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "full"
  }, /*#__PURE__*/React.createElement("label", {
    className: "field-label"
  }, "Card number"), /*#__PURE__*/React.createElement("input", {
    className: "bl-input",
    placeholder: "1234 1234 1234 1234",
    value: card,
    onChange: e => setCard(formatCard(e.target.value)),
    inputMode: "numeric"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "field-label"
  }, "Expiry"), /*#__PURE__*/React.createElement("input", {
    className: "bl-input",
    placeholder: "MM / YY",
    value: exp,
    onChange: e => setExp(formatExp(e.target.value)),
    inputMode: "numeric"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "field-label"
  }, "CVC"), /*#__PURE__*/React.createElement("input", {
    className: "bl-input",
    placeholder: "123",
    value: cvc,
    onChange: e => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4)),
    inputMode: "numeric"
  })), /*#__PURE__*/React.createElement("div", {
    className: "full"
  }, /*#__PURE__*/React.createElement("label", {
    className: "field-label"
  }, "Billing country"), /*#__PURE__*/React.createElement("select", {
    className: "bl-input",
    value: country,
    onChange: e => setCountry(e.target.value)
  }, /*#__PURE__*/React.createElement("option", null, "United States"), /*#__PURE__*/React.createElement("option", null, "Canada"), /*#__PURE__*/React.createElement("option", null, "United Kingdom"), /*#__PURE__*/React.createElement("option", null, "Australia"), /*#__PURE__*/React.createElement("option", null, "Germany"), /*#__PURE__*/React.createElement("option", null, "France"))), /*#__PURE__*/React.createElement("div", {
    className: "full"
  }, /*#__PURE__*/React.createElement("label", {
    className: "field-label"
  }, "Coupon code ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--bl-fg-quiet)",
      fontWeight: 500
    }
  }, "\xB7 optional")), /*#__PURE__*/React.createElement("div", {
    className: "row gap-2"
  }, /*#__PURE__*/React.createElement("input", {
    className: "bl-input",
    placeholder: "Add coupon",
    value: coupon,
    onChange: e => setCoupon(e.target.value.toUpperCase())
  }), /*#__PURE__*/React.createElement("button", {
    className: "bl-btn bl-btn-secondary",
    style: {
      padding: "10px 16px"
    }
  }, "Apply")))), /*#__PURE__*/React.createElement("button", {
    className: "bl-btn bl-btn-primary pulse mt-6",
    style: {
      width: "100%",
      padding: "16px 24px"
    },
    onClick: onComplete
  }, ctaCopy, " ", /*#__PURE__*/React.createElement(Icons.ArrowRight, {
    size: 14
  })), /*#__PURE__*/React.createElement("p", {
    className: "text-center mt-4",
    style: {
      fontSize: 12,
      color: "var(--bl-fg-muted)",
      lineHeight: 1.55
    }
  }, "By starting your trial you agree to Brieflee's ", /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Terms"), " and ", /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Privacy"), ". You won't be charged during the ", trialDays, "-day trial. End your subscription at any time with one click."))), /*#__PURE__*/React.createElement("div", {
    className: "text-center mt-10"
  }, /*#__PURE__*/React.createElement("button", {
    className: "bl-btn bl-btn-ghost",
    onClick: onBack
  }, /*#__PURE__*/React.createElement(Icons.ArrowLeft, {
    size: 14
  }), " Choose a different plan")));
}
window.CheckoutStep = CheckoutStep;
})(); } catch (e) { __ds_ns.__errors.push({ path: "onboarding/src/CheckoutStep.jsx", error: String((e && e.message) || e) }); }

// onboarding/src/PersonalizeStep.jsx
try { (() => {
function PersonalizeStep({
  workTypeId,
  setWorkTypeId,
  heardAboutUsId,
  setHeardAboutUsId,
  onNext,
  onBack
}) {
  const {
    WORK_TYPE_OPTIONS,
    HEARD_FROM_OPTIONS
  } = window.Brieflee;
  const canNext = Boolean(workTypeId && heardAboutUsId);
  return /*#__PURE__*/React.createElement("div", {
    className: "gs-page gs-page-medium"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center mb-6"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gs-eyebrow"
  }, "Step 2 of 4 \xB7 Personalize"), /*#__PURE__*/React.createElement("h1", {
    className: "gs-headline"
  }, "Tell us about your work"), /*#__PURE__*/React.createElement("p", {
    className: "gs-sub"
  }, "We'll tune Brieflee's review thresholds, brief templates and onboarding examples to fit how you work.")), /*#__PURE__*/React.createElement("div", {
    className: "personalize-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "personalize-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row gap-3 mb-4",
    style: {
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/looking-eyes.png",
    alt: "",
    style: {
      width: 40,
      height: 40,
      marginTop: -4,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: "var(--bl-fg)"
    }
  }, "Your work"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--bl-fg-muted)"
    }
  }, "What best describes you?"))), /*#__PURE__*/React.createElement("div", {
    className: "row gap-2",
    style: {
      flexWrap: "wrap"
    }
  }, WORK_TYPE_OPTIONS.map(opt => {
    const sel = workTypeId === opt.id;
    return /*#__PURE__*/React.createElement("button", {
      key: opt.id,
      className: "opt-chip" + (sel ? " selected" : ""),
      onClick: () => setWorkTypeId(opt.id)
    }, sel && /*#__PURE__*/React.createElement(Icons.Check, {
      size: 12,
      strokeWidth: 3
    }), opt.label);
  }))), /*#__PURE__*/React.createElement("div", {
    className: "personalize-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row gap-3 mb-4",
    style: {
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/eyes-blue.png",
    alt: "",
    style: {
      width: 40,
      height: 40,
      marginTop: -4,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: "var(--bl-fg)",
      lineHeight: 1.3
    }
  }, "How did you find us?"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--bl-fg-muted)"
    }
  }, "Helps us know what's working."))), /*#__PURE__*/React.createElement("div", {
    className: "row gap-2",
    style: {
      flexWrap: "wrap"
    }
  }, HEARD_FROM_OPTIONS.map(opt => {
    const sel = heardAboutUsId === opt.id;
    return /*#__PURE__*/React.createElement("button", {
      key: opt.id,
      className: "opt-chip" + (sel ? " selected" : ""),
      onClick: () => setHeardAboutUsId(opt.id)
    }, sel && /*#__PURE__*/React.createElement(Icons.Check, {
      size: 12,
      strokeWidth: 3
    }), opt.label);
  })))), /*#__PURE__*/React.createElement("div", {
    className: "nav-row"
  }, /*#__PURE__*/React.createElement("button", {
    className: "bl-btn bl-btn-ghost",
    onClick: onBack
  }, /*#__PURE__*/React.createElement(Icons.ArrowLeft, {
    size: 14
  }), " Back"), /*#__PURE__*/React.createElement("button", {
    className: "bl-btn bl-btn-primary" + (canNext ? " pulse" : ""),
    onClick: onNext,
    disabled: !canNext
  }, "Continue ", /*#__PURE__*/React.createElement(Icons.ArrowRight, {
    size: 14
  }))));
}
window.PersonalizeStep = PersonalizeStep;
})(); } catch (e) { __ds_ns.__errors.push({ path: "onboarding/src/PersonalizeStep.jsx", error: String((e && e.message) || e) }); }

// onboarding/src/PricingStep.jsx
try { (() => {
function PricingStep({
  billingInterval,
  setBillingInterval,
  selectedPlanId,
  setSelectedPlanId,
  onNext,
  onBack,
  tweaks = {}
}) {
  const {
    PLANS: BASE_PLANS,
    FEATURES,
    MAX_YEARLY_SAVINGS,
    yearlySavingsPct,
    TRIAL_FEATURES,
    SOCIAL_LOGOS
  } = window.Brieflee;
  const trialDays = tweaks.trialDays || 7;
  const popularId = tweaks.popularPlan || "crew";
  const PLANS = BASE_PLANS.map(p => ({
    ...p,
    popular: p.id === popularId
  }));
  const canNext = Boolean(selectedPlanId);
  const selectedPlan = PLANS.find(p => p.id === selectedPlanId);
  return /*#__PURE__*/React.createElement("div", {
    className: "gs-page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center mb-6"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-block"
    },
    className: "trial-banner"
  }, /*#__PURE__*/React.createElement("span", {
    className: "trial-dot"
  }), trialDays, " days free \xB7 No charge until your trial ends"), /*#__PURE__*/React.createElement("h1", {
    className: "gs-headline"
  }, tweaks.headline || "Pick the plan that fits your team"), /*#__PURE__*/React.createElement("p", {
    className: "gs-sub"
  }, "All plans include the full Brieflee toolkit. Cancel any time during your trial with one click."), /*#__PURE__*/React.createElement("div", {
    className: "mt-6"
  }, /*#__PURE__*/React.createElement(IntervalToggle, {
    value: billingInterval,
    onChange: setBillingInterval,
    maxSavings: MAX_YEARLY_SAVINGS
  }))), /*#__PURE__*/React.createElement("div", {
    className: "plan-grid mt-8"
  }, PLANS.map(p => {
    const selected = selectedPlanId === p.id;
    const isYearly = billingInterval === "Yearly";
    const monthlyEquivalent = isYearly ? Math.round(p.yearly / 12) : p.monthly;
    const billNote = isYearly ? `Billed $${p.yearly.toLocaleString()} per year` : "Billed monthly";
    const savings = isYearly ? yearlySavingsPct(p) : 0;
    const cls = "plan-card" + (p.popular ? " popular" : "") + (selected ? " selected" : "");
    return /*#__PURE__*/React.createElement("div", {
      key: p.id,
      className: cls,
      onClick: () => setSelectedPlanId(p.id)
    }, p.popular && /*#__PURE__*/React.createElement("div", {
      className: "plan-popular-tag"
    }, "Most popular"), /*#__PURE__*/React.createElement("div", {
      className: "plan-tier"
    }, p.tier), /*#__PURE__*/React.createElement("div", {
      className: "plan-name"
    }, "For ", p.tier === "Creator" ? "solos" : p.tier === "Crew" ? "growing teams" : "agencies"), /*#__PURE__*/React.createElement("div", {
      className: "plan-desc"
    }, p.desc), /*#__PURE__*/React.createElement("div", {
      className: "plan-price-row"
    }, /*#__PURE__*/React.createElement("span", {
      className: "plan-price"
    }, "$", monthlyEquivalent), /*#__PURE__*/React.createElement("span", {
      className: "plan-price-suffix"
    }, "/mo")), /*#__PURE__*/React.createElement("div", {
      className: "plan-bill-note"
    }, billNote), savings > 0 ? /*#__PURE__*/React.createElement("span", {
      className: "plan-savings"
    }, /*#__PURE__*/React.createElement(Icons.Zap, {
      size: 11
    }), " Save ", savings, "% vs monthly") : /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-block",
        height: 22
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "plan-divider"
    }), /*#__PURE__*/React.createElement("ul", {
      className: "plan-feature-list"
    }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", {
      className: "plan-check"
    }, /*#__PURE__*/React.createElement(Icons.Check, {
      size: 11,
      strokeWidth: 3
    })), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, p.maxVideos), " videos reviewed / mo")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", {
      className: "plan-check"
    }, /*#__PURE__*/React.createElement(Icons.Check, {
      size: 11,
      strokeWidth: 3
    })), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, p.maxUsers), " ", p.maxUsers === 1 ? "seat" : "seats", ", ", /*#__PURE__*/React.createElement("strong", null, p.maxWorkspaces), " ", p.maxWorkspaces === 1 ? "workspace" : "workspaces")), FEATURES.map(f => /*#__PURE__*/React.createElement("li", {
      key: f.key
    }, /*#__PURE__*/React.createElement("span", {
      className: "plan-check"
    }, /*#__PURE__*/React.createElement(Icons.Check, {
      size: 11,
      strokeWidth: 3
    })), /*#__PURE__*/React.createElement("span", null, f.label))), p.extras.map(x => /*#__PURE__*/React.createElement("li", {
      key: x
    }, /*#__PURE__*/React.createElement("span", {
      className: "plan-check",
      style: {
        background: "var(--bl-periwinkle)",
        color: "var(--bl-blue)"
      }
    }, /*#__PURE__*/React.createElement(Icons.Sparkles, {
      size: 11
    })), /*#__PURE__*/React.createElement("span", null, x)))), /*#__PURE__*/React.createElement("div", {
      className: "plan-cta"
    }, selected ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Icons.Check, {
      size: 14,
      strokeWidth: 3
    }), " \xA0Selected") : `Start ${trialDays}-day free trial`));
  })), tweaks.showTrustStrip !== false && /*#__PURE__*/React.createElement("div", {
    className: "trust-strip"
  }, TRIAL_FEATURES.map(t => /*#__PURE__*/React.createElement("div", {
    className: "trust-item",
    key: t.title
  }, /*#__PURE__*/React.createElement("img", {
    src: t.sticker,
    alt: "",
    style: {
      width: 32,
      height: 32,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "trust-text"
  }, /*#__PURE__*/React.createElement("strong", null, t.title), t.body)))), tweaks.showLogoStrip !== false && /*#__PURE__*/React.createElement("div", {
    className: "text-center mt-10"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--bl-fg-muted)",
      fontWeight: 700
    }
  }, "Trusted by 10,000+ growth teams and agencies"), /*#__PURE__*/React.createElement("div", {
    className: "logo-strip"
  }, SOCIAL_LOGOS.map(l => /*#__PURE__*/React.createElement("span", {
    key: l
  }, l)))), /*#__PURE__*/React.createElement("div", {
    className: "sticky-cta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row gap-3"
  }, /*#__PURE__*/React.createElement("button", {
    className: "bl-btn bl-btn-ghost",
    onClick: onBack
  }, /*#__PURE__*/React.createElement(Icons.ArrowLeft, {
    size: 14
  }), " Back"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--bl-fg-muted)"
    }
  }, selectedPlan ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "var(--bl-fg)"
    }
  }, selectedPlan.tier), " \xB7 $", billingInterval === "Yearly" ? Math.round(selectedPlan.yearly / 12) : selectedPlan.monthly, "/mo \xB7 ", trialDays, " days free") : /*#__PURE__*/React.createElement(React.Fragment, null, "Pick a plan to continue \xB7 You won't be charged today"))), /*#__PURE__*/React.createElement("button", {
    className: "bl-btn bl-btn-primary" + (canNext ? " pulse" : ""),
    onClick: onNext,
    disabled: !canNext
  }, "Continue to checkout ", /*#__PURE__*/React.createElement(Icons.ArrowRight, {
    size: 14
  }))));
}
function IntervalToggle({
  value,
  onChange,
  maxSavings
}) {
  const opts = ["Monthly", "Yearly"];
  return /*#__PURE__*/React.createElement("div", {
    className: "interval-toggle"
  }, opts.map(o => {
    const active = value === o;
    return /*#__PURE__*/React.createElement("button", {
      key: o,
      className: active ? "active" : "",
      onClick: () => onChange(o)
    }, o, o === "Yearly" && maxSavings > 0 && /*#__PURE__*/React.createElement("span", {
      className: "save-pill"
    }, "Save ", maxSavings, "%"));
  }));
}
window.PricingStep = PricingStep;
})(); } catch (e) { __ds_ns.__errors.push({ path: "onboarding/src/PricingStep.jsx", error: String((e && e.message) || e) }); }

// onboarding/src/Stepper.jsx
try { (() => {
function Stepper({
  currentId
}) {
  const {
    STEPS
  } = window.Brieflee;
  const idx = STEPS.findIndex(s => s.id === currentId);
  return /*#__PURE__*/React.createElement("div", {
    className: "step-row"
  }, STEPS.map((s, i) => {
    const done = i < idx;
    const active = i === idx;
    const klass = active ? "step-pill active" : done ? "step-pill done" : "step-pill";
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: s.id
    }, /*#__PURE__*/React.createElement("div", {
      className: klass
    }, /*#__PURE__*/React.createElement("span", {
      className: "step-dot"
    }, done ? /*#__PURE__*/React.createElement(Icons.Check, {
      size: 11,
      strokeWidth: 3
    }) : i + 1), /*#__PURE__*/React.createElement("span", null, s.label)), i < STEPS.length - 1 && /*#__PURE__*/React.createElement("div", {
      className: "step-sep"
    }));
  }));
}
window.Stepper = Stepper;
})(); } catch (e) { __ds_ns.__errors.push({ path: "onboarding/src/Stepper.jsx", error: String((e && e.message) || e) }); }

// onboarding/src/TeamStep.jsx
try { (() => {
function TeamStep({
  teamName,
  setTeamName,
  teamEmails,
  setTeamEmails,
  onNext,
  onSkip
}) {
  const setEmail = (i, v) => setTeamEmails(teamEmails.map((e, k) => k === i ? v : e));
  const addEmail = () => setTeamEmails([...teamEmails, ""]);
  const removeEmail = i => setTeamEmails(teamEmails.filter((_, k) => k !== i));
  const canNext = teamName.trim().length > 0;
  const inviteCount = teamEmails.filter(e => e.trim()).length;
  return /*#__PURE__*/React.createElement("div", {
    className: "gs-page gs-page-narrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center mb-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "team-hero"
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/eyes-blue.png",
    alt: ""
  })), /*#__PURE__*/React.createElement("span", {
    className: "gs-eyebrow"
  }, "Step 1 of 4 \xB7 Set up your workspace"), /*#__PURE__*/React.createElement("h1", {
    className: "gs-headline"
  }, "Name your team and invite your crew"), /*#__PURE__*/React.createElement("p", {
    className: "gs-sub"
  }, "Brieflee is built for review across briefs, brands and teammates. You can always add more people later.")), /*#__PURE__*/React.createElement("div", {
    className: "bl-card",
    style: {
      padding: 28
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "field-label",
    htmlFor: "team-name"
  }, "Team name"), /*#__PURE__*/React.createElement("input", {
    id: "team-name",
    className: "bl-input",
    placeholder: "e.g. Ad Rockstars",
    value: teamName,
    onChange: e => setTeamName(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    className: "field-help"
  }, "This becomes your workspace title across Brieflee."), /*#__PURE__*/React.createElement("div", {
    className: "mt-6"
  }, /*#__PURE__*/React.createElement("label", {
    className: "field-label"
  }, /*#__PURE__*/React.createElement("span", {
    className: "row gap-2"
  }, /*#__PURE__*/React.createElement(Icons.Mail, {
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, "Invite teammates"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--bl-fg-quiet)",
      fontWeight: 500
    }
  }, "\xB7 optional"))), /*#__PURE__*/React.createElement("div", {
    className: "stack gap-2"
  }, teamEmails.map((val, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "row gap-2"
  }, /*#__PURE__*/React.createElement("input", {
    className: "bl-input",
    type: "email",
    placeholder: "name@company.com",
    value: val,
    onChange: e => setEmail(i, e.target.value)
  }), teamEmails.length > 1 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => removeEmail(i),
    "aria-label": "Remove",
    style: {
      flexShrink: 0,
      width: 40,
      height: 40,
      borderRadius: 10,
      background: "transparent",
      border: "1.5px solid var(--bl-border)",
      color: "var(--bl-fg-muted)",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icons.X, {
    size: 14
  }))))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: addEmail,
    className: "row gap-2 mt-3",
    style: {
      background: "transparent",
      border: "none",
      padding: 0,
      cursor: "pointer",
      color: "var(--bl-blue)",
      fontWeight: 600,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement(Icons.Plus, {
    size: 14
  }), " Add another teammate"))), /*#__PURE__*/React.createElement("div", {
    className: "nav-row"
  }, /*#__PURE__*/React.createElement("button", {
    className: "bl-btn bl-btn-ghost",
    onClick: onSkip
  }, "Skip for now"), /*#__PURE__*/React.createElement("button", {
    className: "bl-btn bl-btn-primary",
    onClick: onNext,
    disabled: !canNext
  }, inviteCount > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Icons.Send, {
    size: 14
  }), " Send ", inviteCount, " invite", inviteCount > 1 ? "s" : "", " & continue") : /*#__PURE__*/React.createElement(React.Fragment, null, "Continue ", /*#__PURE__*/React.createElement(Icons.ArrowRight, {
    size: 14
  })))), /*#__PURE__*/React.createElement("p", {
    className: "text-center mt-6",
    style: {
      fontSize: 12,
      color: "var(--bl-fg-quiet)"
    }
  }, "Teammates get a free seat under your trial. No card needed for them."));
}
window.TeamStep = TeamStep;
})(); } catch (e) { __ds_ns.__errors.push({ path: "onboarding/src/TeamStep.jsx", error: String((e && e.message) || e) }); }

// onboarding/src/data.jsx
try { (() => {
// Static data for the onboarding flow.

const STEPS = [{
  id: "team",
  label: "Team"
}, {
  id: "personalize",
  label: "Personalize"
}, {
  id: "pricing",
  label: "Plan"
}, {
  id: "checkout",
  label: "Checkout"
}];
const WORK_TYPE_OPTIONS = [{
  id: "agency",
  label: "Agency"
}, {
  id: "brand",
  label: "Brand"
}, {
  id: "app",
  label: "App or Game"
}, {
  id: "software",
  label: "Software"
}, {
  id: "freelancer",
  label: "Freelancer"
}, {
  id: "solo",
  label: "Solo creator"
}, {
  id: "other",
  label: "Other"
}];
const HEARD_FROM_OPTIONS = [{
  id: "twitter",
  label: "X / Twitter"
}, {
  id: "linkedin",
  label: "LinkedIn"
}, {
  id: "instagram",
  label: "Instagram"
}, {
  id: "tiktok",
  label: "TikTok"
}, {
  id: "google",
  label: "Google Search"
}, {
  id: "youtube",
  label: "YouTube"
}, {
  id: "newsletter",
  label: "Newsletter"
}, {
  id: "podcast",
  label: "Podcast"
}, {
  id: "wom",
  label: "Word of mouth"
}, {
  id: "friend",
  label: "Friend / colleague"
}, {
  id: "client",
  label: "From a client"
}, {
  id: "ad",
  label: "An ad I saw"
}, {
  id: "other",
  label: "Other"
}];
const FEATURES = [{
  key: "review",
  label: "AI video review",
  Icon: () => /*#__PURE__*/React.createElement(Icons.Eye, {
    size: 14
  })
}, {
  key: "briefs",
  label: "Briefs & checklists",
  Icon: () => /*#__PURE__*/React.createElement(Icons.FileText, {
    size: 14
  })
}, {
  key: "qa",
  label: "26-item QA scoring",
  Icon: () => /*#__PURE__*/React.createElement(Icons.BadgeCheck, {
    size: 14
  })
}, {
  key: "storyboard",
  label: "Storyboard view",
  Icon: () => /*#__PURE__*/React.createElement(Icons.LayoutGrid, {
    size: 14
  })
}, {
  key: "remix",
  label: "Remix & revisions",
  Icon: () => /*#__PURE__*/React.createElement(Icons.Shuffle, {
    size: 14
  })
}];
const PLANS = [{
  id: "creator",
  tier: "Creator",
  monthly: 59,
  yearly: 588,
  desc: "For solo founders and freelancers reviewing their own UGC.",
  maxVideos: 30,
  maxWorkspaces: 1,
  maxUsers: 1,
  extras: ["Slack & email support"]
}, {
  id: "crew",
  tier: "Crew",
  monthly: 99,
  yearly: 1068,
  desc: "The winning ad workflow for growing brands and small teams.",
  maxVideos: 100,
  maxWorkspaces: 5,
  maxUsers: 5,
  extras: ["Priority support", "Shared brief library"],
  popular: true
}, {
  id: "studio",
  tier: "Studio",
  monthly: 249,
  yearly: 2388,
  desc: "Scaled review for agencies running multiple brand accounts.",
  maxVideos: 500,
  maxWorkspaces: 10,
  maxUsers: 10,
  extras: ["Dedicated CSM", "API access", "SSO & audit log"]
}];
const TRIAL_FEATURES = [{
  sticker: "assets/rocket.png",
  title: "7 days free",
  body: "Full access. Cancel anytime."
}, {
  sticker: "assets/eyes-blue.png",
  title: "Money back",
  body: "15-day refund guarantee."
}, {
  sticker: "assets/icon-sparkles.png",
  title: "Stripe-secure",
  body: "We never store card details."
}, {
  sticker: "assets/fire.png",
  title: "Instant setup",
  body: "Reviewing in under 5 minutes."
}];
const SOCIAL_LOGOS = ["VAYNERMEDIA", "ClickFunnels", "True Classic", "Hello Bello", "Canva", "Jellysmack"];
const yearlySavingsPct = plan => {
  const fullYear = plan.monthly * 12;
  return Math.round((fullYear - plan.yearly) / fullYear * 100);
};
const MAX_YEARLY_SAVINGS = Math.max(...PLANS.map(yearlySavingsPct));
window.Brieflee = {
  STEPS,
  WORK_TYPE_OPTIONS,
  HEARD_FROM_OPTIONS,
  FEATURES,
  PLANS,
  TRIAL_FEATURES,
  SOCIAL_LOGOS,
  yearlySavingsPct,
  MAX_YEARLY_SAVINGS
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "onboarding/src/data.jsx", error: String((e && e.message) || e) }); }

// onboarding/src/icons.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Lucide-style inline SVG icons (Brieflee uses lucide in product UI)
// Stroke 2, currentColor.

const Svg = ({
  size = 16,
  children,
  ...rest
}) => /*#__PURE__*/React.createElement("svg", _extends({
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, rest), children);
const Check = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("polyline", {
  points: "20 6 9 17 4 12"
}));
const ArrowRight = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("path", {
  d: "M5 12h14"
}), /*#__PURE__*/React.createElement("path", {
  d: "m12 5 7 7-7 7"
}));
const ArrowLeft = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("path", {
  d: "M19 12H5"
}), /*#__PURE__*/React.createElement("path", {
  d: "m12 19-7-7 7-7"
}));
const ChevronRight = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("path", {
  d: "m9 18 6-6-6-6"
}));
const X = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("path", {
  d: "M18 6 6 18"
}), /*#__PURE__*/React.createElement("path", {
  d: "m6 6 12 12"
}));
const Sparkles = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("path", {
  d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M20 3v4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M22 5h-4"
}));
const Shield = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("path", {
  d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
}), /*#__PURE__*/React.createElement("path", {
  d: "m9 12 2 2 4-4"
}));
const CreditCard = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("rect", {
  width: "20",
  height: "14",
  x: "2",
  y: "5",
  rx: "2"
}), /*#__PURE__*/React.createElement("line", {
  x1: "2",
  x2: "22",
  y1: "10",
  y2: "10"
}));
const Lock = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("rect", {
  width: "18",
  height: "11",
  x: "3",
  y: "11",
  rx: "2",
  ry: "2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M7 11V7a5 5 0 0 1 10 0v4"
}));
const Users = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("path", {
  d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "9",
  cy: "7",
  r: "4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M22 21v-2a4 4 0 0 0-3-3.87"
}), /*#__PURE__*/React.createElement("path", {
  d: "M16 3.13a4 4 0 0 1 0 7.75"
}));
const Mail = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("rect", {
  width: "20",
  height: "16",
  x: "2",
  y: "4",
  rx: "2"
}), /*#__PURE__*/React.createElement("path", {
  d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
}));
const Plus = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("path", {
  d: "M5 12h14"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 5v14"
}));
const Calendar = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("path", {
  d: "M8 2v4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M16 2v4"
}), /*#__PURE__*/React.createElement("rect", {
  width: "18",
  height: "18",
  x: "3",
  y: "4",
  rx: "2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M3 10h18"
}));
const RotateCcw = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("path", {
  d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
}), /*#__PURE__*/React.createElement("path", {
  d: "M3 3v5h5"
}));
const Zap = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("path", {
  d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
}));
const Eye = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("path", {
  d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "3"
}));
const FileText = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("path", {
  d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M14 2v4a2 2 0 0 0 2 2h4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M10 9H8"
}), /*#__PURE__*/React.createElement("path", {
  d: "M16 13H8"
}), /*#__PURE__*/React.createElement("path", {
  d: "M16 17H8"
}));
const LayoutGrid = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("rect", {
  width: "7",
  height: "7",
  x: "3",
  y: "3",
  rx: "1"
}), /*#__PURE__*/React.createElement("rect", {
  width: "7",
  height: "7",
  x: "14",
  y: "3",
  rx: "1"
}), /*#__PURE__*/React.createElement("rect", {
  width: "7",
  height: "7",
  x: "14",
  y: "14",
  rx: "1"
}), /*#__PURE__*/React.createElement("rect", {
  width: "7",
  height: "7",
  x: "3",
  y: "14",
  rx: "1"
}));
const BadgeCheck = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("path", {
  d: "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
}), /*#__PURE__*/React.createElement("path", {
  d: "m9 12 2 2 4-4"
}));
const Shuffle = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("path", {
  d: "M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"
}), /*#__PURE__*/React.createElement("path", {
  d: "m18 2 4 4-4 4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M2 6h1.9c1.5 0 2.9.9 3.6 2.2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"
}), /*#__PURE__*/React.createElement("path", {
  d: "m18 14 4 4-4 4"
}));
const Star = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("polygon", {
  points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
}));
const Send = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("path", {
  d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"
}), /*#__PURE__*/React.createElement("path", {
  d: "m21.854 2.147-10.94 10.939"
}));
window.Icons = {
  Check,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  X,
  Sparkles,
  Shield,
  CreditCard,
  Lock,
  Users,
  Mail,
  Plus,
  Calendar,
  RotateCcw,
  Zap,
  Eye,
  FileText,
  LayoutGrid,
  BadgeCheck,
  Shuffle,
  Star,
  Send
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "onboarding/src/icons.jsx", error: String((e && e.message) || e) }); }

// onboarding/src/tweaks-panel.jsx
try { (() => {
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;width:100%;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : {
      [keyOrEdits]: val
    };
    setValues(prev => ({
      ...prev,
      ...edits
    }));
    window.parent.postMessage({
      type: '__edit_mode_set_keys',
      edits
    }, '*');
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({
  title = 'Tweaks',
  children
}) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({
    x: 16,
    y: 16
  });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth,
      h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = e => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({
      type: '__edit_mode_available'
    }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({
      type: '__edit_mode_dismissed'
    }, '*');
  };
  const onDragStart = e => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX,
      sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = ev => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, __TWEAKS_STYLE), /*#__PURE__*/React.createElement("div", {
    ref: dragRef,
    className: "twk-panel",
    "data-noncommentable": "",
    style: {
      right: offsetRef.current.x,
      bottom: offsetRef.current.y
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-hd",
    onMouseDown: onDragStart
  }, /*#__PURE__*/React.createElement("b", null, title), /*#__PURE__*/React.createElement("button", {
    className: "twk-x",
    "aria-label": "Close tweaks",
    onMouseDown: e => e.stopPropagation(),
    onClick: dismiss
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "twk-body"
  }, children)));
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "twk-sect"
  }, label), children);
}
function TweakRow({
  label,
  value,
  children,
  inline = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: inline ? 'twk-row twk-row-h' : 'twk-row'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label), value != null && /*#__PURE__*/React.createElement("span", {
    className: "twk-val"
  }, value)), children);
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label,
    value: `${value}${unit}`
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "twk-slider",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(Number(e.target.value))
  }));
}
function TweakToggle({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "twk-toggle",
    "data-on": value ? '1' : '0',
    role: "switch",
    "aria-checked": !!value,
    onClick: () => onChange(!value)
  }, /*#__PURE__*/React.createElement("i", null)));
}
function TweakRadio({
  label,
  value,
  options,
  onChange
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;

  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;
  const segAt = clientX => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = e => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = ev => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    role: "radiogroup",
    onPointerDown: onPointerDown,
    className: dragging ? 'twk-seg dragging' : 'twk-seg'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-seg-thumb",
    style: {
      left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
      width: `calc((100% - 4px) / ${n})`
    }
  }), opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "radio",
    "aria-checked": o.value === value
  }, o.label))));
}
function TweakSelect({
  label,
  value,
  options,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("select", {
    className: "twk-field",
    value: value,
    onChange: e => onChange(e.target.value)
  }, options.map(o => {
    const v = typeof o === 'object' ? o.value : o;
    const l = typeof o === 'object' ? o.label : o;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })));
}
function TweakText({
  label,
  value,
  placeholder,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("input", {
    className: "twk-field",
    type: "text",
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakNumber({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange
}) {
  const clamp = n => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({
    x: 0,
    val: 0
  });
  const onScrubStart = e => {
    e.preventDefault();
    startRef.current = {
      x: e.clientX,
      val: value
    };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = ev => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-num"
  }, /*#__PURE__*/React.createElement("span", {
    className: "twk-num-lbl",
    onPointerDown: onScrubStart
  }, label), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: e => onChange(clamp(Number(e.target.value)))
  }), unit && /*#__PURE__*/React.createElement("span", {
    className: "twk-num-unit"
  }, unit));
}
function TweakColor({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("input", {
    type: "color",
    className: "twk-swatch",
    value: value,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakButton({
  label,
  onClick,
  secondary = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: secondary ? 'twk-btn secondary' : 'twk-btn',
    onClick: onClick
  }, label);
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "onboarding/src/tweaks-panel.jsx", error: String((e && e.message) || e) }); }

// sections.jsx
try { (() => {
// ============================================================
// Brieflee Home v2 — sections
// ============================================================
const CLD = "https://res.cloudinary.com/dchroynzv/image/upload";
const CUSTOMER_LOGOS = [{
  name: "Shopify",
  url: `${CLD}/brieflee_customer-logo_shopify-wordmark-with-bag-icon-grey_2026-05.png`
}, {
  name: "Shark",
  url: `${CLD}/brieflee_customer-logo_shark-wordmark-black_2026-05.png`
}, {
  name: "Halara",
  url: `${CLD}/brieflee_customer-logo_halara-wordmark-black_2026-05.png`
}, {
  name: "Cosrx",
  url: `${CLD}/brieflee_customer-logo_cosrx-wordmark-black_2026-05.png`
}, {
  name: "Indeed",
  url: `${CLD}/brieflee_customer-logo_indeed-wordmark-grey_2026-05.png`
}, {
  name: "Grubhub",
  url: `${CLD}/brieflee_customer-logo_grubhub-wordmark-with-house-fork-grey_2026-05.png`
}];

// Product video slugs — user can swap to real Cloudinary mp4 URLs. We feed them
// to a wrapper that gracefully falls back to a styled placeholder frame.
const DEMOS = {
  hero: `${CLD}/video/upload/brieflee_home_hero_three-vertical-ugc-overlap.mp4`,
  briefs: `${CLD}/video/upload/brieflee_demo_briefs-builder-overview.mp4`,
  storyboard: `${CLD}/video/upload/brieflee_demo_storyboard-vertical-beats.mp4`,
  swipe: `${CLD}/video/upload/brieflee_demo_swipe-files-to-brief.mp4`,
  aiReview: `${CLD}/video/upload/brieflee_demo_ai-video-review-three-modes.mp4`,
  qa: `${CLD}/video/upload/brieflee_demo_ai-qa-checklist-flags.mp4`,
  revisions: `${CLD}/video/upload/brieflee_demo_revisions-frame-comments.mp4`
};

// ============================================================
// Lightweight inline-video helper — autoplay muted with placeholder fallback
// ============================================================
const VideoSlot = ({
  src,
  placeholder,
  label
}) => {
  const [ok, setOk] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: "100%",
      height: "100%"
    }
  }, !ok && placeholder, /*#__PURE__*/React.createElement("video", {
    src: src,
    autoPlay: true,
    muted: true,
    loop: true,
    playsInline: true,
    onLoadedData: () => setOk(true),
    onError: () => setOk(false),
    style: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: "inherit",
      opacity: ok ? 1 : 0,
      transition: "opacity .3s ease",
      pointerEvents: "none"
    },
    "aria-label": label
  }));
};

// ============================================================
// NAV — Foreplay-style grouped Product dropdown
// ============================================================
const NAV_PRODUCTS = {
  PLAN: [{
    id: "briefs",
    title: "Briefs",
    desc: "Hand creators a brief they can film from",
    Icon: window.IconBrief,
    href: "#briefs"
  }, {
    id: "storyboard",
    title: "Storyboard",
    desc: "Show creators exactly what good looks like",
    Icon: window.IconStoryboard,
    href: "#storyboard"
  }, {
    id: "swipe",
    title: "Remix / Swipe Files",
    desc: "Save winning ads. Remix them into new briefs.",
    Icon: window.IconSwipe,
    href: "#swipe"
  }],
  REVIEW: [{
    id: "ai-review",
    title: "AI Video Review",
    desc: "AI watches every video before you do",
    Icon: window.IconReview,
    href: "#ai-review"
  }, {
    id: "qa",
    title: "AI QA Checklist",
    desc: "Off-brand, off-brief, off-spec — flagged",
    Icon: window.IconQA,
    href: "#qa"
  }, {
    id: "revisions",
    title: "Revisions",
    desc: "Precise feedback. Every fix tracked.",
    Icon: window.IconRev,
    href: "#revisions"
  }]
};
const Nav = ({
  navOpen,
  setNavOpen
}) => {
  return /*#__PURE__*/React.createElement("div", {
    className: "nav-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement("nav", {
    className: "nav",
    "aria-label": "Primary"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "brand"
  }, /*#__PURE__*/React.createElement("span", null, "briefle"), /*#__PURE__*/React.createElement("span", {
    className: "smile"
  }, "ee")), /*#__PURE__*/React.createElement("div", {
    className: "nav-links"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nav-item",
    onMouseEnter: () => setNavOpen("product"),
    onMouseLeave: () => setNavOpen(null)
  }, "Product ", /*#__PURE__*/React.createElement(window.IconCaret, {
    className: "caret",
    size: 12
  }), navOpen === "product" && /*#__PURE__*/React.createElement("div", {
    className: "megamenu",
    onMouseEnter: () => setNavOpen("product")
  }, ["PLAN", "REVIEW"].map(group => /*#__PURE__*/React.createElement("div", {
    key: group
  }, /*#__PURE__*/React.createElement("div", {
    className: "col-label"
  }, group), /*#__PURE__*/React.createElement("div", null, NAV_PRODUCTS[group].map(p => /*#__PURE__*/React.createElement("a", {
    key: p.id,
    href: p.href,
    className: "mm-item"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mm-icon"
  }, /*#__PURE__*/React.createElement(p.Icon, {
    size: 18
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "mm-title"
  }, p.title), /*#__PURE__*/React.createElement("div", {
    className: "mm-desc"
  }, p.desc))))))))), /*#__PURE__*/React.createElement("div", {
    className: "nav-item"
  }, "Solutions ", /*#__PURE__*/React.createElement(window.IconCaret, {
    className: "caret",
    size: 12
  })), /*#__PURE__*/React.createElement("div", {
    className: "nav-item"
  }, "Pricing"), /*#__PURE__*/React.createElement("div", {
    className: "nav-item"
  }, "Resources ", /*#__PURE__*/React.createElement(window.IconCaret, {
    className: "caret",
    size: 12
  }))), /*#__PURE__*/React.createElement("div", {
    className: "nav-cta"
  }, /*#__PURE__*/React.createElement("a", {
    className: "nav-item",
    href: "#"
  }, "Sign in"), /*#__PURE__*/React.createElement("a", {
    className: "btn btn-primary",
    href: "#"
  }, "Start free trial")))));
};

// ============================================================
// HERO
// ============================================================
const HERO_HEADLINES = {
  default: {
    lead: "Brief creators.",
    mid: "Review their videos.",
    tail: "Approve what wins.",
    italic: "tail"
  },
  workflow: {
    lead: "Run UGC like a real workflow.",
    mid: "",
    tail: "Not a group chat.",
    italic: "tail"
  },
  inOne: {
    lead: "From brief",
    mid: "to approved,",
    tail: "in one place.",
    italic: "mid"
  },
  finished: {
    lead: "The UGC workflow brands",
    mid: "and agencies",
    tail: "actually finish on.",
    italic: "tail"
  }
};
const Hero = ({
  t
}) => {
  const h = HERO_HEADLINES[t.headline] || HERO_HEADLINES.default;
  const I = (key, txt) => h.italic === key ? /*#__PURE__*/React.createElement("span", {
    className: "it"
  }, txt) : txt;
  return /*#__PURE__*/React.createElement("section", {
    className: "hero"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hero-blob a"
  }), /*#__PURE__*/React.createElement("span", {
    className: "hero-blob b"
  }), /*#__PURE__*/React.createElement("div", {
    className: "shell hero-inner"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hero-eyebrow"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pulse"
  }), /*#__PURE__*/React.createElement("span", null, "Now with AI Video Review \xB7 v2")), /*#__PURE__*/React.createElement("h1", {
    className: "h-display"
  }, I("lead", h.lead), " ", h.mid && /*#__PURE__*/React.createElement(React.Fragment, null, I("mid", h.mid), " "), I("tail", h.tail)), /*#__PURE__*/React.createElement("p", {
    className: "lede hero-lede"
  }, "The fastest way to run UGC, from brief to approved content \u2014 without the group chats, the Loom reviews, or the missed deadlines."), /*#__PURE__*/React.createElement("div", {
    className: "hero-cta"
  }, /*#__PURE__*/React.createElement("a", {
    className: "btn btn-accent",
    href: "#"
  }, "Start free trial ", /*#__PURE__*/React.createElement(window.IconArrow, {
    size: 16
  })), /*#__PURE__*/React.createElement("a", {
    className: "btn btn-ghost",
    href: "#"
  }, "Book a demo")), /*#__PURE__*/React.createElement("div", {
    className: "hero-meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "check"
  }, /*#__PURE__*/React.createElement(window.IconCheck, {
    size: 14
  })), /*#__PURE__*/React.createElement("span", null, "No credit card"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--ink-200)"
    }
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, "Free for your first 20 videos"))), /*#__PURE__*/React.createElement(HeroStage, {
    variant: t.heroVariant
  })));
};
const HeroStage = ({
  variant
}) => {
  if (variant === "dashboard") return /*#__PURE__*/React.createElement(HeroDashboard, null);
  if (variant === "diagram") return /*#__PURE__*/React.createElement(HeroDiagram, null);
  return /*#__PURE__*/React.createElement(HeroTiles, null);
};
const HeroTiles = () => /*#__PURE__*/React.createElement("div", {
  className: "hero-stage"
}, /*#__PURE__*/React.createElement("div", {
  className: "tile t1"
}, /*#__PURE__*/React.createElement("div", {
  className: "tile-ph"
}, /*#__PURE__*/React.createElement("span", {
  className: "tile-chip",
  style: {
    top: 12,
    left: 12
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "dot"
}), "Approved"), /*#__PURE__*/React.createElement("div", {
  className: "tile-caption"
}, "\"Day 3 of trying this serum\u2026\""))), /*#__PURE__*/React.createElement("div", {
  className: "tile t2"
}, /*#__PURE__*/React.createElement("div", {
  className: "tile-ph b"
}, /*#__PURE__*/React.createElement("span", {
  className: "tile-chip warn",
  style: {
    top: 12,
    left: 12
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "dot"
}), "In review"), /*#__PURE__*/React.createElement("span", {
  className: "tile-chip",
  style: {
    top: 12,
    right: 12,
    background: "rgba(11,18,64,0.7)",
    color: "#fff"
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "dot"
}), "00:12"), /*#__PURE__*/React.createElement("div", {
  className: "tile-caption"
}, "\"POV: you found the new it-bag\u2026\""))), /*#__PURE__*/React.createElement("div", {
  className: "tile t3"
}, /*#__PURE__*/React.createElement("div", {
  className: "tile-ph c"
}, /*#__PURE__*/React.createElement("span", {
  className: "tile-chip flag",
  style: {
    top: 12,
    left: 12
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "dot"
}), "Revise"), /*#__PURE__*/React.createElement("div", {
  className: "tile-caption"
}, "\"Three reasons I switched\u2026\""))), /*#__PURE__*/React.createElement("div", {
  className: "float-card a"
}, /*#__PURE__*/React.createElement("span", {
  className: "ico"
}, /*#__PURE__*/React.createElement(window.IconBolt, {
  size: 14
})), "AI reviewed in ", /*#__PURE__*/React.createElement("b", {
  style: {
    marginLeft: 4
  }
}, "11s")), /*#__PURE__*/React.createElement("div", {
  className: "float-card b"
}, /*#__PURE__*/React.createElement("span", {
  className: "ico"
}, /*#__PURE__*/React.createElement(window.IconCheck, {
  size: 14
})), "Brief match \xB7 ", /*#__PURE__*/React.createElement("b", {
  style: {
    marginLeft: 4
  }
}, "96%")), /*#__PURE__*/React.createElement("div", {
  className: "float-card c"
}, /*#__PURE__*/React.createElement("span", {
  className: "ico",
  style: {
    background: "#FFE8DC",
    color: "#A14B2E"
  }
}, /*#__PURE__*/React.createElement(window.IconFlag, {
  size: 14
})), "Disclaimer missing \xB7 ", /*#__PURE__*/React.createElement("b", {
  style: {
    marginLeft: 4
  }
}, "00:08")));
const HeroDashboard = () => /*#__PURE__*/React.createElement("div", {
  className: "frame",
  style: {
    aspectRatio: "4/3",
    margin: "0"
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "frame-bar"
}, /*#__PURE__*/React.createElement("span", {
  className: "dot"
}), /*#__PURE__*/React.createElement("span", {
  className: "dot"
}), /*#__PURE__*/React.createElement("span", {
  className: "dot"
}), /*#__PURE__*/React.createElement("span", {
  className: "title-label"
}, "brieflee \xB7 campaign: spring-launch")), /*#__PURE__*/React.createElement("div", {
  className: "frame-body",
  style: {
    display: "grid",
    gridTemplateColumns: "180px 1fr",
    gap: 14,
    padding: 14
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gap: 8,
    alignContent: "start"
  }
}, ["Briefs", "Storyboard", "Submissions", "Revisions", "Swipe Files"].map((x, i) => /*#__PURE__*/React.createElement("div", {
  key: x,
  style: {
    padding: "8px 10px",
    borderRadius: 8,
    fontSize: 12.5,
    fontWeight: 500,
    background: i === 2 ? "var(--peri-100)" : "transparent",
    color: i === 2 ? "var(--peri-700)" : "var(--ink-600)"
  }
}, x))), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gridTemplateRows: "auto 1fr",
    gap: 10
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    gap: 8
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "chip",
  style: {
    background: "var(--peri-100)",
    color: "var(--peri-700)",
    borderColor: "var(--peri-200)"
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "dot"
}), "23 to review"), /*#__PURE__*/React.createElement("span", {
  className: "chip"
}, /*#__PURE__*/React.createElement("span", {
  className: "dot",
  style: {
    background: "#F2A93B"
  }
}), "8 awaiting"), /*#__PURE__*/React.createElement("span", {
  className: "chip"
}, /*#__PURE__*/React.createElement("span", {
  className: "dot",
  style: {
    background: "#2BB673"
  }
}), "41 approved")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 8
  }
}, [0, 1, 2, 3, 4, 5, 6, 7].map(i => /*#__PURE__*/React.createElement("div", {
  key: i,
  style: {
    aspectRatio: "9/16",
    borderRadius: 8,
    background: i % 4 === 0 ? "linear-gradient(160deg, var(--peri-300), var(--peri-600))" : i % 4 === 1 ? "linear-gradient(160deg, #FFD2BC, #E08A77)" : i % 4 === 2 ? "linear-gradient(160deg, #C7F0D8, #6FB388)" : "linear-gradient(160deg, #FBE0B3, #C28A3A)",
    position: "relative"
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    position: "absolute",
    top: 6,
    left: 6,
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    background: "rgba(255,255,255,0.92)",
    padding: "2px 6px",
    borderRadius: 999,
    color: "var(--ink-700)",
    letterSpacing: ".08em",
    textTransform: "uppercase"
  }
}, ["NEW", "AI", "REV", "OK"][i % 4])))))));
const HeroDiagram = () => /*#__PURE__*/React.createElement("div", {
  className: "hero-stage",
  style: {
    height: 520,
    display: "grid",
    placeItems: "center"
  }
}, /*#__PURE__*/React.createElement("svg", {
  width: "100%",
  height: "100%",
  viewBox: "0 0 520 480",
  style: {
    maxWidth: 520
  }
}, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("marker", {
  id: "ar",
  markerWidth: "10",
  markerHeight: "10",
  refX: "8",
  refY: "3",
  orient: "auto"
}, /*#__PURE__*/React.createElement("path", {
  d: "M0,0 L0,6 L8,3 z",
  fill: "#6B5FDC"
}))), [{
  x: 80,
  y: 80,
  c: "#ECE8FF",
  label: "BRIEF",
  sub: "Idea → spec"
}, {
  x: 360,
  y: 80,
  c: "#FFE8DC",
  label: "FILM",
  sub: "Creator uploads"
}, {
  x: 360,
  y: 340,
  c: "#E0F4E9",
  label: "REVIEW",
  sub: "AI + you"
}, {
  x: 80,
  y: 340,
  c: "#FBE8C8",
  label: "APPROVE",
  sub: "Ship it"
}].map((n, i) => /*#__PURE__*/React.createElement("g", {
  key: i
}, /*#__PURE__*/React.createElement("rect", {
  x: n.x,
  y: n.y,
  width: "160",
  height: "100",
  rx: "20",
  fill: n.c,
  stroke: "#E4E7F4"
}), /*#__PURE__*/React.createElement("text", {
  x: n.x + 80,
  y: n.y + 44,
  textAnchor: "middle",
  style: {
    font: "600 18px Geist, sans-serif",
    fill: "#0B1240",
    letterSpacing: "-0.01em"
  }
}, n.label), /*#__PURE__*/React.createElement("text", {
  x: n.x + 80,
  y: n.y + 70,
  textAnchor: "middle",
  style: {
    font: "400 12px 'Geist Mono', monospace",
    fill: "#4A5198"
  }
}, n.sub))), /*#__PURE__*/React.createElement("path", {
  d: "M240,130 C300,130 300,130 360,130",
  stroke: "#6B5FDC",
  strokeWidth: "2",
  fill: "none",
  markerEnd: "url(#ar)"
}), /*#__PURE__*/React.createElement("path", {
  d: "M440,180 C440,260 440,260 440,340",
  stroke: "#6B5FDC",
  strokeWidth: "2",
  fill: "none",
  markerEnd: "url(#ar)"
}), /*#__PURE__*/React.createElement("path", {
  d: "M360,390 C300,390 300,390 240,390",
  stroke: "#6B5FDC",
  strokeWidth: "2",
  fill: "none",
  markerEnd: "url(#ar)"
}), /*#__PURE__*/React.createElement("path", {
  d: "M160,340 C160,260 160,260 160,180",
  stroke: "#6B5FDC",
  strokeWidth: "2",
  fill: "none",
  markerEnd: "url(#ar)"
}), /*#__PURE__*/React.createElement("g", {
  transform: "translate(220, 210)"
}, /*#__PURE__*/React.createElement("circle", {
  cx: "40",
  cy: "40",
  r: "40",
  fill: "#0B1240"
}), /*#__PURE__*/React.createElement("text", {
  x: "40",
  y: "46",
  textAnchor: "middle",
  style: {
    font: "italic 400 22px 'Instrument Serif'",
    fill: "#C2B7FB"
  }
}, "brieflee"))));

// ============================================================
// TRUST STRIP
// ============================================================
const Trust = () => /*#__PURE__*/React.createElement("section", {
  className: "trust"
}, /*#__PURE__*/React.createElement("div", {
  className: "shell"
}, /*#__PURE__*/React.createElement("div", {
  className: "trust-line"
}, "Trusted by top D2C growth teams and creator agencies"), /*#__PURE__*/React.createElement("div", {
  className: "logos"
}, CUSTOMER_LOGOS.map(l => /*#__PURE__*/React.createElement("div", {
  key: l.name,
  className: "logo-ph"
}, /*#__PURE__*/React.createElement("img", {
  src: l.url,
  alt: l.name,
  style: {
    height: 24,
    opacity: .7,
    filter: "grayscale(1)"
  },
  onError: e => {
    e.target.outerHTML = l.name;
  }
}))))));

// ============================================================
// FOUR-CARD OVERVIEW
// ============================================================
const Overview = () => {
  const cards = [{
    num: "01",
    glyph: /*#__PURE__*/React.createElement(window.IconBrief, {
      size: 18
    }),
    title: "Brief creators well.",
    body: "Hand creators a brief they can actually film from. Storyboards, references, examples — all in one link."
  }, {
    num: "02",
    glyph: /*#__PURE__*/React.createElement(window.IconReview, {
      size: 18
    }),
    title: "Review videos in seconds.",
    body: "AI watches every video before you do. Flags off-brand, off-brief, off-spec moments so you only review what matters."
  }, {
    num: "03",
    glyph: /*#__PURE__*/React.createElement(window.IconCheck, {
      size: 18
    }),
    title: "Approve what works.",
    body: "One review, one decision, no thread digging. Send specific feedback or auto-revise when something's off."
  }, {
    num: "04",
    glyph: /*#__PURE__*/React.createElement(window.IconLayers, {
      size: 18
    }),
    title: "Run more without the chaos.",
    body: "Every brief, every revision, every approval lives in one workspace your team and creators both call home."
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "overview shell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginBottom: 18
    }
  }, "The loop"), /*#__PURE__*/React.createElement("h2", {
    className: "h-section"
  }, "The ", /*#__PURE__*/React.createElement("span", {
    className: "it"
  }, "full UGC loop"), ",", /*#__PURE__*/React.createElement("br", null), "in one place.")), /*#__PURE__*/React.createElement("p", {
    className: "lede right"
  }, "Six modules. One workflow. Built for short-form creators and the brands and agencies shipping with them.")), /*#__PURE__*/React.createElement("div", {
    className: "overview-grid"
  }, cards.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.num,
    className: "over-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "over-num"
  }, c.num), /*#__PURE__*/React.createElement("div", {
    className: "glyph"
  }, c.glyph), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "h-card"
  }, c.title), /*#__PURE__*/React.createElement("p", null, c.body))))));
};

// ============================================================
// BEFORE / AFTER CONTRAST
// ============================================================
const Contrast = () => /*#__PURE__*/React.createElement("section", {
  className: "contrast shell"
}, /*#__PURE__*/React.createElement("div", {
  className: "section-head"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "eyebrow",
  style: {
    marginBottom: 18
  }
}, "Before \xB7 after"), /*#__PURE__*/React.createElement("h2", {
  className: "h-section"
}, "Your new ", /*#__PURE__*/React.createElement("span", {
  className: "it"
}, "secret weapon"), /*#__PURE__*/React.createElement("br", null), "for UGC."))), /*#__PURE__*/React.createElement("div", {
  className: "contrast-grid"
}, /*#__PURE__*/React.createElement("div", {
  className: "compare before"
}, /*#__PURE__*/React.createElement("h3", null, "Before Brieflee,", /*#__PURE__*/React.createElement("br", null), "UGC looks like ", /*#__PURE__*/React.createElement("span", {
  className: "it"
}, "this.")), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", {
  className: "bul"
}, "\xB7"), "Briefs that live in a Google Doc nobody reads."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", {
  className: "bul"
}, "\xB7"), "Reviews scattered across Slack, Loom, email, and DMs."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", {
  className: "bul"
}, "\xB7"), "Creators filming the wrong thing \u2014 the reference was buried."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", {
  className: "bul"
}, "\xB7"), "Watching 47 videos in a row, trying to remember which got approved.")), /*#__PURE__*/React.createElement("div", {
  className: "chaos"
}, /*#__PURE__*/React.createElement("div", {
  className: "bubble b1"
}, "Can we tweak the hook?"), /*#__PURE__*/React.createElement("div", {
  className: "bubble b2"
}, "Loom \xB7 4:12"), /*#__PURE__*/React.createElement("div", {
  className: "bubble b3"
}, "where's the brand guide??"), /*#__PURE__*/React.createElement("div", {
  className: "bubble b4"
}, "v3-final-final.mp4"), /*#__PURE__*/React.createElement("div", {
  className: "bubble b5"
}, "slack DM"), /*#__PURE__*/React.createElement("div", {
  className: "bubble b6"
}, "@here are we approving this?"))), /*#__PURE__*/React.createElement("div", {
  className: "compare after"
}, /*#__PURE__*/React.createElement("h3", null, "After Brieflee,", /*#__PURE__*/React.createElement("br", null), "it looks like ", /*#__PURE__*/React.createElement("span", {
  className: "it"
}, "this.")), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", {
  className: "bul"
}, "\u2192"), "One brief, one link, every reference inside it."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", {
  className: "bul"
}, "\u2192"), "Every video reviewed by AI first. You only watch what matters."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", {
  className: "bul"
}, "\u2192"), "Every revision, every comment, every approval tracked."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", {
  className: "bul"
}, "\u2192"), "Your team and your creators both live in the same workspace.")), /*#__PURE__*/React.createElement("div", {
  className: "after-visual"
}, /*#__PURE__*/React.createElement("div", {
  className: "row pass"
}, /*#__PURE__*/React.createElement(window.IconCheck, {
  size: 14
}), "Hook landed in 2.1s ", /*#__PURE__*/React.createElement("span", {
  className: "pill"
}, "PASS")), /*#__PURE__*/React.createElement("div", {
  className: "row warn"
}, /*#__PURE__*/React.createElement(window.IconFlag, {
  size: 14
}), "Disclaimer cut at 00:08 ", /*#__PURE__*/React.createElement("span", {
  className: "pill"
}, "FLAG")), /*#__PURE__*/React.createElement("div", {
  className: "row pass"
}, /*#__PURE__*/React.createElement(window.IconCheck, {
  size: 14
}), "Brand colour in frame ", /*#__PURE__*/React.createElement("span", {
  className: "pill"
}, "PASS")), /*#__PURE__*/React.createElement("div", {
  className: "row fail"
}, /*#__PURE__*/React.createElement(window.IconClose, {
  size: 14
}), "Competitor logo visible ", /*#__PURE__*/React.createElement("span", {
  className: "pill"
}, "FAIL"))))), /*#__PURE__*/React.createElement("div", {
  style: {
    textAlign: "center",
    marginTop: 50
  }
}, /*#__PURE__*/React.createElement("a", {
  className: "btn btn-accent",
  href: "#"
}, "Start free trial ", /*#__PURE__*/React.createElement(window.IconArrow, {
  size: 16
}))));

// ============================================================
// CATEGORY BANNER
// ============================================================
const CatBanner = ({
  kind
}) => {
  const copy = kind === "PLAN" ? {
    eyebrow: "PLAN",
    title: /*#__PURE__*/React.createElement(React.Fragment, null, "Hand creators briefs", /*#__PURE__*/React.createElement("br", null), "they can ", /*#__PURE__*/React.createElement("span", {
      className: "it"
    }, "film from.")),
    sub: "Three tools that turn what you want into content creators can actually deliver."
  } : {
    eyebrow: "REVIEW",
    title: /*#__PURE__*/React.createElement(React.Fragment, null, "Review with ", /*#__PURE__*/React.createElement("span", {
      className: "it"
    }, "great accuracy"), /*#__PURE__*/React.createElement("br", null), "and control."),
    sub: "Three tools that turn 50 videos a week from a Monday-morning slog into a 20-minute review session."
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "cat-banner shell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginBottom: 24
    }
  }, copy.eyebrow), /*#__PURE__*/React.createElement("h2", {
    className: "h-section"
  }, copy.title), /*#__PURE__*/React.createElement("p", {
    className: "sub"
  }, copy.sub));
};

// ============================================================
// MODULE SECTION (generic)
// ============================================================
const Module = ({
  id,
  reverse,
  eyebrow,
  title,
  italicWord,
  lede,
  feats,
  ctas,
  visual
}) => {
  const parts = title.split(italicWord);
  return /*#__PURE__*/React.createElement("section", {
    id: id,
    className: "shell"
  }, /*#__PURE__*/React.createElement("div", {
    className: `module ${reverse ? "reverse" : ""}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "copy"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, eyebrow), /*#__PURE__*/React.createElement("h2", {
    className: "h-section"
  }, parts[0], /*#__PURE__*/React.createElement("span", {
    className: "it"
  }, italicWord), parts[1]), /*#__PURE__*/React.createElement("p", {
    className: "lede"
  }, lede), /*#__PURE__*/React.createElement("div", {
    className: "feat-list"
  }, feats.map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "feat"
  }, /*#__PURE__*/React.createElement("strong", null, f.title), /*#__PURE__*/React.createElement("p", null, f.body)))), /*#__PURE__*/React.createElement("div", {
    className: "ctas"
  }, /*#__PURE__*/React.createElement("a", {
    className: "btn btn-accent",
    href: "#"
  }, "Start free trial ", /*#__PURE__*/React.createElement(window.IconArrow, {
    size: 16
  })), ctas && /*#__PURE__*/React.createElement("a", {
    className: "btn-link",
    href: "#"
  }, ctas, " \u2192"))), /*#__PURE__*/React.createElement("div", {
    className: "visual"
  }, visual)));
};

// ============================================================
// PLAN modules
// ============================================================
const BriefsModule = () => /*#__PURE__*/React.createElement(Module, {
  id: "briefs",
  eyebrow: "BRIEFS",
  title: "Briefs creators actually film from.",
  italicWord: "actually film from.",
  lede: "Your brief is the difference between content that converts and content you have to re-shoot. Brieflee turns rough ideas into briefs that ship usable content the first time.",
  feats: [{
    title: "Build briefs from a winning ad.",
    body: "Drop a TikTok or Meta ad in. Brieflee writes a brief that recreates what made it work."
  }, {
    title: "One brief, every reference.",
    body: "Hooks, b-roll, examples, do-and-don't lists — all inside the brief the creator opens."
  }, {
    title: "Send to one creator or fifty.",
    body: "One brief link. Automatic creator notifications. Every submission tracked back to the brief."
  }],
  ctas: "See how briefs work",
  visual: /*#__PURE__*/React.createElement("div", {
    className: "frame brief-frame"
  }, /*#__PURE__*/React.createElement("div", {
    className: "frame-bar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "title-label"
  }, "brief \xB7 spring-serum-launch \xB7 v3")), /*#__PURE__*/React.createElement("div", {
    className: "frame-body"
  }, /*#__PURE__*/React.createElement(VideoSlot, {
    src: DEMOS.briefs,
    label: "Briefs demo",
    placeholder: /*#__PURE__*/React.createElement("div", {
      className: "doc"
    }, /*#__PURE__*/React.createElement("div", {
      className: "doc-title"
    }, "Spring Serum Launch \u2014 UGC Brief"), /*#__PURE__*/React.createElement("div", {
      className: "doc-meta"
    }, /*#__PURE__*/React.createElement("span", {
      className: "chip"
    }, "3 creators"), /*#__PURE__*/React.createElement("span", {
      className: "chip"
    }, "vertical 9:16"), /*#__PURE__*/React.createElement("span", {
      className: "chip"
    }, "due fri")), /*#__PURE__*/React.createElement("div", {
      className: "doc-section"
    }, /*#__PURE__*/React.createElement("div", {
      className: "doc-row"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ord"
    }, "01"), "Hook \u2014 problem statement", /*#__PURE__*/React.createElement("span", {
      className: "bar"
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        "--w": "82%"
      }
    }))), /*#__PURE__*/React.createElement("div", {
      className: "doc-row"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ord"
    }, "02"), "Demo \u2014 texture pour", /*#__PURE__*/React.createElement("span", {
      className: "bar"
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        "--w": "65%"
      }
    }))), /*#__PURE__*/React.createElement("div", {
      className: "doc-row"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ord"
    }, "03"), "Proof \u2014 before/after", /*#__PURE__*/React.createElement("span", {
      className: "bar"
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        "--w": "94%"
      }
    }))), /*#__PURE__*/React.createElement("div", {
      className: "doc-row"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ord"
    }, "04"), "CTA \u2014 \"shop the drop\"", /*#__PURE__*/React.createElement("span", {
      className: "bar"
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        "--w": "40%"
      }
    })))), /*#__PURE__*/React.createElement("div", {
      className: "doc-ref"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ref-tile"
    }), /*#__PURE__*/React.createElement("div", {
      className: "ref-tile b"
    }), /*#__PURE__*/React.createElement("div", {
      className: "ref-tile c"
    })))
  })))
});
const StoryboardModule = () => /*#__PURE__*/React.createElement(Module, {
  id: "storyboard",
  reverse: true,
  eyebrow: "STORYBOARD",
  title: "Show creators exactly what good looks like.",
  italicWord: "what good looks like.",
  lede: "Words in a brief leave room for interpretation. A storyboard doesn't. Sketch the shot, the angle, the transition, the on-screen text \u2014 beat by beat, so creators film what you actually want.",
  feats: [{
    title: "Visual references for every beat.",
    body: "Drag in screenshots, ad clips, or example shots. Creators see the exact look you're going for."
  }, {
    title: "Built for short-form.",
    body: "Vertical-first. Built for TikTok, Reels, and Shorts. Not 60-second ad cuts."
  }, {
    title: "Editable on the fly.",
    body: "Tweak a beat without re-sending the brief. Creators always see the latest."
  }],
  ctas: "See storyboards in action",
  visual: /*#__PURE__*/React.createElement("div", {
    className: "frame story-frame"
  }, /*#__PURE__*/React.createElement("div", {
    className: "frame-bar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "title-label"
  }, "storyboard \xB7 4 beats \xB7 0:15")), /*#__PURE__*/React.createElement("div", {
    className: "frame-body"
  }, /*#__PURE__*/React.createElement(VideoSlot, {
    src: DEMOS.storyboard,
    label: "Storyboard demo",
    placeholder: /*#__PURE__*/React.createElement("div", {
      className: "beats"
    }, [{
      n: "BEAT 01",
      l: '"You won\'t believe this hack…"'
    }, {
      n: "BEAT 02",
      l: "Pour shot · macro · 2.5s"
    }, {
      n: "BEAT 03",
      l: "Reaction · split-screen"
    }, {
      n: "BEAT 04",
      l: "CTA · brand-colour text"
    }].map(b => /*#__PURE__*/React.createElement("div", {
      key: b.n,
      className: "beat"
    }, /*#__PURE__*/React.createElement("div", {
      className: "num"
    }, b.n), /*#__PURE__*/React.createElement("div", {
      className: "thumb"
    }), /*#__PURE__*/React.createElement("div", {
      className: "label"
    }, b.l))))
  })))
});
const SwipeModule = () => /*#__PURE__*/React.createElement(Module, {
  id: "swipe",
  eyebrow: "REMIX / SWIPE FILES",
  title: "Save the ads that work. Brief the ones that beat them.",
  italicWord: "that beat them.",
  lede: "Build a library of every ad worth stealing from. Then turn any of them into a brief in one click.",
  feats: [{
    title: "Save from anywhere.",
    body: "Chrome extension, mobile app, paste a URL. Save TikTok, Meta, organic, competitors — anything that's working."
  }, {
    title: "Tag by hook, format, or angle.",
    body: "Find the right reference in seconds. \"Every UGC ad that opened with a problem hook\" — done."
  }, {
    title: "One click from swipe to brief.",
    body: "Drag an ad into a brief and Brieflee writes the brief around it."
  }],
  ctas: "See remix in action",
  visual: /*#__PURE__*/React.createElement("div", {
    className: "frame swipe-frame"
  }, /*#__PURE__*/React.createElement("div", {
    className: "frame-bar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "title-label"
  }, "swipe file \xB7 skincare-spring \xB7 124 ads")), /*#__PURE__*/React.createElement("div", {
    className: "frame-body"
  }, /*#__PURE__*/React.createElement(VideoSlot, {
    src: DEMOS.swipe,
    label: "Swipe files demo",
    placeholder: /*#__PURE__*/React.createElement("div", {
      className: "swipe-grid"
    }, [1, 2, 3, 4, 5, 6].map((i, idx) => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "swipe-card"
    }, /*#__PURE__*/React.createElement("span", {
      className: "tag"
    }, ["Hook · prob", "Demo", "UGC", "B-roll", "Founder", "Hook · stat"][idx]), /*#__PURE__*/React.createElement("span", {
      className: "src"
    }, ["TikTok", "Meta", "TikTok", "Reels", "TikTok", "Shorts"][idx]))))
  })))
});

// ============================================================
// REVIEW modules
// ============================================================
const AIReviewModule = () => /*#__PURE__*/React.createElement(Module, {
  id: "ai-review",
  eyebrow: "AI VIDEO REVIEW",
  title: "AI watches every video so you only watch what matters.",
  italicWord: "only watch what matters.",
  lede: "Brieflee's AI reviews every submission against your brief the moment a creator uploads. By the time you open the dashboard, the obvious passes and obvious rejects are already sorted.",
  feats: [{
    title: "Reviewed against your actual brief.",
    body: "Not generic. The AI checks the exact hooks, requirements, and must-haves you wrote in the brief."
  }, {
    title: "Three review modes.",
    body: "Autonomous (AI decides), manual (you decide), or hybrid (AI does the first pass, you sign off)."
  }, {
    title: "Frame-accurate flags.",
    body: "The AI tells you the exact second the hook stalls, the disclaimer cuts, or the wrong product appears."
  }],
  ctas: "See AI review in action",
  visual: /*#__PURE__*/React.createElement("div", {
    className: "frame review-frame"
  }, /*#__PURE__*/React.createElement("div", {
    className: "frame-bar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "title-label"
  }, "ai review \xB7 creator @maya.mae \xB7 v2")), /*#__PURE__*/React.createElement("div", {
    className: "frame-body"
  }, /*#__PURE__*/React.createElement(VideoSlot, {
    src: DEMOS.aiReview,
    label: "AI review demo",
    placeholder: /*#__PURE__*/React.createElement("div", {
      className: "panes"
    }, /*#__PURE__*/React.createElement("div", {
      className: "player"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ts"
    }, "00:08"), /*#__PURE__*/React.createElement("div", {
      className: "scrub"
    }), /*#__PURE__*/React.createElement("span", {
      className: "marker m1"
    }), /*#__PURE__*/React.createElement("span", {
      className: "marker m2"
    }), /*#__PURE__*/React.createElement("span", {
      className: "marker m3"
    })), /*#__PURE__*/React.createElement("div", {
      className: "checklist"
    }, /*#__PURE__*/React.createElement("div", {
      className: "check-row pass"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ico"
    }, /*#__PURE__*/React.createElement(window.IconCheck, {
      size: 9
    })), "Hook in < 3s", /*#__PURE__*/React.createElement("span", {
      className: "ts"
    }, "00:01")), /*#__PURE__*/React.createElement("div", {
      className: "check-row pass"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ico"
    }, /*#__PURE__*/React.createElement(window.IconCheck, {
      size: 9
    })), "Brand colour visible", /*#__PURE__*/React.createElement("span", {
      className: "ts"
    }, "00:04")), /*#__PURE__*/React.createElement("div", {
      className: "check-row warn"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ico"
    }, /*#__PURE__*/React.createElement(window.IconFlag, {
      size: 9
    })), "Disclaimer cut", /*#__PURE__*/React.createElement("span", {
      className: "ts"
    }, "00:08")), /*#__PURE__*/React.createElement("div", {
      className: "check-row pass"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ico"
    }, /*#__PURE__*/React.createElement(window.IconCheck, {
      size: 9
    })), "CTA present", /*#__PURE__*/React.createElement("span", {
      className: "ts"
    }, "00:13")), /*#__PURE__*/React.createElement("div", {
      className: "check-row fail"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ico"
    }, /*#__PURE__*/React.createElement(window.IconClose, {
      size: 9
    })), "Competitor logo", /*#__PURE__*/React.createElement("span", {
      className: "ts"
    }, "00:17"))))
  })))
});
const QAModule = () => /*#__PURE__*/React.createElement(Module, {
  id: "qa",
  reverse: true,
  eyebrow: "AI QA CHECKLIST",
  title: "Off-brand, off-brief, off-spec. Flagged before you watch.",
  italicWord: "before you watch.",
  lede: "Set your rules once. Brieflee enforces them on every video forever after.",
  feats: [{
    title: "Brand guidelines, automatically checked.",
    body: "Logo present? Disclaimer in frame? Wrong colour way? The AI flags the exact second."
  }, {
    title: "Custom checks per brand or campaign.",
    body: "Different rules for different products, platforms, ad accounts. All saved, all reusable."
  }, {
    title: "Pass / fail summary on every submission.",
    body: "You see the result in the dashboard. The creator gets specific notes on what to fix."
  }],
  ctas: "See QA in action",
  visual: /*#__PURE__*/React.createElement("div", {
    className: "frame qa-frame"
  }, /*#__PURE__*/React.createElement("div", {
    className: "frame-bar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "title-label"
  }, "qa \xB7 spring-launch \xB7 23 of 24 passed")), /*#__PURE__*/React.createElement("div", {
    className: "frame-body"
  }, /*#__PURE__*/React.createElement(VideoSlot, {
    src: DEMOS.qa,
    label: "QA demo",
    placeholder: /*#__PURE__*/React.createElement("div", {
      className: "qa-grid"
    }, /*#__PURE__*/React.createElement("div", {
      className: "qa-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "label"
    }, "Brand match"), /*#__PURE__*/React.createElement("div", {
      className: "val pass"
    }, "96%"), /*#__PURE__*/React.createElement("div", {
      className: "meter pass"
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        "--w": "96%"
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "desc"
    }, "Logo present, brand colour in frame for 11.4s of 15s.")), /*#__PURE__*/React.createElement("div", {
      className: "qa-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "label"
    }, "Hook strength"), /*#__PURE__*/React.createElement("div", {
      className: "val pass"
    }, "A"), /*#__PURE__*/React.createElement("div", {
      className: "meter pass"
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        "--w": "92%"
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "desc"
    }, "Pattern interrupt at 00:01. Question hook + visual.")), /*#__PURE__*/React.createElement("div", {
      className: "qa-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "label"
    }, "Disclaimer"), /*#__PURE__*/React.createElement("div", {
      className: "val fail"
    }, "Missing"), /*#__PURE__*/React.createElement("div", {
      className: "meter fail"
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        "--w": "15%"
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "desc"
    }, "Required on every claim. Auto-revision sent.")), /*#__PURE__*/React.createElement("div", {
      className: "qa-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "label"
    }, "Spec compliance"), /*#__PURE__*/React.createElement("div", {
      className: "val warn"
    }, "2 issues"), /*#__PURE__*/React.createElement("div", {
      className: "meter warn"
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        "--w": "70%"
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "desc"
    }, "9:16 \u2713 \xB7 captions \u2713 \xB7 length 0:18 (max 0:15)")))
  })))
});
const RevisionsModule = () => /*#__PURE__*/React.createElement(Module, {
  id: "revisions",
  eyebrow: "REVISIONS",
  title: "Send precise feedback. Get the right fix the first time.",
  italicWord: "the first time.",
  lede: "No more 'can we tweak the hook' with no context. Click the exact frame. Tell the creator what's wrong. Track every fix.",
  feats: [{
    title: "Frame-accurate comments.",
    body: "Tap the second something's off and leave a note. Creators see exactly what you're talking about."
  }, {
    title: "Auto-revision requests.",
    body: "The AI catches the issue, suggests the fix, and the creator gets the revision request automatically."
  }, {
    title: "Every revision tracked.",
    body: "See every version of every video. Compare v1 and v3 side by side. Never lose track of what was approved or why."
  }],
  ctas: "See revisions in action",
  visual: /*#__PURE__*/React.createElement("div", {
    className: "frame rev-frame"
  }, /*#__PURE__*/React.createElement("div", {
    className: "frame-bar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "title-label"
  }, "revisions \xB7 maya-serum-hook \xB7 3 versions")), /*#__PURE__*/React.createElement("div", {
    className: "frame-body"
  }, /*#__PURE__*/React.createElement(VideoSlot, {
    src: DEMOS.revisions,
    label: "Revisions demo",
    placeholder: /*#__PURE__*/React.createElement("div", {
      className: "rev-list"
    }, /*#__PURE__*/React.createElement("div", {
      className: "rev-item"
    }, /*#__PURE__*/React.createElement("div", {
      className: "v"
    }, "v1"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "title"
    }, "Maya \xB7 Serum hook \xB7 v1"), /*#__PURE__*/React.createElement("div", {
      className: "meta"
    }, "Disclaimer cut at 00:08 \xB7 auto-revision requested")), /*#__PURE__*/React.createElement("span", {
      className: "status rev"
    }, "Revise")), /*#__PURE__*/React.createElement("div", {
      className: "rev-item"
    }, /*#__PURE__*/React.createElement("div", {
      className: "v"
    }, "v2"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "title"
    }, "Maya \xB7 Serum hook \xB7 v2"), /*#__PURE__*/React.createElement("div", {
      className: "meta"
    }, "\"Tighten the pause before CTA\" \u2014 Sara, 2h ago")), /*#__PURE__*/React.createElement("span", {
      className: "status rev"
    }, "Revise")), /*#__PURE__*/React.createElement("div", {
      className: "rev-item"
    }, /*#__PURE__*/React.createElement("div", {
      className: "v"
    }, "v3"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "title"
    }, "Maya \xB7 Serum hook \xB7 v3"), /*#__PURE__*/React.createElement("div", {
      className: "meta"
    }, "All checks pass. Ready for ad account.")), /*#__PURE__*/React.createElement("span", {
      className: "status app"
    }, "Approved")))
  })))
});

// ============================================================
// STAT CALLOUT
// ============================================================
const STAT_COPIES = {
  turnaround: {
    num: /*#__PURE__*/React.createElement(React.Fragment, null, "2", /*#__PURE__*/React.createElement("span", {
      className: "it"
    }, "\xD7")),
    sub: "Teams using Brieflee cut their UGC turnaround time in half.",
    src: "Internal customer data · Q1 2026"
  },
  replace: {
    num: /*#__PURE__*/React.createElement(React.Fragment, null, "4", /*#__PURE__*/React.createElement("span", {
      className: "it"
    }, "+")),
    sub: "Tools and 11 Slack threads, replaced per project.",
    src: "Average across 40 customer workspaces"
  },
  speed: {
    num: "3 days",
    sub: "From brief to first creator submission. Not three weeks.",
    src: "Median across active customers"
  }
};
const STAT_COPIES_2 = {
  auto: {
    num: /*#__PURE__*/React.createElement(React.Fragment, null, "80", /*#__PURE__*/React.createElement("span", {
      className: "it"
    }, "%")),
    sub: "of UGC videos auto-approved before a human watches.",
    src: "Across 21,000 submissions reviewed by Brieflee AI"
  },
  catch: {
    num: "100%",
    sub: "of off-brand content caught. Manually impossible. Automatically routine.",
    src: "Benchmarked against manual reviewers, n=1,200"
  },
  volume: {
    num: /*#__PURE__*/React.createElement(React.Fragment, null, "3", /*#__PURE__*/React.createElement("span", {
      className: "it"
    }, "\xD7")),
    sub: "more UGC reviewed by the same team. Same hours.",
    src: "Average uplift, agencies on the Growth plan"
  }
};
const Stat = ({
  copyKey,
  set,
  light
}) => {
  const c = set[copyKey] || Object.values(set)[0];
  return /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement("div", {
    className: `stat-callout ${light ? "light" : ""}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, c.num), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, c.sub), /*#__PURE__*/React.createElement("div", {
    className: "src"
  }, c.src)));
};

// ============================================================
// AUDIENCE
// ============================================================
const Audience = () => /*#__PURE__*/React.createElement("section", {
  className: "audience shell"
}, /*#__PURE__*/React.createElement("div", {
  className: "section-head"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "eyebrow",
  style: {
    marginBottom: 18
  }
}, "Built for how you work"), /*#__PURE__*/React.createElement("h2", {
  className: "h-section"
}, "One workflow,", /*#__PURE__*/React.createElement("br", null), "three ", /*#__PURE__*/React.createElement("span", {
  className: "it"
}, "kinds of teams.")))), /*#__PURE__*/React.createElement("div", {
  className: "aud-grid"
}, /*#__PURE__*/React.createElement("div", {
  className: "aud-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "hdr"
}, /*#__PURE__*/React.createElement("div", {
  className: "ico"
}, /*#__PURE__*/React.createElement(window.IconShop, {
  size: 20
})), /*#__PURE__*/React.createElement("div", {
  className: "label"
}, "FOR D2C BRANDS")), /*#__PURE__*/React.createElement("h3", null, "Run 50 UGC videos a week without ", /*#__PURE__*/React.createElement("span", {
  className: "it"
}, "burning out"), " your creative lead."), /*#__PURE__*/React.createElement("p", null, "Every brand guideline, every brief, every revision, all automated."), /*#__PURE__*/React.createElement("div", {
  className: "cta"
}, /*#__PURE__*/React.createElement("a", {
  className: "btn-link",
  href: "#"
}, "For D2C \u2192"))), /*#__PURE__*/React.createElement("div", {
  className: "aud-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "hdr"
}, /*#__PURE__*/React.createElement("div", {
  className: "ico"
}, /*#__PURE__*/React.createElement(window.IconPhone, {
  size: 20
})), /*#__PURE__*/React.createElement("div", {
  className: "label"
}, "FOR APP MARKETERS")), /*#__PURE__*/React.createElement("h3", null, "Localised UGC. Multiple ad accounts. ", /*#__PURE__*/React.createElement("span", {
  className: "it"
}, "Hundreds"), " of creators."), /*#__PURE__*/React.createElement("p", null, "Brieflee scales to whatever you're shipping \u2014 across markets, platforms, and creator rosters."), /*#__PURE__*/React.createElement("div", {
  className: "cta"
}, /*#__PURE__*/React.createElement("a", {
  className: "btn-link",
  href: "#"
}, "For Apps \u2192"))), /*#__PURE__*/React.createElement("div", {
  className: "aud-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "hdr"
}, /*#__PURE__*/React.createElement("div", {
  className: "ico"
}, /*#__PURE__*/React.createElement(window.IconTeam, {
  size: 20
})), /*#__PURE__*/React.createElement("div", {
  className: "label"
}, "FOR CREATOR AGENCIES")), /*#__PURE__*/React.createElement("h3", null, "Manage 10 clients ", /*#__PURE__*/React.createElement("span", {
  className: "it"
}, "without 10 Slacks.")), /*#__PURE__*/React.createElement("p", null, "One workspace per client. All the briefs, reviews, and approvals in one place."), /*#__PURE__*/React.createElement("div", {
  className: "cta"
}, /*#__PURE__*/React.createElement("a", {
  className: "btn-link",
  href: "#"
}, "For Agencies \u2192")))));

// ============================================================
// TESTIMONIALS
// ============================================================
const TESTIS = [{
  q: /*#__PURE__*/React.createElement(React.Fragment, null, "We were running UGC out of Slack and Notion. Brieflee replaced both and ", /*#__PURE__*/React.createElement("span", {
    className: "it"
  }, "cut our review time in half.")),
  name: "Sarah Lin",
  role: "Head of Creative, glowlab",
  initials: "SL"
}, {
  q: /*#__PURE__*/React.createElement(React.Fragment, null, "I sleep better knowing every video gets QA'd before it lands in my queue. The ", /*#__PURE__*/React.createElement("span", {
    className: "it"
  }, "off-brand catches"), " alone pay for it."),
  name: "Marcus Ade",
  role: "UGC Lead, Halara",
  initials: "MA"
}, {
  q: /*#__PURE__*/React.createElement(React.Fragment, null, "Agencies don't have a Slack problem. We have a ", /*#__PURE__*/React.createElement("span", {
    className: "it"
  }, "tool-sprawl problem."), " Brieflee took six tools down to one."),
  name: "Priya Sharma",
  role: "Founder, Reel House",
  initials: "PS"
}];
const Testimonials = () => /*#__PURE__*/React.createElement("section", {
  className: "testimonials shell"
}, /*#__PURE__*/React.createElement("div", {
  className: "section-head"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "eyebrow",
  style: {
    marginBottom: 18
  }
}, "What operators say"), /*#__PURE__*/React.createElement("h2", {
  className: "h-section"
}, "Real teams,", /*#__PURE__*/React.createElement("br", null), "real ", /*#__PURE__*/React.createElement("span", {
  className: "it"
}, "turnaround.")))), /*#__PURE__*/React.createElement("div", {
  className: "test-grid"
}, TESTIS.map((t, i) => /*#__PURE__*/React.createElement("div", {
  key: i,
  className: "test-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "q"
}, "\"", t.q, "\""), /*#__PURE__*/React.createElement("div", {
  className: "who"
}, /*#__PURE__*/React.createElement("div", {
  className: "avatar"
}, t.initials), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "name"
}, t.name), /*#__PURE__*/React.createElement("div", {
  className: "role"
}, t.role)))))));

// ============================================================
// PRICING
// ============================================================
const TIERS = [{
  name: "Free",
  price: "$0",
  per: "forever",
  for: "Try the full workflow with one brief and one creator.",
  feats: ["1 active brief", "1 creator seat", "AI video review (10/mo)", "Swipe file (50 saves)"],
  cta: "Start free",
  featured: false
}, {
  name: "Starter",
  price: "$49",
  per: "/month",
  for: "For solo operators running their first creator program.",
  feats: ["5 active briefs", "5 creator seats", "AI review (100/mo)", "Full swipe file", "Email support"],
  cta: "Start free trial",
  featured: false
}, {
  name: "Growth",
  price: "$199",
  per: "/month",
  for: "For D2C and app teams scaling UGC to a few campaigns a week.",
  feats: ["Unlimited briefs", "20 creator seats", "AI review (1,000/mo)", "Custom QA checks", "Priority support"],
  cta: "Start free trial",
  featured: true
}, {
  name: "Agency",
  price: "Custom",
  per: "",
  for: "Multi-client workspaces. Volume creator rosters. SSO.",
  feats: ["Unlimited everything", "Per-client workspaces", "SSO & SCIM", "Dedicated CSM", "SLA"],
  cta: "Talk to sales",
  featured: false
}];
const Pricing = () => /*#__PURE__*/React.createElement("section", {
  className: "pricing shell"
}, /*#__PURE__*/React.createElement("div", {
  className: "section-head"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "eyebrow",
  style: {
    marginBottom: 18
  }
}, "Pricing"), /*#__PURE__*/React.createElement("h2", {
  className: "h-section"
}, "Priced to ", /*#__PURE__*/React.createElement("span", {
  className: "it"
}, "grow with you,"), /*#__PURE__*/React.createElement("br", null), "not box you in.")), /*#__PURE__*/React.createElement("p", {
  className: "lede right"
}, "Start free. Upgrade when you outgrow it. Cancel anytime \u2014 no annual lock-in for the first year.")), /*#__PURE__*/React.createElement("div", {
  className: "price-grid"
}, TIERS.map(t => /*#__PURE__*/React.createElement("div", {
  key: t.name,
  className: `price-card ${t.featured ? "featured" : ""}`
}, t.featured && /*#__PURE__*/React.createElement("span", {
  className: "badge"
}, "Most popular"), /*#__PURE__*/React.createElement("div", {
  className: "tier-name"
}, t.name), /*#__PURE__*/React.createElement("div", {
  className: "price"
}, t.price, /*#__PURE__*/React.createElement("span", {
  className: "per"
}, " ", t.per)), /*#__PURE__*/React.createElement("div", {
  className: "for"
}, t.for), /*#__PURE__*/React.createElement("div", {
  className: "feats"
}, t.feats.map(f => /*#__PURE__*/React.createElement("div", {
  key: f
}, /*#__PURE__*/React.createElement("span", {
  className: "check"
}, /*#__PURE__*/React.createElement(window.IconCheck, {
  size: 14
})), f))), /*#__PURE__*/React.createElement("a", {
  className: `btn ${t.featured ? "btn-accent" : "btn-ghost"}`,
  href: "#"
}, t.cta)))));

// ============================================================
// FINAL CTA
// ============================================================
const FinalCTA = () => /*#__PURE__*/React.createElement("section", {
  className: "shell"
}, /*#__PURE__*/React.createElement("div", {
  className: "final-cta"
}, /*#__PURE__*/React.createElement("h2", {
  className: "h-section"
}, "Stop running UGC", /*#__PURE__*/React.createElement("br", null), "out of ", /*#__PURE__*/React.createElement("span", {
  className: "it"
}, "Slack.")), /*#__PURE__*/React.createElement("p", {
  className: "lede",
  style: {
    textAlign: "center",
    margin: "22px auto 32px"
  }
}, "Start your free trial. No credit card. Set up your first brief in 5 minutes."), /*#__PURE__*/React.createElement("div", {
  className: "ctas"
}, /*#__PURE__*/React.createElement("a", {
  className: "btn btn-accent",
  href: "#"
}, "Start free trial ", /*#__PURE__*/React.createElement(window.IconArrow, {
  size: 16
})), /*#__PURE__*/React.createElement("a", {
  className: "btn btn-ghost",
  href: "#"
}, "Book a demo"))));

// ============================================================
// FOOTER
// ============================================================
const Footer = () => /*#__PURE__*/React.createElement("footer", {
  className: "footer"
}, /*#__PURE__*/React.createElement("div", {
  className: "shell"
}, /*#__PURE__*/React.createElement("div", {
  className: "foot-grid"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("a", {
  href: "#",
  className: "brand",
  style: {
    fontSize: 24
  }
}, /*#__PURE__*/React.createElement("span", null, "briefle"), /*#__PURE__*/React.createElement("span", {
  className: "smile"
}, "ee")), /*#__PURE__*/React.createElement("p", {
  style: {
    color: "var(--ink-500)",
    marginTop: 14,
    fontSize: 14,
    lineHeight: 1.5,
    maxWidth: 320
  }
}, "The UGC content review and creator workflow tool built for short-form.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", null, "Product"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: "#briefs"
}, "Briefs")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: "#storyboard"
}, "Storyboard")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: "#swipe"
}, "Remix / Swipe")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: "#ai-review"
}, "AI Video Review")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: "#qa"
}, "AI QA Checklist")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: "#revisions"
}, "Revisions")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", null, "Solutions"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "For D2C brands")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "For App marketers")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "For Agencies")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Frame.io alternative")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", null, "Resources"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "UGC brief template")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Blog")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Help center")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Changelog")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", null, "Company"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "About")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Customers")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Pricing")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Contact"))))), /*#__PURE__*/React.createElement("div", {
  className: "foot-bottom"
}, /*#__PURE__*/React.createElement("div", null, "\xA9 2026 BRIEFLEE INC."), /*#__PURE__*/React.createElement("div", null, "BRIEF \xB7 REVIEW \xB7 APPROVE"))));

// ============================================================
// EXPORT TO WINDOW
// ============================================================
Object.assign(window, {
  Nav,
  Hero,
  Trust,
  Overview,
  Contrast,
  CatBanner,
  BriefsModule,
  StoryboardModule,
  SwipeModule,
  AIReviewModule,
  QAModule,
  RevisionsModule,
  Stat,
  STAT_COPIES,
  STAT_COPIES_2,
  Audience,
  Testimonials,
  Pricing,
  FinalCTA,
  Footer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "sections.jsx", error: String((e && e.message) || e) }); }

// src/PersonalizeStep.jsx
try { (() => {
function PersonalizeStep({
  workTypeId,
  setWorkTypeId,
  heardAboutUsId,
  setHeardAboutUsId,
  onNext,
  onBack
}) {
  const {
    WORK_TYPE_OPTIONS,
    HEARD_FROM_OPTIONS
  } = window.Brieflee;
  const canNext = Boolean(workTypeId && heardAboutUsId);
  return /*#__PURE__*/React.createElement("div", {
    className: "gs-page gs-page-medium"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center mb-6"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gs-eyebrow"
  }, "Step 2 of 4 \xB7 Personalize"), /*#__PURE__*/React.createElement("h1", {
    className: "gs-headline"
  }, "Tell us about your work"), /*#__PURE__*/React.createElement("p", {
    className: "gs-sub"
  }, "We'll tune Brieflee's review thresholds, brief templates and onboarding examples to fit how you work.")), /*#__PURE__*/React.createElement("div", {
    className: "personalize-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "personalize-card",
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row gap-3 mb-4",
    style: {
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/looking-eyes.png",
    alt: "",
    style: {
      width: 40,
      height: 40,
      marginTop: -4,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: "var(--bl-fg)",
      textAlign: "left"
    }
  }, "Your work"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--bl-fg-muted)"
    }
  }, "What best describes you?"))), /*#__PURE__*/React.createElement("div", {
    className: "row gap-2",
    style: {
      flexWrap: "wrap",
      textAlign: "justify"
    }
  }, WORK_TYPE_OPTIONS.map(opt => {
    const sel = workTypeId === opt.id;
    return /*#__PURE__*/React.createElement("button", {
      key: opt.id,
      className: "opt-chip" + (sel ? " selected" : ""),
      onClick: () => setWorkTypeId(opt.id)
    }, sel && /*#__PURE__*/React.createElement(Icons.Check, {
      size: 12,
      strokeWidth: 3
    }), opt.label);
  }))), /*#__PURE__*/React.createElement("div", {
    className: "personalize-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row gap-3 mb-4",
    style: {
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/eyes-blue.png",
    alt: "",
    style: {
      width: 40,
      height: 40,
      marginTop: -4,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: "var(--bl-fg)",
      lineHeight: 1.3
    }
  }, "How did you find us?"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--bl-fg-muted)"
    }
  }, "Helps us know what's working."))), /*#__PURE__*/React.createElement("div", {
    className: "row gap-2",
    style: {
      flexWrap: "wrap"
    }
  }, HEARD_FROM_OPTIONS.map(opt => {
    const sel = heardAboutUsId === opt.id;
    return /*#__PURE__*/React.createElement("button", {
      key: opt.id,
      className: "opt-chip" + (sel ? " selected" : ""),
      onClick: () => setHeardAboutUsId(opt.id)
    }, sel && /*#__PURE__*/React.createElement(Icons.Check, {
      size: 12,
      strokeWidth: 3
    }), opt.label);
  })))), /*#__PURE__*/React.createElement("div", {
    className: "nav-row"
  }, /*#__PURE__*/React.createElement("button", {
    className: "bl-btn bl-btn-ghost",
    onClick: onBack
  }, /*#__PURE__*/React.createElement(Icons.ArrowLeft, {
    size: 14
  }), " Back"), /*#__PURE__*/React.createElement("button", {
    className: "bl-btn bl-btn-primary" + (canNext ? " pulse" : ""),
    onClick: onNext,
    disabled: !canNext
  }, "Continue ", /*#__PURE__*/React.createElement(Icons.ArrowRight, {
    size: 14
  }))));
}
window.PersonalizeStep = PersonalizeStep;
})(); } catch (e) { __ds_ns.__errors.push({ path: "src/PersonalizeStep.jsx", error: String((e && e.message) || e) }); }

// src/PricingStep.jsx
try { (() => {
function PricingStep({
  billingInterval,
  setBillingInterval,
  selectedPlanId,
  setSelectedPlanId,
  onNext,
  onBack,
  tweaks = {}
}) {
  const {
    PLANS: BASE_PLANS,
    FEATURES,
    MAX_YEARLY_SAVINGS,
    yearlySavingsPct,
    TRIAL_FEATURES,
    SOCIAL_LOGOS
  } = window.Brieflee;
  const trialDays = tweaks.trialDays || 7;
  const popularId = tweaks.popularPlan || "crew";
  const PLANS = BASE_PLANS.map(p => ({
    ...p,
    popular: p.id === popularId
  }));
  const canNext = Boolean(selectedPlanId);
  const selectedPlan = PLANS.find(p => p.id === selectedPlanId);
  return /*#__PURE__*/React.createElement("div", {
    className: "gs-page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center mb-6"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-block"
    },
    className: "trial-banner"
  }, /*#__PURE__*/React.createElement("span", {
    className: "trial-dot"
  }), trialDays, " days free \xB7 No charge until your trial ends"), /*#__PURE__*/React.createElement("h1", {
    className: "gs-headline"
  }, tweaks.headline || "Pick the plan that fits your team"), /*#__PURE__*/React.createElement("p", {
    className: "gs-sub"
  }, "All plans include the full Brieflee toolkit. Cancel any time during your trial with one click."), /*#__PURE__*/React.createElement("div", {
    className: "mt-6"
  }, /*#__PURE__*/React.createElement(IntervalToggle, {
    value: billingInterval,
    onChange: setBillingInterval,
    maxSavings: MAX_YEARLY_SAVINGS
  }))), /*#__PURE__*/React.createElement("div", {
    className: "plan-grid mt-8"
  }, PLANS.map(p => {
    const selected = selectedPlanId === p.id;
    const isYearly = billingInterval === "Yearly";
    const monthlyEquivalent = isYearly ? Math.round(p.yearly / 12) : p.monthly;
    const billNote = isYearly ? `Billed $${p.yearly.toLocaleString()} per year` : "Billed monthly";
    const savings = isYearly ? yearlySavingsPct(p) : 0;
    const cls = "plan-card" + (p.popular ? " popular" : "") + (selected ? " selected" : "");
    return /*#__PURE__*/React.createElement("div", {
      key: p.id,
      className: cls,
      onClick: () => setSelectedPlanId(p.id)
    }, p.popular && /*#__PURE__*/React.createElement("div", {
      className: "plan-popular-tag"
    }, "Most popular"), /*#__PURE__*/React.createElement("div", {
      className: "plan-tier"
    }, p.tier), /*#__PURE__*/React.createElement("div", {
      className: "plan-name"
    }, "For ", p.tier === "Creator" ? "solos" : p.tier === "Crew" ? "growing teams" : "agencies"), /*#__PURE__*/React.createElement("div", {
      className: "plan-desc"
    }, p.desc), /*#__PURE__*/React.createElement("div", {
      className: "plan-price-row"
    }, /*#__PURE__*/React.createElement("span", {
      className: "plan-price"
    }, "$", monthlyEquivalent), /*#__PURE__*/React.createElement("span", {
      className: "plan-price-suffix"
    }, "/mo")), /*#__PURE__*/React.createElement("div", {
      className: "plan-bill-note"
    }, billNote), savings > 0 ? /*#__PURE__*/React.createElement("span", {
      className: "plan-savings"
    }, /*#__PURE__*/React.createElement(Icons.Zap, {
      size: 11
    }), " Save ", savings, "% vs monthly") : /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-block",
        height: 22
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "plan-divider"
    }), /*#__PURE__*/React.createElement("ul", {
      className: "plan-feature-list"
    }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", {
      className: "plan-check"
    }, /*#__PURE__*/React.createElement(Icons.Check, {
      size: 11,
      strokeWidth: 3
    })), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, p.maxVideos), " videos reviewed / mo")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", {
      className: "plan-check"
    }, /*#__PURE__*/React.createElement(Icons.Check, {
      size: 11,
      strokeWidth: 3
    })), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, p.maxUsers), " ", p.maxUsers === 1 ? "seat" : "seats", ", ", /*#__PURE__*/React.createElement("strong", null, p.maxWorkspaces), " ", p.maxWorkspaces === 1 ? "workspace" : "workspaces")), FEATURES.map(f => /*#__PURE__*/React.createElement("li", {
      key: f.key
    }, /*#__PURE__*/React.createElement("span", {
      className: "plan-check"
    }, /*#__PURE__*/React.createElement(Icons.Check, {
      size: 11,
      strokeWidth: 3
    })), /*#__PURE__*/React.createElement("span", null, f.label))), p.extras.map(x => /*#__PURE__*/React.createElement("li", {
      key: x
    }, /*#__PURE__*/React.createElement("span", {
      className: "plan-check",
      style: {
        background: "var(--bl-periwinkle)",
        color: "var(--bl-blue)"
      }
    }, /*#__PURE__*/React.createElement(Icons.Sparkles, {
      size: 11
    })), /*#__PURE__*/React.createElement("span", null, x)))), /*#__PURE__*/React.createElement("div", {
      className: "plan-cta"
    }, selected ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Icons.Check, {
      size: 14,
      strokeWidth: 3
    }), " \xA0Selected") : `Start ${trialDays}-day free trial`));
  })), tweaks.showTrustStrip !== false && /*#__PURE__*/React.createElement("div", {
    className: "trust-strip"
  }, TRIAL_FEATURES.map(t => /*#__PURE__*/React.createElement("div", {
    className: "trust-item",
    key: t.title
  }, /*#__PURE__*/React.createElement("img", {
    src: t.sticker,
    alt: "",
    style: {
      width: 32,
      height: 32,
      flexShrink: 0,
      borderStyle: "solid",
      borderWidth: "0px",
      objectFit: "cover",
      borderRadius: "4px"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "trust-text"
  }, /*#__PURE__*/React.createElement("strong", null, t.title), t.body)))), tweaks.showLogoStrip !== false && /*#__PURE__*/React.createElement("div", {
    className: "text-center mt-10"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--bl-fg-muted)",
      fontWeight: 700
    }
  }, "Trusted by 10,000+ growth teams and agencies"), /*#__PURE__*/React.createElement("div", {
    className: "logo-strip"
  }, SOCIAL_LOGOS.map(l => /*#__PURE__*/React.createElement("span", {
    key: l
  }, l)))), /*#__PURE__*/React.createElement("div", {
    className: "sticky-cta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row gap-3"
  }, /*#__PURE__*/React.createElement("button", {
    className: "bl-btn bl-btn-ghost",
    onClick: onBack
  }, /*#__PURE__*/React.createElement(Icons.ArrowLeft, {
    size: 14
  }), " Back"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--bl-fg-muted)"
    }
  }, selectedPlan ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "var(--bl-fg)"
    }
  }, selectedPlan.tier), " \xB7 $", billingInterval === "Yearly" ? Math.round(selectedPlan.yearly / 12) : selectedPlan.monthly, "/mo \xB7 ", trialDays, " days free") : /*#__PURE__*/React.createElement(React.Fragment, null, "Pick a plan to continue \xB7 You won't be charged today"))), /*#__PURE__*/React.createElement("button", {
    className: "bl-btn bl-btn-primary" + (canNext ? " pulse" : ""),
    onClick: onNext,
    disabled: !canNext
  }, "Continue to checkout ", /*#__PURE__*/React.createElement(Icons.ArrowRight, {
    size: 14
  }))));
}
function IntervalToggle({
  value,
  onChange,
  maxSavings
}) {
  const opts = ["Monthly", "Yearly"];
  return /*#__PURE__*/React.createElement("div", {
    className: "interval-toggle"
  }, opts.map(o => {
    const active = value === o;
    return /*#__PURE__*/React.createElement("button", {
      key: o,
      className: active ? "active" : "",
      onClick: () => onChange(o)
    }, o, o === "Yearly" && maxSavings > 0 && /*#__PURE__*/React.createElement("span", {
      className: "save-pill"
    }, "Save ", maxSavings, "%"));
  }));
}
window.PricingStep = PricingStep;
})(); } catch (e) { __ds_ns.__errors.push({ path: "src/PricingStep.jsx", error: String((e && e.message) || e) }); }

// tweaks-panel.jsx
try { (() => {
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;width:100%;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : {
      [keyOrEdits]: val
    };
    setValues(prev => ({
      ...prev,
      ...edits
    }));
    window.parent.postMessage({
      type: '__edit_mode_set_keys',
      edits
    }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', {
      detail: edits
    }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({
  title = 'Tweaks',
  noDeckControls = false,
  children
}) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  // Auto-inject a rail toggle when a <deck-stage> is on the page. The
  // toggle drives the deck's per-viewer _railVisible via window message;
  // state is mirrored from the same localStorage key the deck reads so
  // the control reflects reality across reloads. The mechanism is the
  // message — authors who want custom placement can post it directly
  // and pass noDeckControls to suppress this one.
  const hasDeckStage = React.useMemo(() => typeof document !== 'undefined' && !!document.querySelector('deck-stage'), []);
  // Hide the toggle until the host has actually enabled the rail (the
  // __omelette_rail_enabled window message, posted only when the
  // omelette_deck_rail_enabled flag is on for this user). The initial read
  // covers TweaksPanel mounting after the message already arrived; the
  // listener covers the common case of mounting first.
  const [railEnabled, setRailEnabled] = React.useState(() => hasDeckStage && !!document.querySelector('deck-stage')?._railEnabled);
  React.useEffect(() => {
    if (!hasDeckStage || railEnabled) return undefined;
    const onMsg = e => {
      if (e.data && e.data.type === '__omelette_rail_enabled') setRailEnabled(true);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [hasDeckStage, railEnabled]);
  const [railVisible, setRailVisible] = React.useState(() => {
    try {
      return localStorage.getItem('deck-stage.railVisible') !== '0';
    } catch (e) {
      return true;
    }
  });
  const toggleRail = on => {
    setRailVisible(on);
    window.postMessage({
      type: '__deck_rail_visible',
      on
    }, '*');
  };
  const offsetRef = React.useRef({
    x: 16,
    y: 16
  });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth,
      h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = e => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({
      type: '__edit_mode_available'
    }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({
      type: '__edit_mode_dismissed'
    }, '*');
  };
  const onDragStart = e => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX,
      sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = ev => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, __TWEAKS_STYLE), /*#__PURE__*/React.createElement("div", {
    ref: dragRef,
    className: "twk-panel",
    "data-noncommentable": "",
    style: {
      right: offsetRef.current.x,
      bottom: offsetRef.current.y
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-hd",
    onMouseDown: onDragStart
  }, /*#__PURE__*/React.createElement("b", null, title), /*#__PURE__*/React.createElement("button", {
    className: "twk-x",
    "aria-label": "Close tweaks",
    onMouseDown: e => e.stopPropagation(),
    onClick: dismiss
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "twk-body"
  }, children, hasDeckStage && railEnabled && !noDeckControls && /*#__PURE__*/React.createElement(TweakSection, {
    label: "Deck"
  }, /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Thumbnail rail",
    value: railVisible,
    onChange: toggleRail
  })))));
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "twk-sect"
  }, label), children);
}
function TweakRow({
  label,
  value,
  children,
  inline = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: inline ? 'twk-row twk-row-h' : 'twk-row'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label), value != null && /*#__PURE__*/React.createElement("span", {
    className: "twk-val"
  }, value)), children);
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label,
    value: `${value}${unit}`
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "twk-slider",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(Number(e.target.value))
  }));
}
function TweakToggle({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "twk-toggle",
    "data-on": value ? '1' : '0',
    role: "switch",
    "aria-checked": !!value,
    onClick: () => onChange(!value)
  }, /*#__PURE__*/React.createElement("i", null)));
}
function TweakRadio({
  label,
  value,
  options,
  onChange
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = o => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({
    2: 16,
    3: 10
  }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = s => {
      const m = options.find(o => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return /*#__PURE__*/React.createElement(TweakSelect, {
      label: label,
      value: value,
      options: options,
      onChange: s => onChange(resolve(s))
    });
  }
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;
  const segAt = clientX => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = e => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = ev => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    role: "radiogroup",
    onPointerDown: onPointerDown,
    className: dragging ? 'twk-seg dragging' : 'twk-seg'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-seg-thumb",
    style: {
      left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
      width: `calc((100% - 4px) / ${n})`
    }
  }), opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "radio",
    "aria-checked": o.value === value
  }, o.label))));
}
function TweakSelect({
  label,
  value,
  options,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("select", {
    className: "twk-field",
    value: value,
    onChange: e => onChange(e.target.value)
  }, options.map(o => {
    const v = typeof o === 'object' ? o.value : o;
    const l = typeof o === 'object' ? o.label : o;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })));
}
function TweakText({
  label,
  value,
  placeholder,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("input", {
    className: "twk-field",
    type: "text",
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakNumber({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange
}) {
  const clamp = n => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({
    x: 0,
    val: 0
  });
  const onScrubStart = e => {
    e.preventDefault();
    startRef.current = {
      x: e.clientX,
      val: value
    };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = ev => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-num"
  }, /*#__PURE__*/React.createElement("span", {
    className: "twk-num-lbl",
    onPointerDown: onScrubStart
  }, label), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: e => onChange(clamp(Number(e.target.value)))
  }), unit && /*#__PURE__*/React.createElement("span", {
    className: "twk-num-unit"
  }, unit));
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = n >> 16 & 255,
    g = n >> 8 & 255,
    b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}
const __TwkCheck = ({
  light
}) => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 14 14",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 7.2 5.8 10 11 4.2",
  fill: "none",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  stroke: light ? 'rgba(0,0,0,.78)' : '#fff'
}));

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({
  label,
  value,
  options,
  onChange
}) {
  if (!options || !options.length) {
    return /*#__PURE__*/React.createElement("div", {
      className: "twk-row twk-row-h"
    }, /*#__PURE__*/React.createElement("div", {
      className: "twk-lbl"
    }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("input", {
      type: "color",
      className: "twk-swatch",
      value: value,
      onChange: e => onChange(e.target.value)
    }));
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = o => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-chips",
    role: "radiogroup"
  }, options.map((o, i) => {
    const colors = Array.isArray(o) ? o : [o];
    const [hero, ...rest] = colors;
    const sup = rest.slice(0, 4);
    const on = key(o) === cur;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      type: "button",
      className: "twk-chip",
      role: "radio",
      "aria-checked": on,
      "data-on": on ? '1' : '0',
      "aria-label": colors.join(', '),
      title: colors.join(' · '),
      style: {
        background: hero
      },
      onClick: () => onChange(o)
    }, sup.length > 0 && /*#__PURE__*/React.createElement("span", null, sup.map((c, j) => /*#__PURE__*/React.createElement("i", {
      key: j,
      style: {
        background: c
      }
    }))), on && /*#__PURE__*/React.createElement(__TwkCheck, {
      light: __twkIsLight(hero)
    }));
  })));
}
function TweakButton({
  label,
  onClick,
  secondary = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: secondary ? 'twk-btn secondary' : 'twk-btn',
    onClick: onClick
  }, label);
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "tweaks-panel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/BriefCard.jsx
try { (() => {
function BriefCard({
  name,
  count,
  status
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      border: "1px solid var(--bl-border)",
      borderRadius: 14,
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      cursor: "pointer",
      transition: "all .2s"
    },
    onMouseEnter: e => e.currentTarget.style.boxShadow = "0 8px 20px -4px rgba(41,79,246,.15)",
    onMouseLeave: e => e.currentTarget.style.boxShadow = "none"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 10,
      background: "rgba(135,156,247,.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#294ff6"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h6"
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      padding: "3px 9px",
      borderRadius: 999,
      background: status === "live" ? "#f0fff4" : "#eef4fd",
      color: status === "live" ? "#166534" : "#001364"
    }
  }, status === "live" ? "Live" : "Draft")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: "0 0 4px",
      fontSize: 15,
      color: "var(--bl-fg)",
      fontWeight: 700
    }
  }, name), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12,
      color: "var(--bl-fg-muted)"
    }
  }, count, " videos \xB7 26 QA criteria")));
}
window.BriefCard = BriefCard;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/BriefCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Dropzone.jsx
try { (() => {
function Dropzone({
  active,
  onActivate,
  onDone
}) {
  if (!active) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onDone,
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,15,77,.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      backdropFilter: "blur(2px)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: "#fff",
      borderRadius: 24,
      padding: 40,
      width: 560,
      boxShadow: "0 32px 64px -16px rgba(0,15,77,.35)"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 6px",
      color: "var(--bl-fg)",
      fontSize: 20,
      fontWeight: 700
    }
  }, "Upload videos"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "0 0 22px",
      color: "var(--bl-fg-muted)",
      fontSize: 14
    }
  }, "Drop a CSV with public links, or upload files directly."), /*#__PURE__*/React.createElement("div", {
    style: {
      border: "2px dashed var(--bl-border)",
      borderRadius: 16,
      padding: 32,
      textAlign: "center",
      background: "#fafbff"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 56,
      borderRadius: 14,
      background: "#eef4fd",
      color: "#879cf7",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "7 10 12 15 17 10"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "15",
    x2: "12",
    y2: "3"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: "var(--bl-fg)",
      marginBottom: 4
    }
  }, "Drop your video files here"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--bl-fg-muted)",
      marginBottom: 14
    }
  }, "or click to browse from your computer"), /*#__PURE__*/React.createElement("button", {
    onClick: onDone,
    style: {
      background: "#879cf7",
      color: "#fff",
      border: "none",
      padding: "10px 20px",
      borderRadius: 10,
      fontWeight: 600,
      fontSize: 13,
      cursor: "pointer"
    }
  }, "Use sample data"))));
}
window.Dropzone = Dropzone;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Dropzone.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/ReviewTable.jsx
try { (() => {
function ReviewTable({
  rows,
  empty
}) {
  if (empty) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff",
        borderRadius: 16,
        border: "1px solid var(--bl-border)",
        padding: "72px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/illustrations/looking-eyes.png",
      alt: "",
      style: {
        width: 80,
        marginBottom: 14,
        opacity: .9
      }
    }), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: 18,
        color: "var(--bl-fg)",
        margin: "0 0 6px"
      }
    }, "No videos yet"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--bl-fg-muted)",
        margin: 0,
        fontSize: 14
      }
    }, "Click \"Upload videos\" above to drop a CSV or pull from Drive."));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      borderRadius: 16,
      border: "1px solid var(--bl-border)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: "#fafbff",
      borderBottom: "1px solid var(--bl-border)"
    }
  }, ["Creator & video", "Brief", "Score", "Hook", "Audio", "Length", "Uploaded"].map(h => /*#__PURE__*/React.createElement("th", {
    key: h,
    style: {
      textAlign: "left",
      padding: "12px 16px",
      fontSize: 11,
      color: "var(--bl-fg-muted)",
      textTransform: "uppercase",
      letterSpacing: ".06em",
      fontWeight: 600
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    style: {
      borderBottom: i === rows.length - 1 ? "none" : "1px solid var(--bl-border)"
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "14px 16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 56,
      borderRadius: 8,
      background: `linear-gradient(135deg, ${r.thumbA}, ${r.thumbB})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "#fff"
  }, /*#__PURE__*/React.createElement("polygon", {
    points: "6 4 20 12 6 20 6 4"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--bl-fg)"
    }
  }, r.creator), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--bl-fg-muted)"
    }
  }, r.title)))), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "14px 16px",
      fontSize: 13,
      color: "var(--bl-fg)"
    }
  }, r.brief), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "14px 16px"
    }
  }, /*#__PURE__*/React.createElement(ScoreCell, {
    score: r.score,
    status: r.status
  })), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "14px 16px",
      fontSize: 13,
      color: "var(--bl-fg)"
    }
  }, r.hook), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "14px 16px",
      fontSize: 13,
      color: "var(--bl-fg)"
    }
  }, r.audio), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "14px 16px",
      fontSize: 13,
      color: "var(--bl-fg)"
    }
  }, r.length), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "14px 16px",
      fontSize: 12,
      color: "var(--bl-fg-muted)"
    }
  }, r.up))))));
}
window.ReviewTable = ReviewTable;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/ReviewTable.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/ScoreCell.jsx
try { (() => {
function ScoreCell({
  score,
  status
}) {
  const color = score >= 85 ? "#294ff6" : score >= 70 ? "#f59e0b" : "#e63946";
  const pill = status === "approved" ? {
    bg: "#f0fff4",
    fg: "#166534",
    dot: "#38a169",
    label: "Approved"
  } : status === "pending" ? {
    bg: "#fffbeb",
    fg: "#92400e",
    dot: "#f59e0b",
    label: "Pending"
  } : status === "review" ? {
    bg: "#eef4fd",
    fg: "#001364",
    dot: "#7a93ff",
    label: "Needs review"
  } : {
    bg: "#fff1f2",
    fg: "#e63946",
    dot: "#e63946",
    label: "Rejected"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      borderRadius: 999,
      background: `conic-gradient(${color} 0 ${score}%, #eef4fd ${score}% 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 4,
      borderRadius: 999,
      background: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12,
      fontWeight: 800,
      color: "var(--bl-fg)"
    }
  }, score)), /*#__PURE__*/React.createElement("span", {
    style: {
      background: pill.bg,
      color: pill.fg,
      padding: "4px 10px",
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 600,
      display: "inline-flex",
      alignItems: "center",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 999,
      background: pill.dot
    }
  }), pill.label));
}
window.ScoreCell = ScoreCell;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/ScoreCell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Sidebar.jsx
try { (() => {
function Sidebar({
  active,
  onChange
}) {
  const items = [{
    id: "home",
    icon: "M3 12l9-9 9 9M5 10v10h14V10"
  }, {
    id: "briefs",
    icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h6"
  }, {
    id: "videos",
    icon: "M23 7l-7 5 7 5V7zM1 5h15v14H1z"
  }, {
    id: "creators",
    icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
  }, {
    id: "library",
    icon: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"
  }, {
    id: "settings",
    icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
  }];
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 64,
      background: "#fff",
      borderRight: "1px solid var(--bl-border)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "16px 0",
      gap: 6,
      position: "sticky",
      top: 0,
      height: "100vh"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logos/app-icon.png",
    alt: "Brieflee",
    style: {
      width: 36,
      height: 36,
      borderRadius: 10,
      marginBottom: 14,
      boxShadow: "0 4px 10px -2px rgba(41,79,246,.35)"
    }
  }), items.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.id,
    onClick: () => onChange(it.id),
    style: {
      width: 40,
      height: 40,
      borderRadius: 10,
      border: "none",
      background: active === it.id ? "rgba(135,156,247,.18)" : "transparent",
      color: active === it.id ? "#294ff6" : "#7a93ff",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all .2s"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: it.icon
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto",
      width: 36,
      height: 36,
      borderRadius: 999,
      background: "linear-gradient(135deg, #d9e0ff, #879cf7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontWeight: 700,
      fontSize: 13
    }
  }, "AB"));
}
window.Sidebar = Sidebar;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Sidebar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/TopBar.jsx
try { (() => {
function TopBar({
  workspace,
  onUpload
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      background: "#fff",
      borderBottom: "1px solid var(--bl-border)",
      padding: "14px 28px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      position: "sticky",
      top: 0,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 12px",
      background: "var(--bl-light-2)",
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 600,
      color: "var(--bl-fg)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 18,
      height: 18,
      borderRadius: 6,
      background: "linear-gradient(135deg,#7a93ff,#294ff6)"
    }
  }), workspace, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "6 9 12 15 18 9"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      position: "relative",
      maxWidth: 480
    }
  }, /*#__PURE__*/React.createElement("svg", {
    style: {
      position: "absolute",
      left: 12,
      top: "50%",
      transform: "translateY(-50%)",
      color: "#7a93ff"
    },
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m21 21-4.3-4.3"
  })), /*#__PURE__*/React.createElement("input", {
    placeholder: "Search briefs, creators, videos...",
    style: {
      width: "100%",
      border: "1.5px solid var(--bl-border)",
      borderRadius: 10,
      padding: "9px 12px 9px 36px",
      fontSize: 14,
      fontFamily: "inherit",
      background: "#fafbff",
      outline: "none"
    }
  })), /*#__PURE__*/React.createElement("button", {
    style: {
      background: "transparent",
      border: "1.5px solid var(--bl-border)",
      padding: "8px 14px",
      borderRadius: 10,
      color: "var(--bl-fg)",
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "7 10 12 15 17 10"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "15",
    x2: "12",
    y2: "3"
  })), "Bulk import"), /*#__PURE__*/React.createElement("button", {
    onClick: onUpload,
    style: {
      background: "#879cf7",
      border: "none",
      color: "#fff",
      padding: "9px 16px",
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 6,
      boxShadow: "0 1px 3px rgba(41,79,246,.18), inset 0 1px 0 rgba(255,255,255,.3)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "5",
    x2: "12",
    y2: "19"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "5",
    y1: "12",
    x2: "19",
    y2: "12"
  })), "Upload videos"));
}
window.TopBar = TopBar;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/TopBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/CTA.jsx
try { (() => {
function CTA() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: "linear-gradient(180deg, #ecf0ff 0%, #879cf7 100%)",
      padding: "80px 32px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/illustrations/rocket.png",
    alt: "",
    style: {
      position: "absolute",
      left: "10%",
      top: 50,
      width: 110,
      transform: "rotate(-18deg)",
      opacity: .85
    }
  }), /*#__PURE__*/React.createElement("img", {
    src: "../../assets/illustrations/fire.png",
    alt: "",
    style: {
      position: "absolute",
      right: "12%",
      top: 60,
      width: 80,
      transform: "rotate(12deg)",
      opacity: .85
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 720,
      margin: "0 auto",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--bl-font-display)",
      fontSize: 56,
      fontWeight: 800,
      color: "#001364",
      letterSpacing: "-0.025em",
      lineHeight: 1.05,
      margin: "0 0 16px"
    }
  }, "Stop watching every video"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 18,
      color: "#001364",
      opacity: .8,
      margin: "0 0 28px",
      lineHeight: 1.5
    }
  }, "Try Brieflee free for 14 days. No credit card. Score 50 videos on us."), /*#__PURE__*/React.createElement("button", {
    style: {
      background: "#000f4d",
      color: "#fff",
      border: "none",
      padding: "16px 32px",
      borderRadius: 12,
      fontWeight: 600,
      fontSize: 16,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      boxShadow: "0 12px 24px -8px rgba(0,15,77,.45)"
    }
  }, "Get started free", /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  })))));
}
window.CTA = CTA;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/CTA.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/FeatureGrid.jsx
try { (() => {
function FeatureGrid() {
  const features = [{
    sticker: "../../assets/illustrations/looking-eyes.png",
    title: "Watches every second",
    body: "Computer vision evaluates hook timing, audio quality, brand visibility, and 23 other thresholds you control."
  }, {
    sticker: "../../assets/illustrations/magnifying-glass.png",
    title: "Catches what you'd miss",
    body: "Off-brief moments, missing CTAs, blurry frames, audio drops. Surfaced as inline notes, not a vague score."
  }, {
    sticker: "../../assets/illustrations/bullseye.png",
    title: "Locked to your brief",
    body: "Upload your brief or build it from a template. Brieflee aligns scoring to your exact creative direction."
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: "#fff",
      padding: "96px 32px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1200,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 56
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "bl-eyebrow",
    style: {
      display: "inline-block",
      marginBottom: 12
    }
  }, "How it works"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 44,
      fontWeight: 800,
      color: "var(--bl-fg)",
      letterSpacing: "-0.02em",
      margin: 0
    }
  }, "Reviews you don\u2019t have to watch")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 24
    }
  }, features.map(f => /*#__PURE__*/React.createElement("div", {
    key: f.title,
    style: {
      background: "#FAFBFF",
      border: "1px solid var(--bl-border)",
      borderRadius: 20,
      padding: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 96,
      height: 96,
      borderRadius: 24,
      background: "rgba(135,156,247,.18)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: f.sticker,
    alt: "",
    style: {
      width: 64,
      height: 64,
      objectFit: "contain"
    }
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: "var(--bl-fg)",
      margin: "0 0 8px"
    }
  }, f.title), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--bl-fg-body)",
      lineHeight: 1.55,
      margin: 0
    }
  }, f.body))))));
}
window.FeatureGrid = FeatureGrid;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/FeatureGrid.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/FeatureRow.jsx
try { (() => {
function FeatureRow({
  flip
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--bl-page)",
      padding: "80px 32px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1100,
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 64,
      alignItems: "center",
      direction: flip ? "rtl" : "ltr"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      direction: "ltr"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "bl-eyebrow",
    style: {
      display: "inline-block",
      marginBottom: 14
    }
  }, "Bulk review"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 38,
      fontWeight: 700,
      color: "var(--bl-fg)",
      letterSpacing: "-0.015em",
      margin: "0 0 14px",
      lineHeight: 1.15
    }
  }, "One CSV. Thirty briefs. 60 seconds."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 17,
      color: "var(--bl-fg-body)",
      lineHeight: 1.55,
      margin: "0 0 20px"
    }
  }, "Drop a single file, get every brief queued and ready. Brieflee pulls creators from your Sheets, splits them by deliverable, and runs the full QA checklist against each video."), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      padding: 0,
      margin: "0 0 28px"
    }
  }, ["No copy-pasting between tools", "Workspace + brand auto-assigned", "26-item QA template, fully editable"].map(t => /*#__PURE__*/React.createElement("li", {
    key: t,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      color: "var(--bl-fg)",
      marginBottom: 8,
      fontSize: 15
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 22,
      height: 22,
      borderRadius: 999,
      background: "#d9e0ff",
      color: "#294ff6",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  }))), t))), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      color: "#294ff6",
      fontWeight: 600,
      fontSize: 15,
      display: "inline-flex",
      alignItems: "center",
      gap: 6
    }
  }, "See bulk import \u2192")), /*#__PURE__*/React.createElement("div", {
    style: {
      direction: "ltr",
      background: "#f4f6fa",
      borderRadius: 24,
      padding: 32,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/engravings/engraving-clapboard.png",
    alt: "",
    style: {
      width: "78%",
      maxWidth: 360
    }
  }))));
}
window.FeatureRow = FeatureRow;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/FeatureRow.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Footer.jsx
try { (() => {
function Footer() {
  const cols = [{
    h: "Product",
    links: ["Features", "Pricing", "Changelog", "Roadmap", "API"]
  }, {
    h: "Use cases",
    links: ["Brands", "Agencies", "Influencer programs", "UGC review"]
  }, {
    h: "Company",
    links: ["About", "Blog", "Careers", "Press"]
  }, {
    h: "Legal",
    links: ["Terms", "Privacy", "DPA", "Subprocessors"]
  }];
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: "#152237",
      color: "rgba(255,255,255,.72)",
      padding: "64px 32px 28px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1200,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.4fr repeat(4, 1fr)",
      gap: 32,
      marginBottom: 48
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logos/brieflee-wordmark-white.png",
    alt: "Brieflee",
    style: {
      height: 28,
      marginBottom: 14
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      lineHeight: 1.55,
      opacity: .7,
      margin: 0
    }
  }, "Spell check for video. Built for brands and agencies managing creator content at scale.")), cols.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.h
  }, /*#__PURE__*/React.createElement("h5", {
    style: {
      color: "#fff",
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: ".06em",
      textTransform: "uppercase",
      margin: "0 0 14px"
    }
  }, c.h), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      padding: 0,
      margin: 0,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, c.links.map(l => /*#__PURE__*/React.createElement("li", {
    key: l
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      color: "rgba(255,255,255,.7)",
      fontSize: 14
    }
  }, l))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid rgba(255,255,255,.1)",
      paddingTop: 22,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "rgba(255,255,255,.5)"
    }
  }, "\xA9 2026 Brieflee, Inc. All rights reserved."), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "rgba(255,255,255,.5)"
    }
  }, "Made in Brooklyn \xB7 Lisbon \xB7 Remote"))));
}
window.Footer = Footer;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Footer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Hero.jsx
try { (() => {
function Hero({
  onPrimary
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: "linear-gradient(180deg, #ECF0FF 0%, #879CF7 100%)",
      padding: "80px 32px 96px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 920,
      margin: "0 auto",
      position: "relative",
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      background: "#879cf7",
      color: "#fff",
      padding: "7px 16px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: ".08em",
      textTransform: "uppercase",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,.4)"
    }
  }, "Automated UGC moderation"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--bl-font-display)",
      fontSize: 88,
      lineHeight: 1.02,
      fontWeight: 800,
      letterSpacing: "-0.025em",
      color: "#001364",
      margin: "20px 0 18px"
    }
  }, "Spell check", /*#__PURE__*/React.createElement("br", null), "for video"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 19,
      lineHeight: 1.5,
      color: "#001364",
      maxWidth: 620,
      margin: "0 auto 32px",
      opacity: .82
    }
  }, "Brieflee scores every UGC asset in seconds against the thresholds you set. Approve, reject, or send revision notes without watching every video yourself."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onPrimary,
    style: {
      background: "#000f4d",
      color: "#fff",
      border: "none",
      padding: "14px 26px",
      borderRadius: 12,
      fontWeight: 600,
      fontSize: 15,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 8,
      boxShadow: "0 8px 18px -6px rgba(0,15,77,.4)"
    }
  }, "Try it free for 14 days", /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  }))), /*#__PURE__*/React.createElement("button", {
    style: {
      background: "rgba(255,255,255,.6)",
      color: "#001364",
      border: "1.5px solid rgba(0,19,100,.12)",
      padding: "14px 26px",
      borderRadius: 12,
      fontWeight: 600,
      fontSize: 15,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("polygon", {
    points: "6 4 20 12 6 20 6 4"
  })), "Watch demo")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 48,
      background: "#fff",
      borderRadius: 24,
      padding: 8,
      boxShadow: "0 32px 64px -16px rgba(0,15,77,.25)",
      maxWidth: 880,
      marginLeft: "auto",
      marginRight: "auto"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/screenshots/animated-app-demo.gif",
    alt: "Brieflee app demo",
    style: {
      width: "100%",
      borderRadius: 18,
      display: "block"
    }
  }))), /*#__PURE__*/React.createElement("img", {
    src: "../../assets/illustrations/looking-eyes.png",
    alt: "",
    style: {
      position: "absolute",
      left: 60,
      top: 120,
      width: 88,
      transform: "rotate(-12deg)",
      opacity: .9
    }
  }), /*#__PURE__*/React.createElement("img", {
    src: "../../assets/illustrations/rocket.png",
    alt: "",
    style: {
      position: "absolute",
      right: 60,
      top: 90,
      width: 96,
      transform: "rotate(14deg)",
      opacity: .9
    }
  }));
}
window.Hero = Hero;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/LogoStrip.jsx
try { (() => {
function LogoStrip() {
  const brands = ["Bonjuru", "Northshore", "Studio Forty", "Mae & Co", "Pacificborn", "Olive+Twig"];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: "#fff",
      padding: "40px 32px",
      borderBottom: "1px solid var(--bl-border)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1200,
      margin: "0 auto",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      letterSpacing: ".12em",
      textTransform: "uppercase",
      fontWeight: 600,
      color: "var(--bl-fg-muted)",
      marginBottom: 18
    }
  }, "Trusted by brands and agencies reviewing 10,000+ videos a month"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 48,
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap"
    }
  }, brands.map(b => /*#__PURE__*/React.createElement("span", {
    key: b,
    style: {
      fontFamily: "var(--bl-font-display)",
      fontSize: 22,
      fontWeight: 700,
      color: "var(--bl-fg)",
      opacity: .55,
      letterSpacing: "-0.01em"
    }
  }, b)))));
}
window.LogoStrip = LogoStrip;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/LogoStrip.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Nav.jsx
try { (() => {
// Marketing top nav. Click "Try free for 14 days" → trial-active pill flips on.
function Nav({
  trialActive,
  onTrialClick
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 50,
      background: "rgba(250, 251, 255, 0.85)",
      backdropFilter: "blur(8px)",
      borderBottom: "1px solid var(--bl-border)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: "14px 32px",
      display: "flex",
      alignItems: "center",
      gap: 32
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logos/brieflee-wordmark.png",
    alt: "Brieflee",
    style: {
      height: 26
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 28,
      marginLeft: 24,
      flex: 1
    }
  }, ["Product", "Use cases", "Pricing", "Docs", "Changelog"].map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#",
    style: {
      color: "var(--bl-fg)",
      fontSize: 14,
      fontWeight: 500
    }
  }, l))), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      color: "var(--bl-fg)",
      fontSize: 14,
      fontWeight: 500
    }
  }, "Sign in"), /*#__PURE__*/React.createElement("button", {
    onClick: onTrialClick,
    style: {
      background: "#879cf7",
      color: "#fff",
      border: "none",
      padding: "9px 18px",
      borderRadius: 10,
      fontWeight: 600,
      fontSize: 14,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 6,
      boxShadow: "0 1px 3px rgba(41,79,246,.18), inset 0 1px 0 rgba(255,255,255,.3)"
    }
  }, trialActive ? "Trial active ✓" : "Try free for 14 days")));
}
window.Nav = Nav;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Nav.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Stats.jsx
try { (() => {
function Stats() {
  const items = [{
    n: "12s",
    l: "Average time to score a 30-second video"
  }, {
    n: "26",
    l: "QA criteria evaluated per asset"
  }, {
    n: "94%",
    l: "Of customers say it pays for itself in week one"
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: "linear-gradient(135deg, #001364 0%, #152237 100%)",
      padding: "72px 32px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1100,
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 32
    }
  }, items.map(it => /*#__PURE__*/React.createElement("div", {
    key: it.n,
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--bl-font-display)",
      fontSize: 64,
      fontWeight: 800,
      color: "#879cf7",
      letterSpacing: "-0.03em",
      lineHeight: 1,
      marginBottom: 10
    }
  }, it.n), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "rgba(255,255,255,.78)",
      fontSize: 15,
      lineHeight: 1.4,
      maxWidth: 240,
      margin: "0 auto"
    }
  }, it.l)))));
}
window.Stats = Stats;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Stats.jsx", error: String((e && e.message) || e) }); }

})();
