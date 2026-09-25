# Brieflee Score Report — Design Brief

Brief for the visual design of the shareable Score Report. This document is self-contained. The output will be rebuilt inside an existing Softr Vibe Code block, so deliver a static HTML mock (details at the end), not production code.

## What this is

The artifact people keep and pass around after the free video analyser scores a video. Today the analyser (live on /free-tool-tiktok-video-analyser) shows results on screen; every "Copy link", "Share", emailed link, and "Download report" leads to this report. One design, three lives:

1. **The share link.** A `?score=` URL opens this report on the web. Sent to a colleague ("look at this before we approve it") or to the creator ("here's the feedback").
2. **The emailed breakdown.** The email links straight to it.
3. **The PDF.** "Download report" prints this same design to PDF, so the saved file and the shared page are the same object.

Every viewer who did not run the score is a prospect meeting Brieflee for the first time. The report must be genuinely useful AND quietly sell: "Scored by Brieflee" branding throughout, one conversion moment at the end.

## The two readers

- **A colleague at the brand or agency** (decision view): wants the score, the verdict, and the flags in ten seconds of skimming.
- **The creator who made the video** (feedback view): wants to know exactly what to change, with the second it happens and the frame beside it. The agent comments are written to be forwardable feedback, supportive and specific, never scolding.

Design ONE report that serves both by ordering: decision layer first (score, verdict, headline flags), feedback layer second (all 24 checks with timestamps and frames).

## Real data to design with

This is genuine output from a live run, use it instead of lorem:

- Score: **84 / 100**, 20 of 24 checks passed. Creator: **@Amelia ✨Reviews +TTS**. Video: 0:31, TikTok.
- Verdict: "Great authentic comparison hook and pitch for free shipping, but product application is missed (14s) and audio lacks closed captions."
- Overall comment (two short paragraphs): what works, then what to fix first.
- 24 agents in four groups, each row carrying: name, Pass or Flag pill, optional value ("88%", "1s", "31s"), optional timestamp ("0:22"), a one-or-two-sentence comment, and an optional 9:16 frame screenshot from that second. Examples:
  - Hook quality · Pass · 1s · "The verbal hook starts immediately at 1s, clearly stating the value of buying the bigger size."
  - Watchable on mute · Flag · 0:16 · "The overlay text only states 'FREE shipping glycolic acid', omitting all the spoken benefits and usage tips."
  - Safe zones · Flag · 0:22 · "The text overlay sits low in the lower third, risking overlap with TikTok's native caption box."
  - Product usage · Flag · 20% · 0:21 · "The product is held and gestured with, but liquid is never poured or applied onto skin."
- Groups: Hook and attention (5), Creator and delivery (5), Production quality (8), Brand and conversion (6).
- Also available: full scene-by-scene transcript, video thumbnail. Rows must degrade gracefully when a value, timestamp, frame, or comment is missing.

## Structure

1. **Report head**: "Scored by Brieflee" mark, creator handle, video thumbnail, date, duration, platform. The big score ring (N/100) plus "20 of 24 checks passed".
2. **Verdict band**: the one-sentence verdict, prominent.
3. **What to fix first**: the flags pulled out on top, each with timestamp and frame. This is the money section for both readers.
4. **All 24 checks**: the four groups, every agent row. Frames beside the rows that have them.
5. **Transcript** (collapsed or clearly secondary).
6. **Close**: watermark strip plus the conversion moment for brand-side viewers: "Review all your creator content with Brieflee" with a "Book a demo" button, and a "Score your creator's video. Free." link back to the tool for the viral loop.

## Brand system

- Colours: primary `#294ff6`, accents `#4466f8` `#5e7bf6` `#7a93ff` `#879cf7`, navy `#000f4d`/`#001364`, backgrounds `#f8fbff` `#eef4fd`, pill `#d9e0ff`. Pass green (soft `rgba(45,170,99,.12)` fill, `#2DAA63` text), flag soft red. No red brand accents.
- Type: Inter. White cards, rounded-xl, subtle shadows, pill badges. Generous white space.
- Hard rules: NO emojis anywhere. No em dashes. Evergreen copy. The checks are called "Review Agents". Never the word "ship". Trial copy, if used, is "Free for 7 days." exactly.
- Brieflee mark asset (3D glasses-with-eyes, transparent): `https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_review-eyes-glass-3d-clearer-periwinkle-transparent_2026-07.png`

## Formats

- **Web**: desktop (1140px cap) and mobile (390px). This renders inside the analyser page, so no site nav, the report is the whole canvas.
- **Print/PDF**: a single-flow print layout of the same content, clean on A4, groups never splitting mid-row, ink-friendly (white background, no heavy fills), watermark on the footer of every page. Design it as its own labelled screen in the deliverable.

## Deliverable

One self-contained HTML file (inline CSS, no build step), same format as previous Brieflee design handoffs: each state as a labelled screen, desktop and mobile widths, real copy from this brief. The three screens: web report desktop, web report mobile, print layout.
