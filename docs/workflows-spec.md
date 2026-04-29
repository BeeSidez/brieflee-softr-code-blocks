# Brieflee Workflow Architecture Spec

> Source-of-truth doc for FigJam workflow build. Covers Softr workflows + EmailIt setup. Stripe-specific workflows are a separate spec.

## Current EmailIt account state (verified 2026-04-29)

- **Workspace:** Bev (`/4fee711d/`)
- **API key:** `Brieflee` with Full Access scope, prefix `secret_JIMBO…`
- **Domain:** verified ✓
- **Send-first-email setup step:** not done yet (67% setup progress)
- **Audiences:** only the default `General` (`aud_4CwMZkngdbhVxwjRmJSbpLNtuHE`) — needs Trial Users, Active Subscribers, Lapsed created
- **Templates:** 8 exist but all Creator Scans content — Brieflee templates need to be created from scratch
- **Automations:** Beta. Three contexts available: Contact (active), Email (active), Event ("Soon" — not yet available). **We're locked into Contact-trigger automations for v1**, which means triggering by audience membership.
- **Quotas:** 50k monthly usage cap, 5,000/day, 2/sec. Email credits show 0 — TBD whether that's a separate paid layer or just unused; flag for Bev.

## High-level architecture

Three categories of work:

| Category | Where it lives | Examples |
|---|---|---|
| **Event-triggered workflows** | Softr | Signup → enrol in trial drip; Account created → create subscription |
| **Scheduled workflows** | Softr (daily cron) | Trial reminders, account-not-created nudges, mode-not-picked nudges |
| **EmailIt automations** | EmailIt UI (no Softr involvement) | 14-day features-explained drip, triggered by audience membership |

## EmailIt setup (do this first, before building Softr workflows)

### Audiences
Create in EmailIt UI. These are the "buckets" subscribers move between:

| Audience | Purpose | Who's in it |
|---|---|---|
| **Trial Users** | Drives 14-day drip | Anyone with `subscription_status = trialing` |
| **Active Subscribers** | Drives upsell/retention sends | Anyone with `subscription_status = active` |
| **Lapsed** | Re-engagement targets | Anyone with `subscription_status IN (canceled, past_due)` |

Notes:
- Internal staff (`users.is_internal = true`) should never be added to any audience
- A subscriber can be in multiple audiences but only **one drip** should ever be running per person

### Templates (create empty in EmailIt UI, design later)

**Drip campaign** (sent automatically by EmailIt automation, not by Softr):
- `features-day-01` through `features-day-14`

**Admin/conditional emails** (sent via API on triggers):
- `welcome` — fires on signup
- `account-not-created` — 24h after signup if no account
- `review-mode-not-picked` — 24h after account creation if `aiMode` blank
- `thresholds-not-set` — 24h after mode picked if thresholds untouched
- `trial-reminder-7d` — 7 days before `current_period_end`
- `trial-reminder-48h` — 48h before, includes 20% off Stripe coupon code
- `trial-reminder-24h` — 24h before, last chance
- `trial-ends-today` — sent on `current_period_end` day
- `payment-success` — on Stripe checkout completion (Stripe spec, deferred)
- `payment-failed` — on Stripe payment failure (Stripe spec, deferred)

### Automation in EmailIt UI

**One automation:** "When subscriber added to **Trial Users** audience"
- Day 0: send `features-day-01`
- Day 1: send `features-day-02`
- ...
- Day 13: send `features-day-14`
- **Exit conditions:** subscriber removed from Trial Users (i.e. they paid, cancelled, or trial ended) → automation stops automatically

This is the cleanest way to handle the drip — you don't manage scheduling, EmailIt does. Your only job is keeping the audience membership in sync.

### Domain auth + Stripe coupon (one-off setup)

- Verify your sending domain in EmailIt — set SPF/DKIM/DMARC DNS records
- Create one Stripe coupon `TRIAL20` (20% off first month, valid 30 days) — referenced in `trial-reminder-48h` template

---

## Workflow architecture (revised after reviewing existing workflows)

**One main workflow per user lifecycle event, anchored on the trigger date with Wait actions for time-based steps.** No daily cron sweep — that's harder to maintain and each user has their own clock anyway.

The existing Brieflee workflows (`BL | New Stripe Sub`, `BL | Successful Recurring Payment`, `BL | Sub Cancelled`, `BL | Payment failed`) already follow this pattern using Softr's native Wait action. We mirror it.

### The 3 active workflows we need

| Workflow | Trigger | Purpose |
|---|---|---|
| `BL | New Signup` | User record added | Whole user lifecycle from day 0 → day 14: drip enrolment, conditional nudges, trial reminders, trial end |
| `BL | New Stripe Sub` (revise existing) | Stripe webhook `customer.subscription.created` OR Checkout success | Convert trial to paid, remove from drip audience, add to active subscribers, send payment-success email |
| `BL | Sub Cancelled` (existing, fine) | Stripe webhook `customer.subscription.deleted` | Update DB state, remove from active audience, send cancel-confirm |
| `BL | Payment failed` (existing, fine) | Stripe webhook `invoice.payment_failed` | Update DB state, send dunning email |

---

## Workflow 1: `BL | New Signup` (revise heavily)

**Trigger:** User added (Softr DB)

This is the big one. Replaces the existing 4-step signup PLUS the originally-spec'd "Account Created" + "Daily Trial Check" workflows. One linear chain with Wait steps timing each beat against the user's signup date.

| # | Action | What it does |
|---|---|---|
| 1 | **Run custom code** — `Name parts` | Split full_name into first_name/last_name (mirror the Creator Scans `Name` step) |
| 2 | **Softr DB: add notification record** (notifications table) | `notification_type = Welcome`, link to user. Visible in app's notification badge. |
| 3 | **Slack: Post channel message** to `#new-user` | Internal alert: name, email |
| 4 | **Google Sheets: Add row** to Subscribers/New Users | Existing — keep for analytics |
| 5 | **Call API — Referly: create affiliate** | POST `https://www.referly.so/api/v1/affiliates`, body `{ email, firstName, lastName, affiliateLink, commissionRate: 40 }`. Auth credential: new `Brieflee Referly` connection. |
| 6 | **Softr DB: update user** | Save `affiliate_link` field returned by Referly (need to add this field to users table — TBD whether response contains the link or it's constructible from input) |
| 7 | **EmailIt API: add subscriber to `First 14 Days` audience** | POST `https://api.emailit.com/v2/audiences/{aud_xxx}/subscribers` body `{ "email", "first_name", "last_name", "custom_fields": { "softr_user_id" } }`. **Returns 409 if email exists — accept that as success.** Audience-membership kicks off the 14-day drip automation in EmailIt UI. |
| 8 | **EmailIt API: send `bl-features-day-01-welcome`** (or use Softr native Send email if simpler initially) | First drip email. Question: do we let EmailIt's automation send day 01, or send it inline here so the welcome arrives instantly? Recommend: inline send here for instant delivery, then EmailIt automation sends days 02-14. |
| 9 | **Wait — 1 day** | |
| 10 | **Softr DB: find account** for this user | If found, skip step 11. If not found, fall through. |
| 11 | **EmailIt API: send `bl-trial-create-account`** | Conditional — only if no account yet. Use a Branch action here gating on step 10's result. |
| 12 | **Wait — 4 days** (= day 5 from signup) | |
| 13 | **Softr DB: find account** + check `aiMode` | |
| 14 | **EmailIt API: send `bl-trial-pick-review-mode`** | Conditional — only if account exists and aiMode is blank |
| 15 | **Wait — 1 day** (= day 6) | |
| 16 | **EmailIt API: send `bl-trial-set-quality-settings`** | Conditional — if thresholds still at defaults |
| 17 | **Wait — 1 day** (= day 7, halfway) | |
| 18 | **EmailIt API: send `bl-trial-reminder-1`** | Halfway-through nudge |
| 19 | **Wait — 1 day** (= day 8) | |
| 20 | **Softr DB: find submissions** for this user's accounts | |
| 21 | **EmailIt API: send `bl-trial-first-review`** | Conditional — only if no submission yet |
| 22 | **Wait — 4 days** (= day 12) | |
| 23 | **Branch: did they pay yet?** Check `account.subscription_status` | If `active` → exit workflow (Stripe Sub workflow handled it). Else continue. |
| 24 | **EmailIt API: send `bl-trial-reminder-2-48h`** | 48h warning |
| 25 | **Wait — 1 day** (= day 13) | |
| 26 | **Branch: paid yet?** | Same gate |
| 27 | **EmailIt API: send `bl-trial-reminder-3-24h`** | 24h warning |
| 28 | **Wait — 1 day** (= day 14) | |
| 29 | **Branch: paid yet?** | Same gate |
| 30 | **EmailIt API: send `bl-trial-ends-today`** | Final-day offer |
| 31 | **Softr DB: update subscription** | `status = expired` |
| 32 | **Slack: Post channel message** to `#new-user` | "Trial expired without conversion" alert |

**Notes:**
- Trial timer is anchored to **signup date** (not account creation). Bev's preference: simpler model, accept the edge case where signup-without-account burns trial days.
- Steps 23 / 26 / 29 are all "did they convert?" branches. When the Stripe Sub workflow runs, it should set a flag on the user record (or update `account.subscription_status`) — these branches read that flag and exit early to avoid sending trial reminders to paying customers.
- **Don't suppress on `is_internal`** — Bev wants to dogfood emails on her own account.

### What about account creation?

When user clicks "Create your workspace" in the dashboard, that fires a separate "Account Created" trigger we can hook into:

**Workflow 1b: `BL | Account Created`** (small workflow, fires from a different trigger)

| # | Action |
|---|---|
| 1 | Softr DB: create subscription with `status = trialing`, `plan = Studio Monthly`, `current_period_end = today + 14 days` |
| 2 | Softr DB: update account, set `current_subscription` link |
| 3 | Slack: Post message "Workspace created" |

This is the trial-record creation. It's not part of New Signup because account creation can happen any time after signup (or never).

---

## Workflow 2: `BL | New Stripe Sub` (revise existing)

The current workflow does too much — separate concerns. Simplified target:

**Trigger:** Stripe webhook `customer.subscription.created` (or invoice.paid for first invoice)

| # | Action |
|---|---|
| 1 | Run custom code — Dates & Money (existing, keep) |
| 2 | Softr DB: find user by `customer_email` |
| 3 | Softr DB: find pricing by `stripe_price_id` |
| 4 | Softr DB: upsert subscription record (one per `stripe_subscription_id`), status=`active`, link to account + plan |
| 5 | Softr DB: update account.`current_subscription` link |
| 6 | Softr DB: add notification record (notification_type = `Subscription started`) |
| 7 | EmailIt API: remove subscriber from `First 14 Days` audience (stops drip) |
| 8 | EmailIt API: add subscriber to `Active Subscribers` audience |
| 9 | EmailIt API: send `bl-tx-payment-success` |
| 10 | Slack: Post message "🎉 New paid subscriber" |

**One upsert (step 4) drives quota.** Everything else in the original workflow's billing/usage chain happens automatically through Softr formulas now (since the schema migration).

The existing 12-step "do everything" Stripe Sub workflow can be retired once this leaner version is wired up.

---

## Workflow 3: `BL | Sub Cancelled` (existing, minor tweaks)

Keep the existing 7-step shape. Add to the end:
- EmailIt API: remove subscriber from `Active Subscribers` audience
- EmailIt API: add subscriber to `Lapsed` audience
- EmailIt API: send `bl-tx-cancellation-confirm` (optional)

---

## Workflow 4: `BL | Payment failed` (existing, minor tweaks)

Keep the existing 7-step shape. Add to the end:
- EmailIt API: send `bl-tx-payment-failed` (transactional, not marketing — no unsubscribe)

Stripe handles the dunning retry schedule automatically; this email is the user-facing "your card needs attention" message.

---

## EmailIt API call patterns (corrected to match actual docs)

**Base URL:** `https://api.emailit.com/v2`
**Auth header:** `Authorization: Bearer {EMAILIT_API_KEY}`

### Add subscriber to audience
```http
POST /v2/audiences/{aud_xxxxx}/subscribers
Content-Type: application/json
Authorization: Bearer ...

{
  "email": "user@example.com",
  "first_name": "Jane",
  "last_name": "Doe",
  "custom_fields": {
    "softr_user_id": "abc123"
  }
}
```
**Note:** Returns 409 Conflict on duplicate email. Workflow should treat 409 as success (already-added).

### Remove subscriber from audience
```http
DELETE /v2/audiences/{aud_xxxxx}/subscribers/{subscriber_id}
```

### Send transactional email (template-based)
Endpoint is `POST /v2/emails` (not `/emails/send`). Template can be referenced by alias OR by `tem_xxx` ID.
```http
POST /v2/emails

{
  "from": "hello@brieflee.co",
  "to": "user@example.com",
  "template": "bl-welcome",
  "variables": {
    "first_name": "Jane",
    "account_setup_url": "https://app.brieflee.co/..."
  }
}
```
**Variable syntax in templates:** Mustache — `{{first_name}}`

### Send transactional email (ad-hoc, no template)
```http
POST /v2/emails

{
  "from": "hello@brieflee.co",
  "to": "user@example.com",
  "subject": "Welcome",
  "html": "<p>Hi {{first_name}}...</p>"
}
```

### Idempotency
For workflow steps that might retry, add header `Idempotency-Key: {unique-string}` (max 256 chars, alphanumeric + dash + underscore). EmailIt prevents duplicates within 24h.

### Rate limits
- 2 messages/sec (new workspaces)
- 5,000/day cap

The daily cron workflow needs to respect this. If you're nudging 100 users/day, fine. If you ever hit 1000+, batch with delays.

---

## Things to consider that aren't obvious

### 1. Stopping the drip when someone pays
When the Stripe checkout success redirect fires (separate spec):
- Remove subscriber from **Trial Users** audience → drip stops automatically
- Add subscriber to **Active Subscribers** audience
- Send `payment-success` transactional email

If you forget to remove from Trial Users, paying customers keep getting "Day 7 of your trial" emails. That's a bad look.

### 2. Stopping the drip when trial expires
Same idea: when `Daily Trial Check` flips status to `expired`, remove from Trial Users audience and (optionally) add to Lapsed.

### 3. `is_internal` everywhere
Every workflow that sends marketing emails or enrols audiences should check `user.is_internal` first. Test users + Brieflee staff should never receive these emails.

### 4. Transactional vs marketing legal split
EmailIt automatically adds List-Unsubscribe headers for compliance. But account-related emails (e.g. `payment-failed`) shouldn't have an unsubscribe — they're transactional/necessary. EmailIt distinguishes these via "transactional" vs "broadcast" categories on send. Mark transactional emails as such in the API call to skip unsubscribe footer.

### 5. Scheduled workflows in Softr
Softr's scheduled workflows fire at a fixed time. For a daily 09:00 UTC check, that's fine. If you ever need finer granularity (e.g. send `trial-reminder-48h` at the exact 48h mark, not aligned to 09:00), you'd need a more sophisticated approach. Acceptable to not do that for v1.

### 6. The 20% off code in `trial-reminder-48h`
Create the Stripe coupon `TRIAL20` once. Reference the **promo code URL** in the email (Stripe checkout supports `?prefilled_promo_code=TRIAL20`). Static code is simpler than per-user codes.

### 7. Re-engagement campaign
When you bulk-reset 75 inactive accounts to fresh trials:
- Add all to Trial Users audience → they all get the 14-day drip restarting from day 1
- Reset `last_nudge_sent` to blank → reminder cadence works
- Single API loop on your end; EmailIt handles cadence

### 8. Bounce / complaint handling
EmailIt webhooks fire on bounce/complaint. Optional v1: set up a webhook that flags `users.email_status = bounced` so you stop sending. Skip for now; revisit if email reputation becomes an issue.

---

## Order of build

1. **EmailIt:** create audiences, create empty templates, set up the 14-day automation, verify domain
2. **Softr DB:** add `users.last_nudge_sent` SELECT field (options: blank, "account-not-created", "review-mode-not-picked", "thresholds-not-set")
3. **Workflow 1 (revise New Signup):** add the 3 new steps
4. **Workflow 2 (Account Created):** new workflow
5. **Workflow 3 (Daily Trial Check):** new workflow
6. **Test end-to-end with `is_internal = true`** test user
7. **Re-engagement campaign:** bulk script (I can write this) to reset existing 75 inactive accounts

Stripe workflows come after this — handled in a separate spec since they're independent.
