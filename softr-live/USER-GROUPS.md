# Softr user groups, decoded

Pulled live 2026-08-26. Page-level permissions across all 112 pages use only
`ALL_USERS` or `LOGGED_IN_USERS`. **Every custom-group gate lives at block
level**, which `list_pages` does not expose. `get_page` does, so that is the
call to make when auditing access.

| Group | ID | Reads as |
| --- | --- | --- |
| Accounts Created | `85d3f18a` | has at least one workspace |
| Active | `070bca95` | account status active |
| Human Decision | `26642afe` | |
| Inactive | `c6b2cd43` | account status inactive |
| Member Inactive | `cdc50380` | |
| Members Available / Exhausted | `31122756` / `82e4d3d8` | seat headroom |
| Multiple Workspaces | `56350920` | more than one workspace |
| New User | `ce8010ee` | |
| No Account | `daac2ccc` | no workspace yet |
| **No Stripe ID** | `355dad1b` | **has not bought yet** |
| No Submission | `f5498d0d` | |
| Owner / Owner Inactive | `bc824592` / `bd0a57e5` | |
| Paid | `7efcd81c` | |
| Single Workspace | `2d02c2e9` | |
| Storage Available / Exhausted | `0b2b96b5` / `d22dd08c` | |
| **Stripe ID** | `4e47816c` | **has bought** |
| Submission Complete | `c6065f0a` | |
| **Trial Ended** | `86ed344c` | **trial-era, gates no page** |
| Unpaid | `3381799c` | |
| Videos Available / Exhausted | `25805c6d` / `6da309d1` | |
| Workspace Available / Exhausted | `2cc3ff33` / `348ae85b` | |

## Naming to fix, mechanism already correct

Two blocks carry trial-era names over gates that are already
subscription-based, which makes the app look less migrated than it is:

- `/plan` block **`trial-plans`** gates on *No Stripe ID*. Its code is already
  annual-only with the 30-day money-back guarantee; the six `*_trial` Payment
  Link formulas and the monthly/yearly toggle are both gone. Only the
  `.trial-banner` / `.trial-dot` CSS class names remain.
- `/new` block **`no-trial`** also gates on *No Stripe ID*.

Renaming both in Studio costs nothing and stops the next reader assuming
there is trial logic here.

## Real trial residue

- User group **Trial Ended** (`86ed344c`) still exists and gates no page.
  Check block-level use and the Users → Access redirections before deleting.
- `users` table still carries `trial_start`, `trial_end`, a `trialing`
  formula, and six `*_trial` Payment Link formulas
  (`creator_monthly_trial` … `studio_yearly_trial`).
- `trial` is still a live option on `accounts.status` and on
  `billing.payment_status`.
- `BL | New Stripe Sub` still stamps every billing row `trial` with
  `trial_period_days 7`.

## Disabled blocks found live

- `/bulk` → `ai4`
- `/briefs/details` → `ai2`, `item-details1`, `tab-container1`
