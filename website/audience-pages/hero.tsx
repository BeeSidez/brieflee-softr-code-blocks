// SUPERSEDED by page.tsx. These three-block versions were replaced by the
// whole-page block on 7 Sep 2026 and their live blocks are being deleted.
// They still point at /book-a-demo. Do not push this file.
// Audience page hero. Replaces the native Softr hero8 block.
// Same code on all 8 audience pages; only the initialValues differ.
// Every string sits behind an editable setting, so copy changes need no push.
import { useEffect, useRef, useState } from "react";
import { useTextSetting, useVideoSetting } from "@/lib/editable-settings";

const NAVY = "#001364";
const PERIWINKLE = "#879CF7";
const TYPE_INK = "#212529";
const BG = "#FAFBFF";
const BTN_SHADOW =
  "0 2px 4px rgba(17,17,17,0.04), 0 8px 16px rgba(33,33,33,0.08)";

// Types a phrase out, holds, deletes it, moves to the next. Matches the
// native block's rotating headline.
function useTypewriter(phrases: string[]) {
  const [text, setText] = useState("");
  const idx = useRef(0);
  const pos = useRef(0);
  const deleting = useRef(false);

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
  }, [phrases.join("|")]);

  return text;
}

export default function Block() {
  const headline = useTextSetting({
    name: "headline",
    label: "Headline",
    initialValue: "E-commerce brands - post product videos that",
  });
  const phraseList = useTextSetting({
    name: "phrases",
    label: "Rotating phrases (comma separated)",
    initialValue: "drive sales, convert customers, perform well, get engagement, boost revenue",
  });
  const body = useTextSetting({
    name: "body",
    label: "Body copy",
    initialValue:
      "Check product videos and UGC content for quality and performance before posting or running ads. Know what'll drive sales in 60 seconds - so you spend ad budget on winning content, not underperformers.",
  });
  const ctaLabel = useTextSetting({
    name: "ctaLabel",
    label: "Button label",
    initialValue: "Book a demo",
  });
  const video = useVideoSetting({
    name: "heroVideo",
    label: "Hero video",
    initialValue: {
      src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/b13d25a7-320f-4397-8a53-0ec46b1d6a3b.mp4",
    },
  });
  const ctaHref = useTextSetting({
    name: "ctaHref",
    label: "Button link",
    initialValue: "/book-a-demo",
  });

  const phrases = phraseList
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const typed = useTypewriter(phrases);

  return (
    <div className="container" style={{ background: BG }}>
      <div className="content">
        <div className="flex flex-col md:flex-row items-center gap-10 py-14 md:py-20">
          <div className="w-full md:w-1/2">
            <h1
              className="font-semibold leading-tight text-[32px] md:text-[48px]"
              style={{ color: NAVY }}
            >
              {headline}
            </h1>
            <div
              className="font-semibold leading-tight text-[32px] md:text-[48px] min-h-[1.2em]"
              style={{ color: TYPE_INK }}
              aria-live="polite"
            >
              {typed}
              <span className="bl-hero-caret">|</span>
            </div>
            <p
              className="mt-6 text-base font-normal leading-6 max-w-[520px]"
              style={{ color: NAVY }}
            >
              {body}
            </p>
            <div className="mt-8">
              <a
                href={ctaHref}
                className="inline-flex items-center justify-center text-lg font-medium text-white no-underline transition-transform hover:-translate-y-0.5"
                style={{
                  background: PERIWINKLE,
                  borderRadius: 16,
                  padding: "12px 24px",
                  boxShadow: BTN_SHADOW,
                }}
              >
                {ctaLabel}
              </a>
            </div>
          </div>

          <div className="w-full md:w-1/2 flex justify-center">
            <video
              src={video.src}
              autoPlay
              loop
              muted
              playsInline
              className="w-[320px] h-[320px] md:w-[500px] md:h-[500px] rounded-full object-contain"
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blHeroCaret { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
        .bl-hero-caret { animation: blHeroCaret 1s step-end infinite; font-weight: 400; }
      `}</style>
    </div>
  );
}
