# Home (/new)

The app home, page `a2a6a47f-5993-4d2d-aa72-b1d38efe2b6b`. Blocks on the page: navigation, the workspace switcher (vibe), the review engine "dashboard-chat" (`0b346bec`, documented in `app/video-analysis/README.md`), quick links, the no-account custom code, and from 14 September 2026 **Recent submissions** (`4d5d5c96-7e5c-4c9e-a93c-30f37d239a2c`, source `recent-submissions.jsx` in this folder, version `5fc90dc9`).

## Recent submissions
- Header "Recent submissions" with "N waiting on you · M in today" and a See all videos link to /videos.
- Up to 8 cards, 4 to a row: videos waiting on the brand's decision first (the AI has reviewed, the review ran in Hybrid or Manual mode, `reviews.human_decision` still Pending), then everything that arrived today. With nothing waiting and nothing new today it shows the four latest videos under "Nothing waiting on you and nothing new today. Your latest videos:".
- The same card as the videos index (thumbnail, type badge, AI decision chip, Waiting on you chip with the age, name, creator · brief · date · Rev N) and the same three-dot menu: Approve, Request changes, Reject (only when the call is the brand's), Archive, Delete, with the same confirm modals, the 8-second Undo toast and the soft delete (`submissions.deleted` = true, the credit stays used).
- A decision writes `reviews.human_decision` (`ULvsM`), `request_message` (`JF1tu`), `human_decided_at` (`mSvJ8`) and `human_decided_by` (`HpXw5`) on the review linked through `kdfMm`.
- Empty state (no videos in the workspace) points at /briefs, where each brief carries the share link creators submit through.
- Scoped to the user's workspaces through `users.accounts` (`Nz6VX`), or to `?workspace=<accountId>` when the URL carries one (the switch the videos index honours); archived and deleted rows never show. Pages are pulled (up to 4) until 8 of the user's videos are in hand.
- Datasources by alias: submissions (`YdF2bMFS5LkUR1`), reviews (`jRIJ8k8SOkaicy`), users (`brpbVf8sL2xqxV`), connected 14 September 2026.
- The block sits last on the page, under the quick links. Verified on the preview with `?workspace=yOSHssx9sTTi5z` (Gymshark: 3 waiting on you, menu with all five actions). Not live until Bev publishes the app.

Older files in this folder (`dashboard-chat*`, `home-quick-links*`, `new-user-checklist*`, `no-trial*`, `no-workspace*`) are earlier home blocks kept for reference.
