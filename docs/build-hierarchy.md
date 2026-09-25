# Build hierarchy: where logic goes

**Created:** 2026-08-23
**Updated:** 2026-08-23

**Canonical copy:** `Docs/build-hierarchy.md`. Identical copies live in `Brieflee/brieflee-softr-code-blocks/docs/` and `Creator Scans/Softr Vibe Code Blocks/docs/`. Change the canonical one and copy it across in the same session.

**Applies to:** Brieflee and Creator Scans. This is a standing architecture decision, not a preference to be re-argued each time.

---

## The hierarchy

**1. Vibe code block.** The default. Everything goes here unless one of the exceptions below applies.

**2. Softr workflow.** Only when the work has to happen with nobody on the page.

**3. n8n.** Only when neither of the above can do it. The direction of travel is off n8n entirely.

---

## Why

- **Cost.** n8n is a bill. A block is not.
- **Reliability.** Workflows fail quietly and auto-disable. Two Brieflee workflows are sitting auto-disabled right now, and one of them is the payment-failed email. A block either compiles or it does not, and when it breaks it breaks in front of someone who can see it.
- **Maintenance.** One file, read and edited through the MCP, with version history. A workflow is a graph you have to click through, and n8n is a third system with its own auth, its own uptime and its own drift.
- **Control.** A block runs on Softr's infrastructure that is already paid for. Every extra system is one more thing that can go down without warning.
- **Legibility.** Logic in code can be read, diffed and reviewed. Logic spread across a workflow graph cannot.

---

## The migration rule

**Every time a block is touched for any reason, look at what else could move into it.**

Not as a separate project, at the moment the code is already open. Ask:

- Is this block writing records through a workflow that it could write directly?
- Is an external API being called from n8n or a workflow that could be a REST API source on this block?
- Is EmailIt still being sent from a workflow here? Move it.
- Is Gemini, Vertex or OpenRouter being called outside the block? Move it.
- Is there a wait or a branch in a workflow that is really just an `if` in the code?

If it can move, move it in the same change and say so. If it cannot, say which exception applies.

---

## Instructions to Claude

**Do not argue for a workflow or n8n on effort grounds.** "That would take longer in code" is not a reason. Bev has decided the trade: more time now, less cost and less breakage later.

**Do not propose n8n at all** unless one of the exceptions below genuinely applies, and say which one.

**Default answer to "where should this live" is: in the block.** Reach for something else only when you can name the reason.

---

## The real exceptions

These are the only cases where a block cannot do the job. Everything else goes in the block.

| Case | Why a block cannot | What to use |
|---|---|---|
| **Nobody is on the page** | A block only runs while the page is open | Softr workflow |
| **A third party calls us** | Stripe events, TidyCal bookings, inbound webhooks | Softr workflow with a webhook trigger |
| **Scheduled or recurring work** | A block has no clock | Softr workflow, or a scheduled job |
| **Work that outlives the visit** | The Softr proxy returns 504 at roughly 120 seconds, so long AI generation cannot complete inside one page visit | Workflow, or split the work and poll |
| **Bulk work across many records** | One person's page is the wrong place to run a batch | Workflow with a loop |

Note what is **not** on this list. Calling an external API is not an exception: a block reaches EmailIt, OpenRouter, Gemini or anything else through a **REST API data source** configured in Studio, called with `useProxyFetch`. Softr proxies it server-side and attaches the auth header itself, so no key is ever in the file. That is the supported mechanism and it should be used.

---

## Current candidates

Live examples of logic sitting outside a block that has no reason to be there:

- **EmailIt sends from Softr workflows.** `bl-tx-team-invite` and `bl-tx-payment-failed` go out through workflow API calls. The payment one is Stripe-triggered so it stays a workflow, the team invite is a record-created event with a user present and could move.
- **Creator Scans linking and rev-share emails.** Sent through Softr's native email action, with duplicate EmailIt templates sitting unused alongside. One path, in the block, with the EmailIt template.
- **Anything still in n8n.** Inventory it, then move each item to a block or, failing that, a Softr workflow.

---

## Related

`Docs/softr-vibe-code-block.md` for how to build and edit a block, including the MCP loop and what the block can reach.
`Docs/email-rules.md` for which emails are direct sends, which is what makes most of them movable into a block in the first place.
