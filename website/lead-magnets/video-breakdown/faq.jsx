// =====================================================================
// Vibe Coding block: Video Breakdown / FAQ
// =====================================================================
// Drop into a Softr Vibe Coding block on /free-tool-video-breakdown.
//
// FAQ targets People-Also-Ask queries surfaced by NeuronWriter:
//   - What is video analysis AI / What is the YouTube video summarizer?
//   - Is the AI video analyzer free?
//   - Can it analyze YouTube videos?
//   - What can the AI detect?
//   - Is it safe to upload sensitive video?
//   - What AI can analyze videos? (vs ChatGPT)
//   - How do I analyze a video with AI?
//   - How accurate is the AI analysis?
// =====================================================================

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const BRIEFLEE_EYES =
  "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_sticker-blue-cartoon-eyes-looking-side-navy_2026-03.png";

const FAQS = [
  {
    q: "What is the Brieflee Video Breakdown tool?",
    a: "An AI tool that breaks down any short-form video frame by frame and tells you why it works. Paste a TikTok, Instagram Reel, YouTube Short, or Facebook Reel URL, or upload a file. In about 60 seconds you get a scored report covering hook timing, scene structure, audio, on-screen text, and CTA placement, plus a remix-ready brief you can use for your next video.",
  },
  {
    q: "Is it really free?",
    a: "Yes. Free to paste a URL, free to upload a file, free to view your breakdown. You sign up with an email so we can save the analysis to your dashboard, but no credit card.",
  },
  {
    q: "Can it analyse TikTok, Instagram Reels, and YouTube Shorts?",
    a: "Yes. Paste a public URL from TikTok, Instagram Reels, YouTube Shorts, Facebook Reels, X, or LinkedIn and the tool processes it directly. You can also upload your own MP4 or MOV file if the video is private or unpublished.",
  },
  {
    q: "What does the AI actually detect?",
    a: "Hook timing, scene transitions, on-screen text and captions, product visibility, creator face time, audio clarity and music sync, CTA placement, pacing, and engagement patterns. Each element is scored against the patterns from millions of high-performing short-form videos so you can see what landed and what didn't.",
  },
  {
    q: "Why not just ask ChatGPT to break down a video?",
    a: "Text-only models like ChatGPT can't process continuous video. They can read a transcript or look at a single frame, but they don't see scene transitions, audio sync, or on-screen text in motion. Brieflee runs computer vision frame by frame, picks up the audio, and reads the on-screen text in one pass.",
  },
  {
    q: "How accurate is it?",
    a: "Brieflee scores video against the same patterns top creative strategists use, trained on millions of high-performing TikToks, Reels, and Shorts. It won't predict virality with certainty, no tool can, but it will reliably tell you which hooks, scene patterns, and CTAs are statistically aligned with content that performs.",
  },
  {
    q: "Is it safe to upload a video that hasn't been published yet?",
    a: "Yes. Files are processed on encrypted infrastructure and aren't used to train public AI models. Attachment links expire automatically after one hour. If you want to delete the file from our system entirely, do it from your dashboard after the breakdown is generated.",
  },
  {
    q: "Is there a video length limit?",
    a: "The tool is built for short-form video, so the sweet spot is anything under 3 minutes. Longer videos still run, but the breakdown gets less precise as duration grows because short-form patterns stop applying.",
  },
];

function FaqItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 md:py-6 text-left group"
        aria-expanded={isOpen}
      >
        <h3 className="text-base md:text-lg font-semibold text-foreground leading-snug pr-4 group-hover:text-primary transition-colors">
          {q}
        </h3>
        <span
          className={`flex-shrink-0 h-8 w-8 rounded-full grid place-items-center transition-all ${
            isOpen
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
          }`}
        >
          {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100 pb-5 md:pb-6" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed pr-12">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Block() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="relative w-full">
      <div className="container py-16 md:py-20 lg:py-24">
        <div className="content max-w-3xl mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card pl-1.5 pr-3 py-1 text-xs font-medium text-muted-foreground mb-5">
              <img src={BRIEFLEE_EYES} alt="" className="h-5 w-5" draggable={false} />
              FAQs
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] text-foreground">
              Things people ask before they paste.
            </h2>
          </div>

          <div className="rounded-2xl border border-border bg-card px-5 md:px-8">
            {FAQS.map((faq, i) => (
              <FaqItem
                key={i}
                q={faq.q}
                a={faq.a}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
