# Database schema SOP

Brieflee runs on the `brieflee beta` Softr database (`066e6e54-3814-40e8-a510-825ac70bd20d`).

## Live schema reference

The current schema is documented in two places:
- **Human-readable:** [`docs/schema-snapshot-2026-04-28.md`](../docs/schema-snapshot-2026-04-28.md)
- **Raw JSON for diffing:** [`docs/schema-snapshot-2026-04-28.json`](../docs/schema-snapshot-2026-04-28.json)

Snapshots are timestamped — refresh before any major schema change so we can diff before/after.

## The 14 tables (post-migration)

| Table | Purpose |
|---|---|
| `users` | Who logs in. Owner + Member roles. Fields: email, full_name, role, status, is_internal, affiliate_link, accounts (link), billing (legacy link, being deprecated) |
| `accounts` | The billing entity / workspace. One per brand. Fields: name, owner (link to users), brand_bio, brand_voice, current_subscription (link to subscriptions), thresholds, aiMode |
| `subscriptions` | One row per Stripe subscription. Source of truth for "what plan, what status." Fields: stripe_subscription_id, status, plan (link to pricing), current_period_end |
| `pricing` | Plan catalogue. Studio/Crew/Creator × Monthly/Yearly + one-off products. Fields: stripe_price_id, max_videos, max_storage_gb, max_workspaces |
| `usage` | Per-account quota tracking. Reads from subscriptions → pricing for max values, computes remaining via formulas |
| `members` | Account membership table linking users to accounts |
| `briefs` | Content briefs |
| `submissions` | Review submissions |
| `reviews` | AI review output |
| `review_report` | Aggregated report data |
| `notifications` | In-app notification badges |
| `billing` | Legacy Stripe event log. Kept for invoice history; not on the quota path anymore |
| `PDF` | PDF reference (small) |

## Key relationships

```
users ── owner ─── accounts ── current_subscription ─── subscriptions ─── plan ─── pricing
                       ↓                                                              ↓
                     usage ←──────────── max_videos / max_storage / etc. ────────────┘
                       ↓
                  videos_remaining (formula: max - rollup of submissions)
```

## How to add a new field

1. **Use the Softr API** (not the UI) so changes are scriptable:
   ```bash
   curl -X POST "https://tables-api.softr.io/api/v1/databases/066e6e54-3814-40e8-a510-825ac70bd20d/tables/{table_id}/fields" \
     -H "Softr-Api-Key: $SOFTR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"name": "...", "type": "...", "options": {...}}'
   ```
2. **Snapshot the schema after** to docs/schema-snapshot-{date}.md and .json
3. **Update any code blocks** that need to read/write the new field
4. **Commit the snapshot** so we have a diffable history

## Read-only fields (don't try to set)

LOOKUP, ROLLUP, FORMULA, CREATED_AT, UPDATED_AT, CREATED_BY, UPDATED_BY, AUTONUMBER, RECORD_ID

## API quick reference

Full reference: [Softr Database API skill](https://docs.softr.io/databases-api).

Key fact: `?fieldNames=true` works on GET/PATCH but **NOT on POST**. For POST you must use field IDs.
