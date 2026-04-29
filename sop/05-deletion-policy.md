# User deletion policy SOP

When and how dormant users get deleted. This exists because Brieflee runs on Softr's Professional plan with a hard 5,000 external user cap shared across Brieflee + Creator Scans.

## Who gets auto-deleted

**Only users who signed up but never created a workspace.** Specifically:
- `users` record exists
- No linked `accounts` record (they never went through workspace setup)
- Have been in this state for 97 days

**Users who created a workspace are NEVER auto-deleted**, even if dormant. They have real product data (brand blueprint, briefs, submissions) that we shouldn't destroy. If you genuinely need to clean up dormant accounts, do it manually as a one-off review.

## The cadence

Built into the `BL | New Signup` workflow (see [FigJam diagram](https://www.figma.com/board/lKfo7zKngJXuBLSnNcb6r7)):

| Day | What happens |
|---|---|
| 1 | First nudge: `bl-trial-create-account` ("set up your workspace") |
| 6 | Second nudge: same template, stronger CTA variant |
| 30 | `bl-winback-30d` — "we miss you, 20% off if you set up" |
| 60 | `bl-winback-60d` — different angle (story, new feature) |
| 90 | `bl-winback-90d-final` — "your account closes in 7 days unless you come back" |
| 97 | Move from `Onboarding` → `Lapsed` audience in EmailIt; verify Sheets backup row exists; delete user record from Softr; Slack audit message |

If at any point during 1-97 they create an account, the workflow exits — they're now a real user.

## Why 30/60/90 (not more aggressive)

5,000-user cap math at projected growth:
- ~800 signups/month with active marketing
- ~50% create accounts (optimistic)
- = ~400 dormant signups/month
- Over 90 days = ~1,200 dormant queue at steady state
- Plus active users on both Brieflee + Creator Scans

90 days fits. If growth accelerates and the queue gets too big, drop to 14/30/60 with delete on day 67.

## Safety nets before deletion

Two backups ensure deletion is recoverable:
1. **Google Sheets row** — every signup writes a row to the Subscribers/New Users sheet via `BL | New Signup` step 5. Survives Softr deletion.
2. **EmailIt `Lapsed` audience** — email moves there before deletion, never destroyed. Available for future broadcast campaigns.

If a deleted user comes back, they sign up again as a fresh user and Softr re-creates their record. The Sheets row remains as historical audit trail.

## Manual override

To exempt a specific user from auto-deletion:
- Set `users.is_internal = true` (used for Brieflee staff and test accounts)
- The deletion check skips internal users

## GDPR right-to-be-forgotten requests

For users who explicitly request deletion (regardless of cadence):
1. Delete from Softr DB (users + any linked records)
2. Add email to EmailIt suppression list (so they never receive any further email)
3. Note the request in a manual log (date, email, reason)

Never auto-delete data tied to active users — only signups that never created workspaces fall under the auto-deletion policy.
