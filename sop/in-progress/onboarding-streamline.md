# Feature: Onboarding streamline

Tracks the planned overhaul of the Brieflee onboarding flow before relaunch. Move out of `in-progress/` once everything is built.

## Why

Current onboarding is a multi-screen wizard (`screen-1` through `screen-6` plus `screen-2-a` and `screen-6-a`) that's been patchworked over time. It's slow, blocks users on detailed settings before they've seen the product work, and the chat block is duplicated across `onboarding/` and `app/`. Time to simplify.

## Decisions locked 2026-05-01

| # | Decision | Rationale |
|---|---|---|
| 1 | **14-day trial for everyone, Studio plan, no card required** | Locked in workflow spec. Maximises time-to-conversion vs blocking users on a payment they're not ready for. |
| 2 | **Consolidate chat into one code block** | `onboarding/brieflee-chat` and `app/dashboard-chat` are currently byte-for-byte identical. Pick one canonical location, reference from both contexts. Drops maintenance overhead and risk of drift. |
| 3 | **Streamline account setup to a single one-page** | Currently uses two blocks (one for "website populated", one for "not"). Replace with a single quick-start that lets users get in fast. Detailed config (thresholds, review modes, brand voice tuning) moves to **Settings** — accessible after they've seen the product work. |
| 4 | **Capture user type at signup** | Add a question: company / solo creator / agency / brand. Drives segmentation, content tailoring, and possibly per-segment drip variations later. |
| 5 | **Re-engagement variant of the 14-day drip** | For the 75 dormant existing accounts, don't put them through the same new-user drip. Adapt to re-engagement framing. To-do AFTER streamline lands — not in v1. |

## What needs to happen

| Layer | Item | Status |
|---|---|---|
| Code | Pick canonical chat block (likely `app/dashboard-chat`), delete the duplicate, reference from both onboarding + app contexts | ❌ |
| Code | Replace two-block website pattern (one visible / one hidden) with single account-setup block | ❌ |
| Code | Add user-type question to signup form (radio or select: Company / Solo creator / Agency / Brand) | ❌ |
| Schema | Add `users.user_type` SELECT field with choices: Company, Solo creator, Agency, Brand, Other | ❌ |
| Onboarding screens | Audit `screen-1` through `screen-6` — which of these still need to exist as separate steps vs collapse into one page? | ❌ |
| Onboarding screens | Move thresholds + review-mode pickers OUT of onboarding INTO settings | ❌ |
| Settings UI | Build / update settings page so users can edit brand bio, thresholds, review mode after onboarding | ❌ |
| Workflow | `BL | New Workspace + Team` workflow already creates a Studio trial subscription on account create — verify the conditional nudges in that workflow still make sense given the streamlined flow | ❌ |
| Email | Re-engagement variant of the drip (deferred — do AFTER streamline lands) | ❌ |

## Order of work (suggested)

1. **Schema first**: add `users.user_type` field
2. **Decide on canonical chat block**: pick which file lives, update both contexts to point at it
3. **Streamline account setup**: replace the two-block pattern with a single page
4. **Audit + collapse onboarding screens**: probably `screen-1` (welcome) + `screen-2` (account setup) + `screen-6` (first review chat) is enough; the rest move to settings
5. **Add user-type capture** to signup form
6. **Test end-to-end** with an `is_internal=true` account to dogfood
7. **Re-engagement drip variant** — defer until streamline is live and stable

## Related

- [CHANGELOG.md](../../CHANGELOG.md) — full history of changes leading up to this work
- [Workflow spec](../../docs/workflows-spec.md) — the 14-day trial logic + workflow that creates trial subscriptions
- [Email matrix](../08-email-matrix.md) — current 14-day drip; re-engagement variant will draft from this
- [Brand colours](../10-brand-colours.md) — design palette for any new UI
