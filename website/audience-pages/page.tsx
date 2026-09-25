// Audience page, whole page in one block.
// Replaces 15 native Softr blocks: hero8, 6 x cta2 section pills,
// feature-grid8, feature-grid10, feature7, 3 x quick-links, feature3, cta6.
// Header, footer and the CTA chips block stay as their own blocks.
//
// All 8 audience pages share this structure, so this file is the template.
// Everything a page needs to differ on is an editable setting.
import { ReactNode, useEffect, useRef, useState } from "react";
import {
  useArraySetting,
  useTextSetting,
  useVideoSetting,
  useImageSetting,
} from "@/lib/editable-settings";
import {
  Frown,
  Flame,
  ThumbsUp,
  Sparkles,
  TrendingUp,
  Navigation,
  CircleCheck,
} from "lucide-react";

const NAVY = "#001364";
const DEEP = "#011A84";
const BLUE = "#335AFF";
const PERIWINKLE = "#879CF7";
const INK = "#152237";
const MUTED = "#334283";
const TINT = "#ECF0FF";
const TINT_LINE = "#DBE2FF";
const TYPE_INK = "#212529";
const BG = "#FAFBFF";
const CARD_SHADOW = "0 0 32px rgba(0,0,0,0.1)";
const BTN_SHADOW =
  "0 2px 4px rgba(17,17,17,0.04), 0 8px 16px rgba(33,33,33,0.08)";

/* ── Section label pill ─────────────────────────────────────────── */
function Pill({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="content flex justify-center py-8">
      <span
        className="inline-flex items-center gap-2 text-xs"
        style={{
          background: TINT,
          border: "1px solid " + TINT_LINE,
          color: NAVY,
          borderRadius: 16,
          padding: "8px 20px",
        }}
      >
        {icon}
        {children}
      </span>
    </div>
  );
}

/* ── Hero typewriter ────────────────────────────────────────────── */
function useTypewriter(phrases: string[]) {
  const [text, setText] = useState("");
  const idx = useRef(0);
  const pos = useRef(0);
  const deleting = useRef(false);
  const key = phrases.join("|");

  useEffect(() => {
    if (!phrases.length) return;
    let timer: number;
    const tick = () => {
      const word = phrases[idx.current % phrases.length];
      if (deleting.current) {
        pos.current -= 1;
        setText(word.slice(0, pos.current));
        if (pos.current <= 0) {
          deleting.current = false;
          idx.current += 1;
          timer = window.setTimeout(tick, 320);
          return;
        }
        timer = window.setTimeout(tick, 34);
        return;
      }
      pos.current += 1;
      setText(word.slice(0, pos.current));
      if (pos.current >= word.length) {
        deleting.current = true;
        timer = window.setTimeout(tick, 1700);
        return;
      }
      timer = window.setTimeout(tick, 68);
    };
    timer = window.setTimeout(tick, 320);
    return () => window.clearTimeout(timer);
  }, [key]);

  return text;
}

export default function Block() {
  /* ── Hero ─────────────────────────────────────────────────────── */
  const heroHeadline = useTextSetting({
    name: "heroHeadline",
    label: "Hero headline",
    initialValue: "E-commerce brands - post product videos that",
  });
  const heroPhrases = useTextSetting({
    name: "heroPhrases",
    label: "Hero rotating phrases (comma separated)",
    initialValue:
      "drive sales, convert customers, perform well, get engagement, boost revenue",
  });
  const heroBody = useTextSetting({
    name: "heroBody",
    label: "Hero body copy",
    initialValue:
      "Check product videos and UGC content for quality and performance before posting or running ads. Know what'll drive sales in 60 seconds - so you spend ad budget on winning content, not underperformers.",
  });
  const ctaLabel = useTextSetting({
    name: "ctaLabel",
    label: "Button label (used on every CTA)",
    initialValue: "Book a demo",
  });
  const ctaHref = useTextSetting({
    name: "bookingHref",
    label: "Button link (used on every CTA)",
    initialValue: "/book-call",
  });
  // Softr overlays the booking form through its own runtime helper; a plain
  // anchor would navigate instead. The href stays as the fallback.
  const openBooking = (e) => {
    if (typeof window !== "undefined" && typeof window.openSwModal === "function") {
      e.preventDefault();
      window.openSwModal(ctaHref, "md");
    }
  };

  const heroVideo = useVideoSetting({
    name: "heroVideo",
    label: "Hero video",
    initialValue: {
      src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/b13d25a7-320f-4397-8a53-0ec46b1d6a3b.mp4",
    },
  });

  /* ── Section pill labels ──────────────────────────────────────── */
  const pillProblem = useTextSetting({ name: "pillProblem", label: "Pill: problem", initialValue: "The Problem" });
  const pillSolution = useTextSetting({ name: "pillSolution", label: "Pill: solution", initialValue: "The Solution" });
  const pillHow = useTextSetting({ name: "pillHow", label: "Pill: how it works", initialValue: "How It Works" });
  const pillBenefits = useTextSetting({ name: "pillBenefits", label: "Pill: benefits", initialValue: "Key Benefits" });
  const pillResults = useTextSetting({ name: "pillResults", label: "Pill: results", initialValue: "The Results" });
  const pillNext = useTextSetting({ name: "pillNext", label: "Pill: next steps", initialValue: "Next Steps" });

  /* ── Problem ──────────────────────────────────────────────────── */
  const problemHeading = useTextSetting({
    name: "problemHeading",
    label: "Problem heading",
    initialValue: "Manual Content Moderation is Drowning Your Team",
  });
  const problemIntro = useTextSetting({
    name: "problemIntro",
    label: "Problem intro",
    initialValue:
      "Reviewing content manually doesn't scale, it creates bottlenecks, inconsistent decisions, and lets brand risks slip through undetected.",
  });
  const problems = useArraySetting({
    name: "problems",
    label: "Problem cards",
    schema: {
      title: { type: "text", label: "Title", initialValue: "Problem" },
      description: { type: "text", label: "Description" },
      image: { type: "image", label: "Icon" },
    },
    initialValue: [
      {
        title: "Endless Revisions",
        description:
          "Creators submit content with obvious issues, forcing multiple rounds of feedback and delays.",
        image: { src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/d7bc7a2e-365a-41be-bf7f-b36157b85eb3.png", alt: "Endless revisions" },
      },
      {
        title: "Inconsistent Quality",
        description:
          "Different reviewers apply different standards, confusing creators and hurting content quality.",
        image: { src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/6a3b7023-b306-4592-80fc-70cfc14fd0a4.png", alt: "Inconsistent quality" },
      },
      {
        title: "Review Bottlenecks",
        description:
          "Content piles up waiting for approval while campaigns stall and deadlines get missed.",
        image: { src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/a6a0b280-12a4-44cf-9797-8b1254ca60a0.png", alt: "Review bottlenecks" },
      },
      {
        title: "Compliance Risks",
        description:
          "Off-brand or unsafe content goes live because reviews are rushed or incomplete.",
        image: { src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/603cd25d-1ba1-4e73-b884-9a2fb4f3eb05.png", alt: "Compliance risks" },
      },
    ],
  });

  /* ── Solution grid ────────────────────────────────────────────── */
  const solutionHeading = useTextSetting({
    name: "solutionHeading",
    label: "Solution heading",
    initialValue: "Never Miss a Mistake",
  });
  const solutionIntro = useTextSetting({
    name: "solutionIntro",
    label: "Solution intro",
    initialValue:
      "Automatically check every submission for product visibility, brand safety, copyright issues, and quality standards.",
  });
  const solutions = useArraySetting({
    name: "solutions",
    label: "Solution cards",
    schema: {
      title: { type: "text", label: "Title", initialValue: "Feature" },
      description: { type: "text", label: "Description" },
      image: { type: "image", label: "Image" },
    },
    initialValue: [
      {
        title: "Instant Pass/Fail Checks",
        description:
          "AI reviews submissions and gives clear approve, revise, or reject decisions with specific reasons.",
        image: { src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/5d89700f-5e53-41fb-9ee3-7f3e88d2be8c.png", alt: "Instant pass or fail checks" },
      },
      {
        title: "Multiple Quality Checks",
        description:
          "Scans for product visibility, brand compliance, copyright violations, and harmful content simultaneously.",
        image: { src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/b499fe5b-8ad7-4300-9f00-c2d0ee0a38fb.png", alt: "Multiple quality checks" },
      },
      {
        title: "Set Your Standards",
        description:
          "Define what passes: product visible 60% of video, hook within 3 seconds, no copyright logos.",
        image: { src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/d541304c-cdaf-4a31-8769-1a26b15f1d25.png", alt: "Set your standards" },
      },
      {
        title: "Choose Your Control",
        description:
          "Let AI handle everything, flag issues for your approval, or review with AI insights.",
        image: { src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/b37554f7-b1dc-4ddd-909b-99d80581e592.png", alt: "Choose your control" },
      },
      {
        title: "Brand Safety Checks",
        description:
          "AI flags potential issues like copyright risks or off-brand messaging before content goes live.",
        image: { src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/26355fb8-7c01-4048-880d-afda97fac843.png", alt: "Brand safety checks" },
      },
      {
        title: "Flag Issues Instantly",
        description:
          "Problems get flagged with timestamps so you only review what needs attention.",
        image: { src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/ece08166-92a4-4107-8d14-ebb418727302.png", alt: "Flag issues instantly" },
      },
    ],
  });

  /* ── How it works, tabbed ─────────────────────────────────────── */
  const stepsHeading = useTextSetting({
    name: "stepsHeading",
    label: "Steps heading",
    initialValue: "From submission to approval in minutes",
  });
  const stepsIntro = useTextSetting({
    name: "stepsIntro",
    label: "Steps intro",
    initialValue:
      "Advanced AI analyzes content like your best creative director, checking brand alignment, messaging, and quality standards",
  });
  const steps = useArraySetting({
    name: "steps",
    label: "Steps",
    schema: {
      title: { type: "text", label: "Tab title", initialValue: "Step" },
      description: { type: "text", label: "Description" },
      image: { type: "image", label: "Image" },
    },
    initialValue: [
      {
        title: "Step 1 | Creator Submits Content",
        description: "Creators upload videos directly through your campaign brief",
        image: { src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/55fe73bf-6590-4db3-93af-f3cc7b5baa9a.gif", alt: "Creator submits content" },
      },
      {
        title: "Step 2 | AI Reviews Everything",
        description:
          "Computer vision analyzes visuals, audio, messaging, and brand compliance automatically",
        image: { src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/30a2afd8-7a69-4b4f-80ad-ff0ef2d30fd5.gif", alt: "AI reviews everything" },
      },
      {
        title: "Step 3 | Instant Feedback Delivered",
        description:
          "Creators receive detailed feedback with specific improvement suggestions",
        image: { src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/51403500-3064-48a8-a76e-21c1b056e8ff.gif", alt: "Instant feedback delivered" },
      },
    ],
  });
  const [activeStep, setActiveStep] = useState(0);

  /* ── Benefits, quick links ────────────────────────────────────── */
  const benefitsHeading = useTextSetting({
    name: "benefitsHeading",
    label: "Benefits heading",
    initialValue: "AI-Powered Reviews for Safe, On-Brand Content",
  });
  const benefitsIntro = useTextSetting({
    name: "benefitsIntro",
    label: "Benefits intro",
    initialValue:
      "Ensure your UGC and EGC aligns with your vision without hours of manual review.",
  });
  const benefits = useArraySetting({
    name: "benefits",
    label: "Benefit links",
    schema: {
      title: { type: "text", label: "Title", initialValue: "Benefit" },
      description: { type: "text", label: "Description" },
      image: { type: "image", label: "Icon" },
    },
    initialValue: [
      {
        title: "Creator Notifications",
        description:
          "Automatically let creators know your decision, saving you time on back-and-forth.",
        image: { src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/0d363145-ddd3-4148-9b24-da3876a9f8bc.png", alt: "Creator notifications" },
      },
      {
        title: "Automated Pass/Fail Reviews",
        description: "Instant approve, flag for revision, or reject with specific feedback.",
        image: { src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/d6ddab6b-07a4-4b62-bcf7-4a23d36ee3b0.png", alt: "Automated pass or fail reviews" },
      },
      {
        title: "Submission Tracking",
        description:
          "Real-time dashboard shows what's pending review, approved, flagged, or rejected.",
        image: { src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/a3e3385d-dfb8-4461-bb53-236b721a3d9d.png", alt: "Submission tracking" },
      },
      {
        title: "Instant AI Analysis",
        description:
          "Get a clear report on how submitted content matches your brief and brand guidelines.",
        image: { src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/327ed84d-4de9-4525-ae45-7d5f74f73f92.png", alt: "Instant AI analysis" },
      },
      {
        title: "One-Click Decisions",
        description: "Approve, reject, or request revisions with a simple three-button system.",
        image: { src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/9a475168-a3ae-4103-8c59-b0158c580ad1.png", alt: "One click decisions" },
      },
      {
        title: "Brand Safety Checks",
        description:
          "AI flags potential issues like copyright risks or off-brand messaging before content goes live.",
        image: { src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/f4b20fee-5cf6-445d-a1ab-630a4bba37fb.png", alt: "Brand safety checks" },
      },
    ],
  });

  /* ── Results ──────────────────────────────────────────────────── */
  const resultsHeading = useTextSetting({
    name: "resultsHeading",
    label: "Results heading",
    initialValue: "Ready to stop posting content you're unsure about?",
  });
  const resultsIntro = useTextSetting({
    name: "resultsIntro",
    label: "Results intro",
    initialValue:
      "Join creators and brands using AI-powered quality checking to publish high-performing content at scale.",
  });
  const resultsImage = useImageSetting({
    name: "resultsImage",
    label: "Results image",
    initialValue: {
      src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/6e199bc8-7edc-47c3-be21-a7d815d8c565.gif",
      alt: "Brieflee reviewing a creator video",
    },
  });
  const results = useArraySetting({
    name: "results",
    label: "Result claims",
    schema: {
      title: { type: "text", label: "Claim", initialValue: "Result" },
    },
    initialValue: [
      { title: "90% faster review time with automated quality analysis" },
      { title: "95% reduction in revision cycles when issues are caught before publishing" },
      { title: "100% consistent quality standards across every video checked" },
      { title: "10x more content reviewed in the same amount of time" },
    ],
  });

  /* ── Closing CTA ──────────────────────────────────────────────── */
  const closingEyebrow = useTextSetting({
    name: "closingEyebrow",
    label: "Closing eyebrow",
    initialValue: "Ready to Automate Your Content Reviews?",
  });
  const closingHeadline = useTextSetting({
    name: "closingHeadline",
    label: "Closing headline",
    initialValue:
      "Join brands using AI reviews to maintain perfect brand standards at scale",
  });

  const phrases = heroPhrases.split(",").map((p) => p.trim()).filter(Boolean);
  const typed = useTypewriter(phrases);
  const step = steps[activeStep] || steps[0];

  return (
    <div className="container" style={{ background: BG }}>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="content">
        <div className="flex flex-col md:flex-row items-center gap-10 py-14 md:py-20">
          <div className="w-full md:w-1/2">
            <h1 className="font-semibold leading-tight text-[32px] md:text-[48px]" style={{ color: NAVY }}>
              {heroHeadline}
            </h1>
            <div
              className="font-semibold leading-tight text-[32px] md:text-[48px] min-h-[1.2em]"
              style={{ color: TYPE_INK }}
              aria-live="polite"
            >
              {typed}
              <span className="bl-caret">|</span>
            </div>
            <p className="mt-6 text-base font-normal leading-6 max-w-[520px]" style={{ color: NAVY }}>
              {heroBody}
            </p>
            <div className="mt-8">
              <a
                href={ctaHref}
                onClick={openBooking}
                className="inline-flex items-center justify-center text-lg font-medium text-white no-underline transition-transform hover:-translate-y-0.5"
                style={{ background: PERIWINKLE, borderRadius: 16, padding: "12px 24px", boxShadow: BTN_SHADOW }}
              >
                {ctaLabel}
              </a>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex justify-center">
            <video
              src={heroVideo.src}
              autoPlay
              loop
              muted
              playsInline
              className="w-[320px] h-[320px] md:w-[500px] md:h-[500px] rounded-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* ── The Problem ──────────────────────────────────────────── */}
      <Pill icon={<Frown className="w-4 h-4" />}>{pillProblem}</Pill>
      <div className="content pb-14">
        <h2 className="text-3xl font-medium text-center" style={{ color: NAVY }}>
          {problemHeading}
        </h2>
        <p className="mt-4 text-base font-medium text-center max-w-3xl mx-auto" style={{ color: INK }}>
          {problemIntro}
        </p>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {problems.map((p, i) => (
            <div key={i} className="bg-white p-6" style={{ borderRadius: 8, boxShadow: CARD_SHADOW }}>
              {p.image?.src && (
                <img src={p.image.src} alt={p.image.alt || ""} className="w-full h-40 object-contain" />
              )}
              <h3 className="mt-4 text-base font-medium" style={{ color: NAVY }}>
                {p.title}
              </h3>
              <p className="mt-2 text-base" style={{ color: INK }}>
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── The Solution ─────────────────────────────────────────── */}
      <Pill icon={<Flame className="w-4 h-4" />}>{pillSolution}</Pill>
      <div className="content pb-14">
        <h2 className="text-2xl font-bold text-center pb-2" style={{ color: NAVY }}>
          {solutionHeading}
        </h2>
        <p className="text-base text-center max-w-3xl mx-auto" style={{ color: INK }}>
          {solutionIntro}
        </p>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {solutions.map((f, i) => (
            <div
              key={i}
              className="group flex flex-col overflow-hidden bg-white"
              style={{ borderRadius: 8, boxShadow: CARD_SHADOW }}
            >
              <div
                className="relative h-64 bg-center bg-cover"
                style={{
                  backgroundImage: f.image?.src ? "url(" + f.image.src + ")" : undefined,
                  borderRadius: "8px 8px 0 0",
                }}
              >
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    borderRadius: "8px 8px 0 0",
                    transition: "opacity 0.4s ease-in-out",
                  }}
                >
                  <a
                    href={ctaHref}
                    onClick={openBooking}
                    className="inline-flex items-center justify-center text-base font-semibold text-white no-underline"
                    style={{ background: PERIWINKLE, borderRadius: 4, padding: "12px 24px" }}
                  >
                    {ctaLabel}
                  </a>
                </div>
              </div>
              <div className="px-6 pt-6 pb-8">
                <h3 className="text-sm font-semibold" style={{ color: INK }}>
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-[21px]" style={{ color: INK }}>
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ─────────────────────────────────────────── */}
      <Pill icon={<ThumbsUp className="w-4 h-4" />}>{pillHow}</Pill>
      <div className="content pb-14">
        <h2 className="text-3xl font-medium text-center" style={{ color: NAVY }}>
          {stepsHeading}
        </h2>
        <p className="mt-4 text-lg text-center max-w-3xl mx-auto" style={{ color: DEEP }}>
          {stepsIntro}
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {steps.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveStep(i)}
              aria-pressed={i === activeStep}
              className="text-sm font-medium"
              style={{
                color: DEEP,
                background: i === activeStep ? TINT : "transparent",
                border: "1px solid " + (i === activeStep ? TINT_LINE : "transparent"),
                borderRadius: 16,
                padding: "8px 20px",
              }}
            >
              {s.title}
            </button>
          ))}
        </div>

        {step && (
          <div className="mt-8 flex flex-col items-center">
            <p className="text-base text-center max-w-2xl" style={{ color: DEEP }}>
              {step.description}
            </p>
            {step.image?.src && (
              <img
                src={step.image.src}
                alt={step.image.alt || ""}
                className="mt-6 w-full max-w-3xl object-contain"
                style={{ borderRadius: 16 }}
              />
            )}
          </div>
        )}
      </div>

      {/* ── Key benefits ─────────────────────────────────────────── */}
      <Pill icon={<Sparkles className="w-4 h-4" />}>{pillBenefits}</Pill>
      <div className="content pb-14">
        <h2 className="text-2xl font-bold text-center" style={{ color: NAVY }}>
          {benefitsHeading}
        </h2>
        <p className="mt-2 text-sm text-center max-w-2xl mx-auto" style={{ color: MUTED }}>
          {benefitsIntro}
        </p>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-center gap-[10px]" style={{ borderRadius: 12 }}>
              {b.image?.src && (
                <img
                  src={b.image.src}
                  alt={b.image.alt || ""}
                  className="w-[66px] h-[66px] object-cover shrink-0"
                  style={{ borderRadius: 8 }}
                />
              )}
              <span className="flex flex-col gap-[2px]">
                <span className="text-[15px] font-bold" style={{ color: NAVY }}>
                  {b.title}
                </span>
                <span className="text-xs" style={{ color: MUTED }}>
                  {b.description}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── The results ──────────────────────────────────────────── */}
      <Pill icon={<TrendingUp className="w-4 h-4" />}>{pillResults}</Pill>
      <div className="content pb-14">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl font-medium" style={{ color: NAVY }}>
              {resultsHeading}
            </h2>
            <p className="mt-4 text-base" style={{ color: INK }}>
              {resultsIntro}
            </p>
            <ul className="mt-6 space-y-3 list-none p-0">
              {results.map((r, i) => (
                <li key={i} className="flex items-start gap-3 text-sm" style={{ color: INK }}>
                  <CircleCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: BLUE }} />
                  <span>{r.title}</span>
                </li>
              ))}
            </ul>
            <a
              href={ctaHref}
              onClick={openBooking}
              className="mt-7 inline-block text-lg font-semibold no-underline hover:underline"
              style={{ color: BLUE }}
            >
              {ctaLabel}
            </a>
          </div>
          <div className="w-full md:w-1/2 flex justify-center">
            {resultsImage.src && (
              <img
                src={resultsImage.src}
                alt={resultsImage.alt}
                className="w-full max-w-[463px] object-cover"
                style={{ borderRadius: 16 }}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Next steps ───────────────────────────────────────────── */}
      <Pill icon={<Navigation className="w-4 h-4" />}>{pillNext}</Pill>
      <div className="content pb-14">
        <div className="text-center px-6 py-14 md:py-20" style={{ background: TINT, borderRadius: 16 }}>
          <h2 className="text-lg font-medium pb-4" style={{ color: BLUE }}>
            {closingEyebrow}
          </h2>
          <p className="text-2xl md:text-3xl font-medium pb-5 max-w-3xl mx-auto" style={{ color: DEEP }}>
            {closingHeadline}
          </p>
          <a
            href={ctaHref}
            onClick={openBooking}
            className="inline-flex items-center justify-center text-lg font-medium text-white no-underline transition-transform hover:-translate-y-0.5"
            style={{ background: PERIWINKLE, borderRadius: 16, padding: "12px 20px", boxShadow: BTN_SHADOW }}
          >
            {ctaLabel}
          </a>
        </div>
      </div>

      <style>{`
        @keyframes blCaret { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
        .bl-caret { animation: blCaret 1s step-end infinite; font-weight: 400; }
      `}</style>
    </div>
  );
}
