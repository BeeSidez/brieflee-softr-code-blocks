# Brieflee Workflow Architecture Spec

> Source-of-truth doc for FigJam workflow build. Covers Softr workflows + EmailIt setup. Stripe-specific workflows are a separate spec.

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

## Workflow 1: `BL | New Signup` (revise existing)

**Trigger:** User added (Softr DB)

| Step | Action | Details |
|---|---|---|
| 1 | (keep) Add row to Google Sheets | Existing — useful for analytics |
| 2 | (keep) Post Slack message | Existing — internal visibility |
| 3 | **Branch: skip if `user.is_internal = true`** | Don't enrol staff in marketing flows |
| 4 | **NEW** API call — EmailIt: add to **Trial Users** audience | `POST /v2/audiences/{TRIAL_AUDIENCE_ID}/subscribers/add` body `{ "email": "{{user.email}}", "fields": { "first_name": "{{user.first_name}}" } }` |
| 5 | **NEW** API call — EmailIt: send `welcome` template | `POST /v2/emails/send` body `{ "to": "{{user.email}}", "template_id": "{WELCOME_TEMPLATE_ID}", "variables": { "first_name": "{{user.first_name}}", "account_setup_url": "https://app.brieflee.co/account-setup" } }` |

**What we're NOT doing here:**
- Not creating an account record (user does that themselves on dashboard)
- Not creating a subscription record (that fires when account is created — Workflow 2)

---

## Workflow 2: `BL | Account Created` (NEW)

**Trigger:** Account record created (Softr DB)

| Step | Action | Details |
|---|---|---|
| 1 | API call — Softr: create subscription | POST to `subscriptions` table: `{ "account": [account.id], "plan": [STUDIO_MONTHLY_PRICING_ID], "status": "trialing", "current_period_end": TODAY + 14 days, "name": "{{account.name}} → trial" }` |
| 2 | API call — Softr: link account.current_subscription | PATCH account record with `{ "current_subscription": [new_sub_id] }` |
| 3 | (Optional) Slack notify "new trial started" | Visibility |

**Why account-creation, not signup:** users sign up but might not create an account for hours/days. Trial timer only makes sense from when they have a brand to actually review against.

---

## Workflow 3: `BL | Daily Trial Check` (NEW, scheduled)

**Trigger:** Scheduled, runs once daily at e.g. 09:00 UTC

This is one workflow that does multiple checks. Each check runs over all matching users.

### Check A: trial reminder cadence

For each `subscriptions` where `status = trialing`:
- `current_period_end - today = 7 days` → send `trial-reminder-7d`
- `current_period_end - today = 2 days` → send `trial-reminder-48h`
- `current_period_end - today = 1 day` → send `trial-reminder-24h`
- `current_period_end - today = 0` → send `trial-ends-today` AND update sub: `status = expired`

### Check B: account-not-created nudge

For each `users` where `created_at < (now - 24h)` AND user has no linked account AND `last_nudge_sent != "account-not-created"`:
- Send `account-not-created`
- Update user: `last_nudge_sent = "account-not-created"`

### Check C: review-mode-not-picked nudge

For each `accounts` where `created_at < (now - 24h)` AND `aiMode` is blank AND not yet nudged:
- Send `review-mode-not-picked`
- Set a flag so we don't repeat

### Check D: thresholds-not-set nudge

For each `accounts` where `aiMode` set but thresholds at default values AND `account.created_at < (now - 48h)` AND not yet nudged:
- Send `thresholds-not-set`

### Idempotency

Add a `last_nudge_sent` SELECT field on `users` and/or `accounts` (with options matching template names) so the daily workflow doesn't re-send the same nudge. Reset on re-engagement campaigns.

---

## EmailIt API call patterns (reference for FigJam nodes)

**Base URL:** `https://api.emailit.com/v2`
**Auth header:** `Authorization: Bearer {EMAILIT_API_KEY}`

### Add subscriber to audience
```http
POST /v2/audiences/{audience_id}/subscribers/add
Content-Type: application/json
Authorization: Bearer ...

{
  "email": "user@example.com",
  "fields": {
    "first_name": "Jane",
    "account_id": "abc123"
  }
}
```

### Remove subscriber from audience
```http
DELETE /v2/audiences/{audience_id}/subscribers/{subscriber_id}
```

### Send transactional email (template-based)
```http
POST /v2/emails/send

{
  "to": "user@example.com",
  "template_id": "tpl_xxx",
  "variables": {
    "first_name": "Jane",
    "account_setup_url": "https://app.brieflee.co/..."
  }
}
```

### Send transactional email (ad-hoc, no template)
```http
POST /v2/emails/send

{
  "to": "user@example.com",
  "subject": "Welcome",
  "html": "<p>Hi {{first_name}}...</p>",
  "from": "hello@brieflee.co"
}
```

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
