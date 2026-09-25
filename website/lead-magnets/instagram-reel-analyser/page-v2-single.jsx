// =====================================================================
// instagram-reel-analyser — the whole page as ONE block (v2 holding version).
//
// The five original blocks merged verbatim so the page is a single
// paste. Nothing here calls Gemini, RapidAPI or Cloudinary, so it
// costs nothing per visitor: paste a link, hand over an email, get
// sent to signup. Swap back to analyser-v3 when the ads start.
//
// SOFTR: one Vibe block, full page width, visibility public.
// No sources needed.
// =====================================================================

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { datasource, useRecordCreate, useUpload, q } from "@/lib/datasource";
import { ArrowRight, Check, Upload, Link as LinkIcon, Loader2, Mic2, Target, Repeat, Eye, Activity, Sparkles as SparklesIcon, Cpu, FileText, Plus, Minus, ArrowUp } from "lucide-react";


// ═══════════════════════════════════════════════════════════
// hero.jsx
// ═══════════════════════════════════════════════════════════

// =====================================================================
// Vibe Coding block: Free Tool, Instagram Reel Analyser (hero + Trojan horse)
// =====================================================================
// Drop into a Softr Vibe Coding block on /free-tool-instagram-reel-analyser.
//
// Same shape as /free-tool-video-breakdown but Instagram-only:
//   - URL validator restricted to instagram.com
//   - Single floating logo (Instagram)
//   - Typing text cycles Instagram-related terms
//   - Writes to Tools with Page = "Instagram Reel Analyser"
// =====================================================================







// ---------------------------------------------------------------------
// Sources (2) — connection ids for THIS block, from its Source tab.
// The Tools-table write is gone: the lead_event covers it, and it carries
// the video in its payload. That also removes an awaited write that used
// to sit between someone pressing the button and reaching sign-up.
// No leads source on purpose, because the two-way relation in the CRM
// attaches the event to an existing lead or creates one.
// ---------------------------------------------------------------------
const ds = datasource.define({
  leadEvents: "57d36eef-510e-488a-bb44-26940ab46517", // Brieflee CRM → lead_events
});

// Field ids read from list_fields, never zipped from two calls.
const eventWrite = q.select({
  email:       "KfXCh",
  source:      "0tbOR",   // SELECT
  channel:     "Stu4F",   // SELECT
  name:        "wNiuC",
  website:     "MSNYn",
  pageUrl:     "5GODb",
  landingPage: "CO6OA",
  payload:     "hvB7E",
  submittedAt: "8ZeJj",
});
const OPT_SOURCE  = { id: "5ccf7166-24be-4f82-9b91-8de55aa92541", label: "instagram-reel-analyser" };
const OPT_CHANNEL = { id: "dcaa1da5-8a7c-4c7d-a964-8bfadc910932", label: "Lead magnet" };
// Shared by all five analysers: BL | Leads · video-analyser.

const PLATFORM_BRIEFLEE = {
  id: "bb558681-9e58-46c2-a68f-11b335835d7f",
  label: "Brieflee",
};
const PAGE_INSTAGRAM_ANALYSER = {
  id: "4c8950df-fd5f-4c5e-9c41-89ac600aa5c6",
  label: "Instagram Reel Analyser",
};

// Shared lead-capture workflow — fires alongside the Tools-table write
// so EmailIt nurture + Google Sheet backup run for every magnet submission.
const EMAIL_WORKFLOW_URL = "https://workflows-api.softr.io/v1/workflows/1e28685f-1a24-4042-80ac-cadfedef7336/executions/22b90d5d-a73b-43b5-ac1b-f24843b781bd";

const HERO_ASSET = {
  src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/67cf964b-07bc-4141-a753-d8aa833704ef.gif",
  alt: "Brieflee analysing an Instagram Reel frame by frame",
};

const NAVY = "#001364";
const PERIWINKLE = "#879CF7";

const LOGO_BASE = "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_";
const INSTAGRAM_LOGO = `${LOGO_BASE}instagram-logo-3d-transparent_2026-05.png`;
const UPLOAD_LOGO = `${LOGO_BASE}upload-cloud-3d-transparent_2026-05.png`;
const FLOATING_LOGOS = [
  {
    src: INSTAGRAM_LOGO, alt: "Instagram",
    desktop: { top: "-10%", right: "-8%",  size: 110, rotate: 12 },
    mobile:  { top: "-5%",  right: "-4%",  size: 64,  rotate: 12 },
    delay: 0,    reverse: false, flipX: false,
  },
  {
    src: UPLOAD_LOGO, alt: "Upload",
    desktop: { top: "38%",  right: "-14%", size: 78,  rotate: 6 },
    mobile:  { top: "40%",  right: "-7%",  size: 46,  rotate: 6 },
    delay: 0.5,  reverse: true,  flipX: true,
  },
  {
    src: INSTAGRAM_LOGO, alt: "Instagram",
    desktop: { bottom: "-4%", right: "0%",  size: 92,  rotate: -14 },
    mobile:  { bottom: "-2%", right: "0%",  size: 54,  rotate: -14 },
    delay: 1.0,  reverse: false, flipX: true,
  },
  {
    src: UPLOAD_LOGO, alt: "Upload",
    desktop: { bottom: "12%", left: "-12%", size: 72,  rotate: -8 },
    mobile:  { bottom: "8%",  left: "-5%",  size: 42,  rotate: -8 },
    delay: 0.3,  reverse: true,  flipX: false,
  },
  {
    src: INSTAGRAM_LOGO, alt: "Instagram",
    desktop: { top: "8%",   left: "-10%",  size: 88,  rotate: 18 },
    mobile:  { top: "4%",   left: "-5%",   size: 52,  rotate: 18 },
    delay: 0.8,  reverse: false, flipX: true,
  },
];

const BRIEFLEE_EYES =
  "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_sticker-blue-cartoon-eyes-looking-side-navy_2026-03.png";

const DEMO_URL = "https://www.brieflee.co/book-a-demo";

const TYPING_WORDS = ["Instagram Reel", "Reel", "Instagram ad", "Branded Reel", "IG video"];

function isValidInstagramUrl(input) {
  if (!input) return false;
  try {
    const u = new URL(input.trim());
    return /(^|\.)(instagram\.com)$/.test(u.hostname);
  } catch {
    return false;
  }
}

function isValidEmail(input) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((input || "").trim());
}

// Personal / throwaway email domains — blocked across every Brieflee
// lead-magnet form to keep lead quality high.
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

function useTypingCycle(words, { typeMs = 70, deleteMs = 35, holdMs = 1400 } = {}) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [phase, setPhase] = useState("typing");

  useEffect(() => {
    const word = words[wordIndex] || "";
    let t;
    if (phase === "typing") {
      if (text.length < word.length) {
        t = setTimeout(() => setText(word.slice(0, text.length + 1)), typeMs);
      } else {
        t = setTimeout(() => setPhase("holding"), 0);
      }
    } else if (phase === "holding") {
      t = setTimeout(() => setPhase("deleting"), holdMs);
    } else if (phase === "deleting") {
      if (text.length > 0) {
        t = setTimeout(() => setText(word.slice(0, text.length - 1)), deleteMs);
      } else {
        setWordIndex((wordIndex + 1) % words.length);
        setPhase("typing");
      }
    }
    return () => clearTimeout(t);
  }, [text, wordIndex, phase, words, typeMs, deleteMs, holdMs]);

  return text;
}

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
        transform: `rotate(${dims.rotate}deg)${logo.flipX ? " scaleX(-1)" : ""}`,
        animation: `briefleeHeroFloatY 7s ease-in-out ${logo.delay}s infinite ${
          logo.reverse ? "alternate-reverse" : "alternate"
        }`,
        filter: "drop-shadow(0 12px 24px rgba(99, 102, 241, 0.25))",
      }}
    >
      <img src={logo.src} alt={logo.alt} className="w-full h-full object-contain" draggable={false} />
    </div>
  );
}

function HeroSection() {
  const [tab, setTab] = useState("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [step, setStep] = useState("hero");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const typedWord = useTypingCycle(TYPING_WORDS);
  const createEvent  = useRecordCreate({ fields: eventWrite, from: ds.leadEvents });
  // useUpload() returns { uploadAsync, isUploading } — NOT a mutation.
  const { uploadAsync } = useUpload();

  const handleStart = () => {
    setError("");
    if (tab === "url" && !isValidInstagramUrl(url)) {
      setError("Paste a valid Instagram Reel URL (instagram.com).");
      return;
    }
    if (tab === "file" && !file) {
      setError("Choose a video file to upload.");
      return;
    }
    setStep("loading");
    setTimeout(() => setStep("email"), 3500);
  };

  const handleSubmitEmail = async () => {
    setError("");
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!isWorkEmail(email)) {
      setError("Use your company email instead. Personal @gmail.com, @yahoo.com, etc. aren't supported.");
      return;
    }
    setSubmitting(true);

    try {
      // The upload still happens, so the video travels with the lead
      // rather than being lost. It lands in the event payload.
      let uploadedUrl = "";
      if (tab === "file" && file) {
        // uploadAsync resolves to an ARRAY of { id, file, status, url }.
        const [result] = await uploadAsync(file);
        if (!result || result.status !== "completed" || !result.url) {
          throw new Error("Video upload didn't complete.");
        }
        uploadedUrl = result.url;
      }

      // One event per submission. Neither write blocks the redirect,
      // because a capture failure should never strand someone here.
      createEvent.mutateAsync({
        email: email.trim(),
        name: "",
        website: "",
        source: OPT_SOURCE,
        channel: OPT_CHANNEL,
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
        landingPage: typeof window !== "undefined" ? window.location.pathname : "",
        submittedAt: new Date().toISOString(),
        payload: JSON.stringify({
          stage: "submitted",
          platform: "Instagram",
          video_url: tab === "url" ? url.trim() : "",
          uploaded_video: uploadedUrl,
        }),
      }).catch((e) => console.error("lead_event write failed (continuing):", e));

      const target = `${DEMO_URL}?email=${encodeURIComponent(email.trim())}&intent=instagram-analyser`;
      window.location.href = target;
    } catch (e) {
      console.error("=== instagram-analyser create failed:", e);
      setError(e?.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

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
        @keyframes briefleeHeroPulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/[0.04] to-primary/[0.10]" />
        <div className="absolute top-[-10%] right-[-10%] h-[420px] w-[420px] rounded-full bg-primary/25 blur-[120px]" />
        <div className="absolute bottom-[-15%] left-[-8%] h-[340px] w-[340px] rounded-full bg-primary/15 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="container py-14 md:py-20 lg:py-24">
        <div className="content max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
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
                Instagram Reel Analyser
              </div>

              <div className="space-y-1">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05]" style={{ color: NAVY }}>
                  See a Reel you love.
                  <br />
                  Break it down in seconds.
                </h1>
                <div
                  className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05]"
                  style={{ color: PERIWINKLE }}
                  aria-live="polite"
                >
                  <span>{typedWord}</span>
                  <span className="ml-0.5 inline-block w-[3px] h-[0.85em] align-[-0.05em] animate-pulse" style={{ background: PERIWINKLE }} />
                </div>
              </div>

              <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
                Paste an Instagram Reel URL or upload a file. In 60 seconds, you'll know
                exactly why it worked and which bits to copy. Hook, structure, pacing,
                CTA, all scored.
              </p>

              {step === "hero" && (
                <div className="space-y-4 pt-1">
                  <div className="inline-flex rounded-full border border-border bg-card/80 backdrop-blur p-1 shadow-sm">
                    <button type="button" onClick={() => { setTab("url"); setError(""); }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${tab === "url" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                      <LinkIcon className="h-4 w-4" />Paste URL
                    </button>
                    <button type="button" onClick={() => { setTab("file"); setError(""); }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${tab === "file" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                      <Upload className="h-4 w-4" />Upload file
                    </button>
                  </div>

                  {tab === "url" ? (
                    <div className="flex flex-col sm:flex-row gap-2 rounded-2xl border border-border bg-card p-2 shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.35)]">
                      <Input value={url} onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleStart(); }}
                        placeholder="https://www.instagram.com/reel/..."
                        className="flex-1 h-14 text-base border-0 shadow-none focus-visible:ring-0 bg-transparent" />
                      <Button onClick={handleStart} className="h-14 px-7 text-base font-semibold rounded-xl">
                        Break it down<ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center justify-center gap-3 h-32 border-2 border-dashed border-primary/40 bg-primary/[0.04] rounded-2xl cursor-pointer hover:bg-primary/[0.07] hover:border-primary/60 transition-all">
                        <Upload className="h-6 w-6 text-primary" />
                        <span className="text-base text-muted-foreground">
                          {file ? <span className="text-foreground font-medium">{file.name}</span> : "Drop a Reel video file or click to upload"}
                        </span>
                        <input type="file" accept="video/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                      </label>
                      <Button onClick={handleStart} className="h-14 px-7 text-base font-semibold rounded-xl">
                        Break it down<ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  )}

                  {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground pt-1">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-primary"
                        style={{ animation: "briefleeHeroPulseDot 1.4s ease-in-out infinite" }} />
                      Free to use
                    </span>
                    <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> Under 60 seconds</span>
                    <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> Frame by frame</span>
                  </div>
                </div>
              )}

              {step === "loading" && (
                <div className="space-y-4 pt-2 max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <p className="text-base font-semibold text-foreground">Analysing your Reel</p>
                  </div>
                  <ul className="space-y-2.5 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Detecting hook timing and opening frame</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Mapping scene transitions frame by frame</li>
                    <li className="flex items-center gap-2 opacity-70"><Loader2 className="h-4 w-4 animate-spin" />Scoring engagement pacing and CTA placement</li>
                  </ul>
                </div>
              )}

              {step === "email" && (
                <div className="space-y-5 pt-2 max-w-md rounded-2xl border border-border bg-card p-6 shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.4)]">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 pl-1 pr-2.5 py-0.5 text-xs font-medium text-primary mb-3">
                      <img src={BRIEFLEE_EYES} alt="" className="h-4 w-4" draggable={false} />
                      Breakdown queued
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">Your Reel breakdown runs live</h2>
                    <p className="text-sm text-muted-foreground">
                      The full frame-by-frame breakdown of this video happens on a free 30-minute call, on your video, no account needed. Drop your email and pick a time.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !submitting) handleSubmitEmail(); }}
                      placeholder="you@yourbrand.com" className="h-12 text-base" autoFocus />
                    <Button onClick={handleSubmitEmail} disabled={submitting} className="h-12 text-base font-semibold">
                      {submitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving</>) : (<>Pick a time<ArrowRight className="ml-2 h-4 w-4" /></>)}
                    </Button>
                  </div>
                  {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
                </div>
              )}
            </div>

            <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[360px] md:max-w-[420px] lg:max-w-[480px] aspect-square mt-6 lg:mt-0">
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-[80px] -z-10" aria-hidden="true" />

              <div className="relative w-full h-full rounded-full overflow-hidden border-[6px] border-card shadow-[0_30px_80px_-25px_hsl(var(--primary)/0.55)] bg-card">
                <img src={HERO_ASSET.src} alt={HERO_ASSET.alt} className="w-full h-full object-cover" draggable={false} />
              </div>

              <div className="hidden md:block">
                {FLOATING_LOGOS.map((logo, i) => (<FloatingLogo key={`d-${i}`} logo={logo} isDesktop />))}
              </div>
              <div className="md:hidden">
                {FLOATING_LOGOS.map((logo, i) => (<FloatingLogo key={`m-${i}`} logo={logo} isDesktop={false} />))}
              </div>

              <div className="absolute top-[8%] left-[55%] z-30 flex items-center gap-2 rounded-full bg-card border border-border shadow-md px-3 py-1.5 text-xs font-semibold"
                style={{ animation: "briefleeHeroChipFloat 6s ease-in-out 0.4s infinite alternate" }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Live AI analysis
              </div>

              <div className="absolute bottom-[8%] right-[58%] z-30 flex items-center gap-2 rounded-2xl bg-card border border-border shadow-lg px-4 py-2.5"
                style={{ animation: "briefleeHeroChipFloat 6s ease-in-out 1.0s infinite alternate-reverse" }}>
                <div className="text-2xl font-bold text-primary leading-none">94</div>
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Hook score</div>
                  <div className="text-xs text-foreground font-medium">First 0.7s</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// what-you-get.jsx
// ═══════════════════════════════════════════════════════════

// =====================================================================
// Vibe Coding block: Video Breakdown / What you get
// =====================================================================
// Drop into a Softr Vibe Coding block on /free-tool-instagram-reel-analyser,
// directly under the hero block.
//
// Pure visual block, no data layer.
// =====================================================================




const FEATURE_CARDS = [
  {
    title: "Hook timing scored frame by frame",
    body:
      "Every visual, audio, and text element in the first 3 seconds, tagged against the patterns from millions of high-performing Reels. See exactly which hook hit and why.",
    img: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/5d89700f-5e53-41fb-9ee3-7f3e88d2be8c.png",
    alt: "Brieflee scoring multiple Reel videos with pass and fail flags into a chat report",
  },
  {
    title: "Frame-by-frame structure breakdown",
    body:
      "Scene transitions, pacing, on-screen text, all mapped to a timeline. Spot which scenes drove engagement and which lost viewers.",
    img: "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_feature-card_video-breakdown-analysis-three-frame-skincare-storyboard-mockup_2025-12.png",
    alt: "Three-frame storyboard breakdown of a skincare creator video showing hook, story, and reveal",
  },
  {
    title: "Remix-ready brief for your next video",
    body:
      "Hook, script, action, text overlay, all extracted from what worked. Hand it straight to a creator or shoot it yourself. No guesswork.",
    img: "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_feature-card_video-remix-blueprint-two-clips-with-arrows-skincare-creator-side-by-side_2026-03.png",
    alt: "Side-by-side video remix blueprint pulling a brief from a viral clip into a new creator video",
  },
];

const SUPPORTING_BENEFITS = [
  {
    icon: Mic2,
    title: "Audio + voiceover cues",
    body: "Music sync, voiceover delivery, background noise, all flagged with timestamps.",
  },
  {
    icon: Target,
    title: "CTA placement scoring",
    body: "Where the call-to-action lands and how strong it is, second by second.",
  },
  {
    icon: Activity,
    title: "Engagement pattern detection",
    body: "Pattern interrupts, curiosity gaps, attention drops, surfaced and named.",
  },
  {
    icon: Repeat,
    title: "Adaptable to your brand",
    body: "Tweak the brief to fit your product, voice, and audience without losing what made it work.",
  },
  {
    icon: Eye,
    title: "Watchable on mute check",
    body: "Captions, on-screen text, and visual storytelling reviewed for sound-off viewers.",
  },
  {
    icon: SparklesIcon,
    title: "Quality + safe-zone flags",
    body: "Lighting, framing, copyright snags, distracting elements, called out before you share.",
  },
];

function WhatYouGet() {
  return (
    <div className="relative w-full">
      <div className="container py-16 md:py-20 lg:py-24">
        <div className="content max-w-6xl mx-auto">
          {/* Section header */}
          <div className="max-w-3xl mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card pl-1.5 pr-3 py-1 text-xs font-medium text-muted-foreground mb-5">
              <img src={BRIEFLEE_EYES} alt="" className="h-5 w-5" draggable={false} />
              What you get
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] text-foreground">
              The full breakdown.
              <br />
              In 60 seconds.
            </h2>
            <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
              Brieflee scores every part of the Reel against the patterns from millions
              of high-performing Reels. You get a remix-ready brief,
              not a vibe check.
            </p>
          </div>

          {/* Big feature cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {FEATURE_CARDS.map((card, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-border bg-card overflow-hidden transition-all hover:shadow-[0_20px_60px_-25px_hsl(var(--primary)/0.4)] hover:-translate-y-1 hover:border-primary/30"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/[0.06] to-primary/[0.12] overflow-hidden">
                  <img
                    src={card.img}
                    alt={card.alt}
                    className="w-full h-full object-cover"
                    draggable={false}
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg md:text-xl font-bold text-foreground leading-tight">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed">
                    {card.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Supporting benefits grid */}
          <div className="mt-12 md:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            {SUPPORTING_BENEFITS.map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={i} className="flex gap-3">
                  <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-primary/10 grid place-items-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground leading-tight">
                      {b.title}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {b.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// how-it-works.jsx
// ═══════════════════════════════════════════════════════════

// =====================================================================
// Vibe Coding block: Video Breakdown / How it works (3 steps)
// =====================================================================
// Drop into a Softr Vibe Coding block on /free-tool-instagram-reel-analyser.
// =====================================================================




const STEPS = [
  {
    number: "01",
    icon: LinkIcon,
    title: "Paste a URL or drop a file",
    body:
      "Any Instagram Reel, or your own video file. We support any short-form clip under 3 minutes.",
    img: null,
  },
  {
    number: "02",
    icon: Cpu,
    title: "AI breaks it down frame by frame",
    body:
      "Computer vision walks every frame. Speech-to-text picks up the audio. Scene changes, on-screen text, hook timing, all scored against millions of high-performing videos.",
    img: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/6d59dce5-a4d4-4ea0-86d4-70e51946f576.png",
    alt: "Brieflee analysing a creator's video and producing a content score",
  },
  {
    number: "03",
    icon: FileText,
    title: "Get a remix-ready brief",
    body:
      "Hook, script, action, text overlay, all pulled out into a brief you can hand to a creator or shoot yourself. Built with you on the call, and yours to keep.",
    img: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/dec02029-7fab-44f0-95c5-d2fb24be40fc.png",
    alt: "Brieflee converting a viral creator video into a structured creator brief",
  },
];

function HowItWorks() {
  return (
    <div className="relative w-full bg-gradient-to-b from-background via-primary/[0.03] to-background">
      <div className="container py-16 md:py-20 lg:py-24">
        <div className="content max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 md:mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card pl-1.5 pr-3 py-1 text-xs font-medium text-muted-foreground mb-5">
              <img src={BRIEFLEE_EYES} alt="" className="h-5 w-5" draggable={false} />
              How it works
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] text-foreground">
              Three steps. Sixty seconds.
            </h2>
            <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
              No editing. No download. No login until you've seen the breakdown.
            </p>
          </div>

          <div className="space-y-12 md:space-y-16">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isReverse = i % 2 === 1;
              return (
                <div
                  key={i}
                  className={`grid md:grid-cols-2 gap-8 md:gap-12 items-center ${
                    isReverse ? "md:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  {/* Copy */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-5xl md:text-6xl font-black text-primary/30 leading-none">
                        {step.number}
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-primary/10 grid place-items-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-base md:text-lg text-muted-foreground leading-relaxed">
                      {step.body}
                    </p>
                  </div>

                  {/* Image (or empty grid cell on step 1) */}
                  <div>
                    {step.img ? (
                      <div className="relative">
                        <div
                          className="absolute inset-0 rounded-3xl bg-primary/15 blur-[60px] -z-10"
                          aria-hidden="true"
                        />
                        <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-[0_20px_60px_-25px_hsl(var(--primary)/0.45)]">
                          <img
                            src={step.img}
                            alt={step.alt}
                            className="w-full h-auto block"
                            draggable={false}
                            loading="lazy"
                          />
                        </div>
                      </div>
                    ) : (
                      // Step 1: visual placeholder showing platform icons
                      <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/[0.04] aspect-[4/3] grid place-items-center p-6 overflow-hidden">
                        <div className="flex items-center justify-center gap-6 md:gap-10">
                          <img
                            src="https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_instagram-logo-3d-transparent_2026-05.png"
                            alt="Instagram"
                            className="h-32 w-32 md:h-44 md:w-44 object-contain"
                            draggable={false}
                            loading="lazy"
                            style={{ transform: "rotate(-6deg)", filter: "drop-shadow(0 16px 32px hsl(var(--primary) / 0.30))" }}
                          />
                          <span className="text-3xl md:text-4xl font-bold text-primary/40 select-none">+</span>
                          <img
                            src="https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_upload-cloud-3d-transparent_2026-05.png"
                            alt="Upload"
                            className="h-20 w-20 md:h-28 md:w-28 object-contain"
                            draggable={false}
                            loading="lazy"
                            style={{ transform: "rotate(8deg)", filter: "drop-shadow(0 12px 24px hsl(var(--primary) / 0.25))" }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// faq.jsx
// ═══════════════════════════════════════════════════════════

// =====================================================================
// Vibe Coding block: Video Breakdown / FAQ
// =====================================================================
// Drop into a Softr Vibe Coding block on /free-tool-instagram-reel-analyser.
//
// FAQ targets People-Also-Ask queries surfaced by NeuronWriter:
//   - What is video analysis AI / What is the YouTube video summarizer?
//   - Is the AI video analyzer free?
//   - Can it analyze YouTube videos?
//   - What can the AI detect?
//   - Is it safe to upload sensitive video?
//   - What AI can analyze videos? (vs ChatGPT)
//   - How do I analyze a Reel with AI?
//   - How accurate is the AI analysis?
// =====================================================================





const FAQS = [
  {
    q: "What is the Brieflee Video Breakdown tool?",
    a: "An AI tool that breaks down any Reel frame by frame and tells you why it works. Paste a Instagram Reel URL, or upload a file. In about 60 seconds you get a scored report covering hook timing, scene structure, audio, on-screen text, and CTA placement, plus a remix-ready brief you can use for your next video.",
  },
  {
    q: "Is it really free?",
    a: "Yes. Free to paste a URL, free to upload a file, free to view your breakdown. Leave an email and pick a time, and the full breakdown of your video runs live on a free 30-minute call.",
  },
  {
    q: "Can it analyse any Reel?",
    a: "Yes. Paste any public Reel URL from instagram.com and the tool processes it directly. You can also upload your own MP4 or MOV file if the Reel is private or unpublished.",
  },
  {
    q: "What does the AI actually detect?",
    a: "Hook timing, scene transitions, on-screen text and captions, product visibility, creator face time, audio clarity and music sync, CTA placement, pacing, and engagement patterns. Each element is scored against the patterns from millions of high-performing Reels so you can see what landed and what didn't.",
  },
  {
    q: "Why not just ask ChatGPT to break down a Reel?",
    a: "Text-only models like ChatGPT can't process continuous video. They can read a transcript or look at a single frame, but they don't see scene transitions, audio sync, or on-screen text in motion. Brieflee runs computer vision frame by frame, picks up the audio, and reads the on-screen text in one pass.",
  },
  {
    q: "How accurate is it?",
    a: "Brieflee scores video against the same patterns top creative strategists use, trained on millions of high-performing Reels. It won't predict virality with certainty, no tool can, but it will reliably tell you which hooks, scene patterns, and CTAs are statistically aligned with content that performs.",
  },
  {
    q: "Is it safe to upload a Reel that hasn't been published yet?",
    a: "Yes. Files are processed on encrypted infrastructure and aren't used to train public AI models. Attachment links expire automatically after one hour. If you want to delete the file from our system entirely, do it from your dashboard after the breakdown is generated.",
  },
  {
    q: "Is there a video length limit?",
    a: "The tool is built for Reel video, so the sweet spot is anything under 3 minutes. Longer videos still run, but the breakdown gets less precise as duration grows because short-form patterns stop applying.",
  },
];

function FaqItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 md:py-6 text-left group"
        aria-expanded={isOpen}
      >
        <h3 className="text-base md:text-lg font-semibold text-foreground leading-snug pr-4 group-hover:text-primary transition-colors">
          {q}
        </h3>
        <span
          className={`flex-shrink-0 h-8 w-8 rounded-full grid place-items-center transition-all ${
            isOpen
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
          }`}
        >
          {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100 pb-5 md:pb-6" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed pr-12">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="relative w-full">
      <div className="container py-16 md:py-20 lg:py-24">
        <div className="content max-w-3xl mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card pl-1.5 pr-3 py-1 text-xs font-medium text-muted-foreground mb-5">
              <img src={BRIEFLEE_EYES} alt="" className="h-5 w-5" draggable={false} />
              FAQs
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] text-foreground">
              Things people ask before they paste.
            </h2>
          </div>

          <div className="rounded-2xl border border-border bg-card px-5 md:px-8">
            {FAQS.map((faq, i) => (
              <FaqItem
                key={i}
                q={faq.q}
                a={faq.a}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// final-cta.jsx
// ═══════════════════════════════════════════════════════════

// =====================================================================
// Vibe Coding block: Video Breakdown / Final CTA
// =====================================================================
// Drop into a Softr Vibe Coding block at the bottom of /free-tool-instagram-reel-analyser.
//
// The actual URL/upload flow lives in the hero block at the top of the
// page. This block is a visual prompt that scrolls the user back up.
// =====================================================================






const LOGOS = [
  "instagram-logo-3d-transparent",
  "upload-cloud-3d-transparent",
];

function scrollToTop(e) {
  e?.preventDefault?.();
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function FinalCta() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-background to-primary/[0.10]" />
        <div className="absolute top-[-20%] left-1/4 h-[420px] w-[420px] rounded-full bg-primary/25 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-1/4 h-[360px] w-[360px] rounded-full bg-primary/15 blur-[100px]" />
      </div>

      <div className="container py-20 md:py-24 lg:py-28">
        <div className="content max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card pl-1.5 pr-3 py-1 text-xs font-medium text-muted-foreground mb-6">
            <img src={BRIEFLEE_EYES} alt="" className="h-5 w-5" draggable={false} />
            Free to use
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] text-foreground">
            Break down a Reel.
            <br />
            See what you've been missing.
          </h2>
          <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            One paste, 60 seconds, full breakdown. Hook, structure, pacing, CTA, all
            scored. Free.
          </p>

          {/* Floating logo strip */}
          <div className="mt-10 flex items-center justify-center gap-3 md:gap-5 flex-wrap">
            {LOGOS.map((slug, i) => (
              <img
                key={slug}
                src={`${LOGO_BASE}${slug}_2026-05.png`}
                alt=""
                className="h-12 w-12 md:h-14 md:w-14 object-contain"
                draggable={false}
                loading="lazy"
                style={{
                  transform: `rotate(${i % 2 === 0 ? -6 : 6}deg)`,
                  filter: "drop-shadow(0 8px 16px hsl(var(--primary) / 0.2))",
                }}
              />
            ))}
          </div>

          <div className="mt-10">
            <Button
              onClick={scrollToTop}
              className="h-14 px-8 text-base font-semibold rounded-xl"
            >
              <ArrowUp className="mr-2 h-5 w-5" />
              Break down a Reel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── The page ────────────────────────────────────────────────
export default function Block() {
  return (
    <>
      <HeroSection />
      <WhatYouGet />
      <HowItWorks />
      <Faq />
      <FinalCta />
    </>
  );
}