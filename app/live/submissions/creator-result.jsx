// =====================================================================
// Vibe Coding block: creator-result — /live/submissions (v3)
// =====================================================================
// The creator's view of one submission. Public page, ?recordId= is the
// submission. One surface: the decision, one sentence, one button, then
// two folded rows (what to fix, every check). "Submit a new cut" opens a
// drawer with the three steps from the creator brief page (video, what
// changed, send); the review engine runs inside this block on the
// revision route and the drawer ends on "See your result".
//
// Sources (Source tab, by alias): submissions, reviews, report, briefs,
// accounts, users, notifications, emailit (REST), google (Gemini).
// Writes: submissions, reviews, review_report, notifications (the
// engine's own writes). The old engine block on this page is hidden by
// this block until it is deleted in Studio.
//
// What the creator sees depends on the review's ai_mode:
//   Autonomous  the Review Agents' decision is final, shown in full
//   Hybrid      the Review Agents' result, then the brand's confirmation
//   Manual      a "received" state until the brand decides; the brand's
//               decision and notes after that, never the AI detail
// Copy: no em dashes. "Review Agents" throughout. Inter throughout.
// =====================================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { datasource, useRecord, useRecords, useRecordCreate, useUpload, useProxyFetch, useCurrentRecordId, q } from "@/lib/datasource";
import { ArrowLeft, ArrowRight, Check, X, AlertTriangle, ChevronDown, Link2, Play, Upload, ExternalLink } from "lucide-react";

const ds = datasource.define({
  submissions:   "submissions",
  reviews:       "reviews",
  report:        "report",
  briefs:        "briefs",
  accounts:      "accounts",
  users:         "users",
  notifications: "notifications",
  emailit:       "32ce1d2d-7eaa-4bc6-96ea-6970e031a64d",
  google:        "ceb168a7-5118-4028-8633-a6596c27ebbc",
});

const NAVY = "#001364";
const INK = "#10205A";
const MUTED = "#66739A";
const FAINT = "#9AA5C4";
const PERI = "#879CF7";
const BLUE = "#294FF6";
const HAIR = "#D6DEFC";
const TINT = "#F3F6FF";
const TINT_BORDER = "#C9D4FB";
const CARD_BG = "linear-gradient(180deg, #F3F6FF 0%, #FFFFFF 100%)";
const WASH = "rgba(255, 255, 255, 0.55)";
const PASS_FG = "#2DAA63";
const PASS_BG = "rgba(45, 170, 99, 0.10)";
const FIX_FG = "#C77B25";
const FIX_BG = "rgba(199, 123, 37, 0.12)";
const NO_FG = "#D9534F";
const NO_BG = "rgba(217, 83, 79, 0.10)";
const WAIT_FG = "#294FF6";
const WAIT_BG = "rgba(41, 79, 246, 0.09)";

const OLD_ENGINE_BLOCK = "video-analysis";
const BRIEF_PATH_LIVE = "/brief/details/live";
const RESULT_ORIGIN = "https://www.brieflee.co";
const RESULT_PATH = "/live/submissions";
const NOTE_LONG = 150;

// ─── submissions (the page record, also the parent of a revision) ──
const subSelect = q.select({
  name:             "XebTQ",
  creatorName:      "9ZryL",
  creatorEmail:     "INZs6",
  createdAt:        "ywb3H",
  accounts:         "v94f0",
  logoUrl:          "nYDwB",
  reviews:          "kdfMm",
  briefs:           "fqtit",
  briefName:        "Au4N7",
  projects:         "M8O02",
  users:            "DxNOa",
  videoFile:        "PP7rO",
  videoUrl:         "XrARi",
  submissionType:   "b82bF",
  status:           "4flIO",
  notes:            "UzR32",
  duration:         "si3xT",
  revisionNumber:   "jHVKv",
  parentSubmission: "9bJMy",
  displayUrl:       "yLEEw",
  thumbnail:        "HKHil",
  aiMode:           "laVjU",
  requestChanges:   "gewdX",
  usersStatus:      "Lx9pZ",
  usersVideos:      "Ef7z6",
  originalReviewId: "N1Gzr",
});

// ─── reviews (the verdict) ─────────────────────────────────────
const verdictSelect = q.select({
  name:              "Odw6q",
  submissions:       "nB4G1",
  overallStatus:     "4ljXK",
  aiDecision:        "pxln3",
  aiMode:            "O8NvX",
  humanDecision:     "ULvsM",
  overallComment:    "Zqqx4",
  decisionReasoning: "yp7ca",
  recommendedAction: "j6SpS",
  requestMessage:    "JF1tu",
  requestChanges:    "MMAeQ",
  displayUrl:        "kIbht",
  thumbnail:         "4rkuC",
  failedList:        "hqASW",
  createdAt:         "jRfGK",
  hookScore:    "PPgD7", hookStatus:    "BCdmg", hookComment:    "FleWi", hookShot:    "tJHIq",
  vhookScore:   "TuCZK", vhookStatus:   "Q8htG", vhookComment:   "H8mtq", vhookShot:   "jku6W",
  pacingScore:  "ZgN1w", pacingStatus:  "J6Hlm", pacingComment:  "dSTFY", pacingShot:  "q9hyL",
  productScore: "wwk9X", productStatus: "MIomy", productComment: "Golmf", productShot: "bzZmF",
  audioScore:   "gQ2My", audioStatus:   "O4iGG", audioComment:   "ytuTT", audioShot:   "Ltgaq",
  faceScore:    "mCcVd", faceStatus:    "GNsfa", faceComment:    "wcLV7", faceShot:    "CKEBR",
  textScore:    "CoAzZ", textStatus:    "gJZmz", textComment:    "S60Ob", textShot:    "dPZEk",
  ctaScore:     "58szQ", ctaStatus:     "O5wRt", ctaComment:     "MfmJY", ctaShot:     "t5EX4",
  mentionScore: "7fAI0", mentionStatus: "9kKJP", mentionComment: "JIpeg", mentionShot: "CCHAV",
  modStatus:    "ZHNmv", modComment:    "1tXyK", modShot:    "xgoo8",
  copyStatus:   "cftY3", copyComment:   "UDj20", copyShot:   "JMUZh",
  alignStatus:  "36f1U", alignComment:  "H9Xkc", alignShot:  "usb6i",
});

// ─── review_report (one row per Review Agent) ──────────────────
const reportRowSelect = q.select({
  criteria:   "E004U",
  score:      "iy2K3",
  threshold:  "Q5UCr",
  status:     "TxU8J",
  comment:    "3Pr6i",
  screenshot: "syqU5",
  moment:     "BEfco",
  review:     "Iu9MX",
});

// ─── helpers (this page's own; the engine's carry an E suffix) ──
function pick(raw) {
  if (raw == null) return "";
  if (Array.isArray(raw)) return pick(raw[0]);
  if (typeof raw === "object") return raw.label ?? raw.url ?? raw.value ?? "";
  return String(raw);
}
function labelOf(raw) {
  if (raw == null) return "";
  if (Array.isArray(raw)) return labelOf(raw[0]);
  if (typeof raw === "object") return raw.label || "";
  return String(raw);
}
function linkIds(raw) {
  if (raw == null) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map((x) => (typeof x === "string" ? x : x?.id || "")).filter(Boolean);
}
function linkLabels(raw) {
  if (raw == null) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map((x) => (typeof x === "string" ? x : x?.label || "")).filter(Boolean);
}
function firstFileUrl(raw) {
  if (raw == null) return "";
  if (Array.isArray(raw)) return firstFileUrl(raw[0]);
  if (typeof raw === "object") return raw.url || "";
  return String(raw);
}
function plainText(s) {
  return String(s || "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();
}
function dateLabel(iso) {
  const d = new Date(iso);
  if (!iso || Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function clock(sec) {
  const s = Math.max(0, Math.round(sec));
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}
function momentOf(raw) {
  const n = parseInt(labelOf(raw), 10);
  return Number.isFinite(n) ? n : null;
}
function shotSec(url) {
  const m = /\/so_(\d+)[,/]/.exec(String(url || ""));
  return m ? Number(m[1]) : null;
}
function isMp4Url(u) {
  return /^https?:\/\/\S+\.(mp4|mov|m4v|webm)(\?\S*)?$/i.test(String(u || "").trim());
}
function initialsOf(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  return parts.length ? (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() : "";
}
function fmtBytes(n) {
  if (!n) return "";
  return n > 1024 * 1024 ? (n / 1024 / 1024).toFixed(n > 20 * 1024 * 1024 ? 0 : 1) + " MB" : Math.round(n / 1024) + " KB";
}
const passes = (label) => /PASS|ALIGNED|APPROVE|CLEAR|SAFE/.test(String(label || "").toUpperCase());
const fails = (label) => /FAIL|REJECT|MISALIGNED/.test(String(label || "").toUpperCase());
function tone(label) {
  if (passes(label)) return { fg: PASS_FG, bg: PASS_BG, word: "Pass" };
  if (fails(label)) return { fg: FIX_FG, bg: FIX_BG, word: "Fix" };
  return { fg: FIX_FG, bg: FIX_BG, word: "Adjust" };
}
// Friendly names and groups for the criteria the engine writes.
function niceName(name) {
  const c = String(name || "").trim();
  const map = [
    [/hook.?speed/i, "Hook speed"], [/visual.?hook/i, "Visual hook"],
    [/pacing|scene/i, "Pacing"], [/product/i, "Product on screen"],
    [/audio/i, "Audio clarity"], [/face/i, "Face time"],
    [/text|legib/i, "Text legibility"], [/cta|call to action/i, "Call to action"],
    [/mention/i, "Brand mentions"], [/moderation/i, "Brand safety"],
    [/copyright/i, "Copyright"], [/align/i, "Brief alignment"],
  ];
  const hit = map.find(([re]) => re.test(c));
  return hit ? hit[1] : (c ? c.charAt(0).toUpperCase() + c.slice(1) : "Check");
}
function groupOf(name) {
  const c = String(name || "").toLowerCase();
  if (/hook|pacing|scene/.test(c)) return "Hook and pacing";
  if (/copyright|moderation|safe/.test(c)) return "Safety";
  if (/mention|cta|call to action|align|brief|brand/.test(c)) return "Brand and message";
  return "Production";
}
const GROUPS = ["Hook and pacing", "Production", "Brand and message", "Safety"];

// ─── loaders (mount only with a real id) ───────────────────────
// Every review linked to this submission. Legacy n8n runs also linked
// one row per check into the same field, so the block keeps the row
// that carries a verdict, newest first.
function VerdictLoader({ submissionId, onState }) {
  const { data, status } = useRecords({ select: verdictSelect, from: ds.reviews, count: 50, where: q.array("submissions").is(submissionId || "") });
  useEffect(() => {
    const rows = data?.pages?.flatMap((p) => p?.items ?? []) ?? [];
    const withVerdict = rows.filter((r) => labelOf(r?.fields?.aiDecision) || labelOf(r?.fields?.overallStatus));
    const chosen = (withVerdict.length ? withVerdict : rows).slice().sort((a, b) => String(pick(b?.fields?.createdAt)).localeCompare(String(pick(a?.fields?.createdAt))))[0] || null;
    onState({ status, id: chosen?.id || "", f: status === "success" ? (chosen?.fields || null) : null });
  }, [data, status, onState]);
  return null;
}
function ReportRows({ reviewId, onRows }) {
  const { data } = useRecords({ select: reportRowSelect, from: ds.report, count: 100, where: q.array("review").is(reviewId || "") });
  useEffect(() => { onRows(data?.pages?.flatMap((p) => p?.items ?? []) ?? []); }, [data, onRows]);
  return null;
}

// =====================================================================
// The engine (verbatim from app/video-analysis/engine.jsx, PAGE
// live-submissions): field maps, option ids, Review Agents, prompts,
// Cloudinary, Gemini, writes, notifications, EmailIt. Its unwrap and
// isDirectVideoUrl carry an E suffix because this page has its own
// helpers. Only what this block uses survives the prune below.
// =====================================================================
// ─── Page ──────────────────────────────────────────────────────
// The only line that changes between blocks.
const PAGE = "live-submissions";
// actor:   "user"    = logged-in brand user, gated on their users row
//          "creator" = public route, gated on the brief and its brand
// context: "workspace"  = pick a workspace and, optionally, a brief
//          "brief"      = ?recordId is the brief (creator brief page)
//          "submission" = ?recordId is the parent submission (revision)
// multi:   several videos in one go, two at a time
// /review follows the native form's logic: workspace, upload, a context choice
// (Brieflee brief, notes, or a PDF), the chosen detail, then the Review Agents
// only when the workspace has none saved.
const STEPPER = PAGE === "review";

// ─── Datasources (connection ids from THIS block's Source tab) ──

// ─── Reads ─────────────────────────────────────────────────────
// The logged-in user's own record: the gate and the workspace list.
// The brand owner's row on the creator routes, read only when the brief
// and parent lookups carry no status. Nothing personal is selected.
const ownerSelect = q.select({
  id:              "6stLd",
  status:          "kClk9",
  videosRemaining: "3kzMt",
});

// The chosen workspace: brand context, AI mode, thresholds, agents.
const accountSelect = q.select({
  name:            "aAKkT",
  logoUrl:         "nPI65",
  status:          "9Cdqq",
  aiMode:          "O9x4n",
  qaChecklist:     "mZaRc",
  brandBio:        "iVPat",
  brandVoice:      "ybmp8",
  brandCta:        "s9vzj",
  targetAudience:  "6g1Vd",
  painPoints:      "B4zya",
  objectives:      "5Wq2k",
  niche:           "vOp4b",
  owner:           "ISmqP",
  ownerEmail:      "pV6px",
  ownerFirstName:  "TMpNP",
  videosRemaining: "A0Cwp",
  maxVideos:       "cNlUS",
  plan:            "YluGd",
  cycleEnd:        "eaa3X",
  thProductScreen: "AFgpo",
  thHookSpeed:     "wthaW",
  thVisualHook:    "Nq4ZX",
  thCta:           "FA452",
  thFaceTime:      "FH27O",
  thTextLegibility:"TNRuM",
  thAudioClarity:  "dMTrN",
  thPacing:        "bR5PL",
  thBrandMentions: "HCvZw",
});

// Briefs in the workspace (picker) and the chosen brief (prompt).
const briefSelect = q.select({
  name:            "z3lpx",
  status:          "71Oud",
  accounts:        "EhzVx",
  projects:        "yrYvH",
  aiMode:          "wm1jM",
  qaChecklist:     "OFoS6",
  description:     "FCBU5",
  talkingPoints:   "YEfyw",
  script:          "YLabB",
  dos:             "CSbqb",
  donts:           "I5wOP",
  makeSure:        "SEksn",
  captionHooks:    "8EyqU",
  visualHooks:     "4dnWx",
  voiceoverHooks:  "3QPLK",
  productFeature:  "CSvl8",
  exampleAnalysis: "hIFSE",
  creatorName:     "oIsFn",
  creatorEmail:    "Rogsr",
  users:           "EdhwS",
  ownerEmail:      "kNX0h",
  ownerFirstName:  "oln9W",
  videosRemainingCount: "YJljG",
  usersStatus:     "7GTPj",
  closeDate:       "M4hMa",
  brandBio:        "zqP14",
  thProductScreen: "7Zpeo",
  thHookSpeed:     "CEkkg",
  thVisualHook:    "Drp5T",
  thCta:           "zo9Fo",
  thFaceTime:      "jSDeR",
  thTextLegibility:"aHH2x",
  thAudioClarity:  "zXqtt",
  thPacing:        "15284",
});

// The parent submission of a revision, and its review.

// ─── Writes ────────────────────────────────────────────────────
const submissionCreate = q.select({
  name:            "XebTQ",
  accounts:        "v94f0",
  briefs:          "fqtit",
  projects:        "M8O02",
  users:           "DxNOa",
  videoUrl:        "XrARi",
  videoFile:       "PP7rO",
  briefAttachment: "GmjrC",
  creatorName:     "9ZryL",
  creatorEmail:    "INZs6",
  submissionType:  "b82bF",
  status:          "4flIO",
  userValidation:  "QqS0I",
  platformName:    "5Quiw",
  platformUsername:"FmmVQ",
  submissionNotes: "UzR32",
  qaChecklist:     "qYYxu",
  duration:        "si3xT",
  resolution:      "1N0Zw",
  aspectRatio:     "8UXFt",
  fileSizeMb:      "BMnCc",
  format:          "opngB",
  fps:             "hXH3D",
  parentSubmission:   "9bJMy",
  parentSubmissionId: "4Nfb8",
  originalReviewId:   "N1Gzr",
  revisionNumber:     "jHVKv",
  isBulk:             "CIp0E",
  reviews:            "kdfMm",
});

const reviewCreate = q.select({
  submissions:      "nB4G1",
  accounts:         "c6csA",
  briefs:           "3lQdp",
  projects:         "an3Rj",
  overallStatus:    "4ljXK",
  aiDecision:       "pxln3",
  aiMode:           "O8NvX",
  thresholdSource:  "CvnVd",
  overallRating:    "uRkEe",
  overallComment:   "Zqqx4",
  decisionReasoning:"yp7ca",
  recommendedAction:"j6SpS",
  transcript:       "5kQxm",
  adaptedScript:    "Z95A7",
  displayUrl:       "kIbht",
  thumbnail:        "4rkuC",
  offBrand:         "4KXgS",
  pstScore:   "wwk9X", pstStatus:  "MIomy", pstComment:  "Golmf", pstShot:  "bzZmF",
  hsScore:    "PPgD7", hsStatus:   "BCdmg", hsComment:   "FleWi", hsShot:   "tJHIq",
  vhScore:    "TuCZK", vhStatus:   "Q8htG", vhComment:   "H8mtq", vhShot:   "jku6W",
  ctaScore:   "58szQ", ctaStatus:  "O5wRt", ctaComment:  "MfmJY", ctaShot:  "t5EX4",
  ftScore:    "mCcVd", ftStatus:   "GNsfa", ftComment:   "wcLV7", ftShot:   "CKEBR",
  tlScore:    "CoAzZ", tlStatus:   "gJZmz", tlComment:   "S60Ob", tlShot:   "dPZEk",
  acScore:    "gQ2My", acStatus:   "O4iGG", acComment:   "ytuTT", acShot:   "Ltgaq",
  epScore:    "ZgN1w", epStatus:   "J6Hlm", epComment:   "dSTFY", epShot:   "q9hyL",
  bmScore:    "7fAI0", bmStatus:   "9kKJP", bmComment:   "JIpeg", bmShot:   "CCHAV",
  crStatus:   "cftY3", crDetails:  "UDj20", crShot:      "JMUZh",
  cmStatus:   "ZHNmv", cmDetails:  "1tXyK", cmShot:      "xgoo8",
  baStatus:   "36f1U", baDetails:  "H9Xkc", baShot:      "usb6i",
});

const reportCreate = q.select({
  threshold:      "E004U",
  score:          "iy2K3",
  thresholdValue: "Q5UCr",
  rating:         "uRkEe",
  severity:       "oO0ev",
  status:         "TxU8J",
  comment:        "3Pr6i",
  screenshotUrl:  "syqU5",
  keyMoment:      "BEfco",
  review:         "Iu9MX",
  submissions:    "nB4G1",
  accounts:       "c6csA",
  briefs:         "3lQdp",
  projects:       "an3Rj",
});

const notificationCreate = q.select({
  type:        "2xLr7",
  title:       "SATFD",
  message:     "tUnIi",
  isRead:      "AKYmp",
  accounts:    "esbPo",
  users:       "FR1cY",
  briefs:      "hY6Ve",
  projects:    "PWTz3",
  submissions: "8ajbS",
  reviews:     "5lyPE",
});

// ─── Option ids ────────────────────────────────────────────────
const OPT = {
  subTypeContentReview: "5ed52a56-f33e-475a-bc32-95b11756290f",
  subTypeRevision: "24ae35f5-8eef-4c6c-b6ac-947663b05c58",
  subTypeBrief: "0a16c65f-2230-4070-a530-0f6f6fa098bf",
  subTypeAnalyse: "93cc2c4e-01ea-40ee-9f0f-1c45206808c6",
  subTypeSwipe: "4d21296f-a7a6-4264-9298-21c7c4a7e6f2",
  userValidationProceed: "0fb06c28-5e30-4a38-9cf4-2e75490f7d1a",
  statusReviewed: "713723b2-f81f-46f9-ae7d-526e334706b3",
  revision: { 0: "4ff1da4b-6e26-48e5-93d0-fa7fc77526fc", 1: "d7f26c9f-b0b9-4d70-8331-c42c8fb452ef", 2: "07aa06a6-1434-460e-b8c8-d104e8d6d723", 3: "46857a9c-0d18-4947-9c54-95b48cbf7768", 4: "8c48fa4d-99aa-4382-84e9-afd572f61d57", 5: "ad223e90-9008-469a-a37d-b0fe160180e1", 6: "8f97b4db-5cb7-4a58-9994-8395bc32b54a", 7: "8a449fbc-9fb5-4b43-8bb6-0e7b2f0ae8ba", 8: "cca22ee1-7c85-43ab-ba4a-b6d71035c003", 9: "b9ce37f3-ebe2-4610-9bd0-f3893c0b2875", 10: "7624af34-e1ae-49ee-b289-d22da98122e2" },
  platform: {
    Upload: "c72e31e0-d976-478e-ac07-2eeca1f811b0",
    Instagram: "431bc4d5-34b7-4c5f-bcb0-21fb22f76198",
    TikTok: "5989f5cd-8d43-4cac-90c5-e08c592c99a7",
    YouTube: "041fcaf3-370c-44c2-b329-9a5aa33b46ed",
  },
  aiDecision: {
    APPROVED: "17004b4d-66c1-44fb-9a86-33a8a86110ee",
    FLAGGED: "c168c3d6-9b94-47b8-ac43-5fcc715e3d24",
    REJECTED: "e173acf9-d806-4ffa-a36c-154f07fe82f7",
    REVIEW: "269347ff-874c-4cb1-b3bd-a8450a6b5c32",
  },
  overallStatus: {
    APPROVED: "4cfaebf5-60cb-4eda-bdd4-fec0bd77c74c",
    FLAGGED: "34526a42-cd49-4094-9dee-bbe8b114e440",
    REJECTED: "75dd6d0f-e5a2-4ba8-941a-33e9e1f2ccc3",
    REVIEW: "dddaca4d-c893-4861-922f-687bc13b78db",
  },
  aiMode: {
    Autonomous: "243d3312-2ce6-4043-b07c-1bd4b9c4b56f",
    Hybrid: "9b7ec34f-7e9f-411e-bf8c-3b36334143b2",
    Manual: "ec386261-bf9b-4bef-b938-6d99327be4d3",
  },
  thresholdSource: { Account: "473a311b-6b5a-48ef-974e-92337b0b9173", Brief: "5d10b925-bdc0-41a8-98be-b12fa57ecf29" },
  notif: {
    received: "e2a3814d-eff1-433f-86f7-80970f20d15d",
    completed: "6179ae57-6d6f-45f5-8fad-ded42fee8d36",
    approved: "de8a97d2-3bcb-46c0-b1d8-02664d0928da",
    rejected: "e223f058-89dd-49a6-8424-e8d5423b0abb",
    flagged: "a1246fa4-011b-47c8-99c7-ade863da8cfb",
  },
  reportStatus: { PASS: "c2692420-bd22-458d-887f-b6e25531ff4e", FAIL: "b917f19e-db11-43e7-839c-49a4bdc26598", FLAGGED: "81091b5b-35d7-499b-8d47-1905236b6775" },
  reportSeverity: { INFO: "3dc78850-7f07-414f-adc1-e61fbf9ed7a4", WARNING: "bc29c288-5719-4ee5-b8b6-fd5fd9a3ac77", CRITICAL: "2f1d4555-e3f1-4d15-8460-31d11c82924e" },
};

// submissions.qa_checklist option ids by label. The account and brief
// columns carry their own ids, which are not valid on submissions.
const SUB_QA_IDS = {
  "Product visibility": "40946cb6-2638-4c13-9aa2-3f66d1ab8d15", "Product usage": "3f1ff82b-1fae-4ec8-b727-8ab4337d3d22",
  "Hook quality": "f8968115-bdab-4360-afe5-fc4d53b26df3", "Visual hook": "94e77b01-88ec-4f9f-b6fb-7ca5b5be7b13",
  "Audio clarity": "dcb604cb-132e-4928-bab7-1a5dbfd61258", "Audio delivery": "664e176a-ac4b-469a-b3fb-efa0abd5409c",
  "Pronunciation": "eac26e3c-8601-4c2a-a038-39b694084caf", "Music & sound balance": "314d167a-7456-425b-aa9e-0cab135f06be",
  "Follows the brief": "5e36d433-92b5-4ad7-9447-abcaa5401991", "Brand name mentioned": "a1d164a9-3972-45bb-a444-34bba3757621",
  "Lighting & camera": "8b51a26d-6b1c-4b37-8939-b7339eb7f595", "Setting & background": "fe7f6d81-eda9-4c23-8650-43c9351b7334",
  "Distracting elements": "641e6d1f-a3cd-451c-bbb8-c8e44c6aaf51", "Text legibility": "c7b897ff-b5f8-4d4f-aaa4-07849c4c0fa6",
  "Closed captions": "c1d3605d-e91c-4509-aad0-b337ff3ed898", "Safe zones": "5410f4ee-20f3-4356-8180-f73b1ae859df",
  "Scene pacing": "8c96bc97-ebde-44f3-b4ee-65640e6ba8f6", "Video length": "ea740500-ef29-4246-aa61-1e1264cce230",
  "Watchable on mute": "15dfd7e3-226d-4ac3-bd2e-4383857ee08c", "Creator visibility": "58615cda-8673-4d3d-a3ce-7ef871e81991",
  "Energy & authenticity": "8ab22af0-53f5-45a1-856e-1dcbbb048e19", "Wardrobe & appearance": "e9320bd8-73ac-4e89-95a6-70a87a40b3e0",
  "CTA present": "719b3047-73f8-4958-8080-05485b6859bd", "Brand alignment": "873be85d-9d67-4286-b7d7-49dc35c45baa",
  "Copyright check": "82baef6f-fd83-4eac-a159-1298fd71eb07", "Inspiration link match": "a135797b-d452-4f83-9b39-9a40481f1411",
};

// Per-column status option ids on reviews. A label missing from a
// column is written as the label itself (the columns allow new choices).
const STATUS_IDS = {
  pst: { PASS: "af8c3435-197f-49be-b54e-b74e167bf622", FAIL: "78650e4d-0603-4c49-af1a-699d080e34d0" },
  hs:  { PASS: "3f6d850b-103a-4659-a792-edbcecd2d282", FAIL: "f5b89379-77a7-490d-87b3-01fd1b5fbb38" },
  vh:  { PASS: "df620cda-696d-4f6a-be2e-dd5f9c69798d", FAIL: "b9298a48-418e-4e81-8284-a86b7484d0e5", FLAGGED: "c478aae9-8ffb-4431-892f-9a69e782ab93" },
  cta: { PASS: "df620cda-696d-4f6a-be2e-dd5f9c69798d", FAIL: "b9298a48-418e-4e81-8284-a86b7484d0e5" },
  ft:  { PASS: "f7a0b5f9-e6a4-45f7-b1c1-7f51d484915a", FAIL: "d91bf483-9674-4da7-9c85-6b46309a051f" },
  tl:  { PASS: "25306d8c-9cd7-4eff-96de-c34597e60e22", FAIL: "f8713bed-1302-4ee9-bdba-754f63d9d20e" },
  ac:  { PASS: "55e381c2-1289-4bca-9386-d49518f1d082", FAIL: "e821d3fd-19b5-48b9-90dc-15230103520d" },
  ep:  { PASS: "a05fedea-29ee-4c68-9865-1df3af7abb63", FAIL: "1e6a249e-e7b1-46bf-be6c-64b06485eb8f" },
  bm:  { PASS: "d99a59f6-76cc-46b2-963e-975f9cb4fe16", FAIL: "b61770f4-36f9-4db1-8d95-ddb6cce24ed0" },
  cr:  { PASS: "0035625f-c28b-41f2-bb1b-eba3afd5370a", FAIL: "d077c434-44e6-4ac1-a527-f1f69d8b67e6" },
  cm:  { PASS: "cd34f28d-6d67-4928-842f-3b89e5178187", FAIL: "496b41ef-a71f-479e-be75-7512d9191e61" },
  ba:  { PASS: "500f7b1c-3ab5-4980-85a1-f315afa35f8b", FAIL: "32992beb-86ef-4903-af2d-363046aa9bb5", ALIGNED: "b91c68cb-8420-47be-ae26-0b8f7e4a15fe", MISALIGNED: "bab6ec30-bf74-4429-9a48-062f7703f950", NEEDS_ADJUSTMENT: "b24f9862-9740-45ad-93f8-d32997561d70" },
};

// key_moment_timestamp on review_report is a SELECT whose options are
// second labels; the data layer wants option ids. Seconds without an
// option are left empty (the screenshot_url carries so_<n> anyway).
const KEY_MOMENT_IDS = {"0":"4981cd88-c4a1-42c7-a3b8-746a92e3e345","1":"82de4d8c-d992-48e8-969f-d966df56756a","2":"9ac8a835-bb8f-42d0-9389-ba67ca9befb3","3":"34fb58a0-6268-42a6-bbcb-51b6a7895607","4":"71cb3195-0f90-4284-934e-c557618c45ae","5":"3f8e8bd3-0b4c-4f5d-b305-e7ffc3ef0bc7","6":"d2b2d6ca-be3d-4af4-9c6e-2735dceaebd2","7":"4b67a1f5-deb3-47ed-8425-d32d9884ae0a","8":"9ba60323-fc19-4ee0-a23d-5cc2aae76344","9":"8628eccf-3bc4-483d-82a8-b89afdbb7de7","10":"0d60b4e1-e4e0-4f89-bf4d-501fa0956847","11":"48fbce09-ff20-4bfb-a2b8-92f04ea9a9d4","12":"efa57d4d-1a1e-4593-9b8c-721008317cc7","13":"56eafe0b-7497-4aad-aebc-d8b571bbc653","14":"1eda9aea-6a67-4d0e-97bf-52c24f0f5b69","15":"a03099b2-efa7-4f20-89c3-8c0f4faa1858","16":"3e27453e-3e14-463f-afe4-2f150c18fadb","17":"91c4f237-ac59-4714-9e40-18da0efbbbcd","18":"5d407291-45e0-433e-9b6a-4b574bb5b378","20":"acdaacde-a01f-40c2-8292-62de77c5e2b7","21":"6bd5a68f-a07a-441a-b6c3-4663d7e20a42","22":"a97d222c-a4a7-4e92-a8c4-675a4991df18","23":"d4560de5-61d5-4cca-9e16-385cb57cb63b","24":"7a04a1b1-9cc1-4775-bc45-ea302a3e9130","25":"9d63f1d8-44cd-4ed1-b649-fa58c8cc7410","26":"7b44dff6-4ea4-4e77-aee9-a10d78398e97","28":"c2bc6f34-d9da-4f3c-8065-d8d543d52eba","29":"da2aece4-aa06-4757-b4e2-36c301d6e2c2","30":"2130a146-0bab-41a5-a3e3-4158c3596c83","31":"560bd228-b87d-4973-a344-dbca4b6582fd","32":"672216cf-df45-4922-8271-4958bf9b12b6","33":"75bd8eb2-bbcc-4a02-b655-f91fc17f1f0e","34":"a8c71d05-15dd-4597-9893-910f6b791e82","35":"5c66e527-d187-4f4b-8a42-3b67822cb024","36":"7fad5f9f-7bba-4e09-98d3-49de455d163c","37":"1df1f818-606b-410a-8e73-9a6ac1311183","38":"0aae8f00-1eca-40fc-9a18-2c2778aab96f","40":"64318e46-feb9-495d-b0b3-10efc9c61f93","42":"643a6fb4-e857-4154-9164-9954a4f718e4","44":"ae5e5821-e71c-4129-901f-f491d991d0b1","45":"756f78ee-70ce-4e68-84a5-5faacb4b4498","50":"d2068a88-91cb-4fcd-af73-703f92f25e5a","51":"6fb88d8a-bea7-48b1-ad11-aa8d28b7088c","52":"a475e9c0-168b-461b-861a-995328ce7ce8","54":"71977fa7-63aa-45b6-aaa2-49bd4eb846ba","55":"33c244ec-72d3-43a6-a189-bc7350b04c06","56":"30974752-8792-4d40-8d39-5684d71fb21e","57":"b7d973b1-d671-4ce7-8541-adfed9bbe5df","58":"68902697-aa0d-4896-9333-f1a8433e239f","59":"975a8ed4-278e-428f-99f7-5a26c90e30ea","91":"6b2c2df3-a3a6-4fa1-985e-e40429e705f0","101":"d2ae9036-35f5-47de-a559-20d6e2567cc5","107":"55afc556-3df8-4102-ae31-5f198d92959c","109":"9b7df9b0-75f0-4855-b51c-3cd7fc5d6033","110":"85875ad6-a723-45b0-a7d5-853352942dac","112":"296ea1e5-a18f-40e4-8dc1-2e01034f8a80","114":"5d78176a-793e-4d17-a0e0-98529b9cd151","115":"ba7a9190-906a-4e50-8660-2965b0d5edf1","116":"d130e68e-345b-49e7-9427-e919942bf8a5","117":"dd6234bb-1be7-4c93-a881-c8143feffadd","119":"cbce2ba0-167a-4692-a57d-3e12aba51f23","120":"8df07ac9-3ae7-4644-9b30-ec68d7516ce9","123":"66754ac0-dd42-4d12-9f6d-e1d702b87b96","131":"21aa8520-b8e9-43cc-9be7-25e4b1a55baf","135":"65941da0-efd7-4b87-9c46-5dcd8eefb840","144":"c81baa95-9cc9-4a60-897c-f1449f005b21","157":"498d037c-d7b3-4ba3-a5b8-1072c8cc5337"};

// ─── Integration endpoints ─────────────────────────────────────
const SCRAPE_URL = "https://download-all-in-one-budget.p.rapidapi.com/v1/social/autolink";
const GEMINI_BASE = "https://generativelanguage.googleapis.com";
const GEMINI_MODEL = "gemini-3.6-flash";
const CLOUDINARY_CLOUD = "dspv9nm1n";
const CLOUDINARY_PRESET = "screen_shots";
const CLOUDINARY_FOLDER = "submissions";
const EMAIL_FROM = "Brieflee <support@brieflee.co>";
const APP_ORIGIN = "https://www.brieflee.co";
const DETAILS_PATH = "/submissions/details";
const LIVE_PATH = "/live/submissions";
const MAX_FILE_MB = 200;
// Largest video body the Softr proxy will carry to Gemini once base64 encoded.
const INLINE_MAX = 3 * 1024 * 1024;


// ─── The 26 Review Agents ──────────────────────────────────────
// key: reviews column prefix (null = review_report only)
// name: the exact threshold_name the prompt uses and Gemini echoes back
// pick: labels that switch the agent on from qa_checklist
// th: alias of the threshold field on brief/account ("" = none)
const AGENTS = [
  { key: "pst", name: "Product Screen Time", pick: ["Product visibility"], th: "thProductScreen", rule: "productVisibility" },
  { key: "hs",  name: "Hook Speed", pick: ["Hook quality"], th: "thHookSpeed", rule: "hookQuality" },
  { key: "vh",  name: "Visual Hook", pick: ["Visual hook"], th: "thVisualHook", rule: "visualHook" },
  { key: "cta", name: "CTA Placement", pick: ["CTA present"], th: "thCta", rule: "" },
  { key: "ft",  name: "Face Time (Creator Visibility)", pick: ["Creator visibility", "Creator visability"], th: "thFaceTime", rule: "" },
  { key: "tl",  name: "Text Legibility", pick: ["Text legibility", "Closed captions"], th: "thTextLegibility", rule: "" },
  { key: "ac",  name: "Audio Clarity", pick: ["Audio clarity"], th: "thAudioClarity", rule: "" },
  { key: "ep",  name: "Engagement Pacing (Scene Changes)", pick: ["Scene pacing"], th: "thPacing", rule: "" },
  { key: "bm",  name: "Brand Mentions", pick: ["Brand name mentioned"], th: "thBrandMentions", rule: "" },
  { key: "ba",  name: "Brand alignment", pick: ["Brand alignment"], th: "", rule: "brandAlignment" },
  { key: null,  name: "Follows the brief", pick: ["Follows the brief"], th: "", rule: "followsTheBrief" },
  { key: "cr",  name: "Copyright check", pick: ["Copyright check"], th: "", rule: "", always: true },
  { key: null,  name: "Closed captions", pick: ["Closed captions"], th: "thTextLegibility", rule: "" },
  { key: null,  name: "Audio delivery", pick: ["Audio delivery"], th: "", rule: "audioDelivery" },
  { key: null,  name: "Pronunciation", pick: ["Pronunciation"], th: "", rule: "" },
  { key: null,  name: "Music and sound balance", pick: ["Music & sound balance"], th: "", rule: "" },
  { key: null,  name: "Lighting camera", pick: ["Lighting & camera"], th: "", rule: "lightingCamera" },
  { key: null,  name: "Setting and background", pick: ["Setting & background"], th: "", rule: "settingBackground" },
  { key: null,  name: "Distracting elements", pick: ["Distracting elements"], th: "", rule: "distractingElements" },
  { key: null,  name: "Safe zones", pick: ["Safe zones"], th: "", rule: "" },
  { key: null,  name: "Watchable on mute", pick: ["Watchable on mute"], th: "", rule: "" },
  { key: null,  name: "Energy and authenticity", pick: ["Energy & authenticity"], th: "", rule: "energyAuthenticity" },
  { key: null,  name: "Wardrobe and appearance", pick: ["Wardrobe & appearance"], th: "", rule: "wardrobeAppearance" },
  { key: null,  name: "Product usage", pick: ["Product usage"], th: "", rule: "productUsage" },
  { key: null,  name: "Inspiration link match", pick: ["Inspiration link match"], th: "", rule: "inspirationLinkMatch" },
  { key: "cm",  name: "Content Moderation", pick: [], th: "", rule: "", always: true },
];

// Rules (verbatim from the n8n Code node).
const RULES = {
  productVisibility: "Product means the product in any form: packaging, removed from packaging, being applied, used, worn, consumed, demonstrated, visible results of use, close-ups, in hands, on body, in mouth, on a surface, or any scene with active interaction even if the product is not the dominant visual element.",
  hookQuality: "Rate how effectively the audio hook would stop someone scrolling. This refers to what the viewer hears: spoken words, opening sounds, or any audio that makes someone pay attention. Any hook type can score highly if it is compelling enough. A score between 80 and 100 means the audio immediately creates a reason to keep watching, opens a loop, sparks curiosity, or says something unexpected so the viewer would stop scrolling to hear what comes next. A score between 60 and 79 means the audio gets some attention but does not fully commit the viewer; the opening is decent but predictable or takes too long to land. A score below 60 means the audio is generic, boring, or slow to start, for example an unremarkable greeting with no follow-up hook and nothing that would make someone stop scrolling.",
  visualHook: "Rate how effectively the visual opening would stop someone scrolling. This refers to what the viewer sees: framing, movement, action, objects, or any visual surprise that grabs attention. Any visual approach can score highly if it is compelling enough. A score between 80 and 100 means the visuals are immediately eye-catching and something in the frame makes you stop and look, such as unexpected visuals, creative framing, strong movement, action, or something visually unusual. A score between 60 and 79 means there is some visual interest but nothing that demands attention, for example standard product demos, basic setups, or ordinary framing. A score below 60 means the opening uses a static talking head, a generic setup, or nothing visually interesting is happening in the first moments.",
  brandAlignment: "Rate whether the content matches the brand's visual identity, tone, and values as defined in the brand guidelines. A score between 80 and 100 means the content feels on-brand and the tone, colours, language, and overall vibe align with the brand guidelines provided. A score between 60 and 79 means the content is mostly on-brand but some elements feel off, such as tone in certain moments, colours or styling that do not quite match, or language that does not fully fit the brand voice. A score below 60 means the content feels off-brand and the tone, visuals, or messaging clash with the brand identity.",
  followsTheBrief: "Compare the video against every requirement listed in the brief, including talking points, product messaging, tone of voice, content structure, specific phrases, and any stated dos and don'ts, and treat each requirement as a checkpoint. A score between 80 and 100 means all key brief requirements are addressed, the main talking points are included, the tone matches, and the structure follows the direction in the brief. A score between 60 and 79 means most requirements are met but there are notable omissions, such as a missed talking point, tone that is slightly off, or a deviation from the requested structure. A score below 60 means multiple brief requirements are ignored or misunderstood so the content feels like the creator did not read or follow the brief carefully.",
  audioDelivery: "Rate how the creator delivers spoken content, focusing on performance and presentation rather than technical audio quality. A score between 80 and 100 means the delivery is confident and natural with good pacing and variation in tone, it does not sound scripted or robotic, and it is engaging to listen to. A score between 60 and 79 means the delivery is acceptable but flat, perhaps monotone, overly rehearsed, slightly rushed or hesitant, and lacking energy or a conversational feel. A score below 60 means the delivery is poor, with stumbling, awkward pauses, obvious script reading, whispering, or pacing that makes it hard to follow.",
  lightingCamera: "Rate the lighting and camera clarity. A score between 80 and 100 means the video is well lit with natural or intentional lighting, the face and product are clearly visible, the footage is stable, the framing is good, and the resolution is appropriate for the platform. A score between 60 and 79 means the lighting and camera work are adequate but have noticeable issues such as being slightly dark, minor shakiness, awkward framing, or mixed lighting temperatures. A score below 60 means the video is poorly lit with dark scenes or harsh shadows on the face or product, the footage is shaky or unstable, the subject is out of focus, or the framing cuts off key elements.",
  settingBackground: "Rate whether the environment supports the content and does not detract from the message. A score between 80 and 100 means the setting is clean and intentional, fits the content, and the background either adds helpful context or stays neutral without drawing attention, with no clutter or distracting elements. A score between 60 and 79 means the setting is acceptable but has minor issues, such as being slightly messy, not quite matching the product or brand vibe, or feeling like an unplanned or last-minute choice. A score below 60 means the setting is distracting or inappropriate, with visible mess, an unflattering environment, or a background that clashes with the product or undermines credibility.",
  distractingElements: "Flag anything that pulls viewer attention away from the creator, product, or message. A score between 80 and 100 means there are no meaningful distractions and viewer focus stays on the content throughout. A score between 60 and 79 means there are minor distractions such as some background movement, brief interruptions, notification sounds, slight wardrobe issues, or other people partially visible in ways that do not dominate the frame. A score below 60 means there are major distractions such as people walking through the frame, pets or children interrupting, loud background noise that competes with speech, visible competitor logos, or TVs and screens playing prominently in the background.",
  energyAuthenticity: "Rate whether the creator feels genuine and engaged, without judging them against a single personality type. Both high-energy and low-energy styles can score well if they feel authentic and appropriate for the content. A score between 80 and 100 means the creator feels natural and invested, their delivery matches the product and audience, and they come across as someone who actually uses or cares about what they are showing. A score between 60 and 79 means the performance feels slightly forced, flat, or performative, as if the creator is going through the motions rather than truly connecting with the content. A score below 60 means the creator appears clearly disengaged, reads a script with no conviction, or is so exaggerated that it feels fake, making it unlikely that a viewer would believe they use or like the product.",
  wardrobeAppearance: "Rate whether the creator's appearance is appropriate for the content and brand, focusing on intentionality rather than personal style preferences. A score between 80 and 100 means the creator looks put together and appropriate for the product and brand, their appearance does not distract from the message, and any look or vibe specified in the brief has been followed. A score between 60 and 79 means the appearance is acceptable but slightly off, for example not quite matching the brand tone, looking unconsidered, or showing minor grooming issues that catch the eye. A score below 60 means the appearance actively undermines the content, such as being visibly unkempt in a way that clashes with the brand, wearing competitor logos, or looking so mismatched with the product that it harms credibility.",
  productUsage: "Rate how the creator demonstrates or interacts with the product, focusing on usage quality rather than simple screen time. A score between 80 and 100 means the product is used naturally and correctly, demonstrated the way a real user would apply, wear, consume, or handle it in a believable context, and the usage matches any instructions given in the brief. A score between 60 and 79 means the product is shown being used but the interaction feels awkward, rushed, staged, or incomplete, the creator seems unfamiliar with it, or they skip key usage moments the viewer would expect to see. A score below 60 means the product is barely interacted with, used incorrectly, or handled in a way that makes it look bad so the creator treats it more like a prop than something they would actually use.",
  inspirationLinkMatch: "When an example or inspiration video has been provided with the brief, compare the submission against it for structural and stylistic alignment rather than exact replication. The creator should capture the spirit of the reference, not copy it frame for frame. A score between 80 and 100 means the submission clearly draws from the inspiration, with similar structure, pacing, energy, hook style, or creative approach, and it feels like the creator studied the reference and adapted it in their own way. A score between 60 and 79 means there are some similarities, but key elements that made the inspiration work are missing, such as different pacing, a weaker hook, or a failure to capture the tone or energy. A score below 60 means there is no visible connection to the inspiration video and it feels like the creator did not watch it or chose to ignore it. If no inspiration link was provided at all, set the score for this metric to 0 and do not provide a qualitative evaluation.",
};
const DO_NOT_CHECK = "DO NOT CHECK THIS";

// ─── Helpers ───────────────────────────────────────────────────
function unwrapE(raw) {
  if (raw == null) return "";
  if (typeof raw === "string") return raw.trim();
  if (Array.isArray(raw)) { const f = raw[0]; if (typeof f === "string") return f.trim(); return String(f?.label ?? f?.name ?? "").trim(); }
  if (typeof raw === "object") return String(raw.label ?? raw.name ?? "").trim();
  return String(raw).trim();
}
function unwrapAll(raw) {
  if (raw == null) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map((x) => (typeof x === "string" ? x : String(x?.label ?? x?.name ?? ""))).map((s) => s.trim()).filter(Boolean);
}
function idsOf(raw) {
  if (raw == null) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map((x) => (typeof x === "string" ? x : x?.id || "")).filter(Boolean);
}
function cleanText(text) {
  if (!text) return "";
  return String(text)
    .replace(/<[^>]+>/g, " ")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}]/gu, "")
    .replace(/[\*\(\)\[\]\•]/g, "")
    .replace(/[^\x20-\x7E\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
function stripEmDash(text) { return String(text || "").replace(/—|–/g, ", ").replace(/ ,/g, ","); }
// A hosted video file (the Discover library hands these in) needs no scrape.
// It is never accepted as a pasted link: see linkOk in the form.
function isDirectVideoUrlE(input) { return /^https?:\/\/\S+\.(mp4|mov|m4v|webm)(\?\S*)?$/i.test((input || "").trim()); }
// A pasted link has to be a video on one of the four platforms: a TikTok,
// an Instagram Reel, a Facebook Reel or a YouTube Short. Profiles, feeds
// and long-form YouTube links are turned away.
function detectPlatform(input) {
  const v = (input || "").toLowerCase();
  if (v.includes("tiktok.com")) return "TikTok";
  if (v.includes("instagram.com")) return "Instagram";
  if (v.includes("youtube.com") || v.includes("youtu.be")) return "YouTube";
  return "Upload";
}
function ytVideoId(u) { const m = String(u || "").match(/(?:shorts\/|watch\?v=|youtu\.be\/|embed\/)([\w-]{6,20})/); return m ? m[1] : ""; }
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
async function blobToBase64(blob) {
  const buf = new Uint8Array(await blob.arrayBuffer());
  let bin = ""; const CH = 0x8000;
  for (let i = 0; i < buf.length; i += CH) bin += String.fromCharCode.apply(null, buf.subarray(i, i + CH));
  return btoa(bin);
}
function fmtDuration(seconds) {
  const s = Math.round(Number(seconds) || 0);
  if (!s) return "0s";
  const m = Math.floor(s / 60); const r = s % 60;
  return m === 0 ? `${r}s` : `${m}m ${r}s`;
}
function aspectRatio(w, h) {
  if (!w || !h) return "";
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const d = gcd(w, h);
  return `${w / d}:${h / d}`;
}
function cldScreenshot(publicId, sec) {
  if (!publicId || sec === null || sec === undefined || sec === "") return "";
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/upload/so_${Math.max(0, Math.round(Number(sec) || 0))}/c_fill,h_1920,w_1080/${publicId}.jpg`;
}
function cldThumb(publicId) {
  return publicId ? `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/upload/so_1/c_fill,h_640,w_360/${publicId}.jpg` : "";
}
function parseGeminiJson(raw) {
  let text = raw;
  if (text && typeof text === "object") text = text?.candidates?.[0]?.content?.parts?.map((p) => p?.text || "").join("") || "";
  text = String(text || "").trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  const s = text.indexOf("{"); const e = text.lastIndexOf("}");
  if (s === -1 || e === -1) throw new Error("The review came back in a shape we could not read.");
  return JSON.parse(text.slice(s, e + 1));
}
// Auto Download All In One adapter (from the checker).
function adaptScrape(json) {
  const d = json?.data || json || {};
  const medias = Array.isArray(d.medias) ? d.medias : [];
  const durRaw = Number(d.duration) || 0;
  const durSec = Math.round(durRaw > 600 ? durRaw / 1000 : durRaw);
  const sizeOf = (m) => {
    if (m.data_size) return Number(m.data_size) || 9e9;
    const clen = /[?&]clen=(\d+)/.exec(String(m.url || ""));
    if (clen) return Number(clen[1]);
    if (m.bitrate && durSec) return (Number(m.bitrate) / 8) * durSec;
    return 9e9;
  };
  const vids = medias.filter((m) => m?.type === "video" && m?.url);
  const withAudio = vids.filter((m) => m.audioQuality || m.is_audio);
  const audible = withAudio.length ? withAudio : vids;
  const direct = audible.filter((m) => !/api\.tiktokv\.com/i.test(m.url));
  const pool = direct.length ? direct : audible;
  pool.sort((a, b) => sizeOf(a) - sizeOf(b));
  const vid = pool[0] || medias.find((m) => m?.url) || {};
  const authorRaw = d.author;
  const handle = typeof authorRaw === "string" ? authorRaw : (authorRaw?.unique_id || authorRaw?.nickname || d.author_name || "");
  return {
    mp4: vid.url || d.hdplay || d.play || d.video_url || d.download_url || "",
    handle: handle ? (String(handle).startsWith("@") ? String(handle) : "@" + handle) : "",
    duration: durSec || Math.round(Number(vid.duration) || 0),
    cover: d.thumbnail || d.cover || d.origin_cover || "",
  };
}

// ─── Threshold and prompt builders (ported from n8n) ───────────
const isValidThreshold = (val) => {
  const s = unwrapE(val).toLowerCase();
  return s !== "" && s !== "none" && s !== "0";
};

// Which agents run: the union of the brief's and the account's Review
// Agents. Thresholds come from the brief first, then the account.
function buildChecks(account, brief, extra) {
  const picked = new Set([...unwrapAll(account?.qaChecklist), ...unwrapAll(brief?.qaChecklist), ...(extra || [])].map((s) => s.toLowerCase()));
  const isChecked = (labels) => labels.some((l) => picked.has(l.toLowerCase()));
  let usedBrief = false;
  const checks = AGENTS.map((a) => {
    let th = "";
    if (a.th) {
      if (brief && isValidThreshold(brief[a.th])) { th = unwrapE(brief[a.th]); usedBrief = true; }
      else if (account && isValidThreshold(account[a.th])) th = unwrapE(account[a.th]);
    }
    const on = a.always || !!th || isChecked(a.pick);
    if (!on) return { ...a, value: DO_NOT_CHECK, on: false, threshold: "" };
    const rule = a.rule ? RULES[a.rule] : "";
    const value = (th ? th + ". " : "") + (rule || a.name);
    return { ...a, value: value.trim(), on: true, threshold: th };
  });
  return { checks, thresholdSource: usedBrief ? "Brief" : "Account" };
}

function buildPrompt({ account, brief, notes, checks, meta, screenshotBase, previous, kind }) {
  if (kind === "analyse" || kind === "remix") return buildSwipePrompt({ account, notes, checks, meta, screenshotBase, withScript: kind === "remix" });
  const briefLines = brief ? [
    brief.description ? `Brief: ${cleanText(brief.description)}` : "",
    brief.productFeature ? `Product or feature: ${cleanText(brief.productFeature)}` : "",
    brief.talkingPoints ? `Talking points: ${cleanText(brief.talkingPoints)}` : "",
    brief.script ? `Script or structure: ${cleanText(brief.script)}` : "",
    brief.captionHooks ? `Caption hooks: ${cleanText(brief.captionHooks)}` : "",
    brief.visualHooks ? `Visual action hooks: ${cleanText(brief.visualHooks)}` : "",
    brief.voiceoverHooks ? `Voiceover hooks: ${cleanText(brief.voiceoverHooks)}` : "",
    brief.dos ? `Do: ${cleanText(brief.dos)}` : "",
    brief.donts ? `Do not: ${cleanText(brief.donts)}` : "",
    brief.makeSure ? `Make sure: ${cleanText(brief.makeSure)}` : "",
  ].filter(Boolean).join("\n") : "No brief was attached. Judge brief compliance against the brand context only.";
  const brandLines = [
    account?.brandBio ? `Brand: ${cleanText(account.brandBio)}` : "",
    account?.brandVoice ? `Voice: ${cleanText(account.brandVoice)}` : "",
    account?.brandCta ? `CTA: ${cleanText(account.brandCta)}` : "",
    account?.targetAudience ? `Audience: ${cleanText(account.targetAudience)}` : "",
    account?.painPoints ? `Audience pain points: ${cleanText(account.painPoints)}` : "",
    account?.objectives ? `Audience objectives: ${cleanText(account.objectives)}` : "",
    account?.niche ? `Niche: ${cleanText(account.niche)}` : "",
  ].filter(Boolean).join("\n");
  const example = brief?.exampleAnalysis ? cleanText(typeof brief.exampleAnalysis === "string" ? brief.exampleAnalysis : JSON.stringify(brief.exampleAnalysis)).slice(0, 4000) : "";
  const checkLines = checks.map((c) => `- ${c.name}: ${c.value}`).join("\n");

  return `You are a professional content reviewer. Your role is to evaluate UGC and influencer videos against a specific creative brief and quality thresholds.

TWO-PASS ANALYSIS:
Pass 1 - Visual: Watch the entire video. Identify all scenes, objects, actions, text overlays, and visual transitions.
Pass 2 - Audio: Listen to the entire audio track. Cross-reference with visual observations. When visual and audio conflict, trust the audio for intent and the visual for presence.

BRAND CONTEXT:
${brandLines || "None provided."}

BRIEF REQUIREMENTS:
${briefLines}

SUBMISSION NOTES:
${cleanText(notes) || "None."}
${previous ? `
THIS IS A REVISION. THE EARLIER CUT WAS REVIEWED AS FOLLOWS:
Decision: ${previous.decision || "not recorded"}
Reasoning: ${cleanText(previous.reasoning) || "not recorded"}
Changes requested: ${cleanText(previous.request) || "not recorded"}
Recommended action: ${cleanText(previous.action) || "not recorded"}
Checks that failed last time: ${cleanText(previous.failed) || "not recorded"}
Check specifically whether each requested change was made in this cut, and name the earlier issue in your comment when you judge it.
` : ""}${example ? `
EXAMPLE VIDEO ANALYSIS:
The brief links an example video. Use this analysis to benchmark the submission. Where the submission matches the example's strengths, note it. Where it falls short, flag it.
${example}
` : ""}
QUALITY ASSURANCE CHECKS:
${checkLines}

SCORING TYPES (reference only for formatting):

Percentage (score = number only, value = number + %):
Product Screen Time, Product usage, Visual Hook, Audio Clarity, Audio delivery, Music and sound balance, Lighting camera, Setting and background, Text Legibility, Watchable on mute, Face Time (Creator Visibility), Energy and authenticity, Brand alignment, Follows the brief, Inspiration link match

Count (score = number, value = number + unit):
Brand Mentions (times), Distracting elements (elements)

Seconds (score = number, value = number + seconds):
Hook Speed, CTA Placement, Engagement Pacing (Scene Changes)

Status (score = PASS or FAIL or REVIEW, value = short description):
Pronunciation, Closed captions, Safe zones, Wardrobe and appearance, Copyright check, Content Moderation

SCORING RULES:
- If the QA check value contains a number or threshold: score against it. PASS if meets/exceeds. FAIL if below. Severity = CRITICAL for FAIL, WARNING for borderline.
- If the QA check value is descriptive text only (no threshold number): evaluate against the brief requirements. PASS for acceptable, FLAGGED for issues worth noting.
- Follows the brief: always evaluate against every stated brief requirement. Score as percentage of requirements met.
- Copyright check and Content Moderation: always PASS/REVIEW/FAIL with severity INFO/WARNING/CRITICAL.

DECISION HIERARCHY:
- APPROVED: All threshold items PASS. Brief requirements substantially met. No critical moderation issues.
- FLAGGED: One or more items score below threshold OR notable brief compliance issues.
- REJECTED: Critical content moderation failure OR multiple threshold failures OR fundamental brief non-compliance.

VIDEO METADATA:
Format: ${meta.format}
Size: ${meta.sizeMb}MB
Resolution: ${meta.resolution}
Aspect Ratio: ${meta.aspect}
Frame Rate: ${meta.fps}fps
Duration: ${meta.duration}

TIMESTAMP RULES:
- Plain integer seconds only. 3 seconds = 3. 1 minute 7 seconds = 67.
- Never zero-pad: not 0003, not 00:03
- screenshot_url uses so_{integer} format

Your Task: Watch this video and provide a comprehensive review against the brief. Return your response in JSON format with no additional commentary before or after.

The JSON structure must be EXACTLY as follows:

{
  "overall_review": {
    "video_title": "[3-6 words naming what is DISTINCTIVE about this particular video, taken from how it opens: the specific action, line, setting or visual in the first few seconds. Never restate the brief, the product name or the category. Never a generic label such as 'Product Review' or 'Daily Set Review', because fifty creators shooting one brief must not all land on the same title. Examples: 'Rain-soaked morning routine', 'Dropped the bottle twice', 'Deadpan piece to camera'.]",
    "overall_rating": [1-5],
    "overall_comment": "[Two short paragraphs, 120 words at most in total: (1) How well the video fulfils the brief and its production quality, (2) What needs to change if not approved]",
    "ai_decision": "APPROVED or FLAGGED or REJECTED",
    "decision_reasoning": "[Explain the decision. List any failing items or brief requirements not met. Be specific about what needs to change.]",
    "recommended_action": "[Specific next step for the creator or brand manager]"
  },
  "analysis": [
    {
      "threshold_name": "[exact name from QA checks list]",
      "score": "[see scoring type]",
      "value": "[score with unit]",
      "status": "PASS or FAIL or FLAGGED",
      "rating": [1-5],
      "severity": "INFO or WARNING or CRITICAL",
      "comment": "[One or two sentences, 40 words at most, on what you observed for this metric, with the timestamp. If the brief specifies requirements for this metric, reference them.]",
      "key_moment_timestamp": [seconds - the most relevant moment for this metric],
      "screenshot_url": "${screenshotBase}"
    }
  ],
  "transcript": "[Scene-by-scene breakdown, one line per scene change and never more than 25 lines. Format: [Xs] Visual: [action] | Dialogue: [words or None] | Text: [overlays or None]]"
}

CRITICAL REQUIREMENTS:
- Return ONLY valid JSON with no text before or after
- Keep every comment short: the whole response must stay compact
- Only include analysis items where the QUALITY ASSURANCE CHECKS value is NOT "DO NOT CHECK THIS"
- Do not include any metric marked as "DO NOT CHECK THIS" in the analysis array
- Copyright check and Content Moderation are always included
- Use exact field names: threshold_name, score, value, status, rating, severity, comment, key_moment_timestamp, screenshot_url
- threshold_name must be copied EXACTLY from the QUALITY ASSURANCE CHECKS list
- Score must always be a string (even if it's a number)
- All analysis items must have ALL fields present
- Do not add any additional fields or sections`;
}

// Normalise Gemini's analysis array into a map keyed by agent name.
// Analyse and Remix: the swipe-file prompt from the New Video workflow.
// Analyse is the breakdown alone; Remix adds the adapted script.
function buildSwipePrompt({ account, notes, checks, meta, screenshotBase, withScript }) {
  const brandLines = [
    account?.brandBio ? `Brand: ${cleanText(account.brandBio)}` : "",
    account?.brandVoice ? `Voice: ${cleanText(account.brandVoice)}` : "",
    account?.brandCta ? `CTA: ${cleanText(account.brandCta)}` : "",
    account?.targetAudience ? `Audience: ${cleanText(account.targetAudience)}` : "",
    account?.painPoints ? `Audience pain points: ${cleanText(account.painPoints)}` : "",
    account?.objectives ? `Audience objectives: ${cleanText(account.objectives)}` : "",
    account?.niche ? `Niche: ${cleanText(account.niche)}` : "",
  ].filter(Boolean).join("\n");
  const checkLines = checks.map((c) => `- ${c.name}: ${c.value}`).join("\n");
  return `You are a professional content strategist working for the brand below. Your role is to analyze video examples (swipe files) the brand wants to learn from${withScript ? " or adapt for their own content" : ""}.

CONTEXT: The brand has shared this video because they see potential in its creative approach, storytelling, or production style. Your job is to:
1. Analyze why this video works
2. Evaluate it against the brand's quality standards${withScript ? `
3. Create an adapted script that translates the video's effective elements into content that aligns with the brand's voice, audience, and objectives` : ""}

The video may be from a completely different industry or brand. Focus on the underlying creative strategy${withScript ? " that could be adapted" : ""}.

BRAND CONTEXT:
${brandLines || "None provided."}

NOTES FROM THE BRAND:
${cleanText(notes) || "None."}

TWO-PASS ANALYSIS:
Pass 1 - Visual: Watch the entire video. Identify all scenes, objects, actions, text overlays, and visual transitions.
Pass 2 - Audio: Listen to the entire audio track. Cross-reference with visual observations. When visual and audio conflict, trust the audio for intent and the visual for presence.

SWIPE FILE SCORING RULES:
- Every item status = PASS (swipe files are informational, never FAIL)
- Every item severity = INFO
- Ratings (1-5) measure how effective the element is, not quality. 5 = exceptionally effective, 1 = not effective. If a metric's score is 0 (the element does not appear or is not applicable) set the rating to 0.
- ai_decision is always APPROVED

QUALITY ASSURANCE CHECKS:
${checkLines}

SCORING TYPES (reference only for formatting):

Percentage (score = number only, value = number + %):
Product Screen Time, Product usage, Visual Hook, Audio Clarity, Audio delivery, Music and sound balance, Lighting camera, Setting and background, Text Legibility, Watchable on mute, Face Time (Creator Visibility), Energy and authenticity, Brand alignment, Follows the brief, Inspiration link match

Count (score = number, value = number + unit):
Brand Mentions (times), Distracting elements (elements)

Seconds (score = number, value = number + seconds):
Hook Speed, CTA Placement, Engagement Pacing (Scene Changes)

Status (score = PASS or FAIL or REVIEW, value = short description):
Pronunciation, Closed captions, Safe zones, Wardrobe and appearance, Copyright check, Content Moderation
${withScript ? `
SCRIPT ADAPTATION GUIDELINES:
- Same creator, different product: keep the creator's voice and personality, only swap the product layer
- Preserve the format: an unboxing stays an unboxing, conversational stays conversational
- No polishing: if the original sounds like natural speech, the remix should too, no marketing-speak
- Genuine moments: if the original has a real reaction or discovery, create an equivalent one, never a sales pitch
- Stay within 15% of the original word count, no extra scenes or talking points
- Text overlays: only where the original has them, rewritten for the brand. If none exist, suggest one for the hook and one for the CTA
- Visual-only videos: instead of a script, provide a scene-by-scene recreation guide for the brand's product, with setup, framing, transitions and timing
- Replace product references, pain points and CTA with the brand's context
- End with the brand's CTA
` : ""}
VIDEO METADATA:
Format: ${meta.format}
Size: ${meta.sizeMb}MB
Resolution: ${meta.resolution}
Aspect Ratio: ${meta.aspect}
Frame Rate: ${meta.fps}fps
Duration: ${meta.duration}

TIMESTAMP RULES:
- Plain integer seconds only. 3 seconds = 3. 1 minute 7 seconds = 67.
- Never zero-pad: not 0003, not 00:03
- screenshot_url uses so_{integer} format

Your Task: Watch this video and provide a comprehensive analysis. Return your response in JSON format with no additional commentary before or after.

The JSON structure must be EXACTLY as follows:

{
  "overall_review": {
    "video_title": "[3-6 words naming what is DISTINCTIVE about this particular video, taken from how it opens: the specific action, line, setting or visual in the first few seconds. Never restate the brief, the product name or the category. Never a generic label such as 'Product Review' or 'Daily Set Review', because fifty creators shooting one brief must not all land on the same title. Examples: 'Rain-soaked morning routine', 'Dropped the bottle twice', 'Deadpan piece to camera'.]",
    "overall_rating": [1-5],
    "overall_comment": "[2-3 paragraph analysis covering: (1) What makes this video effective or ineffective, (2) Which creative elements could work for this brand, (3) How this approach could be reimagined for this brand]",
    "ai_decision": "APPROVED",
    "decision_reasoning": "[Explain whether this is a good reference video for the brand and why]",
    "recommended_action": "[What the brand should do with this video: adapt the hook structure, use similar pacing, recreate with brand messaging, and so on]"
  },
  "analysis": [
    {
      "threshold_name": "[exact name from QA checks list]",
      "score": "[see scoring type]",
      "value": "[score with unit]",
      "status": "PASS",
      "rating": [0-5],
      "severity": "INFO",
      "comment": "[2-3 sentences on what you observed for this metric. Be specific with timestamps. Do not pad with generic praise.]",
      "key_moment_timestamp": [seconds - the most relevant moment for this metric],
      "screenshot_url": "${screenshotBase}"
    }
  ],
  "transcript": "[Scene-by-scene breakdown. Format: [Xs] Visual: [action] | Dialogue: [words or None] | Text: [overlays or None]]"${withScript ? `,
  "adapted_script": "[If the video has spoken audio: rewrite the transcript as if the same creator made this video about the brand's product instead. Keep their tone, personality, natural speech patterns and narrative flow, only swap the product, claims and CTA. Stay within 15% of the original word count. Format as scene-by-scene with timestamps, spoken dialogue and visual directions. If the video has no spoken audio: provide a scene-by-scene visual recreation guide for the brand, with each scene's setup, framing, movement, transitions and timing, and suggest where to add voiceover or text overlays.]"` : ""}
}

CRITICAL REQUIREMENTS:
- Return ONLY valid JSON with no text before or after
- Only include analysis items where the QUALITY ASSURANCE CHECKS value is NOT "DO NOT CHECK THIS"
- Do not include any metric marked as "DO NOT CHECK THIS" in the analysis array
- Copyright check and Content Moderation are always included
- Use exact field names: threshold_name, score, value, status, rating, severity, comment, key_moment_timestamp, screenshot_url
- threshold_name must be copied EXACTLY from the QUALITY ASSURANCE CHECKS list${withScript ? `
- The adapted_script field must be included and contain a complete adapted script` : ""}`;
}

function normaliseAnalysis(parsed, checks, publicId) {
  const byName = new Map();
  const wanted = checks.filter((c) => c.on);
  const lower = new Map(wanted.map((c) => [c.name.toLowerCase(), c]));
  for (const a of Array.isArray(parsed.analysis) ? parsed.analysis : []) {
    const nm = String(a?.threshold_name || "").trim();
    if (!nm) continue;
    const agent = lower.get(nm.toLowerCase()) || wanted.find((c) => c.pick.some((p) => p.toLowerCase() === nm.toLowerCase()));
    if (!agent) continue;
    const ts = a.key_moment_timestamp === null || a.key_moment_timestamp === undefined || a.key_moment_timestamp === "" ? null : Math.max(0, Math.round(Number(a.key_moment_timestamp) || 0));
    const statusRaw = String(a.status || "").toUpperCase();
    const status = statusRaw === "PASS" ? "PASS" : statusRaw === "FLAGGED" || statusRaw === "REVIEW" ? "FLAGGED" : "FAIL";
    const sevRaw = String(a.severity || "").toUpperCase();
    byName.set(agent.name, {
      agent,
      score: stripEmDash(String(a.score ?? "")),
      value: stripEmDash(String(a.value ?? "")),
      status,
      rating: Math.min(5, Math.max(1, Math.round(Number(a.rating) || 3))),
      severity: sevRaw === "CRITICAL" ? "CRITICAL" : sevRaw === "WARNING" ? "WARNING" : "INFO",
      comment: stripEmDash(a.comment || ""),
      timestamp: ts,
      screenshot: ts === null ? "" : cldScreenshot(publicId, ts),
    });
  }
  return byName;
}

// ─── Keyed loaders ─────────────────────────────────────────────
// Each mounts only with a real record id, so useRecord never runs
// with an empty id (that queries, fails and retries on a timer,
// toasting each round). Every loader reports { status, f } upward,
// and a loader that errors is unmounted by its parent so it never
// retries against a table the visitor cannot read.
function AccountLoader({ recordId, onState }) {
  const { data, status } = useRecord({ recordId, select: accountSelect, from: ds.accounts });
  useEffect(() => { onState({ status, f: status === "success" ? (data?.fields || null) : null }); }, [data, status, onState]);
  return null;
}
function OwnerLoader({ recordId, onState }) {
  const { data, status } = useRecord({ recordId, select: ownerSelect, from: ds.users });
  useEffect(() => { onState({ status, f: status === "success" ? (data?.fields || null) : null }); }, [data, status, onState]);
  return null;
}
function BriefLoader({ recordId, onState }) {
  const { data, status } = useRecord({ recordId, select: briefSelect, from: ds.briefs });
  useEffect(() => { onState({ status, f: status === "success" ? (data?.fields || null) : null }); }, [data, status, onState]);
  return null;
}
// Briefs in the workspace for the picker. Mounted only in the
// workspace context, so the public creator routes never list briefs.

// Reviews status columns take option ids only. Columns without a FLAGGED
// choice record it as needs adjustment or as a fail, never as loose text.
function statusValue(prefix, status) {
  const ids = STATUS_IDS[prefix] || {};
  if (ids[status]) return ids[status];
  if (status === "FLAGGED") return ids.NEEDS_ADJUSTMENT || ids.FAIL || null;
  return null;
}
function numericScore(s) {
  const n = parseFloat(String(s).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? Math.round(n) : null;
}
// A page opened as a side panel keeps its own query inside the host page's
// `modal` param (/videos?modal=%2Freview%3Furl%3D...), so look there too.
// The workspace the switcher last chose (it writes this key), so a panel
// opened without ?workspace= still follows the page's workspace.
function cleanName(s) { return String(s || "").replace(/<[^>]*>/g, " ").replace(/https?:\/\/\S+/gi, " ").replace(/[^\p{L}\p{N} .,'&-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 60); }
// The Review Agents step: every kind (Review, Analyse, Remix) shows it, pre-ticked
// with the workspace's saved agents, and the AI needs at least three to check.


export default function Block() {
  const currentId = useCurrentRecordId();
  const [urlId] = useState(() => {
    try { return new URLSearchParams(window.location.search).get("recordId") || ""; } catch { return ""; }
  });
  const submissionId = currentId || urlId;
  // ?show=<state> forces a state on a reviewed submission, display only.
  const [demoState] = useState(() => {
    try {
      const d = new URLSearchParams(window.location.search).get("show") || "";
      return ["reviewing", "manualWait", "hybridWait", "approved", "changes", "rejected", "aiFlagged"].includes(d) ? d : "";
    } catch { return ""; }
  });

  const { data: subRec, status: subStatus, refetch: refetchSub } = useRecord({ recordId: submissionId, select: subSelect, from: ds.submissions });
  const sf = subRec?.fields || {};

  const [verdict, setVerdict] = useState({ status: "none", id: "", f: null });
  const rf = verdict.f || {};
  const reviewId = verdict.id || "";
  const [reportRows, setReportRows] = useState([]);

  // ── Facts about this submission ──
  const brandName = linkLabels(sf.accounts)[0] || "the brand";
  const brandLogo = pick(sf.logoUrl);
  const briefId = linkIds(sf.briefs)[0] || "";
  const briefName = pick(sf.briefName);
  const creatorName = (pick(sf.creatorName) || "").trim();
  const creatorEmail = (pick(sf.creatorEmail) || "").trim();
  const creatorFirst = creatorName.split(/\s+/)[0] || "";
  const submittedOn = dateLabel(pick(sf.createdAt));
  const parentRevision = parseInt(pick(sf.revisionNumber), 10) || 0;
  const title = pick(sf.name) || "Your video";

  const mode = labelOf(rf.aiMode) || labelOf(sf.aiMode) || "";
  const human = labelOf(rf.humanDecision) || "";
  const ai = labelOf(rf.aiDecision) || labelOf(rf.overallStatus) || "";
  const humanDecided = !!human && human !== "Pending";
  const hasReview = verdict.status === "success" && !!verdict.f && !!ai;
  const reviewFailed = verdict.status === "error";
  const reviewing = subStatus === "success" && !hasReview && !reviewFailed;

  // ── The checks: review_report rows first, then the review's own columns ──
  const checks = useMemo(() => {
    const fromReport = reportRows.map((r) => {
      const fl = r.fields || {};
      const shot = pick(fl.screenshot);
      const raw = pick(fl.criteria);
      return { id: r.id, name: niceName(raw), group: groupOf(raw), score: pick(fl.score) || pick(fl.threshold), status: labelOf(fl.status), comment: plainText(pick(fl.comment)), shot, sec: momentOf(fl.moment) ?? shotSec(shot) };
    });
    if (fromReport.length) return fromReport;
    const flat = [
      ["hook",    "Hook speed",        rf.hookScore,    rf.hookStatus,    rf.hookComment,    rf.hookShot],
      ["vhook",   "Visual hook",       rf.vhookScore,   rf.vhookStatus,   rf.vhookComment,   rf.vhookShot],
      ["pacing",  "Pacing",            rf.pacingScore,  rf.pacingStatus,  rf.pacingComment,  rf.pacingShot],
      ["product", "Product on screen", rf.productScore, rf.productStatus, rf.productComment, rf.productShot],
      ["audio",   "Audio clarity",     rf.audioScore,   rf.audioStatus,   rf.audioComment,   rf.audioShot],
      ["face",    "Face time",         rf.faceScore,    rf.faceStatus,    rf.faceComment,    rf.faceShot],
      ["text",    "Text legibility",   rf.textScore,    rf.textStatus,    rf.textComment,    rf.textShot],
      ["cta",     "Call to action",    rf.ctaScore,     rf.ctaStatus,     rf.ctaComment,     rf.ctaShot],
      ["mention", "Brand mentions",    rf.mentionScore, rf.mentionStatus, rf.mentionComment, rf.mentionShot],
      ["mod",     "Brand safety",      null,            rf.modStatus,     rf.modComment,     rf.modShot],
      ["copy",    "Copyright",         null,            rf.copyStatus,    rf.copyComment,    rf.copyShot],
      ["align",   "Brief alignment",   null,            rf.alignStatus,   rf.alignComment,   rf.alignShot],
    ];
    return flat.map((row) => {
      const status = labelOf(row[3]);
      const comment = plainText(pick(row[4]));
      const rawScore = pick(row[2]);
      const score = rawScore === "" ? "" : String(rawScore);
      if (!status && !comment && !score) return null;
      const shot = pick(row[5]);
      return { id: "rv:" + row[0], name: row[1], group: groupOf(row[1]), score, status, comment, shot, sec: shotSec(shot) };
    }).filter(Boolean);
  }, [reportRows, verdict.f]);

  const passCount = checks.filter((c) => passes(c.status)).length;
  const fixes = checks.filter((c) => !passes(c.status));

  // ── The state the page is in ──
  const state = useMemo(() => {
    if (demoState && (hasReview || demoState === "reviewing")) return demoState;
    if (!hasReview) return reviewing ? "reviewing" : "missing";
    if (humanDecided) {
      if (human === "Approve") return "approved";
      if (human === "Changes Requested") return "changes";
      if (human === "Reject") return "rejected";
    }
    if (mode === "Manual") return "manualWait";
    const aiOk = /APPROVED|PASS/.test(ai.toUpperCase());
    const aiNo = /REJECTED|FAIL/.test(ai.toUpperCase());
    if (mode === "Hybrid") return "hybridWait";
    if (aiOk) return "approved";
    if (aiNo) return "rejected";
    return "aiFlagged";
  }, [demoState, hasReview, reviewing, humanDecided, human, mode, ai]);

  const showDetail = hasReview && mode !== "Manual" && demoState !== "manualWait" && state !== "reviewing";
  const canResubmit = state === "changes" || state === "aiFlagged" || (state === "rejected" && (mode === "Autonomous" || !!demoState));
  const brandNotes = plainText(pick(rf.requestMessage));
  const summary = plainText(pick(rf.overallComment));
  const reasoning = plainText(pick(rf.decisionReasoning));

  // Poll while the Review Agents are still working.
  useEffect(() => {
    if (!reviewing || !refetchSub) return undefined;
    const t = setInterval(() => { try { refetchSub(); } catch (e) { /* noop */ } }, 15000);
    return () => clearInterval(t);
  }, [reviewing, refetchSub]);

  // The old engine block on this page stays hidden until it is deleted.
  useEffect(() => {
    try { const el = document.getElementById(OLD_ENGINE_BLOCK); if (el) el.style.display = "none"; } catch (e) { /* noop */ }
  }, [subStatus]);

  // ── Video ──
  const videoRef = useRef(null);
  const fileUrl = firstFileUrl(sf.videoFile);
  const displayUrl = pick(rf.displayUrl) || pick(sf.displayUrl);
  const videoUrl = pick(sf.videoUrl);
  const src = isMp4Url(displayUrl) ? displayUrl : (fileUrl || (isMp4Url(videoUrl) ? videoUrl : ""));
  const poster = pick(rf.thumbnail) || pick(sf.thumbnail);
  const [showPlayer, setShowPlayer] = useState(false);
  const seek = (sec) => {
    setShowPlayer(true);
    const v = videoRef.current;
    if (!v || sec == null) return;
    try { v.currentTime = sec; v.play().catch(() => {}); v.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) { /* noop */ }
  };

  // ── Copy link ──
  const [copied, setCopied] = useState(false);
  const shareUrl = `${RESULT_ORIGIN}${RESULT_PATH}?recordId=${encodeURIComponent(submissionId)}`;
  const copyLink = async () => {
    let ok = false;
    try { await navigator.clipboard.writeText(shareUrl); ok = true; } catch (e) { ok = false; }
    if (!ok) {
      try {
        const ta = document.createElement("textarea");
        ta.value = shareUrl; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); ok = true;
      } catch (e) { ok = false; }
    }
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2200); }
  };

  // ── Folds ──
  const [openFixes, setOpenFixes] = useState(false);
  const [openAll, setOpenAll] = useState(false);
  const [openGroups, setOpenGroups] = useState({});
  const [openItems, setOpenItems] = useState({});
  const [showWhy, setShowWhy] = useState(false);
  const flipGroup = (g) => setOpenGroups((o) => ({ ...o, [g]: !o[g] }));
  const flipItem = (id) => setOpenItems((o) => ({ ...o, [id]: !o[id] }));
  const groups = GROUPS.map((g) => {
    const rows = checks.filter((c) => c.group === g).slice().sort((a, b) => (passes(a.status) ? 1 : 0) - (passes(b.status) ? 1 : 0));
    return { name: g, rows, pass: rows.filter((c) => passes(c.status)).length };
  }).filter((g) => g.rows.length);

  // ── Copy ──
  const heading = {
    reviewing:  "The Review Agents are watching your video",
    missing:    "We couldn't find this submission",
    manualWait: "Received by " + brandName,
    hybridWait: /APPROVED|PASS/.test(ai.toUpperCase()) ? "Looks good, waiting for " + brandName + " to confirm" : "Flagged, " + brandName + " is taking a look",
    approved:   creatorFirst ? "Approved, " + creatorFirst : "Approved",
    changes:    "Changes requested",
    rejected:   "Not approved",
    aiFlagged:  creatorFirst ? "A few things to fix, " + creatorFirst : "A few things to fix",
  }[state];
  const lede = {
    reviewing:  "This usually takes about a minute. The page refreshes itself.",
    missing:    "The link may be missing its submission. Ask " + brandName + " for a fresh one.",
    manualWait: brandName + " reviews every video personally and will email you with the decision.",
    hybridWait: summary || (brandName + " confirms every result before it is final. You will get an email when they do."),
    approved:   summary || ("Nice work. " + brandName + " has your video."),
    changes:    brandNotes ? brandName + " would like a new cut. Their notes are below." : (summary || (brandName + " would like a new cut.")),
    rejected:   summary || (brandName + " will not be using this cut."),
    aiFlagged:  summary || "Fix the points below and send the new cut. The Review Agents look again straight away.",
  }[state];
  const chip = {
    reviewing:  { text: "Reviewing", fg: WAIT_FG, bg: WAIT_BG },
    missing:    { text: "Not found", fg: NO_FG, bg: NO_BG },
    manualWait: { text: "With " + brandName, fg: WAIT_FG, bg: WAIT_BG },
    hybridWait: { text: "Waiting for " + brandName, fg: WAIT_FG, bg: WAIT_BG },
    approved:   { text: "Approved", fg: PASS_FG, bg: PASS_BG },
    changes:    { text: "Needs a new cut", fg: FIX_FG, bg: FIX_BG },
    rejected:   { text: "Not approved", fg: NO_FG, bg: NO_BG },
    aiFlagged:  { text: "Needs a new cut", fg: FIX_FG, bg: FIX_BG },
  }[state];
  const nextLine = {
    reviewing:  "Your result shows here the moment the Review Agents finish, and you get an email too.",
    missing:    "",
    manualWait: brandName + "'s decision and any notes appear here, and you get an email when they decide.",
    hybridWait: "You get an email when " + brandName + " confirms.",
    approved:   "Nothing more to do on this one. " + brandName + " will be in touch about next steps.",
    changes:    "Your new cut links to this one, so " + brandName + " sees the whole history.",
    rejected:   mode === "Autonomous" ? "You can send a new cut if you would like the Review Agents to take another look." : "This decision is final for this cut.",
    aiFlagged:  "Your new cut links to this one, so " + brandName + " sees the whole history.",
  }[state];

  // ── The engine's writes and services ──
  const createSubmission = useRecordCreate({ fields: submissionCreate, from: ds.submissions });
  const createReview = useRecordCreate({ fields: reviewCreate, from: ds.reviews });
  const createReport = useRecordCreate({ fields: reportCreate, from: ds.report });
  const createNotification = useRecordCreate({ fields: notificationCreate, from: ds.notifications });
  const { uploadAsync, isUploading } = useUpload();
  const proxyGoogle = useProxyFetch(ds.google);
  const proxyEmailit = useProxyFetch(ds.emailit);
  // Creators upload a file, so the link scraper is never reached.
  const proxyRapid = async () => { throw new Error("Upload a video file."); };
  const [briefState, setBriefState] = useState({ status: "none", f: null });
  const briefE = briefState.f;
  const [afState, setAfState] = useState({ status: "none", f: null });
  const af = afState.f;
  const [ownerState, setOwnerState] = useState({ status: "none", f: null });
  const runRef = useRef(0);

  // ─── The engine's view of this page: the creator revision route ───
  const parent = subRec ? {
    name: sf.name, accounts: sf.accounts, briefs: sf.briefs, projects: sf.projects, users: sf.users,
    creatorName: sf.creatorName, creatorEmail: sf.creatorEmail, revisionNumber: sf.revisionNumber, reviews: sf.reviews,
    notes: sf.notes, videoUrl: sf.videoUrl, requestChanges: sf.requestChanges, usersStatus: sf.usersStatus,
    usersVideos: sf.usersVideos, originalReviewId: sf.originalReviewId,
  } : null;
  const parentId = submissionId;
  const parentReviewId = reviewId;
  const previous = hasReview ? {
    parentName: title,
    decision: ai,
    reasoning,
    action: plainText(pick(rf.recommendedAction)),
    request: brandNotes || plainText(pick(rf.requestChanges)),
    failed: pick(rf.failedList),
  } : null;
  const revisionNo = Math.min(10, parentRevision + 1);
  const workspaceId = linkIds(sf.accounts)[0] || linkIds(briefE?.accounts)[0] || "";
  const kind = "review"; const context = "submission"; const isCreator = true; const multi = false; const urlName = "";
  const mf = {};
  const lookupStatus = pick(briefE?.usersStatus) || pick(sf.usersStatus);
  const ownerId = !lookupStatus ? (linkIds(briefE?.users)[0] || linkIds(sf.users)[0] || linkIds(af?.owner)[0] || "") : "";
  const workspaceName = pick(af?.name) || brandName;
  const brandUserId = linkIds(briefE?.users)[0] || linkIds(af?.owner)[0] || linkIds(sf.users)[0] || "";
  const brandEmail = pick(briefE?.ownerEmail) || pick(af?.ownerEmail) || "";
  const brandFirstName = pick(briefE?.ownerFirstName) || pick(af?.ownerFirstName) || "there";
  const modeLabel = pick(briefE?.aiMode) || pick(af?.aiMode) || mode || "Hybrid";

  // Why a new cut cannot be sent right now, if it cannot.
  const blocker = useMemo(() => {
    if (!subRec) return "";
    if (revisionNo > 10) return "This video has reached its revision limit. Ask " + brandName + " for a fresh brief link.";
    if (briefE && pick(briefE.status) !== "Active") return "This brief is closed to new submissions.";
    if (briefE) {
      const close = Date.parse(pick(briefE.closeDate));
      if (Number.isFinite(close) && close + 86400000 < Date.now()) return "The submission window for this brief has closed.";
    }
    if (!workspaceId) return brandName + " isn't taking submissions right now.";
    const status = lookupStatus || pick(ownerState.f?.status);
    if (status && status !== "Active") return brandName + " isn't taking submissions right now. Check back later.";
    const creditsRaw = briefE && briefE.videosRemainingCount != null && briefE.videosRemainingCount !== "" ? briefE.videosRemainingCount
      : sf.usersVideos != null && sf.usersVideos !== "" ? sf.usersVideos
      : ownerState.f && ownerState.f.videosRemaining != null ? ownerState.f.videosRemaining
      : af && af.videosRemaining != null ? af.videosRemaining : null;
    const credits = creditsRaw === null ? null : Number(Array.isArray(creditsRaw) ? creditsRaw[0] : creditsRaw);
    if (credits !== null && Number.isFinite(credits) && credits <= 0) return brandName + " isn't taking submissions right now. Check back later.";
    return "";
  }, [subRec, revisionNo, briefE, workspaceId, lookupStatus, ownerState.f, sf.usersVideos, af, brandName]);

  // ── Gemini video part (inline base64, sized for the proxy) ───
  // The proxy carries text only and caps bodies near 4MB, so the video
  // always travels inline and always below INLINE_MAX. Longer videos
  // come through the Cloudinary rungs; if none fits, say so plainly.
  async function makeVideoPart(blob, mime) {
    if (!blob || blob.size > INLINE_MAX) throw new Error("This video is too long to review here. Trim it to under 3 minutes, or upload a smaller file, and try again.");
    return { inline_data: { mime_type: mime, data: await blobToBase64(blob) } };
  }

  // ── The pipeline, one video at a time ────────────────────────
  async function runPipeline(item, myRun, ui, ctx) {
    // Per-submission settings from the drawer.
    const { agents, briefId, brief, notes, pdf, creatorName, creatorEmail } = ctx;
    const aiModeLabel = unwrapE(brief?.aiMode) || unwrapE(af?.aiMode) || "Hybrid";
    const alive = () => runRef.current === myRun;
    const isFile = item.kind === "file";
    const theFile = isFile ? item.file : null;
    const srcUrl = isFile ? "" : item.url;
    const isYouTube = !isFile && /youtube\.com|youtu\.be/i.test(srcUrl);
    const ytId = isYouTube ? ytVideoId(srcUrl) : "";
    const acct = af || (brief ? { brandBio: brief.brandBio } : null);

    // 1. Source the mp4
    let mp4 = ""; let handle = ""; let duration = 0; let uploaded = item.uploaded || null; let pdfUploaded = ctx.pdfUploaded || null;
    if (isFile) {
      if (!uploaded) {
        const [up] = await uploadAsync(theFile);
        if (!up || up.status !== "completed" || !up.url) throw new Error("The video upload didn't complete. Try again.");
        uploaded = { filename: up.file?.name || theFile.name || "video.mp4", url: up.url };
      }
      try { ui.preview(URL.createObjectURL(theFile)); } catch { /* no preview */ }
      if (STEPPER && pdf) {
        const [pu] = await uploadAsync(pdf);
        if (pu && pu.status === "completed" && pu.url) pdfUploaded = { filename: pu.file?.name || pdf.name || "brief.pdf", url: pu.url };
      }
    } else if (isDirectVideoUrlE(srcUrl)) {
      mp4 = srcUrl; ui.preview(mp4);
    } else {
      const res = await proxyRapid(SCRAPE_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: srcUrl }) });
      if (!res.ok) { console.error("scrape failed", res.status, await res.text().catch(() => "")); throw new Error("We couldn't fetch that link. Check it opens in a browser and try again."); }
      const scraped = adaptScrape(await res.json());
      if (!scraped.mp4 && !isYouTube) throw new Error("We couldn't read that video. The link may be private or deleted.");
      mp4 = scraped.mp4; handle = scraped.handle; duration = scraped.duration;
      if (mp4) ui.preview(mp4);
    }
    if (!alive()) return null;

    // 2. Cloudinary: playback copy + frames
    ui.stage("Preparing frames");
    let publicId = ""; let deliveryUrl = ""; let cld = null;
    if (!isYouTube) {
      try {
        const form = new FormData();
        form.append("file", isFile && theFile ? theFile : (mp4 || uploaded?.url || ""));
        form.append("upload_preset", CLOUDINARY_PRESET);
        form.append("folder", CLOUDINARY_FOLDER);
        const cldRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/video/upload`, { method: "POST", body: form });
        if (cldRes.ok) {
          cld = await cldRes.json();
          publicId = cld.public_id || ""; deliveryUrl = cld.secure_url || "";
          if (!duration) duration = Math.round(Number(cld.duration) || 0);
        } else {
          console.error("Cloudinary upload rejected:", cldRes.status);
        }
      } catch (e) { console.error("Cloudinary upload failed:", e); }
    }
    if (!alive()) return null;

    // 3. The bytes, compressed to fit the proxy
    ui.stage("Review Agents watching");
    const INLINE_SAFE = 2.5 * 1024 * 1024;
    // Gemini samples one frame a second, so 640p is plenty; smaller copies
    // also travel through the proxy faster. Each rung is a lighter copy.
    const rungs = publicId ? [
      `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/upload/q_auto:low,c_limit,h_640/${publicId}.mp4`,
      `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/upload/q_35,c_limit,h_480/${publicId}.mp4`,
      `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/upload/q_25,c_limit,h_360/${publicId}.mp4`,
      `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/upload/q_20,c_limit,h_270/${publicId}.mp4`,
    ] : [];
    let blob = isFile ? theFile : null;
    let mime = (isFile && theFile?.type) || "video/mp4";
    let rungIdx = 0;
    for (; rungIdx < rungs.length; rungIdx++) {
      const r = await fetch(rungs[rungIdx]);
      if (!r.ok) { console.error(`Cloudinary rung ${rungIdx} returned ${r.status}`); continue; }
      const b = await r.blob();
      if (b.size > 1000) { blob = b; mime = "video/mp4"; }
      if (blob && blob.size <= INLINE_SAFE) break;
    }
    if (!blob && !isYouTube) {
      const v = await fetch(deliveryUrl || mp4);
      if (!v.ok) throw new Error("We couldn't read that video.");
      blob = await v.blob(); mime = blob.type || "video/mp4";
    }
    let videoPart = isYouTube ? { file_data: { file_uri: srcUrl } } : await makeVideoPart(blob, mime);
    if (!alive()) return null;

    // 4. Gemini
    const { checks, thresholdSource } = buildChecks(acct, brief, STEPPER ? agents : []);
    const meta = {
      format: String(cld?.format || (theFile?.type || "").split("/")[1] || "mp4").toUpperCase(),
      sizeMb: cld?.bytes ? (cld.bytes / 1e6).toFixed(1) : theFile ? (theFile.size / 1e6).toFixed(1) : "0",
      resolution: cld?.width && cld?.height ? `${cld.width}x${cld.height}` : "",
      aspect: cld?.width && cld?.height ? aspectRatio(cld.width, cld.height) : "",
      fps: cld?.frame_rate ?? "",
      duration: fmtDuration(duration || cld?.duration || 0),
    };
    const screenshotBase = publicId ? `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/upload/so_{timestamp}/c_fill,h_1920,w_1080/${publicId}.jpg` : "";
    const prompt = buildPrompt({ account: acct, brief, notes, checks, meta, screenshotBase, previous, kind: STEPPER ? kind : "review" });
    const genUrl = `${GEMINI_BASE}/v1beta/models/${GEMINI_MODEL}:generateContent`;
    // The Softr proxy gives up on a call after about two minutes, so the
    // whole answer has to come back inside that. Thinking stays low and the
    // output is kept short (see the prompt). A timeout is never retried with
    // the same payload: the next lighter copy of the video goes instead.
    const attempt = (part, thinking) => proxyGoogle(genUrl, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }, part] }],
        generationConfig: {
          temperature: 0.4, topP: 1, topK: 32, maxOutputTokens: 8192, responseMimeType: "application/json",
          ...(thinking ? { thinkingConfig: { thinkingLevel: "low" } } : {}),
        },
      }),
    });
    const timedOut = (r) => !r.ok && (r.status === 504 || r.status === 502 || r.status === 408);
    const retryable = (r) => !r.ok && (r.status >= 500 || r.status === 400);
    let useThinking = true;
    let gRes = await attempt(videoPart, useThinking);
    if (!gRes.ok && gRes.status === 400) {
      // A model that does not take the thinking field answers 400; go without it.
      useThinking = false;
      gRes = await attempt(videoPart, useThinking);
    }
    let calls = 1;
    while (!gRes.ok && calls < 3 && (timedOut(gRes) || retryable(gRes))) {
      if (timedOut(gRes)) {
        if (rungIdx + 1 >= rungs.length) break;
        ui.stage("Still watching, trying a lighter copy");
        rungIdx += 1;
        const r = await fetch(rungs[rungIdx]);
        if (!r.ok) continue;
        const b = await r.blob();
        if (b.size < 1000) continue;
        blob = b; videoPart = await makeVideoPart(blob, "video/mp4");
      } else {
        await sleep(2500);
      }
      gRes = await attempt(videoPart, useThinking); calls += 1;
    }
    if (!gRes.ok) { console.error("gemini failed", gRes.status, await gRes.text().catch(() => "")); throw new Error(timedOut(gRes) ? "The Review Agents ran out of time on this video. A shorter or lighter cut usually gets through. Try again in a moment." : "The Review Agents couldn't watch the video right now. Try again in a moment."); }
    let parsed = parseGeminiJson(await gRes.json());
    const decisionRaw = String(parsed?.overall_review?.ai_decision || "").toUpperCase();
    if (!parsed?.overall_review || !Array.isArray(parsed?.analysis) || !["APPROVED", "FLAGGED", "REJECTED"].includes(decisionRaw)) {
      await sleep(1500);
      gRes = await attempt(videoPart);
      if (!gRes.ok) throw new Error("The review came back incomplete.");
      parsed = parseGeminiJson(await gRes.json());
    }
    const decision = ["APPROVED", "FLAGGED", "REJECTED"].includes(String(parsed?.overall_review?.ai_decision || "").toUpperCase())
      ? String(parsed.overall_review.ai_decision).toUpperCase() : "FLAGGED";
    const ov = parsed.overall_review || {};
    const byName = normaliseAnalysis(parsed, checks, publicId);
    if (byName.size === 0) throw new Error("The review came back without any checks.");
    if (!alive()) return null;

    // 5. Write at the end. The review goes first, then the submission that
    //    links it (submissions.reviews and reviews.submissions are a two-way
    //    pair, so the review side fills itself), then one review_report row
    //    per agent. If the submission write fails, nothing has been charged:
    //    the submission row is the credit.
    ui.stage("Saving the review");
    const platform = isFile ? "Upload" : detectPlatform(srcUrl);
    const videoTitle = (STEPPER && urlName) || stripEmDash(ov.video_title || "").slice(0, 80)
      // A filename like IMG_4821.MOV is worse than no name at all.
      // Who filmed it and when at least sorts and scans.
      || ((String(creatorName || "").trim().split(/\s+/)[0] || handle || "Untitled")
          + ", " + new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" }));
    const projectIds = idsOf(brief?.projects).length ? idsOf(brief.projects) : idsOf(parent?.projects);
    const normQa = (l) => String(l || "").toLowerCase().replace(/&/g, "and").replace(/visability/g, "visibility").replace(/\s+/g, " ").trim();
    const qaIndex = Object.fromEntries(Object.entries(SUB_QA_IDS).map(([k, v]) => [normQa(k), v]));
    const qaLabels = [...unwrapAll(acct?.qaChecklist), ...unwrapAll(brief?.qaChecklist), ...(STEPPER ? agents : [])];
    const qaIds = [...new Set(qaLabels.map((l) => qaIndex[normQa(l)] || "").filter(Boolean))];

    const g = (prefix) => byName.get(AGENTS.find((a) => a.key === prefix)?.name || "") || null;
    const col = (prefix) => {
      const r = g(prefix); if (!r) return {};
      const sc = numericScore(r.score);
      return { score: sc, status: statusValue(prefix, r.status), comment: r.comment.slice(0, 1000), shot: r.screenshot };
    };
    const pst = col("pst"), hs = col("hs"), vh = col("vh"), cta = col("cta"), ft = col("ft"), tl = col("tl"), ac = col("ac"), ep = col("ep"), bm = col("bm"), cr = col("cr"), cm = col("cm"), ba = col("ba");
    const links = {
      accounts: [{ id: workspaceId }],
      briefs: briefId ? [{ id: briefId }] : null,
      projects: projectIds.length ? projectIds.map((id) => ({ id })) : null,
    };
    const review = await createReview.mutateAsync({
      ...links,
      overallStatus: OPT.overallStatus[decision],
      aiDecision: OPT.aiDecision[decision],
      aiMode: OPT.aiMode[aiModeLabel] || OPT.aiMode.Hybrid,
      thresholdSource: OPT.thresholdSource[thresholdSource],
      overallRating: Math.min(5, Math.max(1, Math.round(Number(ov.overall_rating) || 3))),
      overallComment: stripEmDash(ov.overall_comment || ""),
      decisionReasoning: stripEmDash(ov.decision_reasoning || ""),
      recommendedAction: stripEmDash(ov.recommended_action || ""),
      transcript: stripEmDash(parsed.transcript || ""),
      adaptedScript: STEPPER && kind === "remix" ? stripEmDash(parsed.adapted_script || "") : "",
      displayUrl: (deliveryUrl || "").slice(0, 1000),
      thumbnail: cldThumb(publicId) || (ytId ? `https://i.ytimg.com/vi/${ytId}/hq2.jpg` : ""),
      offBrand: g("ba")?.value?.slice(0, 1000) || "",
      pstScore: pst.score ?? null, pstStatus: pst.status || null, pstComment: pst.comment || "", pstShot: pst.shot || "",
      hsScore: hs.score ?? null, hsStatus: hs.status || null, hsComment: hs.comment || "", hsShot: hs.shot || "",
      vhScore: vh.score ?? null, vhStatus: vh.status || null, vhComment: vh.comment || "", vhShot: vh.shot || "",
      ctaScore: g("cta")?.score || "", ctaStatus: cta.status || null, ctaComment: cta.comment || "", ctaShot: cta.shot || "",
      ftScore: ft.score ?? null, ftStatus: ft.status || null, ftComment: ft.comment || "", ftShot: ft.shot || "",
      tlScore: tl.score ?? null, tlStatus: tl.status || null, tlComment: tl.comment || "", tlShot: tl.shot || "",
      acScore: ac.score ?? null, acStatus: ac.status || null, acComment: ac.comment || "", acShot: ac.shot || "",
      epScore: ep.score ?? null, epStatus: ep.status || null, epComment: ep.comment || "", epShot: ep.shot || "",
      bmScore: bm.score ?? null, bmStatus: bm.status || null, bmComment: bm.comment || "", bmShot: bm.shot || "",
      crStatus: cr.status || null, crDetails: cr.comment || "", crShot: cr.shot || "",
      cmStatus: cm.status || null, cmDetails: cm.comment || "", cmShot: cm.shot || "",
      baStatus: ba.status || null, baDetails: ba.comment || "", baShot: ba.shot || "",
    });
    const reviewId = review?.id || review?.recordId || review?.record?.id || "";
    if (!reviewId) throw new Error("The review was not saved. No video was used.");

    const subFields = {
      name: videoTitle,
      accounts: workspaceId,
      briefs: briefId ? [{ id: briefId }] : null,
      projects: projectIds.length ? projectIds.map((id) => ({ id })) : null,
      users: brandUserId ? [{ id: brandUserId }] : null,
      reviews: [{ id: reviewId }],
      videoUrl: isFile ? "" : srcUrl,
      videoFile: uploaded ? [uploaded] : null,
      briefAttachment: pdfUploaded ? [pdfUploaded] : null,
      creatorName: cleanName(creatorName) || (isCreator ? cleanName(unwrapE(parent?.creatorName)) : (STEPPER ? cleanName(unwrapE(mf.fullName)) : "")),
      creatorEmail: isCreator ? (creatorEmail.trim() || unwrapE(parent?.creatorEmail) || "") : creatorEmail.trim(),
      submissionType: context === "submission" ? OPT.subTypeRevision : (STEPPER && kind === "analyse" ? OPT.subTypeAnalyse : STEPPER && kind === "remix" ? OPT.subTypeSwipe : briefId ? OPT.subTypeBrief : OPT.subTypeContentReview),
      status: OPT.statusReviewed,
      userValidation: OPT.userValidationProceed,
      platformName: OPT.platform[platform] || OPT.platform.Upload,
      platformUsername: handle || "",
      submissionNotes: notes.trim(),
      qaChecklist: qaIds.length ? qaIds : null,
      duration: meta.duration,
      resolution: meta.resolution,
      aspectRatio: meta.aspect,
      fileSizeMb: String(meta.sizeMb),
      format: meta.format,
      fps: Number(meta.fps) || null,
      parentSubmission: context === "submission" ? [{ id: parentId }] : null,
      parentSubmissionId: context === "submission" ? parentId : "",
      originalReviewId: context === "submission" ? (unwrapE(parent?.originalReviewId) || parentReviewId) : "",
      revisionNumber: context === "submission" ? (OPT.revision[revisionNo] || OPT.revision[10]) : null,
      isBulk: !!multi,
    };
    let sub = null;
    try { sub = await createSubmission.mutateAsync(subFields); }
    catch (e) { console.error("submission write failed, review left unattached:", reviewId, e); throw new Error("The review finished but couldn't be saved. No video was used. Try again in a moment."); }
    const subId = sub?.id || sub?.recordId || sub?.record?.id || "";
    if (!subId) { console.error("submission write returned no id, review left unattached:", reviewId); throw new Error("The review finished but couldn't be saved. No video was used. Try again in a moment."); }
    const rowLinks = { ...links, submissions: [{ id: subId }] };

    // One review_report row per agent, in order.
    if (!createReport.enabled) console.error("review_report create is not enabled for this visitor");
    let reportsWritten = 0;
    for (const [, r] of byName) {
      if (!createReport.enabled) break;
      try {
        await createReport.mutateAsync({
          threshold: r.agent.name,
          score: r.score,
          thresholdValue: r.value,
          rating: r.rating,
          severity: OPT.reportSeverity[r.severity],
          status: OPT.reportStatus[r.status] || r.status,
          comment: r.comment.slice(0, 4000),
          screenshotUrl: r.screenshot,
          keyMoment: r.timestamp === null ? null : (KEY_MOMENT_IDS[String(r.timestamp)] || null),
          review: [{ id: reviewId }],
          ...rowLinks,
        });
        reportsWritten += 1;
      } catch (e) { console.error("review_report row failed:", r.agent.name, String(e?.message || e)); }
    }
    console.log(`review_report rows written: ${reportsWritten} of ${byName.size}`);

    // 6. Notifications (to the brand user)
    const failed = [...byName.values()].filter((r) => r.status !== "PASS").map((r) => r.agent.name);
    const notifBase = { isRead: false, accounts: [{ id: workspaceId }], users: brandUserId ? [{ id: brandUserId }] : null, briefs: briefId ? [{ id: briefId }] : null, projects: links.projects, submissions: [{ id: subId }], reviews: [{ id: reviewId }] };
    const notify = async (type, title, message) => {
      if (!createNotification.enabled) return;
      try { await createNotification.mutateAsync({ ...notifBase, type, title, message }); } catch (e) { console.error("notification failed:", title, e); }
    };
    const creatorEmailFinal = subFields.creatorEmail;
    const what = context === "submission" ? `Revision ${revisionNo} of ${videoTitle}` : videoTitle;
    if (creatorEmailFinal) await notify(OPT.notif.received, "Submission received", `${what} was submitted${brief ? ` for ${unwrapE(brief.name)}` : ""}.`);
    await notify(OPT.notif.completed, "Review completed", `${what}: ${decision.toLowerCase()} by the Review Agents${failed.length ? ` (${failed.length} flagged)` : ""}.`);
    const decisionType = decision === "APPROVED" ? OPT.notif.approved : decision === "REJECTED" ? OPT.notif.rejected : OPT.notif.flagged;
    const decisionTitle = decision === "APPROVED" ? "Content approved" : decision === "REJECTED" ? "Content rejected" : "Flagged for review";
    await notify(decisionType, decisionTitle, stripEmDash(ov.decision_reasoning || "").slice(0, 500));

    // 7. EmailIt by alias, idempotent per submission + event
    const reviewUrl = `${APP_ORIGIN}${DETAILS_PATH}?recordId=${encodeURIComponent(subId)}`;
    const submissionUrl = `${APP_ORIGIN}${LIVE_PATH}?recordId=${encodeURIComponent(subId)}`;
    const vars = {
      account_name: workspaceName,
      brief_name: unwrapE(brief?.name) || "the brief",
      creator_first_name: (subFields.creatorName || "there").split(" ")[0],
      creator_name: subFields.creatorName || "the creator",
      user_first_name: brandFirstName,
      failed_thresholds: failed.length ? failed.join(", ") : "None",
      review_url: reviewUrl,
      submission_url: submissionUrl,
    };
    // EmailIt rate-limits bursts (429). Each send retries with a pause,
    // and the Idempotency-Key keeps a retry from ever sending twice.
    const send = async (alias, to) => {
      if (!to) { console.error("EmailIt skipped, no recipient for", alias); return; }
      const key = `${subId}-${alias}`.replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 200);
      const waits = [2000, 5000, 12000];
      for (let attempt = 0; attempt <= waits.length; attempt++) {
        try {
          const r = await proxyEmailit("https://api.emailit.com/v2/emails", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Idempotency-Key": key },
            body: JSON.stringify({ from: EMAIL_FROM, to, template: alias, variables: vars }),
          });
          if (r.ok) return;
          const again = r.status === 429 || r.status >= 500;
          console.error("EmailIt", alias, "returned", r.status, again && attempt < waits.length ? "retrying" : "giving up");
          if (!again || attempt >= waits.length) return;
          const retryAfter = Number(r.headers?.get?.("retry-after")) || 0;
          await sleep(Math.max(retryAfter * 1000, waits[attempt]));
        } catch (e) {
          console.error("EmailIt failed:", alias, e);
          if (attempt >= waits.length) return;
          await sleep(waits[attempt]);
        }
      }
    };
    const outcome = decision === "APPROVED" ? "approved" : decision === "REJECTED" ? "rejected" : "flagged";
    const mode = aiModeLabel === "Autonomous" ? "auto" : aiModeLabel === "Manual" ? "manual" : "hybrid";
    const sendsEmail = !(STEPPER && kind !== "review");
    if (sendsEmail && creatorEmailFinal) await send("bl-sub-received-creator", creatorEmailFinal);
    if (!sendsEmail) { /* analyse and remix are for the brand's own eyes */ }
    else if (mode === "auto") { if (creatorEmailFinal) await send(`bl-sub-${outcome}-auto-creator`, creatorEmailFinal); }
    else if (mode === "hybrid") { if (creatorEmailFinal) await send(`bl-sub-${outcome}-hybrid-creator`, creatorEmailFinal); await send(`bl-sub-${outcome}-hybrid-user`, brandEmail); }
    else { await send(`bl-sub-${outcome}-manual-user`, brandEmail); }

    return { subId, reviewId, decision, title: videoTitle, failed, checks: byName.size, thumb: cldThumb(publicId) };
  }


  // ── The drawer: video, send ──
  const [drawer, setDrawer] = useState(false);
  const [dStep, setDStep] = useState(1); // 1 video, 2 send, 3 reviewing, 4 done
  const [dFile, setDFile] = useState(null);
  // Softr's upload reports no bytes, so this bar is paced rather than
  // measured: it eases toward a ceiling it never reaches on its own,
  // at a rate read off the file's size, and only lands on 100% when
  // the upload really finishes. It always moves, and it never says
  // done before it is.
  const [dPct, setDPct] = useState(0);
  const paceRef = useRef(null);
  const stopPace = () => { if (paceRef.current) { clearInterval(paceRef.current); paceRef.current = null; } };
  useEffect(() => stopPace, []);
  const [dUploaded, setDUploaded] = useState(null);
  const [dStage, setDStage] = useState("");
  const [dError, setDError] = useState("");
  const [dResult, setDResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);
  const openDrawer = () => { setDError(""); setDrawer(true); };
  const closeDrawer = () => { if (dStep === 3) return; setDrawer(false); };
  useEffect(() => {
    if (!drawer) return undefined;
    const onKey = (e) => { if (e.key === "Escape") closeDrawer(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const takeFile = async (file) => {
    if (!file) return;
    if (!/^video\//.test(file.type || "") && !/\.(mp4|mov|m4v|webm)$/i.test(file.name || "")) { setDError("That doesn't look like a video. MP4 or MOV works best."); return; }
    if (file.size > MAX_FILE_MB * 1024 * 1024) { setDError(`${file.name} is over ${MAX_FILE_MB}MB. Trim or compress it and try again.`); return; }
    setDError(""); setDFile(file); setDUploaded(null);
    stopPace();
    setDPct(0);
    const half = Math.min(20000, 1100 + Math.max(0.5, file.size / (1024 * 1024)) * 400);
    const t0 = Date.now();
    paceRef.current = setInterval(() => {
      setDPct(92 * (1 - Math.pow(2, -(Date.now() - t0) / half)));
    }, 100);
    try {
      const [up] = await uploadAsync(file);
      if (!up || up.status !== "completed" || !up.url) throw new Error("upload");
      stopPace(); setDPct(100);
      setDUploaded({ filename: up.file?.name || file.name || "video.mp4", url: up.url });
    } catch (e) {
      stopPace(); setDPct(0);
      setDFile(null); setDError("The upload didn't complete. Try again.");
    }
  };
  const sendRevision = async () => {
    setDError("");
    if (!dUploaded?.url || !dFile) { setDError("Add the new cut first."); return; }
    if (blocker) { setDError(blocker); return; }
    if (!createSubmission.enabled || !createReview.enabled) { setDError("Submissions are not available right now."); return; }
    if (!briefE && !af) { setDError("Still loading. Try again in a moment."); return; }
    const myRun = ++runRef.current;
    setDStep(3); setDStage("Getting the video");
    try {
      const ctx = { agents: [], briefId, brief: briefE, notes: "", pdf: null, pdfUploaded: null, creatorName, creatorEmail };
      const item = { kind: "file", file: dFile, label: dUploaded.filename, uploaded: dUploaded };
      const r = await runPipeline(item, myRun, { stage: setDStage, preview: () => {} }, ctx);
      if (runRef.current !== myRun) return;
      if (!r) throw new Error("The review did not finish.");
      setDResult(r); setDStep(4);
    } catch (e) {
      if (runRef.current !== myRun) return;
      console.error("=== revision failed:", e);
      setDError(String(e?.message || e)); setDStep(2);
    }
  };
  const resultHref = dResult?.subId ? `${RESULT_PATH}?recordId=${encodeURIComponent(dResult.subId)}` : "";

  if (subStatus === "error" || (subStatus === "success" && !subRec)) {
    return (
      <div className="cr"><Style />
        <div className="cr-page">
          <section className="cr-sheet"><div className="cr-head">
            <span className="cr-chip" style={{ background: NO_BG, color: NO_FG }}>Not found</span>
            <h1 className="cr-h1">We couldn't find this submission</h1>
            <p className="cr-lede">The link may be missing its submission. Ask the brand for a fresh one.</p>
          </div></section>
        </div>
      </div>
    );
  }

  return (
    <div className={`cr ${drawer ? "cr-drawer-open" : ""}`}><Style />
      {submissionId ? <VerdictLoader submissionId={submissionId} onState={setVerdict} /> : null}
      {reviewId && showDetail ? <ReportRows reviewId={reviewId} onRows={setReportRows} /> : null}
      {briefId ? <BriefLoader key={briefId} recordId={briefId} onState={setBriefState} /> : null}
      {workspaceId ? <AccountLoader key={workspaceId} recordId={workspaceId} onState={setAfState} /> : null}
      {ownerId ? <OwnerLoader key={ownerId} recordId={ownerId} onState={setOwnerState} /> : null}

      <div className="cr-page">
        <div className="cr-topline">
          {briefId ? (
            <a className="cr-back" href={`${BRIEF_PATH_LIVE}?recordId=${encodeURIComponent(briefId)}`}><ArrowLeft size={14} /> Back to the brief</a>
          ) : <span />}
          <div className="cr-who-wrap">
            <button type="button" className={`cr-iconbtn ${copied ? "is-done" : ""}`} onClick={copyLink}>
              {copied ? <Check size={13} /> : <Link2 size={13} />}<span>{copied ? "Link copied" : "Copy link"}</span>
            </button>
            {creatorName || creatorEmail ? (
              <span className="cr-who">
                <span className="cr-avatar">{initialsOf(creatorName || creatorEmail)}</span>
                <span className="cr-who-text"><b>{creatorName || "Your result"}</b>{creatorEmail ? <span>{creatorEmail}</span> : null}</span>
              </span>
            ) : null}
          </div>
        </div>

        <div className="cr-layout">
          <aside className="cr-player">
            <div className="cr-video">
              {src ? <video ref={videoRef} src={src} poster={poster || undefined} controls playsInline preload="metadata" />
                : poster ? <img src={poster} alt="" />
                : <div className="cr-video-empty"><Play size={22} /><span>Video not available here</span></div>}
            </div>
            {!src && videoUrl ? <a className="cr-ext" href={videoUrl} target="_blank" rel="noreferrer"><ExternalLink size={13} /> Open the original video</a> : null}
            <div className="cr-meta"><b>{title}</b>{submittedOn ? <span> · {submittedOn}</span> : null}{pick(sf.duration) ? <span> · {pick(sf.duration)}</span> : null}{parentRevision > 0 ? <span> · Revision {parentRevision}</span> : null}</div>
          </aside>

          <main className="cr-sheet">
            <div className="cr-head">
              {src || poster ? (
                <div className={`cr-mini ${showPlayer ? "is-open" : ""}`}>
                  {showPlayer && src ? (
                    <div className="cr-mini-player"><video ref={videoRef} src={src} poster={poster || undefined} controls playsInline preload="metadata" autoPlay /></div>
                  ) : (
                    <button type="button" className="cr-mini-row" onClick={() => setShowPlayer(true)}>
                      <span className="cr-thumb">{poster ? <img src={poster} alt="" /> : null}<i><Play size={22} /></i></span>
                      <span className="cr-mini-text"><b>{title}</b><span>{submittedOn}{pick(sf.duration) ? " · " + pick(sf.duration) : ""} · tap to watch</span></span>
                    </button>
                  )}
                </div>
              ) : null}
              <div className="cr-eyebrow">
                {brandLogo ? <img src={brandLogo} alt="" /> : null}
                <span>{creatorFirst ? `${creatorFirst}'s result for` : "Your result for"} <b>{brandName}</b>{briefName ? <span className="cr-eyebrow-brief"> · {briefName}</span> : null}</span>
              </div>
              <div className="cr-status">
                <span className="cr-chip" style={{ background: chip.bg, color: chip.fg }}><i style={{ background: chip.fg }} /> {chip.text}</span>
                {showDetail && checks.length ? (
                  <span className="cr-passbar"><span className="cr-track"><i style={{ width: Math.round((passCount / checks.length) * 100) + "%", background: passCount === checks.length ? PASS_FG : FIX_FG }} /></span> {passCount} of {checks.length} passed</span>
                ) : null}
              </div>
              <h1 className="cr-h1">{heading}</h1>
              <p className="cr-lede">{lede}</p>
              {state === "reviewing" ? <div className="cr-bar"><i /></div> : null}
              {state === "changes" && brandNotes ? <p className="cr-notes">{brandNotes}</p> : null}
              <div className="cr-actions">
                {canResubmit ? <button type="button" className="cr-btn" onClick={openDrawer}>Submit a new cut <ArrowRight size={14} /></button> : null}
                {showDetail && reasoning && reasoning !== summary ? (
                  <button type="button" className="cr-toggle" aria-expanded={showWhy} onClick={() => setShowWhy((v) => !v)}>Why this decision <ChevronDown size={13} className={showWhy ? "is-open" : ""} /></button>
                ) : null}
              </div>
              {showWhy ? <p className="cr-why">{reasoning}</p> : null}
            </div>

            {showDetail && checks.length ? (
              <div className="cr-rows">
                {fixes.length && state !== "approved" ? (
                  <div>
                    <button type="button" className="cr-row" aria-expanded={openFixes} onClick={() => setOpenFixes((v) => !v)}>
                      <span className="cr-lbl">What to fix</span>
                      <span className="cr-sub">{fixes.length} {fixes.length === 1 ? "thing" : "things"}</span>
                      <ChevronDown size={18} className={`cr-chev ${openFixes ? "is-open" : ""}`} />
                    </button>
                    {openFixes ? (
                      <div className="cr-panel">
                        {fixes.map((c) => {
                          const open = !!openItems[c.id];
                          return (
                            <div key={c.id} className={`cr-fix ${open ? "is-open" : ""}`} role="button" tabIndex={0} onClick={() => flipItem(c.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flipItem(c.id); } }}>
                              <b>{c.name}</b>
                              {c.sec != null && src ? <span className="cr-t" onClick={(e) => { e.stopPropagation(); seek(c.sec); }}><Play size={10} /> {clock(c.sec)}</span> : <span className="cr-t cr-t-muted">{tone(c.status).word}</span>}
                              {open ? (
                                <div className="cr-note">
                                  {c.shot ? <img src={c.shot} alt="" loading="lazy" /> : <span className="cr-note-blank" />}
                                  <p>{c.comment || "No note on this one."}{c.score ? <span>{c.sec != null ? "Judged at " + clock(c.sec) + " · " : ""}{/^\d+$/.test(c.score) && Number(c.score) >= 10 ? c.score + "%" : c.score}</span> : (c.sec != null ? <span>Judged at {clock(c.sec)}</span> : null)}</p>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div>
                  <button type="button" className="cr-row" aria-expanded={openAll} onClick={() => setOpenAll((v) => !v)}>
                    <span className="cr-lbl">Every check</span>
                    <span className="cr-sub">{checks.length} checks · {groups.length} {groups.length === 1 ? "group" : "groups"}</span>
                    <ChevronDown size={18} className={`cr-chev ${openAll ? "is-open" : ""}`} />
                  </button>
                  {openAll ? (
                    <div className="cr-panel">
                      {groups.map((g) => {
                        const open = !!openGroups[g.name];
                        const allPass = g.pass === g.rows.length;
                        return (
                          <div key={g.name} className="cr-group">
                            <button type="button" aria-expanded={open} onClick={() => flipGroup(g.name)}>
                              <span className="cr-gname">{g.name}</span>
                              <span className="cr-gpass" style={{ color: allPass ? PASS_FG : FIX_FG }}>{g.pass} of {g.rows.length}</span>
                              <ChevronDown size={16} className={`cr-chev ${open ? "is-open" : ""}`} />
                            </button>
                            {open ? (
                              <div className="cr-checks">
                                {g.rows.map((c) => {
                                  const t = tone(c.status);
                                  const long = c.comment.length > NOTE_LONG;
                                  const more = !!openItems["all:" + c.id];
                                  return (
                                    <article key={c.id} className="cr-check">
                                      {c.shot ? <button type="button" className="cr-shot" onClick={() => seek(c.sec)} disabled={c.sec == null || !src}><img src={c.shot} alt="" loading="lazy" /></button> : <span className="cr-shot is-empty" />}
                                      <div className="cr-cb">
                                        <div className="cr-ct"><b>{c.name}</b>{c.status ? <span className="cr-pill" style={{ background: t.bg, color: t.fg }}>{passes(c.status) ? <Check size={10} /> : fails(c.status) ? <X size={10} /> : <AlertTriangle size={10} />} {t.word}</span> : null}</div>
                                        {c.score || c.sec != null ? <span className="cr-cs">{c.score ? (/^\d+$/.test(c.score) && Number(c.score) >= 10 ? c.score + "%" : c.score) : ""}{c.score && c.sec != null ? " · " : ""}{c.sec != null ? clock(c.sec) : ""}</span> : null}
                                        {c.comment ? <p className={long && !more ? "cr-clamp" : ""}>{c.comment}</p> : null}
                                        {long ? <button type="button" className="cr-more" onClick={() => flipItem("all:" + c.id)}>{more ? "Less" : "More"}</button> : null}
                                      </div>
                                    </article>
                                  );
                                })}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {nextLine ? <div className="cr-next"><span className="cr-spark" /> {nextLine}</div> : null}
          </main>
        </div>
      </div>

      {canResubmit ? <div className="cr-stickybar"><button type="button" className="cr-btn" onClick={openDrawer}>Submit a new cut</button></div> : null}

      <div className="cr-scrim" onClick={closeDrawer} />
      <aside className="cr-drawer" aria-label="Submit a new cut" aria-hidden={!drawer}>
        <div className="cr-dhead">
          <div className="cr-dtitle"><span>{title}</span><b>Submit a new cut</b></div>
          {dStep !== 3 ? <button type="button" className="cr-dclose" onClick={closeDrawer} aria-label="Close"><X size={14} /></button> : null}
        </div>
        {dStep <= 2 ? (
          <div className="cr-dsteps"><i className={dStep >= 1 ? "on" : ""} /><i className={dStep >= 2 ? "on" : ""} /><span>Step {dStep} of 2</span></div>
        ) : null}

        <div className="cr-dbody">
          {dStep === 1 ? (
            <div className="cr-dsection">
              <label className="cr-dlabel">Upload the new cut</label>
              <p className="cr-dcap">One video file. The Review Agents compare it with your last one.</p>
              <input ref={fileRef} type="file" accept="video/*" hidden onChange={(e) => takeFile(e.target.files && e.target.files[0])} />
              <div
                className={`cr-drop ${dragOver ? "is-over" : ""} ${isUploading ? "is-busy" : ""}`}
                role="button" tabIndex={0}
                onClick={() => fileRef.current && fileRef.current.click()}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileRef.current && fileRef.current.click(); } }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); takeFile(e.dataTransfer.files && e.dataTransfer.files[0]); }}
              >
                <Upload size={24} />
                {isUploading ? (
                  <span className="cr-uploading">
                    <span className="cr-uploading-top">
                      Uploading {dFile ? dFile.name : "your video"}
                      <b>{Math.round(dPct)}%</b>
                    </span>
                    <span className="cr-track"><i style={{ width: Math.max(3, dPct) + "%" }} /></span>
                  </span>
                )
                  : dUploaded ? <span><b>{dUploaded.filename}</b> · {fmtBytes(dFile?.size)} · tap to change</span>
                  : <span><b>Drag and drop your video</b> or tap to browse. MP4, MOV.</span>}
              </div>
              {fixes.length ? (
                <div className="cr-fixrecap">{fixes.slice(0, 5).map((c) => <div key={c.id}>{c.name}</div>)}</div>
              ) : null}
            </div>
          ) : null}
          {dStep === 2 ? (
            <div className="cr-dsection">
              <label className="cr-dlabel">Ready to send</label>
              <div className="cr-recap">
                <span className="cr-recap-thumb"><Play size={16} /></span>
                <div className="cr-recap-text"><b>{dUploaded?.filename || "New cut"}</b><span>{fmtBytes(dFile?.size)}</span></div>
              </div>
              <p className="cr-dcap">Sent as revision {revisionNo} of {title}. Your result shows on its own page and by email.</p>
            </div>
          ) : null}
          {dStep === 3 ? (
            <div className="cr-dsection cr-reviewing" role="status">
              <span>The Review Agents are watching your new cut. Usually under 2 minutes, keep this tab open.</span>
              <span className="cr-bar"><i /></span>
              {dStage ? <span className="cr-dcap">{dStage}</span> : null}
            </div>
          ) : null}
          {dStep === 4 ? (
            <div className="cr-dsection cr-done">
              <b>New cut received</b>
              <p>{modeLabel === "Manual" ? brandName + " will look at it personally and email you their decision." : "Your result is ready on its own page, and " + brandName + " has been told."}</p>
              {resultHref && modeLabel !== "Manual" ? <a className="cr-btn" href={resultHref}>See your result <ArrowRight size={14} /></a> : <button type="button" className="cr-btn" onClick={() => setDrawer(false)}>Done</button>}
            </div>
          ) : null}
          {dError ? <p className="cr-derror">{dError}</p> : null}
        </div>

        {dStep <= 2 ? (
          <div className="cr-dfoot">
            {dStep > 1 ? <button type="button" className="cr-ghost" onClick={() => setDStep((s) => s - 1)}>Back</button> : <span />}
            {dStep < 2 ? (
              <button type="button" className="cr-btn" disabled={dStep === 1 && (!dUploaded || isUploading)} onClick={() => setDStep((s) => s + 1)}>Next</button>
            ) : (
              <button type="button" className="cr-btn" onClick={sendRevision}>Submit for review</button>
            )}
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      .cr, .cr * { font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; box-sizing: border-box; }
      .cr { position: relative; min-height: 60vh; padding: 26px 16px 64px; background: transparent; color: ${NAVY}; font-size: 14px; line-height: 1.5; -webkit-font-smoothing: antialiased; letter-spacing: -0.005em; }
      .cr-page { position: relative; z-index: 1; max-width: 1080px; margin: 0 auto; display: flex; flex-direction: column; gap: 18px; }
      .cr button { font-family: inherit; }
      .cr [hidden] { display: none !important; }

      .cr-topline { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
      .cr-back { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: ${NAVY}; text-decoration: none; }
      .cr-back:hover { color: ${BLUE}; }
      .cr-who-wrap { display: inline-flex; align-items: center; gap: 14px; }
      .cr-iconbtn { display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 12px; border-radius: 999px; border: 1px solid ${TINT_BORDER}; background: ${TINT}; color: ${NAVY}; font-size: 12.5px; font-weight: 500; cursor: pointer; }
      .cr-iconbtn:hover { border-color: ${PERI}; color: ${BLUE}; }
      .cr-iconbtn.is-done { color: ${PASS_FG}; border-color: transparent; background: ${PASS_BG}; }
      .cr-who { display: inline-flex; align-items: center; gap: 10px; }
      .cr-avatar { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; background: ${NAVY}; color: #fff; font-size: 12.5px; font-weight: 700; letter-spacing: 0.03em; }
      .cr-who-text { display: flex; flex-direction: column; line-height: 1.15; }
      .cr-who-text b { font-size: 13.5px; font-weight: 700; }
      .cr-who-text span { font-size: 12px; color: ${MUTED}; }

      .cr-layout { display: grid; grid-template-columns: 296px minmax(0, 1fr); gap: 22px; align-items: start; }
      .cr-player { position: sticky; top: 20px; display: flex; flex-direction: column; gap: 10px; }
      .cr-video { width: 100%; aspect-ratio: 9 / 16; border-radius: 18px; overflow: hidden; background: #000; border: 1px solid ${TINT_BORDER}; display: flex; align-items: center; justify-content: center; }
      .cr-video video, .cr-video img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .cr-video-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; color: rgba(255,255,255,0.7); font-size: 13px; }
      .cr-ext { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: ${BLUE}; text-decoration: none; }
      .cr-meta { font-size: 12.5px; color: ${MUTED}; }
      .cr-meta b { color: ${NAVY}; font-weight: 600; }
      .cr-mini { display: none; }

      .cr-sheet { background: ${CARD_BG}; border-radius: 18px; border: 1px solid ${TINT_BORDER}; overflow: hidden; min-width: 0; }
      .cr-head { padding: 22px 24px 20px; display: flex; flex-direction: column; gap: 10px; }
      .cr-eyebrow { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: ${MUTED}; flex-wrap: wrap; }
      .cr-eyebrow img { height: 20px; width: 20px; border-radius: 5px; object-fit: contain; }
      .cr-eyebrow b { color: ${NAVY}; font-weight: 700; }
      .cr-status { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
      .cr-chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 11px; border-radius: 999px; font-size: 12px; font-weight: 700; letter-spacing: 0.01em; }
      .cr-chip i { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
      .cr-passbar { display: inline-flex; align-items: center; gap: 8px; font-size: 12.5px; color: ${MUTED}; font-variant-numeric: tabular-nums; }
      .cr-track { width: 110px; height: 6px; border-radius: 999px; background: #E4E9FF; overflow: hidden; display: inline-block; }
      .cr-track i { display: block; height: 100%; border-radius: 999px; }
      .cr-h1 { margin: 2px 0 0; font-size: clamp(22px, 2.4vw, 28px); font-weight: 600; letter-spacing: -0.02em; line-height: 1.15; text-wrap: balance; }
      .cr-lede { margin: 0; font-size: 14px; line-height: 1.55; color: ${INK}; max-width: 62ch; }
      .cr-notes { margin: 0; padding: 12px 14px; border-radius: 14px; background: ${WASH}; border: 1px solid ${TINT_BORDER}; font-size: 14px; line-height: 1.55; white-space: pre-wrap; color: ${INK}; }
      .cr-actions { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-top: 6px; }
      .cr-btn { display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 22px; border: none; border-radius: 12px; background: ${NAVY}; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; text-decoration: none; transition: transform 0.16s ease, background 0.16s ease; }
      .cr-btn:hover:not(:disabled) { background: ${BLUE}; transform: translateY(-1px); }
      .cr-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      .cr-btn:focus-visible, .cr-iconbtn:focus-visible, .cr-row:focus-visible, .cr-toggle:focus-visible, .cr-fix:focus-visible, .cr-drop:focus-visible { outline: 2px solid ${BLUE}; outline-offset: 2px; }
      .cr-toggle { display: inline-flex; align-items: center; gap: 5px; background: transparent; border: none; padding: 0; color: ${BLUE}; font-size: 13px; font-weight: 600; cursor: pointer; }
      .cr-toggle svg, .cr-chev { transition: transform 0.16s ease; }
      .cr-toggle svg.is-open, .cr-chev.is-open { transform: rotate(180deg); }
      .cr-why { margin: 0; font-size: 13.5px; line-height: 1.5; color: ${MUTED}; max-width: 62ch; }
      .cr-bar { display: block; height: 6px; border-radius: 999px; background: ${TINT}; overflow: hidden; position: relative; }
      .cr-bar i { position: absolute; inset: 0; width: 40%; border-radius: 999px; background: ${PERI}; animation: crSlide 1.4s ease-in-out infinite; }
      @keyframes crSlide { from { transform: translateX(-100%); } to { transform: translateX(260%); } }

      .cr-rows { border-top: 1px solid ${HAIR}; }
      .cr-row { width: 100%; display: flex; align-items: center; gap: 12px; padding: 16px 24px; background: transparent; border: none; border-bottom: 1px solid ${HAIR}; cursor: pointer; text-align: left; color: ${NAVY}; }
      .cr-row:hover, .cr-row[aria-expanded="true"] { background: ${WASH}; }
      .cr-lbl { flex: 1 1 auto; font-size: 15px; font-weight: 600; }
      .cr-sub { font-size: 12.5px; color: ${MUTED}; font-variant-numeric: tabular-nums; }
      .cr-chev { color: ${FAINT}; flex: 0 0 auto; }
      .cr-panel { border-bottom: 1px solid ${HAIR}; }
      .cr-fix { display: grid; grid-template-columns: 1fr auto; gap: 4px 12px; padding: 13px 24px 13px 40px; border-top: 1px solid ${HAIR}; cursor: pointer; position: relative; }
      .cr-fix::before { content: ""; position: absolute; left: 24px; top: 19px; width: 7px; height: 7px; border-radius: 50%; background: ${FIX_FG}; }
      .cr-fix:first-child { border-top: none; }
      .cr-fix:hover { background: ${WASH}; }
      .cr-fix b { font-size: 14px; font-weight: 600; }
      .cr-t { font-size: 12px; color: ${BLUE}; font-weight: 600; font-variant-numeric: tabular-nums; display: inline-flex; align-items: center; gap: 4px; }
      .cr-t-muted { color: ${FIX_FG}; }
      .cr-note { grid-column: 1 / -1; display: grid; grid-template-columns: 56px 1fr; gap: 12px; align-items: start; padding-top: 6px; }
      .cr-note img { width: 56px; height: 84px; border-radius: 10px; object-fit: cover; display: block; background: #000; }
      .cr-note-blank { width: 56px; height: 84px; border-radius: 10px; background: ${TINT}; display: block; }
      .cr-note p { margin: 0; font-size: 13.5px; line-height: 1.5; color: ${INK}; max-width: 58ch; }
      .cr-note p span { display: block; margin-top: 4px; color: ${MUTED}; font-size: 12.5px; }

      .cr-group { border-top: 1px solid ${HAIR}; }
      .cr-group:first-child { border-top: none; }
      .cr-group > button { width: 100%; display: flex; align-items: center; gap: 10px; padding: 12px 24px 12px 40px; background: transparent; border: none; cursor: pointer; color: ${NAVY}; text-align: left; }
      .cr-group > button:hover { background: ${WASH}; }
      .cr-gname { flex: 1 1 auto; font-size: 14px; font-weight: 600; }
      .cr-gpass { font-size: 12.5px; font-weight: 600; font-variant-numeric: tabular-nums; }
      .cr-checks { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; padding: 4px 24px 16px 40px; }
      .cr-check { display: flex; gap: 12px; padding: 10px; border-radius: 14px; border: 1px solid ${TINT_BORDER}; background: ${WASH}; min-width: 0; }
      .cr-shot { width: 48px; height: 72px; border-radius: 9px; overflow: hidden; background: #000; flex: 0 0 48px; padding: 0; border: none; cursor: pointer; display: block; }
      .cr-shot:disabled { cursor: default; }
      .cr-shot img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .cr-shot.is-empty { background: #E4E9FF; }
      .cr-cb { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1 1 auto; }
      .cr-ct { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
      .cr-ct b { font-size: 13.5px; font-weight: 600; }
      .cr-pill { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; white-space: nowrap; }
      .cr-cs { font-size: 12px; color: ${MUTED}; font-variant-numeric: tabular-nums; }
      .cr-cb p { margin: 0; font-size: 12.5px; line-height: 1.45; color: ${INK}; }
      .cr-clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .cr-more { align-self: flex-start; background: transparent; border: none; padding: 0; color: ${BLUE}; font-size: 12px; font-weight: 600; cursor: pointer; }

      .cr-next { padding: 16px 24px 20px; display: flex; align-items: center; gap: 10px; font-size: 13.5px; color: ${MUTED}; }
      .cr-spark { width: 8px; height: 8px; border-radius: 50%; background: ${PERI}; flex: 0 0 auto; }
      .cr-stickybar { display: none; }

      /* Drawer */
      .cr-scrim { position: fixed; inset: 0; z-index: 900; background: rgba(0, 19, 100, 0.35); backdrop-filter: blur(2px); opacity: 0; pointer-events: none; transition: opacity 0.2s ease; }
      .cr-drawer { position: fixed; top: 0; right: 0; bottom: 0; z-index: 901; width: min(480px, 100%); background: ${CARD_BG}; border-left: 1px solid ${TINT_BORDER}; box-shadow: -30px 0 60px -40px rgba(0,19,100,0.35); transform: translateX(104%); transition: transform 0.26s cubic-bezier(.2,.8,.2,1); display: flex; flex-direction: column; color: ${NAVY}; }
      .cr-drawer-open .cr-scrim { opacity: 1; pointer-events: auto; }
      .cr-drawer-open .cr-drawer { transform: none; }
      .cr-dhead { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 22px 22px 8px; }
      .cr-dtitle { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
      .cr-dtitle span { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${PERI}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .cr-dtitle b { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
      .cr-dclose { width: 32px; height: 32px; border-radius: 50%; border: 1px solid ${TINT_BORDER}; background: ${WASH}; display: grid; place-items: center; cursor: pointer; color: ${NAVY}; flex: 0 0 auto; }
      .cr-dsteps { display: flex; align-items: center; gap: 6px; padding: 0 22px 14px; }
      .cr-dsteps i { width: 26px; height: 4px; border-radius: 999px; background: #E4E9FF; display: block; }
      .cr-dsteps i.on { background: ${PERI}; }
      .cr-dsteps span { margin-left: 6px; font-size: 11.5px; color: ${MUTED}; }
      .cr-dbody { padding: 4px 22px 22px; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; flex: 1 1 auto; }
      .cr-dsection { display: flex; flex-direction: column; gap: 12px; }
      .cr-dlabel { font-size: 13.5px; font-weight: 700; }
      .cr-dcap { font-size: 12.5px; color: ${MUTED}; margin: -8px 0 0; line-height: 1.45; }
      .cr-drop { border: 1.5px dashed rgba(135,156,247,0.55); border-radius: 18px; background: ${WASH}; padding: 34px 18px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; color: ${MUTED}; font-size: 13px; cursor: pointer; transition: background 0.16s ease, border-color 0.16s ease; }
      .cr-drop b { color: ${NAVY}; }
      .cr-uploading { display: flex; flex-direction: column; gap: 7px; width: 100%; max-width: 280px; }
      .cr-uploading-top { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
      .cr-uploading-top b { font-weight: 700; color: ${BLUE}; font-variant-numeric: tabular-nums; }
      .cr-track { display: block; width: 100%; height: 5px; border-radius: 99px; background: rgba(0,19,100,0.08); overflow: hidden; }
      .cr-track i { display: block; height: 100%; border-radius: 99px; background: ${BLUE}; transition: width 180ms linear; }
      .cr-drop svg { color: ${BLUE}; }
      .cr-drop:hover, .cr-drop.is-over { border-color: ${PERI}; background: #fff; }
      .cr-drop.is-busy { opacity: 0.7; pointer-events: none; }
      .cr-fixrecap { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: ${INK}; }
      .cr-fixrecap div { display: flex; gap: 8px; align-items: center; }
      .cr-fixrecap div::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: ${FIX_FG}; }
      .cr-textarea { width: 100%; min-height: 96px; resize: vertical; border: 1px solid ${TINT_BORDER}; border-radius: 14px; padding: 12px 14px; font: inherit; font-size: 14px; color: ${NAVY}; background: #fff; }
      .cr-textarea:focus { outline: 2px solid ${PERI}; outline-offset: 1px; }
      .cr-recap { display: flex; gap: 10px; align-items: center; padding: 10px 12px; border-radius: 14px; border: 1px solid ${TINT_BORDER}; background: ${WASH}; }
      .cr-recap-thumb { width: 40px; height: 60px; border-radius: 8px; background: #E4E9FF; display: grid; place-items: center; color: ${BLUE}; flex: 0 0 40px; }
      .cr-recap-text { display: flex; flex-direction: column; gap: 2px; font-size: 13px; min-width: 0; }
      .cr-recap-text b { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .cr-recap-text span { color: ${MUTED}; font-size: 12px; }
      .cr-reviewing { font-size: 13.5px; color: ${MUTED}; padding: 8px 0; }
      .cr-done { align-items: flex-start; }
      .cr-done b { font-size: 18px; letter-spacing: -0.02em; }
      .cr-done p { margin: 0; font-size: 13.5px; color: ${MUTED}; }
      .cr-derror { margin: 0; font-size: 13px; color: ${NO_FG}; }
      .cr-dfoot { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 14px 22px 22px; border-top: 1px solid ${HAIR}; }
      .cr-ghost { background: transparent; border: none; color: ${BLUE}; font-size: 13.5px; font-weight: 600; cursor: pointer; padding: 0; }

      @media (prefers-reduced-motion: reduce) { .cr-drawer, .cr-scrim, .cr-chev, .cr-toggle svg, .cr-btn { transition: none; } .cr-bar i { animation: none; width: 100%; } }
      @media (max-width: 760px) {
        .cr { padding: 18px 14px 96px; }
        .cr-page { gap: 14px; }
        .cr-topline { flex-wrap: wrap; }
        .cr-layout { grid-template-columns: 1fr; gap: 12px; }
        .cr-player { display: none; }
        .cr-mini { display: block; }
        .cr-mini-row { width: 100%; display: flex; align-items: center; gap: 12px; background: transparent; border: none; padding: 0; text-align: left; cursor: pointer; color: ${NAVY}; }
        .cr-thumb { width: 64px; height: 96px; border-radius: 12px; overflow: hidden; background: #000; position: relative; flex: 0 0 64px; display: block; }
        .cr-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .cr-thumb i { position: absolute; inset: 0; display: grid; place-items: center; color: #fff; }
        .cr-thumb i svg { filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5)); }
        .cr-mini-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .cr-mini-text b { font-size: 14px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .cr-mini-text span { font-size: 12.5px; color: ${MUTED}; }
        .cr-mini-player { width: 100%; max-width: 260px; margin: 0 auto; aspect-ratio: 9 / 16; border-radius: 16px; overflow: hidden; background: #000; }
        .cr-mini-player video { width: 100%; height: 100%; object-fit: cover; display: block; }
        .cr-head { padding: 18px 16px 16px; }
        .cr-h1 { font-size: 26px; }
        .cr-row { padding: 14px 16px; }
        .cr-fix { padding: 12px 16px 12px 32px; }
        .cr-fix::before { left: 16px; }
        .cr-group > button { padding: 12px 16px 12px 32px; }
        .cr-checks { grid-template-columns: 1fr; padding: 4px 16px 14px 32px; }
        .cr-next { padding: 14px 16px 18px; }
        .cr-stickybar { display: flex; position: fixed; left: 0; right: 0; bottom: 0; z-index: 800; padding: 12px 14px 16px; background: rgba(243, 246, 255, 0.96); border-top: 1px solid ${TINT_BORDER}; }
        .cr-stickybar .cr-btn { width: 100%; justify-content: center; }
        .cr-drawer { top: auto; left: 0; width: 100%; max-height: 88%; border-radius: 24px 24px 0 0; transform: translateY(104%); }
      }
    `}</style>
  );
}
