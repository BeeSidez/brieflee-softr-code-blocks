// =====================================================================
// Vibe Coding block: AI UGC Content Brief Generator (lead magnet)
// =====================================================================
// Drop into a Softr Vibe Coding block on /free-tool-ai-brief-generator.
//
// Flow (rebuilt 2026-05-14 using today's lead-magnet patterns):
//   0. Email gate    — Work email + Brand website unlocks the wizard.
//                      Submits to the shared lead-capture workflow
//                      (same one storyboard + checklist use).
//   1. Diagnose      — Filmer / Channel / Awareness (button rows).
//   (brand name / product / audience derived server-side from website_url)
//   3. Format + Angle — 42-format fanned-stack carousel + 5 angle cards
//                       filtered by awareness.
//   4. Generating    — the block scrapes with Firecrawl, writes the
//                       brief with DeepSeek through OpenRouter, then saves
//                       the row, the lead_event and the EmailIt join.
//   5. Result        — 10 collapsible sections (Goal, Brand, Audience,
//                       Message, Hook, Script, CTA, Thresholds,
//                       Storyboard, Standards) + sticky action bar
//                       (Copy / .md / .html / Generate another).
//
// SOFTR UI SETUP (one-time):
//   1. Source tab → Database: Lead Magnets → Table: Briefs
//   2. Actions tab → enable Add Record (aliases auto-populate from q.select)
//   3. Visibility tab → public
//
// Rebuilt 2026-05-14 from the parked 3-stage wizard. Prior version
// available via git history.
// =====================================================================

import { useState, useEffect, useRef } from "react";
import { datasource, useRecords, useRecordCreate, useProxyFetch, q } from "@/lib/datasource";
import {
  ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp,
  Copy, Download, FileText, Loader2, Sparkles,
} from "lucide-react";

// ---------------------------------------------------------------------
// Briefs table field aliases (Lead Magnets DB → table UjtyVJH875uVit)
// Moved out of the leads DB on 2026-08-10 when that database became the
// Brieflee CRM. Formats and Video travelled with it, because Softr cannot
// link records across databases. Old-to-new field ids are in
// Brieflee/backups/crm-migration-2026-08-10/map.json.
// ---------------------------------------------------------------------
// Fields the hero reads while polling for the workflow to create our row.
// In the new architecture the hero doesn't create the brief itself — the
// workflow does, after Sonar + Claude finish. Hero polls for a row whose
// client_uuid matches the UUID it generated at submit time.
//
// The `*Lookup` aliases are LOOKUP fields on briefs that follow the
// `selected_format_id` (7dA0W) relation to the Formats table and surface
// per-format thresholds + QA checklist + example videos.
// ---------------------------------------------------------------------
// The chat, which takes over the page once the email is in
// ---------------------------------------------------------------------
// It looks like a conversation and behaves like a wizard: every answer is
// a preset option, so the only spend is the one generation at the end.
const LEE_AVATAR_URL = "https://res.cloudinary.com/dspv9nm1n/image/upload/v1771427670/obl2odsrkhunneswor46.png";

const CHAT_CSS = `
.bgc{--peri:#879cf7;--navy2:#001364;--page:#FAFBFF;--l2:#eef4fd;--border:#eef4fd;--bd2:#d6defc;
  --body:#565d78;--muted:#838aa3;--quiet:#aeb4c8;--pass:#2daa63;--fail:#c8443c;
  font-family:'League Spartan',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  background:var(--page);color:var(--body);min-height:100vh;-webkit-font-smoothing:antialiased}
.bgc h1,.bgc h2,.bgc h3,.bgc h4{margin:0;color:var(--navy2);letter-spacing:-.02em}
.bgc p{margin:0}
.bgc-wrap{max-width:900px;margin:0 auto;padding:24px 20px 120px}
.bgc-top{position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:11px;padding:14px 4px;margin-bottom:6px;
  background:rgba(250,251,255,.92);backdrop-filter:blur(10px);border-bottom:1px solid var(--border)}
.bgc-top .av{position:relative;width:38px;height:38px;flex:0 0 38px}
.bgc-top .av img{width:38px;height:38px;border-radius:50%;display:block}
.bgc-top .av i{position:absolute;right:0;bottom:1px;width:10px;height:10px;border-radius:50%;background:#2daa63;border:2px solid #fff}
.bgc-top b{display:block;color:var(--navy2);font-size:16px;font-weight:800;line-height:1.1}
.bgc-top span{display:block;font-size:12.5px;color:var(--quiet)}
.bgc-pct{margin-left:auto;height:28px;padding:0 13px;border-radius:999px;background:#eef1ff;color:var(--navy2);
  font-size:12.5px;font-weight:800;display:inline-flex;align-items:center}
.bgc-brand{display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap}
.bgc-brand .logo{width:46px;height:46px;border-radius:12px;object-fit:contain;background:#fff;border:1px solid var(--border);padding:4px}
.bgc-brand .nm{font-size:15.5px;font-weight:800;color:var(--navy2);line-height:1.2}
.bgc-brand .dom{font-size:12.5px;color:var(--muted);margin-top:1px}
.bgc-read{margin-left:auto;display:inline-flex;align-items:center;gap:5px;height:26px;padding:0 11px;border-radius:999px;
  background:rgba(45,170,99,.12);color:#2daa63;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}
.bgc-pills{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px;width:100%}
.bgc-pill{background:#eef1ff;color:var(--navy2);font-size:12px;font-weight:700;padding:6px 11px;border-radius:999px}
.bgc-prodimg{float:right;width:112px;height:112px;object-fit:contain;background:#fff;margin:0 0 10px 14px;
  border:1px solid var(--border);border-radius:12px;padding:6px}
.bgc-row{display:flex;gap:12px;margin-bottom:15px;align-items:flex-start}
.bgc-row.me{justify-content:flex-end}
.bgc-av{width:34px;height:34px;border-radius:50%;flex:0 0 34px;margin-top:2px}
.bgc-b{background:#fff;border:1px solid var(--border);border-radius:16px;border-top-left-radius:5px;
  padding:14px 17px;font-size:14.5px;line-height:1.55;box-shadow:0 6px 18px -14px rgba(0,15,77,.3);max-width:640px}
.bgc-b.wide{max-width:100%;width:100%}
.bgc-b.mine{background:var(--peri);color:#fff;border:0;border-radius:16px;border-bottom-right-radius:5px;font-weight:600}
.bgc-opts{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.bgc-opt{height:36px;padding:0 15px;border-radius:999px;border:1px solid var(--bd2);background:#fff;
  color:var(--navy2);font-family:inherit;font-size:13.5px;font-weight:600;cursor:pointer}
.bgc-opt:hover{border-color:var(--peri)}
.bgc-opt.on{background:var(--peri);border-color:var(--peri);color:#fff}
.bgc-note{font-size:12.5px;color:var(--quiet);margin-top:10px;line-height:1.5}
.bgc-glbl{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:16px 0 2px}
.bgc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-top:10px}
.bgc-card{border:1px solid var(--bd2);border-radius:10px;background:#fff;cursor:pointer;padding:0;overflow:hidden;
  position:relative;transition:border-color .12s,box-shadow .12s}
.bgc-card:hover{border-color:var(--peri)}
.bgc-card.on{border-color:var(--peri);box-shadow:0 0 0 1px var(--peri)}
.bgc-card video{width:100%;height:92px;object-fit:cover;display:block;background:rgba(135,156,247,.08)}
.bgc-card .ph{height:92px;background:rgba(135,156,247,.08)}
.bgc-meta{padding:8px 10px 9px}
.bgc-nm{font-size:12.5px;font-weight:600;color:var(--navy2);line-height:1.2}
.bgc-ds{font-size:11px;font-weight:300;color:var(--muted);line-height:1.3;margin-top:2px;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bgc-badge{position:absolute;top:6px;left:6px;background:rgba(41,79,246,.92);color:#fff;font-size:8.5px;
  font-weight:800;letter-spacing:.05em;text-transform:uppercase;padding:2px 6px;border-radius:999px}
.bgc-badge.fit{background:var(--peri);color:#fff}
.bgc-tick{position:absolute;top:6px;right:6px;width:20px;height:20px;border-radius:50%;background:var(--peri);
  color:#fff;display:flex;align-items:center;justify-content:center}
.bgc-more{display:inline-flex;align-items:center;gap:7px;height:36px;padding:0 15px;margin-top:14px;border-radius:999px;
  border:1px solid var(--bd2);background:#fff;color:var(--navy2);font-family:inherit;font-size:13px;font-weight:700;cursor:pointer}
.bgc-more:hover{border-color:var(--peri)}
.bgc-flow{column-count:2;column-gap:22px}
@media(max-width:720px){.bgc-flow{column-count:1}}
.bgc-steps{display:flex;align-items:center;gap:7px;margin-left:auto}
.bgc-dot{width:7px;height:7px;border-radius:50%;background:var(--bd2)}
.bgc-dot.on{background:var(--peri)}
.bgc-dot.now{box-shadow:0 0 0 3px rgba(135,156,247,.25)}
.bgc-stepn{font-size:11.5px;font-weight:700;color:var(--quiet);letter-spacing:.02em}
.bgc-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 22px;border:0;
  border-radius:12px;background:var(--peri);color:#fff;font-family:inherit;font-size:14.5px;font-weight:700;
  cursor:pointer;box-shadow:0 8px 18px -8px rgba(135,156,247,.8)}
.bgc-btn[disabled]{opacity:.45;cursor:not-allowed;box-shadow:none}
.bgc-btn.ghost{background:#fff;color:var(--navy2);border:1px solid var(--bd2);box-shadow:none}
.bgc-err{color:var(--fail);font-size:13.5px;font-weight:600;margin-top:9px}
.bgc-bar{position:fixed;left:0;right:0;bottom:0;background:rgba(255,255,255,.93);backdrop-filter:blur(10px);
  border-top:1px solid var(--border);padding:12px 20px;z-index:40}
.bgc-barin{max-width:900px;margin:0 auto;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.bgc-barin .lbl{font-size:13px;color:var(--muted);margin-right:auto}
@media(max-width:720px){.bgc-barin .lbl{display:none}}
`;

function ChatLee({ children, wide }) {
  return (
    <div className="bgc-row">
      <img className="bgc-av" src={LEE_AVATAR_URL} alt="" />
      <div className={"bgc-b" + (wide ? " wide" : "")}>{children}</div>
    </div>
  );
}
function ChatMine({ children }) {
  return <div className="bgc-row me"><div className="bgc-b mine">{children}</div></div>;
}
function ChatOpts({ options, value, onPick }) {
  return (
    <div className="bgc-opts">
      {options.map((o) => {
        const label = o.label || o.name;
        return (
          <button key={label} className={"bgc-opt" + (value === label ? " on" : "")} onClick={() => onPick(o)}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

// Formats, led by the ones that suit whoever is filming, with the handful
// they genuinely could not film left out. A dial, not a rulebook.
const BRAND_MADE_FORMATS = ["Press", "Grid Swap", "Social Proof Mashup"];
const FORMAT_EXCLUDE = {
  "Influencer":  ["Founder", ...BRAND_MADE_FORMATS],
  "TikTok Shop Affiliate": ["Celebrity", "Influencer Endorsement", "Founder", "Expert Explainer",
                            "Cinematic B-Roll", ...BRAND_MADE_FORMATS],
  "UGC Creator": ["Celebrity", "Influencer Endorsement", "Founder", ...BRAND_MADE_FORMATS],
  "Founder":     ["Celebrity", "Influencer Endorsement", "Testimonial", "Street Interview", ...BRAND_MADE_FORMATS],
  "Customer":    ["Celebrity", "Influencer Endorsement", "Founder", "Behind The Scenes",
                  "Expert Explainer", "Cinematic B-Roll", ...BRAND_MADE_FORMATS],
  "Employee":    ["Celebrity", "Influencer Endorsement", "Founder", "Cinematic B-Roll", ...BRAND_MADE_FORMATS],
};
const FORMAT_SUITS = {
  "Influencer":  ["Yapper","Try-On","POV","Review","Unboxing","Stitch","Duet","Reaction Video","Trend","Testimonial"],
  "TikTok Shop Affiliate": ["Yapper","Demo","Try-On","Unboxing","Review","Before and After","Testimonial","Listicle","Trend","Stitch"],
  "UGC Creator": ["Yapper","Demo","Try-On","Before and After","Listicle","Testimonial","How To","Unboxing","POV","Skit"],
  "Founder":     ["Founder","Behind The Scenes","Expert Explainer","Educational","Yapper","Podcast","How To","Problem Agitation"],
  "Customer":    ["Testimonial","Before and After","Review","Unboxing","Try-On","Yapper","Transformation","POV"],
  "Employee":    ["Behind The Scenes","Yapper","Demo","How To","Educational","Expert Explainer","Humour","Skit","Street Interview"],
};

function ChatFormatPicker({ filmer, picked, onPick }) {
  const ex = new Set(FORMAT_EXCLUDE[filmer] || []);
  const suits = FORMAT_SUITS[filmer] || [];
  const avail = FORMATS.filter((f) => !ex.has(f.name));
  const fit = suits.map((n) => avail.find((f) => f.name === n)).filter(Boolean);
  const rest = avail.filter((f) => !suits.includes(f.name)).sort((a, b) => a.name.localeCompare(b.name));
  const who = String(filmer || "").toLowerCase();
  // The ten that suit them are the answer. The rest are there for anyone
  // who wants them, folded away so the question stays short.
  const [showRest, setShowRest] = useState(false);

  const Card = ({ f, suitsThem }) => {
    const on = picked?.name === f.name;
    const thumb = Array.isArray(f.thumbs) ? f.thumbs[0] : f.thumb;
    return (
      <div className={"bgc-card" + (on ? " on" : "")} onClick={() => onPick(f)}
        onMouseEnter={(e) => { const v = e.currentTarget.querySelector("video"); if (v) v.play().catch(() => {}); }}
        onMouseLeave={(e) => { const v = e.currentTarget.querySelector("video"); if (v) { v.pause(); v.currentTime = 0; } }}>
        {thumb ? <video src={thumb} muted loop autoPlay playsInline preload="metadata" />
               : <div className="ph" />}
        {suitsThem ? <span className="bgc-badge fit">Suits them</span>
                   : f.popular ? <span className="bgc-badge">Popular</span> : null}
        {on ? <span className="bgc-tick"><Check className="w-3 h-3" strokeWidth={3} /></span> : null}
        <div className="bgc-meta">
          <div className="bgc-nm">{f.name}</div>
          {f.desc ? <div className="bgc-ds">{f.desc}</div> : null}
        </div>
      </div>
    );
  };

  return (
    <>
      <p className="bgc-note">
        Showing {fit.length + rest.length} of {FORMATS.length}. {ex.size} do not suit a {who}: {[...ex].join(", ")}.
      </p>
      {fit.length ? (
        <>
          <div className="bgc-glbl">Suits a {who}</div>
          <div className="bgc-grid">{fit.map((f) => <Card key={f.name} f={f} suitsThem />)}</div>
        </>
      ) : null}
      <button type="button" className="bgc-more" onClick={() => setShowRest((v) => !v)}>
        {showRest ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {showRest ? "Hide the other formats" : `Show ${rest.length} more formats`}
      </button>
      {showRest ? <div className="bgc-grid">{rest.map((f) => <Card key={f.name} f={f} />)}</div> : null}
    </>
  );
}

// ---------------------------------------------------------------------
// Sources (8) — connection ids for THIS block, from its Source tab
// ---------------------------------------------------------------------
const ds = datasource.define({
  briefs:     "5a38f876-963d-46e5-9fc9-6890365122b5", // Lead Magnets → Briefs
  emailit:    "4ccb4159-b17e-4906-ad92-cb7dc776522f", // EmailIt REST
  // No leads source on purpose. The block writes one lead_event and the
  // two-way relation in the CRM attaches it to the existing lead or makes
  // a new one. Writing to leads as well is what duplicates rows.
  leadEvents: "8080b8e6-e4f9-4f00-8f5a-7c79b71c0445", // Brieflee CRM → lead_events
  formats:    "aa342c0c-45eb-4c72-8dc7-ead14ff0bb0b", // beta → formats
  videos:     "f0d5e7e4-577b-4c02-a15d-fa2bfc0da624", // beta → videos
  firecrawl:  "0d23f96a-1e08-45ea-9166-8ba3f3eb0c27", // Firecrawl REST
  openrouter: "6ebc01df-fb32-43a2-85cc-367ec6014110", // OpenRouter REST
});

// The row this block writes (Lead Magnets → Briefs).
// selected_format_id is deliberately NOT written: it is still a link to the
// doomed Formats copy. The format name travels inside the brief JSON, so
// nothing breaks when that link is dropped.
const briefWrite = q.select({
  clientUuid:    "jgOZo",
  email:         "YrYDT",
  websiteUrl:    "ykj6n",
  filmer:        "REnaH",   // SELECT
  channelType:   "Q2iqD",   // SELECT
  awareness:     "OAuMK",   // SELECT
  selectedAngle: "WnPLY",
  generatedBrief:"YRFT5",
  brandResearch: "flpoq",
  logoUrl:       "ML2kA",
  pageUrl:       "uwwMV",
  productUrl:    "Ez58b",
  featureDesc:   "y3OYO",
  status:        "aNWUE",   // SELECT
});

// One row per use. This is where attribution lives, so it is never deduped:
// grouping these by email gives first/last seen, per-magnet counts and which
// tool someone came through first.
const eventWrite = q.select({
  email:       "KfXCh",
  source:      "0tbOR",   // SELECT, one option per magnet
  channel:     "Stu4F",   // SELECT
  name:        "wNiuC",
  website:     "MSNYn",
  pageUrl:     "5GODb",
  landingPage: "CO6OA",
  payload:     "hvB7E",
  submittedAt: "8ZeJj",
  utmSource:   "enDXw",
  utmMedium:   "DSAXX",
  utmCampaign: "o6blp",
  utmContent:  "mDzib",
});

// SELECT values are written as {id,label}, the same way the analyser
// blocks do it, so Softr matches the option rather than guessing.
const OPT_SOURCE_BRIEF  = { id: "47f2321f-3efb-4cd1-963d-9be8a59928d1", label: "ai-brief-generator" };
const OPT_CHANNEL_MAGNET = { id: "dcaa1da5-8a7c-4c7d-a964-8bfadc910932", label: "Lead magnet" };
const OPT_CHANNEL_PAID   = { id: "c82e4b4d-d516-46d0-9925-b05f6687964c", label: "Paid ad" };
const OPT_STATUS_GENERATED = { id: "c79ae859-aca4-418b-a847-44e27b42cf25", label: "Generated" };

// Control level (Brief Bible). It decides whether the creator gets
// talking points or a scene by scene, never both: creator-led means they
// find their own words, directional means the scenes carry the intent.
const CONTROL_LEVEL = {
  "Influencer":  "creator-led",
  "TikTok Shop Affiliate": "creator-led",
  "UGC Creator": "directional",
  "Founder":     "directional",
  "Customer":    "directional",
  "Employee":    "directional",
};

// beta → formats: the single source of truth for thresholds and examples.
const formatRead = q.select({
  name:              "wYhAb",  // Name
  formatDescription: "gMc91",  // Description
  formatWhyItWorks:  "kOxkg",  // Why it works
  qaChecklist:       "ZkYeh",  // Qa checklist
  faceTime:          "4Czop",  // Face time
  audioClarity:      "E7K0j",  // Audio clarity
  audioHookTiming:   "qmaUU",  // Audio hook timing
  brandMentionCount: "wbMV4",  // Brand mention count
  ctaPlacement:      "w7BID",  // CTA placement
  engagementPacing:  "lrEoP",  // Engagement pacing
  productVisibility: "EgfKk",  // Product visibility
  textLegibility:    "hkXzW",  // Text legibility
  visualHook:        "BQgkr",  // Visual hook
  sampleClips:       "QT9T8",  // Sample clip urls
  videoExamples:     "3rWLE",  // Video url, looked up through Video formats
});

// ---------------------------------------------------------------------
// What we can tell someone about their own brand from one read. Every
// pill is lifted from the page, never guessed, so the card is a receipt
// rather than a flourish.
// ---------------------------------------------------------------------
function readBrandCard(websiteUrl, markdown, meta) {
  // A page can declare the same tag twice, and Firecrawl hands those back
  // as an array. Take the first and never render a joined string.
  const raw = meta || {};
  const m = {};
  Object.keys(raw).forEach((k) => { m[k] = Array.isArray(raw[k]) ? raw[k][0] : raw[k]; });
  let host = "";
  try {
    host = new URL(/^https?:\/\//i.test(websiteUrl) ? websiteUrl : `https://${websiteUrl}`).hostname.replace(/^www\./, "");
  } catch { host = String(websiteUrl || "").replace(/^https?:\/\//, "").split("/")[0]; }

  // The brand name is the shortest half of the share title, which is
  // almost always "Product | Brand" or "Brand | Tagline".
  const rawTitle = String(m.ogTitle || m.title || "").replace(/\s+/g, " ").trim();
  const halves = rawTitle.split(/\s[|–—\-]\s/).map((s) => s.trim()).filter(Boolean);
  const brandName = (halves.length > 1
    ? halves.reduce((a, b) => (a.length <= b.length ? a : b))
    : halves[0]) || host.split(".")[0];

  const pageTitle = String(m.title || "").replace(/\s+/g, " ").trim().split(/\s[|–—\-]\s/)[0];
  // Bounded on both ends: a page full of digit sliders will otherwise
  // hand back something like $01234567890123456789 and call it a price.
  const price = (String(markdown || "").match(/[$£€]\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?(?!\d)/) || [])[0];
  // bestRating is the top of the scale, not the score, so it is no use as
  // a pill. The review count is the honest number.
  const reviews = Number(String(m.reviewCount || "").replace(/[^\d]/g, ""));
  const reviewPill = reviews > 0 ? `${reviews.toLocaleString()} reviews` : "";

  const pills = [
    pageTitle && pageTitle !== brandName ? pageTitle : "",
    price ? `${price} hero product` : "",
    reviewPill,
  ].filter(Boolean).slice(0, 4);

  return {
    host,
    brandName,
    pills,
    logoUrl: `https://www.google.com/s2/favicons?domain=${host}&sz=128`,
    productImage: String(m.ogImage || ""),
  };
}

// ---------------------------------------------------------------------
// Endpoints called through the REST sources (server-side, so no CORS)
// ---------------------------------------------------------------------
const FIRECRAWL_URL   = "https://api.firecrawl.dev/v1/scrape";
const OPENROUTER_URL  = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "deepseek/deepseek-v4-flash";
// BL | Leads, the one nurture audience for every tool that hands the visitor
// something (comms map v3). A repeat address returns 409, which means the
// person is already on the list: success, not an error. The day-1 email
// merges {{tool_name}} from the contact, so it is set on the join.
const EMAILIT_AUDIENCE = "aud_4J2sokpCp3VLZHFhnayoyKe4SXL";
const EMAILIT_TOOL_NAME = "brief generator";
const EMAILIT_SUBSCRIBE = `https://api.emailit.com/v2/audiences/${EMAILIT_AUDIENCE}/subscribers`;

// The confirmation is sent from here, not by an audience-join automation.
// An automation fires the instant someone passes the gate, which is before
// the brief exists, so the email would go out with nothing to link to.
// Sending at the end of generation means record_url is always a real brief.
// The matching audience-join automation stays paused, or this double-sends.
const EMAILIT_SEND = "https://api.emailit.com/v2/emails";
const CONFIRM_TEMPLATE = "bl-leadmag-bg";
const CONFIRM_FROM = "Bev from Brieflee <bev@brieflee.co>";
const TOOL_URL = "https://www.brieflee.co/free-tool-ai-brief-generator";

// Meta pixel. The pixel on this page only sends PageView by itself, so an
// ad campaign optimising for leads would have nothing to learn from. This
// fires a standard Lead event the moment the email gate is passed, which is
// the same moment the lead_event row is written. It never throws: with no
// pixel on the page there is no event, and the gate still works.
function trackMetaLead() {
  try {
    if (typeof window === "undefined" || typeof window.fbq !== "function") return;
    const eventID = `bg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    window.fbq(
      "track",
      "Lead",
      { content_name: "ai-brief-generator", content_category: "lead-magnet" },
      { eventID }
    );
  } catch (e) { /* tracking never blocks the gate */ }
}

// Attribution hand-off. Ads land on a lead magnet, but the demo booking
// happens on /book-a-demo, so the click id and UTMs would be lost between
// pages. Landing with any of them writes one record to localStorage for
// 7 days (Meta's click attribution window). The demo chat reads it back
// when its own URL carries nothing, and this block reads it too, so a
// returning visitor is still counted as paid.
const ATTRIBUTION_KEY = "bl_attribution";
const ATTRIBUTION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
function readUrlAttribution() {
  const blank = { utmSource: "", utmMedium: "", utmCampaign: "", utmContent: "", utmTerm: "", gclid: "", fbclid: "", ttclid: "", referrer: "", landingPage: "", firstLanding: "" };
  if (typeof window === "undefined") return blank;
  try {
    const p = new URLSearchParams(window.location.search);
    const get = (k) => (p.get(k) || "").slice(0, 200);
    return {
      utmSource: get("utm_source"),
      utmMedium: get("utm_medium"),
      utmCampaign: get("utm_campaign"),
      utmContent: get("utm_content"),
      utmTerm: get("utm_term"),
      gclid: get("gclid"),
      fbclid: get("fbclid"),
      ttclid: get("ttclid"),
      referrer: (document.referrer || "").slice(0, 300),
      landingPage: (window.location.pathname + window.location.search).slice(0, 300),
      firstLanding: "",
    };
  } catch (e) { return blank; }
}
function hasClickAttribution(a) {
  return !!(a && (a.gclid || a.fbclid || a.ttclid || a.utmSource || a.utmMedium || a.utmCampaign));
}
function rememberAttribution() {
  try {
    const a = readUrlAttribution();
    if (!hasClickAttribution(a)) return;
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify({ ...a, ts: Date.now() }));
  } catch (e) { /* storage blocked, nothing to remember */ }
}
function recallAttribution() {
  try {
    const raw = localStorage.getItem(ATTRIBUTION_KEY);
    if (!raw) return null;
    const a = JSON.parse(raw);
    if (!a || !a.ts || Date.now() - a.ts > ATTRIBUTION_TTL_MS) return null;
    return a;
  } catch (e) { return null; }
}
function currentAttribution() {
  const a = readUrlAttribution();
  if (hasClickAttribution(a)) return a;
  const s = recallAttribution();
  if (!s) return a;
  return {
    ...a,
    utmSource: s.utmSource || "",
    utmMedium: s.utmMedium || "",
    utmCampaign: s.utmCampaign || "",
    utmContent: s.utmContent || "",
    utmTerm: s.utmTerm || "",
    gclid: s.gclid || "",
    fbclid: s.fbclid || "",
    ttclid: s.ttclid || "",
    referrer: s.referrer || a.referrer,
    firstLanding: s.landingPage || "",
  };
}
function isPaidAttribution(a) {
  return !!(a && (a.gclid || a.fbclid || a.ttclid || /cpc|paid|ppc/i.test(a.utmMedium || "")));
}

// Mirrors the record_url formula on the Briefs table. Computed here rather
// than read back off the row so the send needs no extra round trip, and it
// falls back to the tool page so the template can never merge an empty
// string (EmailIt renders an unknown variable as "", which is how the dead
// unsubscribe link shipped).
function briefRecordUrl(recordId) {
  if (!recordId || typeof window === "undefined") return TOOL_URL;
  return `${window.location.origin}${window.location.pathname}?brief=${encodeURIComponent(recordId)}`;
}

// ---------------------------------------------------------------------
// SELECT option UUIDs (from schema.json)
// ---------------------------------------------------------------------
// Filmer maps to a content-type convention: Influencer = IGC,
// UGC Creator = UGC, Customer = customer-generated, Founder = founder-led,
// Employee = EGC (Employee Generated Content — staff-led, BTS, workplace-
// authentic, NOT polished-influencer-style). The AI workflow uses this
// mapping to write briefs that match the actual content category.
const FILMER_OPTIONS = [
  { id: "ffba9900-c3c3-4708-9535-c4e96de2683f", label: "Influencer" },
  { id: "2d7129c6-47a8-4b64-8978-31ded65be607", label: "UGC Creator" },
  // No id yet: the filmer SELECT on Lead Magnets → Briefs has no TikTok
  // Affiliate choice, and the Softr API will not add one. Until it is added
  // by hand the column is left empty and the label travels in the brief.
  { id: "", label: "TikTok Shop Affiliate" },
  { id: "893287a0-3ea0-41a8-9506-b862bd52e409", label: "Founder" },
  { id: "2e35c74e-136f-4792-8e51-9eee446c4579", label: "Customer" },
  { id: "0e26a628-8602-44e6-bc9c-0f82f777d876", label: "Employee" },
];
const CHANNEL_OPTIONS = [
  { id: "09e8fcc7-b4f4-482b-aa9d-4916d38e700c", label: "Organic" },
  { id: "db7db7f7-65dd-436e-959b-6fb44cb8651c", label: "Paid" },
];
const AWARENESS_OPTIONS = [
  { id: "dbbe216d-76ab-4043-9b58-d3529a8116f1", label: "Unaware" },
  { id: "7f031de8-cfc7-4b21-9758-021e93f0e16a", label: "Problem Aware" },
  { id: "f9348b46-16c3-4844-b603-74cfc0ef3bf1", label: "Solution Aware" },
  { id: "c0c79a00-d029-4fae-b057-f8c75ca4734c", label: "Product Aware" },
  { id: "ecce55a5-c98a-42df-9d2c-ddf6837bb7cb", label: "Most Aware" },
];

// ---------------------------------------------------------------------
// Prompt-payload guidance — pre-resolved on the hero so the Claude system
// prompt stays short. Only the relevant guidance for the chosen filmer /
// channel / awareness gets sent to the workflow.
// ---------------------------------------------------------------------
const FILMER_GUIDANCE = {
  "UGC Creator": "Paid creator with no following. Polished but authentic. Bright lighting, clear product use, branded but not over-styled. Energy in first 3 seconds. Talks to camera or to a friend off-camera.",
  "Influencer":  "Creator with an established following. Polished, aspirational. Uses their own established voice and references their audience. Affiliate-style CTAs work well.",
  "TikTok Shop Affiliate": "Forks from the influencer: same own channel, own audience, but sales first and paid on commission per sale through a TikTok Shop link or code. Often a micro creator, often a real customer who liked the product enough to monetise it. Briefed light and built for volume, because the play is many affiliates off one template. No script, they know what converts for their audience. What carries it: a friction first hook, their own credibility, the product shown actually working, a clean link and code CTA, and disclosure done right.",
  "Founder":     "Founder on camera. Direct-to-camera, founder seat, single takes. Mission-driven. Speaks with conviction about the product they built. No marketing-speak. Often plain backdrop.",
  "Customer":    "Real customer testimonial. Raw, handheld, honest. Why they bought it and what changed. Imperfect framing is OK and adds credibility. No actors, no script.",
  "Employee":    "Staff-led BTS (Employee Generated Content). Workplace settings, real desks or store floor. Candid coworkers, natural sound. Workplace-authentic, NOT polished. Day-in-the-life energy.",
};

const CHANNEL_GUIDANCE = {
  "Paid":    "Explicit CTAs with tracking links. Ad-disclosure language required (e.g. '#ad' or 'Paid partnership with...'). Tighter pacing. Hook must land hard in 3s. Volume: 3 videos + 9 hook variants typical.",
  "Organic": "Softer brand mention. No disclosure rule. Looser pacing. Brand handle in caption (not tracking links). Match the creator's usual posting style. Lower production volume.",
};

const AWARENESS_HOOK_TACTICS = {
  "Unaware":        "pattern interrupt, curiosity gap, story setup, statistics, relatability",
  "Problem Aware":  "pain/problem amplification, confession, direct question, contrarian, relatability",
  "Solution Aware": "before/after, revelation, authority, statistics, social proof",
  "Product Aware":  "before/after, authority, social proof, direct question, enemy/comparison",
  "Most Aware":     "urgency, challenge/dare, social proof, before/after, direct question",
};

// Format guidance — Description + Why It Works + Hook Tactic from the
// Softr Formats table (Lead Magnets DB, `h2LC8rO0GgOCke`), pulled 2026-05-19. The hero looks
// up by format name when building the webhook payload so Claude receives
// the relevant format guidance as one pre-resolved string. Refresh from
// the Formats table when guidance changes there.
const FORMAT_GUIDANCE = {
  "AI Generated": "Imagery your camera couldn't capture. Surreal scenes, impossible visuals, characters that don't exist in real life — generated to land a hook your audience hasn't seen before. Why it works: AI-generated visuals signal 'you haven't seen this before' the second they hit the feed. That novelty buys the first second of attention. Voiceover or caption then has the easier job of connecting the image back to the product. Hook tactic: Pattern Interrupt, Curiosity Gap, Revelation / Secret",
  "ASMR": "Show your product through sound. Tapping the lid, the crinkle of packaging, the pour, the squeeze. Audiences slow down for tactile detail — and your product becomes the texture, not the pitch. Why it works: ASMR cuts through the scroll because it whispers instead of shouts. No voiceover, no hard sell — just sensory closeness. Viewers stick around for the satisfaction, and the product becomes a feeling instead of a feature list. Hook tactic: Pattern Interrupt, Relatability, Curiosity Gap",
  "Before and After": "One frame of the before. One frame of the after. The space between is your product. Skin, body, home, dashboard, bank balance — whatever your audience is trying to change, show them the gap closing. Why it works: Before and After does the convincing without selling. Viewers see themselves in the 'before' and project themselves into the 'after' — your product becomes the only missing piece. The proof is the image, not the script. Hook tactic: Before / After, Desired Outcome, Curiosity Gap",
  "Behind The Scenes": "Show the part of the brand the audience never sees — how the product is made, who's making it, what the team looks like off-camera. Less pitch, more peek behind the curtain. Why it works: People buy from brands they trust, and trust comes from feeling like they know you. BTS quietly answers 'who is behind this?' and builds the credibility polished ads can't. Especially powerful for founder-led and craft brands. Hook tactic: Revelation / Secret, Story Setup, Confession / Vulnerability",
  "Celebrity": "A face your audience already trusts. Borrowed authority — your product gets a few seconds in the hands of someone the algorithm already knows, and your reach jumps before they say a word. Why it works: Celebrity stops the scroll on recognition alone. The credibility transfer is immediate — viewers don't have to be convinced the product is worth their time, the face has done that work. Best deployed lower in the funnel where the audience already knows the brand exists. Hook tactic: Social Proof, Authority / Credibility, Pattern Interrupt",
  "Cinematic B-Roll": "Brand-led, beautifully shot moments of your product in use. No talking heads, no overlays — just imagery your audience would screenshot. Best when you've earned the right to be visual without explanation. Why it works: Cinematic B-roll signals 'this brand has its act together' in the first second. The polish is the credibility — and when the visuals are this strong, the brand can afford to whisper instead of shout. Pair with a caption that earns the look. Hook tactic: Desired Outcome, Pattern Interrupt, Story Setup",
  "Comment Response": "Frame the ad as a reply. A real comment lives on screen — 'does this actually work?', 'but what about X?' — and the creator answers, on camera or with a demo. Feels native, feels honest, feels not like an ad. Why it works: Comment Response disguises the ad as a conversation. The viewer doesn't feel pitched — they feel like they walked in on someone genuinely answering a question, and the answer happens to involve your product. Perfect for handling objections without sounding defensive. Hook tactic: Direct Question, Confession / Vulnerability, Revelation / Secret",
  "Demo": "Show it working. Hands using the product, the result happening in real time. No explanation needed if the demo is clear — viewers learn what your product does by watching it do it. Why it works: Demos answer 'what does it actually do?' before the viewer has to wonder. The clarity of seeing the product perform replaces a paragraph of features — and when the result on screen is satisfying, that satisfaction is what gets remembered. Hook tactic: Desired Outcome, Curiosity Gap, Pattern Interrupt",
  "Duet": "Splitscreen with another video — usually a viral clip, a customer review, or a reaction. The format puts your brand right next to something the algorithm is already pushing. Why it works: Duet is a piggyback. The original clip earns the attention; your reaction earns the conversion. Especially powerful when the source clip is already trending — viewers stay because they're invested in that video, not your ad. Hook tactic: Pattern Interrupt, Social Proof, Contrarian",
  "Educational": "Teach the viewer something they didn't know. The problem, the science, the why behind the product. Not 'buy this' — 'here's what's happening, and here's how to fix it.' Why it works: Educational content earns trust before it earns the sale. Viewers stay because they're learning, not being pitched — and the brand that does the educating gets credited as the expert. Especially strong for unaware audiences who don't even know the product category exists yet. Hook tactic: Revelation / Secret, Authority / Credibility, Statistics / Numbers",
  "Expert Explainer": "An authority explains the product or the problem — doctor, coach, engineer, dermatologist, dentist. The credibility lives in who's saying it, not what's being said. Let the expertise carry the script. Why it works: Expert Explainer pre-empts the 'but is this real?' doubt by leading with a credentialed person. Viewers don't have to evaluate the claim — the title or qualification has done that work. Pairs especially well with categories where the buyer feels out of their depth. Hook tactic: Authority / Credibility, Revelation / Secret, Contrarian",
  "Founder": "You, on camera. Why you built this, what was broken about every other option, what you'd want a friend to know before they bought. Most powerful when it sounds like you'd say the same thing at a dinner party. Why it works: Founder content carries weight because it's the only person in the brand who has nothing to gain from lying about the product. Viewers can tell the difference between a paid talking head and a person whose name is on the company — and the bias is in your favour. Hook tactic: Confession / Vulnerability, Story Setup, Contrarian",
  "Greenscreen": "You on camera, with a screenshot, article, tweet, or review sitting behind you. Point at it, react to it, walk through it. The visual reference does half the storytelling so you don't have to. Why it works: Greenscreen gives the viewer two things at once — a face to trust and a visual to read. The eye stays moving between speaker and background, which keeps watch time high. Ideal for reacting to press, reviews, comments, or competitor claims. Hook tactic: Revelation / Secret, Social Proof, Contrarian",
  "Grid Swap": "Frame stays the same; one element swaps in and out. A drink, a product, an outfit, a tool. The repetition trains the eye, and the swap lands the point — your product is the one that fits. Why it works: Grid Swap works because the brain notices change. The static frame builds rhythm, the swap breaks it — and your product is the disruption. Ideal for category comparisons or 'this not that' framing without ever needing to badmouth a competitor. Hook tactic: Pattern Interrupt, Before / After, Desired Outcome",
  "How To": "Walk the viewer through it — step one, step two, result. The product is a tool inside the lesson, not the lesson itself. Best when the steps are simple enough that the viewer feels they could do it tonight. Why it works: How-To earns the watch because the viewer is getting something useful out of it. The product slots in as the helper, not the hero — which makes the ad feel like content. Especially strong when the audience is mid-funnel and asking 'how do I actually do this?' Hook tactic: Direct Question, Desired Outcome, Curiosity Gap",
  "Humour": "Lead with the laugh, land the product on the punchline. Skits, awkward characters, dry one-liners. Humour disarms the viewer before they realise it's an ad. Why it works: Humour is the cheapest distance between you and someone who didn't know they needed your product. Laughter lowers the guard, and on the back of the joke, the product feels like a friend's recommendation — not a sales pitch. The best ones get remembered and shared, which is its own scale lever. Hook tactic: Pattern Interrupt, Relatability, Confession / Vulnerability",
  "Influencer Endorsement": "A creator your audience already follows, with your product in their hands. Less polished than celebrity, more credible than a brand ad — viewers trust it because they trust the person, not the spend. Why it works: Influencer Endorsement borrows trust the brand hasn't earned yet. The creator's voice carries weight their followers have already validated — so the product gets the credibility before the brand has to prove anything. Strongest when the creator-brand fit feels obvious to the viewer. Hook tactic: Social Proof, Confession / Vulnerability, Relatability",
  "Listicle": "Numbered, snappy, easy to follow. '3 reasons I switched', '5 things I wish I knew', 'Top 4 features I actually use.' The structure does the watch-time work — viewers stay because they want to know what number five is. Why it works: Listicle gives the viewer a finish line — '5 things' sets a clear endpoint, and the brain wants to get there. The format also makes the content feel like advice instead of an ad, especially when the list is genuinely useful. Hook tactic: Statistics / Numbers, Curiosity Gap, Desired Outcome",
  "Meme": "A current meme, used the way it's actually used. Same template, same timing, same beat — your product just shows up where the punchline normally lands. Done right, viewers double-tap before they clock it's an ad. Why it works: Meme works because the format is already familiar. Viewers recognise the template, the brain auto-completes the joke, and your product gets credited as part of the in-group. Risk is staleness — meme ads age in days, not months, so speed of execution matters as much as the idea. Hook tactic: Pattern Interrupt, Relatability, Contrarian",
  "Montage": "Many shots, cut fast. Product in use, customers smiling, results stacking — montage gives you breadth without making any single moment carry the whole load. Best when each cut is interesting enough on its own. Why it works: Montage telegraphs scale — 'look how many people, how many uses, how many results' — without ever saying it out loud. The pace also makes it hard to look away; the next cut is faster than the viewer's instinct to scroll. Hook tactic: Pattern Interrupt, Social Proof, Desired Outcome",
  "POV": "Shot from the viewer's perspective. Camera angle mimics what they'd see if it were their hands, their morning, their day. Pairs naturally with 'POV: you finally fixed X' framing. Why it works: POV collapses the distance between the viewer and the product. Instead of watching someone else use it, they're watching themselves use it — and the imagined ownership does most of the conversion work for you. Hook tactic: Relatability, Story Setup, Desired Outcome",
  "Pattern Interrupt": "An opening that has nothing obvious to do with the product. A loud sound, an odd object, a sentence that doesn't make sense yet. The job is one thing: stop the thumb. Connection to the brand earns its way in after. Why it works: Most scrollers decide in under a second. Pattern Interrupt wins that second by refusing to look like an ad — confusion buys curiosity, and curiosity buys the next three seconds where you actually get to land a message. Hook tactic: Pattern Interrupt, Curiosity Gap, Contrarian",
  "Podcast": "Two people, mics, jump cuts, subtitle bar. Looks like a podcast clip the algorithm pulled in from a longer episode — and your product gets mentioned the way friends mention things they've tried, not the way ads sell them. Why it works: The podcast clip is one of the most-consumed formats on every platform right now. Viewers expect to learn something or hear an opinion — so the bar to keep them watching is lower, and the trust is higher than a polished ad would earn. Hook tactic: Story Setup, Revelation / Secret, Confession / Vulnerability",
  "Postit": "Sticky notes around the product. Each one calls out a benefit, a use case, a stat. Scrappy, low-fi, handwritten — feels like internal notes the viewer wasn't meant to see. Why it works: Post-It earns attention by looking nothing like an ad. The handwritten format reads as honest — like a friend's notes rather than a brand's claims. Especially strong when each note answers a real objection. Hook tactic: Curiosity Gap, Revelation / Secret, Statistics / Numbers",
  "Press": "Logos, headlines, article screenshots. 'As seen in Vogue, Forbes, GQ.' You don't have to explain why the product is credible — the publication does it for you. Why it works: Press collapses the trust-building stage. Viewers already trust the publication; the brand inherits that trust in one frame. Best deployed when the buyer is already considering the product and just needs a final reason to commit. Hook tactic: Authority / Credibility, Social Proof, Statistics / Numbers",
  "Problem Agitation": "Show the problem at its worst. The frustration moment, the messy bathroom, the failed attempt, the third product that didn't work. Make the viewer feel the pain before you offer the way out. Why it works: Problem Agitation works because viewers don't act until the pain feels current. Watching the problem on screen makes yesterday's annoyance feel like today's emergency — and your product becomes the obvious response. Hook tactic: Pain / Problem, Relatability, Confession / Vulnerability",
  "Reaction Video": "Someone reacting in real time — to a clip, a comment, a first-try of your product. Face up, expressions big, the reaction is the content. The viewer comes for the face, stays for the context. Why it works: Reaction Video borrows two viewer instincts at once — the desire to watch someone's face mid-emotion, and the desire to know what they're reacting to. Both keep the thumb still long enough for the brand to land its point. Hook tactic: Pattern Interrupt, Curiosity Gap, Relatability",
  "Review": "A real review — read aloud, screenshotted, or shown over product footage. Five stars, specific words, the bits customers wrote unprompted. The review carries the script; the product just shows up alongside it. Why it works: Review works because the words aren't yours. Viewers discount what the brand says about itself but trust what a stranger with no skin in the game wrote at 11pm after using the product. The credibility is in the third-party voice. Hook tactic: Social Proof, Confession / Vulnerability, Direct Question",
  "Screen Recording": "Phone or computer screen, recorded straight. App walkthroughs, scrolling through reviews, side-by-side comparisons in the browser. No actor needed — just the screen and a clear point. Why it works: Screen Recording feels native to how viewers already use their phones. There's no 'production' to disbelieve — the screen is the screen. Especially powerful when the recording shows real numbers, real reviews, or a real-time comparison. Hook tactic: Revelation / Secret, Curiosity Gap, Direct Question",
  "Skit": "A mini-story with characters. 'Old me vs new me', the friend explaining the product to the sceptic, the awkward moment before the product saves the day. Comedy as the wrapper, product as the punchline. Why it works: Skit lowers the viewer's guard by being entertainment first. The brain doesn't categorise it as an ad until it's already watched. And because the product solves a dramatised problem, the value lands without needing a pitch. Hook tactic: Relatability, Pattern Interrupt, Story Setup",
  "Social Proof Mashup": "Many pieces of proof, cut together fast. UGC, screenshots of reviews, star ratings, press logos, before & afters — all stacked into one asset that tells the viewer one thing: a lot of people already trust this. Why it works: Social Proof Mashup works lower in the funnel because the buyer is already weighing the decision. Stacking proof at speed crowds out the doubt — they don't need to evaluate any one piece, just the weight of all of it together. Hook tactic: Social Proof, Statistics / Numbers, Authority / Credibility",
  "Stitch": "TikTok stitch — the first few seconds of someone else's video, then a cut to your reply. The original sets up the tension; your half resolves it with your product, your take, or your evidence. Why it works: Stitch piggybacks on the original creator's audience and framing. Viewers already invested in the source clip stick around for the reply — and the brand gets a moment of borrowed momentum it would have had to earn from scratch. Hook tactic: Contrarian, Revelation / Secret, Direct Question",
  "Stop Motion": "Frame-by-frame animation. Products that build themselves, ingredients that float into place, characters made of objects. The craft of the motion is the hook — viewers stay to see how it was made. Why it works: Stop Motion is rare in the feed, which is its biggest advantage. The thumb hovers because the motion looks intentional in a way most ads don't — and intentional feels like effort, which feels like quality. Hook tactic: Pattern Interrupt, Curiosity Gap, Desired Outcome",
  "Street Interview": "Man-on-the-street style. A creator with a mic, real people, real answers. 'What's your biggest issue with X?' 'Rate this 1 to 10.' The spontaneity does the credibility work. Why it works: Street Interview can't be faked easily. Real reactions from real strangers carry weight that scripted UGC can't. The format also creates surprise — viewers don't know what the next person will say, so they keep watching to find out. Hook tactic: Direct Question, Pattern Interrupt, Social Proof",
  "Testimonial": "A real customer, on camera, telling their story. The pain before, what they tried, what changed when the product showed up. The script is theirs; the brand just gives them the floor. Why it works: Testimonial works because the buyer can see themselves in the customer. The story isn't 'this product is great' — it's 'here's someone like me whose problem went away.' The imagined transfer is the whole pitch. Hook tactic: Social Proof, Confession / Vulnerability, Before / After",
  "Time Lapse": "Sped-up footage of a transformation — skin clearing, the room being tidied, the plant growing, the dashboard filling up. The fast-forward makes the change feel inevitable. Why it works: Time Lapse compresses the proof. What would take weeks of use is shown in seconds — the viewer's brain accepts the transformation as 'fast and easy' even when the real-world timeline is longer. Pair with on-screen timestamps for honesty. Hook tactic: Before / After, Desired Outcome, Statistics / Numbers",
  "Transformation": "The change, on camera, in one continuous take or tight cut. Skin clearing, hair styled, room reset, body changed. Differs from Before and After by showing the journey instead of the two endpoints. Why it works: Transformation works because the viewer watches the proof unfold. There's no faith required — the change is happening in front of them. Especially powerful when the moment of change feels physical or emotional, not just visual. Hook tactic: Before / After, Desired Outcome, Curiosity Gap",
  "Trend": "A current TikTok / Reels trend, used the way the platform is using it. Same sound, same template, same beat — your product slots in where the joke or pattern normally goes. Why it works: Trend rides momentum the brand didn't build. The viewer's already primed for the format and the sound; your product gets carried by the wave. Speed of execution beats polish — by the time you perfect a trend ad, the trend is over. Hook tactic: Pattern Interrupt, Relatability, Social Proof",
  "Try-On": "Trying the product on, on camera. Outfit changes, makeup swatches, accessories, glasses. The viewer sees the product in real proportion on a real person — and starts imagining it on themselves. Why it works: Try-On answers the silent question every wearable-product buyer has: 'will this look right on me?' Seeing it on someone close to their proportions or skin tone is worth more than any product photo could deliver. Hook tactic: Desired Outcome, Relatability, Social Proof",
  "Unboxing": "Opening the box on camera. Packaging, paper, the product in its first moment. The viewer is curious about the same things the buyer would be — how it feels, what's inside, whether it lives up to the brand's image. Why it works: Unboxing taps the buyer's anticipation moment. Even people who haven't ordered yet feel the small thrill of opening a package — and the brand gets to control how that first impression looks, before the buyer ever sees it in real life. Hook tactic: Curiosity Gap, Desired Outcome, Pattern Interrupt",
  "Whiteboard Explainer": "A whiteboard, a marker, and an explanation. Concept drawn out as you talk through it — the visuals build with the argument, so the viewer learns at the same speed you teach. Why it works: Whiteboard works because the act of drawing slows the viewer down to the speed of understanding. Each stroke is a small reveal — and the brand earns expert positioning just by walking through the why. Hook tactic: Authority / Credibility, Revelation / Secret, Statistics / Numbers",
  "Yapper": "Creator talking straight to camera. No props, no setup, no cuts — just face, words, and energy. The opener does all the heavy lifting because that's all there is to lift. Why it works: Yapper is the most native format on TikTok and Reels — it looks like the content the viewer already follows. The lack of production reads as honest, and the energy of the creator carries the watch when the message alone wouldn't. Hook tactic: Confession / Vulnerability, Call Out, Relatability",
};

// ---------------------------------------------------------------------
// Result-view bento section icons (Brieflee Cloudinary library)
// ---------------------------------------------------------------------
const ICON_ABOUT          = "https://res.cloudinary.com/dchroynzv/image/upload/v1777998692/brieflee_help-icon_workspace-checkmark-badge-wavy-edge-approved-transparent_2026-05.png";
const ICON_PERSONAL       = "https://res.cloudinary.com/dchroynzv/image/upload/v1777998690/brieflee_help-icon_members-speech-bubble-profile-icon-with-count-one-transparent_2026-05.png";
const ICON_HOOK           = "https://res.cloudinary.com/dchroynzv/image/upload/v1777998712/brieflee_icon_trendy-flat-fire-sticker-transparent_2026-05.png";
const ICON_TALKING_POINTS = "https://res.cloudinary.com/dchroynzv/image/upload/v1777998691/brieflee_help-icon_notifications-megaphone-loudspeaker-blue-transparent_2026-05.png";
const ICON_CTA            = "https://res.cloudinary.com/dchroynzv/image/upload/v1777998712/brieflee_icon_trendy-flat-cursor-sticker-transparent_2026-05.png";
const ICON_DO             = "https://res.cloudinary.com/dchroynzv/image/upload/v1777998694/brieflee_icon_approval-stamp-icon-transparent_2026-05.png";
const ICON_DONT           = "https://res.cloudinary.com/dchroynzv/image/upload/v1777998695/brieflee_icon_close-x-icon-design-transparent_2026-05.png";
const ICON_DELIVERABLES   = "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_sticker-blue-target-bullseye-arrow-hit-goal_2026-03.png";
const ICON_THRESHOLDS     = "https://res.cloudinary.com/dchroynzv/image/upload/v1777998702/brieflee_icon_media-player-interface-icon-transparent_2026-05.png";
const ICON_STANDARDS      = "https://res.cloudinary.com/dchroynzv/image/upload/v1777622906/brieflee_illustration_flat-red-wax-seal-stamp-approved-colour_2026-03.png";
const ICON_STORYBOARD     = "https://res.cloudinary.com/dchroynzv/image/upload/v1777998703/brieflee_icon_movie-clapper-illustration-transparent_2026-05.png";
const ICON_SCRIPT         = "https://res.cloudinary.com/dchroynzv/image/upload/v1777998710/brieflee_icon_smartphone-in-tripod-flat-illustration-transparent_2026-05.png";
const ICON_EXAMPLES       = "https://res.cloudinary.com/dchroynzv/image/upload/v1777622932/brieflee_illustration_flat-render-iphone-back-view-black-triple-camera-mockup_2026-03.png";

const SECTION_TOOLTIPS = {
  about:               "What the brand sells, in their own words.",
  personalExperiences: "Relatable scenarios in the buyer's voice. The creator picks one that fits their life and tells it naturally on camera.",
  hook:                "Three opening lines for the first 3 seconds. Each uses a different tactic — pick the one that feels natural.",
  talkingPoints:       "Bullet points to say in your own words. Not a script to memorise.",
  storyboard:          "Shot by shot. Each shot tagged by scene type (Hook, Problem, Demo, CTA).",
  script:              "The full script as one read-through, pulled together from the storyboard rows.",
  cta:                 "Three ways to close the video. Pick the one that fits your voice.",
  dos:                 "Best practices when filming this format.",
  donts:               "What to avoid when filming. Compliance and brand safety.",
  deliverables:        "What to hand back. Number of videos, hook variants, length.",
  thresholds:          "The bars the video has to hit for the chosen format. Face Time, Product Visibility, CTA Placement, etc.",
  standards:           "QA areas to check before delivery.",
  examples:            "Reference videos in the same format. Watch these to calibrate.",
};

// Scene-section taxonomy for storyboard shots. Each shot in the storyboard
// table is tagged with one of these. The AI prompt constrains output to this
// vocab so the labels stay consistent across briefs.
const STORYBOARD_TAGS = {
  "Hook":              "First 3 seconds. Stops the scroll.",
  "On-ramp":           "Bridges the hook into the rest of the video.",
  "Problem":           "Names the pain the viewer is feeling.",
  "Agitation":         "Twists the knife. Makes the problem feel urgent.",
  "Motivator":         "Names the emotional stakes for solving it.",
  "Solution Intro":    "Introduces the way out, without naming the product yet.",
  "Product Intro":     "Names the product and what it is.",
  "Demonstration":     "Shows the product working.",
  "Education":         "Explains why the product works.",
  "Proof":             "Credibility moment. Data, results, or third-party validation.",
  "Trust Builder":     "Testimonial or endorsement that builds trust.",
  "Offer Stack":       "What's included. Bundles, bonuses, or guarantees.",
  "Persuasion Levers": "Scarcity, exclusivity, or other reasons to act now.",
  "Engagement":        "Invites comments, shares, or follow-up.",
  "Community":         "Social proof of users — many people doing this together.",
  "Call To Action":    "The direct ask. Tap, swipe, buy.",
  "Outro":             "Closing line or visual. The final beat.",
  "Urgency":           "Deadline or scarcity that drives action now.",
};
const STATUS_OPTIONS = {
  draft:     { id: "f20c0edc-895b-4e24-80c0-0b002a1d228c", label: "Draft" },
  generated: { id: "c79ae859-aca4-418b-a847-44e27b42cf25", label: "Generated" },
  failed:    { id: "2961610f-e4d3-46d6-bd43-772be45ff84b", label: "Failed" },
};

// ---------------------------------------------------------------------
// Angles filtered by awareness — same set as the parked version.
// 5 archetype hooks per awareness level.
// ---------------------------------------------------------------------
const ANGLES_BY_AWARENESS = {
  "Unaware": [
    { id: "pattern-interrupt", name: "Pattern Interrupt", example: "Start with something visually unexpected that breaks the scroll." },
    { id: "curiosity-gap",     name: "Curiosity Gap",     example: "Open a loop the viewer has to watch to close." },
    { id: "story-setup",       name: "Story Setup",       example: "Drop them into the middle of a story they want to finish." },
    { id: "statistics",        name: "Statistics / Numbers", example: "Lead with a number that reframes their reality." },
    { id: "relatability",      name: "Relatability",      example: "Name an everyday moment that suddenly makes the problem visible." },
  ],
  "Problem Aware": [
    { id: "pain-problem",      name: "Pain / Problem",    example: "Name the exact frustration they had this morning." },
    { id: "confession",        name: "Confession / Vulnerability", example: "Admit something they secretly do too." },
    { id: "direct-question",   name: "Direct Question",   example: "Ask the question that's been stuck in their head." },
    { id: "contrarian",        name: "Contrarian",        example: "Say the unpopular thing about their problem." },
    { id: "relatability",      name: "Relatability",      example: "Show the exact moment the pain hits in their day." },
  ],
  "Solution Aware": [
    { id: "before-after",      name: "Before / After",    example: "Show what life looks like with vs without a solution." },
    { id: "revelation",        name: "Revelation / Secret", example: "Tell them a thing they didn't know about how the solution works." },
    { id: "authority",         name: "Authority / Credibility", example: "Show your credentials in the first 3 seconds." },
    { id: "statistics",        name: "Statistics / Numbers", example: "Open with the number that proves it works." },
    { id: "social-proof",      name: "Social Proof",      example: "Show real people getting the result." },
  ],
  "Product Aware": [
    { id: "before-after",      name: "Before / After",    example: "Your product, in their hands, in 3 seconds." },
    { id: "authority",         name: "Authority / Credibility", example: "Why your product specifically, said with conviction." },
    { id: "social-proof",      name: "Social Proof",      example: "Existing customers in their own words." },
    { id: "direct-question",   name: "Direct Question",   example: "Ask them the question that makes choosing you obvious." },
    { id: "enemy",             name: "Enemy / Comparison", example: "Position against the alternative they're considering." },
  ],
  "Most Aware": [
    { id: "urgency",           name: "Urgency / Scarcity", example: "Why now matters, in the opening line." },
    { id: "challenge",         name: "Challenge / Dare",  example: "Dare them to try it." },
    { id: "social-proof",      name: "Social Proof",      example: "The last 10 people who bought it, today." },
    { id: "before-after",      name: "Before / After",    example: "Skip to the result and let them ask how." },
    { id: "direct-question",   name: "Direct Question",   example: "The one-line ask that converts." },
  ],
};

// ---------------------------------------------------------------------
// The 42 UGC formats — copy of the same hardcoded list used by the
// storyboard generator. Each entry: name, 1-3 sample clip URLs (for the
// fanned-stack thumbnail), one-line description.
// Keep in sync if Bev adds new formats.
// ---------------------------------------------------------------------
const FORMATS = [
  { name: "AI Generated", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1539102087635186/69fe34969f9320f2b1b0861d/42f5670a-d595-4fca-883d-4da4fb7de623.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2480820659031774/69f6c3e7280f6afea1796502/d9d08339-ccd7-4009-a845-0f073703d1fc.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1288914972716693/69fcd59d9f9320f2b1a16cd9/7b7b5d7c-8369-4f98-b78a-7271419e9fa1.mp4"], desc: "Imagery your camera couldn't capture" },
  { name: "ASMR", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/26273338205702663/69fefc4d08c1a6eaf90e35cc/f1b99388-a6cb-4ee2-9a3a-3bb593b33cc5.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1453974715994143/69ff1ac608c1a6eaf90f86ab/1bb01da5-9c18-423f-bafa-c3409198c79c.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1650586402939477/69fcceaf9f9320f2b1a110b8/03949dfd-36ad-4c8b-bae2-7e35056f7fa7.mp4"], desc: "Show your product through sound" },
  { name: "Before and After", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/826249757202567/69ff257e08c1a6eaf90fd23e/2ecfe847-c072-4291-b0db-90321b3fb5ff.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/997349255980567/69fcceaf9f9320f2b1a110bf/ad15bbff-2558-4652-88c0-a41d11fc39fc.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2166649664155043/69ff586b08c1a6eaf911064c/198704e6-259d-41b5-b343-8736a024b7ae.mp4"], desc: "One frame of the before" },
  { name: "Behind The Scenes", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2074472573134109/69fd76f99f9320f2b1a8b16e/4b4f80c2-e4e6-49b2-adbb-f199ad55a58a.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1311243414274770/69fccf999f9320f2b1a11ffd/0684dffb-1d59-4252-9dce-2fcf1d0d5c8c.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1445797473361585/69e655fec58c09bbcefb07a5/a24a6e09-ba0a-49f7-8a5c-69ff776cebcf.mp4"], desc: "What the audience never sees" },
  { name: "Celebrity", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/992983046624907/69fd954f9f9320f2b1a9dbd3/79ed3a5b-3e97-41f0-8655-2553922e5eb8.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1280230653593745/69f1dcd9bdb47646c4ab3532/9c64dd18-ec20-455a-b10a-275a2dcd49c6.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/26513328624926776/6999513ed7b54bd21a7c642b/1f8887ef-88c7-49d9-9353-7a018f8e358e.mp4"], desc: "A face your audience already trusts" },
  { name: "Cinematic B-Roll", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/993171706996549/69fbf8bb9f9320f2b19dbbd6/fc1e675c-a0ac-47ea-a1a3-e535ba89fb47.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1207098988040414/69fccc139f9320f2b1a0e4d2/107106e7-27c9-4552-980a-d5612a6494c9.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1544067653729767/69fccc649f9320f2b1a0eb17/a24f9c65-993b-4a58-863f-7b2d3009bb7d.mp4"], desc: "Brand-led, beautifully shot moments" },
  { name: "Comment Response", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/814335377989198/69f30c80bdb47646c4b381b1/c1c60aee-15aa-4145-aa06-5ba3eff5bc0a.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1495263685389096/69fc3a319f9320f2b19eb378/521d8802-e766-4dca-ba26-8be8f5124a19.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1636968607555545/69f25ae0bdb47646c4aeac1e/2d483aa6-d836-4f26-8877-a5699a8d86b2.mp4"], desc: "Frame the ad as a reply" },
  { name: "Demo", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1847378409273214/69ff1afa08c1a6eaf90f890f/038b9e5e-39f7-4fe4-9119-3e93f79d5af1.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1548946033595808/69ff339008c1a6eaf9102910/d652cc8c-2171-4297-8f8e-8fdbb5b81a04.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2222893848474208/69fefddc08c1a6eaf90e46d6/b6b34e83-7d26-4191-b8d4-08b63a7dc23c.mp4"], desc: "Show it working" },
  { name: "Duet", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2148826109305543/69fbede19f9320f2b19d723c/b17ba13a-299f-4295-8704-8a4c235460ab.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2511326736005461/69fccd2d9f9320f2b1a0f96d/ee956cc7-d4fa-4c00-b5b9-f2914f28602f.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/965731989157771/69fefd8f08c1a6eaf90e4296/704b3cbd-0b5b-437c-9adc-7a37f5ad6fba.mp4"], desc: "Splitscreen with another video" },
  { name: "Educational", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/26925557923717582/69e8f287bdb47646c4836ab7/1424c942-6700-47d8-b4bb-f5de4cc9f90e.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/26383093261340327/69de3b1b5f662ed7aa2e0159/779b161c-0da1-4e5e-a6b3-011d2fdddbbd.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1706495643869303/69decd0c3f18261d3fd00d86/d0a27450-6042-404e-a0ee-a0178ce8b811.mp4"], desc: "Teach something they didn't know" },
  { name: "Expert Explainer", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1729883661659771/69fce06d9f9320f2b1a24549/d3eac495-2aba-480f-b7a4-b9973e3e239f.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/969768732118363/69fcf2049f9320f2b1a31264/89e94b42-e134-4825-848a-7cec57a97b3c.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1477341537503717/69f98b4146012bac5d82048e/b90ebf0b-d524-413c-8da1-82941464bc76.mp4"], desc: "An authority explains the product" },
  { name: "Founder", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1284979633759309/69fcfa1c9f9320f2b1a38302/85fda2ba-caea-44d0-8a56-dc11c68a6635.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1609278733465083/69fefa0508c1a6eaf90e1eaf/388c8dfd-1cf9-40ed-813b-1a2453c016f1.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2074472573134109/69fd76f99f9320f2b1a8b16e/4b4f80c2-e4e6-49b2-adbb-f199ad55a58a.mp4"], desc: "You, on camera" },
  { name: "Greenscreen", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1506899424324176/69f6e752280f6afea179e598/49e06cd1-3c8e-4648-90cf-a6659dc6c0bd.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1716657453080499/69fccd439f9320f2b1a0fb63/6837715b-a50b-4d37-82da-6cac73fb08d0.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1388180139785375/69fd18909f9320f2b1a4d53b/cac0e9b6-d154-41ad-bdf6-71689a529abc.mp4"], desc: "You, with a screen behind you" },
  { name: "Grid Swap", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2074129713144290/69f33989bdb47646c4b501d8/6524e4f8-2c79-402b-bc20-1ff8d8c2f165.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2108050316414234/69fccd4a9f9320f2b1a0fc61/1125b0d8-9045-4372-aec2-2bce291fe604.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1987980325420374/69ff00eb08c1a6eaf90e67a3/e500e2f2-be6b-46f0-9731-e2b036fcdc0d.mp4"], desc: "Same frame, one element swaps in" },
  { name: "How To", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/947569901477422/69ff1afa08c1a6eaf90f88b6/cd661be8-8c0d-4c71-90c7-d509934b7560.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/970964365671431/69fccf6d9f9320f2b1a11d45/484b8e6a-34be-40b7-a37b-869fbaf12d23.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1708869660779376/69ff7a7408c1a6eaf911ac09/5801058b-10ba-46df-9639-d5f5d158ea44.mp4"], desc: "Step one, step two, result" },
  { name: "Humour", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/949478807871737/69fbf8b79f9320f2b19dba63/6378d217-f4d6-437d-b448-4f53cdb4bf30.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/3223664521167031/69ff042f08c1a6eaf90e80ee/f775c866-c16e-4c0d-8829-385847056c65.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1452137506087073/69fd04889f9320f2b1a3f8f0/ef658399-0146-48bd-8a76-a3bd6f35b837.mp4"], desc: "Lead with the laugh, land the product" },
  { name: "Influencer Endorsement", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2177021209725365/69f13d63bdb47646c4a7964c/406447ae-3d22-4384-8f03-52bfa16a62b0.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1249072667438968/69f1acd4bdb47646c4a9ba83/61fe594f-5a62-4842-a554-d0b3fb8d18f1.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/3901104030024963/69ff26d808c1a6eaf90fddfa/e522c7fd-2c96-41f1-8be4-caad616079d5.mp4"], desc: "A creator they already follow" },
  { name: "Listicle", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1476002994213116/69ff106508c1a6eaf90f3300/4e5bea90-57b5-4f5b-a93e-da744be6b4a3.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1305415705012599/69fd39f19f9320f2b1a64814/faef2916-47d3-4863-acb7-351255c3d983.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2364370287380523/69fbbb209f9320f2b19b9397/259a487f-45ea-4bff-9a3b-795a5883573f.mp4"], desc: "Numbered, snappy, easy to follow" },
  { name: "Meme", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/959052956990072/69fcccee9f9320f2b1a0f75e/ce61819b-a7d2-4214-8d54-8480e0b1728d.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/811065625094650/69fcd1619f9320f2b1a13d70/cde46b82-9700-40a6-88ac-9c577c97bb40.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/997757716003514/69f9d1fe46012bac5d829c8f/234c06e7-e3c1-4c91-b3ee-bef1cbcbf9cb.mp4"], desc: "A current meme, used right" },
  { name: "Montage", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2432328390620599/69fccf999f9320f2b1a11ff8/d30bc866-1eaa-40c1-b0da-caa191045517.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1730214728417969/69fd5db69f9320f2b1a7b9e5/62bf0a45-9240-4345-a0ef-6c95b3c8ba93.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2384269982056400/69ff49fe08c1a6eaf910b52e/76e1dfb5-24b4-4447-b2d5-6bf429c00210.mp4"], desc: "Many shots, cut fast" },
  { name: "Pattern Interrupt", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/927361589680033/69fd2d6c9f9320f2b1a5c8e9/8eeb4b60-5f6a-422d-aa3c-057a6bc55795.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/943391541961169/69c9da581ae2df5b3c1d4ece/83975a22-cd48-4865-9f7a-240c01f9f188.mp4"], desc: "Opening with no obvious link to the product" },
  { name: "Podcast", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/959417213562148/69fefde208c1a6eaf90e49f1/83580862-f05d-44e3-9b00-6034c5a77c15.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/965264132870984/69fb42c846012bac5d86414a/5cecfe9d-ddc4-4845-bafd-ae60683f94ce.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1481211863454827/69ff091f08c1a6eaf90eccda/4bc0a557-d381-4246-99b2-6e200a92e457.mp4"], desc: "Two people, mics, jump cuts" },
  { name: "Postit", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1000779272689783/69fd6c8f9f9320f2b1a849b4/29a3d273-50a3-426f-912a-c00c96938f67.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1489969452634063/69fca8819f9320f2b1a03744/bf5f11b7-59d7-427b-8bb6-f7d47dbe894c.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1387971346683478/69f57e99280f6afea1724b5f/f89ad799-8234-4a73-b88c-bf8e4305f60c.mp4"], desc: "Sticky notes around the product" },
  { name: "POV", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/4495823210737103/69f6c3e9280f6afea17965c7/1d23f1a8-45fd-4148-b3e6-13a63d032b33.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1548131650071244/69ff1e0208c1a6eaf90f9b0f/30fab2d8-9f54-4b6c-ac77-6403e14650a1.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/936500102586285/69fefe4e08c1a6eaf90e4f0a/e8f57c1e-1bde-40b3-b337-ba01ff1c4f61.mp4"], desc: "Shot from the viewer's perspective" },
  { name: "Press", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1469376234882251/69f5010d280f6afea17040c2/2ab2047b-0bb7-4740-a1bf-0fd1bb49435d.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1684136069265999/69f8965f280f6afea17d8c9f/0a0edaa6-0ca2-443f-bc79-eb9577d54854.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1646661669994146/69eb5ebebdb47646c48f6a72/0f7667dd-ac6d-4945-a9de-6b2e3086cfcd.mp4"], desc: "Logos, headlines, article screenshots" },
  { name: "Problem Agitation", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1688175742215548/69ff9e8d08c1a6eaf9125217/2ed207c4-7158-4183-9feb-e20e9c970392.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/26596660979991001/69f73502280f6afea17a3b8e/d98b4d56-9d40-41fd-8656-4de517e4d673.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/960416513388202/69fff28808c1a6eaf913d723/1212902b-1609-4c85-b4f2-759c7b3c1677.mp4"], desc: "Show the problem at its worst" },
  { name: "Reaction Video", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/974355395134117/69f6e3b7280f6afea179d945/ec170f89-c1c7-443c-82a7-cc13188d726e.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1742924990390013/69fe00b79f9320f2b1ae6402/2fb109e5-8e50-4598-8e39-d6837c866308.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1020461623650546/69fcdb1c9f9320f2b1a1e061/05d0cade-e012-472b-8862-bae59563ae1c.mp4"], desc: "Someone reacting in real time" },
  { name: "Review", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1606867430374376/69fcd59d9f9320f2b1a16d2e/aaeb4d72-8ba8-446f-a367-32d1e59e658f.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1501829331481318/69fbac7e9f9320f2b19af494/68828e24-9308-40ec-854e-c139fb27dbb1.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2018948998701726/69fbdfa09f9320f2b19ce688/8a695602-c39a-476b-8242-8e85dc2e550c.mp4"], desc: "A real review, read or shown" },
  { name: "Screen Recording", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/4453521534925194/69ff0b8608c1a6eaf90f04b6/aaf49b82-5222-4c63-acae-532df016f1e8.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/997694569626846/69fe34979f9320f2b1b08662/5a533fb4-0f2a-49fd-a3f7-238857f40c77.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2260412234365744/69ff0e1708c1a6eaf90f2144/5495d1d1-17b5-43c0-bbee-70263c28214a.mp4"], desc: "Phone or computer screen, straight" },
  { name: "Skit", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2520628788391840/69f606ac280f6afea1756d19/fe4a15d7-10de-4efb-bf6c-fdd90f05c712.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2143063216491031/69fbebfc9f9320f2b19d5358/7eb107b7-f2d0-40e8-9e9b-e29f34906a0f.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1728432004991669/69f6e752280f6afea179e59a/3092237e-5be7-4a01-a68c-79821a2c985d.mp4"], desc: "A mini-story with characters" },
  { name: "Social Proof Mashup", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1300467098840754/69fefd8f08c1a6eaf90e42a7/1bc7ca5b-c848-434d-8692-7493f21edc5d.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/956235923838181/69ff059f08c1a6eaf90e92cf/44e240e2-3309-4cb5-a903-9e4e766355dc.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1285431753786403/69fcee2f9f9320f2b1a2e88e/47453679-7d67-46c1-b4a8-baee6b645e41.mp4"], desc: "Many pieces of proof, cut fast" },
  { name: "Stitch", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1000043605869180/69fd60729f9320f2b1a7d545/e502c7f2-69fd-435f-b971-36aea619bb91.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1519607686501738/69fcd1219f9320f2b1a13bb9/5774e20e-9dea-4add-891f-8c90af91e54d.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/26823698273921757/69f13119bdb47646c4a73e32/2fe5b0fc-f407-4bcb-8b4f-8b07fdaa9f11.mp4"], desc: "Start with their video, cut to your reply" },
  { name: "Stop Motion", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/4349911158630997/69fcedef9f9320f2b1a2e332/2ebdb7a9-4bf9-4fe2-ae94-337ec41a93e8.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1423374479473640/69fbb6f49f9320f2b19b68d2/37de6768-76ca-4d78-bd4b-b19fce0e0095.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1650928649474566/69fc7fd69f9320f2b19f937f/bd340113-eb0f-475f-9633-f023eaba4f98.mp4"], desc: "Frame-by-frame animation" },
  { name: "Street Interview", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/809167708625806/69fbede19f9320f2b19d71b6/db16375c-7ec8-4e80-9877-5a6100de5363.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1927975877695441/69fefcb308c1a6eaf90e3ab9/68149d35-ab97-4314-92bf-4ad2023ac372.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1494670028833663/69fcf9149f9320f2b1a37296/ce84b33c-606a-4ec2-b072-680b028db10c.mp4"], desc: "Man-on-the-street style" },
  { name: "Testimonial", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/26908390678850361/69fcce009f9320f2b1a10685/96730549-6725-460d-b231-6d9db46e7444.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/940276305299161/69ff219208c1a6eaf90fb78f/9d9bd3f8-2b81-4359-9215-d0405a95c011.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/27217375757847380/69ff11ea08c1a6eaf90f3e7f/bdcde3a4-91a2-4ef9-b3c8-55e3134185ae.mp4"], desc: "A real customer, on camera" },
  { name: "Time Lapse", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1599755551687991/69ffcf3508c1a6eaf91338f8/edf04e7e-643e-45f0-80b4-3abef613c224.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1510676210454575/69fce2079f9320f2b1a25394/b9e500aa-86b0-4124-9ed0-b6a19e301aff.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1703400574420222/6a00206008c1a6eaf914a259/cb9f11d9-3819-4bd8-9f9f-ac2b9730d98f.mp4"], desc: "Sped-up footage of a change" },
  { name: "Transformation", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1701051874670072/69ff213208c1a6eaf90fb4cc/9ffedfd1-3295-4f2e-81c9-3499b5ac5097.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1632738574650145/69fced589f9320f2b1a2dd85/75b3a305-7eac-4fac-aebc-20629a1d1433.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1355957369754679/69ff28eb08c1a6eaf90fe960/4de27a0e-e17b-4e5c-8d5d-d27797001b1a.mp4"], desc: "The change, in one tight cut" },
  { name: "Trend", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2187963178620533/69fa179746012bac5d838913/f541cffa-9511-4d82-b173-fa35dd8f6f02.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1261533739301837/69fcce9a9f9320f2b1a10f53/3ad28df3-65e2-4871-b117-e269f405a65b.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1716657453080499/69fccd439f9320f2b1a0fb63/6837715b-a50b-4d37-82da-6cac73fb08d0.mp4"], desc: "A current trend, used right" },
  { name: "Try-On", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1292449202287034/69fcd0859f9320f2b1a13384/6a080ae2-abb5-4d22-b42f-472dc320346b.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2031152041158093/69f9d83646012bac5d82b6d8/317c0d8d-a736-4a6c-8701-e68f53d4c11a.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1880827992620177/69e8ace0bdb47646c4818a06/5dd897d0-764f-4cc2-a905-e5094e646bdf.mp4"], desc: "Trying the product on, on camera" },
  { name: "Unboxing", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1495050481989422/69ff123e08c1a6eaf90f40c3/0da0dbd7-27f1-40bb-9cd1-433e11f3f150.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1978000789474308/69ff16a308c1a6eaf90f644d/c76712ed-4970-489e-be31-c77bdc446ebc.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/954058654260446/69fcd1229f9320f2b1a13c04/c200f9c7-de2a-4f7a-941b-d8b0165b5ec1.mp4"], desc: "Opening the box on camera" },
  { name: "Whiteboard Explainer", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/9385028881518631/67a39cd00a70ccc0c5991b54/f904cb0a-4e77-4ce9-ac79-2ec0c0a362b4.mp4"], desc: "A whiteboard, a marker, an explanation" },
  { name: "Yapper", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2439518439824234/69fd38c89f9320f2b1a63b96/821121ed-b5ce-431e-b130-03f447d14776.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/944329348441136/69ffcc0a08c1a6eaf9132aff/09a5f4c9-499c-45f3-80f3-715a0db635a5.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/977514721768530/69ff306e08c1a6eaf91018f3/d9e7c49c-a84f-4ef6-8671-7265a8465fc4.mp4"], desc: "Creator talking straight to camera" },
];

const FAN_LAYOUT = [
  { rotate: -8, x: "-22%", y: "4%",  z: 1 },
  { rotate:  0, x: "0",    y: "0",   z: 3 },
  { rotate:  8, x: "22%",  y: "4%",  z: 2 },
];

// ---------------------------------------------------------------------
// Webhook URLs
// ---------------------------------------------------------------------
// Email capture — same shared workflow the checklist + storyboard use.

// Brief generation — Softr workflow that runs Sonar (brand research) +
// Claude (brief sections) + Update Record. Webhook is fire-and-forget;
// the hero polls the briefs row by recordId until status = Generated.
// Workflow body: { recordId, source: "ai-brief-generator" }.

// Personal / throwaway email domains — blocked across every Brieflee
// lead-magnet form to keep lead quality high. Mirrors the Modash / Motion
// gating pattern. Keep this list in sync across all magnets.
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
// Brand + assets
// ---------------------------------------------------------------------
const NAVY = "#001364";
const PERIWINKLE = "#879CF7";
const LOGO_BASE = "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_";
const BRIEFLEE_EYES = `${LOGO_BASE}sticker-blue-cartoon-eyes-looking-side-navy_2026-03.png`;
const FILM_REEL = "https://res.cloudinary.com/dchroynzv/image/upload/v1778589398/brieflee_icon_brief-glass-3d-transparent_2026-05.png";
const TIKTOK_LOGO = `${LOGO_BASE}tiktok-logo-3d-transparent_2026-05.png`;
const INSTAGRAM_LOGO = `${LOGO_BASE}instagram-logo-3d-transparent_2026-05.png`;
const HERO_ASSET = {
  src: "https://res.cloudinary.com/dchroynzv/image/upload/v1779224877/brieflee_lead-magnet_brief-generator-folder-icon_2026-05.png",
  alt: "Brieflee AI brief generator folder icon",
};
const FLOATING_LOGOS = [
  { src: FILM_REEL,      alt: "Brief",     desktop: { top: "-10%", right: "-8%",  size: 110, rotate: 12  }, mobile: { top: "-5%",  right: "-4%",  size: 64, rotate: 12  }, delay: 0,   reverse: false, flipX: false },
  { src: TIKTOK_LOGO,    alt: "TikTok",    desktop: { top: "38%",  right: "-14%", size: 78,  rotate: 6   }, mobile: { top: "40%",  right: "-7%",  size: 46, rotate: 6   }, delay: 0.5, reverse: true,  flipX: true  },
  { src: FILM_REEL,      alt: "Brief",     desktop: { bottom: "-4%", right: "0%", size: 92,  rotate: -14 }, mobile: { bottom: "-2%", right: "0%", size: 54, rotate: -14 }, delay: 1.0, reverse: false, flipX: true  },
  { src: INSTAGRAM_LOGO, alt: "Instagram", desktop: { bottom: "12%", left: "-12%", size: 72, rotate: -8  }, mobile: { bottom: "8%",  left: "-5%", size: 42, rotate: -8  }, delay: 0.3, reverse: true,  flipX: false },
  { src: FILM_REEL,      alt: "Brief",     desktop: { top: "8%",    left: "-10%", size: 88, rotate: 18  }, mobile: { top: "4%",    left: "-5%", size: 52, rotate: 18  }, delay: 0.8, reverse: false, flipX: true  },
];

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------
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

function storyboardToMarkdown(rows) {
  if (typeof rows === "string" || rows == null) return rows || "";
  if (!Array.isArray(rows)) return "";
  const header = "| Shot | Section | Visual | Script |\n|---|---|---|---|";
  const escape = (v) => String(v ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
  const body = rows
    .map((r, i) => `| #${i + 1} | ${escape(r.section)} | ${escape(r.visual)} | "${escape(r.script)}" |`)
    .join("\n");
  return `${header}\n${body}`;
}

function briefToMarkdown(b, ctx) {
  const formatLine = ctx.formatName ? `**Format:** ${ctx.formatName}. ${ctx.formatDesc || ""}`.trim() : "";
  const angleLine = ctx.angleName ? `**Angle:** ${ctx.angleName}` : "";
  const sceneRows = Array.isArray(b.storyboard) && b.storyboard.length
    ? storyboardToMarkdown(b.storyboard) : "";
  const asText = (v) => (Array.isArray(v) ? v.map((s) => `- ${s}`).join("\n") : String(v || ""));
  const section = (title, body) => { const t = asText(body); return t ? [`## ${title}`, t, ""] : []; };
  const lines = [
    `# ${ctx.brandName} brief`,
    "",
    "Generated by Brieflee, the free AI brief generator",
    "",
    formatLine,
    angleLine,
    "",
    "---",
    "",
    ...section("About the brand", b.aboutBrand),
    ...section("About the product", b.aboutProduct),
    ...section("Who it's for", b.audience),
    ...section("The message", b.message),
    ...section("The offer", b.offerList),
    ...section("Personal experiences", b.personalList),
    ...section("Hook options", b.hook),
    ...section("Talking points", b.talkingPointsList),
    ...section("Call to action", b.ctaList),
    ...section("Scene by scene", sceneRows),
    ...section("Deliverables", b.deliverablesList),
    ...section("Thresholds", (b.thresholds || []).map((t) => `${t.label}: ${t.value}`)),
    ...section("Standards", b.standards),
    ...section("Do", b.dos),
    ...section("Don't", b.donts),
  ];
  return lines.filter((l) => l !== undefined).join("\n");
}

function briefToStyledHtml(b, ctx) {
  const css = `
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 760px; margin: 40px auto; padding: 0 24px; color: #1a1a1a; line-height: 1.6; }
    h1 { color: #001364; font-size: 32px; margin-bottom: 4px; }
    h2 { color: #001364; font-size: 22px; margin-top: 32px; padding-top: 20px; border-top: 2px solid #eee; }
    p { white-space: pre-wrap; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 14px; }
    th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #eee; vertical-align: top; }
    th { color: #001364; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; }
    td.section-cell { white-space: nowrap; }
    span.section-pill { display: inline-block; background: #879CF733; color: #001364; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
    .meta { color: #888; font-size: 14px; margin-bottom: 32px; }
    .tag { display: inline-block; background: #879CF714; color: #001364; padding: 4px 10px; border-radius: 999px; font-size: 13px; font-weight: 600; margin-right: 6px; }
  `;
  const safe = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const storyboardHtml = (() => {
    const sb = b.storyboard;
    if (Array.isArray(sb)) {
      const rows = sb.map((r, i) => `<tr>
  <td><strong style="color:#001364">#${i + 1}</strong></td>
  <td class="section-cell"><span class="section-pill">${safe(r.section)}</span></td>
  <td>${safe(r.visual)}</td>
  <td><em>"${safe(r.script)}"</em></td>
</tr>`).join("");
      return `<table><thead><tr><th>Shot</th><th>Section</th><th>Visual</th><th>Script</th></tr></thead><tbody>${rows}</tbody></table>`;
    }
    return `<p>${safe(sb)}</p>`;
  })();
  const tags = [
    ctx.formatName ? `<span class="tag">${safe(ctx.formatName)}</span>` : "",
    ctx.angleName ? `<span class="tag">${safe(ctx.angleName)}</span>` : "",
  ].join("");
  const part = (title, body) => {
    if (Array.isArray(body)) {
      return body.length
        ? `<h2>${title}</h2><ul>${body.map((l) => `<li>${safe(l)}</li>`).join("")}</ul>`
        : "";
    }
    return body ? `<h2>${title}</h2><p>${safe(body)}</p>` : "";
  };
  const scenesPart = Array.isArray(b.storyboard) && b.storyboard.length
    ? `<h2>Scene by scene</h2>${storyboardHtml}` : "";
  return `<!doctype html><html><head><meta charset="utf-8"><title>${safe(ctx.brandName)} brief</title><style>${css}</style></head><body>
<h1>${safe(ctx.brandName)} brief</h1>
<div class="meta">Generated by Brieflee, the free AI brief generator</div>
${tags ? `<div>${tags}</div>` : ""}
${part("About the brand", b.aboutBrand)}
${part("About the product", b.aboutProduct)}
${part("Who it's for", b.audience)}
${part("The message", b.message)}
${part("The offer", b.offerList)}
${part("Personal experiences", b.personalList)}
${part("Hook options", b.hook)}
${part("Talking points", b.talkingPointsList)}
${part("Call to action", b.ctaList)}
${scenesPart}
${part("Deliverables", b.deliverablesList)}
${part("Thresholds", (b.thresholds || []).map((t) => `${t.label}: ${t.value}`))}
${part("Standards", b.standards)}
${part("Do", b.dos)}
${part("Don't", b.donts)}
</body></html>`;
}


// ---------------------------------------------------------------------
// FloatingLogo — animated hero-side decoration
// ---------------------------------------------------------------------
function FloatingLogo({ logo, isDesktop }) {
  const dims = isDesktop ? logo.desktop : logo.mobile;
  return (
    <div
      className="absolute z-20"
      style={{
        top: dims.top ?? "auto",
        bottom: dims.bottom ?? "auto",
        left: dims.left ?? "auto",
        right: dims.right ?? "auto",
        width: dims.size,
        height: dims.size,
        transform: `rotate(${dims.rotate}deg)${logo.flipX ? " scaleX(-1)" : ""}`,
        animation: `briefleeHeroFloatY 7s ease-in-out ${logo.delay}s infinite ${logo.reverse ? "alternate-reverse" : "alternate"}`,
        filter: "drop-shadow(0 12px 24px rgba(99, 102, 241, 0.25))",
      }}
    >
      <img src={logo.src} alt={logo.alt} className="w-full h-full object-contain" draggable={false} />
    </div>
  );
}

// ---------------------------------------------------------------------
// StepIndicator (sits on top of the wizard card)
// ---------------------------------------------------------------------
function StepIndicator({ stage }) {
  const labels = ["Brief target", "Diagnose", "Format + Angle"];
  return (
    <div className="flex items-center gap-2 mb-5">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex-1">
          <div className={`h-1 rounded-full transition-all ${n <= stage ? "bg-primary" : "bg-muted"}`} />
          <div className="text-[10px] font-semibold uppercase tracking-wider mt-1.5 text-muted-foreground">
            {n}. {labels[n - 1]}
          </div>
        </div>
      ))}
    </div>
  );
}

function deriveLogoUrl(websiteUrl) {
  try {
    const u = new URL(/^https?:\/\//i.test(websiteUrl) ? websiteUrl : `https://${websiteUrl}`);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=128`;
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------
// parseGeneratedBrief — read the briefs row once the workflow finishes
// and build the 10-section object the bento renders. Claude returns 5 AI
// sections (audience/message/hook/script/storyboard) wrapped in ```json
// fences; the 5 deterministic sections (goal/brand/cta/thresholds/
// standards) are assembled here from form state + Sonar's brand_research.
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// The guidelines engine, lifted from the in-app brief builder so the two
// speak the same language. A creator never sees a threshold, an agent
// name or a percentage: they see one plain instruction, in the Do block
// or the Don't block. Brief writers speak in do's and don'ts, so those
// two blocks are the whole story.
// ---------------------------------------------------------------------
const AGENT_SENTENCES = {
  "Brand alignment": "Match the brand's voice, look and feel.",
  "Hook quality": "Make the first three seconds grab attention without sounding like an advert.",
  "Visual hook": "Open with a visual moment strong enough to stop the scroll.",
  "Watchable on mute": "Make sure the video still makes sense with the sound off.",
  "Scene pacing": "Keep the pace up so nobody scrolls past.",
  "Audio delivery": "Speak clearly and naturally.",
  "Audio clarity": "Record somewhere quiet with clean, clear sound.",
  "Music & sound balance": "Don't let the music drown out your voice.",
  "Pronunciation": "Say the brand and product names the right way.",
  "Lighting & camera": "Film somewhere bright, keep the camera steady and in focus.",
  "Setting & background": "Keep the background tidy and on-brand.",
  "Distracting elements": "Don't leave anything distracting in frame.",
  "Text legibility": "Make any on-screen text big and easy to read.",
  "Closed captions": "Add accurate captions.",
  "Safe zones": "Keep text and key moments away from the screen edges.",
  "Video length": "Keep to the video length set on this brief.",
  "Product visibility": "Keep the product clearly on screen throughout.",
  "Product usage": "Show yourself actually using the product.",
  "Creator visibility": "Be on camera yourself, not just the product.",
  "Energy & authenticity": "Keep it real and engaged, never flat or over-scripted.",
  "Wardrobe & appearance": "Dress the part for the brand.",
  "CTA present": "Include a clear ask to the viewer.",
  "Brand name mentioned": "Say the brand name out loud.",
  "Copyright check": "Don't use music, fonts or clips you don't have the rights to.",
  "Inspiration link match": "Stay close to the example videos on this brief.",
  "Follows the brief": "Stick to what this brief asks for.",
};
const AGENT_BLOCK = {
  "Distracting elements": "dont",
  "Copyright check": "dont",
  "Music & sound balance": "dont",
};
// Which format-row threshold sharpens which check.
const THRESHOLD_PAIR = {
  productVisibility:  "Product visibility",
  audioHookTiming:    "Hook quality",
  visualHook:         "Visual hook",
  ctaPlacement:       "CTA present",
  faceTime:           "Creator visibility",
  textLegibility:     "Text legibility",
  audioClarity:       "Audio clarity",
  engagementPacing:   "Scene pacing",
  brandMentionCount:  "Brand name mentioned",
};
function thresholdSentence(alias, label) {
  if (!label || /^none\b/i.test(label)) return "";
  const pct = parseInt(label, 10);
  if (alias === "productVisibility") {
    if (pct <= 50) return "Keep the product clearly on screen for at least half the video.";
    if (pct <= 80) return "Keep the product clearly on screen for most of the video.";
    return "Keep the product clearly on screen for nearly the whole video.";
  }
  if (alias === "faceTime") {
    if (pct <= 50) return "Be on camera yourself for at least half the video.";
    if (pct <= 80) return "Be on camera yourself for most of the video.";
    return "Be on camera yourself for nearly the whole video.";
  }
  if (alias === "audioHookTiming") return "Hook us with what you say in the first " + label + ".";
  if (alias === "engagementPacing") return "Change scene or angle at least " + label.toLowerCase() + ".";
  if (alias === "ctaPlacement") {
    if (/^first/i.test(label)) return "Get your call to action in within the " + label.toLowerCase() + ".";
    if (/^last/i.test(label)) return "End with a clear call to action in the " + label.toLowerCase() + ".";
    return "Weave the call to action through the video.";
  }
  if (alias === "brandMentionCount") {
    if (label === "0") return "";
    if (label === "1") return "Say the brand name at least once.";
    if (label === "2") return "Say the brand name at least twice.";
    return "Say the brand name at least " + label.replace("+", "") + " times.";
  }
  if (alias === "visualHook") return "Open with a visual moment strong enough to stop the scroll.";
  if (alias === "textLegibility") return "Make any on-screen text big and easy to read.";
  if (alias === "audioClarity") return "Record somewhere quiet with clean, clear sound.";
  return "";
}
// Five is the most anyone reads. The brand's own lines come first because
// they are the ones only this brief can say; the format's lines top the
// list up to a decent length and no further. When the format sets a lot of
// bars they stay in the Thresholds section rather than flooding the page:
// sixteen do's is not a brief, it is a wall.
const BLOCK_MAX = 5;
const BLOCK_MIN = 4;
const FOLD_LIMIT = 3;
function fillBlock(own, extra) {
  const out = (own || []).slice(0, BLOCK_MAX);
  const spare = (extra || []).filter((l) => l && !out.includes(l));
  // A short list of bars is worth repeating in the creator's language.
  // A long one is already a table further up the page.
  const target = spare.length <= FOLD_LIMIT ? BLOCK_MAX : BLOCK_MIN;
  for (const line of spare) {
    if (out.length >= target) break;
    out.push(line);
  }
  return out;
}

// Every ticked check on the format becomes one line, sharpened by its
// paired threshold where there is one.
function buildGuidelineBlocks(fields, labelOf) {
  const out = { do: [], dont: [] };
  const push = (blk, line) => { if (line && !out[blk].includes(line)) out[blk].push(line); };
  const checks = Array.isArray(fields.qaChecklist)
    ? fields.qaChecklist.map((c) => (c && (c.label || c)) || "").filter(Boolean)
    : [];
  checks.forEach((name) => {
    const alias = Object.keys(THRESHOLD_PAIR).find((k) => THRESHOLD_PAIR[k] === name);
    const line = (alias && thresholdSentence(alias, labelOf(fields[alias]))) || AGENT_SENTENCES[name] || "";
    push(AGENT_BLOCK[name] === "dont" ? "dont" : "do", line);
  });
  // Thresholds the format sets but no check names still matter to the
  // creator, so they land as their own line rather than going missing.
  Object.keys(THRESHOLD_PAIR).forEach((alias) => {
    if (checks.includes(THRESHOLD_PAIR[alias])) return;
    push("do", thresholdSentence(alias, labelOf(fields[alias])));
  });
  return out;
}

function safeParseJson(raw) {
  if (!raw) return null;
  const text = String(raw);
  const m = text.match(/\{[\s\S]*\}/);
  try { return JSON.parse(m ? m[0] : text); } catch (e) { /* fall through to repair */ }
  // A brief that stops mid-sentence is still worth reading, so close what
  // the writer left open rather than throwing the whole thing away.
  const start = text.indexOf("{");
  if (start < 0) return null;
  let body = text.slice(start);
  let inStr = false, esc = false;
  const stack = [];
  let lastSafe = -1;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (esc) { esc = false; continue; }
    if (c === "\\") { esc = true; continue; }
    if (c === '"') { inStr = !inStr; if (!inStr) lastSafe = i; continue; }
    if (inStr) continue;
    if (c === "{" || c === "[") stack.push(c === "{" ? "}" : "]");
    else if (c === "}" || c === "]") { stack.pop(); lastSafe = i; }
    else if (c === "," ) lastSafe = i - 1;
  }
  if (lastSafe < 0) return null;
  let repaired = body.slice(0, lastSafe + 1).replace(/,\s*$/, "");
  for (let i = stack.length - 1; i >= 0; i--) repaired += stack[i];
  try { return JSON.parse(repaired); } catch { return null; }
}

function parseGeneratedBrief(fields, ctx) {
  const ai = safeParseJson(fields.generatedBrief) || {};
  const brand = safeParseJson(fields.brandResearch) || {};

  // Brieflee voice rule: no em-dashes in customer copy. Strip from any
  // Sonar/Claude verbatim that leaks them through.
  const noEm = (s) =>
    String(s || "")
      .replace(/\s*—\s*/g, ", ")
      .replace(/\s*–\s*/g, ", ")
      .replace(/\s+/g, " ")
      .trim();

  const validSections = new Set(Object.keys(STORYBOARD_TAGS));
  const storyboard = Array.isArray(ai.storyboard)
    ? ai.storyboard.map((r) => ({
        section: validSections.has(r.section) ? r.section : "Hook",
        visual:  noEm(r.visual),
        script:  noEm(r.script),
      }))
    : [];

  const channelLabel   = ctx.channel?.label || "";
  const channelLow     = channelLabel.toLowerCase();
  const awarenessLow   = (ctx.awareness?.label || "").toLowerCase();
  const filmerLow      = (ctx.filmer?.label || "creator").toLowerCase();
  const formatName     = ctx.format?.name || "";
  const formatSlug     = formatName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const angleName      = ctx.angle?.name || "";

  // Hook — three options, each written as three parts that work together.
  const hookLine = (h, i) => {
    if (h && typeof h === "object") {
      const parts = [
        h.caption   ? `Caption: ${noEm(h.caption)}` : "",
        h.visual    ? `On screen: ${noEm(h.visual)}` : "",
        h.voiceover ? `Spoken: ${noEm(h.voiceover)}` : "",
      ].filter(Boolean);
      return `${i + 1}.\n${parts.join("\n")}`;
    }
    return `${i + 1}. ${noEm(h)}`;
  };
  const hookText = Array.isArray(ai.hook)
    ? ai.hook.map(hookLine).join("\n\n")
    : noEm(ai.hook);
  const offerList = Array.isArray(ai.offer)
    ? ai.offer.map((s) => noEm(s)).filter(Boolean)
    : [];
  const ctaList = Array.isArray(ai.cta)
    ? ai.cta.map((c) => noEm(c)).filter(Boolean)
    : String(ai.cta || "").split("\n").map((s) => noEm(s.replace(/^[-•]\s*/, ""))).filter(Boolean);
  const ctaText = ctaList.map((s) => `• ${s}`).join("\n");

  // Talking points and the scene by scene are the same slot filled two
  // ways, so only one of them is ever shown. Creator-led gets the points,
  // directional gets the scenes, and the scenes already carry the intent.
  const creatorLed = ctx.control === "creator-led" || storyboard.length === 0;
  const talkingPointsRaw = ai.talking_points || ai.talkingPoints;
  const talkingPointsList = !creatorLed
    ? []
    : Array.isArray(talkingPointsRaw)
      ? talkingPointsRaw.map((s) => noEm(s)).filter(Boolean)
      : String(talkingPointsRaw || "").split("\n").map((s) => noEm(s.replace(/^[-•]\s*/, ""))).filter(Boolean);
  const talkingPointsText = talkingPointsList.map((s) => `• ${s}`).join("\n");
  const scenes = creatorLed ? [] : storyboard;

  // Personal Experiences — Claude's personal_experiences bullet list, fallback to Sonar's audience quote
  const personalExperiencesRaw = ai.personal_experiences || ai.personalExperiences;
  const personalList = Array.isArray(personalExperiencesRaw)
    ? personalExperiencesRaw.map((s) => noEm(s)).filter(Boolean)
    : String(personalExperiencesRaw || brand.targetAudience || "")
        .split("\n").map((s) => noEm(s.replace(/^[-•]\s*/, ""))).filter(Boolean);
  const personalExperiencesText = personalList.map((s) => `• ${s}`).join("\n");

  // Do's / Don'ts — the writer's lines, then the format's, as one list
  // each. Kept as arrays so they render as real bullets.
  const asList = (raw) =>
    Array.isArray(raw)
      ? raw.map((s) => noEm(s)).filter(Boolean)
      : String(raw || "").split("\n").map((s) => noEm(s.replace(/^[-•]\s*/, ""))).filter(Boolean);
  const dosList   = asList(ai.dos || ai.do_s);
  const dontsList = asList(ai.donts || ai.dont_s);

  // Deliverables — channel-conditional template (no Claude call needed)
  const deliverablesList = channelLabel.toLowerCase() === "paid"
    ? ["3 HD video ads, 15-30 seconds each", "3 hook variants per ad, nine hooks in total",
       "Vertical 9:16, captions on", "No copyrighted music or watermarks",
       "Disclose the paid partnership in the caption (#ad)"]
    : channelLabel.toLowerCase() === "organic"
      ? ["1 video, 15-30 seconds", "3 hook variants you can pick from",
         "Match your usual posting style", "No copyrighted music"]
      : ["1 polished video, 15-30 seconds", "3 hook variants"];
  const deliverablesText = deliverablesList.map((s) => `• ${s}`).join("\n");

  // Format-driven sections (Thresholds, Standards, Examples) — read from the
  // briefs row's Format-lookup fields. These auto-populate from the linked
  // Format record via the 7dA0W relation; empty fallback if the Format
  // record itself doesn't have a value for that threshold.
  const labelOf = (val) => {
    if (!val) return "";
    if (Array.isArray(val)) return val.map((v) => (v && (v.label || v)) || "").filter(Boolean).join(", ");
    if (typeof val === "object") return val.label || "";
    return String(val);
  };
  // The same bars, said twice on purpose, because two people read this.
  // The brand sees the numbers, so they know exactly what gets measured.
  // The creator reads them as instructions, further down, in the Do and
  // Don't lists, because nobody briefs a creator in percentages.
  const guide = buildGuidelineBlocks(fields, labelOf);
  // Disclosure is the law, not a preference. It leads the Do list for an
  // affiliate, ahead of the writer's own lines, so the five-line cap can
  // never drop it.
  const isAffiliateBrief = String(ctx.filmer?.label || "") === "TikTok Shop Affiliate";
  const dosFinal = isAffiliateBrief
    ? ["Label it as an affiliate post and add #ad, on every single video."]
        .concat(dosList.filter((l) => !/#ad|affiliate label|disclos/i.test(l)))
    : dosList;
  const thresholdRows = [
    ["Face time",          labelOf(fields.faceTime),          "How much of the video the creator is on camera"],
    ["Product on screen",  labelOf(fields.productVisibility), "How much of the video the product is visible"],
    ["Visual hook",        labelOf(fields.visualHook),        "How strong the opening frame has to be"],
    ["Hook timing",        labelOf(fields.audioHookTiming),   "When the spoken hook has to land"],
    ["Scene pacing",       labelOf(fields.engagementPacing),  "How often the scene or angle changes"],
    ["CTA placement",      labelOf(fields.ctaPlacement),      "Where the ask sits in the video"],
    ["Brand mentions",     labelOf(fields.brandMentionCount), "How many times the brand is named out loud"],
    ["Audio clarity",      labelOf(fields.audioClarity),      "How clean the sound has to be"],
    ["Text legibility",    labelOf(fields.textLegibility),    "How readable on-screen text has to be"],
  ].filter(([, v]) => v).map(([label, value, what]) => ({ label, value, what }));

  const exampleUrlsRaw = fields.videoExamples || fields.sampleClips;
  const examplesUrls = Array.isArray(exampleUrlsRaw)
    ? exampleUrlsRaw.filter(Boolean).slice(0, 12)
    : [];
  const examplesText = examplesUrls.length === 0
    ? `(Reference videos for ${formatName} will appear once the Format record has them populated.)`
    : "";

  // The brand and the product are two different questions, so they get two
  // sections. A creator who only reads one of them still knows what to say.
  const aboutBrandText   = noEm(ai.brand || ai.about || brand.brandName || "");
  const aboutProductText = noEm(ai.product || brand.productDescription || "");
  const audienceText     = noEm(ai.audience || brand.targetAudience || "");
  const messageText      = noEm(ai.message || "");

  // Brief name comes from Claude (ai.brief_name). Fallback to a derived
  // label so something always renders on the result page header.
  const briefName = noEm(ai.brief_name || ai.name || "")
    || [brand.brandName, ctx.format?.name && `${ctx.format.name} brief`]
        .filter(Boolean)
        .join(" ")
    || "Creator brief";

  return {
    brandName: brand.brandName || "",
    briefName,
    logoUrl:      fields.logoUrl || "",
    productImage: fields.productImage || "",
    aboutBrand:          aboutBrandText,
    aboutProduct:        aboutProductText,
    audience:            audienceText,
    message:             messageText,
    personalExperiences: personalExperiencesText,
    personalList,
    hook:                hookText,
    // Structured too, so the page can lay each one out as a card while
    // the download keeps the plain version.
    hooks: Array.isArray(ai.hook)
      ? ai.hook.map((h) => (h && typeof h === "object"
          ? { caption: noEm(h.caption), visual: noEm(h.visual), voiceover: noEm(h.voiceover) }
          : { voiceover: noEm(h) }))
      : [],
    talkingPoints:       talkingPointsText,
    talkingPointsList,
    storyboard:          scenes,
    cta:                 ctaText,
    ctaList,
    offerList,
    deliverablesList,
    thresholds:          thresholdRows,
    dos:                 fillBlock(dosFinal, guide.do),
    donts:               fillBlock(dontsList, guide.dont),
    deliverables:        deliverablesText,
    examples:            examplesText,
    examplesUrls,
  };
}

// ---------------------------------------------------------------------
// OptionRow — multiple-choice button row (Stage 1)
// ---------------------------------------------------------------------
function OptionRow({ label, options, value, onChange }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value?.label === opt.label;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt)}
              className={`px-3.5 py-2 rounded-full border-2 text-sm font-semibold transition-colors ${
                selected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// FormatCard — fanned 3-clip stack, same as curated-formats.jsx
// ---------------------------------------------------------------------
function FormatCard({ format, selected, onSelect }) {
  const thumbs = (format.thumbs || []).slice(0, 3);
  return (
    <button
      type="button"
      onClick={() => onSelect(format)}
      className="text-left rounded-2xl transition-all outline-none hover:-translate-y-0.5"
    >
      <div className={`relative aspect-square rounded-2xl bg-muted/60 overflow-hidden transition-all ${selected ? "ring-2 ring-primary" : ""}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          {thumbs.length === 0 ? (
            <div className="text-xs text-muted-foreground">No clips yet</div>
          ) : (
            thumbs.map((url, i) => {
              const slot =
                thumbs.length === 1 ? FAN_LAYOUT[1] :
                thumbs.length === 2 ? [FAN_LAYOUT[0], FAN_LAYOUT[2]][i] :
                FAN_LAYOUT[i];
              return (
                <div
                  key={url}
                  className="absolute w-[58%] aspect-[4/5] rounded-xl overflow-hidden shadow-md border-2 border-card"
                  style={{
                    transform: `translate(${slot.x}, ${slot.y}) rotate(${slot.rotate}deg)`,
                    zIndex: slot.z,
                  }}
                >
                  <video src={url} muted playsInline preload="metadata" className="w-full h-full object-cover pointer-events-none" />
                </div>
              );
            })
          )}
        </div>
        {selected && (
          <div className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-md z-10" style={{ background: PERIWINKLE, color: NAVY }}>
            <Check className="w-4 h-4" strokeWidth={3} />
          </div>
        )}
      </div>
      <div className="mt-3 px-1">
        <div className="font-bold text-sm leading-snug truncate" style={{ color: NAVY }}>{format.name}</div>
        <div className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-snug">{format.desc}</div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------
// AngleCard — narrative-hook archetype (Stage 3)
// ---------------------------------------------------------------------
function AngleCard({ angle, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(angle)}
      className={`text-left p-4 rounded-xl border-2 transition-all w-full ${
        selected
          ? "bg-primary/5 border-primary ring-2 ring-primary/20"
          : "bg-card border-border hover:border-primary/40"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="font-bold text-foreground">{angle.name}</div>
        {selected && <Check className="w-4 h-4 text-primary shrink-0" />}
      </div>
      <div className="text-xs text-muted-foreground leading-relaxed">{angle.example}</div>
    </button>
  );
}

// ---------------------------------------------------------------------
// Tooltip — small (i) info chip next to a heading. Hover or tap reveals.
// ---------------------------------------------------------------------
function Tooltip({ text }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-label="More info"
        className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold shrink-0 cursor-help"
        style={{ background: "rgba(135,156,247,0.20)", color: NAVY }}
      >
        i
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-0 mb-2 w-60 p-2.5 rounded-lg text-xs leading-snug shadow-lg z-50"
          style={{ background: NAVY, color: "#fff" }}
        >
          {text}
        </span>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------
// BentoCard — single section card in the result-view bento grid
// ---------------------------------------------------------------------
function BentoCard({ icon, title, tooltip, wide, full, defaultOpen = true, copyText, children }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const spanClass = full ? "md:col-span-3" : wide ? "md:col-span-2" : "";
  return (
    <div
      className={`rounded-2xl p-5 md:p-6 ${spanClass}`}
      style={{ background: "rgba(135,156,247,0.08)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 mb-3 text-left group"
      >
        <img src={icon} alt="" className="w-10 h-10 shrink-0 object-contain" draggable={false} />
        <h3 className="flex-1 text-lg md:text-xl font-bold leading-none flex items-center" style={{ color: NAVY }}>
          {title}
          <Tooltip text={tooltip} />
        </h3>
        <span
          aria-hidden
          className="shrink-0 transition-transform"
          style={{ color: NAVY, transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
        >
          ▼
        </span>
      </button>
      {open && (
        <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
          {children}
          {copyText ? <CopyInlineButton text={copyText} /> : null}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// CopyInlineButton — small "Copy script" affordance inside a BentoCard.
// Used on the Script section so creators can copy the spoken lines in
// one tap without scrolling to the sticky action bar.
// ---------------------------------------------------------------------
function CopyInlineButton({ text }) {
  const [copied, setCopied] = useState(false);
  function handleCopy(e) {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="mt-4 inline-flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-semibold border transition-colors"
      style={{
        background: copied ? NAVY : "#ffffff",
        color: copied ? "#ffffff" : NAVY,
        borderColor: copied ? NAVY : "rgba(0,19,100,0.15)",
      }}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ---------------------------------------------------------------------
// StoryboardTagPill — single scene-section tag with hover tooltip
// ---------------------------------------------------------------------
function StoryboardTagPill({ tag }) {
  const [open, setOpen] = useState(false);
  const tip = STORYBOARD_TAGS[tag];
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap cursor-help"
        style={{ background: "rgba(135,156,247,0.20)", color: NAVY }}
      >
        {tag}
      </button>
      {tip && open && (
        <span
          role="tooltip"
          className="absolute top-full left-0 mt-1.5 w-56 p-2 rounded-lg text-xs leading-snug shadow-lg z-50"
          style={{ background: NAVY, color: "#fff" }}
        >
          {tip}
        </span>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------
// StoryboardTable — renders the shot-by-shot table. Falls back to plain
// text when storyboard is a legacy string (e.g. stub or old workflow).
// ---------------------------------------------------------------------
function StoryboardTable({ rows }) {
  if (!Array.isArray(rows)) {
    return <div className="text-sm whitespace-pre-wrap">{rows || ""}</div>;
  }
  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: NAVY }}>
            <th className="px-2 py-2 w-12">Shot</th>
            <th className="px-2 py-2 w-32">Section</th>
            <th className="px-2 py-2">Visual</th>
            <th className="px-2 py-2">Script</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="align-top border-t border-border/40">
              <td className="px-2 py-3 font-semibold" style={{ color: NAVY }}>#{i + 1}</td>
              <td className="px-2 py-3"><StoryboardTagPill tag={row.section || "Hook"} /></td>
              <td className="px-2 py-3">{row.visual}</td>
              <td className="px-2 py-3 italic">"{row.script}"</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


// =====================================================================
// MAIN BLOCK
// =====================================================================
export default function Block() {
  // Email gate state
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  // The brand mark on the finished brief. Derived here so the render never
  // depends on a value that only exists while a run is in flight.
  const logoUrl = deriveLogoUrl(website);
  // New: target the brief at a specific product / feature / brand-level only.
  // Drives Sonar's product-page focus and Claude's anchor priority.
  const [targetType, setTargetType] = useState("brand"); // "brand" | "product" | "feature"
  const [productUrl, setProductUrl] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [gateStatus, setGateStatus] = useState("idle"); // idle | submitting | sent
  // The read starts the moment the email lands, so it happens while they
  // answer the questions rather than making them wait for it afterwards.
  const [scrapeState, setScrapeState] = useState("idle"); // idle | reading | read | failed
  const [brandCard, setBrandCard] = useState(null);
  const scrapeRef = useRef(null);
  const [gateError, setGateError] = useState("");
  const isUnlocked = gateStatus === "sent";

  // Wizard state
  const [step, setStep] = useState(1); // 1, 2, "generating", "result", "error"
  const [filmer, setFilmer] = useState(null);
  const [channel, setChannel] = useState(null);
  const [awareness, setAwareness] = useState(null);
  const [format, setFormat] = useState(null);
  const [angle, setAngle] = useState(null);

  // Result state
  const [briefSections, setBriefSections] = useState(null);
  // Kept so the finished brief has an address that can be sent to a creator.
  const [briefRecordId, setBriefRecordId] = useState("");
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  // Locks the run so a double click cannot produce two briefs, two rows
  // or two events for the same submission.
  const [generating, setGenerating] = useState(false);

  // No polling any more: the block does the whole run itself, so the
  // brief exists the moment it is written.
  const createBrief = useRecordCreate({ fields: briefWrite, from: ds.briefs });
  const createEvent = useRecordCreate({ fields: eventWrite, from: ds.leadEvents });
  const proxyFirecrawl  = useProxyFetch(ds.firecrawl);
  const proxyOpenRouter = useProxyFetch(ds.openrouter);
  const proxyEmailit    = useProxyFetch(ds.emailit);
  // Thresholds + example clips for the chosen format, read from beta.
  const formatRows = useRecords({ select: formatRead, from: ds.formats, count: 60 });

  const topRef = useRef(null);

  // Keep the ad click id and UTMs for the demo chat on a later page.
  useEffect(() => { rememberAttribution(); }, []);

  // Scroll to top when entering generating/result.
  useEffect(() => {
    if (topRef.current && (step === "result" || step === "generating")) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [step]);


  // Step 1 = brief target. Always complete if target_type=brand; otherwise needs
  // the product URL or feature description.
  const step1Complete =
    targetType === "brand" ||
    (targetType === "product" && productUrl.trim().length > 0) ||
    (targetType === "feature" && featureDescription.trim().length > 0);
  // Step 2 = diagnose (filmer, channel, awareness).
  const step2Complete = filmer && channel && awareness;
  // Step 3 = format + angle.
  const step3Complete = !!format && !!angle;

  async function handleEmailSubmit() {
    if (!email.trim() || !website.trim()) {
      setGateError("Fill in both fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setGateError("Enter a valid work email.");
      return;
    }
    if (!isWorkEmail(email)) {
      setGateError("Use your company email instead. Personal @gmail.com, @yahoo.com, etc. aren't supported.");
      return;
    }
    setGateStatus("submitting");
    setGateError("");
    const websiteUrl = website.trim();

    // Lead capture happens here, in the block, so it costs no workflow
    // credit and it lands even for someone who never finishes a brief.
    // One event per unlock. Every brief they go on to build is joined to
    // this person by email, so nothing needs writing twice.
    const attribution = currentAttribution();
    const eventBody = {
      email: email.trim(),
      name: "",
      website: websiteUrl,
      source: OPT_SOURCE_BRIEF,
      channel: isPaidAttribution(attribution) ? OPT_CHANNEL_PAID : OPT_CHANNEL_MAGNET,
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
      landingPage: typeof window !== "undefined" ? window.location.pathname : "",
      submittedAt: new Date().toISOString(),
      payload: JSON.stringify({
        stage: "unlocked",
        utm_term: attribution.utmTerm,
        gclid: attribution.gclid,
        fbclid: attribution.fbclid,
        ttclid: attribution.ttclid,
        referrer: attribution.referrer,
        first_landing: attribution.firstLanding,
      }),
    };
    if (attribution.utmSource) eventBody.utmSource = attribution.utmSource;
    if (attribution.utmMedium) eventBody.utmMedium = attribution.utmMedium;
    if (attribution.utmCampaign) eventBody.utmCampaign = attribution.utmCampaign;
    if (attribution.utmContent) eventBody.utmContent = attribution.utmContent;
    createEvent.mutateAsync(eventBody).catch((e) => console.error("lead_event write failed (continuing):", e));
    trackMetaLead();

    // 409 means already subscribed, which is success.
    proxyEmailit(EMAILIT_SUBSCRIBE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        custom_fields: { tool_name: EMAILIT_TOOL_NAME, source: "ai-brief-generator", website: websiteUrl },
      }),
    }).then((r) => { if (!r.ok && r.status !== 409) console.error("EmailIt returned", r.status); })
      .catch((e) => console.error("EmailIt failed (continuing):", e));

    // Read the site now, while they answer the five questions. By the time
    // they press the button the page is already in hand, so the only wait
    // left is the writing itself.
    setScrapeState("reading");
    scrapeRef.current = readSite(websiteUrl)
      .then((res) => {
        if (!res.markdown) { setScrapeState("failed"); return res; }
        setBrandCard(readBrandCard(websiteUrl, res.markdown, res.meta));
        setScrapeState("read");
        return res;
      })
      .catch((e) => { console.error("Firecrawl failed:", e); setScrapeState("failed"); return { markdown: "", meta: {} }; });

    setGateStatus("sent");
  }

  // One read, one shape: the page as markdown plus whatever the share tags
  // gave us. Everything downstream reads from here.
  async function readSite(url) {
    if (!url) return { markdown: "", meta: {} };
    const res = await withTimeout(
      proxyFirecrawl(FIRECRAWL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
      }),
      30000,
      "read timed out"
    );
    if (!res.ok) { console.error("Firecrawl returned", res.status); return { markdown: "", meta: {} }; }
    const j = await res.json();
    return {
      markdown: String(j?.data?.markdown || j?.markdown || "").slice(0, 12000),
      meta: j?.data?.metadata || {},
    };
  }

  // ── The whole run, in the block ─────────────────────────────────
  // Scrape with Firecrawl, write with DeepSeek through OpenRouter, then
  // one brief row, one lead_event, one EmailIt join. No workflow, so no
  // workflow credit per use, and nothing to poll for.
  // Nothing waits forever. A visitor staring at a spinner is worse than a
  // visitor being told to press the button again.
  function withTimeout(p, ms, message) {
    let timer;
    return Promise.race([
      Promise.resolve(p).finally(() => clearTimeout(timer)),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(message)), ms); }),
    ]);
  }

  async function handleGenerate() {
    if (!step3Complete) return;
    if (generating) return;                       // one run per click
    setGenerating(true);
    setStep("generating");
    setError(null);

    const websiteUrl = website.trim();
    const logoUrl = deriveLogoUrl(websiteUrl);
    const clientUuid =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `brief-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    // The chosen format's row in beta formats: thresholds, checklist and
    // the example clips all come from here, so there is one place to edit.
    const fmtRow = (formatRows?.data?.pages?.flatMap((p) => p?.items ?? []) ?? []).find(
      (r) => String(r?.fields?.name || "").toLowerCase() === String(format?.name || "").toLowerCase()
    );
    const fmt = fmtRow?.fields || {};

    try {
      // 1. The site was read at the gate, so this usually resolves at once.
      const site = scrapeRef.current
        ? await scrapeRef.current
        : await readSite(websiteUrl).catch(() => ({ markdown: "", meta: {} }));
      const siteText = site.markdown || "";
      const card = brandCard || readBrandCard(websiteUrl, siteText, site.meta);
      const productPage = targetType === "product" && productUrl.trim()
        ? await readSite(productUrl.trim()).catch(() => ({ markdown: "", meta: {} }))
        : { markdown: "", meta: {} };
      const productText = productPage.markdown || "";
      // A product page's own share image beats the brand's homepage one.
      const productImage = String(productPage.meta?.ogImage || card.productImage || "");
      if (!siteText && !productText) {
        throw new Error("We couldn't read that website. Check the address and try again.");
      }

      // 2. Write the brief.
      // The brief is written at one control level, so nothing is said
      // twice. Creator-led gets talking points and no scenes. Directional
      // gets scenes that carry the intent, and no talking points.
      const control = CONTROL_LEVEL[filmer?.label] || "directional";
      const creatorLed = control === "creator-led";
      // An affiliate is paid on what they sell, so the offer is the engine
      // of the brief, not a footnote. It gets its own section and it is the
      // only creator type that asks for one.
      const isAffiliate = filmer?.label === "TikTok Shop Affiliate";
      const sys = [
        "You are a creative strategist writing a short form video brief that a " + (filmer?.label || "creator") + " will film from.",
        "Return ONLY JSON, no prose, no code fences.",
        "House voice: never use em dashes or en dashes. Say scenes, never beats. Plain spoken English, no marketing padding.",
        "Ground every line in the page you were given. Name the real product, the real ingredients or specs, the real price, the real claims and the real proof. Never invent a fact and never write a generic line that would fit any brand.",
        creatorLed
          ? "This creator works CREATOR LED. Give talking points, which are the things that must be said, in any order, in their own words. Return storyboard as an empty array."
          : "This creator works DIRECTIONAL. Give a scene by scene storyboard where each scene carries what is said and what is on screen. Return talking_points as an empty array, because the scenes already carry them.",
        "Each hook is three parts written together: the on screen caption, the visual action in the first second, and the spoken opening line. They complement each other, they never say the same thing.",
        "personal_experiences are prompts, questions the creator answers from their own life, not statements you have written for them. Ask for one oddly specific detail rather than a general feeling.",
        "A spoken line and its B roll never sit in the same scene.",
        "Every scene carries a section, chosen from this list and spelled exactly: " +
          Object.keys(STORYBOARD_TAGS).join(", ") + ". Only the first scene is Hook, and the last one is Call To Action or Outro.",
        'Shape: {"brandName":string,"brand":string,"product":string,"audience":string,"message":string,"offer":[string],"personal_experiences":[string],"hook":[{"caption":string,"visual":string,"voiceover":string}],"talking_points":[string],"cta":[string],"dos":[string],"donts":[string],"storyboard":[{"section":string,"visual":string,"script":string}]}',
        isAffiliate
          ? "offer: exactly four lines, because the offer is the engine of an affiliate brief. One, the base commission. Two, the tiered commission and what unlocks it. Three, the competition: the time boxed sprint, the GMV tiers and prizes, the leaderboard, and any volume bonus like a number of videos to qualify. Four, the affiliate link or code. Write each as a line the brand fills in, with the blank shown, never an invented number."
          : "offer: return an empty array.",
        isAffiliate
          ? "Open on friction, the thing that is annoying right now, because that is what converts for an affiliate audience. Name the product and its price out loud. The call to action is the link and the code, and every hook and talking point has to earn that click, because this creator is paid on what they sell."
          : "",
        isAffiliate
          ? "Two of the don'ts must be about disclosure and claims: the affiliate label and #ad go on every post, and no claim the brand has not made."
          : "",
        "brand: three or four sentences on who the brand is, what they sell, what they stand for and the proof they lean on.",
        "product: three or four sentences on this exact product. What it is, what it does, the ingredients or specs that matter, the price, and what customers say about it.",
        "audience: who this video is for, in their own terms.",
        "message: the single idea the video has to land, in one sentence.",
      ].join("\n");
      const user = [
        "Website content:\n" + siteText.slice(0, 3500),
        productText ? "Product page:\n" + productText.slice(0, 2500) : "",
        targetType === "feature" && featureDescription.trim() ? "Feature: " + featureDescription.trim() : "",
        "Who is filming: " + (filmer?.label || "") + ". " + (FILMER_GUIDANCE[filmer?.label] || ""),
        "Channel: " + (channel?.label || "") + ". " + (CHANNEL_GUIDANCE[channel?.label] || ""),
        "Awareness: " + (awareness?.label || "") + ". Hook tactics: " + (AWARENESS_HOOK_TACTICS[awareness?.label] || ""),
        "Format: " + (format?.name || "") + ". " + (FORMAT_GUIDANCE[format?.name || ""] || ""),
        angle?.name ? "Angle: " + angle.name + ". " + (angle.example || "") : "",
        "Exactly five do's and five don'ts, every one of them specific to this brand and this product. Never a generic filming tip like good lighting or clear audio, those are handled elsewhere.",
        "Three hook options. " + (creatorLed
          ? "Around six talking points, each one a thing that must be said."
          : "Six storyboard scenes, in order."),
      ].filter(Boolean).join("\n\n");

      const aiRes = await withTimeout(proxyOpenRouter(OPENROUTER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          temperature: 0.6,
          // The brief is long, and a truncated one comes back as broken
          // JSON, so there is headroom here on purpose.
          max_tokens: 5000,
          // Route to the fastest provider. The same model behind a slow
          // one turned a 17 second run into 46.
          provider: { sort: "throughput" },
          messages: [{ role: "system", content: sys }, { role: "user", content: user }],
        }),
      }), 75000, "That took longer than it should have. Press the button again and it will usually come straight back.");
      if (!aiRes.ok) {
        throw new Error("The writer is busy right now (" + aiRes.status + "). Try again in a moment.");
      }
      const aiJson = await aiRes.json();
      const raw = aiJson?.choices?.[0]?.message?.content || "";
      let ai = safeParseJson(raw);
      // One quiet retry. A model that returns prose once usually returns
      // JSON the second time, and a visitor should never see that.
      if (!ai || !(ai.brand || ai.product || ai.about)) {
        console.error("First pass came back unreadable, retrying once.");
        const retry = await withTimeout(proxyOpenRouter(OPENROUTER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: OPENROUTER_MODEL,
            temperature: 0.4,
            max_tokens: 5000,
            provider: { sort: "throughput" },
            messages: [{ role: "system", content: sys }, { role: "user", content: user }],
          }),
        }), 75000, "That took longer than it should have. Press the button again and it will usually come straight back.");
        if (retry.ok) {
          const rj = await retry.json();
          ai = safeParseJson(rj?.choices?.[0]?.message?.content || "") || ai;
        }
      }
      if (!ai || !(ai.brand || ai.product || ai.about)) {
        throw new Error("The brief came back in a shape we could not read. Try again.");
      }

      // 3. Build the shape the renderer already expects, with thresholds
      //    and clips read from beta formats.
      // Values go across raw. parseGeneratedBrief already flattens option
      // objects, and it needs the arrays intact to list example clips.
      const fieldsForRender = {
        clientUuid,
        generatedBrief: JSON.stringify(ai),
        brandResearch: JSON.stringify({
          brandName: ai.brandName || "",
          targetAudience: ai.audience || "",
          productDescription: ai.product || "",
        }),
        logoUrl,
        productImage,
        videoExamples:     fmt.videoExamples,
        sampleClips:       fmt.sampleClips,
        faceTime:          fmt.faceTime,
        audioClarity:      fmt.audioClarity,
        audioHookTiming:   fmt.audioHookTiming,
        brandMentionCount: fmt.brandMentionCount,
        ctaPlacement:      fmt.ctaPlacement,
        engagementPacing:  fmt.engagementPacing,
        productVisibility: fmt.productVisibility,
        textLegibility:    fmt.textLegibility,
        visualHook:        fmt.visualHook,
        qaChecklist:       fmt.qaChecklist,
        formatDescription: fmt.formatDescription,
        formatWhyItWorks:  fmt.formatWhyItWorks,
      };

      // 4. One complete row, written before the email so a send failure
      //    can never cost someone their brief.
      let recordId = "";
      try {
        const created = await createBrief.mutateAsync({
          clientUuid,
          email: email.trim(),
          websiteUrl,
          filmer: filmer && filmer.id ? { id: filmer.id, label: filmer.label } : null,
          channelType: channel ? { id: channel.id, label: channel.label } : null,
          awareness: awareness ? { id: awareness.id, label: awareness.label } : null,
          selectedAngle: angle?.name || "",
          generatedBrief: JSON.stringify({ ...ai, filmer: filmer?.label || "", format: format?.name || "" }),
          brandResearch: fieldsForRender.brandResearch,
          logoUrl,
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
          productUrl: targetType === "product" ? productUrl.trim() : "",
          featureDesc: targetType === "feature" ? featureDescription.trim() : "",
          status: OPT_STATUS_GENERATED,
        });
        recordId = created?.id || created?.recordId || "";
      } catch (e) { console.error("Brief row write failed (continuing):", e); }
      setBriefRecordId(recordId);

      // The brief is written, so the link in the email is guaranteed to
      // open something. Never blocks the render: a send failure costs an
      // email, not their brief.
      proxyEmailit(EMAILIT_SEND, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: CONFIRM_FROM,
          to: email.trim(),
          template: CONFIRM_TEMPLATE,
          variables: {
            record_url: briefRecordUrl(recordId),
            website: websiteUrl,
          },
        }),
      }).then((r) => { if (!r.ok) console.error("Confirmation send returned", r.status); })
        .catch((e) => console.error("Confirmation send failed (continuing):", e));

      // 5. Render. The lead and the audience join were both handled at the
      //    gate, so a second brief in the same session adds a brief row and
      //    nothing else.

      const ctx = { filmer, channel, awareness, format, angle, control };
      setBriefSections(parseGeneratedBrief(fieldsForRender, ctx));
      setStep("result");
    } catch (e) {
      console.error("=== brief generation failed:", e);
      setError(e?.message || "Something went wrong. Try again in a moment.");
      setStep("error");
    } finally {
      setGenerating(false);
    }
  }

  const websiteHost = (() => {
    try {
      const u = new URL(/^https?:\/\//i.test(website) ? website : `https://${website}`);
      return u.hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();
  const brandSlug = websiteHost.split(".")[0] || "brief";
  const brandLabel = brandSlug ? brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1) : "";

  const briefCtx = {
    brandName: brandLabel,
    formatName: format?.name || "",
    formatDesc: format?.desc || "",
    angleName: angle?.name || "",
  };

  function handleCopy() {
    if (!briefSections) return;
    navigator.clipboard.writeText(briefToMarkdown(briefSections, briefCtx));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadMarkdown() {
    if (!briefSections) return;
    downloadFile(`${brandSlug}-brief.md`, "text/markdown;charset=utf-8", briefToMarkdown(briefSections, briefCtx));
  }

  function handleDownloadHtml() {
    if (!briefSections) return;
    downloadFile(`${brandSlug}-brief.html`, "text/html;charset=utf-8", briefToStyledHtml(briefSections, briefCtx));
  }

  const angles = awareness ? (ANGLES_BY_AWARENESS[awareness.label] || []) : [];

  // ============================ RESULT VIEW ============================
  // ── The finished brief ───────────────────────────────────────────
  // One column, numbered sections, read top to bottom the way a creator
  // reads it. Same sections as before, laid out as a document rather
  // than a grid of cards.
  // ── The chat takes over once the email is in ────────────────────
  // The landing page is gone from here on. Lee asks, you tap, and the
  // finished brief lands in the thread.
  if (isUnlocked) {
    const bs = briefSections || {};
    // Five questions, so the chat can say how far along you are.
    const answered = [filmer, channel, awareness, angle, format].filter(Boolean).length;
    const shareUrl = briefRecordId
      ? `${window.location.origin}${window.location.pathname}?brief=${encodeURIComponent(briefRecordId)}`
      : "";
    const Section = ({ icon, title, children }) => (
      <section className="py-6 border-t border-border first:border-t-0 first:pt-1">
        <div className="flex items-center gap-2.5 mb-3">
          {icon ? <img src={icon} alt="" className="w-6 h-6 object-contain" draggable={false} /> : null}
          <h3 className="text-[15px] md:text-base font-bold" style={{ color: NAVY }}>{title}</h3>
        </div>
        <div className="text-[15px] leading-relaxed whitespace-pre-line" style={{ color: "#565d78" }}>
          {children}
        </div>
      </section>
    );

    const rows = [
      { icon: ICON_ABOUT,          title: "About the brand",   body: bs.aboutBrand },
      { icon: ICON_EXAMPLES,       title: "About the product", body: bs.aboutProduct },
      { icon: ICON_PERSONAL,       title: "Who it's for",      body: bs.audience },
      { icon: ICON_TALKING_POINTS, title: "The message",       body: bs.message },
      { icon: ICON_DELIVERABLES,   title: "The offer",         body: (bs.offerList || []).length ? "x" : "" },
      { icon: ICON_SCRIPT,         title: "Personal experiences", body: bs.personalExperiences },
      { icon: ICON_HOOK,           title: "Hook options",      body: bs.hook },
      { icon: ICON_TALKING_POINTS, title: "Talking points",    body: bs.talkingPoints },
      { icon: ICON_CTA,            title: "Call to action",    body: bs.cta },
    ].filter((r) => r.body);

    const tailRows = [
      { icon: ICON_DELIVERABLES, title: "Deliverables", body: bs.deliverables },
    ].filter((r) => r.body);

    // Do and Don't arrive as arrays, so they render as real bullets.
    // A long list flows into two columns so it sits level with a short one
    // beside it, rather than running twice its height.
    const Bullets = ({ items, color, flow }) => (
      <ul
        className={flow && (items || []).length > 7 ? "bgc-flow" : ""}
        style={{ margin: 0, paddingLeft: 18, listStyle: "disc" }}
      >
        {(items || []).map((line, i) => (
          <li key={i} style={{ marginBottom: 6, color: color || "#565d78", fontSize: 14, lineHeight: 1.55, breakInside: "avoid" }}>{line}</li>
        ))}
      </ul>
    );

    const DownloadBar = ({ top }) => (
      <div className="flex flex-wrap items-center gap-2" style={top ? { marginBottom: 4 } : { marginTop: 18 }}>
        <button className="bgc-btn ghost" onClick={handleCopy}>
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? "Copied" : "Copy brief"}
        </button>
        <button className="bgc-btn ghost" onClick={handleDownloadHtml}><FileText className="w-4 h-4" />HTML</button>
        <button className="bgc-btn" onClick={handleDownloadMarkdown}><Download className="w-4 h-4" />Download</button>
      </div>
    );

    const filmerLabel = filmer?.label || "";
    const angles = awareness ? (ANGLES_BY_AWARENESS[awareness.label] || []) : [];

    return (
      <div ref={topRef} className="bgc">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;500;600;700;800&display=swap');${CHAT_CSS}`}</style>
        <div className="bgc-wrap">
          <div className="bgc-top">
            <span className="av"><img src={LEE_AVATAR_URL} alt="" /><i /></span>
            <span><b>Lee</b><span>online</span></span>
            <span className="bgc-pct">{step === "result" ? "100%" : `${Math.round((answered / 5) * 100)}%`}</span>
          </div>

          <ChatMine>{website.trim().replace(/^https?:\/\//, "")}</ChatMine>

          {scrapeState !== "idle" && (
            <ChatLee>
              {scrapeState === "reading"
                ? `Reading ${brandCard ? brandCard.host : website.trim().replace(/^https?:\/\//, "")}. Give me a second.`
                : scrapeState === "read"
                  ? `Right, I've read ${brandCard ? brandCard.host : "it"}. Here's what I picked up.`
                  : "I couldn't read that one, so I'll work from your answers instead."}
            </ChatLee>
          )}

          {brandCard && scrapeState === "read" && (
            <ChatLee wide>
              <div className="bgc-brand">
                <img className="logo" src={brandCard.logoUrl} alt="" />
                <div style={{ minWidth: 0 }}>
                  <div className="nm">{brandCard.brandName}</div>
                  <div className="dom">{brandCard.host}</div>
                </div>
                <span className="bgc-read"><Check className="w-3 h-3" strokeWidth={3} />Read</span>
                {brandCard.pills.length > 0 && (
                  <div className="bgc-pills">
                    {brandCard.pills.map((p) => <span key={p} className="bgc-pill">{p}</span>)}
                  </div>
                )}
              </div>
            </ChatLee>
          )}

          <ChatLee>
            Who's filming this one?
            <ChatOpts options={FILMER_OPTIONS} value={filmerLabel}
              onPick={(o) => { setFilmer(o); setFormat(null); }} />
          </ChatLee>

          {filmer && (
            <ChatLee>
              Where is it going?
              <ChatOpts options={CHANNEL_OPTIONS} value={channel?.label} onPick={setChannel} />
            </ChatLee>
          )}

          {filmer && channel && (
            <ChatLee>
              How well do they know you already?
              <ChatOpts options={AWARENESS_OPTIONS} value={awareness?.label}
                onPick={(o) => { setAwareness(o); setAngle(null); }} />
            </ChatLee>
          )}

          {filmer && channel && awareness && angles.length > 0 && (
            <ChatLee>
              Which angle should it take?
              <ChatOpts options={angles} value={angle?.name} onPick={setAngle} />
              {angle?.example ? <p className="bgc-note">{angle.example}</p> : null}
            </ChatLee>
          )}

          {filmer && channel && awareness && angle && (
            <ChatLee wide>
              Last one. Pick the format and I'll build the brief around it.
              <ChatFormatPicker filmer={filmerLabel} picked={format} onPick={setFormat} />
              {step === 1 || step === 2 || step === "gate" || !step || step === "chat" ? null : null}
              {error && step === "error" ? <p className="bgc-err">{error}</p> : null}
              {step !== "generating" && step !== "result" && (
                <div style={{ marginTop: 16 }}>
                  <button className="bgc-btn" disabled={!format || generating} onClick={handleGenerate}>
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Build my brief
                  </button>
                </div>
              )}
            </ChatLee>
          )}

          {step === "generating" && (
            <ChatLee>
              <Loader2 className="w-4 h-4 animate-spin" style={{ display: "inline", marginRight: 8 }} />
              Reading the site and writing your brief. About a minute.
            </ChatLee>
          )}

          {step === "error" && (
            <ChatLee>
              {error || "Something went wrong."}
              <div style={{ marginTop: 12 }}>
                <button className="bgc-btn ghost" onClick={() => setStep(1)}>Try again</button>
              </div>
            </ChatLee>
          )}

          {step === "result" && briefSections && (
            <>
              <ChatLee>Here it is. I've written it the way a creator reads it, so you can send it as it is.</ChatLee>
              <div className="bgc-row">
                <img className="bgc-av" src={LEE_AVATAR_URL} alt="" />
                <div style={{ flex: 1, minWidth: 0 }}>
            {/* The brief itself */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div
                className="px-6 md:px-8 py-5 border-b border-border flex items-center gap-3"
                style={{ background: "linear-gradient(180deg, rgba(135,156,247,0.10), transparent)" }}
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt=""
                    className="w-11 h-11 shrink-0 rounded-lg object-contain bg-white p-1.5 border border-border/50"
                    draggable={false}
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg md:text-xl font-bold truncate" style={{ color: NAVY }}>
                    {briefSections.brandName || website.trim().replace(/^https?:\/\//, "")}
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Creator brief</p>
                </div>
              </div>

              <div className="px-6 md:px-8 pb-7 pt-1">
                <div className="flex flex-wrap gap-1.5 pt-5 pb-1">
                  {[filmer?.label, channel?.label, awareness?.label, format?.name, angle?.name]
                    .filter(Boolean)
                    .map((chip, i) => (
                      <span
                        key={chip}
                        className="inline-flex items-center h-7 px-3 rounded-full text-[11.5px] font-semibold"
                        style={
                          i === 0
                            ? { background: PERIWINKLE, color: "#fff" }
                            : { background: "rgba(135,156,247,0.14)", color: NAVY }
                        }
                      >
                        {chip}
                      </span>
                    ))}
                </div>

                <div className="pt-4 pb-1"><DownloadBar top /></div>

                {rows.map((r) => {
                  if (r.title === "Hook options" && Array.isArray(bs.hooks) && bs.hooks.length) {
                    return (
                      <Section key={r.title} icon={r.icon} title={r.title}>
                        <div className="grid gap-3 sm:grid-cols-3">
                          {bs.hooks.map((h, i) => (
                            <div key={i} className="rounded-xl border border-border p-4" style={{ background: "rgba(135,156,247,0.05)" }}>
                              <div className="text-[10.5px] font-extrabold uppercase tracking-widest mb-2.5" style={{ color: PERIWINKLE }}>
                                Hook {i + 1}
                              </div>
                              {[["Caption", h.caption], ["On screen", h.visual], ["Spoken", h.voiceover]]
                                .filter(([, v]) => v)
                                .map(([k, v]) => (
                                  <div key={k} className="mb-2 last:mb-0">
                                    <div className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "#aeb4c8" }}>{k}</div>
                                    <div className="text-[13.5px] leading-snug" style={{ color: "#565d78" }}>{v}</div>
                                  </div>
                                ))}
                            </div>
                          ))}
                        </div>
                      </Section>
                    );
                  }
                  if (r.title === "Talking points" && Array.isArray(bs.talkingPointsList) && bs.talkingPointsList.length) {
                    return <Section key={r.title} icon={r.icon} title={r.title}><Bullets items={bs.talkingPointsList} /></Section>;
                  }
                  if (r.title === "The offer" && Array.isArray(bs.offerList) && bs.offerList.length) {
                    return <Section key={r.title} icon={r.icon} title={r.title}><Bullets items={bs.offerList} /></Section>;
                  }
                  if (r.title === "Call to action" && Array.isArray(bs.ctaList) && bs.ctaList.length) {
                    return <Section key={r.title} icon={r.icon} title={r.title}><Bullets items={bs.ctaList} /></Section>;
                  }
                  if (r.title === "Personal experiences" && Array.isArray(bs.personalList) && bs.personalList.length) {
                    return <Section key={r.title} icon={r.icon} title={r.title}><Bullets items={bs.personalList} /></Section>;
                  }
                  if (r.title === "About the product" && bs.productImage) {
                    return (
                      <Section key={r.title} icon={r.icon} title={r.title}>
                        <img
                          className="bgc-prodimg"
                          src={bs.productImage}
                          alt=""
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                        {r.body}
                      </Section>
                    );
                  }
                  return <Section key={r.title} icon={r.icon} title={r.title}>{r.body}</Section>;
                })}

                {briefSections.storyboard && briefSections.storyboard.length > 0 && (
                  <section className="py-6 border-t border-border">
                    <div className="flex items-center gap-2.5 mb-3">
                      <img src={ICON_STORYBOARD} alt="" className="w-6 h-6 object-contain" draggable={false} />
                      <h3 className="text-[15px] md:text-base font-bold" style={{ color: NAVY }}>Scene by scene</h3>
                    </div>
                    <StoryboardTable rows={briefSections.storyboard} />
                  </section>
                )}

                {tailRows.map((r) => (
                  <Section key={r.title} icon={r.icon} title={r.title}>
                    {r.title === "Deliverables" && Array.isArray(bs.deliverablesList)
                      ? <Bullets items={bs.deliverablesList} />
                      : r.body}
                  </Section>
                ))}

                {Array.isArray(briefSections.thresholds) && briefSections.thresholds.length > 0 && (
                  <section className="py-6 border-t border-border">
                    <div className="flex items-center gap-2.5 mb-1">
                      <img src={ICON_THRESHOLDS} alt="" className="w-6 h-6 object-contain" draggable={false} />
                      <h3 className="text-[15px] md:text-base font-bold" style={{ color: NAVY }}>Thresholds</h3>
                    </div>
                    <p className="text-[13px] mb-3.5" style={{ color: "#838aa3" }}>
                      The bars every video is measured against. The creator never has to read them:
                      they are already written into the do's and don'ts below, in plain English.
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {briefSections.thresholds.map((t) => (
                        <div
                          key={t.label}
                          className="flex items-center gap-3 rounded-xl border border-border px-3.5 py-2.5"
                          style={{ background: "rgba(135,156,247,0.05)" }}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-[13px] font-bold" style={{ color: NAVY }}>{t.label}</div>
                            <div className="text-[11.5px] leading-snug" style={{ color: "#aeb4c8" }}>{t.what}</div>
                          </div>
                          <span
                            className="shrink-0 inline-flex items-center h-7 px-3 rounded-full text-[12.5px] font-bold"
                            style={{ background: PERIWINKLE, color: "#fff" }}
                          >
                            {t.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {(briefSections.dos || briefSections.donts) && (
                  <section className="py-6 border-t border-border">
                    <div className="flex items-center gap-2.5 mb-3">
                      <img src={ICON_DO} alt="" className="w-6 h-6 object-contain" draggable={false} />
                      <h3 className="text-[15px] md:text-base font-bold" style={{ color: NAVY }}>Do and don't</h3>
                    </div>
                    <div className="grid gap-3 items-start sm:grid-cols-2">
                      <div className="rounded-xl border p-4" style={{ borderColor: "rgba(45,170,99,0.22)", background: "rgba(45,170,99,0.07)" }}>
                        <h4 className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: "#2daa63" }}>Do</h4>
                        <Bullets items={briefSections.dos} />
                      </div>
                      <div className="rounded-xl border p-4" style={{ borderColor: "rgba(200,68,60,0.20)", background: "rgba(200,68,60,0.06)" }}>
                        <h4 className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: "#c8443c" }}>Don't</h4>
                        <Bullets items={briefSections.donts} />
                      </div>
                    </div>
                  </section>
                )}

                {briefSections.examplesUrls && briefSections.examplesUrls.length > 0 && (
                  <section className="py-6 border-t border-border">
                    <div className="flex items-center gap-2.5 mb-3">
                      <img src={ICON_EXAMPLES} alt="" className="w-6 h-6 object-contain" draggable={false} />
                      <h3 className="text-[15px] md:text-base font-bold" style={{ color: NAVY }}>Examples to watch first</h3>
                      {briefSections.examplesUrls.length > 5 ? (
                        <span className="ml-auto text-[11.5px]" style={{ color: "#aeb4c8" }}>Scroll for more</span>
                      ) : null}
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollSnapType: "x mandatory" }}>
                      {briefSections.examplesUrls.map((url, i) => (
                        <video
                          key={i}
                          src={url}
                          muted
                          loop
                          autoPlay
                          playsInline
                          preload="metadata"
                          className="rounded-xl border border-border bg-muted shrink-0"
                          style={{ width: 132, aspectRatio: "9/16", objectFit: "cover", scrollSnapAlign: "start" }}
                        />
                      ))}
                    </div>
                  </section>
                )}

                <div className="pt-5 border-t border-border"><DownloadBar /></div>
              </div>
            </div>
                </div>
              </div>
            {/* Take it with you */}
            <div className="sticky bottom-4 mt-6 bg-card border border-border rounded-2xl p-3 shadow-lg flex flex-wrap gap-2 items-center justify-end">
              {shareUrl ? (
                <>
                  <span className="mr-auto text-xs text-muted-foreground pl-1 hidden sm:block">
                    Send this link to your creator
                  </span>
                  <button
                    type="button"
                    onClick={() => { try { navigator.clipboard.writeText(shareUrl); } catch (e) { console.error(e); } }}
                    className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:border-primary/40 transition-colors"
                  >
                    <Copy className="w-4 h-4" /> Copy link
                  </button>
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:border-primary/40 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" /> Open in a new tab
                  </a>
                </>
              ) : null}
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:border-primary/40 transition-colors"
              >
                <Copy className="w-4 h-4" /> Copy brief
              </button>
              <button
                type="button"
                onClick={handleDownloadHtml}
                className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:border-primary/40 transition-colors"
              >
                <FileText className="w-4 h-4" /> HTML
              </button>
              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: PERIWINKLE }}
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ============================ HERO + WIZARD ============================
  return (
    <div ref={topRef} className="relative w-full overflow-hidden">
      <style>{`
        @keyframes briefleeHeroFloatY {
          0%   { transform: translateY(0) rotate(var(--rot, 0deg)); }
          100% { transform: translateY(-16px) rotate(var(--rot, 0deg)); }
        }
        @keyframes briefleeHeroChipFloat {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-6px); }
        }
        @keyframes briefleeHeroPulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/[0.04] to-primary/[0.10]" />
        <div className="absolute top-[-10%] right-[-10%] h-[420px] w-[420px] rounded-full bg-primary/25 blur-[120px]" />
        <div className="absolute bottom-[-15%] left-[-8%] h-[340px] w-[340px] rounded-full bg-primary/15 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "32px 32px" }} />
      </div>

      <div className="container py-14 md:py-20 lg:py-24">
        <div className="content max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">

            {/* ===================== Left: copy + gate / wizard ===================== */}
            <div className="space-y-6">
              <div
                className="inline-flex items-center"
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
                Free AI UGC Brief Generator
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05] text-foreground" style={{ color: NAVY }}>
                  UGC Influencer Content Brief Template Generator
                </h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed pt-2">
                  Stop writing video briefs from scratch. Answer a few short questions, get a complete brief built around your brand, your audience, the format, and the creator filming it.
                </p>
              </div>

              {/* ============ Email gate (when locked) ============ */}
              {!isUnlocked && (
                <div className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.35)]">
                  <div className="flex items-center gap-3 mb-5">
                    <img
                      src="https://res.cloudinary.com/dchroynzv/image/upload/v1778010104/brieflee_icon_padlock-sticker-blue-transparent_2026-05.png"
                      alt=""
                      className="w-10 h-10 shrink-0 object-contain"
                      draggable={false}
                    />
                    <div>
                      <h2 className="text-base font-bold text-foreground" style={{ color: NAVY }}>Unlock the brief generator</h2>
                      <p className="text-xs text-muted-foreground">Drop your email and brand website to get started.</p>
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
                    {gateError && <p className="text-sm text-destructive">{gateError}</p>}
                    <button
                      type="button"
                      onClick={handleEmailSubmit}
                      disabled={gateStatus === "submitting"}
                      className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                    >
                      {gateStatus === "submitting" ? "Unlocking…" : "Start building"}
                    </button>
                    <p className="text-xs text-muted-foreground text-center">
                      Free. One-click unsubscribe from the follow-up emails.
                    </p>
                  </div>
                </div>
              )}

              {/* ============ Stage 1: Brief target (product / feature / brand) ============ */}
              {isUnlocked && step === 1 && (
                <div className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.35)]">
                  <StepIndicator stage={1} />
                  <h2 className="text-lg font-bold text-foreground mb-1" style={{ color: NAVY }}>What's this brief promoting?</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Pick a specific product or feature and Sonar will read its page directly. Otherwise the brief stays brand-level.
                  </p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "brand",   label: "Just brand" },
                        { id: "product", label: "A product" },
                        { id: "feature", label: "A feature" },
                      ].map((opt) => {
                        const selected = targetType === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setTargetType(opt.id)}
                            className={`h-11 px-3 rounded-xl border-2 text-sm font-semibold transition-colors ${
                              selected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card text-foreground border-border hover:border-primary/40"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>

                    {targetType === "product" && (
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Product page link</label>
                        <input
                          type="text"
                          value={productUrl}
                          onChange={(e) => setProductUrl(e.target.value)}
                          placeholder="https://brand.com/products/..."
                          className="w-full h-11 px-3 rounded-xl border-2 border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                        <p className="text-xs text-muted-foreground mt-1.5">Sonar will read this page for product claims, features, and reviews.</p>
                      </div>
                    )}

                    {targetType === "feature" && (
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Describe the feature</label>
                        <textarea
                          value={featureDescription}
                          onChange={(e) => setFeatureDescription(e.target.value)}
                          placeholder="In 1-2 sentences: what does the feature do? Who's it for?"
                          rows={2}
                          className="w-full px-3 py-2.5 rounded-xl border-2 border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                        />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!step1Complete}
                    className="w-full h-12 mt-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 inline-flex items-center justify-center gap-2"
                  >
                    Next <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* ============ Stage 2: Diagnose ============ */}
              {isUnlocked && step === 2 && (
                <div className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.35)]">
                  <StepIndicator stage={2} />
                  <h2 className="text-lg font-bold text-foreground mb-4" style={{ color: NAVY }}>Who's filming and where will it run?</h2>
                  <div className="space-y-5">
                    <OptionRow label="Who's filming?" options={FILMER_OPTIONS} value={filmer} onChange={setFilmer} />
                    <OptionRow label="Channel?" options={CHANNEL_OPTIONS} value={channel} onChange={setChannel} />
                    <OptionRow label="Audience awareness?" options={AWARENESS_OPTIONS} value={awareness} onChange={setAwareness} />
                  </div>
                  <div className="flex gap-2 mt-6">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center justify-center w-12 h-12 rounded-xl border-2 border-border bg-card text-foreground hover:border-primary/40 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={!step2Complete}
                      className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 inline-flex items-center justify-center gap-2"
                    >
                      Next <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* ============ Stage 3: Format + Angle ============ */}
              {isUnlocked && step === 3 && (
                <div className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.35)]">
                  <StepIndicator stage={3} />

                  <div className="flex items-baseline justify-between mb-1">
                    <h2 className="text-lg font-bold text-foreground" style={{ color: NAVY }}>Pick your format.</h2>
                    {format && <span className="text-xs font-semibold text-primary">{format.name}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    The kind of video the creator is filming. Drives the thresholds and storyboard.
                  </p>
                  <div
                    className="max-h-[440px] overflow-y-auto pr-1 mb-6 rounded-xl border border-border bg-muted/30 p-3"
                    style={{ scrollbarWidth: "thin" }}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {FORMATS.map((f) => (
                        <FormatCard
                          key={f.name}
                          format={f}
                          selected={format?.name === f.name}
                          onSelect={setFormat}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between mb-1">
                    <h2 className="text-lg font-bold text-foreground" style={{ color: NAVY }}>Pick your angle.</h2>
                    {angle && <span className="text-xs font-semibold text-primary">{angle.name}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    These tend to land for a <span className="font-semibold">{awareness?.label?.toLowerCase()}</span> audience. Drives the hook and message.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    {angles.map((a) => (
                      <AngleCard key={a.id} angle={a} selected={angle?.id === a.id} onSelect={setAngle} />
                    ))}
                  </div>

                  <div className="flex gap-2 mt-6">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center justify-center w-12 h-12 rounded-xl border-2 border-border bg-card text-foreground hover:border-primary/40 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={!step3Complete}
                      className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 inline-flex items-center justify-center gap-2"
                    >
                      Generate my brief <Sparkles className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* ============ Generating ============ */}
              {step === "generating" && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <p className="text-base font-semibold text-foreground">Writing your brief</p>
                  </div>
                  <ul className="space-y-2.5 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Locking in goal + brand + audience</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Building the hook for the chosen angle</li>
                    <li className="flex items-center gap-2 opacity-70"><Loader2 className="h-4 w-4 animate-spin" />Drafting script, CTA, and standards</li>
                  </ul>
                </div>
              )}

              {/* ============ Error ============ */}
              {step === "error" && (
                <div className="rounded-2xl border border-destructive bg-destructive/10 p-6">
                  <h2 className="text-lg font-bold text-foreground mb-2">Something broke.</h2>
                  <p className="text-sm text-muted-foreground mb-4">{error || "Unknown error."}</p>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-4 h-10 rounded-xl border-2 border-border bg-card text-foreground text-sm font-semibold hover:border-primary/40 transition-colors"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Trust strip */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary" style={{ animation: "briefleeHeroPulseDot 1.4s ease-in-out infinite" }} />
                  Free forever
                </span>
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> Under 2 minutes</span>
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> Download</span>
              </div>
            </div>

            {/* ===================== Right: hero asset + floating logos ===================== */}
            <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[360px] md:max-w-[420px] lg:max-w-[480px] aspect-square mt-6 lg:mt-0">
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-[80px] -z-10" aria-hidden="true" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-[6px] border-card shadow-[0_30px_80px_-25px_hsl(var(--primary)/0.55)] bg-card">
                <img src={HERO_ASSET.src} alt={HERO_ASSET.alt} className="w-full h-full object-cover" draggable={false} />
              </div>
              <div className="hidden md:block">
                {FLOATING_LOGOS.map((logo, i) => (<FloatingLogo key={`d-${i}`} logo={logo} isDesktop />))}
              </div>
              <div className="md:hidden">
                {FLOATING_LOGOS.map((logo, i) => (<FloatingLogo key={`m-${i}`} logo={logo} isDesktop={false} />))}
              </div>
              <div
                className="absolute top-[8%] left-[55%] z-30 flex items-center gap-2 rounded-full bg-card border border-border shadow-md px-3 py-1.5 text-xs font-semibold"
                style={{ animation: "briefleeHeroChipFloat 6s ease-in-out 0.4s infinite alternate" }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Brief generated live
              </div>
              <div
                className="absolute bottom-[8%] right-[58%] z-30 flex items-center gap-2 rounded-2xl bg-card border border-border shadow-lg px-4 py-2.5"
                style={{ animation: "briefleeHeroChipFloat 6s ease-in-out 1.0s infinite alternate-reverse" }}
              >
                <div className="text-2xl font-bold text-primary leading-none">10</div>
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Brief sections</div>
                  <div className="text-xs text-foreground font-medium">Hook to standards</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ How it works ============ */}
      <div className="container py-14 md:py-20 border-t border-border">
        <div className="content max-w-6xl mx-auto">
          <h2 className="text-center text-3xl md:text-4xl font-bold tracking-tight leading-[1.1] mb-12" style={{ color: NAVY }}>
            How it works
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {[
              { n: "1", title: "Drop your website", body: "Paste your brand URL. Brieflee reads the site and pulls live brand context, claims, audience and tone, no typing required." },
              { n: "2", title: "Diagnose the video", body: "Who's filming, where it's running, and how aware the audience is. Three taps, no typing." },
              { n: "3", title: "Pick format + angle", body: "Choose a format from 42 archetypes and an angle that fits your audience's awareness stage." },
              { n: "4", title: "Get your brief", body: "10 sections covering goal, audience, message, hook, script, CTA, thresholds, storyboard, and standards. Ready to send to the creator filming." },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4">{s.n}</div>
                <h3 className="text-base font-bold text-foreground mb-2" style={{ color: NAVY }}>{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ What makes a good UGC brief ============ */}
      <div className="container py-14 md:py-20 border-t border-border">
        <div className="content max-w-4xl mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.1] mb-3" style={{ color: NAVY }}>
              What makes a good creative brief
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Seven things every brief for short-form video should answer before you hand it to a creator.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: "https://res.cloudinary.com/dchroynzv/image/upload/v1777998700/brieflee_icon_hundred-points-100-emoji-transparent_2026-05.png", title: "Brand context in the brand's voice", body: "What they sell, in their own words. Pulled from their website so the creator sounds like the brand, not like marketing-speak.", example: "\"Sustainable running shorts made from recycled ocean plastic\" — verbatim, not paraphrased." },
              { icon: "https://res.cloudinary.com/dchroynzv/image/upload/v1777998690/brieflee_help-icon_faq-big-cartoon-eyes-curious-looking-transparent_2026-05.png", title: "Personal experiences the creator can borrow", body: "Relatable scenarios written in the buyer's voice — moments the creator can name in their own life to make the ad land.", example: "\"I'm a heavy coffee drinker and my teeth started to look yellow on camera, so I wanted something quick at home.\"" },
              { icon: "https://res.cloudinary.com/dchroynzv/image/upload/v1777998712/brieflee_icon_trendy-flat-fire-sticker-transparent_2026-05.png", title: "Three hook options", body: "Different opening tactics that match the angle. The creator picks the one that feels natural. \"Scroll-stopping\" is not a hook.", example: "1. Confession. 2. Direct question. 3. Pattern interrupt. All hit in 3 seconds." },
              { icon: "https://res.cloudinary.com/dchroynzv/image/upload/v1777998710/brieflee_icon_smartphone-in-tripod-flat-illustration-transparent_2026-05.png", title: "Talking points, not scripts", body: "Bullet points the creator says in their own words. Word-for-word scripts make creators sound stiff and read like ads.", example: "\"Easy to use\", not \"Loop Athletics introduces the next generation of...\"" },
              { icon: "https://res.cloudinary.com/dchroynzv/image/upload/v1777998703/brieflee_icon_movie-clapper-illustration-transparent_2026-05.png", title: "Shot-by-shot storyboard", body: "Every shot tagged by scene type (Hook → Problem → Demo → CTA) so the creator knows what each beat is for, not just what to film.", example: "Shot 3 — [Demonstration] — Hand holding product over kitchen counter — \"Two minutes to make.\"" },
              { icon: "https://res.cloudinary.com/dchroynzv/image/upload/v1777998700/brieflee_icon_lined-bold-blocky-checklist-sticker-transparent_2026-05.png", title: "Format-specific thresholds", body: "The bars the video has to hit for the format you picked. Face Time, Product Visibility, CTA Placement — different KPIs per format.", example: "Yapper: Face Time 80%. Demo: Product Visibility 90%. Different formats, different rules." },
              { icon: "https://res.cloudinary.com/dchroynzv/image/upload/v1777998712/brieflee_icon_trendy-flat-cursor-sticker-transparent_2026-05.png", title: "Three CTA options", body: "Multiple ways to close the video so the creator picks the one that fits their voice. \"Shop now\" is not a CTA.", example: "1. \"Code FRIENDS at checkout.\" 2. \"Link in bio, tap it.\" 3. \"Try it today, see the result yourself.\"" },
            ].map((p) => (
              <div key={p.title} className="bg-card border border-border rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <div className="flex items-center gap-4 md:flex-1 md:min-w-0">
                  <img src={p.icon} alt="" className="w-12 h-12 shrink-0 object-contain" draggable={false} />
                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground text-base" style={{ color: NAVY }}>{p.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{p.body}</p>
                  </div>
                </div>
                <div className="md:w-72 md:shrink-0 md:border-l md:border-border md:pl-6 text-sm text-muted-foreground italic leading-relaxed">
                  {p.example}
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
            background: radial-gradient(ellipse at center,
              rgba(135,156,247,0.30) 0%,
              rgba(135,156,247,0.12) 35%,
              rgba(135,156,247,0) 70%);
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
            Want every video checked against your brief?
          </h2>

          <p className="mt-5 text-base md:text-lg leading-relaxed max-w-xl mx-auto font-medium" style={{ color: NAVY, opacity: 0.7 }}>
            Brieflee runs your brief against every UGC submission. Pass/fail in seconds with timestamps for what to fix.
          </p>

          <div className="mt-9 md:mt-10 flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <a
              href="/book-call"
              onClick={(e) => {
                if (typeof window !== "undefined" && typeof window.openSwModal === "function") {
                  e.preventDefault();
                  window.openSwModal("/book-call", "md");
                }
              }}
              className="bl-cta-primary"
            >
              Book a demo
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

// =====================================================================
// AI WORKFLOW PROMPT TEMPLATE
// =====================================================================
// Paste the below into the Softr workflow's HTTP Request action body
// (POST https://openrouter.ai/api/v1/chat/completions). Replace the
// {{...}} placeholders with workflow variables for the wizard inputs.
//
// Headers:
//   Authorization: Bearer {{OPENROUTER_API_KEY}}
//   Content-Type: application/json
//
// Body:
// {
//   "model": "meta-llama/llama-3.3-70b-instruct:free",
//   "messages": [
//     {
//       "role": "system",
//       "content": "You write short-form video briefs across all UGC categories: UGC (creator-made), IGC (influencer), EGC (employee-generated — staff-led, BTS, workplace-authentic, NOT polished), founder-led, and customer-generated. The filmer field tells you which category — write the brief in that category's convention. EGC briefs use workplace settings, real employees, behind-the-scenes framing; influencer briefs are more polished; customer briefs use raw testimonial energy. You write in the audience's own voice, never in marketing-speak. Output strict JSON only with keys: audience, message, hook, script. No prose outside the JSON."
//     },
//     {
//       "role": "user",
//       "content": "Brand: {{brandName}}\nProduct: {{productDescription}}\nBuyer: {{buyer}}\nFilmer: {{filmer}}\nChannel: {{channelType}}\nAwareness: {{awareness}}\nFormat: {{formatName}} ({{formatDesc}})\nAngle: {{selectedAngle}}\n\nGenerate the four AI sections:\n- audience: 80-120 words in the buyer's voice, naming the specific frustration this product solves.\n- message: the one thing every viewer should walk away believing, built from the angle.\n- hook: three opening lines (numbered 1-3) hitting in the first 3 seconds. Tailored to the format — yapper hooks are spoken; demo hooks are visual; etc.\n- script: 5-8 talking points the filmer can riff on, structured for the chosen format. Include the product-on-screen moment and the brand-name moment."
//     }
//   ],
//   "response_format": { "type": "json_object" },
//   "temperature": 0.8
// }
//
// The workflow merges these 4 AI sections with the 6 formula sections
// (goal, brand, cta, thresholds, storyboard, standards) and returns the
// combined 10-section JSON to this block.