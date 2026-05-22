// =====================================================================
// Vibe Coding block: Instagram Engagement Rate Calculator — Inputs + result
// =====================================================================
// Second block on /instagram-engagement-rate-calculator.
//
// Formula: (Likes + Comments + Saves + Shares) / Followers × 100
// (Saves and shares are first-class engagement signals on Instagram —
// they weigh heavier than likes in the algorithm.)
// =====================================================================

import { useState } from "react";
import { Calculator, Info, TrendingUp, Zap, Target } from "lucide-react";

const NAVY = "#001364";
const PERIWINKLE = "#879CF7";

// Instagram benchmarks run lower than TikTok. Sources: Hootsuite, Social
// Insider, Later, RivalIQ 2024-2025 reports.
function getTier(rate) {
  if (rate >= 6) return { name: "Excellent",     color: "#16a34a", description: "Top-tier engagement. Brands will compete to work with you." };
  if (rate >= 3) return { name: "Good",          color: "#2563eb", description: "Above average. Standard brand deals available." };
  if (rate >= 1) return { name: "Average",       color: "#d97706", description: "Industry average. Room to improve, especially on saves and shares." };
  return                  { name: "Below average", color: "#dc2626", description: "Focus on Reels and save-worthy content before pitching brands." };
}

function getBrandImpact(rate) {
  if (rate >= 6) return "Premium partnerships, exclusive ambassador programmes. Command 50-100% rate premiums for your tier.";
  if (rate >= 3) return "Solid brand deal flow, regular partnership opportunities. Competitive rates for your follower count.";
  if (rate >= 1) return "Brand interest is possible but you'll be competing on niche or audience quality, not rate alone.";
  return "Most brand managers will pass. Focus on engagement growth before pitching.";
}

const INPUTS_TABLE = [
  { name: "Total Followers",   desc: "Your current follower count on Instagram.",                                            example: "50,000", required: true },
  { name: "Average Likes",     desc: "Average likes per post across your last 10-20 posts.",                                  example: "2,000",  required: true },
  { name: "Average Comments",  desc: "Average comments per post. Comments are weighted heavily.",                             example: "120",    required: false },
  { name: "Average Saves",     desc: "Average saves per post. Saves are the strongest engagement signal on Instagram.",      example: "180",    required: false },
  { name: "Average Shares",    desc: "Average DM shares per post. Reach-extending behaviour, scored high.",                   example: "80",     required: false },
];

function Slider({ label, value, onChange, min, max, step, format }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold" style={{ color: NAVY }}>{label}</label>
        <div className="px-3 py-1.5 rounded-lg" style={{ background: "rgba(135,156,247,0.16)" }}>
          <span className="text-sm font-bold" style={{ color: NAVY }}>{format(value)}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bl-slider"
        style={{
          background: `linear-gradient(to right, ${PERIWINKLE} 0%, ${PERIWINKLE} ${pct}%, rgba(135,156,247,0.18) ${pct}%, rgba(135,156,247,0.18) 100%)`,
        }}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

export default function Block() {
  const [followers, setFollowers] = useState(50000);
  const [likes, setLikes]         = useState(2000);
  const [comments, setComments]   = useState(120);
  const [saves, setSaves]         = useState(180);
  const [shares, setShares]       = useState(80);

  const totalEngagements = likes + comments + saves + shares;
  const engagementRate = followers > 0 ? (totalEngagements / followers) * 100 : 0;
  const displayRate = engagementRate.toFixed(2);
  const tier = getTier(engagementRate);
  // IG spectrum: 0% to 10%+ (mid-range tighter than TikTok)
  const spectrumPct = Math.min((engagementRate / 10) * 100, 100);

  const fmt = (n) => n.toLocaleString("en-GB");

  return (
    <div id="instagram-calculator" className="relative w-full bg-muted/20 border-y border-border">
      <style>{`
        .bl-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 4px;
          outline: none;
          cursor: pointer;
        }
        .bl-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 3px solid ${NAVY};
          box-shadow: 0 2px 8px rgba(0,19,100,0.3);
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .bl-slider::-webkit-slider-thumb:hover { transform: scale(1.12); box-shadow: 0 2px 12px rgba(0,19,100,0.45); }
        .bl-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 3px solid ${NAVY};
          box-shadow: 0 2px 8px rgba(0,19,100,0.3);
          cursor: pointer;
        }
      `}</style>

      <div className="container py-12 md:py-16">
        <div className="content max-w-3xl mx-auto space-y-6">

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.25)]">
            <div className="px-6 md:px-8 py-5" style={{ background: NAVY }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(135,156,247,0.25)" }}>
                  <Calculator className="w-5 h-5" style={{ color: PERIWINKLE }} />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-white">Engagement Rate Calculator</h2>
                  <p className="text-xs md:text-sm" style={{ color: PERIWINKLE }}>Drop your Instagram numbers in for an instant rate</p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-7">
              <Slider label="Total followers"         value={followers} onChange={setFollowers} min={1000} max={2000000} step={1000} format={fmt} />
              <Slider label="Average likes per post"  value={likes}     onChange={setLikes}     min={0}    max={100000}   step={100}  format={fmt} />
              <Slider label="Average comments"        value={comments}  onChange={setComments}  min={0}    max={10000}    step={10}   format={fmt} />
              <Slider label="Average saves"           value={saves}     onChange={setSaves}     min={0}    max={20000}    step={10}   format={fmt} />
              <Slider label="Average shares"          value={shares}    onChange={setShares}    min={0}    max={10000}    step={10}   format={fmt} />

              <div className="h-px bg-border" />

              <div className="rounded-2xl p-8 text-center" style={{ background: NAVY }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: PERIWINKLE }}>Your engagement rate</p>
                <p className="text-5xl md:text-6xl font-bold text-white mb-3">{displayRate}%</p>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full" style={{ background: `${tier.color}25` }}>
                  <span className="text-sm font-bold" style={{ color: tier.color }}>{tier.name}</span>
                </div>
                <p className="text-sm mt-4 max-w-md mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>{tier.description}</p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-2xl p-5 text-center bg-card border border-border">
                  <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: "rgba(135,156,247,0.16)" }}>
                    <TrendingUp className="w-5 h-5" style={{ color: NAVY }} />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Total engagements</p>
                  <p className="text-2xl font-bold" style={{ color: NAVY }}>{fmt(totalEngagements)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Likes + comments + saves + shares</p>
                </div>

                <div className="rounded-2xl p-5 text-center bg-card border border-border">
                  <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: "rgba(135,156,247,0.16)" }}>
                    <Zap className="w-5 h-5" style={{ color: NAVY }} />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Engagement tier</p>
                  <p className="text-lg font-bold" style={{ color: tier.color }}>{tier.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{displayRate}% rate</p>
                </div>

                <div className="rounded-2xl p-5 text-center bg-card border border-border">
                  <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: "rgba(135,156,247,0.16)" }}>
                    <Target className="w-5 h-5" style={{ color: NAVY }} />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Brand deal impact</p>
                  <p className="text-sm font-medium leading-relaxed" style={{ color: NAVY }}>{getBrandImpact(engagementRate)}</p>
                </div>
              </div>

              {/* Spectrum (IG ranges) */}
              <div className="rounded-xl p-5" style={{ background: "rgba(135,156,247,0.10)" }}>
                <h3 className="font-bold text-sm mb-4" style={{ color: NAVY }}>Engagement rate spectrum</h3>
                <div className="relative">
                  <div className="flex mb-2 text-center text-xs font-semibold" style={{ color: NAVY }}>
                    <div className="flex-1">Below avg</div>
                    <div className="flex-1">Average</div>
                    <div className="flex-1">Good</div>
                    <div className="flex-1">Excellent</div>
                  </div>
                  <div className="relative h-4 rounded-full overflow-hidden flex">
                    <div className="h-full" style={{ width: "10%", background: "#dc2626" }} />
                    <div className="h-full" style={{ width: "20%", background: "#d97706" }} />
                    <div className="h-full" style={{ width: "30%", background: "#2563eb" }} />
                    <div className="h-full" style={{ width: "40%", background: "#16a34a" }} />
                  </div>
                  <div className="absolute" style={{ left: `${spectrumPct}%`, top: "24px", transform: "translateX(-50%)", transition: "left 0.3s ease" }}>
                    <div className="w-0 h-0 mx-auto" style={{ borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderBottom: `8px solid ${NAVY}` }} />
                    <div className="rounded-md px-2 py-1 text-center mt-0.5" style={{ background: NAVY }}>
                      <span className="text-xs font-bold text-white">{displayRate}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between mt-8 text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>1%</span>
                    <span>3%</span>
                    <span>6%</span>
                    <span>10%+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Inputs explained */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.25)]">
            <div className="px-6 md:px-8 py-5" style={{ background: NAVY }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(135,156,247,0.25)" }}>
                  <Info className="w-5 h-5" style={{ color: PERIWINKLE }} />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-white">Inputs explained</h2>
                  <p className="text-xs md:text-sm" style={{ color: PERIWINKLE }}>What each field means and how to find the number</p>
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="text-left py-3 px-4 font-bold text-sm" style={{ color: NAVY }}>Input</th>
                      <th className="text-left py-3 px-4 font-bold text-sm" style={{ color: NAVY }}>Description</th>
                      <th className="text-left py-3 px-4 font-bold text-sm" style={{ color: NAVY }}>Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INPUTS_TABLE.map((row) => (
                      <tr key={row.name} className="border-b border-border">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm" style={{ color: NAVY }}>{row.name}</span>
                            {row.required && <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider" style={{ background: "rgba(135,156,247,0.16)", color: NAVY }}>Required</span>}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">{row.desc}</td>
                        <td className="py-4 px-4 font-bold text-sm" style={{ color: NAVY }}>{row.example}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex items-start gap-3 rounded-xl p-4" style={{ background: "rgba(135,156,247,0.10)" }}>
                <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: NAVY }} />
                <p className="text-sm" style={{ color: NAVY }}>
                  For Instagram specifically, saves and shares are usually the difference between a "good" and "excellent" rate. Pull them from Insights, not from the feed.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
