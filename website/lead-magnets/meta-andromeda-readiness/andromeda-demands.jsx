// =====================================================================
// Vibe Coding block: What Andromeda demands — operational benchmarks
// =====================================================================
// Sits below the quiz. Six cards covering the operational thresholds
// brands are hitting under Andromeda. Same card design as the
// "What makes a good UGC brief" section on the brief generator, with
// Brieflee Cloudinary icons (no emojis per the brand voice).
//
// SOFTR UI SETUP:
//   1. Source tab → (none — pure content block)
//   2. Visibility tab → public
// =====================================================================

const NAVY = "#001364";

const DEMANDS = [
  {
    icon: "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_trendy-flat-lightning-bolt-sticker-transparent_2026-05.png",
    title: "Creative volume",
    body: "The brands winning under Andromeda produce 30+ unique creatives a month. Variation is the targeting signal now. Fewer creatives, fewer matches.",
    benchmark: "30+ unique creatives / month",
  },
  {
    icon: "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_trendy-flat-paint-palette-sticker-transparent_2026-05.png",
    title: "Format spread",
    body: "Don't stay in one format. Rotate across yappers, demos, founder, reactions, testimonials, greenscreens. Meta matches different formats to different viewers.",
    benchmark: "4-6 different formats live at any time",
  },
  {
    icon: "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_sticker-blue-cartoon-eyes-looking-side-navy_2026-03.png",
    title: "Creator roster",
    body: "Different creators = different angles, energy, demographics. Andromeda picks. You can't predict who lands with which audience, so give Meta options.",
    benchmark: "6-10 creators in rotation",
  },
  {
    icon: "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_sticker-red-stopwatch-timer-countdown_2026-03.png",
    title: "Approval speed",
    body: "Brief to live in under a week. Slow approval cycles compound. Every extra day is a creative not being tested, a signal Andromeda doesn't get.",
    benchmark: "<1 week from brief to live",
  },
  {
    icon: "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_approval-stamp-icon-transparent_2026-05.png",
    title: "Acceptance rate",
    body: "If you're rejecting more than a quarter of submissions, your brief is the problem, not the creators. High rejection rates strangle output.",
    benchmark: "<25% submissions revised or rejected",
  },
  {
    icon: "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_sticker-watch-video-button-blue-hand-cursor-cta_2026-03.png",
    title: "Adset structure",
    body: "Targeting moved out of the adset and into the creative. Consolidate down. More creatives in fewer adsets lets Andromeda do its job, not the other way around.",
    benchmark: "1-3 adsets per campaign, not 10+",
  },
];

export default function Block() {
  return (
    <div className="relative w-full bg-muted/20 border-y border-border">
      <div className="container py-14 md:py-20">
        <div className="content max-w-6xl mx-auto">

          <div className="text-center mb-10 md:mb-14">
            <div
              className="inline-flex items-center mb-5"
              style={{
                gap: 10,
                padding: "8px 16px",
                background: "rgba(135,156,247,0.16)",
                color: NAVY,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                borderRadius: 999,
              }}
            >
              Operational benchmarks
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]" style={{ color: NAVY }}>
              What Andromeda demands
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mt-4 leading-relaxed max-w-2xl mx-auto">
              Six operational thresholds the brands winning under Andromeda are hitting. The quiz scores you against each.
            </p>
          </div>

          <div className="space-y-3">
            {DEMANDS.map((d) => (
              <div key={d.title} className="bg-card border border-border rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <div className="flex items-center gap-4 md:flex-1 md:min-w-0">
                  <img src={d.icon} alt="" className="w-12 h-12 shrink-0 object-contain" draggable={false} />
                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground text-base md:text-lg" style={{ color: NAVY }}>{d.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{d.body}</p>
                  </div>
                </div>
                <div
                  className="md:w-64 md:shrink-0 md:border-l md:border-border md:pl-6 text-sm font-semibold leading-relaxed"
                  style={{ color: NAVY }}
                >
                  {d.benchmark}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
