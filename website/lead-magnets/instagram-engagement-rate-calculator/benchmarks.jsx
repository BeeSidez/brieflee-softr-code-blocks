// =====================================================================
// Vibe Coding block: Instagram Engagement Rate — Benchmarks (4-card grid)
// =====================================================================
// Same 4-card structure as the TikTok benchmarks. IG-specific data
// throughout (lower rate ranges, save-first weighting, Reels-led tactics).
// =====================================================================

import { Activity, Layers, Zap, Handshake } from "lucide-react";

const NAVY = "#001364";
const PERIWINKLE = "#879CF7";

const ENGAGEMENT_TYPES = [
  { type: "Saves",       weight: "Highest", desc: "The strongest signal that content has long-term value. Algorithm pushes save-heavy posts." },
  { type: "Shares (DM)", weight: "Highest", desc: "Sharing to DMs is what extends reach outside your follower base." },
  { type: "Comments",    weight: "High",    desc: "Replies create thread depth and drive return visits." },
  { type: "Likes",       weight: "Medium",  desc: "The lowest-effort engagement. Counts, but moves less weight." },
  { type: "Reach",       weight: "Critical", desc: "On Instagram, the engagement rate by reach is closer to what brands actually evaluate." },
];

const NICHE_DATA = [
  { niche: "Pets / Animals",         range: "3-6%",   barPct: 80 },
  { niche: "Photography / Travel",   range: "2-5%",   barPct: 65 },
  { niche: "Health / Fitness",       range: "1.5-4%", barPct: 50 },
  { niche: "Beauty / Fashion",       range: "1-3%",   barPct: 45 },
  { niche: "Food",                   range: "1-3%",   barPct: 40 },
  { niche: "Finance / Business",     range: "0.8-2%", barPct: 25 },
  { niche: "News / Media",           range: "0.5-1.5%", barPct: 15 },
];

const STRATEGIES = [
  "Prioritise Reels. They get pushed to non-followers and lift average reach.",
  "Build carousels that earn the second swipe. Carousels still outperform single images on reach.",
  "Caption a question that requires an opinion, not a yes/no.",
  "Add value the viewer wants to save: quotes, checklists, frameworks.",
  "Use Stories with polls, sliders, and question stickers to feed the algorithm interaction data.",
  "Post when your audience is online (Insights > Active Times).",
  "Reply to every comment in the first hour to push the post back into Explore.",
  "DM new followers a thank-you to boost the relationship signal.",
];

const BRAND_TIERS = [
  { rate: "6%+",      label: "Excellent",   featured: true,  desc: "Premium partnerships, exclusive ambassador programmes. 50-100% rate premium over the median creator at your follower count." },
  { rate: "3-6%",     label: "Good",        featured: true,  desc: "Standard brand deals, regular partnership opportunities. Competitive rates for your tier." },
  { rate: "1-3%",     label: "Average",     featured: false, desc: "Industry average. Niche specificity or audience quality becomes the differentiator." },
  { rate: "Below 1%", label: "Below avg",   featured: false, desc: "Most brand managers will pass. Focus on Reels and save-worthy content before pitching." },
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
              How to read your Instagram engagement rate
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mt-4 leading-relaxed max-w-2xl mx-auto">
              What counts as engagement on Instagram, where benchmarks sit by niche, what moves the number up, and what your rate signals to a brand manager.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">

            <CardWrap icon={Activity} title="What counts as engagement" subtitle="Signals and how they're weighted on Instagram">
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

            <CardWrap icon={Layers} title="Engagement by niche" subtitle="Average Instagram rates across content categories">
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

            <CardWrap icon={Zap} title="How to boost engagement" subtitle="Tactics that move the number up on Instagram">
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
                  A smaller Instagram creator with high engagement consistently outperforms a larger one with low engagement in brand-deal negotiations. The number on this page matters more than your follower count.
                </p>
              </div>
            </CardWrap>

          </div>
        </div>
      </div>
    </div>
  );
}
