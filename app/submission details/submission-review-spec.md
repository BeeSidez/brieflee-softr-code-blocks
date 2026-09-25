# Submission Review — build spec (locked 2026-07-12)

Turn `UI updtaes/submission details page /submission details/Submission Review 01.dc.html`
into ONE production Vibe block: `app/submission details/submission-review` (NEW — the
current native page stays untouched until Bev swaps). Same treatment as the Brief
Builder. Design script + template fully read; all mappings below are ground truth
pulled over the Tables API on 2026-07-12.

## Page + sources

- Page record = the SUBMISSION (`useCurrentRecordId`, Record ID in page URL).
- Six sources in the block's Source tab, `datasource.define` + `from` on every hook
  (ids get baked once Bev connects; ship with REPLACE_* only if unavoidable — prefer
  asking her to connect first, then bake, per the v3.2 placeholder lesson).
  - submissions `YdF2bMFS5LkUR1`, reviews `jRIJ8k8SOkaicy`,
    review_report `PyLcZSiB1d9sAH`, members `J8TKhfRL2rxNvA`,
    comments `LsQPXT4jdNJpYn`, openrouter (existing REST datasource, same as
    brief-builder: 2a90dc15-b508-4fcf-b332-6e3adcf4e06f).
- HARD LESSONS (already burned once): `useRecords` returns `{pages:[{offset,total,items}]}`
  → flatten with recordsOf(); ALWAYS pass `count: 100`; link-match by id OR label
  (brief/submission names are primary fields); `useRecord` param is `recordId`;
  include each table's primary field in q.select.

## Field map (verified ids)

**submissions** (the page record): name XebTQ, creator_name 9ZryL, creator_email INZs6,
sub type b82bF (opts include "Brief" 0a16c65f, "Content Review" 5ed52a56…, "Example/Swipe File" 4d21296f),
status 4flIO, video_file PP7rO (ATTACHMENT), video_url XrARi, duration si3xT,
resolution 1N0Zw, briefs fqtit, name(briefs) Au4N7, created_at ywb3H, version eiUDC,
thumbnail(reviews) HKHil, platform_logo_url Q0JaD.

**reviews** (find via reviews rows whose submissions nB4G1 contains the page record;
take the latest = first by created?? reviews has no created shown — sort by id order
returned; if multiple, prefer the one linked via submissions.kdfMm reviews link):
overall_rating uRkEe (RATING 1-5), transcript 5kQxm, adapted_script Z95A7 (read RAW —
clean_adapted_script k99NF formula is broken, strips "n"), overall_status 4ljXK
(PASS 899c4c93 / FAIL 41119df9 / FLAGGED 34526a42 / APPROVED 4cfaebf5 / REVIEW dddaca4d / REJECTED 75dd6d0f),
overall_comment Zqqx4, decision_reasoning yp7ca, recommended_action j6SpS,
human_decision ULvsM (Approve e5f429c2-c986-4204-aa59-41c45f3c2de9 / Reject 01bc0d1b-908a-4f00-b851-a47dda8647ea /
Changes Requested 75d07c29 / Pending 4bf114f6), ai_decision pxln3 (APPROVED 17004b4d /
FLAGGED c168c3d6 / REJECTED e173acf9 / REVIEW 269347ff), thumbnail 4rkuC,
display_url kIbht, embed_code E1mnP, request_message JF1tu, revisions_required iZfgG (CHECKBOX),
submissions link nB4G1.

**review_report** (rows whose review Iu9MX contains the review id, or submissions
nB4G1 contains the page record — filter client-side both ways): threshold E004U
(criteria name), score iy2K3, threshold_value Q5UCr, rating uRkEe (RATING),
severity oO0ev (Major/Critical/Minor/Info/WARNING), status TxU8J
(PASS c2692420 / FAIL b917f19e / NEEDS ADJUSTMENT / ALIGNED / MISALIGNED / FLAGGED),
comment 3Pr6i, screenshot_url syqU5, key_moment_timestamp BEfco (SELECT whose LABELS
are seconds as strings, e.g. "0","12","33" → parseInt → seek target).

**members** (rows whose submissions WmfhK contains the page record): full_name qtE5x,
email v0MOD, status ZjtKB, invited_at IeYjB, created_at 2hwsV, access_level 8B5e8.

## Layout (from the design, fully read)

Wrapper: transparent bg, max-width 1400px centred (match builder), League Spartan?
NO — design uses Inter; keep League Spartan for brand consistency with the rest of
the app (builder precedent). Two columns, `.bl-sr-layout`:

**Left — player column** (sticky):
- Native `<video>` (id-less, ref-driven) src = video_file[0].url || video_url;
  if neither is a direct file, fall back to embed_code iframe and DISABLE markers/seek.
- Under it the timeline strip: label = per-tab ("Lee's timestamps" on AI review,
  "Transcript", "Remixed script", etc.), duration from video metadata (fallback
  submissions.duration parse), markers = per-tab sets:
  - AI review: report rows with key_moment_timestamp → flag markers, tooltip =
    criteria + comment, active state follows currentTime (timeupdate listener).
  - Transcript / Remix: parsed row timestamps → dot markers, tooltip = time + text.
- Next/Prev flag buttons; click marker/row timestamp → seek + play.
- NO emoji reactions in v1 (no storage — design mock only).

**comments** (NEW table `LsQPXT4jdNJpYn`, created 2026-07-12 — Softr confirmed no
comments API for Vibe blocks, so Bev chose a real table; 5 dummy rows seeded on the
Vital submissions): comment RGOIL (LONG_TEXT, primary), timestamp_seconds lAewT
(NUMBER), author_name d5Xye, author_email ghU7I, submissions sECqv (LINKED →
submissions, reads back as [{id,label}]), created_at GCou0, users nb3K4 (LINKED →
users brpbVf8sL2xqxV, single — the canonical author identity; added 2026-07-12 on
Bev's instinct so every person's comments roll up across submissions). Block READS
rows whose submissions link contains the page record AND WRITES new comments via
useRecordCreate: comment + timestamp_seconds = floor(video.currentTime) +
author_name/author_email snapshot from useCurrentUser (display never needs a
lookup, survives user renames) + users: [{id: user.id}] + submissions:
[{id: submissionId}]. Dummy rows have fictional authors with empty users links,
which exercises the snapshot fallback. No delete in v1
(no useRecordDelete). Sixth source in the Source tab; Create Record action on it.

**Right — panel column** (resizable 320–760px via drag handle, width in
localStorage, collapsible to 46px): tab row then content. EIGHT tabs, the design's
full set:
1. **AI review** (default): score band — big score = round(avg of numeric report
   scores) + "/100", decision chip = human_decision label if not Pending else
   ai_decision label, "N of M checks passed" (status label PASS/ALIGNED counts as
   pass). Grouped checklist by criteria name mapping:
   - Hook & attention: Hook Speed, Visual Hook, Engagement Pacing (Scene Changes)
   - Production quality: Energy and Authenticity, Wardrobe and appearance,
     Audio Clarity, Text Legibility, Lighting (any name containing those words)
   - Compliance & safety: Copyright check, Content Moderation, Brand alignment
   - Anything unmatched → "Other checks".
   Row: criteria, score (score or threshold_value), status pill, one-line comment,
   timestamp chip (from key_moment_timestamp) → seek. Group header shows "N pass".
2. **Report**: list/grid toggle (localStorage), rows = screenshot_url img, time,
   criteria, score, status pill, severity pill, stars (rating), comment; search +
   status/severity dropdowns; client-side CSV export (blob download).
3. **Ask Lee**: chat over proxyFetch(ds.openrouter) exactly like brief-builder's
   aiWrite plumbing (model deepseek/deepseek-v4-pro since 2026-07-30; output
   passes through the same em dash guard as brief-builder). System prompt = review
   context: submission name, creator, decision, score summary, all report rows
   (criteria/score/status/comment), transcript text (stripped), brief name.
   Welcome message computed from real score/pass counts. Chips: "Compare to my
   brief", "Draft revision notes", "Rewrite the CTA". Busy dots, auto-scroll.
4. **Comments**: comments-table rows for this submission, sorted by
   timestamp_seconds; each row = initials avatar, name, time chip (click seeks),
   relative age from created_at, text; active row follows playback. Composer at
   the bottom writes a new comment pinned to the current video second
   (useRecordCreate). Lettered comment markers (A/B/C…) render on the timeline
   strip while this tab is active.
5. **Transcript**: parse reviews.transcript — port the parser idea from the current
   ai2 block: rows split on [Ns] / [N:SS] timestamp markers; each row {sec, text};
   onscreen/visual columns only if the text carries "On-screen:"/"Visual:" style
   sub-markers, else plain text rows. Copy transcript button (clipboard + toast).
   Row click → seek. Active row highlight follows playback (.srrow.active).
6. **Remix**: same parser over adapted_script; Copy script button; empty state
   "No script yet."
7. **Details**: submitter card (initials avatar, creator_name, @handle-ish from
   email prefix, decision chip) + fields: Email (mailto), Submission type, Campaign
   (name(briefs)), Submitted (created_at, en-GB), Video length (duration).
8. **People**: memberRows (initials, name, YOU badge when email == current user
   email, email, status pill, access_level as role) + count + Invite button →
   openSwModal("/review-invite?recordId=" + submissionId, "md").

**The action rail** (left of the video, version 13e6f4e8): Request changes (pencil),
Approve (tick), Reject (cross), Rate, Download, Add people, Comments. The three
decision icons each open a small centred modal in the brief page's Share panel
style (360px white card, radius 14, title + helper "<video> from <creator>"):
- Approve → "Approve this video?" → Cancel / Approve → reviews.human_decision = Approve id
- Request changes → textarea prefilled with the flagged checks (criteria: comment)
  or the saved request_message → "Send to the creator" writes Changes Requested id
  + request_message JF1tu (the creator reads it on their result page)
- Reject → "Reject this video?" → Cancel / Reject → Reject id
- Comments → switches the panel to the Comments tab.
Every decision also writes human_decided_at mSvJ8 (ISO now) and human_decided_by
HpXw5 (the logged-in user's name). The toast offers Undo for 8 seconds (writes
Pending back and clears the stamp). Once decided, the matching rail icon is tinted
(green / amber / red) and its tooltip reads "Approved 12 minutes ago by Bev";
clicking any decision icon again opens its modal, so a decision can be changed.
Add people (rail and the People tab's Invite) opens the same style of modal with
Email, Name (optional), Access (Comment only / View only / Full access) and
Message (optional); Add them creates a members row (status Invited, invited_at
now, linked to the submission, the workspace and the inviting user) and the
People tab refetches. The old /review-details and /review-invite modal pages are
no longer wired.

Writes: reviews.human_decision ULvsM, request_message JF1tu, human_decided_at
mSvJ8, human_decided_by HpXw5, overall_rating uRkEe (Update Record on the reviews
source), comment creates (Create Record on the comments source) and member
creates (Create Record on the members source: full_name qtE5x, email v0MOD,
status ZjtKB, access_level 8B5e8, Invitation_message s4Kev, invited_at IeYjB,
submissions WmfhK, accounts O72qI, users C0WMG). Submissions/report read-only.

## Styling

Brief-builder language: flat white on transparent, navy #001364 + periwinkle
#879CF7/#294FF6, League Spartan, pills for statuses (Pass green rgba(45,170,99,.12)/#2DAA63,
Warn amber, Fail red per design), score band with the circular feel of the mock
(simple ring: conic-gradient), 1400px cap. Responsive: columns stack under 1020px,
player unsticks.

## Open/parked

- Emoji reactions: parked (no storage).
- The broken clean_adapted_script formula (k99NF): fix or delete in cleanup pass.
- After parity: retire ALL native body blocks (comments live in our own table now,
  so nothing native needs to stay); page slug is /submissions/details (the
  builder's cards already link there). No comment deletes in v1 (no
  useRecordDelete) — deletes happen in the Data tab if ever needed.
