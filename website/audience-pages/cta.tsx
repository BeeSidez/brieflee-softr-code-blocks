// SUPERSEDED by page.tsx. These three-block versions were replaced by the
// whole-page block on 7 Sep 2026 and their live blocks are being deleted.
// They still point at /book-a-demo. Do not push this file.
// Audience page closing CTA. Replaces the native Softr cta6 block.
// Identical on all 8 audience pages.
import { useTextSetting } from "@/lib/editable-settings";

const BLUE = "#335AFF";
const DEEP = "#011A84";
const PERIWINKLE = "#879CF7";
const TINT = "#ECF0FF";
const BG = "#FAFBFF";
const BTN_SHADOW =
  "0 2px 4px rgba(17,17,17,0.04), 0 8px 16px rgba(33,33,33,0.08)";

export default function Block() {
  const eyebrow = useTextSetting({
    name: "eyebrow",
    label: "Eyebrow",
    initialValue: "Ready to Automate Your Content Reviews?",
  });
  const headline = useTextSetting({
    name: "headline",
    label: "Headline",
    initialValue:
      "Join brands using AI reviews to maintain perfect brand standards at scale",
  });
  const ctaLabel = useTextSetting({
    name: "ctaLabel",
    label: "Button label",
    initialValue: "Book a demo",
  });
  const ctaHref = useTextSetting({
    name: "ctaHref",
    label: "Button link",
    initialValue: "/book-a-demo",
  });

  return (
    <div className="container" style={{ background: BG }}>
      <div className="content py-10 md:py-14">
        <div
          className="text-center px-6 py-14 md:py-20"
          style={{ background: TINT, borderRadius: 16 }}
        >
          <h2 className="text-lg font-medium pb-4" style={{ color: BLUE }}>
            {eyebrow}
          </h2>
          <p
            className="text-2xl md:text-3xl font-medium pb-5 max-w-3xl mx-auto"
            style={{ color: DEEP }}
          >
            {headline}
          </p>
          <a
            href={ctaHref}
            className="inline-flex items-center justify-center text-lg font-medium text-white no-underline transition-transform hover:-translate-y-0.5"
            style={{
              background: PERIWINKLE,
              borderRadius: 16,
              padding: "12px 20px",
              boxShadow: BTN_SHADOW,
            }}
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
