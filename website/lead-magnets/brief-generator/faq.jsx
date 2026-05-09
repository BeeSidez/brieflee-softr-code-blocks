// =====================================================================
// Vibe Coding block: Brief Generator / FAQ
// =====================================================================
// Targets PAA queries:
//   - What is an AI brief generator / creator brief?
//   - Is it free? / Is it really free?
//   - How long is the brief?
//   - Can I edit the brief?
//   - Can I use my own brand voice?
//   - How is this different from ChatGPT?
//   - Who owns the brief?
//   - What's a good UGC brief template?
// =====================================================================

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const BRIEFLEE_EYES =
  "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_sticker-blue-cartoon-eyes-looking-side-navy_2026-03.png";

const FAQS = [
  {
    q: "What does the AI Brief Generator actually write?",
    a: "A complete short-form video brief: hook line, scene-by-scene structure, voiceover, on-screen text, CTA, and a caption. Each section is specific enough that a creator can pick it up and start filming. Written in your brand voice based on the inputs you give us, or reverse-engineered from a reference video if you paste one.",
  },
  {
    q: "Is it really free?",
    a: "Yes. Free to fill in the form, free to paste a URL, free to view your brief. You sign up with an email so we can save the brief to your dashboard, but no credit card.",
  },
  {
    q: "Can I edit the brief once it's generated?",
    a: "Yes. The brief lands in your Brieflee dashboard. Every section is editable. Tweak the hook, swap a scene, change the CTA, change the tone. The AI gives you a starting point that's 80% of the way there, you finish it.",
  },
  {
    q: "How is this different from just asking ChatGPT to write a brief?",
    a: "ChatGPT will give you a brief, but it's generic. Brieflee writes against the patterns we see in millions of high-performing TikToks, Reels and Shorts. The hook patterns are the ones that actually stop scrolls in 2026, not 2022. The scene structure follows what works for short-form, not abstract storytelling theory. And it integrates with the rest of the Brieflee platform, so the brief feeds directly into review and approval.",
  },
  {
    q: "Can I paste a competitor's video as a reference?",
    a: "Yes. Paste any public TikTok, Instagram Reel, YouTube Short or Facebook Reel URL. We'll reverse-engineer the hook, structure and CTA, then write a brief you can adapt to your own product. It's the fastest way to remix what's already working in your niche.",
  },
  {
    q: "What format is the brief in?",
    a: "Structured sections you can copy, share as a link, or export. The brief lives in your Brieflee dashboard and you can hand it to a creator with a single share link, or copy-paste sections into your own template if you have one.",
  },
  {
    q: "How long is the brief?",
    a: "Long enough to film from. Short enough to read in 2 minutes. Each section is condensed to the essential decisions a creator needs: what to say, what to film, in what order. No filler.",
  },
  {
    q: "Do I own the brief?",
    a: "Yes. Anything generated for you is yours to use, share, edit and remix. We don't use your inputs or the generated brief to train public AI models.",
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
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed pr-12">{a}</p>
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
              Things people ask before they generate.
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
