# Score Your Video — Design Brief

Brief for the visual design of Brieflee's Score Your Video tool. This document is self-contained: everything the designer needs is in here. The output will be rebuilt as a Softr Vibe Code block, so deliver a static HTML mock (details at the end), not production code.

## What this is

A free, public tool for brands and agencies: drop in a creator's short-form video (paste a TikTok, Instagram, or YouTube link, or upload a file) and 24 AI Review Agents score it, producing a score card and a full check-by-check breakdown behind a light email gate.

It is Brieflee's top-of-funnel keystone. A marketer scores one video, sees exactly how Brieflee reviews content, and the path from "that was useful" to a 7-day trial is one click. Every screen should feel like a preview of the product they'd be buying.

## Audience and funnel

- Who lands here: a brand marketer or agency running creator content. They've seen a creator's video (their own campaign, a competitor's, a creator they're considering) and want a fast, objective read on it.
- The promise: 24 AI Review Agents watch the video and show you exactly what works and what needs a second look, in about a minute.
- The conversion: email capture unlocks the full breakdown, and the closing CTA drives to /sign-up: "Review all your creator content with Brieflee. Free for 7 days."

Copy set:
- Headline: Score your creator's video. Free.
- Subhead: 24 AI Review Agents watch the video and show you exactly what works and what needs a second look, in about a minute.
- Email field: Your work email (free email domains are rejected, so the microcopy should say work email plainly).
- Primary end CTA: Review all your creator content with Brieflee. Free for 7 days. Links to /sign-up.
- Secondary end CTA: Score another video.

## Brand system

Brieflee is clean, minimal, generous with white space. This page is a marketing surface that previews the product, so it can be slightly warmer than app chrome, but it must still read as the same product.

Colours:
- Primary blue `#294ff6` (CTAs, key accents, score numbers)
- Blue accents `#4466f8`, `#5e7bf6`, `#7a93ff`, `#879cf7`
- Navy `#000f4d` (headings), `#001364` (secondary dark)
- Light backgrounds `#f8fbff`, `#eef4fd`, periwinkle pill `#d9e0ff`, lavender `#d8d8ff`, ice `#ccedff`
- Status: pass green (soft, e.g. `rgba(45,170,99,.12)` fill with `#2DAA63` text), warn amber, fail soft red. Semantic use only. No red brand accents.

Components: white cards on `#f8fbff`, rounded-xl, subtle shadows, thin `#eef4fd` borders at most, pill badges (`#d9e0ff` fill, `#294ff6` text). Primary CTA: `#294ff6` fill, white text, rounded-lg. Headings bold navy, body muted grey.

Hard rules:
- NO emojis anywhere in the UI. Use the Brieflee illustration below where personality is needed.
- No em dashes in any copy. Full stops, commas, colons instead.
- Evergreen copy only: nothing like "new", "just launched", "now available".
- Never the word "ship" or "shipping". Use review, check, score.
- The customer-facing name for the checks is "Review Agents".
- Trial copy is "Free for 7 days." Never "no card needed".

Key asset, the Review Agents illustration (3D glasses-with-eyes, periwinkle, transparent background):
`https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_review-eyes-glass-3d-clearer-periwinkle-transparent_2026-07.png`

## The five states

Design all five as separate screens. Desktop is the primary canvas (max content width around 1140px, centred): this audience works at a desk. A 390px mobile version is also required.

### 1. Input

Hero: headline + subhead, then one focal input card:
- A single URL field ("Paste a TikTok, Instagram or YouTube link") with a Score button.
- An "or upload a video" drop zone beneath.
- Under the card, a quiet trust row: "24 Review Agents", "Results in about a minute", "Free".

Below the fold: a small preview of what you get (a miniature score card visual) so the promise is concrete. Keep the page short; this is a tool, not a landing page essay.

### 2. Processing

This is a wow moment, make it feel alive but keep it honest:
- The Review Agents illustration centre stage.
- A live-feeling status line cycling through agent names ("Checking the hook…", "Listening for the brand mention…", "Watching it on mute…").
- A progress indicator (indeterminate is fine) and the count: "24 agents watching".
- Runs roughly 30 to 90 seconds, so design it to be pleasant to stare at. No fake percentage counters.

### 3. Score reveal (the card)

The signature screen. A vertical score card that looks like a product screenshot worth keeping:
- Big overall score as N/100 inside a ring (ring fill uses the blue palette, score number `#294ff6` or navy).
- Video thumbnail with the creator handle if we have it.
- A short verdict line (one sentence, specific and useful in tone).
- Five to six headline checks as a compact list with pass ticks and flag marks (e.g. Hook, Brand mention, Creator visibility, CTA, Audio). Green tick pills for passes, soft red flag pills for misses.
- Watermark, always visible, part of the composition rather than an afterthought: "Scored by Brieflee" plus the tool URL along the card's bottom edge.
- Compose the card inside a 4:5-ish frame that also crops safely to 9:16, so it holds up when downloaded or dropped into a deck or a Slack thread.

Around the card (not part of the shareable crop): share actions (Download image, Copy link, Share) and the gate or CTA depending on placement.

### 4. Email gate + full breakdown

The gate: a compact inline card ("See the full breakdown from all 24 Review Agents") with a work-email field, a marketing opt-in checkbox, and an Unlock button. Design it so it can sit either before the score reveal or after it (we A/B the placement), so it must not depend on surrounding context.

The full breakdown, unlocked: all 24 Review Agents grouped in four accordion groups, each header showing "N of M passed":

1. Hook & attention: Hook quality, Visual hook, Scene pacing, Video length, Watchable on mute
2. Creator & delivery: Creator visibility, Energy & authenticity, Wardrobe & appearance, Audio delivery, Pronunciation
3. Production quality: Audio clarity, Music & sound balance, Lighting & camera, Setting & background, Text legibility, Closed captions, Safe zones, Distracting elements
4. Brand & conversion: Product visibility, Product usage, Brand name mentioned, Brand alignment, CTA present, Copyright check

Each agent row: agent name, status pill (Pass / Flag), score where numeric, a one-line comment, and an optional timestamp chip (e.g. "0:03") plus an optional screenshot thumbnail. Rows must degrade gracefully when a comment, timestamp, or screenshot is missing.

Above the groups: the score band repeated small (score + "N of 24 checks passed") so the breakdown stands alone when scrolled to.

### 5. Conversion close

After the breakdown, the closing section: one line that bridges from the single video to the product ("This is how Brieflee reviews every video your creators make"), the primary CTA (Review all your creator content with Brieflee. Free for 7 days.), the secondary CTA (Score another video), and the share actions repeated small. Keep it to one screen height.

## Failure state

One more small design: a friendly error card for when a link cannot be fetched or scoring fails. Message ("We couldn't read that video. Try uploading the file instead."), a retry button, and the upload drop zone repeated. Same visual language, no alarm styling.

## Deliverable

- One self-contained HTML file (inline CSS, no build step), same format as previous Brieflee design handoffs.
- All five states plus the failure state as full screens, desktop (1140px cap) and mobile (390px).
- Use the real copy from this brief.
- Placeholder video thumbnail is fine; use any vertical-video-shaped grey block.
- The Review Agents illustration from the URL above is the only image asset you need.
