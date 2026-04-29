# Brieflee email matrix

Every email in the system, grouped by how it's sent. Two delivery modes:

- **Audience automation** — set up in EmailIt UI on the audience. Time-based, fires for everyone in the audience. Stops if user is removed.
- **Transactional from Softr workflow** — sent via API call from a workflow step, conditional on Softr DB state.

---

## 1. `BL | Onboarding` audience automation — 14-day educational drip

Triggered when user is added to the audience (on signup). Stops if user is removed (paid, expired, etc.).

| # | Template alias | Wait time | Description |
|---|---|---|---|
| 1 | `bl-features-day-01-welcome` | Day 0 (immediate) | Warm welcome. What Brieflee is, what's coming over the next 14 days. |
| 2 | `bl-features-day-02-account` | +1 day | Set up your workspace — brand bio, voice, tone. Why it matters for AI review quality. |
| 3 | `bl-features-day-03-swipe-videos` | +1 day | Swipe files — save content you love as inspo, attach to briefs so creators see your reference, or remix into your own briefs. |
| 4 | `bl-features-day-04-quality-settings` | +1 day | Quality thresholds — set the bar for what gets approved. |
| 5 | `bl-features-day-05-review-content` | +1 day | How AI review works end-to-end. Sample reviews. |
| 6 | `bl-features-day-06-remix-content` | +1 day | Remix — take a swipe file and turn it into your own brief, or attach it as inspo so creators see what you want. |
| 7 | `bl-features-day-07-create-campaign` | +1 day | Campaigns — group reviews under a single brand effort. |
| 8 | `bl-features-day-08-create-brief` | +1 day | Briefs — what you ask creators to make. |
| 9 | `bl-features-day-09-invite-team` | +1 day | Bring colleagues into the workspace as collaborators. |
| 10 | `bl-features-day-10-invite-members` | +1 day | Account members vs team — who can do what. |
| 11 | `bl-features-day-11-invite-creators` | +1 day | Connect with creators making your content. |
| 12 | `bl-features-day-12-bulk-upload-briefs` | +1 day | Upload many briefs at once via CSV. |
| 13 | `bl-features-day-13-bulk-upload-videos` | +1 day | Upload many videos at once for batch review. |
| 14 | `bl-features-day-14-affiliate` | +1 day | Earn 40% by referring others to Brieflee. |

**Membership rules:**
- Added: on user signup (`BL | New Signup` workflow, owner role only)
- Removed: when subscription becomes `active` (paid) or when day 97 dormant cleanup fires

---

## 2. `BL | Subscribers` audience automation — paid customer welcome + retention

| # | Template alias | Wait time | Description |
|---|---|---|---|
| 1 | `bl-tx-payment-success` | Day 0 (immediate) | "You're in" — welcome to paid Brieflee, key features unlocked, dashboard link. |

(More retention emails can be added later — for v1, just the welcome.)

**Membership rules:**
- Added: when `BL | New Stripe Sub` workflow upserts subscription with `status=active`
- Removed: when subscription cancels or payment fails beyond retry

---

## 3. `BL | Lapsed` audience automation — re-engagement / win-back

| # | Template alias | Wait time | Description |
|---|---|---|---|
| 1 | `bl-trial-winback` | Day 0 (immediate) | "We saved your spot" — first attempt to bring them back. |

(Standalone broadcasts can also go to this audience for relaunches, new features.)

**Membership rules:**
- Added: when subscription cancels (`BL | Sub Cancelled` workflow), trial expires, or day-97 deletion fires
- Removed: if they sign up again as a new user (manual cleanup or workflow)

---

## 4. `BL | Team Members` audience automation — invited collaborator series

| # | Template alias | Wait time | Description |
|---|---|---|---|
| 1 | `bl-tx-team-invite` | Day 0 (immediate) | "{owner_name} invited you to {workspace} on Brieflee." Accept link, what they can do. |

(Optional follow-up "how to use Brieflee as a member" can be added later.)

**Membership rules:**
- Added: when member user record is created (in `BL | New Workspace + Team` workflow)
- Removed: if member becomes account owner of their own workspace, or if they're deleted

---

## 5. Conditional transactional sends (from Softr workflows)

These check Softr DB state at fire time and only send if the condition matches. Sent via Call API in the relevant workflow.

### From `BL | New Signup` workflow (anchored on user signup)

| Template alias | Trigger | Condition to send | Description |
|---|---|---|---|
| `bl-trial-create-account` | Day 1 after signup | No account record exists for this user | Gentle "set up your workspace" nudge. |
| `bl-trial-create-account-day6` | Day 6 after signup | Still no account record | Stronger CTA: "still nothing — here's why people love Brieflee once they set up." |
| `bl-winback-30d` | Day 30 after signup | Still no account record | "We've kept your spot. Here's 20% off if you set up." |
| `bl-winback-60d` | Day 60 after signup | Still no account record | Different angle — customer story, social proof. |
| `bl-winback-90d-final` | Day 90 after signup | Still no account record | "Your account closes in 7 days unless you come back." |

Day 97: user record is deleted (no email, just Slack audit message).

### From `BL | New Workspace + Team` workflow (anchored on account creation)

| Template alias | Trigger | Condition to send | Description |
|---|---|---|---|
| `bl-trial-pick-review-mode` | Day 1 after account | `account.aiMode` is blank | Educational nudge — pick Autonomous/Hybrid/Manual. |
| `bl-trial-set-quality-settings` | Day 2 after account | `thresholds_acknowledged = false` (or thresholds untouched since creation) | Tune your quality settings — show defaults aren't always optimal. |
| `bl-trial-first-review` | Day 5 after account | No submissions exist for this account | "Submit your first review" — show the magic of AI review. |
| `bl-trial-reminder-1` | Day 7 after account | `subscription.status = trialing` | Halfway-through nudge — "make the most of your remaining 7 days." |
| `bl-trial-reminder-2-48h` | Day 12 after account | `subscription.status = trialing` | 48 hours to trial end. **Offer:** Upgrade now with 20% off your first month. **Code:** `TRIALUPGRADE` |
| `bl-trial-reminder-3-24h` | Day 13 after account | `subscription.status = trialing` | 24 hours to trial end. **Offer:** Upgrade now and save 20%. **Code:** `LASTCHANCE` |
| `bl-trial-ends-today` | Day 14 after account | `subscription.status = trialing` | Trial ends today. **Special Final Offer (next 12 hours):** 30% off your first 3 months + free 30-minute strategy session with the team + priority support for your first campaign. **CTA:** "Claim This Offer Now". **Code:** `FINALDAY` |

### From `BL | Payment failed` workflow (Stripe webhook)

| Template alias | Trigger | Description |
|---|---|---|
| `bl-tx-payment-failed` | On `invoice.payment_failed` Stripe webhook | "Your card was declined — update payment to keep using Brieflee." Transactional, no unsubscribe. |

---

## Quick reference: every template

| Alias | Send mode | When |
|---|---|---|
| `bl-features-day-01-welcome` to `bl-features-day-14-affiliate` | Audience automation (Onboarding) | Days 0–13 of audience membership |
| `bl-trial-create-account` | Transactional (New Signup workflow) | Day 1 if no account |
| `bl-trial-create-account-day6` | Transactional (New Signup workflow) | Day 6 if no account |
| `bl-winback-30d`, `60d`, `90d-final` | Transactional (New Signup workflow) | Days 30/60/90 if no account |
| `bl-trial-pick-review-mode` | Transactional (New Workspace workflow) | Day 1 after account if mode unset |
| `bl-trial-set-quality-settings` | Transactional (New Workspace workflow) | Day 2 after account if untouched |
| `bl-trial-first-review` | Transactional (New Workspace workflow) | Day 5 after account if no submission |
| `bl-trial-reminder-1` | Transactional (New Workspace workflow) | Day 7 after account if still trialing |
| `bl-trial-reminder-2-48h` | Transactional (New Workspace workflow) | Day 12 after account if still trialing |
| `bl-trial-reminder-3-24h` | Transactional (New Workspace workflow) | Day 13 after account if still trialing |
| `bl-trial-ends-today` | Transactional (New Workspace workflow) | Day 14 after account if still trialing |
| `bl-trial-winback` | Audience automation (Lapsed) | Day 0 of joining Lapsed |
| `bl-tx-payment-success` | Audience automation (Subscribers) | Day 0 of joining Subscribers |
| `bl-tx-payment-failed` | Transactional (Payment Failed workflow) | On Stripe webhook |
| `bl-tx-team-invite` | Audience automation (Team Members) | Day 0 of joining Team Members |

**Total: 30 templates** (all created and ready in EmailIt — IDs/aliases at [`docs/emailit-assets-2026-04-29.json`](../docs/emailit-assets-2026-04-29.json)).

---

## What's left for you

- **Design content** for each template in EmailIt's editor (you said separate chat — that's fine)
- **Set up 4 EmailIt automations** in the UI:
  1. `BL | Onboarding` — 14-day drip (the big one)
  2. `BL | Subscribers` — single welcome email
  3. `BL | Lapsed` — single winback (more can be added later)
  4. `BL | Team Members` — single invite (more can be added later)
- **Wire transactional sends** in the Softr workflows using the [cURL reference](07-emailit-curl-reference.md)
