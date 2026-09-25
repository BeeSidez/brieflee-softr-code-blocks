// SUPERSEDED by page.tsx. These three-block versions were replaced by the
// whole-page block on 7 Sep 2026 and their live blocks are being deleted.
// They still point at /book-a-demo. Do not push this file.
// Audience page feature grid. Replaces the native Softr feature-grid10 block.
// Identical on all 8 audience pages. Cards reveal their button on hover,
// the same behaviour the native block had.
// Image URLs are written out in full: useArraySetting's static analysis
// rejects computed values, so no shared prefix constant here.
import { useArraySetting, useTextSetting } from "@/lib/editable-settings";

const NAVY = "#001364";
const PERIWINKLE = "#879CF7";
const INK = "#152237";
const BG = "#FAFBFF";

export default function Block() {
  const heading = useTextSetting({
    name: "heading",
    label: "Section heading",
    initialValue: "Never Miss a Mistake",
  });
  const intro = useTextSetting({
    name: "intro",
    label: "Section intro",
    initialValue:
      "Automatically check every submission for product visibility, brand safety, copyright issues, and quality standards.",
  });
  const ctaLabel = useTextSetting({
    name: "ctaLabel",
    label: "Card button label",
    initialValue: "Book a demo",
  });
  const ctaHref = useTextSetting({
    name: "ctaHref",
    label: "Card button link",
    initialValue: "/book-a-demo",
  });

  const features = useArraySetting({
    name: "features",
    label: "Feature cards",
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
        image: {
          src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/5d89700f-5e53-41fb-9ee3-7f3e88d2be8c.png",
          alt: "Instant pass or fail checks",
        },
      },
      {
        title: "Multiple Quality Checks",
        description:
          "Scans for product visibility, brand compliance, copyright violations, and harmful content simultaneously.",
        image: {
          src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/b499fe5b-8ad7-4300-9f00-c2d0ee0a38fb.png",
          alt: "Multiple quality checks",
        },
      },
      {
        title: "Set Your Standards",
        description:
          "Define what passes: product visible 60% of video, hook within 3 seconds, no copyright logos.",
        image: {
          src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/d541304c-cdaf-4a31-8769-1a26b15f1d25.png",
          alt: "Set your standards",
        },
      },
      {
        title: "Choose Your Control",
        description:
          "Let AI handle everything, flag issues for your approval, or review with AI insights.",
        image: {
          src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/b37554f7-b1dc-4ddd-909b-99d80581e592.png",
          alt: "Choose your control",
        },
      },
      {
        title: "Brand Safety Checks",
        description:
          "AI flags potential issues like copyright risks or off-brand messaging before content goes live.",
        image: {
          src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/26355fb8-7c01-4048-880d-afda97fac843.png",
          alt: "Brand safety checks",
        },
      },
      {
        title: "Flag Issues Instantly",
        description:
          "Problems get flagged with timestamps so you only review what needs attention.",
        image: {
          src: "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/ece08166-92a4-4107-8d14-ebb418727302.png",
          alt: "Flag issues instantly",
        },
      },
    ],
  });

  return (
    <div className="container" style={{ background: BG }}>
      <div className="content py-14 md:py-16">
        <h2
          className="text-2xl font-bold text-center pb-2"
          style={{ color: NAVY }}
        >
          {heading}
        </h2>
        <p className="text-base text-center max-w-3xl mx-auto" style={{ color: INK }}>
          {intro}
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="group flex flex-col overflow-hidden bg-white"
              style={{ borderRadius: 8, boxShadow: "0 0 32px rgba(0,0,0,0.1)" }}
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
    </div>
  );
}
