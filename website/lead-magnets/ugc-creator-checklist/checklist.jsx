// =====================================================================
// Vibe Coding block: UGC Creator Checklist (lead magnet)
// =====================================================================
// One-page tool at /ugc-creator-checklist.
//
// Flow:
//   1. User picks a format from a dropdown of 42 (with emoji + name)
//   2. Up to 3 example video thumbnails appear — click opens the video
//      detail modal via window.openSwModal
//   3. The checklist renders:
//        - Universal UGC creator standards (hardcoded sections)
//        - Format-specific QA section (from the Formats.QA Checklist field)
//   4. Each item is a clickable checkbox
//   5. Copy / Download .txt CTAs at the bottom
//
// SOFTR UI SETUP:
//   1. Create a Softr page at /ugc-creator-checklist
//   2. Source tab → Database: brieflee leads → Table: Formats
//   3. Visibility tab → public
// =====================================================================

import { useEffect, useMemo, useState } from "react";
import { useRecords, q } from "@/lib/datasource";
import { Check, ChevronDown, Copy, Download, Sparkles } from "lucide-react";

const formatFields = q.select({
  emoji:           "3e7hB",
  name:            "DTyOH",
  slug:            "ncAxJ",
  qaChecklist:     "xKAZw",   // SELECT multi — format-specific QA items
  videoFormats:    "HyVmY",   // LINKED_RECORD → VFL (gives us record IDs)
  logoUrls:        "yiiBp",   // LOOKUP array (parallel to videoFormats)
  videoUrls:       "dDhzl",   // LOOKUP array (parallel to videoFormats)
  brands:          "0Vmwy",   // LOOKUP array (parallel to videoFormats)
  videoSlugs:      "n9ZaK",   // LOOKUP array — SEO:Slug per linked video
});

const NAVY = "#001364";
const PERIWINKLE = "#879CF7";
const BRIEFLEE_EYES = "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_sticker-blue-cartoon-eyes-looking-side-navy_2026-03.png";

// Softr workflow webhook — receives lead-magnet submissions, writes to
// Google Sheet for backup, upserts contact in EmailIt.
const WORKFLOW_URL = "https://workflows-api.softr.io/v1/workflows/1e28685f-1a24-4042-80ac-cadfedef7336/executions/22b90d5d-a73b-43b5-ac1b-f24843b781bd";

// Personal / throwaway email domains — blocked across every Brieflee
// lead-magnet form to keep lead quality high.
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com",
  "yahoo.com", "yahoo.co.uk", "yahoo.fr", "yahoo.de", "ymail.com",
  "hotmail.com", "hotmail.co.uk", "hotmail.fr", "live.com", "live.co.uk",
  "msn.com", "outlook.com", "outlook.co.uk",
  "aol.com",
  "icloud.com", "me.com", "mac.com",
  "proton.me", "protonmail.com", "pm.me",
  "mail.com", "gmx.com", "gmx.de", "gmx.net",
  "yandex.com", "yandex.ru",
  "zoho.com", "hey.com",
  "fastmail.com", "fastmail.fm",
  "tutanota.com", "tutanota.de",
  "mailinator.com", "guerrillamail.com", "10minutemail.com",
  "tempmail.com", "trashmail.com", "throwawaymail.com", "yopmail.com",
]);

function isWorkEmail(value) {
  const v = (value || "").trim().toLowerCase();
  if (!v) return false;
  const at = v.lastIndexOf("@");
  if (at === -1) return false;
  return !FREE_EMAIL_DOMAINS.has(v.slice(at + 1));
}

// ---------------------------------------------------------------------
// The universal sections of the checklist — same for every format.
// Items are written so any creator filming for any brand can run through.
// ---------------------------------------------------------------------
const UNIVERSAL_SECTIONS = [
  {
    title: "Originality",
    items: [
      "Content is 100% original and not reused from previous collaborations.",
      "Scripts and visuals are not copied from other creators or brands.",
      "Content represents the creator's authentic voice and personality.",
    ],
  },
  {
    title: "Video & Visual Design",
    items: [
      "Filmed vertical 9:16 at 1080p resolution or higher.",
      "Bright, natural lighting — no dark or grainy scenes.",
      "Background is clean and brand-appropriate.",
    ],
  },
  {
    title: "Audio & Voice",
    items: [
      "Voice is clear, natural, and free of background noise.",
      "No echo, wind, or external distractions.",
      "If music is used, it's copyright-free and doesn't overpower the voice.",
    ],
  },
  {
    title: "Product & Brand Representation",
    items: [
      "Product and brand logo are shown clearly.",
      "Key benefits highlighted naturally — no exaggerated or misleading claims.",
      "No competitor brands or unrelated promotions in the same frame.",
    ],
  },
  {
    title: "Style & Authenticity",
    items: [
      "Tone, expressions, and energy match the brand's voice.",
      "Wardrobe is neutral or on-brand (no visible competitor logos).",
      "Content feels genuine, relatable, and visually appealing.",
    ],
  },
  {
    title: "Media & Assets",
    items: [
      "All visuals are sharp and high quality — no blur or pixelation.",
      "Files named clearly (e.g. BrandName_ProductName_CreatorName.mp4).",
      "Clean edits, no filters or watermarks unless agreed in the brief.",
    ],
  },
  {
    title: "Delivery & Submission",
    items: [
      "Delivered within the agreed deadline.",
      "Files submitted via the agreed channel (Google Drive, WeTransfer, etc.).",
      "Only final approved content qualifies for payment.",
    ],
  },
  {
    title: "Copyright & Licensing",
    items: [
      "Only royalty-free or licensed music and visuals used.",
      "Creator holds the rights to all footage and materials.",
      "Approved and paid work transfers usage rights to the brand.",
    ],
  },
];

const FINAL_SECTION = {
  title: "Final Review",
  items: [
    "All sections above reviewed and confirmed.",
    "Content follows the brand's standards.",
    "Ready to submit for approval.",
  ],
};

// Helper: extract labels from various Softr field shapes.
function labels(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.map((x) => x?.label || x).filter(Boolean);
  if (typeof v === "object") return [v.label].filter(Boolean);
  return [String(v)];
}

function downloadFile(filename, mime, content) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------
// Format picker — native <select>, bulletproof across all browsers
// ---------------------------------------------------------------------
function FormatPicker({ formats, selectedId, onSelect }) {
  return (
    <div className="relative w-full max-w-xl">
      <select
        value={selectedId || ""}
        onChange={(e) => onSelect(e.target.value || null)}
        className="w-full h-14 pl-4 pr-10 rounded-xl border-2 border-border bg-card text-foreground text-base font-semibold appearance-none focus:outline-none focus:border-primary cursor-pointer"
      >
        <option value="">Pick a format your creator is filming…</option>
        {formats.map((f) => (
          <option key={f.id} value={f.id}>
            {f.fields?.emoji ? `${f.fields.emoji}  ` : ""}{f.fields?.name || "Unnamed"}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
    </div>
  );
}

// ---------------------------------------------------------------------
// One checklist item with a clickable checkbox
// ---------------------------------------------------------------------
function ChecklistItem({ id, text, checked, onToggle }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full flex items-start gap-3 text-left py-2 group"
      >
        <span
          className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 transition-colors ${
            checked
              ? "bg-primary border-primary"
              : "bg-card border-border group-hover:border-primary/50"
          }`}
        >
          {checked && <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />}
        </span>
        <span className={`text-sm md:text-base leading-relaxed ${checked ? "text-muted-foreground line-through" : "text-foreground"}`}>
          {text}
        </span>
      </button>
    </li>
  );
}

// ---------------------------------------------------------------------
// Build the in-order list of sections (universal + format-specific + final)
// for the currently-selected format.
// ---------------------------------------------------------------------
function buildSections(formatRec) {
  const formatQA = labels(formatRec?.fields?.qaChecklist);
  const formatName = formatRec?.fields?.name || "";
  const sections = [...UNIVERSAL_SECTIONS];
  if (formatQA.length > 0) {
    sections.push({
      title: `${formatName} format checks`,
      items: formatQA,
    });
  }
  sections.push(FINAL_SECTION);
  return sections;
}

// =====================================================================
// MAIN BLOCK
// =====================================================================
export default function Block() {
  const { data, status } = useRecords({ select: formatFields, count: 100 });
  const formats = useMemo(
    () => (data?.pages?.flatMap((p) => p?.items ?? []) ?? [])
      .slice()
      .sort((a, b) => (a?.fields?.name || "").localeCompare(b?.fields?.name || "")),
    [data]
  );

  const [selectedId, setSelectedId] = useState(null);
  const [checkedItems, setCheckedItems] = useState(new Set());

  // Email-gate state
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [submitStatus, setSubmitStatus] = useState("idle"); // idle | submitting | sent | error
  const [submitError, setSubmitError] = useState("");
  const isUnlocked = submitStatus === "sent";

  const selectedRec = formats.find((f) => f.id === selectedId);
  const sections = useMemo(
    () => (selectedRec ? buildSections(selectedRec) : []),
    [selectedRec]
  );

  // Reset checked state when format changes.
  useEffect(() => {
    setCheckedItems(new Set());
  }, [selectedId]);

  function toggle(id) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const totalItems = sections.reduce((n, s) => n + s.items.length, 0);
  const checkedCount = checkedItems.size;

  function asPlainText() {
    const formatName = selectedRec?.fields?.name || "";
    const out = [`UGC Creator Content Checklist${formatName ? ` — ${formatName}` : ""}`, ""];
    sections.forEach((s) => {
      out.push(s.title.toUpperCase());
      s.items.forEach((item, i) => {
        const id = `${s.title}::${i}`;
        const mark = checkedItems.has(id) ? "[x]" : "[ ]";
        out.push(`  ${mark} ${item}`);
      });
      out.push("");
    });
    out.push("Made with Brieflee — brieflee.co");
    return out.join("\n");
  }

  function asMarkdown() {
    const formatName = selectedRec?.fields?.name || "";
    const out = [`# UGC Creator Content Checklist${formatName ? ` — ${formatName}` : ""}`, ""];
    sections.forEach((s) => {
      out.push(`## ${s.title}`);
      out.push("");
      s.items.forEach((item, i) => {
        const id = `${s.title}::${i}`;
        const mark = checkedItems.has(id) ? "x" : " ";
        out.push(`- [${mark}] ${item}`);
      });
      out.push("");
    });
    out.push("---");
    out.push("");
    out.push("Made with [Brieflee](https://brieflee.co)");
    return out.join("\n");
  }

  async function handleSubmit() {
    if (!selectedId || !email.trim() || !website.trim()) {
      setSubmitError("Pick a format and fill in both fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setSubmitError("Enter a valid work email.");
      return;
    }
    if (!isWorkEmail(email)) {
      setSubmitError("Use your company email instead. Personal @gmail.com, @yahoo.com, etc. aren't supported.");
      return;
    }
    setSubmitStatus("submitting");
    setSubmitError("");

    const payload = {
      email: email.trim(),
      website: website.trim(),
      source: "ugc-creator-checklist",
      format: selectedRec?.fields?.name || "",
      format_id: selectedId,
      page_url: typeof window !== "undefined" ? window.location.href : "",
      submitted_at: new Date().toISOString(),
    };

    try {
      const res = await fetch(WORKFLOW_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Workflow returned ${res.status}`);
      setSubmitStatus("sent");
    } catch (e) {
      // Don't block the user from seeing their checklist — log the failure
      // and unlock anyway. Email capture is best-effort.
      console.error("Lead capture failed:", e);
      setSubmitStatus("sent");
    }
  }

  const [copied, setCopied] = useState(false);
  function handleCopy() {
    if (!selectedRec) return;
    navigator.clipboard.writeText(asPlainText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (!selectedRec) return;
    const slug = (selectedRec.fields?.slug || "ugc").toLowerCase();
    downloadFile(`${slug}-ugc-creator-checklist.txt`, "text/plain;charset=utf-8", asPlainText());
  }

  function handleDownloadMarkdown() {
    if (!selectedRec) return;
    const slug = (selectedRec.fields?.slug || "ugc").toLowerCase();
    downloadFile(`${slug}-ugc-creator-checklist.md`, "text/markdown;charset=utf-8", asMarkdown());
  }

  // Example video tiles for the chosen format (up to 3).
  const exampleVideos = useMemo(() => {
    if (!selectedRec) return [];
    const links = selectedRec.fields?.videoFormats || [];
    const logos = selectedRec.fields?.logoUrls || [];
    const videoUrls = selectedRec.fields?.videoUrls || [];
    const brands = selectedRec.fields?.brands || [];
    const slugs = selectedRec.fields?.videoSlugs || [];
    const out = [];
    for (let i = 0; i < links.length && out.length < 3; i++) {
      out.push({
        id: links[i]?.id,
        brand: brands[i]?.label || brands[i] || "",
        logo: logos[i] || "",
        video: videoUrls[i] || "",
        slug: slugs[i] || "video",
      });
    }
    return out.filter((x) => x.id && x.video);
  }, [selectedRec]);

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/[0.03] to-primary/[0.07]" />
      </div>

      <div className="container py-12 md:py-16">
        <div className="content max-w-3xl mx-auto">

          {/* Hero */}
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
              Free UGC Creator Checklist
            </div>
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05] text-foreground"
              style={{ color: NAVY }}
            >
              UGC Creator Content Checklist
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mt-4 leading-relaxed max-w-2xl mx-auto">
              Pick the format your creator is filming and get a tickable checklist of everything they need to nail before delivery. Brand-agnostic, format-specific, free.
            </p>
            <style>{`
              @keyframes briefleeHeroChipFloat {
                0%   { transform: translateY(0); }
                100% { transform: translateY(-6px); }
              }
            `}</style>
            <div className="flex justify-center mt-8 md:mt-10">
              <div className="relative w-full max-w-xl">
                <img
                  src="https://res.cloudinary.com/dchroynzv/image/upload/v1779273196/brieflee_lead-magnet_ugc-content-checklist-receipt-icon_2026-05.png"
                  alt="UGC Creator Checklist receipt icon"
                  className="w-full rounded-3xl shadow-[0_20px_60px_-25px_rgba(0,19,100,0.30)]"
                  draggable={false}
                />
                {/* Floating chip — pulse pill */}
                <div
                  className="absolute top-[6%] left-[55%] z-30 flex items-center gap-2 rounded-full bg-card border border-border shadow-md px-3 py-1.5 text-xs font-semibold"
                  style={{ animation: "briefleeHeroChipFloat 6s ease-in-out 0.4s infinite alternate", color: NAVY }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  Format-specific
                </div>
                {/* Floating chip — number stat */}
                <div
                  className="absolute bottom-[6%] right-[55%] z-30 flex items-center gap-2 rounded-2xl bg-card border border-border shadow-lg px-4 py-2.5 text-left"
                  style={{ animation: "briefleeHeroChipFloat 6s ease-in-out 1.0s infinite alternate-reverse" }}
                >
                  <div className="text-2xl font-bold text-primary leading-none">30+</div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Formats</div>
                    <div className="text-xs text-foreground font-medium">Yapper to demo</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Format picker */}
          <div className="flex justify-center mb-10">
            {status === "loading" || status === "pending" ? (
              <div className="h-14 w-full max-w-xl rounded-xl bg-muted animate-pulse" />
            ) : (
              <FormatPicker
                formats={formats}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            )}
          </div>

          {/* When nothing picked yet — prompt to pick a format */}
          {!selectedRec && status !== "loading" && status !== "pending" && (
            <div className="text-center text-muted-foreground py-12 border-2 border-dashed border-border rounded-2xl">
              <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p>Pick a format above to get started.</p>
            </div>
          )}

          {/* Format picked, not yet unlocked — email gate */}
          {selectedRec && !isUnlocked && (
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-8 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl" aria-hidden="true">{selectedRec.fields?.emoji || ""}</span>
                <div>
                  <h2 className="text-base font-bold text-foreground" style={{ color: NAVY }}>
                    {selectedRec.fields?.name} Creator Content Checklist
                  </h2>
                  <p className="text-xs text-muted-foreground">Drop your email to unlock the checklist.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Work email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@brand.com"
                      className="w-full h-11 px-3 rounded-xl border-2 border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Brand website</label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="brand.com"
                      className="w-full h-11 px-3 rounded-xl border-2 border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {submitError && (
                  <p className="text-sm text-destructive">{submitError}</p>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitStatus === "submitting"}
                  className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {submitStatus === "submitting" ? "Unlocking…" : "Get my checklist"}
                </button>

                <p className="text-xs text-muted-foreground text-center">
                  Free. One-click unsubscribe from the follow-up emails.
                </p>
              </div>
            </div>
          )}

          {/* Unlocked — show the checklist */}
          {selectedRec && isUnlocked && (
            <>
              {/* Format header with example videos */}
              <div className="bg-card border border-border rounded-2xl p-6 md:p-7 mb-8">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-3xl" aria-hidden="true">{selectedRec.fields?.emoji || ""}</span>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground" style={{ color: NAVY }}>
                      {selectedRec.fields?.name}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {checkedCount} of {totalItems} checked
                    </p>
                  </div>
                </div>

                {exampleVideos.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Real examples
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {exampleVideos.map((v) => {
                        const videoHref = `/ugc-videos/${v.slug || "video"}/r/${v.id}`;
                        return (
                        <a
                          key={v.id}
                          href={videoHref}
                          onClick={(e) => {
                            if (typeof window !== "undefined" && typeof window.openSwModal === "function") {
                              e.preventDefault();
                              window.openSwModal(videoHref, "xl");
                            }
                          }}
                          className="group block rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-colors bg-muted"
                        >
                          <video
                            src={v.video}
                            muted
                            playsInline
                            preload="metadata"
                            className="w-full aspect-[9/16] object-cover pointer-events-none"
                          />
                          <div className="flex items-center gap-2 px-2.5 py-2">
                            {v.logo ? (
                              <img src={v.logo} alt="" className="w-5 h-5 rounded object-cover shrink-0" draggable={false} />
                            ) : (
                              <div className="w-5 h-5 rounded bg-muted shrink-0" />
                            )}
                            <span className="text-xs font-semibold text-foreground truncate">{v.brand || "Brand"}</span>
                          </div>
                        </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Centered title + description above the checklist */}
              <div className="text-center mb-6 mt-2">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground" style={{ color: NAVY }}>
                  {selectedRec.fields?.name} Creator Content Checklist
                </h2>
                <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-2xl mx-auto leading-relaxed">
                  These guidelines help maintain high quality, brand consistency, and a smoother approval process. Review each item below carefully and check them off when reviewing the creator's final UGC work.
                </p>
              </div>

              {/* Checklist sections */}
              <div className="bg-card border border-border rounded-2xl p-6 md:p-7 mb-6">
                {sections.map((section, sIdx) => (
                  <div key={section.title} className={sIdx > 0 ? "mt-6 pt-6 border-t border-border" : ""}>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      {section.title}
                    </h3>
                    <ul className="space-y-0.5">
                      {section.items.map((item, i) => {
                        const id = `${section.title}::${i}`;
                        return (
                          <ChecklistItem
                            key={id}
                            id={id}
                            text={item}
                            checked={checkedItems.has(id)}
                            onToggle={toggle}
                          />
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Action bar — sticky on scroll so it's reachable while ticking */}
              <div className="sticky bottom-4 bg-card border border-border rounded-2xl p-3 shadow-lg flex flex-wrap gap-2 items-center justify-between">
                <div className="text-sm font-semibold text-foreground px-2">
                  {checkedCount} / {totalItems} checked
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`inline-flex items-center gap-1.5 px-3.5 h-10 rounded-xl border text-sm font-semibold transition-colors ${
                      copied
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-card border-border text-foreground hover:border-primary/40"
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:border-primary/40 transition-colors"
                  >
                    <Download className="w-4 h-4" /> .txt
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadMarkdown}
                    className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Download className="w-4 h-4" /> .md
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ============ How it works ============ */}
      <div className="container py-14 md:py-20 border-t border-border">
        <div className="content max-w-6xl mx-auto">
          <h2 className="text-center text-3xl md:text-4xl font-bold tracking-tight leading-[1.1] mb-12" style={{ color: NAVY }}>
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {[
              { n: "1", title: "Pick a format", body: "Choose the format your creator is filming. 42 options, from ASMR to whiteboard explainer." },
              { n: "2", title: "Get the full checklist", body: "Universal UGC creator standards plus the QA items specific to that format. Each item is tickable as you review." },
              { n: "3", title: "Copy or download", body: "Send it straight to your creator or paste it into your project doc. Use it on every submission." },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4">
                  {s.n}
                </div>
                <h3 className="text-base font-bold text-foreground mb-2" style={{ color: NAVY }}>{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ What to check on every UGC video ============ */}
      <div className="container py-14 md:py-20 border-t border-border">
        <div className="content max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.1] mb-3" style={{ color: NAVY }}>
              What to check on every UGC video
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Every checklist item comes back to one of these eight principles. They're what actually decide whether a UGC video performs.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_sticker-blue-target-bullseye-arrow-hit-goal_2026-03.png", title: "Hook in 3 seconds", body: "The first 3 seconds decide whether viewers keep watching or scroll past.", example: "\"I tried this every night for 30 days and...\"" },
              { icon: "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_sticker-blue-cartoon-eyes-looking-side-navy_2026-03.png", title: "Product visibility", body: "The product needs enough screen time for viewers to associate the message with the brand.", example: "In frame, demonstrated in use, or shown in close-up." },
              { icon: "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_flat-hip-condenser-microphone-sticker-transparent_2026-05.png", title: "Audio clarity", body: "Voice clean. No wind, echo, or background noise. Music doesn't overpower dialogue.", example: "Mixed at -14 LUFS with music underneath the voice." },
              { icon: "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_sticker-red-stopwatch-timer-countdown_2026-03.png", title: "Visual pacing", body: "Scene changes every 2-3 seconds hold attention. Static shots lose viewers fast.", example: "Cut, b-roll insert, angle change, or on-screen text." },
              { icon: "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_sticker-watch-video-button-blue-hand-cursor-cta_2026-03.png", title: "CTA placement", body: "The call-to-action lives in the final 3-5 seconds, when intent is highest.", example: "\"Tap the link\" or \"Order yours below\" in the closing frame." },
              { icon: "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_approval-stamp-icon-transparent_2026-05.png", title: "Brand consistency", body: "Logo and brand name appear clearly. Tone matches the brand voice and audience.", example: "Brand mentioned at least twice, logo visible on the packaging." },
              { icon: "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_flat-new-follower-notification-bubble-periwinkle-social-count-1_2026-03.png", title: "Captions on mute", body: "Most viewers watch with sound off. Every spoken line needs on-screen text.", example: "Auto-captions cleaned up; key phrases bolded or highlighted." },
              { icon: "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_trendy-flat-heart-sticker-transparent_2026-05.png", title: "Authenticity", body: "Feels real and unstaged. Audiences detect over-rehearsed content immediately.", example: "Natural delivery, real setting, small imperfections kept in." },
            ].map((card) => (
              <div key={card.title} className="bg-card border border-border rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <div className="flex items-center gap-4 md:flex-1 md:min-w-0">
                  <img src={card.icon} alt="" className="w-12 h-12 shrink-0 object-contain" draggable={false} />
                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground text-base" style={{ color: NAVY }}>{card.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{card.body}</p>
                  </div>
                </div>
                <div className="md:w-72 md:shrink-0 md:border-l md:border-border md:pl-6 text-sm text-muted-foreground italic leading-relaxed">
                  {card.example}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ Final CTA — matches homepage final-cta design ============ */}
      <section
        className="relative w-full py-20 md:py-28 px-5 md:px-10 overflow-hidden"
        style={{
          background: "radial-gradient(ellipse 65% 50% at 50% 50%, rgba(135,156,247,0.28) 0%, rgba(180,192,245,0.14) 40%, rgba(180,192,245,0) 75%), #FAFBFF",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}
      >
        <style>{`
          .bl-cta-halo {
            position: absolute; left: 50%; top: 50%;
            width: min(90vw, 720px); height: min(70vw, 460px);
            transform: translate(-50%, -50%);
            background: radial-gradient(ellipse at center, rgba(135,156,247,0.30) 0%, rgba(135,156,247,0.12) 35%, rgba(135,156,247,0) 70%);
            pointer-events: none; filter: blur(8px);
          }
          .bl-cta-primary {
            display: inline-flex; align-items: center; gap: 10px;
            padding: 16px 28px; background: ${NAVY}; color: #fff;
            font-size: 16px; font-weight: 700; letter-spacing: -0.005em;
            border-radius: 12px; text-decoration: none;
            transition: transform 0.25s ease, box-shadow 0.25s ease;
            box-shadow: 0 12px 28px -10px rgba(0,19,100,0.35), 0 4px 10px -3px rgba(0,19,100,0.18), 0 0 0 1px rgba(255,255,255,0.12) inset;
          }
          .bl-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 18px 36px -12px rgba(0,19,100,0.45), 0 6px 14px -4px rgba(0,19,100,0.22), 0 0 0 1px rgba(255,255,255,0.18) inset; }
          .bl-cta-primary svg { transition: transform 0.25s ease; }
          .bl-cta-primary:hover svg { transform: translateX(3px); }
          .bl-cta-secondary {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 16px 26px; background: rgba(255,255,255,0.6); color: ${NAVY};
            font-size: 16px; font-weight: 700; letter-spacing: -0.005em;
            border-radius: 12px; text-decoration: none;
            -webkit-backdrop-filter: blur(12px) saturate(180%);
            backdrop-filter: blur(12px) saturate(180%);
            transition: transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
            box-shadow: 0 0 0 1px rgba(0,19,100,0.14) inset, 0 4px 12px -4px rgba(0,19,100,0.10);
          }
          .bl-cta-secondary:hover { transform: translateY(-2px); background: rgba(255,255,255,0.88); box-shadow: 0 0 0 1px rgba(0,19,100,0.22) inset, 0 8px 16px -6px rgba(0,19,100,0.15); }
          @media (max-width: 480px) {
            .bl-cta-primary, .bl-cta-secondary { width: 100%; justify-content: center; }
          }
        `}</style>

        <div className="bl-cta-halo" aria-hidden="true" />

        <div className="relative max-w-3xl mx-auto flex flex-col items-center text-center">
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "10px 18px", background: "rgba(135,156,247,0.16)",
              color: NAVY, fontSize: 14, fontWeight: 700,
              letterSpacing: "0.06em", textTransform: "uppercase",
              borderRadius: 999, width: "fit-content",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: PERIWINKLE, boxShadow: `0 0 0 3px ${PERIWINKLE}33` }} />
            Get started
          </div>

          <h2 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05] text-balance" style={{ color: NAVY }}>
            Want every video checked automatically?
          </h2>

          <p className="mt-5 text-base md:text-lg leading-relaxed max-w-xl mx-auto font-medium" style={{ color: NAVY, opacity: 0.7 }}>
            Brieflee runs this exact checklist on every UGC submission. Pass/fail with timestamps for what to fix, before you spend on paid.
          </p>

          <div className="mt-9 md:mt-10 flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <a href="/sign-up" className="bl-cta-primary">
              Start free trial
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
            <a href="/book-a-demo" className="bl-cta-secondary">Book a demo</a>
          </div>
        </div>
      </section>
    </div>
  );
}
