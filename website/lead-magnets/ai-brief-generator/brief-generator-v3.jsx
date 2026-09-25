// =====================================================================
// Vibe Coding block: AI Content Brief Generator v3 (lead magnet)
// /free-tool-ai-brief-generator
// =====================================================================
// Rebuilt 2026-08-05. It looks like a conversation with Lee and behaves
// like a wizard: every answer is a preset option, so the only thing that
// costs money is the single generation at the end. No free-text chat.
//
// FLOW
//   0. Gate      — work email + brand website.
//   1. Chat      — Lee asks, you tap: who is filming, channel, awareness.
//   2. Formats   — the 42-format picker, 1 to 3, ordered by who is
//                  filming, with the ones they cannot film left out.
//   3. Generate  — fires the brief workflow (Sonar + Claude), then polls
//                  the briefs table for the row carrying our client_uuid.
//   4. Brief     — Lee hands back a document: one column, numbered
//                  sections, ready to send to a creator. Opens in its own
//                  tab at ?brief=<recordId>, so the link is shareable and
//                  a creator can open it without an account.
//
// SOFTR SETUP
//   1. Source tab → Database: brieflee leads → Table: briefs
//   2. Actions tab is derived from the code, nothing to set
//   3. Visibility → public
// =====================================================================

import { useState, useEffect, useMemo, useRef } from "react";
import { useRecords, useRecord, q } from "@/lib/datasource";
import { Check, Copy, Download, Loader2, ArrowRight, ExternalLink } from "lucide-react";

const LEE = "https://res.cloudinary.com/dspv9nm1n/image/upload/v1771427670/obl2odsrkhunneswor46.png";

// The brief workflow: Sonar research + Claude sections + Create Record.
const GENERATE_WORKFLOW_URL =
  "https://workflows-api.softr.io/v1/workflows/918e0a63-ea4d-45fe-96f8-fedf2d7c5ee5/executions/6ebf0702-048f-46ee-a30b-d1c0caf0df9d";
// Shared lead capture (EmailIt nurture + Sheet backup).
const LEAD_WORKFLOW_URL =
  "https://workflows-api.softr.io/v1/workflows/1e28685f-1a24-4042-80ac-cadfedef7336/executions/22b90d5d-a73b-43b5-ac1b-f24843b781bd";

const FREE_DOMAINS = [
  "gmail.com","yahoo.com","hotmail.com","outlook.com","live.com","icloud.com",
  "aol.com","proton.me","protonmail.com","gmx.com","mail.com","yandex.com","msn.com",
];


// ---------------------------------------------------------------------
// briefs table (leads DB) field aliases
// ---------------------------------------------------------------------

const readFields = q.select({
  clientUuid:        "MhPZU",
  generatedBrief:    "BPpI5",
  brandResearch:     "T01Og",
  logoUrl:           "AFI5V",
  // Format lookups — auto-pulled from the linked Format row
  videoExamples:     "FYzNX",  // Video URL (Video Formats) (Formats)
  sampleClips:       "4ILb5",  // Sample Clip URLs (Formats)
  faceTime:          "uYe40",  // Face Time (Formats)
  audioClarity:      "5XL9y",  // Audio Clarity (Formats)
  audioHookTiming:   "bEdsv",  // Audio Hook Timing (Formats)
  brandMentionCount: "i5UfP",  // Brand Mention Count (Formats)
  ctaPlacement:      "5UUzq",  // CTA Placement (Formats)
  engagementPacing:  "TdEgM",  // Engagement Pacing (Formats)
  productVisibility: "3PXY2",  // Product Visibility (Formats)
  textLegibility:    "0JQJh",  // Text Legibility (Formats)
  visualHook:        "rdgdX",  // Visual Hook (Formats)
  qaChecklist:       "1aWD6",  // QA Checklist (Formats)
  formatDescription: "53Xtq",  // Format Description (Formats)
  formatWhyItWorks:  "yd7zI",  // Format Why It Works (Formats)
});



const FILMER_OPTIONS = [
  { id: "ffba9900-c3c3-4708-9535-c4e96de2683f", label: "Influencer" },
  { id: "2d7129c6-47a8-4b64-8978-31ded65be607", label: "UGC Creator" },
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



const FILMER_GUIDANCE = {
  "UGC Creator": "Paid creator with no following. Polished but authentic. Bright lighting, clear product use, branded but not over-styled. Energy in first 3 seconds. Talks to camera or to a friend off-camera.",
  "Influencer":  "Creator with an established following. Polished, aspirational. Uses their own established voice and references their audience. Affiliate-style CTAs work well.",
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




// ---------------------------------------------------------------------
// The 42 formats, ids and Motion clips (same catalogue as onboarding)
// ---------------------------------------------------------------------

const FORMATS = [
  // ── Most-used formats first; flagged `popular` for the badge ──
  { name: "Yapper", id: "5l0IKGeuF1TcQH", desc: "Creator talking straight to camera", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/4309351589318819/6a4f66ef69c9b9098480aa4f/04038f95-a782-44ac-8e8b-66de63276662.mp4" , popular: true },
  { name: "Try-On", id: "Q0N2XHJLH8zpvx", desc: "Trying the product on, on camera", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1348381250732594/6a57726269c9b90984a9d6dd/e8da914d-0cb9-4289-96c9-da3aa580fdf4.mp4" , popular: true },
  { name: "POV", id: "znK1otYqVFeHdP", desc: "Shot from the viewer's perspective", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1037561295884526/6a47f74c708e10d2425216af/ea09844a-bb5a-401e-971f-3e7b1fd48d6e.mp4" , popular: true },
  { name: "Listicle", id: "qnWiPWtmyXCenq", desc: "Numbered, snappy, easy to follow", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1336407554569071/6a42c4ef3d28426734964252/3bc9b13a-2cf9-468e-8272-7d12f770fc2d.mp4" , popular: true },
  { name: "Skit", id: "F5fq0pXlaKH3rv", desc: "A mini-story with characters", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1728432004991669/69f6e752280f6afea179e59a/3092237e-5be7-4a01-a68c-79821a2c985d.mp4" , popular: true },
  { name: "Testimonial", id: "B02EKdR9dlAx6z", desc: "A real customer, on camera", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1892633181430601/69fcf01d9f9320f2b1a2f9e6/d3538384-9946-4041-8d85-67e82024df03.mp4" , popular: true },
  { name: "Demo", id: "rCVlZyOAiJjeBk", desc: "Show it working", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1880827992620177/69e8ace0bdb47646c4818a06/5dd897d0-764f-4cc2-a905-e5094e646bdf.mp4" , popular: true },
  { name: "Before and After", id: "lXE0ppCy9bxtwT", desc: "One frame of the before", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/988627827004012/69fefaf908c1a6eaf90e2ad6/1b271108-d78b-4354-8885-5fc970bade08.mp4" , popular: true },
  // ── Everything else, alphabetical ──
  { name: "AI Generated", id: "43v5kKjNH6eRYR", desc: "Imagery your camera couldn't capture", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2882199948802308/6a60f695e279571c539b745f/e5a95652-2a23-4ea6-8fdd-d2f0440a18b3.mp4"  },
  { name: "ASMR", id: "ZvD1XsBsOHXrc7", desc: "Show your product through sound", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/26273338205702663/69fefc4d08c1a6eaf90e35cc/f1b99388-a6cb-4ee2-9a3a-3bb593b33cc5.mp4" },
  { name: "Behind The Scenes", id: "j1mq5E7J76Uh6v", desc: "What the audience never sees", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2074472573134109/69fd76f99f9320f2b1a8b16e/4b4f80c2-e4e6-49b2-adbb-f199ad55a58a.mp4" },
  { name: "Celebrity", id: "2tidTBu1s9sYe0", desc: "A face your audience already trusts", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1751062799192327/69e655fec58c09bbcefb076b/11e557d6-ed5e-4dc8-a806-3ad02fdbf8a4.mp4" },
  { name: "Cinematic B-Roll", id: "iJ0B7DHvXSa6S7", desc: "Brand-led, beautifully shot moments", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/969391685995536/69fccea79f9320f2b1a10f9e/33c8c440-25fd-41c1-9d49-0e7294a7b263.mp4" },
  { name: "Comment Response", id: "mNzF4jrNxdWkh9", desc: "Frame the ad as a reply", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1636968607555545/69f25ae0bdb47646c4aeac1e/2d483aa6-d836-4f26-8877-a5699a8d86b2.mp4" },
  { name: "Duet", id: "F5dPTsMJW0ZyRq", desc: "Splitscreen with another video", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2511326736005461/69fccd2d9f9320f2b1a0f96d/ee956cc7-d4fa-4c00-b5b9-f2914f28602f.mp4" },
  { name: "Educational", id: "GzrEECgnGSDV9V", desc: "Teach something they didn't know", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/914024708218014/69a366a6627a9fffb77b4c30/dc9ece02-b98a-4f69-bb18-e47060c3de44.mp4" },
  { name: "Expert Explainer", id: "AbqxjhPiSSk2X5", desc: "An authority explains the product", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1021384357007346/69fbf2659f9320f2b19d8f1f/1f654e37-23fe-4e1e-ac08-cf6e383b61e0.mp4" },
  { name: "Founder", id: "yWvyuTwfxjdI8V", desc: "You, on camera", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2489169831480140/69b66c3ec32a3e3756ff0204/a10e6435-8974-41ab-b455-a2b31c2f3f6e.mp4" },
  { name: "Greenscreen", id: "k5DItljtn7egIc", desc: "You, with a screen behind you", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2669537510087032/69e49e54c58c09bbceee4610/f70d3887-2ba3-4757-bd4d-83a1b96c2392.mp4" },
  { name: "Grid Swap", id: "fB13Uwrof2LR2x", desc: "Same frame, one element swaps in", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/825894647240915/69ff7cf808c1a6eaf911b72f/a449cf81-08a9-40ff-a7f5-6ee3e3454f79.mp4" },
  { name: "How To", id: "6wAgppyTNeGk7E", desc: "Step one, step two, result", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/970964365671431/69fccf6d9f9320f2b1a11d45/484b8e6a-34be-40b7-a37b-869fbaf12d23.mp4" },
  { name: "Humour", id: "Tlw7jXIw8dQU8m", desc: "Lead with the laugh, land the product", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/3223664521167031/69ff042f08c1a6eaf90e80ee/f775c866-c16e-4c0d-8829-385847056c65.mp4" },
  { name: "Influencer Endorsement", id: "JOEyLgxuqYS8PM", desc: "A creator they already follow", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1271436081862800/69f968c746012bac5d8142c4/9c91629f-e452-4832-94a0-5243d5ceab51.mp4" },
  { name: "Meme", id: "X4rmYeRWHlwFF6", desc: "A current meme, used right", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/851513724015406/69d24c434dbfa8a40b3a74d5/e36b9f35-ab6e-4105-84e4-7acc1ac70c0b.mp4" },
  { name: "Montage", id: "TvjJUVblQ4U0NM", desc: "Many shots, cut fast", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/713982688473485/69ff317008c1a6eaf9101da8/42159ae1-bb28-4214-b77f-aad745aa268a.mp4" },
  { name: "Pattern Interrupt", id: "gebQfaqFGK8JR0", desc: "Opening with no obvious link", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/927361589680033/69fd2d6c9f9320f2b1a5c8e9/8eeb4b60-5f6a-422d-aa3c-057a6bc55795.mp4" },
  { name: "Podcast", id: "FKeW5AssNPsamF", desc: "Two people, mics, jump cuts", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1688264695516114/69e4e2a0c58c09bbcef03451/d23eb6fe-3e5b-4c41-a179-79ac9218b420.mp4" },
  { name: "Postit", id: "6y60WsVQSvSPrx", desc: "Sticky notes around the product", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/25938599792440098/698f81038d2d4d38e641669e/e670ddd2-b6d9-4756-b54b-1b5b3e55d3ea.mp4" },
  { name: "Press", id: "JBvDhmX83IXzVt", desc: "Logos, headlines, article screenshots", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/958677503186249/69e89e82bdb47646c4812083/11f2be5d-6dd4-490b-b0a8-754abda85883.mp4" },
  { name: "Problem Agitation", id: "9HNmgZxQifJP0m", desc: "Show the problem at its worst", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1688175742215548/69ff9e8d08c1a6eaf9125217/2ed207c4-7158-4183-9feb-e20e9c970392.mp4" },
  { name: "Reaction Video", id: "IUMTcnn4yHmdse", desc: "Someone reacting in real time", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1491285256026991/69fd113d9f9320f2b1a48d73/c6f4d264-30df-4330-ae29-5e730a3df744.mp4" },
  { name: "Review", id: "Twlhm409ycfr0y", desc: "A real review, read or shown", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2279677339507921/69fefb6808c1a6eaf90e2ea6/5682c1a2-0237-4b41-bb49-768d66ef682a.mp4" },
  { name: "Screen Recording", id: "dJ7bOZvx1KCtUY", desc: "Phone or computer screen, straight", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1122214257641545/69ff277208c1a6eaf90fe0d1/228c591f-ecb8-4f6d-9c48-fe83e065d887.mp4" },
  { name: "Social Proof Mashup", id: "JtHL5zDz7mee39", desc: "Many pieces of proof, cut fast", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1518474793119276/69ff091808c1a6eaf90ecc72/8a017948-79b6-4dec-ac1a-a3721a64379f.mp4" },
  { name: "Stitch", id: "Wh1EFfauvrcBtT", desc: "Start with their video, cut to your reply", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2062149124576879/69bd6f523ea14393201d2b09/8df11f86-2a09-4802-b268-ddbba7048c42.mp4" },
  { name: "Stop Motion", id: "Ff8KG7xPuKvQqB", desc: "Frame-by-frame animation", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1464761611995002/69cfa69e4dbfa8a40ba7dd1f/b07a9e36-c6c7-4cc6-8871-a11822781240.mp4" },
  { name: "Street Interview", id: "FPGeZ7LBgpc6ob", desc: "Man-on-the-street style", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1494670028833663/69fcf9149f9320f2b1a37296/ce84b33c-606a-4ec2-b072-680b028db10c.mp4" },
  { name: "Time Lapse", id: "O18lIcshH8Locj", desc: "Sped-up footage of a change", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1599755551687991/69ffcf3508c1a6eaf91338f8/edf04e7e-643e-45f0-80b4-3abef613c224.mp4" },
  { name: "Transformation", id: "RPiqUMprAeQDRS", desc: "The change, in one tight cut", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1701051874670072/69ff213208c1a6eaf90fb4cc/9ffedfd1-3295-4f2e-81c9-3499b5ac5097.mp4" },
  { name: "Trend", id: "2wbMtE3V2KPJ85", desc: "A current trend, used right", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2187963178620533/69fa179746012bac5d838913/f541cffa-9511-4d82-b173-fa35dd8f6f02.mp4" },
  { name: "Unboxing", id: "82alellAfOUPLv", desc: "Opening the box on camera", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1495050481989422/69ff123e08c1a6eaf90f40c3/0da0dbd7-27f1-40bb-9cd1-433e11f3f150.mp4" },
  { name: "Whiteboard Explainer", id: "qe6tHLeuc7eghe", desc: "A whiteboard, a marker, an explanation", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/9385028881518631/67a39cd00a70ccc0c5991b54/f904cb0a-4e77-4ce9-ac79-2ec0c0a362b4.mp4" },
];



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
// Which formats suit who is filming (confirmed with Bev 2026-08-05)
// ---------------------------------------------------------------------
// A dial, not a rulebook: the picker still shows nearly everything, it
// just leads with what suits the person holding the camera and drops the
// handful they genuinely could not film. Press, Grid Swap and Social
// Proof Mashup are brand-produced rather than filmed by a person, so
// they leave every list.
const BRAND_MADE = ["Press", "Grid Swap", "Social Proof Mashup"];

const FORMAT_EXCLUDE = {
  "Influencer":  ["Founder", ...BRAND_MADE],
  "UGC Creator": ["Celebrity", "Influencer Endorsement", "Founder", ...BRAND_MADE],
  "Founder":     ["Celebrity", "Influencer Endorsement", "Testimonial", "Street Interview", ...BRAND_MADE],
  "Customer":    ["Celebrity", "Influencer Endorsement", "Founder", "Behind The Scenes",
                  "Expert Explainer", "Cinematic B-Roll", ...BRAND_MADE],
  "Employee":    ["Celebrity", "Influencer Endorsement", "Founder", "Cinematic B-Roll", ...BRAND_MADE],
};

const FORMAT_SUITS = {
  "Influencer":  ["Yapper","Try-On","POV","Review","Unboxing","Stitch","Duet","Reaction Video","Trend","Testimonial"],
  "UGC Creator": ["Yapper","Demo","Try-On","Before and After","Listicle","Testimonial","How To","Unboxing","POV","Skit"],
  "Founder":     ["Founder","Behind The Scenes","Expert Explainer","Educational","Yapper","Podcast","How To","Problem Agitation"],
  "Customer":    ["Testimonial","Before and After","Review","Unboxing","Try-On","Yapper","Transformation","POV"],
  "Employee":    ["Behind The Scenes","Yapper","Demo","How To","Educational","Expert Explainer","Humour","Skit","Street Interview"],
};

const MAX_FORMATS = 3;

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").trim());
const isWorkEmail  = (v) => !FREE_DOMAINS.includes(String(v || "").trim().toLowerCase().split("@")[1] || "");
const normaliseUrl = (v) => {
  const s = String(v || "").trim();
  if (!s) return "";
  return /^https?:\/\//i.test(s) ? s : "https://" + s;
};
const isValidSite = (v) => /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(String(v || "").trim());

// House voice: no em dashes anywhere in what a creator reads.
const noEm = (s) =>
  String(s || "").replace(/\s*—\s*/g, ", ").replace(/\s*–\s*/g, "-").replace(/[ \t]+/g, " ").trim();

function safeParseJson(raw) {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  const m = String(raw).match(/\{[\s\S]*\}/);
  try { return JSON.parse(m ? m[0] : raw); } catch { return null; }
}

const uuid = () =>
  "bg-" + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);

const asLines = (v) =>
  Array.isArray(v) ? v.map(noEm).filter(Boolean) : String(v || "").split("\n").map(noEm).filter(Boolean);



// ---------------------------------------------------------------------
// Section icons (Bev's own set)
// ---------------------------------------------------------------------
const ICON = {
  brand:     "https://res.cloudinary.com/dspv9nm1n/image/upload/v1778589398/brieflee_icon_brief-glass-3d-transparent_2026-05.png",
  audience:  "https://res.cloudinary.com/dspv9nm1n/image/upload/v1777998690/brieflee_help-icon_members-speech-bubble-profile-icon-with-count-one-transparent_2026-05.png",
  product:   "https://res.cloudinary.com/dspv9nm1n/image/upload/v1777998700/brieflee_icon_hundred-points-100-emoji-transparent_2026-05.png",
  hook:      "https://res.cloudinary.com/dspv9nm1n/image/upload/v1777998712/brieflee_icon_trendy-flat-fire-sticker-transparent_2026-05.png",
  talking:   "https://res.cloudinary.com/dspv9nm1n/image/upload/v1777998691/brieflee_help-icon_notifications-megaphone-loudspeaker-blue-transparent_2026-05.png",
  visual:    "https://res.cloudinary.com/dspv9nm1n/image/upload/v1777998703/brieflee_icon_movie-clapper-illustration-transparent_2026-05.png",
  script:    "https://res.cloudinary.com/dspv9nm1n/image/upload/v1777998702/brieflee_icon_media-player-interface-icon-transparent_2026-05.png",
  deliver:   "https://res.cloudinary.com/dspv9nm1n/image/upload/v1777998710/brieflee_icon_smartphone-in-tripod-flat-illustration-transparent_2026-05.png",
  guides:    "https://res.cloudinary.com/dspv9nm1n/image/upload/v1777998700/brieflee_icon_lined-bold-blocky-checklist-sticker-transparent_2026-05.png",
  examples:  "https://res.cloudinary.com/dspv9nm1n/image/upload/v1777998694/brieflee_icon_approval-stamp-icon-transparent_2026-05.png",
};

// ---------------------------------------------------------------------
// Turn the workflow's row into the sections a creator reads
// ---------------------------------------------------------------------
// Section names follow the Brief Bible. The workflow still returns the
// older key set, so each section falls back gracefully: once the Claude
// prompt is moved onto the Bible, the richer keys light up here without
// another change to this block.
function buildSections(fields, ctx) {
  const ai    = safeParseJson(fields.generatedBrief) || {};
  const brand = safeParseJson(fields.brandResearch) || {};
  const S = [];

  const labelOf = (val) => {
    if (!val) return "";
    if (Array.isArray(val)) return val.map((v) => (v && (v.label || v)) || "").filter(Boolean).join(", ");
    return String(val.label || val);
  };

  // 1 Brand
  const brandBody = [noEm(ai.brand || brand.brandStory || brand.description), noEm(brand.mission)]
    .filter(Boolean);
  if (brandBody.length) S.push({ icon: ICON.brand, title: "Brand", kind: "para", body: brandBody });

  // 2 The offer, when the brief carries one
  const offer = ai.offer || ai.the_offer;
  if (offer) S.push({ icon: ICON.product, title: "The offer", kind: "para", body: asLines(offer) });

  // 3 Who you're talking to
  const audience = ai.audience || ai.buyer || brand.targetAudience;
  if (audience) S.push({ icon: ICON.audience, title: "Who you're talking to", kind: "para", body: asLines(audience) });

  // 4 Product
  const product = ai.product || brand.productDescription;
  if (product) S.push({ icon: ICON.product, title: "The product", kind: "para", body: asLines(product) });

  // 5 Hook. The Bible builds a hook from three parts that fire together,
  // so when the workflow returns them we show the table; a plain list of
  // opening lines still renders as a numbered list.
  const hooks = Array.isArray(ai.hook) ? ai.hook : (ai.hook ? [ai.hook] : []);
  if (hooks.length) {
    const structured = hooks.every((h) => h && typeof h === "object" && (h.caption || h.visual || h.voiceover));
    S.push(structured
      ? { icon: ICON.hook, title: "Hook, three to film", kind: "hooks",
          body: hooks.map((h) => ({ caption: noEm(h.caption), visual: noEm(h.visual), voiceover: noEm(h.voiceover) })) }
      : { icon: ICON.hook, title: "Hook, three to film", kind: "numbered", body: hooks.map(noEm) });
  }

  // 6 What to cover
  const talking = ai.talking_points || ai.talkingPoints;
  if (talking) S.push({ icon: ICON.talking, title: "What to cover", kind: "bullets", body: asLines(talking) });

  // 7 How it should look
  const fmtLines = (ctx.formats || []).map((f) => `${f.name}: ${f.desc}`);
  const why = noEm(labelOf(fields.formatWhyItWorks));
  if (fmtLines.length || why) {
    S.push({ icon: ICON.visual, title: "How it should look", kind: "bullets",
             body: [...fmtLines, why].filter(Boolean) });
  }

  // 8 Scene by scene, only when the brief is scripted
  const rows = Array.isArray(ai.storyboard) ? ai.storyboard : [];
  if (rows.length) {
    S.push({ icon: ICON.script, title: "Scene by scene", kind: "scenes",
             body: rows.map((r, i) => ({ n: i + 1, section: noEm(r.section), visual: noEm(r.visual), script: noEm(r.script) })) });
  }

  // 9 What to send back
  const ch = (ctx.channel || "").toLowerCase();
  S.push({ icon: ICON.deliver, title: "What to send back", kind: "bullets",
    body: ch === "paid"
      ? ["3 videos, 15 to 30 seconds each", "3 hook openers per video", "Vertical 9:16, captions on", "No copyrighted music or watermarks", "Disclose the partnership in the caption"]
      : ["1 video, 15 to 30 seconds", "3 hook openers to pick from", "Vertical 9:16, captions on", "No copyrighted music"] });

  // 10 Guidelines. Thresholds become plain creator language, never a
  // number, never an agent name.
  const musts = [];
  const t = (v) => noEm(labelOf(v));
  if (t(fields.audioHookTiming))   musts.push("Hook us in the first couple of seconds.");
  if (t(fields.productVisibility)) musts.push("Keep the product on screen for most of the video.");
  if (t(fields.brandMentionCount)) musts.push(`Say the brand name at least twice.`);
  if (t(fields.textLegibility))    musts.push("Add clear captions so it works on mute.");
  if (t(fields.audioClarity))      musts.push("Record somewhere quiet with clean sound.");
  if (t(fields.ctaPlacement))      musts.push("End with a clear call to action.");
  const dos   = asLines(ai.dos || ai.do_s);
  const donts = asLines(ai.donts || ai.dont_s);
  if (musts.length || dos.length || donts.length) {
    S.push({ icon: ICON.guides, title: "Make sure you", kind: "guides", body: { musts, dos, donts } });
  }

  // 11 Examples
  const clips = []
    .concat(String(labelOf(fields.videoExamples) || "").split(/[\s,]+/))
    .concat(String(labelOf(fields.sampleClips) || "").split(/[\s,]+/))
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//i.test(s))
    .slice(0, 6);
  if (clips.length) S.push({ icon: ICON.examples, title: "Examples to watch first", kind: "clips", body: clips });

  return S;
}



// ---------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------
const CSS = `
.bg-w{--peri:#879cf7;--blue:#294ff6;--navy:#000f4d;--navy2:#001364;--page:#FAFBFF;
  --l2:#eef4fd;--border:#eef4fd;--bd2:#d6defc;--body:#565d78;--muted:#838aa3;--quiet:#aeb4c8;
  --pass:#2daa63;--passbg:rgba(45,170,99,.10);--fail:#c8443c;--failbg:rgba(200,68,60,.08);
  font-family:'League Spartan',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  background:var(--page);color:var(--body);-webkit-font-smoothing:antialiased}
.bg-w h1,.bg-w h2,.bg-w h3,.bg-w h4{margin:0;color:var(--navy2);letter-spacing:-.02em}
.bg-w p{margin:0}
.bg-wrap{max-width:900px;margin:0 auto;padding:26px 20px 110px}
.bg-top{display:flex;align-items:center;gap:10px;padding:0 4px 18px}
.bg-top img{width:30px;height:30px;border-radius:50%}
.bg-top b{color:var(--navy2);font-size:15px;font-weight:700}
.bg-top span{font-size:12.5px;color:var(--quiet)}
.bg-row{display:flex;gap:12px;margin-bottom:15px;align-items:flex-start}
.bg-row.me{justify-content:flex-end}
.bg-av{width:34px;height:34px;border-radius:50%;flex:0 0 34px;margin-top:2px}
.bg-b{background:#fff;border:1px solid var(--border);border-radius:16px;border-top-left-radius:5px;
  padding:14px 17px;font-size:14.5px;line-height:1.55;box-shadow:0 6px 18px -14px rgba(0,15,77,.3);max-width:640px}
.bg-b.wide{max-width:100%;width:100%}
.bg-b.mine{background:var(--peri);color:#fff;border:0;border-radius:16px;border-bottom-right-radius:5px;font-weight:600}
.bg-opts{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.bg-opt{height:36px;padding:0 15px;border-radius:999px;border:1px solid var(--bd2);background:#fff;
  color:var(--navy2);font-family:inherit;font-size:13.5px;font-weight:600;cursor:pointer}
.bg-opt:hover{border-color:var(--peri)}
.bg-opt.on{background:var(--peri);border-color:var(--peri);color:#fff}
.bg-note{font-size:12.5px;color:var(--quiet);margin-top:10px;line-height:1.5}
.bg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(138px,1fr));gap:11px;margin-top:11px}
.bg-card{border:1px solid var(--bd2);border-radius:13px;overflow:hidden;background:#fff;cursor:pointer;
  position:relative;transition:border-color .15s,transform .15s}
.bg-card:hover{border-color:var(--peri);transform:translateY(-2px)}
.bg-card.on{border-color:var(--peri);box-shadow:0 0 0 2px rgba(135,156,247,.35)}
.bg-card video{width:100%;aspect-ratio:9/16;object-fit:cover;display:block;background:#e9edfb}
.bg-meta{padding:8px 10px 10px}
.bg-nm{font-size:13px;font-weight:700;color:var(--navy2);line-height:1.25}
.bg-ds{font-size:11.5px;color:var(--muted);line-height:1.35;margin-top:3px}
.bg-badge{position:absolute;top:7px;left:7px;background:rgba(255,255,255,.94);color:var(--navy2);font-size:9.5px;
  font-weight:800;letter-spacing:.06em;text-transform:uppercase;padding:3px 7px;border-radius:999px}
.bg-badge.fit{background:var(--peri);color:#fff}
.bg-tick{position:absolute;top:7px;right:7px;width:22px;height:22px;border-radius:50%;background:var(--peri);
  color:#fff;display:flex;align-items:center;justify-content:center}
.bg-glbl{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:16px 0 2px}
.bg-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 22px;border:0;
  border-radius:12px;background:var(--peri);color:#fff;font-family:inherit;font-size:14.5px;font-weight:700;
  cursor:pointer;box-shadow:0 8px 18px -8px rgba(135,156,247,.8)}
.bg-btn[disabled]{opacity:.45;cursor:not-allowed;box-shadow:none}
.bg-btn.ghost{background:#fff;color:var(--navy2);border:1px solid var(--bd2);box-shadow:none}
.bg-in{display:flex;align-items:center;gap:9px;height:46px;padding:0 14px;border:1px solid var(--bd2);
  border-radius:12px;background:#fff;margin-top:9px}
.bg-in input{flex:1;border:0;outline:0;background:transparent;font-family:inherit;font-size:14.5px;color:var(--navy2);min-width:0}
.bg-lbl{font-size:12px;font-weight:700;color:var(--navy2);margin-top:12px;display:block}
.bg-err{color:var(--fail);font-size:13px;margin-top:9px;font-weight:600}
/* the brief */
.bg-doc{background:#fff;border:1px solid var(--border);border-radius:20px;overflow:hidden;width:100%;
  box-shadow:0 26px 60px -34px rgba(0,15,77,.42)}
.bg-dh{padding:22px 26px 18px;border-bottom:1px solid var(--l2);background:linear-gradient(180deg,#f7f9ff,#fff)}
.bg-dh h2{font-size:23px;font-weight:800;line-height:1.15}
.bg-dh .sub{margin-top:5px;font-size:13.5px;color:var(--muted)}
.bg-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
.bg-chip{display:inline-flex;align-items:center;height:26px;padding:0 11px;border-radius:999px;background:var(--l2);
  border:1px solid var(--bd2);font-size:11.5px;font-weight:600;color:var(--navy2)}
.bg-chip.solid{background:var(--peri);border-color:var(--peri);color:#fff}
.bg-body{padding:6px 26px 26px}
.bg-sec{padding:20px 0;border-bottom:1px solid var(--l2)}
.bg-sec:last-child{border-bottom:0}
.bg-sh{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.bg-sh img{width:26px;height:26px;object-fit:contain}
.bg-sh h3{font-size:15.5px;font-weight:700}
.bg-sh .n{margin-left:auto;font-size:11px;font-weight:700;color:var(--quiet);letter-spacing:.08em}
.bg-txt{font-size:14.5px;line-height:1.62}
.bg-txt+.bg-txt{margin-top:9px}
.bg-ul{margin:0;padding:0;list-style:none}
.bg-ul li{position:relative;padding-left:20px;font-size:14.5px;line-height:1.6;margin-bottom:7px}
.bg-ul li:before{content:"";position:absolute;left:6px;top:9px;width:5px;height:5px;border-radius:50%;background:var(--peri)}
.bg-ol{margin:0;padding-left:20px;font-size:14.5px;line-height:1.6}
.bg-ol li{margin-bottom:7px}
.bg-two{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}
.bg-panel{border:1px solid var(--border);border-radius:14px;padding:14px 16px}
.bg-panel h4{font-size:12px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;margin-bottom:9px}
.bg-panel.do{background:var(--passbg);border-color:rgba(45,170,99,.18)} .bg-panel.do h4{color:var(--pass)}
.bg-panel.do li:before{background:var(--pass)}
.bg-panel.dont{background:var(--failbg);border-color:rgba(200,68,60,.16)} .bg-panel.dont h4{color:var(--fail)}
.bg-panel.dont li:before{background:var(--fail)}
.bg-panel li{font-size:13.5px;margin-bottom:5px}
.bg-hk{border:1px solid var(--border);border-radius:14px;overflow:hidden}
.bg-hr{display:grid;grid-template-columns:34px 1fr 1fr 1fr;border-top:1px solid var(--l2)}
.bg-hr:first-child{border-top:0}
.bg-hr.head{background:#f7f9ff}
.bg-hr.head div{font-size:10.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);padding:9px 12px}
.bg-hr>div{padding:12px;font-size:13.5px;line-height:1.5;border-left:1px solid var(--l2)}
.bg-hr>div:first-child{border-left:0;font-weight:700;color:var(--peri);text-align:center}
.bg-scene{display:grid;grid-template-columns:30px 1fr 1fr;gap:10px;padding:11px 0;border-top:1px solid var(--l2);font-size:13.5px;line-height:1.5}
.bg-scene:first-child{border-top:0}
.bg-scene b{color:var(--peri)}
.bg-clips{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px}
.bg-clips video{width:100%;aspect-ratio:9/16;object-fit:cover;border-radius:11px;border:1px solid var(--bd2);background:#e9edfb;display:block}
.bg-bar{position:fixed;left:0;right:0;bottom:0;background:rgba(255,255,255,.93);backdrop-filter:blur(10px);
  border-top:1px solid var(--border);padding:12px 20px;z-index:40}
.bg-barin{max-width:900px;margin:0 auto;display:flex;align-items:center;gap:10px}
.bg-barin .lbl{font-size:13px;color:var(--muted);margin-right:auto}
@media(max-width:720px){
  .bg-two{grid-template-columns:1fr}
  .bg-hr,.bg-hr.head{grid-template-columns:1fr}
  .bg-hr.head{display:none}
  .bg-hr>div{border-left:0;border-top:1px solid var(--l2)}
  .bg-hr>div:first-child{border-top:0;text-align:left;background:#f7f9ff}
  .bg-scene{grid-template-columns:1fr}
  .bg-barin .lbl{display:none}
}
`;

// ---------------------------------------------------------------------
// Small pieces
// ---------------------------------------------------------------------
function Lee({ children, wide }) {
  return (
    <div className="bg-row">
      <img className="bg-av" src={LEE} alt="" />
      <div className={"bg-b" + (wide ? " wide" : "")}>{children}</div>
    </div>
  );
}
function Mine({ children }) {
  return <div className="bg-row me"><div className="bg-b mine">{children}</div></div>;
}
function Opts({ options, value, onPick }) {
  return (
    <div className="bg-opts">
      {options.map((o) => (
        <button key={o.label} className={"bg-opt" + (value === o.label ? " on" : "")}
          onClick={() => onPick(o)}>{o.label}</button>
      ))}
    </div>
  );
}

// The picker: everything that suits this person first, the rest after,
// and the handful they could not film left out entirely.
function FormatPicker({ filmer, picked, onToggle }) {
  const { fit, rest, dropped } = useMemo(() => {
    const ex = new Set(FORMAT_EXCLUDE[filmer] || []);
    const suits = FORMAT_SUITS[filmer] || [];
    const avail = FORMATS.filter((f) => !ex.has(f.name));
    return {
      fit: suits.map((n) => avail.find((f) => f.name === n)).filter(Boolean),
      rest: avail.filter((f) => !suits.includes(f.name)).sort((a, b) => a.name.localeCompare(b.name)),
      dropped: [...ex],
    };
  }, [filmer]);

  const Card = ({ f, suits }) => {
    const ref = useRef(null);
    const on = picked.some((p) => p.name === f.name);
    return (
      <div className={"bg-card" + (on ? " on" : "")}
        onMouseEnter={() => ref.current?.play?.().catch(() => {})}
        onMouseLeave={() => { const v = ref.current; if (v) { v.pause(); v.currentTime = 0; } }}
        onClick={() => onToggle(f)}>
        <video ref={ref} src={f.thumb} muted loop playsInline preload="metadata" />
        {suits ? <span className="bg-badge fit">Suits them</span>
               : f.popular ? <span className="bg-badge">Popular</span> : null}
        {on ? <span className="bg-tick"><Check size={13} strokeWidth={3} /></span> : null}
        <div className="bg-meta"><div className="bg-nm">{f.name}</div><div className="bg-ds">{f.desc}</div></div>
      </div>
    );
  };

  return (
    <>
      <p className="bg-note">
        Showing {fit.length + rest.length} of {FORMATS.length}. {dropped.length} do not suit a {filmer.toLowerCase()}: {dropped.join(", ")}.
      </p>
      {fit.length ? (
        <>
          <div className="bg-glbl">Suits a {filmer.toLowerCase()}</div>
          <div className="bg-grid">{fit.map((f) => <Card key={f.name} f={f} suits />)}</div>
        </>
      ) : null}
      <div className="bg-glbl">Everything else</div>
      <div className="bg-grid">{rest.map((f) => <Card key={f.name} f={f} />)}</div>
    </>
  );
}



// ---------------------------------------------------------------------
// The brief document
// ---------------------------------------------------------------------
function BriefDoc({ brand, meta, sections }) {
  return (
    <div className="bg-doc">
      <div className="bg-dh">
        <h2>{brand || "Your brief"}</h2>
        <p className="sub">Creator brief</p>
        <div className="bg-chips">
          {meta.filter(Boolean).map((m, i) => (
            <span key={m} className={"bg-chip" + (i === 0 ? " solid" : "")}>{m}</span>
          ))}
        </div>
      </div>
      <div className="bg-body">
        {sections.map((s, i) => (
          <section className="bg-sec" key={s.title + i}>
            <div className="bg-sh">
              <img src={s.icon} alt="" />
              <h3>{s.title}</h3>
              <span className="n">{String(i + 1).padStart(2, "0")}</span>
            </div>

            {s.kind === "para" && s.body.map((p, j) => <p className="bg-txt" key={j}>{p}</p>)}

            {s.kind === "bullets" && (
              <ul className="bg-ul">{s.body.map((b, j) => <li key={j}>{b}</li>)}</ul>
            )}

            {s.kind === "numbered" && (
              <ol className="bg-ol">{s.body.map((b, j) => <li key={j}>{b}</li>)}</ol>
            )}

            {s.kind === "hooks" && (
              <div className="bg-hk">
                <div className="bg-hr head"><div /><div>Caption</div><div>Visual</div><div>Voiceover</div></div>
                {s.body.map((h, j) => (
                  <div className="bg-hr" key={j}>
                    <div>{j + 1}</div><div>{h.caption}</div><div>{h.visual}</div><div>{h.voiceover}</div>
                  </div>
                ))}
              </div>
            )}

            {s.kind === "scenes" && s.body.map((r) => (
              <div className="bg-scene" key={r.n}>
                <b>{r.n}</b>
                <div>{r.visual}{r.section ? <span className="bg-ds"> · {r.section}</span> : null}</div>
                <div>{r.script}</div>
              </div>
            ))}

            {s.kind === "guides" && (
              <>
                <ul className="bg-ul">{s.body.musts.map((m, j) => <li key={j}>{m}</li>)}</ul>
                {(s.body.dos.length || s.body.donts.length) ? (
                  <div className="bg-two">
                    <div className="bg-panel do">
                      <h4>Do</h4>
                      <ul className="bg-ul">{s.body.dos.map((d, j) => <li key={j}>{d}</li>)}</ul>
                    </div>
                    <div className="bg-panel dont">
                      <h4>Don't</h4>
                      <ul className="bg-ul">{s.body.donts.map((d, j) => <li key={j}>{d}</li>)}</ul>
                    </div>
                  </div>
                ) : null}
              </>
            )}

            {s.kind === "clips" && (
              <div className="bg-clips">
                {s.body.map((u, j) => (
                  <video key={j} src={u} muted loop playsInline preload="metadata"
                    onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                    onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

// Plain-text version for Copy and for the downloaded file.
function briefToText(brand, meta, sections) {
  const out = [brand || "Creator brief", meta.filter(Boolean).join(" · "), ""];
  sections.forEach((s, i) => {
    out.push(`${String(i + 1).padStart(2, "0")}. ${s.title.toUpperCase()}`, "");
    if (s.kind === "para" || s.kind === "bullets" || s.kind === "numbered") {
      s.body.forEach((b, j) => out.push(s.kind === "numbered" ? `${j + 1}. ${b}` : s.kind === "bullets" ? `- ${b}` : b));
    } else if (s.kind === "hooks") {
      s.body.forEach((h, j) => out.push(`${j + 1}. Caption: ${h.caption}`, `   Visual: ${h.visual}`, `   Voiceover: ${h.voiceover}`));
    } else if (s.kind === "scenes") {
      s.body.forEach((r) => out.push(`Scene ${r.n} — ${r.visual}`.replace(" — ", ": "), r.script ? `   "${r.script}"` : ""));
    } else if (s.kind === "guides") {
      s.body.musts.forEach((m) => out.push(`- ${m}`));
      if (s.body.dos.length)   out.push("", "DO", ...s.body.dos.map((d) => `- ${d}`));
      if (s.body.donts.length) out.push("", "DON'T", ...s.body.donts.map((d) => `- ${d}`));
    } else if (s.kind === "clips") {
      s.body.forEach((u) => out.push(u));
    }
    out.push("");
  });
  return out.join("\n");
}



// ---------------------------------------------------------------------
// Shared view: /free-tool-ai-brief-generator?brief=<recordId>
// ---------------------------------------------------------------------
// Mounted only when an id exists, because useRecord ignores `enabled`
// and an empty id makes the data layer retry on a timer.
function SharedBrief({ recordId, onMiss }) {
  const { data, status } = useRecord({ recordId, select: readFields });
  const done = useRef(false);
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    if (done.current) return;
    if (status === "error") { done.current = true; onMiss(); return; }
    if (data?.fields) {
      done.current = true;
      const f = data.fields;
      const brandJson = safeParseJson(f.brandResearch) || {};
      const ctx = { formats: [], channel: "" };
      setState({ loading: false, brand: brandJson.brandName || "Creator brief", sections: buildSections(f, ctx) });
    }
  }, [data, status, onMiss]);

  if (state.loading) {
    return <Lee><Loader2 className="animate-spin" size={16} /> Opening the brief…</Lee>;
  }
  const meta = ["Shared brief"];
  return (
    <>
      <Lee>Here's the brief. Everything a creator needs, top to bottom.</Lee>
      <div className="bg-row">
        <img className="bg-av" src={LEE} alt="" />
        <BriefDoc brand={state.brand} meta={meta} sections={state.sections} />
      </div>
      <ActionBar label="Shared with you" text={briefToText(state.brand, meta, state.sections)} shareUrl="" />
    </>
  );
}

function ActionBar({ label, text, shareUrl }) {
  const copy = async (v, msg) => { try { await navigator.clipboard.writeText(v); alert(msg); } catch {} };
  const download = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "creator-brief.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <div className="bg-bar">
      <div className="bg-barin">
        <span className="lbl">{label}</span>
        {shareUrl ? (
          <>
            <button className="bg-btn ghost" onClick={() => copy(shareUrl, "Link copied")}>Copy link</button>
            <a className="bg-btn ghost" href={shareUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={15} />Open in a new tab
            </a>
          </>
        ) : (
          <button className="bg-btn ghost" onClick={() => copy(text, "Brief copied")}><Copy size={15} />Copy</button>
        )}
        <button className="bg-btn" onClick={download}><Download size={15} />Download</button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Block
// ---------------------------------------------------------------------
export default function Block() {
  const [sharedId] = useState(() => {
    try { return new URLSearchParams(window.location.search).get("brief") || ""; } catch { return ""; }
  });

  const [page, setPage]   = useState(sharedId ? "shared" : "gate");
  const [email, setEmail] = useState("");
  const [site, setSite]   = useState("");
  const [err, setErr]     = useState("");
  const [busy, setBusy]   = useState(false);

  const [filmer, setFilmer]       = useState(null);
  const [channel, setChannel]     = useState(null);
  const [awareness, setAwareness] = useState(null);
  const [formats, setFormats]     = useState([]);

  const [clientUuid, setClientUuid] = useState("");
  const [tick, setTick]   = useState(0);
  const [brief, setBrief] = useState(null);   // { id, brand, sections }

  // Poll the briefs table for the row the workflow writes.
  const recent = useRecords({ select: readFields, count: 20 });
  useEffect(() => {
    if (page !== "generating") return;
    const t = setInterval(() => setTick((n) => n + 1), 3000);
    return () => clearInterval(t);
  }, [page]);

  useEffect(() => {
    if (page !== "generating" || !clientUuid) return;
    const rows = recent?.data || [];
    const hit = rows.find((r) => String(r?.fields?.clientUuid || "") === clientUuid);
    if (!hit) return;
    const f = hit.fields;
    const brandJson = safeParseJson(f.brandResearch) || {};
    const ctx = { formats, channel: channel?.label || "" };
    setBrief({
      id: hit.id,
      brand: brandJson.brandName || site.replace(/^https?:\/\//, "").replace(/\/.*$/, ""),
      sections: buildSections(f, ctx),
    });
    setPage("brief");
    // Her ask: the finished brief has its own address so it can be sent
    // straight to a creator. Pop-up blockers can stop this, so the same
    // link is always on the bar underneath.
    try { window.open(`${window.location.pathname}?brief=${encodeURIComponent(hit.id)}`, "_blank"); } catch {}
  }, [tick, recent?.data, page, clientUuid, formats, channel, site]);

  const toggleFormat = (f) =>
    setFormats((cur) => {
      const i = cur.findIndex((x) => x.name === f.name);
      if (i > -1) return cur.filter((_, j) => j !== i);
      return cur.length >= MAX_FORMATS ? cur : [...cur, f];
    });

  const submitGate = () => {
    setErr("");
    if (!isValidEmail(email)) return setErr("Enter a valid email address.");
    if (!isWorkEmail(email))  return setErr("Free email addresses are not accepted, so use the one you use for the business.");
    if (!isValidSite(site))   return setErr("Add the brand website, like brieflee.co.");
    fetch(LEAD_WORKFLOW_URL, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(), website: normaliseUrl(site), source: "ai-brief-generator",
        page_url: typeof window !== "undefined" ? window.location.href : "",
        submitted_at: new Date().toISOString(),
      }),
    }).catch((e) => console.error("Lead capture failed (continuing):", e));
    setPage("chat");
  };

  const generate = async () => {
    setErr(""); setBusy(true);
    const id = uuid();
    setClientUuid(id);
    const payload = {
      client_uuid: id,
      source: "ai-brief-generator",
      email: email.trim(),
      website_url: normaliseUrl(site),
      filmer: filmer?.label || "",
      channel_type: channel?.label || "",
      awareness: awareness?.label || "",
      // Kept singular for the existing workflow; the full picks ride along
      // beside it so the prompt can use all three once it is updated.
      selected_format_id: formats[0]?.name || "",
      selected_formats: formats.map((f) => f.name).join(", "),
      selected_format_ids: formats.map((f) => f.id).join(","),
      filmer_guidance:  FILMER_GUIDANCE[filmer?.label] || "",
      channel_guidance: CHANNEL_GUIDANCE[channel?.label] || "",
      hook_tactics:     AWARENESS_HOOK_TACTICS[awareness?.label] || "",
      format_guidance:  formats.map((f) => FORMAT_GUIDANCE[f.name] || "").filter(Boolean).join("\n\n"),
      target_type: "brand",
      page_url: typeof window !== "undefined" ? window.location.href : "",
    };
    try {
      await fetch(GENERATE_WORKFLOW_URL, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setPage("generating");
    } catch (e) {
      console.error("Brief generation failed:", e);
      setErr("We couldn't start the brief. Try again in a moment.");
    } finally { setBusy(false); }
  };

  const meta = [filmer?.label, channel?.label, awareness?.label, ...formats.map((f) => f.name)].filter(Boolean);
  const shareUrl = brief ? `${window.location.origin}${window.location.pathname}?brief=${encodeURIComponent(brief.id)}` : "";

  return (
    <div className="bg-w">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;500;600;700;800&display=swap');${CSS}`}</style>
      <div className="bg-wrap">
        <div className="bg-top">
          <img src={LEE} alt="" /><b>Lee</b><span>· brief generator</span>
        </div>

        {page === "shared" && <SharedBrief recordId={sharedId} onMiss={() => setPage("gate")} />}

        {page === "gate" && (
          <Lee>
            I'll write you a creator brief in about a minute. Where should I look at the brand?
            <label className="bg-lbl">Your work email</label>
            <div className="bg-in">
              <input type="email" value={email} autoFocus placeholder="you@company.com"
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submitGate(); }} />
            </div>
            <label className="bg-lbl">Brand website</label>
            <div className="bg-in">
              <input type="text" value={site} placeholder="brieflee.co"
                onChange={(e) => setSite(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submitGate(); }} />
            </div>
            {err ? <p className="bg-err">{err}</p> : null}
            <div style={{ marginTop: 14 }}>
              <button className="bg-btn" onClick={submitGate}>Start<ArrowRight size={16} /></button>
            </div>
            <p className="bg-note">Your brief arrives by email, along with the occasional email from Brieflee. Unsubscribe anytime.</p>
          </Lee>
        )}

        {(page === "chat" || page === "generating" || page === "brief") && (
          <>
            <Mine>{site.replace(/^https?:\/\//, "")}</Mine>

            <Lee>
              Who's filming this one?
              <Opts options={FILMER_OPTIONS} value={filmer?.label}
                onPick={(o) => { setFilmer(o); setFormats([]); }} />
            </Lee>

            {filmer && (
              <Lee>
                Where is it going?
                <Opts options={CHANNEL_OPTIONS} value={channel?.label} onPick={setChannel} />
              </Lee>
            )}

            {filmer && channel && (
              <Lee>
                How well do they know you already?
                <Opts options={AWARENESS_OPTIONS} value={awareness?.label} onPick={setAwareness} />
              </Lee>
            )}

            {filmer && channel && awareness && (
              <Lee wide>
                Pick up to {MAX_FORMATS} formats and I'll build the brief around them.
                <FormatPicker filmer={filmer.label} picked={formats} onToggle={toggleFormat} />
                {err ? <p className="bg-err">{err}</p> : null}
                {page === "chat" && (
                  <div style={{ marginTop: 16 }}>
                    <button className="bg-btn" disabled={!formats.length || busy} onClick={generate}>
                      {busy ? <Loader2 className="animate-spin" size={16} /> : null}
                      Build my brief{formats.length ? ` · ${formats.length} of ${MAX_FORMATS}` : ""}
                    </button>
                  </div>
                )}
              </Lee>
            )}

            {page === "generating" && (
              <Lee><Loader2 className="animate-spin" size={16} /> Reading the site and writing your brief. About a minute.</Lee>
            )}

            {page === "brief" && brief && (
              <>
                <Lee>Here it is. I've written it the way a creator reads it, so you can send it as it is.</Lee>
                <div className="bg-row">
                  <img className="bg-av" src={LEE} alt="" />
                  <BriefDoc brand={brief.brand} meta={meta} sections={brief.sections} />
                </div>
                <ActionBar label="Ready to send to a creator"
                  text={briefToText(brief.brand, meta, brief.sections)} shareUrl={shareUrl} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
