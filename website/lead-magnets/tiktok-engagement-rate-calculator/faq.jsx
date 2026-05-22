// =====================================================================
// Vibe Coding block: TikTok Engagement Rate Calculator — FAQ
// =====================================================================
// 9 questions covering what engagement rate measures, how it's calculated
// on TikTok specifically, benchmarks, and limitations of the calculator.
// =====================================================================

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const NAVY = "#001364";
const PERIWINKLE = "#879CF7";

const FAQS = [
  {
    q: "What does an influencer's engagement rate measure?",
    a: "Engagement rate is how often viewers actively interact with a creator's content (likes, comments, shares) compared to how many follow them. It's the single most important signal brands look at when evaluating a partnership. A high rate means the audience is paying attention, not just scrolling past.",
  },
  {
    q: "How is the engagement rate calculated on TikTok?",
    a: "The formula is (Likes + Comments + Shares) divided by Total Followers, times 100. TikTok runs higher rates than other platforms because the For You Page pushes content to non-followers, which often inflates the ratio against follower count.",
  },
  {
    q: "Why is engagement rate crucial for TikTok creators?",
    a: "TikTok's For You Page rewards content that drives engagement quickly. Higher engagement means more pushed-to-recommend, which means bigger reach. Brand deals on TikTok look at engagement rate above almost everything else, including follower count.",
  },
  {
    q: "What characterizes a high engagement rate on TikTok?",
    a: "8% or above is excellent on TikTok. 5-8% is good and competitive for brand deals. 3-5% is industry average. Below 3% is below average for the platform.",
  },
  {
    q: "What's the average TikTok engagement rate?",
    a: "Industry average sits around 3-5% for TikTok creators. Comedy and pets niches lead at 7-12%. Beauty, fitness, and lifestyle sit at 5-8%. News and commentary trail at 2-4%.",
  },
  {
    q: "How do you calculate the engagement rate for TikTok?",
    a: "Average your likes, comments, and shares across your last 10-20 videos. Divide by your follower count. Multiply by 100. That's your engagement rate as a percentage.",
  },
  {
    q: "How does a TikTok engagement rate calculator work?",
    a: "You input your follower count, plus average likes, comments, and shares per video. The calculator divides total engagements by followers, multiplies by 100, and compares the result against industry benchmarks so you see which tier you sit in and what it means for brand deals.",
  },
  {
    q: "What factors can influence a video's engagement rate on TikTok?",
    a: "Hook timing in the first 1-2 seconds. Caption that invites comments. Sound choice (trending vs original). Reply speed in the first hour. Whether the video earns duets or stitches. Posting at peak audience times. Consistency week to week.",
  },
  {
    q: "Are there limitations to using a TikTok engagement rate calculator?",
    a: "Yes. TikTok content reaches non-followers via the FYP, which means the 'followers' denominator doesn't capture actual reach. A viral video can show high engagement against followers while only converting a small fraction of total viewers. Use it as a directional signal alongside views and watch time.",
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="font-bold text-base md:text-lg leading-snug" style={{ color: NAVY }}>{q}</span>
        <ChevronDown
          className={`w-5 h-5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 md:px-6 pb-5 md:pb-6 text-sm md:text-base text-muted-foreground leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

export default function Block() {
  return (
    <div className="relative w-full">
      <div className="container py-14 md:py-20">
        <div className="content max-w-3xl mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <div
              className="inline-flex items-center mb-5 mx-auto"
              style={{
                gap: 10,
                padding: "10px 18px",
                background: "rgba(135,156,247,0.16)",
                color: NAVY,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                borderRadius: 999,
                width: "fit-content",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: PERIWINKLE,
                  boxShadow: `0 0 0 3px ${PERIWINKLE}33`,
                }}
              />
              FAQ
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05]" style={{ color: NAVY }}>
              Let's get things cleared up
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
