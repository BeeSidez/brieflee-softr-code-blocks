# video-analysis (the review engine)

One file, `engine.jsx`, deployed to seven `video-analysis` Vibe Coding blocks. The only line that differs per block is `const PAGE = "..."`.

| Page | PAGE value | Actor | Context |
| --- | --- | --- | --- |
| /review | `review` | logged-in brand user | pick workspace + optional brief |
| /videos | `videos` | logged-in brand user | pick workspace + optional brief |
| /new | `new` | logged-in brand user | pick workspace + optional brief (no block on the page yet; the dashboard chat is the intake) |
| /bulk | `bulk` | logged-in brand user | several videos, two at a time |
| /brief/details/live | `brief-live` | public creator | `?recordId=` is the brief |
| /live/submissions | `live-submissions` | public creator | `?recordId=` is the parent submission (resubmit) |

Block ids (app `5c5521fd`): /review `c8f4b616` on page `874687ee`; /videos `5298806a` on `44b3e1d1`; /bulk `951d6d5b` on `46abe919`; /brief/details/live `4409270b` on `aba41b75`; /live/submissions `ca3c81dc` on `cf79385b`.

## How it runs

The whole review runs in the block. No workflow, no n8n.

1. Gate. Brand user: `users.status` Active and `videos_remaining` > 0. Creator: brief Active and not past its close date, the brand user's status from the `users_status` lookup on briefs (`7GTPj`) or on the parent submission (`Lx9pZ`), credits from the brief's `videos_remaining_count` lookup. Creators only ever see "open" or "not taking submissions"; the brand's plan is never named on a public page.
2. Source the mp4: `useUpload` for files, the Auto Download REST source for links.
3. Cloudinary (unsigned preset, plain `fetch` because FormData cannot cross the proxy).
4. A compressed copy under 2.5 MB through the Cloudinary rungs, inlined as base64. The proxy carries text only and caps bodies near 4 MB, so `INLINE_MAX` is 3 MB; longer videos get a plain "trim it" message.
5. One Gemini call (native source, `gemini-3.6-flash`) with the n8n prompt, thresholds brief first then account, 26 Review Agents.
6. Write at the end: review, then the submission linking the review (the link is two-way), then one `review_report` row per agent, then notifications, then EmailIt by alias with a per-submission idempotency key and retries on 429. A failed run writes no submission, and the submission row is the credit.

## Deploying a change

Edit `engine.jsx` here, run `npx esbuild --loader:.jsx=jsx --jsx=automatic engine.jsx --outfile=/tmp/x.js` for a syntax check, then push the file to each block with `update_vibe_coding_block_code`, swapping only the `PAGE` line. Publishing the app is Bev's call.

## Style

App form family: `#FAFBFF` card, Inter, labels `#334283` at 12/500, fields on a 5% black fill with no border, buttons 32 px Inter 13/600 radius 8, periwinkle once (the primary button), everything else neutral. No dashed borders, no tinted panels.

## Remix is a different feature
`/remix` is the swipe-file generator: paste a video you like, it analyses it and writes a version for your brand. It is served by the Script/Storyboard/Remix workflow in n8n and gets its own build. The review engine never goes on that block; the block was rolled back to its empty version 1 on 3 September 2026.

## /new (the dashboard) runs the engine too
Block `0b346bec` on page `a2a6a47f`, PAGE `new`, deployed 3 September 2026 over the old dashboard chat (its code stays in version history as versions 1 to N-2). That block has its OWN datasource connection ids, so `datasource.define` there reads: submissions `8f2aa89b-b08e-46c2-acbb-eb325cc99bfb`, reviews `9d326bdc-e5c1-4b98-b250-90552c4d903f`, report `5cfa9868-7213-4db6-aca1-a68edf5a2477`, emailit `b9510e33-51ce-4bf6-aaf1-25a975a24cae`, google `69e7708a-6d34-44df-bdd3-93f211f40694`, rapid `d8b15bba-7a47-40be-bc4b-96891d745600`; accounts, briefs, users and notifications are the plain aliases. When re-pushing engine.jsx to /new, swap PAGE and these six ids (the other five blocks share the ids in engine.jsx).

## New video form on /review (3 September 2026, v3.3.1)
`STEPPER = PAGE === "review"` renders the **New video** form, one question per step, on the engine's own components. Step 1: What do you want to do? Review / Analyse / Remix.
- **Review**: Workspace (only when the user has more than one) → Upload the video (file only) with an "Add the creator's details" checkbox that reveals name and email (empty name falls back to the logged-in user) → Context: Brieflee brief / Add notes / Attach a brief / Skip → the chosen detail (brief dropdown, notes box, or PDF stored on `brief_attachment`) → "What would you like AI to check?" only when the workspace has no saved Review Agents → Review. Emails as before. `submission_type` Brief or Content Review.
- **Analyse**: Workspace → Paste a link or Upload a file → Notes → Analyse. Swipe-file prompt without the script (`buildSwipePrompt`, withScript false). `submission_type` Analyse (`93cc2c4e`, added 3 September). No emails.
- **Remix**: same steps → Remix. Swipe-file prompt with the adapted script, written to `reviews.adapted_script` (`Z95A7`). `submission_type` Example/Swipe File. No emails.
The done card reads Breakdown ready / Remix ready for the two new branches. Native form logic was read from the Studio page config (`studio-api .../pages/<id>`, block `elements.form.steps`). Bev's plan: build here first, then duplicate to /videos (+ Video), /new and the other doors.

## Upgrade card and credit ring (3 September 2026, v3.4.1)
- When the gate says no credits or inactive on a user page, the New video card shows the native hero's content verbatim: the eyes image (`UPGRADE_IMG`, the Softr asset), "Upgrade your account", "Update your payment method to activate your account and access your videos and features.", and an Update payment method button to `/billing`.
- A credit ring sits in the card's bottom-right corner (remaining / `subscription_max_videos`, accounts `cNlUS`). Clicking it opens a panel: videos this cycle with a bar, plan (`YluGd`), review mode, reset date (`eaa3X` when the formula returns one), and a See your plan link.
- Preview switch: `?demo=nocredits` or `?demo=inactive` on a user page forces the gate so the card can be seen. Harmless in production: it only shows the card and blocks the run.
