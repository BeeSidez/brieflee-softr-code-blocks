import { useState, useRef, useEffect, useCallback } from "react";
import { datasource, useRecordCreate, q } from "@/lib/datasource";
import { toast } from "sonner";

/* ------------------------------------------------------------------ *
 * Book A Demo Chat — brieflee.co/book-a-demo
 *
 * Anonymous visitors cannot update records in Softr (verified: an
 * anonymous useRecordUpdate reports enabled:false on this very page),
 * so the flow is CREATE-ONLY:
 *   - one lead_event as soon as Q1 validates  → catches drop-offs
 *   - one sales_pipeline row at the outcome   → all eleven answers
 * Nothing is written twice.
 * ------------------------------------------------------------------ */

const ds = datasource.define({
  pipeline: "6170548f-955f-405e-b86d-d236de99d2ed",
  leadEvents: "cadd708d-2da8-4e22-b92f-cbb88635f148",
});

const pipelineFields = q.select({
  name: "RbQ6L",
  email: "ZwKcm",
  phone: "7xzeo",
  website: "3Fqfo",
  productUrl: "avY1t",
  businessModel: "TgI3c",
  makesContentForOthers: "05NWG",
  videosPerMonth: "2MnO2",
  whoFilms: "ieqNx",
  whoFilmsDetail: "1Uaac",
  revenueBand: "Wnljs",
  adSpendBand: "AN0Zx",
  decisionMakers: "4gvzX",
  timeline: "Dtszy",
  offBriefToday: "HJTGL",
  route: "oXCLD",
  stage: "WS67r",
  entryPoint: "Qp7lM",
  lastStepReached: "M9Ohl",
  createdAt: "DFH9L",
});

const eventFields = q.select({
  email: "KfXCh",
  source: "0tbOR",
  channel: "Stu4F",
  name: "wNiuC",
  website: "MSNYn",
  pageUrl: "5GODb",
  landingPage: "CO6OA",
  utmSource: "enDXw",
  utmMedium: "DSAXX",
  utmCampaign: "o6blp",
  utmContent: "mDzib",
  payload: "hvB7E",
  submittedAt: "8ZeJj",
});

const SOURCE_BOOK_A_DEMO = "5af79932-3bf0-4191-81cf-8b4b192253b6";
/* The A/B against /book-call's plain form. Same questions, same routing;
   entry_point is the only thing that separates the two populations. */
const ENTRY_CHAT = "0810ae41-c563-4f9d-9889-d2a334f96e64";
const CHANNEL_PAID = "c82e4b4d-d516-46d0-9925-b05f6687964c";
const CHANNEL_DIRECT = "193ebada-395c-431a-938f-1826e38f9bf3";

const STAGE = {
  Lead: "48088bca-c275-4946-a527-a72ae60fb32d",
  Qualified: "f47893dc-ceee-47f4-bd34-cf05ec24f729",
  Nurture: "4a7713d9-761f-46a9-a882-a11c81a9eb92",
};

const ROUTE_ID = {
  A: "8de7ce20-eb33-4c7a-ab6e-a89de3d9e9c3",
  B: "ca3e7b56-79a5-4b07-97f9-a60d3c0fa319",
  C: "0fd1b480-e696-4e5e-95f9-b1f2bdeb3184",
  D: "2f2d9f40-0121-455a-bbb8-a696698ade62",
};

const ROUTE_STAGE = { A: STAGE.Qualified, B: STAGE.Qualified, C: STAGE.Qualified, D: STAGE.Nurture };

/* Answer label → SELECT option id, per question. The visitor-facing
   wording and the CRM's choice labels differ in a few places, so the
   ids are the contract, never the text. */
const OPTION_ID = {
  model: {
    "Content or UGC creator": "3b5ee15d-f4db-45b2-a821-bd33d8b2d3aa",
    Agency: "f5fa0a20-4da9-4b11-8d82-f331c2bdb4cc",
    "Info, training or consulting": "1762ec28-d3f2-45c5-9866-d3cf7f2248f2",
    "E-commerce": "f0ba51d6-fc8f-45be-bd33-c7fcda4a1c03",
    "SaaS B2B": "23d41704-a317-410e-ae66-fb7211830718",
    "SaaS B2C": "e2034ffa-4a04-4d0e-8e49-8db4fb8ac88e",
    Mixed: "dcbf67da-998c-4525-8231-6b3236022f57",
  },
  clients: {
    "Other brands": "61492f81-2d31-47be-ac6a-0e1e18295360",
    "Only my own": "dc4eaf6e-f95f-46ec-a325-b3dcc76d00b7",
    Both: "dd0789d0-5468-4584-a75c-90176022c889",
  },
  volume: {
    "Under 30": "2136df4b-3c27-4325-b92c-9397b7b73942",
    "30 to 100": "cb58e9f5-8b57-40e1-b2d2-0732a9c72f56",
    "100 to 750": "85c79381-b949-4a18-9bbf-e2558353b357",
    "750 to 2,000": "8a48cc92-9fa7-41a2-8991-024c79c5e3c9",
    "More than 2,000": "e80c2f2b-d3e3-43f6-a13f-5354d01454fb",
  },
  films: {
    "Affiliates who find you": "a89f5020-9ea8-4dc2-82c4-ccef92b731be",
    "Creators you brief": "f9aad79c-68d8-4c79-8f5d-dd8acb27c9c2",
    "Your own team": "1f0b54ef-f4c3-446a-8f77-e4c894bb9a97",
    "A mix": "9c23dbb5-7e48-4f22-b1a4-8865ad1dc9a2",
  },
  revenue: {
    "Under $5k": "4a61717d-b6b9-48bb-a69c-7f40abb8a253",
    "$5k to $25k": "c4e949d9-4c5d-413c-aefb-a2b4d189225b",
    "$25k to $100k": "8ce5ba56-6120-4d66-ba98-15c692e7de81",
    "$100k to $500k": "4b2d6dc1-8074-4b59-963a-a92b6a52becc",
    "More than $500k": "d1cd31e4-84d0-4406-85bf-7b9e82b06b71",
  },
  spend: {
    "Nothing yet": "65918fd5-1137-4c85-a7e1-6df38efd43ad",
    "Under $2k": "3fae433e-8392-416a-b169-46765d768f87",
    "$2k to $10k": "20660564-c9cb-4464-b616-0944156c5224",
    "$10k to $50k": "9376f003-aed9-4cdd-8436-1675eaa217e3",
    "More than $50k": "ed9c5985-49cf-4e87-8cb0-e89fc1abde69",
  },
  authority: {
    "Just me": "6652a3a2-9a4d-4dbc-86bf-b4754ab7516f",
    "Me and one other": "fc2f37e4-0836-42af-9f3a-9c9aaeb4f173",
    "A team or client signs off": "a20f6cf2-1679-4cc1-8c4e-5d5ef702e362",
  },
  timeline: {
    "Starting today": "5f7c7e55-d590-439c-9e26-fbec95304e94",
    "Within 30 days": "76874104-38c7-498c-bf7f-c14638627850",
    "30 days or more": "b4716fd3-83a0-4377-b96b-f68767baeb76",
    "Next quarter or later": "14df1451-bbec-42e8-87e2-37c9bd85c63d",
  },
};

/* "Who films them?" is the /claim form's version: seven creator types,
   multi-select. The CRM keeps both. who_films_detail stores everything
   they picked; who_films keeps the single four-way value, because the
   routing below and the `qualified` formula on the table both read it. */
const FILMS_OPTIONS = [
  "TikTok Affiliates",
  "Affiliates (Other)",
  "UGC Creators",
  "Influencer",
  "Customers",
  "Employees",
  "Content creators",
];

const FILMS_DETAIL_ID = {
  "TikTok Affiliates": "20bf5cb7-22bb-4a53-a9b2-418628b8f42f",
  "Affiliates (Other)": "82bd2e99-4763-4e34-9f18-3631b3de289a",
  "UGC Creators": "b2d00abb-0cba-44f9-b8b5-3dea9e273b61",
  Influencer: "fbee947d-0283-4cc3-a4e5-117611d1d710",
  Customers: "87e16b15-30a5-4ac5-b566-0f6e89df6d67",
  Employees: "3ced454e-84d2-41e2-806b-ab8c1876a7e4",
  "Content creators": "f9fa1fea-4104-43ed-ae81-922db8dacd15",
};

/* Which bucket each of the seven falls into. Pick from more than one
   bucket and it resolves to "A mix". */
const FILMS_BUCKET = {
  "TikTok Affiliates": "Affiliates who find you",
  "Affiliates (Other)": "Affiliates who find you",
  "UGC Creators": "Creators you brief",
  Influencer: "Creators you brief",
  Customers: "Creators you brief",
  "Content creators": "Creators you brief",
  Employees: "Your own team",
};

function filmsBucket(picked) {
  const list = Array.isArray(picked) ? picked : [];
  const buckets = [];
  list.forEach((p) => {
    const b = FILMS_BUCKET[p];
    if (b && buckets.indexOf(b) < 0) buckets.push(b);
  });
  if (!buckets.length) return "";
  return buckets.length > 1 ? "A mix" : buckets[0];
}

const AVATAR =
  "https://res.cloudinary.com/dchroynzv/image/upload/v1778675610/_Profile_Picture_nwejiq.png";
// ONE call for everyone, 30 minutes. There used to be two booking types here,
// a 30-minute demo and a 45-minute enterprise call, and the qualifier decided
// which one you were offered (or, on route D, whether you were offered one at
// all). The qualifier still runs and still routes the lead in the CRM, so lead
// quality is recorded exactly as before — it just no longer decides who is
// allowed to book.
//
// The 30 minutes is a property of this booking type in TidyCal, not of this
// code. If that booking is still set to 30 minutes, people get 30.
const TIDYCAL_CALL = "https://tidycal.com/bevbanahene/brieflee-demo";
const BRIEF_GENERATOR = "https://www.brieflee.co/free-tool-ai-brief-generator";

const EASE = "cubic-bezier(0.32,0.72,0,1)";

const CSS = `
@keyframes blBounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-7px); } }
@keyframes blPresence { 0%, 100% { box-shadow: 0 0 0 0 rgba(65,211,62,0.45); } 55% { box-shadow: 0 0 0 5px rgba(65,211,62,0); } }
@keyframes blSlideIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes blSlideInRight { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: none; } }
@keyframes blPop { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: none; } }
.bl-wrap input::placeholder, .bl-wrap textarea::placeholder { color: #AEB4C8; }
.bl-wrap input:focus, .bl-wrap textarea:focus { outline: none; border-color: #7A93FF; box-shadow: 0 0 0 4px rgba(135,156,247,0.18); }
.bl-primary { transition: background 200ms ${EASE}; }
.bl-primary:hover { background: #294FF6 !important; text-decoration: none; }
.bl-ghost { transition: color 200ms ease, border-color 200ms ease; }
.bl-ghost:hover { color: #000F4D; border-color: #7A93FF; }
.bl-pill { transition: all 180ms ${EASE}; }
.bl-pill:hover { border-color: #7A93FF; }
.bl-teaser { transition: background 180ms ease; }
.bl-teaser:hover { background: rgba(122,147,255,0.14); }
.bl-restart:hover { color: #000F4D; }
.bl-mail { color: #294FF6; text-decoration: none; }
.bl-mail:hover { color: #4466F8; text-decoration: underline; }
.bl-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
@media (max-width: 420px) { .bl-gutter { margin-left: 0 !important; } }
.bl-cal { margin: 4px -24px 0; border-top: 1px solid #E6EAF7; animation: blSlideIn 420ms ${EASE} both; }
.bl-cal-frame { display: block; width: 100%; border: 0; height: 740px; background: transparent; }
.bl-cal-note { margin: 0; padding: 10px 24px 0; font-size: 11.5px; color: #838AA3; line-height: 1.5; text-align: center; }
@media (max-width: 640px) { .bl-cal-frame { height: 960px; } }
`;

/* ------------------------------------------------------------------ */

function hostOf(raw) {
  const s = String(raw || "").trim().toLowerCase();
  if (!s) return "";
  const host = s.replace(/^[a-z][a-z0-9+.-]*:\/\//, "").replace(/^www\./, "").split(/[/?#]/)[0];
  return host && host.includes(".") ? host : "";
}

function buildQuestions(brand) {
  const them = brand || "the business";
  return [
    {
      id: "contact",
      kind: "fields",
      text: "First, who am I meeting?",
      fields: [
        { key: "name", label: "Full name", ph: "Your name", type: "text" },
        { key: "email", label: "Work email", ph: "you@yourbrand.com", type: "email" },
      ],
    },
    {
      id: "urls",
      kind: "fields",
      text: "What's your website, and one product page I should look at?",
      hint: "I build a brief on it before we speak, so the demo is your brand, not a sample account.",
      fields: [
        { key: "website", label: "Website", ph: "yourbrand.com", type: "text" },
        { key: "product", label: "One product or feature URL", ph: "yourbrand.com/products/…", type: "text" },
      ],
    },
    {
      id: "model",
      kind: "options",
      text: "Which of these is closest to your business?",
      options: [
        "Content or UGC creator",
        "Agency",
        "Info, training or consulting",
        "E-commerce",
        "SaaS B2B",
        "SaaS B2C",
        "Mixed",
      ],
    },
    {
      id: "clients",
      kind: "options",
      text: "Do you make content for other brands, or only your own?",
      options: ["Other brands", "Only my own", "Both"],
    },
    {
      id: "volume",
      kind: "options",
      text: brand
        ? `How many creator videos a month will you be reviewing for ${brand}?`
        : "How many creator videos a month will you be reviewing?",
      options: ["Under 30", "30 to 100", "100 to 750", "750 to 2,000", "More than 2,000"],
    },
    {
      id: "films",
      kind: "multi",
      text: "Who films them?",
      hint: "Tap every one you work with.",
      options: FILMS_OPTIONS,
    },
    {
      id: "revenue",
      kind: "options",
      text: `Roughly what does ${them} turn over a month?`,
      hint: "Ballpark is fine. It tells me which plan is honest to show you.",
      options: ["Under $5k", "$5k to $25k", "$25k to $100k", "$100k to $500k", "More than $500k"],
    },
    {
      id: "spend",
      kind: "options",
      text: brand ? `And what does ${brand} spend on ads in a month?` : "And what goes out on ads in a month?",
      options: ["Nothing yet", "Under $2k", "$2k to $10k", "$10k to $50k", "More than $50k"],
    },
    {
      id: "authority",
      kind: "options",
      text: "Who else is involved in this decision?",
      options: ["Just me", "Me and one other", "A team or client signs off"],
    },
    {
      id: "timeline",
      kind: "options",
      text: "When will you be briefing creators?",
      options: ["Starting today", "Within 30 days", "30 days or more", "Next quarter or later"],
    },
    {
      id: "offbrief",
      kind: "text",
      text: "Last one. What happens today when a creator video comes back off-brief?",
      hint: "Tap the closest one and edit it, or write your own. This is the part I'll prep hardest on.",
      optional: true,
      chips: [
        "We re-shoot it",
        "We let it run anyway",
        "We fix it in the edit",
        "We send notes and hope",
        "Something else",
      ],
    },
  ];
}

/* ── Validation ────────────────────────────────────────────────────
   The old gate was `name.length > 1` plus /.+@.+\..+/, which let
   "jgjjgjkjhjjglj" and "vhjk@ihilhih.com" straight through.

   Two layers. A synchronous one for shape and keyboard mash, and a DNS
   lookup that asks whether the domain actually exists. Google's DoH
   endpoint sends CORS headers, so the browser can ask directly and no
   server is involved.

   Deliberately NOT gating on work email. Booking a demo is high intent
   and a founder on a Gmail address is a real buyer, so blocking free
   domains here would cost more meetings than it saves. That is the
   opposite trade from the lead-magnet forms, where it earns its keep. */

function looksLikeMash(raw) {
  const t = String(raw || "").toLowerCase().replace(/[^a-z]/g, "");
  if (t.length < 2) return true;
  if (!/[aeiouy]/.test(t)) return true;                 // no vowel at all
  if (/(.)\1{3,}/.test(t)) return true;                  // aaaa
  if (/[bcdfghjklmnpqrstvwxz]{6,}/.test(t)) return true; // consonant run
  const vowels = (t.match(/[aeiouy]/g) || []).length;
  const ratio = vowels / t.length;
  return ratio < 0.1 || ratio > 0.9;
}

const EMAIL_SHAPE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

function nameProblem(raw) {
  const v = String(raw || "").trim();
  if (v.length < 2) return "Add your name.";
  if (!/[a-z]/i.test(v)) return "Add your name.";
  if (looksLikeMash(v)) return "That does not look like a name.";
  return "";
}

function emailProblem(raw) {
  const v = String(raw || "").trim();
  if (!v) return "Add your email.";
  if (!EMAIL_SHAPE.test(v)) return "That email address is not valid.";
  const at = v.lastIndexOf("@");
  if (looksLikeMash(v.slice(0, at))) return "That email does not look real.";
  if (looksLikeMash(v.slice(at + 1).split(".")[0])) return "That email does not look real.";
  return "";
}

function hostOfInput(raw) {
  let v = String(raw || "").trim();
  if (!v) return "";
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) v = "https://" + v;
  try {
    return new URL(v).hostname.replace(/^www\./i, "").toLowerCase();
  } catch (e) {
    return "";
  }
}

function siteProblem(raw) {
  const v = String(raw || "").trim();
  if (!v) return "Add your website.";
  const host = hostOfInput(v);
  if (!host || host.indexOf(".") === -1) return "Enter a full web address, like yourbrand.com.";
  const parts = host.split(".");
  if (!/^[a-z]{2,}$/.test(parts[parts.length - 1])) return "Enter a full web address, like yourbrand.com.";
  if (looksLikeMash(parts[0])) return "That does not look like a real website.";
  return "";
}

/* False ONLY on a definitive NXDOMAIN. Any failure of the lookup itself
   passes, so nobody is ever blocked because a DNS query timed out. */
function domainIsReal(host) {
  if (!host) return Promise.resolve(true);
  return fetch("https://dns.google/resolve?name=" + encodeURIComponent(host) + "&type=A")
    .then((r) => (r.ok ? r.json() : null))
    .then((j) => !j || j.Status !== 3)
    .catch(() => true);
}

const VOLUME = ["Under 30", "30 to 100", "100 to 750", "750 to 2,000", "More than 2,000"];
const REVENUE = ["Under $5k", "$5k to $25k", "$25k to $100k", "$100k to $500k", "More than $500k"];
const SPEND = ["Nothing yet", "Under $2k", "$2k to $10k", "$10k to $50k", "More than $50k"];
const TIMELINE = ["Starting today", "Within 30 days", "30 days or more", "Next quarter or later"];

function routeFor(a) {
  const vol = VOLUME.indexOf(a.volume);
  const rev = REVENUE.indexOf(a.revenue);
  const spend = SPEND.indexOf(a.spend);
  const time = TIMELINE.indexOf(a.timeline);
  const agencyWide = a.model === "Agency" && (a.clients === "Other brands" || a.clients === "Both");

  if (vol === 4 || (agencyWide && vol >= 3)) return "B";
  const need = vol >= 1 && filmsBucket(a.films) !== "Your own team";
  const budget = rev >= 1 || spend >= 2;
  const authority = a.authority === "Just me" || a.authority === "Me and one other";
  const timeline = time === 0 || time === 1;
  if (need && budget && authority && timeline) return "A";
  if (time === 3 || (rev <= 0 && spend <= 0)) return "D";
  return "C";
}

/* ------------------------------------------------------------------ */

function Avatar() {
  return (
    <span style={{ position: "relative", flexShrink: 0, display: "block", width: 44, height: 44 }}>
      <img
        src={AVATAR}
        alt="Bev"
        style={{
          width: 44,
          height: 44,
          borderRadius: 999,
          display: "block",
          objectFit: "cover",
          border: "2px solid #fff",
          boxShadow: "0 2px 8px rgba(0,19,100,0.10)",
        }}
      />
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          right: 0,
          bottom: 1,
          width: 11,
          height: 11,
          borderRadius: 999,
          background: "#41D33E",
          border: "2px solid #fff",
          animation: "blPresence 2.6s ease-in-out infinite",
        }}
      />
    </span>
  );
}

const bubbleStyle = {
  background: "#fff",
  border: "1px solid rgba(214,222,252,0.9)",
  borderRadius: 18,
  borderTopLeftRadius: 6,
  boxShadow: "0 1px 3px rgba(0,19,100,0.05)",
};

function Dots() {
  return (
    <div
      aria-hidden="true"
      style={{
        ...bubbleStyle,
        padding: "15px 20px",
        display: "flex",
        gap: 6,
        alignItems: "center",
        animation: `blSlideIn 300ms ${EASE} both`,
      }}
    >
      {[0, 0.2, 0.4].map((d) => (
        <span
          key={d}
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: "#7A93FF",
            animation: `blBounce 1.4s ${d}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function BevSays({ children, marginTop = 0 }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <Avatar />
      <div style={{ ...bubbleStyle, padding: "16px 18px", maxWidth: 500, marginTop }}>{children}</div>
    </div>
  );
}

function Tick() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#41D33E"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: 3 }}
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const cardStyle = {
  background: "#fff",
  border: "1px solid #D6DEFC",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 4px 14px -2px rgba(41,79,246,0.10)",
};

const eyebrowStyle = {
  fontSize: 11.5,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  fontWeight: 700,
  color: "#879CF7",
};

const headingStyle = {
  margin: "8px 0 4px",
  fontSize: 26,
  lineHeight: 1.15,
  fontWeight: 800,
  letterSpacing: "-0.02em",
  color: "#001364",
};

const ctaStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  fontSize: 13,
  fontWeight: 600,
  color: "#fff",
  background: "#7A93FF",
  borderRadius: 10,
  padding: "15px 28px",
  textDecoration: "none",
  boxShadow: "0 4px 14px -2px rgba(135,156,247,0.5)",
};

const bodyCopy = { margin: 0, fontSize: 13, lineHeight: 1.55, color: "#000F4D", fontWeight: 400 };
const subCopy = { fontSize: 13, lineHeight: 1.55, color: "#565D78" };

const TIDYCAL_ORIGIN = "https://tidycal.com";

// Meta pixel. Two standard events so an ad campaign can optimise on the
// real outcome: Lead once the chat has a name and an email, Schedule when
// TidyCal reports a completed booking. Never throws; without the pixel on
// the page nothing is sent and the chat carries on.
function trackMeta(eventName, params) {
  try {
    if (typeof window === "undefined" || typeof window.fbq !== "function") return;
    const eventID = `bd-${String(eventName).toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    window.fbq("track", eventName, params || {}, { eventID });
  } catch (e) { /* tracking never blocks the chat */ }
}

// Attribution hand-off. The lead magnet pages store the ad click id and
// UTMs in localStorage for 7 days (Meta's click attribution window) under
// this key. When this page's own URL carries nothing, the stored record is
// the attribution, so a demo booked two pages after the ad click is still
// a paid lead in the CRM.
const ATTRIBUTION_KEY = "bl_attribution";
const ATTRIBUTION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
function recallAttribution() {
  try {
    const raw = localStorage.getItem(ATTRIBUTION_KEY);
    if (!raw) return null;
    const a = JSON.parse(raw);
    if (!a || !a.ts || Date.now() - a.ts > ATTRIBUTION_TTL_MS) return null;
    return a;
  } catch (e) { return null; }
}

/* The calendar, in place of the old new-tab hand-off.

   TidyCal sends no X-Frame-Options and no CSP, and switches itself into a
   compact layout when it sees window.self !== window.top, so a plain iframe
   is all this needs. A hand-rolled frame is used rather than their embed.js
   because that script sets scrolling="no" and leans on iframe-resizer: if the
   height handshake ever fails the calendar clips with no way to scroll. Here
   it just scrolls inside the frame instead.

   On a completed booking TidyCal posts {event:"bookingComplete"} to
   window.top, NOT window.parent. When these pages are opened through a Softr
   modal the block is already one iframe down, so the event sails past it to
   the page underneath. Same origin, so the listener is attached to the top
   window as well and catches it either way.

   It broadcasts with targetOrigin "*", so the origin check below is ours to
   make and is not optional.

   Defined at module level on purpose: a component defined inside Block would
   be a new type on every render, and React would remount the iframe and throw
   away a half-finished booking. */
function BookingEmbed({ open, onOpen, embedUrl, fallbackUrl, onComplete, ctaStyle }) {
  useEffect(() => {
    if (!open) return undefined;
    const handle = (e) => {
      if (e.origin !== TIDYCAL_ORIGIN) return;
      const payload = e.data;
      const name = typeof payload === "string" ? payload : payload && payload.event;
      if (name === "bookingComplete") onComplete();
    };
    const targets = [window];
    try {
      if (window.top && window.top !== window) targets.push(window.top);
    } catch (err) {
      /* a cross-origin top window cannot be listened to, and does not need to be */
    }
    targets.forEach((t) => t.addEventListener("message", handle));
    return () => {
      targets.forEach((t) => {
        try {
          t.removeEventListener("message", handle);
        } catch (err) {
          /* window went away with the modal */
        }
      });
    };
  }, [open, onComplete]);

  if (!open) {
    return (
      <button type="button" className="bl-primary" onClick={onOpen} style={{ ...ctaStyle, border: 0, cursor: "pointer", font: "inherit", fontSize: 13, fontWeight: 600 }}>
        Pick a time →
      </button>
    );
  }

  return (
    <div className="bl-cal">
      <iframe src={embedUrl} title="Pick a time" className="bl-cal-frame" allow="payment" />
      <p className="bl-cal-note">
        Calendar not loading?{" "}
        <a className="bl-mail" href={fallbackUrl} target="_blank" rel="noopener noreferrer">
          Open it in a new tab
        </a>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function Block() {
  const [stage, setStage] = useState("intro"); // intro | q | outcome
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState("q"); // q | echo | typing
  const [intro, setIntro] = useState(0);
  const [answers, setAnswers] = useState({});
  const [echo, setEcho] = useState("");
  const [route, setRoute] = useState(null);
  const [declined, setDeclined] = useState(false);
  const [booked, setBooked] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [deadDomain, setDeadDomain] = useState("");   // email domain that does not resolve
  const [deadSite, setDeadSite] = useState("");       // website that does not resolve

  /* Read attribution once, inside a lazy initialiser. Reading
     window.location at the top level of a block that also creates
     records stops Softr's analyzer registering the create. */
  const [attribution] = useState(() => {
    const blank = {
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
      utmContent: "",
      utmTerm: "",
      gclid: "",
      fbclid: "",
      ttclid: "",
      referrer: "",
      landingPage: "",
      pageUrl: "",
      firstLanding: "",
    };
    if (typeof window === "undefined") return blank;
    try {
      const p = new URLSearchParams(window.location.search);
      const get = (k) => (p.get(k) || "").slice(0, 200);
      const fromUrl = {
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
        pageUrl: window.location.href.slice(0, 300),
        firstLanding: "",
      };
      const own = fromUrl.gclid || fromUrl.fbclid || fromUrl.ttclid || fromUrl.utmSource || fromUrl.utmMedium || fromUrl.utmCampaign;
      if (own) return fromUrl;
      const s = recallAttribution();
      if (!s) return fromUrl;
      return {
        ...fromUrl,
        utmSource: s.utmSource || "",
        utmMedium: s.utmMedium || "",
        utmCampaign: s.utmCampaign || "",
        utmContent: s.utmContent || "",
        utmTerm: s.utmTerm || "",
        gclid: s.gclid || "",
        fbclid: s.fbclid || "",
        ttclid: s.ttclid || "",
        referrer: s.referrer || fromUrl.referrer,
        firstLanding: s.landingPage || "",
      };
    } catch (e) {
      return blank;
    }
  });

  const createEvent = useRecordCreate({ from: ds.leadEvents, fields: eventFields });
  const createRow = useRecordCreate({
    from: ds.pipeline,
    fields: pipelineFields,
    onError: () =>
      toast.error("I couldn't save your answers. Email support@brieflee.co and I'll pick it up."),
  });

  /* The mutation objects are new on every render, so hold them in refs.
     Anything a timer calls has to keep stable identity or the effect
     below would reset its own countdown on each render and never fire. */
  const createEventRef = useRef(createEvent);
  createEventRef.current = createEvent;
  const createRowRef = useRef(createRow);
  createRowRef.current = createRow;

  const timers = useRef([]);
  const eventSent = useRef(false);
  const rowSaved = useRef(false);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const later = useCallback((fn, ms) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const runIntro = useCallback(() => {
    clearTimers();
    setIntro(0);
    later(() => setIntro(1), 900);
    later(() => setIntro(2), 1500);
    later(() => setIntro(3), 2500);
    later(() => setIntro(4), 3000);
  }, [clearTimers, later]);

  useEffect(() => {
    runIntro();
    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, [runIntro]);

  const brand = hostOf((answers.urls || {}).website);
  const questions = buildQuestions(brand);
  const total = questions.length;
  const q0 = questions[Math.min(step, total - 1)];
  const answer = answers[q0.id];

  /* Timers fire outside the render closure, so keep a live mirror. */
  const live = useRef({});
  live.current = { answers, route, brand };

  const valid = () => {
    if (q0.kind === "options") return !!answer;
    if (q0.kind === "multi") return Array.isArray(answer) && answer.length > 0;
    if (q0.kind === "text") return true;
    if (q0.id === "contact") return !contactMessage(true);
    if (q0.id === "urls") return !siteMessage(true);
    return true;
  };

  const echoFor = (question, value) => {
    if (question.kind === "options") return value || "";
    if (question.kind === "multi") return (Array.isArray(value) ? value : []).join(", ");
    if (question.kind === "text") return String(value || "").trim() || "It's messy, honestly.";
    if (question.id === "contact") return [(value || {}).name, (value || {}).email].filter(Boolean).join(" · ");
    if (question.id === "urls") return [(value || {}).website, (value || {}).product].filter(Boolean).join(" · ");
    return "";
  };

  /* One thin lead_event the moment we have a name and an email, so a
     visitor who leaves at Q7 is still a lead with attribution on it. */
  const sendEvent = useCallback(
    (contact) => {
      const writer = createEventRef.current;
      if (eventSent.current || !writer.enabled) return;
      eventSent.current = true;
      trackMeta("Lead", { content_name: "book-a-demo", content_category: "demo" });
      const paid =
        !!attribution.gclid ||
        !!attribution.fbclid ||
        !!attribution.ttclid ||
        /cpc|paid|ppc/i.test(attribution.utmMedium);
      const body = {
        email: String(contact.email || "").trim(),
        source: SOURCE_BOOK_A_DEMO,
        channel: paid ? CHANNEL_PAID : CHANNEL_DIRECT,
        name: String(contact.name || "").trim(),
        pageUrl: attribution.pageUrl,
        landingPage: attribution.landingPage,
        submittedAt: new Date().toISOString(),
        payload: JSON.stringify({
          flow: "book-a-demo-chat",
          utm_term: attribution.utmTerm,
          gclid: attribution.gclid,
          fbclid: attribution.fbclid,
          ttclid: attribution.ttclid,
          referrer: attribution.referrer,
          first_landing: attribution.firstLanding,
        }),
      };
      if (attribution.utmSource) body.utmSource = attribution.utmSource;
      if (attribution.utmMedium) body.utmMedium = attribution.utmMedium;
      if (attribution.utmCampaign) body.utmCampaign = attribution.utmCampaign;
      if (attribution.utmContent) body.utmContent = attribution.utmContent;

      writer.mutateAsync(body).catch(() => {
        eventSent.current = false;
      });
    },
    [attribution]
  );

  /* One sales_pipeline row, written once, at the outcome. */
  const savePipeline = useCallback(() => {
    const writer = createRowRef.current;
    if (rowSaved.current || !writer.enabled) return;
    const s = live.current;
    if (!s.route) return;
    const a = s.answers || {};
    const contact = a.contact || {};
    const urls = a.urls || {};
    if (!String(contact.email || "").trim()) return;

    rowSaved.current = true;

    const body = {
      name: String(contact.name || "").trim(),
      email: String(contact.email || "").trim(),
      route: ROUTE_ID[s.route],
      stage: ROUTE_STAGE[s.route],
      entryPoint: ENTRY_CHAT,
      lastStepReached: 11,
      createdAt: new Date().toISOString(),
    };
    const put = (key, value) => {
      if (value) body[key] = value;
    };
    put("website", String(urls.website || "").trim());
    put("productUrl", String(urls.product || "").trim());
    put("businessModel", OPTION_ID.model[a.model]);
    put("makesContentForOthers", OPTION_ID.clients[a.clients]);
    put("videosPerMonth", OPTION_ID.volume[a.volume]);
    put("whoFilms", OPTION_ID.films[filmsBucket(a.films)]);
    const detail = (Array.isArray(a.films) ? a.films : [])
      .map((f) => FILMS_DETAIL_ID[f])
      .filter(Boolean);
    if (detail.length) body.whoFilmsDetail = detail;
    put("revenueBand", OPTION_ID.revenue[a.revenue]);
    put("adSpendBand", OPTION_ID.spend[a.spend]);
    put("decisionMakers", OPTION_ID.authority[a.authority]);
    put("timeline", OPTION_ID.timeline[a.timeline]);
    put("offBriefToday", String(a.offbrief || "").trim());

    writer.mutateAsync(body).catch(() => {
      rowSaved.current = false;
    });
  }, []);

  /* Write the pipeline row the moment the outcome resolves. */
  useEffect(() => {
    if (stage !== "outcome" || !route || declined) return;
    savePipeline();
  }, [stage, route, declined, savePipeline]);

  const setField = (qid, key, value) =>
    setAnswers((prev) => ({ ...prev, [qid]: { ...(prev[qid] || {}), [key]: value } }));

  const setAnswer = (qid, value) => setAnswers((prev) => ({ ...prev, [qid]: value }));

  /* Multi-select questions toggle and never auto-advance; the Next
     button is the only way on, since tapping a second answer must not
     be read as changing your mind. */
  const toggle = (qid, value) =>
    setAnswers((prev) => {
      const cur = Array.isArray(prev[qid]) ? prev[qid] : [];
      return {
        ...prev,
        [qid]: cur.indexOf(value) > -1 ? cur.filter((x) => x !== value) : cur.concat([value]),
      };
    });

  const advance = (overrideValue) => {
    const value = overrideValue === undefined ? answer : overrideValue;
    if (overrideValue === undefined && !valid()) return;
    clearTimers();

    if (q0.id === "contact") sendEvent(value || {});

    setPhase("echo");
    setEcho(echoFor(q0, value));
    later(() => setPhase("typing"), 750);
    later(() => {
      if (step >= total - 1) {
        const finalAnswers = { ...answers, [q0.id]: value };
        setRoute(routeFor(finalAnswers));
        setStage("outcome");
        setPhase("q");
      } else {
        setStep((s) => s + 1);
        setPhase("q");
      }
    }, 1450);
  };

  const back = () => {
    clearTimers();
    setPhase("q");
    if (stage === "outcome") {
      setStage("q");
      setStep(total - 1);
      return;
    }
    if (step === 0) {
      setStage("intro");
      setIntro(4);
      return;
    }
    setStep((s) => s - 1);
  };

  const restart = () => {
    savePipeline();
    setStage("intro");
    setStep(0);
    setAnswers({});
    setRoute(null);
    setPhase("q");
    setDeclined(false);
    setBooked(false);
    setCalendarOpen(false);
    rowSaved.current = false;
    runIntro();
  };

  // The click now opens the calendar in place rather than a new tab, so
  // `booked` is no longer set by pressing a button. It is set only when
  // TidyCal reports a real booking, which means the follow-up copy below
  // finally says something true.
  const openCalendar = () => {
    savePipeline();
    clearTimers();
    setCalendarOpen(true);
  };

  const onBookingComplete = useCallback(() => {
    setBooked(true);
    trackMeta("Schedule", { content_name: "book-a-demo", content_category: "demo" });
  }, []);

  /* Debounced reality checks on the two things a person can invent.
     Only fired once the shape is already good, so we are not looking up
     half-typed input. */
  const emailValue = String((answers.contact || {}).email || "").trim();
  useEffect(() => {
    if (emailProblem(emailValue)) { setDeadDomain(""); return undefined; }
    const host = emailValue.slice(emailValue.lastIndexOf("@") + 1).toLowerCase();
    let alive = true;
    const t = setTimeout(() => {
      domainIsReal(host).then((real) => { if (alive) setDeadDomain(real ? "" : host); });
    }, 550);
    return () => { alive = false; clearTimeout(t); };
  }, [emailValue]);

  const siteValue = String((answers.urls || {}).website || "").trim();
  useEffect(() => {
    if (siteProblem(siteValue)) { setDeadSite(""); return undefined; }
    const host = hostOfInput(siteValue);
    let alive = true;
    const t = setTimeout(() => {
      domainIsReal(host).then((real) => { if (alive) setDeadSite(real ? "" : host); });
    }, 550);
    return () => { alive = false; clearTimeout(t); };
  }, [siteValue]);

  /* `strict` is for the gate: it also complains about fields left empty.
     Without it we only complain about what has actually been typed, so
     the message appears as they go rather than after they press a button
     that looks broken. */
  const contactMessage = (strict) => {
    const v = answers.contact || {};
    const nm = String(v.name || "").trim();
    const em = String(v.email || "").trim();
    if (nm && nameProblem(nm)) return nameProblem(nm);
    if (em && emailProblem(em)) return emailProblem(em);
    if (em && deadDomain) return `I could not find ${deadDomain}. Check the spelling.`;
    return strict ? nameProblem(nm) || emailProblem(em) : "";
  };
  const siteMessage = (strict) => {
    if (siteValue && siteProblem(siteValue)) return siteProblem(siteValue);
    if (siteValue && deadSite) return `I could not find ${deadSite}. Check the spelling.`;
    return strict ? siteProblem(siteValue) : "";
  };

  const showQuestion = stage === "q" && phase === "q";
  const ok = showQuestion ? valid() : false;
  const last = step >= total - 1;
  const showProgress = stage !== "intro" && !declined;
  const progressPct = `${Math.round(((stage === "outcome" ? total : step) / total) * 100)}%`;
  const brandLabel = brand || "your product";

  const contact = answers.contact || {};
  const calendarUrl = (base) => {
    const name = String(contact.name || "").trim();
    const email = String(contact.email || "").trim();
    const parts = [];
    if (name) parts.push(`name=${encodeURIComponent(name)}`);
    if (email) parts.push(`email=${encodeURIComponent(email)}`);
    return parts.length ? `${base}?${parts.join("&")}` : base;
  };

  // ?embed=1 is what TidyCal's own embed script sends, and it is what puts
  // the booking page into its in-frame layout.
  const calendarEmbedUrl = (base) => {
    const url = calendarUrl(base);
    return url.includes("?") ? `${url}&embed=1` : `${url}?embed=1`;
  };

  const pill = (label, selected) => ({
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 500,
    textAlign: "left",
    borderRadius: 999,
    padding: "12px 20px",
    cursor: "pointer",
    background: selected ? "#7A93FF" : "#ffffff",
    border: `1.5px solid ${selected ? "#7A93FF" : "rgba(214,222,252,0.9)"}`,
    color: selected ? "#ffffff" : "#001364",
    boxShadow: selected ? "0 4px 14px -4px rgba(135,156,247,0.6)" : "0 1px 2px rgba(0,19,100,0.04)",
  });

  const inputStyle = {
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 400,
    color: "#000F4D",
    background: "#fff",
    border: "1px solid rgba(214,222,252,0.9)",
    borderRadius: 12,
    padding: "13px 15px",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 200ms ease, box-shadow 200ms ease",
  };

  return (
    <div
      className="bl-wrap"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, rgba(217,224,255,0.35) 0%, rgba(250,251,255,1) 46%)",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <style>{CSS}</style>

      <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "36px 20px 72px" }}>
        <div style={{ width: "100%", maxWidth: 640 }}>
          {/* status row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 14,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px 6px 10px",
                borderRadius: 999,
                background: "#ECFBEC",
                border: "1px solid #CCEFCB",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: "#41D33E",
                  animation: "blPresence 2.6s ease-in-out infinite",
                }}
              />
              <span style={{ fontSize: 11.5, fontWeight: 600, color: "#197A16", letterSpacing: "0.01em" }}>
                Bev is online now
              </span>
            </div>

            {showProgress && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{ width: 148, height: 5, borderRadius: 999, background: "#E4E9FF", overflow: "hidden" }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 999,
                      background: "#7A93FF",
                      transition: `width 420ms ${EASE}`,
                      width: progressPct,
                    }}
                  />
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 500, color: "#838AA3", whiteSpace: "nowrap" }}>
                  {stage === "outcome" ? "All done" : ""}
                </span>
              </div>
            )}
          </div>

          <div className="bl-sr" aria-live="polite">
            {showQuestion ? q0.text : ""}
          </div>

          {/* intro */}
          {stage === "intro" && (
            <div>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <Avatar />
                <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: "#6B7A99", margin: "0 0 0 4px" }}>
                    Bev · Founder, Brieflee
                  </div>
                  {intro === 0 && <Dots />}
                  {intro >= 1 && (
                    <div
                      style={{
                        ...bubbleStyle,
                        padding: "16px 18px",
                        maxWidth: 480,
                        animation: `blSlideIn 380ms ${EASE} both`,
                      }}
                    >
                      <p style={bodyCopy}>
                        Hi 👋 I'm Bev, founder here at Brieflee. I'd love to show you what it can do.
                      </p>
                    </div>
                  )}
                  {intro === 2 && <Dots />}
                  {intro >= 3 && (
                    <div
                      style={{
                        ...bubbleStyle,
                        padding: "16px 18px",
                        maxWidth: 480,
                        animation: `blSlideIn 380ms ${EASE} both`,
                      }}
                    >
                      <p style={bodyCopy}>
                        I've got a few questions so I can prep properly for our demo. Takes about two minutes.
                        Ready?
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {intro >= 4 && (
                <>
                  <div
                    className="bl-gutter"
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 10,
                      marginLeft: 56,
                      marginTop: 16,
                      animation: `blPop 400ms ${EASE} both`,
                    }}
                  >
                    <button
                      type="button"
                      className="bl-primary"
                      onClick={() => {
                        clearTimers();
                        setStage("q");
                        setStep(0);
                        setPhase("q");
                      }}
                      style={{
                        fontFamily: "inherit",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#fff",
                        background: "#7A93FF",
                        border: "none",
                        borderRadius: 10,
                        padding: "13px 24px",
                        cursor: "pointer",
                        boxShadow: "0 4px 14px -2px rgba(135,156,247,0.5)",
                      }}
                    >
                      Yes, let's go
                    </button>
                    <button
                      type="button"
                      className="bl-ghost"
                      onClick={() => {
                        clearTimers();
                        setDeclined(true);
                        setRoute("D");
                        setStage("outcome");
                      }}
                      style={{
                        fontFamily: "inherit",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#6B7A99",
                        background: "transparent",
                        border: "1px solid rgba(214,222,252,0.9)",
                        borderRadius: 10,
                        padding: "13px 20px",
                        cursor: "pointer",
                      }}
                    >
                      Not right now
                    </button>
                  </div>
                  <div
                    className="bl-gutter"
                    style={{ margin: "22px 0 0 56px", fontSize: 11.5, color: "#838AA3", lineHeight: 1.5 }}
                  >
                    Your answers come straight to me. No sales team, no sequence.
                  </div>
                </>
              )}
            </div>
          )}

          {/* typing between questions */}
          {stage === "q" && phase === "typing" && (
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                animation: `blSlideIn 300ms ${EASE} both`,
              }}
            >
              <Avatar />
              <div style={{ marginTop: 22 }}>
                <Dots />
              </div>
            </div>
          )}

          {/* echo */}
          {stage === "q" && phase === "echo" && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 16,
                animation: `blPop 320ms ${EASE} both`,
              }}
            >
              <div
                style={{
                  background: "#7A93FF",
                  color: "#fff",
                  borderRadius: 18,
                  borderTopRightRadius: 6,
                  padding: "13px 18px",
                  maxWidth: 440,
                  fontSize: 13,
                  lineHeight: 1.5,
                  boxShadow: "0 4px 14px -4px rgba(135,156,247,0.6)",
                }}
              >
                {echo}
              </div>
            </div>
          )}

          {/* question */}
          {showQuestion && (
            <div style={{ animation: `blSlideInRight 420ms ${EASE} both` }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <Avatar />
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: "#6B7A99", margin: "0 0 6px 4px" }}>
                    Bev · Founder, Brieflee
                  </div>
                  <div style={{ ...bubbleStyle, padding: "16px 18px", maxWidth: 500 }}>
                    <p style={{ ...bodyCopy, fontWeight: 500, lineHeight: 1.5 }}>{q0.text}</p>
                    {q0.hint && (
                      <p
                        style={{
                          margin: "10px 0 0",
                          fontSize: 12,
                          lineHeight: 1.5,
                          color: "#838AA3",
                          fontWeight: 400,
                        }}
                      >
                        {q0.hint}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bl-gutter" style={{ margin: "18px 0 0 56px" }}>
                {q0.kind === "fields" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 460 }}>
                    {q0.fields.map((f) => (
                      <label key={f.key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span
                          style={{
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: "#6B7A99",
                            letterSpacing: "0.01em",
                          }}
                        >
                          {f.label}
                        </span>
                        <input
                          type={f.type}
                          value={(answer || {})[f.key] || ""}
                          placeholder={f.ph}
                          onChange={(e) => setField(q0.id, f.key, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              advance();
                            }
                          }}
                          style={inputStyle}
                        />
                      </label>
                    ))}
                    {(q0.id === "contact" ? contactMessage() : q0.id === "urls" ? siteMessage() : "") && (
                      <p style={{ margin: "2px 0 0", fontSize: 12.5, fontWeight: 600, color: "#b31711", lineHeight: 1.45 }}>
                        {q0.id === "contact" ? contactMessage() : siteMessage()}
                      </p>
                    )}
                  </div>
                )}

                {q0.kind === "options" && (
                  <div
                    role="radiogroup"
                    aria-label={q0.text}
                    style={{ display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 520 }}
                  >
                    {q0.options.map((label) => (
                      <button
                        key={label}
                        type="button"
                        role="radio"
                        aria-checked={answer === label}
                        className="bl-pill"
                        onClick={(e) => {
                          setAnswer(q0.id, label);
                          /* e.detail is 0 for keyboard activation — never
                             yank the screen out from under a keyboard user. */
                          if (e.detail > 0) {
                            clearTimers();
                            later(() => advance(label), 180);
                          }
                        }}
                        style={pill(label, answer === label)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}

                {q0.kind === "multi" && (
                  <div
                    role="group"
                    aria-label={q0.text}
                    style={{ display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 520 }}
                  >
                    {q0.options.map((label) => {
                      const on = Array.isArray(answer) && answer.indexOf(label) > -1;
                      return (
                        <button
                          key={label}
                          type="button"
                          role="checkbox"
                          aria-checked={on}
                          className="bl-pill"
                          onClick={() => toggle(q0.id, label)}
                          style={pill(label, on)}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {q0.kind === "text" && (
                  <>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxWidth: 520, marginBottom: 12 }}>
                      {q0.chips.map((label) => (
                        <button
                          key={label}
                          type="button"
                          className="bl-pill"
                          onClick={() => setAnswer(q0.id, label === "Something else" ? "" : label)}
                          style={{
                            ...pill(label, answer === label),
                            padding: "9px 16px",
                            boxShadow: "none",
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows={4}
                      value={answer || ""}
                      placeholder="It goes to Slack, someone watches it, we send notes back and hope..."
                      onChange={(e) => setAnswer(q0.id, e.target.value)}
                      style={{
                        ...inputStyle,
                        lineHeight: 1.55,
                        borderRadius: 14,
                        padding: "14px 16px",
                        maxWidth: 460,
                        resize: "vertical",
                      }}
                    />
                  </>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22 }}>
                  <button
                    type="button"
                    className="bl-ghost"
                    onClick={back}
                    style={{
                      fontFamily: "inherit",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#6B7A99",
                      background: "transparent",
                      border: "1px solid rgba(214,222,252,0.9)",
                      borderRadius: 10,
                      padding: "11px 18px",
                      cursor: "pointer",
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => advance()}
                    disabled={!ok}
                    style={{
                      fontFamily: "inherit",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      padding: "12px 26px",
                      transition: `background 200ms ${EASE}`,
                      background: ok ? "#7A93FF" : "#D9E0FF",
                      cursor: ok ? "pointer" : "not-allowed",
                      boxShadow: ok ? "0 4px 14px -2px rgba(135,156,247,0.5)" : "none",
                    }}
                  >
                    {last ? "See what I'd do next →" : "Next →"}
                  </button>
                  <span style={{ fontSize: 11.5, color: "#AEB4C8", fontWeight: 400 }}>
                    {q0.kind === "options"
                      ? "or just tap an answer"
                      : q0.kind === "multi"
                      ? "tap all that apply"
                      : q0.optional
                      ? "you can leave this blank"
                      : "press Enter"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Route A and Route C: both book the demo. C keeps its own route id in the CRM. */}
          {stage === "outcome" && (route === "A" || route === "C") && (
            <div style={{ animation: `blSlideIn 460ms ${EASE} both` }}>
              <div style={{ marginBottom: 20 }}>
                <BevSays marginTop={22}>
                  <p style={bodyCopy}>
                    This is exactly what I built Brieflee for. Pick a time and we spend it on your brand: I
                    build a brief for one of your products live, and run a real creator video through it while
                    you watch.
                  </p>
                </BevSays>
              </div>
              <div className="bl-gutter" style={{ marginLeft: 56, ...cardStyle }}>
                <div style={eyebrowStyle}>Your demo</div>
                <h2 style={headingStyle}>Live, with me</h2>
                <p style={{ ...subCopy, margin: "0 0 22px" }}>
                  Thanks for going through those. No feature tour, we spend it on your brand.
                </p>
                <BookingEmbed
                  open={calendarOpen}
                  onOpen={openCalendar}
                  embedUrl={calendarEmbedUrl(TIDYCAL_CALL)}
                  fallbackUrl={calendarUrl(TIDYCAL_CALL)}
                  onComplete={onBookingComplete}
                  ctaStyle={ctaStyle}
                />
                <p style={{ margin: "16px 0 0", fontSize: 11.5, color: "#838AA3", lineHeight: 1.5 }}>
                  Nothing on the calendar that works? Email{" "}
                  <a className="bl-mail" href="mailto:support@brieflee.co">
                    support@brieflee.co
                  </a>{" "}
                  and I'll find one.
                </p>
              </div>

              {booked && (
                <div style={{ marginTop: 22, animation: `blSlideIn 420ms ${EASE} both` }}>
                  <BevSays>
                    <p style={bodyCopy}>Booked? Good. Nothing to prepare. Here's what you'll walk away with.</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "14px 0 0" }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <Tick />
                        <span style={{ fontSize: 13, color: "#001364", lineHeight: 1.45 }}>
                          A brief for {brandLabel}, built live on the call rather than a sample account
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <Tick />
                        <span style={{ fontSize: 13, color: "#001364", lineHeight: 1.45 }}>
                          A real creator video reviewed against it while you watch
                        </span>
                      </div>
                    </div>
                    <p style={{ ...bodyCopy, margin: "14px 0 0" }}>
                      Bring nothing. If the time stops working, the invite has a reschedule link.
                    </p>
                  </BevSays>
                </div>
              )}
            </div>
          )}

          {/* Route B */}
          {stage === "outcome" && route === "B" && (
            <div style={{ animation: `blSlideIn 460ms ${EASE} both` }}>
              <div style={{ marginBottom: 20 }}>
                <BevSays marginTop={22}>
                  <p style={bodyCopy}>
                    At your volume the published plans stop making sense. Let's take a call instead, go
                    through the whole programme, and price it to what you're actually running.
                  </p>
                </BevSays>
              </div>
              <div className="bl-gutter" style={{ marginLeft: 56, ...cardStyle }}>
                <div style={eyebrowStyle}>Programme call</div>
                <h2 style={headingStyle}>Priced to your volume</h2>
                <p style={{ ...subCopy, margin: "0 0 20px" }}>
                  Multi-brand workspaces, seats for your team or clients, review volume set to your real
                  throughput, and a rollout plan for the creators already filming for you.
                </p>
                <BookingEmbed
                  open={calendarOpen}
                  onOpen={openCalendar}
                  embedUrl={calendarEmbedUrl(TIDYCAL_CALL)}
                  fallbackUrl={calendarUrl(TIDYCAL_CALL)}
                  onComplete={onBookingComplete}
                  ctaStyle={ctaStyle}
                />
              </div>

              {booked && (
                <div style={{ marginTop: 22, animation: `blSlideIn 420ms ${EASE} both` }}>
                  <BevSays>
                    <p style={bodyCopy}>
                      Booked? Good. Nothing to prepare. We size the programme on the call, on your real
                      numbers, and you leave knowing the shape and the price. If someone else signs off, they
                      are welcome on the call too.
                    </p>
                  </BevSays>
                </div>
              )}
            </div>
          )}

          {/* Route D */}
          {stage === "outcome" && route === "D" && (
            <div style={{ animation: `blSlideIn 460ms ${EASE} both` }}>
              <div style={{ marginBottom: 20 }}>
                <BevSays marginTop={22}>
                  <p style={bodyCopy}>
                    Sounds like the creators aren't filming in volume yet. Book the call anyway and we'll
                    spend it on the part you need first: the brief. You'll leave with one built for your
                    product, and you'll know exactly what Brieflee checks against when the videos do start
                    landing.
                  </p>
                </BevSays>
              </div>
              <div className="bl-gutter" style={{ marginLeft: 56, ...cardStyle }}>
                <div style={eyebrowStyle}>Your call</div>
                <h2 style={headingStyle}>Live, with me</h2>
                <p style={{ ...subCopy, margin: "0 0 20px" }}>
                  No feature tour. We spend it on your brand and the brief behind it.
                </p>
                <BookingEmbed
                  open={calendarOpen}
                  onOpen={openCalendar}
                  embedUrl={calendarEmbedUrl(TIDYCAL_CALL)}
                  fallbackUrl={calendarUrl(TIDYCAL_CALL)}
                  onComplete={onBookingComplete}
                  ctaStyle={ctaStyle}
                />
                <p style={{ margin: "16px 0 0", fontSize: 11.5, color: "#838AA3", lineHeight: 1.5 }}>
                  Rather start on your own first? The{" "}
                  <a className="bl-mail" href={BRIEF_GENERATOR} target="_blank" rel="noopener noreferrer">
                    AI brief generator
                  </a>{" "}
                  is free and writes the brief you'd hand a creator.
                </p>
              </div>

              {booked && (
                <div style={{ marginTop: 22, animation: `blSlideIn 420ms ${EASE} both` }}>
                  <BevSays>
                    <p style={bodyCopy}>
                      Booked. Nothing to prepare. Bring the product you want the brief built around.
                    </p>
                  </BevSays>
                </div>
              )}
            </div>
          )}

          {stage === "outcome" && (
            <div className="bl-gutter" style={{ margin: "28px 0 0 56px" }}>
              <button
                type="button"
                className="bl-restart"
                onClick={restart}
                style={{
                  fontFamily: "inherit",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#838AA3",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Start the questions again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
