# Handover: building the v3 lead magnet pages

For the next session. Everything needed to build is in here or linked from here. Written 2026-07-31.

---

## What you are building

Four free-tool pages get rebuilt from approved copy. They are already live and already rank, so this is a rebuild in place, not a launch.

| Page | Copy source | Live traffic |
|---|---|---|
| `/free-tool-tiktok-video-analyser` | `tiktok-video-analyser/COPY-v3.md` | 792 clicks / 8,006 imp / 9.9% CTR |
| `/free-tool-video-breakdown` | `video-breakdown/COPY-v3.md` | 551 / 10,189 / 5.4% |
| `/free-tool-instagram-reel-analyser` | `instagram-reel-analyser/COPY-v3.md` | 26 / 251 / 10.4% |
| `/free-tool-youtube-shorts-analyser` | `youtube-shorts-analyser/COPY-v3.md` | 14 / 174 / 8% |

**Build in that order.** TikTok first: most traffic, best click rate, so the fix pays back fastest. Instagram and Shorts earn 40 clicks a month between them and can wait.

**The COPY-v3.md files are the source of truth for every word.** Do not improve the copy while implementing. It has been through seven scoring agents and several rounds with Bev. If something does not fit the layout, flag it rather than rewriting it. Each file has scored short variants at the bottom where one exists.

---

## The one change that actually matters

Everything else is a copy swap. This is not.

**Today:** user pastes a URL, sees a fake loading animation, hits an email gate, then a signup, then a card. Nothing is scored before the ask.

**Required:** the score renders **before** any gate.

```
paste URL
  ↓
real analysis runs
  ↓
SCORE ON SCREEN          ← 82/100, verdict line, 5 headline checks. No account.
  ↓
work-email gate          ← buys the full 24-agent breakdown, emailed
  ↓
(much later, /sign-up)   ← trial, card, not on this page
```

**Why this is non-negotiable:**

1. **The search listing promises it.** The meta description says "get a free AI breakdown... in 60 seconds". Delivering a gate instead is a promise gap, and people bouncing back to Google is a ranking signal you cannot afford on a page doing 8,000 impressions.
2. **The page currently says something untrue.** "No login until you've seen the breakdown" is in the live copy and is false today. v3 keeps that line, so the flow has to make it true.
3. **It is the conversion fix.** 792 clicks a month are hitting a card wall.

**No credit card anywhere in this flow.** The only ask on these pages is a work email. The trial and its card live on `/sign-up`.

**If the analysis cannot render a real score before the gate yet, stop and say so.** That is a blocker, not something to design around with a fake score. A plausible interim is a genuine but partial score (fewer agents, faster) with the full 24 behind the email.

---

## Per-page block mapping

Existing blocks live in each page folder as `.jsx`. Reuse them; do not start from scratch.

**TikTok analyser** has 5 blocks: `hero`, `what-you-get`, `how-it-works`, `faq`, `final-cta`.
**Video breakdown** has 8: the above plus `frame-by-frame`, `comparison`, `who-uses-it`.
**Instagram and Shorts** have 5 each, same as TikTok.

v3 adds two sections every page needs:

- **"The pile"** sits directly under the hero. New block. It is the emotional centre of the page and must not be buried further down.
- **"Meet the 24 Review Agents"** is a grouped list, no interaction needed.

And one section that is different on every page and is the reason each page exists separately:

- TikTok: no dedicated section, the platform specificity sits in the copy throughout
- Breakdown: keep `frame-by-frame` and `comparison`
- Instagram: **"What Reels check that other platforms do not"** (caption strip, action rail, grid crop, cover frame)
- Shorts: **"What Shorts check that other platforms do not"** (the loop, title over frame, thumbnail, length)

**Do not let those two become the same section with words swapped.** All four pages currently run near-identical copy, which is the likeliest reason Instagram sits at 251 impressions while TikTok pulls 8,006. Google picks one page from a duplicate set and discounts the rest.

---

## Do not touch

**The SEO title and meta description on the TikTok page.** They earn 9.9% and any change risks the thing that works. `seo-metadata.md` has them.

The other three pages have recommended title and meta changes written in their COPY-v3 files. **Apply those only after the page behind them converts**, one change at a time, four weeks apart. Testing a listing that leads to a card wall only measures how fast people bounce.

**These phrases are load-bearing for search and stay verbatim:** "break down", "frame by frame", "under 60 seconds", and the platform names.

---

## Softr Vibe constraints

Known gotchas that will cost you an afternoon otherwise:

- **Data layer:** fields resolve at `data.fields.<camelCaseAlias>`. Use `useRecord` with `useCurrentRecordId`. External REST goes through `useProxyFetch`.
- **The validator rejects saves silently.** Two known causes: an unused declaration, or a conditional spread inside `q.select()`. If a block will not save, check those two first.
- **No URL parsing inside a create block.** URL parsing combined with `useRecordCreate` kills the analyser. Use the inline `useState` escape hatch.
- **Forms auto-fill at most two fields:** the user id and ONE linked record. Anything else comes via URL params or a LOOKUP.
- **Create via a native Softr form, edit via Vibe `useRecordUpdate`.** That is the house architecture, do not invert it.
- **`useUpload()` returns `{ uploadAsync, isUploading }`, and `uploadAsync` returns an ARRAY.** Write it back as `[{ filename, url }]`.
- **Modals:** `window.openSwModal(url, size)`. A plain anchor will not trigger one.

**Hero block wiring** (from the existing README): Source tab connects to the `Tools` table in the `brieflee leads` database, Actions tab enables Add Record, aliases auto-populate from `q.select`.

---

## Copy rules that must survive implementation

These are hard rules, not preferences. Breaking them is a defect.

- **No emojis anywhere in rendered UI.** Not in status rows, not in section markers, not as bullets. Use a Brieflee illustration or engraving from Cloudinary (`dchroynzv`) instead. Emojis are fine in email body copy only.
- **No em dashes.** Full stops, commas, colons.
- **Never "ship" or "shipping".** Review, check, break down, score.
- **Trial copy is "Free for 7 days."** Never "no card needed" or any variant. The trial requires a card.
- **The checks are called Review Agents**, consistently. Not "AI Review Agents", not "agents", not "checks".
- **Work email stated plainly** wherever the gate appears. Free domains are rejected, so say so at the field rather than after the error.

---

## Design notes carried from the copy

- **The three flag rows in "The pile"** (0:07 hook landed late, 4s product on screen, 0:22 first brand mention) must be visually labelled as example flags from one real score. Loose numbers on a marketing page read as research findings.
- **Score reveal composition:** score chip, one-line verdict, five headline checks with pass and flag states. Green for pass, red only for flags.
- **Gate sits under the score, never in front of it.** It must also work if placement is A/B tested, so it cannot depend on surrounding context.

---

## Open questions

1. **Can the analysis return a real score before the gate?** The whole build rests on this. Confirm before starting.
2. **Shorts page only:** the copy describes a loop check and a length-versus-retention check. If neither is among the 24 agents today, either build them or soften those lines. The loop is the reason that page is differentiated, so building it is the better answer. Do not describe a check that does not run.
3. **Instagram page only:** the copy describes safe-zone checks specific to Instagram's caption block and action rail. Confirm the safe-zone agent is platform-aware, or soften to generic safe zones.

---

## Definition of done

- [ ] Score renders on screen with no account
- [ ] Work-email gate sits below it and unlocks the full 24-agent breakdown
- [ ] No card requested anywhere on these pages
- [ ] "No login until you have seen your score" is now true
- [ ] Every word matches COPY-v3.md
- [ ] No emojis in rendered UI
- [ ] Instagram and Shorts each carry their own platform-specific section, not a reworded copy of the other
- [ ] TikTok title and meta unchanged
- [ ] Mobile checked at 390px, desktop capped around 1140px

---

## 2026-08-19 update: Trojan pages now end at /book-a-demo

The indexed `/free-tool-*` video pages run the merged v2 "holding" block (`page-v2-single.jsx` in each folder, now the live source). Bev's model is annual, demo-first, no trial, so on 2026-08-19 all five were changed live via the Softr MCP:

- Card copy: "Breakdown queued" / "Your X breakdown runs live" / "The full frame-by-frame breakdown of this video happens on a free 30-minute call, on your video, no account needed. Drop your email and pick a time." Button "Pick a time".
- After the email: lead_event still written; redirect to `https://www.brieflee.co/book-a-demo?email=...&intent=...`. The toast, the "we'll send the full report" line, the "Already have an account? Log in" line, the EmailIt subscribe (which shared `aud_4DSA1XCCy85CAbxnaGHSm2e1CVm` with the real checker pages), the `emailit` source and `useProxyFetch`/`toast` imports are gone.
- FAQ "Is it really free?" and how-it-works step 3 no longer mention signup, inbox or dashboard.

The real Score Your Video pages are the unindexed `/tiktok-checker`, `/instagram-reel-checker`, `/youtube-shorts-checker`, `/facebook-reel-checker`, `/video-checker` (analyser-v3). Never share an audience between the two families.
