// =====================================================================
// Vibe Coding block: Free Tool, Video Breakdown (hero + Trojan horse)
// =====================================================================
//
// Drop into a Softr Vibe Coding block on /free-tool-video-breakdown.
//
// SOFTR UI SETUP (one-time, in the Vibe block tabs, not in code):
//   1. Source tab → Database: brieflee leads → Table: Tools
//      (database 05992413..., table grM0jAXaDhZkRt)
//   2. Actions tab → enable "Add Record". Field aliases auto-populate.
//   3. Visibility tab → public.
//
// FLOW
//   Step 1 (hero): paste URL OR upload file → "Break it down"
//   Step 2 (loading): 3.5s analysis animation
//   Step 3 (email): "Your breakdown is ready" → email →
//      writes Tools record → redirect to /sign-up?email=...&intent=video-breakdown
//
// HERO ASSET, swap HERO_ASSET below for one of three options:
//   A. animatedFeature  (default GIF, the one Bev picked)
//   B. passFailReport   (multi-creator pass/fail with chat report)
//   C. annotatedFrame   (creator with handwritten callouts)
// =====================================================================

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRecordCreate, useUpload, q } from "@/lib/datasource";
import { ArrowRight, Check, Upload, Link as LinkIcon, Loader2 } from "lucide-react";

// ----- Brieflee eyes sticker, used as eyebrow + breakdown-ready accent -----
const BRIEFLEE_EYES =
  "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_sticker-blue-cartoon-eyes-looking-side-navy_2026-03.png";

// ----- Tools table field aliases (keys MUST match these on write) -----
const createFields = q.select({
  email:    "65Dkd",
  platform: "73gXm",
  page:     "o55YI",
  videoUrl: "TYZsr",
  video:    "F06WW",
});

const PLATFORM_BRIEFLEE = {
  id: "bb558681-9e58-46c2-a68f-11b335835d7f",
  label: "Brieflee",
};
const PAGE_VIDEO_BREAKDOWN = {
  id: "866ae62a-1bc3-4a94-83cf-801e5c022ff7",
  label: "Video Breakdown",
};

// ----- Hero asset options -----
const HERO_OPTIONS = {
  animatedFeature: {
    src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/67cf964b-07bc-4141-a753-d8aa833704ef.gif",
    alt: "Brieflee analysing a short-form video frame by frame",
  },
  passFailReport: {
    src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/5d89700f-5e53-41fb-9ee3-7f3e88d2be8c.png",
    alt: "Brieflee scoring multiple creator videos with pass and fail flags",
  },
  annotatedFrame: {
    src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/35bc2415-6e39-415d-80cb-75fc8d753839.png",
    alt: "Brieflee tracking creator movement and product handling on a video",
  },
};
const HERO_ASSET = HERO_OPTIONS.animatedFeature;

// ----- Floating platform logos around the hero asset (3D, transparent) -----
const LOGO_BASE = "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_";
const FLOATING_LOGOS = [
  {
    src: `${LOGO_BASE}tiktok-logo-3d-transparent_2026-05.png`,
    alt: "TikTok",
    desktop: { top: "-8%",  right: "-6%",  size: 96, rotate: 12 },
    mobile:  { top: "-4%",  right: "-3%",  size: 56, rotate: 12 },
    delay: 0,
    reverse: false,
  },
  {
    src: `${LOGO_BASE}instagram-logo-3d-transparent_2026-05.png`,
    alt: "Instagram Reel",
    desktop: { top: "10%",  left: "-12%",  size: 88, rotate: -10 },
    mobile:  { top: "6%",   left: "-5%",   size: 52, rotate: -10 },
    delay: 0.5,
    reverse: true,
  },
  {
    src: `${LOGO_BASE}youtube-shorts-logo-3d-transparent_2026-05.png`,
    alt: "YouTube Short",
    desktop: { bottom: "8%", left: "-8%",  size: 80, rotate: 8 },
    mobile:  { bottom: "6%", left: "-3%",  size: 48, rotate: 8 },
    delay: 1.0,
    reverse: false,
  },
  {
    src: `${LOGO_BASE}facebook-logo-3d-transparent_2026-05.png`,
    alt: "Facebook Reel",
    desktop: { bottom: "-6%", right: "-4%", size: 84, rotate: -12 },
    mobile:  { bottom: "-3%", right: "-3%", size: 52, rotate: -12 },
    delay: 0.3,
    reverse: true,
  },
  {
    src: `${LOGO_BASE}upload-cloud-3d-transparent_2026-05.png`,
    alt: "Video file upload",
    desktop: { top: "42%",  right: "-14%", size: 76, rotate: 6 },
    mobile:  { top: "44%",  right: "-6%",  size: 46, rotate: 6 },
    delay: 0.8,
    reverse: false,
  },
];

const SIGNUP_URL = "https://www.brieflee.co/sign-up";
const LOGIN_URL = "https://www.brieflee.co/login";

const TYPING_WORDS = ["TikTok", "Instagram Reel", "YouTube Short", "Facebook Reel", "Video file"];

// ----- Helpers -----
function isValidShortFormUrl(input) {
  if (!input) return false;
  try {
    const u = new URL(input.trim());
    return /(^|\.)(tiktok\.com|instagram\.com|youtube\.com|youtu\.be|facebook\.com|fb\.watch|x\.com|twitter\.com|linkedin\.com)$/.test(
      u.hostname
    );
  } catch {
    return false;
  }
}

function isValidEmail(input) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((input || "").trim());
}

// ----- Typing cycle hook -----
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

// ----- FloatingLogo sub-component -----
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
        animation: `briefleeHeroFloatY 7s ease-in-out ${logo.delay}s infinite ${
          logo.reverse ? "alternate-reverse" : "alternate"
        }`,
        filter: "drop-shadow(0 12px 24px rgba(99, 102, 241, 0.25))",
      }}
    >
      <img
        src={logo.src}
        alt={logo.alt}
        className="w-full h-full object-contain"
        draggable={false}
      />
    </div>
  );
}

// =====================================================================
// Block
// =====================================================================
export default function Block() {
  const [tab, setTab] = useState("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [step, setStep] = useState("hero");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const typedWord = useTypingCycle(TYPING_WORDS);
  const createRecord = useRecordCreate({ fields: createFields });
  const upload = useUpload();

  const handleStart = () => {
    setError("");
    if (tab === "url" && !isValidShortFormUrl(url)) {
      setError("Paste a valid TikTok, Instagram Reel, YouTube Short, or Facebook Reel URL.");
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
    if (!createRecord.enabled) {
      setError("We can't start your analysis right now. Try again in a moment.");
      return;
    }

    setSubmitting(true);
    try {
      let videoAttachment = null;
      if (tab === "file" && file) {
        videoAttachment = await upload.mutateAsync(file);
      }

      const fields = {
        email: email.trim(),
        platform: PLATFORM_BRIEFLEE,
        page: PAGE_VIDEO_BREAKDOWN,
        videoUrl: tab === "url" ? url.trim() : "",
      };
      if (videoAttachment) fields.video = videoAttachment;

      await createRecord.mutateAsync(fields);

      toast.success("Your breakdown is on its way", {
        description: "Check your inbox in a moment.",
      });

      const target = `${SIGNUP_URL}?email=${encodeURIComponent(email.trim())}&intent=video-breakdown`;
      window.location.href = target;
    } catch (e) {
      console.error("=== video-breakdown create failed:", e);
      setError(e?.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* CSS keyframes for floating elements */}
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

      {/* Background wash + glow blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/[0.04] to-primary/[0.10]" />
        <div className="absolute top-[-10%] right-[-10%] h-[420px] w-[420px] rounded-full bg-primary/25 blur-[120px]" />
        <div className="absolute bottom-[-15%] left-[-8%] h-[340px] w-[340px] rounded-full bg-primary/15 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="container py-14 md:py-20 lg:py-24">
        <div className="content max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
            {/* LEFT: copy + input */}
            <div className="space-y-6">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 backdrop-blur pl-1.5 pr-3 py-1 text-xs font-medium text-muted-foreground">
                <img src={BRIEFLEE_EYES} alt="" className="h-5 w-5" draggable={false} />
                Free AI video breakdown
              </div>

              {/* H1 + typing text. Same size, same weight. */}
              <div className="space-y-1">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-foreground">
                  See a video you love.
                  <br />
                  Break it down in seconds.
                </h1>
                <div
                  className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-primary"
                  aria-live="polite"
                >
                  <span>{typedWord}</span>
                  <span className="ml-0.5 inline-block w-[3px] h-[0.85em] align-[-0.05em] bg-primary animate-pulse" />
                </div>
              </div>

              {/* Subhead */}
              <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
                Paste it or upload it. In 60 seconds, you'll know exactly why it worked
                and which bits to copy. Hook, structure, pacing, CTA, all scored. Free,
                no credit card.
              </p>

              {/* ---------------- STEP 1: HERO INPUT ---------------- */}
              {step === "hero" && (
                <div className="space-y-4 pt-1">
                  <div className="inline-flex rounded-full border border-border bg-card/80 backdrop-blur p-1 shadow-sm">
                    <button
                      type="button"
                      onClick={() => { setTab("url"); setError(""); }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        tab === "url"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <LinkIcon className="h-4 w-4" />
                      Paste URL
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTab("file"); setError(""); }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        tab === "file"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Upload className="h-4 w-4" />
                      Upload file
                    </button>
                  </div>

                  {tab === "url" ? (
                    <div className="flex flex-col sm:flex-row gap-2 rounded-2xl border border-border bg-card p-2 shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.35)]">
                      <Input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleStart();
                        }}
                        placeholder="https://www.tiktok.com/@creator/video/..."
                        className="flex-1 h-14 text-base border-0 shadow-none focus-visible:ring-0 bg-transparent"
                      />
                      <Button
                        onClick={handleStart}
                        className="h-14 px-7 text-base font-semibold rounded-xl"
                      >
                        Break it down
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center justify-center gap-3 h-32 border-2 border-dashed border-primary/40 bg-primary/[0.04] rounded-2xl cursor-pointer hover:bg-primary/[0.07] hover:border-primary/60 transition-all">
                        <Upload className="h-6 w-6 text-primary" />
                        <span className="text-base text-muted-foreground">
                          {file ? (
                            <span className="text-foreground font-medium">{file.name}</span>
                          ) : (
                            "Drop a video file or click to upload"
                          )}
                        </span>
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                      </label>
                      <Button
                        onClick={handleStart}
                        className="h-14 px-7 text-base font-semibold rounded-xl"
                      >
                        Break it down
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  )}

                  {error && (
                    <p className="text-sm text-destructive" role="alert">
                      {error}
                    </p>
                  )}

                  {/* Trust strip with pulsing dot */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground pt-1">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="inline-block w-2 h-2 rounded-full bg-primary"
                        style={{ animation: "briefleeHeroPulseDot 1.4s ease-in-out infinite" }}
                      />
                      Free, no credit card
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-primary" /> Under 60 seconds
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-primary" /> Frame by frame
                    </span>
                  </div>
                </div>
              )}

              {/* ---------------- STEP 2: FAKE LOADING ---------------- */}
              {step === "loading" && (
                <div className="space-y-4 pt-2 max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <p className="text-base font-semibold text-foreground">
                      Analysing your video
                    </p>
                  </div>
                  <ul className="space-y-2.5 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Detecting hook timing and opening frame
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Mapping scene transitions frame by frame
                    </li>
                    <li className="flex items-center gap-2 opacity-70">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Scoring engagement pacing and CTA placement
                    </li>
                  </ul>
                </div>
              )}

              {/* ---------------- STEP 3: EMAIL GATE ---------------- */}
              {step === "email" && (
                <div className="space-y-5 pt-2 max-w-md rounded-2xl border border-border bg-card p-6 shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.4)]">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 pl-1 pr-2.5 py-0.5 text-xs font-medium text-primary mb-3">
                      <img src={BRIEFLEE_EYES} alt="" className="h-4 w-4" draggable={false} />
                      Breakdown ready
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">
                      Your video breakdown is ready
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Drop your email and we'll send the full report. Hooks, structure,
                      audio, CTA, all scored.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !submitting) handleSubmitEmail();
                      }}
                      placeholder="you@yourbrand.com"
                      className="h-12 text-base"
                      autoFocus
                    />
                    <Button
                      onClick={handleSubmitEmail}
                      disabled={submitting || !createRecord.enabled}
                      className="h-12 text-base font-semibold"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving
                        </>
                      ) : (
                        <>
                          View my breakdown
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                  {error && (
                    <p className="text-sm text-destructive" role="alert">
                      {error}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Already have an account?{" "}
                    <a href={LOGIN_URL} className="underline font-medium text-foreground">
                      Log in
                    </a>
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT: hero asset (circle) with floating logos */}
            <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[360px] md:max-w-[420px] lg:max-w-[480px] aspect-square mt-6 lg:mt-0">
              {/* Glow halo behind */}
              <div
                className="absolute inset-0 rounded-full bg-primary/30 blur-[80px] -z-10"
                aria-hidden="true"
              />

              {/* Asset card, circular */}
              <div className="relative w-full h-full rounded-full overflow-hidden border-[6px] border-card shadow-[0_30px_80px_-25px_hsl(var(--primary)/0.55)] bg-card">
                <img
                  src={HERO_ASSET.src}
                  alt={HERO_ASSET.alt}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>

              {/* Floating platform logos, desktop positions */}
              <div className="hidden md:block">
                {FLOATING_LOGOS.map((logo, i) => (
                  <FloatingLogo key={`d-${i}`} logo={logo} isDesktop />
                ))}
              </div>
              {/* Floating platform logos, mobile/tablet positions */}
              <div className="md:hidden">
                {FLOATING_LOGOS.map((logo, i) => (
                  <FloatingLogo key={`m-${i}`} logo={logo} isDesktop={false} />
                ))}
              </div>

              {/* Floating "Live AI" pill */}
              <div
                className="absolute top-[8%] left-[55%] z-30 flex items-center gap-2 rounded-full bg-card border border-border shadow-md px-3 py-1.5 text-xs font-semibold"
                style={{
                  animation: "briefleeHeroChipFloat 6s ease-in-out 0.4s infinite alternate",
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Live AI analysis
              </div>

              {/* Floating "Hook score" chip */}
              <div
                className="absolute bottom-[8%] right-[58%] z-30 flex items-center gap-2 rounded-2xl bg-card border border-border shadow-lg px-4 py-2.5"
                style={{
                  animation: "briefleeHeroChipFloat 6s ease-in-out 1.0s infinite alternate-reverse",
                }}
              >
                <div className="text-2xl font-bold text-primary leading-none">94</div>
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Hook score
                  </div>
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
