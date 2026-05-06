// =====================================================================
// Vibe Coding block: Video Breakdown / How it works (3 steps)
// =====================================================================
// Drop into a Softr Vibe Coding block on /free-tool-video-breakdown.
// =====================================================================

import { LinkIcon, Cpu, FileText } from "lucide-react";

const BRIEFLEE_EYES =
  "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_sticker-blue-cartoon-eyes-looking-side-navy_2026-03.png";

const STEPS = [
  {
    number: "01",
    icon: LinkIcon,
    title: "Paste a URL or drop a file",
    body:
      "Any TikTok, Instagram Reel, YouTube Short, Facebook Reel, or your own video file. We support any short-form clip under 3 minutes.",
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
      "Hook, script, action, text overlay, all pulled out into a brief you can hand to a creator or shoot yourself. We send it to your inbox and load it into your dashboard.",
    img: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/dec02029-7fab-44f0-95c5-d2fb24be40fc.png",
    alt: "Brieflee converting a viral creator video into a structured creator brief",
  },
];

export default function Block() {
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
                      <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/[0.04] aspect-[4/3] grid place-items-center p-6">
                        <div className="flex flex-wrap gap-3 justify-center max-w-xs">
                          {[
                            "tiktok-logo-3d-transparent",
                            "instagram-logo-3d-transparent",
                            "youtube-shorts-logo-3d-transparent",
                            "facebook-logo-3d-transparent",
                            "upload-cloud-3d-transparent",
                          ].map((slug) => (
                            <img
                              key={slug}
                              src={`https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_${slug}_2026-05.png`}
                              alt=""
                              className="h-14 w-14 md:h-16 md:w-16 object-contain"
                              draggable={false}
                              loading="lazy"
                            />
                          ))}
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
