// =====================================================================
// Vibe Coding block: YouTube Engagement Rate Calculator — FAQ
// =====================================================================
// Sits below the benchmarks block on /youtube-engagement-rate-calculator.
// 9 questions covering what engagement rate measures, how it's calculated
// on YouTube specifically, benchmarks, and limitations of the calculator.
//
// SOFTR UI SETUP:
//   1. Source tab → (none — pure content block)
//   2. Visibility tab → public
// =====================================================================

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const NAVY = "#001364";
const PERIWINKLE = "#879CF7";

const FAQS = [
  {
    q: "What does an influencer's engagement rate measure?",
    a: "Engagement rate is how often viewers actively interact with a creator's content (likes, comments, shares) compared to how many people see it. It's the single most important signal brands look at when evaluating a partnership. A high rate means the audience is paying attention, not just scrolling past.",
  },
  {
    q: "How is the engagement rate calculated on YouTube?",
    a: "On YouTube, engagement rate is measured against views, not subscribers. Subscribers is a vanity number on YouTube. Half don't watch any given video. The formula is (Likes + Comments + Shares) divided by Views, times 100.",
  },
  {
    q: "Why is engagement rate crucial for YouTube channels?",
    a: "The algorithm pushes content viewers actually engage with. Higher engagement means more 'Up next' and homepage placement, which means bigger reach. For sponsorships, brand managers look at engagement rate before subscriber count, especially for mid-tier creators.",
  },
  {
    q: "What characterizes a high engagement rate on YouTube?",
    a: "8% or above is excellent. 4-8% is good and competitive for brand deals. 2-4% is industry average. Anything under 2% suggests the audience isn't connecting and most brand managers will pass.",
  },
  {
    q: "What's the average YouTube engagement rate?",
    a: "Industry average sits around 2-4% on long-form content. Shorts can run higher (often 5-8%). Niche matters: gaming, vlogs, and tutorials lead. News and commentary trail.",
  },
  {
    q: "How do you calculate the engagement rate for YouTube?",
    a: "Add up your average likes, comments, and shares across your last 10-20 videos. Divide by your average views over the same window. Multiply by 100. That's your engagement rate as a percentage.",
  },
  {
    q: "How does a YouTube engagement rate calculator work?",
    a: "You input your average views, likes, comments, and shares per video. The calculator divides total engagements by views, multiplies by 100, and compares the result against industry benchmarks so you see which tier you sit in and what it means for brand deals.",
  },
  {
    q: "What factors can influence a video's engagement rate on YouTube?",
    a: "Retention curve (the biggest distribution lever on YouTube). Thumbnail click-through rate. Title resonance. Pinned comments that ask a specific question. Reply speed in the first hour after publishing. Playlist saves. Upload timing relative to your audience's active hours.",
  },
  {
    q: "Are there limitations to using a YouTube engagement rate calculator?",
    a: "Yes. The calculator measures performance against existing views. It doesn't account for retention or watch time, which YouTube weights heavily for distribution. A video can have 10% engagement but poor retention and still underperform. Treat it as one signal alongside watch time, CTR, and audience retention curves.",
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
