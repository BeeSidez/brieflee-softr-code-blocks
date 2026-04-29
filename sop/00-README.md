# Brieflee SOPs

Standard operating procedure docs — how Brieflee actually runs day-to-day. Written so a new hire (or a future buyer) can pick this up cold and understand what's going on.

## Index

| Doc | What it covers |
|---|---|
| [`01-workflow-architecture.md`](01-workflow-architecture.md) | The 5 Softr workflows, how they connect, and which FigJam visualises each one |
| [`02-emailit-system.md`](02-emailit-system.md) | EmailIt setup: audiences, templates, automations, and how to add a new email |
| [`03-database-schema.md`](03-database-schema.md) | Brieflee Beta database tables and key fields, with link to live snapshot |
| [`04-stripe-integration.md`](04-stripe-integration.md) | How payments and subscriptions flow through the system |
| [`05-deletion-policy.md`](05-deletion-policy.md) | Who gets deleted, when, and why — with the cadence schedule |
| [`06-test-accounts.md`](06-test-accounts.md) | How to test without polluting production data |

## Cross-product references

These live at `~/Claude Code/Docs/` because they apply to both Brieflee and Creator Scans:

- `emailit-reference.md` — full EmailIt API + patterns reference
- `email-terminology.md` — standard email/lifecycle terms glossary
- `softr-custom-code.skill` — Softr custom code block reference
- `events-and-selectors.md` — Softr block selectors + events

When a doc here references one of those, it links back to that location.
