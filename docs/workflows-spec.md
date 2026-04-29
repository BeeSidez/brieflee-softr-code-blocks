# Brieflee Workflow Architecture Spec

> Source-of-truth doc for the Softr workflow build. Covers Softr workflows + EmailIt setup.

## Visual diagrams (FigJam)

Each workflow has a FigJam — use these for explaining the system:

| Diagram | Link |
|---|---|
| Workflow overview (master) | https://www.figma.com/board/vPr2oHapkKksuXg4kUNEMr |
| BL \| New Signup detail | https://www.figma.com/board/lKfo7zKngJXuBLSnNcb6r7 |
| BL \| New Workspace + Team detail | https://www.figma.com/board/ZL3J6FgybJ0ZMhneDOkkt0 |
| BL \| New Stripe Sub detail | https://www.figma.com/board/BRDjDkwsfi5EDrMTEBAbvr |
| BL \| Sub Cancelled detail | https://www.figma.com/board/htWBxgsgha6lLrLeJfhkjg |
| BL \| Payment failed detail | https://www.figma.com/board/QKKlj3ST7drCdUQks2gNGi |

## SOPs (process docs)

Day-to-day operational docs are at [`sop/`](../sop/00-README.md). Read those for the "how do we run this" view; this doc is the "what should each workflow do" reference.

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

## Final decisions (locked 2026-04-29)

After review of the existing workflows + EmailIt account, these are the architecture decisions:

1. **Two main workflows**, not one mega-workflow:
   - `BL | New Signup` — fires on user record create. Owns the "no account yet" stage.
   - `BL | New Workspace + Team` — fires on account create. Owns the trial timer + product nudges.
2. **Drip continues independently in EmailIt** — Contact-trigger automation watching `First 14 Days` audience, fires day 02–14 emails automatically.
3. **Trial timer anchored at account creation**, not signup. If user signs up but never creates account, no trial expires for them — they just sit in drip + lapse to win-back.
4. **Team members** (added via the team_email fields in onboarding) get role=Member, status=Pending, and **are NOT enrolled in the 14-day drip**. They get a separate single invite email instead.
5. **Google Sheets row stays as a deletion backup** (not the primary capture). EmailIt audience is primary.
6. **Auto-deletion of dormant signups at day 90** with 30/60/90 day win-back cadence first. Necessary because of Softr's 5,000-external-user cap shared across Bev's products.
7. **`is_internal` flag** suppresses paywall/quota gates only — emails still go to staff for dogfooding.

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

## Workflow 1: `BL | New Signup` (revise existing)

**Trigger:** User added (Softr DB)

Owns the "we have an email, no workspace yet" stage. Drip enrolment, affiliate setup, account-creation nudge, and eventual deletion if they ghost.

**Important: skip enrolment for team members.** Check `user.role` first — if `role = Member`, branch to a separate invite email instead of the drip. Members didn't sign up themselves; they were added by an account owner.

| # | Action | What it does |
|---|---|---|
| 1 | **Run custom code** — `Name parts` | Split full_name into first_name/last_name (mirror the Creator Scans `Name` step) |
| 2 | **Branch: is `user.role = Member`?** | YES → go to step 3a (invite email path). NO → continue to step 3 (full signup path). |
| 3 | **Softr DB: add notification record** (notifications table) | `notification_type = Welcome`, link to user. Visible in app's notification badge. |
| 4 | **Slack: Post channel message** to `#new-user` | Internal alert: name, email |
| 5 | **Google Sheets: Add row** to Subscribers/New Users | Backup record (deletion safety net — if a user is deleted we still have audit trail) |
| 6 | **Call API — Referly: create affiliate** | POST `https://www.referly.so/api/v1/affiliates`, body `{ email, firstName, lastName, affiliateLink, commissionRate: 40 }`. Auth credential: new `Brieflee Referly` connection. |
| 7 | **Softr DB: update user** | Save `affiliate_link` field returned by Referly (need to add this field to users table — TBD whether response contains the link or it's constructible from input) |
| 8 | **EmailIt API: add subscriber to `First 14 Days` audience** (`aud_4D1p0CkELqJe0jjrJ4aOuVywgP6`) | POST `https://api.emailit.com/v2/audiences/{aud_xxx}/subscribers` body `{ "email", "first_name", "last_name", "custom_fields": { "softr_user_id" } }`. **Returns 409 if email exists — accept that as success.** Audience-membership kicks off the 14-day drip automation in EmailIt UI. |
| 9 | **EmailIt API: send `bl-features-day-01-welcome`** (template alias) | First drip email, sent inline so welcome arrives instantly. EmailIt automation handles days 02–14. |
| 10 | **Wait — 1 day** | |
| 11 | **Softr DB: find account** for this user | |
| 12 | **Branch: account exists?** | YES → exit workflow (no further account-creation nudges needed; trial workflow takes over). NO → continue. |
| 13 | **EmailIt API: send `bl-trial-create-account`** | First nudge |
| 14 | **Wait — 5 days** (= day 6) | |
| 15 | **Softr DB: find account** + branch — exists? exit : continue | |
| 16 | **EmailIt API: send `bl-trial-create-account`** with stronger CTA copy variant | Could be a second template, or pass a variable into the same template that toggles tone |
| 17 | **Wait — 24 days** (= day 30) | |
| 18 | **Softr DB: find account** + branch — exists? exit : continue | |
| 19 | **EmailIt API: send `bl-winback-30d`** | "We saved your spot, here's 20% off if you come back" |
| 20 | **Wait — 30 days** (= day 60) | |
| 21 | **Branch: account exists?** exit if yes | |
| 22 | **EmailIt API: send `bl-winback-60d`** | Stronger offer or different angle |
| 23 | **Wait — 30 days** (= day 90) | |
| 24 | **Branch: account exists?** exit if yes | |
| 25 | **EmailIt API: send `bl-winback-90d-final`** | "We're closing your account in 7 days unless you come back" |
| 26 | **Wait — 7 days** | |
| 27 | **Branch: account exists?** exit if yes | |
| 28 | **EmailIt API: remove subscriber from `First 14 Days` audience**, add to `Lapsed` | They're done with the active funnel; keep email for occasional broadcasts |
| 29 | **Softr DB: delete user record** | Frees up the Softr 5k-external-user slot |
| 30 | **Slack: Post message** to `#new-user` | "Auto-deleted dormant user: {email} (97 days no account)" — audit trail |

**Branch 2 (step 3a): team member invite path**

| # | Action |
|---|---|
| 3a | **EmailIt API: send `bl-tx-team-invite`** (new template — needs creating) | "{owner_name} invited you to join their Brieflee workspace. Click here to accept." |
| 3b | Slack: Post message "Team member added: {email} → {account.name}" | Visibility |
| 3c | END | No drip enrollment for members. They convert to active when they accept the invite (status flips Pending → Active). |

**Why team members don't get the 14-day drip:** they didn't sign up to learn the product end-to-end; they were invited to collaborate on a specific workspace. The owner is going through the drip and will share with them. Sending them 14 educational emails would feel spammy.

**Notes:**
- Steps 12, 15, 18, 21, 24, 27 are all "does an account exist?" branches. As soon as one returns YES, the workflow exits — they're being handled by `BL | New Workspace + Team` from now on.
- All deletion happens via the Softr DB delete record action. Email stays in EmailIt's `Lapsed` audience for any future broadcasts.
- This workflow is ~30 steps but only 1-3 branches will actually execute for any given user (most either create an account on day 0-6 and exit, or get auto-deleted on day 97).

### Need to add: `bl-tx-team-invite` template + 3 win-back templates

The template list created already includes `bl-trial-winback`. Add three more for the deletion cadence:
- `bl-winback-30d` — "We've kept your spot. Come back?"
- `bl-winback-60d` — "Last chance to keep your account active"
- `bl-winback-90d-final` — "Your account closes in 7 days"
- `bl-tx-team-invite` — "You've been invited to {workspace_name}"

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
  "from": "Brieflee <bev@brieflee.co>",
  "to": "user@example.com",
  "template": "bl-welcome",
  "variables": {
    "first_name": "Jane",
    "account_setup_url": "https://www.brieflee.co/login"
  }
}
```
**Variable syntax in templates:** Mustache — `{{first_name}}`

### Send transactional email (ad-hoc, no template)
```http
POST /v2/emails

{
  "from": "Brieflee <bev@brieflee.co>",
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
