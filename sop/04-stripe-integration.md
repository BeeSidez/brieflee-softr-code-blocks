# Stripe integration SOP

How payments and subscriptions flow through Brieflee.

## High-level

Stripe is the source of truth for billing state. The Softr `subscriptions` table is a cached mirror, kept in sync via webhooks.

```
User clicks Upgrade → Stripe Checkout → user pays
                           ↓
              Stripe success_url → optimistic write to Softr (instant)
                           ↓
              Stripe webhook → authoritative upsert to Softr (eventual)
```

The webhook is the safety net. The success-redirect is the instant path. Both write the same `subscriptions` row.

## Webhooks we handle

| Stripe event | Softr workflow | What it does |
|---|---|---|
| `customer.subscription.created` (or `invoice.paid` first invoice) | `BL | New Stripe Sub` | Create/update subscription row, status=active, remove from drip audience, add to active subscribers |
| `customer.subscription.deleted` | `BL | Sub Cancelled` | Status=canceled, move from active to lapsed audience |
| `invoice.payment_failed` | `BL | Payment failed` | Status=past_due, send dunning email |

See FigJam diagrams linked in [`01-workflow-architecture.md`](01-workflow-architecture.md).

## Pricing table

The `pricing` table holds the Stripe products + prices. Each row maps to a `stripe_price_id`. When a Stripe subscription is created, the webhook handler looks up the matching pricing row by `stripe_price_id` to get `max_videos`, `max_storage_gb`, etc.

Tiers:
- Creator Monthly ($59) / Yearly ($49)
- Crew Monthly ($99) / Yearly ($89)
- Studio Monthly ($249) / Yearly ($199)
- Plus one-off "Extra videos" packs per tier

## The trial subscription

When a user creates an account (via `BL | New Workspace + Team`), Softr creates a subscription row with:
- `status = trialing`
- `plan = Studio Monthly` pricing row (gives them full Studio quota during trial)
- `current_period_end = today + 14 days`
- No `stripe_subscription_id` (no Stripe involvement yet)

If they convert during trial, the Stripe Sub workflow REPLACES this trial subscription with the real Stripe one. If they don't convert, day 14 sets `status = expired` and access locks.

## Stripe coupon

One coupon: `TRIAL20` (20% off first month, valid 30 days). Used in `bl-trial-reminder-2-48h` and `bl-trial-reminder-3-24h`. Final-day email may bundle additional value (strategy session, priority support) without changing the discount.

## How to test the full flow

See [`06-test-accounts.md`](06-test-accounts.md). Use Stripe test mode + test card `4242 4242 4242 4242`.

## Common issues

- **Webhook not firing:** check Stripe dashboard → Developers → Webhooks → recent events. Each Softr workflow has its own webhook URL (`https://workflows-api.softr.io/v1/workflows/{id}`). Confirm the URL matches what's set in Stripe.
- **Subscription created but not in Softr DB:** webhook hit but the find-user step failed. Often the customer email in Stripe doesn't match a user record in Softr. Check `customer_email` in the Stripe event vs `email` in users table.
- **User stuck on "trial expired" but they paid:** the `BL | New Stripe Sub` workflow didn't run, OR ran but didn't update `account.current_subscription` link. Check workflow run history in Softr.
- **User getting trial reminders after paying:** they weren't removed from the `Onboarding` EmailIt audience. Confirm the Stripe Sub workflow's removal step ran.

## Stripe customer portal

Currently NOT linked. All plan changes (upgrade/downgrade/cancel) flow through Brieflee's in-app upgrade UI. This keeps the success-redirect pattern intact and avoids webhook-only paths for self-serve cancellations.

If linking the portal later, ensure the `BL | Sub Cancelled` workflow handles all the consequences server-side (since portal cancels won't go through your UI).
