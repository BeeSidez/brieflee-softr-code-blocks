# EmailIt system SOP

How Brieflee uses EmailIt for transactional + marketing email. Read [`~/Claude Code/Docs/emailit-reference.md`](../../../Docs/emailit-reference.md) first for the platform basics — this doc is Brieflee-specific setup and conventions.

## What's in our EmailIt account

**Workspace:** `app.emailit.com/4fee711d/`
**API key:** `Brieflee` (Full Access scope) — copy from [API Keys page](https://app.emailit.com/4fee711d/api-keys)
**Sending domain:** verified

## Audiences

| Audience | When users are added | When they're removed |
|---|---|---|
| `First 14 Days` | On user signup (BL \| New Signup workflow) | When they pay (BL \| New Stripe Sub) or hit day 97 dormant |
| `Active Subscribers` | On Stripe subscription creation | On cancellation |
| `Lapsed` | On subscription cancellation, payment failure beyond grace, dormant deletion | When/if they convert again |

The `First 14 Days` audience drives the 14-day Contact-trigger automation set up in EmailIt UI. Adding someone to this audience kicks off the drip automatically.

Audience IDs are stored in [`docs/emailit-assets-2026-04-29.json`](../docs/emailit-assets-2026-04-29.json).

## Templates

29 templates live in EmailIt with the `bl-` prefix. Three groups:

- **Drip** (`bl-features-day-XX`) — 14 educational emails, one per day for 14 days, sent automatically by EmailIt when user is in `First 14 Days` audience
- **Trial nudges** (`bl-trial-XXX`) — conditional emails sent transactionally from Softr workflows when specific conditions are met (no account, no review, trial ending)
- **Transactional** (`bl-tx-XXX`) — one-off triggered emails (payment success, payment failed, team invite)
- **Win-back** (`bl-winback-XXX`) — re-engagement emails sent at day 30/60/90 if no account ever created

Full list with template IDs in [`docs/emailit-assets-2026-04-29.json`](../docs/emailit-assets-2026-04-29.json).

## Variable syntax

EmailIt uses Mustache: `{{first_name}}`, `{{account_setup_url}}`, etc.

## How to add a new email to the system

1. **Create the template in EmailIt UI** with a `bl-` prefixed alias
2. **Design the content** in EmailIt's editor (Mustache variables for dynamic data)
3. **Add the API ID + alias** to `docs/emailit-assets-2026-04-29.json`
4. **If transactional:** add a step in the relevant Softr workflow that calls `POST /v2/emails` with `template: "bl-your-alias"`
5. **If drip:** add to the EmailIt automation that watches `First 14 Days` audience
6. **Test send** to your own internal account before going live

## How to send an email manually for testing

```bash
curl -X POST https://api.emailit.com/v2/emails \
  -H "Authorization: Bearer $EMAILIT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "Brieflee <bev@brieflee.co>",
    "to": "you@example.com",
    "template": "bl-features-day-01-welcome",
    "variables": { "first_name": "Test" }
  }'
```

## Common issues

- **409 Conflict on add subscriber** — duplicate email; that's fine, treat as already-added
- **Email not sending** — check domain auth in EmailIt dashboard, check sending limits (5,000/day)
- **User getting drip emails after they paid** — the `BL | New Stripe Sub` workflow forgot to remove from `First 14 Days` audience. Fix the workflow.
- **Drip not starting** — check user was actually added to `First 14 Days` audience (look in EmailIt subscribers list)

## Cross-product reference

EmailIt is shared between Brieflee and Creator Scans. Template aliases use `bl-` for Brieflee, `cs-` for Creator Scans. Audiences are separate per product.
