// =====================================================================
// Vibe Coding block: Video Breakdown / Final CTA
// =====================================================================
// Drop into a Softr Vibe Coding block at the bottom of /free-tool-video-breakdown.
//
// The actual URL/upload flow lives in the hero block at the top of the
// page. This block is a visual prompt that scrolls the user back up.
// =====================================================================

import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const BRIEFLEE_EYES =
  "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_sticker-blue-cartoon-eyes-looking-side-navy_2026-03.png";

const LOGO_BASE = "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_";
const LOGOS = [
  "tiktok-logo-3d-transparent",
  "instagram-logo-3d-transparent",
  "youtube-shorts-logo-3d-transparent",
  "facebook-logo-3d-transparent",
  "upload-cloud-3d-transparent",
];

function scrollToTop(e) {
  e?.preventDefault?.();
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

export default function Block() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-background to-primary/[0.10]" />
        <div className="absolute top-[-20%] left-1/4 h-[420px] w-[420px] rounded-full bg-primary/25 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-1/4 h-[360px] w-[360px] rounded-full bg-primary/15 blur-[100px]" />
      </div>

      <div className="container py-20 md:py-24 lg:py-28">
        <div className="content max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card pl-1.5 pr-3 py-1 text-xs font-medium text-muted-foreground mb-6">
            <img src={BRIEFLEE_EYES} alt="" className="h-5 w-5" draggable={false} />
            Free, no credit card
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] text-foreground">
            Break down a video.
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
              Break down a video
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
