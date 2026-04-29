# Feature: Team members in onboarding

Tracks the team-members invitation flow from onboarding form through to email drip. Move this doc out of `in-progress/` once everything is checked.

## What this feature does

Account owners can invite up to **9 team members** during onboarding (Studio plan = 10 seats; owner counts as one). Their emails are captured in a single `team_emails` field on the account. The `BL | New Workspace + Team` workflow parses the field and creates a user record per email with `role=Member, status=Pending`. Each new member user record then triggers `BL | New Signup` which sends them an invite email (and adds them to the `BL | Team Members` audience for any further drip).

## Status

| Layer | Item | Status | Notes |
|---|---|---|---|
| Schema | `accounts.team_emails` LONG_TEXT field | ✅ Done | Field ID `wIvhQ`. Replaces team_email1/2/3. |
| Schema | Deprecate `accounts.team_email1/2/3` | ⏳ Pending | Leave for now — old form still uses them. Delete in cleanup once form is migrated. |
| EmailIt | `BL | Team Members` audience | ✅ Done | ID `aud_4D2CLqQohy7lOMT8wESKL5uSGEa`. |
| EmailIt | `bl-tx-team-invite` template | ✅ Done | Template shell created. **Content design pending.** |
| EmailIt | Member-specific drip automation | ❌ Not started | Decide cadence: probably just 1-2 emails (welcome + maybe a follow-up). Set up Contact-trigger automation in EmailIt UI on `BL | Team Members`. |
| Softr workflow | `BL | New Workspace + Team` — parse team_emails (custom code) | ❌ Not started | JS in [`docs/workflows-spec.md`](../../docs/workflows-spec.md). FigJam: https://www.figma.com/board/NnuKx0A5XJoy41FRLM5MEM |
| Softr workflow | `BL | New Workspace + Team` — Bulk actions Loop | ❌ Not started | Body: Add user record per email. |
| Softr workflow | `BL | New Signup` — member branch sends invite | ✅ Done | bl-tx-team-invite via transactional send. |
| Softr workflow | `BL | New Signup` — member branch adds to `BL | Team Members` audience | ❌ Not started | Adds to audience after invite send. Cleanest spot: just before END on the member path. |
| UI / vibe-code | Onboarding form: textarea OR 9 individual inputs that join into team_emails | ❌ Not started | UX: 9 individual boxes for nicer feel; on submit, join values with `\n` and write to team_emails. Or single textarea with helper text "one email per line, up to 9". Either works. |
| Email content | Design `bl-tx-team-invite` HTML | ❌ Not started | Bev designing content in separate chat. |
| Email content | Design member welcome / drip content (if doing drip) | ❌ Not started | Decide if there's actually a drip or just the invite. |
| FigJam | `BL | New Workspace + Team` updated to v2 (parse + loop) | ✅ Done | https://www.figma.com/board/NnuKx0A5XJoy41FRLM5MEM (old v1: https://www.figma.com/board/ZL3J6FgybJ0ZMhneDOkkt0 — superseded) |
| FigJam | `BL | New Signup` member branch — add audience step | ❌ Not started | Update when adding the audience step. |
| Spec | `docs/workflows-spec.md` reflects parse + loop | ✅ Done | |

## Decisions still to make

1. **Drip for team members?** Or just the one invite email and that's it for v1? My recommendation: just the invite for v1. If you want to nurture members later, you have the audience already.
2. **Form UX in onboarding** — single textarea (faster) vs 9 styled inputs (nicer). Pick when you vibe-code.
3. **What happens if all 9 emails were already users?** Loop would create 0 new records. That's fine — workflow just continues. Worth confirming the loop step doesn't error on empty array though.

## Related references

- [Workflow spec](../../docs/workflows-spec.md) — section "Workflow 2: BL | New Workspace + Team"
- [cURL reference](../07-emailit-curl-reference.md) — `BL | Team Members` add subscriber
- [Schema snapshot](../../docs/schema-snapshot-2026-04-28.md) — `accounts` table
