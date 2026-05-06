// =====================================================================
// Vibe Coding block: Video Breakdown / Who uses it (4 personas)
// =====================================================================
// Drop into a Softr Vibe Coding block on /free-tool-video-breakdown.
// =====================================================================

import { ShoppingBag, Building2, Briefcase, Camera } from "lucide-react";

const BRIEFLEE_EYES =
  "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_sticker-blue-cartoon-eyes-looking-side-navy_2026-03.png";

const PERSONAS = [
  {
    icon: ShoppingBag,
    title: "DTC + e-commerce marketers",
    body:
      "Reverse-engineer the TikToks and Reels that sell. Pull the hook, structure, and CTA into a brief your creators can shoot. Stop guessing why one ad hit and the next one didn't.",
  },
  {
    icon: Building2,
    title: "Agencies scaling creator volume",
    body:
      "Run 50+ submissions through the same lens. See which creators are nailing the brief, which ones are drifting, and where to coach. Replaces the strategist-watching-everything bottleneck.",
  },
  {
    icon: Briefcase,
    title: "B2B + founder-led brands",
    body:
      "Brief your founder once with what actually works on LinkedIn or YouTube. Reference frame-by-frame breakdowns of the top performers in your niche instead of vague \"make it more like Gary V.\"",
  },
  {
    icon: Camera,
    title: "Creators + UGC pros",
    body:
      "Check your hook before you hit post. Score your own Reels and Shorts against the patterns from millions of viral clips, fix what's flat, ship what works.",
  },
];

export default function Block() {
  return (
    <div className="relative w-full bg-gradient-to-b from-background via-primary/[0.03] to-background">
      <div className="container py-16 md:py-20 lg:py-24">
        <div className="content max-w-6xl mx-auto">
          <div className="max-w-3xl mb-12 md:mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card pl-1.5 pr-3 py-1 text-xs font-medium text-muted-foreground mb-5">
              <img src={BRIEFLEE_EYES} alt="" className="h-5 w-5" draggable={false} />
              Who uses it
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] text-foreground">
              Built for the people writing the briefs.
            </h2>
            <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
              Marketers, agencies, founder-led teams, creators. Anyone who needs to know
              why a video worked so they can do it again.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 md:gap-6">
            {PERSONAS.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={i}
                  className="group rounded-2xl border border-border bg-card p-6 md:p-8 transition-all hover:border-primary/30 hover:shadow-[0_20px_50px_-25px_hsl(var(--primary)/0.35)] hover:-translate-y-0.5"
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/10 grid place-items-center mb-5">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground leading-tight">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
                    {p.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
