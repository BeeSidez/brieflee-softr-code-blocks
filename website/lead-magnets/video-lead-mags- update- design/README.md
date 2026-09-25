# Handoff: Brieflee free-tool analyser cluster (4 landing pages)

## Overview

Four free-tool lead-magnet landing pages for Brieflee, each ending in an emailed 24-agent video breakdown. They are a deliberate SEO cluster: one broad umbrella page plus three platform-specific pages.

| Page | Route | Role |
|---|---|---|
| Video Breakdown | `/free-tool-video-breakdown` | Umbrella, platform-agnostic. Highest impressions. |
| TikTok Video Analyser | `/free-tool-tiktok-video-analyser` | Highest CTR. The reference implementation — build this first. |
| Instagram Reel Analyser | `/free-tool-instagram-reel-analyser` | Platform-specific. |
| YouTube Shorts Analyser | `/free-tool-youtube-shorts-analyser` | Platform-specific. |

All four are written to one avatar: **someone who manages creators for brands and has a lot of content to review.** Copy source of truth is `COPY-v3.md` in each folder of the `lead-magnets` repo — not this README — if the two ever disagree.

## About the design files

The HTML files in this bundle are **design references created in HTML**. They are prototypes showing intended look, copy and state flow. They are **not production code to copy directly.**

The task is to recreate these designs in the target codebase's existing environment (these ship as Softr custom-code blocks today, so the existing block structure and React conventions in `brieflee-softr-code-blocks` apply) using its established patterns, tokens and component library. Where this bundle and the codebase disagree on how to build something, the codebase wins; where they disagree on what it should look like, this bundle wins.

Each HTML file is a **single scrolling "desk"** that lays out every state of the page one after another, each labelled with a numbered slug (01 Input, 02 Processing, and so on). That is a review convenience, not the real page. In production these are **states of one page**, not six pages.

There is a Width toggle in the top bar (Mobile 390 / Desktop 1140) that sets `data-w` on `<body>`. The layouts are driven by CSS container queries at a 700px breakpoint, so they respond to the container, not the viewport.

## Fidelity

**High-fidelity.** Final colours, typography, spacing, copy and interaction detail. Recreate pixel-perfectly using the codebase's existing libraries. All copy in these files is final and approved — do not paraphrase, re-order or "tighten" it.

## The state flow

One page, six states. **The order matters and was the subject of an explicit decision:**

```
01 Input  →  02 Processing  →  03 Score reveal + gate  →  04 Full breakdown  →  05 Share  →  06 Failure
```

**The email gate sits UNDER the score, never in front of it.** A visitor pastes a URL, the agents run, and the score out of 100 renders with no account and no email. The gate then appears beside/below the score card and asks for a work email in exchange for the full check-by-check breakdown. The page's own FAQ and hero promise this ("no account until you have seen your score"), so moving the gate earlier breaks a stated promise. An earlier revision had the gate before processing; it was deliberately reversed.

### 01 Input
The landing page proper: hero, then eight to eleven content sections (see "Sections" below).

### 02 Processing
Fires immediately on submit. Shows the pasted video as a small card ("Now watching", handle, duration and platform), a haloed Review Agents mark, a rotating status line, an indeterminate bar, and 24 dots that fill progressively. Status lines cycle every 1800ms. **No fake percentage** — the bar is indeterminate by design and the copy says "Usually takes under a minute."

### 03 Score reveal, then the gate
Two columns at desktop (420px score card + fluid aside), stacked on mobile.

Left: the score card — video thumbnail with duration badge, a 126px SVG progress ring showing 82/100, a meta row (score label, handle, "19 of 24 checks passed"), a verdict paragraph on a periwinkle panel, five headline checks with Pass/Flag pills, and a dark watermark footer ("Scored by Brieflee" / brieflee.com/score). The card is composed to **crop safely to 4:5 and 9:16** for sharing; a note under it marks where the shareable crop ends (at the watermark edge).

Right: the gate. Heading "See all 24 checks", the sub, a work-email field, "Send my full breakdown", microcopy that free email addresses are rejected, and an unchecked marketing opt-in.

### 04 Full breakdown
A score band, then four collapsible groups (Hook and attention 5, Creator and delivery 5, Production quality 8, Brand and conversion 6 — 24 total). First group open by default. Each agent row: name, Pass/Flag pill, optional score out of 10, optional timestamp chip, and a one-line comment. Some rows carry a still frame from the video at the relevant second.

### 05 Share
Single screen height. Closes on the Brieflee trial: "That is one video. You have a hundred." Share buttons plus two CTAs.

### 06 Failure
Same visual language, deliberately **no alarm styling** — no red, no warning iconography. Explains the likely causes (private, deleted, region-locked) and offers file upload as the fallback.

## Sections on state 01

The umbrella page carries eleven sections; the three platform pages carry nine. Section bands alternate between the page background and a tinted `alt` background — **preserve the alternation**, it is what gives the long page rhythm.

Order on the three analyser pages:

1. **Hero** — see below
2. **Why things get missed** ("the pile") — the emotional centre. Heading: "You are not missing things because you are careless. You are missing them because there are forty of them." Below it three example flag rows under a visible label "From a real breakdown". **Keep that label** — without it the rows read as research findings rather than one video's output.
3. **What you get** — three feature cards then six supporting benefits in a two-column grid.
4. **How it works** — three numbered steps.
5. **Built for <platform>** — platform-specific, six items. **This section is the entire point of the platform pages** (see "The duplication problem" below). Absent from the umbrella page.
6. **Meet the 24 Review Agents** — four groups as chip lists.
7. **When to use it** — four moments in a normal week.
8. **Questions** — 9 to 11 FAQs as `<details>`.
9. **Final CTA** — dark band, two blurred blobs, platform logos, two buttons.

The umbrella page replaces section 5 with three of its own: **What "frame by frame" actually means** (a detected-list plus a two-shot product visual), **Brieflee vs the rest** (a six-column comparison table — the biggest SEO asset on that page, keep it intact), and **Who uses it** (four personas).

### The duplication problem — read this before touching the platform pages

All four pages previously ran near-identical copy with the platform word swapped. Google appears to have picked one and discounted the rest: TikTok pulls 8,006 impressions while Reels sits at 251 and Shorts at 174. Section 5 is the fix, and **it only works if it stays genuinely platform-specific.** Do not refactor the three "Built for X" sections into one shared component fed by a config object — the whole point is that the content differs, and a shared component invites someone to collapse it back to a template later.

- **Built for Reels** — the caption and audio strip, the right-hand action rail, the grid crop, the cover frame, original vs trending audio, saves and shares.
- **Built for Shorts** — the loop, the title over the frame, the Shorts interface, the opening frame as a thumbnail, length against retention, spoken clarity for search.

## The hero

Identical structure on all four, lifted from the shared Brieflee free-tool hero (`lead-magnets/*/hero.jsx`).

Two-column grid at desktop (`minmax(0,1.1fr)` + `minmax(300px,1fr)`, 56px gap), single column stacked on mobile. Behind it a "wash": a radial gradient, two blurred blobs and a faint 1px grid.

Left column, in order:
1. **Eyebrow pill** — periwinkle background, small pulsing dot, the tool name.
2. **H1** — navy, two sentences, no line break, wraps naturally.
3. **Animated line** — periwinkle (`--blue5`), same weight and size as the H1 (33px mobile / 50px desktop), a single cycling phrase with a blinking caret. **The H1 never depends on the animation** — someone landing mid-loop still reads a complete sentence.
4. **Subhead** — max 46ch, left aligned.
5. **Tabs** — pill group, "Paste URL" / "Upload file", toggling two panels.
6. **Input card** — field label, URL input with link icon, "Break it down" button. The upload panel has its own label, a dashed drop zone and a full-width button.
7. **Trust strip** — four items: "24 Review Agents watching" (with a pulsing dot), "Frame by frame", "Under 60 seconds", "Free".

Right column: a circular disc (radial gradient, 6px white border) containing a 9:16 video tilted -5deg, overlaid with a viewfinder treatment — four corner brackets, a faint grid, and a scan line sweeping on a 3s loop — plus a progress bar. Around the disc, floating 3D platform logos on a 7s float animation with staggered delays, a "Live AI analysis" chip with a pinging dot, and a score chip.

**Per-page hero variation:**

| Page | H1 | Animated phrases | Logos | Demo clip |
|---|---|---|---|---|
| TikTok | Creator made a video? Break it down in seconds. | TikTok Affiliate / TikTok GMV Max / UGC Creator / TikTok Content / TikTok Video / Whitelist Ad | TikTok + upload | `mia-v1` |
| Reels | Creator made a Reel? Break it down in seconds. | Creator Reels / UGC Videos / Partnership Ads / Branded Content / Organic Reels | Instagram + upload | `jas-v1` |
| Shorts | Creator made a Short? Break it down in seconds. | Creator Shorts / UGC Videos / YouTube Ads / Organic Shorts / Vertical Video | YouTube Shorts + upload | `talia-v1` |
| Umbrella | Creator made a video? Break it down in seconds. | TikTok / Instagram Reels / YouTube Shorts / Facebook Reels / UGC Videos / Spark Ads | all five | `example-1` |

**Note on the hero colour treatment.** The H1 is fully navy on all four pages and the periwinkle is reserved for the animated line. The `COPY-v3.md` docs specify a periwinkle second line in the H1 and a "Works with " prefix on the animated line; both were overridden in review in favour of what is built here. Build what is in the HTML.

## Interactions & behavior

- **Tabs** — click sets `aria-selected` and toggles `[hidden]` on the matching panel. Keep the ARIA `role="tablist"` / `role="tab"` wiring.
- **Typing loop** — types a phrase one character at a time at 70ms, holds 1400ms, deletes at 35ms, advances to the next phrase, repeats forever. The caret blinks on a 1.05s step animation.
- **Processing** — status line advances every 1800ms; the 24 dots fill as `j <= (i*3) % 25`. Purely decorative pacing, replace with real progress if the API exposes it.
- **FAQ** — native `<details>`/`<summary>`, plus icon rotating to a minus when open. Do not replace with a JS accordion.
- **Breakdown groups** — native `<details>`, chevron rotates 180deg when open. First group `open`.
- **Scan line** — 3s linear infinite, translating from -100% to 416% of its own height.
- **Floating logos** — 7s ease-in-out alternating float, per-logo `--d` delay and `--fx` direction.
- **Reduced motion** — none of the decorative animation is currently gated. **Add `prefers-reduced-motion` handling when you build it:** the scan line, float, pulse and typing loop should all stop.

## Responsive behavior

Everything is driven by **CSS container queries at a single 700px breakpoint** (`@container (min-width:700px)`), not media queries, so blocks respond to their container. Below it: single column, tighter padding, smaller type. Above it: two-column hero, 1140px max content width, three-up cards, two-up benefits and moments.

Design widths are **390 (mobile)** and **1140 (desktop)**. Test both.

## State management

```
state:        'input' | 'processing' | 'score' | 'breakdown' | 'failure'
inputMode:    'url' | 'file'
url:          string
file:         File | null
analysis:     { score, checksPassed, checksTotal, verdict, handle, duration, platform,
                thumbnailUrl, groups: [{ name, passed, total, agents: [...] }] }
gateEmail:    string
gateState:    'idle' | 'submitting' | 'sent' | 'error'
optIn:        boolean
error:        { code, message } | null
```

Transitions: submit → `processing` (fire analysis immediately, no email); analysis resolves → `score`; analysis rejects → `failure`; gate submit → POST email + analysis id, then `breakdown` on screen and the full breakdown by email.

**Validation:** the URL field should accept TikTok, Instagram Reel, YouTube Short and Facebook Reel URLs (the umbrella page) or only its own platform (the three platform pages). Uploads: MP4 or MOV, up to 200MB, clips up to three minutes. The gate rejects free email domains — that is a stated rule in the microcopy, so enforce it server-side too.

## Design tokens

Taken from the `:root` block. These mirror the Brieflee brand system — **prefer the codebase's existing tokens** where they already exist and only add what is missing.

```
--blue:   #294ff6   primary brand blue
--blue2:  #4466f8
--blue3:  #5e7bf6   button hover
--blue4:  #7a93ff   input icons
--blue5:  #879cf7   periwinkle: buttons, animated line, active tab
--navy:   #000f4d   headings
--navy2:  #001364
--page:   #f8fbff   page background
--card:   #fff
--l2:     #eef4fd   input fill, ring track
--peri:   #d9e0ff   eyebrow pill, verdict panel, blue pills
--lav:    #d8d8ff
--ice:    #ccedff
```

Type: **Inter**, weights 400/500/600/700/800. H1 800 at -0.03em; H2 700 at -0.02em; H3 700 at -0.01em. Body 13 to 18px, line-height 1.45 to 1.55. `text-wrap: pretty` on long paragraphs.

Radius: 8 (thumbs) / 10 (small buttons) / 11 (icon tiles) / 12 (inputs, buttons) / 14 (drop zone) / 16 (moments, gate video) / 18 (cards) / 999 (pills, tabs).

Shadow: cards `0 10px 30px -18px rgba(0,15,77,.22)`; video tile `0 16px 34px -16px`; logo drop shadow `drop-shadow(0 8px 16px rgba(41,79,246,.35))`.

Spacing runs on a 4px base; section padding 30/20/36 mobile and 64/40/72 desktop.

### Accessibility note, please resolve during build

Buttons and the active tab were changed to periwinkle (`--blue5` #879cf7) with white text at the client's request. That is roughly **2.9:1 contrast, below the WCAG AA 4.5:1 threshold.** Options: keep the periwinkle fill and switch button text to `--navy` (about 6.6:1), or darken the fill to `--blue3`/`--blue`. Raise it rather than shipping it as-is.

## Assets

All remote, no local files.

- **3D platform icons and the Review Agents mark** — Cloudinary, cloud `dchroynzv`, `.../image/upload/brieflee_icon_*`. Includes tiktok, instagram, youtube-shorts, facebook, upload-cloud logos and `brieflee_icon_review-eyes-glass-3d-clearer-periwinkle-transparent_2026-07.png`.
- **Demo video and frames** — Cloudinary, `.../video/upload/demo/veloure/`: `mia-v1`, `jas-v1`, `jas-v2`, `talia-v1`, `example-1` to `example-4`. Append `.jpg` for a still and `so_<seconds>/` before the path for a frame at that second. **These are placeholder UGC for the mock — swap for real or licensed footage before launch.**
- **Frame-by-frame product screenshots** (umbrella page only) — two Softr-hosted PNGs of real Brieflee output.
- **Font** — Inter via Google Fonts.

## Files

```
TikTok Video Analyser.html
Instagram Reel Analyser.html
YouTube Shorts Analyser.html
Video Breakdown.html
```

Build **TikTok first** — it is the reference implementation and the other three are variations on it. Then the umbrella page, then Reels and Shorts.

## Open questions for the team

1. Is the analysis endpoint live, and what is the real cost per run? The gate now sits after the agents, so every visitor who pastes a URL costs money whether or not they convert.
2. Does the remix brief ship with the free breakdown, or behind a further step?
3. **Shorts page:** the loop check and the length-versus-retention check are written as things the agents do. Confirm both exist among the 24, or soften those lines.
4. Should the shareable card be downloadable before the gate, or only after?
