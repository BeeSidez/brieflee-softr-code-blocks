// =====================================================================
// Vibe Coding block: Instagram Engagement Rate Calculator — FAQ
// =====================================================================
// 9 questions covering what engagement rate measures, how it's calculated
// on Instagram specifically, benchmarks, and limitations of the calculator.
// =====================================================================

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const NAVY = "#001364";
const PERIWINKLE = "#879CF7";

const FAQS = [
  {
    q: "What does an influencer's engagement rate measure?",
    a: "Engagement rate is how often viewers actively interact with a creator's content (likes, comments, saves, shares) compared to how many follow them. On Instagram especially, saves and shares are the strongest signals because they predict whether the algorithm will keep pushing the content.",
  },
  {
    q: "How is the engagement rate calculated on Instagram?",
    a: "The formula is (Likes + Comments + Saves + Shares) divided by Total Followers, times 100. Saves and shares are weighted heavily in the Instagram algorithm — a high save rate often predicts higher organic reach.",
  },
  {
    q: "Why is engagement rate crucial for Instagram creators?",
    a: "Instagram's algorithm prioritizes content that drives saves, shares, and meaningful interactions. Higher engagement means better feed placement and Explore visibility. Brand deals on Instagram look at engagement rate to filter for audience quality. A small account with high engagement often beats a larger one with low engagement.",
  },
  {
    q: "What characterizes a high engagement rate on Instagram?",
    a: "6% or above is excellent for Instagram. 3-6% is good and competitive for brand deals. 1-3% is industry average. Anything below 1% suggests the audience is disengaged and most brand managers will pass.",
  },
  {
    q: "What's the average Instagram engagement rate?",
    a: "Industry average sits around 1-3% on Instagram. Photography and pets niches lead at 3-6%. Beauty, fitness, and food sit at 1-3%. News and finance trail at 0.5-2%.",
  },
  {
    q: "How do you calculate the engagement rate for Instagram?",
    a: "Add your average likes, comments, saves, and shares across your last 10-20 posts. Divide by your follower count. Multiply by 100. That's your engagement rate as a percentage.",
  },
  {
    q: "How does an Instagram engagement rate calculator work?",
    a: "You input your follower count plus average likes, comments, saves, and shares per post. The calculator divides total engagements by followers, multiplies by 100, and benchmarks the result against Instagram industry averages so you see which tier you sit in and what it means for brand deals.",
  },
  {
    q: "What factors can influence a post's engagement rate on Instagram?",
    a: "Whether the content is save-worthy (quotes, checklists, frameworks). Reels vs static (Reels often reach further). Carousel posts (multi-slide content drives more engagement). Caption that invites discussion. Reply speed in the first hour. Posting at peak audience hours.",
  },
  {
    q: "Are there limitations to using an Instagram engagement rate calculator?",
    a: "Yes. Instagram doesn't publicly expose reach numbers, so calculations against followers can understate the true engagement per impression. Reach-based engagement rate (engagements divided by reach) is more accurate when you can get it from Insights. Use this as a directional benchmark.",
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
