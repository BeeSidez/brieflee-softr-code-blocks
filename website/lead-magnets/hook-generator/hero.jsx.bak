// =====================================================================
// Vibe Coding block: AI Hook Generator (lead magnet)
// =====================================================================
// Lives on /free-tool-hook-generator.
//
// Flow:
//   0. Email gate    — Work email + Brand website. Submits to the
//                      shared lead-capture workflow AND the hook
//                      generator workflow in parallel. Hook workflow
//                      returns ~20 hooks synchronously (Respond to
//                      Webhook), so the result list renders the moment
//                      the gate closes.
//   1. Result        — Up to 8 hook cards visible at a time. Each card
//                      shows the spoken hook, the archetype tag, and a
//                      one-line "why it works" tip. Skip swaps in the
//                      next hook from the hidden buffer; Keep marks the
//                      card as saved. When the buffer runs low, a
//                      "Generate more" button re-fires the workflow.
//
// SOFTR UI SETUP:
//   1. Source tab → not bound to a table (lead capture happens via the
//      shared EMAIL_WORKFLOW_URL).
//   2. Visibility tab → public.
// =====================================================================

import { useState, useRef, useEffect } from "react";
import { ArrowRight, Check, X, Sparkles, RefreshCw, Loader2 } from "lucide-react";

const NAVY = "#001364";
const PERIWINKLE = "#879CF7";

// ---------------------------------------------------------------------
// Workflow URLs
// ---------------------------------------------------------------------
// Shared lead-capture workflow — fires in parallel so EmailIt nurture
// and Google Sheet backup run for every magnet submission.
const EMAIL_WORKFLOW_URL = "https://workflows-api.softr.io/v1/workflows/1e28685f-1a24-4042-80ac-cadfedef7336/executions/22b90d5d-a73b-43b5-ac1b-f24843b781bd";

// Hook generator workflow — Sonar (brand research) + Claude (20 hooks
// tagged by archetype) + Respond to Webhook (synchronous JSON response).
const HOOK_WORKFLOW_URL = "https://workflows-api.softr.io/v1/workflows/3131a32a-f600-40c7-b7a6-ad57b5ce09f9/executions/78809504-ffc7-4da6-8191-abf51780e021";

// ---------------------------------------------------------------------
// Work-email gate (mirrors the shared FREE_EMAIL_DOMAINS list)
// ---------------------------------------------------------------------
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com",
  "yahoo.com", "yahoo.co.uk", "yahoo.fr", "yahoo.de", "ymail.com",
  "hotmail.com", "hotmail.co.uk", "hotmail.fr", "live.com", "live.co.uk",
  "msn.com", "outlook.com", "outlook.co.uk",
  "aol.com",
  "icloud.com", "me.com", "mac.com",
  "proton.me", "protonmail.com", "pm.me",
  "mail.com", "gmx.com", "gmx.de", "gmx.net",
  "yandex.com", "yandex.ru",
  "zoho.com", "hey.com",
  "fastmail.com", "fastmail.fm",
  "tutanota.com", "tutanota.de",
  "mailinator.com", "guerrillamail.com", "10minutemail.com",
  "tempmail.com", "trashmail.com", "throwawaymail.com", "yopmail.com",
]);
function isWorkEmail(value) {
  const v = (value || "").trim().toLowerCase();
  if (!v) return false;
  const at = v.lastIndexOf("@");
  if (at === -1) return false;
  return !FREE_EMAIL_DOMAINS.has(v.slice(at + 1));
}

// ---------------------------------------------------------------------
// Brieflee Cloudinary icons — used to replace emoji on the archetype
// taxonomy section. Library-confirmed URLs.
// ---------------------------------------------------------------------
const ICON_PADLOCK    = "https://res.cloudinary.com/dchroynzv/image/upload/v1778010104/brieflee_icon_padlock-sticker-blue-transparent_2026-05.png";
const ICON_FIRE       = "https://res.cloudinary.com/dchroynzv/image/upload/v1777998712/brieflee_icon_trendy-flat-fire-sticker-transparent_2026-05.png";
const ICON_BOLT       = "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_trendy-flat-lightning-bolt-sticker-transparent_2026-05.png";
const ICON_EYES       = "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_sticker-blue-cartoon-eyes-looking-side-navy_2026-03.png";
const ICON_STOPWATCH  = "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_sticker-red-stopwatch-timer-countdown_2026-03.png";
const ICON_MEGAPHONE  = "https://res.cloudinary.com/dchroynzv/image/upload/v1777998691/brieflee_help-icon_notifications-megaphone-loudspeaker-blue-transparent_2026-05.png";
const ICON_SPEECH     = "https://res.cloudinary.com/dchroynzv/image/upload/v1777998690/brieflee_help-icon_members-speech-bubble-profile-icon-with-count-one-transparent_2026-05.png";
const ICON_PALETTE    = "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_trendy-flat-paint-palette-sticker-transparent_2026-05.png";
const ICON_PLAYER     = "https://res.cloudinary.com/dchroynzv/image/upload/v1777998702/brieflee_icon_media-player-interface-icon-transparent_2026-05.png";

// ---------------------------------------------------------------------
// Hook archetype taxonomy — the 8 patterns the generator tags every
// hook against. Shown both as small "Why it works" hints on each hook
// card AND as the long-form "The science behind great hooks" section
// below the fold.
//
// Archetype `id` doubles as the value Claude returns in the
// `archetype` field of each generated hook, so the hero can join up to
// the icon + tooltip without re-deriving anything.
// ---------------------------------------------------------------------
const HOOK_ARCHETYPES = [
  {
    id: "contrarian",
    name: "Contrarian",
    icon: ICON_PALETTE,
    description: "Challenges something the viewer believes is true.",
    example: "Your trainer is lying to you about protein.",
  },
  {
    id: "identity-call-out",
    name: "Identity Call-Out",
    icon: ICON_EYES,
    description: "Calls out the viewer by naming their specific role, identity, or circumstance.",
    example: "If you wake up at 3am every night, this is for you.",
  },
  {
    id: "confession",
    name: "Confession",
    icon: ICON_SPEECH,
    description: "Speaker is vulnerable and honest about an admission.",
    example: "I spent two years telling people this was a scam, but I was wrong.",
  },
  {
    id: "pain-agitation",
    name: "Pain Agitation",
    icon: ICON_FIRE,
    description: "Mirrors the viewer's internal experience back at them so they feel seen.",
    example: "I've tried everything for my skin and I'm still breaking out every month.",
  },
  {
    id: "curiosity-gap",
    name: "Curiosity Gap",
    icon: ICON_PLAYER,
    description: "Opens a loop the viewer needs to close, capturing their attention.",
    example: "Why did no one tell me these foods were making me feel sick?",
  },
  {
    id: "loss-aversion",
    name: "Loss Aversion",
    icon: ICON_STOPWATCH,
    description: "Implies loss or urgency in a way that feels visceral to the viewer.",
    example: "You're paying twice what you should for car insurance and you don't even know it.",
  },
  {
    id: "unspoken-truth",
    name: "Unspoken Truth",
    icon: ICON_MEGAPHONE,
    description: "Says the thing everyone thinks but nobody says out loud.",
    example: "I've sweat right through my sweater more times than I can count.",
  },
  {
    id: "pattern-interrupt",
    name: "Pattern Interrupt",
    icon: ICON_BOLT,
    description: "Breaks the viewer's scrolling pattern with something unexpected.",
    example: "Stop moisturizing your face. Seriously.",
  },
];

const ARCHETYPE_BY_ID = HOOK_ARCHETYPES.reduce((acc, a) => {
  acc[a.id] = a;
  acc[a.name.toLowerCase()] = a;
  return acc;
}, {});
function findArchetype(value) {
  if (!value) return null;
  const key = String(value).trim().toLowerCase();
  return ARCHETYPE_BY_ID[key] || ARCHETYPE_BY_ID[key.replace(/\s+/g, "-")] || null;
}

// ---------------------------------------------------------------------
// Hero asset — branded illustration (Cloudinary PNG)
// ---------------------------------------------------------------------
const HERO_IMAGE_SRC = "https://res.cloudinary.com/dchroynzv/image/upload/v1779118048/AI_Hook_Genorator_jyrwp1.png";
const HERO_IMAGE_ALT = "AI Hook Generator illustration";

// Floating 3D social-platform logos that orbit the circular hero image.
// Same pattern as the brief generator + Andromeda calculator — adds
// motion + depth so the asset doesn't read flat. Two coord sets per logo
// (desktop / mobile) so the cluster scales down cleanly on small screens.
const LOGO_BASE       = "https://res.cloudinary.com/dchroynzv/image/upload/";
const TIKTOK_LOGO     = `${LOGO_BASE}brieflee_icon_tiktok-logo-3d-transparent_2026-05.png`;
const INSTAGRAM_LOGO  = `${LOGO_BASE}brieflee_icon_instagram-logo-3d-transparent_2026-05.png`;
const FACEBOOK_LOGO   = `${LOGO_BASE}brieflee_icon_facebook-logo-3d-transparent_2026-05.png`;
const META_LOGO       = `${LOGO_BASE}v1778794660/brieflee_icon_meta-logo-3d-transparent_2026-05.png`;
const YT_SHORTS_LOGO  = `${LOGO_BASE}brieflee_icon_youtube-shorts-logo-3d-transparent_2026-05.png`;
const FLOATING_LOGOS = [
  { src: TIKTOK_LOGO,    alt: "TikTok",         desktop: { top: "-10%",   right: "-8%",  size: 110, rotate: 12  }, mobile: { top: "-5%",    right: "-4%", size: 64, rotate: 12  }, delay: 0,   reverse: false },
  { src: INSTAGRAM_LOGO, alt: "Instagram",      desktop: { top: "38%",    right: "-14%", size: 78,  rotate: 6   }, mobile: { top: "40%",    right: "-7%", size: 46, rotate: 6   }, delay: 0.5, reverse: true  },
  { src: FACEBOOK_LOGO,  alt: "Facebook",       desktop: { bottom: "-4%", right: "0%",   size: 92,  rotate: -14 }, mobile: { bottom: "-2%", right: "0%",  size: 54, rotate: -14 }, delay: 1.0, reverse: false },
  { src: META_LOGO,      alt: "Meta",           desktop: { bottom: "12%", left: "-12%",  size: 72,  rotate: -8  }, mobile: { bottom: "8%",  left: "-5%", size: 42, rotate: -8  }, delay: 0.3, reverse: true  },
  { src: YT_SHORTS_LOGO, alt: "YouTube Shorts", desktop: { top: "8%",     left: "-10%",  size: 88,  rotate: 18  }, mobile: { top: "4%",     left: "-5%", size: 52, rotate: 18  }, delay: 0.8, reverse: false },
];

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------
function deriveLogoUrl(websiteUrl) {
  try {
    const u = new URL(/^https?:\/\//i.test(websiteUrl) ? websiteUrl : `https://${websiteUrl}`);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=128`;
  } catch {
    return "";
  }
}
function deriveBrandLabel(websiteUrl) {
  try {
    const u = new URL(/^https?:\/\//i.test(websiteUrl) ? websiteUrl : `https://${websiteUrl}`);
    const host = u.hostname.replace(/^www\./, "");
    const root = host.split(".")[0];
    return root ? root.charAt(0).toUpperCase() + root.slice(1) : "";
  } catch {
    return "";
  }
}
// Strip em-dashes that occasionally slip through from Sonar / Claude
// despite the prompt rule. Brieflee voice rule: no em-dashes in copy.
function noEm(s) {
  return (s || "").replace(/\s*[—–]\s*/g, ". ").replace(/\.\s*\./g, ".").trim();
}

// Defensive parser — Claude sometimes returns JSON wrapped in fences or
// preceded by a short preamble. Pull out the first {…} block and parse.
function parseHookResponse(raw) {
  if (!raw) return [];
  let text = typeof raw === "string" ? raw : JSON.stringify(raw);
  const match = text.match(/\{[\s\S]*\}/);
  if (match) text = match[0];
  let parsed;
  try {
    parsed = typeof raw === "object" && raw && Array.isArray(raw.hooks) ? raw : JSON.parse(text);
  } catch {
    return [];
  }
  const list = Array.isArray(parsed) ? parsed : (parsed.hooks || parsed.data || []);
  return list
    .map((h, i) => ({
      id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
      quote:        noEm(h.quote || h.hook || h.line || ""),
      archetype:    h.archetype || h.tactic || h.pattern || "",
      whyItWorks:   noEm(h.why_it_works || h.why || h.tip || ""),
    }))
    .filter((h) => h.quote);
}

// ---------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------
function FloatingLogo({ logo, isDesktop }) {
  const dims = isDesktop ? logo.desktop : logo.mobile;
  return (
    <div
      className="absolute z-20"
      style={{
        top: dims.top ?? "auto",
        bottom: dims.bottom ?? "auto",
        left: dims.left ?? "auto",
        right: dims.right ?? "auto",
        width: dims.size,
        height: dims.size,
        transform: `rotate(${dims.rotate}deg)`,
        animation: `briefleeHeroFloatY 7s ease-in-out ${logo.delay}s infinite ${logo.reverse ? "alternate-reverse" : "alternate"}`,
        filter: "drop-shadow(0 12px 24px rgba(99, 102, 241, 0.20))",
        pointerEvents: "none",
      }}
    >
      <img src={logo.src} alt={logo.alt} className="w-full h-full object-contain" draggable={false} />
    </div>
  );
}

function HookCard({ hook, kept, onKeep, onSkip }) {
  const arche = findArchetype(hook.archetype);
  return (
    <div
      className="relative rounded-2xl bg-card border p-5 md:p-6 transition-shadow"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: PERIWINKLE,
        borderColor: kept ? PERIWINKLE : "hsl(var(--border))",
        boxShadow: kept ? `0 0 0 1px ${PERIWINKLE}` : "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-base md:text-lg font-semibold leading-snug" style={{ color: NAVY }}>
            &ldquo;{hook.quote}&rdquo;
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={onKeep}
            aria-label="Keep this hook"
            className={`w-10 h-10 rounded-xl inline-flex items-center justify-center border-2 transition-colors ${
              kept
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:border-primary/40"
            }`}
          >
            <Check className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onSkip}
            aria-label="Skip this hook"
            className="w-10 h-10 rounded-xl inline-flex items-center justify-center border-2 border-border bg-card text-muted-foreground hover:border-destructive/40 hover:text-destructive transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      {(arche || hook.whyItWorks) && (
        <div
          className="mt-4 rounded-xl px-4 py-3 flex items-start gap-3"
          style={{ background: "rgba(135,156,247,0.08)" }}
        >
          {arche?.icon ? (
            <img src={arche.icon} alt="" className="w-6 h-6 shrink-0 object-contain mt-0.5" draggable={false} />
          ) : null}
          <div className="text-xs md:text-sm leading-relaxed text-muted-foreground">
            {arche?.name ? (
              <span className="font-bold mr-1.5" style={{ color: NAVY }}>{arche.name}.</span>
            ) : null}
            {hook.whyItWorks || arche?.description || ""}
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// MAIN BLOCK
// =====================================================================
export default function Block() {
  // Step-based flow:
  //   gate       → email + website
  //   target     → brand / product / feature picker
  //   generating → Sonar + Claude pending
  //   result     → hook cards rendered
  const [step, setStep] = useState("gate");

  // Gate state
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [gateError, setGateError] = useState("");

  // Target stage state
  const [targetType, setTargetType] = useState("");           // "" | "brand" | "product" | "feature"
  const [productUrl, setProductUrl] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [generateError, setGenerateError] = useState("");

  // Hook state
  const [buffer, setBuffer] = useState([]);          // hidden queue
  const [displayed, setDisplayed] = useState([]);    // up to 8 visible cards
  const [keptIds, setKeptIds] = useState(new Set()); // kept-state Set
  const [generatingMore, setGeneratingMore] = useState(false);
  const [moreError, setMoreError] = useState("");
  const [leadCaptured, setLeadCaptured] = useState(false); // fires EMAIL_WORKFLOW_URL once per session

  const resultsRef = useRef(null);
  const DISPLAY_COUNT = 8;
  const LOW_BUFFER_THRESHOLD = 3;

  const hasResults = step === "result";

  const targetComplete =
    targetType === "brand" ||
    (targetType === "product" && productUrl.trim().length > 4) ||
    (targetType === "feature" && featureDescription.trim().length > 4);

  useEffect(() => {
    if (hasResults && resultsRef.current) {
      // Smooth scroll the results into view once the first batch lands.
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [hasResults]);

  function buildHookPayload() {
    const clientUuid =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `hook-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return {
      client_uuid: clientUuid,
      source: "hook-generator",
      email: email.trim(),
      website_url: website.trim(),
      logo_url: deriveLogoUrl(website),
      page_url: typeof window !== "undefined" ? window.location.href : "",
      submitted_at: new Date().toISOString(),
      target_type: targetType || "brand",
      product_url: targetType === "product" ? productUrl.trim() : "",
      feature_description: targetType === "feature" ? featureDescription.trim() : "",
    };
  }

  async function callHookWorkflow() {
    const res = await fetch(HOOK_WORKFLOW_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildHookPayload()),
    });
    if (!res.ok) {
      throw new Error(`Workflow returned HTTP ${res.status}`);
    }
    const raw = await res.text();
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      body = raw;
    }
    const hooks = parseHookResponse(body);
    if (!hooks.length) {
      throw new Error("No hooks came back from the workflow.");
    }
    return hooks;
  }

  function fireLeadCapture() {
    if (leadCaptured) return;
    // Fire-and-forget — don't block UX on lead-capture success.
    fetch(EMAIL_WORKFLOW_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        website: website.trim(),
        source: "hook-generator",
        page_url: typeof window !== "undefined" ? window.location.href : "",
        submitted_at: new Date().toISOString(),
        target_type: targetType || "brand",
        product_url: targetType === "product" ? productUrl.trim() : "",
        feature_description: targetType === "feature" ? featureDescription.trim() : "",
      }),
    }).catch((e) => console.error("Lead capture failed (continuing):", e));
    setLeadCaptured(true);
  }

  function handleEmailSubmit() {
    if (!email.trim() || !website.trim()) {
      setGateError("Fill in both fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setGateError("Enter a valid work email.");
      return;
    }
    if (!isWorkEmail(email)) {
      setGateError("Use your company email instead. Personal @gmail.com, @yahoo.com, etc. aren't supported.");
      return;
    }
    setGateError("");
    setStep("target");
  }

  async function handleGenerate() {
    if (!targetComplete) return;
    setGenerateError("");
    setStep("generating");

    fireLeadCapture();

    try {
      const hooks = await callHookWorkflow();
      setDisplayed(hooks.slice(0, DISPLAY_COUNT));
      setBuffer(hooks.slice(DISPLAY_COUNT));
      setStep("result");
    } catch (e) {
      console.error("Hook workflow failed:", e);
      setGenerateError(`We couldn't reach the hook generator. ${e.message || "Try again in a moment."}`);
      setStep("target");
    }
  }

  function handleSkip(idx) {
    setBuffer((prevBuf) => {
      setDisplayed((prevDisp) => {
        const next = [...prevDisp];
        if (prevBuf.length > 0) {
          next[idx] = prevBuf[0];
        } else {
          next.splice(idx, 1);
        }
        return next;
      });
      return prevBuf.length > 0 ? prevBuf.slice(1) : prevBuf;
    });
  }

  function handleKeep(hookId) {
    setKeptIds((prev) => {
      const next = new Set(prev);
      if (next.has(hookId)) next.delete(hookId);
      else next.add(hookId);
      return next;
    });
  }

  async function handleGenerateMore() {
    if (generatingMore) return;
    setGeneratingMore(true);
    setMoreError("");
    try {
      const hooks = await callHookWorkflow();
      // De-dup by quote (case-insensitive) against current state.
      const existing = new Set(
        [...displayed, ...buffer].map((h) => (h.quote || "").trim().toLowerCase())
      );
      const fresh = hooks.filter((h) => !existing.has(h.quote.trim().toLowerCase()));
      setBuffer((prev) => [...prev, ...fresh]);
    } catch (e) {
      console.error("Generate-more failed:", e);
      setMoreError(e.message || "Couldn't generate more right now.");
    } finally {
      setGeneratingMore(false);
    }
  }

  const brandLabel = deriveBrandLabel(website);
  const logoUrl    = deriveLogoUrl(website);
  const lowBuffer  = buffer.length < LOW_BUFFER_THRESHOLD;

  return (
    <div className="relative w-full overflow-hidden">
      <style>{`
        @keyframes briefleeHeroFloatY {
          0%   { transform: translateY(0) rotate(var(--rot, 0deg)); }
          100% { transform: translateY(-16px) rotate(var(--rot, 0deg)); }
        }
        @keyframes briefleeHeroChipFloat {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-6px); }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/[0.03] to-primary/[0.07]" />
      </div>

      {/* ============================================================ */}
      {/* HERO — eyebrow + H1 + gate or first call-to-action            */}
      {/* ============================================================ */}
      <div className="container py-14 md:py-20 lg:py-24 relative">
        <div className="content max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
            {/* LEFT */}
            <div className="space-y-6">
              <div
                className="inline-flex items-center"
                style={{
                  gap: 10,
                  padding: "10px 18px",
                  background: "rgba(135,156,247,0.16)",
                  color: NAVY,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  borderRadius: 999,
                  width: "fit-content",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: PERIWINKLE,
                    boxShadow: `0 0 0 3px ${PERIWINKLE}33`,
                  }}
                />
                Free AI Hook Generator
              </div>

              <h1 className="font-bold tracking-tight leading-[1.05]">
                <span className="block text-3xl md:text-4xl lg:text-5xl" style={{ color: NAVY }}>
                  Generate new hooks
                </span>
                <span className="block text-3xl md:text-4xl lg:text-5xl mt-1" style={{ color: PERIWINKLE }}>
                  for your next ad
                </span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
                Drop your brand website. Get a fresh set of hooks built around your product, your audience, and the 8 archetypes top creative strategists use to stop the scroll.
              </p>

              {/* ============ Stage 0: Email gate ============ */}
              {step === "gate" && (
                <div className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.35)]">
                  <div className="flex items-center gap-3 mb-5">
                    <img src={ICON_PADLOCK} alt="" className="w-10 h-10 shrink-0 object-contain" draggable={false} />
                    <div>
                      <h2 className="text-base font-bold" style={{ color: NAVY }}>Unlock the hook generator</h2>
                      <p className="text-xs text-muted-foreground">Drop your work email and brand website to get started.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Work email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@brand.com"
                          className="w-full h-11 px-3 rounded-xl border-2 border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Brand website</label>
                        <input
                          type="text"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="brand.com"
                          className="w-full h-11 px-3 rounded-xl border-2 border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    {gateError && <p className="text-sm text-destructive">{gateError}</p>}
                    <button
                      type="button"
                      onClick={handleEmailSubmit}
                      className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2"
                    >
                      Continue <ArrowRight className="w-5 h-5" />
                    </button>
                    <p className="text-xs text-muted-foreground text-center">
                      Free. One-click unsubscribe from the follow-up emails.
                    </p>
                  </div>
                </div>
              )}

              {/* ============ Stage 1: Target picker ============ */}
              {step === "target" && (
                <div className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.35)]">
                  <h2 className="text-lg font-bold mb-1" style={{ color: NAVY }}>What are these hooks for?</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Pick a specific product or feature and Sonar will read its page directly. Otherwise the hooks stay brand-level.
                  </p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "brand",   label: "Just brand" },
                        { id: "product", label: "A product" },
                        { id: "feature", label: "A feature" },
                      ].map((opt) => {
                        const selected = targetType === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setTargetType(opt.id)}
                            className={`h-11 px-3 rounded-xl border-2 text-sm font-semibold transition-colors ${
                              selected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card text-foreground border-border hover:border-primary/40"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>

                    {targetType === "product" && (
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Product page link</label>
                        <input
                          type="text"
                          value={productUrl}
                          onChange={(e) => setProductUrl(e.target.value)}
                          placeholder="https://brand.com/products/..."
                          className="w-full h-11 px-3 rounded-xl border-2 border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                        <p className="text-xs text-muted-foreground mt-1.5">Sonar will read this page for product claims, features, and reviews.</p>
                      </div>
                    )}

                    {targetType === "feature" && (
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Describe the feature</label>
                        <textarea
                          value={featureDescription}
                          onChange={(e) => setFeatureDescription(e.target.value)}
                          placeholder="In 1-2 sentences: what does the feature do? Who's it for?"
                          rows={2}
                          className="w-full px-3 py-2.5 rounded-xl border-2 border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                        />
                      </div>
                    )}

                    {generateError && <p className="text-sm text-destructive">{generateError}</p>}

                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={!targetComplete}
                      className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 inline-flex items-center justify-center gap-2"
                    >
                      Generate hooks <Sparkles className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* ============ Generating loader ============ */}
              {step === "generating" && (
                <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.35)] flex flex-col items-center text-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <h2 className="text-lg font-bold" style={{ color: NAVY }}>Researching your brand and writing hooks</h2>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Reading reviews, claims, and customer language. Then assembling 20 hooks across 8 archetypes. Usually takes 30 to 60 seconds.
                  </p>
                </div>
              )}

              {/* ============ Brand identity row (after results land) ============ */}
              {hasResults && (
                <div
                  className="rounded-2xl border border-border bg-card p-4 md:p-5 flex items-center gap-3"
                  style={{ background: "rgba(135,156,247,0.10)" }}
                >
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={brandLabel}
                      className="w-10 h-10 shrink-0 rounded-lg object-contain bg-white p-1.5 border border-border/50"
                      draggable={false}
                    />
                  ) : null}
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Hooks for
                    </div>
                    <div className="text-base font-bold truncate" style={{ color: NAVY }}>
                      {brandLabel || website.trim()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT — hero illustration + floating 3D social logos */}
            <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[360px] md:max-w-[420px] lg:max-w-[480px] aspect-square mt-6 lg:mt-0">
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-[80px] -z-10" aria-hidden="true" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-[6px] border-card shadow-[0_30px_80px_-25px_hsl(var(--primary)/0.55)] bg-card">
                <img
                  src={HERO_IMAGE_SRC}
                  alt={HERO_IMAGE_ALT}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
              {/* Desktop floating logos */}
              <div className="hidden md:block">
                {FLOATING_LOGOS.map((logo, i) => (
                  <FloatingLogo key={`d-${i}`} logo={logo} isDesktop />
                ))}
              </div>
              {/* Mobile floating logos */}
              <div className="md:hidden">
                {FLOATING_LOGOS.map((logo, i) => (
                  <FloatingLogo key={`m-${i}`} logo={logo} isDesktop={false} />
                ))}
              </div>
              {/* Floating chip — pulse pill */}
              <div
                className="absolute top-[8%] left-[55%] z-30 flex items-center gap-2 rounded-full bg-card border border-border shadow-md px-3 py-1.5 text-xs font-semibold"
                style={{ animation: "briefleeHeroChipFloat 6s ease-in-out 0.4s infinite alternate", color: NAVY }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                20 hooks per batch
              </div>
              {/* Floating chip — number stat */}
              <div
                className="absolute bottom-[8%] right-[58%] z-30 flex items-center gap-2 rounded-2xl bg-card border border-border shadow-lg px-4 py-2.5 text-left"
                style={{ animation: "briefleeHeroChipFloat 6s ease-in-out 1.0s infinite alternate-reverse" }}
              >
                <div className="text-2xl font-bold text-primary leading-none">8</div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Archetypes</div>
                  <div className="text-xs text-foreground font-medium">Stop-the-scroll</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RESULT — hook cards with keep / skip                          */}
        {/* ============================================================ */}
        {hasResults && displayed.length > 0 && (
          <div ref={resultsRef} className="content max-w-3xl mx-auto mt-12 md:mt-16">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: NAVY }}>
                Keep the ones you love. Skip the rest.
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-xl mx-auto leading-relaxed">
                Every skip swaps in the next hook from your batch. Run out? Tap Generate more.
              </p>
            </div>

            <div className="space-y-3 md:space-y-4">
              {displayed.map((hook, idx) => (
                <HookCard
                  key={hook.id}
                  hook={hook}
                  kept={keptIds.has(hook.id)}
                  onKeep={() => handleKeep(hook.id)}
                  onSkip={() => handleSkip(idx)}
                />
              ))}
            </div>

            {/* Embedded mid-flow CTA card */}
            <div
              className="mt-6 md:mt-8 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center gap-4"
              style={{ background: "rgba(135,156,247,0.12)" }}
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-bold leading-tight" style={{ color: NAVY }}>
                  These hooks need a creator who can deliver them.
                </h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Brieflee builds the full creator brief around your chosen hook. Script, storyboard, format, all generated in seconds.
                </p>
              </div>
              <a
                href="/free-tool-ai-brief-generator"
                className="shrink-0 inline-flex items-center gap-2 h-11 px-5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ background: NAVY, color: "#fff" }}
              >
                Build the brief <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Generate-more / status footer */}
            <div className="mt-6 md:mt-8 flex flex-col items-center gap-3">
              {moreError && <p className="text-sm text-destructive">{moreError}</p>}
              <button
                type="button"
                onClick={handleGenerateMore}
                disabled={generatingMore}
                className="inline-flex items-center gap-2 h-11 px-6 rounded-xl border-2 border-border bg-card text-sm font-semibold text-foreground hover:border-primary/40 transition-colors disabled:opacity-60"
                style={{ color: NAVY }}
              >
                {generatingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating more…
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    {lowBuffer && buffer.length === 0 ? "Generate more hooks" : `Generate more (${buffer.length} queued)`}
                  </>
                )}
              </button>
              {keptIds.size > 0 && (
                <p className="text-xs text-muted-foreground">
                  {keptIds.size} hook{keptIds.size === 1 ? "" : "s"} kept. Copy your favourites before you close the page.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* HOW IT WORKS — 3 step explainer                                */}
      {/* ============================================================ */}
      <div className="relative w-full border-t border-border">
        <div className="container py-14 md:py-20">
          <div className="content max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.1]" style={{ color: NAVY }}>
                How it works
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 md:gap-10">
              {[
                {
                  n: "1",
                  title: "Drop your website",
                  body: "We research your brand, audience, and product so every hook is tailored, not generic.",
                },
                {
                  n: "2",
                  title: "Get a batch of hooks",
                  body: "Eight hooks at a time, each tagged with one of the 8 archetypes that consistently stop the scroll.",
                },
                {
                  n: "3",
                  title: "Keep, skip, regenerate",
                  body: "Skip the ones that miss, keep the ones that land. Tap Generate more for a fresh batch any time.",
                },
              ].map((s) => (
                <div key={s.n} className="text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4">
                    {s.n}
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: NAVY }}>
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* THE SCIENCE — 8 archetype taxonomy with examples               */}
      {/* ============================================================ */}
      <div className="relative w-full bg-muted/20 border-y border-border">
        <div className="container py-14 md:py-20">
          <div className="content max-w-4xl mx-auto">
            <div className="text-center mb-10 md:mb-14">
              <div
                className="inline-flex items-center mb-5"
                style={{
                  gap: 10,
                  padding: "8px 16px",
                  background: "rgba(135,156,247,0.16)",
                  color: NAVY,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  borderRadius: 999,
                }}
              >
                The science
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]" style={{ color: NAVY }}>
                The science behind great hooks
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mt-4 leading-relaxed">
                Every hook we generate is tagged against one of the 8 psychological patterns top creative strategists use to stop the scroll.
              </p>
            </div>

            <div className="space-y-3">
              {HOOK_ARCHETYPES.map((a) => (
                <div
                  key={a.id}
                  className="bg-card border border-border rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6"
                >
                  <div className="flex items-center gap-4 md:flex-1 md:min-w-0">
                    <img src={a.icon} alt="" className="w-12 h-12 shrink-0 object-contain" draggable={false} />
                    <div className="min-w-0">
                      <h3 className="font-bold text-base md:text-lg" style={{ color: NAVY }}>{a.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{a.description}</p>
                    </div>
                  </div>
                  <div
                    className="md:w-72 md:shrink-0 md:border-l md:border-border md:pl-6 text-sm italic leading-relaxed"
                    style={{ color: NAVY }}
                  >
                    &ldquo;{a.example}&rdquo;
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* FINAL CTA                                                       */}
      {/* ============================================================ */}
      <section
        className="relative w-full py-20 md:py-28 px-5 md:px-10 overflow-hidden"
        style={{
          background: "radial-gradient(ellipse 65% 50% at 50% 50%, rgba(135,156,247,0.28) 0%, rgba(180,192,245,0.14) 40%, rgba(180,192,245,0) 75%), #FAFBFF",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "min(90vw, 720px)",
            height: "min(70vw, 460px)",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(ellipse at center, rgba(135,156,247,0.30) 0%, rgba(135,156,247,0.12) 35%, rgba(135,156,247,0) 70%)",
            pointerEvents: "none",
            filter: "blur(8px)",
          }}
        />
        <div className="relative max-w-3xl mx-auto flex flex-col items-center text-center">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 18px",
              background: "rgba(135,156,247,0.16)",
              color: NAVY,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              borderRadius: 999,
              width: "fit-content",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: PERIWINKLE,
                boxShadow: `0 0 0 3px ${PERIWINKLE}33`,
              }}
            />
            Get started
          </div>

          <h2
            className="mt-6 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05] text-balance"
            style={{ color: NAVY }}
          >
            A great hook is the start. Brieflee makes sure the rest of the video lands too.
          </h2>

          <p
            className="mt-5 text-base md:text-lg leading-relaxed max-w-xl mx-auto font-medium"
            style={{ color: NAVY, opacity: 0.7 }}
          >
            Hook timing, brand mentions, CTA placement, format adherence. Brieflee reviews every video against your brief before it goes live.
          </p>

          <div className="mt-9 md:mt-10 flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <a
              href="/sign-up"
              className="inline-flex items-center gap-2.5 px-7 h-12 rounded-xl font-bold text-base text-white transition-transform hover:-translate-y-0.5"
              style={{
                background: NAVY,
                boxShadow: "0 12px 28px -10px rgba(0,19,100,0.35), 0 4px 10px -3px rgba(0,19,100,0.18)",
              }}
            >
              Start free trial
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/book-a-demo"
              className="inline-flex items-center gap-2 px-6 h-12 rounded-xl font-bold text-base transition-transform hover:-translate-y-0.5"
              style={{
                background: "rgba(255,255,255,0.6)",
                color: NAVY,
                boxShadow: "0 0 0 1px rgba(0,19,100,0.14) inset, 0 4px 12px -4px rgba(0,19,100,0.10)",
                backdropFilter: "blur(12px) saturate(180%)",
              }}
            >
              Book a demo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
