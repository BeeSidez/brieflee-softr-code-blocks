// =====================================================================
// Vibe Coding block: Brief Generator / What's in your brief
// =====================================================================
// Drop into a Softr Vibe Coding block on /free-tool-ai-brief-generator,
// directly under the hero block.
// =====================================================================

import { Mic2, Target, Sparkles as SparklesIcon, Camera, Video, MessageSquare } from "lucide-react";

const BRIEFLEE_EYES =
  "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_sticker-blue-cartoon-eyes-looking-side-navy_2026-03.png";

const FEATURE_CARDS = [
  {
    title: "Hook line + visual",
    body:
      "First 3 seconds, written for you. The opening line, the visual cue, the on-screen text, all aligned with the hook patterns that work for your audience and goal.",
    img: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/35bc2415-6e39-415d-80cb-75fc8d753839.png",
    alt: "Brieflee tracking creator movement and product handling on a video frame",
  },
  {
    title: "Scene-by-scene structure",
    body:
      "A timeline of every shot the creator should film, in order, with the action and the script for each. No vague \"show the product\" — specific enough to film from.",
    img: "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_feature-card_video-breakdown-analysis-three-frame-skincare-storyboard-mockup_2025-12.png",
    alt: "Three-frame storyboard breakdown of a creator video showing hook, story, and reveal",
  },
  {
    title: "CTA + caption",
    body:
      "The call-to-action wording, the placement, the caption, the hashtags. All written in your brand voice and the platform's native style, ready to paste.",
    img: "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_feature-card_video-remix-blueprint-two-clips-with-arrows-skincare-creator-side-by-side_2026-03.png",
    alt: "Video remix blueprint showing hook to brief flow with CTA",
  },
];

const SUPPORTING_BENEFITS = [
  {
    icon: Target,
    title: "Audience-fit messaging",
    body: "The brief speaks to your audience's actual language, not generic copy.",
  },
  {
    icon: Camera,
    title: "Specific shot list",
    body: "Each scene with the camera angle, the action, and the props the creator needs.",
  },
  {
    icon: MessageSquare,
    title: "Tone matched to your brand",
    body: "Set casual, professional, or punchy. The voice carries through every line.",
  },
  {
    icon: Mic2,
    title: "Voiceover + on-screen text",
    body: "Both written, both timed to the scene structure. Ready to record.",
  },
  {
    icon: Video,
    title: "Format options per platform",
    body: "9:16 for TikTok and Reels, 16:9 if you need a YouTube cut, all in one brief.",
  },
  {
    icon: SparklesIcon,
    title: "Adaptable, not rigid",
    body: "Use it as-is or tweak. Every section is designed to be a starting point, not a script lock-in.",
  },
];

export default function Block() {
  return (
    <div className="relative w-full">
      <div className="container py-16 md:py-20 lg:py-24">
        <div className="content max-w-6xl mx-auto">
          <div className="max-w-3xl mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card pl-1.5 pr-3 py-1 text-xs font-medium text-muted-foreground mb-5">
              <img src={BRIEFLEE_EYES} alt="" className="h-5 w-5" draggable={false} />
              What's in your brief
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] text-foreground">
              Not a vague vibe.
              <br />
              A brief you can actually film.
            </h2>
            <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
              Hook line, scene-by-scene structure, voiceover, on-screen text, CTA, caption.
              Every part of the brief is written so a creator can pick it up and start filming.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {FEATURE_CARDS.map((card, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-border bg-card overflow-hidden transition-all hover:shadow-[0_20px_60px_-25px_hsl(var(--primary)/0.4)] hover:-translate-y-1 hover:border-primary/30"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/[0.06] to-primary/[0.12] overflow-hidden">
                  <img src={card.img} alt={card.alt} className="w-full h-full object-cover" draggable={false} loading="lazy" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg md:text-xl font-bold text-foreground leading-tight">{card.title}</h3>
                  <p className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed">{card.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 md:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            {SUPPORTING_BENEFITS.map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={i} className="flex gap-3">
                  <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-primary/10 grid place-items-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground leading-tight">{b.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{b.body}</p>
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
