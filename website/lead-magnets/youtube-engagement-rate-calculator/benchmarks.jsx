// =====================================================================
// Vibe Coding block: YouTube Engagement Rate — Benchmarks (4-card grid)
// =====================================================================
// Same structure as TikTok + IG benchmarks blocks, with YouTube-specific
// engagement weighting, niche data, boost tactics, and brand-deal tiers.
// =====================================================================

import { Activity, Layers, Zap, Handshake } from "lucide-react";

const NAVY = "#001364";
const PERIWINKLE = "#879CF7";

const ENGAGEMENT_TYPES = [
  { type: "Watch time / retention", weight: "Critical", desc: "The single biggest YouTube signal. Retention is what gets you suggested-from and homepage placement." },
  { type: "Comments",               weight: "Highest",  desc: "Active discussion is the algorithm's authenticity signal. Reply to extend threads." },
  { type: "Shares",                 weight: "High",     desc: "Distribution-extending behaviour. Strong predictor that the video will spread." },
  { type: "Saves to playlist",      weight: "High",     desc: "Signals long-term value. Often pushes the video into 'related' recommendations." },
  { type: "Likes",                  weight: "Medium",   desc: "Low-effort positive signal. Counts, but moves less weight than the above." },
];

const NICHE_DATA = [
  { niche: "Gaming",                 range: "5-10%", barPct: 80 },
  { niche: "Vlogs / Lifestyle",      range: "4-8%",  barPct: 65 },
  { niche: "Education / Tutorials",  range: "4-7%",  barPct: 60 },
  { niche: "Tech reviews",           range: "3-6%",  barPct: 50 },
  { niche: "Beauty / Fashion",       range: "3-5%",  barPct: 40 },
  { niche: "Finance / Business",     range: "2-4%",  barPct: 30 },
  { niche: "News / Commentary",      range: "1-3%",  barPct: 20 },
];

const STRATEGIES = [
  "Earn the first 30 seconds. Retention drops more steeply here than anywhere else in the video.",
  "Optimise thumbnails for CTR. A higher click-through rate compounds with retention.",
  "Pin a comment that invites a specific response. Drives reply-thread depth.",
  "Build playlists. Saves into playlists send a long-term value signal.",
  "Use end screens and cards to push viewers to the next video.",
  "Title the video around a question viewers are already asking.",
  "Reply to the first 10-20 comments within an hour of publishing.",
  "Ask explicitly: \"comment X if Y\". Specific asks outperform generic CTAs.",
];

const BRAND_TIERS = [
  { rate: "8%+",      label: "Excellent", featured: true,  desc: "Premium integrations, dedicated sponsor segments, recurring deals. Command 50-100% rate premiums." },
  { rate: "4-8%",     label: "Good",      featured: true,  desc: "Standard sponsor deals. Strong inbound from brands targeting engaged audiences." },
  { rate: "2-4%",     label: "Average",   featured: false, desc: "Industry baseline. You'll be competing on niche specificity, not headline rate." },
  { rate: "Below 2%", label: "Below avg", featured: false, desc: "Most brand managers will pass. Focus on retention and comment-driving content before pitching." },
];

function CardWrap({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.15)]">
      <div className="px-6 py-5" style={{ background: NAVY }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(135,156,247,0.25)" }}>
            <Icon className="w-5 h-5" style={{ color: PERIWINKLE }} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{title}</h3>
            <p className="text-xs" style={{ color: PERIWINKLE }}>{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function Block() {
  return (
    <div className="relative w-full">
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
              Industry benchmarks
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]" style={{ color: NAVY }}>
              How to read your YouTube engagement rate
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mt-4 leading-relaxed max-w-2xl mx-auto">
              What counts as engagement on YouTube, where benchmarks sit by niche, what moves the number up, and what your rate signals to a brand evaluating a sponsorship.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">

            <CardWrap icon={Activity} title="What counts as engagement" subtitle="Signals and how YouTube weights them">
              <div className="space-y-3">
                {ENGAGEMENT_TYPES.map((item) => (
                  <div key={item.type} className="rounded-xl p-4 border border-border bg-card">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-full min-h-[40px] rounded-full shrink-0" style={{ background: PERIWINKLE }} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-sm" style={{ color: NAVY }}>{item.type}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider" style={{ background: "rgba(135,156,247,0.16)", color: NAVY }}>{item.weight}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardWrap>

            <CardWrap icon={Layers} title="Engagement by niche" subtitle="Average YouTube rates across content categories">
              <div className="space-y-3">
                {NICHE_DATA.map((item) => (
                  <div key={item.niche}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-semibold text-sm" style={{ color: NAVY }}>{item.niche}</span>
                      <span className="font-bold text-sm" style={{ color: NAVY }}>{item.range}</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: "rgba(135,156,247,0.16)" }}>
                      <div className="h-full rounded-full" style={{ width: `${item.barPct}%`, background: PERIWINKLE }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardWrap>

            <CardWrap icon={Zap} title="How to boost engagement" subtitle="Tactics that move the number up on YouTube">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STRATEGIES.map((tip, i) => (
                  <div key={tip} className="rounded-xl p-4 border border-border bg-card">
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: NAVY }}>
                        <span className="text-white text-xs font-bold">{i + 1}</span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: NAVY }}>{tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardWrap>

            <CardWrap icon={Handshake} title="Engagement and brand deals" subtitle="What your rate means when a brand evaluates you">
              <div className="space-y-3">
                {BRAND_TIERS.map((t) => (
                  <div key={t.rate} className="rounded-xl p-4 border border-border bg-card">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-full min-h-[40px] rounded-full shrink-0" style={{ background: PERIWINKLE }} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="font-bold text-sm" style={{ color: NAVY }}>
                            {t.rate} <span className="font-normal text-muted-foreground">· {t.label}</span>
                          </h4>
                          {t.featured && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider" style={{ background: "rgba(135,156,247,0.16)", color: NAVY }}>Sweet spot</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl p-4 flex items-start gap-3" style={{ background: "rgba(135,156,247,0.10)" }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: NAVY }}>
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <p className="text-xs" style={{ color: NAVY }}>
                  On YouTube, a smaller channel with high engagement and high retention often closes bigger sponsor deals than a larger channel with low retention. Subscribers is a vanity metric. Engagement and watch time are the real ones.
                </p>
              </div>
            </CardWrap>

          </div>
        </div>
      </div>
    </div>
  );
}
