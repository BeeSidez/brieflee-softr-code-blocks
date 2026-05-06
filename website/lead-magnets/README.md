# Lead Magnets — running roadmap

Status of every Brieflee free-tool lead magnet, what's shipped, what's queued, and the SEO bet behind each.

Last updated: 2026-05-06

---

## What's shipped

### `/free-tool-video-breakdown` ✅ blocks built

Eight Vibe Coding blocks live in [`video-breakdown/`](./video-breakdown):

1. `hero.jsx` — URL/file input + fake-loading + Trojan-horse email gate
2. `what-you-get.jsx` — 3 feature cards + 6 supporting benefits
3. `how-it-works.jsx` — 3-step explainer with platform logos in step 1
4. `frame-by-frame.jsx` — during/after composition with detected list
5. `comparison.jsx` — Brieflee vs Frame.io / Air / Dropbox Replay / ChatGPT
6. `who-uses-it.jsx` — 4 personas (DTC, agencies, B2B, creators)
7. `faq.jsx` — 8 PAA-targeted questions in an accordion
8. `final-cta.jsx` — scroll-to-top CTA bookend

**Bev still needs to (in Softr UI, not code):**

- [ ] Paste each block into a Vibe Coding block in order on `/free-tool-video-breakdown`
- [ ] Hero block: Source tab → connect to `Tools` table in `brieflee leads` database
- [ ] Hero block: Actions tab → enable Add Record (aliases auto-populate from `q.select`)
- [ ] Replace the existing hero on the page

**Workflow + onboarding follow-ups (not yet built):**

- [ ] `BL | Video Breakdown` workflow — Email 1: remove the "log in and re-paste the URL" instruction
- [ ] Email 1: change CTA from "Start free trial" to "Sign up free to view your breakdown"
- [ ] Email 2: cut from 4 features to 1 ("check your own content before posting")
- [ ] Email 3: lead with "Your video at \[URL\] is still in your queue" loss-aversion hook
- [ ] Tighten email cadence from 0 / 1 / 6 days to 0 / 2 / 4 days
- [ ] Add a branching step: if user signed up after Email 1, suppress Emails 2 + 3 (they belong in onboarding instead)
- [ ] Onboarding workflow: after signup, find Tools records by email and auto-create the dashboard items so users don't re-paste

---

## What's next (priority order)

### 1. `/ai-brief-generator` — highest-leverage new build

**SEO bet:** biggest under-served keyword cluster on-segment.
- "ai creative brief to video" (16 imp/mo, pos 16) — already showing impressions with no real page
- "how to brief ugc creators" (17 imp/mo, pos 37)
- "ugc brief", "ugc creator brief", "ugc content brief template" (small but on-intent)

**Why now:** strongest direct match for the B1 DTC marketer + A agency segments. Natural exit ramp from Video Breakdown ("you analysed a winning ad — now generate a brief from it").

**Status:** not started. Needs same hero + Trojan-horse + supporting sections treatment.

### 2. Platform-specific video analyser pages

Split-offs of `/free-tool-video-breakdown` with the same backend but platform-specific SEO targeting. We already rank top 10 for several of these without dedicated pages.

- [ ] `/free-tool-tiktok-video-analyser` — "tiktok video analyzer free" (19 imp/mo, pos 6.5)
- [ ] `/free-tool-instagram-reel-analyser` — "instagram video analyser" (50% CTR), "instagram video analysis tools/ai"
- [ ] `/free-tool-youtube-shorts-analyser` — "youtube shorts checker", "yt shorts analyzer"
- [ ] `/free-tool-facebook-ad-video-checker` — "facebook video checker" (already converting)

Each is the same hero block with platform-specific copy, pre-filtered URL validation, and a tighter feature list. Most of the work is reused.

### 3. UGC creator finding guide

**SEO bet:** ~55 imp/mo combined for "find ugc creators", "ugc creators for hire", "how to find ugc creators", "where to find ugc creators".

Build as a guide page (not a tool): "How to find UGC creators in 2026 — the brief-first method", funnels to the Brief Generator.

**Priority:** lower than 1 + 2 because the audience overlap with our buyer is fuzzy.

### 4. UGC Storyboard / AI Prompter

Clone the existing block from the [CreatorScans repo](https://github.com/BeeSidez/creatorscans-softr-code-blocks/tree/main/tools/ai-ugc-image-prompter), rebrand for Brieflee.

**SEO bet:** zero — this is a brand/social play, not search. Launch on LinkedIn + TikTok as a Bev-brand asset, capture emails.

### 5. UGC QA Checklist

LinkedIn-first PDF lead magnet: "The 26-point UGC QA checklist we use for every brand."

**SEO bet:** zero — distribution play. Strong product alignment though, since the QA Checklist is a core Brieflee feature.

---

## Existing pages to convert, not rebuild

The engagement rate calculators get ~2,400 impressions/month combined but convert at near-zero, and the audience is wrong (creators / students checking vanity metrics, not B1/A buyers).

**Action:** convert each into a content page (manual formula + benchmarks + CTA into Brief Generator or Video Breakdown). Don't delete — they have accumulated authority.

- [ ] `/tiktok-engagement-rate-calculator` → content page with manual formula
- [ ] `/instagram-engagement-rate-calculator` → same
- [ ] `/youtube-engagement-rate-calculator` → same
- [ ] `/facebook-creative-calculator` → keep, but rebuild the hero with the Brieflee eyes / 3D-logo treatment

---

## Parked

- **Hook Evaluator** — zero search demand for "hook evaluator" / related queries. Motion's tool is brand-driven, not SEO. Build later as a viral/social asset, not a top-3 priority.
- **Visual Format Library** — Bev hasn't articulated the idea yet. Don't build until the concept is clear.

---

## Reference docs

- Page-level SEO research + audit: `Brieflee/SEO/video-breakdown-optimisation-plan.md` (local, not in this repo)
- Tools table schema (field IDs, option UUIDs): `Brieflee/SEO/tools-table-schema.md` (local)
- Asset library: `docs/assets-images-gifs-videos.csv` (this repo)
- Vibe code block conventions: `docs/softr-vibe-code-block.md` (this repo)
