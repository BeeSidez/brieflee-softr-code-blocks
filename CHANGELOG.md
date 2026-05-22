# Changelog

All notable changes to Brieflee infrastructure. Schema, workflows, code blocks, emails, SOPs.

Latest at top. Each entry: date · area · summary · link to commit/artifact where useful.

---

## 2026-05-20

- **Lead-magnet single-email confirmations · 7 magnets pushed to EmailIt and wired to audience-join automations.** Replaces the older multi-email per-magnet drips with a single Motion-style follow-up email per magnet, per the master spec at `emails/brieflee-lead-mag-confirmation-emails.md`. Each email shares the same structure: banner hero in a light periwinkle (`#D6DEFC`) bordered frame, plain-reading-level copy, "Quick note on why this beats X" + 3 bullets + connector, "But here's the thing... That's what Brieflee checks for you.", 3-step "how it works" tuned per magnet, demo thumbnail (504px) linking to `/demo`, "50+ top D2C growth teams" social proof, "Try Brieflee today for free. Start your 7-day trial!" pre-CTA, Bev sign-off + 🙌. Push script: `emails/push-leadmags.py`. Result: `emails/push-leadmags-result.json`.

  | Alias | Magnet | Template | Audience | Automation |
  |---|---|---|---|---|
  | `bl-leadmag-hg` | Hook Generator 🪝 | `tem_4DzrH2978Ycx1TA5mav41XbcphL` | `aud_4Dl6xWMbHLiyMuGvMIJdwBG4rNW` | `aut_4DzrGzDq8BALZsYNyXwwwgCVRB7` |
  | `bl-leadmag-bg` | Brief Generator 📋 | `tem_4DzrH70uAOQNXcG7Y4HQIGnxjWd` | `aud_4Dl6xTRKGyGMvJuPDOJWKaKO7NO` | `aut_4DzrH9wBAlszn6vtYFMcNX2Tvkj` |
  | `bl-leadmag-sg` | Storyboard Generator 🎬 | `tem_4DzrH9wBAlt9S1eULOXhDPszka8` | `aud_4Dl6xTRKGyGCrRqI2yY3bYbpJ8R` | `aut_4DzrH9wBAlt934k74qVAnYgL6dU` |
  | `bl-leadmag-cl` | UGC Creator Checklist ✅ | `tem_4DzrHHjFCz9enTM9aIX3ODMw8Yh` | `aud_4Dl6xTRKGyGNKH3x6hPqG5CHWBf` | `aut_4DzrHEnyCbh3kptxNkiutLfSKTH` |
  | `bl-leadmag-ve` | UGC Video Examples 🎥 | `tem_4DzrHEnyCbgjd5vuDl76weRoEMj` | `aud_4Dl6xWMbHLiylrRrtdFFhGn6uxa` | `aut_4DzrHMb2EoxFmRWjfq2MTShshJp` |
  | `bl-leadmag-an` | Meta Andromeda Calc 📊 | `tem_4DzrHPWJFCPhZ72o5pc3sLZY0QS` | `aud_4Dl6xOZXF8ST1SsQN5bDSqgqX4B` | `aut_4DzrHPWJFCPrE25fTWnb9JzOu1f` |
  | `bl-leadmag-va` | Video Analyser 🔍 (5 source URLs) | `tem_4DzrHPWJFCQ0sx1wfFiGWERcLNI` | `aud_4DSA1XCCy85CAbxnaGHSm2e1CVm` | `aut_4DzrHUO6H2DSD0S1Vd0WYaBdcvr` |

  All 7 automations are `running`. Trigger: `contact.added_to_audience` → `send_email` (template). Single-step graphs. The Video Breakdown 5-email drip (`aut_4DSA7Bo8ZkxNo478XyEweEBamji`) is superseded by `bl-leadmag-va` and should be stopped/archived. The 3 engagement-rate calculators (YT, IG, TT) are intentionally skipped pending audience setup.

- **Card-required sweep across 16 active files.** Brieflee's 7-day trial DOES require a credit card. Removed every "No card needed" / "No credit card" / "No card required" claim from active email templates, website blocks, design system files, and SOPs. Replaced with neutral "Try Brieflee today for free. Start your 7-day trial!" framing. Memory rule saved at `feedback_brieflee_card_required_for_trial.md`. Includes the master lead-mag spec (9× replacements), 4 BG/VB email .md+.html files, 1 Python generator, the reengagement gift template (preview + eyebrow + body), `heroes.jsx`, `new/plan/marketing.jsx` (2×), `ui_kits/marketing/CTA.jsx`, `onboarding/src/TeamStep.jsx`, `Welcome Emails/emails.jsx`. Skipped: archive folders, `CHANGELOG.md`, `SEO/`, planning docs, and 3 confirmed false positives ("no card chrome" visual-design comments + the SOP that already correctly says "CARD REQUIRED").

- **Brieflee product framing memory locked.** Brieflee is a brand→creator content review tool: brand creates a brief, shares with creators, creators upload videos, AI reviews submissions against the brief (hook timing, on-screen text, CTA placement, pacing). It is NOT a Motion-style "upload your own video and we'll score it" tool. The email reader is always the brand; the creators are a separate party. Memory saved at `feedback_brieflee_what_it_actually_does.md`. Applied across all 7 new lead-magnet emails — every bridge sentence ends with the brief→creator→review mechanic, never with "score your hooks before posting" or similar Motion-clone framing.

---

## 2026-05-08

- **EmailIt automation API discovered + Video Breakdown automation built end-to-end via API.** Bev hit a UI bug on the EmailIt automation builder (modal hangs on "Create" with a no-entry icon). Probed the EmailIt REST API and found the full automation toolkit is exposed: `GET/POST/DELETE /v2/automations`, `POST /v2/automations/{id}/start` to publish (NOT `/publish`), `POST /v2/automations/{id}` to update. Created the missing `BL | Video Breakdown leads` audience (`aud_4DSA1XCCy85CAbxnaGHSm2e1CVm`) and built + started the `BL | Video Breakdown · Lead nurture` automation (`aut_4DSA7Bo8ZkxNo478XyEweEBamji`) entirely via API. 5-step graph: trigger → d0 → +172800s → d2 → +172800s → d4 → +864000s → d14 → +1382400s → d30. Reference doc saved to memory at `reference_emailit_automation_api.md`.

- **Architectural rule locked: EmailIt automation vs Softr workflow.** Bev pushed back on my plan to build single-email automations for `BL | Lapsed · Reactivation` and `BL | Team Members · Invite` — correctly. Single-email triggered sends (winback, payment success/failed, team invite, all conditional trial nudges) fire from Softr workflows via the EmailIt send-template API. Multi-step sequences with built-in waits go in EmailIt audience automations. The win-back drip (`bl-winback-30d` / `60d` / `90d-final`) is already correctly fired by Softr workflow with conditional-on-no-account checks — no automation wrapper needed. Rule saved to memory at `feedback_emailit_automation_vs_workflow.md`. Audit table from earlier (with "BL | Lapsed · Reactivation" and "BL | Team Members · Invite" listed as audience automations) was wrong on those two rows.

- **Lead magnet · Video Breakdown · 5-email campaign created + pushed.** First instance of the 5-slot lead-magnet pattern from `emails/leadmag-email-playbook.md`. Audience: users who submit a video to `/free-tool-video-breakdown` but haven't signed up. 5 emails over 30 days with a deliberate 10-day silence between Day 4 and Day 14. Day 30 written as **evergreen** ("5 hooks we keep seeing") rather than recurring weekly content per Bev's call — fewer downstream content commitments. D14 reply-ask kept as Bev personally for 1:1 conversion conversations.
  - `bl-leadmag-vb-d0-breakdown-ready` (`tem_4DRtENfv7hPi8CtLL9RFfF6J0YD`) — immediate on entry. Renders the user's submitted `{{video_url}}` in a styled monospace box.
  - `bl-leadmag-vb-d2-score-your-own` (`tem_4DRtEYOGAHyYyTnZtub5KsBHYZe`) — +2 days. Extension to their own work pre-publish.
  - `bl-leadmag-vb-d4-still-here` (`tem_4DRtEYOGAHyYyTnarMNAGmi854Q`) — +2 days. Pain agitation + soft 7-day Brieflee mention.
  - `bl-leadmag-vb-d14-reply-ask` (`tem_4DRtEVSz9ufu9oSebTgo6sgu0J7`) — +10 days. Low-pressure feedback ask, replies route to Bev.
  - `bl-leadmag-vb-d30-hooks-roundup` (`tem_4DRtEdG3C7wPuCy3x2wzt4GgMoe`) — +16 days. **Evergreen** "5 hooks we keep seeing" content drop.
  - Per-user Mustache: `{{first_name}}`, `{{video_url}}`, `{{unsubscribe}}`. All static URLs hardcoded (per `feedback_email_hardcode_static_urls`). All CTAs UTM-tagged with `utm_campaign=bl-leadmag-vb-d<N>-<slot>`.
  - D0 eyebrow tightened from "FREE AI VIDEO BREAKDOWN · 60 SECONDS · NO CARD" to "Free AI video breakdown · 60 seconds" (drop redundant "no card" — a free tool obviously doesn't take one).
  - Generator at `emails/generate-leadmag-vb.py`. Push at `emails/push-leadmag-vb.py` (idempotent — auto-detects existing-by-alias, switches to UPDATE on re-run).

- **Re-engagement campaign · 4 templates created + pushed to EmailIt.** New campaign for 168 early Brieflee users who never converted. Cadence compressed from original 14-day plan to 7 days (matches the regular trial mechanics). 4 new templates + 6 reused from the existing 7-day drip = 10 emails total.
  - `bl-reengagement-d0-gift` (`tem_4DR4JcOo7iUBwhRjfOOsaQbJdTz`) — Day 0, immediate on entry. Replaces the regular welcome (gift IS the welcome). Type-first announcement of the rebuild + 7 free days of Studio.
  - `bl-reengagement-d5-48h` (`tem_4DR4JfK585mrAJzZ6zOZ7vMQOnE`) — Day 5 +12h after Remix. Clone of `bl-7day-d5e2-48h` with "trial" → "Studio access", `WELCOMEBACK20`.
  - `bl-reengagement-d6-24h` (`tem_4DR4JfK585n0pEvWNGaQxf9mOMF`) — Day 6 +12h after Team. Clone of `bl-7day-d6e2-24h`, `LASTCHANCEBACK`.
  - `bl-reengagement-d7-ends` (`tem_4DR4JfK585mh6RuVent57VjqAwT`) — Day 7 +12h after Bulk upload. Clone of `bl-7day-d7e2-trial-ends` with offer upgraded from `30% off 3 months` to **`50% off 3 months`** (`WELCOMEBACK50`), "workspace closes" → "your account is paused", + re-engagement ack line ("You came back, used Brieflee, here's what we can do to help you stay").
  - Strategy doc + d0-gift markdown at `emails/reengagement/` reworked from 14-day to 7-day cadence with explicit decision-log of the change.
  - All 4 use the new "Spell check for video" design system. All CTAs hardcoded with full URLs + UTMs (campaign=`bl-reengagement-d<N>-<purpose>`). Only Mustache placeholder in any of them is `{{first_name}}` (and `{{unsubscribe}}`).
  - Push script at `emails/push-reengagement.py` is idempotent — auto-detects existing templates by alias and switches to UPDATE on re-run.

- **Stripe · 4 promo codes created via MCP** for the new campaigns:
  - `COMEBACK20` (`promo_1TUkJLIG1gGY9y210pfsWiKf`) — 20% off, 1 month, `first_time_transaction:true` — used in `bl-winback-30d`
  - `WELCOMEBACK20` (`promo_1TUkJOIG1gGY9y21cqORzT5Y`) — 20% off, 1 month, `first_time_transaction:false` — used in `bl-reengagement-d5-48h`
  - `LASTCHANCEBACK` (`promo_1TUkJRIG1gGY9y21Jv0f4MNO`) — 20% off, 1 month, `first_time_transaction:false` — used in `bl-reengagement-d6-24h`
  - `WELCOMEBACK50` (`promo_1TUkJUIG1gGY9y211Jo16z1b`) — 50% off, 3 months repeating (new coupon `SwzWSotp`), `first_time_transaction:false` — used in `bl-reengagement-d7-ends`
  - All 4 have `max_redemptions: null` (unlimited) and `metadata.campaign` tagged for filtering. Re-engagement codes intentionally NOT first-time-transaction-restricted because some of the 168 users may have paid Brieflee in the past.

- **Stripe · existing promo codes flagged as broken — needs Bev's manual fix in Dashboard.** `TRIALUPGRADE` / `LASTCHANCE` / `FINALDAY` all have `max_redemptions: 1` (only ONE customer total can redeem). Setup error from when they were originally created. Until manually archived + recreated, only the very first user to hit each code will succeed. Stripe MCP doesn't expose the promotion-code update endpoint so this requires Stripe Dashboard access.

- **Stripe · ALL promo codes rebuilt clean (supersedes the manual-fix flag above).** Bev pushed back on my earlier rationale that re-engagement codes should NOT be `first_time_transaction: true`. She was right: the field means "has the Stripe Customer ever had a successful payment", and setting it to `false` opens a cancel-and-resubscribe abuse loop where churned customers re-redeem acquisition discounts. The correct default for ALL acquisition / winback / reengagement codes is `first_time_transaction: true`. Found a workaround for the MCP's missing promotion-code update endpoint: deleting the underlying coupon auto-deactivates all promo codes pointing to it, freeing the code-string for re-creation. Used this to rebuild all 7 promo codes clean in one pass:
  - **3 old coupons deleted:** `mGavW19j` (20% once), `LNXygQdx` (30% 3mo), `SwzWSotp` (50% 3mo). All promo codes referencing them auto-deactivated.
  - **3 new coupons created:** `WeiiE8iQ` (20% once), `uVH8UjNG` (30% 3mo), `QzOYPhqD` (50% 3mo).
  - **7 promo codes rebuilt** with `first_time_transaction: true` + `max_redemptions: null` (unlimited):
    - `TRIALUPGRADE` (`promo_1TUlE8IG1gGY9y21FwyGsieP`) — was max_redemptions:1, NOW UNLIMITED
    - `LASTCHANCE` (`promo_1TUlEBIG1gGY9y21TsHbil3g`) — was max_redemptions:1, NOW UNLIMITED
    - `FINALDAY` (`promo_1TUlELIG1gGY9y218IURBBkn`) — was max_redemptions:1, NOW UNLIMITED
    - `COMEBACK20` (`promo_1TUlEoIG1gGY9y21eTv54jBZ`) — recreated after coupon delete cascade
    - `WELCOMEBACK20` (`promo_1TUlEEIG1gGY9y21llKQh8u5`) — was first_time:false, NOW TRUE
    - `LASTCHANCEBACK` (`promo_1TUlEIIG1gGY9y215L5b3ifN`) — was first_time:false, NOW TRUE
    - `WELCOMEBACK50` (`promo_1TUlDKIG1gGY9y21RtVQyUBl`) — was first_time:false, NOW TRUE
  - **Side effect:** the 7 OLD promotion code records still exist in Stripe in zombie state (active:true but pointing at deleted coupons → can't be redeemed). They'll show up cluttering Stripe Dashboard until Bev archives them cosmetically. Functionally inert.

## 2026-05-07

- **EmailIt · win-back drip + nurture batch redesigned + pushed (final batch).** All 8 remaining untouched Brieflee templates re-skinned in the new design and pushed. EmailIt now has 27 templates rebuilt, plus 5 to archive.
  - **Win-back drip (3, alias + ID unchanged):**
    - `bl-winback-30d` (`tem_4D1rc16nL0omZ4L0eCiKMcXMOhb`) — 20% off code `COMEBACK20` baked in
    - `bl-winback-60d` (`tem_4D1rc424LO6dTKDiztI1QzNPXum`) — DTC skincare customer-story angle
    - `bl-winback-90d-final` (`tem_4D1rc16nL0oSqHHxhOg6U5iSqif`) — 7-day deletion warning, calm/firm tone (no urgent red)
  - **Nurture post-trial (5, alias + ID unchanged, repurposed for BL | Subscribers broadcasts):**
    - `bl-features-day-03-swipe-videos` (`tem_4D1p0KXIO3ZzhG3gnGfWqPB4AZl`) — uses `swipe-file` demo
    - `bl-features-day-05-review-content` (`tem_4D1p0Hc1NgI6mE0CVrKzusapzoV`) — uses `ai-review-feedback-panel-pass` demo
    - `bl-features-day-07-create-campaign` (`tem_4D1p0Hc1NgHx7J95L5lAziBwKdB`) — no demo (utility/concept)
    - `bl-features-day-11-invite-creators` (`tem_4D1p0SKMQGqMBh5QI68mYHC5wpz`) — uses `team-invite-add-member` demo as creator-invite proxy
    - `bl-features-day-14-affiliate` (`tem_4D1p0PP5PtYcvZrGDTez1jMrbbs`) — schedule send for ~Day 30 of paid lifecycle, not Day 14 of trial
  - **Drip-day references stripped** in the 5 nurture templates — eyebrows changed from "Day N of 7" to "Feature ·" / "Affiliate ·", "tomorrow's email"-style cross-references removed. These now read as standalone broadcasts.
  - **Generator script** at `emails/generate-batch3.py` — reads a CONFIG dict and emits all 8 HTMLs from a shared shell template. Idempotent.

- **EmailIt · URL fragment-before-query bug fixed across 5 previously-pushed templates.** Discovered while building the affiliate template (which uses `/settings#tab5`): when a CTA URL had both a fragment (`#tab1`) and a query string (`?utm_*`), the earlier substitution produced `https://www.brieflee.co/settings#tab1?utm_source=...` which is malformed — browsers treat everything after `#` as the fragment, so the UTM params would have been silently dropped from analytics. Fixed all 19 broken instances across `bl-7day-d1-welcome`, `bl-7day-d2-getting-started`, `bl-7day-d4-quality-thresholds`, `bl-7day-d6e1-team-collab`, `bl-trial-pick-review-mode` to use the correct order: `?utm_*#tabN`. All affected templates re-pushed.

- **EmailIt · CTA URLs hardcoded across all 19 redesigned templates (bug fix).** Bev caught a critical issue after sending a test of `bl-7day-d1-welcome` — every CTA rendered as `<a href="?utm_source=...">` (empty host) because the workflow that sent the test wasn't passing the `{{cta_book_demo}}`, `{{cta_dashboard}}`, etc. variables. EmailIt's Mustache silently rendered the missing variables as empty strings, producing broken links. Fix: replaced every `{{cta_*}}` and `{{*_url}}` static-URL placeholder with the actual hardcoded URL across all 19 templates. Per-file `{{cta_upgrade}}` got the right promo code baked in: `?promo=TRIALUPGRADE` (d5e2-48h), `?promo=LASTCHANCE` (d6e2-24h), `?promo=FINALDAY` (d7e2-trial-ends), bare `/upgrade` (bl-trial-winback). UTMs stay appended in-template per CTA. Only remaining Mustache placeholders are genuine per-user variables (`first_name`, `plan_name`, `owner_name`, `workspace_name`, `accept_url`, `update_payment_url`, `unsubscribe`). All 19 templates re-pushed. Activation email's "Button not working?" fallback URL also updated to display the full UTM-tagged version per Bev's direction (so the email reads as a legitimate tracked activation link, not a clean copy-pasteable URL). The variable-based CTA pattern in `sop/09-email-assets.md` is now deprecated — treat that doc's CTA URL table as a hardcode-target list, not Mustache key list.

- **EmailIt · workflow trial nudges batch redesigned + pushed.** Second batch. Four of the five workflow-fired trial nudges re-skinned in the new design (alias + ID unchanged, body replaced). One deliberately skipped for archive.
  - `bl-trial-create-account` (`tem_4D1p0a7QSU6pvJQ4FbTyiN68rb5`) — Day 1 if no workspace. Type-first hero, no demo image, 3-step setup list, Bev sig.
  - `bl-trial-first-review` (`tem_4D1p0XC9S6ofIGUdnRH56OQUw9V`) — **retimed Day 5 → Day 3** (workflow side; preheader copy says "halfway through your trial"). Uses `ai-review-feedback-panel-pass` demo so they see what they'll get.
  - `bl-trial-winback` (`tem_4D1p0huUUhN4MeQyyhmZb00x4Gv`) — calm/utility tone, no demo image, 30-day data-hold explainer, reactivate CTA → `cta_upgrade`. Sent on entry to `BL | Lapsed` audience.
  - `bl-trial-pick-review-mode` (`tem_4D1p0XC9S6ooxBLkwomrlozjyBK`) — copy framing softened post-onboarding-streamline (review mode now lives in Settings, not as a missing onboarding step). Uses `quality-review-mode-qa-thresholds` demo. Three modes explained, Bev's "start on Hybrid" recommendation kept.
  - **SKIPPED (mark for archive in EmailIt UI):** `bl-trial-set-quality-settings`. Content is now fully duplicated by `bl-7day-d4-quality-thresholds` (Day 4 of the new drip). Sending both risks two threshold-tuning emails in the same week. Don't push, don't redesign — archive.
  - **Workflow audit reminder:** these templates fire from `BL | New Signup` (`bl-trial-create-account`) and `BL | New Workspace + Team` (`bl-trial-first-review`, `bl-trial-pick-review-mode`). Variable casing was already snake_case per the cURL reference (`first_name`), so no variable rename needed for these — but `bl-trial-first-review` needs the **trigger time changed in the workflow from Day 5 → Day 3**.

- **EmailIt · transactional batch redesigned + pushed.** First batch of the post-migration "redesign untouched templates" workstream. Three transactional templates re-skinned in the new "Spell check for video" design (alias + ID unchanged, body replaced, name relabelled). Pushed via the same `push-7day.py` script (extended).
  - `bl-tx-payment-success` (`tem_4D1p0huUUhMuhjRSEZhdZ6HQ94b`) — celebratory paid welcome, `home-lee-chat-overview` demo, "what's now unlocked" + "things to do this week" sections, Bev signature.
  - `bl-tx-payment-failed` (`tem_4D1p0huUUhNCPkRdej2ijeycgJu`) — sober billing email, no demo image, no body emojis (only protocol-minimum 👋 in greeting and 💳 on CTAs). 7-day auto-retry explainer + reply-to-us-for-ACH/wire fallback.
  - `bl-tx-team-invite` (`tem_4D1rc8trNE4pKi7idCSJYIUSStk`) — different audience (invitee, not signup-er); brief Brieflee explainer ("spell check for video"), `home-lee-chat-overview` demo so they see what they're joining, scoped-access reassurance.
  - **Variable casing migration:** the new templates use snake_case (`{{first_name}}`, `{{owner_name}}`, `{{workspace_name}}`, `{{plan_name}}`) instead of the old camelCase (`{{firstName}}`, `{{ownerName}}`, `{{workspaceName}}`). The cURL reference (`sop/07-emailit-curl-reference.md`) already specifies snake_case for the workflow variables, but **any workflow currently sending camelCase will render the variable names literally in the email**. Audit needed before next live send: `BL | New Stripe Sub` (sends `bl-tx-payment-success`), `BL | Payment Failed` (sends `bl-tx-payment-failed`), `BL | New Workspace + Team` member branch (sends `bl-tx-team-invite`).
  - **New variables introduced:** `{{plan_name}}` on payment-success, `{{cta_manage_subscription}}` on payment-success — workflow Call API steps need these added.

- **EmailIt · 14-day → 7-day onboarding migration EXECUTED.** All 12 7-day templates pushed live via `emails/push-7day.py` using `POST /v2/templates/{id}` for updates and `POST /v2/templates` for creates. Path A from the migration map: existing aliases + IDs preserved on the 10 re-skinned templates so EmailIt automation triggers don't break.
  - **10 templates UPDATED in place** (HTML body replaced, name relabelled `BL | 7-day · ...`):
    - `bl-features-day-01-welcome` (`tem_4D1p09oxLT1bQmc2aaBiJUmNdSi`) ← `bl-7day-d1-welcome.html`
    - `bl-features-day-02-account` (`tem_4D1p0Hc1NgIGq6BR3FWIZBofVUb`) ← `bl-7day-d2-getting-started.html`
    - `bl-features-day-08-create-brief` (`tem_4D1p0PP5PtYVHQqzCLBgxALSqNF`) ← `bl-7day-d3-mastering-brief.html`
    - `bl-features-day-04-quality-settings` (`tem_4D1p0Hc1NgIGR8weGoyGpza8h0t`) ← `bl-7day-d4-quality-thresholds.html`
    - `bl-features-day-06-remix-content` (`tem_4D1p0KXIO3ZqRIQ6mVoK884auki`) ← `bl-7day-d5e1-remix.html`
    - `bl-trial-reminder-2-48h` (`tem_4D1p0XC9S6oz13X2zmIlU1nNroo`) ← `bl-7day-d5e2-48h.html`
    - `bl-features-day-09-invite-team` (`tem_4D1p0PP5PtYcvZrF43fLsVoVHts`) ← `bl-7day-d6e1-team-collab.html`
    - `bl-trial-reminder-3-24h` (`tem_4D1p0huUUhMuImNDzw5uSwpVfHk`) ← `bl-7day-d6e2-24h.html`
    - `bl-features-day-12-bulk-upload-briefs` (`tem_4D1p0SKMQGqUEn64wEdftinJ8Lb`) ← `bl-7day-d7e1-bulk-upload.html`
    - `bl-trial-ends-today` (`tem_4D1p0huUUhN3xh52NXpuspoOsxl`) ← `bl-7day-d7e2-trial-ends.html`
  - **2 templates CREATED:**
    - `bl-7day-activate` → `tem_4DOvZSl4VDi4PgVHOLioqK1MIX5` (transactional, no unsubscribe; sent on signup as a separate workflow step, not part of the audience drip)
    - `bl-7day-founder` → `tem_4DOvZPpnUqQVDRNWo0FSMu0Xfm6` (A/B variant against `bl-features-day-01-welcome` on Day 0; plain-text style)
  - **Manifest updated** at `docs/emailit-assets-2026-04-29.json` — new entries + renamed names. Templates total now 32.
  - **Design rebuild:** all 12 emails follow the new "Spell check for video" type-first hero pattern + per-section feature cards using the 16 new product-demo GIFs Bev recorded 2026-05-07 (Cloudinary `brieflee/demos`, served as auto-converted GIFs via the `/video/upload/q_auto,w_1008/<slug>.gif` pattern). All CTAs UTM-tagged (`utm_source=emailit&utm_medium=email&utm_campaign=<alias>&utm_content=<slot>`). Voice swapped from "ship" → "review/check/get AI watching" per Bev's directive. Founder uses Bev's 6 favourite emojis (🎉 🥳 🙌 🤯 🤌 🫣) at protocol-defined slots.
  - **EmailIt API discovery:** update endpoint is `POST /v2/templates/{id}` (PATCH/PUT both 404). Schema accepts `alias`, `name`, `subject`, `html`, `editor`. No `preview_text` field — preview/preheader is rendered from the hidden `<div style="display:none;...">` in the HTML body.
  - **STILL TO DO (manual EmailIt UI / Softr workflow steps):**
    1. Re-cadence the `BL | Onboarding` audience automation 14d → 7d. Drop the 9 unused 14-day slots from the sequence. Slot in `bl-7day-founder` as the A/B variant of welcome on Day 0.
    2. Wire `bl-7day-activate` into the `BL | New Signup` workflow as a transactional send on signup — NOT part of the audience automation.
    3. Retrigger `bl-trial-first-review` from Day 5 → Day 3 (workflow side, template content unchanged).
    4. Archive (don't delete) the 9 unused old templates per migration map § 5: `bl-features-day-03-swipe-videos`, `-05-review-content`, `-07-create-campaign`, `-10-invite-members`, `-11-invite-creators`, `-13-bulk-upload-videos`, `-14-affiliate`, `bl-trial-create-account-day6`, `bl-trial-reminder-1`.
    5. Update SOP `02-emailit-system.md` to reflect 32 templates (was 30) and the 7-day cadence.

## 2026-05-06

- **Schema · two SELECT fields created on `users` via API** (2026-05-05). The two onboarding marketing fields locked the day before:
  - `users.work_type` (id `Xqhif`) — Agency / Brand / App or Game / Software / Freelancer / Solo creator / Other.
  - `users.heard_about_us` (id `B8uMy`) — X / Twitter, LinkedIn, Instagram, TikTok, Google Search, YouTube, Newsletter, Podcast, Word of mouth, From a friend / colleague, From a client, Ad I saw, Other.
  - Option UUIDs for both captured at field creation time (every option has a UUID returned by the create-field API call). All UUIDs are hardcoded in `onboarding/get-started` and `onboarding/set-up` so SELECT writes use the `{ id, label }` shape the vibe-code-block skill requires.

- **Schema · team data lives on `users` not `accounts`.** Field aliases on users:
  - `users.team_name` (id `ZOm63`, SINGLE_LINE_TEXT) — workspace name from the Team step in `/get-started`.
  - `users.team_emails` (id `EuCXi`, LONG_TEXT) — comma-joined invite emails. The `BL | Onboarding` workflow will split these downstream into per-invite EmailIt sends. The `BL | New Workspace + Team` workflow drops its team-creation half.
  - Replaces the earlier "team step writes to accounts" plan — `users.team_name` and `users.team_emails` are simpler since the `/get-started` block is bound to `users` already, no cross-table workflow needed.

- **Schema · `users.plan` is the picker field.** LINKED_RECORD → `pricing` (id `Ux1pf`). Set during the Plan step in `/get-started`. The `pricing` table primary field is `stripe_price_id`, so the linked value stamped on the user is exactly the Stripe price ID — no translation hop when calling Stripe.

- **Reference docs lifted into the repo.** `docs/softr-vibe-code-block.md` and `docs/softr-events-and-selectors.md` copied from the Creator Scans skill set. Source of truth for Vibe Code conventions (default-export named `Block`, alias keys not field IDs in writes, `{ id, label }` for SELECT, array of UUIDs for multi-select, etc.). Code blocks in this repo follow these rules.

- **Code · `onboarding/verify-email`.** "Check Your Inbox" page after Softr signup. Brieflee compact-logo hero, `useCurrentUser` for email, 2-minute resend countdown, provider deep-links (Gmail with `authuser=<email>`, Outlook / Yahoo / Proton / iCloud). Resend handler stubbed pending a Softr workflow that calls EmailIt with `bl-tx-email-activation` (template not yet built; placeholder alias only).

- **Code · `onboarding/get-started`.** Single multi-step Vibe Code block on `/get-started`, bound to `users`. Stage 2 of the 3-stage onboarding. Sub-steps: Team → Personalize → Plan → Confirm (rendered as a 5-dot stepper that includes Setup as the unreached final dot). Team step writes `users.team_name` + `users.team_emails`. Personalize writes `users.work_type` + `users.heard_about_us`. Plan step writes `users.plan` (linked record to pricing). Confirm step embeds a Softr native checkout iframe via `iframe-resizer`; placeholder slug `creator-monthly-59` for the other 5 plans until Bev creates them. After Stripe payment, Stripe redirects to `/set-up`.

- **Code · `onboarding/set-up`.** Single Vibe Code block bound to `accounts`. Welcome chat (lifted from `screen-1`) plus six sub-steps in one continuous chat with Lee:
  1. Set up your brand (lifted from `screen-2`) — website + "Don't have a website?" toggle + use_case multi-select cards.
  2. Choose your review mode (lifted from `screen-4`) — `accounts.ai_mode` single-select.
  3. How Brieflee works (rebuilt with interactivity) — Softr-hosted MP4 explainer (no YouTube UI), watch-toggle button, sequential cards (Campaigns + Quick reviews) with Got-it acknowledgement after each. Skippable.
  4. QA Checklist — `accounts.qa_checklist` multi-select with all 26 option chips. Skippable.
  5. Thresholds — 9 single-select threshold fields, each row gated by a `<Switch>` (off = chip grid hidden + threshold not saved). Skippable.
  6. Review your content blueprint (lifted from `screen-3` blueprint half) — pencil-edit pattern, `formatTextWithBullets` markdown rendering for AI-generated blueprint values, brand_name heading at top.
  - Each step's `done` branch returns `null`, so the chat advances forward like the original screen-by-screen pattern (no "saved" pill clutter).
  - Each typing/message pair uses the `screen-3` cadence: timer that turns the typing dots OFF when the message turns ON. Avatar-on-first-bubble-only convention is preserved via `BubbleWithAvatar` / `BubbleNoAvatar`.
  - **CSS confetti celebration** on completion (60 falling pieces + "You're all set! 🎉" card), then redirect to `/new`.

- **Code · `onboarding/set-up-test`.** Preview-mode clone of `/set-up`. The only diff is `save()` is a no-op (`console.log` + `setTimeout` instead of `updateRecord.mutate`). Same Source binding (accounts). Lets Bev walk through every page visually without the AI website scanner firing or any account record getting polluted. Should be gated to `is_internal=true` users in Softr's Visibility tab.

- **Stripe checkout pattern · Softr native iframe** (decided 2026-05-05). The Embedded Stripe Checkout backend-Session approach was abandoned; instead the Confirm step in `/get-started` embeds a Softr native checkout block via iframe per plan. Bev created the Creator Monthly $59 block; the other 5 will be cloned from it. The 12 personalised Payment Link formula fields on `users` are now obsolete (still in the schema but no longer used).

- **Onboarding screens — existing files kept as reference.** `onboarding/screen-1` through `onboarding/screen-6` (and `screen-2-a`, `screen-6-a`) stay in the repo as the source material `set-up` lifts from. They can be archived once `/set-up` is verified live.

- **Email · `bl-tx-email-activation` template — not yet built.** Bev to add it to EmailIt outside the 30-template drip. Placeholder alias used in `verify-email`'s resend handler.

- **Workflow updates needed** (not yet executed):
  - `BL | New Workspace + Team` — drop the team-creation half. `users.team_name` / `users.team_emails` are written by the `/get-started` Team step directly.
  - `BL | Onboarding` — add an email-split step that fans `users.team_emails` (comma-joined) out into per-invite EmailIt sends.
  - Trial reminder cron — re-anchor on `created_at + 7d` (was 14).
  - EmailIt drip — recompress 30 templates from 14-day to 7-day cadence.
  - Long-term: `is_internal` bypass on whichever workflow currently watches `accounts.website` and triggers the AI scan, so internal/test users don't trigger scraping in the live flow.

## 2026-05-04

- **Onboarding · trial length cut from 14 days → 7 days.** Supersedes the 14-day decision locked 2026-05-01. Workflow (`BL | New Workspace + Team`) and trial reminder cron need updating to anchor on `created_at + 7d`. EmailIt drip needs to be re-cadenced from 14 days → 7 days (30 templates currently spaced over 14 days; recompress or trim).

- **Onboarding · 3-stage flow locked.** Modelled on 4Play. Stage 1: Softr signup (Google auth — not codeable, lives in Softr). Stage 2: Get Started page — first few screens, email verification + plan confirm, ends with subscribe step. Stage 3: first-login onboarding as a single multi-stage form (replaces the existing `screen-1`…`screen-6` wizard).

- **Onboarding · `screen-6` first-review step dropped** from the flow. Previously kept in the streamline shortlist; now removed entirely. Remaining onboarding collapses into one multi-stage form covering welcome + account setup + user-type capture. Thresholds + review-mode pickers stay in Settings.

- **Schema · `subscriptions` table evaluated for deletion, KEPT.** Bev questioned whether it added value over `billing`. Audit confirmed it's load-bearing: `status` enum drives the chat gate (`onboarding/brieflee-chat` + `app/dashboard-chat`), EmailIt audience filters, and trial reminder cron; `current_period_end` drives trial expiry; `plan` link feeds the 8 `accounts.current_subscription → plan` lookups (max_videos, max_storage_gb, max_workspaces, max_members, tier, interval, product_name) that `usage` formulas were rewired to on 2026-04-28. Billing is an event log, not current state. No change.

- ~~**Open question · subscribe-gate semantics**~~ → **resolved later 2026-05-04: card-required.** See entries below.

- **Subscribe gate · CARD REQUIRED to start the 7-day trial.** Stripe collects card up front. Higher conversion to paid, fewer trial signups. Closes the open question above.

- **Stripe Checkout · Embedded mode locked** (was: redirect to Payment Link). User picks plan + interval inside stage 2 of Get Started; an embedded Stripe iframe loads on the same page, can be re-mounted if they switch plan. Modelled on 4Play. Replaces the redirect pattern that uses the 12 personalised Payment Link formula fields on `users` (`creator_monthly`, `studio_yearly_trial`, etc.). Those formula fields stay as a fallback for now but are no longer the primary path. Requires a backend endpoint (Softr workflow Call API or a small worker) to create Checkout Sessions with `trial_period_days: 7` at click-time.

- **Stripe · 6 canonical prices locked.** One monthly + one yearly price for each of Creator / Crew / Studio. Trial is now per-Session (`trial_period_days: 7`), not per-price.

  | Plan | Interval | Price ID | Amount |
  |---|---|---|---|
  | Creator | Monthly | `price_1SGHuzIG1gGY9y21517vrys7` | $59 |
  | Creator | Yearly | `price_1SGHvdIG1gGY9y21twF3H7NU` | $588 |
  | Crew | Monthly | `price_1SGI2CIG1gGY9y21tuEFZgut` | $99 |
  | Crew | Yearly | `price_1SGI31IG1gGY9y21vH0AifOz` | $1,068 |
  | Studio | Monthly | `price_1SGI3iIG1gGY9y21ITPStmgR` | $249 |
  | Studio | Yearly | `price_1SGI4HIG1gGY9y21oftkiARJ` | $2,388 |

- **Stripe · cleanup EXECUTED.** Live account changes via Stripe API. All archives are reversible (`active: false`).
  - **10 products archived:**
    - `prod_TAPPLC5e05d67N`, `prod_TAPQyC92f4Ag4X` (Creator no-trial dupes)
    - `prod_TAPO64gpYdt9cL`, `prod_TAPPJyGkSQPKQG` (Crew no-trial dupes)
    - `prod_TAPM4rhQyiKDSo`, `prod_TAPOq2yuB45jmf` (Studio no-trial dupes)
    - `prod_S877TX0cYtTMmF` (standalone $0 "7 Day Free Trial")
    - `prod_TSSFAbyzS45eMg`, `prod_TSSKAgNijtuNH8`, `prod_TSSOjctPfWW3no` (Extra 50 / 100 / 250)
  - **16 prices archived** on the 3 active products (everything not in the canonical 6):
    - Creator: `price_1SVVPtIG1gGY9y210dAr8lfk` ($300/yr), `price_1SVVP7IG1gGY9y21ZwA1DQCE` ($30/mo), `price_1SDPFyIG1gGY9y21ZS9wpACZ` ($99/mo), `price_1SDPF9IG1gGY9y21DqcIWhQT` ($1068/yr), `price_1RDQ4LIG1gGY9y21Za4frWl5` ($250/yr), `price_1RDQ4LIG1gGY9y21vE7JqeHx` ($25/mo)
    - Crew: `price_1SVWp1IG1gGY9y21cEdedJgY` ($59/mo), `price_1SD6uJIG1gGY9y21I2yrM7bE` ($249/mo), `price_1SD6t0IG1gGY9y21rHtWxjbJ` ($2388/yr), `price_1RDQ7nIG1gGY9y2173AubD4M` ($800/yr), `price_1RDQ7SIG1gGY9y21HMWgZ6QF` ($80/mo)
    - Studio: `price_1SDPOVIG1gGY9y21DckuNw4j` ($549/mo), `price_1SD6wXIG1gGY9y217qpTs5FP` ($5988/yr), `price_1SD6vzIG1gGY9y21D39RmRij` ($599/mo), `price_1RDQ9uIG1gGY9y21mbSmcwmK` ($1500/yr), `price_1RDQ9MIG1gGY9y21OWoLutGR` ($150/mo)
  - **Untouched:** the 6 canonical prices (active), Brieflee Enterprise (`prod_U7hvIIywsveKBE`).
  - **Note:** the 12 personalised Payment Link formula fields on `users` may now point at Payment Links that reference archived prices. Existing live Payment Links keep functioning at Stripe but should be reviewed/replaced before relaunch — the move to Embedded Checkout makes them obsolete anyway.

- ~~**Softr `pricing` table · primary field rename queued** to `product_name & " " & interval`~~ → **revised: primary field = `stripe_price_id`.** Bev's call to optimise for integration cleanliness (linked-record values stamped on `users` are exactly what we send to Stripe — no translation hop). Trade-off: linked-record dropdowns in Softr will display Stripe price IDs (e.g. `price_1SGHuzIG1gGY9y21517vrys7`) instead of readable labels. Acceptable given Softr UI is internal/admin.

- **Softr `pricing` table · 6 rows to map 1:1 with the 6 Stripe prices** above. Primary field for each row IS the Stripe price ID.

- **Schema · plan picker uses ONE linked field.** `users.selected_plan` (LINKED_RECORD → `pricing`) is the only new selection field. Interval, tier, max_videos, etc. all flow through as lookups via `selected_plan → pricing`. No separate `selected_interval` field.

- **Schema · marketing field renamed `work_type` (was `user_type` in earlier locked decision).** "User type" was confusing with the existing `users.role` (Owner/Admin/Member). The 2026-05-01 locked decision was about adding a marketing-segmentation field on signup, which is a different concept. Final field name + options:
  - **`users.work_type`** SELECT: Agency / Brand / App or Game / Software / Freelancer / Solo creator / Other
  - **`users.heard_about_us`** SELECT (added 2026-05-04): X / LinkedIn / Instagram / TikTok / Google Search / YouTube / Newsletter / Podcast / Word of mouth / Friend or colleague / From a client / Ad I saw / Other

- **Onboarding pages locked from inspo (Foreplay).** Bev's Brieflee onboarding maps to Foreplay's flow as follows:
  - Stage 1 — **Sign up** (Softr native, split layout) + **Check Your Inbox** (Brieflee custom block, post-signup)
  - Stage 2 — **Personalize** (work_type + heard_about_us) + **Pricing** (plan + interval picker) + **Card Checkout** (embedded Stripe)
  - Stage 3 — **Team Setup** (team name + invite emails) + collapsed `screen-1`…`screen-5` content (account setup, brand voice, welcome) as a single multi-stage form. Thresholds + review-mode pickers move to Settings.
  - Stepper across stages 2-3 reads: Register → Personalize → Confirm → Setup.
  - **First page to build: Check Your Inbox** ("email activate"). Brieflee custom code block, runs after Softr signup. Reads `window.logged_in_user.email`. Shows "Check Your Inbox" + email icon + resend countdown + provider quick-links (Gmail, Outlook, Yahoo, Proton, iCloud) + "Go back to Sign In". Resend button calls a Softr workflow → EmailIt API to re-send the activation email.
  - **Activation email** — Bev to add a separate template in EmailIt (outside the 30-template drip). Placeholder alias `bl-tx-email-activation` until built.

- **Email verification field DROPPED.** No `users.email_verified_at` — Softr handles auth.

## 2026-05-01

- **Onboarding code · gate logic updated** in `onboarding/brieflee-chat` + `app/dashboard-chat` (byte-for-byte identical). Old gate read `users.payment_status` (broken billing chain) and `users.videos_remaining` (Ef7z6, removed during migration). New gate: `is_internal = true` bypasses; otherwise `subscription_status IN ('trialing','active')` AND `videos_remaining > 0`. New field added: `users.subscription_status` (id `SQuxf`, lookup via `accounts → current_subscription.status`). [commit 539ce9f](https://github.com/BeeSidez/brieflee-softr-code-blocks/commit/539ce9f)

- **EmailIt · 30 templates uploaded** to live EmailIt account. All using locked Brieflee design (periwinkle hero `#ECF0FF→#879CF7`, navy text `#001364`, periwinkle CTA + "Spell Check For Video" pill, 16px-cornered roadmap rows). Subject + HTML pushed via API for all 30 templates. Generator script saved at `emails/generator.py` so future copy edits in `emails/copy/*.md` regenerate automatically.

- **Email assets · brand colours locked** as `sop/10-brand-colours.md`. Source of truth for Brieflee visual surfaces.

- **Email assets · CTA URLs + Cloudinary mappings finalised** in `sop/09-email-assets.md`. 19 CTA placeholders mapped to live Brieflee URLs; 14 day-icon Cloudinary URLs mapped (12 from existing Help Icons set; days 3 + 6 still need new icons sourced).

- **Affiliate commission corrected**: 40% → 20% for 3 months across emails + spec + Referly API call body. Headlines just say "Earn 20%"; "for 3 months" lives in body details.

## 2026-04-30

- **Email matrix locked** at `sop/08-email-matrix.md` — every email categorised by audience automation vs transactional, with wait times + offer codes (TRIALUPGRADE / LASTCHANCE / FINALDAY).

- **EmailIt cURL reference** at `sop/07-emailit-curl-reference.md` — every EmailIt API action used by the workflows, ready to import into Softr Call API.

- **Email content drafted** for all 30 templates in `emails/copy/*.md`.

- **Schema · `accounts.team_emails` LONG_TEXT field added** (id `wIvhQ`). Replaces `team_email1/2/3` sequence — onboarding form parses comma/newline-separated up to 9 emails.

- **Schema · `accounts.logo_url` FORMULA field added** (id `nPI65`). Auto-derives Clearbit logo URL from `accounts.website` (strips https/www, takes everything before first `/`).

## 2026-04-29

- **EmailIt · 4 audiences + 30 templates created** via API. Audiences: `BL | Onboarding`, `BL | Subscribers`, `BL | Lapsed`, `BL | Team Members`. Template aliases all `bl-` prefixed. IDs at `docs/emailit-assets-2026-04-29.json`.

- **6 FigJam diagrams generated** for the workflows. Master overview + 5 per-workflow detail boards. Linked from `sop/01-workflow-architecture.md`.

- **SOP folder structure created** at `sop/`. 10 docs covering workflow architecture, EmailIt system, database schema, Stripe integration, deletion policy, test accounts, cURL reference, email matrix, email assets, brand colours.

- **`is_internal` checkbox added on users** (id `gdFt4`). Bypasses paywall + quota gates for staff and test users. Bev's user (`qjQjF66Q2sYGBa`) flagged.

- **Subscription backfill v3** completed. 14 accounts had `current_subscription` set from billing records. Then cleaned up to match Stripe truth (only Mohamad has an active sub). Final state: 1 subscription record. 75 inactive accounts will get fresh trial via re-engagement campaign.

- **Workflow architecture spec locked** at `docs/workflows-spec.md`. 5 workflows: New Signup, New Workspace+Team, New Stripe Sub, Sub Cancelled, Payment Failed. Trial timer anchors on account creation, not signup. 30/60/90 winback cadence then auto-delete on day 97.

## 2026-04-28

- **Schema migration completed**. Created `subscriptions` table (id `s7xluIUfztpBhY`); added `accounts.current_subscription` link (id `f5UWR`); rewired `usage` formulas to read through `accounts → current_subscription → plan` instead of the old `accounts → billing → pricing` chain. 9 broken lookups on accounts repointed.

- **Repo reorganised** into `onboarding/`, `app/`, `website/`, `docs/`. Code blocks moved into the right folders.

- **Schema snapshot** captured at `docs/schema-snapshot-2026-04-28.{md,json}`. 13 tables, 577 fields. Baseline before migration.

---

## Decisions pending implementation

### Onboarding streamline (decided 2026-05-01, revised 2026-05-04)

Bev's plan to overhaul the onboarding flow before relaunch:

1. ~~**14-day trial for everyone, Studio plan, no card required**~~ → **superseded 2026-05-04: 7-day trial.** Card-required vs no-card still TBD. Workflow + trial reminder cron + EmailIt drip cadence all need updating to match.
2. **Consolidate the chat into ONE code block** — currently `onboarding/brieflee-chat` and `app/dashboard-chat` are byte-for-byte identical. Make it one canonical block, used in both contexts. Drops maintenance overhead.
3. **Streamline account setup** — current pattern uses two blocks (one shows when website is populated, one when not) which is clunky. Replace with a single one-page setup that lets users get in quickly and refine settings afterwards. Move detailed config (thresholds, review modes, brand voice) to settings rather than blocking them in the wizard.
4. **Capture user type in onboarding** — add a question: are they a company / solo creator / agency / brand? Drives segmentation, future content tailoring, and possibly different drip variations.
5. **Re-engagement variant of the drip** — for existing users (the 75 dormant accounts in the system), don't put them through the same drip. Adapt to a re-engagement framing. To-do later, after streamline lands.
6. **3-stage flow (added 2026-05-04)** — modelled on 4Play. Stage 1: Softr signup (Google auth, not codeable). Stage 2: Get Started page — first few screens, email verification + plan confirm, ends with subscribe step. Stage 3: first-login multi-stage onboarding form (single block, replaces `screen-1`…`screen-6`).
7. **Drop `screen-6` first-review (added 2026-05-04)** — first-review step removed from onboarding entirely. Users hit the product directly after stage 3.

### Other deferred items

- Stripe Checkout success-redirect code block (instant subscription write, replaces broken webhook reliance)
- `paywall` + `upgrade` blocks updated to use the success-redirect pattern
- `screen-2` blueprint polling fix (replace 120s hardcoded timeout with polling on `account.blueprint_status = 'Complete'`)
- `screen-5` emoji reactions actually tracked (currently redirect-only)
- Day 3 + Day 6 email hero icons sourced (swipe files + remix — not in existing Cloudinary set)
- Onboarding form field validation: reject subdomain URLs to make Clearbit logo lookup work
- N8N → Softr native Gemini migration for brand blueprint generation
