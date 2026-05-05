# Feature: Onboarding streamline

Tracks the planned overhaul of the Brieflee onboarding flow before relaunch. Move out of `in-progress/` once everything is built.

## Why

Current onboarding is a multi-screen wizard (`screen-1` through `screen-6` plus `screen-2-a` and `screen-6-a`) that's been patchworked over time. It's slow, blocks users on detailed settings before they've seen the product work, and the chat block is duplicated across `onboarding/` and `app/`. Time to simplify.

## Decisions locked 2026-05-01 (revised 2026-05-04)

| # | Decision | Rationale |
|---|---|---|
| 1 | ~~14-day trial for everyone, Studio plan, no card required~~ → **7-day trial, CARD REQUIRED (revised 2026-05-04)** | Bev cut the trial to 7 days and locked card-required for higher conversion. Workflow (`BL | New Workspace + Team`), trial reminder cron, and EmailIt drip cadence all need updating. The existing 30-template 14-day drip needs recompressing or trimming. |
| 2 | **Consolidate chat into one code block** | `onboarding/brieflee-chat` and `app/dashboard-chat` are currently byte-for-byte identical. Pick one canonical location, reference from both contexts. Drops maintenance overhead and risk of drift. |
| 3 | **Streamline account setup to a single one-page** | Currently uses two blocks (one for "website populated", one for "not"). Replace with a single quick-start that lets users get in fast. Detailed config (thresholds, review modes, brand voice tuning) moves to **Settings** — accessible after they've seen the product work. |
| 4 | ~~Capture `user_type` at signup~~ → **Capture `work_type` (renamed 2026-05-04)** | "User type" clashed with existing `users.role` (Owner/Admin/Member) which is a permissions concept. Field is now `users.work_type` SELECT: Agency / Brand / App or Game / Software / Freelancer / Solo creator / Other. Plus `users.heard_about_us` for attribution. Both drive segmentation + future drip variations. |
| 5 | **Re-engagement variant of the drip** | For the 75 dormant existing accounts, don't put them through the same new-user drip. Adapt to re-engagement framing. To-do AFTER streamline lands — not in v1. |
| 6 | **3-stage flow (added 2026-05-04)** | Modelled on 4Play. Stage 1: Softr signup (Google auth, not codeable). Stage 2: Get Started page — first few screens, email verification + plan confirm, ends with subscribe step. Stage 3: first-login multi-stage onboarding form (single block, replaces the existing screen-1…screen-6 wizard). |
| 7 | **Drop `screen-6` first-review (added 2026-05-04)** | Previously kept in the streamline shortlist; now removed entirely. Users hit the product directly after stage 3. |
| 8 | **Keep the `subscriptions` table (decided 2026-05-04)** | Bev considered deleting it as redundant with `billing`. Audit confirmed it's load-bearing for the chat gate, EmailIt audiences, trial reminder cron, and the 8 `accounts.current_subscription → plan` lookups that `usage` formulas read from. No change. |
| 9 | **Stripe Checkout · Embedded mode (added 2026-05-04)** | Stripe iframe loads inside stage 2, user can switch plans without leaving the page. Replaces the redirect-to-Payment-Link pattern. The 12 personalised Payment Link formulas on `users` stay as fallback but are no longer the primary path. Needs a backend endpoint (Softr Call API or worker) to create Checkout Sessions with `trial_period_days: 7` at click-time. |
| 10 | **Stripe · 6 canonical prices (added 2026-05-04)** | One monthly + one yearly per plan. Trial is per-Session, not per-price. See Stripe price IDs below. All other prices + duplicate "(no trial)" products + Extra credits products + standalone Trial product are queued for archive (pending Bev's go). |
| 11 | ~~`pricing` primary = `product_name & " " & interval`~~ → **`pricing` primary = `stripe_price_id` (revised 2026-05-04)** | Bev's call: integration cleanliness over readability. Linked-record values on `users` ARE the Stripe price ID — no translation hop when calling Stripe API. Linked-record dropdowns in Softr UI will show price IDs (acceptable since Softr UI is admin-only). |
| 12 | **One linked field on users → pricing (added 2026-05-04)** | `users.selected_plan` (LINKED_RECORD → `pricing`). Interval, tier, max_videos, etc. flow through as lookups. No separate `selected_interval` field. |
| 13 | **Email verified field DROPPED (added 2026-05-04)** | Softr handles auth, no need for `users.email_verified_at`. |
| 14 | **Onboarding pages locked from Foreplay inspo (added 2026-05-04)** | Stage 1: Sign up + Check Inbox. Stage 2: Personalize + Pricing + Embedded Checkout. Stage 3: Team Setup + collapsed `screen-1`…`screen-5`. Stepper across 2-3: Register → Personalize → Confirm → Setup. **First page to build: Check Your Inbox.** |

## What needs to happen

| Layer | Item | Status |
|---|---|---|
| Code | Pick canonical chat block (likely `app/dashboard-chat`), delete the duplicate, reference from both onboarding + app contexts | ❌ |
| Code | Replace two-block website pattern (one visible / one hidden) with single account-setup block | ❌ |
| Code | Add user-type question to signup form (radio or select: Company / Solo creator / Agency / Brand) | ❌ |
| Code | **Build Check Your Inbox block (Stage 1, post-signup)** ← starting here. Brieflee custom code block. Reads `window.logged_in_user.email`. Shows "Check Your Inbox" + email icon + resend countdown + provider quick-links + "Go back to Sign In" | ❌ |
| Email | Activation email — Bev to add separate template in EmailIt outside the 30-template drip. Placeholder alias `bl-tx-email-activation` until built | ❌ |
| Code | Build Personalize block (Stage 2, page 1) — `work_type` + `heard_about_us` button grids | ❌ |
| Code | Build Pricing block (Stage 2, page 2) — 3-card pricing table, Monthly/Annual toggle | ❌ |
| Code | Build Embedded Stripe Checkout block (Stage 2, page 3) — Stripe.js iframe with `trial_period_days: 7` | ❌ |
| Code | Build Team Setup block (Stage 3, page 1) — team name + 3 invite emails | ❌ |
| Code | Build **Get Started** page wrapper (stage 2 routing across Personalize → Pricing → Checkout) | ❌ |
| Code | Build **Embedded Stripe Checkout** block on stage 2 — Stripe.js iframe, re-mountable on plan switch | ❌ |
| Code | Backend endpoint for Checkout Session creation — Softr Call API or small worker. Sets `trial_period_days: 7` and matching price_id from the 6 canonical | ❌ |
| Code | Collapse `screen-1`…`screen-5` into a single multi-stage form block (stage 3, first-login only) | ❌ |
| Code | Delete `screen-6` + `screen-6-a` (first-review step dropped) | ❌ |
| Schema | Add `users.work_type` SELECT: Agency / Brand / App or Game / Software / Freelancer / Solo creator / Other | ❌ |
| Schema | Add `users.heard_about_us` SELECT: X / LinkedIn / Instagram / TikTok / Google Search / YouTube / Newsletter / Podcast / Word of mouth / Friend or colleague / From a client / Ad I saw / Other | ❌ |
| Schema | Add `users.selected_plan` LINKED_RECORD → `pricing` (single field; interval etc. flow through as lookups) | ❌ |
| Schema | Set `pricing` primary field to `stripe_price_id` | ❌ |
| Schema | Reduce `pricing` to 6 rows (one per plan × interval), primary = matching Stripe price ID from the canonical 6 | ❌ |
| Onboarding screens | Move thresholds + review-mode pickers OUT of onboarding INTO settings | ❌ |
| Settings UI | Build / update settings page so users can edit brand bio, thresholds, review mode after onboarding | ❌ |
| Workflow | Update `BL | New Workspace + Team` for card-required + 7-day trial (no longer auto-creates trial sub on account create — Stripe webhook does it post-Checkout) | ❌ |
| Workflow | Update trial reminder cron — 7-day cadence (was 14) | ❌ |
| Stripe | Archive 10 products (6 no-trial dupes + standalone Trial + 3 Extra credits) + 16 historical prices on Creator/Crew/Studio | ✅ 2026-05-04 |
| Email | Re-cadence the 14-day drip → 7-day drip. 30 templates currently spaced over 14 days; recompress or trim | ❌ |
| Email | Re-engagement variant of the drip (deferred — do AFTER streamline lands) | ❌ |

## Order of work (revised 2026-05-04)

1. ~~Stripe cleanup~~ ✅ **DONE 2026-05-04** — 10 products + 16 historical prices archived.
2. **Schema**: add `users.user_type`; rename `pricing` primary field to `product_name & " " & interval`; reduce `pricing` to 6 rows mapped to the canonical Stripe prices
3. **Workflow + cron update**: rework `BL | New Workspace + Team` for card-required (Stripe webhook → trial sub, not on account create); trial reminder cron 14d → 7d
4. **Email drip re-cadence**: 14d → 7d (recompress or trim the 30 existing templates)
5. **Decide on canonical chat block**: pick which file lives, update both contexts to point at it
6. **Streamline account setup**: replace the two-block pattern with a single page
7. **Build Get Started page (stage 2)**: email verification + plan confirm + Embedded Stripe Checkout
8. **Backend endpoint for Checkout Sessions**: creates Session with `trial_period_days: 7` and matching `price_id`
9. **Collapse onboarding screens (stage 3)**: single multi-stage form covering welcome + account setup + user-type capture. Drop `screen-6` + `screen-6-a` entirely. Push thresholds + review-mode to Settings
10. **Add user-type capture** to the form
11. **Test end-to-end** with an `is_internal=true` account to dogfood
12. **Re-engagement drip variant** — defer until streamline is live and stable

## Stripe canonical prices (locked 2026-05-04)

| Plan | Interval | Price ID | Amount |
|---|---|---|---|
| Creator | Monthly | `price_1SGHuzIG1gGY9y21517vrys7` | $59 |
| Creator | Yearly | `price_1SGHvdIG1gGY9y21twF3H7NU` | $588 |
| Crew | Monthly | `price_1SGI2CIG1gGY9y21tuEFZgut` | $99 |
| Crew | Yearly | `price_1SGI31IG1gGY9y21vH0AifOz` | $1,068 |
| Studio | Monthly | `price_1SGI3iIG1gGY9y21ITPStmgR` | $249 |
| Studio | Yearly | `price_1SGI4HIG1gGY9y21oftkiARJ` | $2,388 |

Trial is per-Session: `trial_period_days: 7` is set when creating each Checkout Session, not on the price. This means we don't need separate trial vs non-trial products in Stripe.

## Related

- [CHANGELOG.md](../../CHANGELOG.md) — full history of changes leading up to this work
- [Workflow spec](../../docs/workflows-spec.md) — to be updated for card-required + 7-day trial
- [Email matrix](../08-email-matrix.md) — current 14-day drip; needs recompress to 7-day
- [Brand colours](../10-brand-colours.md) — design palette for any new UI
