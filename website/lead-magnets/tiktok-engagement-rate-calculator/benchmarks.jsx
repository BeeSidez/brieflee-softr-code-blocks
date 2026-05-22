// =====================================================================
// Vibe Coding block: TikTok Engagement Rate — Benchmarks (4-card grid)
// =====================================================================
// Third block on /tiktok-engagement-rate-calculator. Four educational
// cards: what counts as engagement, by niche, how to boost, and what
// engagement means for brand deals.
//
// SOFTR UI SETUP:
//   1. Source tab → (none — pure content block)
//   2. Visibility tab → public
// =====================================================================

import { Activity, Layers, Zap, Handshake } from "lucide-react";

const NAVY = "#001364";
const PERIWINKLE = "#879CF7";

const ENGAGEMENT_TYPES = [
  { type: "Watch time",  weight: "Critical", desc: "Completion rate is the single biggest signal TikTok uses to push content." },
  { type: "Comments",    weight: "Highest",  desc: "Most authentic engagement signal. Reply to drive thread depth." },
  { type: "Shares",      weight: "High",     desc: "Shows the content was recommendation-worthy outside the FYP." },
  { type: "Saves",       weight: "High",     desc: "Signals high-value, reference-worthy content." },
  { type: "Likes",       weight: "Medium",   desc: "Quick positive feedback. Easy to give, weighted less." },
];

const NICHE_DATA = [
  { niche: "Comedy / Entertainment", range: "7-12%", barPct: 85 },
  { niche: "Pets / Animals",         range: "6-10%", barPct: 70 },
  { niche: "Beauty / Fashion",       range: "5-8%",  barPct: 55 },
  { niche: "Fitness / Health",       range: "5-8%",  barPct: 55 },
  { niche: "Education / How-to",     range: "4-7%",  barPct: 45 },
  { niche: "Finance / Business",     range: "3-6%",  barPct: 35 },
  { niche: "News / Commentary",      range: "2-4%",  barPct: 20 },
];

const STRATEGIES = [
  "Hook viewers in the first 1-2 seconds with a visual or claim that stops the scroll.",
  "Ask a direct question in the caption or end frame to drive comments.",
  "Post during your audience's peak active hours (check TikTok Analytics > Followers).",
  "Reply to comments within the first hour to push the video back into the FYP.",
  "Design content that begs a duet or stitch (open loops, claims to react to).",
  "Use a clear CTA in the closing 1-2 seconds. Even a soft one like \"comment X\" works.",
  "Post consistently. The algorithm rewards predictability.",
  "Spend time engaging on other creators' content in your niche.",
];

const BRAND_TIERS = [
  { rate: "8%+",       label: "Excellent", featured: true,  desc: "Premium partnerships, exclusive campaigns, ambassador programmes. 50-100% rate premium over the median creator at your follower count." },
  { rate: "5-8%",      label: "Good",      featured: true,  desc: "Standard brand deals, regular partnership opportunities. Competitive rates for your tier." },
  { rate: "3-5%",      label: "Average",   featured: false, desc: "Brand interest is possible but the market is competitive. Niche specificity or audience quality become the differentiator." },
  { rate: "Below 3%",  label: "Below avg", featured: false, desc: "Most brand managers will pass on outreach. Focus on engagement growth before pitching." },
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
              How to read your TikTok engagement rate
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mt-4 leading-relaxed max-w-2xl mx-auto">
              What counts as engagement, where the benchmarks sit by niche, what moves the number up, and what your rate actually means when a brand evaluates you.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">

            <CardWrap icon={Activity} title="What counts as engagement" subtitle="Engagement types and their weight in the algorithm">
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

            <CardWrap icon={Layers} title="Engagement by niche" subtitle="Average rates across content categories">
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

            <CardWrap icon={Zap} title="How to boost engagement" subtitle="Tactics that move the number up">
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
                  A smaller creator with high engagement consistently outperforms larger creators with low engagement in brand-deal negotiations. The number on this page matters more than your follower count.
                </p>
              </div>
            </CardWrap>

          </div>
        </div>
      </div>
    </div>
  );
}
