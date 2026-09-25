# Videos index (/videos)

Block `9abc10bb-69a9-4755-9046-92a08614c557` on page `44b3e1d1` (created 3 September 2026 after the earlier video-analysis block on this page was deleted). Datasources connected by alias: submissions, reviews, users, accounts, briefs. v2 and v3 pushed 3 September; v4 (decisions, delete, list columns) pushed 14 September 2026, version `6ca01378`. Source: `index.jsx` in this folder.

Rebuilds the native tab container + grid (its four tabs were Grid, List, Export, Archive) in the Discover grid's style:
- Heading with "N waiting on you", **Export CSV** (what is on screen, filters applied, Excel-friendly) and one **New video** button (opens `/review` as the right-hand side panel via `SoftrPageRenderer.setOpenPageModal`).
- Count chips All / Waiting on you / Approved / Flagged / Rejected / Pending / Archived; clicking one filters. **Waiting on you** = the AI has reviewed, the review ran in Hybrid or Manual mode, and `reviews.human_decision` is still Pending. Remix and Analyse videos never count. Read through two lookups on submissions: `B34Uf` human_decision (reviews) and `laVjU` ai_mode (reviews). Reviews with no mode (rows older than the engine) are left out.
- Search, Status / Type / Brief / Creator pills, sort (Waiting first by default, then Newest, Oldest, Name), Workspace only with more than one, Grid or List switch.
- Grid: cards with the review thumbnail or the uploaded file, type badge, solid AI decision chip, a navy "Waiting on you · 3h" chip while the call is the brand's or the decision chip once made, name, creator · brief · date · Rev N.
- List: Video, AI decision, Your decision ("Not needed" on Autonomous, Remix and Analyse rows), Mode, Revision (First cut or Rev N), Brief, Submitted. Rows waiting on you are tinted.
- Every card and row carries a three-dot menu (the briefs index pattern): Approve, Request changes, Reject (only when the call is the brand's), Archive or Restore, Delete.
  - Approve and Reject confirm in a small modal. Request changes opens a note prefilled with what the AI would fix (`gewdX`); the creator reads it on their result page.
  - A decision writes `reviews.human_decision` (`ULvsM`) plus `request_message` (`JF1tu`), `human_decided_at` (`mSvJ8`) and `human_decided_by` (`HpXw5`) on the review linked through `kdfMm`. The toast offers Undo for 8 seconds, which writes Pending back.
  - Delete is a soft delete: `submissions.deleted` (`5BWby`) = true hides the video from every view including Archived. The credit stays used because the submission row is the credit.
- Card or row click → `/submissions/details` in an XL modal.
- Scoped to the user's workspaces (`?workspace=` wins), deleted rows never show, pages pulled until the user's own videos fill the first screen.

The native tab container, grid and tables are still on the page for Bev to remove. The same card, menu and modals power the Recent submissions block on `/new` (`app/home/recent-submissions.jsx`).
