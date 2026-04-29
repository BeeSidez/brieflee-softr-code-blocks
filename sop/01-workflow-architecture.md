# Workflow architecture SOP

How Brieflee's Softr workflows work end-to-end. Read this before modifying any workflow.

## High-level

Brieflee runs **5 Softr workflows** that together handle the full user lifecycle:

1. `BL | New Signup` — fires when a user record is created. Owns the "no workspace yet" stage.
2. `BL | New Workspace + Team` — fires when an account is created. Owns the trial timer + product nudges.
3. `BL | New Stripe Sub` — fires on Stripe `customer.subscription.created` webhook. Converts trial → paid.
4. `BL | Sub Cancelled` — fires on Stripe `customer.subscription.deleted` webhook.
5. `BL | Payment failed` — fires on Stripe `invoice.payment_failed` webhook.

## Visual diagrams (FigJam)

Each workflow has its own FigJam board. **Use these when explaining the system to anyone.**

| Diagram | Use it to understand… |
|---|---|
| [Workflow overview](https://www.figma.com/board/vPr2oHapkKksuXg4kUNEMr) | How all 5 workflows connect through the lifecycle |
| [BL \| New Signup detail](https://www.figma.com/board/lKfo7zKngJXuBLSnNcb6r7) | Member branching, drip enrolment, win-back cadence ending in deletion |
| [BL \| New Workspace + Team detail](https://www.figma.com/board/ZL3J6FgybJ0ZMhneDOkkt0) | Brand blueprint generation (native Gemini), team member creation, trial reminders |
| [BL \| New Stripe Sub detail](https://www.figma.com/board/BRDjDkwsfi5EDrMTEBAbvr) | Lean revised webhook handler (single subscription upsert) |
| [BL \| Sub Cancelled detail](https://www.figma.com/board/htWBxgsgha6lLrLeJfhkjg) | Cancellation handling + audience updates |
| [BL \| Payment failed detail](https://www.figma.com/board/QKKlj3ST7drCdUQks2gNGi) | Dunning email + status changes |

## Reference

The full step-by-step spec for each workflow lives in the repo at [`docs/workflows-spec.md`](../docs/workflows-spec.md). The FigJams visualize what's in there.

The catalogue of Softr workflow capabilities (action types, triggers, integrations) is at [`workflows/reference/00-WORKFLOW-CAPABILITIES.md`](../../workflows/reference%20/00-WORKFLOW-CAPABILITIES.md).

## Key principles

1. **One workflow per lifecycle stage, not one mega-workflow.** Splits cleanly by trigger event (signup vs. account vs. Stripe).
2. **Trial timer anchors at account creation, not signup.** A user who signs up but never creates a workspace doesn't waste trial days.
3. **Drip campaign is independent of trial state.** Lives in EmailIt as a Contact-trigger automation watching the `First 14 Days` audience. Whether someone creates an account or not, they get the 14 educational emails.
4. **Stripe webhooks update one source of truth (subscriptions table).** Quota and access rules are derived from there via Softr formulas.
5. **Notifications table + Slack** at every meaningful step. Slack for phone alerts; notifications table for in-app badges.
6. **Auto-delete dormant signups at day 97**, after a 30/60/90 win-back cadence. See [`05-deletion-policy.md`](05-deletion-policy.md).

## Where each workflow lives in Softr

Open Softr → Workflows → look for the `BL | …` prefixed workflows. Each one matches a FigJam above.

## When something changes

If you modify a workflow:
1. Update the FigJam diagram (edit in place — same URL persists)
2. Update the corresponding section of `docs/workflows-spec.md`
3. Note the change in `docs/CHANGELOG.md` (create if not present) with date + summary
