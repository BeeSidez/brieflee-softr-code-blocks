// /set-up/customize — Steps 2-6 of onboarding (UPDATE block) + the
// workspace blueprint engine (v6).
// =====================================================================
// Lands here from /set-up, which creates the accounts row with
// blueprint_status = Pending and redirects. The blueprint itself is
// built by THIS block, in the browser (see "Blueprint engine" below):
// Firecrawl reads the site and page links, DeepSeek V4 Pro writes the
// blueprint, the row + products + first project + notification are
// written through the block's sources. No workflow is called. URL params:
//   ?accountId=<id>          — the new account record id
//
// Every step is skippable: Review mode's skip writes the Hybrid
// default, Review Agents and Thresholds skip clean, and Blueprint
// review's "Skip for now" finishes without edits.
//
// This block resolves its account row ITSELF from the user's scoped
// account list, so it plays nice with the workspace switcher:
//   ?workspace=<id> (switcher pick) → ?accountId=<id> (set-up redirect)
//   → localStorage bl-active-workspace (switcher memory) → first row.
//
// SOFTR CONFIG REQUIRED:
//   1. Page: /set-up/customize
//   2. Sources (all wired 2026-08-19, ids in datasource.define below):
//      accounts, products, projects, notifications, users (Softr
//      databases), Firecrawl, and "Workspace | Open Router | BL" (REST).
//   3. Actions: Update Record on accounts + products, Add Record on
//      products / projects / notifications (aliases come from the
//      q.select maps below; the compiler derives them).
//   4. Visibility tab → logged-in users.
// =====================================================================

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Check, ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { datasource, useRecord, useRecords, useRecordCreate, useRecordUpdate, useProxyFetch, q } from "@/lib/datasource";
import { useCurrentUser } from "@/lib/user";
import { toast } from "sonner";

// The full datasource.define (all seven sources) lives in the Blueprint
// engine section below.

// ---- Field map (ACCOUNTS) -----------------------------------------
const select = q.select({
  name: "aAKkT",
  website: "RaK4B",
  description: "RQcNB",
  aiMode: "O9x4n",
  qaChecklist: "mZaRc",
  productScreenTime: "AFgpo",
  hookSpeed: "wthaW",
  visualHook: "Nq4ZX",
  ctaPlacement: "FA452",
  faceTime: "FH27O",
  textLegibility: "TNRuM",
  audioClarity: "dMTrN",
  engagementPacing: "bR5PL",
  brandMentionCount: "HCvZw",
  blueprintStatus: "fElW1",
  brandBio: "iVPat",
  brandVoice: "ybmp8",
  brandCta: "s9vzj",
  niche: "vOp4b",
  targetAudience: "6g1Vd",
  audiencePainPoints: "B4zya",
  audienceObjectives: "5Wq2k",
  productOrFeature1: "FLZz5",
  productOrFeature2: "4nv9b",
  productOrFeature3: "ty0gw",
  // engine inputs (written by /set-up)
  preferredFormats: "V7fzw",
  pageLinks: "PlEfy",
});

const updateFields = q.select({
  name: "aAKkT",
  aiMode: "O9x4n",
  qaChecklist: "mZaRc",
  productScreenTime: "AFgpo",
  hookSpeed: "wthaW",
  visualHook: "Nq4ZX",
  ctaPlacement: "FA452",
  faceTime: "FH27O",
  textLegibility: "TNRuM",
  audioClarity: "dMTrN",
  engagementPacing: "bR5PL",
  brandMentionCount: "HCvZw",
  brandBio: "iVPat",
  brandVoice: "ybmp8",
  brandCta: "s9vzj",
  niche: "vOp4b",
  targetAudience: "6g1Vd",
  audiencePainPoints: "B4zya",
  audienceObjectives: "5Wq2k",
  productOrFeature1: "FLZz5",
  productOrFeature2: "4nv9b",
  productOrFeature3: "ty0gw",
  // engine outputs
  websiteScrape: "VCpz2",
  page1Scrape: "KSBbE",
  page2Scrape: "RfNx0",
  page3Scrape: "fKaWo",
  owner: "ISmqP",
  billing: "fYU6p",
  usage: "9KE64",
  communityLinks: "oHBT3",
  pageLinks: "PlEfy",
  blueprintStatus: "fElW1",
  status: "9Cdqq",
});

// =====================================================================
// Blueprint engine (v6, 2026-08-19) — workspace creation runs HERE.
// =====================================================================
// /set-up creates the accounts row (blueprint_status = Pending) and
// redirects to this page. On mount, when the row is Pending, this block
// builds the blueprint itself, in the browser, through the block's
// sources: Firecrawl reads the website and every page link, DeepSeek
// V4 Pro (OpenRouter) writes the blueprint, and the result is written
// to accounts + products, then the default project, the in-app
// notification and the Slack ping. Steps 2 to 5 run while it works;
// Step 6 shows the blueprint when it lands. A closed tab is harmless:
// the next visit sees Pending and picks the build up again.
//
// Why in-block: the same pattern as the Brief Builder and the free
// generators. No workflow credits, no 120s step timeout, no 65,536-char
// long-text surprises (the scrapes are trimmed here before anything
// touches them).
//
// SOURCES on this block (all wired, ids baked below):
//   accounts      read + update (the row)           SOFTR_TABLES
//   products      create + update (one per page)    SOFTR_TABLES
//   projects      create (the first project)        SOFTR_TABLES
//   notifications create (Account created)          SOFTR_TABLES
//   users         read (email, billing, usage)      SOFTR_TABLES
//   firecrawl     scrape                            FIRECRAWL
//   openrouter    chat/completions                  REST_API (Bearer in source)
// =====================================================================
const ds = datasource.define({
  accounts:      "61a89222-4ee2-46c7-8d33-527787cfd49a",
  products:      "products",
  projects:      "projects",
  notifications: "notifications",
  users:         "users",
  firecrawl:     "a53b28b0-b491-49df-950b-b2b1c00f8e02",
  openrouter:    "774e6479-9f73-494d-b788-37912e72ea20",
});

const FIRECRAWL_URL  = "https://api.firecrawl.dev/v1/scrape";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const BLUEPRINT_MODEL = "deepseek/deepseek-v4-pro"; // decided 2026-07-30 (bench)
// The Softr proxy returns 504 at about 120s. One call writing the whole
// blueprint on V4 Pro runs longer than that, so the writing is split into
// parallel calls (brand + one per page) and any single call the proxy
// still times out is retried on the fast model.
const BLUEPRINT_FALLBACK_MODEL = "deepseek/deepseek-v4-flash";
const SCRAPE_TIMEOUT_MS = 30000;
const MODEL_TIMEOUT_MS  = 150000;
const PAGE_MAX_FOR_MODEL = 25000;  // per scrape, into the prompt
const PAGE_MAX_FOR_STORE = 60000;  // per scrape, onto the row (long text caps at 65,536)
const MAX_PAGE_LINKS = 5;

// users table (brpbVf8sL2xqxV): what the engine copies onto the account.
const userRead = q.select({
  email:   "PBrIP",
  billing: "QsOT8", // LINKED_RECORD → billing
  usage:   "QiLb3", // LINKED_RECORD → usage
});

// products table (fSBAnsTWVfd3re)
const productWrite = q.select({
  name:      "kNM2x",
  accounts:  "MDPv7",
  type:      "I2vm9",
  url:       "NpnYk",
  description: "XGsxw",
  imageUrl:  "wRahq",
  scrape:    "ovQUJ",
  scrapedAt: "VzmXP",
  status:    "Es5IA",
});
const PRODUCT_TYPE = {
  Product: { id: "09733eb9-9e77-4e11-bbdf-4e5e9d5a445e", label: "Product" },
  Feature: { id: "0059fed7-4bfa-4532-bfc4-c99477589e9a", label: "Feature" },
};
const PRODUCT_ACTIVE = { id: "8e6bd9b0-6f7a-4d69-b23d-bb69577c1de3", label: "Active" };

// projects table (hne0kugPrigIMs)
const projectWrite = q.select({
  name:     "bvDEj",
  accounts: "IBYGK",
  users:    "2YWNF",
  status:   "O7yxh",
});
const PROJECT_DRAFT = { id: "66aed7a1-e9d0-454a-a8b7-db8ab34863df", label: "Draft" };

// notifications table (CCoX2TFkOLk89I)
const notificationWrite = q.select({
  type:     "2xLr7",
  accounts: "esbPo",
  users:    "FR1cY",
});
const NOTIFY_ACCOUNT_CREATED = { id: "cb8306b6-c2a1-4922-973a-e50079b0a4fa", label: "Account created" };

// accounts option ids
const BLUEPRINT_COMPLETE = { id: "2a218d15-27e5-4a5d-bd23-150d92b05484", label: "Complete" };
const BLUEPRINT_FAILED   = { id: "e7c6eb4d-2c33-4f2e-944b-090ff2467416", label: "Failed" };
const ACCOUNT_ACTIVE     = { id: "68d940e1-5f26-4cf5-8598-e707e32f100f", label: "active" };

// ---- Small helpers ---------------------------------------------------
function withTimeout(promise, ms, label) {
  let t;
  const timer = new Promise((_, reject) => { t = setTimeout(() => reject(new Error(`${label} timed out`)), ms); });
  return Promise.race([promise, timer]).finally(() => clearTimeout(t));
}

// Model output sometimes appends citations or fences; pull the first
// {...} block and repair a truncated tail by closing open brackets.
function safeParseJson(raw) {
  if (!raw) return null;
  const s = String(raw);
  const m = s.match(/\{[\s\S]*\}/);
  const candidate = m ? m[0] : s;
  try { return JSON.parse(candidate); } catch { /* repair below */ }
  let repaired = candidate.replace(/,\s*$/, "");
  const stack = [];
  let inStr = false, esc = false;
  for (const ch of repaired) {
    if (inStr) { if (esc) esc = false; else if (ch === "\\") esc = true; else if (ch === '"') inStr = false; continue; }
    if (ch === '"') inStr = true;
    else if (ch === "{") stack.push("}");
    else if (ch === "[") stack.push("]");
    else if (ch === "}" || ch === "]") stack.pop();
  }
  if (inStr) repaired += '"';
  repaired += stack.reverse().join("");
  try { return JSON.parse(repaired); } catch { return null; }
}

// Brieflee voice: no em dashes in anything a customer reads.
const noDashes = (s) => String(s || "").replace(/\s*[—–]\s*/g, ", ").replace(/,\s*,/g, ",");

// Scrape text for the MODEL: drop markdown images, keep link labels only,
// drop bare URLs, collapse whitespace, cap. A retail search page can come
// back at 250k+ characters of tracking URLs; this keeps the prompt small
// and the call fast.
function trimForModel(raw) {
  if (!raw) return "";
  let s = String(raw);
  s = s.replace(/!\[[^\]]*\]\([^)]*\)/g, "");
  s = s.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  s = s.replace(/https?:\/\/\S+/g, "");
  s = s.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  return s.length > PAGE_MAX_FOR_MODEL ? s.slice(0, PAGE_MAX_FOR_MODEL) : s;
}
// Scrape text for STORAGE: images out, everything else kept, capped under
// the long-text limit.
function capForStore(raw) {
  if (!raw) return "";
  let s = String(raw).replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n");
  return s.length > PAGE_MAX_FOR_STORE ? s.slice(0, PAGE_MAX_FOR_STORE) : s;
}

// page_links on the account: JSON [{url, type, product_id}] written by
// /set-up. Tolerates the older flat shapes in case anything else wrote it.
function parsePageLinks(raw) {
  if (!raw) return [];
  let arr = [];
  try { arr = JSON.parse(raw); } catch { arr = String(raw).split(/[\n,]/).map((u) => ({ url: u.trim() })); }
  if (!Array.isArray(arr)) return [];
  return arr
    .map((x) => (typeof x === "string" ? { url: x } : x))
    .filter((x) => x && x.url)
    .slice(0, MAX_PAGE_LINKS)
    .map((x) => ({ url: String(x.url).trim(), type: x.type === "Feature" ? "Feature" : "Product", product_id: x.product_id || "" }));
}

function hostSlug(url) {
  try {
    const u = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
    const last = u.pathname.split("/").filter(Boolean).pop() || u.hostname.replace(/^www\./, "");
    return decodeURIComponent(last).replace(/[-_]+/g, " ").replace(/\.[a-z]+$/i, "").trim();
  } catch { return "Page"; }
}

// Formats the brand picked, from preferred_formats (comma-joined names).
function pickedFormatGuidance(preferred) {
  const names = String(preferred || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3);
  return names.map((name) => {
    const g = FORMAT_GUIDANCE[name] || "";
    const wIdx = g.indexOf("Why it works:");
    const hIdx = g.indexOf("Hook tactic:");
    return {
      name,
      description: (wIdx > -1 ? g.slice(0, wIdx) : g).trim(),
      why: (wIdx > -1 ? g.slice(wIdx + 13, hIdx > -1 ? hIdx : g.length) : "").trim(),
      tactic: (hIdx > -1 ? g.slice(hIdx + 12) : "").trim(),
      type: FORMAT_HOOK_TYPES[name] || "",
    };
  });
}

// The user message, same shape the workflow sent (BRAND CONTEXT / WEBSITE
// SCRAPE / PRODUCT OR FEATURE PAGE n / FORMATS), for up to five pages.
function buildUserPrompt({ workspaceName, description, website, siteText, pages, formats, ask }) {
  const lines = [];
  lines.push("BRAND CONTEXT");
  lines.push(`Name: ${workspaceName || ""}`);
  lines.push(`Description: ${website ? "" : (description || "")}`);
  lines.push(`Website:${website || ""} `);
  lines.push("");
  if (siteText) { lines.push("WEBSITE SCRAPE"); lines.push(siteText); lines.push(""); }
  pages.forEach((p, i) => {
    if (!p.text) return;
    lines.push(`PRODUCT OR FEATURE PAGE ${p.slot || i + 1} (${p.url})`);
    lines.push(p.text);
    lines.push("");
  });
  lines.push("FORMATS");
  formats.forEach((f, i) => {
    lines.push(`${i + 1}. ${f.name}: ${f.description} Why it works: ${f.why} Hook tactics: ${f.tactic}. Hook types: ${f.type}.`);
  });
  lines.push("");
  lines.push(ask || "Build the blueprint JSON now.");
  return lines.join("\n");
}

// ---- Format (ported from the workflow's Format code step) ------------
const formatList = (text) => {
  if (!text) return "";
  if (Array.isArray(text)) return text.map((item) => `- ${noDashes(String(item).trim())}`).join("\n");
  if (typeof text !== "string") return "";
  const items = text.split(/\d+\.\s+/).filter((item) => item.trim());
  return items.map((item) => `- ${noDashes(item.trim())}`).join("\n");
};
const formatParagraph = (text) => (text ? noDashes(String(text)) : "");
const formatBlocks = (arr) => {
  if (!arr) return "";
  if (Array.isArray(arr)) return arr.map((item) => noDashes(String(item).trim())).join("\n\n");
  return formatParagraph(arr);
};
// One product = one long text block: NAME / DESCRIPTION / TARGET AUDIENCE
// / CTAS / CONCEPTS / HOOKS. Same shape customize + settings already parse.
function productBlock(p) {
  if (!p) return "";
  const sections = [];
  if (p.product_name)    sections.push(noDashes(String(p.product_name).trim()));
  if (p.description)     sections.push(`DESCRIPTION\n${formatParagraph(p.description)}`);
  if (p.target_audience) sections.push(`TARGET AUDIENCE\n${formatParagraph(p.target_audience)}`);
  if (p.ctas)            sections.push(`CTAS\n${formatList(p.ctas)}`);
  if (p.concepts)        sections.push(`CONCEPTS\n${formatBlocks(p.concepts)}`);
  if (p.hooks)           sections.push(`HOOKS\n${formatList(p.hooks)}`);
  return sections.join("\n\n");
}
function formatBlueprint(ai, fallbackName) {
  const products = Array.isArray(ai.products) ? ai.products : [];
  const slots = {};
  products.forEach((p, i) => {
    const n = Number(p && p.slot);
    slots[n >= 1 && n <= MAX_PAGE_LINKS ? n : i + 1] = p;
  });
  return {
    name: noDashes(ai.name || fallbackName || ""),
    brandBio: formatParagraph(ai.bio),
    brandVoice: formatParagraph(ai.content_style || ai.voice),
    brandCta: formatList(ai.cta),
    niche: formatList(ai.niche),
    targetAudience: formatParagraph(ai.target_audience || ai.audience),
    audienceObjectives: formatList(ai.objectives),
    audiencePainPoints: formatList(ai.pain),
    productBlocks: Array.from({ length: MAX_PAGE_LINKS }, (_, i) => productBlock(slots[i + 1])),
  };
}

const BLUEPRINT_SYSTEM_PROMPT = `You build content blueprints that creators use to make short-form videos for a brand. ASSEMBLE from the brand source material below. Your reader is a creator: a UGC maker, a TikTok Shop affiliate, an employee, or the brand owner filming their own content. Every line must be something a creator can pick up and film today. The blueprint is also the brand's pitch to that creator: good creators get more briefs than they can take, so every section should quietly convince them this brand is good for their personal brand, their audience, and their earnings. Output strict JSON only. No markdown fences. No prose.

SOURCE MATERIAL
- Brand basics: the brand name, plus either a website URL or the brand's own description. Never both.
- With a website: a scrape of the site, plus up to five page scrapes, one per product or feature link. Skip missing slots entirely.
- With a description only: no scrapes. Work from the description, draw carefully on general knowledge of the category, keep brand-specific claims to what the description supports, placeholders for the rest.
- Three formats the brand picked, each with a name, a description, why it works, and the hook tactics and hook types used for that format (tags, often several of each).

STYLE RULES
- Plain, everyday language. No jargon: no ROI, KPIs, B2B, psychographics, funnel, synergy, compliance.
- Always write in English, translating any non-English source material.
- NEVER use em dashes. Use full stops, commas, colons or brackets.
- Ground every line in the source material. Do not invent specifics. If a detail cannot be verified, write a short placeholder in [square brackets].
- Concrete and specific. No abstract benefit language.

BRAND LEVEL: write these once, from the website scrape, or from the description when there is no website.
- name: Official brand name as it should appear in captions, with spaces.
- bio: Open with one product-led sentence in this shape: "We are [Brand], and we've created [the solution] for [target outcome]: [Product]. Made from [material or method], it's [USP one] and [USP two] that [core benefit] without [the usual trade-off]." Add one short belief line only if there is a genuine ownership story or stand worth telling (founder-led, family-owned, made somewhere specific, a cause it backs). Lead with the belief, not the action. Two to four sentences, persuasive like a strong sales letter but strictly factual.
- content_style: How the brand's videos should sound and feel, 2 to 3 sentences, so a creator can match the tone.
- cta: 3 simple lines a creator can say at the end of a video to move viewers to act.
- niche: 3 specific spaces the brand genuinely owns.
- target_audience: One tight paragraph in the second person, speaking to the creator about the person they are talking to. Three moves: paint who this audience is (what they follow, where they spend time, what they value, whose taste they trust); name the problem the brand solves at the audience's real awareness level, usually normalised background friction described in concrete physical detail, not dramatic pain; set the creator's stance, the friend who figured it out first and cannot stop talking about it, never a spokesperson or an advert.
- objectives: 3 goals a video for this brand should hit.
- pain: 3 real problems the brand solves for its audience.

PER PRODUCT OR FEATURE: write one object per page scrape provided, grounded in that page. Skip slots with no link.
- product_name: What this product or feature is called, from its page.
- description: 2 or 3 sentences, present tense, third person, plain and factual, no hype: the category in a word or two, what it does and who it is for, then the two or three qualities it is genuinely known for. Descriptive, not persuasive.
- target_audience: One tight paragraph, same three moves as the brand-level audience, for the specific buyer of this product or feature.
- ctas: 3 ready-to-say lines a creator can end a video about this specific product with.
- concepts: 3 filmable video concepts, one per format, in format order, each opening with the format name. Each is 3 to 5 sentences: the setting, the moment the product naturally enters, and what should be clear to the viewer by the end. Real not acted, message shown not stated, genuinely different from each other. End each with a rough length that fits the format.
- hooks: 3 spoken opening lines, one per format, in format order, each built using that format's hook tactics and hook types, choosing whichever tags fit this product best. Under 15 words, natural to say to camera. Every hook must stop the scroll, make this product's specific buyer feel called out, and give a reason to keep watching. Tie it to the exact problem this product solves so it only makes sense with this product in the video. No bait it cannot pay off. NEVER mention the brand by name in the hook line. NEVER use: "Have you ever", "scroll-stopping", "game-changing", "level up", "unlock", any ad cliche.

Keys (required): name, bio, content_style, cta, niche, target_audience, objectives, pain, products.
- name, bio, content_style, target_audience (string)
- cta, niche, objectives, pain (arrays of exactly 3 strings)
- products (array): one object per provided link, in slot order. Each object has these keys:
- slot (number): the slot number as given
- product_name (string)
- description (string)
- target_audience (string)
- ctas (array of exactly 3 strings)
- concepts (array of exactly 3 strings): format order, index 0 = format 1
- hooks (array of exactly 3 strings): format order, index 0 = format 1`;

// Per-format guidance — Description + Why It Works + Hook Tactic from
// the Softr Formats table (`p69Bcs6TjD5kiM`). Pulled 2026-05-19. Refresh
// from there when guidance changes. Used as `format_guidance` in the
// payload — when multiple formats are picked, the AI route concatenates
// them as "Demo: ... | Before and After: ... | Review: ...".
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

// Hook type per format — from formats table `Hook type` (SiwIX). Pulled 2026-07-09.
const FORMAT_HOOK_TYPES = {
  "AI Generated": "Visual Action, Caption",
  "ASMR": "Visual Action, Caption",
  "Before and After": "Visual Action, Caption",
  "Behind The Scenes": "Visual Action, Voiceover",
  "Celebrity": "Visual Action, Caption",
  "Cinematic B-Roll": "Visual Action, Caption",
  "Comment Response": "Caption, Voiceover",
  "Demo": "Visual Action, Voiceover",
  "Duet": "Visual Action, Caption",
  "Educational": "Voiceover, Caption",
  "Expert Explainer": "Voiceover, Visual Action",
  "Founder": "Voiceover, Visual Action",
  "Greenscreen": "Visual Action, Voiceover",
  "Grid Swap": "Visual Action, Caption",
  "How To": "Voiceover, Visual Action",
  "Humour": "Visual Action, Voiceover",
  "Influencer Endorsement": "Voiceover, Visual Action",
  "Listicle": "Caption, Voiceover",
  "Meme": "Caption, Visual Action",
  "Montage": "Visual Action, Caption",
  "POV": "Visual Action, Caption",
  "Pattern Interrupt": "Visual Action, Voiceover",
  "Podcast": "Voiceover, Caption",
  "Postit": "Caption, Visual Action",
  "Press": "Caption, Visual Action",
  "Problem Agitation": "Visual Action, Voiceover",
  "Reaction Video": "Visual Action, Voiceover",
  "Review": "Caption, Voiceover",
  "Screen Recording": "Visual Action, Voiceover",
  "Skit": "Visual Action, Voiceover",
  "Social Proof Mashup": "Visual Action, Caption",
  "Stitch": "Visual Action, Voiceover",
  "Stop Motion": "Visual Action, Caption",
  "Street Interview": "Voiceover, Visual Action",
  "Testimonial": "Voiceover, Visual Action",
  "Time Lapse": "Visual Action, Caption",
  "Transformation": "Visual Action, Voiceover",
  "Trend": "Visual Action, Caption",
  "Try-On": "Visual Action, Voiceover",
  "Unboxing": "Visual Action, Voiceover",
  "Whiteboard Explainer": "Voiceover, Visual Action",
  "Yapper": "Voiceover, Visual Action",
};

// ---- AI mode options ---------------------------------------------
const AI_MODE_OPTIONS = [
  {
    id: "5b1b9734-20b6-4070-bd32-a3a4d31d0ed9",
    label: "Autonomous",
    description: "I handle everything. I'll approve, flag, or reject content automatically and let creators know what to fix. You just check the dashboard.",
  },
  {
    id: "cf1fb41e-7deb-4a1a-aff4-02290407b432",
    label: "Hybrid",
    description: "I'll review everything and give you my recommendation, but you make the final call. Best of both worlds.",
    recommended: true,
  },
  {
    id: "b840eef9-5174-415b-981e-16b37ede1eb5",
    label: "Manual",
    description: "You review everything yourself. I'll give you insights and scores to help, but all decisions are yours.",
  },
];

// ---- QA checklist options ----------------------------------------
const QA_CHECK_OPTIONS = [
  { id: "1c014e7b-fc4b-462a-8081-9c485045b748", label: "Product visibility" },
  { id: "4b7319f2-9c96-4216-98b9-54b4ec4ed9a9", label: "Product usage" },
  { id: "ab481105-a6c9-4f62-82da-57420ae197f6", label: "Hook quality" },
  { id: "63856e72-bb9c-4de5-927b-3afc30a88551", label: "Visual hook" },
  { id: "5961652d-1e74-409b-af7a-968e2385895b", label: "Audio clarity" },
  { id: "a1457ddb-710d-4c63-ada8-0f5a571c8543", label: "Audio delivery" },
  { id: "265bfda9-da30-4251-bf2c-2ba87d1b2af4", label: "Pronunciation" },
  { id: "355ea7e9-f86f-42d3-9ee8-1a89a044e8db", label: "Music & sound balance" },
  { id: "07ef7746-1c9a-4438-923e-49ab63c3ce57", label: "Follows the brief" },
  { id: "78fe815c-c0fa-4433-95c9-78fb0d3cfb73", label: "Brand name mentioned" },
  { id: "8b17d1b1-b2b7-4dd1-b70e-49e415e1afe5", label: "Lighting & camera" },
  { id: "fe2b01a1-d876-4283-afd4-92c1ade28878", label: "Setting & background" },
  { id: "7135f0d2-3c8b-4ba9-aadd-95dbbfc21cbd", label: "Distracting elements" },
  { id: "06508651-5488-4fe3-bc9c-cf0417f65bcd", label: "Text legibility" },
  { id: "474a5dd4-fe33-4bb8-9544-a7adfb5bfee2", label: "Closed captions" },
  { id: "c7f14d97-fbab-44a8-b524-31de975cee16", label: "Safe zones" },
  { id: "e7443f15-4c43-42b4-9ed2-226371525c91", label: "Scene pacing" },
  { id: "28b4d084-fb7d-414c-b51f-c229856a7fb2", label: "Video length" },
  { id: "c9f111c2-3a56-44ad-82e8-211db1c2df4a", label: "Watchable on mute" },
  { id: "d5e005f5-b4f4-4d24-a9fe-560d21adb216", label: "Creator visability" },
  { id: "4875c5d3-4d5c-4f9d-881e-4aa558549d41", label: "Energy & authenticity" },
  { id: "44769cff-9feb-452c-a69d-a8bc204eb768", label: "Wardrobe & appearance" },
  { id: "bca11db7-edf0-4b0a-94ea-5f05f80aadcb", label: "CTA present" },
  { id: "3981544e-a463-4b80-b8df-28540b987501", label: "Brand alignment" },
  { id: "165f1575-d6b3-485b-b08b-58600de3041f", label: "Copyright check" },
  { id: "cff021c4-bf63-4ac9-993a-eb80b83b7965", label: "Inspiration link match" },
];

// Review Agents picker language, borrowed from the brief builder's
// checks panel so agents are explained the same way everywhere.
const AGENTS_ICON_URL =
  "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_review-eyes-glass-3d-clearer-periwinkle-transparent_2026-07.png";
const AGENT_TOOLTIPS = {
  "Brand alignment": "Watches that the video matches the brand's voice, look, and feel.",
  "Hook quality": "Watches the first 3 seconds to make sure it grabs attention without sounding like an ad.",
  "Watchable on mute": "Watches that the video still makes sense when the sound is off.",
  "Scene pacing": "Watches that the video changes scenes often enough to keep viewers from scrolling.",
  "Audio delivery": "Listens to the spoken script to make sure it's clear, natural, and on-brand.",
  "Visual hook": "Watches the first 3 seconds for a visual moment strong enough to stop the scroll.",
  "Lighting & camera": "Watches that the video is bright enough and the camera is steady and in focus.",
  "Closed captions": "Reads the captions to make sure they're accurate and easy to follow.",
  "Energy & authenticity": "Watches that the creator feels engaging and real, not scripted or flat.",
  "Text legibility": "Reads any on-screen text to make sure it's big enough and easy to see.",
  "Setting & background": "Watches that the background is tidy, on-brand, and not distracting.",
  "Product visibility": "Watches that the product shows clearly enough times across the video.",
  "Pronunciation": "Listens for the brand and product names to make sure they're said the right way.",
  "Copyright check": "Checks the music, fonts, and clips for anything that could break copyright rules.",
  "Music & sound balance": "Listens that the music doesn't drown out the voice.",
  "Wardrobe & appearance": "Watches that the creator's outfit fits the brand and looks intentional.",
  "Product usage": "Watches that the product is shown being used the way it's meant to be.",
  "Brand name mentioned": "Listens for the brand name to be said the agreed number of times.",
  "Audio clarity": "Listens that the audio is clean, no background noise, echo, or hum.",
  "Follows the brief": "Reads the brief and checks that the video matches what was asked for.",
  "Distracting elements": "Watches for anything in frame that pulls attention away from the product.",
  "Safe zones": "Watches that important content stays inside the platform's safe zones, away from edges and overlays.",
  "Video length": "Checks that the video runs for the right amount of time for the chosen format.",
  "CTA present": "Watches for a call to action in the video, a clear ask to the viewer.",
  "Inspiration link match": "Compares the video to the inspiration examples you linked on the brief.",
  "Creator visability": "Watches that the creator's face shows enough across the video.",
};

// Book-a-demo opens in a Softr modal so onboarding stays alive behind it.
function openBookACall() {
  if (typeof window.openSwModal === "function") window.openSwModal("/book-a-demo", "lg");
  else window.location.href = "/book-a-demo";
}

// ---- Threshold rows ----------------------------------------------
const THRESHOLD_ROWS = [
  {
    key: "productScreenTime", label: "Product visibility",
    description: "How much of the video the product is on screen.",
    options: [
      { id: "b35780d0-cf0c-4ad5-9819-88509bbcea7b", label: "40%" },
      { id: "adf5f58d-f355-456a-956e-bb3606953ca4", label: "50%" },
      { id: "ab1858bf-81ba-4d74-9299-05aee5ca27cc", label: "60%" },
      { id: "c9e7411b-92ad-4e9f-b307-0e2237a9d729", label: "70%" },
      { id: "61c37e78-9569-40de-8714-c988ebbfc9c5", label: "80%" },
      { id: "8ef83ca6-7faf-45ff-965b-dadff26490ed", label: "90%" },
      { id: "f7d50c89-87f3-4b8f-a2b1-ddaea2c5cec8", label: "100%" },
      { id: "5a044cc4-e9d8-400b-8327-a07908b873c4", label: "None" },
    ],
  },
  {
    key: "hookSpeed", label: "Audio hook timing",
    description: "How quickly the spoken hook needs to land.",
    options: [
      { id: "9df2a4cf-8700-4429-b511-a683203b0c09", label: "1 second" },
      { id: "d3b4b86b-17d9-4d6e-845d-ead62d45f9cb", label: "2 seconds" },
      { id: "7679470f-b9ef-4e1f-94b2-b62cda5b2c45", label: "3 seconds" },
      { id: "03dc29a7-e098-4b92-882b-fb9a95cea132", label: "5 seconds" },
      { id: "209d018e-2dcd-45d6-a643-ac78109ff33e", label: "None" },
    ],
  },
  {
    key: "visualHook", label: "Visual hook strength",
    description: "How visually striking the first frames need to be.",
    options: [
      { id: "9df2a4cf-8700-4429-b511-a683203b0c09", label: "60%" },
      { id: "f29966f4-72fe-419a-8174-45236991748e", label: "65%" },
      { id: "0ac7e1e4-3835-4213-bf1b-969041655ced", label: "70%" },
      { id: "19bff3f1-e5f8-419e-a338-6668211cc873", label: "75%" },
      { id: "f3f93ac8-7edc-47f4-b896-bdbee78da235", label: "80%" },
      { id: "9018f787-8e85-497a-86a7-2ba9810bada4", label: "85%" },
      { id: "237d1a0d-11bd-4ab8-8189-3dd22ab87127", label: "90%" },
      { id: "d3b4b86b-17d9-4d6e-845d-ead62d45f9cb", label: "None" },
    ],
  },
  {
    key: "ctaPlacement", label: "CTA placement",
    description: "Where the call-to-action should hit.",
    options: [
      { id: "33bfa39e-0740-4aa8-acf0-900305019279", label: "Last 3 seconds" },
      { id: "193e4f66-7852-4fca-960a-f8642773b828", label: "Last 5 seconds" },
      { id: "cd4956a2-5f0a-4d21-9a4c-a7b95f8f059b", label: "Last 7 seconds" },
      { id: "4b841326-cdb4-455a-a144-d7c3f2b31f0b", label: "Last 10 seconds" },
      { id: "8f234b73-3c77-444c-9cac-3a06a8201121", label: "None" },
    ],
  },
  {
    key: "faceTime", label: "Face time",
    description: "How much of the video shows a person.",
    options: [
      { id: "df9abb2d-d48b-41bb-a579-f1c37dd657e2", label: "20%" },
      { id: "48c105c0-e7ae-4a55-89b2-13fee1ea247a", label: "30%" },
      { id: "c6aa7f4f-1dce-4946-8d20-31dba36d8f3f", label: "40%" },
      { id: "b8c2c9b1-f745-4b0f-9636-557eea3d60b5", label: "50%" },
      { id: "b993622a-0760-466b-a2a0-dd54e332596e", label: "60%" },
      { id: "d2d7cd50-f83c-4442-9e84-b189088931be", label: "70%" },
      { id: "7994d112-b9d3-4307-b6b7-cbc353852132", label: "None" },
    ],
  },
  {
    key: "textLegibility", label: "Text legibility",
    description: "How readable on-screen text needs to be.",
    options: [
      { id: "172419f7-1149-490a-a44e-d13537cf6786", label: "70%" },
      { id: "82a7dafa-d93e-4dd9-9168-490cb66058eb", label: "80%" },
      { id: "b891de6f-d9da-4d6c-a963-d87ff2bd8621", label: "90%" },
      { id: "d94e5bdb-6850-4ecb-b316-aceee396e539", label: "100%" },
      { id: "bf8aaa4d-923f-4330-803a-877a29149922", label: "None" },
    ],
  },
  {
    key: "audioClarity", label: "Audio clarity",
    description: "How clean the audio needs to be.",
    options: [
      { id: "160aa42f-ad5f-4721-8d3c-a2db8e09fcd9", label: "70%" },
      { id: "e95cc790-2106-4f40-b2e6-971aa256618d", label: "80%" },
      { id: "393fe9bc-6206-4fd5-a952-ed6587763dca", label: "90%" },
      { id: "f317b2bc-7c04-43f9-859d-6db37b7628a9", label: "100%" },
      { id: "6b88224d-9a3f-4bfa-9e47-3143551d73ab", label: "None" },
    ],
  },
  {
    key: "engagementPacing", label: "Engagement pacing",
    description: "How often something visually changes.",
    options: [
      { id: "6fa82020-d6e2-4ff3-a0d3-94c783c4f680", label: "Every 2 seconds" },
      { id: "6a1ff582-aa09-40da-ba82-6212c86f99e6", label: "Every 3 seconds" },
      { id: "5528fc87-d2d3-4273-ba37-da90fae5bf3e", label: "Every 4 seconds" },
      { id: "a0034690-8372-4676-96c6-43e8a4c167cd", label: "Every 5 seconds" },
      { id: "0d707c11-b7fd-42cf-9450-c1293cd851b7", label: "None" },
    ],
  },
  {
    key: "brandMentionCount", label: "Brand mentions",
    description: "Minimum brand mentions in the video.",
    options: [
      { id: "1673c553-d650-47d3-b42b-3fa1be8f19dd", label: "0" },
      { id: "16e85382-54ad-4559-9b07-e42f920faf40", label: "1" },
      { id: "206736be-aad0-430f-98c7-3f0011390e86", label: "2" },
      { id: "d83d7d2f-00cc-4c1a-92ec-a362c5a47580", label: "3" },
      { id: "98ce1d25-8cf6-4879-a396-d6f57b065fa1", label: "4+" },
    ],
  },
];

// ---- Constants ----------------------------------------------------
const LEE_AVATAR = "https://res.cloudinary.com/dspv9nm1n/image/upload/v1771427670/obl2odsrkhunneswor46.png";
const FINISH_URL = "/new";

// =====================================================================
// Block — Steps 2-6 orchestrator
// =====================================================================
// Which account row is this? The workspace switcher's pick wins, then
// the set-up redirect, then the switcher's remembered pick. Re-read on
// EVERY render (same pattern as /settings/workspace and /settings/
// quality) so the switcher's soft navigation flows through — a
// mount-time snapshot goes stale and strands the block on "Almost
// there" until a hard reload.
function resolveTargetAccountId() {
  if (typeof window === "undefined") return "";
  try {
    const p = new URL(window.location.href).searchParams;
    const fromSwitcher = (p.get("workspace") || "").split(",").map((s) => s.trim()).filter(Boolean)[0];
    if (fromSwitcher) return fromSwitcher;
    const fromSetup = (p.get("accountId") || "").trim();
    if (fromSetup) return fromSetup;
    return window.localStorage.getItem("bl-active-workspace") || "";
  } catch { return ""; }
}

export default function Block() {
  const targetAccountId = resolveTargetAccountId();

  // Targeted fetch by explicit record id — switching workspaces changes
  // recordId, which re-queries cleanly even on soft navigation. The
  // list fetch only backstops a visit with no target at all (single-
  // account user landing bare).
  const targeted = useRecord({ recordId: targetAccountId, select, from: ds.accounts, enabled: !!targetAccountId });
  const fallback = useRecords({ select, from: ds.accounts, count: 1 });
  const fallbackRow =
    fallback.data?.pages?.[0]?.items?.[0] ??
    (Array.isArray(fallback.data) ? fallback.data[0] : null);

  const record = targetAccountId ? (targeted.data || null) : fallbackRow;
  const status = targetAccountId ? targeted.status : fallback.status;
  const refetch = targetAccountId ? targeted.refetch : fallback.refetch;

  const [currentStep, setCurrentStep] = useState(2);
  const [savedSteps, setSavedSteps] = useState({});
  const [skippedSteps, setSkippedSteps] = useState({});

  const ref2 = useRef(null);
  const ref4 = useRef(null);
  const ref5 = useRef(null);
  const ref6 = useRef(null);
  const stepRefs = { 2: ref2, 4: ref4, 5: ref5, 6: ref6 };

  // Step 2
  const [aiModeId, setAiModeId] = useState(null);
  // Step 4
  const [qaIds, setQaIds] = useState([]);
  // Step 5
  const [thresholds, setThresholds] = useState({});
  // Step 6
  const [editingField, setEditingField] = useState(null);
  const [editedValues, setEditedValues] = useState({});

  const updateRecord = useRecordUpdate({
    fields: updateFields,
    from: ds.accounts,
    async onSuccess() { await refetch(); },
    onError(err) {
      toast.error("Couldn't save", { description: err?.message || "Try again." });
    },
  });

  // Pre-fill from record (handles refresh / resume).
  // Softr's data layer surfaces fields under `record.fields.<alias>`,
  // NOT directly on `record`. (Confirmed by archive/screen-3 which
  // works correctly with this pattern.)
  useEffect(() => {
    if (!record) return;
    const f = record.fields || {};
    if (f.aiMode?.id && !aiModeId) setAiModeId(f.aiMode.id);
    if (Array.isArray(f.qaChecklist) && qaIds.length === 0) {
      setQaIds(f.qaChecklist.map((c) => c.id || c));
    }
    setThresholds((cur) => {
      const next = { ...cur };
      THRESHOLD_ROWS.forEach((r) => {
        if (f[r.key]?.id && !cur[r.key]) next[r.key] = f[r.key].id;
      });
      return next;
    });
  }, [record]); // eslint-disable-line

  const scrollTo = (step) => {
    const el = stepRefs[step]?.current;
    if (!el) return;
    setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };
  const advance = (toStep) => { setCurrentStep(toStep); scrollTo(toStep); };
  const markSavedAndAdvance = (step) => { setSavedSteps((c) => ({ ...c, [step]: true })); advance(step + 1); };
  const markSkippedAndAdvance = (step) => { setSkippedSteps((c) => ({ ...c, [step]: true })); advance(step + 1); };

  const save = (fieldsObj, after) => {
    if (!record?.id) { toast.error("Couldn't find your account record."); return; }
    updateRecord.mutate(
      { recordId: record.id, fields: fieldsObj },
      { onSuccess: () => { refetch(); after?.(); } },
    );
  };

  // ─── Blueprint engine (see the engine section above) ─────────────
  const user = useCurrentUser();
  const userRow = useRecord({ recordId: user?.id, select: userRead, from: ds.users, enabled: !!user?.id });
  const createProduct = useRecordCreate({ fields: productWrite, from: ds.products });
  const updateProduct = useRecordUpdate({ fields: productWrite, from: ds.products });
  const createProject = useRecordCreate({ fields: projectWrite, from: ds.projects });
  const createNotification = useRecordCreate({ fields: notificationWrite, from: ds.notifications });
  const proxyFirecrawl = useProxyFetch(ds.firecrawl);
  const proxyOpenRouter = useProxyFetch(ds.openrouter);
  // phase: idle | running | done | failed
  const [build, setBuild] = useState({ phase: "idle", note: "", error: "" });
  const buildRef = useRef({ accountId: "" });

  const runBuild = async (row, userFields) => {
    const f = row.fields || {};
    const accountId = row.id;
    const website = String(f.website || "").trim();
    const description = String(f.description || "").trim();
    const links = parsePageLinks(f.pageLinks);
    const formats = pickedFormatGuidance(f.preferredFormats);
    const stage = (note) => setBuild({ phase: "running", note, error: "" });
    try {
      stage(website ? "Reading your website" : "Reading your description");

      // 1. Scrape the website and every page link, in parallel. A page
      //    that fails is skipped, never fatal.
      const scrape = async (url) => {
        if (!url) return null;
        try {
          const target = /^https?:\/\//i.test(url) ? url : `https://${url}`;
          const res = await withTimeout(
            proxyFirecrawl(FIRECRAWL_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: target, formats: ["markdown"], onlyMainContent: true }),
            }),
            SCRAPE_TIMEOUT_MS,
            "Scrape",
          );
          if (!res.ok) { console.error("[blueprint] Firecrawl returned", res.status, url); return null; }
          const j = await res.json();
          const d = j?.data || j || {};
          const md = String(d.markdown || "");
          if (!md.trim()) return null;
          const meta = d.metadata || {};
          if (Number(meta.statusCode) >= 400) { console.error("[blueprint] page returned", meta.statusCode, url); return null; }
          return {
            markdown: md,
            title: String(meta.title || meta.ogTitle || meta["og:title"] || "").trim(),
            description: String(meta.description || meta.ogDescription || meta["og:description"] || "").trim(),
            image: String(meta.ogImage || meta["og:image"] || "").trim(),
          };
        } catch (e) { console.error("[blueprint] scrape failed:", url, e); return null; }
      };
      const [site, ...pageScrapes] = await Promise.all([
        website ? scrape(website) : Promise.resolve(null),
        ...links.map((l) => scrape(l.url)),
      ]);
      const pages = links.map((l, i) => ({ ...l, slot: i + 1, scrape: pageScrapes[i], text: trimForModel(pageScrapes[i]?.markdown) }));
      const siteText = trimForModel(site?.markdown);
      if (!siteText && !pages.some((p) => p.text) && !description) {
        throw new Error("We couldn't read your website, and there is no description to work from.");
      }

      // 2. One products row per page, created BEFORE the model call so
      //    the rows exist even if the writer fails. Rows already created
      //    by an earlier attempt (product_id on the link) are reused.
      if (pages.length) stage(`Saving ${pages.length} page${pages.length > 1 ? "s" : ""}`);
      const nowIso = new Date().toISOString();
      for (const p of pages) {
        if (p.product_id) continue;
        try {
          const created = await createProduct.mutateAsync({
            name: (p.scrape?.title || hostSlug(p.url)).slice(0, 120),
            accounts: [{ id: accountId }],
            type: PRODUCT_TYPE[p.type] || PRODUCT_TYPE.Product,
            url: p.url,
            description: p.scrape?.description || "",
            imageUrl: p.scrape?.image || "",
            scrape: capForStore(p.scrape?.markdown),
            scrapedAt: p.scrape ? nowIso : null,
            status: PRODUCT_ACTIVE,
          });
          p.product_id = created?.id || created?.recordId || "";
        } catch (e) { console.error("[blueprint] product create failed:", p.url, e); }
      }

      // 3. The writer. Brand-level keys in one call, each page in its own
      //    call, all in parallel, so no single call outruns the proxy.
      //    max_tokens is set (providers apply their own caps otherwise and
      //    truncate). Any call that fails on V4 Pro is retried on V4 Flash.
      stage("Writing your blueprint");
      const callModel = async ({ model, temperature, userPrompt, maxTokens }) => {
        const res = await withTimeout(
          proxyOpenRouter(OPENROUTER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model,
              temperature,
              max_tokens: maxTokens,
              response_format: { type: "json_object" },
              provider: { sort: "throughput" },
              messages: [
                { role: "system", content: BLUEPRINT_SYSTEM_PROMPT },
                { role: "user", content: userPrompt },
              ],
            }),
          }),
          MODEL_TIMEOUT_MS,
          "The writer",
        );
        if (!res.ok) throw new Error(`The writer is busy right now (${res.status}).`);
        const j = await res.json();
        const raw = j?.choices?.[0]?.message?.content || "";
        const text = Array.isArray(raw) ? raw.map((x) => x?.text || "").join("\n") : String(raw);
        return safeParseJson(text);
      };
      // Pro first, Flash if Pro fails or times out, one quiet retry each.
      const write = async (userPrompt, maxTokens, accept) => {
        const attempts = [
          { model: BLUEPRINT_MODEL, temperature: 0.3 },
          { model: BLUEPRINT_FALLBACK_MODEL, temperature: 0.3 },
          { model: BLUEPRINT_FALLBACK_MODEL, temperature: 0.4 },
        ];
        let lastErr = null;
        for (const a of attempts) {
          try {
            const out = await callModel({ ...a, userPrompt, maxTokens });
            if (out && accept(out)) return out;
            lastErr = new Error("The blueprint came back in a shape we could not read.");
          } catch (e) { lastErr = e; console.error("[blueprint] writer attempt failed:", a.model, e); }
        }
        throw lastErr || new Error("The writer did not answer.");
      };
      const baseArgs = { workspaceName: f.name, description, website, siteText, formats };
      const livePages = pages.filter((p) => p.text);
      const brandAsk = "Write ONLY the brand-level keys now: name, bio, content_style, cta, niche, target_audience, objectives, pain. Set \"products\" to an empty array. The product or feature pages above are context for the brand; their own objects are written separately.";
      const productAsk = (p) => `Write ONLY {"products": [ one object for slot ${p.slot} ]} now, grounded in PRODUCT OR FEATURE PAGE ${p.slot}. The website scrape is context only. Do not write the brand-level keys.`;
      const [brand, ...productOuts] = await Promise.all([
        write(buildUserPrompt({ ...baseArgs, pages: livePages, ask: brandAsk }), 2500, (o) => !!(o.bio || o.name)),
        ...livePages.map((p) =>
          write(buildUserPrompt({ ...baseArgs, pages: [p], ask: productAsk(p) }), 2000, (o) => Array.isArray(o.products) && o.products.length > 0)
            .catch((e) => { console.error("[blueprint] page", p.slot, "skipped:", e); return null; }),
        ),
      ]);
      const ai = { ...brand, products: [] };
      productOuts.forEach((o, i) => {
        const obj = o && Array.isArray(o.products) ? o.products[0] : null;
        if (obj) ai.products.push({ ...obj, slot: livePages[i].slot });
      });

      // 4. Format exactly as the old Format step did, then write the row.
      stage("Saving your blueprint");
      const out = formatBlueprint(ai, f.name);
      const scr = (p) => capForStore(p?.scrape?.markdown);
      const linkIds = (arr) => (Array.isArray(arr) ? arr : []).filter((x) => x?.id).map((x) => ({ id: x.id }));
      const fields = {
        name: out.name || f.name,
        brandBio: out.brandBio,
        brandVoice: out.brandVoice,
        brandCta: out.brandCta,
        niche: out.niche,
        targetAudience: out.targetAudience,
        audienceObjectives: out.audienceObjectives,
        audiencePainPoints: out.audiencePainPoints,
        productOrFeature1: out.productBlocks[0],
        productOrFeature2: out.productBlocks[1],
        productOrFeature3: out.productBlocks[2],
        websiteScrape: capForStore(site?.markdown),
        page1Scrape: scr(pages[0]),
        page2Scrape: scr(pages[1]),
        page3Scrape: scr(pages[2]),
        communityLinks: `Email:${userFields.email || user?.email || ""}\n\nWebsite:${website}`,
        pageLinks: JSON.stringify(pages.map((p) => ({ url: p.url, type: p.type, product_id: p.product_id || "" }))),
        blueprintStatus: BLUEPRINT_COMPLETE,
        status: ACCOUNT_ACTIVE,
      };
      if (user?.id) fields.owner = [{ id: user.id }];
      const billing = linkIds(userFields.billing);
      const usage = linkIds(userFields.usage);
      if (billing.length) fields.billing = billing;
      if (usage.length) fields.usage = usage;
      await updateRecord.mutateAsync({ recordId: accountId, fields });

      // 5. Each page's blueprint block onto its products row (best effort).
      for (let i = 0; i < pages.length; i++) {
        const p = pages[i];
        const block = out.productBlocks[i];
        if (!p.product_id || !block) continue;
        try { await updateProduct.mutateAsync({ recordId: p.product_id, fields: { description: block } }); }
        catch (e) { console.error("[blueprint] product description failed:", p.url, e); }
      }

      // 6. First project + in-app notification, as the workflow did.
      try {
        await createProject.mutateAsync({
          name: `${out.name || f.name}'s First Project`,
          accounts: [{ id: accountId }],
          users: user?.id ? [{ id: user.id }] : [],
          status: PROJECT_DRAFT,
        });
      } catch (e) { console.error("[blueprint] project create failed:", e); }
      try {
        await createNotification.mutateAsync({
          type: NOTIFY_ACCOUNT_CREATED,
          accounts: [{ id: accountId }],
          users: user?.id ? [{ id: user.id }] : [],
        });
      } catch (e) { console.error("[blueprint] notification create failed:", e); }

      setBuild({ phase: "done", note: "", error: "" });
      try { await refetch(); } catch { /* the row is written; a refresh shows it */ }
    } catch (e) {
      console.error("[blueprint] build failed:", e);
      setBuild({ phase: "failed", note: "", error: e?.message || "Something went wrong." });
      try { await updateRecord.mutateAsync({ recordId: accountId, fields: { blueprintStatus: BLUEPRINT_FAILED } }); }
      catch { /* leave it Pending; the next visit retries */ }
    }
  };

  // Start once per account row, only while Pending. A Failed row waits
  // for the Try again button so a dead site is not re-billed on every
  // visit. The user row is needed first (email, billing, usage).
  const bpLabel = record?.fields?.blueprintStatus?.label || "";
  useEffect(() => {
    if (!record?.id || bpLabel !== "Pending") return;
    if (user?.id && userRow.status !== "success" && userRow.status !== "error") return;
    if (buildRef.current.accountId === record.id) return;
    buildRef.current = { accountId: record.id };
    runBuild(record, userRow.data?.fields || {});
  }, [record?.id, bpLabel, userRow.status]); // eslint-disable-line

  const retryBuild = () => {
    if (!record?.id || build.phase === "running") return;
    buildRef.current = { accountId: record.id };
    runBuild(record, userRow.data?.fields || {});
  };

  // ─── Save handlers per step ───────────────────────────────────
  // Step 3 (the "How Brieflee works" explainer) is removed. Step 2
  // advances directly to Step 4.
  const handleStep2 = () => {
    if (!aiModeId) return;
    const m = AI_MODE_OPTIONS.find((x) => x.id === aiModeId);
    save({ aiMode: m ? { id: m.id, label: m.label } : null }, () => {
      setSavedSteps((c) => ({ ...c, 2: true }));
      advance(4);
    });
  };
  // Skip = write the recommended default (Hybrid) so the account never
  // sits without a review mode.
  const handleStep2Skip = () => {
    const hybrid = AI_MODE_OPTIONS.find((x) => x.label === "Hybrid");
    // Step 3 no longer exists: skip lands on Step 4, like Save does.
    save({ aiMode: { id: hybrid.id, label: hybrid.label } }, () => {
      setSkippedSteps((c) => ({ ...c, 2: true }));
      advance(4);
    });
  };
  const handleStep4 = ({ skip } = {}) => {
    if (skip) return markSkippedAndAdvance(4);
    save({ qaChecklist: qaIds }, () => markSavedAndAdvance(4));
  };
  const handleStep5 = ({ skip } = {}) => {
    if (skip) return markSkippedAndAdvance(5);
    const fields = {};
    Object.entries(thresholds).forEach(([key, optId]) => {
      const row = THRESHOLD_ROWS.find((r) => r.key === key);
      const opt = row?.options.find((o) => o.id === optId);
      if (opt) fields[key] = { id: opt.id, label: opt.label };
    });
    save(fields, () => markSavedAndAdvance(5));
  };
  // Completion: confetti + a founder note over it. No auto-redirect —
  // the card's CTA takes them to the dashboard when they're ready.
  const [showConfetti, setShowConfetti] = useState(false);
  const finishWithConfetti = () => {
    setShowConfetti(true);
  };

  // Self-refresh while the workspace is still being created. /set-up
  // fires the BL | New Workspace workflow (40-60s of scrape + AI
  // enrichment); if this page loads before the account row exists, keep
  // refetching instead of dead-ending on "try refreshing".
  const missingRecord = status === "success" && !record;
  const [refreshAttempts, setRefreshAttempts] = useState(0);
  useEffect(() => {
    if (!missingRecord) return;
    if (refreshAttempts >= 40) return; // ~2 minutes, then show the fallback
    const t = setTimeout(async () => {
      try { await refetch(); } catch { /* keep trying */ }
      setRefreshAttempts((n) => n + 1);
    }, 3000);
    return () => clearTimeout(t);
  }, [missingRecord, refreshAttempts, refetch]);
  const handleStep6 = () => {
    const blueprintKeys = ["name", "brandBio", "brandVoice", "brandCta", "niche", "targetAudience", "audiencePainPoints", "audienceObjectives", "productOrFeature1", "productOrFeature2", "productOrFeature3"];
    const updates = {};
    blueprintKeys.forEach((k) => {
      if (editedValues[k] !== undefined) updates[k] = editedValues[k];
    });
    if (Object.keys(updates).length === 0) { finishWithConfetti(); return; }
    save(updates, finishWithConfetti);
  };

  if (status === "pending") return <Loading />;
  if (status === "error") return <Loading error />;
  if (!record) {
    return refreshAttempts < 40 ? (
      <Loading message="Setting up your workspace. This page will refresh itself, no need to do anything." />
    ) : (
      <Loading message="Your workspace is taking longer than usual. It is still being set up in the background.">
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
          <button
            onClick={() => { setRefreshAttempts(0); }}
            style={{ background: "#7A93FF", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
          >
            Keep checking
          </button>
          <button
            onClick={openBookACall}
            style={{ background: "#fff", color: "#000F4D", border: "1px solid #D9E0FF", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
          >
            Book a 15-min setup call
          </button>
        </div>
      </Loading>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(to bottom, rgba(217, 224, 255, 0.15), rgba(255, 255, 255, 1))" }}>
      <Style />
      {showConfetti && <Confetti />}
      {showConfetti && <FounderFinish />}
      <ProgressDots currentStep={currentStep} />

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <section ref={ref2}>
            <Step2
              active={currentStep === 2}
              done={!!savedSteps[2] || !!skippedSteps[2]}
              onSkip={handleStep2Skip}
              aiModeId={aiModeId} setAiModeId={setAiModeId}
              onSave={handleStep2}
              saving={updateRecord.status === "pending" && currentStep === 2}
            />
          </section>

          {currentStep >= 4 && (
            <section ref={ref4}>
              <Step4
                active={currentStep === 4}
                done={!!savedSteps[4]}
                skipped={!!skippedSteps[4]}
                qaIds={qaIds} setQaIds={setQaIds}
                onSave={() => handleStep4()}
                onSkip={() => handleStep4({ skip: true })}
                saving={updateRecord.status === "pending" && currentStep === 4}
              />
            </section>
          )}

          {currentStep >= 5 && (
            <section ref={ref5}>
              <Step5
                active={currentStep === 5}
                done={!!savedSteps[5]}
                skipped={!!skippedSteps[5]}
                thresholds={thresholds} setThresholds={setThresholds}
                onSave={() => handleStep5()}
                onSkip={() => handleStep5({ skip: true })}
                saving={updateRecord.status === "pending" && currentStep === 5}
              />
            </section>
          )}

          {currentStep >= 6 && (
            <section ref={ref6}>
              <Step6
                active={currentStep === 6}
                done={!!savedSteps[6]}
                blueprintReady={record?.fields?.blueprintStatus?.label === "Complete"}
                build={build}
                onRetry={retryBuild}
                record={record}
                editingField={editingField} setEditingField={setEditingField}
                editedValues={editedValues} setEditedValues={setEditedValues}
                onFinish={handleStep6}
                onSkip={finishWithConfetti}
                onRefetch={refetch}
                saving={updateRecord.status === "pending" && currentStep === 6}
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// Step 2 - Review mode
// =====================================================================
function Step2({ active, done, aiModeId, setAiModeId, onSave, onSkip, saving }) {
  const [showTyping1, setShowTyping1] = useState(false);
  const [showMessage1, setShowMessage1] = useState(false);
  const [showTyping2, setShowTyping2] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [showTyping3, setShowTyping3] = useState(false);
  const [showMessage2, setShowMessage2] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (!active) return;
    const t = [];
    t.push(setTimeout(() => setShowTyping1(true), 300));
    t.push(setTimeout(() => { setShowTyping1(false); setShowMessage1(true); }, 2000));
    t.push(setTimeout(() => setShowTyping2(true), 2500));
    t.push(setTimeout(() => { setShowTyping2(false); setShowCard(true); }, 4000));
    t.push(setTimeout(() => setShowTyping3(true), 4500));
    t.push(setTimeout(() => { setShowTyping3(false); setShowMessage2(true); }, 6000));
    t.push(setTimeout(() => setShowButton(true), 6500));
    return () => t.forEach(clearTimeout);
  }, [active]);

  if (done) return null;

  return (
    <div>
      {showTyping1 && <TypingWithAvatar />}
      {showMessage1 && <BubbleWithAvatar>How involved do you want to be when content comes in?</BubbleWithAvatar>}
      {showTyping2 && <TypingNoAvatar />}

      {showCard && (
        <div className="mb-4 ml-10 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="space-y-3 max-w-lg">
            {AI_MODE_OPTIONS.map((m) => {
              const sel = aiModeId === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setAiModeId(m.id)}
                  className="w-full text-left px-4 py-3 rounded-xl transition-all duration-200 bg-white shadow-sm"
                  style={{
                    border: sel ? "2px solid #7A93FF" : "1px solid rgba(217, 224, 255, 0.4)",
                    backgroundColor: sel ? "rgba(122, 147, 255, 0.05)" : "#fff",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm" style={{ color: "#000F4D", fontWeight: 500 }}>{m.label}</h4>
                    {m.recommended && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#D9E0FF", color: "#294FF6", fontWeight: 500 }}>Recommended</span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "#001364", fontWeight: 300 }}>{m.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showTyping3 && <TypingWithAvatar />}
      {showMessage2 && <BubbleWithAvatar>You can change this anytime in your settings.</BubbleWithAvatar>}

      {showButton && (
        <div className="mb-4 ml-10 animate-in fade-in slide-in-from-bottom-3 duration-500 flex items-center gap-4">
          <Button
            onClick={onSave}
            disabled={!aiModeId || saving}
            className="text-sm py-2 px-5 shadow-sm hover:shadow-md transition-all duration-300"
            style={{
              backgroundColor: !aiModeId ? "#D9E0FF" : "#7A93FF",
              color: "#fff", borderRadius: 8, fontWeight: 500,
              cursor: !aiModeId ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
          <button
            onClick={onSkip}
            disabled={saving}
            className="text-xs"
            style={{ color: "#001364", fontWeight: 300, background: "transparent", border: "none", cursor: "pointer" }}
          >
            Skip — use Hybrid
          </button>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// Step 4 - QA Checklist (skippable)
// =====================================================================
function Step4({ active, done, skipped, qaIds, setQaIds, onSave, onSkip, saving }) {
  const [s1, setS1] = useState(false);
  const [m1, setM1] = useState(false);
  const [s2, setS2] = useState(false);
  const [m2, setM2] = useState(false);
  const [s3, setS3] = useState(false);
  const [m3, setM3] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [s4, setS4] = useState(false);
  const [m4, setM4] = useState(false);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    if (!active) return;
    const t = [];
    t.push(setTimeout(() => setS1(true), 300));
    t.push(setTimeout(() => { setS1(false); setM1(true); }, 1800));
    t.push(setTimeout(() => setS2(true), 2300));
    t.push(setTimeout(() => { setS2(false); setM2(true); }, 4100));
    t.push(setTimeout(() => setS3(true), 4600));
    t.push(setTimeout(() => { setS3(false); setM3(true); }, 6500));
    t.push(setTimeout(() => setShowCard(true), 7000));
    t.push(setTimeout(() => setS4(true), 7500));
    t.push(setTimeout(() => { setS4(false); setM4(true); }, 8800));
    t.push(setTimeout(() => setShowActions(true), 9300));
    return () => t.forEach(clearTimeout);
  }, [active]);

  if (done || skipped) return null;

  const toggle = (id) => setQaIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  return (
    <div>
      {s1 && <TypingWithAvatar />}
      {m1 && <BubbleWithAvatar>Now let's set your defaults for quick reviews.</BubbleWithAvatar>}
      {s2 && <TypingNoAvatar />}
      {m2 && <BubbleNoAvatar>Quick reviews are for one-off videos with no brief attached. Like when a creator sends you something and you just want to check it.</BubbleNoAvatar>}
      {s3 && <TypingNoAvatar />}
      {m3 && <BubbleNoAvatar>Pick the agents you'd always want watching those. If you attach a brief later, the brief's agents take over, so don't overthink this.</BubbleNoAvatar>}

      {showCard && (
        <div className="mb-4 ml-10 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border: "1px solid rgba(217, 224, 255, 0.4)" }}>
            <div className="flex items-start gap-3 mb-3">
              <img
                src={AGENTS_ICON_URL}
                alt=""
                draggable={false}
                style={{ width: 44, height: 44, objectFit: "contain", flexShrink: 0 }}
              />
              <div>
                <h3 className="text-base font-medium" style={{ color: "#001364" }}>Review Agents</h3>
                <p className="text-xs" style={{ color: "#6B7A99", fontWeight: 300, lineHeight: 1.5 }}>
                  AI agents watch every video you review. Pick the ones that should
                  always run on quick reviews. Hover any agent to see what it watches.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QA_CHECK_OPTIONS.map((opt) => {
                const on = qaIds.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggle(opt.id)}
                    title={AGENT_TOOLTIPS[opt.label] || ""}
                    className="text-xs rounded-full px-3 py-1.5 transition-all duration-150"
                    style={{
                      background: on ? "#7A93FF" : "#fff",
                      color: on ? "#fff" : "#001364",
                      border: on ? "1px solid #7A93FF" : "1px solid rgba(217, 224, 255, 0.7)",
                      fontWeight: on ? 600 : 400,
                    }}
                  >
                    {on ? "✓ " : ""}{opt.label}
                  </button>
                );
              })}
            </div>
            <div className="text-xs mt-3" style={{ color: "#7A93FF" }}>
              {qaIds.length === 0
                ? "No agents watching yet. You'll pick them each time."
                : `${qaIds.length} agent${qaIds.length === 1 ? "" : "s"} watching every quick review.`}
            </div>
          </div>
        </div>
      )}

      {s4 && <TypingWithAvatar />}
      {m4 && <BubbleWithAvatar>Or skip and pick checks each time.</BubbleWithAvatar>}

      {showActions && (
        <div className="mb-4 ml-10 flex gap-2 items-center animate-in fade-in slide-in-from-bottom-3 duration-500">
          <Button onClick={onSkip} disabled={saving} className="text-sm py-2 px-5" style={{ background: "#fff", color: "#001364", border: "1px solid rgba(217, 224, 255, 0.7)", borderRadius: 8, fontWeight: 500 }}>
            Skip
          </Button>
          <Button onClick={onSave} disabled={saving} className="text-sm py-2 px-5 shadow-sm hover:shadow-md transition-all duration-300" style={{ background: "#7A93FF", color: "#fff", borderRadius: 8, fontWeight: 500 }}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// Step 5 - Thresholds (skippable)
// =====================================================================
function Step5({ active, done, skipped, thresholds, setThresholds, onSave, onSkip, saving }) {
  const [s1, setS1] = useState(false);
  const [m1, setM1] = useState(false);
  const [s2, setS2] = useState(false);
  const [m2, setM2] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [s3, setS3] = useState(false);
  const [m3, setM3] = useState(false);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    if (!active) return;
    const t = [];
    t.push(setTimeout(() => setS1(true), 300));
    t.push(setTimeout(() => { setS1(false); setM1(true); }, 1800));
    t.push(setTimeout(() => setS2(true), 2300));
    t.push(setTimeout(() => { setS2(false); setM2(true); }, 4100));
    t.push(setTimeout(() => setShowCard(true), 4600));
    t.push(setTimeout(() => setS3(true), 5100));
    t.push(setTimeout(() => { setS3(false); setM3(true); }, 6900));
    t.push(setTimeout(() => setShowActions(true), 7400));
    return () => t.forEach(clearTimeout);
  }, [active]);

  if (done || skipped) return null;

  const setOne = (rowKey, optId) => setThresholds((cur) => {
    const next = { ...cur };
    if (cur[rowKey] === optId) delete next[rowKey];
    else next[rowKey] = optId;
    return next;
  });
  const selected = Object.keys(thresholds).length;

  return (
    <div>
      {s1 && <TypingWithAvatar />}
      {m1 && <BubbleWithAvatar>Now how strict each check should be.</BubbleWithAvatar>}
      {s2 && <TypingNoAvatar />}
      {m2 && <BubbleNoAvatar>Set a threshold for the ones you care about. Leave the rest blank and we'll ignore them.</BubbleNoAvatar>}

      {showCard && (
        <div className="mb-4 ml-10 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4" style={{ border: "1px solid rgba(217, 224, 255, 0.4)" }}>
            <div>
              <h3 className="text-base font-medium" style={{ color: "#001364" }}>Default standards</h3>
              <p className="text-xs" style={{ color: "#7A93FF", fontWeight: 300 }}>Quality bar for each check</p>
            </div>
            <div className="space-y-4">
              {THRESHOLD_ROWS.map((row) => {
                const required = !!thresholds[row.key];
                return (
                  <div key={row.key} className="space-y-1.5 pb-3" style={{ borderBottom: "1px dashed rgba(217, 224, 255, 0.6)" }}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <label className="text-xs font-medium block" style={{ color: "#001364" }}>{row.label}</label>
                        <p className="text-xs leading-relaxed" style={{ color: "#000F4D", fontWeight: 300 }}>{row.description}</p>
                      </div>
                      <Switch
                        checked={required}
                        onCheckedChange={(checked) => {
                          if (!checked) {
                            setThresholds((c) => { const n = { ...c }; delete n[row.key]; return n; });
                          } else {
                            const firstReal = row.options.find((o) => o.label !== "None") || row.options[0];
                            if (firstReal) setOne(row.key, firstReal.id);
                          }
                        }}
                      />
                    </div>
                    {required && (
                      <div className="flex flex-wrap gap-1.5 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        {row.options.filter((opt) => opt.label !== "None").map((opt) => {
                          const on = thresholds[row.key] === opt.id;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => setOne(row.key, opt.id)}
                              className="text-xs rounded-full px-3 py-1 transition-all duration-150"
                              style={{
                                background: on ? "#7A93FF" : "#fff",
                                color: on ? "#fff" : "#001364",
                                border: on ? "1px solid #7A93FF" : "1px solid rgba(217, 224, 255, 0.7)",
                                fontWeight: on ? 600 : 400,
                              }}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="text-xs" style={{ color: "#7A93FF" }}>
              {selected === 0 ? "No thresholds set." : `${selected} threshold${selected === 1 ? "" : "s"} set.`}
            </div>
          </div>
        </div>
      )}

      {s3 && <TypingWithAvatar />}
      {m3 && <BubbleWithAvatar>Briefs override these too, so this is just your safety net for quick reviews.</BubbleWithAvatar>}

      {showActions && (
        <div className="mb-4 ml-10 flex gap-2 items-center animate-in fade-in slide-in-from-bottom-3 duration-500">
          <Button onClick={onSkip} disabled={saving} className="text-sm py-2 px-5" style={{ background: "#fff", color: "#001364", border: "1px solid rgba(217, 224, 255, 0.7)", borderRadius: 8, fontWeight: 500 }}>
            Skip
          </Button>
          <Button onClick={onSave} disabled={saving} className="text-sm py-2 px-5 shadow-sm hover:shadow-md transition-all duration-300" style={{ background: "#7A93FF", color: "#fff", borderRadius: 8, fontWeight: 500 }}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// Step 6 - Content blueprint review
// =====================================================================
const BLUEPRINT_FIELDS_CONFIG = [
  { key: "brandBio", label: "Brand Bio", placeholder: "Describe your brand..." },
  { key: "brandVoice", label: "Content Style", placeholder: "How your content should sound and feel..." },
  { key: "brandCta", label: "Brand CTA", placeholder: "Your call to action..." },
  { key: "targetAudience", label: "Target Audience", placeholder: "Who is your target audience..." },
  { key: "audiencePainPoints", label: "Audience Pain Points", placeholder: "What problems do they face..." },
  { key: "audienceObjectives", label: "Audience Objectives", placeholder: "What are their goals..." },
  { key: "niche", label: "Niche", placeholder: "Your niche..." },
  { key: "productOrFeature1", label: "Product / Feature 1", placeholder: "What creators should know about this product or feature..." },
  { key: "productOrFeature2", label: "Product / Feature 2", placeholder: "What creators should know about this product or feature..." },
  { key: "productOrFeature3", label: "Product / Feature 3", placeholder: "What creators should know about this product or feature..." },
];

// product_or_feature_1-3 arrive as "Name\nDESCRIPTION\n...\nHOOKS\n..."
// — first line is the product name, then ALL-CAPS section headings.
// Parse that shape so the accordion can show the real product name as
// the row label and render each section under a styled eyebrow.
function parseProductBlob(text) {
  if (!text) return null;
  const lines = text.replace(/<br\s*\/?>/gi, "\n").split("\n");
  const isHeading = (t) => t.length > 2 && t === t.toUpperCase() && /^[A-Z][A-Z &/\-]*$/.test(t.replace(/\s+/g, " "));
  let name = "";
  const sections = [];
  let current = null;
  lines.forEach((line) => {
    const t = line.trim();
    if (!t) return;
    if (isHeading(t)) { current = { heading: t, body: [] }; sections.push(current); return; }
    if (!current) {
      if (!name) { name = t; return; }
      current = { heading: "", body: [] };
      sections.push(current);
    }
    current.body.push(line);
  });
  if (!name && sections.length === 0) return null;
  return { name, sections: sections.map((s) => ({ heading: s.heading, body: s.body.join("\n") })) };
}

function ProductRead({ parsed }) {
  return (
    <div>
      {parsed.sections.map((s, i) => (
        <div key={i} style={{ marginTop: i === 0 ? 0 : 12 }}>
          {s.heading && (
            <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7A93FF", marginBottom: 3 }}>
              {s.heading}
            </div>
          )}
          <div className="text-sm leading-relaxed" style={{ color: "#000F4D", fontWeight: 300 }}>
            {formatTextWithBullets(s.body)}
          </div>
        </div>
      ))}
    </div>
  );
}

// One-line teaser for a collapsed blueprint section: first ~ line of
// plain text, CSS ellipsis does the clipping.
function teaserOf(text) {
  if (!text) return "";
  return text
    .replace(/<br\s*\/?>/gi, " ")
    .split("\n")
    .map((l) => l.trim().replace(/^[•\-\*]\s+/, ""))
    .filter(Boolean)
    .join(" · ");
}

function formatTextWithBullets(text) {
  if (!text) return null;
  let cleaned = text.replace(/<br\s*\/?>/gi, "\n");
  const lines = cleaned.split("\n").filter((l) => l.trim());
  if (lines.length === 0) return null;
  const elements = [];
  let currentList = [];
  lines.forEach((line) => {
    const trimmed = line.trim();
    const bullet = trimmed.match(/^([•\-\*])\s+(.+)$/);
    if (bullet) {
      currentList.push(bullet[2]);
    } else {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-2">
            {currentList.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        );
        currentList = [];
      }
      elements.push(<div key={`text-${elements.length}`}>{trimmed}</div>);
    }
  });
  if (currentList.length > 0) {
    elements.push(
      <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-2">
        {currentList.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    );
  }
  return elements.length > 0 ? elements : null;
}

function Step6({ active, done, blueprintReady, build, onRetry, record, editingField, setEditingField, editedValues, setEditedValues, onFinish, onSkip, onRefetch, saving }) {
  const [showTyping0, setShowTyping0] = useState(false);
  const [showMessage1, setShowMessage1] = useState(false);
  const [showTyping1, setShowTyping1] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [showTyping2, setShowTyping2] = useState(false);
  const [showMessage2, setShowMessage2] = useState(false);
  const [showButton, setShowButton] = useState(false);
  // Accordion: at most ONE blueprint section open at a time. Collapsed
  // rows show a one-line teaser; the pencil opens straight into edit.
  const [openField, setOpenField] = useState(null);

  useEffect(() => {
    if (!active) return;
    const t = [];
    t.push(setTimeout(() => setShowTyping0(true), 500));
    t.push(setTimeout(() => { setShowTyping0(false); setShowMessage1(true); }, 3000));
    t.push(setTimeout(() => setShowTyping1(true), 3500));
    t.push(setTimeout(() => { setShowTyping1(false); setShowCard(true); }, 5000));
    t.push(setTimeout(() => setShowTyping2(true), 5500));
    t.push(setTimeout(() => { setShowTyping2(false); setShowMessage2(true); }, 7000));
    t.push(setTimeout(() => setShowButton(true), 7500));
    return () => t.forEach(clearTimeout);
  }, [active]);

  if (done) return null;

  const getFieldValue = (key) => {
    if (editedValues[key] !== undefined) return editedValues[key];
    const v = record?.fields?.[key];
    if (typeof v === "object" && v?.label) return v.label;
    return v || "";
  };

  return (
    <div>
      {showTyping0 && <TypingWithAvatar />}

      {showMessage1 && (
        <BubbleWithAvatar>
          Great! I've analyzed your brand and created a content blueprint. Tap any section to read it in full, or hit the pencil to edit it.
        </BubbleWithAvatar>
      )}

      {showTyping1 && <TypingNoAvatar />}

      {showCard && (
        <div className="mb-4 ml-10 animate-in fade-in slide-in-from-bottom-3 duration-500">
          {!blueprintReady && (
            <BuildStrip build={build} failedOnRow={record?.fields?.blueprintStatus?.label === "Failed"} onRetry={onRetry} onRefetch={onRefetch} />
          )}
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4" style={{ border: "1px solid rgba(217, 224, 255, 0.4)" }}>
            <div className="space-y-2 pb-3 border-b" style={{ borderColor: "rgba(217, 224, 255, 0.4)" }}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium" style={{ color: "#001364" }}>Brand Name</label>
                {editingField !== "name" && (
                  <button onClick={() => setEditingField("name")} className="p-1 hover:bg-gray-100 rounded transition-colors" style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                    <Edit2 className="w-3.5 h-3.5" style={{ color: "#7A93FF" }} />
                  </button>
                )}
              </div>
              {editingField === "name" ? (
                <input
                  type="text"
                  value={getFieldValue("name")}
                  onChange={(e) => setEditedValues({ ...editedValues, name: e.target.value })}
                  onBlur={() => setEditingField(null)}
                  placeholder="Enter brand name..."
                  className="w-full text-2xl font-medium border rounded-lg px-3 py-2"
                  style={{ borderColor: "#7A93FF", color: "#001364" }}
                  autoFocus
                />
              ) : (
                <h2 className="text-2xl font-medium" style={{ color: "#001364" }}>
                  {getFieldValue("name") || "Enter brand name..."}
                </h2>
              )}
            </div>

            {BLUEPRINT_FIELDS_CONFIG.map(({ key, label, placeholder }, idx) => {
              const isOpen = openField === key;
              const value = getFieldValue(key);
              // Product fields: row label = the actual product name,
              // teaser skips the name line, read view gets eyebrows.
              const parsed = key.startsWith("productOrFeature") ? parseProductBlob(value) : null;
              const rowLabel = parsed?.name || label;
              const teaser = parsed
                ? teaserOf(parsed.sections.map((s) => s.body).join("\n"))
                : teaserOf(value);
              return (
                <div
                  key={key}
                  style={{
                    borderTop: idx === 0 ? "none" : "1px solid rgba(217, 224, 255, 0.4)",
                    paddingTop: idx === 0 ? 0 : 10,
                  }}
                >
                  <div
                    className="flex items-center gap-2"
                    onClick={() => {
                      if (editingField === key) return; // don't collapse mid-edit
                      setOpenField(isOpen ? null : key);
                    }}
                    style={{ cursor: "pointer", userSelect: "none" }}
                  >
                    <div className="flex-1" style={{ minWidth: 0 }}>
                      {parsed && (
                        <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(122, 147, 255, 0.75)" }}>
                          {label}
                        </div>
                      )}
                      <label className="text-xs font-medium" style={{ color: "#001364", cursor: "pointer" }}>{rowLabel}</label>
                      {!isOpen && (
                        <div
                          className="text-xs"
                          style={{
                            color: teaser ? "#6B7A99" : "rgba(0, 19, 100, 0.35)",
                            fontWeight: 300, marginTop: 1,
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          }}
                        >
                          {teaser || placeholder}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenField(key);
                        setEditingField(key);
                      }}
                      className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                      style={{ background: "transparent", border: "none", cursor: "pointer" }}
                      aria-label={`Edit ${label}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" style={{ color: "#7A93FF" }} />
                    </button>
                    <ChevronDown
                      className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
                      style={{ color: "#7A93FF", transform: isOpen ? "rotate(180deg)" : "none" }}
                    />
                  </div>
                  {isOpen && (
                    <div className="mt-2">
                      {editingField === key ? (
                        <Textarea
                          value={value}
                          onChange={(e) => setEditedValues({ ...editedValues, [key]: e.target.value })}
                          onBlur={() => setEditingField(null)}
                          placeholder={placeholder}
                          className="text-sm min-h-[80px]"
                          style={{ borderColor: "#7A93FF" }}
                          autoFocus
                        />
                      ) : parsed ? (
                        <ProductRead parsed={parsed} />
                      ) : (
                        <div className="text-sm leading-relaxed" style={{ color: "#000F4D", fontWeight: 300 }}>
                          {formatTextWithBullets(value) || (
                            <span style={{ color: "rgba(0, 19, 100, 0.4)" }}>{placeholder}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

          </div>
        </div>
      )}

      {showTyping2 && <TypingWithAvatar />}
      {showMessage2 && <BubbleWithAvatar>Anything look off? Edit whatever you need. I'll use this to review every video that comes through.</BubbleWithAvatar>}

      {showButton && (
        <div className="mb-4 ml-10 animate-in fade-in slide-in-from-bottom-3 duration-500 flex items-center gap-4">
          <Button onClick={onFinish} disabled={saving} className="text-sm py-2 px-5 shadow-sm hover:shadow-md transition-all duration-300" style={{ backgroundColor: "#7A93FF", color: "#fff", borderRadius: 8, fontWeight: 500 }}>
            {saving ? "Finishing..." : "Finish setup →"}
          </Button>
          <button
            onClick={onSkip}
            disabled={saving}
            className="text-xs"
            style={{ color: "#001364", fontWeight: 300, background: "transparent", border: "none", cursor: "pointer" }}
          >
            Skip for now
          </button>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// Shared chat primitives
// =====================================================================
// The strip above the blueprint card while the engine works (or after it
// failed). Live stage text from the engine; Try again re-runs the build.
function BuildStrip({ build, failedOnRow, onRetry, onRefetch }) {
  const failed = build?.phase === "failed" || (build?.phase !== "running" && failedOnRow);
  const running = build?.phase === "running";
  return (
    <div className="bg-white rounded-xl p-3 mb-3 text-xs flex items-center justify-between gap-2" style={{ border: `1px solid ${failed ? "rgba(217, 38, 38, 0.35)" : "rgba(217, 224, 255, 0.4)"}`, color: failed ? "#8a1f1f" : "#001364" }}>
      <span className="flex items-center gap-2">
        {running && <span className="bl-cz-pulse" />}
        {failed
          ? `We couldn't finish your blueprint${build?.error ? `: ${build.error}` : "."}`
          : `${build?.note || "Still drafting your blueprint"}...`}
      </span>
      {failed ? (
        <button onClick={onRetry} className="text-xs font-medium" style={{ color: "#fff", background: "#7A93FF", border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer" }}>
          Try again
        </button>
      ) : (
        <button onClick={onRefetch} className="text-xs font-medium" style={{ color: "#7A93FF", background: "transparent", border: "none", cursor: "pointer" }}>
          Refresh
        </button>
      )}
    </div>
  );
}

function BubbleWithAvatar({ children }) {
  return (
    <div className="mb-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex gap-2.5 items-start">
        <img src={LEE_AVATAR} alt="Lee" className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm max-w-lg" style={{ border: "1px solid rgba(217, 224, 255, 0.4)" }}>
          <p className="text-sm leading-relaxed" style={{ color: "#000F4D", fontWeight: 300 }}>{children}</p>
        </div>
      </div>
    </div>
  );
}

function BubbleNoAvatar({ children }) {
  return (
    <div className="mb-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex gap-2.5 items-start">
        <div className="w-8 h-8 flex-shrink-0" />
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm max-w-lg" style={{ border: "1px solid rgba(217, 224, 255, 0.4)" }}>
          <p className="text-sm leading-relaxed" style={{ color: "#000F4D", fontWeight: 300 }}>{children}</p>
        </div>
      </div>
    </div>
  );
}

function TypingWithAvatar() {
  return (
    <div className="mb-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex gap-2.5 items-start">
        <img src={LEE_AVATAR} alt="Lee" className="w-8 h-8 rounded-full flex-shrink-0" />
        <TypingDots />
      </div>
    </div>
  );
}

function TypingNoAvatar() {
  return (
    <div className="mb-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex gap-2.5 items-start">
        <div className="w-8 h-8 flex-shrink-0" />
        <TypingDots />
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="bg-white rounded-2xl rounded-tl-sm p-3 px-5 shadow-sm" style={{ border: "1px solid rgba(217, 224, 255, 0.4)" }}>
      <div className="flex gap-1.5">
        <div className="w-2 h-2 rounded-full typing-dot" style={{ backgroundColor: "#7A93FF" }} />
        <div className="w-2 h-2 rounded-full typing-dot" style={{ backgroundColor: "#7A93FF" }} />
        <div className="w-2 h-2 rounded-full typing-dot" style={{ backgroundColor: "#7A93FF" }} />
      </div>
    </div>
  );
}

function ProgressDots({ currentStep }) {
  // 5 dots total across BOTH onboarding pages, split visually:
  //   dot 1 → /set-up Step 1 (website / use cases)
  //   dot 2 → /customize Step 2 (AI mode)
  //   dot 3 → /customize Step 4 (QA checklist)
  //   dot 4 → /customize Step 5 (Thresholds)
  //   dot 5 → /customize Step 6 (Blueprint review)
  // currentStep on this page is one of {2, 4, 5, 6}; dot 1 is always
  // filled because /set-up Step 1 is complete by the time we land here.
  const STEP_TO_DOT_INDEX = { 2: 2, 4: 3, 5: 4, 6: 5 };
  const filled = STEP_TO_DOT_INDEX[currentStep] || 1;
  return (
    <div className="flex justify-center gap-2 py-6">
      {[1, 2, 3, 4, 5].map((i) => {
        const reached = i <= filled;
        return (
          <div
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: reached ? "#7A93FF" : "#D9E0FF", opacity: reached ? 1 : 0.5 }}
          />
        );
      })}
    </div>
  );
}

function Loading({ error, message, children }) {
  const tone = error ? "#d92626" : "#001364";
  const headline = error ? "Couldn't load your account" : (message ? "Almost there..." : "Loading...");
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "linear-gradient(to bottom, rgba(217, 224, 255, 0.15), rgba(255, 255, 255, 1))" }}>
      <div className="text-center max-w-md" style={{ color: tone }}>
        <div className="text-lg font-medium">{headline}</div>
        {message && (
          <div className="text-sm mt-3 leading-relaxed" style={{ color: "#001364", fontWeight: 300 }}>{message}</div>
        )}
        {children}
      </div>
    </div>
  );
}

function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;500;800&display=swap');
      * { font-family: 'League Spartan', sans-serif; }
      @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-8px); } }
      .typing-dot { animation: bounce 1.4s infinite; }
      .typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .typing-dot:nth-child(3) { animation-delay: 0.4s; }
      @keyframes bl-cz-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.45; transform: scale(0.8); } }
      .bl-cz-pulse { display: inline-block; width: 8px; height: 8px; border-radius: 999px; background: #7A93FF; animation: bl-cz-pulse 1.2s ease-in-out infinite; flex-shrink: 0; }
      @keyframes confetti-fall {
        0%   { transform: translateY(-20vh) rotate(0deg);   opacity: 1; }
        100% { transform: translateY(110vh) rotate(720deg); opacity: 0.4; }
      }
      .confetti-piece {
        position: fixed;
        top: 0;
        width: 8px;
        height: 14px;
        border-radius: 2px;
        pointer-events: none;
        z-index: 60;
        animation: confetti-fall 2.6s cubic-bezier(0.2, 0.6, 0.4, 1) forwards;
      }
    `}</style>
  );
}

// Founder finish — centred card over the confetti. Recap of what was
// built, a short personal note, Bev's signature, one CTA. No auto
// redirect; the user leaves when they're ready.
const BEV_SIGNATURE =
  "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_brand_bev-signature-handwritten-navy-transparent_2026-07.png";

function FounderFinish() {
  const built = [
    "Brand profile: your voice, audience and niche",
    "Quality thresholds: hook timing, CTA placement, audio",
    "Review agents, ready for your first video",
  ];
  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-4"
      style={{ zIndex: 70, background: "rgba(0, 15, 77, 0.35)", backdropFilter: "blur(2px)" }}
    >
      <div
        className="w-full animate-in fade-in zoom-in-95 duration-500"
        style={{ maxWidth: 460, background: "#fff", borderRadius: 16, padding: "32px 32px 28px", boxShadow: "0 24px 60px rgba(0, 15, 77, 0.25)" }}
      >
        <div style={{ fontSize: 22, fontWeight: 800, color: "#001364", marginBottom: 14 }}>
          Your workspace is ready
        </div>

        <div style={{ marginBottom: 18 }}>
          {built.map((line) => (
            <div key={line} className="flex items-start gap-2" style={{ padding: "4px 0" }}>
              <span
                className="flex items-center justify-center flex-shrink-0"
                style={{ width: 18, height: 18, borderRadius: "50%", background: "#294FF6", marginTop: 1 }}
              >
                <Check size={11} className="text-white" />
              </span>
              <span style={{ fontSize: 13.5, color: "#000F4D", lineHeight: 1.45 }}>{line}</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(217, 224, 255, 0.8)", paddingTop: 18, marginBottom: 18 }}>
          <p style={{ fontSize: 13.5, color: "#000F4D", fontWeight: 300, lineHeight: 1.65, margin: 0 }}>
            Thanks for setting this up properly. Everything you just shared is
            now the brief your AI reviews against, so the feedback on your very
            first video will sound like your brand. If anything ever feels off,
            reply to any of our emails. A real person reads every one.
          </p>
          <img
            src={BEV_SIGNATURE}
            alt="Bev"
            style={{ height: 44, marginTop: 14, display: "block" }}
          />
          <div style={{ fontSize: 12, color: "#6B7A99", marginTop: 2 }}>
            Bev, Co-founder, Brieflee
          </div>
        </div>

        <button
          onClick={() => { window.location.href = FINISH_URL; }}
          className="w-full"
          style={{ background: "#7A93FF", color: "#fff", border: "none", borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          Go to your dashboard
        </button>
      </div>
    </div>
  );
}

// 60-piece CSS confetti, triggered on completion.
function Confetti() {
  const colors = ["#7A93FF", "#294FF6", "#D9E0FF", "#20956f", "#f5b301", "#ec4899"];
  const pieces = Array.from({ length: 60 }).map((_, i) => ({
    left: `${Math.random() * 100}%`,
    color: colors[i % colors.length],
    delay: `${Math.random() * 0.6}s`,
  }));
  return (
    <>
      {pieces.map((p, i) => (
        <span key={i} className="confetti-piece" style={{ left: p.left, background: p.color, animationDelay: p.delay }} />
      ))}
    </>
  );
}