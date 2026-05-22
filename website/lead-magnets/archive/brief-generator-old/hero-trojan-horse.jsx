// =====================================================================
// Vibe Coding block: Free Tool, AI Brief Generator (hero + Trojan horse)
// =====================================================================
// Drop into a Softr Vibe Coding block on /free-tool-ai-brief-generator.
//
// Form gives the user two ways to brief:
//   1. Paste a reference video URL (TikTok / Reel / Short / Facebook), OR
//   2. Fill in 3 short fields (product, audience, goal)
// Either or both works. After submit:
//   - Fake loading
//   - "Your brief is ready" email gate
//   - Writes to Tools with Page = "Brief Generator", Brief Inputs = formatted text
//   - Redirects to /sign-up?email=...&intent=brief-generator
//   - Post-signup workflow (separate task) reads the Tools row and creates a
//     real Brief in the main Brieflee app's Briefs table, then runs the AI
//     generation step.
//
// SOFTR UI SETUP (one-time):
//   1. Source tab → Database: brieflee leads → Table: Tools
//   2. Actions tab → enable "Add Record" (aliases auto-populate from q.select)
//   3. Visibility tab → public.
// =====================================================================

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRecordCreate, q } from "@/lib/datasource";
import { ArrowRight, Check, Link as LinkIcon, FileText, Loader2 } from "lucide-react";

// ----- Tools table field aliases -----
const createFields = q.select({
  email:       "65Dkd",
  platform:    "73gXm",
  page:        "o55YI",
  videoUrl:    "TYZsr",
  briefInputs: "aehP7",
});

const PLATFORM_BRIEFLEE = {
  id: "bb558681-9e58-46c2-a68f-11b335835d7f",
  label: "Brieflee",
};
const PAGE_BRIEF_GENERATOR = {
  id: "fde214df-0473-49be-be48-09f13430f8e6",
  label: "Brief Generator",
};

// ----- Hero asset (animated feature mockup, Softr-hosted) -----
const HERO_ASSET = {
  src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/dec02029-7fab-44f0-95c5-d2fb24be40fc.png",
  alt: "Brieflee converting a viral video into a structured creator brief",
};

// ----- Floating accents (3 doc-icons + 2 platform marks for visual interest) -----
const LOGO_BASE = "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_";
const FILM_REEL =
  "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_engraving_film-clapboard-reel-icon-storyboard-3d-engraved_2026-03.png";
const TIKTOK_LOGO = `${LOGO_BASE}tiktok-logo-3d-transparent_2026-05.png`;
const INSTAGRAM_LOGO = `${LOGO_BASE}instagram-logo-3d-transparent_2026-05.png`;
const FLOATING_LOGOS = [
  {
    src: FILM_REEL, alt: "Brief",
    desktop: { top: "-10%", right: "-8%",  size: 110, rotate: 12 },
    mobile:  { top: "-5%",  right: "-4%",  size: 64,  rotate: 12 },
    delay: 0,    reverse: false, flipX: false,
  },
  {
    src: TIKTOK_LOGO, alt: "TikTok",
    desktop: { top: "38%",  right: "-14%", size: 78,  rotate: 6 },
    mobile:  { top: "40%",  right: "-7%",  size: 46,  rotate: 6 },
    delay: 0.5,  reverse: true,  flipX: true,
  },
  {
    src: FILM_REEL, alt: "Brief",
    desktop: { bottom: "-4%", right: "0%",  size: 92,  rotate: -14 },
    mobile:  { bottom: "-2%", right: "0%",  size: 54,  rotate: -14 },
    delay: 1.0,  reverse: false, flipX: true,
  },
  {
    src: INSTAGRAM_LOGO, alt: "Instagram",
    desktop: { bottom: "12%", left: "-12%", size: 72,  rotate: -8 },
    mobile:  { bottom: "8%",  left: "-5%",  size: 42,  rotate: -8 },
    delay: 0.3,  reverse: true,  flipX: false,
  },
  {
    src: FILM_REEL, alt: "Brief",
    desktop: { top: "8%",   left: "-10%",  size: 88,  rotate: 18 },
    mobile:  { top: "4%",   left: "-5%",   size: 52,  rotate: 18 },
    delay: 0.8,  reverse: false, flipX: true,
  },
];

const BRIEFLEE_EYES =
  "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_sticker-blue-cartoon-eyes-looking-side-navy_2026-03.png";

const SIGNUP_URL = "https://www.brieflee.co/sign-up";
const LOGIN_URL = "https://www.brieflee.co/login";

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

// =====================================================================
// Block
// =====================================================================
export default function Block() {
  const [tab, setTab] = useState("form"); // "form" | "url"
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [url, setUrl] = useState("");
  const [step, setStep] = useState("hero"); // "hero" | "loading" | "email"
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const createRecord = useRecordCreate({ fields: createFields });

  const handleStart = () => {
    setError("");
    if (tab === "form") {
      if (!product.trim() || !audience.trim() || !goal.trim()) {
        setError("Fill in product, audience, and goal so the brief has enough to work with.");
        return;
      }
    }
    if (tab === "url") {
      if (!isValidShortFormUrl(url)) {
        setError("Paste a valid TikTok, Instagram Reel, YouTube Short, or Facebook Reel URL.");
        return;
      }
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
      setError("We can't queue your brief right now. Try again in a moment.");
      return;
    }

    setSubmitting(true);
    try {
      // Format the brief inputs as a clear text block the post-signup AI step can parse.
      const inputs = [
        tab === "form" && `Product: ${product.trim()}`,
        tab === "form" && `Audience: ${audience.trim()}`,
        tab === "form" && `Goal: ${goal.trim()}`,
        url.trim() && `Reference URL: ${url.trim()}`,
      ].filter(Boolean).join("\n");

      const fields = {
        email: email.trim(),
        platform: PLATFORM_BRIEFLEE,
        page: PAGE_BRIEF_GENERATOR,
        videoUrl: url.trim(),
        briefInputs: inputs,
      };

      await createRecord.mutateAsync(fields);

      toast.success("Your brief is on its way", {
        description: "Check your inbox in a moment.",
      });

      const target = `${SIGNUP_URL}?email=${encodeURIComponent(email.trim())}&intent=brief-generator`;
      window.location.href = target;
    } catch (e) {
      console.error("=== brief-generator create failed:", e);
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
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "32px 32px" }} />
      </div>

      <div className="container py-14 md:py-20 lg:py-24">
        <div className="content max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 backdrop-blur pl-1.5 pr-3 py-1 text-xs font-medium text-muted-foreground">
                <img src={BRIEFLEE_EYES} alt="" className="h-5 w-5" draggable={false} />
                Free AI brief generator
              </div>

              <div className="space-y-1">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-foreground">
                  Generate a creator brief
                  <br />
                  in 60 seconds.
                </h1>
                <div className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight leading-[1.2] text-primary">
                  Hook, script, scene, CTA, all written for you.
                </div>
              </div>

              <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
                Paste a reference video, or fill in three quick fields about your product.
                AI writes a remix-ready brief you can hand to a creator. Free, no credit card.
              </p>

              {step === "hero" && (
                <div className="space-y-4 pt-1">
                  <div className="inline-flex rounded-full border border-border bg-card/80 backdrop-blur p-1 shadow-sm">
                    <button
                      type="button"
                      onClick={() => { setTab("form"); setError(""); }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        tab === "form"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                      From scratch
                    </button>
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
                      Inspired by a video
                    </button>
                  </div>

                  {tab === "form" ? (
                    <div className="rounded-2xl border border-border bg-card p-5 md:p-6 space-y-4 shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.35)]">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Product
                        </label>
                        <Input
                          value={product}
                          onChange={(e) => setProduct(e.target.value)}
                          placeholder="e.g. Glow Serum, our new vitamin C drops"
                          className="h-12 text-base"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Audience
                        </label>
                        <Input
                          value={audience}
                          onChange={(e) => setAudience(e.target.value)}
                          placeholder="e.g. women 25-40 with sensitive skin"
                          className="h-12 text-base"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Goal of the video
                        </label>
                        <Input
                          value={goal}
                          onChange={(e) => setGoal(e.target.value)}
                          placeholder="e.g. drive sign-ups via TikTok hook + product demo"
                          className="h-12 text-base"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Reference video (optional)
                        </label>
                        <Input
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="https://www.tiktok.com/@..."
                          className="h-12 text-base"
                        />
                      </div>
                      <Button
                        onClick={handleStart}
                        className="h-14 w-full text-base font-semibold rounded-xl"
                      >
                        Generate my brief
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row gap-2 rounded-2xl border border-border bg-card p-2 shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.35)]">
                        <Input
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleStart(); }}
                          placeholder="https://www.tiktok.com/@creator/video/..."
                          className="flex-1 h-14 text-base border-0 shadow-none focus-visible:ring-0 bg-transparent"
                        />
                        <Button onClick={handleStart} className="h-14 px-7 text-base font-semibold rounded-xl">
                          Generate brief
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        We'll reverse-engineer the hook, structure, scenes and CTA, then write a brief you can adapt to your own product.
                      </p>
                    </div>
                  )}

                  {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground pt-1">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="inline-block w-2 h-2 rounded-full bg-primary"
                        style={{ animation: "briefleeHeroPulseDot 1.4s ease-in-out infinite" }}
                      />
                      Free, no credit card
                    </span>
                    <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> Under 60 seconds</span>
                    <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> Remix-ready</span>
                  </div>
                </div>
              )}

              {step === "loading" && (
                <div className="space-y-4 pt-2 max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <p className="text-base font-semibold text-foreground">Writing your brief</p>
                  </div>
                  <ul className="space-y-2.5 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Pulling the hook patterns that work for your audience</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Structuring the scene-by-scene flow</li>
                    <li className="flex items-center gap-2 opacity-70"><Loader2 className="h-4 w-4 animate-spin" />Drafting CTA and on-screen text</li>
                  </ul>
                </div>
              )}

              {step === "email" && (
                <div className="space-y-5 pt-2 max-w-md rounded-2xl border border-border bg-card p-6 shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.4)]">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 pl-1 pr-2.5 py-0.5 text-xs font-medium text-primary mb-3">
                      <img src={BRIEFLEE_EYES} alt="" className="h-4 w-4" draggable={false} />
                      Brief queued
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">Your brief is on the way</h2>
                    <p className="text-sm text-muted-foreground">
                      Drop your email. We'll write the brief and load it into your Brieflee dashboard.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !submitting) handleSubmitEmail(); }}
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
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving</>
                      ) : (
                        <>Send me my brief<ArrowRight className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  </div>
                  {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
                  <p className="text-xs text-muted-foreground">
                    Already have an account?{" "}
                    <a href={LOGIN_URL} className="underline font-medium text-foreground">Log in</a>
                  </p>
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

              <div
                className="absolute top-[8%] left-[55%] z-30 flex items-center gap-2 rounded-full bg-card border border-border shadow-md px-3 py-1.5 text-xs font-semibold"
                style={{ animation: "briefleeHeroChipFloat 6s ease-in-out 0.4s infinite alternate" }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Brief generated live
              </div>

              <div
                className="absolute bottom-[8%] right-[58%] z-30 flex items-center gap-2 rounded-2xl bg-card border border-border shadow-lg px-4 py-2.5"
                style={{ animation: "briefleeHeroChipFloat 6s ease-in-out 1.0s infinite alternate-reverse" }}
              >
                <div className="text-2xl font-bold text-primary leading-none">60s</div>
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Brief turnaround</div>
                  <div className="text-xs text-foreground font-medium">From scratch</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
