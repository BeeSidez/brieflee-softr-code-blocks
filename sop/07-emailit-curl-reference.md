# EmailIt cURL reference

Ready-to-import cURLs for every EmailIt action across the 5 Softr workflows. Use **Import cURL** in Softr's Call API editor.

## Setup applies to every cURL below

After importing, in the Softr Call API editor:
1. **Set Authentication** dropdown to your saved `Emailit` credential (don't put Bearer token in the cURL)
2. **Replace `{{...}}` placeholders** with real field references using the `@` button

---

## Send template email

Same shape for all template sends. Swap `template` alias and `variables`.

```bash
curl -X POST https://api.emailit.com/v2/emails \
  -H "Content-Type: application/json" \
  -d '{
    "from": "Brieflee <bev@brieflee.co>",
    "to": "{{record.fields.email}}",
    "template": "TEMPLATE-ALIAS",
    "variables": {
      "first_name": "{{Name.first_name}}"
    }
  }'
```

### Template aliases by workflow step

| Workflow | Template alias | Suggested variables |
|---|---|---|
| New Signup — member branch | `bl-tx-team-invite` | `first_name`, `owner_name`, `accept_url` |
| New Signup — owner step 9 | `bl-features-day-01-welcome` | `first_name` |
| New Signup — owner step 13 (day 1) | `bl-trial-create-account` | `first_name`, `account_setup_url` |
| New Signup — owner step 16 (day 6) | `bl-trial-create-account-day6` | `first_name`, `account_setup_url` |
| New Signup — owner step 19 | `bl-winback-30d` | `first_name`, `return_url`, `promo_code` |
| New Signup — owner step 22 | `bl-winback-60d` | `first_name`, `return_url` |
| New Signup — owner step 25 | `bl-winback-90d-final` | `first_name`, `return_url`, `closure_date` |
| Workspace+Team — trial 1 | `bl-trial-pick-review-mode` | `first_name`, `app_url` |
| Workspace+Team — trial 2 | `bl-trial-set-quality-settings` | `first_name`, `app_url` |
| Workspace+Team — trial 3 | `bl-trial-first-review` | `first_name`, `app_url` |
| Workspace+Team — trial 4 | `bl-trial-reminder-1` | `first_name`, `days_left` |
| Workspace+Team — trial 5 | `bl-trial-reminder-2-48h` | `first_name`, `upgrade_url`, `promo_code: TRIALUPGRADE` (20% off first month) |
| Workspace+Team — trial 6 | `bl-trial-reminder-3-24h` | `first_name`, `upgrade_url`, `promo_code: LASTCHANCE` (20% off) |
| Workspace+Team — trial 7 | `bl-trial-ends-today` | `first_name`, `upgrade_url`, `promo_code: FINALDAY` (30% off first 3 months + strategy session + priority support, valid 12 hours) |
| New Stripe Sub | `bl-tx-payment-success` | `first_name`, `plan_name`, `dashboard_url` |
| Payment Failed | `bl-tx-payment-failed` | `first_name`, `update_payment_url` |

---

## Add subscriber to audience

⚠️ All three return **409 Conflict if email already exists**. Set the Softr Call API step to continue on error — 409 is success.

### Add to BL | Onboarding
```bash
curl -X POST https://api.emailit.com/v2/audiences/aud_4D1p0CkELqJe0jjrJ4aOuVywgP6/subscribers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "{{record.fields.email}}",
    "first_name": "{{Name.first_name}}",
    "last_name": "{{Name.last_name}}",
    "custom_fields": {
      "softr_user_id": "{{record.id}}"
    }
  }'
```

### Add to BL | Subscribers
```bash
curl -X POST https://api.emailit.com/v2/audiences/aud_4D1p0CkELqJULokJegC0AoQhoCM/subscribers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "{{record.fields.email}}",
    "first_name": "{{Name.first_name}}",
    "custom_fields": {
      "softr_user_id": "{{record.id}}",
      "plan_tier": "{{plan.tier}}"
    }
  }'
```

### Add to BL | Lapsed
```bash
curl -X POST https://api.emailit.com/v2/audiences/aud_4D1p0CkELqJm3pkW5ZDdARUZYvy/subscribers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "{{record.fields.email}}",
    "first_name": "{{Name.first_name}}",
    "custom_fields": {
      "softr_user_id": "{{record.id}}",
      "lapse_reason": "trial_expired"
    }
  }'
```

### Add to BL | Team Members
Used in New Signup workflow when `user.role = Member` (replaces the inline `bl-tx-team-invite` send if you want member emails to come from EmailIt automation instead).
```bash
curl -X POST https://api.emailit.com/v2/audiences/aud_4D2CLqQohy7lOMT8wESKL5uSGEa/subscribers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "{{record.fields.email}}",
    "first_name": "{{Name.first_name}}",
    "custom_fields": {
      "softr_user_id": "{{record.id}}",
      "owner_name": "{{record.fields.owner_name}}"
    }
  }'
```

---

## Remove subscriber from audience

Requires `subscriber_id`, not email. Recommended: store the ID on the user record when adding (add `emailit_subscriber_id` field to users table).

### Remove from BL | Onboarding
```bash
curl -X DELETE "https://api.emailit.com/v2/audiences/aud_4D1p0CkELqJe0jjrJ4aOuVywgP6/subscribers/{{record.fields.emailit_subscriber_id}}"
```

### Remove from BL | Subscribers
```bash
curl -X DELETE "https://api.emailit.com/v2/audiences/aud_4D1p0CkELqJULokJegC0AoQhoCM/subscribers/{{record.fields.emailit_subscriber_id}}"
```

### If you don't store subscriber_id (two-call workaround)

```bash
# 1. Find subscriber by email
curl "https://api.emailit.com/v2/audiences/aud_xxx/subscribers/list?email={{record.fields.email}}"

# 2. Delete by id from response
curl -X DELETE "https://api.emailit.com/v2/audiences/aud_xxx/subscribers/{{step1.data[0].id}}"
```

---

## Audience IDs reference

| Audience | ID |
|---|---|
| `BL | Onboarding` | `aud_4D1p0CkELqJe0jjrJ4aOuVywgP6` |
| `BL | Subscribers` | `aud_4D1p0CkELqJULokJegC0AoQhoCM` |
| `BL | Lapsed` | `aud_4D1p0CkELqJm3pkW5ZDdARUZYvy` |
| `BL | Team Members` | `aud_4D2CLqQohy7lOMT8wESKL5uSGEa` |

Full list of template IDs (if you ever need to reference by ID instead of alias) is in [`docs/emailit-assets-2026-04-29.json`](../docs/emailit-assets-2026-04-29.json).
