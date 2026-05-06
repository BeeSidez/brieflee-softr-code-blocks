// =====================================================================
// Vibe Coding block: Video Breakdown / Frame-by-frame deep dive
// =====================================================================
// Drop into a Softr Vibe Coding block on /free-tool-video-breakdown.
// =====================================================================

import { Check } from "lucide-react";

const BRIEFLEE_EYES =
  "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_sticker-blue-cartoon-eyes-looking-side-navy_2026-03.png";

const DURING_IMG =
  "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/35bc2415-6e39-415d-80cb-75fc8d753839.png";
const AFTER_IMG =
  "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/b499fe5b-8ad7-4300-9f00-c2d0ee0a38fb.png";

const DETECTED = [
  "Object + product handling",
  "Creator face time",
  "Text overlay timing + safe zones",
  "Scene transitions",
  "Hook timing in the first 0.7 seconds",
  "Audio sync points",
  "Background distractions",
  "On-screen captions",
];

export default function Block() {
  return (
    <div className="relative w-full">
      <div className="container py-16 md:py-20 lg:py-24">
        <div className="content max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-center">
            {/* LEFT: copy */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card pl-1.5 pr-3 py-1 text-xs font-medium text-muted-foreground mb-5">
                <img src={BRIEFLEE_EYES} alt="" className="h-5 w-5" draggable={false} />
                Frame by frame
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] text-foreground">
                What "frame by frame" actually means.
              </h2>
              <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
                Computer vision walks every frame, AI reads the audio, and OCR picks up
                on-screen text. You get a timeline you can scrub through, with every
                element flagged and scored.
              </p>

              <ul className="mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-3">
                {DETECTED.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm md:text-base text-foreground">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* RIGHT: during + after composition */}
            <div className="relative">
              {/* Glow */}
              <div
                className="absolute inset-0 rounded-3xl bg-primary/20 blur-[80px] -z-10"
                aria-hidden="true"
              />

              <div className="relative grid grid-cols-2 gap-4 md:gap-6">
                {/* During analysis */}
                <div className="relative">
                  <div className="absolute -top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold text-muted-foreground shadow-sm">
                    During
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-lg">
                    <img
                      src={DURING_IMG}
                      alt="Brieflee tracking creator movement and product handling on a video frame"
                      className="w-full h-auto block"
                      draggable={false}
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* After / output */}
                <div className="relative mt-8 md:mt-12">
                  <div className="absolute -top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold shadow-sm">
                    Result
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-lg">
                    <img
                      src={AFTER_IMG}
                      alt="Brieflee output showing 70 percent product visibility, original content, and reviewed badges on a creator video"
                      className="w-full h-auto block"
                      draggable={false}
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
