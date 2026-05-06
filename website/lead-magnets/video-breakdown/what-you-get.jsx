// =====================================================================
// Vibe Coding block: Video Breakdown / What you get
// =====================================================================
// Drop into a Softr Vibe Coding block on /free-tool-video-breakdown,
// directly under the hero block.
//
// Pure visual block, no data layer.
// =====================================================================

import { Mic2, Target, Repeat, Eye, Activity, Sparkles as SparklesIcon } from "lucide-react";

const BRIEFLEE_EYES =
  "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_sticker-blue-cartoon-eyes-looking-side-navy_2026-03.png";

const FEATURE_CARDS = [
  {
    title: "Hook timing scored frame by frame",
    body:
      "Every visual, audio, and text element in the first 3 seconds, tagged against the patterns from millions of high-performing short-form videos. See exactly which hook hit and why.",
    img: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/5d89700f-5e53-41fb-9ee3-7f3e88d2be8c.png",
    alt: "Brieflee scoring multiple short-form videos with pass and fail flags into a chat report",
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

export default function Block() {
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
              Brieflee scores every part of the video against the patterns from millions
              of high-performing TikToks, Reels, and Shorts. You get a remix-ready brief,
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
