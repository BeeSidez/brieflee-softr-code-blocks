// =====================================================================
// Vibe Coding block: video-analysis — the shared review engine
// =====================================================================
// One block, every intake page. This file is the /review build (MODE
// "review"): a logged-in brand user submits one video against a
// workspace and, optionally, a brief. The same engine is reused on
// /new, /videos, /bulk, /remix, /brief/details/live and
// /live/submissions by changing MODE and the intake UI around it.
//
// THE WHOLE REVIEW RUNS IN THIS BLOCK. No workflow, no n8n.
//
//   1. Gate — account present, users.status Active, videos_remaining > 0.
//      Nothing runs and nothing is written until this passes.
//   2. Source the mp4 — useUpload for files, the Auto Download REST
//      source for TikTok / Instagram / YouTube / Facebook links.
//   3. Cloudinary (unsigned preset, plain fetch) — playback URL plus the
//      so_<seconds> frame transforms every criterion screenshot uses.
//   4. Compressed copy under 2.5MB (four rungs) as inline base64. The
//      Softr proxy carries text only and rejects bodies over ~4MB; Gemini
//      samples at 1fps so the compression costs the review nothing.
//   5. ONE Gemini call (native Gemini source) with the brief-aware
//      prompt ported from the n8n engine, thresholds from the brief then
//      the account, 26 Review Agents. Retry ladder from the checker.
//   6. Parse, key every criterion by threshold_name (never by position).
//   7. WRITE AT THE END, in order: submission → review → one
//      review_report row per agent → link the review back onto the
//      submission → notifications → EmailIt by alias. A failed run
//      writes nothing and charges nothing (consumption is the row).
//
// SOFTR SOURCES on this block (Source tab): submissions, reviews,
// review_report, accounts, briefs, users, notifications (Softr tables);
// Emailit + Auto Download All In One + Cloudinary (REST); Gemini
// (native). Cloudinary is called with plain fetch because FormData
// cannot cross the proxy, so that REST source stays unused.
//
// Decisions (Bev, 2 Sep 2026): no account → tell them to create one;
// entitlement = users.status Active + credits, trial counts as Active;
// no free first video; Pending treated as not entitled until told
// otherwise. Copy: no em dashes. "Review Agents" throughout.
// =====================================================================

import { useEffect, useMemo, useRef, useState } from "react";
import {
  datasource, useRecord, useRecords, useRecordCreate, useRecordUpdate, useUpload, useProxyFetch, q,
} from "@/lib/datasource";
import { useCurrentUser } from "@/lib/user";
import { toast } from "sonner";
import { Link2, Upload, Check, X, RotateCcw, ArrowRight } from "lucide-react";

// ─── Mode ──────────────────────────────────────────────────────
// "review": logged-in single video (this build).
const MODE = "review";

// ─── Datasources (connection ids from THIS block's Source tab) ──
const ds = datasource.define({
  submissions:   "4da41b0d-e56e-4701-8188-78f1686a7416",
  reviews:       "98795613-37d4-4af0-a4b8-17ff5c715587",
  report:        "8db468a5-9939-4873-9673-01f1b82c7c8f",
  accounts:      "accounts",
  briefs:        "briefs",
  users:         "users",
  notifications: "notifications",
  emailit:       "fee4e358-cada-4962-924f-561382677d65",
  google:        "c044105c-09cd-48ba-81d1-1b4c9316e4e6",
  rapid:         "6c9b7e47-7290-4475-bd66-62428afa8c91",
});

// ─── Reads ─────────────────────────────────────────────────────
// The logged-in user's own record: the gate and the workspace list.
const userSelect = q.select({
  status:          "kClk9",
  videosRemaining: "3kzMt",
  accounts:        "Nz6VX",
  briefs:          "3Ww0J",
  firstName:       "0lVyD",
  email:           "PBrIP",
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
  thProductScreen: "7Zpeo",
  thHookSpeed:     "CEkkg",
  thVisualHook:    "Drp5T",
  thCta:           "zo9Fo",
  thFaceTime:      "jSDeR",
  thTextLegibility:"aHH2x",
  thAudioClarity:  "zXqtt",
  thPacing:        "15284",
});

// ─── Writes ────────────────────────────────────────────────────
const submissionCreate = q.select({
  name:            "XebTQ",
  accounts:        "v94f0",
  briefs:          "fqtit",
  projects:        "M8O02",
  users:           "DxNOa",
  videoUrl:        "XrARi",
  videoFile:       "PP7rO",
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
});
const submissionLink = q.select({
  reviews: "kdfMm",
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
  userValidationProceed: "0fb06c28-5e30-4a38-9cf4-2e75490f7d1a",
  statusReviewed: "713723b2-f81f-46f9-ae7d-526e334706b3",
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
  ba:  { PASS: "500f7b1c-3ab5-4980-85a1-f315afa35f8b", FAIL: "32992beb-86ef-4903-af2d-363046aa9bb5", ALIGNED: "b91c68cb-8420-47be-ae26-0b8f7e4a15fe", MISALIGNED: "bab6ec30-bf74-4429-9a48-062f7703f950" },
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

const EYES = "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_review-eyes-glass-3d-clearer-periwinkle-transparent_2026-07.png";

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
function unwrap(raw) {
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
function num(raw) {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
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
function isValidVideoUrl(input) {
  return /^https?:\/\/([a-z0-9-]+\.)*(tiktok\.com|vm\.tiktok\.com|instagram\.com|youtube\.com|youtu\.be|facebook\.com|fb\.watch)\//i.test((input || "").trim());
}
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
  const s = unwrap(val).toLowerCase();
  return s !== "" && s !== "none" && s !== "0";
};

// Which agents run: the union of the brief's and the account's Review
// Agents. Thresholds come from the brief first, then the account.
function buildChecks(account, brief) {
  const picked = new Set([...unwrapAll(account?.qaChecklist), ...unwrapAll(brief?.qaChecklist)].map((s) => s.toLowerCase()));
  const isChecked = (labels) => labels.some((l) => picked.has(l.toLowerCase()));
  let usedBrief = false;
  const checks = AGENTS.map((a) => {
    let th = "";
    if (a.th) {
      if (brief && isValidThreshold(brief[a.th])) { th = unwrap(brief[a.th]); usedBrief = true; }
      else if (account && isValidThreshold(account[a.th])) th = unwrap(account[a.th]);
    }
    const on = a.always || !!th || isChecked(a.pick);
    if (!on) return { ...a, value: DO_NOT_CHECK, on: false, threshold: "" };
    const rule = a.rule ? RULES[a.rule] : "";
    const value = (th ? th + ". " : "") + (rule || a.name);
    return { ...a, value: value.trim(), on: true, threshold: th };
  });
  return { checks, thresholdSource: usedBrief ? "Brief" : "Account" };
}

function buildPrompt({ account, brief, notes, checks, meta, screenshotBase }) {
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
${example ? `
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
    "video_title": "[Maximum 3 words describing the video content]",
    "overall_rating": [1-5],
    "overall_comment": "[2-3 paragraph analysis covering: (1) How well the video fulfils the brief, (2) Quality and production value, (3) What needs to change if not approved]",
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
      "comment": "[2-3 sentences on what you observed for this metric. Be specific with timestamps. If brief specifies requirements for this metric, reference them.]",
      "key_moment_timestamp": [seconds - the most relevant moment for this metric],
      "screenshot_url": "${screenshotBase}"
    }
  ],
  "transcript": "[Scene-by-scene breakdown. Format: [Xs] Visual: [action] | Dialogue: [words or None] | Text: [overlays or None]]"
}

CRITICAL REQUIREMENTS:
- Return ONLY valid JSON with no text before or after
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

// Reads one account record and hands its fields up. Keyed on the
// workspace id by the parent, so it never mounts with an empty id.
function AccountLoader({ recordId, onFields }) {
  const { data, status } = useRecord({ recordId, select: accountSelect, from: ds.accounts });
  useEffect(() => {
    if (status === "success") onFields(data?.fields || null);
    if (status === "error") onFields(null);
  }, [data, status, onFields]);
  return null;
}

function statusValue(prefix, status) {
  const ids = STATUS_IDS[prefix] || {};
  return ids[status] || status;
}
function numericScore(s) {
  const n = parseFloat(String(s).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? Math.round(n) : null;
}

// =====================================================================
// Block
// =====================================================================
export default function Block() {
  const user = useCurrentUser();
  if (!user) {
    return (
      <div className="bl-va"><style>{CSS}</style>
        <div className="bl-card"><div className="bl-gate"><b>Log in</b><span>Log in to review a video.</span></div></div>
      </div>
    );
  }
  return <Engine user={user} />;
}

// Mounted only with a logged-in user, so useRecord never runs with an
// empty recordId (an empty id makes the data layer query, fail and
// retry on a timer, toasting each round).
function Engine({ user }) {

  // Context from the URL (parsed inside initialisers, never at module level).
  const [urlWorkspace] = useState(() => { try { return new URLSearchParams(window.location.search).get("workspace") || ""; } catch { return ""; } });
  const [urlBrief] = useState(() => { try { return new URLSearchParams(window.location.search).get("brief") || new URLSearchParams(window.location.search).get("briefId") || ""; } catch { return ""; } });

  // Own record: gate + workspaces.
  const me = useRecord({ recordId: user.id, select: userSelect, from: ds.users });
  const mf = me?.data?.fields || {};
  const myAccounts = useMemo(() => (Array.isArray(mf.accounts) ? mf.accounts : []).map((a) => ({ id: a?.id || "", name: unwrap(a) || "Untitled workspace" })).filter((a) => a.id), [mf.accounts]);

  const [workspaceId, setWorkspaceId] = useState("");
  useEffect(() => {
    if (workspaceId || myAccounts.length === 0) return;
    const pick = myAccounts.find((a) => a.id === urlWorkspace) || myAccounts[0];
    setWorkspaceId(pick.id);
  }, [myAccounts, urlWorkspace, workspaceId]);

  const [af, setAf] = useState(null);

  // Briefs in this workspace (Active first).
  const briefsQ = useRecords({ select: briefSelect, from: ds.briefs, count: 100 });
  const briefs = useMemo(() => {
    const all = (briefsQ?.data?.pages?.flatMap((p) => p?.items ?? []) ?? []).map((b) => ({ id: b.id, f: b.fields || {} }));
    if (!workspaceId) return [];
    const mine = new Set(idsOf(mf.briefs));
    return all.filter((b) => idsOf(b.f.accounts).includes(workspaceId) || mine.has(b.id));
  }, [briefsQ?.data, workspaceId, mf.briefs]);
  const [briefId, setBriefId] = useState("");
  useEffect(() => { if (!briefId && urlBrief && briefs.some((b) => b.id === urlBrief)) setBriefId(urlBrief); }, [briefs, urlBrief, briefId]);
  const brief = useMemo(() => briefs.find((b) => b.id === briefId)?.f || null, [briefs, briefId]);

  // Writes.
  const createSubmission = useRecordCreate({ fields: submissionCreate, from: ds.submissions });
  const linkSubmission = useRecordUpdate({ fields: submissionLink, from: ds.submissions });
  const createReview = useRecordCreate({ fields: reviewCreate, from: ds.reviews });
  const createReport = useRecordCreate({ fields: reportCreate, from: ds.report });
  const createNotification = useRecordCreate({ fields: notificationCreate, from: ds.notifications });
  const { uploadAsync } = useUpload();
  const proxyRapid = useProxyFetch(ds.rapid);
  const proxyGoogle = useProxyFetch(ds.google);
  const proxyEmailit = useProxyFetch(ds.emailit);

  // Intake state.
  const [tab, setTab] = useState("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [creatorEmail, setCreatorEmail] = useState("");
  const [page, setPage] = useState("input"); // input | processing | done | failure
  const [error, setError] = useState("");
  const [failReason, setFailReason] = useState("");
  const [stage, setStage] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [procSrc, setProcSrc] = useState("");
  const [result, setResult] = useState(null);
  const runRef = useRef(0);

  useEffect(() => {
    if (page !== "processing") return;
    const t0 = Date.now();
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 1000);
    return () => clearInterval(t);
  }, [page]);

  // ── The gate ─────────────────────────────────────────────────
  const gate = useMemo(() => {
    if (me?.status === "pending") return { ok: false, code: "loading", text: "" };
    if (myAccounts.length === 0) return { ok: false, code: "noAccount", text: "You need to create an account before we can review your submission." };
    const st = unwrap(mf.status);
    if (st !== "Active") return { ok: false, code: "inactive", text: "Your account is inactive, so reviews are paused. Reactivate it to submit videos." };
    if (num(mf.videosRemaining) <= 0) return { ok: false, code: "noCredits", text: "You have used every video on your plan for this billing cycle." };
    return { ok: true, code: "ok", text: "" };
  }, [me?.status, myAccounts.length, mf.status, mf.videosRemaining]);

  const workspaceName = myAccounts.find((a) => a.id === workspaceId)?.name || unwrap(af?.name) || "";
  const aiModeLabel = unwrap(brief?.aiMode) || unwrap(af?.aiMode) || "Hybrid";

  // ── Submit ───────────────────────────────────────────────────
  const handleStart = async () => {
    setError("");
    if (!gate.ok) { setError(gate.text); return; }
    if (!workspaceId || !af) { setError("Choose a workspace."); return; }
    if (tab === "url" && !isValidVideoUrl(url)) { setError("Paste a TikTok, Instagram Reel, YouTube Short or Facebook Reel link."); return; }
    if (tab === "file" && !file) { setError("Choose a video file to upload."); return; }
    if (tab === "file" && file && file.size > MAX_FILE_MB * 1024 * 1024) { setError(`That file is over ${MAX_FILE_MB}MB. Trim or compress it and try again.`); return; }
    if (creatorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(creatorEmail.trim())) { setError("That creator email does not look right."); return; }
    if (!createSubmission.enabled || !createReview.enabled) { setError("We can't start the review right now. Refresh and try again."); return; }
    const myRun = ++runRef.current;
    setPage("processing"); setStage("Getting the video"); setElapsed(0); setProcSrc(""); setFailReason("");
    try {
      await runPipeline(myRun);
    } catch (e) {
      if (runRef.current !== myRun) return;
      console.error("=== video-analysis failed:", e);
      setFailReason(String(e?.message || e));
      setPage("failure");
    }
  };

  // ── Gemini video part (inline under 14MB, Files API above) ───
  async function makeVideoPart(blob, mime) {
    const INLINE_LIMIT = 14 * 1024 * 1024;
    if (blob.size <= INLINE_LIMIT) return { inline_data: { mime_type: mime, data: await blobToBase64(blob) } };
    const startRes = await proxyGoogle(`${GEMINI_BASE}/upload/v1beta/files`, {
      method: "POST",
      headers: { "X-Goog-Upload-Protocol": "resumable", "X-Goog-Upload-Command": "start", "X-Goog-Upload-Header-Content-Length": String(blob.size), "X-Goog-Upload-Header-Content-Type": mime, "Content-Type": "application/json" },
      body: JSON.stringify({ file: { display_name: "brieflee-submission" } }),
    });
    const uploadUrl = startRes.ok ? startRes.headers.get("x-goog-upload-url") : "";
    if (!uploadUrl) throw new Error(`Video upload to the model failed (HTTP ${startRes.status}, ${Math.round(blob.size / 1048576)}MB).`);
    const upRes = await proxyGoogle(uploadUrl, { method: "POST", headers: { "X-Goog-Upload-Command": "upload, finalize", "X-Goog-Upload-Offset": "0" }, body: blob });
    if (!upRes.ok) throw new Error(`Video upload to the model failed (HTTP ${upRes.status}).`);
    let f = (await upRes.json())?.file || {};
    const deadline = Date.now() + 90000;
    while (f.state === "PROCESSING" && Date.now() < deadline) {
      await sleep(2000);
      const pRes = await proxyGoogle(`${GEMINI_BASE}/v1beta/${f.name}`, { method: "GET" });
      if (pRes.ok) f = await pRes.json();
    }
    if (f.state !== "ACTIVE" || !f.uri) throw new Error("The Review Agents couldn't finish preparing the video.");
    return { file_data: { mime_type: mime, file_uri: f.uri } };
  }

  // ── The pipeline ─────────────────────────────────────────────
  async function runPipeline(myRun) {
    const alive = () => runRef.current === myRun;
    const isYouTube = tab === "url" && /youtube\.com|youtu\.be/i.test(url.trim());
    const ytId = isYouTube ? ytVideoId(url.trim()) : "";

    // 1. Source the mp4
    let mp4 = ""; let handle = ""; let duration = 0; let uploaded = null;
    if (tab === "file") {
      const [up] = await uploadAsync(file);
      if (!up || up.status !== "completed" || !up.url) throw new Error("The video upload didn't complete. Try again.");
      uploaded = { filename: up.file?.name || file.name || "video.mp4", url: up.url };
      try { setProcSrc(URL.createObjectURL(file)); } catch { /* no preview */ }
    } else {
      const res = await proxyRapid(SCRAPE_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: url.trim() }) });
      if (!res.ok) { const d = await res.text().catch(() => ""); throw new Error(`We couldn't fetch that link (${res.status}). ${d.slice(0, 160)}`); }
      const scraped = adaptScrape(await res.json());
      if (!scraped.mp4 && !isYouTube) throw new Error("We couldn't read that video. The link may be private or deleted.");
      mp4 = scraped.mp4; handle = scraped.handle; duration = scraped.duration;
      if (mp4) setProcSrc(mp4);
    }
    if (!alive()) return;

    // 2. Cloudinary: playback copy + frames
    setStage("Preparing frames");
    let publicId = ""; let deliveryUrl = ""; let cld = null;
    if (!isYouTube) {
      try {
        const form = new FormData();
        form.append("file", tab === "file" ? file : mp4);
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
    if (!alive()) return;

    // 3. The bytes, compressed to fit the proxy
    setStage("Review Agents watching");
    const INLINE_SAFE = 2.5 * 1024 * 1024;
    const rungs = publicId ? [
      `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/upload/q_auto:low,c_limit,h_854/${publicId}.mp4`,
      `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/upload/q_35,c_limit,h_640/${publicId}.mp4`,
      `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/upload/q_25,c_limit,h_480/${publicId}.mp4`,
      `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/upload/q_20,c_limit,h_360/${publicId}.mp4`,
    ] : [];
    let blob = tab === "file" ? file : null;
    let mime = (tab === "file" && file?.type) || "video/mp4";
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
    let videoPart = isYouTube ? { file_data: { file_uri: url.trim() } } : await makeVideoPart(blob, mime);
    if (!alive()) return;

    // 4. Gemini
    const { checks, thresholdSource } = buildChecks(af, brief);
    const meta = {
      format: String(cld?.format || (file?.type || "").split("/")[1] || "mp4").toUpperCase(),
      sizeMb: cld?.bytes ? (cld.bytes / 1e6).toFixed(1) : file ? (file.size / 1e6).toFixed(1) : "0",
      resolution: cld?.width && cld?.height ? `${cld.width}x${cld.height}` : "",
      aspect: cld?.width && cld?.height ? aspectRatio(cld.width, cld.height) : "",
      fps: cld?.frame_rate ?? "",
      duration: fmtDuration(duration || cld?.duration || 0),
    };
    const screenshotBase = publicId ? `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/upload/so_{timestamp}/c_fill,h_1920,w_1080/${publicId}.jpg` : "";
    const prompt = buildPrompt({ account: af, brief, notes, checks, meta, screenshotBase });
    const genUrl = `${GEMINI_BASE}/v1beta/models/${GEMINI_MODEL}:generateContent`;
    const attempt = (part) => proxyGoogle(genUrl, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }, part] }],
        generationConfig: { temperature: 0.4, topP: 1, topK: 32, maxOutputTokens: 16384, responseMimeType: "application/json" },
      }),
    });
    const retryable = (r) => !r.ok && (r.status >= 500 || r.status === 400);
    let gRes = await attempt(videoPart);
    for (let tries = 0; retryable(gRes) && tries < 2; tries++) { await sleep(2500); gRes = await attempt(videoPart); }
    while (retryable(gRes) && rungIdx + 1 < rungs.length) {
      rungIdx += 1;
      const r = await fetch(rungs[rungIdx]);
      if (!r.ok) continue;
      const b = await r.blob();
      if (b.size < 1000) continue;
      blob = b; videoPart = await makeVideoPart(blob, "video/mp4");
      gRes = await attempt(videoPart);
    }
    if (!gRes.ok) { const d = await gRes.text().catch(() => ""); throw new Error(`The model returned ${gRes.status}. ${d.slice(0, 200)}`); }
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
    if (!alive()) return;

    // 5. Write at the end: submission → review → report rows → link back
    setStage("Saving the review");
    const platform = tab === "file" ? "Upload" : detectPlatform(url);
    const videoTitle = stripEmDash(ov.video_title || "").slice(0, 80) || (file?.name || handle || "Video");
    const subFields = {
      name: videoTitle,
      accounts: workspaceId,
      briefs: briefId ? [{ id: briefId }] : null,
      projects: brief?.projects ? idsOf(brief.projects).map((id) => ({ id })) : null,
      users: [{ id: user.id }],
      videoUrl: tab === "url" ? url.trim() : "",
      videoFile: uploaded ? [uploaded] : null,
      creatorName: creatorName.trim() || unwrap(brief?.creatorName) || "",
      creatorEmail: creatorEmail.trim() || unwrap(brief?.creatorEmail) || "",
      submissionType: OPT.subTypeContentReview,
      status: OPT.statusReviewed,
      userValidation: OPT.userValidationProceed,
      platformName: OPT.platform[platform] || OPT.platform.Upload,
      platformUsername: handle || "",
      submissionNotes: notes.trim(),
      qaChecklist: idsOf(af?.qaChecklist),
      duration: meta.duration,
      resolution: meta.resolution,
      aspectRatio: meta.aspect,
      fileSizeMb: String(meta.sizeMb),
      format: meta.format,
      fps: Number(meta.fps) || null,
    };
    const sub = await createSubmission.mutateAsync(subFields);
    const subId = sub?.id || sub?.recordId || sub?.record?.id || "";
    if (!subId) throw new Error("The submission was not saved.");

    const g = (prefix) => byName.get(AGENTS.find((a) => a.key === prefix)?.name || "") || null;
    const col = (prefix) => {
      const r = g(prefix); if (!r) return {};
      const sc = numericScore(r.score);
      return { score: sc, status: statusValue(prefix, r.status), comment: r.comment.slice(0, 1000), shot: r.screenshot };
    };
    const pst = col("pst"), hs = col("hs"), vh = col("vh"), cta = col("cta"), ft = col("ft"), tl = col("tl"), ac = col("ac"), ep = col("ep"), bm = col("bm"), cr = col("cr"), cm = col("cm"), ba = col("ba");
    const links = {
      submissions: [{ id: subId }],
      accounts: [{ id: workspaceId }],
      briefs: briefId ? [{ id: briefId }] : null,
      projects: brief?.projects ? idsOf(brief.projects).map((id) => ({ id })) : null,
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
    if (!reviewId) throw new Error("The review was not saved.");

    // One review_report row per agent, in order.
    if (!createReport.enabled) console.error("review_report create is not enabled for this user");
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
          ...links,
        });
        reportsWritten += 1;
      } catch (e) { console.error("review_report row failed:", r.agent.name, String(e?.message || e)); }
    }
    console.log(`review_report rows written: ${reportsWritten} of ${byName.size}`);
    if (linkSubmission.enabled) {
      try { await linkSubmission.mutateAsync({ recordId: subId, fields: { reviews: [{ id: reviewId }] } }); } catch (e) { console.error("link back failed:", e); }
    }

    // 6. Notifications
    const failed = [...byName.values()].filter((r) => r.status !== "PASS").map((r) => r.agent.name);
    const notifBase = { isRead: false, accounts: [{ id: workspaceId }], users: [{ id: user.id }], briefs: briefId ? [{ id: briefId }] : null, projects: links.projects, submissions: [{ id: subId }], reviews: [{ id: reviewId }] };
    const notify = async (type, title, message) => {
      try { await createNotification.mutateAsync({ ...notifBase, type, title, message }); } catch (e) { console.error("notification failed:", title, e); }
    };
    const creatorEmailFinal = subFields.creatorEmail;
    if (creatorEmailFinal) await notify(OPT.notif.received, "Submission received", `${videoTitle} was submitted${brief ? ` for ${unwrap(brief.name)}` : ""}.`);
    await notify(OPT.notif.completed, "Review completed", `${videoTitle}: ${decision.toLowerCase()} by the Review Agents${failed.length ? ` (${failed.length} flagged)` : ""}.`);
    const decisionType = decision === "APPROVED" ? OPT.notif.approved : decision === "REJECTED" ? OPT.notif.rejected : OPT.notif.flagged;
    const decisionTitle = decision === "APPROVED" ? "Content approved" : decision === "REJECTED" ? "Content rejected" : "Flagged for review";
    await notify(decisionType, decisionTitle, stripEmDash(ov.decision_reasoning || "").slice(0, 500));

    // 7. EmailIt by alias, idempotent per submission + event
    const reviewUrl = `${APP_ORIGIN}${DETAILS_PATH}?recordId=${encodeURIComponent(subId)}`;
    const submissionUrl = `${APP_ORIGIN}${LIVE_PATH}?recordId=${encodeURIComponent(subId)}`;
    const vars = {
      account_name: workspaceName,
      brief_name: unwrap(brief?.name) || "your brief",
      creator_first_name: (subFields.creatorName || "there").split(" ")[0],
      creator_name: subFields.creatorName || "the creator",
      user_first_name: user.firstName || unwrap(mf.firstName) || "there",
      failed_thresholds: failed.length ? failed.join(", ") : "None",
      review_url: reviewUrl,
      submission_url: submissionUrl,
    };
    const send = async (alias, to) => {
      if (!to) return;
      try {
        const r = await proxyEmailit("https://api.emailit.com/v2/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Idempotency-Key": `${subId}-${alias}`.replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 200) },
          body: JSON.stringify({ from: EMAIL_FROM, to, template: alias, variables: vars }),
        });
        if (!r.ok) console.error("EmailIt", alias, "returned", r.status);
      } catch (e) { console.error("EmailIt failed:", alias, e); }
    };
    const outcome = decision === "APPROVED" ? "approved" : decision === "REJECTED" ? "rejected" : "flagged";
    const mode = aiModeLabel === "Autonomous" ? "auto" : aiModeLabel === "Manual" ? "manual" : "hybrid";
    const userEmail = user.email || unwrap(mf.email) || "";
    if (creatorEmailFinal) await send("bl-sub-received-creator", creatorEmailFinal);
    if (mode === "auto") { if (creatorEmailFinal) await send(`bl-sub-${outcome}-auto-creator`, creatorEmailFinal); }
    else if (mode === "hybrid") { if (creatorEmailFinal) await send(`bl-sub-${outcome}-hybrid-creator`, creatorEmailFinal); await send(`bl-sub-${outcome}-hybrid-user`, userEmail); }
    else { await send(`bl-sub-${outcome}-manual-user`, userEmail); }

    if (!alive()) return;
    setResult({ subId, reviewId, decision, title: videoTitle, failed, checks: byName.size, thumb: cldThumb(publicId) });
    setPage("done");
    // Straight through to the review.
    try { window.location.href = `${DETAILS_PATH}?recordId=${encodeURIComponent(subId)}`; } catch { /* stay */ }
  }

  const reset = () => { runRef.current += 1; setPage("input"); setError(""); setFailReason(""); setProcSrc(""); setResult(null); };

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="bl-va">
      <style>{CSS}</style>
      {workspaceId ? <AccountLoader key={workspaceId} recordId={workspaceId} onFields={setAf} /> : null}

      {page === "input" && (
        <div className="bl-card">
          <div className="bl-head">
            <img src={EYES} alt="" className="bl-eyes" draggable={false} />
            <div>
              <h2>Review a video</h2>
              <p>The Review Agents watch it frame by frame against {brief ? "the brief" : "your brand"} and file the review under {workspaceName || "your workspace"}.</p>
            </div>
          </div>

          {!gate.ok && gate.code !== "loading" && gate.code !== "login" ? (
            <div className="bl-gate">
              <b>{gate.code === "noAccount" ? "No account yet" : gate.code === "inactive" ? "Account inactive" : "No videos left"}</b>
              <span>{gate.text}</span>
              {gate.code === "noAccount" ? <a className="bl-btn bl-primary" href="/set-up">Create your account</a> : null}
              {gate.code === "noCredits" ? <a className="bl-btn bl-primary" href="/plan">See your plan</a> : null}
            </div>
          ) : null}

          {gate.code === "login" ? <div className="bl-gate"><b>Log in</b><span>{gate.text}</span></div> : null}

          {gate.ok ? (
            <>
              <div className="bl-grid">
                {myAccounts.length > 1 ? (
                  <label className="bl-field">
                    <span>Workspace</span>
                    <select value={workspaceId} onChange={(e) => { setWorkspaceId(e.target.value); setBriefId(""); }}>
                      {myAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </label>
                ) : null}
                <label className="bl-field">
                  <span>Brief <i>optional</i></span>
                  <select value={briefId} onChange={(e) => setBriefId(e.target.value)}>
                    <option value="">No brief, review against the brand</option>
                    {briefs.map((b) => <option key={b.id} value={b.id}>{unwrap(b.f.name) || "Untitled brief"}{unwrap(b.f.status) && unwrap(b.f.status) !== "Active" ? ` (${unwrap(b.f.status)})` : ""}</option>)}
                  </select>
                </label>
              </div>

              <div className="bl-tabs" role="tablist">
                <button type="button" role="tab" aria-selected={tab === "url"} onClick={() => { setTab("url"); setError(""); }}><Link2 size={14} />Paste a link</button>
                <button type="button" role="tab" aria-selected={tab === "file"} onClick={() => { setTab("file"); setError(""); }}><Upload size={14} />Upload a file</button>
              </div>

              {tab === "url" ? (
                <label className="bl-field">
                  <span>Video link</span>
                  <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.tiktok.com/@creator/video/..." onKeyDown={(e) => { if (e.key === "Enter") handleStart(); }} />
                </label>
              ) : (
                <label className="bl-drop">
                  <Upload size={18} />
                  <b>{file ? file.name : "Drop the video here, or click to choose"}</b>
                  <span>MP4 or MOV, up to {MAX_FILE_MB}MB</span>
                  <input type="file" accept="video/mp4,video/quicktime" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </label>
              )}

              <div className="bl-grid">
                <label className="bl-field"><span>Creator name <i>optional</i></span><input value={creatorName} onChange={(e) => setCreatorName(e.target.value)} placeholder={unwrap(brief?.creatorName) || "Who made it"} /></label>
                <label className="bl-field"><span>Creator email <i>optional</i></span><input type="email" value={creatorEmail} onChange={(e) => setCreatorEmail(e.target.value)} placeholder={unwrap(brief?.creatorEmail) || "So they get the result"} /></label>
              </div>
              <label className="bl-field"><span>Notes for the Review Agents <i>optional</i></span><textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything the agents should know about this video" /></label>

              {error ? <p className="bl-error" role="alert">{error}</p> : null}

              <div className="bl-actions">
                <span className="bl-meta">{num(mf.videosRemaining)} video{num(mf.videosRemaining) === 1 ? "" : "s"} left this cycle · {aiModeLabel} mode</span>
                <button type="button" className="bl-btn bl-primary" onClick={handleStart}>Review this video<ArrowRight size={14} /></button>
              </div>
            </>
          ) : null}
        </div>
      )}

      {page === "processing" && (
        <div className="bl-card bl-proc">
          {procSrc ? <div className="bl-scan"><video src={procSrc} muted autoPlay loop playsInline onError={() => setProcSrc("")} /><i /></div> : <img src={EYES} alt="" className="bl-eyes-lg" draggable={false} />}
          <h2>Review Agents watching</h2>
          <p className="bl-stage">{stage}</p>
          <div className="bl-bar"><b /></div>
          <p className="bl-meta">{elapsed}s · usually under a minute. Keep this tab open.</p>
        </div>
      )}

      {page === "done" && result && (
        <div className="bl-card bl-proc">
          <span className="bl-tick"><Check size={20} /></span>
          <h2>{result.decision === "APPROVED" ? "Approved" : result.decision === "REJECTED" ? "Rejected" : "Flagged for review"}</h2>
          <p className="bl-stage">{result.title} · {result.checks} checks · {result.failed.length} flagged</p>
          <a className="bl-btn bl-primary" href={`${DETAILS_PATH}?recordId=${encodeURIComponent(result.subId)}`}>Open the review<ArrowRight size={14} /></a>
        </div>
      )}

      {page === "failure" && (
        <div className="bl-card bl-proc">
          <span className="bl-tick bl-fail"><X size={20} /></span>
          <h2>The review didn't complete</h2>
          <p className="bl-stage">Nothing was saved and no video was used. {failReason ? <em>{failReason}</em> : null}</p>
          <div className="bl-actions bl-center">
            <button type="button" className="bl-btn bl-neutral" onClick={reset}><RotateCcw size={14} />Start again</button>
            <button type="button" className="bl-btn bl-primary" onClick={() => { setPage("input"); setTimeout(handleStart, 50); }}>Retry</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styles (app family: #FAFBFF card, Inter, calm surfaces) ──
const CSS = `
.bl-va{--navy:#001364;--label:#334283;--peri:#879CF7;--peri2:#6C7CC5;--peri3:#515D94;--fill:rgba(0,0,0,0.05);--muted:#6B7280;--fail:#c8443c;--pass:#2daa63;font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--navy);width:100%;max-width:720px;margin:0 auto;padding:16px 16px 28px;box-sizing:border-box}
.bl-va *{box-sizing:border-box}
.bl-va h2{margin:0;font-size:18px;font-weight:600;color:var(--navy);letter-spacing:-.01em}
.bl-va p{margin:0}
.bl-card{background:#FAFBFF;border-radius:14px;padding:22px;box-shadow:0 10px 30px -22px rgba(0,19,100,.35);display:flex;flex-direction:column;gap:14px}
.bl-head{display:flex;gap:14px;align-items:flex-start}
.bl-head p{font-size:13px;color:var(--muted);line-height:1.5;margin-top:4px}
.bl-eyes{width:52px;height:52px;flex:none}
.bl-eyes-lg{width:96px;height:96px;margin:0 auto}
.bl-gate{background:#fff;border:1px solid rgba(0,0,0,.06);border-radius:10px;padding:16px;display:flex;flex-direction:column;gap:8px;align-items:flex-start}
.bl-gate b{font-size:14px;font-weight:600}
.bl-gate span{font-size:13px;color:var(--muted);line-height:1.5}
.bl-grid{display:grid;grid-template-columns:1fr;gap:12px}
@media(min-width:620px){.bl-grid{grid-template-columns:1fr 1fr}}
.bl-field{display:flex;flex-direction:column;gap:6px}
.bl-field>span{font-size:12px;font-weight:500;color:var(--label)}
.bl-field>span i{font-style:normal;font-weight:400;color:var(--muted);margin-left:4px}
.bl-field input,.bl-field select,.bl-field textarea{font:inherit;font-size:13px;color:var(--navy);background:var(--fill);border:0;border-radius:8px;padding:9px 11px;outline:none;width:100%}
.bl-field textarea{resize:vertical;min-height:44px}
.bl-field input:focus,.bl-field select:focus,.bl-field textarea:focus{box-shadow:0 0 0 2px rgba(135,156,247,.35)}
.bl-tabs{display:inline-flex;gap:2px;padding:3px;background:var(--fill);border-radius:999px;align-self:flex-start}
.bl-tabs button{display:inline-flex;align-items:center;gap:6px;border:0;background:transparent;font:inherit;font-size:12px;font-weight:600;color:var(--label);padding:6px 12px;border-radius:999px;cursor:pointer}
.bl-tabs button[aria-selected="true"]{background:#fff;color:var(--navy);box-shadow:0 1px 3px rgba(0,19,100,.12)}
.bl-drop{border:1.5px dashed rgba(0,19,100,.18);border-radius:10px;background:#fff;padding:18px 14px;text-align:center;display:flex;flex-direction:column;gap:4px;align-items:center;cursor:pointer;color:var(--label)}
.bl-drop b{font-size:13px;font-weight:600;color:var(--navy)}
.bl-drop span{font-size:12px;color:var(--muted)}
.bl-error{font-size:12.5px;color:var(--fail)}
.bl-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.bl-actions.bl-center{justify-content:center}
.bl-meta{font-size:12px;color:var(--muted)}
.bl-btn{display:inline-flex;align-items:center;justify-content:center;gap:4px;height:32px;padding:6px 12px;border-radius:8px;font:inherit;font-size:13px;line-height:20px;font-weight:600;cursor:pointer;text-decoration:none;transition:background .15s ease-in-out;border:0}
.bl-btn.bl-primary{background:var(--peri);color:#fff}
.bl-btn.bl-primary:hover{background:var(--peri2)}
.bl-btn.bl-primary:active{background:var(--peri3)}
.bl-btn.bl-neutral{background:#fff;color:var(--navy);border:1px solid rgba(0,0,0,.1)}
.bl-btn.bl-neutral:hover{background:#F2F2F2}
.bl-proc{align-items:center;text-align:center;padding:32px 22px}
.bl-stage{font-size:13.5px;font-weight:600;color:var(--peri3)}
.bl-stage em{display:block;font-style:normal;font-weight:400;color:var(--muted);margin-top:6px;font-size:12.5px}
.bl-bar{width:100%;max-width:280px;height:6px;border-radius:99px;background:var(--fill);overflow:hidden;position:relative}
.bl-bar b{position:absolute;top:0;bottom:0;width:42%;border-radius:99px;background:var(--peri);animation:blSlide 1.9s cubic-bezier(.45,0,.55,1) infinite}
@keyframes blSlide{0%{left:-45%}100%{left:100%}}
.bl-scan{position:relative;width:150px;aspect-ratio:9/16;border-radius:12px;overflow:hidden;background:#d5dcf0}
.bl-scan video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.bl-scan i{position:absolute;left:0;right:0;top:0;height:24%;background:linear-gradient(180deg,rgba(135,156,247,0),rgba(135,156,247,.35) 55%,rgba(135,156,247,.6));border-bottom:2px solid rgba(135,156,247,.9);animation:blScan 3s ease-in-out infinite alternate}
@keyframes blScan{0%{transform:translateY(-100%)}100%{transform:translateY(416%)}}
.bl-tick{width:44px;height:44px;border-radius:50%;background:rgba(45,170,99,.12);color:var(--pass);display:grid;place-items:center}
.bl-tick.bl-fail{background:rgba(200,68,60,.10);color:var(--fail)}
@media (prefers-reduced-motion:reduce){.bl-bar b,.bl-scan i{animation:none}}
`;
