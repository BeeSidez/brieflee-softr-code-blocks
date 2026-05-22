// =====================================================================
// Vibe Coding block: Brief Generator / How it works (3 steps)
// =====================================================================

import { FileText, Cpu, ClipboardList } from "lucide-react";

const BRIEFLEE_EYES =
  "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_sticker-blue-cartoon-eyes-looking-side-navy_2026-03.png";

const FILM_REEL =
  "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_engraving_film-clapboard-reel-icon-storyboard-3d-engraved_2026-03.png";

const STEPS = [
  {
    number: "01",
    icon: FileText,
    title: "Tell us the basics, or paste a video",
    body:
      "Three short fields about your product, audience and goal. Or paste a TikTok / Reel / Short URL you want to remix. Either path takes 30 seconds.",
    img: null,
  },
  {
    number: "02",
    icon: Cpu,
    title: "AI writes the brief",
    body:
      "Hook line, scene-by-scene structure, voiceover, on-screen text and CTA, all written in your brand voice. Pulled from the patterns we see in millions of high-performing short-form videos.",
    img: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/6d59dce5-a4d4-4ea0-86d4-70e51946f576.png",
    alt: "Brieflee analysing a creator's video and producing a content score",
  },
  {
    number: "03",
    icon: ClipboardList,
    title: "Get your brief, ready to share",
    body:
      "The brief lands in your Brieflee dashboard and your inbox. Tweak it, share the link with your creator, or copy-paste it into your own template. Yours to use.",
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
              No template hunting. No staring at a blank page. No "make it sound more on-brand."
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

                  <div>
                    {step.img ? (
                      <div className="relative">
                        <div className="absolute inset-0 rounded-3xl bg-primary/15 blur-[60px] -z-10" aria-hidden="true" />
                        <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-[0_20px_60px_-25px_hsl(var(--primary)/0.45)]">
                          <img src={step.img} alt={step.alt} className="w-full h-auto block" draggable={false} loading="lazy" />
                        </div>
                      </div>
                    ) : (
                      // Step 1 visual: clipboard + film reel
                      <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/[0.04] aspect-[4/3] grid place-items-center p-6 overflow-hidden">
                        <div className="flex items-center justify-center gap-6 md:gap-10">
                          <div className="h-32 w-32 md:h-44 md:w-44 rounded-2xl bg-card border border-border shadow-lg grid place-items-center"
                            style={{ transform: "rotate(-6deg)" }}
                          >
                            <FileText className="h-16 w-16 md:h-24 md:w-24 text-primary" strokeWidth={1.5} />
                          </div>
                          <span className="text-3xl md:text-4xl font-bold text-primary/40 select-none">+</span>
                          <img
                            src={FILM_REEL}
                            alt="Reference video"
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
