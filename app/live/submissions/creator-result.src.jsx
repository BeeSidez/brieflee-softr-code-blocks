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

// __ENGINE_MODULE__

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

  // __ENGINE_PIPELINE__

  // ── The drawer: video, send ──
  const [drawer, setDrawer] = useState(false);
  const [dStep, setDStep] = useState(1); // 1 video, 2 send, 3 reviewing, 4 done
  const [dFile, setDFile] = useState(null);
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
    try {
      const [up] = await uploadAsync(file);
      if (!up || up.status !== "completed" || !up.url) throw new Error("upload");
      setDUploaded({ filename: up.file?.name || file.name || "video.mp4", url: up.url });
    } catch (e) {
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
                {isUploading ? <span>Uploading {dFile ? dFile.name : "your video"}…</span>
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
