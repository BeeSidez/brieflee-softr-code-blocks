# Test accounts SOP

How to test Brieflee without polluting production data.

## Rule 1: never put fake data in subscriptions/billing

The `subscriptions` and `billing` tables reflect real Stripe state. If you add a fake "active" subscription for testing, MRR calculations, customer counts, "who's paying" lookups all get garbage data. **Don't do it.**

## Rule 2: use `is_internal` flag for bypass

Every Brieflee staff or test user has `users.is_internal = true`. The paywall and quota gates in code blocks check this flag first:

```js
const allowed = user.is_internal === true
  || (subscription_status === 'active' || subscription_status === 'trialing')
     && videos_remaining > 0;
```

So internal users get full access regardless of subscription state. Subscriptions table stays accurate.

## How to flag a user as internal

Via Softr API:
```bash
curl -X PATCH "https://tables-api.softr.io/api/v1/databases/066e6e54-3814-40e8-a510-825ac70bd20d/tables/brpbVf8sL2xqxV/records/{user_id}" \
  -H "Softr-Api-Key: $SOFTR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"fields": {"gdFt4": true}}'
```

Or via the Softr UI: navigate to brieflee beta DB → users table → toggle `is_internal` checkbox.

## Test account workflow

For day-to-day "I'm checking how the UI looks":
1. Use your own Brieflee account (already flagged `is_internal`)
2. You bypass paywall, see all features

For testing a fresh signup flow end-to-end:
1. Sign up with a test email (e.g. `bev+test1@brieflee.co`)
2. Flag the new user as `is_internal = true` immediately
3. Walk through the flow
4. Don't pay — use `is_internal` to bypass

## End-to-end Stripe testing

When you specifically need to test the Stripe checkout/cancel flow:
1. Use Stripe **test mode** (toggle in Stripe dashboard)
2. Use test card numbers (e.g. `4242 4242 4242 4242`)
3. Real subscription data flows through your DB but no real money moves
4. Flag test users as `is_internal = true` so they don't get counted in metrics

## What internal users still receive

- ✅ All emails (drip, transactional, nudges) — Bev wants to dogfood the email experience
- ✅ Slack notifications appear for them too
- ❌ Paywall blocks (bypassed)
- ❌ Quota limits (bypassed)
- ❌ Trial-end gate (bypassed)

If you want a test user to NOT receive emails, manually remove them from the EmailIt audiences after signup.

## Auditing internal users

Every quarter, review the list of users with `is_internal = true`:
```bash
curl "https://tables-api.softr.io/api/v1/databases/066e6e54-3814-40e8-a510-825ac70bd20d/tables/brpbVf8sL2xqxV/records?fieldNames=true&limit=200" \
  -H "Softr-Api-Key: $SOFTR_API_KEY" | jq '.data[] | select(.fields.is_internal == true) | {id, email: .fields.email, name: .fields.full_name}'
```

Remove flag from anyone who shouldn't be on the list anymore (former employees, contractors, old test accounts).
