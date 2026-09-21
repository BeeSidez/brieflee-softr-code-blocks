// =====================================================================
// /new · Dashboard chat v2 (lee-chat) — implements "Dashboard Chat Upgrade.dc.html"
// =====================================================================
// Two stages: COMPOSE (notes-first prompt box with starter pills, attach
// menu, run-mode dropdown) then CHAT (user message, Lee confirm, grouped
// Review Agents picker, then the scan frame with real preview + polling).
//
// v3 (4 September 2026): the review runs INSIDE this block. Same screens,
// same beats, same clicks as v2; the only change is what happens after
// "Run agents": instead of creating a submission and polling for n8n, the
// engine below (the same code as /review) gets the video, Cloudinary,
// Gemini with the picked Review Agents and the workspace thresholds, then
// writes the review, the submission, the report rows, the notifications and
// the emails. The scan frame stays up until it finishes, then the ready
// card appears. The plan and credit check reads the user's row directly.
//
// Data model (create-on-submit, matches app/submit-single-video + the
// working create restructure):
//   • notes            → submission_notes
//   • link             → video_url        (TikTok / Instagram)
//   • file             → video_file        (uploaded via useUpload)
//   • run mode         → submission_type   (Review / Remix / Analyse)
//   • review agents    → qa_checklist      (label → option UUID)
//   • workspace        → accounts          (?workspace= or the user's account)
//   • user             → users
//
// The real submission is CREATED when the user runs the agents. A thin
// early record is created on Send ONLY to run the plan/credit check; it is
// left un-"proceed" so the 20-min cleanup removes it.
//
// SOFTR: Source tab → submissions; add the USERS table as a source so the
// workspace read resolves. Read the URL workspace param in a useState lazy
// initialiser only (analyzer requirement with useRecordCreate).
// =====================================================================

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRecordCreate, useRecord, useUpload, useProxyFetch, q, datasource } from '@/lib/datasource';
import { useTextSetting, useBooleanSetting } from '@/lib/editable-settings';

// Every hook names its source. The five Softr tables and the three services
// are connected on this block's Source tab; the ids below are their connection ids.
const ds = datasource.define({
  submissions:   '8f2aa89b-b08e-46c2-acbb-eb325cc99bfb',
  reviews:       '9d326bdc-e5c1-4b98-b250-90552c4d903f',
  report:        '5cfa9868-7213-4db6-aca1-a68edf5a2477',
  users:         'users',
  accounts:      'accounts',
  notifications: 'notifications',
  emailit:       'b9510e33-51ce-4bf6-aaf1-25a975a24cae',
  google:        '69e7708a-6d34-44df-bdd3-93f211f40694',
  rapid:         'd8b15bba-7a47-40be-bc4b-96891d745600',
});
import { useCurrentUser } from '@/lib/user';
import { toast } from 'sonner';

// ─── Field maps ──────────────────────────────────────────────────────

// Validation + polling lookups on the submission record.

// users.accounts — resolves the active workspace when ?workspace= is unset.
// Also carries the entitlement gate fields, read straight off the logged-in
// user record:
// — payment_status is the billing chain (users → billing.payment_status);
//   any linked billing row at paid or trial passes.
// — user_status must be Active or Pending (cancellation flips users to Inactive).
// — is_internal bypasses the gate for staff + test users.
const userAccountsSelect = q.select({
  accounts: 'Nz6VX',
  videos_remaining: '3kzMt',
  payment_status: 'VKE2w',
  org_status: 'SQuxf', // the workspace's plan status, shared by everyone on it
  user_status: 'kClk9',
  is_internal: 'gdFt4',
});


// platform_name choice UUIDs — drives the loading_code formula on the
// submissions table so the videos page shows the matching analysing card.

const LEE_AVATAR = 'https://res.cloudinary.com/dspv9nm1n/image/upload/v1771427670/obl2odsrkhunneswor46.png';
const AGENT_ICON = 'https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_review-eyes-glass-3d-clearer-periwinkle-transparent_2026-07.png';

// Agent groups — label, description, and the submissions qa_checklist UUID.
const AGENT_GROUPS = [
  {
    key: 'compliance', title: 'Compliance & safety',
    icon: 'https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_padlock-sticker-blue-transparent_2026-05.png', agents: [
      { id: '82baef6f-fd83-4eac-a159-1298fd71eb07', label: 'Copyright check', desc: 'Flags music, fonts, or clips that could break copyright.' },
      { id: '5410f4ee-20f3-4356-8180-f73b1ae859df', label: 'Safe zones', desc: 'Keeps key content inside platform safe zones.' },
    ]
  },
  {
    key: 'hook', title: 'Hook & attention',
    icon: 'https://res.cloudinary.com/dchroynzv/image/upload/brieflee_help-icon_troubleshoot-lightning-bolt-sticker-blue-transparent_2026-05.png', agents: [
      { id: 'f8968115-bdab-4360-afe5-fc4d53b26df3', label: 'Hook quality', desc: 'First 3 seconds grab attention without feeling like an ad.' },
      { id: '94e77b01-88ec-4f9f-b6fb-7ca5b5be7b13', label: 'Visual hook', desc: 'A visual moment strong enough to stop the scroll.' },
      { id: '8c96bc97-ebde-44f3-b4ee-65640e6ba8f6', label: 'Scene pacing', desc: 'Scenes change often enough to hold attention.' },
      { id: '719b3047-73f8-4958-8080-05485b6859bd', label: 'CTA present', desc: "There's a clear ask to the viewer." },
      { id: '15dfd7e3-226d-4ac3-bd2e-4383857ee08c', label: 'Watchable on mute', desc: 'Still makes sense with the sound off.' },
    ]
  },
  {
    key: 'brand', title: 'Brand & brief',
    icon: 'https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_simple-lined-clipboard-with-pen-transparent_2026-05.png', agents: [
      { id: '5e36d433-92b5-4ad7-9447-abcaa5401991', label: 'Follows the brief', desc: 'Matches what the brief asked for.' },
      { id: 'a1d164a9-3972-45bb-a444-34bba3757621', label: 'Brand name mentioned', desc: 'Brand name is said the agreed number of times.' },
      { id: '873be85d-9d67-4286-b7d7-49dc35c45baa', label: 'Brand alignment', desc: "Matches the brand's voice, look, and feel." },
      { id: '40946cb6-2638-4c13-9aa2-3f66d1ab8d15', label: 'Product visibility', desc: 'Product shows clearly enough across the video.' },
      { id: '3f1ff82b-1fae-4ec8-b727-8ab4337d3d22', label: 'Product usage', desc: 'Product is shown being used the right way.' },
      { id: '58615cda-8673-4d3d-a3ce-7ef871e81991', label: 'Creator visibility', desc: 'Creator is on camera enough for the format.' },
      { id: 'a135797b-d452-4f83-9b39-9a40481f1411', label: 'Inspiration link match', desc: 'Matches the inspiration examples in the brief.' },
    ]
  },
  {
    key: 'production', title: 'Production quality',
    icon: 'https://res.cloudinary.com/dchroynzv/image/upload/brieflee_help-icon_videos-camcorder-camera-icon-blue-transparent_2026-05.png', agents: [
      { id: '8b51a26d-6b1c-4b37-8939-b7339eb7f595', label: 'Lighting & camera', desc: 'Bright enough, steady, and in focus.' },
      { id: 'fe7f6d81-eda9-4c23-8650-43c9351b7334', label: 'Setting & background', desc: 'Background is tidy and on-brand.' },
      { id: 'dcb604cb-132e-4928-bab7-1a5dbfd61258', label: 'Audio clarity', desc: 'Audio is clean, no noise, echo, or hum.' },
      { id: '664e176a-ac4b-469a-b3fb-efa0abd5409c', label: 'Audio delivery', desc: 'Spoken script is clear, natural, on-brand.' },
      { id: '314d167a-7456-425b-aa9e-0cab135f06be', label: 'Music & sound balance', desc: "Music doesn't drown out the voice." },
      { id: 'eac26e3c-8601-4c2a-a038-39b694084caf', label: 'Pronunciation', desc: 'Brand and product names are said right.' },
      { id: 'c7b897ff-b5f8-4d4f-aaa4-07849c4c0fa6', label: 'Text legibility', desc: 'On-screen text is big enough to read.' },
      { id: 'c1d3605d-e91c-4509-aad0-b337ff3ed898', label: 'Closed captions', desc: 'Captions are accurate and easy to follow.' },
      { id: '641e6d1f-a3cd-451c-bbb8-c8e44c6aaf51', label: 'Distracting elements', desc: 'Nothing pulls attention from the product.' },
      { id: '8ab22af0-53f5-45a1-856e-1dcbbb048e19', label: 'Energy & authenticity', desc: 'Feels real and engaging, not scripted.' },
      { id: 'e9320bd8-73ac-4e89-95a6-70a87a40b3e0', label: 'Wardrobe & appearance', desc: 'Outfit fits the brand and looks intentional.' },
    ]
  },
  {
    key: 'other', title: 'Other checks',
    icon: 'https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_blue-multiple-stars-transparent_2026-05.png', agents: [
      { id: 'ea740500-ef29-4246-aa61-1e1264cce230', label: 'Video length', desc: 'Runs the right length for the format.' },
    ]
  },
];

const PILLS = [
  { chip: "Something's off", mode: 'review', prompt: "Not sure about this one, something feels off and I can't place it. Want your read before I reply to the creator." },
  { chip: 'Gut-check this', mode: 'review', prompt: 'I think this is strong, but I want a second pair of eyes before it goes live.' },
  { chip: 'Creator loves it', mode: 'review', prompt: "The creator's convinced this is their best cut. Is it as good as they think, or are they too close to it?" },
  { chip: 'Tell me straight', mode: 'review', prompt: "I keep going back and forth on this one. Just tell me straight if it's good enough." },
  { chip: 'Want this energy', mode: 'remix', prompt: 'Love how this brand nailed the pacing, I want this same energy for my audience.' },
  { chip: 'Steal this hook', mode: 'remix', prompt: 'This hook stopped me dead, I want my own version of it for my product.' },
  { chip: 'Make it mine', mode: 'remix', prompt: "This is exactly the vibe I've been trying to explain to my creators. Help me make it mine." },
  { chip: "Why'd this blow up?", mode: 'analyse', prompt: 'This blew up for a tiny brand and I want to understand why before I borrow it.' },
  { chip: 'What makes it work?', mode: 'analyse', prompt: "Everyone's copying this format. I want to know what actually makes it work." },
  { chip: "Shouldn't work, but does", mode: 'analyse', prompt: "This shouldn't work but it clearly does. What am I missing?" },
];

const MODE_OPTIONS = [
  { value: 'review', label: 'Review', confirm: "Perfect. I'll review this against your brief and quality standards." },
  { value: 'remix', label: 'Remix', confirm: "Love it. I'll break down what works and remix it for your brand." },
  { value: 'analyse', label: 'Analyse', confirm: "On it. I'll analyse the hook, pacing, and what's driving this." },
];

const STATUS_LINES = [
  'Analysing your video', 'Checking the hook', 'Looking at pacing',
  'Checking audio quality', 'Scanning for the product', 'Reading on-screen text',
  'Checking brand alignment', 'Almost done',
];

const FALLBACK_ICON = {
  upload: ['https://res.cloudinary.com/dchroynzv/image/upload/v1778145999/brieflee_icon_upload-cloud-engraving-transparent_2026-05.png', 'Analysing your upload'],
  tiktok: ['https://res.cloudinary.com/dchroynzv/image/upload/v1777622929/brieflee_engraving_tiktok-logo-3d-musical-note-icon-grey-engraved_2026-03.png', 'Analysing your TikTok'],
  instagram: ['https://res.cloudinary.com/dchroynzv/image/upload/v1777622956/brieflee_engraving_instagram-logo-camera-icon-3d-grey-bg-third-party-mark_2026-03.png', 'Analysing your Instagram video'],
};

// =====================================================================
// The engine (verbatim from app/video-analysis/engine.jsx, PAGE review):
// field maps, option ids, Review Agents, prompts, Cloudinary, Gemini,
// writes, notifications, EmailIt. Only what this block uses survives.
// =====================================================================
// ─── Page ──────────────────────────────────────────────────────
// The only line that changes between blocks.
const PAGE = "review";
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
const userSelect = q.select({
  id:              "6stLd",
  fullName:        "Pk6Tx",
  status:          "kClk9",
  videosRemaining: "3kzMt",
  accounts:        "Nz6VX",
  briefs:          "3Ww0J",
  firstName:       "0lVyD",
  email:           "PBrIP",
});
// The brand owner's row on the creator routes, read only when the brief
// and parent lookups carry no status. Nothing personal is selected.

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
  maxVideosOrg:    "faEMR", // LOOKUP usage → max_videos, plan plus add-ons
  cycleEndOrg:     "aFWYm", // LOOKUP usage → cycle_end
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
function isDirectVideoUrl(input) { return /^https?:\/\/\S+\.(mp4|mov|m4v|webm)(\?\S*)?$/i.test((input || "").trim()); }
// A pasted link has to be a video on one of the four platforms: a TikTok,
// an Instagram Reel, a Facebook Reel or a YouTube Short. Profiles, feeds
// and long-form YouTube links are turned away.
const VIDEO_LINKS = [
  /^https?:\/\/(www\.|m\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/i,
  /^https?:\/\/(www\.|m\.)?tiktok\.com\/(t|v)\/[\w-]+/i,
  /^https?:\/\/vm\.tiktok\.com\/[\w-]+/i,
  /^https?:\/\/(www\.)?instagram\.com\/(reel|reels)\/[\w-]+/i,
  /^https?:\/\/(www\.|m\.|web\.)?facebook\.com\/(reel\/\d+|share\/r\/[\w-]+)/i,
  /^https?:\/\/fb\.watch\/[\w-]+/i,
  /^https?:\/\/(www\.|m\.)?youtube\.com\/shorts\/[\w-]+/i,
];
const LINK_HINT = "Paste a TikTok, Instagram Reel, Facebook Reel or YouTube Short link.";
function isValidVideoUrl(input) { const u = (input || "").trim(); return VIDEO_LINKS.some((re) => re.test(u)); }
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
function buildChecks(account, brief, extra) {
  const picked = new Set([...unwrapAll(account?.qaChecklist), ...unwrapAll(brief?.qaChecklist), ...(extra || [])].map((s) => s.toLowerCase()));
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
    "video_title": "[Maximum 3 words describing the video content]",
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
    "video_title": "[Maximum 3 words describing the video content]",
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
function UserLoader({ recordId, onState }) {
  const { data, status } = useRecord({ recordId, select: userSelect, from: ds.users });
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
function cleanName(s) { return String(s || "").replace(/<[^>]*>/g, " ").replace(/https?:\/\/\S+/gi, " ").replace(/[^\p{L}\p{N} .,'&-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 60); }
// The Review Agents step: every kind (Review, Analyse, Remix) shows it, pre-ticked
// with the workspace's saved agents, and the AI needs at least three to check.


// ─── Helpers ─────────────────────────────────────────────────────────
function num(raw) {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function hasNum(raw) { const v = Array.isArray(raw) ? raw[0] : raw; return v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v)); }
// Share of the plan used this cycle. Any use at all reads as at least 1%.
function usagePercent(left, max) {
  const l = Math.max(0, Number(left) || 0);
  if (!(max > 0)) return l > 0 ? 0 : 100;
  const used = Math.max(0, max - l);
  return used === 0 ? 0 : Math.min(100, Math.max(1, Math.round((used / max) * 100)));
}
function extractFieldValue(raw) {
  if (Array.isArray(raw) && raw.length > 0) return String(raw[0].label ?? raw[0] ?? '').trim().toLowerCase();
  if (typeof raw === 'object' && raw !== null) return String(raw.label ?? '').trim().toLowerCase();
  return String(raw ?? '').trim().toLowerCase();
}
function extractNumberValue(raw) {
  const v = Array.isArray(raw) ? Number(raw[0] ?? 0) : Number(raw ?? 0);
  return Number.isFinite(v) ? v : 0;
}
// Multi-row aware: returns ALL values of a lookup field, lowercased.
function extractFieldValues(raw) {
  if (Array.isArray(raw)) {
    return raw.map((v) => String(v?.label ?? v ?? '').trim().toLowerCase()).filter(Boolean);
  }
  const one = extractFieldValue(raw);
  return one ? [one] : [];
}

// =====================================================================
export default function Block() {
  const user = useCurrentUser();
  // Top space above the welcome on the compose screen, editable from
  // Content > Settings. With centring on, it scales with the viewport so the
  // hero sits mid-screen; switch it off to use the pixel value typed below.
  // Phones always get a small fixed space (.bc-shell.is-home in Style).
  const heroAutoCentre = useBooleanSetting({
    name: 'heroAutoCentre',
    label: 'Centre the welcome on screen',
    initialValue: true,
  });
  const heroTopSpace = useTextSetting({
    name: 'heroTopSpace',
    label: 'Top space in px (used when centring is off)',
    initialValue: '200',
  });
  const typedTop = parseInt(String(heroTopSpace ?? '').replace(/[^0-9]/g, ''), 10);
  const heroTop = heroAutoCentre
    ? 'clamp(24px, calc(50vh - 285px), 280px)'
    : `${Number.isFinite(typedTop) ? Math.min(typedTop, 600) : 200}px`;
  const { uploadAsync } = useUpload();
  // The engine's writes and services (see the engine section below).
  const createSubmission = useRecordCreate({ fields: submissionCreate, from: ds.submissions });
  const createReview = useRecordCreate({ fields: reviewCreate, from: ds.reviews });
  const createReport = useRecordCreate({ fields: reportCreate, from: ds.report });
  const createNotification = useRecordCreate({ fields: notificationCreate, from: ds.notifications });
  const proxyRapid = useProxyFetch(ds.rapid);
  const proxyGoogle = useProxyFetch(ds.google);
  const proxyEmailit = useProxyFetch(ds.emailit);
  const [afState, setAfState] = useState({ status: 'none', f: null });
  const af = afState.f;
  const [meState, setMeState] = useState({ status: 'none', f: null });
  const mf = meState.f || {};
  const runRef = useRef(0);

  // Workspace param — read ONCE in a useState lazy init (analyzer-safe with
  // useRecordCreate). See feedback_softr_vibe_no_url_parsing.
  const [urlWorkspaceId] = useState(() => {
    if (typeof window === 'undefined') return '';
    const raw = new URL(window.location.href).searchParams.get('workspace') || '';
    return raw.split(',').map((s) => s.trim()).filter(Boolean)[0] || '';
  });
  // Remembered workspace (written by the single-select switcher) — survives a
  // fresh visit even when the URL has no ?workspace=.
  const [storedWorkspaceId] = useState(() => {
    try { return localStorage.getItem('bl-active-workspace') || ''; } catch { return ''; }
  });
  const userAccountsRead = useRecord({ recordId: user?.id, select: userAccountsSelect, enabled: !!user?.id, from: ds.users });
  const userAccountIds = useMemo(() => {
    const raw = userAccountsRead?.data?.fields?.accounts;
    return Array.isArray(raw) ? raw.map((a) => a?.id || '').filter(Boolean) : [];
  }, [userAccountsRead?.data]);
  const activeWorkspaceId = useMemo(() => {
    if (urlWorkspaceId && userAccountIds.includes(urlWorkspaceId)) return urlWorkspaceId;
    if (storedWorkspaceId && userAccountIds.includes(storedWorkspaceId)) return storedWorkspaceId;
    return userAccountIds[0] || null;
  }, [urlWorkspaceId, storedWorkspaceId, userAccountIds]);

  // ─── Compose state ───
  const [stage, setStage] = useState('compose'); // 'compose' | 'chat'
  const [notes, setNotes] = useState('');
  const [attachType, setAttachType] = useState(null); // 'link' | 'file' | null
  const [link, setLink] = useState('');
  const [file, setFile] = useState(null);            // real File object
  const [fileName, setFileName] = useState('');
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState('review');
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const [hoverPill, setHoverPill] = useState(null);

  // ─── Chat state ───
  const [typing, setTyping] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCredits, setShowCredits] = useState(false); // the credit ring's panel
  const [showAgentsQ, setShowAgentsQ] = useState(false);
  const [showAgents, setShowAgents] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState(['Hook quality', 'Visual hook', 'Product visibility', 'Follows the brief']);
  const [openGroup, setOpenGroup] = useState('hook');
  const [showAnalyseMsg, setShowAnalyseMsg] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [scanIdx, setScanIdx] = useState(0);
  const [reviewReady, setReviewReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [notifMsg, setNotifMsg] = useState('');

  // ─── Submission / validation state ───
  const [validated, setValidated] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const chatRef = useRef(null);
  const pillsRef = useRef(null);
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);
  const timers = useRef([]);
  const scanIntRef = useRef(null);
  const t = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); return id; };
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  useEffect(() => () => {
    clearTimers();
    if (scanIntRef.current) clearInterval(scanIntRef.current);
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  // Auto-scroll the chat to newest.
  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [showConfirm, showAgentsQ, showAgents, showAnalyseMsg, showScan, reviewReady, timedOut, typing, validationError, selectedAgents, openGroup]);

  const firstName =
    (user && (user.firstName || user.first_name || user.fullName?.split(' ')[0] || user.name?.split(' ')[0])) || '';

  const hasAttach = attachType === 'file' || (attachType === 'link' && link.trim().length > 0);

  // ─── Plan and credit check, straight off the logged-in user's row ───
  useEffect(() => {
    if (stage !== 'chat' || validated || validationError) return;
    const gate = userAccountsRead?.data?.fields;
    if (!gate) return; // still loading; the beats below keep playing
    const isInternal = gate.is_internal === true;
    if (!isInternal) {
      // Billing is the source of truth: any linked billing row at paid or
      // trial passes, and the user record itself must be Active or Pending.
      // A team member's login carries no billing of its own, so the
      // workspace's plan status and videos left count for everyone on it.
      if (activeWorkspaceId && afState.status !== 'success' && afState.status !== 'error') return;
      const paymentStatuses = [...extractFieldValues(gate.payment_status), ...extractFieldValues(gate.org_status)];
      const userStatus = extractFieldValue(gate.user_status);
      const videosRemaining = hasNum(af?.videosRemaining) ? num(af.videosRemaining) : extractNumberValue(gate.videos_remaining);
      if (
        !paymentStatuses.some((x) => ['paid', 'trial'].includes(x)) ||
        !['active', 'pending'].includes(userStatus)
      ) {
        setValidationError('There is no active subscription on this account. Please upgrade to continue.');
        setTyping(false);
        return;
      }
      if (videosRemaining <= 0) {
        setValidationError('You have used all your video credits for this billing cycle. Upgrade or wait until your next renewal.');
        setTyping(false);
        return;
      }
    }
    setValidated(true);
  }, [stage, userAccountsRead?.data, validated, validationError, activeWorkspaceId, afState.status, af]);

  // ─── Compose handlers ───
  const pickPill = (p) => { setNotes(p.prompt); setSelectedMode(p.mode); };
  const scrollPills = (dir) => { const el = pillsRef.current; if (el) el.scrollBy({ left: dir * 220, behavior: 'smooth' }); };
  const chooseLink = () => { setAttachType('link'); setAttachMenuOpen(false); };
  const chooseFileClick = () => { setAttachMenuOpen(false); fileInputRef.current?.click(); };
  const onFilePicked = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('video/')) { toast.error('Please choose a video file.'); return; }
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = URL.createObjectURL(f);
    setFile(f); setFileName(f.name); setAttachType('file');
  };
  const clearAttach = () => {
    if (previewUrlRef.current) { URL.revokeObjectURL(previewUrlRef.current); previewUrlRef.current = null; }
    setAttachType(null); setLink(''); setFile(null); setFileName('');
  };

  // ─── Send: transition to chat; the plan/credit check runs in the effect above ───
  const send = () => {
    if (!hasAttach && !notes.trim()) return;
    if (!user?.id) { toast.error('Please log in to continue.'); return; }
    if (attachType === 'link' && !isValidVideoUrl(link.trim())) { toast.error(LINK_HINT); return; }
    setStage('chat');
    setAttachMenuOpen(false); setModeMenuOpen(false);
    setTyping(true);

    // Conversation beats (Lee confirm → agents question → picker).
    t(() => { setTyping(false); setShowConfirm(true); }, 1300);
    t(() => setTyping(true), 1650);
    t(() => { setTyping(false); setShowAgentsQ(true); }, 2600);
    t(() => setShowAgents(true), 2850);
  };

  const toggleGroup = (key) => setOpenGroup((cur) => (cur === key ? null : key));
  const toggleAgent = (label) =>
    setSelectedAgents((cur) => (cur.includes(label) ? cur.filter((x) => x !== label) : [...cur, label]));

  // ─── The engine's view of this chat ───
  // The pipeline below is the same code as /review. These locals give it
  // the chat's state under the names it expects: one video, one workspace,
  // no brief, no creator details, no revision.
  const workspaceId = activeWorkspaceId || '';
  const kind = selectedMode;            // review | remix | analyse
  const agents = selectedAgents;        // the picked Review Agents (labels)
  const brief = null; const briefId = ''; const parent = null; const parentId = ''; const parentReviewId = '';
  const previous = null; const revisionNo = 0; const context = 'workspace'; const isCreator = false; const multi = false;
  const pdf = null; const creatorName = ''; const creatorEmail = ''; const urlName = '';
  const workspaceName = unwrap(af?.name) || '';
  const aiModeLabel = unwrap(af?.aiMode) || 'Hybrid';
  const brandUserId = user?.id || '';
  const brandEmail = user?.email || unwrap(mf.email) || '';
  const brandFirstName = user?.firstName || unwrap(mf.firstName) || 'there';
  // The credit ring (same as the New video panel) fills as the workspace's
  // videos get used: blue, then amber from 75%, red from 90%.
  const creditsLeft = hasNum(af?.videosRemaining) ? num(af.videosRemaining) : num(mf.videosRemaining);
  const maxVideos = num(af?.maxVideosOrg) || num(af?.maxVideos) || 0;
  const usedPct = usagePercent(creditsLeft, maxVideos);
  const ringPct = usedPct / 100;
  const usageTone = usedPct >= 90 ? "low" : usedPct >= 75 ? "warn" : "ok";
  const planName = unwrap(af?.plan) || '';
  const cycleEnd = String(unwrap(af?.cycleEndOrg) || unwrap(af?.cycleEnd) || '').slice(0, 10);

  // ── Gemini video part (inline base64, sized for the proxy) ───
  // The proxy carries text only and caps bodies near 4MB, so the video
  // always travels inline and always below INLINE_MAX. Longer videos
  // come through the Cloudinary rungs; if none fits, say so plainly.
  async function makeVideoPart(blob, mime) {
    if (!blob || blob.size > INLINE_MAX) throw new Error("This video is too long to review here. Trim it to under 3 minutes, or upload a smaller file, and try again.");
    return { inline_data: { mime_type: mime, data: await blobToBase64(blob) } };
  }

  // ── The pipeline, one video at a time ────────────────────────
  async function runPipeline(item, myRun, ui) {
    const alive = () => runRef.current === myRun;
    const isFile = item.kind === "file";
    const theFile = isFile ? item.file : null;
    const srcUrl = isFile ? "" : item.url;
    const isYouTube = !isFile && /youtube\.com|youtu\.be/i.test(srcUrl);
    const ytId = isYouTube ? ytVideoId(srcUrl) : "";
    const acct = af || (brief ? { brandBio: brief.brandBio } : null);

    // 1. Source the mp4
    let mp4 = ""; let handle = ""; let duration = 0; let uploaded = null; let pdfUploaded = null;
    if (isFile) {
      const [up] = await uploadAsync(theFile);
      if (!up || up.status !== "completed" || !up.url) throw new Error("The video upload didn't complete. Try again.");
      uploaded = { filename: up.file?.name || theFile.name || "video.mp4", url: up.url };
      try { ui.preview(URL.createObjectURL(theFile)); } catch { /* no preview */ }
      if (STEPPER && pdf) {
        const [pu] = await uploadAsync(pdf);
        if (pu && pu.status === "completed" && pu.url) pdfUploaded = { filename: pu.file?.name || pdf.name || "brief.pdf", url: pu.url };
      }
    } else if (isDirectVideoUrl(srcUrl)) {
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
        form.append("file", isFile ? theFile : mp4);
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
    const videoTitle = (STEPPER && urlName) || stripEmDash(ov.video_title || "").slice(0, 80) || (theFile?.name || handle || "Video");
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
      creatorName: cleanName(creatorName) || (isCreator ? cleanName(unwrap(parent?.creatorName)) : (STEPPER ? cleanName(unwrap(mf.fullName)) : "")),
      creatorEmail: isCreator ? (creatorEmail.trim() || unwrap(parent?.creatorEmail) || "") : creatorEmail.trim(),
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
      originalReviewId: context === "submission" ? (unwrap(parent?.originalReviewId) || parentReviewId) : "",
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
    if (creatorEmailFinal) await notify(OPT.notif.received, "Submission received", `${what} was submitted${brief ? ` for ${unwrap(brief.name)}` : ""}.`);
    await notify(OPT.notif.completed, "Review completed", `${what}: ${decision.toLowerCase()} by the Review Agents${failed.length ? ` (${failed.length} flagged)` : ""}.`);
    const decisionType = decision === "APPROVED" ? OPT.notif.approved : decision === "REJECTED" ? OPT.notif.rejected : OPT.notif.flagged;
    const decisionTitle = decision === "APPROVED" ? "Content approved" : decision === "REJECTED" ? "Content rejected" : "Flagged for review";
    await notify(decisionType, decisionTitle, stripEmDash(ov.decision_reasoning || "").slice(0, 500));

    // 7. EmailIt by alias, idempotent per submission + event
    const reviewUrl = `${APP_ORIGIN}${DETAILS_PATH}?recordId=${encodeURIComponent(subId)}`;
    const submissionUrl = `${APP_ORIGIN}${LIVE_PATH}?recordId=${encodeURIComponent(subId)}`;
    const vars = {
      account_name: workspaceName,
      brief_name: unwrap(brief?.name) || "the brief",
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

  // ─── Run agents: the Review Agents run here, then the ready card ───
  const startAnalyse = async () => {
    if (selectedAgents.length < 3 || submitting) return;
    if (validationError) return;
    if (!workspaceId || !af) { toast.error('Your workspace is still loading', { description: 'Try again in a moment.' }); return; }
    if (!createSubmission.enabled || !createReview.enabled) { toast.error("We can't start the review right now", { description: 'Refresh and try again.' }); return; }
    const item = attachType === 'file' && file
      ? { kind: 'file', file, label: file.name }
      : { kind: 'url', url: link.trim(), label: link.trim() };
    if (item.kind === 'url' && !isValidVideoUrl(item.url)) { toast.error(LINK_HINT); return; }
    setSubmitting(true);
    setShowAgents(false);
    setTyping(true);
    const myRun = ++runRef.current;
    const stopScan = () => { if (scanIntRef.current) { clearInterval(scanIntRef.current); scanIntRef.current = null; } };

    // Analysing message → scan frame (same beats as before); the run is
    // already under way behind them.
    t(() => { setTyping(false); setShowAnalyseMsg(true); }, 1000);
    t(() => {
      setShowScan(true);
      setScanIdx(0);
      scanIntRef.current = setInterval(() => setScanIdx((i) => i + 1), 1300);
    }, 1400);
    // A long run shows the "still processing" card; the ready card replaces it.
    const slow = t(() => { if (runRef.current === myRun) setTimedOut(true); }, 240000);

    try {
      const r = await runPipeline(item, myRun, { stage: () => {}, preview: () => {} });
      if (runRef.current !== myRun || !r) return;
      clearTimeout(slow);
      stopScan();
      setTimedOut(false);
      setNotifMsg(`${r.title}: ${r.decision.toLowerCase()} by the Review Agents${r.failed.length ? ` (${r.failed.length} flagged)` : ''}.`);
      setReviewReady(true);
    } catch (e) {
      if (runRef.current !== myRun) return;
      clearTimeout(slow);
      console.error('Analyse failed:', e);
      toast.error('Something went wrong', { description: e?.message || 'Try again.' });
      stopScan();
      setShowScan(false); setShowAnalyseMsg(false); setTimedOut(false);
      setTyping(false);
      setShowAgents(true);
      setSubmitting(false);
    }
  };

  // ─── Derived render values ───
  const modeObj = MODE_OPTIONS.find((m) => m.value === selectedMode) || MODE_OPTIONS[0];
  const count = selectedAgents.length;
  const canAnalyse = count >= 3;
  const scanning = showScan && !reviewReady && !timedOut;
  const linkLower = (link || '').toLowerCase();
  const fkSource = attachType === 'file' ? 'upload' : (linkLower.includes('tiktok') ? 'tiktok' : 'instagram');
  // Real preview only for local files; links fall back to the branded icon
  // until a server-side thumbnail is wired (TikTok/Instagram can't be
  // previewed client-side reliably).
  const showPreviewMedia = scanning && attachType === 'file';
  const showFallbackMedia = scanning && attachType !== 'file';
  const attachLabel = attachType === 'link' ? (link.trim() || 'Video link') : (fileName || 'Video');

  return (
    <>
      {user?.id ? <UserLoader recordId={user.id} onState={setMeState} /> : null}
      {workspaceId ? <AccountLoader key={workspaceId} recordId={workspaceId} onState={setAfState} /> : null}
      {(
    // Height follows the content. This used to be minHeight 100vh, which
    // left a viewport of empty space under the chat and pushed the quick
    // links below the fold. Page background is already #FAFBFF, so the
    // block ending here leaves no seam. On the compose screen the top
    // padding is heroTop (the two hero settings), so the hero, the prompt
    // box and the quick links below sit in the middle of the screen with
    // Recent submissions peeking under them. The chat stage drops back to
    // 24px so the 66vh chat window keeps its room.
    <div className={stage === 'compose' ? 'bc-shell is-home' : 'bc-shell'} style={{ paddingTop: stage === 'compose' ? heroTop : 24, paddingLeft: 20, paddingRight: 20, paddingBottom: 20, background: '#FAFBFF', fontFamily: "'Inter', system-ui, sans-serif", color: '#001364' }}>
      <Style />
      <input ref={fileInputRef} type="file" accept="video/*" onChange={onFilePicked} style={{ display: 'none' }} />

      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* Hero */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '8px 0 24px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 11, background: '#EEF1FE' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#879CF7"><path d="M12 2c.4 3.9 1.7 6.1 4 7.1 1.4.6 3 .9 6 .9-3 0-4.6.3-6 .9-2.3 1-3.6 3.2-4 7.1-.4-3.9-1.7-6.1-4-7.1-1.4-.6-3-.9-6-.9 3 0 4.6-.3 6-.9 2.3-1 3.6-3.2 4-7.1Z" /></svg>
          </span>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: '#001364' }}>
            Welcome back{firstName ? `, ${firstName}` : ''}
          </h1>
        </div>

        {/* ============ COMPOSE ============ */}
        {stage === 'compose' && (
          <div className="bc-enter">
            {/* Pills */}
            <div style={{ position: 'relative', marginBottom: 14 }}>
              {hoverPill != null && (
                <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 6, pointerEvents: 'none' }}>
                  <div style={{ maxWidth: 480, padding: '8px 12px', borderRadius: 10, background: '#001364', color: '#fff', fontSize: 12, lineHeight: 1.45, boxShadow: '0 10px 26px -12px rgba(16,24,64,0.55)' }}>{PILLS[hoverPill].prompt}</div>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button className="bc-round" onClick={() => scrollPills(-1)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg></button>
                <div ref={pillsRef} className="bc-noscroll" style={{ flex: '1 1 auto', display: 'flex', gap: 8, overflowX: 'auto', scrollBehavior: 'smooth', padding: '2px 0' }}>
                  {PILLS.map((p, i) => (
                    <button key={i} className="bc-pill" onClick={() => pickPill(p)} onMouseEnter={() => setHoverPill(i)} onMouseLeave={() => setHoverPill(null)}>{p.chip}</button>
                  ))}
                </div>
                <button className="bc-round" onClick={() => scrollPills(1)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg></button>
              </div>
            </div>

            {/* Input card */}
            <div style={{ borderRadius: 14, background: '#FFFFFF', border: '1px solid #D8DEF0', boxShadow: '0 1px 2px rgba(16,24,64,0.04), 0 6px 18px -12px rgba(16,24,64,0.14)', padding: '16px 16px 12px' }}>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Tell me about this video, or what you want done with it…" rows={3}
                style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 400, lineHeight: 1.5, color: '#001364', background: 'transparent' }} />

              {attachType === 'link' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0', padding: '9px 12px', borderRadius: 10, background: '#FAFBFF', border: '1px solid #E6EAF5' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#879CF7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                  <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Paste a TikTok or Instagram link" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 400, color: '#001364' }} />
                </div>
              )}

              {attachType === 'file' && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, margin: '4px 0', padding: '6px 10px 6px 7px', borderRadius: 9, background: '#F5F7FF', border: '1px solid #E6EAF5' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 6, background: '#EEF1FE', color: '#879CF7' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" /></svg></span>
                  <span style={{ fontSize: 12.5, fontWeight: 500, color: '#001364' }}>{fileName}</span>
                  <button onClick={clearAttach} style={{ display: 'inline-flex', border: 'none', background: 'transparent', cursor: 'pointer', color: '#97A0BA', padding: 2 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg></button>
                </div>
              )}

              {/* Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 8 }}>
                <div style={{ position: 'relative' }}>
                  <button className="bc-tool" onClick={() => { setAttachMenuOpen((o) => !o); setModeMenuOpen(false); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#879CF7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                    Add a video
                  </button>
                  {attachMenuOpen && (
                    <div className="bc-enter" style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, zIndex: 20, width: 206, padding: 5, borderRadius: 11, background: '#fff', border: '1px solid #E6EAF5', boxShadow: '0 12px 32px -14px rgba(16,24,64,0.28)' }}>
                      <button className="bc-menu-item" onClick={chooseLink}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#879CF7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                        Paste a link
                      </button>
                      <button className="bc-menu-item" onClick={chooseFileClick}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#879CF7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                        Upload a file
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="bc-ringwrap">
                    <button type="button" className="bc-ring" onClick={() => { setShowCredits((v) => !v); setModeMenuOpen(false); setAttachMenuOpen(false); }} title={`${usedPct}% used · ${creditsLeft} video${creditsLeft === 1 ? '' : 's'} left this cycle`} aria-label="Videos used this cycle" aria-expanded={showCredits}>
                      <svg viewBox="0 0 36 36" width="18" height="18" aria-hidden="true"><circle cx="18" cy="18" r="15" className="bc-ring-track" /><circle cx="18" cy="18" r="15" className={`bc-ring-bar is-${usageTone}`} style={{ strokeDasharray: `${(ringPct * 94.2).toFixed(1)} 94.2`, opacity: usedPct > 0 ? 1 : 0 }} /></svg>
                    </button>
                    {showCredits && (
                      <div className="bc-pop bc-enter" role="dialog" aria-label="Videos this cycle">
                        <div className="bc-pop-row"><span>Videos this cycle</span><b>{usedPct}% used</b></div>
                        <div className="bc-pop-bar"><i className={`is-${usageTone}`} style={{ width: `${usedPct}%` }} /></div>
                        <div className="bc-pop-row"><span>Videos left</span><b>{creditsLeft}{maxVideos ? ` of ${maxVideos}` : ''}</b></div>
                        {planName ? <div className="bc-pop-row"><span>Plan</span><b>{planName}</b></div> : null}
                        <div className="bc-pop-row"><span>Review mode</span><b>{aiModeLabel}</b></div>
                        {cycleEnd ? <div className="bc-pop-row"><span>Resets</span><b>{cycleEnd}</b></div> : null}
                        <a className="bc-pop-link" href="/settings#tab2">See your plan</a>
                      </div>
                    )}
                  </span>
                  <div style={{ position: 'relative' }}>
                    <button className="bc-mode" onClick={() => { setModeMenuOpen((o) => !o); setAttachMenuOpen(false); setShowCredits(false); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#879CF7" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="16" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="12" y2="18" /><circle cx="19" cy="6" r="2" fill="#879CF7" stroke="none" /></svg>
                      {modeObj.label}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#97A0BA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s', transform: `rotate(${modeMenuOpen ? 180 : 0}deg)` }}><polyline points="18 15 12 9 6 15" /></svg>
                    </button>
                    {modeMenuOpen && (
                      <div className="bc-enter" style={{ position: 'absolute', bottom: 'calc(100% + 8px)', right: 0, zIndex: 20, width: 176, padding: 5, borderRadius: 11, background: '#fff', border: '1px solid #E6EAF5', boxShadow: '0 12px 32px -14px rgba(16,24,64,0.28)' }}>
                        <div style={{ padding: '6px 10px 4px', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#97A0BA' }}>Run mode</div>
                        {MODE_OPTIONS.map((m) => (
                          <button key={m.value} className="bc-menu-item" onClick={() => { setSelectedMode(m.value); setModeMenuOpen(false); }} style={{ justifyContent: 'space-between' }}>
                            {m.label}
                            {selectedMode === m.value && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#879CF7" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button onClick={send} disabled={!hasAttach}
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, border: 'none', borderRadius: 10, transition: 'all 0.15s', background: hasAttach ? '#879CF7' : '#EDEFF6', color: hasAttach ? '#fff' : '#AEB6CE', cursor: hasAttach ? 'pointer' : 'not-allowed' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 14 0" /><path d="m13 6 6 6-6 6" /></svg>
                  </button>
                </div>
              </div>
            </div>
            <p style={{ textAlign: 'center', margin: '12px 0 0', fontSize: 12, fontWeight: 400, color: '#97A0BA' }}>Add a video, set the run mode, then send. I'll pick it up from there.</p>
          </div>
        )}

        {/* ============ CHAT ============ */}
        {stage === 'chat' && (
          <div ref={chatRef} className="bc-scrollbar" style={{ maxHeight: '66vh', overflowY: 'auto', overscrollBehavior: 'contain', borderRadius: 14, border: '1px solid #E6EAF5', background: '#FFFFFF', boxShadow: '0 1px 2px rgba(16,24,64,0.04), 0 8px 24px -18px rgba(16,24,64,0.16)' }}>
            <div style={{ padding: '22px 24px 26px' }}>

              {/* User message */}
              <div className="bc-enter" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 7 }}>
                  {notes.trim() && (
                    <div style={{ padding: '11px 14px', borderRadius: 12, borderBottomRightRadius: 4, background: '#EEF1FE', border: '1px solid #DFE4FA', color: '#001364', fontSize: 14, fontWeight: 400, lineHeight: 1.5 }}>{notes}</div>
                  )}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 11px 6px 7px', borderRadius: 9, background: '#F5F7FF', border: '1px solid #E6EAF5' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 6, background: '#EEF1FE', color: '#879CF7' }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" /></svg></span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#3C4767' }}>{attachLabel}</span>
                    <span style={{ width: 1, height: 12, background: '#DDE3F2' }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#879CF7' }}>{modeObj.label}</span>
                  </div>
                </div>
              </div>

              {/* Validation failed */}
              {validationError && (
                <div className="bc-enter" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 14 }}>
                  <img src={LEE_AVATAR} alt="Lee" style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ maxWidth: '82%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ padding: '11px 15px', borderRadius: 12, borderTopLeftRadius: 4, background: '#FFFFFF', border: '1px solid #E6EAF5' }}>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: '#001364' }}>{validationError}</p>
                    </div>
                    <a href="/settings" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', height: 36, padding: '0 16px', borderRadius: 10, background: '#879CF7', color: '#fff', fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}>Manage your plan in Settings</a>
                  </div>
                </div>
              )}

              {/* Lee confirm */}
              {showConfirm && !validationError && <LeeBubble>{modeObj.confirm}</LeeBubble>}

              {/* Agents question */}
              {showAgentsQ && !validationError && <LeeBubble>First, which Review Agents should run? Pick at least 3, each one watches for one specific thing.</LeeBubble>}

              {/* Agents picker */}
              {showAgents && !validationError && (
                <div className="bc-enter" style={{ margin: '0 0 14px 40px', maxWidth: 480 }}>
                  <div style={{ borderRadius: 12, border: '1px solid #E6EAF5', background: '#fff', overflow: 'hidden' }}>
                    {AGENT_GROUPS.map((g) => {
                      const gCount = g.agents.filter((a) => selectedAgents.includes(a.label)).length;
                      const isOpen = openGroup === g.key;
                      return (
                        <div key={g.key} style={{ borderBottom: '1px solid #EEF1F8' }}>
                          <button className="bc-group-head" onClick={() => toggleGroup(g.key)}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: '#F1F4FF' }}>
                              <img src={g.icon} alt="" style={{ width: 19, height: 19, objectFit: 'contain' }} />
                            </span>
                            <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600, color: '#001364' }}>{g.title}</span>
                            {gCount > 0 && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, padding: '0 6px', borderRadius: 999, background: '#EEF1FE', color: '#5B6FD8', fontSize: 11, fontWeight: 600 }}>{gCount}</span>
                            )}
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#AEB6CE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s', transform: `rotate(${isOpen ? 180 : 0}deg)` }}><polyline points="6 9 12 15 18 9" /></svg>
                          </button>
                          {isOpen && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, padding: '2px 14px 14px' }}>
                              {g.agents.map((a) => {
                                const on = selectedAgents.includes(a.label);
                                return (
                                  <button key={a.id} onClick={() => toggleAgent(a.label)}
                                    style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 7, width: '100%', minHeight: 104, textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer', borderRadius: 12, transition: 'all 0.15s', padding: '12px 12px 13px', background: on ? '#F5F7FF' : '#fff', border: on ? '1px solid #879CF7' : '1px solid #E6EAF5' }}>
                                    <img src={AGENT_ICON} alt="" draggable="false" style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0, transform: 'rotate(-12deg)', filter: 'drop-shadow(0 3px 5px rgba(135,156,247,0.28))' }} />
                                    <span style={{ flex: 1, minWidth: 0 }}>
                                      <span style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: '#001364' }}>{a.label}</span>
                                      <span style={{ display: 'block', marginTop: 2, fontSize: 10.5, fontWeight: 400, lineHeight: 1.35, color: '#8A93AC' }}>{a.desc}</span>
                                    </span>
                                    <span style={{ position: 'absolute', top: 10, right: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: 6, flexShrink: 0, background: on ? '#879CF7' : '#fff', border: on ? '1px solid #879CF7' : '1px solid #CFD6EA' }}>
                                      {on && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: canAnalyse ? '#2FA463' : '#B7791F' }}>{canAnalyse ? `${count} agents selected` : `Pick at least 3 · ${count} selected`}</span>
                    <button onClick={startAnalyse} disabled={!canAnalyse || submitting}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 36, padding: '0 16px', border: 'none', borderRadius: 10, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, transition: 'all 0.15s', background: canAnalyse ? '#879CF7' : '#EDEFF6', color: canAnalyse ? '#fff' : '#AEB6CE', cursor: canAnalyse ? 'pointer' : 'not-allowed' }}>
                      {canAnalyse ? `Run ${count} agents` : 'Pick at least 3'}
                    </button>
                  </div>
                </div>
              )}

              {/* Analysing message */}
              {showAnalyseMsg && <LeeBubble>{`On it. Running ${count} agents on your video now.`}</LeeBubble>}

              {/* Scan / result frame */}
              {showScan && (
                <div className="bc-enter" style={{ margin: '0 0 6px 40px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 13 }}>
                  <div style={{ position: 'relative', width: 208, height: 370, borderRadius: 16, overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E6EAF5' }}>

                    {showPreviewMedia && previewUrlRef.current && (
                      <video autoPlay muted loop playsInline src={previewUrlRef.current} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(2px) brightness(0.85)' }} />
                    )}

                    {showFallbackMedia && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, background: 'linear-gradient(180deg, #F5F6FB 0%, #FFFFFF 100%)' }}>
                        <div style={{ position: 'relative', width: 112, height: 112, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="bc-pulse" style={{ position: 'absolute', inset: -4, borderRadius: 26, background: 'rgba(135,156,247,0.26)' }} />
                          <span className="bc-pulse bc-pulse2" style={{ position: 'absolute', inset: -4, borderRadius: 26, background: 'rgba(135,156,247,0.26)' }} />
                          <img src={FALLBACK_ICON[fkSource][0]} alt="" draggable="false" style={{ position: 'relative', width: 112, height: 112, objectFit: 'contain', borderRadius: 22, background: '#ECEEF4', boxShadow: '0 8px 22px -10px rgba(16,24,64,0.30)' }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#5B6FD8' }}>{FALLBACK_ICON[fkSource][1]}</span>
                      </div>
                    )}

                    {/* Scan overlays (preview only) */}
                    {showPreviewMedia && (
                      <>
                        <div className="bc-scanline">
                          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, transform: 'translateY(-1px)', background: 'linear-gradient(90deg, rgba(180,196,255,0) 0%, #C3D0FF 50%, rgba(180,196,255,0) 100%)', boxShadow: '0 0 14px 2px rgba(135,156,247,0.7)' }} />
                        </div>
                        <div style={{ position: 'absolute', inset: 10, pointerEvents: 'none' }}>
                          <span style={{ position: 'absolute', top: 0, left: 0, width: 15, height: 15, borderTop: '2px solid rgba(195,208,255,0.85)', borderLeft: '2px solid rgba(195,208,255,0.85)', borderTopLeftRadius: 5 }} />
                          <span style={{ position: 'absolute', top: 0, right: 0, width: 15, height: 15, borderTop: '2px solid rgba(195,208,255,0.85)', borderRight: '2px solid rgba(195,208,255,0.85)', borderTopRightRadius: 5 }} />
                          <span style={{ position: 'absolute', bottom: 0, left: 0, width: 15, height: 15, borderBottom: '2px solid rgba(195,208,255,0.85)', borderLeft: '2px solid rgba(195,208,255,0.85)', borderBottomLeftRadius: 5 }} />
                          <span style={{ position: 'absolute', bottom: 0, right: 0, width: 15, height: 15, borderBottom: '2px solid rgba(195,208,255,0.85)', borderRight: '2px solid rgba(195,208,255,0.85)', borderBottomRightRadius: 5 }} />
                        </div>
                        <div style={{ position: 'absolute', top: 11, left: 11, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 9px', borderRadius: 999, background: 'rgba(14,20,48,0.72)', border: '1px solid rgba(255,255,255,0.14)' }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#879CF7' }} />
                          <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Scanning</span>
                        </div>
                      </>
                    )}

                    {reviewReady && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 9, padding: 22, textAlign: 'center', background: '#FFFFFF' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: '50%', background: '#E9F8EE', color: '#2FA463' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#001364' }}>Review complete</span>
                        <span style={{ fontSize: 12, lineHeight: 1.45, color: '#64708C' }}>{notifMsg || 'Your video has been analysed.'}</span>
                      </div>
                    )}

                    {timedOut && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 9, padding: 22, textAlign: 'center', background: '#FFFFFF' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: '50%', background: '#EEF1FE', color: '#879CF7' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#001364' }}>Still processing</span>
                        <span style={{ fontSize: 12, lineHeight: 1.45, color: '#64708C' }}>We'll email you when it's ready.</span>
                      </div>
                    )}
                  </div>

                  {scanning && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 500, color: '#3C4767' }}>{STATUS_LINES[scanIdx % STATUS_LINES.length]}</span>
                      <div style={{ display: 'flex', gap: 7 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: '#E9F8EE', color: '#2FA463', fontSize: 11, fontWeight: 500 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>Fetched</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: '#F3F5FB', color: '#5B6FD8', fontSize: 11, fontWeight: 500 }}><span className="bc-spin" style={{ width: 11, height: 11, border: '2px solid #C7CFE6', borderTopColor: '#879CF7', borderRadius: '50%' }} />Analysing</span>
                      </div>
                    </div>
                  )}

                  {reviewReady && (
                    <a href="/videos" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 38, padding: '0 16px', borderRadius: 10, background: '#879CF7', color: '#fff', fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}>View my results<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 14 0" /><path d="m13 6 6 6-6 6" /></svg></a>
                  )}
                  {timedOut && (
                    <a href="/videos" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 38, padding: '0 16px', borderRadius: 10, background: '#879CF7', color: '#fff', fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}>Go to dashboard<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 14 0" /><path d="m13 6 6 6-6 6" /></svg></a>
                  )}
                </div>
              )}

              {/* Typing */}
              {typing && (
                <div className="bc-enter" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                  <img src={LEE_AVATAR} alt="Lee" style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ display: 'flex', gap: 5, padding: '13px 15px', borderRadius: 12, borderTopLeftRadius: 4, background: '#FFFFFF', border: '1px solid #E6EAF5' }}>
                    <span className="bc-bounce" style={{ width: 6, height: 6, borderRadius: '50%', background: '#879CF7' }} />
                    <span className="bc-bounce" style={{ width: 6, height: 6, borderRadius: '50%', background: '#879CF7', animationDelay: '0.2s' }} />
                    <span className="bc-bounce" style={{ width: 6, height: 6, borderRadius: '50%', background: '#879CF7', animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
      )}
    </>
  );
}

// ─── Module-scope pieces (stable identity, no remount) ───
function LeeBubble({ children }) {
  return (
    <div className="bc-enter" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 14 }}>
      <img src={LEE_AVATAR} alt="Lee" style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ padding: '11px 15px', borderRadius: 12, borderTopLeftRadius: 4, background: '#FFFFFF', border: '1px solid #E6EAF5', maxWidth: '82%' }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 400, lineHeight: 1.5, color: '#001364' }}>{children}</p>
      </div>
    </div>
  );
}

function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      @keyframes bcSpin { to { transform: rotate(360deg); } }
      @keyframes bcBounce { 0%,80%,100% { transform: translateY(0); opacity: 0.5; } 40% { transform: translateY(-5px); opacity: 1; } }
      @keyframes bcFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      .bc-ringwrap { position: relative; display: inline-flex; align-items: center; }
      .bc-ring { display: inline-grid; place-items: center; width: 30px; height: 30px; background: transparent; border: 0; padding: 0; cursor: pointer; border-radius: 8px; }
      .bc-ring:hover { background: #F3F5FB; }
      .bc-ring svg { transform: rotate(-90deg); display: block; }
      .bc-ring-track { fill: none; stroke: rgba(0,19,100,0.1); stroke-width: 3.5; }
      .bc-ring-bar { fill: none; stroke: #879CF7; stroke-width: 3.5; stroke-linecap: round; transition: stroke-dasharray 0.3s ease; }
      .bc-pop { position: absolute; right: 0; bottom: calc(100% + 8px); width: 250px; background: #fff; border: 1px solid #E6EAF5; border-radius: 11px; box-shadow: 0 12px 32px -14px rgba(16,24,64,0.35); padding: 12px; display: flex; flex-direction: column; gap: 8px; z-index: 20; text-align: left; }
      .bc-pop-row { display: flex; justify-content: space-between; gap: 10px; font-size: 12px; color: #64708C; }
      .bc-pop-row b { color: #001364; font-weight: 600; white-space: nowrap; }
      .bc-pop-bar { height: 5px; border-radius: 99px; background: #F3F5FB; overflow: hidden; }
      .bc-pop-bar i { display: block; height: 100%; background: #879CF7; border-radius: 99px; transition: width 0.3s ease; }
      .bc-ring-bar.is-warn { stroke: #E8A13A; }
      .bc-ring-bar.is-low { stroke: #E5484D; }
      .bc-pop-bar i.is-warn { background: #E8A13A; }
      .bc-pop-bar i.is-low { background: #E5484D; }
      .bc-pop-link { font-size: 12px; font-weight: 600; color: #3C4767; text-decoration: none; margin-top: 2px; }
      .bc-pop-link:hover { color: #001364; }
      @keyframes bcScan { from { top: 7%; } to { top: 93%; } }
      @keyframes bcPulse { 0% { transform: scale(0.7); opacity: 0.55; } 70% { transform: scale(1.5); opacity: 0; } 100% { opacity: 0; } }
      .bc-enter { animation: bcFadeUp 0.45s cubic-bezier(0.32,0.72,0,1) both; }
      .bc-shell { transition: padding-top 0.45s cubic-bezier(0.32,0.72,0,1); }
      @media (max-width: 640px) { .bc-shell.is-home { padding-top: clamp(24px, 6vh, 56px) !important; } }
      .bc-spin { animation: bcSpin 0.8s linear infinite; }
      .bc-bounce { animation: bcBounce 1.4s infinite; }
      .bc-pulse { animation: bcPulse 2.2s ease-out infinite; }
      .bc-pulse2 { animation-delay: 1.1s; }
      .bc-scanline { position: absolute; left: 0; right: 0; height: 54px; margin-top: -27px; background: linear-gradient(180deg, rgba(135,156,247,0) 0%, rgba(135,156,247,0.30) 48%, rgba(135,156,247,0.30) 52%, rgba(135,156,247,0) 100%); animation: bcScan 2.4s ease-in-out infinite alternate; pointer-events: none; }
      .bc-scrollbar::-webkit-scrollbar { width: 8px; }
      .bc-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .bc-scrollbar::-webkit-scrollbar-thumb { background: #DDE3F2; border-radius: 8px; }
      .bc-noscroll::-webkit-scrollbar { display: none; }
      .bc-noscroll { scrollbar-width: none; }
      textarea::placeholder, input::placeholder { color: #97A0BA; }
      .bc-round { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; border: 1px solid #E6EAF5; background: #fff; color: #64708C; cursor: pointer; }
      .bc-round:hover { background: #F5F7FF; color: #001364; }
      .bc-pill { flex: 0 0 auto; white-space: nowrap; height: 32px; padding: 0 13px; border-radius: 9px; border: 1px solid #E6EAF5; background: #fff; color: #3C4767; font-family: inherit; font-size: 12.5px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
      .bc-pill:hover { background: #F5F7FF; border-color: #D8DEF0; color: #001364; }
      .bc-tool { display: inline-flex; align-items: center; gap: 7px; height: 32px; padding: 0 12px 0 10px; border-radius: 9px; border: 1px solid #E6EAF5; background: #fff; color: #3C4767; font-family: inherit; font-size: 12.5px; font-weight: 500; cursor: pointer; }
      .bc-tool:hover { background: #F5F7FF; color: #001364; }
      .bc-mode { display: inline-flex; align-items: center; gap: 7px; height: 34px; padding: 0 10px; border-radius: 9px; border: 1px solid #E6EAF5; background: #fff; color: #001364; font-family: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; }
      .bc-mode:hover { background: #F5F7FF; }
      .bc-menu-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 10px; border: none; border-radius: 8px; background: transparent; color: #001364; font-family: inherit; font-size: 13px; font-weight: 500; text-align: left; cursor: pointer; }
      .bc-menu-item:hover { background: #F5F7FF; }
      .bc-group-head { display: flex; align-items: center; gap: 10px; width: 100%; padding: 11px 14px; border: none; background: transparent; font-family: inherit; cursor: pointer; text-align: left; }
      .bc-group-head:hover { background: #FAFBFF; }
    `}</style>
  );
}