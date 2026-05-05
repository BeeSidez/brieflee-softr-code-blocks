# Changelog

All notable changes to Brieflee infrastructure. Schema, workflows, code blocks, emails, SOPs.

Latest at top. Each entry: date · area · summary · link to commit/artifact where useful.

---

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
