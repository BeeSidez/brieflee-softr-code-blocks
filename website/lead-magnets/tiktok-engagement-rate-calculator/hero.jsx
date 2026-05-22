// =====================================================================
// Vibe Coding block: TikTok Engagement Rate Calculator — Hero
// =====================================================================
// First block on /tiktok-engagement-rate-calculator. No email gate.
// Hero shape: fixed NAVY title + cycling PERIWINKLE typing line + sub
// + two cross-link buttons to the Instagram and YouTube calculators.
// =====================================================================

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const NAVY = "#001364";
const PERIWINKLE = "#879CF7";

const TIKTOK_LOGO    = "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_tiktok-logo-3d-transparent_2026-05.png";
const INSTAGRAM_LOGO = "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_instagram-logo-3d-transparent_2026-05.png";
const YOUTUBE_LOGO   = "https://res.cloudinary.com/dchroynzv/image/upload/v1779101297/brieflee_icon_youtube-logo-3d-transparent_2026-05.png";

// Floating 3D TikTok logos around the hero — own-platform only, varied
// sizes, pulled in close to the centered text. Hidden on mobile.
const FLOATING_LOGOS = [
  { src: TIKTOK_LOGO, alt: "TikTok", top: "14%",    right: "12%", size: 96, rotate: 12,  delay: 0,   reverse: false },
  { src: TIKTOK_LOGO, alt: "TikTok", top: "22%",    left: "10%",  size: 56, rotate: -10, delay: 0.5, reverse: true  },
  { src: TIKTOK_LOGO, alt: "TikTok", bottom: "20%", right: "14%", size: 72, rotate: -16, delay: 1.0, reverse: false },
  { src: TIKTOK_LOGO, alt: "TikTok", bottom: "16%", left: "13%",  size: 60, rotate: 18,  delay: 0.3, reverse: true  },
];

const TYPING_WORDS = ["Engagement Rate", "Average Followers", "Average Likes", "Average Comments", "Average Shares"];

function FloatingLogo({ logo }) {
  return (
    <div
      className="absolute z-0"
      style={{
        top: logo.top ?? "auto",
        bottom: logo.bottom ?? "auto",
        left: logo.left ?? "auto",
        right: logo.right ?? "auto",
        width: logo.size,
        height: logo.size,
        transform: `rotate(${logo.rotate}deg)`,
        animation: `briefleeHeroFloatY 7s ease-in-out ${logo.delay}s infinite ${logo.reverse ? "alternate-reverse" : "alternate"}`,
        filter: "drop-shadow(0 12px 24px rgba(99, 102, 241, 0.20))",
        pointerEvents: "none",
      }}
    >
      <img src={logo.src} alt={logo.alt} className="w-full h-full object-contain" draggable={false} />
    </div>
  );
}

function useTypingCycle(words, { typeMs = 70, deleteMs = 35, holdMs = 1400 } = {}) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [phase, setPhase] = useState("typing");

  useEffect(() => {
    const word = words[wordIndex] || "";
    let t;
    if (phase === "typing") {
      if (text.length < word.length) {
        t = setTimeout(() => setText(word.slice(0, text.length + 1)), typeMs);
      } else {
        t = setTimeout(() => setPhase("holding"), 0);
      }
    } else if (phase === "holding") {
      t = setTimeout(() => setPhase("deleting"), holdMs);
    } else if (phase === "deleting") {
      if (text.length > 0) {
        t = setTimeout(() => setText(word.slice(0, text.length - 1)), deleteMs);
      } else {
        setWordIndex((wordIndex + 1) % words.length);
        setPhase("typing");
      }
    }
    return () => clearTimeout(t);
  }, [text, wordIndex, phase, words, typeMs, deleteMs, holdMs]);

  return text;
}

export default function Block() {
  const typedWord = useTypingCycle(TYPING_WORDS);

  return (
    <div className="relative w-full overflow-hidden">
      <style>{`
        @keyframes briefleeHeroFloatY {
          0%   { transform: translateY(0) rotate(var(--rot, 0deg)); }
          100% { transform: translateY(-16px) rotate(var(--rot, 0deg)); }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/[0.03] to-primary/[0.07]" />
      </div>

      {/* Floating 3D TikTok logos — desktop only */}
      <div className="hidden md:block absolute inset-0 pointer-events-none">
        {FLOATING_LOGOS.map((logo, i) => (
          <FloatingLogo key={i} logo={logo} />
        ))}
      </div>

      <div className="container py-14 md:py-20 lg:py-24 relative">
        <div className="content max-w-3xl mx-auto text-center relative z-10">

          <div
            className="inline-flex items-center mb-6 mx-auto"
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
            TikTok Engagement Rate Calculator
          </div>

          <h1 className="font-bold tracking-tight leading-[1.05]">
            <span className="block text-3xl md:text-4xl lg:text-5xl" style={{ color: NAVY }}>
              Free TikTok Engagement Rate Calculator
            </span>
            <span
              className="block text-3xl md:text-4xl lg:text-5xl mt-1"
              style={{ color: PERIWINKLE }}
              aria-live="polite"
            >
              {typedWord}
              <span
                className="ml-0.5 inline-block w-[3px] h-[0.85em] align-[-0.05em] animate-pulse"
                style={{ background: PERIWINKLE }}
              />
            </span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground mt-5 leading-relaxed">
            Try our free calculator to determine influencer engagement rates on TikTok and find out how well influencers connect with their audience.
          </p>

          <div className="mt-10">
            <h3 className="text-base md:text-lg font-bold mb-4" style={{ color: NAVY }}>
              Check engagement rates for other platforms
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 max-w-xl mx-auto">
              <a
                href="/instagram-engagement-rate-calculator"
                className="group inline-flex items-center gap-3 px-4 h-14 rounded-xl text-left transition-opacity hover:opacity-90"
                style={{ background: NAVY, color: "#fff" }}
              >
                <img src={INSTAGRAM_LOGO} alt="" className="w-8 h-8 shrink-0 object-contain" draggable={false} />
                <span className="flex-1 text-sm font-semibold leading-tight">
                  Engagement rate calculator for Instagram
                </span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </a>
              <a
                href="/youtube-engagement-rate-calculator"
                className="group inline-flex items-center gap-3 px-4 h-14 rounded-xl text-left transition-opacity hover:opacity-90"
                style={{ background: NAVY, color: "#fff" }}
              >
                <img src={YOUTUBE_LOGO} alt="" className="w-8 h-8 shrink-0 object-contain" draggable={false} />
                <span className="flex-1 text-sm font-semibold leading-tight">
                  Engagement rate calculator for YouTube
                </span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </a>
            </div>
          </div>

          <a
            href="#tiktok-calculator"
            className="inline-flex items-center gap-2 mt-8 px-6 h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Calculate now
            <ChevronDown className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
